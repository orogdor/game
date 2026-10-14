// ============================================================
//  KIVISÜDAME PARVED: öised putukalained, mis ründavad baasi
// ============================================================
const Waves = (() => {
  let state = null; // { day, n, dir, warned, spawned, total, left, groups, kills, startT }
  const TINT_S = [0.72, 0.9, 0.62, 0], TINT_B = [1.15, 0.62, 0.5, 0], HURT = [1.6, 0.6, 0.5, 0.2];

  function waveNight(day) { return day >= 2 && day % 2 === 0; }
  function hasCommand() {
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
    const e = Ents.spawn('bug', 'bugs', x, z, { maxHp: big ? 220 : 52, radius: big ? 0.9 : 0.45, yaw: Math.atan2(-x, -z) });
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
      const sg = Base.signature(true); state.sig = sg;
      state.small = Math.min(70, Math.round(state.small * sg.mult));
      state.big = state.big + Math.floor(sg.total / 90) + (sg.total >= 120 ? 1 : 0);
      state.total = state.small + state.big;
      Audio2.alarm();
      if (cmd) UI.banner('Swarm approaching ' + dirName(state.dir) + '!', 'Command post: ' + state.small + ' darters' + (state.big ? ', ' + state.big + ' rammers' : '') + ' · attack at night', 'danger');
      else UI.banner('Radio: the bugs are coming!', 'Direction unknown. Build a command post (map table + radar) to see ahead.', 'danger');
      UI.msg('The Stoneheart\'s swarm is coming. Put the crew on their posts, the gate closes by itself.', 'danger');
      UI.msg('Base threat level: ' + sg.tier + ' (noise ' + sg.noise + ', light ' + sg.light + ', items ' + sg.count + '). ' + (sg.mult > 1.4 ? 'The swarm is bigger than usual.' : sg.mult < 0.9 ? 'A quiet base attracts fewer bugs.' : ''), sg.mult > 1.4 ? 'danger' : '');
    }
    // algus
    if (!state.active && !state.done && (h >= 21 || h < 5) && state.warned) { state.active = true; state.spawnT = 0; }
    if (state.active) {
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
  const probe = { x: 0, z: 0 };
  function bugAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    if (e.lunge > 0) e.lunge -= dt;
    e.scan -= dt;
    if (e.scan <= 0) {
      e.scan = 0.4 + Math.random() * 0.3;
      let best = null, bd = e.big ? 18 : 26;
      for (const t of Ents.list) {
        if (!t.alive || !(t.kind === 'human' || t.kind === 'player') || t.team === 'bugs') continue;
        if (t.kind === 'player' && (Player.dead || G.mode === 'build')) continue;
        const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
        if (d < bd && Math.abs(t.pos.y - e.pos.y) < 3.5) { bd = d; best = t; }
      }
      e.target = best;
    }
    const t = e.target && e.target.alive !== false ? e.target : null;
    let tx = t ? t.pos.x : 0, tz = t ? t.pos.z : 0;
    if (!t && e.chew && Base.objs.has(e.chew.id)) { tx = e.chew.cx; tz = e.chew.cz; }
    const dx = tx - e.pos.x, dz = tz - e.pos.z, d = Math.hypot(dx, dz) || 1;
    // okastraat
    let slow = 1;
    const c = Base.toCell(e.pos.x, e.pos.z), oid = Base.objAt(c.i, c.j), oo = oid ? Base.objs.get(oid) : null;
    if (oo && oo.type === 'okas') { slow = e.big ? 0.7 : 0.35; e.hp -= dt * (e.big ? 2 : 6); oo.hp -= dt * 3; if (e.hp <= 0) Ents.damage(e, 1, null); if (oo.hp <= 0) destroyObj(oo); if (!e.alive) return; }
    const sp = (e.big ? 4.2 : 7.6) * slow * (e.wobble = (e.wobble || rand(0.9, 1.1)));
    if (t && d < (e.big ? 2.6 : 1.9)) {
      e.moveAmt = Math.max(0, e.moveAmt - dt * 5);
      Ents.face(e, tx, tz, dt, 10);
      if (e.cool <= 0) { Ents.damage(t, (e.big ? 22 : 8) * G.dk.edmg, e); e.cool = e.big ? 1.4 : 0.9; e.lunge = 0.3; Audio2.stalker(e.pos.x, e.pos.z); }
      return;
    }
    // liikumine otse; kui ees on ehitis, näri läbi
    const ox = e.pos.x, oz = e.pos.z;
    let mx = dx / d, mz = dz / d;
    if (e.side) { const px = -mz * e.side, pz = mx * e.side; mx = mx * 0.4 + px; mz = mz * 0.4 + pz; const L = Math.hypot(mx, mz); mx /= L; mz /= L; e.sideT -= dt; if (e.sideT <= 0) e.side = 0; }
    e.pos.x += mx * sp * dt; e.pos.z += mz * sp * dt;
    World.collideCircle(e.pos, e.radius, e.pos.y + 0.2, e.pos.y + 1.2, false);
    e.pos.y = Ents.groundY(e.pos.x, e.pos.z);
    e.yaw += angDiff(e.yaw, Math.atan2(mx, mz)) * Math.min(1, dt * 8);
    e.moveAmt = Math.min(1, e.moveAmt + dt * 5); e.speed = sp;
    const moved = Math.hypot(e.pos.x - ox, e.pos.z - oz);
    if (moved < sp * dt * 0.35) {
      e.blockT = (e.blockT || 0) + dt;
      probe.x = e.pos.x + mx * (e.radius + 0.8); probe.z = e.pos.z + mz * (e.radius + 0.8);
      const pc = Base.toCell(probe.x, probe.z), bid = Base.objAt(pc.i, pc.j), bo = bid ? Base.objs.get(bid) : null;
      if (bo && OBJ[bo.type].where !== 'in') {
        e.chew = bo;
        e.moveAmt = 0.3;
        if (e.cool <= 0) {
          bo.hp -= (e.big ? 45 : 9) * G.dk.edmg; e.cool = e.big ? 1.2 : 0.8; e.lunge = 0.25;
          FX.sparks(probe.x, e.pos.y + 0.8, probe.z, [0.9, 0.7, 0.4], 4, 2);
          if (bo.hp <= 0) destroyObj(bo);
        }
      } else if (e.blockT > 1.2) { e.side = Math.random() < 0.5 ? -1 : 1; e.sideT = rand(1, 2.5); e.blockT = 0; }
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
