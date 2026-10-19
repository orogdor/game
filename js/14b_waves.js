// ============================================================
//  KIVISÜDAME PARVED: öised putukalained, mis ründavad baasi
// ============================================================
const Waves = (() => {
  let state = null; // { day, n, dir, warned, spawned, total, left, groups, kills, startT }
  const TINT_S = [0.72, 0.9, 0.62, 0], TINT_B = [1.15, 0.62, 0.5, 0], HURT = [1.6, 0.6, 0.5, 0.2];

  function waveNight(day) { return day >= 2 && day % 2 === 0; }
  function hasCommand() {
    if (typeof Crew !== 'undefined' && Crew.hasRoomJob('Command post')) return true;   // toa ülesanne: komandopunkt
    if (!Base.objsOfType('radar').some((o) => o.on)) return false;
    return Base.objsOfType('kaardilaud').some((o) => o.on && Base.roomAt(o.i, o.j) > 0);
  }
  const DIRN = ['from the north', 'from the northeast', 'from the east', 'from the southeast', 'from the south', 'from the southwest', 'from the west', 'from the northwest'];
  function dirName(a) {
    const yw = Math.atan2(Math.cos(a), Math.sin(a));
    const head = Math.atan2(Math.sin(yw), -Math.cos(yw));
    const k = ((Math.round(head / (Math.PI / 4)) % 8) + 8) % 8;
    return DIRN[k];
  }

  function plan(day) {
    const n = Math.floor(day / 2);
    const dir = rand(0, TAU);
    const small = 8 + n * 4 + Math.round(G.dk.raid * 2);
    const big = n >= 2 ? Math.floor(n / 2) + 1 : n >= 1 ? 1 : 0;
    return { day, n, dir, warned: 0, small, big, spawned: 0, total: small + big, kills: 0, active: false, done: false, spawnT: 0 };
  }

  function spawnBug(big) {
    const a = state.dir + rand(-0.35, 0.35), r = rand(150, 175);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const hm = state.hpMul || 1;
    const e = Ents.spawn('bug', 'bugs', x, z, { maxHp: Math.round((big ? 220 : 52) * hm), radius: big ? 0.9 : 0.45, yaw: Math.atan2(-x, -z) });
    e.big = big; e.scan = 0; e.cool = 0; e.lunge = 0; e.chew = null; e.wave = state.day;
    e.hp = e.maxHp;
    state.spawned++;
  }

  function update(dt) {
    const day = G.time.day, h = Econ.hour();
    if (!state || state.day !== day && !(state.active && h < 7)) {
      if (waveNight(day)) state = plan(day); else if (!state || state.day !== day) state = { day, none: true };
    }
    if (state.none) return;
    const cmd = hasCommand();
    // hoiatused
    if (!state.warned && h >= (cmd ? 17 : 19.8) && h < 21) {
      state.warned = 1;
      // parve suurus sõltub baasi mürast, valgusest ja esemete arvust
      // suurus sõltub eelkõige baasi suurusest (pind, esemed, meeskond, müra), vähem päevast
      const sg = Base.signature(true); state.sig = sg;
      const S = Base.sizeScore(); state.size = S;
      state.small = clamp(Math.round((2 + state.n * 0.4 + S * 0.3) * G.dk.raid), 3, 110);
      state.big = Math.floor(S / 28) + Math.floor(state.n / 3);
      state.hpMul = 1 + S / 500;
      state.beetles = Math.floor(S / 45);   // suurt baasi piiravad ka happemortiiriga mardikad
      state.total = state.small + state.big;
      Audio2.alarm();
      if (cmd) UI.banner('Swarm approaching ' + dirName(state.dir) + '!', 'Command post: ' + state.small + ' darters' + (state.big ? ', ' + state.big + ' rammers' : '') + ' · attack at night', 'danger');
      else UI.banner('Radio: the bugs are coming!', 'Direction unknown. Build a command post (map table + radar) to see ahead.', 'danger');
      UI.msg('The Stoneheart\'s swarm is coming. Put the crew on their posts, the gate closes by itself.', 'danger');
      UI.msg('Base size ' + state.size + ' · threat ' + sg.tier + ' (noise ' + sg.noise + ', light ' + sg.light + ', items ' + sg.count + '). The swarm goes for the base heart and the loudest machines.', state.size > 90 ? 'danger' : '');
    }
    // algus
    if (!state.active && !state.done && (h >= 21 || h < 5) && state.warned) { state.active = true; state.spawnT = 0; }
    if (state.active) {
      if (state.beetles && !state.beetlesOut) { state.beetlesOut = true; for (let k = 0; k < state.beetles; k++) { const a = state.dir + rand(-0.5, 0.5), r = rand(140, 165); Fauna.spawnBeetle(Math.cos(a) * r + Base.OX, Math.sin(a) * r + Base.OZ, true); } }
      state.spawnT -= dt;
      if (state.spawned < state.total && state.spawnT <= 0) {
        state.spawnT = 2.2;
        const grp = Math.min(state.total - state.spawned, randi(3, 5));
        for (let k = 0; k < grp; k++) spawnBug(state.spawned >= state.small);
      }
      const alive = Ents.countAlive((e) => e.kind === 'bug' && e.wave === state.day);
      if (state.spawned >= state.total && alive === 0) end(true);
      else if (h >= 6 && h < 12) { // koidikul põgenevad liiva alla
        for (const e of Ents.list) if (e.kind === 'bug' && e.alive) { e.remove = true; FX.dust(e.pos.x, e.pos.y + 0.2, e.pos.z, 8, 2); }
        end(false);
      }
    }
    // laibad ära
    for (const e of Ents.list) if (e.kind === 'bug' && !e.alive && e.deathT > 20) e.remove = true;
  }
  function end(won) {
    state.active = false; state.done = true;
    const pay = state.kills * 6;
    if (typeof Crew !== 'undefined' && Crew.note) { Crew.note('attack'); Crew.note('kill', state.kills); }
    if (pay) { G.res.cr += pay; Audio2.cash(); }
    UI.banner(won ? 'Swarm repelled!' : 'The swarm retreated at dawn', state.kills + ' bugs killed' + (pay ? ' · UAC defence bonus ' + pay + ' ₵' : ''), won ? 'good' : 'warn');
    G.stats.waves = (G.stats.waves || 0) + (won ? 1 : 0);
  }
  function active() { return !!(state && state.active); }
  function marker() {
    if (!state || state.none || state.done || !state.warned || !hasCommand()) return null;
    return { x: Math.cos(state.dir) * 120, z: Math.sin(state.dir) * 120 };
  }

  // ---------- putuka AI ----------
  // Eesmärk: baasi süda ja häält tegevad masinad (generaatorid, tehased, kahurid). Inimesi rünnatakse ainult,
  // kui nad on otse tee peal või putukat tulistavad. Lukus uksed lõhutakse (Ents.stepMove -> Bases.attackDoor).
  const probe = { x: 0, z: 0 };
  function running(o) { const d = OBJ[o.type]; return d.power > 0 ? o.on : d.power < 0 ? !o.broken : true; }
  function pickTarget(e) {
    const pc = typeof Rivals !== 'undefined' ? Rivals.playerCore : null, cands = [];
    if (pc && pc.alive) cands.push({ core: pc, x: pc.pos.x, z: pc.pos.z, w: e.big ? 14 : 5 });
    for (const o of Base.objs.values()) {
      if (o.lv) continue;
      const sg = SIG[o.type]; if (!sg || sg[0] < 2 || !running(o)) continue;
      const oc = Base.objCenter(o); cands.push({ obj: o, x: oc.x, z: oc.z, w: sg[0] * (e.big ? 0.6 : 1) });
    }
    if (!cands.length) return null;
    let sum = 0; for (const c of cands) { c.w /= 1 + Math.hypot(c.x - e.pos.x, c.z - e.pos.z) / 50; sum += c.w; }
    let u = Math.random() * sum; for (const c of cands) { u -= c.w; if (u <= 0) return c; }
    return cands[0];
  }
  function tgtValid(t) { return t && (t.core ? t.core.alive : Base.objs.has(t.obj.id)); }
  function bugAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    if (e.lunge > 0) e.lunge -= dt;
    if (e.lastHp === undefined) e.lastHp = e.hp;
    if (e.hp < e.lastHp) e.hurtAt = G.time.total;
    e.lastHp = e.hp;
    e.scan -= dt;
    if (e.scan <= 0) {
      e.scan = 0.45 + Math.random() * 0.3;
      // enesekaitse: ainult otse kõrval olev inimene või see, kes just tulistas (väiksed putukad)
      let foe = null, bd = e.big ? 2.9 : 3.2;
      for (const t of Ents.list) {
        if (!t.alive || !(t.kind === 'human' || t.kind === 'player') || t.team === 'bugs' || t.inVehicle) continue;
        if (t.kind === 'player' && (Player.dead || G.mode === 'build')) continue;
        const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
        if (d < bd && Math.abs(t.pos.y - e.pos.y) < 3) { bd = d; foe = t; }
      }
      const la = e.lastAttacker;
      if (!foe && !e.big && la && la.alive && la.pos && e.hurtAt && G.time.total - e.hurtAt < 3 && Math.hypot(la.pos.x - e.pos.x, la.pos.z - e.pos.z) < 9 && Math.random() < 0.5) foe = la;
      e.target = foe;
      if (!tgtValid(e.tgt)) { e.tgt = pickTarget(e); e.path = null; e.repath = 0; }
    }
    // okastraat
    let slow = 1;
    const c = Base.toCell(e.pos.x, e.pos.z), oid = Base.objAt(c.i, c.j), oo = oid ? Base.objs.get(oid) : null;
    if (oo && oo.type === 'okas') { slow = e.big ? 0.7 : 0.35; e.hp -= dt * (e.big ? 2 : 6); oo.hp -= dt * 3; if (e.hp <= 0) Ents.damage(e, 1, null); if (oo.hp <= 0) destroyObj(oo); if (!e.alive) return; }
    const sp = (e.big ? 4.2 : 7.0) * slow * (e.wobble = (e.wobble || rand(0.9, 1.1)));
    const t = e.target && e.target.alive !== false ? e.target : null;
    if (t) {
      const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
      if (d < (e.big ? 2.6 : 1.9)) {
        e.moveAmt = Math.max(0, e.moveAmt - dt * 5);
        Ents.face(e, t.pos.x, t.pos.z, dt, 10);
        if (e.cool <= 0) { Ents.damage(t, (e.big ? 22 : 8) * G.dk.edmg, e); e.cool = e.big ? 1.4 : 0.9; e.lunge = 0.3; Audio2.stalker(e.pos.x, e.pos.z); }
        return;
      }
      e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null;
      Ents.stepMove(e, dt, sp); e.repath = 0;
      return;
    }
    const g = e.tgt;
    if (!g) { e.path = [{ x: 0, z: 0 }]; e.pathI = 0; Ents.stepMove(e, dt, sp); return; }
    // sihtmärgi kõrval: näri / hammusta
    const o = g.obj, reach = g.core ? 2.2 + e.radius + 0.7 : Math.max(o.w || 1, o.h || 1) * Base.CS / 2 + e.radius + 0.7;
    const dT = Math.hypot(g.x - e.pos.x, g.z - e.pos.z);
    if (dT < reach) {
      e.moveAmt = Math.max(0, e.moveAmt - dt * 5);
      Ents.face(e, g.x, g.z, dt, 10);
      if (e.cool <= 0) {
        e.cool = e.big ? 1.2 : 0.8; e.lunge = 0.25;
        if (g.core) { Ents.damage(g.core, (e.big ? 6 : 1.0) * G.dk.edmg, e); if (G.time.total - (state.coreMsgT || -99) > 25) { state.coreMsgT = G.time.total; UI.msg('Bugs are chewing on the base heart! (' + Math.round(g.core.hp) + ' / ' + g.core.maxHp + ')', 'danger'); Audio2.alarm && Audio2.alarm(); } FX.sparks(g.x, e.pos.y + 1.5, g.z, [0.6, 1, 0.4], 4, 2); }
        else { o.hp -= (e.big ? 45 : 9) * G.dk.edmg; FX.sparks(g.x, e.pos.y + 0.8, g.z, [0.9, 0.7, 0.4], 4, 2); if (o.hp <= 0) { destroyObj(o); e.tgt = null; } }
        Audio2.stalker(e.pos.x, e.pos.z);
      }
      return;
    }
    // tee sihini läbi baasi (uksed lõhutakse stepMove'is)
    e.repath = (e.repath || 0) - dt;
    if (!e.path || Ents.arrived(e) || e.repath <= 0) {
      e.repath = rand(6, 9);
      if (g.core) Ents.goTo(e, g.x + rand(-1.5, 1.5), g.z + rand(-1.5, 1.5));
      else { const cells = Base.useCells(o); Ents.goTo(e, g.x, g.z, cells.length ? cells : null); }
    }
    const ox = e.pos.x, oz = e.pos.z;
    Ents.stepMove(e, dt, sp);
    // väljas ette jäänud ehitis (vall, värav, okastraat): näri läbi
    const moved = Math.hypot(e.pos.x - ox, e.pos.z - oz);
    if (moved < sp * dt * 0.3 && e.moveAmt > 0.2) {
      e.blockT = (e.blockT || 0) + dt;
      if (e.blockT > 0.6) {
        const nx = e.path && e.path[e.pathI] || g, dx = nx.x - e.pos.x, dz = nx.z - e.pos.z, L = Math.hypot(dx, dz) || 1;
        probe.x = e.pos.x + dx / L * (e.radius + 0.8); probe.z = e.pos.z + dz / L * (e.radius + 0.8);
        const pc = Base.toCell(probe.x, probe.z), bid = Base.objAt(pc.i, pc.j), bo = bid ? Base.objs.get(bid) : null;
        if (bo && OBJ[bo.type].where !== 'in' && e.cool <= 0) {
          bo.hp -= (e.big ? 45 : 9) * G.dk.edmg; e.cool = e.big ? 1.2 : 0.8; e.lunge = 0.25;
          FX.sparks(probe.x, e.pos.y + 0.8, probe.z, [0.9, 0.7, 0.4], 4, 2);
          if (bo.hp <= 0) { destroyObj(bo); e.repath = 0; }
        }
      }
    } else e.blockT = 0;
  }
  function destroyObj(o) {
    if (!Base.objs.has(o.id)) return;
    FX.explosion(o.cx, 1.2, o.cz, [0.8, 0.6, 0.4], 0.6); Audio2.explode(o.cx, o.cz, false);
    UI.msg(OBJ[o.type].name + ' purustati!', 'danger');
    Base.removeObj(o.id);
  }
  function onKill(e) { if (state && e.wave === state.day) state.kills++; FX.goo(e.pos.x, e.pos.y + 0.5, e.pos.z, [0.45, 0.62, 0.2], e.big ? 24 : 10); }
  function spheres(e, s) {
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), k = e.big ? 1.6 : 0.7, x = e.pos.x, y = e.pos.y, z = e.pos.z;
    s.push([x, y + 0.55 * k, z, 0.62 * k, 1]); s.push([x + fx * 0.9 * k, y + 0.55 * k, z + fz * 0.9 * k, 0.42 * k, 1.5]);
  }
  function draw(e) {
    if (!e.ms) { e.ms = []; for (let i = 0; i < 10; i++) e.ms.push(M4.create()); }
    const ms = e.ms, R = ms[9];
    const far = Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 30;
    const M0 = far && MODELS.lo ? MODELS.lo : MODELS;
    const M = M0.bugBody ? M0 : { bugBody: M0.stalkerBody, bugHead: M0.stalkerHead, bugTail: M0.stalkerTail, bugLeg: M0.stalkerLeg };
    const k = e.big ? 1.6 : 0.7, tint = e.hurtT > 0 ? HURT : e.big ? TINT_B : TINT_S, dead = !e.alive;
    M4.compose(R, e.pos.x, e.pos.y + (dead ? 0.1 : 0), e.pos.z, e.yaw, 0, dead ? Math.PI * 0.9 * Math.min(1, e.deathT * 3) : 0, k, k, k);
    M4.child(ms[0], R, 0, Math.sin(e.phase * 2) * 0.05 * e.moveAmt, 0, Math.sin(e.phase) * 0.08 * e.moveAmt, 0, 0);
    GFX.draw(M.bugBody, ms[0], tint);
    M4.child(ms[1], ms[0], 0, 0.6, 0.95, 0, (e.lunge > 0 ? -0.5 : 0) + Math.sin(e.phase * 3) * 0.05, 0); GFX.draw(M.bugHead, ms[1], tint);
    M4.child(ms[2], ms[0], 0, 0.55, -0.85, Math.sin(e.phase * 1.3 + 1) * 0.4, 0.1, 0); GFX.draw(M.bugTail, ms[2], tint);
    const sw = Math.sin(e.phase * 1.4) * 0.7 * e.moveAmt;
    const legs = [[-1, 0.5, sw], [1, 0.5, -sw], [-1, 0, -sw], [1, 0, sw], [-1, -0.45, sw], [1, -0.45, -sw]];
    for (let q = 0; q < 6; q++) {
      const s = legs[q][0];
      M4.child(ms[3 + q], ms[0], s * 0.3, 0.55, legs[q][1], s < 0 ? Math.PI + legs[q][2] : legs[q][2], 0, 0);
      GFX.draw(M.bugLeg, ms[3 + q], tint);
    }
  }
  function reset() { state = null; }
  function info() { return state; }
  return { update, bugAI, draw, spheres, onKill, active, marker, reset, info, waveNight, hasCommand };
})();
