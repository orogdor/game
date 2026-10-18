// ============================================================
//  KISKJA: öine jahiloom (orgaaniline SDF-mudel, 12 liigutatavat osa, 2 LOD-taset)
// ============================================================
const Kiskja = (() => {
  let P = null; // osad: { piv:[x,y,z], m:[lod0, lod1] }
  function decode(L) {
    const u8 = bytesOf(L.b);
    const nv = L.nv, nt = L.nt; let o = 0;
    const q = new Uint16Array(u8.buffer.slice(o, o + nv * 6)); o += nv * 6;
    const nq = new Int8Array(u8.buffer.slice(o, o + nv * 3)); o += nv * 3;
    const col = new Uint8Array(u8.buffer.slice(o, o + nv * 4)); o += nv * 4;
    const idx = new Uint16Array(u8.buffer.slice(o, o + nt * 6));
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } // CCW esikülg
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
    for (let i = 0; i < nv * 3; i++) { pos[i] = L.mn[i % 3] + q[i] * L.sc; nor[i] = nq[i] / 127; }
    return new GFX.Mesh({ pos, nor, col, idx });
  }
  function init() {
    if (P || typeof KISKJA_DATA === 'undefined') return;
    P = {};
    for (const k in KISKJA_DATA) { const d = KISKJA_DATA[k]; P[k] = { piv: d.piv, m: d.lod.map(decode) }; }
  }
  const rel = (a, b) => [P[a].piv[0] - P[b].piv[0], P[a].piv[1] - P[b].piv[1], P[a].piv[2] - P[b].piv[2]];

  function spawn(x, z, o = {}) {
    return Ents.spawn('kiskja', 'wild', x, z, Object.assign({ radius: 0.7, state: 'roam', stateT: 4, maxHp: 420, hitY: 1.3, onHurt }, o));
  }
  function spheres(e, s) {
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), x = e.pos.x, y = e.pos.y, z = e.pos.z;
    s.push([x + fx * 0.25, y + 1.4, z + fz * 0.25, 0.45, 1]);
    s.push([x + fx * 1.05, y + 1.86, z + fz * 1.05, 0.2, 2.2]);
    s.push([x, y + 0.6, z, 0.34, 0.75]);
    s.push([x - fx * 0.9, y + 1.15, z - fz * 0.9, 0.22, 0.6]);
  }
  function onHurt(e, src) {
    if (!src || !src.pos) return;
    e.target = src;
    if (e.state !== 'flee') { if (e.state !== 'charge') roar(e); e.state = 'charge'; e.stateT = 14; }
  }
  function roar(e) { if (Audio2.kiskja) Audio2.kiskja(e.pos.x, e.pos.z); e.roarT = 1.2; }
  function onKill(e) {
    if (Audio2.kiskja) Audio2.kiskja(e.pos.x, e.pos.z);
    FX.goo(e.pos.x, e.pos.y + 1.2, e.pos.z, [0.45, 0.08, 0.06], 22);
  }
  function update(e, dt) {
    // mängija ei mahu kiskja keha sisse
    if (!Player.dead) { const px = Player.pos.x - e.pos.x, pz = Player.pos.z - e.pos.z, pd = Math.hypot(px, pz); if (pd < 1.5 && pd > 0.01 && Math.abs(Player.pos.y - e.pos.y) < 2) { const k = (1.5 - pd) / pd; Player.pos.x += px * k; Player.pos.z += pz * k; } }
    e.stateT -= dt; if (e.cool > 0) e.cool -= dt; if (e.lunge > 0) e.lunge -= dt; if (e.roarT > 0) e.roarT -= dt;
    const night = Econ.isNight();
    if (e.state === 'flee') {
      if (!e.path || Ents.arrived(e)) { const a = rand(0, TAU); e.path = [{ x: e.pos.x + Math.cos(a) * 60, z: e.pos.z + Math.sin(a) * 60 }]; e.pathI = 0; }
      Ents.stepMove(e, dt, 11);
      if (e.stateT <= 0) { e.state = 'roam'; e.target = null; }
      return;
    }
    const range = night ? 70 : 40;
    const t0 = e.target;
    if (!t0 || !t0.alive || (t0.kind === 'player' && (Player.dead || G.mode === 'build'))) {
      const th = Ents.nearestHuman(e, range);
      e.target = th ? th.e : null;
      if (e.target && e.state === 'roam') { e.state = 'stalk'; e.stateT = rand(5, 9); e.side = Math.random() < 0.5 ? -1 : 1; }
    }
    if (e.hp < e.maxHp * 0.2 && e.state !== 'flee' && Math.random() < dt * 0.4) { e.state = 'flee'; e.stateT = 8; e.target = null; return; }
    const t = e.target;
    if (!t && e.lure && e.lure.t > 0) {
      e.state = 'roam';
      const L = e.lure, dl = Math.hypot(L.x - e.pos.x, L.z - e.pos.z);
      if (!e.path || Ents.arrived(e) || e.stateT <= 0) { e.stateT = rand(4, 8); const a = rand(0, TAU), r = dl > 30 ? 0 : rand(6, 18); e.path = [{ x: L.x + Math.cos(a) * r, z: L.z + Math.sin(a) * r }]; e.pathI = 0; }
      Ents.stepMove(e, dt, dl > 30 ? 6.5 : 3.2);
      return;
    }
    if (!t) {
      e.state = 'roam';
      if (!e.path || Ents.arrived(e) || e.stateT <= 0) {
        e.stateT = rand(6, 12);
        let tx, tz;
        if (night && Math.random() < 0.6) { const a = rand(0, TAU); tx = Math.cos(a) * rand(45, 90); tz = Math.sin(a) * rand(45, 90); }
        else { const a = rand(0, TAU); tx = e.pos.x + Math.cos(a) * 40; tz = e.pos.z + Math.sin(a) * 40; }
        if (Ents.lightNear(tx, tz)) { tx = e.pos.x - (tx - e.pos.x); tz = e.pos.z - (tz - e.pos.z); }
        e.path = [{ x: tx, z: tz }]; e.pathI = 0;
      }
      Ents.stepMove(e, dt, 3.6);
      return;
    }
    const dx = t.pos.x - e.pos.x, dz = t.pos.z - e.pos.z, d = Math.hypot(dx, dz);
    if (d > range * 1.6) { e.target = null; return; }
    if (e.state === 'stalk') {
      // ringleb saaki 18-26 m kaugusel, siis ründab
      const a = Math.atan2(dz, dx) + Math.PI + e.side * 0.9;
      const r = 22;
      if (!e.path || Ents.arrived(e) || Math.random() < dt * 1.5) { e.path = [{ x: t.pos.x + Math.cos(a) * r, z: t.pos.z + Math.sin(a) * r }]; e.pathI = 0; }
      Ents.stepMove(e, dt, 5.2);
      if (e.stateT <= 0 || d < 12) { e.state = 'charge'; e.stateT = 12; roar(e); }
      return;
    }
    // charge
    if (!e.path || e.pathI >= e.path.length || Math.random() < dt * 3) {
      if (Base.isInside(t.pos.x, t.pos.z) && d < 30) Ents.goTo(e, t.pos.x, t.pos.z); else { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; }
    }
    // pea ja küünised ulatuvad ~1,5 m ette: hoia vahet, et ohver ei jääks mudeli sisse
    const STAND = 2.6;
    if (d > STAND) Ents.stepMove(e, dt, d < 10 ? 12.5 : 10);
    else {
      e.moveAmt = Math.max(0, (e.moveAmt || 0) - dt * 4);
      if (d < STAND - 0.3) { const k = Math.min(STAND - d, dt * 6) / Math.max(d, 0.01); e.pos.x -= dx * k; e.pos.z -= dz * k; World.collideCircle(e.pos, e.radius, e.pos.y + 0.3, e.pos.y + 1.7, false); e.pos.y = Ents.groundY(e.pos.x, e.pos.z); }
    }
    if (d < 4) Ents.face(e, t.pos.x, t.pos.z, dt, 10);
    if (d < 3.1 && e.cool <= 0 && Math.abs(t.pos.y - e.pos.y) < 2.2) {
      Ents.damage(t, 28 * G.dk.edmg, e); e.cool = 1.15; e.lunge = 0.45;
      if (Audio2.kiskja && Math.random() < 0.4) Audio2.kiskja(e.pos.x, e.pos.z);
    }
    if (e.stateT <= 0 && d > 30) { e.state = 'stalk'; e.stateT = rand(4, 8); }
  }

  // ---------- joonistamine ----------
  const R = M4.create();
  const HURT_T = [1.6, 0.6, 0.5, 0.2];
  function draw(e) {
    if (!P) return;
    if (!e.km) { e.km = []; for (let i = 0; i < 12; i++) e.km.push(M4.create()); }
    const ms = e.km, tint = e.hurtT > 0 ? HURT_T : null;
    const lod = Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 38 ? 1 : 0;
    const dead = !e.alive, dk = dead ? Math.min(1, e.deathT * 2.2) : 0;
    const ph = e.phase, mv = e.moveAmt || 0, t = performance.now() / 1000 + e.id;
    const run = clamp((e.speed || 0) / 10, 0, 1) * mv;
    const atk = e.lunge > 0 ? Math.sin((1 - e.lunge / 0.45) * Math.PI) : 0;
    const roar = e.roarT > 0 ? Math.sin(Math.min(1, (1.2 - e.roarT) / 1.2) * Math.PI) : 0;
    M4.compose(R, e.pos.x, e.pos.y - dk * 0.78, e.pos.z, e.yaw, 0, dk * 1.45);
    const breathe = Math.sin(t * 1.7) * 0.012;
    const bob = Math.abs(Math.sin(ph)) * 0.07 * mv;
    const b = P.body.piv;
    // keha
    M4.child(ms[0], R, b[0], b[1] + bob - 0.04 * run + breathe, b[2], Math.sin(ph) * 0.04 * mv, 0.12 * run + atk * 0.18 - roar * 0.12, Math.sin(ph) * 0.05 * mv);
    GFX.draw(P.body.m[lod], ms[0], tint);
    // pea
    let hy = 0;
    if (e.target && e.target.pos && !dead) { hy = clamp(angDiff(e.yaw, Math.atan2(e.target.pos.x - e.pos.x, e.target.pos.z - e.pos.z)), -0.7, 0.7); }
    let r = rel('head', 'body');
    M4.child(ms[1], ms[0], r[0], r[1], r[2], hy + Math.sin(t * 0.7) * 0.06 * (1 - mv), -0.1 * run - roar * 0.45 + atk * 0.25 + Math.sin(t * 1.1) * 0.03 + dk * 0.5, Math.sin(t * 0.9) * 0.05);
    GFX.draw(P.head.m[lod], ms[1], tint);
    // saba
    r = rel('tail1', 'body');
    const tw = Math.sin(t * 1.3) * 0.12 + Math.sin(ph * 0.5) * 0.18 * mv;
    M4.child(ms[2], ms[0], r[0], r[1], r[2], tw, -0.1 * run + dk * 0.3, 0); GFX.draw(P.tail1.m[lod], ms[2], tint);
    r = rel('tail2', 'tail1');
    M4.child(ms[3], ms[2], r[0], r[1], r[2], Math.sin(t * 1.3 - 0.8) * 0.2 + Math.sin(ph * 0.5 - 0.8) * 0.25 * mv, -0.12 * run, 0); GFX.draw(P.tail2.m[lod], ms[3], tint);
    // käed ja jalad
    for (let s = 0; s < 2; s++) {
      const k = s ? 'R' : 'L', sg = s ? 1 : -1, sw = Math.sin(ph + s * Math.PI);
      r = rel('armU' + k, 'body');
      M4.child(ms[4 + s], ms[0], r[0], r[1], r[2], 0, -sw * 0.35 * mv - atk * (s ? 1.0 : 0.6) - roar * 0.5 + Math.sin(t * 1.4 + s) * 0.04 + dk * 0.6, roar * sg * 0.35);
      GFX.draw(P['armU' + k].m[lod], ms[4 + s], tint);
      r = rel('armF' + k, 'armU' + k);
      M4.child(ms[6 + s], ms[4 + s], r[0], r[1], r[2], 0, -0.25 * mv + atk * (s ? 0.9 : 0.5) - roar * 0.3, 0);
      GFX.draw(P['armF' + k].m[lod], ms[6 + s], tint);
      // digitigraadne samm: reis ette-taha, sääre põlv vastupidi
      const lw = Math.sin(ph + s * Math.PI);
      const lift = Math.max(0, Math.cos(ph + s * Math.PI));
      const lp = P['legU' + k].piv;
      M4.child(ms[8 + s], R, lp[0], lp[1] + bob - 0.04 * run, lp[2], 0, lw * 0.55 * mv + 0.08 * run - lift * 0.2 * mv - dk * 0.4, 0);
      GFX.draw(P['legU' + k].m[lod], ms[8 + s], tint);
      r = rel('legL' + k, 'legU' + k);
      M4.child(ms[10 + s], ms[8 + s], r[0], r[1], r[2], 0, -lift * 0.75 * mv - lw * 0.15 * mv + dk * 0.6, 0);
      GFX.draw(P['legL' + k].m[lod], ms[10 + s], tint);
    }
    if (!dead && lod === 0) {
      // silmad helendavad öösel
      const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
      if (Econ.isNight()) GFX.addLight(e.pos.x + fx * 1.3, e.pos.y + 1.95, e.pos.z + fz * 1.3, 3.5, 1.0, 0.55, 0.1, 0.6);
    }
  }
  // ---------- tekitamine ----------
  function nightSpawn() {
    const day = G.time.day;
    if (day < 2) return;
    const n = Math.min(6, Math.round((0.5 + day * 0.35) * (G.dk.raid || 1)));
    for (let i = 0; i < n; i++) { const a = rand(0, TAU), r = rand(170, 260); spawn(Math.cos(a) * r, Math.sin(a) * r); }
  }
  function clearNight() {
    for (const e of Ents.list) if (e.kind === 'kiskja' && e.alive && e.state !== 'charge') e.remove = true;
  }
  return { init, spawn, spheres, update, draw, onHurt, onKill, nightSpawn, clearNight };
})();
