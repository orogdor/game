// ============================================================
//  VEEL VIIS TULNUKAT (ühtne stiil AS):
//   kull      – Liikumisekütt: väga ohtlik lendur, lendab oma marsruuti mööda üle kaardi. Näeb AINULT
//               liikuvaid inimesi ja loomi – seisa paigal ja ta kaotab sind. Jahib ka kitsi.
//   angerjas  – Liivaangerjas: ujub liiva all (näha ainult seljaogad ja liivavirvendus), hüppab välja hammustama.
//   sülitaja  – Kivistunud sülitaja: paigal seisev taim-tulnukas, tulistab happekuule kõige pihta, mis lähedal.
//   pesaema   – Pesaema: aeglane hiiglane, kes poetab vaenlaste lähedal kiireid vastseid.
//   varjur    – Varjuluuraja: öine, peaaegu nähtamatu; hüppab (blink) saagi selja taha, lööb ja kaob.
// ============================================================
const Fauna2 = (() => {
  const KINDS = { hawk: 1, eel: 1, spitter: 1, mother: 1, larva: 1, phantom: 1 };
  let M = null, route = null;
  function initMeshes() {
    if (M) return M;
    M = {};
    const { CH, CH2, PLATE, BELLY, GLOW, EYE, BONE, MOUTH, MEM } = AS, md0 = MB.detail; MB.detail = true;
    // Liikumisekütt: kitsas kiilukujuline keha, pikk kael, sirbinokk, kuus silma, haaratsküünised, okkasaba
    let b = new MB(); b.jit = 0;
    Org.blob(b, 0, 0, 0, 0.55, 0.42, 1.0, CH, { amp: 0.07, ridge: 5 });
    Org.blob(b, 0, -0.2, -0.15, 0.32, 0.22, 0.45, GLOW, { amp: 0.05, mat: MAT.GLOW });
    Org.tube(b, [[0, 0.05, 0.8, 0.26], [0, 0.18, 1.3, 0.19], [0, 0.2, 1.75, 0.16]], 10, CH2);
    Org.blob(b, 0, 0.2, 2.0, 0.24, 0.2, 0.4, CH2, { amp: 0.06 });
    Org.claw(b, 0, 0.22, 2.3, 0, -0.15, 1, 0.75, 0.13, -0.5, BONE);   // sirbinokk
    Org.claw(b, 0, 0.1, 2.25, 0, -0.3, 1, 0.45, 0.08, 0.3, BONE);
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * 0.16, 0.3, 2.05 + k * 0.1, 0.04, 6, 4, 1);
    Org.tube(b, [[0, 0, -0.9, 0.3], [0, 0.05, -1.6, 0.18], [0, 0.1, -2.3, 0.08], [0, 0.15, -2.8, 0.0]], 8, CH);
    for (let k = 0; k < 5; k++) Org.claw(b, 0, 0.35 - k * 0.04, 0.4 - k * 0.55, 0, 1, -0.5, 0.45, 0.06, -0.3, BONE);
    for (const sx of [-1, 1]) Org.limb(b, [[sx * 0.3, -0.3, 0.3], [sx * 0.4, -0.75, 0.6], [sx * 0.3, -1.0, 1.0]], 0.08, 0.05, CH, 0.3);   // haaratsid
    M.hawk = b.build();
    b = new MB(); b.jit = 0;   // tiib (+x 4.5 m): luusõrmed ja nahk
    const T = [[4.4, 0.1, 0.4], [4.2, 0, -0.4], [3.2, -0.05, -1.0], [1.8, -0.05, -1.1], [0.4, 0, -0.6]];
    Org.tube(b, [[0, 0, 0.1, 0.13], [1.5, 0.1, 0.45, 0.11], [2.8, 0.12, 0.5, 0.08], [4.4, 0.1, 0.4, 0.03]], 8, CH);
    for (const t of T.slice(1, 4)) Org.tube(b, [[2.8, 0.12, 0.5, 0.06], [t[0], t[1], t[2], 0.015]], 5, CH);
    b.color(MEM, MAT.MATTE); const pv = [[0, 0, 0], [1.5, 0.1, 0.45], [2.8, 0.12, 0.5], ...T];
    for (const [A, B2, C] of [[pv[2], pv[3], pv[4]], [pv[2], pv[4], pv[5]], [pv[2], pv[5], pv[6]], [pv[1], pv[2], pv[6]], [pv[1], pv[6], pv[7]], [pv[0], pv[1], pv[7]]]) { Org.oq(b, A, B2, C, C, [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]); Org.oq(b, A, C, B2, B2, [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]); }
    Org.claw(b, 4.4, 0.1, 0.4, 1, 0, 0.5, 0.45, 0.05, 0.5, BONE);
    M.hwing = b.build();
    // Liivaangerjas: lüliline madu-keha, lai lõugadega pea, seljaharjad
    b = new MB(); b.jit = 0;
    { const pts = []; for (let k = 0; k <= 10; k++) { const z = 2.0 - k * 0.42; pts.push([Math.sin(k * 0.6) * 0.12, 0, z, 0.52 - k * 0.042]); } Org.tube(b, pts, 12, CH, MAT.WORN, { rough: 0.08 }); for (let k = 0; k < 9; k++) { const p = pts[k]; Org.tube(b, [[p[0] - p[3] * 1.02, p[1], p[2], 0.05], [p[0], p[1] + p[3] * 1.02, p[2], 0.05], [p[0] + p[3] * 1.02, p[1], p[2], 0.05]], 5, CH2); Org.claw(b, p[0], p[1] + p[3] * 0.85, p[2], 0, 1, -0.5, 0.5 - k * 0.03, 0.07, -0.3, BONE); } }
    Org.blob(b, 0, 0.05, 2.35, 0.55, 0.3, 0.55, CH2, { amp: 0.08 }); Org.blob(b, 0, -0.18, 2.4, 0.5, 0.14, 0.5, CH, { amp: 0.06 });
    Org.blob(b, 0, -0.05, 2.5, 0.42, 0.05, 0.38, MOUTH, { amp: 0.03, mat: MAT.MATTE });
    for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * 0.33, 0.22, 2.55, 0.06, 6, 4, 1);
    for (let k = 0; k < 7; k++) { Org.claw(b, -0.36 + k * 0.12, 0.02, 2.85, 0, -1, 0.3, 0.22, 0.035, 0.1, BONE); Org.claw(b, -0.36 + k * 0.12, -0.1, 2.85, 0, 1, 0.3, 0.18, 0.03, 0.1, BONE); }
    M.eel = b.build();
    b = new MB(); b.jit = 0; for (let k = 0; k < 6; k++) Org.claw(b, Math.sin(k * 0.6) * 0.12, 0, 1.6 - k * 0.55, 0, 1, -0.4, 0.75 - k * 0.07, 0.11, -0.3, BONE); M.eelFin = b.build();
    // Kivistunud sülitaja: juurtest kerkiv kõver vars, lõhenev "õie" lõug ja helendav kurk
    b = new MB(); b.jit = 0;
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; Org.tube(b, [[0, 0.6, 0, 0.3], [Math.cos(a) * 0.9, 0.3, Math.sin(a) * 0.9, 0.18], [Math.cos(a) * 1.6, -0.1, Math.sin(a) * 1.6, 0.06]], 6, CH, MAT.WORN, { rough: 0.15 }); }
    Org.tube(b, [[0, 0, 0, 0.75], [0.1, 0.9, 0, 0.6], [0.15, 1.9, 0.1, 0.48], [0.05, 2.7, 0.2, 0.42]], 12, CH2, MAT.WORN, { rough: 0.12 });
    for (let k = 0; k < 5; k++) { const z = 0.4 + k * 0.5; Org.tube(b, [[-0.55, z, 0.05, 0.06], [0, z + 0.1, 0.55, 0.06], [0.6, z, 0.05, 0.06]], 5, PLATE); }
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; Org.tube(b, [[0.05 + Math.cos(a) * 0.3, 2.8, 0.2 + Math.sin(a) * 0.3, 0.16], [0.05 + Math.cos(a) * 0.7, 3.4, 0.2 + Math.sin(a) * 0.7, 0.1], [0.05 + Math.cos(a) * 0.8, 3.9, 0.2 + Math.sin(a) * 0.8, 0.02]], 6, CH2); Org.claw(b, 0.05 + Math.cos(a) * 0.8, 3.9, 0.2 + Math.sin(a) * 0.8, Math.cos(a), 0.4, Math.sin(a), 0.3, 0.04, 0.4, BONE); }
    Org.blob(b, 0.05, 3.05, 0.2, 0.4, 0.35, 0.4, GLOW, { amp: 0.1, mat: MAT.GLOW });
    for (let k = 0; k < 6; k++) Org.claw(b, Math.cos(k) * 0.65, 0.5 + k * 0.3, Math.sin(k) * 0.65, Math.cos(k), 0.3, Math.sin(k), 0.4, 0.06, 0.3, BONE);
    M.spitter = b.build();
    // Pesaema: paistes munadega tagakeha, rinnakilp, kombitsad suu ümber
    b = new MB(); b.jit = 0;
    Org.blob(b, 0, 1.7, -1.3, 2.0, 1.45, 2.3, CH, { amp: 0.06, flatBelly: 0.7, seg: 22, rings: 14 });
    for (let k = 0; k < 12; k++) { const a = k * 2.4, h = Math.sin(k * 1.3); Org.blob(b, Math.cos(a) * 1.55, 1.75 + h * 0.6, -1.3 + Math.sin(a) * 1.75, 0.38, 0.32, 0.38, GLOW, { amp: 0.06, mat: MAT.GLOW, seg: 10, rings: 7 }); }
    for (let k = 0; k < 5; k++) { const z = -2.8 + k * 0.7; const pts = []; for (let q = 0; q <= 8; q++) { const a = Math.PI * (0.1 + 0.8 * q / 8); pts.push([Math.cos(a) * 1.95, 1.7 + Math.sin(a) * 1.4, z, 0.08]); } Org.tube(b, pts, 6, CH2); }
    Org.blob(b, 0, 1.9, 0.8, 1.05, 0.9, 1.05, CH2, { amp: 0.07 }); Org.blob(b, 0, 2.55, 0.7, 0.95, 0.35, 0.95, PLATE, { amp: 0.08, ridge: 4 });
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * (0.25 + k * 0.14), 2.15 - k * 0.04, 1.75 - k * 0.12, 0.08, 8, 5, 1);
    for (let k = 0; k < 6; k++) { const a = (k / 5 - 0.5) * 1.6; Org.tube(b, [[Math.sin(a) * 0.5, 1.55, 1.7, 0.1], [Math.sin(a) * 0.7, 1.2, 2.1, 0.07], [Math.sin(a) * 0.9, 0.9, 2.35, 0.04], [Math.sin(a) * 1.0, 0.8, 2.6, 0.0]], 6, CH); }
    for (let k = 0; k < 6; k++) Org.claw(b, 0, 2.85 - k * 0.05, 0.6 - k * 0.65, 0, 1, -0.4, 0.8, 0.13, -0.3, BONE);
    M.mother = b.build();
    b = new MB(); b.jit = 0; Org.limb(b, [[0, 0, 0], [0, 0.35, 0.4], [0, -1.6, 0.6]], 0.16, 0.07, CH, 0.25); M.mleg = b.build();
    // vastne: kiire kuuejalgne, suur suu, helendav kõht
    b = new MB(); b.jit = 0; Org.blob(b, 0, 0.35, -0.05, 0.3, 0.24, 0.42, CH2, { amp: 0.1, ridge: 3 }); Org.blob(b, 0, 0.28, -0.25, 0.2, 0.16, 0.22, GLOW, { amp: 0.05, mat: MAT.GLOW });
    for (const sx of [-1, 1]) { b.color(EYE, MAT.GLOW).sphere(sx * 0.1, 0.45, 0.33, 0.04, 6, 4, 1); Org.claw(b, sx * 0.08, 0.3, 0.38, sx * 0.3, -0.3, 1, 0.2, 0.035, -0.4, BONE); }
    for (let k = 0; k < 6; k++) { const sx = k < 3 ? 1 : -1, i = k % 3; Org.limb(b, [[sx * 0.2, 0.35, 0.15 - i * 0.15], [sx * 0.45, 0.45, 0.2 - i * 0.18], [sx * 0.55, 0.0, 0.25 - i * 0.2]], 0.04, 0.02, CH, 0); }
    M.larva = b.build();
    // Varjuluuraja: kõhn pikkade jäsemetega olend, ilma näota kolp, sirpkäed, selgroo ogad
    b = new MB(); b.jit = 0;
    Org.tube(b, [[0, 0.95, -0.05, 0.2], [0, 1.4, 0.0, 0.25], [0, 1.9, 0.08, 0.27], [0, 2.15, 0.15, 0.16]], 10, CH, MAT.WORN, { rough: 0.1 });
    for (let k = 0; k < 4; k++) Org.tube(b, [[-0.25, 1.4 + k * 0.15, 0.02, 0.035], [0, 1.45 + k * 0.15, 0.27, 0.035], [0.25, 1.4 + k * 0.15, 0.02, 0.035]], 5, CH2);
    Org.blob(b, 0, 2.45, 0.32, 0.22, 0.28, 0.42, CH2, { amp: 0.08 });
    for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * 0.1, 2.5, 0.68, 0.035, 6, 4, 1);
    for (const sx of [-1, 1]) { Org.limb(b, [[sx * 0.28, 2.0, 0.05], [sx * 0.5, 1.5, 0.3], [sx * 0.45, 1.2, 0.8]], 0.08, 0.05, CH, 0); Org.claw(b, sx * 0.45, 1.2, 0.8, sx * 0.1, 0.5, 1, 1.0, 0.07, -0.6, BONE); }
    for (const sx of [-1, 1]) Org.limb(b, [[sx * 0.15, 0.95, -0.05], [sx * 0.22, 0.5, 0.2], [sx * 0.18, 0.0, -0.1]], 0.1, 0.05, CH, 0.15);
    for (let k = 0; k < 5; k++) Org.claw(b, 0, 2.1 - k * 0.25, -0.15, 0, 0.3, -1, 0.35, 0.04, 0.4, BONE);
    b.color(GLOW, MAT.GLOW).sphere(0, 1.55, 0.25, 0.08, 6, 4, 1);
    M.phantom = b.build();
    MB.detail = md0;
    return M;
  }

  // ---------- abifunktsioonid ----------
  const moving = (o) => o.kind === 'player' ? (!Player.dead && !Player.vehicle && G.mode !== 'build' && Player.speedNow > 1.0) : (o.moveAmt > 0.35 && (o.speed || 0) > 1.0);
  const preyOK = (o) => o.alive && !o.inVehicle && (o.kind === 'human' || o.kind === 'goat' || o.kind === 'ram' || (o.kind === 'player' && !Player.dead && !Player.vehicle && G.mode !== 'build'));
  function nearest(e, r, pred) { let best = null, bd = r; for (const o of Ents.list) { if (!preyOK(o) || o.kind === 'goat' || o.kind === 'ram' || (pred && !pred(o))) continue; const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z); if (d < bd) { bd = d; best = o; } } return best; }
  function fly(e, tx, ty, tz, sp, dt, turn) {
    const dx = tx - e.pos.x, dz = tz - e.pos.z, d = Math.hypot(dx, dz) || 1;
    e.yaw += angDiff(e.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * (turn || 2));
    e.pos.x += Math.sin(e.yaw) * sp * dt; e.pos.z += Math.cos(e.yaw) * sp * dt;
    e.pos.y += (ty - e.pos.y) * Math.min(1, dt * 1.8); e.pos.y = Math.max(e.pos.y, World.heightAt(e.pos.x, e.pos.z) + 0.8);
    e.moveAmt = 1; e.speed = sp; return d;
  }

  // ---------- Liikumisekütt ----------
  function makeRoute() {
    route = []; const n = 8, a0 = rand(0, TAU);
    for (let k = 0; k < n; k++) { const a = a0 + k / n * TAU, r = rand(700, 1500); route.push({ x: Math.cos(a) * r, z: Math.sin(a) * r }); }
    return route;
  }
  function spawnHawk() { if (!route) makeRoute(); const k = randi(0, route.length - 1), p = route[k]; const e = Ents.spawn('hawk', 'wild', p.x, p.z, { maxHp: 240, radius: 1.2, wp: (k + 1) % route.length, state: 'patrol', cool: 0 }); e.hp = e.maxHp; e.pos.y = World.heightAt(p.x, p.z) + 32; return e; }
  function hawkAI(e, dt) {
    e.cool -= dt; e.flap = (e.flap || 0) + dt * (e.state === 'dive' ? 1.5 : 5);
    const g = World.heightAt(e.pos.x, e.pos.z);
    if (e.state === 'patrol' || e.state === 'search') {
      if (e.state === 'patrol') { const w = route[e.wp]; if (fly(e, w.x, g + 32, w.z, 20, dt, 0.8) < 40) e.wp = (e.wp + 1) % route.length; }
      else { e.ang = (e.ang || 0) + dt * 0.9; fly(e, e.last.x + Math.cos(e.ang) * 18, g + 16, e.last.z + Math.sin(e.ang) * 18, 14, dt, 2); if ((e.searchT -= dt) <= 0) e.state = 'patrol'; }
      // näeb ainult liikujaid
      if (e.cool <= 0 && (e.scan = (e.scan || 0) - dt) <= 0) {
        e.scan = 0.3; let best = null, bd = 80;
        for (const o of Ents.list) { if (!preyOK(o) || !moving(o)) continue; const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z); if (d < bd) { bd = d; best = o; } }
        if (best) { e.state = 'dive'; e.target = best; e.still = 0; if (best === Player || Math.hypot(Player.pos.x - e.pos.x, Player.pos.z - e.pos.z) < 120) { Audio2.stalker(e.pos.x, e.pos.z); UI.msg('A shriek from the sky – something has seen you move. Freeze!', 'danger'); } }
      }
      return;
    }
    if (e.state === 'climb') { fly(e, e.pos.x + Math.sin(e.yaw) * 30, g + 26, e.pos.z + Math.cos(e.yaw) * 30, 20, dt, 0.5); if ((e.climbT -= dt) <= 0) { e.state = 'search'; e.searchT = 6; e.last = { x: e.pos.x, z: e.pos.z }; } return; }
    // sukeldumine: kui saak jääb seisma, kaotab ta selle
    const t = e.target;
    if (!t || !t.alive || !preyOK(t)) { e.state = 'patrol'; return; }
    if (!moving(t)) { if ((e.still += dt) > 0.8) { e.state = 'search'; e.searchT = 7; e.last = { x: t.pos.x, z: t.pos.z }; e.target = null; return; } } else e.still = 0;
    const d = fly(e, t.pos.x, t.pos.y + 1.2, t.pos.z, 24, dt, 3.5);
    if (d < 2.4 && Math.abs(e.pos.y - t.pos.y - 1.2) < 2) {
      if (t.kind === 'goat' || t.kind === 'ram') Ents.damage(t, 999, e); else Ents.damage(t, 45 * G.dk.edmg, e);
      if (t === Player) { UI.shake(0.6); Player.vel.y = 6; }
      Audio2.crab(e.pos.x, e.pos.z); FX.dust(t.pos.x, t.pos.y + 0.5, t.pos.z, 10, 2);
      e.state = 'climb'; e.climbT = 2.5; e.cool = 3; e.last = { x: t.pos.x, z: t.pos.z };
    }
  }

  // ---------- Liivaangerjas ----------
  function spawnEel(x, z) { const e = Ents.spawn('eel', 'wild', x, z, { maxHp: 110, radius: 0.8, home: { x, z }, state: 'under', up: 0, cool: 0, wander: rand(0, TAU) }); e.hp = e.maxHp; return e; }
  function eelAI(e, dt) {
    e.cool -= dt;
    const t = nearest(e, 11, (o) => moving(o) || Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z) < 3);
    if (e.state === 'under') {
      e.up = Math.max(0, e.up - dt * 2);
      if (t && e.cool <= 0) { const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z); if (d > 2.5) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 7.5); } else { e.state = 'up'; e.upT = 2.6; e.bit = false; FX.dust(e.pos.x, e.pos.y, e.pos.z, 16, 3); Audio2.stalker(e.pos.x, e.pos.z); } }
      else { e.wander += rand(-1, 1) * dt; const hx = e.home.x + Math.cos(e.wander) * 14, hz = e.home.z + Math.sin(e.wander) * 14; e.path = [{ x: hx, z: hz }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 1.6); }
      if (Math.random() < dt * 4) FX.dust(e.pos.x + rand(-0.6, 0.6), e.pos.y + 0.05, e.pos.z + rand(-0.6, 0.6), 2, 0.6);
      return;
    }
    e.up = Math.min(1, e.up + dt * 4); e.upT -= dt;
    if (t) Ents.face(e, t.pos.x, t.pos.z, dt, 8);
    if (!e.bit && e.up > 0.8 && t && Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z) < 3.6) { e.bit = true; Ents.damage(t, 20 * G.dk.edmg, e); Audio2.crab(e.pos.x, e.pos.z); }
    if (e.upT <= 0) { e.state = 'under'; e.cool = 3.5; FX.dust(e.pos.x, e.pos.y, e.pos.z, 10, 2); }
  }

  // ---------- Kivistunud sülitaja ----------
  function spawnSpitter(x, z) { const e = Ents.spawn('spitter', 'wild', x, z, { maxHp: 170, radius: 1.2, cool: rand(0, 2), yaw: rand(0, TAU) }); e.hp = e.maxHp; return e; }
  function spitterAI(e, dt) {
    e.cool -= dt; e.open = Math.max(0, (e.open || 0) - dt);
    const t = nearest(e, 30);
    if (!t) return;
    Ents.face(e, t.pos.x, t.pos.z, dt, 1.5);
    if (e.cool <= 0) {
      e.cool = rand(1.4, 2.0); e.open = 0.5;
      const sx = e.pos.x, sy = e.pos.y + 3.2, sz = e.pos.z, tx = t.pos.x + (t.vel ? t.vel.x * 0.5 : 0), tz = t.pos.z + (t.vel ? t.vel.z * 0.5 : 0), ty = Ents.groundY(tx, tz) + 1.0;
      const dist = Math.hypot(tx - sx, tz - sz), T = clamp(dist / 20, 0.5, 1.6);
      Ents.projs.push({ x: sx, y: sy, z: sz, vx: (tx - sx) / T, vy: (ty - sy) / T + 0.5 * 12 * T, vz: (tz - sz) / T, g: 12, life: 3, dmg: 12 * G.dk.edmg, owner: e, kind: 'acid', r: 0.35, delay: 0 });
      Audio2.stalker(e.pos.x, e.pos.z);
    }
  }

  // ---------- Pesaema ja vastsed ----------
  function spawnMother(x, z) { const e = Ents.spawn('mother', 'wild', x, z, { maxHp: 560, radius: 2.2, home: { x, z }, cool: 0, brood: 0 }); e.hp = e.maxHp; return e; }
  function motherAI(e, dt) {
    e.cool -= dt; e.brood -= dt;
    const t = nearest(e, 34);
    if (t) {
      const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
      Ents.face(e, t.pos.x, t.pos.z, dt, 1.5);
      if (e.brood <= 0) {
        e.brood = 4.5; const n = Ents.list.filter((o) => o.kind === 'larva' && o.alive && o.mom === e).length;
        for (let k = 0; k < Math.min(3, 9 - n); k++) { const a = e.yaw + Math.PI + rand(-0.8, 0.8); const l = Ents.spawn('larva', 'wild', e.pos.x + Math.sin(a) * 2.6, e.pos.z + Math.cos(a) * 2.6, { maxHp: 18, radius: 0.35, mom: e, life: 45, cool: 0 }); l.hp = l.maxHp; }
        FX.goo(e.pos.x, e.pos.y + 1.5, e.pos.z, AS.GLOW, 12); Audio2.stalker(e.pos.x, e.pos.z);
      }
      if (d < 4.2 && e.cool <= 0) { e.cool = 1.8; Ents.damage(t, 26 * G.dk.edmg, e); Audio2.crab(e.pos.x, e.pos.z); }
      else if (d > 3.5) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 1.8); e.speed = 1.8; }
      return;
    }
    if (!e.path || Ents.arrived(e)) { if (Math.random() < dt * 0.2) Ents.goTo(e, e.home.x + rand(-25, 25), e.home.z + rand(-25, 25)); } else Ents.stepMove(e, dt, 1.0);
    e.speed = 1.0;
  }
  function larvaAI(e, dt) {
    e.cool -= dt; e.life -= dt;
    if (e.life <= 0) { Ents.kill(e, null); e.remove = true; return; }
    const t = nearest(e, 40);
    if (!t) { e.moveAmt = Math.max(0, e.moveAmt - dt * 3); return; }
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    if (d < 1.3) { e.moveAmt = 0.3; if (e.cool <= 0) { e.cool = 0.8; Ents.damage(t, 6 * G.dk.edmg, e); } return; }
    if (!e.path || Math.random() < dt * 3) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; }
    Ents.stepMove(e, dt, 8.5); e.speed = 8.5;
  }

  // ---------- Varjuluuraja ----------
  function spawnPhantom(x, z) { const e = Ents.spawn('phantom', 'wild', x, z, { maxHp: 120, radius: 0.5, home: { x, z }, cool: rand(1, 3), seen: 0 }); e.hp = e.maxHp; return e; }
  function blink(e, x, z) { FX.goo(e.pos.x, e.pos.y + 1.2, e.pos.z, [0.4, 0.3, 0.6], 8); const q = { x, z }; World.collideCircle(q, 0.5, Ents.groundY(x, z) + 0.3, Ents.groundY(x, z) + 1.7, true); e.pos.x = q.x; e.pos.z = q.z; e.pos.y = Ents.groundY(q.x, q.z, e.pos.y); FX.goo(e.pos.x, e.pos.y + 1.2, e.pos.z, [0.4, 0.3, 0.6], 8); e.seen = 0.6; }
  function phantomAI(e, dt) {
    e.cool -= dt; e.seen = Math.max(0, e.seen - dt); e.slash = Math.max(0, (e.slash || 0) - dt);
    if (!Econ.isNight() && !e.target) { e.remove = true; return; }   // päeval kaob
    const t = nearest(e, 45);
    e.target = t;
    if (!t) { if (!e.path || Ents.arrived(e)) Ents.goTo(e, e.home.x + rand(-30, 30), e.home.z + rand(-30, 30)); Ents.stepMove(e, dt, 2.5); return; }
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    Ents.face(e, t.pos.x, t.pos.z, dt, 6);
    if (e.cool <= 0 && d < 16) {
      // selja taha, löök, siis minema
      const ty = t.kind === 'player' ? Player.yaw : t.yaw;
      blink(e, t.pos.x - Math.sin(ty) * 1.6, t.pos.z - Math.cos(ty) * 1.6); Ents.face(e, t.pos.x, t.pos.z, 1, 99);
      e.strikeT = 0.35; e.cool = rand(3, 4.5); Audio2.stalker(e.pos.x, e.pos.z);
    }
    if (e.strikeT > 0) { e.strikeT -= dt; if (e.strikeT <= 0) { if (Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z) < 2.6) { Ents.damage(t, 24 * G.dk.edmg, e); e.slash = 0.3; } const a = rand(0, TAU); blink(e, t.pos.x + Math.cos(a) * 14, t.pos.z + Math.sin(a) * 14); } return; }
    if (d > 18) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 6); e.speed = 6; }
    else { const a = Math.atan2(e.pos.x - t.pos.x, e.pos.z - t.pos.z) + 1.2; e.path = [{ x: t.pos.x + Math.sin(a) * 12, z: t.pos.z + Math.cos(a) * 12 }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 4); e.speed = 4; }
  }

  // ---------- liides Ents-ile ----------
  function update(e, dt) { ({ hawk: hawkAI, eel: eelAI, spitter: spitterAI, mother: motherAI, larva: larvaAI, phantom: phantomAI })[e.kind](e, dt); }
  function hurt(e, src) {
    if (!src || !src.pos || !e.alive) return;
    if (e.kind === 'phantom') e.seen = 2;
    if (e.kind === 'eel' && e.state === 'under') { e.state = 'up'; e.upT = 2; e.bit = false; }
    if (e.kind === 'hawk' && e.state !== 'dive' && preyOK(src)) { e.state = 'dive'; e.target = src; e.still = -2; }
  }
  function onKill(e) {
    FX.goo(e.pos.x, e.pos.y + 0.8, e.pos.z, AS.GLOW, e.kind === 'larva' ? 4 : 18);
    if (e.kind === 'mother' || e.kind === 'hawk') { e.acid = randi(5, 8); e.harvestable = true; }
    if (e.kind === 'mother') for (const o of Ents.list) if (o.kind === 'larva' && o.mom === e && o.alive) o.life = Math.min(o.life, 3);
  }
  function spheres(e, s) {
    const x = e.pos.x, y = e.pos.y, z = e.pos.z, fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
    if (e.kind === 'hawk') { s.push([x, y, z, 1.0, 1]); s.push([x + fx * 2.0, y + 0.15, z + fz * 2.0, 0.45, 2]); }
    else if (e.kind === 'eel') { if (e.up > 0.4) { s.push([x, y + 0.8 * e.up, z, 0.7, 1]); s.push([x + fx * 1.6, y + 1.2 * e.up, z + fz * 1.6, 0.5, 1.6]); } }
    else if (e.kind === 'spitter') { s.push([x, y + 1.0, z, 1.1, 1]); s.push([x, y + 3.0, z, 0.6, 1.8]); }
    else if (e.kind === 'mother') { s.push([x - fx * 1.2, y + 1.6, z - fz * 1.2, 2.0, 1]); s.push([x + fx * 0.9, y + 1.8, z + fz * 0.9, 1.0, 1.5]); }
    else if (e.kind === 'larva') s.push([x, y + 0.35, z, 0.4, 1]);
    else { s.push([x, y + 1.3, z, 0.45, 1]); s.push([x, y + 2.4, z, 0.3, 2]); }
  }
  function draw(e) {
    if (!M) initMeshes();
    const ms = e.ms || (e.ms = Array.from({ length: 8 }, () => M4.create())), R0 = ms[7];
    const dead = !e.alive, hurtT = e.hurtT > 0 ? [1.6, 0.6, 0.5, 0.2] : null, tint = hurtT || (dead ? [0.45, 0.42, 0.4, 0] : null), o = { rust: 0.1 };
    if (e.kind === 'hawk') {
      let y = e.pos.y; if (dead) { e.fallY = e.fallY === undefined ? y : Math.max(World.heightAt(e.pos.x, e.pos.z) + 0.4, e.fallY - 0.4); y = e.fallY; }
      M4.compose(R0, e.pos.x, y, e.pos.z, e.yaw, e.state === 'dive' && !dead ? 0.45 : 0, dead ? 1.3 : Math.sin((e.flap || 0) * 0.3) * 0.15);
      GFX.draw(M.hawk, R0, tint, null, o);
      const fl = dead ? 0.3 : e.state === 'dive' ? -0.5 : Math.sin(e.flap || 0) * 0.5;
      M4.child(ms[0], R0, 0.4, 0.1, 0.3, 0, 0, fl); GFX.draw(M.hwing, ms[0], tint, null, o);
      M4.child(ms[1], R0, -0.4, 0.1, 0.3, Math.PI, 0, fl); GFX.draw(M.hwing, ms[1], tint, null, o);
      return;
    }
    if (e.kind === 'eel') {
      const up = e.up || 0;
      if (up < 0.1 && !dead) { M4.compose(R0, e.pos.x, e.pos.y - 0.25, e.pos.z, e.yaw, 0, 0); GFX.draw(M.eelFin, R0, tint, null, o); return; }
      M4.compose(R0, e.pos.x, e.pos.y - 1.0 + up * 1.4, e.pos.z, e.yaw, -0.5 * up, 0); GFX.draw(M.eel, R0, tint, null, o); return;
    }
    if (e.kind === 'spitter') { const op = e.open || 0; M4.compose(R0, e.pos.x, e.pos.y, e.pos.z, e.yaw, 0, 0, 1, 1 + op * 0.15, 1); GFX.draw(M.spitter, R0, tint, null, o); if (!dead && GFX.env.night > 0.3) GFX.addLight(e.pos.x, e.pos.y + 3.2, e.pos.z, 6, 0.5, 1.0, 0.25, 1.0); return; }
    if (e.kind === 'mother') {
      M4.compose(R0, e.pos.x, e.pos.y + Math.sin(e.phase) * 0.05, e.pos.z, e.yaw, 0, dead ? 0.5 : 0); GFX.draw(M.mother, R0, tint, null, o);
      for (let k = 0; k < 6; k++) { const sd = k < 3 ? 1 : -1, i = k % 3; M4.child(ms[k], R0, sd * 1.6, 1.6, 1.2 - i * 1.4, 0, Math.sin(e.phase * 1.3 + i * 2 + (sd > 0 ? 0 : Math.PI)) * 0.3 * e.moveAmt, sd * 0.45); GFX.draw(M.mleg, ms[k], tint, null, o); }
      return;
    }
    if (e.kind === 'larva') { M4.compose(R0, e.pos.x, e.pos.y + Math.abs(Math.sin(e.phase * 3)) * 0.06, e.pos.z, e.yaw, 0, dead ? 3 : 0); GFX.draw(M.larva, R0, tint, null, o); return; }
    // varjur: peaaegu nähtamatu – virvendus, nähtav lühidalt pärast hüpet, lööki või tabamust
    const vis = dead || e.seen > 0 || e.slash > 0 || Math.random() < 0.08;
    M4.compose(R0, e.pos.x, e.pos.y, e.pos.z, e.yaw, 0, dead ? 1.4 : 0);
    if (vis) GFX.draw(M.phantom, R0, hurtT || (dead ? [0.4, 0.38, 0.45, 0] : [0.55, 0.5, 0.75, 0]), null, o);
    else if (Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) < 30 && Math.random() < 0.3) FX.goo(e.pos.x + rand(-0.3, 0.3), e.pos.y + rand(0.5, 2.3), e.pos.z + rand(-0.3, 0.3), [0.35, 0.3, 0.5], 1);
  }

  // ---------- populatsioon ----------
  let spawnT = 4;
  function okSpot(x, z, d) { if (Math.hypot(x - Base.OX, z - Base.OZ) < d) return false; for (const r of Rivals.list) if (r.base && Math.hypot(x - r.base.x, z - r.base.z) < d) return false; if (World.tunnelAt && World.tunnelAt(x, z)) return false; return Math.hypot(x - Player.pos.x, z - Player.pos.z) > 100 && World.slopeAt(x, z) < 0.45; }
  function tick(dt) {
    for (const e of Ents.list) if (KINDS[e.kind] && !e.alive && e.deathT > (e.kind === 'larva' ? 10 : 200)) e.remove = true;
    if ((spawnT -= dt) > 0) return; spawnT = 35;
    if (!route) makeRoute();
    const cnt = (k) => Ents.list.filter((e) => e.kind === k && e.alive).length;
    if (cnt('hawk') < 2 && G.time.day >= 2) spawnHawk();
    const night = Econ.isNight();
    for (let t = 0; t < 30; t++) {
      const a = rand(0, TAU), r = rand(250, World.HALF - 170), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!okSpot(x, z, 160)) continue;
      if (cnt('eel') < 8) { spawnEel(x, z); if (Math.random() < 0.5) spawnEel(x + rand(-12, 12), z + rand(-12, 12)); break; }
      if (cnt('spitter') < 9) { for (let k = 0; k < 3; k++) spawnSpitter(x + rand(-9, 9), z + rand(-9, 9)); break; }
      if (cnt('mother') < 2) { spawnMother(x, z); break; }
      if (night && cnt('phantom') < 3) { const pa = rand(0, TAU); spawnPhantom(Player.pos.x + Math.cos(pa) * 90, Player.pos.z + Math.sin(pa) * 90); break; }
      break;
    }
  }
  function reset() { spawnT = 4; route = null; }
  return { KINDS, initMeshes, update, hurt, onKill, spheres, draw, tick, reset, spawnHawk, spawnEel, spawnSpitter, spawnMother, spawnPhantom, get route() { return route; } };
})();
