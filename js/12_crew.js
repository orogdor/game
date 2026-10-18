// ============================================================
//  MEESKOND: palkamine, vajadused, päevakava, ametid, kahurid
// ============================================================
// ühine laskmine (meeskond, konkurendid, kahurid)
function targetPoint(t) {
  if (t.spheres && t.spheres.length) return { x: t.spheres[0][0], y: t.spheres[0][1], z: t.spheres[0][2] };
  return { x: t.pos.x, y: t.pos.y + 1, z: t.pos.z };
}
function targetAlive(t) { if (!t) return false; if (t.kind === 'turret') return t.obj.hp > 0 && Base.objs.has(t.obj.id); if (t.kind === 'player') return !Player.dead && G.mode !== 'build'; return t.alive; }
function hurtTarget(t, dmg, src) {
  if (t.kind === 'turret') {
    t.obj.hp -= dmg;
    if (t.obj.hp <= 0) { t.obj.hp = 0; FX.explosion(t.obj.cx, 1.5, t.obj.cz, [1, 0.6, 0.3], 1); Audio2.explode(t.obj.cx, t.obj.cz, false); UI.msg('The autocannon is down! Repair it with scrap.', 'danger'); }
    return;
  }
  Ents.damage(t, dmg, src);
}
// NPC relvad: iga tegelane kannab oma relva (välimus + heli), valik meeskonna järgi
const NPC_GUNS = { crew: ['carbine', 'carbine', 'shotgun', 'smg', 'dmr', 'lmg'], krell: ['lmg', 'carbine', 'shotgun', 'carbine', 'lmg'], klann: ['smg', 'dmr', 'carbineTan', 'smg'] };
const NPC_SND = { lmg: 'lmg', shotgun: 'shotgun', smg: 'smg', dmr: 'sniper' };
function npcGun(e) {
  if (!e.gunK) { const L = NPC_GUNS[e.team] || NPC_GUNS.crew; e.gunK = L[Math.abs(Math.floor((e.id || 0) * 2654435761) % 997) % L.length]; }
  return e.gunK;
}
function npcGunMesh(e) { const G = MODELS.npcGuns; return (G && G[npcGun(e)]) || MODELS.rifleNPC; }
function fireAt(e, t, dmg, acc, sound) {
  if (!sound && e.kind === 'human') sound = NPC_SND[npcGun(e)];
  const tp = targetPoint(t);
  const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
  const sx = e.pos.x + fx * 0.6 + Math.cos(e.yaw) * 0.15, sy = e.pos.y + 1.33, sz = e.pos.z + fz * 0.6;
  const d = Math.hypot(tp.x - sx, tp.z - sz);
  let pHit = acc * clamp(1.25 - d / 55, 0.25, 1);
  if (t.kind === 'player') pHit *= clamp(1.1 - Player.speedNow * 0.06, 0.55, 1);
  const hit = Math.random() < pHit;
  let ex = tp.x, ey = tp.y, ez = tp.z;
  if (hit) hurtTarget(t, dmg, e);
  else { ex += rand(-1.6, 1.6); ey += rand(-0.6, 1.2); ez += rand(-1.6, 1.6); if (t.kind === 'player' && Math.random() < 0.3) UI.whiz(); }
  FX.tracer(sx, sy, sz, ex, ey, ez, e.team === 'crew' ? [0.7, 0.95, 1, 0.9] : [1, 0.45, 0.3, 0.9]);
  if (!hit) FX.impact(ex, ey, ez, 'sand');
  e.flash = 0.06;
  Audio2.shoot(sound || 'enemy', sx, sz);
  Ents.noise(e.pos.x, e.pos.z, 35, 'shot');
}
function isThreatTo(t, team) {
  if (!t.alive || t.team === 'neutral') return false;
  if (t.kind === 'bug') return true;
  if (t.kind === 'stalker') return t.state !== 'buried';
  if (t.kind === 'kiskja') return true;
  if (t.kind === 'crab') return t.state === 'angry';
  if (t.kind === 'alien') return t.state === 'hunt';
  if (t.kind === 'ram') return t.state === 'charge';
  if (t.kind === 'boss') return t.state !== 'sleep';
  if (t.kind === 'human' || t.kind === 'player' || t.kind === 'core' || t.kind === 'rturret') {
    const fa = team === 'crew' || team === 'player', fb = t.team === 'crew' || t.team === 'player';
    if (fa && fb) return false;
    return t.team !== team;
  }
  return false;
}
function findThreat(x, y, z, range, team, extra) {
  const cands = [];
  for (const t of Ents.list) {
    if (!isThreatTo(t, team)) continue;
    if (t.kind === 'player' && (Player.dead || G.mode === 'build')) continue;
    const d = Math.hypot(t.pos.x - x, t.pos.z - z);
    if (d < range) cands.push([d, t]);
  }
  if (extra) for (const t of extra) { const d = Math.hypot(t.pos.x - x, t.pos.z - z); if (d < range) cands.push([d, t]); }
  cands.sort((a, b) => a[0] - b[0]);
  for (let k = 0; k < Math.min(3, cands.length); k++) {
    const t = cands[k][1], tp = targetPoint(t);
    if (World.lineOfSight(x, y, z, tp.x, tp.y, tp.z)) return t;
  }
  return null;
}

const Crew = (() => {
  const MAX = 10;
  function members() { return Ents.list.filter((e) => e.alive && e.team === 'crew' && e.crew); }
  function count() { return members().length; }
  function bedSlots() {
    const slots = [];
    const beds = [...Base.objs.values()].filter((o) => OBJ[o.type].beds).sort((a, b) => a.id - b.id);
    let playerTaken = false;
    for (const o of beds) for (let s = 0; s < OBJ[o.type].beds; s++) {
      if (!playerTaken && o.type === 'voodi') { playerTaken = true; continue; }
      slots.push({ obj: o, slot: s });
    }
    return slots;
  }
  function assignBeds() {
    const slots = bedSlots();
    const used = new Set();
    const ms = members();
    for (const m of ms) {
      const c = m.crew;
      if (c.bed && slots.some((s) => s.obj.id === c.bed.obj && s.slot === c.bed.slot) && !used.has(c.bed.obj + ':' + c.bed.slot)) { used.add(c.bed.obj + ':' + c.bed.slot); continue; }
      c.bed = null;
    }
    for (const m of ms) {
      const c = m.crew; if (c.bed) continue;
      const s = slots.find((q) => !used.has(q.obj.id + ':' + q.slot));
      if (s) { c.bed = { obj: s.obj.id, slot: s.slot }; used.add(s.obj.id + ':' + s.slot); }
    }
  }
  function freeBeds() { return Math.max(0, bedSlots().length - count()); }
  function canHire(cand) {
    if (!G.flags.term) return { ok: false, why: 'The terminal is broken' };
    if (count() >= MAX) return { ok: false, why: 'Crew is full (10)' };
    if (freeBeds() <= 0) return { ok: false, why: 'Needs a free bed' };
    if (G.res.cr < cand.fee) return { ok: false, why: 'Not enough money' };
    return { ok: true };
  }
  function hire(cand) {
    const ch = canHire(cand); if (!ch.ok) return ch;
    G.res.cr -= cand.fee;
    const a = rand(0, TAU);
    const x = Math.cos(a) * 45, z = Math.sin(a) * 45;
    const tr = cand.trait;
    const hp = 70 * (tr === 'vintske' ? 1.5 : 1) * (tr === 'veteran' ? 1.3 : 1);
    const e = Ents.spawn('human', 'crew', x, z, {
      maxHp: hp, radius: 0.38, ai: crewAI, tint: null,
      crew: { name: cand.name, look: cand.look || Look.clean(Look.forName(cand.name)), role: cand.role, skill: cand.skill, trait: tr, wage: cand.wage, story: cand.story, spy: cand.spy, spyFor: cand.spyFor,
        hunger: 85, thirst: 90, hygiene: 80, bladder: 80, energy: 90, morale: 70, rel: {}, bed: null, task: null, act: 'Arriving', carry: 0, carryKind: null, thefts: 0, stoleTonight: false, hiredDay: G.time.day, unpaid: 0 },
      scanT: 0, cool: 0,
    });
    G.candidates = G.candidates.filter((c) => c.id !== cand.id);
    assignBeds();
    UI.msg(cand.name + ' (' + ROLES[cand.role].name.toLowerCase() + ') arrived on the cargo shuttle.', 'good');
    note('hired', cand.name.split(' ')[0]);
    Audio2.cash();
    Objectives.check();
    Save.auto();
    return { ok: true, e };
  }
  function fire(e) {
    if (!e.crew) return;
    UI.msg(e.crew.name + ' packed up and left.', 'warn');
    leave(e);
  }
  function leave(e) {
    e.team = 'neutral'; e.leaving = true; e.ai = leaveAI; e.crew.act = 'Leaving';
    const a = Math.atan2(e.pos.z, e.pos.x);
    Ents.goTo(e, Math.cos(a) * 200, Math.sin(a) * 200);
  }
  function leaveAI(e, dt) { Ents.stepMove(e, dt, 4.0); if (Ents.arrived(e) || Math.hypot(e.pos.x, e.pos.z) > 190) e.remove = true; }
  function payWages() {
    const ms = members();
    let total = 0, unpaid = [];
    for (const m of ms) {
      const c = m.crew;
      if (G.res.cr >= c.wage) { G.res.cr -= c.wage; total += c.wage; c.unpaid = 0; }
      else { unpaid.push(m); c.morale -= 30; c.unpaid++; }
    }
    if (total) { UI.msg('Wages paid: ' + fmtInt(total) + ' ₵.', 'money'); note('payday'); }
    if (unpaid.length) note('unpaid');
    if (unpaid.length) UI.msg('Wages unpaid: ' + unpaid.map((m) => m.crew.name.split(' ')[0]).join(', ') + '. Morale drops.', 'danger');
    // igapäevane tuju
    const plants = Base.objsOfType('taim').length;
    const cook = ms.some((m) => m.crew.role === 'kokk');
    const happy = ms.filter((m) => m.crew.trait === 'roomus').length;
    for (const m of ms) {
      const c = m.crew;
      c.morale += Math.min(6, plants * 1.5) + (cook ? 4 : 0) + happy * 3 - (c.bed ? 0 : 12);
      c.morale = clamp(c.morale, 0, 100);
      if (c.morale < 18) { UI.msg(c.name + ' had enough and left.', 'danger'); leave(m); }
    }
    // spioonid
    for (const m of ms) {
      const c = m.crew;
      if (c.spy && c.stoleTonight) {
        c.stoleTonight = false;
        if (c.thefts >= 2) {
          UI.msg(c.name + ' was ' + Rivals.get(c.spyFor).short + ' spy! They\'re running away.', 'danger');
          UI.banner('Traitor!', c.name + ' was working for ' + Rivals.get(c.spyFor).short + ' ', 'danger');
          m.team = c.spyFor; m.crew = null; m.ai = Rivals.unitAI; m.mission = 'flee'; m.home = Rivals.get(m.team).base; m.dmg = 6; m.acc = 0.5;
        }
      }
    }
    assignBeds();
  }
  function afterSleep() { for (const m of members()) { m.crew.energy = 100; m.crew.bladder = Math.min(m.crew.bladder || 80, 40); m.crew.thirst = Math.max(35, (m.crew.thirst || 90) - 25); m.crew.hunger = Math.max(30, m.crew.hunger - 30); if (m.pose === 'lie') m.pose = 'stand'; m.crew.task = null; } }
  function onDeath(e, src) {
    const name = e.crew ? e.crew.name : 'Someone';
    UI.msg(name + ' was killed.', 'danger');
    leaveGroup(e);
    for (const m of members()) {
      m.crew.morale = clamp(m.crew.morale - 15 - Math.max(0, (m.crew.rel[e.id] || 0) / 5), 0, 100);
      m.crew.mournUntil = G.time.day + ((m.crew.rel[e.id] || 0) > 40 ? 2 : 1);
    }
    if (e.crew) { e.crew.dead = true; note('death', name.split(' ')[0]); placeGrave(name); }
    const w = members().sort((a, b) => Math.hypot(a.pos.x - e.pos.x, a.pos.z - e.pos.z) - Math.hypot(b.pos.x - e.pos.x, b.pos.z - e.pos.z))[0];
    if (w) say(w, pick(['No… ' + name.split(' ')[0] + '!', 'We lost ' + name.split(' ')[0] + '…', 'Damn it!']), 0);
  }
  function engineerBonus() { return members().filter((m) => m.crew.role === 'insener' && m.pose !== 'lie').length; }
  function scientistAtScanner() { return members().some((m) => m.crew.role === 'teadlane' && m.crew.task && m.crew.task.type === 'scan' && m.crew.task.step === 2); }

  // ---------- AI ----------
  function isSleepTime(c) {
    const h = Econ.hour();
    if (c.role === 'valvur') return h >= 10 && h < 16;
    if (c.trait === 'ookull') return h >= 9 && h < 16;
    if (c.wakeOff === undefined) { c.wakeOff = rand(-0.3, 1.1); c.bedOff = rand(-0.6, 0.8); }
    return h >= 21.5 + c.bedOff || h < 6 + c.wakeOff;
  }
  function wakeUp(e) { if (e.pose === 'lie') { e.pose = 'stand'; const b = e.crew.bedObj; if (b) { const u = Base.useCells(b)[0]; if (u) { const c = Base.cellCenter(u[0], u[1]); e.pos.x = c.x; e.pos.z = c.z; } } e.pos.y = Ents.groundY(e.pos.x, e.pos.z, e.pos.y); } if (e.pose === 'sit') e.pose = 'stand'; }
  function goObj(e, o) {
    const cells = Base.useCells(o);
    if (!cells.length) return false;
    e.goalCells = cells.map((c) => [c[0], c[1]]);
    if (o.lv) { const c = Base.cellCenter(cells[0][0], cells[0][1]); Ents.goTo(e, c.x, c.z, null, 1); return true; }
    Ents.goTo(e, o.cx, o.cz, e.goalCells);
    return true;
  }
  function speedOf(e) { const c = e.crew; return (c.trait === 'kiire' ? 5.4 : 4.4) * (c.trait === 'laisk' ? 0.85 : 1) * (e.hp < e.maxHp * 0.5 ? 0.72 : 1) * (c.energy < 20 ? 0.85 : 1) * (c.carry > 0 && c.trait !== 'tugev' ? 0.85 : 1) * (e.downed ? 0 : 1) * Inv.gearSpd(c.look && c.look.eq); }
  // mida inimene aeg-ajalt ütleb
  function sayLine(e) {
    const c = e.crew, k = c.task, n = (s) => s;
    const L = [];
    if (c.hunger < 30) L.push('My stomach is growling…', 'When do we eat?');
    if (c.thirst < 30) L.push('My throat is dry as the desert.', 'Water…');
    if (c.energy < 25) L.push('My eyes are closing.', 'I need sleep.');
    if (c.hygiene < 20) L.push('I stink like a goat.', 'Shower… please.');
    if (e.hp < e.maxHp * 0.5) L.push('My leg hurts.', 'Ow… this scratch stings.');
    if (c.morale < 25) L.push('Why did I even come here?', 'Home is so far away.');
    if (c.morale > 80) L.push('Today is a good day!', 'This place is starting to feel like home.');
    if (c.follow) L.push('I\'ve got your back.', 'Where are we going?', 'I\'ll keep my eyes open.');
    if (k && k.type === 'mine') L.push('These diamonds shine like stars.');
    if (k && k.type === 'patrol') L.push('All quiet.', 'Something moving in the dunes?');
    if (k && k.type === 'explore') L.push('I wonder what\'s further out there.');
    if (k && k.type === 'chat') L.push(k.argue ? 'You again!' : 'Did you hear that?', k.argue ? 'Leave me alone.' : 'Ha-ha, exactly!');
    if (Econ.isNight()) L.push('There are voices in the dunes at night.');
    if (!c.bed) L.push('Sleeping on the floor wrecks your back.');
    return L.length ? pick(L) : null;
  }
  function workMult(c) { return (0.75 + c.skill * 0.25) * (c.trait === 'laisk' ? 0.7 : 1); }
  function crewDmg(c) { const base = c.role === 'valvur' ? 11 : c.role === 'jahimees' ? 11 : 6; return base * (c.trait === 'tapne' ? 1.4 : 1) * (c.trait === 'veteran' ? 1.35 : 1); }
  function crewAcc(c) { return (roomTypes && [...(rtCache || new Map()).values()].includes('Armoury') ? 1.1 : 1) * ((c.role === 'valvur' || c.role === 'jahimees' ? 0.62 : 0.45) + (c.trait === 'tapne' ? 0.2 : 0) + (c.trait === 'veteran' ? 0.12 : 0)) * (Base.objsOfType('relvakapp').length ? 1.15 : 1); }
  function setAct(e, s) { e.crew.act = s; }
  // kaasas käimise juht: mängija või kaasmängija (co-op)
  function leaderOf(c) { const L = c.leader; return L && L !== Player ? L : Player; }
  function leaderGone(c) { const L = leaderOf(c); return L === Player ? Player.dead : (!L.alive || !Ents.list.includes(L)); }
  // ============ ELUTRUU KÄITUMINE: abifunktsioonid ============
  const now = () => G.time.total;
  function say(e, line, gap = 7) { if (!line || !e || e.alive === false) return; const t = now(); if (e._said && t - e._said < gap) return; e._said = t; if (UI.bubble) UI.bubble(e, line); }
  function first(e) { return e.crew ? e.crew.name.split(' ')[0] : 'Someone'; }
  // suund kõneleja suhtes (hüüded lahingus)
  function relDir(e, x, z) {
    const a = angDiff(e.yaw, Math.atan2(x - e.pos.x, z - e.pos.z));
    return Math.abs(a) < 0.6 ? 'ahead' : Math.abs(a) > 2.3 ? 'behind us' : a > 0 ? 'on the left' : 'on the right';
  }
  // päeva mälu: mida täna juhtus (räägitakse õhtul, määrab peo või vaikse õhtu)
  function mem() {
    const d = G.time.day; let m = G.flags.mem;
    if (!m || m.day !== d) m = G.flags.mem = { day: d, attack: 0, kills: 0, deaths: [], kris: 0, payday: false, unpaid: false, hired: [], downed: 0 };
    return m;
  }
  function note(kind, v) {
    const m = mem();
    if (kind === 'attack') m.attack++; else if (kind === 'kill') m.kills += v || 1; else if (kind === 'kris') m.kris += v || 0;
    else if (kind === 'death') m.deaths.push(v); else if (kind === 'payday') m.payday = true; else if (kind === 'unpaid') m.unpaid = true;
    else if (kind === 'hired') m.hired.push(v); else if (kind === 'downed') m.downed++;
  }
  function dayMood() { const m = mem(); if (m.deaths.length || m.unpaid) return -1; if (m.kris >= 8 || (m.attack && m.kills >= 6) || m.payday) return 1; return 0; }
  function memLine() {
    const m = mem(), L = [];
    if (m.deaths.length) L.push('I still can\'t believe ' + m.deaths[0] + ' is gone.', 'To ' + m.deaths[0] + '. May the sand be soft.');
    if (m.attack) L.push('Did you see that swarm last night?', m.kills > 10 ? 'We shredded them!' : 'They nearly got through the wall.');
    if (m.kris >= 8) L.push('So many diamonds today. Shiny!', 'We hauled a fortune of crystals today.');
    if (m.payday && !m.unpaid) L.push('Got paid today. Drinks are on me!');
    if (m.unpaid) L.push('No pay again… how am I supposed to live?');
    if (m.hired.length) L.push('What do you think of ' + m.hired[0] + '?', 'The new one, ' + m.hired[0] + ', seems all right.');
    if (m.downed) L.push('That was too close today. Someone nearly bled out.');
    return L.length ? pick(L) : null;
  }
  // ---------- rühmavestlused (2–4 inimest ringis) ----------
  const groups = [];
  function groupSlot(g, e) {
    const n = g.mem.length, i = g.mem.indexOf(e), r = n <= 2 ? 0.7 : 0.88;
    const a = g.a0 + (i / n) * TAU;
    return { x: g.cx + Math.cos(a) * r, z: g.cz + Math.sin(a) * r };
  }
  function leaveGroup(e) {
    for (const g of groups) {
      const i = g.mem.indexOf(e); if (i < 0) continue;
      g.mem.splice(i, 1);
      if (g.spk === e) g.spk = g.mem[0] || null;
      if (g.mem.length < 2) { for (const m of g.mem) if (m.crew && m.crew.task && m.crew.task.type === 'gchat') m.crew.task.done = true; g.mem.length = 0; }
    }
    for (let i = groups.length - 1; i >= 0; i--) if (!groups[i].mem.length) groups.splice(i, 1);
  }
  function groupTick(g, dt) {
    if (g.tick === G.time.total) return; g.tick = G.time.total;
    g.spkT = (g.spkT || 0) - dt;
    const ready = g.mem.filter((m) => m.crew && m.crew.task && m.crew.task.g === g && m.crew.task.step === 2);
    if (ready.length < 2) return;
    if (g.spkT <= 0 || !ready.includes(g.spk)) {
      g.spk = pick(ready.filter((m) => m !== g.spk)) || ready[0]; g.spkT = rand(3.5, 7);
      if (Math.random() < 0.45) { const ln = (Econ.hour() > 17.5 && memLine()) || sayLine(g.spk); if (ln) say(g.spk, ln, 4); }
      if (Math.random() < 0.22) { g.laughT = 1.6; const lf = pick(ready.filter((m) => m !== g.spk)); if (lf) say(lf, pick(['Ha-ha-ha!', 'Ha! Good one.', 'Stop it, my ribs!']), 3); }
    }
    if (g.laughT > 0) g.laughT -= dt;
  }
  // ---------- langenute mälestusmärgid ----------
  const graveDone = new WeakSet();
  function placeGrave(name) {
    const a = rand(0, TAU), R = Math.max(18, Base.bounds() + 7);
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    (G.flags.graves = G.flags.graves || []).push({ x, z, name, day: G.time.day });
  }
  function syncGraves() {
    if (!G.flags.graves || !World.sites || !World.sites.decor || !MODELS.life || !MODELS.life.memorial) return;
    for (const g of G.flags.graves) {
      if (graveDone.has(g)) continue; graveDone.add(g);
      World.sites.decor.push({ mesh: MODELS.life.memorial, m: M4.compose(M4.create(), g.x, World.heightAt(g.x, g.z) - 0.05, g.z, Math.atan2(-g.x, -g.z)) });
    }
  }
  // ---------- haavatuna maas (downed): veritseb, ootab abi; päästja lohistab haiglasse ----------
  function goDown(e) {
    const c = e.crew;
    e.downed = true; e.bleed = 75; e.pose = 'lie'; e.lieY = Ents.groundY(e.pos.x, e.pos.z, e.pos.y) + 0.04; e.aim = 0; e.hasGun = false; e.prop = null;
    Ents.stopMove(e); if (c.task) c.task.done = true; c.task = null; leaveGroup(e);
    note('downed');
    say(e, pick(['I\'m hit! Help!', 'Medic! MEDIC!', 'I can\'t… get up…']), 0);
    UI.msg(c.name + ' is down and bleeding. Someone has to drag them to safety.', 'danger');
    for (const m of members()) if (m !== e && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 25) { say(m, pick(['Man down!', first(e) + ' is down!', 'Medic!']), 2); break; }
  }
  function downedTick(e, dt) {
    const c = e.crew;
    e.moveAmt = 0; e.aim = 0; e.gesture = null; e.hasGun = false; e.prop = null;
    setAct(e, e.dragBy ? 'Being dragged to safety' : 'Down and bleeding');
    if (e.dragBy && e.dragBy.alive && e.dragBy.crew && e.dragBy.crew.task && e.dragBy.crew.task.type === 'rescue') {
      const r = e.dragBy, fx = Math.sin(r.yaw), fz = Math.cos(r.yaw);
      e.pos.x = r.pos.x - fx * 1.05; e.pos.z = r.pos.z - fz * 1.05; e.yaw = r.yaw + Math.PI; e.pos.y = Ents.groundY(e.pos.x, e.pos.z, e.pos.y); e.lieY = e.pos.y + 0.04;
    } else { e.dragBy = null; if (!e.treated) e.bleed -= dt; }
    if (e.bleed < 30 && e.bleed > 29.9) say(e, 'It\'s getting dark…', 0);
    if (e.bleed <= 0) { e.downed = false; Ents.damage(e, 9999, null); return; }
    if (e.hp > e.maxHp * 0.4) { e.downed = false; e.dragBy = null; e.treated = false; e.pose = 'stand'; e.pos.y = Ents.groundY(e.pos.x, e.pos.z, e.pos.y); say(e, 'Thanks… I owe you one.', 0); c.task = { type: 'leisure', step: 0, obj: nearestObj(e, 'ravila') || nearestObj(e, 'diivan') || nearestObj(e, 'voodi'), t: 30 }; if (!c.task.obj) c.task = null; }
  }
  // ---------- pilk mängija poole: ainult kui see on loogiline ----------
  // Märkab, kui mängija tuleb lähedale tema vaatevälja, kui mängija vaatab talle otsa või kui ta tervitab.
  // Pilk kestab paar sekundit (vastastikune pilk kauem), siis pöördub tagasi oma tegemiste juurde.
  const WORK_T = new Set(['repair', 'craft', 'cook', 'scan', 'refine', 'mine', 'salvage', 'heal', 'use', 'drink', 'eat', 'tidy', 'arm', 'standby', 'rescue']);
  function viewers() {
    const L = [];
    if (!Player.dead) L.push(Player);
    for (const o of Ents.list) if (o.netPeer && o.alive) L.push(o);
    return L;
  }
  function looksAt(p, e) {
    const pitchOk = p !== Player || Math.abs(Player.pitch) < 0.6;
    const a = Math.abs(angDiff(p.yaw, Math.atan2(e.pos.x - p.pos.x, e.pos.z - p.pos.z)));
    return pitchOk && a < 0.32;
  }
  function gazeTarget(e, k, dt) {
    const g = e._gz || (e._gz = { t: 0, cd: 0, near: false, tot: 0 });
    g.cd -= dt;
    if (e.pose === 'lie' || G.mode !== 'play' || e.downed) { g.t = 0; return null; }
    let best = null, bd = 1e9;
    for (const p of viewers()) { const d = Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z); if (d < bd) { bd = d; best = p; } }
    if (!best || bd > 6.5 || Math.abs(best.pos.y - e.pos.y) > 2.5) { g.near = false; g.t = 0; return null; }
    const ang = Math.abs(angDiff(e.yaw, Math.atan2(best.pos.x - e.pos.x, best.pos.z - e.pos.z)));
    const sees = ang < 1.75 || bd < 1.3;
    const busy = !!(k && k.step === 2 && WORK_T.has(k.type));
    const social = !!(k && (k.type === 'gchat' || k.type === 'chat' || k.type === 'argue'));
    const rng = busy || social ? 2.4 : 4.6;
    const lookedAt = looksAt(best, e) && bd < rng + 0.6;
    if (g.t > 0) {
      g.t -= dt; g.tot += dt;
      if (lookedAt && sees && g.tot < (busy || social ? 2.5 : 6)) g.t = Math.max(g.t, 0.35);   // vastastikune pilk
      if (g.t <= 0) g.cd = rand(7, 14);
      return sees ? best : null;
    }
    const nearNow = bd < rng;
    const enter = nearNow && !g.near;
    g.near = nearNow;
    if (!sees || g.cd > 0) return null;
    if ((enter && !social) || lookedAt) { g.t = rand(1.1, busy ? 1.7 : 2.8); g.tot = 0; return best; }
    return null;
  }
  function glanceAt(e, secs) { const g = e._gz || (e._gz = { t: 0, cd: 0, near: true, tot: 0 }); g.t = Math.max(g.t, secs); g.tot = 0; }
  // ---------- pilk: pea pöördub vestluskaaslase, mängija, töö või heli poole ----------
  function lookTick(e, dt) {
    const c = e.crew, k = c.task;
    let tx = null, tz = null, ty = 0;
    if (e._startle && now() - e._startle.t < 2.2) { tx = e._startle.x; tz = e._startle.z; }
    else if (k && k.type === 'approach' && !Player.dead) { tx = Player.pos.x; tz = Player.pos.z; ty = 0.1; }
    else {
      const pv = gazeTarget(e, k, dt);
      if (pv) { tx = pv.pos.x; tz = pv.pos.z; ty = 0.1; }
      else if (k && (k.type === 'gchat' || k.type === 'chat') && k.step === 2) {
        const g = k.g; const sp = g ? g.spk : k.with;
        if (sp && sp !== e) { tx = sp.pos.x; tz = sp.pos.z; } else if (g) { tx = g.cx; tz = g.cz; }
      } else if (k && k.obj && k.step === 2 && e.gesture) { tx = k.obj.cx; tz = k.obj.cz; ty = -0.3; }
    }
    if (tx !== null) {
      const want = clamp(angDiff(e.yaw, Math.atan2(tx - e.pos.x, tz - e.pos.z)), -1.1, 1.1);
      e.headYaw = lerp(e.headYaw || 0, want, Math.min(1, dt * 4));
      e.headPitch = lerp(e.headPitch || 0, -ty * 0.6 + (e.gesture === 'fix' || e.gesture === 'mine' || e.gesture === 'interact' ? 0.28 : 0), Math.min(1, dt * 3));
      return true;
    }
    e.headPitch = lerp(e.headPitch || 0, 0, Math.min(1, dt * 3));
    return false;
  }
  // kutsutakse Ents.noise kaudu: lähedal kõlanud lask/plahvatus ehmatab
  function hear(x, z, r, kind) {
    for (const m of members()) {
      if (m.downed || m.pose === 'lie') continue;
      const d = Math.hypot(m.pos.x - x, m.pos.z - z); if (d > r || d < 2) continue;
      if (m._startle && now() - m._startle.t < 6) continue;
      m._startle = { x, z, t: now() };
      if (!m.threat) say(m, m.crew.trait === 'argpyks' ? pick(['Aah! What was that?!', 'Did you hear that?!']) : pick(['What was that?', 'Shots!', 'Heads up!']), 5);
    }
  }
  // ---------- igakaadriline elu: tervitused, taskulamp, mälestus, kukkumine ----------
  function lifeTick(e, c, dt) {
    if (!e.downed && e.alive && e.hp > 0 && e.hp < e.maxHp * 0.18 && !c.follow) { goDown(e); return; }
    e.mourn = c.mournUntil && c.mournUntil >= G.time.day ? 1 : 0;
    // mängija tervitamine / kaebamine teel olles
    const pd = Math.hypot(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z);
    const seesP = Math.abs(angDiff(e.yaw, Math.atan2(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z))) < 1.75 || pd < 1.3;
    if (!Player.dead && G.mode === 'play' && pd < 3.4 && !e.threat && e.pose !== 'lie' && seesP) {
      c.lastBoss = now();
      if (!e._greet || now() - e._greet > 120) {
        e._greet = now(); glanceAt(e, 2.2);
        const h = Econ.hour();
        say(e, c.morale < 30 ? pick(['…boss.', 'Hm.', 'We need to talk, boss.']) : h < 10 ? pick(['Morning, boss!', 'Good morning!']) : h > 19 ? pick(['Evening, boss.', 'Long day, huh?']) : pick(['Hey, boss!', 'All good, boss.', 'Need anything?', 'Boss.']), 0);
        if (!e.path || Ents.arrived(e)) { if (!e.gesture) { e.gesture = 'yes'; e._gClear = now() + 1.6; } }
      }
      if (e.path && !Ents.arrived(e) && (e.stuckT || 0) > 0.6 && pd < 1.6) say(e, pick(['Excuse me, boss!', 'Coming through!', 'Could you move a bit?']), 8);
    }
    if (e._gClear && now() > e._gClear) { if (e.gesture === 'yes' || e.gesture === 'cheer') e.gesture = null; e._gClear = 0; }
    // elektrikatkestus öösel: taskulamp välja
    const dark = !Base.power.lightsOn && (Econ.isNight() || Base.isInside(e.pos.x, e.pos.z));
    e.torch = dark && e.pose !== 'lie' && !e.aim && (!e.prop || e.prop === 'flashlight');
    if (e.torch) e.prop = 'flashlight'; else if (e.prop === 'flashlight') e.prop = null;
  }
  // taskulampide valgus (ainult kaamerale lähimad, sest valgusallikaid on piiratud arv)
  function torchLights() {
    const L = [];
    for (const m of members()) if (m.torch) L.push([Math.hypot(m.pos.x - GFX.cam.pos.x, m.pos.z - GFX.cam.pos.z), m]);
    L.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < Math.min(3, L.length); i++) {
      const m = L[i][1], fx = Math.sin(m.yaw + (m.headYaw || 0)), fz = Math.cos(m.yaw + (m.headYaw || 0));
      GFX.addLight(m.pos.x + fx * 2.2, m.pos.y + 1.0, m.pos.z + fz * 2.2, 6.5, 1.0, 0.9, 0.7, 1.1);
    }
  }
  // ---------- lahingutaktika ----------
  const MAG = { carbine: 24, carbineTan: 24, shotgun: 6, smg: 30, dmr: 10, lmg: 60 };
  function findCover(e, t) {
    const cols = World.query(e.pos.x - 8, e.pos.z - 8, e.pos.x + 8, e.pos.z + 8);
    let best = null, bd = 1e9;
    for (const c of cols) {
      if (c.door || c.off || c.y1 - c.y0 < 0.9 || c.kind === 'tree') continue;
      let cx, cz, rr;
      if (c.t === 'c') { cx = c.x; cz = c.z; rr = c.r; }
      else if (c.t === 'b') { cx = (c.x0 + c.x1) / 2; cz = (c.z0 + c.z1) / 2; rr = Math.min(c.x1 - c.x0, c.z1 - c.z0) / 2; }
      else if (c.t === 's') { cx = (c.ax + c.bx) / 2; cz = (c.az + c.bz) / 2; rr = c.r || 0.3; }
      else continue;
      if (rr > 4) continue;
      const dx = cx - t.pos.x, dz = cz - t.pos.z, L = Math.hypot(dx, dz) || 1;
      const px = cx + dx / L * (rr + 0.75), pz = cz + dz / L * (rr + 0.75);
      const d = Math.hypot(px - e.pos.x, pz - e.pos.z) + Math.max(0, 6 - L) * 2;
      if (d < bd && d < 9) { bd = d; best = { x: px, z: pz }; }
    }
    return best;
  }
  // tagastab true, kui lahinguloogika võttis kaadri üle (ei tulista)
  function combatTick(e, c, t, tp, d, dt) {
    if (e._lastThreat !== t) { e._lastThreat = t; say(e, pick(['Contact ' + relDir(e, tp.x, tp.z) + '!', 'Enemy ' + relDir(e, tp.x, tp.z) + '!', 'Here they come!']), 6); }
    // paanika (madal moraal) ja julgustus (veteran / kõrge moraal)
    if (e.panicT > 0) {
      e.panicT -= dt; e.aim = Math.max(0, e.aim - dt * 3); e.crouch = 0;
      setAct(e, 'Panicking!');
      const h = homeTarget(e); if (h && (!e.path || Ents.arrived(e))) goObj(e, h);
      Ents.stepMove(e, dt, speedOf(e) * 1.5); return true;
    }
    if (c.morale < 25 && c.role !== 'valvur' && c.trait !== 'veteran' && d < 20 && Math.random() < dt * 0.08) { e.panicT = 8; say(e, pick(['I can\'t do this!', 'We\'re all going to die!', 'Run!']), 0); return true; }
    if ((c.trait === 'veteran' || c.morale > 80) && (!e._rally || now() - e._rally > 18)) {
      e._rally = now(); say(e, pick(['Hold the line!', 'Steady! Aim and fire!', 'We\'ve got this!']), 0);
      for (const m of members()) if (m !== e && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 14) { m.panicT = 0; m.crew.morale = Math.min(100, m.crew.morale + 3); }
    }
    // laadimine
    const gk = typeof npcGun === 'function' ? npcGun(e) : 'carbine';
    if (e.ammo === undefined) e.ammo = MAG[gk] || 24;
    if (e.reloadT > 0) {
      e.reloadT -= dt; e.aim = Math.max(0.2, e.aim - dt * 4); e.crouch = Math.min(0.7, (e.crouch || 0) + dt * 3);
      setAct(e, 'Reloading'); if (e.reloadT <= 0) { e.ammo = MAG[gk] || 24; }
      return true;
    }
    if (e.ammo <= 0) {
      e.reloadT = gk === 'lmg' ? 3.4 : gk === 'shotgun' ? 2.8 : 2.1; say(e, pick(['Reloading!', 'Cover me, reloading!', 'Changing mag!']), 3);
      for (const m of members()) if (m !== e && m.threat && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 12) { say(m, 'Covering!', 4); m.cool = Math.min(m.cool, 0.1); m._coverBoost = now() + 3; break; }
      return true;
    }
    // varje otsimine väljas (mitte postil ega valvuri pealetungil)
    if (!e.onPost && !Base.isInside(e.pos.x, e.pos.z) && d > 7 && c.role !== 'valvur') {
      if (!e.coverPt || now() - (e.coverT || 0) > 4) { e.coverPt = findCover(e, t); e.coverT = now(); if (e.coverPt) Ents.goTo(e, e.coverPt.x, e.coverPt.z); }
      if (e.coverPt && Math.hypot(e.coverPt.x - e.pos.x, e.coverPt.z - e.pos.z) > 0.6) { setAct(e, 'Moving to cover'); Ents.stepMove(e, dt, speedOf(e) * 1.35); e.aim = Math.max(0.3, e.aim - dt); e.crouch = 0.2; return true; }
      e.crouch = e.coverPt ? 0.3 : 0;
    } else e.crouch = 0;
    return false;
  }
  // ---------- ruumide valgus: kui kõik toas magavad, kustub tuli ----------
  let darkT = 0;
  function updateRoomLights(dt) {
    darkT -= dt; if (darkT > 0) return; darkT = 1.5;
    const h = Econ.hour(), night = h >= 21.5 || h < 6.5;
    const pr = Base.roomAt ? Base.roomAt(Base.toCell(Player.pos.x, Player.pos.z).i, Base.toCell(Player.pos.x, Player.pos.z).j) : 0;
    for (const r of Base.rooms.values()) {
      if (!night) { r.dark = false; continue; }
      let sleepers = 0, awake = 0;
      for (const m of members()) { const c = Base.toCell(m.pos.x, m.pos.z); if (Base.roomAt(c.i, c.j) !== r.id) continue; if (m.pose === 'lie' && !m.downed) sleepers++; else awake++; }
      r.dark = sleepers > 0 && awake === 0 && pr !== r.id;
    }
  }
  // juhuslik vaba ruut mõnes toas (mitte eseme peal ega ukse ees)
  function freeRoomCell() {
    const rooms = [...Base.rooms.values()];
    for (let t = 0; t < 30 && rooms.length; t++) {
      const r = rooms[Math.floor(Math.random() * rooms.length)];
      const [i, j] = r.cells[Math.floor(Math.random() * r.cells.length)];
      if (!Base.objAt(i, j)) return Base.cellCenter(i, j);
    }
    return null;
  }
  function nearestObj(e, type, pred) {
    let best = null, bd = 1e9;
    for (const o of Base.objs.values()) { if (o.type !== type || (pred && !pred(o))) continue; const d = Math.hypot(o.cx - e.pos.x, o.cz - e.pos.z); if (d < bd) { bd = d; best = o; } }
    return best;
  }
  function homeTarget(e) {
    const h = nearestObj(e, 'hoidla') || [...Base.objs.values()][0];
    return h;
  }
  function deposit(e) {
    const c = e.crew;
    if (!c.carry) return;
    if (c.carryKind === 'kris') { note('kris', c.carry); G.res.kris += c.carry; UI.toast(c.name.split(' ')[0] + ' brought ' + c.carry + ' diamonds'); }
    if (c.carryKind === 'scrap') { G.res.scrap += c.carry; UI.toast(c.name.split(' ')[0] + ' brought ' + c.carry + ' scrap'); }
    if (c.carryKind === 'ore') { G.res.ore = (G.res.ore || 0) + c.carry; UI.toast(c.name.split(' ')[0] + ' brought ' + c.carry + ' iron ore'); }
    if (c.carryKind === 'acid') { G.res.acid = (G.res.acid || 0) + c.carry; G.flags.acid = true; UI.toast(c.name.split(' ')[0] + ' brought ' + c.carry + ' acid glands'); }
    if (c.carryKind === 'meat') { G.res.meat += c.carry; UI.toast(c.name.split(' ')[0] + ' brought ' + c.carry + ' meat'); }
    c.carry = 0; c.carryKind = null;
  }

  // ---------- väljasõidud gruppides ----------
  // korjama / jahile minnakse võimalusel mitmekesi: sama sihtmärgi poole minejad ühinevad, vabad kaaslased kutsutakse kaasa
  const OUT_TYPES = { mine: 1, salvage: 1, hunt: 1, drill: 1 }, IDLE_TYPES = { leisure: 1, wander: 1, explore: 1, sunset: 1, slack: 1, quiet: 1, warm: 1, tidy: 1 };
  const goalOf = (k) => (k.type === 'salvage' ? k.wreck : k.type === 'drill' ? k.ore : k.type === 'mine' ? k.site : k.target);
  function outingOf(e, type, pred) {
    for (const m of members()) {
      if (m === e || !m.crew.task || m.crew.task.type !== type || m.crew.task.done || (m.crew.task.step || 0) > 1) continue;
      const g = goalOf(m.crew.task); if (!g || (pred && !pred(g))) continue;
      if (members().filter((q) => q.crew.task && q.crew.task.type === type && goalOf(q.crew.task) === g).length >= 3) continue;
      return m;
    }
    return null;
  }
  function canJoin(m) {
    const c = m.crew, k = c.task;
    if (m.downed || c.follow || c.carry > 0 || m.hp < m.maxHp * 0.6 || c.energy < 25 || c.hunger < 35 || c.thirst < 35) return false;
    if (c.role === 'valvur' || c.role === 'arst' || c.trait === 'argpyks') return false;
    return !k || k.done || !!IDLE_TYPES[k.type];
  }
  // e alustab väljasõitu: kutsu 1–2 vaba kaaslast kaasa (eelistatult sama ameti omad)
  function expedition(e, task) {
    task.goal = goalOf(task);
    const near = members().filter((m) => m !== e && canJoin(m) && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 45)
      .sort((a, b) => (b.crew.role === e.crew.role) - (a.crew.role === e.crew.role) || Math.hypot(a.pos.x - e.pos.x, a.pos.z - e.pos.z) - Math.hypot(b.pos.x - e.pos.x, b.pos.z - e.pos.z));
    let n = 0;
    for (const m of near) {
      if (n >= (task.type === 'hunt' ? 1 : 2)) break;
      if (m.crew.role !== e.crew.role && Math.random() < 0.5) continue;
      if (m.crew.task && m.crew.task.type === 'gchat') leaveGroup(m);
      if (m.pose === 'sit' || m.pose === 'lie') m.pose = 'stand';
      m.crew.task = Object.assign({}, task, { step: 0, t: 0, buddy: e, helper: m.crew.role !== e.crew.role });
      say(m, pick(['Wait up, I\'m coming.', 'I\'ll come along.', 'Better not go alone.', 'Right behind you.']), 6);
      n++;
    }
    if (n) task.buddy = task.buddy || near[0];
    return task;
  }
  // koos liikumine: kaaslasest ees -> aeglasemalt, maas -> kiiremini
  function groupSpeed(e, k, sp) {
    const b = k.buddy;
    if (!b || !b.alive || !b.crew || !b.crew.task || goalOf(b.crew.task) !== goalOf(k) || (b.crew.task.step || 0) > 1) return sp;
    const g = k.goal || goalOf(k); if (!g || !g.pos && g.x === undefined) return sp;
    const gx = g.pos ? g.pos.x : g.x, gz = g.pos ? g.pos.z : g.z;
    const gap = Math.hypot(b.pos.x - e.pos.x, b.pos.z - e.pos.z);
    if (gap < 4) return sp;
    const me = Math.hypot(gx - e.pos.x, gz - e.pos.z), him = Math.hypot(gx - b.pos.x, gz - b.pos.z);
    return me < him ? sp * (gap > 12 ? 0.35 : 0.65) : sp * (gap > 12 ? 1.35 : 1.15);
  }

  function chooseTask(e) {
    const c = e.crew;
    if (c.follow) return { type: 'follow', step: 0, rt: 0 };
    { const lc = lifeChoice(e); if (lc) return lc; }
    // putukaparv: võitlejad postidele, teised varjule
    const wi = Waves.info();
    const waveSoon = wi && !wi.none && !wi.done && wi.warned;
    if (waveSoon) {
      if (c.role === 'arst') { const rv = nearestObj(e, 'ravila'); if (rv) return { type: 'standby', step: 0, obj: rv }; }
      const fighter0 = c.role === 'valvur' || c.role === 'jahimees' || c.trait === 'veteran' || c.trait === 'tapne' || c.trait === 'tugev';
      if (fighter0 && now() - (c.armedT || -1e9) > 200) { const lk = nearestObj(e, 'relvakapp'); if (lk) return { type: 'arm', step: 0, obj: lk }; }
      const fighter = c.role === 'valvur' || c.role === 'jahimees' || c.trait === 'veteran' || c.trait === 'tapne' || c.trait === 'tugev';
      if (fighter || !Base.isInside(e.pos.x, e.pos.z) && c.trait !== 'argpyks') {
        const post = freePost(e);
        if (post) return { type: 'post', step: 0, obj: post };
        const gv = typeof Vehicles !== 'undefined' && Vehicles.freeGunPost(e);
        if (gv) return { type: 'vgun', step: 0, v: gv };
      }
      if (!fighter) return { type: 'shelter', step: 0, t: 30 };
    }
    if (c.carry > 0) return { type: 'home', step: 0 };
    // magamine
    if (isSleepTime(c) || c.energy < 12) return { type: 'sleep', step: 0 };
    // hommikurutiin ja hädad
    const hr = Econ.hour();
    if (c.bladder < 30) { const w = nearestObj(e, 'wc'); return w ? { type: 'use', step: 0, obj: w, t: 6, what: 'wc' } : { type: 'relieve', step: 0, t: 0 }; }
    if (c.hygiene < 35 || (hr > 6 && hr < 8 && c.hygiene < 70 && !c.washedToday)) { const d = nearestObj(e, 'dush', (o) => o.on); if (d) return { type: 'use', step: 0, obj: d, t: 8, what: 'dush' }; }
    // söögiajad: hommik 6–8, lõuna 12–13, õhtu 18–19.5
    const mealTime = (hr > 6 && hr < 8) || (hr > 12 && hr < 13.2) || (hr > 18 && hr < 19.5);
    if (mealTime && c.hunger < 80 && (G.res.food > 0 || G.res.meat > 0) && c.lastMeal !== Math.floor(hr / 6) + '_' + G.time.day) { c.lastMeal = Math.floor(hr / 6) + '_' + G.time.day; return { type: 'eat', step: 0 }; }
    // söömine
    if (c.hunger < 42 && (G.res.food > 0 || G.res.meat > 0)) return { type: 'eat', step: 0 };
    // joomine
    if (c.thirst < 40) { const o = nearestObj(e, 'pliit') || nearestObj(e, 'hoidla') || nearestObj(e, 'laud'); if (o) return { type: 'drink', step: 0, obj: o, t: 0 }; }
    // haavatud puhkab baasis
    if (e.hp < e.maxHp * 0.5) { const o = nearestObj(e, 'diivan') || nearestObj(e, 'laud') || nearestObj(e, 'ravila'); if (o) return { type: 'leisure', step: 0, obj: o, t: 25 }; return { type: 'wander', step: 0, t: 20 }; }
    // ametitöö (tööpäev 8–18; õhtu on vaba aeg, valvurid ja öökullid erand)
    const night = Econ.isNight();
    const offDuty = (hr >= 18.5 || hr < 7.5) && c.role !== 'valvur' && c.trait !== 'ookull' && !(c.role === 'arst');
    if (!offDuty && c.trait === 'laisk' && Math.random() < 0.3) return { type: 'slack', step: 0, obj: nearestObj(e, 'diivan'), t: rand(15, 30) };
    if (!offDuty && c.trait === 'veteran' && !night && Math.random() < 0.25) return { type: 'perimeter', step: 0 };
    if (!offDuty) switch (c.role) {
      case 'valvur': return { type: 'patrol', step: 0 };
      case 'jahimees': {
        if (night) break;
        const need = (G.res.food + G.res.meat) < count() * 4 + 8;
        { const o = outingOf(e, 'hunt', (g) => g.alive && Math.hypot(g.pos.x, g.pos.z) < 420); if (o) return { type: 'hunt', step: 0, target: o.crew.task.target, t: 0, buddy: o, goal: o.crew.task.target }; }
        // tulnukajaht: happenäärmed on hea raha (kui toitu on piisavalt)
        if (!need && Math.random() < 0.55) {
          const al = Aliens.nearestPack(0, 0, 420);
          if (al) return expedition(e, { type: 'hunt', step: 0, target: al, t: 0 });
        }
        if (need || Math.random() < 0.4) {
          let best = null, bd = 240;
          for (const g of Ents.list) if (g.alive && (g.kind === 'goat' || g.kind === 'ram')) { const d = Math.hypot(g.pos.x, g.pos.z); const dd = Math.hypot(g.pos.x - e.pos.x, g.pos.z - e.pos.z); if (d < 420 && dd < bd) { bd = dd; best = g; } }
          if (best) return expedition(e, { type: 'hunt', step: 0, target: best, t: 0 });
        }
        break;
      }
      case 'kaevur': {
        if (night) break;
        { const o = outingOf(e, 'mine'); if (o) return { type: 'mine', step: 0, site: o.crew.task.site, t: 0, buddy: o, goal: o.crew.task.site }; }
        { const o = outingOf(e, 'salvage', (w) => w.scrap > 0 && !w.gone); if (o) return { type: 'salvage', step: 0, wreck: o.crew.task.wreck, t: 0, buddy: o, goal: o.crew.task.wreck }; }
        const sites = Comets.activeSites().filter((s) => Math.hypot(s.x, s.z) < 480 && (s.exact || s.age > 20));
        if (sites.length) {
          sites.sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z));
          return expedition(e, { type: 'mine', step: 0, site: sites[0], t: 0 });
        }
        { const o = outingOf(e, 'drill', (q) => q.amount > 0 && !q.gone); if (o) return { type: 'drill', step: 0, ore: o.crew.task.ore, t: 0, buddy: o, goal: o.crew.task.ore }; }
        const wr = World.wrecks.filter((w) => w.scrap > 0 && !w.gone && Math.hypot(w.x, w.z) < 320).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
        // maagipuur ostetud: rauamaak (eriti kui vrakke pole või maaki hoidlas vähe)
        if (G.flags.drill) {
          const ore = World.ores.filter((q) => q.amount > 0 && !q.gone && Math.hypot(q.x, q.z) < 360).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
          if (ore && (!wr || (G.res.ore || 0) < 30 && Math.random() < 0.6)) return expedition(e, { type: 'drill', step: 0, ore, t: 0 });
        }
        if (wr) return expedition(e, { type: 'salvage', step: 0, wreck: wr, t: 0 });
        break;
      }
      case 'insener': {
        const dmg = [...Base.objs.values()].find((o) => ((o.type === 'kahur' || o.type === 'myyrturel') && o.hp < o.maxHp) || (o.broken && o.type === 'vanagen'));
        if (dmg && G.res.scrap >= 5) return { type: 'repair', step: 0, obj: dmg, t: 0 };
        const wb = nearestObj(e, 'toolaud', (o) => o.on);
        if (wb) return { type: 'craft', step: 0, obj: wb, t: 0 };
        break;
      }
      case 'kokk': {
        const st = nearestObj(e, 'pliit', (o) => o.on);
        if (st && G.res.meat > 0) return { type: 'cook', step: 0, obj: st, t: 0 };
        break;
      }
      case 'arst': {
        const hurt = members().find((m) => m !== e && m.hp < m.maxHp * 0.75);
        if (hurt) return { type: 'heal', step: 0, target: hurt, t: 0 };
        if (Player.hp < Player.maxHp * 0.7 && !Player.dead && Math.hypot(Player.pos.x, Player.pos.z) < 60) return { type: 'heal', step: 0, target: Player, t: 0 };
        break;
      }
      case 'teadlane': {
        const sc = nearestObj(e, 'skanner', (o) => o.on);
        if (sc && !G.scan.found) return { type: 'scan', step: 0, obj: sc, t: 0 };
        const rf = nearestObj(e, 'lihvija', (o) => o.on);
        if (rf && G.res.kris > 0) return { type: 'refine', step: 0, obj: rf, t: 0 };
        break;
      }
    }
    // spioon öösel
    if (c.spy && night && !c.stoleTonight && Econ.hour() > 1 && Econ.hour() < 4 && Math.random() < 0.3) {
      const h = nearestObj(e, 'hoidla'); if (h) return { type: 'steal', step: 0, obj: h, t: 0 };
    }
    // tööajal vaba inimene läheb teistega korjama (mitte valvurid ega arstid)
    if (!offDuty && !night && canJoin(e) && Math.random() < 0.45) {
      for (const ty of ['salvage', 'drill', 'mine', 'hunt']) {
        const o = outingOf(e, ty, (g) => (ty === 'salvage' ? g.scrap > 0 && !g.gone : ty === 'drill' ? g.amount > 0 && !g.gone : ty === 'hunt' ? g.alive : true));
        if (o && Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z) < 60) { const t = Object.assign({}, o.crew.task, { step: 0, t: 0, buddy: o, helper: true }); return t; }
      }
      if (Math.random() < 0.35) {
        const wr = World.wrecks.filter((w) => w.scrap > 0 && !w.gone && Math.hypot(w.x, w.z) < 200).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
        if (wr) return expedition(e, { type: 'salvage', step: 0, wreck: wr, t: 0, helper: true });
      }
    }
    // kasulikud toaesemed (kohvimasin, laskemoonapress, raadio …)
    if (typeof Gadgets !== 'undefined') { const g = Gadgets.crewChoice(e); if (g) return g; }
    // vaba aeg: inimlikud tegevused
    const h = Econ.hour(), r = Math.random();
    { const lc = leisureChoice(e); if (lc) return lc; }
    // päikeseloojang
    if (h > 17.2 && h < 19.6 && r < 0.35 && c.trait !== 'argpyks') return { type: 'sunset', step: 0, t: rand(14, 26) };
    // seiklemine: uurib ümbrust (päeval, hea tujuga)
    if (!night && c.morale > 35 && r < 0.7 && c.trait !== 'argpyks' && !Ents.list.some((q) => q.alive && q.kind === 'human' && q.team !== 'crew' && q.team !== 'neutral' && Math.hypot(q.pos.x, q.pos.z) < 140)) return { type: 'explore', step: 0, t: rand(8, 14) };
    // vaba aeg: teler õhtuti, trenn, muusika, diivan
    if (hr > 18.5 && Math.random() < 0.45) { const tv = nearestObj(e, 'teler', (o) => o.on); if (tv) return { type: 'leisure', step: 0, obj: tv, t: rand(20, 40) }; }
    if ((c.role === 'valvur' || c.role === 'jahimees' || c.trait === 'tugev') && Math.random() < 0.35) { const g = nearestObj(e, 'trenn'); if (g) return { type: 'leisure', step: 0, obj: g, t: rand(15, 25) }; }
    const opts = ['jukebox', 'diivan', 'laud', 'taim', 'teler', 'trenn'].map((t) => nearestObj(e, t)).filter(Boolean);
    if (opts.length && Math.random() < 0.7) return { type: 'leisure', step: 0, obj: pick(opts), t: rand(10, 25) };
    return { type: 'wander', step: 0, t: rand(4, 9) };
  }

  // vabad kaitsepostid: torn > kuulipildujapesa > vallikäik
  function freePost(e) {
    const order = ['torn', 'kmpesa', 'vallikaik'];
    for (const ty of order) {
      const list = Base.objsOfType(ty).filter((o) => !o.data.manned || o.data.manned === e.id || !members().some((m) => m.id === o.data.manned && m.crew.task && m.crew.task.type === 'post'));
      if (!list.length) continue;
      list.sort((a, b) => Math.hypot(a.cx - e.pos.x, a.cz - e.pos.z) - Math.hypot(b.cx - e.pos.x, b.cz - e.pos.z));
      list[0].data.manned = e.id;
      return list[0];
    }
    return null;
  }
  // toa tüübid esemete järgi
  let rtCache = null, rtT = -1;
  function roomTypes() {
    if (rtCache && G.time.total - rtT < 2) return rtCache;
    // toa ülesanne määratakse ehitusmenüüst; boonus kehtib ainult siis, kui toas on ainult õiged asjad
    const out = new Map();
    for (const rid of Base.roomJob.keys()) { const st = Base.roomJobStatus(rid); if (st && st.ok) out.set(rid, st.def.name); }
    if (rtCache) for (const [rid, n] of out) if (rtCache.get(rid) !== n) { const st = Base.roomJobStatus(rid); UI.msg('Room job active: ' + n + '. ' + st.def.bonus, 'good'); }
    rtCache = out; rtT = G.time.total;
    return out;
  }
  const hasRoomJob = (name) => [...roomTypes().values()].includes(name);
  const roomJobOf = (o) => { const n = roomTypes().get(Base.roomAt(o.i, o.j)); return n || null; };
  function roomTypeAt(x, z) { const c = Base.toCell(x, z); return roomTypes().get(Base.roomAt(c.i, c.j)) || null; }
  function crewAI(e, dt) {
    const c = e.crew; if (!c) return;
    if (e.inVehicle) return;   // istub bagis (Vehicles juhib)
    const sleeping = e.pose === 'lie';
    // vajadused
    if (c.thirst === undefined) c.thirst = 90;
    if (c.hygiene === undefined) { c.hygiene = 80; c.bladder = 80; c.rel = c.rel || {}; }
    c.hygiene = Math.max(0, c.hygiene - dt * (sleeping ? 0.03 : Base.isInside(e.pos.x, e.pos.z) ? 0.08 : 0.16) * (c.cleanUntil > G.time.total ? 0.5 : 1));
    c.bladder = Math.max(0, c.bladder - dt * (sleeping ? 0.05 : 0.2));
    if (c.hygiene < 15) c.morale = Math.max(0, c.morale - dt * 0.02);
    // jutumullid: aeg-ajalt ütleb midagi oma oleku kohta
    e._say = (e._say || rand(20, 60)) - dt;
    if (e._say <= 0 && !sleeping) { e._say = rand(35, 90); const line = sayLine(e); if (line) UI.bubble && UI.bubble(e, line); }
    c.hunger = Math.max(0, c.hunger - dt * (sleeping ? 0.12 : 0.26));
    c.thirst = Math.max(0, c.thirst - dt * (sleeping ? 0.1 : (Base.isInside(e.pos.x, e.pos.z) ? 0.3 : 0.45)));
    if (c.thirst <= 0) c.morale = Math.max(0, c.morale - dt * 0.04);
    // järgnemise lõpp: väsimus, nälg, janu, mängija kadunud
    if (c.follow) {
      const why = leaderGone(c) ? null : c.energy < 8 ? 'is too tired' : c.hunger < 12 ? 'is too hungry' : c.thirst < 12 ? 'is thirsty' : null;
      if (leaderGone(c) || why) { c.follow = false; c.leader = null; if (why) UI.toast(c.name.split(' ')[0] + ' ' + why + ' and heads back to the base'); if (c.task && c.task.type === 'follow') c.task.done = true; }
    }
    // pea liigub elavalt (ringi vaatamine), kui ei sihi
    if (e.downed) { downedTick(e, dt); return; }
    lifeTick(e, c, dt);
    if (e.downed) return;
    if ((!e.aim || e.aim < 0.1) && lookTick(e, dt)) { /* pilk suunatud */ }
    else if (e.pose === 'lie') e.headYaw = lerp(e.headYaw || 0, 0, Math.min(1, dt * 3));
    else if (!e.aim || e.aim < 0.1) { e._look = (e._look || 0) - dt; if (e._look <= 0) { e._look = rand(1.5, 5); e._lookTo = Math.random() < 0.4 ? 0 : rand(-0.8, 0.8); } e.headYaw = lerp(e.headYaw || 0, e._lookTo || 0, Math.min(1, dt * 2.5)); }
    else e.headYaw = lerp(e.headYaw || 0, 0, Math.min(1, dt * 6));
    if (!sleeping && roomTypeAt(e.pos.x, e.pos.z) === 'Rec room') c.morale = Math.min(100, c.morale + dt * 0.05);   // puhketuba
    c.energy = clamp(c.energy + (sleeping ? dt * 0.9 * (roomTypeAt(e.pos.x, e.pos.z) === 'Barracks' ? 1.3 : 1) : -dt * 0.2), 0, 100);
    if (c.hunger <= 0) c.morale = Math.max(0, c.morale - dt * 0.03);
    if (G.flags.music && Base.isInside(e.pos.x, e.pos.z) && Base.objsOfType('jukebox').some((o) => o.on)) c.morale = Math.min(100, c.morale + dt * 0.02);
    if (!e.threat && e.hp < e.maxHp && Base.isInside(e.pos.x, e.pos.z)) e.hp = Math.min(e.maxHp, e.hp + dt * (Base.objsOfType('ravila').some((o) => o.on) ? 2.5 : 0.8) * (roomTypeAt(e.pos.x, e.pos.z) === 'Infirmary' ? 1.6 : 1));
    // ohud
    if (e.cool > 0) e.cool -= dt;
    e.scanT -= dt;
    if (e.scanT <= 0) {
      e.scanT = 0.45 + Math.random() * 0.3;
      const range = (c.role === 'valvur' ? 46 : 26) * (e.onPost === 'torn' ? 1.8 : e.onPost ? 1.3 : 1);
      e.threat = findThreat(e.pos.x, e.pos.y + 1.4, e.pos.z, range, 'crew');
      if (e.threat && sleeping && Math.hypot(e.threat.pos.x - e.pos.x, e.threat.pos.z - e.pos.z) > 14) e.threat = null;
    }
    const t = e.threat;
    if (t && targetAlive(t) && !e.leaving) {
      if (sleeping) wakeUp(e);
      e.gesture = null; if (e.pose === 'sit') e.pose = 'stand';
      if ((c.trait === 'argpyks' && c.role !== 'valvur') || (e.hp < e.maxHp * 0.3 && c.role !== 'valvur')) {
        setAct(e, 'Running to hide');
        if (!Base.isInside(e.pos.x, e.pos.z)) { const h = homeTarget(e); if (h && (!e.path || Ents.arrived(e))) goObj(e, h); Ents.stepMove(e, dt, speedOf(e) * 1.4); }
        e.aim = Math.max(0, e.aim - dt * 3);
        return;
      }
      const tp = targetPoint(t), d = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
      setAct(e, 'Shooting');
      e.hasGun = true; e.prop = null; e.dance = 0; e.lunge2 = 0;
      if (c.task && (c.task.type === 'gchat' || c.task.type === 'argue')) { leaveGroup(e); c.task.done = true; }
      Ents.face(e, tp.x, tp.z, dt, 10);
      if (combatTick(e, c, t, tp, d, dt)) { if (!e.onPost) c.task = null; return; }
      e.aim = Math.min(1, e.aim + dt * 4);
      e.aimPitch = Math.atan2(tp.y - (e.pos.y + 1.35), d);
      if (c.role === 'valvur' && d > 22 && !e.onPost) { if (!e.path || Ents.arrived(e) || Math.random() < dt) { e.path = [{ x: tp.x, z: tp.z }]; e.pathI = 0; } Ents.stepMove(e, dt, speedOf(e) * 1.2); }
      else e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
      if (e.cool <= 0 && Math.abs(angDiff(e.yaw, Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z))) < 0.3) {
        const mg = e.onPost === 'kmpesa' && (G.stash.ammo_r || 0) > 0;
        if (mg) { G.stash.ammo_r--; fireAt(e, t, 9, crewAcc(c) * 1.1, 'lmg'); e.cool = rand(0.1, 0.14); }
        else { fireAt(e, t, crewDmg(c), crewAcc(c) * (e.onPost === 'torn' ? 1.3 : 1), 'turret'); e.cool = (c.role === 'valvur' ? rand(0.45, 0.6) : rand(0.7, 1.0)) * ((e._coverBoost || 0) > now() ? 0.55 : 1); e.ammo = (e.ammo || 1) - 1; }
      }
      if (!e.onPost) c.task = null;
      return;
    }
    e.aim = Math.max(0, e.aim - dt * 2.5);
    if (e._lastThreat) { e._lastThreat = null; e.coverPt = null; e.panicT = 0; e.reloadT = 0; if (Math.random() < 0.5) say(e, pick(['Clear!', 'Area clear.', 'Got it.']), 4); }
    e.crouch = Math.max(0, (e.crouch || 0) - dt * 2);
    if (e.ammo !== undefined && e.ammo < 8) e.ammo = undefined;
    if (e.hp < e.maxHp * 0.3 && !Base.isInside(e.pos.x, e.pos.z) && (!c.task || c.task.type !== 'home')) {
      c.task = { type: 'home', step: 0 }; UI.toast(c.name.split(' ')[0] + ' is wounded and falling back to the base');
    }
    { const wi = Waves.info(); if (wi && !wi.none && !wi.done && wi.warned && c.task && !['post', 'vgun', 'shelter', 'follow', 'home'].includes(c.task.type)) { if (sleeping) wakeUp(e); e.gesture = null; c.task.done = true; } }
    if (c.task && e.stuckN > 6) { e.stuckN = 0; if (e.pose !== 'lie') e.pose = 'stand'; c.task.done = true; }
    if (!c.task || c.task.done) {
      e.gesture = null; e.aimPitch = 0; e.dance = 0; e.lunge2 = 0;
      if (c.task && c.task.type === 'gchat') leaveGroup(e);
      if (c.task && c.task.type !== 'eat') e.prop = null;
      c.task = chooseTask(e);
    }
    runTask(e, dt);
  }

  // ============ uued tegevused (elutruu käitumine) ============
  function lifeTasks(e, dt) {
    const c = e.crew, k = c.task, sp = speedOf(e);
    switch (k.type) {
      case 'wake': { e.moveAmt = 0; e.hasGun = false; e.gesture = 'tired'; setAct(e, 'Stretching'); k.t -= dt; if (k.t <= 0) k.done = true; return true; }
      case 'rescue': {
        const v = k.target;
        if (!v || !v.alive || !v.downed) { if (v) v.dragBy = null; k.done = true; return true; }
        e.hasGun = false;
        if (k.step === 0) { Ents.goTo(e, v.pos.x, v.pos.z); k.step = 1; setAct(e, 'Running to ' + first(v)); say(e, pick(['Hang on, ' + first(v) + '!', 'I\'ve got you!', 'Stay with me!']), 3); }
        else if (k.step === 1) {
          if (Math.random() < dt * 2) Ents.goTo(e, v.pos.x, v.pos.z);
          Ents.stepMove(e, dt, sp * 1.4);
          if (Math.hypot(v.pos.x - e.pos.x, v.pos.z - e.pos.z) < 1.6) {
            k.step = 2; v.dragBy = e; v.treated = false;
            const o = nearestObj(e, 'ravila') || homeTarget(e);
            if (o) goObj(e, o); else Ents.goTo(e, 0, 0);
          }
        } else {
          setAct(e, 'Dragging ' + first(v) + ' to safety'); e.gesture = 'carry';
          const done = Ents.stepMove(e, dt, sp * 0.45);
          if (done || (Base.isInside(e.pos.x, e.pos.z) && Ents.arrived(e))) {
            v.dragBy = null; v.treated = true; v.hp = Math.max(v.hp, v.maxHp * 0.2);
            if (c.role === 'arst' || Base.objsOfType('ravila').some((o) => o.on)) v.hp = Math.max(v.hp, v.maxHp * 0.42);
            say(e, 'You\'re safe now.', 0); k.done = true;
          }
        }
        return true;
      }
      case 'arm': {
        const o = k.obj; if (!o || !Base.objs.has(o.id)) { k.done = true; return true; }
        if (k.step === 0) { if (!goObj(e, o)) { k.done = true; return true; } k.step = 1; setAct(e, 'Running to the gun locker'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 1.3)) { k.step = 2; k.t = 0; } }
        else { e.hasGun = false; Ents.face(e, o.cx, o.cz, dt); e.gesture = 'interact'; setAct(e, 'Grabbing a weapon'); k.t += dt; if (k.t > 1.6) { c.armedT = now(); e.ammo = undefined; say(e, pick(['Locked and loaded.', 'Got my rifle.', 'Ready!']), 2); k.done = true; } }
        return true;
      }
      case 'standby': {
        const wi = Waves.info(); if (!wi || wi.none || wi.done) { k.done = true; return true; }
        const o = k.obj; if (!o || !Base.objs.has(o.id)) { k.done = true; return true; }
        if (k.step === 0) { if (!goObj(e, o)) { k.done = true; return true; } k.step = 1; setAct(e, 'Preparing the medical bay'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 1.2)) k.step = 2; }
        else {
          e.moveAmt = 0; e.hasGun = false; setAct(e, 'Standing by for wounded');
          e.gesture = Math.sin(now() * 0.4 + e.id) > 0.3 ? 'interact' : 'fold';
          const hurt = members().find((m) => m !== e && (m.downed || m.hp < m.maxHp * 0.6) && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 40);
          if (hurt) { c.task = hurt.downed && !hurt.dragBy ? { type: 'rescue', step: 0, target: hurt } : { type: 'heal', step: 0, target: hurt, t: 0 }; hurt.rescuer = e; }
        }
        return true;
      }
      case 'gchat': {
        const g = k.g;
        if (!g || !g.mem.includes(e) || g.mem.length < 2) { leaveGroup(e); e.gesture = null; k.done = true; return true; }
        groupTick(g, dt);
        const s = groupSlot(g, e);
        if (k.step === 0) { e.hasGun = false; Ents.goTo(e, s.x, s.z); k.step = 1; k.mt = 0; setAct(e, 'Joining a chat'); }
        else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, sp * 0.8) || Math.hypot(s.x - e.pos.x, s.z - e.pos.z) < 0.5 || k.mt > 20) { Ents.stopMove(e); k.step = 2; k.g2 = 0; } }
        else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
          const spk = g.spk && g.spk !== e ? g.spk : null;
          Ents.face(e, spk ? spk.pos.x : g.cx, spk ? spk.pos.z : g.cz, dt, 3);
          k.g2 -= dt;
          if (g.spk === e) { if (k.g2 <= 0) { k.g2 = rand(1.5, 3); e.gesture = pick(['talk', 'talk', 'no', 'yes', 'fold']); } }
          else if (g.laughT > 0 && Math.random() < 0.5) e.gesture = 'cheer';
          else if (k.g2 <= 0) { k.g2 = rand(2, 4); e.gesture = pick(['fold', null, 'yes', 'look']); }
          const names = g.mem.filter((m) => m !== e).map(first).join(', ');
          setAct(e, 'Chatting with ' + names);
          c.morale = Math.min(100, c.morale + dt * 0.07);
          for (const m of g.mem) if (m !== e) c.rel[m.id] = Math.min(100, (c.rel[m.id] || 0) + dt * 0.12);
          k.t -= dt; if (k.t <= 0) { e.gesture = null; leaveGroup(e); k.done = true; }
        }
        return true;
      }
      case 'argue': {
        const p = k.with, pk = p && p.crew && p.crew.task;
        if (!p || !p.alive || !pk || pk.type !== 'argue' || pk.with !== e) { e.gesture = null; e.lunge2 = 0; k.done = true; return true; }
        if (k.step === 0) { e.hasGun = false; const a = Math.atan2(p.pos.x - e.pos.x, p.pos.z - e.pos.z); Ents.goTo(e, (e.pos.x + p.pos.x) / 2 - Math.sin(a) * 0.6, (e.pos.z + p.pos.z) / 2 - Math.cos(a) * 0.6); k.step = 1; k.mt = 0; }
        else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, sp) || Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z) < 1.4 || k.mt > 20) { Ents.stopMove(e); k.step = 2; k.w = 0; } }
        else {
          e.moveAmt = 0; Ents.face(e, p.pos.x, p.pos.z, dt, 5); k.w += dt; k.t -= dt;
          if (!k.fight) {
            setAct(e, 'Arguing with ' + first(p));
            e.gesture = Math.sin(k.w * 2.3 + e.id) > 0 ? 'no' : 'shake';
            if (Math.random() < dt * 0.5) say(e, pick(['You always do this!', 'Stay out of my way!', 'Say that again!', 'You stole my rations!', 'Get lost!']), 3);
            if (k.w > 5 && k.side > 0 && !k.rolled) { k.rolled = true; if ((c.morale < 40 || c.trait === 'tapne') && Math.random() < 0.5) { k.fight = pk.fight = true; k.t = pk.t = 7; say(e, 'That\'s it!', 0); for (const m of members()) if (m !== e && m !== p && !m.threat && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 20 && m.pose !== 'lie') { if (m.crew.task) m.crew.task.done = true; leaveGroup(m); m.crew.task = { type: 'separate', step: 0, a: e, b: p, t: 8 }; } } }
          } else {
            setAct(e, 'Fighting with ' + first(p)); e.gesture = null;
            e.lunge2 = Math.max(0, Math.sin(k.w * 5.5 + e.id * 1.3));
            if (e.lunge2 > 0.97 && Math.random() < 0.5) { p.hp = Math.max(p.maxHp * 0.3, p.hp - 2); Audio2.hit && Audio2.hit(); }
          }
          if (k.t <= 0) {
            e.gesture = null; e.lunge2 = 0; k.done = true; pk.done = true; p.lunge2 = 0;
            c.rel[p.id] = (c.rel[p.id] || 0) - (k.fight ? 25 : 8); c.morale = Math.max(0, c.morale - (k.fight ? 8 : 3));
            if (k.fight && k.side > 0) UI.msg(c.name + ' and ' + p.crew.name + ' got into a fistfight.', 'warn');
          }
        }
        return true;
      }
      case 'separate': {
        const a = k.a, b = k.b;
        if (!a || !b || !a.alive || !b.alive || !a.crew.task || a.crew.task.type !== 'argue') { e.gesture = null; k.done = true; return true; }
        const mx = (a.pos.x + b.pos.x) / 2, mz = (a.pos.z + b.pos.z) / 2;
        if (Math.hypot(mx - e.pos.x, mz - e.pos.z) > 1.2) { if (!e.path || Ents.arrived(e) || Math.random() < dt) Ents.goTo(e, mx + rand(-0.4, 0.4), mz + rand(-0.4, 0.4)); Ents.stepMove(e, dt, sp * 1.3); setAct(e, 'Breaking up a fight'); say(e, pick(['Hey! Break it up!', 'Stop it, both of you!', 'Enough!']), 4); }
        else { e.moveAmt = 0; e.hasGun = false; e.gesture = 'no'; Ents.face(e, a.pos.x, a.pos.z, dt, 4); k.t -= dt; if (k.t < 4) { a.crew.task.t = Math.min(a.crew.task.t, 0.5); if (b.crew.task) b.crew.task.t = Math.min(b.crew.task.t, 0.5); } }
        return true;
      }
      case 'party': {
        if (Econ.hour() > 22.3 || Econ.hour() < 12) { e.dance = 0; k.done = true; return true; }
        if (k.step === 0) { e.hasGun = false; const o = k.obj; if (o && goObj(e, o)) k.step = 1; else { const cc = freeRoomCell(); if (cc) Ents.goTo(e, cc.x, cc.z); k.step = 1; } setAct(e, 'Going to the party'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.g2 = 0; Ents.stopMove(e); } }
        else {
          e.moveAmt = 0; e.hasGun = false; k.g2 -= dt; k.t -= dt;
          if (k.g2 <= 0) { k.g2 = rand(3, 7); k.mode = pick(['dance', 'dance', 'cheer', 'drink', 'talk']); if (Math.random() < 0.3) say(e, pick(['Woo!', 'To us!', 'Best day on this rock!', 'Turn it up!', 'Cheers!']), 5); }
          e.dance = k.mode === 'dance' ? 1 : 0; e.gesture = k.mode === 'dance' ? null : k.mode;
          e.prop = k.mode === 'drink' ? 'cup' : null;
          if (k.mode === 'dance') e.yaw += dt * 0.8 * Math.sin(now() * 0.5 + e.id);
          setAct(e, 'Celebrating'); c.morale = Math.min(100, c.morale + dt * 0.12);
          if (k.t <= 0) { e.dance = 0; e.prop = null; k.done = true; }
        }
        return true;
      }
      case 'quiet': {
        if (k.step === 0) { e.hasGun = false; const o = k.obj; if (o && goObj(e, o)) k.step = 1; else { const cc = freeRoomCell(); if (cc) Ents.goTo(e, cc.x, cc.z); k.step = 1; } setAct(e, 'A quiet evening'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 0.7)) { k.step = 2; if (k.obj && (k.obj.type === 'diivan' || k.obj.type === 'laud')) e.pose = 'sit'; } }
        else { e.moveAmt = 0; k.t -= dt; if (k.gs === undefined) k.gs = e.pose === 'sit' ? 'sit' : pick(['groundSit', 'sad', 'fold']); e.gesture = k.gs; setAct(e, 'Sitting quietly'); if (k.t <= 0) { e.pose = 'stand'; k.done = true; } }
        return true;
      }
      case 'grave': {
        const g = k.grave;
        if (k.step === 0) { e.hasGun = false; Ents.goTo(e, g.x + rand(-1.2, 1.2), g.z + rand(-1.2, 1.2)); k.step = 1; k.mt = 0; setAct(e, 'Visiting ' + g.name.split(' ')[0] + '\'s memorial'); }
        else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, sp * 0.6) || k.mt > 35) k.step = 2; }
        else { e.moveAmt = 0; Ents.face(e, g.x, g.z, dt, 2); e.gesture = 'sad'; setAct(e, 'Remembering ' + g.name.split(' ')[0]); k.t -= dt; if (k.t <= 0) { c.morale = Math.min(100, c.morale + 4); k.done = true; } }
        return true;
      }
      case 'gather': case 'inspect': case 'warm': case 'tidy': case 'slack': {
        const o = k.obj; if (o && !Base.objs.has(o.id)) { k.done = true; return true; }
        if (k.type === 'gather' && Base.power.lightsOn) { if (k.step === 2) say(e, pick(['Lights are back!', 'Finally.']), 5); k.done = true; return true; }
        if (k.step === 0) {
          if (o) { if (!goObj(e, o)) { k.done = true; return true; } } else { const cc = freeRoomCell(); if (cc) Ents.goTo(e, cc.x, cc.z); else { k.done = true; return true; } }
          k.step = 1; k.mt = 0; setAct(e, { gather: 'Going to the generator', inspect: 'Going to look at the damage', warm: 'Going to the stove', tidy: 'Tidying up', slack: 'Sneaking off' }[k.type]);
        } else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, k.type === 'gather' ? sp * 1.1 : sp * 0.85) || k.mt > 30) { k.step = 2; k.w = 0; if (k.type === 'slack' && o && o.type === 'diivan') e.pose = 'sit'; } }
        else {
          e.moveAmt = 0; e.hasGun = false; k.w += dt; k.t -= dt;
          if (o) Ents.face(e, o.cx, o.cz, dt, 2);
          if (k.type === 'gather') { setAct(e, 'Waiting by the generator'); e.gesture = c.role === 'insener' ? 'fix' : pick2(e, ['look', 'fold', 'talk']); if (c.role !== 'insener' && Math.random() < dt * 0.15) say(e, pick(['Who turned off the lights?', 'Is it fixable?', 'Hurry up with that…']), 9); }
          else if (k.type === 'inspect') { setAct(e, 'Inspecting the damage'); e.gesture = k.w < 3 ? 'look' : 'shake'; if (k.w > 1 && !k.said) { k.said = true; say(e, pick(['That\'s a nasty hole.', 'They really chewed this up.', 'Engineer needs to see this.']), 3); } }
          else if (k.type === 'warm') { setAct(e, 'Warming up by the stove'); e.gesture = 'fold'; c.morale = Math.min(100, c.morale + dt * 0.04); }
          else if (k.type === 'tidy') { setAct(e, 'Tidying up'); e.gesture = Math.sin(k.w * 0.8) > 0 ? 'interact' : 'fix'; }
          else {
            setAct(e, 'Slacking off'); e.gesture = e.pose === 'sit' ? 'sit' : 'groundSit';
            if (Math.hypot(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z) < 7 && !Player.dead) { e.pose = 'stand'; say(e, pick(['I was just… taking a short break!', 'Back to work, boss, right away!']), 0); k.done = true; return true; }
          }
          if (k.t <= 0) { e.pose = 'stand'; k.done = true; }
        }
        return true;
      }
      case 'perimeter': {
        e.hasGun = true;
        if (k.step === 0) { k.pts = []; const R = Math.max(17, Base.bounds() + 8), a0 = rand(0, TAU); for (let i = 0; i < 4; i++) { const a = a0 + i * TAU / 4; k.pts.push({ x: Math.cos(a) * R, z: Math.sin(a) * R }); } k.i = 0; k.step = 1; Ents.goTo(e, k.pts[0].x, k.pts[0].z); setAct(e, 'Checking the perimeter'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 0.8)) { k.step = 2; k.w = 0; } }
        else { e.moveAmt = 0; k.w += dt; const p = k.pts[k.i]; Ents.face(e, p.x * 3, p.z * 3, dt, 1.5); e.gesture = k.w < 2.5 ? 'look' : null; setAct(e, 'Scanning the horizon'); if (k.w > 4) { k.i++; if (k.i >= k.pts.length) { k.done = true; return true; } Ents.goTo(e, k.pts[k.i].x, k.pts[k.i].z); k.step = 1; } }
        return true;
      }
      case 'approach': {
        if (Player.dead || G.mode !== 'play') { k.done = true; return true; }
        const d = Math.hypot(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z);
        k.mt = (k.mt || 0) + dt; if (k.mt > 40) { k.done = true; return true; }
        if (d > 2.6) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 1.5) Ents.goTo(e, Player.pos.x, Player.pos.z); Ents.stepMove(e, dt, sp); setAct(e, 'Looking for the boss'); }
        else {
          Ents.stopMove(e); e.moveAmt = 0; e.hasGun = false; Ents.face(e, Player.pos.x, Player.pos.z, dt, 4); k.w = (k.w || 0) + dt;
          if (!k.said) { k.said = true; c.lastBoss = now(); say(e, k.good ? pick(['Boss, just wanted to say — thanks. Good place to work.', 'Hey boss! Things are going great!']) : c.unpaid ? 'Boss… where is my pay?' : c.bed ? pick(['Boss, I\'m worn out. Can we talk?', 'Nobody listens to me here.', 'I need some time off, boss.']) : 'Boss, I don\'t even have a bed!', 0); e.gesture = k.good ? 'cheer' : 'shake'; }
          setAct(e, 'Talking to you'); if (k.w > 4) { e.gesture = null; k.done = true; }
        }
        return true;
      }
    }
    return false;
  }
  function pick2(e, arr) { return arr[Math.floor((now() * 0.25 + e.id * 0.37)) % arr.length]; }
  const PROP_OF = { repair: 'wrench', craft: 'wrench', salvage: 'wrench', mine: 'cutter', cook: 'ladle', scan: 'tablet', refine: 'tablet', heal: 'medkit', drink: 'cup', tidy: 'wrench', standby: 'medkit' };
  function propFor(e) {
    const c = e.crew, k = c.task;
    if (!k || k.type === 'eat' || k.type === 'party') return;
    const want = k.step === 2 || k.type === 'heal' ? PROP_OF[k.type] : null;
    if (want && !e.hasGun && !(k.type === 'drink' && k.t < 0.8)) e.prop = want;
    else if (e.torch) { e.prop = 'flashlight'; e.hasGun = false; }
    else e.prop = null;
  }
  // vestlusrühm: liitu olemasolevaga või loo uus
  function startGroup(e) {
    const c = e.crew;
    leaveGroup(e);
    for (const g of groups) if (g.mem.length < 4 && g.mem.length >= 2 && !g.mem.includes(e) && Math.hypot(g.cx - e.pos.x, g.cz - e.pos.z) < 25 && !g.mem.some((m) => (c.rel[m.id] || 0) < -30)) {
      g.mem.push(e); g.a0 += 0.01;
      return { type: 'gchat', step: 0, g, t: rand(14, 28) };
    }
    const free = members().filter((m) => m !== e && m.pose !== 'lie' && !m.threat && !m.downed && !m.crew.follow && (!m.crew.task || m.crew.task.done || m.crew.task.type === 'wander' || m.crew.task.type === 'leisure') && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 30);
    if (!free.length) return null;
    free.sort((a, b) => ((c.rel[b.id] || 0) - (c.rel[a.id] || 0)));
    const p = Math.random() < 0.65 ? free[0] : pick(free);
    // vaenlased tülitsevad
    if ((c.rel[p.id] || 0) < -30 || (p.crew.rel[e.id] || 0) < -30 || ((c.morale < 30 || c.hygiene < 15) && Math.random() < 0.3)) {
      if (p.pose === 'sit') p.pose = 'stand';
      const dur = rand(9, 14); leaveGroup(p);
      p.crew.task = { type: 'argue', step: 0, with: e, t: dur, side: -1 };
      return { type: 'argue', step: 0, with: p, t: dur, side: 1 };
    }
    if (p.pose === 'sit') p.pose = 'stand';
    let cx = (e.pos.x + p.pos.x) / 2, cz = (e.pos.z + p.pos.z) / 2;
    if (Base.isInside(cx, cz)) { const cc = Base.toCell(cx, cz); if (Base.objAt(cc.i, cc.j)) { const f = freeRoomCell(); if (f) { cx = f.x; cz = f.z; } } }
    const g = { cx, cz, a0: rand(0, TAU), mem: [e, p], spk: null, spkT: 0, laughT: 0 };
    groups.push(g);
    const dur = rand(14, 28);
    p.crew.task = { type: 'gchat', step: 0, g, t: dur };
    return { type: 'gchat', step: 0, g, t: dur };
  }
  // lisavalikud chooseTask'i jaoks; tagastab ülesande või null
  function lifeChoice(e) {
    const c = e.crew, hr = Econ.hour(), night = Econ.isNight(), r = Math.random();
    // päästmine: keegi on maas
    const dn = members().find((m) => m !== e && m.downed && !m.dragBy && (!m.rescuer || !m.rescuer.alive || !m.rescuer.crew || !m.rescuer.crew.task || m.rescuer.crew.task.target !== m) && Math.hypot(m.pos.x - e.pos.x, m.pos.z - e.pos.z) < 90);
    if (dn && (c.trait !== 'argpyks' || c.role === 'arst')) { dn.rescuer = e; return { type: 'rescue', step: 0, target: dn }; }
    // elektrikatkestus: kogunetakse generaatori juurde
    if (!Base.power.lightsOn && (night || hr > 17) && r < 0.6) {
      const gen = nearestObj(e, 'generaator') || nearestObj(e, 'vanagen');
      if (gen) return { type: 'gather', step: 0, obj: gen, t: rand(15, 30) };
    }
    return null;
  }
  function leisureChoice(e) {
    const c = e.crew, hr = Econ.hour(), night = Econ.isNight(), r = Math.random(), mood = dayMood();
    // lein ja mälestusmärgi külastus
    if (c.mournUntil >= G.time.day && G.flags.graves && G.flags.graves.length && !night && r < 0.25) return { type: 'grave', step: 0, grave: G.flags.graves[G.flags.graves.length - 1], t: rand(10, 18) };
    // õhtu: pidu heal päeval, vaikus halval
    if (hr > 19.5 && hr < 22) {
      if (mood > 0 && r < 0.6) { const jb = nearestObj(e, 'jukebox', (o) => o.on) || nearestObj(e, 'laud'); return { type: 'party', step: 0, obj: jb, t: rand(25, 50) }; }
      if (mood < 0 && r < 0.6) { const o = nearestObj(e, 'diivan') || nearestObj(e, 'laud'); return { type: 'quiet', step: 0, obj: o, t: rand(20, 40) }; }
    }
    // mängija poole pöördumine, kui ta pole ammu kohal olnud
    if (!Player.dead && Math.hypot(Player.pos.x, Player.pos.z) < 60 && now() - (c.lastBoss || 0) > 240 && (c.morale < 40 || c.morale > 88 || c.unpaid || !c.bed) && r < 0.35) { c.lastBoss = now(); return { type: 'approach', step: 0, good: c.morale > 88 && !c.unpaid && c.bed }; }
    // öösel soojendatakse pliidi juures
    if (night && r < 0.3) { const st = nearestObj(e, 'pliit', (o) => o.on); if (st) return { type: 'warm', step: 0, obj: st, t: rand(12, 22) }; }
    // kahjustuste uudistamine
    if (r < 0.25) { const dmg = [...Base.objs.values()].find((o) => o.maxHp && o.hp < o.maxHp * 0.7); if (dmg && !dmg._insp) { dmg._insp = true; setTimeout(() => { dmg._insp = false; }, 60000); return { type: 'inspect', step: 0, obj: dmg, t: rand(5, 8) }; } }
    // koristamine
    if (r < 0.1) { const objs = [...Base.objs.values()].filter((o) => Base.isInside(o.cx, o.cz)); if (objs.length) return { type: 'tidy', step: 0, obj: pick(objs), t: rand(6, 12) }; }
    // rühmavestlus / tüli
    if (Math.random() < 0.55) { const t = startGroup(e); if (t) return t; }
    return null;
  }
  function runTask(e, dt) {
    if (!lifeTasks(e, dt)) runTask0(e, dt);
    propFor(e);
  }
  function runTask0(e, dt) {
    const c = e.crew, k = c.task;
    if (e.path && !Ents.arrived(e)) e.gesture = null;
    const sp = speedOf(e);
    k.t = (k.t || 0);
    switch (k.type) {
      case 'sleep': {
        if (!isSleepTime(c) && c.energy > 60) {
          const was = e.pose === 'lie'; wakeUp(e); k.done = true;
          if (was) { c.task = { type: 'wake', step: 2, t: rand(2, 3.5) }; say(e, c.role === 'valvur' ? 'Taking over the watch.' : pick(['Morning…', '*yawn*', 'Coffee. Need coffee.', null]), 0); }
          return;
        }
        if (k.step === 0 && !k.pre) {
          k.pre = 1; k.pt = rand(2, 3);
          if (c.role === 'valvur') { const o = members().find((m) => m !== e && m.crew.role === 'valvur' && m.pose !== 'lie'); say(e, o ? first(o) + ', your shift. Wake me if anything moves.' : 'Shift\'s over. Somebody keep an eye out.', 0); }
          else if (Math.random() < 0.5) say(e, pick(['Good night, everyone.', 'I\'m beat.', 'Night.']), 0);
        }
        if (k.step === 0 && k.pt > 0) { k.pt -= dt; e.moveAmt = 0; e.hasGun = false; e.gesture = 'tired'; setAct(e, 'Getting ready for bed'); return; }
        if (k.step === 0) {
          e.hasGun = false;
          let bed = c.bed ? Base.objs.get(c.bed.obj) : null;
          c.bedObj = bed;
          if (bed && goObj(e, bed)) { k.step = 1; setAct(e, 'Going to sleep'); }
          else { // põrandal
            const cc = freeRoomCell();
            if (cc) Ents.goTo(e, cc.x, cc.z);
            k.step = 1; k.floor = true; setAct(e, 'Looking for a place to sleep');
          }
        } else if (k.step === 1) {
          if (Ents.stepMove(e, dt, sp)) {
            k.step = 2;
            e.pose = 'lie';
            if (!k.floor && c.bedObj) {
              const b = c.bedObj;
              e.pos.x = b.cx; e.pos.z = b.cz; e.yaw = Base.objYaw(b);
              e.lieY = b.y + (b.type === 'nari' ? (c.bed.slot ? 1.45 : 0.45) : 0.55);
              setAct(e, 'Sleeping');
            } else { e.lieY = Ents.groundY(e.pos.x, e.pos.z, e.pos.y) + 0.07; setAct(e, 'Sleeping on the floor'); }
          }
        } else {
          e.moveAmt = 0;
        }
        return;
      }
      case 'eat': {
        if (k.step === 0) {
          e.hasGun = false;
          const src = nearestObj(e, 'pliit') || nearestObj(e, 'hoidla');
          k.src = src;
          if (src && goObj(e, src)) { k.step = 10; setAct(e, 'Getting food'); } else k.step = 12;
        } else if (k.step === 10) {
          if (Ents.stepMove(e, dt, sp)) { k.step = 11; k.w = 0; }
        } else if (k.step === 11) {
          e.moveAmt = 0; Ents.face(e, k.src.cx, k.src.cz, dt); e.gesture = 'interact'; setAct(e, 'Filling a bowl'); k.w += dt;
          if (k.w > 1.6) { e.gesture = null; k.step = 12; }
        } else if (k.step === 12) {
          e.prop = 'bowl';
          const tables = Base.objsOfType('laud');
          // eelista lauda, kus sõbrad juba istuvad
          let tb = null, best = -1e9;
          for (const t of tables) { let sc = Math.random() * 5; for (const m of members()) if (m !== e && m.crew.task && m.crew.task.type === 'eat' && m.crew.task.obj === t) sc += 10 + (c.rel[m.id] || 0) * 0.3; if (sc > best) { best = sc; tb = t; } }
          if (tb && goObj(e, tb)) { k.obj = tb; k.step = 1; setAct(e, 'Going to eat'); }
          else { k.step = 2; k.t = 0; }
        } else if (k.step === 20) {
          e.prop = 'bowl'; setAct(e, 'Returning the dishes');
          if (Ents.stepMove(e, dt, sp) || (k.mt = (k.mt || 0) + dt) > 20) { e.prop = null; k.done = true; }
        } else if (k.step === 1) {
          if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.t = 0; if (k.obj) { e.pose = 'sit'; Ents.face(e, k.obj.cx, k.obj.cz, 1, 1); } }
        } else {
          k.t += dt; setAct(e, k.obj ? 'Eating at a table' : 'Eating standing up'); e.hasGun = false; e.prop = 'bowl';
          e.gesture = k.obj ? (Math.floor(k.t / 2.5) % 3 === 1 ? 'sitTalk' : 'sit') : 'eat';
          if (k.obj && Math.random() < dt * 0.12) { const ln = memLine() || sayLine(e); if (ln) say(e, ln, 10); }
          if (k.t > 9) {
            if (G.res.food > 0) { G.res.food--; c.hunger = 100; c.morale = Math.min(100, c.morale + (k.obj ? (roomTypeAt(k.obj.cx, k.obj.cz) === 'Canteen' ? 6 : 3) : 0)); }
            else if (G.res.meat > 0) { G.res.meat--; c.hunger = 85; c.morale = Math.max(0, c.morale - 4); UI.toast(c.name.split(' ')[0] + ' is chewing raw meat'); }
            e.pose = 'stand';
            if (k.src && Base.objs.has(k.src.id) && goObj(e, k.src)) k.step = 20; else { e.prop = null; k.done = true; }
          }
        }
        return;
      }
      case 'patrol': {
        e.hasGun = true;
        if (k.step === 0) {
          const R = Math.max(16, Base.bounds() + 7);
          const a = rand(0, TAU);
          Ents.goTo(e, Math.cos(a) * R, Math.sin(a) * R); k.step = 1; setAct(e, 'Patrolling');
        } else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 0.8)) { k.step = 2; k.t = rand(4, 9); } }
        else { k.t -= dt; setAct(e, 'Guarding'); e.yaw += Math.sin(G.time.total * 0.7 + e.id) * dt * 0.6; if (k.t <= 0) k.done = true; }
        return;
      }
      case 'hunt': {
        e.hasGun = true;
        k.t += dt;
        const g = k.target;
        if (k.step < 3 && (k.t > 150 || Econ.isNight())) { k.step = 4; }
        if (k.step === 0 || k.step === 1) {
          if (!g || !g.alive) { if (g && (g.butcherable || g.harvestable)) { k.step = 2; Ents.goTo(e, g.pos.x, g.pos.z); } else k.done = true; return; }
          const d = Math.hypot(g.pos.x - e.pos.x, g.pos.z - e.pos.z);
          setAct(e, 'Hunting');
          if (d > 30) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.7) { e.path = [{ x: g.pos.x, z: g.pos.z }]; e.pathI = 0; } Ents.stepMove(e, dt, groupSpeed(e, k, sp * 1.25)); e.aim = 0; }
          else {
            const los = World.lineOfSight(e.pos.x, e.pos.y + 1.4, e.pos.z, g.pos.x, g.pos.y + 1, g.pos.z);
            k.noLos = los ? 0 : (k.noLos || 0) + dt;
            if (!los || d > 22) {   // ei näe (düün vahel) või liiga kaugel: hiili lähemale
              if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.8) { e.path = [{ x: g.pos.x, z: g.pos.z }]; e.pathI = 0; }
              Ents.stepMove(e, dt, sp * (los ? 0.6 : 0.9));
            } else e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
            Ents.face(e, g.pos.x, g.pos.z, dt, 8); e.aim = Math.min(1, e.aim + dt * 3);
            if (e.cool <= 0 && los) {
              fireAt(e, g, 14 * workMult(c), crewAcc(c) + 0.15, 'turret'); e.cool = rand(0.7, 1.1);
            }
          }
        } else if (k.step === 2) {
          if (!g || !(g.butcherable || g.harvestable)) { k.step = 4; return; }
          e.aim = 0; setAct(e, 'Butchering meat');
          if (Ents.stepMove(e, dt, sp)) { k.step = 3; k.t2 = 0; }
        } else if (k.step === 3) {
          k.t2 += dt; e.hasGun = false; e.gesture = 'fix'; if (Math.random() < 0.2) FX.goo(g.pos.x, g.pos.y + 0.4, g.pos.z, [0.5, 0.15, 0.12], 1);
          if (k.t2 > 2.5) { if (g.kind === 'alien') { c.carry = Aliens.harvest(g); c.carryKind = 'acid'; } else { c.carry = g.meat; c.carryKind = 'meat'; g.meat = 0; g.butcherable = false; g.remove = true; } k.step = 4; }
        } else {
          k.done = true;
        }
        return;
      }
      case 'mine': {
        e.hasGun = true;
        const s = k.site;
        const cap = c.trait === 'tugev' ? 16 : 8;
        if (k.step === 0) {
          const cl = s.clusters.filter((q) => q.amount > 0).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
          if (!cl) { k.done = true; return; }
          k.cl = cl; Ents.goTo(e, cl.x + rand(-1, 1), cl.z + rand(-1, 1)); k.step = 1; setAct(e, 'Heading to the comet');
        } else if (k.step === 1) {
          if (Ents.stepMove(e, dt, groupSpeed(e, k, sp * 1.1))) { k.step = 2; k.t = 0; }
          if (k.cl.amount <= 0) k.step = 0;
        } else if (k.step === 2) {
          setAct(e, 'Collecting diamonds'); e.gesture = 'mine';
          Ents.face(e, k.cl.x, k.cl.z, dt);
          e.hasGun = false;
          if (Math.random() < 0.3) FX.beam(e.pos.x, e.pos.y + 1.2, e.pos.z, k.cl.x, k.cl.y + 0.5, k.cl.z);
          k.t += dt * workMult(c);
          if (k.t > 2.4) {
            k.t = 0;
            const got = Comets.takeUnits(k.cl, 1);
            if (got) { c.carry += got; c.carryKind = 'kris'; Audio2.crystal(); }
            if (c.carry >= cap) k.done = true;
            else if (k.cl.amount <= 0) k.step = 0;
          }
        }
        return;
      }
      case 'salvage': {
        const w = k.wreck;
        if (k.step === 0) {
          const a0 = Math.atan2(e.pos.z - w.z, e.pos.x - w.x) + (k.buddy ? rand(-0.9, 0.9) : 0);
          Ents.goTo(e, w.x + Math.cos(a0) * (w.rad + 0.9), w.z + Math.sin(a0) * (w.rad + 0.9)); k.step = 1; setAct(e, k.buddy ? 'Heading to a wreck with ' + first(k.buddy) : 'Heading to a wreck');
        } else if (k.step === 1) { if (w.scrap <= 0) { k.done = true; return; } if (Ents.stepMove(e, dt, groupSpeed(e, k, sp)) || Math.hypot(e.pos.x - w.x, e.pos.z - w.z) < w.rad + 1.6) { k.step = 2; k.t = 0; } }
        else {
          if (w.scrap <= 0) { k.done = true; return; }
          setAct(e, k.buddy ? 'Stripping a wreck with ' + first(k.buddy) : 'Stripping a wreck'); e.hasGun = false; e.gesture = 'fix';
          k.t += dt * workMult(c);
          if (Math.random() < 0.2) FX.repair(w.x + rand(-1, 1), w.y + 1, w.z + rand(-1, 1));
          if (k.t > 6) { const n = Math.min(10, w.scrap); w.scrap -= n; c.carry = n; c.carryKind = 'scrap'; k.done = true; }
        }
        return;
      }
      case 'drill': {   // rauamaagi puurimine (sama nagu vraki koorimine)
        const w = k.ore;
        if (!w || w.gone || w.amount <= 0) { k.done = true; return; }
        if (k.step === 0) {
          const a0 = Math.atan2(e.pos.z - w.z, e.pos.x - w.x) + (k.buddy ? rand(-0.9, 0.9) : 0);
          Ents.goTo(e, w.x + Math.cos(a0) * (w.rad + 0.8), w.z + Math.sin(a0) * (w.rad + 0.8)); k.step = 1; setAct(e, k.buddy ? 'Going to drill ore with ' + first(k.buddy) : 'Going to drill ore');
        } else if (k.step === 1) { if (Ents.stepMove(e, dt, groupSpeed(e, k, sp)) || Math.hypot(e.pos.x - w.x, e.pos.z - w.z) < w.rad + 1.5) { k.step = 2; k.t = 0; } }
        else {
          setAct(e, 'Drilling iron ore'); e.hasGun = false; e.gesture = 'mine'; Ents.face(e, w.x, w.z, dt);
          k.t += dt * workMult(c);
          if (Math.random() < 0.25) FX.sparks(w.x + rand(-0.5, 0.5), w.y + 0.8, w.z + rand(-0.5, 0.5), [1, 0.6, 0.3], 2, 2);
          if (k.t > 7) { const n = Math.min(c.trait === 'tugev' ? 10 : 6, w.amount); w.amount -= n; c.carry = n; c.carryKind = 'ore'; k.done = true; }
        }
        return;
      }
      case 'home': {
        e.hasGun = true;
        if (k.step === 0) { const h = homeTarget(e); if (h) goObj(e, h); else Ents.goTo(e, 0, 0); k.step = 1; setAct(e, 'Bringing the loot home'); }
        else if (Ents.stepMove(e, dt, sp) || Base.isInside(e.pos.x, e.pos.z) && Math.hypot(e.pos.x, e.pos.z) < 30) { deposit(e); k.done = true; }
        return;
      }
      case 'repair': case 'craft': case 'cook': case 'scan': case 'refine': case 'steal': case 'leisure': {
        const o = k.obj;
        if (!o || !Base.objs.has(o.id)) { k.done = true; return; }
        if (k.step === 0) {
          if (!goObj(e, o)) { k.done = true; return; }
          k.step = 1;
          setAct(e, { repair: 'Going to repair', craft: 'Going to the workshop', cook: 'Going to the kitchen', scan: 'Going to the scanner', refine: 'Going to polish', steal: 'Sneaking around', leisure: 'Resting' }[k.type]);
        } else if (k.step === 1) {
          if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.w = 0; if (k.type === 'leisure' && (o.type === 'diivan' || o.type === 'laud')) e.pose = 'sit'; }
        } else {
          e.hasGun = false;
          Ents.face(e, o.cx, o.cz, dt);
          if (k.type !== 'leisure' && k.type !== 'steal' && c.energy < 15 && Math.sin(now() * 0.25 + e.id) > 0.4) { e.gesture = 'tired'; setAct(e, 'Dozing off at work'); return; }
          k.w = (k.w || 0) + dt * workMult(c);
          if (k.type === 'repair') {
            setAct(e, 'Repairing: ' + OBJ[o.type].name.toLowerCase()); e.gesture = 'fix';
            if (Math.random() < 0.3) FX.repair(o.cx, 1.5, o.cz);
            if (k.w > 4) {
              if (o.broken) { if (G.res.scrap >= 25) { G.res.scrap -= 25; o.broken = false; G.flags.gen = true; UI.msg(c.name + ' repaired the generator.', 'good'); Objectives.check(); } }
              else if (G.res.scrap >= 5) { G.res.scrap -= 5; o.hp = o.maxHp; }
              k.done = true;
            }
          } else if (k.type === 'craft') {
            setAct(e, 'Producing scrap'); e.gesture = 'interact';
            if (!o.on) { k.done = true; return; }
            if (k.w > 16) { k.w = 0; G.res.scrap += 1; k.n = (k.n || 0) + 1; if (k.n >= 4 || c.energy < 20) k.done = true; }
          } else if (k.type === 'cook') {
            setAct(e, 'Cooking'); o.data.cooking = 1; e.gesture = 'interact';
            if (Math.random() < 0.2) FX.smoke(o.cx, 1.3, o.cz);
            if (k.w > 7) { k.w = 0; if (G.res.meat > 0) { G.res.meat--; G.res.food += 2; } if (G.res.meat <= 0 || (k.n = (k.n || 0) + 1) >= 4) { k.done = true; o.data.cooking = 0; } }
          } else if (k.type === 'scan') {
            setAct(e, 'Studying scanner data');
            if (!o.on || G.scan.found || k.w > 40 || isSleepTime(c)) k.done = true;
          } else if (k.type === 'refine') {
            setAct(e, 'Polishing diamonds'); e.gesture = 'interact';
            if (!o.on) { k.done = true; return; }
            if (k.w > 8) { k.w = 0; if (G.res.kris > 0) { G.res.kris--; G.res.lihv++; } if (G.res.kris <= 0 || (k.n = (k.n || 0) + 1) >= 5) k.done = true; }
          } else if (k.type === 'steal') {
            setAct(e, 'Sneaking around');
            if (k.w > 3) {
              const n = Math.min(Math.floor(G.res.kris * 0.35) + 2, G.res.kris, 15);
              const s = Math.min(15, Math.floor(G.res.scrap * 0.2));
              G.res.kris -= n; G.res.scrap -= s;
              c.thefts++; c.stoleTonight = true;
              G.flags.theftMsg = (n || s) ? 'Morning check — missing from storage: ' + n + ' diamonds and ' + s + ' scrap.' : null;
              k.done = true;
            }
          } else if (k.type === 'leisure') {
            setAct(e, o.type === 'jukebox' ? 'Listening to music' : o.type === 'diivan' ? 'Resting on the sofa' : o.type === 'laud' ? 'Sitting at a table' : 'Looking at the desert flower');
            if (o.type === 'teler') { o.data.watch = 3; setAct(e, 'Watching TV'); }
            if (o.type === 'trenn') setAct(e, 'Training');
            if (k.gs === undefined) k.gs = o.type === 'teler' ? pick(['groundSit', 'fold']) : o.type === 'trenn' ? 'mine' : e.pose === 'sit' ? pick(['sit', 'sit', 'sitTalk']) : o.type === 'jukebox' ? pick(['fold', 'cheer']) : 'look';
            e.gesture = k.gs;
            c.morale = Math.min(100, c.morale + dt * 0.05);
            if (k.w > k.t) { e.pose = 'stand'; k.done = true; }
          }
        }
        return;
      }
      case 'heal': {
        const t = k.target;
        if (!t || !targetAlive(t) || t.hp >= t.maxHp * 0.98) { k.done = true; return; }
        const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
        setAct(e, 'Healing: ' + (t === Player ? 'you' : t.crew ? t.crew.name.split(' ')[0] : ''));
        if (d > 2.2) { if (!e.path || Ents.arrived(e) || Math.random() < dt) Ents.goTo(e, t.pos.x, t.pos.z); Ents.stepMove(e, dt, sp * 1.2); }
        else {
          e.hasGun = false; Ents.face(e, t.pos.x, t.pos.z, dt);
          k.t += dt;
          if (k.t > 1.5) { k.t = 0; t.hp = Math.min(t.maxHp, t.hp + 18 * workMult(c)); FX.sparks(t.pos.x, t.pos.y + 1.2, t.pos.z, [0.4, 1, 0.6], 6, 2); }
        }
        return;
      }
      case 'follow': {
        e.hasGun = true;
        const LD = leaderOf(c);
        if (!c.follow || leaderGone(c)) { k.done = true; return; }
        if (c.carry && Base.isInside(e.pos.x, e.pos.z)) deposit(e);
        const P = LD.pos, d = Math.hypot(P.x - e.pos.x, P.z - e.pos.z);
        const idx = members().filter((m) => m.crew.follow && leaderOf(m.crew) === LD).indexOf(e);
        // kohad mängija taga kaarena
        const ang = LD.yaw + Math.PI + (idx - 1) * 0.55, rr = 2.6 + Math.floor(idx / 3) * 1.4;
        const tx = P.x + Math.sin(ang) * rr, tz = P.z + Math.cos(ang) * rr;
        const dt2 = Math.hypot(tx - e.pos.x, tz - e.pos.z);
        k.rt -= dt;
        if (d > 70) { // jäi liiga kaugele maha: jõuab järele
          e.pos.x = tx; e.pos.z = tz; e.pos.y = Ents.groundY(tx, tz, e.pos.y); Ents.stopMove(e);
        }
        if (dt2 > 1.6 && d > 3.2) {
          if (k.rt <= 0 || !e.path || Ents.arrived(e)) { k.rt = d > 15 ? 1.2 : 0.6; Ents.goTo(e, tx, tz); }
          Ents.stepMove(e, dt, d > 9 ? sp * 1.45 : d > 5 ? sp * 1.1 : sp * 0.8);
          setAct(e, LD === Player ? 'Following you' : 'Following ' + (LD.netName || 'your partner'));
        } else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4); Ents.stopMove(e);
          Ents.face(e, e.pos.x + Math.sin(LD.yaw), e.pos.z + Math.cos(LD.yaw), dt, 2);
          setAct(e, LD === Player ? 'Waiting by you' : 'Waiting by ' + (LD.netName || 'your partner'));
        }
        return;
      }
      case 'drink': {
        const o = k.obj;
        if (!o || !Base.objs.has(o.id)) { k.done = true; return; }
        if (k.step === 0) { e.hasGun = false; if (!goObj(e, o)) { k.done = true; return; } k.step = 1; setAct(e, 'Going for a drink'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.t = 0; } }
        else {
          Ents.face(e, o.cx, o.cz, dt); k.t += dt;
          setAct(e, o.type === 'pliit' ? 'Making coffee' : 'Drinking water');
          e.hasGun = false; e.gesture = k.t < 0.8 ? 'interact' : 'drink';
          if (k.t > 4) { c.thirst = 100; c.morale = Math.min(100, c.morale + (o.type === 'pliit' ? 2 : 0.5)); e.aimPitch = 0; k.done = true; }
        }
        return;
      }
      case 'chat': {
        const p = k.with;
        const pk = p && p.crew && p.crew.task;
        if (!p || !p.alive || !p.crew || !pk || pk.type !== 'chat' || pk.with !== e) { e.gesture = null; k.done = true; return; }
        if (k.step === 0) {
          e.hasGun = false;
          const mx = (e.pos.x + p.pos.x) / 2, mz = (e.pos.z + p.pos.z) / 2;
          const a = Math.atan2(p.pos.x - e.pos.x, p.pos.z - e.pos.z);
          k.mx = mx; k.mz = mz;
          Ents.goTo(e, mx - Math.sin(a) * 0.65, mz - Math.cos(a) * 0.65);
          k.step = 1; setAct(e, 'Going to chat');
        } else if (k.step === 1) {
          const near = Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z) < 1.9;
          if (Ents.stepMove(e, dt, sp * 0.8) || near) { Ents.stopMove(e); k.step = 2; k.g = 0; }
          if ((k.t2 = (k.t2 || 0) + dt) > 25) k.done = true;
        } else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
          Ents.face(e, p.pos.x, p.pos.z, dt, 4);
          if (pk.step < 2) { setAct(e, 'Waiting ' + p.crew.name.split(' ')[0] + '-t'); return; }
          k.t -= dt; k.g -= dt;
          if (k.g <= 0) { k.g = rand(2.5, 5); e.gesture = pick(['talk', 'talk', 'fold', 'yes', 'no', c.morale > 70 ? 'cheer' : 'talk']); }
          if (k.argue === undefined) k.argue = pk.argue = (c.morale < 35 || p.crew.morale < 35 || c.hygiene < 15) && Math.random() < 0.5;
          setAct(e, (k.argue ? 'Quarrelling: ' : 'Chatting: ') + p.crew.name.split(' ')[0]);
          if (k.argue) { if (k.g > 3.5) e.gesture = 'no'; c.morale = Math.max(0, c.morale - dt * 0.06); c.rel[p.id] = (c.rel[p.id] || 0) - dt * 0.15; }
          else { c.morale = Math.min(100, c.morale + dt * 0.08); c.rel[p.id] = Math.min(100, (c.rel[p.id] || 0) + dt * 0.2); }
          if (k.t <= 0) { e.gesture = null; k.done = true; pk.done = true; p.gesture = null; }
        }
        return;
      }
      case 'post': {
        const o = k.obj;
        const wi = Waves.info();
        const over = !wi || wi.none || wi.done;
        if (!o || !Base.objs.has(o.id) || over) {
          if (e.onPost === 'torn' && o) { const u = Base.useCells(o)[0]; if (u) { const cc = Base.cellCenter(u[0], u[1]); e.pos.x = cc.x; e.pos.z = cc.z; e.pos.y = Ents.groundY(cc.x, cc.z); } }
          e.onPost = null; if (o) o.data.manned = 0; k.done = true; return;
        }
        e.hasGun = true;
        if (k.step === 0) { if (!goObj(e, o)) { k.done = true; return; } k.step = 1; setAct(e, 'Going to post: ' + OBJ[o.type].name.toLowerCase()); }
        else if (k.step === 1) {
          if (Ents.stepMove(e, dt, sp * 1.2)) {
            k.step = 2;
            if (o.type === 'torn') { e.pos.x = o.cx + rand(-0.8, 0.8); e.pos.z = o.cz + rand(-0.8, 0.8); e.pos.y = Ents.groundY(e.pos.x, e.pos.z, e.pos.y); }
            if (o.type === 'vallikaik') { e.pos.x = o.cx; e.pos.z = o.cz; e.pos.y = Ents.groundY(o.cx, o.cz); }
            Ents.stopMove(e); e.onPost = o.type;
          }
        } else {
          e.moveAmt = 0; e.onPost = o.type;
          if (o.type === 'torn' || o.type === 'vallikaik') e.pos.y = Ents.groundY(e.pos.x, e.pos.z, e.pos.y);
          const wd = wi.dir; Ents.face(e, Math.cos(wd) * 200, Math.sin(wd) * 200, dt, 1.5);
          setAct(e, o.type === 'torn' ? 'Guarding in the tower' : o.type === 'kmpesa' ? 'Manning the machine gun' : 'Guarding on the rampart');
        }
        return;
      }
      case 'vgun': {   // bagi kuulipilduja kui kaitsepost
        const v = k.v, wi = Waves.info();
        if (!v || v.dead || !wi || wi.none || wi.done || (v.seats[1] && v.seats[1] !== e)) { k.done = true; return; }
        e.hasGun = true;
        if (k.step === 0) { e._noRide = true; Ents.goTo(e, v.x, v.z); e._noRide = false; k.step = 1; setAct(e, 'Running to the buggy machine gun'); }
        else if (Math.hypot(v.x - e.pos.x, v.z - e.pos.z) < 3 || Ents.stepMove(e, dt, sp * 1.3)) { if (!Vehicles.manGun(v, e)) k.done = true; }
        return;
      }
      case 'shelter': {
        e.hasGun = false;
        const wi = Waves.info();
        if (!wi || wi.none || wi.done) { k.done = true; return; }
        if (k.step === 0) { const cc = freeRoomCell(); if (cc) Ents.goTo(e, cc.x, cc.z); k.step = 1; setAct(e, 'Taking cover'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 1.3)) k.step = 2; }
        else { e.moveAmt = 0; e.gesture = 'fold'; setAct(e, 'Sheltering in the base'); k.t -= dt; if (k.t <= 0) k.done = true; }
        return;
      }
      case 'gadget': {
        const o = k.obj;
        if (!o || !Base.objs.has(o.id)) { k.done = true; return; }
        if (k.step === 0) { if (!goObj(e, o)) { k.done = true; return; } k.step = 1; setAct(e, 'Going to the ' + OBJ[o.type].name.toLowerCase()); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.w = 0; } }
        else {
          e.hasGun = false; Ents.face(e, o.cx, o.cz, dt); e.gesture = o.type === 'piljard' ? 'look' : 'fix';
          setAct(e, Gadgets.actText(o.type));
          k.w += dt * workMult(c);
          if (Math.random() < dt * 1.5 && (o.type === 'moonapress' || o.type === 'treipink' || o.type === 'toovanker')) FX.sparks(o.cx + rand(-0.3, 0.3), 1.0, o.cz + rand(-0.3, 0.3), [1, 0.6, 0.3], 2, 2);
          if (k.w > k.t) { const m = Gadgets.apply(e, o); if (m && Math.hypot(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z) < 30) UI.toast(c.name.split(' ')[0] + ': ' + m); k.done = true; }
        }
        return;
      }
      case 'use': {
        const o = k.obj;
        if (!o || !Base.objs.has(o.id)) { k.done = true; return; }
        if (k.step === 0) { e.hasGun = false; if (!goObj(e, o)) { k.done = true; return; } k.step = 1; setAct(e, k.what === 'wc' ? 'Going to the toilet' : 'Going to shower'); }
        else if (k.step === 1) { if (Ents.stepMove(e, dt, sp)) { k.step = 2; k.w = 0; } }
        else {
          k.w += dt; Ents.face(e, o.cx, o.cz, dt);
          e.gesture = k.what === 'dush' ? 'look' : 'fold';
          setAct(e, k.what === 'wc' ? 'In the toilet' : 'Showering');
          if (k.what === 'dush' && Math.random() < dt * 3) FX.smoke(o.cx, 1.9, o.cz);
          if (k.what === 'dush' && roomJobOf(o) === 'Washroom') k.w += dt;   // pesuruum: kaks korda kiirem
          if (k.w > k.t) { if (k.what === 'wc') c.bladder = 100; else { c.hygiene = 100; c.washedToday = G.time.day; c.morale = Math.min(100, c.morale + (roomJobOf(o) === 'Washroom' ? 6 : 3)); } k.done = true; }
        }
        return;
      }
      case 'relieve': {
        e.hasGun = false;
        if (k.step === 0) { const a = rand(0, TAU), R = Math.max(16, Base.bounds() + 8); Ents.goTo(e, Math.cos(a) * R, Math.sin(a) * R); k.step = 1; k.mt = 0; setAct(e, 'Going into the desert to relieve themselves'); }
        else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, sp) || k.mt > 30) { k.step = 2; k.w = 0; } }
        else { k.w += dt; e.moveAmt = 0; setAct(e, 'Relieving themselves'); if (k.w > 5) { c.bladder = 100; c.morale = Math.max(0, c.morale - 2); k.done = true; } }
        return;
      }
      case 'explore': {
        e.hasGun = true;
        if (Econ.isNight()) { k.done = true; return; }
        if (k.step === 0) {
          const R = Math.max(18, Base.bounds() + 6) + rand(12, 55), a = rand(0, TAU);
          // huvitav koht: vrakk või kivi lähedal, muidu juhuslik
          const w = World.wrecks.filter((q) => !q.gone && q.scrap > 0 && Math.hypot(q.x, q.z) < 110).sort(() => Math.random() - 0.5)[0];
          const tx = w && Math.random() < 0.45 ? w.x + rand(-4, 4) : Math.cos(a) * R, tz = w && Math.random() < 0.45 ? w.z + rand(-4, 4) : Math.sin(a) * R;
          Ents.goTo(e, tx, tz); k.step = 1; k.mt = 0; setAct(e, 'Going to explore');
        } else if (k.step === 1) {
          k.mt += dt;
          if (Ents.stepMove(e, dt, sp * 0.7) || k.mt > 40) { k.step = 2; k.lt = 0; }
        } else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
          k.lt += dt; k.t -= dt;
          e.yaw += Math.sin(k.lt * 0.6 + e.id) * dt * 0.5;
          setAct(e, k.lt < 4 ? 'Staring into the distance' : 'Exploring');
          e.hasGun = k.lt > 6; e.gesture = k.lt <= 6 ? 'look' : null;
          if (k.t <= 0) {
            if (Math.random() < 0.3) { const n = randi(1, 4); c.carry = n; c.carryKind = 'scrap'; UI.toast(c.name.split(' ')[0] + ' found on a walk: ' + n + ' scrap'); }
            k.done = true;
          }
        }
        return;
      }
      case 'sunset': {
        e.hasGun = false;
        if (k.step === 0) {
          const sd = GFX.env && GFX.env.sunDir ? GFX.env.sunDir : [0.4, 0.5, 0.3];
          const L = Math.hypot(sd[0], sd[2]) || 1, R = Math.max(14, Base.bounds() + 4) + rand(1, 6);
          const a = Math.atan2(sd[0] / L, sd[2] / L) + rand(-0.5, 0.5);
          k.sx = sd[0] / L; k.sz = sd[2] / L;
          Ents.goTo(e, Math.sin(a) * R, Math.cos(a) * R); k.step = 1; k.mt = 0; setAct(e, 'Going to watch the sunset');
        } else if (k.step === 1) { k.mt += dt; if (Ents.stepMove(e, dt, sp * 0.7) || k.mt > 30) k.step = 2; }
        else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
          Ents.face(e, e.pos.x + k.sx * 10, e.pos.z + k.sz * 10, dt, 1.5);
          setAct(e, 'Watching the sunset'); c.morale = Math.min(100, c.morale + dt * 0.06);
          if (k.gs === undefined) k.gs = Math.random() < 0.6 ? 'groundSit' : 'fold';
          e.gesture = k.gs;
          k.t -= dt; if (k.t <= 0 || Econ.hour() > 20) k.done = true;
        }
        return;
      }
      case 'wander': {
        e.hasGun = true;
        if (k.step === 0) {
          const cc = freeRoomCell();
          if (cc) Ents.goTo(e, cc.x, cc.z); else { k.step = 2; return; }
          k.step = 1; setAct(e, 'Busy');
        } else if (k.step === 1) { if (Ents.stepMove(e, dt, sp * 0.7)) { k.step = 2; } }
        else {
          k.t -= dt;
          if (k.gs === undefined) { k.gs = c.energy < 30 ? 'tired' : c.morale < 25 ? 'cry' : e.mourn ? 'sad' : pick(['look', 'fold', 'radio', null, 'tired', 'groundSit', 'check']); if (k.gs === 'check') { k.gs = null; k.chk = true; } }
          if (k.chk) { e.hasGun = true; e.aim = Math.max(e.aim, 0.25 + 0.1 * Math.sin(k.t * 2)); e.aimPitch = -0.4; }
          e.gesture = k.gs; if (k.gs) e.hasGun = false;
          setAct(e, k.chk ? 'Checking their rifle' : k.gs === 'tired' ? 'Stretching' : k.gs === 'cry' || k.gs === 'sad' ? 'Is sad' : k.gs === 'radio' ? 'Talking on the radio' : k.gs === 'groundSit' ? 'Sitting on the floor' : 'Resting');
          if (k.t <= 0 && k.chk) e.aim = 0;
          if (k.t <= 0) k.done = true;
        }
        return;
      }
      default: k.done = true;
    }
  }

  // ---------- kahurid ----------
  function turretTargets() {
    const out = [];
    for (const o of Base.objs.values()) {
      if ((o.type !== 'kahur' && o.type !== 'myyrturel') || o.hp <= 0) continue;
      if (!o.proxy) o.proxy = { kind: 'turret', team: 'crew', obj: o, alive: true, pos: { x: o.cx, y: 0, z: o.cz }, spheres: [[o.cx, o.type === 'kahur' ? 1.4 : 3.4, o.cz, 0.9, 1]] };
      o.proxy.pos.x = o.cx; o.proxy.pos.z = o.cz; o.proxy.spheres[0][0] = o.cx; o.proxy.spheres[0][2] = o.cz;
      out.push(o.proxy);
    }
    return out;
  }
  function updateTurrets(dt) {
    for (const o of Base.objs.values()) {
      if (o.type !== 'kahur' && o.type !== 'myyrturel') continue;
      const wall = o.type === 'myyrturel', hy = wall ? 3.6 : 1.6, rng = wall ? 46 : 34;
      if (o.aim === undefined) o.aim = Base.objYaw(o);
      if (!o.on || o.hp <= 0) { o.pitch = 0.35; if (o.hp <= 0 && Math.random() < dt * 4) FX.smoke(o.cx, hy + 0.2, o.cz); continue; }
      o.scan = (o.scan || 0) - dt;
      if (o.scan <= 0) { o.scan = 0.3; o.target = findThreat(o.cx, hy + 0.2, o.cz, rng, 'crew'); }
      const t = o.target;
      if (t && targetAlive(t)) {
        const tp = targetPoint(t);
        const want = Math.atan2(tp.x - o.cx, tp.z - o.cz);
        o.aim += angDiff(o.aim, want) * Math.min(1, dt * 6);
        o.pitch = -Math.atan2(tp.y - hy, Math.hypot(tp.x - o.cx, tp.z - o.cz)) * 0.8;
        if (o.cool <= 0 && Math.abs(angDiff(o.aim, want)) < 0.12) {
          o.cool = wall ? 0.22 : 0.26;
          const fake = { pos: { x: o.cx, y: hy - 1.3, z: o.cz }, yaw: o.aim, team: 'crew', set flash(v) { } };
          fireAt(fake, t, wall ? 11 : 9, wall ? 0.8 : 0.75, 'turret');
        }
      } else { o.aim += dt * 0.35; o.pitch = lerp(o.pitch || 0, 0, dt); }
    }
  }
  function update(dt) {
    updateTurrets(dt);
    for (const g of groups) groupTick(g, dt);
    syncGraves(); updateRoomLights(dt);
    for (const o of Base.objs.values()) {
      if (o.data && o.data.watch > 0) o.data.watch -= dt;
      if (o.type !== 'kasvu' || !o.on) continue;
      o.data.grow = (o.data.grow || 0) + dt / (DAY_LEN / 12) * (members().some((m) => m.crew.role === 'kokk') ? 1.25 : 1);
      if (o.data.grow >= 1) { o.data.grow = 0; G.res.food += 1; if (Math.random() < 0.3) UI.toast('Hydroponics produced one meal'); }
    }
    // tuju hoiatus
    if (G.flags.theftMsg && Econ.hour() > 6 && Econ.hour() < 9) { UI.msg(G.flags.theftMsg, 'danger'); G.flags.theftMsg = null; }
  }
  function serialize() {
    return members().map((m) => ({ x: m.pos.x, z: m.pos.z, hp: m.hp, maxHp: m.maxHp, crew: Object.assign({}, m.crew, { task: null, bedObj: null, follow: false, leader: null }) }));
  }
  function deserialize(arr) {
    for (const d of arr || []) {
      const e = Ents.spawn('human', 'crew', d.x, d.z, { maxHp: d.maxHp, radius: 0.38, ai: crewAI, crew: d.crew, scanT: 0, cool: 0 });
      e.hp = d.hp; e.crew.task = null;
    }
    assignBeds();
  }
  function setFollow(e, on, who) {
    if (!e || !e.crew) return;
    e.crew.follow = !!on; e.crew.leader = on && who && who !== Player ? who : null;
    if (e.pose === 'lie' || e.pose === 'sit') wakeUp(e);
    e.gesture = null;
    if (e.crew.task) e.crew.task.done = true;
    e.crew.task = null;
    if (!who || who === Player) UI.toast(e.crew.name.split(' ')[0] + (on ? ': “I\'m coming with you!”' : ': “Got it, heading back to work.”'));
    else if (typeof Net !== 'undefined') Net.toastTo(who, e.crew.name.split(' ')[0] + (on ? ': “I\'m coming with you!”' : ': “Got it, heading back to work.”'));
  }
  function followNear(range, who) {
    const W = who || Player;
    const near = members().filter((m) => Math.hypot(m.pos.x - W.pos.x, m.pos.z - W.pos.z) < range);
    if (!near.length) { if (W === Player) UI.toast('Nobody nearby'); else if (typeof Net !== 'undefined') Net.toastTo(W, 'Nobody nearby'); return; }
    const anyFree = near.some((m) => !m.crew.follow || leaderOf(m.crew) !== W);
    for (const m of near) setFollow(m, anyFree, W);
    Audio2.ui && Audio2.ui();
  }
  function followers() { return members().filter((m) => m.crew.follow); }
  return { note, hear, torchLights, roomTypes, hasRoomJob, roomJobOf, setFollow, followNear, followers, MAX, members, count, freeBeds, canHire, hire, fire, payWages, afterSleep, onDeath, engineerBonus, scientistAtScanner, update, turretTargets, assignBeds, serialize, deserialize, crewAI };
})();
