// ============================================================
//  TUNNELID: vanad koloonia maanteetunnelid läbi mägede. Pimedad, poolvarisenud,
//  seal elavad jõehobu-suurused kurjad urutulnukad (behemotid). Tunnelitesse on peidetud
//  varustus, mida mujalt ei saa (kaarkiirgur, tunnelirotti eksoskelett).
// ============================================================
const Tunnels = (() => {
  let mesh = null, glow = null, B = null;
  const lamps = [];      // { x, y, z, ok }
  const ID = M4.create();
  const W = 9, HT = 6.5;
  const list = () => World.sites.tunnels || [];
  function floorAt(T, t) { return T.hA + (T.hB - T.hA) * clamp(t, 0, 1); }
  function P(T, t, lat) { const d = t * T.L; return { x: T.ax + T.ux * d + T.uz * lat, z: T.az + T.uz * d - T.ux * lat }; }   // lat > 0: paremale (u-st)

  function build(rng) {
    lamps.length = 0;
    const R = (a, b) => a + rng() * (b - a);
    const detail0 = MB.detail; MB.detail = false;
    const b = new MB(); b.jit = 0; const gl = new MB(); gl.jit = 0;
    const CON = [0.34, 0.33, 0.31], CON2 = [0.24, 0.23, 0.22], ASP = [0.13, 0.13, 0.14], FR = [0.18, 0.18, 0.19], HY = [0.86, 0.66, 0.12], HB = [0.07, 0.07, 0.07], ROCK = [0.5, 0.33, 0.24], RUST = [0.45, 0.27, 0.15];
    for (const T of list()) {
      const yaw = Math.atan2(T.ux, T.uz), slope = -Math.atan2(T.hB - T.hA, T.L);
      const n = Math.ceil(T.L / 4), sl = T.L / n;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n, c = P(T, t, 0), y = floorAt(T, t);
        b.push().tf(c.x, y, c.z, yaw, slope, 0);
        b.color(ASP, MAT.WORN).box(0, -0.25, 0, W, 0.5, sl + 0.05);
        if (k % 2 === 0) b.color([0.6, 0.52, 0.3], MAT.MATTE).box(0, 0.01, 0, 0.16, 0.02, sl * 0.5);
        for (const sx of [-1, 1]) {
          b.color(CON2, MAT.WORN).boxB(sx * 3.95, 0, 0, 1.1, 0.3, sl + 0.05);                       // kõnnitee
          b.color(k % 3 === 1 ? CON2 : CON, MAT.WORN).box(sx * 4.7, HT / 2, 0, 0.4, HT + 0.2, sl + 0.05);   // sein
          b.color(HB, MAT.MATTE).box(sx * 4.48, 0.65, 0, 0.04, 0.5, sl);                            // tume jalamiriba
        }
        b.color(CON2, MAT.WORN).box(0, HT + 0.2, 0, W + 1.0, 0.4, sl + 0.05);                       // lagi
        b.color(RUST, MAT.RUST).push().tf(-4.2, 5.3, 0, 0, Math.PI / 2, 0).cyl(0, -sl / 2, 0, 0.22, 0.22, sl, 8, false).pop();   // torud
        b.color(FR, MAT.METAL).push().tf(-4.2, 4.75, 0, 0, Math.PI / 2, 0).cyl(0, -sl / 2, 0, 0.13, 0.13, sl, 8, false).pop();
        b.color(FR, MAT.METAL).box(4.25, 5.6, 0, 0.5, 0.08, sl);                                   // kaablirenn
        if (k % 2 === 0) {   // kaarribi
          for (const sx of [-1, 1]) { b.color(FR, MAT.METAL).boxB(sx * 4.35, 0, 0, 0.4, HT, 0.45); b.color(FR, MAT.METAL).push().tf(sx * 3.7, HT - 0.5, 0, 0, 0, sx * 0.7).box(0, 0, 0, 1.6, 0.35, 0.45).pop(); }
          b.color(FR, MAT.METAL).box(0, HT - 0.1, 0, W, 0.35, 0.45);
        }
        if (k % 3 === 0) {   // laevalgusti (osa katki)
          const ok = rng() < 0.7;
          gl.push().tf(c.x, y, c.z, yaw, slope, 0).color(ok ? [1.0, 0.82, 0.5] : [0.15, 0.12, 0.1], ok ? MAT.GLOW : MAT.MATTE).box(0, HT - 0.05, 0, 2.4, 0.08, 0.5).pop();
          const lp = P(T, t, 0); lamps.push({ x: lp.x, y: y + HT - 0.4, z: lp.z, ok, T });
        }
        if (k % 7 === 3) { gl.push().tf(c.x, y, c.z, yaw, slope, 0).color([1.0, 0.15, 0.08], MAT.GLOW).box(4.48, 2.3, 0, 0.04, 0.25, 0.25).pop(); }   // avariituli
        b.pop();
        // varing: kivid ja kokkukukkunud laepaneel
        if (rng() < 0.12) { const sx = rng() < 0.5 ? -1 : 1; for (let q = 0; q < 5; q++) { const p = P(T, t + R(-0.01, 0.01), sx * R(1.5, 3.8)); b.color(rng() < 0.5 ? CON : ROCK, MAT.WORN).push().tf(p.x, y + R(0.1, 0.5), p.z, rng() * TAU, R(-0.4, 0.4), R(-0.4, 0.4)).box(0, 0, 0, R(0.6, 1.5), R(0.4, 0.9), R(0.6, 1.4)).pop(); } }
      }
      // portaalid: fassaad kuni kaaneni, kaar, hoiatustriibud, tuled
      for (const end of [0, 1]) {
        const t = end, c = P(T, t, 0), y = floorAt(T, t), top = (T.lid && T.lid[end ? T.lid.length - 1 : 0]) || y + 12, Hh = top - y + 1.5;
        const fyaw = yaw + (end ? Math.PI : 0);
        b.push().tf(c.x, y, c.z, fyaw, 0, 0);
        for (const sx of [-1, 1]) { b.color(CON, MAT.WORN).boxB(sx * 8.4, -1, -0.6, 7.2, Hh + 1, 1.6); b.color(FR, MAT.METAL).boxB(sx * 5.0, -0.2, -0.2, 0.9, HT + 0.4, 1.9); }
        b.color(CON, MAT.WORN).boxB(0, HT + 0.4, -0.6, 10.4, Hh - HT - 0.4, 1.6);
        b.color(FR, MAT.METAL).boxB(0, HT, -0.2, 10.8, 0.7, 1.9);
        for (let q = 0; q < 14; q++) b.color(q & 1 ? HB : HY, MAT.MATTE).boxB(-5.4 + (q + 0.5) * 10.8 / 14 - 0.386, HT + 0.05, 0.76, 10.8 / 14, 0.6, 0.04);
        for (const sx of [-1, 1]) for (let q = 0; q < 6; q++) b.color(q & 1 ? HB : HY, MAT.MATTE).boxB(sx * 5.0, q * HT / 6, 0.76, 0.92, HT / 6, 0.04);
        b.color([0.12, 0.13, 0.14], MAT.METAL).boxB(0, HT + 1.2, 0.3, 4.2, 1.0, 0.1);
        b.pop();
        gl.push().tf(c.x, y, c.z, fyaw, 0, 0).color([1.0, 0.55, 0.15], MAT.GLOW).boxB(0, HT + 1.45, 0.42, 3.6, 0.5, 0.03).color([1, 0.15, 0.08], MAT.GLOW).boxB(-5, HT + 0.9, 0.9, 0.3, 0.3, 0.3).boxB(5, HT + 0.9, 0.9, 0.3, 0.3, 0.3).pop();
        for (const sx of [-1, 1]) { const a = P(T, t, sx * 4.9), b2 = P(T, t, sx * 12.5); World.addCol({ t: 's', ax: a.x, az: a.z, bx: b2.x, bz: b2.z, r: 0.8, y0: y - 2, y1: top + 2, kind: 'struct' }); }
      }
      // kaas mäe peal (katab kraavi)
      if (T.lid) { const m = T.lid.length; for (let k = 0; k < m; k++) { const t = (k + 0.5) / m, c = P(T, t, 0); b.color(k % 2 ? ROCK : [0.46, 0.3, 0.22], MAT.WORN).push().tf(c.x, T.lid[k] - 2.8, c.z, yaw, 0, 0).boxB(0, 0, 0, 26, 3.0, T.L / m + 0.4).pop(); } }
      // seinte kokkupõrked
      const ns = Math.ceil(T.L / 10);
      for (let k = 0; k < ns; k++) for (const sx of [-1, 1]) {
        const t0 = k / ns, t1 = (k + 1) / ns, a = P(T, t0, sx * 4.55), c = P(T, t1, sx * 4.55), y0 = Math.min(floorAt(T, t0), floorAt(T, t1));
        World.addCol({ t: 's', ax: a.x, az: a.z, bx: c.x, bz: c.z, r: 0.3, y0: y0 - 2, y1: y0 + HT + 2, kind: 'struct' });
      }
      // peidetud varustus: külgnišš tunneli keskel
      T.loot = P(T, 0.5 + (T.id % 2 ? 0.12 : -0.12), (T.id % 2 ? -1 : 1) * 3.6);
      { const tt = 0.5 + (T.id % 2 ? 0.12 : -0.12), y = floorAt(T, tt), c = P(T, tt, (T.id % 2 ? -1 : 1) * 3.9);
        b.color([0.3, 0.32, 0.3], MAT.METAL).push().tf(c.x, y + 0.3, c.z, yaw, 0, 0).boxB(0, 0, 0, 1.2, 1.9, 0.9).pop();
        gl.push().tf(c.x, y + 0.3, c.z, yaw, 0, 0).color([0.3, 1.0, 0.5], MAT.GLOW).boxB(0, 1.5, 0.46, 0.5, 0.12, 0.02).pop(); }
      // pesad: luud ja lima
      T.nests = [0.28, 0.55, 0.8].map((t) => P(T, t, R(-1.5, 1.5)));
      for (const q of T.nests) { const y = floorAt(T, (Math.hypot(q.x - T.ax, q.z - T.az)) / T.L); for (let k = 0; k < 7; k++) { const a = rng() * TAU; b.color([0.82, 0.78, 0.66], MAT.WORN).push().tf(q.x + Math.cos(a) * R(1, 3), y + 0.1, q.z + Math.sin(a) * R(1, 3), rng() * TAU, 0, Math.PI / 2).cyl(0, -0.5, 0, 0.07, 0.05, R(0.8, 1.6), 6, true).pop(); } gl.color([0.45, 0.85, 0.15], MAT.GLOW).sphere(q.x, y + 0.02, q.z, 1.6, 10, 4, 0.06); }
    }
    mesh = b.p.length ? b.build() : null; glow = gl.p.length ? gl.build() : null;
    MB.detail = detail0;
  }
  function inside(x, z) { const q = World.tunnelAt(x, z); return q && q.lat < 5 && q.t > 0.01 && q.t < 0.99 ? q : null; }
  function draw() {
    if (!mesh || !list().length) return;
    const cam = GFX.cam.pos;
    let near = false; for (const T of list()) if (Math.hypot(cam.x - (T.ax + T.bx) / 2, cam.z - (T.az + T.bz) / 2) < T.L / 2 + 700) near = true;
    if (!near) return;
    GFX.draw(mesh, ID, null, null, { rust: 0.9 });
    if (glow) GFX.draw(glow, ID, null, null, { shadow: false });
    // valgus ainult kaamera lähedal olevatest lampidest
    let n = 0;
    for (const L of lamps) { if (!L.ok || n >= 5) continue; if (Math.abs(L.x - cam.x) > 30 || Math.abs(L.z - cam.z) > 30) continue; GFX.addLight(L.x, L.y, L.z, 13, 1.0, 0.8, 0.55, 1.5); n++; }
  }

  // ---------- behemot: jõehobu-suurune urutulnukas ----------
  let BM = null;
  function initMeshes() {
    if (BM) return BM;
    BM = {};
    const { CH, CH2, PLATE, BELLY, GLOW, EYE, BONE, MOUTH } = AS, md0 = MB.detail; MB.detail = true;
    let b = new MB(); b.jit = 0;   // tünnkeha: lihaseline, kõhualune lamedam, soomusplaadid ja ogad
    Org.blob(b, 0, 1.6, -0.25, 1.55, 1.25, 2.1, CH2, { amp: 0.08, flatBelly: 0.8, seg: 22, rings: 14 });
    Org.blob(b, 0, 1.75, 1.0, 1.25, 1.1, 1.0, CH2, { amp: 0.07 });
    Org.blob(b, 0, 1.05, -0.2, 1.25, 0.6, 1.8, BELLY, { amp: 0.05 });
    for (let k = 0; k < 7; k++) { const z = -1.7 + k * 0.52, w = 1.25 - Math.abs(k - 3) * 0.12; const pts = []; for (let q = 0; q <= 8; q++) { const a = Math.PI * (0.12 + 0.76 * q / 8); pts.push([Math.cos(a) * w, 2.15 + Math.sin(a) * (0.8 - Math.abs(k - 3) * 0.05), z, 0.13]); } Org.tube(b, pts, 6, PLATE); Org.claw(b, 0, 3.0 - Math.abs(k - 3) * 0.06, z, 0, 1, -0.3, 0.55 - Math.abs(k - 3) * 0.05, 0.11, -0.2, BONE); }
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; b.color(GLOW, MAT.GLOW).sphere(Math.cos(a) * 1.4, 1.55 + Math.sin(a) * 0.3, -0.6 + Math.sin(a) * 0.9, 0.12, 6, 4, 1); }
    Org.tube(b, [[0, 1.6, -2.1, 0.5], [0, 1.4, -2.7, 0.35], [0, 1.0, -3.1, 0.2], [0, 0.6, -3.3, 0.05]], 10, CH);
    BM.body = b.build();
    b = new MB(); b.jit = 0;   // pea: lai lame kolp, kolm silmapaari, välja ulatuvad kihvad
    Org.blob(b, 0, 0.25, 0.8, 0.85, 0.5, 1.0, CH2, { amp: 0.09, ridge: 3 });
    Org.blob(b, 0, 0.55, 0.55, 0.7, 0.25, 0.75, PLATE, { amp: 0.08 });
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * (0.32 + k * 0.12), 0.48 - k * 0.04, 1.45 - k * 0.2, 0.07 - k * 0.012, 8, 5, 1);
    for (const sx of [-1, 1]) { Org.claw(b, sx * 0.55, -0.05, 1.5, sx * 0.25, -0.1, 1, 0.9, 0.14, 0.6, BONE); Org.claw(b, sx * 0.7, 0.55, 0.3, sx * 0.6, 0.6, -0.4, 0.7, 0.1, 0.4, BONE); }
    for (let k = 0; k < 7; k++) Org.claw(b, -0.45 + k * 0.15, -0.05, 1.62, 0, -1, 0.15, 0.22, 0.04, 0.1, BONE);
    BM.head = b.build();
    b = new MB(); b.jit = 0;   // alalõug, sees kurgu helendus
    Org.blob(b, 0, -0.2, 0.75, 0.75, 0.28, 0.95, CH, { amp: 0.06, flatBelly: 0.8 });
    Org.blob(b, 0, -0.02, 0.8, 0.55, 0.06, 0.75, MOUTH, { amp: 0.04, mat: MAT.MATTE });
    b.color(GLOW, MAT.GLOW).sphere(0, -0.02, 0.3, 0.18, 8, 5, 0.6);
    for (let k = 0; k < 7; k++) Org.claw(b, -0.45 + k * 0.15, 0.0, 1.55, 0, 1, 0.1, 0.2, 0.04, 0.1, BONE);
    BM.jaw = b.build();
    b = new MB(); b.jit = 0;   // jalg: paks ja liigeseline, kolm luuküünist
    Org.limb(b, [[0, 0.1, 0], [0, -0.55, 0.12], [0, -1.3, 0.05]], 0.48, 0.38, CH, 0);
    for (let k = 0; k < 3; k++) { const a = (k - 1) * 0.55; Org.claw(b, Math.sin(a) * 0.32, -1.25, Math.cos(a) * 0.3 + 0.05, Math.sin(a), -0.6, Math.cos(a), 0.4, 0.09, 0.4, BONE); }
    BM.leg = b.build();
    MB.detail = md0;
    return BM;
  }
  function spawnBeast(T, p) {
    const y = World.heightAt(p.x, p.z);
    const e = Ents.spawn('beast', 'wild', p.x, p.z, { maxHp: 1400, radius: 1.7, state: 'roam', home: { x: p.x, z: p.z }, tunnel: T.id, cool: 0, stateT: rand(2, 6), hitY: 1.4, hitR: 1.4, yaw: Math.atan2(T.ux, T.uz) });
    e.hp = e.maxHp; e.pos.y = y;
    return e;
  }
  const prey = (o) => o.alive && !o.inVehicle && (o.kind === 'human' || (o.kind === 'player' && !Player.dead && G.mode !== 'build'));
  function beastAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    if (e.bite > 0) e.bite -= dt;
    if (e.chargeCd > 0) e.chargeCd -= dt;
    e.stateT -= dt;
    const homeD = Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z);
    if (e.state !== 'hunt') {
      if ((e.scan = (e.scan || 0) - dt) <= 0) {
        e.scan = 0.6;
        let best = null, bd = 24;
        for (const o of Ents.list) { if (!prey(o)) continue; const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z); if (d < bd && Math.abs(o.pos.y - e.pos.y) < 4) { bd = d; best = o; } }
        if (best) { e.state = 'hunt'; e.target = best; e.stateT = 25; roar(e); return; }
      }
      // tukub pesas, vahel liigub tunnelis edasi-tagasi
      if (!e.path || Ents.arrived(e) || e.stateT <= 0) { e.stateT = rand(5, 12); if (Math.random() < 0.5) { const T = list()[e.tunnel], ang = Math.atan2(T.ux, T.uz), d = rand(-14, 14); Ents.goTo(e, e.home.x + Math.sin(ang) * d, e.home.z + Math.cos(ang) * d); } else e.path = null; }
      if (e.path) Ents.stepMove(e, dt, 1.4); else e.moveAmt = Math.max(0, e.moveAmt - dt * 3);
      e.speed = 1.4;
      return;
    }
    const t = e.target;
    if (!t || !t.alive || t.inVehicle && !(t.inVehicle && t.inVehicle.type === 'mech') || e.stateT <= 0 || homeD > 85 || Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z) > 55) {
      if (t === Player && Player.vehicle && Player.vehicle.type === 'mech' && homeD < 85 && e.stateT > 0) { /* mech: ründab ka masinat */ }
      else { e.state = 'roam'; e.target = null; Ents.goTo(e, e.home.x, e.home.z); return; }
    }
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    Ents.face(e, t.pos.x, t.pos.z, dt, e.charge > 0 ? 1.5 : 3.5);
    // rünnak: kihvad
    if (d < 3.6 && e.cool <= 0) {
      e.cool = 1.5; e.bite = 0.45;
      const dmg = (e.charge > 0 ? 55 : 34) * G.dk.edmg;
      if (t === Player && Player.vehicle) { Player.vehicle.hp -= dmg * 1.5; Player.vehicle.hurtT = 0.3; UI.shake(0.4); }
      else Ents.damage(t, dmg, e);
      if (t === Player && !Player.vehicle) { const k = 7 / Math.max(d, 0.5); Player.vel.x += (t.pos.x - e.pos.x) * k; Player.vel.z += (t.pos.z - e.pos.z) * k; Player.vel.y = 4; UI.shake(0.5); }
      Audio2.crab(e.pos.x, e.pos.z); e.charge = 0; e.stateT = 25;
    }
    // laeng: lühike väga kiire sööst
    if (e.charge > 0) e.charge -= dt;
    else if (d > 7 && d < 22 && (e.chargeCd || 0) <= 0 && Math.random() < dt * 1.2) { e.charge = 1.4; e.chargeCd = rand(5, 8); roar(e); }
    const sp = e.charge > 0 ? 13 : 5.6;
    if (d > 3.0) { if (!e.path || Math.random() < dt * 3) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; } Ents.stepMove(e, dt, sp); }
    else e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
    e.speed = sp;
    if (e.charge > 0 && Math.random() < 0.5) FX.dust(e.pos.x + rand(-1, 1), e.pos.y + 0.2, e.pos.z + rand(-1, 1), 3, 1.5);
  }
  function roar(e) { Audio2.stalker(e.pos.x, e.pos.z); Audio2.crab(e.pos.x, e.pos.z); if (Math.hypot(e.pos.x - Player.pos.x, e.pos.z - Player.pos.z) < 30) UI.shake(0.3); }
  function hurt(e, src) { if (!src || !src.pos || !e.alive) return; if (e.state !== 'hunt') roar(e); e.state = 'hunt'; e.target = src; e.stateT = 25; }
  function onKill(e) { FX.goo(e.pos.x, e.pos.y + 1.2, e.pos.z, [0.45, 0.85, 0.15], 30); Audio2.crab(e.pos.x, e.pos.z); e.acid = randi(6, 9); e.harvestable = true; G.flags.beastKills = (G.flags.beastKills || 0) + 1; }
  function spheres(e, s) {
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), x = e.pos.x, y = e.pos.y, z = e.pos.z;
    s.push([x - fx * 0.2, y + 1.55, z - fz * 0.2, 1.5, 1]); s.push([x + fx * 1.2, y + 1.3, z + fz * 1.2, 1.1, 1]); s.push([x + fx * 2.3, y + 1.3, z + fz * 2.3, 0.65, 1.7]);
  }
  function drawBeast(e) {
    if (!BM) initMeshes();
    const ms = e.ms || (e.ms = Array.from({ length: 8 }, () => M4.create())), R0 = ms[7];
    const dead = !e.alive, tint = e.hurtT > 0 ? [1.6, 0.6, 0.5, 0.2] : dead ? [0.45, 0.42, 0.4, 0] : null;
    const ph = e.phase * 1.1, mv = e.moveAmt, bob = dead ? 0 : Math.abs(Math.sin(ph)) * 0.08 * mv;
    M4.compose(R0, e.pos.x, e.pos.y + bob - (dead ? 0.5 : 0), e.pos.z, e.yaw, 0, dead ? 1.2 : 0);
    GFX.draw(BM.body, R0, tint, null, { rust: 0.15 });
    const open = e.bite > 0 ? 0.7 : 0.08 + Math.sin(ph * 0.5) * 0.03;
    M4.child(ms[0], R0, 0, 1.55, 1.7, 0, -open * 0.3 + (e.charge > 0 ? 0.25 : 0), 0); GFX.draw(BM.head, ms[0], tint, null, { rust: 0.15 });
    M4.child(ms[1], ms[0], 0, -0.05, 0.1, 0, open, 0); GFX.draw(BM.jaw, ms[1], tint, null, { rust: 0.15 });
    const LG = [[0.85, 1.35, 1.0, 0], [-0.85, 1.35, 1.0, Math.PI], [0.85, 1.35, -1.2, Math.PI], [-0.85, 1.35, -1.2, 0]];
    for (let k = 0; k < 4; k++) { const [lx, ly, lz, o] = LG[k]; M4.child(ms[2 + k], R0, lx, ly, lz, 0, dead ? 0.8 : Math.sin(ph + o) * 0.45 * mv, 0); GFX.draw(BM.leg, ms[2 + k], tint, null, { rust: 0.15 }); }
    if (!dead && GFX.env.night > 0.2) GFX.addLight(e.pos.x + Math.sin(e.yaw) * 2.6, e.pos.y + 1.8, e.pos.z + Math.cos(e.yaw) * 2.6, 5, 1.0, 0.4, 0.1, 0.8);
  }

  // ---------- populatsioon ja varustus ----------
  let tickT = 0;
  function tick(dt) {
    if (!list().length) return;
    if (!G.flags.tunnelLoot) { G.flags.tunnelLoot = true; spawnLoot(); }
    if ((tickT -= dt) > 0) return; tickT = 20;
    for (const T of list()) {
      const alive = Ents.list.filter((e) => e.kind === 'beast' && e.alive && e.tunnel === T.id).length;
      const mid = P(T, 0.5, 0), pd = Math.hypot(Player.pos.x - mid.x, Player.pos.z - mid.z);
      const day = G.time.day, last = (G.flags.tunRespawn || {})[T.id];
      if (alive === 0 && pd > T.L / 2 + 120 && (last === undefined || day - last >= 2)) {
        for (const p of T.nests) spawnBeast(T, p);
        (G.flags.tunRespawn = G.flags.tunRespawn || {})[T.id] = day;
      }
    }
  }
  function spawnLoot() {
    const L = list(); if (!L.length) return;
    const sets = [[['arc', 1], ['ammo_pl', 90], ['medkit', 2]], [['exo', 1], ['ammo_pl', 60], ['trauma', 1]], [['ammo_pl', 120], ['stim', 2], ['grenade', 3]]];
    if (L.length === 1) sets[0] = [['arc', 1], ['exo', 1], ['ammo_pl', 120], ['medkit', 2]];
    L.forEach((T, k) => { const p = T.loot; if (!p) return; const items = sets[k % sets.length].filter(([id]) => ITEMS[id]); Ents.pickups.push({ kind: 'bag', x: p.x, y: Ents.groundY(p.x, p.z), z: p.z, data: { items }, id: Math.random(), city: true }); });
  }
  function reset() { tickT = 0; }
  return { build, draw, inside, beastAI, hurt, onKill, spheres, drawBeast, initMeshes, tick, reset, spawnLoot };
})();
