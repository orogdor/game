// ============================================================
//  SÕIDUKID: bagi (kaks istekohta + tagumine kuulipilduja, kast asjade vedamiseks)
// ============================================================
const Vehicles = (() => {
  // istmed kohalikus ruumis (+z ette, +x vasakule): 0 = juht, 1 = kuulipildur (bagi) / kõrvalistuja (veok)
  const DEF = {
    buggy: { name: 'Buggy', desc: 'Fast, two seats, rear machine gun, small cargo box.', hp: 450, maxSpeed: 19, rev: 6, accel: 8.5, brake: 20, wheelBase: 2.5, cargoCap: 200, cost: { c: 900, s: 120 },
      gun: { x: 0, y: 1.92, z: -0.75 }, seats: [{ x: 0.42, y: 0.62, z: 0.15, sit: true }, { x: 0, y: 0.72, z: -1.15, sit: false }],
      wheels: [[0.86, 0.45, 1.18], [-0.86, 0.45, 1.18], [0.86, 0.45, -1.12], [-0.86, 0.45, -1.12]], wheelS: 1, mesh: 'body', len: 0.9 },
    hauler: { name: 'Hauler truck', desc: 'Slow and tough: big cargo bed for hauling diamonds, ore and scrap. Two seats, no gun.', hp: 800, maxSpeed: 14, rev: 5, accel: 6, brake: 16, wheelBase: 3.3, cargoCap: 600, cost: { c: 1400, s: 220 },
      gun: null, seats: [{ x: 0.45, y: 1.0, z: 1.25, sit: true }, { x: -0.45, y: 1.0, z: 1.25, sit: true }],
      wheels: [[1.0, 0.55, 1.55], [-1.0, 0.55, 1.55], [1.0, 0.55, -1.45], [-1.0, 0.55, -1.45]], wheelS: 1.22, mesh: 'hauler', len: 1.3 },
  };
  const DEFAULT_TYPE = 'buggy';
  const seatsOf = (v) => DEF[v.type].seats;
  const list = [];
  let nextId = 1;
  let M = null;
  const tmp = {}, tmp2 = {};

  // ---------- mudelid (protseduursed) ----------
  function initMeshes() {
    if (M) return M;
    M = {};
    const PAINT = [0.78, 0.46, 0.12], PAINT2 = [0.62, 0.34, 0.08], DARK = [0.08, 0.08, 0.09], STEEL = [0.32, 0.33, 0.35], SEAT = [0.16, 0.15, 0.14];
    // keha
    let b = new MB(); b.jit = 0;
    b.color(DARK, MAT.WORN).boxB(0, 0.42, 0, 1.5, 0.16, 3.2);                         // raam
    b.color(PAINT, MAT.RUST).boxB(0, 0.56, 0.2, 1.62, 0.18, 2.2);                      // põhi / küljed
    b.color(PAINT2, MAT.RUST).boxB(0.78, 0.56, 0.2, 0.06, 0.42, 2.2); b.color(PAINT2, MAT.RUST).boxB(-0.78, 0.56, 0.2, 0.06, 0.42, 2.2);
    b.push().tf(0, 0.74, 1.45, 0, 0.32, 0).color(PAINT, MAT.RUST).box(0, 0, 0, 1.5, 0.16, 0.95).pop();   // kapott
    b.color(DARK, MAT.WORN).boxB(0, 0.32, 1.85, 1.6, 0.3, 0.16);                        // esistange
    for (const x of [-0.55, 0.55]) b.color([1, 0.95, 0.75], MAT.GLOW).box(x, 0.68, 1.9, 0.26, 0.14, 0.05);   // tuled
    b.color([1, 0.12, 0.06], MAT.GLOW).box(0.62, 0.72, -1.58, 0.16, 0.08, 0.04); b.color([1, 0.12, 0.06], MAT.GLOW).box(-0.62, 0.72, -1.58, 0.16, 0.08, 0.04);
    // turvaraam (torud)
    const tube = (x0, y0, z0, x1, y1, z1, r = 0.045) => {
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
      const yaw = Math.atan2(dx, dz), pitch = -Math.asin(dy / L);
      b.push().tf((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, yaw, pitch, 0).color(DARK, MAT.WORN).box(0, 0, 0, r * 2, r * 2, L).pop();
    };
    for (const x of [0.72, -0.72]) {
      tube(x, 0.65, 0.95, x * 0.92, 1.72, 0.45); tube(x * 0.92, 1.72, 0.45, x * 0.92, 1.72, -0.35); tube(x * 0.92, 1.72, -0.35, x, 0.65, -0.55);
      tube(x, 0.65, -0.55, x, 0.65, -1.55);
    }
    tube(0.66, 1.72, 0.45, -0.66, 1.72, 0.45); tube(0.66, 1.72, -0.35, -0.66, 1.72, -0.35); tube(0.66, 1.72, 0.45, -0.66, 1.72, -0.35, 0.03);
    // istmed + rool
    for (const x of [0.42, -0.42]) {
      b.color(SEAT, MAT.WORN).boxB(x, 0.62, 0.05, 0.52, 0.14, 0.55);
      b.push().tf(x, 0.95, -0.24, 0, -0.18, 0).color(SEAT, MAT.WORN).box(0, 0, 0, 0.5, 0.7, 0.12).pop();
    }
    b.push().tf(0.42, 1.05, 0.62, 0, -0.9, 0).color(DARK).cyl(0, -0.02, 0, 0.19, 0.19, 0.04, 12, true).pop();
    b.color(DARK).box(0.42, 0.9, 0.78, 0.05, 0.05, 0.4);
    // tagumine kast (veoplats) + kuulipilduja alus
    b.color(PAINT2, MAT.RUST).boxB(0, 0.62, -1.08, 1.5, 0.08, 1.0);
    for (const x of [0.74, -0.74]) b.color(PAINT, MAT.RUST).boxB(x, 0.7, -1.08, 0.05, 0.36, 1.0);
    b.color(PAINT, MAT.RUST).boxB(0, 0.7, -1.57, 1.5, 0.36, 0.05);
    b.color([0.36, 0.3, 0.2], MAT.WORN).boxB(0.42, 0.7, -1.2, 0.5, 0.36, 0.5);     // puidust kast
    b.color(STEEL, MAT.WORN).cyl(0, 0.66, -0.75, 0.08, 0.06, 1.12, 10, true);          // kuulipilduja post
    b.color(DARK).cyl(0, -0.15, -1.68, 0.4, 0.4, 0, 14, true);
    b.push().tf(0, 0.86, -1.66, 0, Math.PI / 2, 0).color(DARK, MAT.WORN).cyl(0, -0.12, 0, 0.36, 0.36, 0.24, 14, true).pop();   // varuratas
    M.body = b.build();
    // veok: kabiin ees, kastiga platvorm taga
    b = new MB(); b.jit = 0;
    const TRUCK = [0.36, 0.42, 0.3], TRUCK2 = [0.26, 0.3, 0.22];
    b.color(DARK, MAT.WORN).boxB(0, 0.5, 0, 1.7, 0.22, 4.4);
    b.color(TRUCK, MAT.RUST).boxB(0, 0.72, 1.3, 1.9, 1.1, 1.5);                    // kabiin
    b.color(TRUCK2, MAT.RUST).boxB(0, 1.82, 1.25, 1.86, 0.1, 1.4);
    b.color([0.28, 0.42, 0.5], MAT.WORN).box(0, 1.5, 2.06, 1.6, 0.5, 0.04);        // esiklaas
    for (const x of [0.96, -0.96]) b.color([0.28, 0.42, 0.5], MAT.WORN).box(x, 1.5, 1.3, 0.04, 0.45, 0.9);
    b.color(TRUCK, MAT.RUST).boxB(0, 0.4, 2.05, 1.9, 0.6, 0.12);                   // nina
    for (const x of [-0.65, 0.65]) b.color([1, 0.95, 0.75], MAT.GLOW).box(x, 0.85, 2.12, 0.3, 0.16, 0.04);
    b.color(DARK).boxB(0, 0.25, 2.18, 1.95, 0.3, 0.18);
    b.color(TRUCK2, MAT.RUST).boxB(0, 0.72, -1.05, 2.0, 0.12, 2.9);                // kast
    for (const x of [0.98, -0.98]) b.color(TRUCK, MAT.RUST).boxB(x, 0.84, -1.05, 0.06, 0.55, 2.9);
    b.color(TRUCK, MAT.RUST).boxB(0, 0.84, -2.48, 2.0, 0.55, 0.06);
    for (let k = 0; k < 4; k++) b.color(DARK).boxB(0, 0.84, -0.1 - k * 0.8, 2.02, 0.05, 0.06);
    b.color([0.36, 0.3, 0.2], MAT.WORN).boxB(0.45, 0.84, -1.6, 0.7, 0.5, 0.7); b.color([0.3, 0.32, 0.26], MAT.WORN).boxB(-0.5, 0.84, -0.7, 0.6, 0.4, 0.9);
    b.color([1, 0.12, 0.06], MAT.GLOW).box(0.8, 0.95, -2.52, 0.18, 0.1, 0.04); b.color([1, 0.12, 0.06], MAT.GLOW).box(-0.8, 0.95, -2.52, 0.18, 0.1, 0.04);
    b.color(STEEL, MAT.WORN).cyl(0.85, 1.8, 0.55, 0.06, 0.06, 0.9, 8, true);        // väljalasketoru
    M.hauler = b.build();
    // ratas (telg piki x-telge)
    b = new MB(); b.jit = 0;
    b.push().tf(0, 0, 0, 0, 0, Math.PI / 2);
    b.color([0.06, 0.06, 0.06], MAT.WORN).cyl(0, -0.17, 0, 0.45, 0.45, 0.34, 16, true);
    b.color([0.45, 0.44, 0.42], MAT.WORN).cyl(0, -0.18, 0, 0.22, 0.22, 0.36, 10, true);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.color([0.1, 0.1, 0.1]).box(Math.sin(a) * 0.43, 0, Math.cos(a) * 0.43, 0.09, 0.36, 0.09); }
    b.pop();
    M.wheel = b.build();
    // kuulipilduja (pöördosa; toru +z suunas)
    b = new MB(); b.jit = 0;
    b.color(DARK, MAT.WORN).box(0, 0, 0.1, 0.16, 0.2, 0.8);
    b.color(STEEL, MAT.WORN).box(0, 0.02, 0.85, 0.07, 0.07, 0.9);
    b.color(DARK).box(0, 0.02, 1.32, 0.11, 0.11, 0.12);
    b.color([0.3, 0.32, 0.25], MAT.WORN).box(0.17, -0.06, 0.15, 0.16, 0.2, 0.3);   // padrunikast
    b.color(STEEL, MAT.WORN).box(0, 0.1, -0.12, 0.6, 0.45, 0.04);                  // kilp
    b.color(DARK).box(0, -0.12, -0.32, 0.05, 0.05, 0.3);
    M.gun = b.build();
    // tõstuk (garaaži sisseseade): 4 x 6 m põrand, esikülg +z (garaažiuks)
    b = new MB(); b.jit = 0;
    b.color([0.2, 0.2, 0.21], MAT.WORN).boxB(0, 0, 0, 3.6, 0.03, 5.6);
    for (let k = -6; k <= 6; k++) b.color(k % 2 ? [0.9, 0.7, 0.1] : [0.08, 0.08, 0.08]).boxB(k * 0.26, 0.03, 2.65, 0.26, 0.01, 0.2);
    for (const x of [1.75, -1.75]) {
      b.color([0.85, 0.55, 0.1], MAT.RUST).boxB(x, 0, 0, 0.36, 3.3, 0.36);          // post
      b.color(DARK, MAT.WORN).boxB(x, 0, 0, 0.6, 0.08, 0.6);
      b.color([0.15, 0.15, 0.16]).boxB(x, 3.25, 0, 0.42, 0.12, 0.42);
      for (const z of [0.9, -0.9]) b.push().tf(x * 0.7, 0.3, 0, Math.atan2(-x * 0.6, z), 0, 0).color([0.3, 0.3, 0.32], MAT.WORN).box(0, 0, 0.5, 0.14, 0.1, 1.1).pop();
    }
    b.color([0.12, 0.12, 0.13]).boxB(0, 3.3, 0, 3.86, 0.14, 0.22);                   // ülemine tala
    b.color([0.25, 0.26, 0.28]).boxB(-1.75, 1.1, 0.32, 0.3, 0.42, 0.2);             // juhtpult
    b.color([0.2, 1.0, 0.35], MAT.GLOW).box(-1.75, 1.42, 0.43, 0.06, 0.06, 0.02);
    b.color([1.0, 0.2, 0.1], MAT.GLOW).box(-1.66, 1.42, 0.43, 0.06, 0.06, 0.02);
    b.color([0.3, 0.3, 0.32], MAT.WORN).boxB(1.55, 0, -2.4, 0.5, 0.9, 0.9);        // tööriistakapp
    b.color([0.8, 0.1, 0.08], MAT.RUST).boxB(1.55, 0.9, -2.4, 0.5, 0.06, 0.9);
    M.lift = b.build();
    if (MODELS.obj && !MODELS.obj.tostuk) MODELS.obj.tostuk = M.lift;
    return M;
  }

  // ---------- olek ----------
  function spawn(type, x, z, yaw, extra) {
    if (!DEF[type]) type = DEFAULT_TYPE;
    const d = DEF[type];
    const v = Object.assign({ id: nextId++, type, team: 'crew', x, y: World.heightAt(x, z), z, yaw, speed: 0, steer: 0, hp: d.hp, maxHp: d.hp, cargo: d.gun ? { ammo_r: 240 } : {}, seats: [null, null],
      wheelRot: 0, pitch: 0, roll: 0, gunYaw: yaw, gunPitch: 0, gunCool: 0, m: M4.create(), wm: d.wheels.map(() => M4.create()), gm: M4.create(), throttle: 0, steerIn: 0, brake: 0, dead: false, hurtT: 0, ai: null }, extra || {});
    nextId = Math.max(nextId, v.id + 1);
    v.y = groundAt(v.x, v.z, v.y);
    list.push(v);
    return v;
  }
  function groundAt(x, z, y) { return Math.max(World.heightAt(x, z), Bases.floorAt(x, z, y === undefined ? 0 : y + 0.5)); }
  function near(x, z, r) { for (const v of list) if (!v.dead && Math.hypot(v.x - x, v.z - z) < r) return v; return null; }
  function seatWorld(v, k, out) { M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll); const s = seatsOf(v)[k]; return M4.point(v.m, s.x, s.y, s.z, out || {}); }
  const nameOf = (v) => DEF[v.type].name;
  function cargoCount(v) { let n = 0; for (const k in v.cargo) n += v.cargo[k]; return n; }
  function cargoText(v) { const p = []; for (const k in v.cargo) if (v.cargo[k] > 0) p.push(v.cargo[k] + ' ' + (ITEMS[k] ? ITEMS[k].name : k)); return p.join(', ') || 'empty'; }

  // ---------- füüsika ----------
  function step(v, dt) {
    const d = DEF[v.type];
    // gaas / pidur / tagurpidi
    const thr = v.throttle;
    if (v.brake) v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), d.brake * 1.2 * dt);
    else if (thr > 0.05) v.speed += (v.speed < -0.3 ? d.brake : d.accel) * thr * dt;
    else if (thr < -0.05) v.speed += (v.speed > 0.3 ? -d.brake : -d.accel * 0.7) * -thr * dt;
    else { v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), (1.6 + Math.abs(v.speed) * 0.35) * dt); }
    // liiv aeglustab, tõus ka
    const sand = Bases.at(v.x, v.z) && Bases.at(v.x, v.z).isInside(v.x, v.z) ? 1 : 0.92;
    v.speed = clamp(v.speed, -d.rev, d.maxSpeed * sand);
    // rool
    const steerT = v.steerIn * 0.55 * (1 - Math.min(0.72, Math.abs(v.speed) / 24));
    v.steer += (steerT - v.steer) * Math.min(1, dt * 6);
    v.yaw -= v.speed / d.wheelBase * Math.tan(v.steer) * dt;
    // liikumine + kokkupõrked kahe ringiga (esi- ja tagaots)
    const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw);
    const ox = v.x, oz = v.z, oh = World.heightAt(ox, oz);
    let nx = v.x + fx * v.speed * dt, nz = v.z + fz * v.speed * dt;
    const L = d.len || 0.9, pF = { x: nx + fx * L, z: nz + fz * L }, pB = { x: nx - fx * L, z: nz - fz * L };
    const y0 = v.y + 0.35, y1 = v.y + 1.7;
    const hitF = World.collideCircle(pF, 1.0, y0, y1, true), hitB = World.collideCircle(pB, 1.0, y0, y1, true);
    nx = (pF.x + pB.x) / 2; nz = (pF.z + pB.z) / 2;
    if (hitF || hitB) {
      const moved = Math.hypot(nx - ox, nz - oz), want = Math.abs(v.speed * dt);
      if (Math.abs(v.speed) > 7 && moved < want * 0.5) { const dmg = (Math.abs(v.speed) - 7) * 6; v.hp -= dmg; v.hurtT = 0.3; UI.shake(0.4); Audio2.land(); }
      v.speed *= hitF && v.speed > 0 || hitB && v.speed < 0 ? 0.35 : 0.8;
    }
    // järsk kalju: ei sõida üles
    const nh = World.heightAt(nx, nz), hd = Math.hypot(nx - ox, nz - oz);
    if (hd > 1e-4 && nh - oh > hd * 1.0 && !Bases.at(nx, nz)) { nx = ox; nz = oz; v.speed *= 0.3; }
    v.x = clamp(nx, -World.HALF + 14, World.HALF - 14); v.z = clamp(nz, -World.HALF + 14, World.HALF - 14);
    // maapind, kalle
    const gy = groundAt(v.x, v.z, v.y);
    v.y += (gy - v.y) * Math.min(1, dt * 14);
    if (v.y < gy - 0.05) v.y = gy - 0.05;
    const hF = groundAt(v.x + fx * 1.25, v.z + fz * 1.25, v.y), hB = groundAt(v.x - fx * 1.25, v.z - fz * 1.25, v.y);
    const lx = Math.cos(v.yaw), lz = -Math.sin(v.yaw);
    const hL = groundAt(v.x + lx * 0.8, v.z + lz * 0.8, v.y), hR = groundAt(v.x - lx * 0.8, v.z - lz * 0.8, v.y);
    v.pitch += (-Math.atan2(hF - hB, 2.5) - v.pitch) * Math.min(1, dt * 8);
    v.roll += (Math.atan2(hL - hR, 1.6) - v.roll) * Math.min(1, dt * 8);
    v.wheelRot += v.speed * dt / 0.45;
    // olendid: vaenlased saavad löögi, omad lükatakse eest
    for (const e of Ents.list) {
      if (!e.alive || e.kind === 'player' || e.inVehicle || e.kind === 'boss' || e.kind === 'core' || e.kind === 'rturret' || e.kind === 'jelly') continue;
      const ex = e.pos.x - v.x, ez = e.pos.z - v.z, dd = Math.hypot(ex, ez), m = 1.7 + (e.radius || 0.4);
      if (dd > m || dd < 1e-3 || Math.abs(e.pos.y - v.y) > 2) continue;
      const friendly = v.team === 'crew' ? (e.team === 'crew' || e.team === 'player') : e.team === v.team;
      if (!friendly && Math.abs(v.speed) > 5 && !(e.hitBy && e.hitBy > G.time.total)) {
        e.hitBy = G.time.total + 0.6;
        Ents.damage(e, Math.abs(v.speed) * 6, v.seats[0] === Player ? Player : v.seats[0] || null);
        v.speed *= e.kind === 'crab' || e.kind === 'kiskja' ? 0.5 : 0.85;
        FX.dust(e.pos.x, e.pos.y + 0.4, e.pos.z, 10, 2); UI.shake(0.2);
      }
      const k = (m - dd) / dd; e.pos.x += ex * k; e.pos.z += ez * k;
    }
    v.engine = Math.abs(v.speed);
  }

  // kuulipildur-AI (meeskonnaliige tagaistmel)
  function aiGunner(v, e, dt) {
    v.gunCool -= dt;
    M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
    const G0 = DEF[v.type].gun; if (!G0) { e.yaw = v.yaw; e.pose = 'sit'; return; }
    const gp = M4.point(v.m, G0.x, G0.y, G0.z, tmp);
    e.scanT = (e.scanT || 0) - dt;
    if (e.scanT <= 0) { e.scanT = 0.35; e.vThreat = findThreat(gp.x, gp.y, gp.z, 70, e.team, e.team === 'crew' ? null : Crew.turretTargets()); }
    const t = e.vThreat;
    if (t && targetAlive(t)) {
      const tp = targetPoint(t), want = Math.atan2(tp.x - gp.x, tp.z - gp.z);
      v.gunYaw += angDiff(v.gunYaw, want) * Math.min(1, dt * 7);
      v.gunPitch = Math.atan2(tp.y - gp.y, Math.hypot(tp.x - gp.x, tp.z - gp.z));
      if (v.gunCool <= 0 && Math.abs(angDiff(v.gunYaw, want)) < 0.12) {
        const ammo = (v.cargo.ammo_r || 0) > 0 ? 'cargo' : v.team === 'crew' && (G.stash.ammo_r || 0) > 0 && Base.isInside(v.x, v.z) ? 'stash' : null;
        if (ammo) {
          if (ammo === 'cargo') v.cargo.ammo_r--; else G.stash.ammo_r--;
          v.gunCool = 0.11;
          const fake = { pos: { x: gp.x, y: gp.y - 1.33, z: gp.z }, yaw: v.gunYaw, team: e.team, kind: 'turret' };
          fireAt(fake, t, 16, 0.55, 'lmg');
        } else if (!v.noAmmoMsg && v.team === 'crew') { v.noAmmoMsg = true; UI.toast('The buggy machine gun is out of rifle ammo – load some into the cargo box.'); }
      }
    } else { v.gunYaw += angDiff(v.gunYaw, v.yaw) * Math.min(1, dt * 1.5); v.gunPitch *= 0.95; }
    e.yaw = v.gunYaw; e.aim = 1; e.hasGun = true; e.pose = 'stand';
  }

  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const v = list[i];
      if (v.hurtT > 0) v.hurtT -= dt;
      if (v.dead) continue;
      const drv = v.seats[0];
      if (drv && drv !== Player && v.ai) aiDrive(v, dt);
      else if (drv !== Player) { v.throttle = 0; v.steerIn = 0; v.brake = v.speed !== 0 && Math.abs(v.speed) < 0.4 ? 1 : 0; }
      if (Math.abs(v.speed) > 0.01 || drv || Math.abs(v.y - groundAt(v.x, v.z, v.y)) > 0.02) step(v, dt);
      // istujad kaasa
      for (let k = 0; k < 2; k++) {
        const e = v.seats[k]; if (!e || e === Player) continue;
        if (!e.alive || e.downed) { leave(v, e); continue; }
        seatWorld(v, k, tmp2); e.pos.x = tmp2.x; e.pos.y = tmp2.y - (seatsOf(v)[k].sit ? 0.55 : 0); e.pos.z = tmp2.z; e.moveAmt = 0;
        if (k === 1) aiGunner(v, e, dt); else { e.yaw = v.yaw; e.pose = 'sit'; }
      }
      // baasis: kast tühjendatakse lattu
      if (v.team === 'crew' && cargoCount(v) > 0 && Base.isInside(v.x, v.z)) {
        const parts = [];
        for (const k in v.cargo) { const n = v.cargo[k]; if (n > 0 && k !== 'ammo_r') { Inv.stashAdd(k, n); parts.push(n + ' ' + (ITEMS[k] ? ITEMS[k].name : k)); v.cargo[k] = 0; } }
        if (parts.length) { UI.toast(nameOf(v) + ' unloaded to storage: ' + parts.join(' · ')); Audio2.pickup(); if (G.flags.stonesHome) Game.stonesHome(); }
      }
      if (v.hp <= 0) destroy(v);
    }
  }
  function destroy(v) {
    v.dead = true; v.hp = 0; v.speed = 0;
    FX.explosion(v.x, v.y + 1, v.z, [1, 0.6, 0.3], 3); Audio2.explode(v.x, v.z, true); UI.shake(0.7);
    for (let k = 0; k < 2; k++) if (v.seats[k]) { const e = v.seats[k]; leave(v, e); if (e === Player) Player.hurt(35, null); else Ents.damage(e, 35, null); }
    const items = []; for (const k in v.cargo) if (v.cargo[k] > 0) items.push([k, v.cargo[k]]);
    if (items.length) Ents.pickups.push({ kind: 'bag', x: v.x + 2, y: World.heightAt(v.x + 2, v.z), z: v.z, data: { items }, id: Math.random() });
    v.cargo = {};
    if (v.team === 'crew') UI.msg('The ' + nameOf(v).toLowerCase() + ' was destroyed! Strip the wreck for scrap and buy a new one in the garage.', 'danger');
    v.ai = null;
  }

  // ---------- mängija ----------
  function enter(v, seat) {
    if (v.dead || v.seats[seat]) return false;
    if (v.team !== 'crew') { if (v.seats.some(Boolean)) return false; v.team = 'crew'; v.ai = null; UI.toast('You took the ' + nameOf(v).toLowerCase() + '!'); }
    v.seats[seat] = Player; Player.vehicle = v; Player.seat = seat; v.ai = null;
    Player.vel.x = Player.vel.y = Player.vel.z = 0;
    if (seat === 1 && DEF[v.type].gun) { Player._wBefore = Player.weapon; Player.weapon = 'bugmg'; if (!Player.mag.bugmg) reloadGun(v); }
    Audio2.door(v.x, v.z);
    // jälgija hüppab kuulipilduja taha
    if (seat === 0 && !v.seats[1] && typeof Crew !== 'undefined') {
      const f = Crew.followers().filter((e) => e.alive && !e.downed && Math.hypot(e.pos.x - v.x, e.pos.z - v.z) < 16).sort((a, b) => Math.hypot(a.pos.x - v.x, a.pos.z - v.z) - Math.hypot(b.pos.x - v.x, b.pos.z - v.z))[0];
      if (f) { v.seats[1] = f; f.inVehicle = v; UI.toast(f.crew.name.split(' ')[0] + (DEF[v.type].gun ? ' mans the machine gun' : ' rides along')); }
    }
    return true;
  }
  function leave(v, e) {
    const k = v.seats.indexOf(e); if (k < 0) return;
    v.seats[k] = null;
    M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
    const side = k === 0 ? 1 : -1;
    const p = M4.point(v.m, 1.5 * side, 0, k === 0 ? 0.1 : -1.0, {});
    const q = { x: p.x, z: p.z }; World.collideCircle(q, 0.4, v.y + 0.3, v.y + 1.7, true);
    if (e === Player) {
      Player.vehicle = null; Player.seat = 0;
      if (Player._wBefore) { Player.weapon = Player._wBefore; Player._wBefore = null; }
      Player.pos.x = q.x; Player.pos.z = q.z; Player.pos.y = Ents.groundY(q.x, q.z, v.y + 0.5); Player.vel.x = Player.vel.z = 0;
      Player.yaw = v.yaw + (k === 0 ? Math.PI / 2 : Math.PI); Player.pitch = 0;
      // kui juht lahkub, lahkub ka meeskonnaliige
      for (let s = 0; s < 2; s++) if (v.seats[s] && v.seats[s] !== Player) leave(v, v.seats[s]);
    } else {
      e.inVehicle = null; e.pos.x = q.x; e.pos.z = q.z; e.pos.y = Ents.groundY(q.x, q.z, v.y + 0.5); e.pose = 'stand';
      // jätka teekonda jalgsi sinna, kuhu sõit viis
      if (e.ride) { const r = e.ride; e.ride = null; if (r.goal) { e._noRide = true; Ents.goTo(e, r.goal.x, r.goal.z, r.goalCells, r.lv); e._noRide = false; } } else e.path = null;
    }
  }
  function reloadGun(v) {
    const need = WEAPONS.bugmg.mag - (Player.mag.bugmg || 0); if (need <= 0) return true;
    let got = Math.min(need, v.cargo.ammo_r || 0); v.cargo.ammo_r = (v.cargo.ammo_r || 0) - got;
    if (got < need) got += Inv.take('ammo_r', need - got) || 0;
    if (!got) { UI.toast('No rifle ammo in the cargo box or your backpack.'); return false; }
    Player.mag.bugmg = (Player.mag.bugmg || 0) + got; Player.reloadT = 1.2; Audio2.reload(); return true;
  }
  // mängija sõidukis (kutsub Player.update)
  function playerUpdate(P, dt, inp) {
    const v = P.vehicle;
    if (!v || v.dead) { if (v) leave(v, P); P.vehicle = null; return; }
    if (P.lastHurt > 6 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + dt * 4 * Inv.regenMul());
    Inv.update(dt);
    P.yaw -= inp.lookX; P.pitch = clamp(P.pitch - inp.lookY, -1.2, 1.2);
    if (inp.lookX || inp.lookY) P._lookT = 0; else P._lookT = (P._lookT || 0) + dt;
    const seat = P.seat;
    if (seat === 0) {
      v.throttle = inp.moveY; v.steerIn = inp.moveX; v.brake = inp.jump || inp.sprint && false ? 1 : 0;
      if (inp.jump) v.brake = 1;
      // kaamera pöörab ise sõidusuunda, kui hiirt/sõrme ei liigutata
      if (P._lookT > 1.2 && Math.abs(v.speed) > 2) { const want = v.speed > 0 ? v.yaw : v.yaw + Math.PI; P.yaw += angDiff(P.yaw, want) * Math.min(1, dt * 1.6); P.pitch += (-0.18 - P.pitch) * Math.min(1, dt * 1.5); }
    }
    // asukoht istmel
    seatWorld(v, seat, tmp);
    const GN = DEF[v.type].gun;
    P.pos.x = tmp.x; P.pos.z = tmp.z; P.pos.y = tmp.y - (seatsOf(v)[seat].sit ? 0.55 : 0);
    if (seat === 1 && GN) { const gp = M4.point(v.m, GN.x, GN.y, GN.z, tmp2); P.pos.y = gp.y - P.eyeH + 0.32; }
    P.vel.x = Math.sin(v.yaw) * v.speed; P.vel.z = Math.cos(v.yaw) * v.speed; P.vel.y = 0; P.onGround = true;
    P.speedNow = 0; P.moveAmt = 0;
    if (seat === 1 && GN) {
      v.gunYaw = P.yaw; v.gunPitch = P.pitch;
      if ((inp.fire || inp.reload) && (P.mag.bugmg || 0) <= 0 && P.reloadT <= 0) reloadGun(v);
      if (P.reloadT > 0) { P.reloadT -= dt; }
      else if (inp.fire && P.fireCool <= 0 && (P.mag.bugmg || 0) > 0) P.shoot(WEAPONS.bugmg, inp);
      if (P.fireCool > 0) P.fireCool -= dt;
      P.recoil = Math.max(0, P.recoil - dt * 6); P.kick = Math.max(0, P.kick - dt * 8);
    }
    // tegevus: lühike vajutus = vaheta istet, pikk = välju
    P.inter = { key: 'veh' + seat, label: 'Hold E: get out', sub: seat === 0 ? 'Tap E: ' + (GN ? 'man the machine gun' : 'move to the passenger seat') + ' · Space: brake · cargo: ' + cargoText(v) : 'Tap E: take the wheel' + (GN ? ' · ammo ' + (P.mag.bugmg || 0) + ' + ' + (v.cargo.ammo_r || 0) : ''), hold: 0.6 };
    if (inp.actHeld) { P.interT += dt; if (P.interT >= 0.6) { P.interT = 0; P._actUsed = true; leave(v, P); return; } }
    else {
      if (P.interT > 0 && P.interT < 0.35 && !P._actUsed) {   // lühike vajutus
        const other = 1 - seat;
        if (!v.seats[other] || v.seats[other] !== Player) {
          const crew = v.seats[other];
          if (crew && crew !== Player) { v.seats[seat] = crew; v.seats[other] = null; crew.inVehicle = v; }
          else v.seats[seat] = null;
          v.seats[other] = Player;
          if (P.seat === 1 && P._wBefore) { P.weapon = P._wBefore; P._wBefore = null; }
          P.seat = other;
          if (other === 1 && GN) { P._wBefore = P.weapon; P.weapon = 'bugmg'; if (!P.mag.bugmg) reloadGun(v); }
        }
      }
      P.interT = 0; P._actUsed = false;
    }
    // seljakoti ladustamine baasis
    if (Base.isInside(P.pos.x, P.pos.z) && (Inv.count('kris') || Inv.count('scrap') || Inv.count('meat') || Inv.count('stones'))) P.deposit();
    Audio2.setListener(P.pos.x, P.pos.z, P.yaw);
  }
  // mängija kaamera sõidukis
  function camera(C) {
    const v = Player.vehicle;
    if (Player.seat === 1 && DEF[v.type].gun) return false;   // kuulipilduja: esimese isiku vaade
    const ty = v.y + 1.7;
    const dist = 7.2, cp = Math.cos(Player.pitch), sp = Math.sin(Player.pitch);
    let cx = v.x - Math.sin(Player.yaw) * cp * dist, cz = v.z - Math.cos(Player.yaw) * cp * dist, cy = ty - sp * dist + 0.8;
    cy = Math.max(cy, World.heightAt(cx, cz) + 0.6);
    C.useTarget = true; C.target.x = v.x; C.target.y = ty; C.target.z = v.z;
    C.pos.x = cx; C.pos.y = cy; C.pos.z = cz;
    return true;
  }
  // mängija interaktsioonid sõiduki juures (Player.findInteract kutsub)
  function interactions(consider) {
    for (const v of list) {
      if (Math.hypot(v.x - Player.pos.x, v.z - Player.pos.z) > 5) continue;
      M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
      const dp = M4.point(v.m, 1.1, 0, 0.1, {}), rp = M4.point(v.m, 0, 0, -2.0, {});
      const nm = nameOf(v).toLowerCase(), GN = DEF[v.type].gun;
      if (v.team !== 'crew' && v.seats.some(Boolean)) continue;
      if (v.dead) { consider({ key: 'vd' + v.id, label: 'Strip the ' + nm + ' wreck', sub: 'Get scrap back · a new buggy can be bought at the car lift', hold: 2.0, act: () => { const n = Math.min(40, Inv.room('scrap')); if (n > 0) Inv.add('scrap', n); list.splice(list.indexOf(v), 1); UI.toast('+' + n + ' scrap from the wreck'); Audio2.repair(); }, tick: () => FX.repair(v.x + rand(-1, 1), v.y + 0.8, v.z + rand(-1, 1)) }, v.x, v.z, 3.5); continue; }
      if (!v.seats[0]) consider({ key: 've' + v.id, label: (v.team === 'crew' ? 'Drive the ' : 'Steal the ') + nm, sub: 'hp ' + Math.round(v.hp) + '/' + v.maxHp + ' · cargo: ' + cargoText(v), act: () => enter(v, 0) }, dp.x, dp.z, 3.4);
      if (!v.seats[1] && GN && v.team === 'crew') consider({ key: 'vg' + v.id, label: 'Man the machine gun', sub: 'ammo in cargo ' + (v.cargo.ammo_r || 0), act: () => enter(v, 1) }, rp.x + Math.sin(v.yaw) * 0.6, rp.z + Math.cos(v.yaw) * 0.6, 2.6);
      if (v.team !== 'crew') continue;
      const packN = Inv.idx().reduce((n, i) => n + (Inv.ensure().slots[i] ? 1 : 0), 0);
      if (packN) consider({ key: 'vl' + v.id, label: 'Load backpack into the ' + nm, sub: 'cargo ' + cargoCount(v) + '/' + DEF[v.type].cargoCap + ' · unloads to storage at the base', hold: 0.8, act: () => loadPack(v) }, rp.x, rp.z, 2.4);
      else if (cargoCount(v)) consider({ key: 'vu' + v.id, label: 'Take from the ' + nm, sub: cargoText(v), act: () => unloadToPack(v) }, rp.x, rp.z, 2.4);
    }
  }
  function loadPack(v) {
    const inv = Inv.ensure(), cap = DEF[v.type].cargoCap; let moved = 0;
    for (const i of Inv.idx()) {
      const s = inv.slots[i]; if (!s) continue;
      const room = cap - cargoCount(v); if (room <= 0) break;
      const n = Math.min(room, s.n), got = Inv.take(s.id, n);
      if (got) { v.cargo[s.id] = (v.cargo[s.id] || 0) + got; moved += got; }
    }
    if (moved) { Audio2.pickup(); UI.toast('Loaded into the ' + nameOf(v).toLowerCase() + ': ' + cargoText(v)); } else UI.toast('The cargo box is full');
  }
  function unloadToPack(v) {
    let moved = 0;
    for (const k in v.cargo) { const n = v.cargo[k]; if (n <= 0) continue; const r = Inv.room(k); const m = Math.min(n, r); if (m > 0) { Inv.add(k, m); v.cargo[k] -= m; moved += m; } }
    UI.toast(moved ? 'Took ' + moved + ' things into your backpack' : 'Your backpack is full'); if (moved) Audio2.pickup();
  }
  // ---------- garaaž: ostumenüü ----------
  function liftInteraction(o) {
    if (!o.on) return { label: 'Garage', sub: 'No power', disabled: true };
    const v = vehicleOnLift(o);
    return { label: 'Open the garage', sub: v ? nameOf(v) + ' on the lift · ' + Math.round(v.hp) + '/' + v.maxHp + ' hp' : 'Buy vehicles, repair and sell', act: () => UI.openGarage(o) };
  }
  function vehicleOnLift(o) { return list.find((q) => !q.dead && Math.hypot(q.x - o.cx, q.z - o.cz) < 3.6) || null; }
  function canBuy(type, o) {
    const d = DEF[type];
    if (!o || !o.on) return 'The lift has no power';
    if (vehicleOnLift(o)) return 'Drive the vehicle off the lift first';
    if (G.res.cr < d.cost.c) return 'Need ' + d.cost.c + ' ₵';
    if (G.res.scrap < d.cost.s) return 'Need ' + d.cost.s + ' scrap';
    return null;
  }
  function buy(type, o) {
    if (canBuy(type, o)) return false;
    const d = DEF[type];
    G.res.cr -= d.cost.c; G.res.scrap -= d.cost.s;
    const nv = spawn(type, o.cx, o.cz, o.rot * Math.PI / 2); nv.y = groundAt(nv.x, nv.z, OY0() + 0.5);
    Audio2.cash(); UI.banner(d.name + ' bought', d.desc + ' E to drive.', 'good');
    G.flags.buggy = true;
    return nv;
  }
  function repairCost(v) { const half = Base.objsOfType('tostuk').some((o) => Crew.roomJobOf(o) === 'Garage'); return Math.ceil((v.maxHp - v.hp) / 12 * (half ? 0.5 : 1)); }
  function repair(v) { const c = repairCost(v); if (c <= 0 || G.res.scrap < c) return false; G.res.scrap -= c; v.hp = v.maxHp; Audio2.repair(); return true; }
  function sell(v) { if (v.seats.some(Boolean)) return false; const d = DEF[v.type], val = Math.round(d.cost.c * 0.4 * (v.hp / v.maxHp)); G.res.cr += val; list.splice(list.indexOf(v), 1); Audio2.cash(); UI.toast(d.name + ' sold for ' + val + ' ₵'); return true; }
  function owned() { return list.filter((v) => v.team === 'crew'); }

  // ---------- AI juhid (meeskond ja konkurendid) ----------
  // Ents.goTo kutsub: kui tee on pikk ja lähedal on vaba oma sõiduk, sõidab inimene sellega
  function tryRide(e, x, z, goalCells, lv) {
    if (!e || e._noRide || e.inVehicle || e.kind !== 'human' || e.downed || lv) return false;
    const team = e.team; if (team !== 'crew' && !e.rival) return false;
    const dist = Math.hypot(x - e.pos.x, z - e.pos.z); if (dist < 110) return false;
    // juba ootav sõiduk sama sihtkohaga -> kõrvalistmele
    for (const v of list) {
      if (v.dead || v.team !== team || !v.ai || v.seats[1] || v.ai.go || Math.hypot(v.x - e.pos.x, v.z - e.pos.z) > 14) continue;
      if (Math.hypot(v.ai.dest.x - x, v.ai.dest.z - z) > 40) continue;
      board(v, e, 1, x, z, goalCells, lv); return true;
    }
    const v = list.filter((q) => !q.dead && q.team === team && !q.seats[0] && !q.seats[1] && q !== Player.vehicle && Math.hypot(q.x - e.pos.x, q.z - e.pos.z) < 26)
      .sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
    if (!v) return false;
    // sihtpunkt: baasi puhul garaaži tõstuk (kui on), muidu otse
    let dx = x, dz = z;
    const B = Bases.at(x, z);
    if (team === 'crew' && B === Base) { const lift = Base.objsOfType('tostuk')[0]; if (lift) { dx = lift.cx; dz = lift.cz; } else { const a = Math.atan2(e.pos.x - x, e.pos.z - z); dx = x + Math.sin(a) * 16; dz = z + Math.cos(a) * 16; } }
    v.ai = { dest: { x: dx, z: dz }, wait: 1.6, stuckT: 0, revT: 0, go: false, home: B === Base || (e.rival && Math.hypot(x - e.rival.base.x, z - e.rival.base.z) < 30) };
    board(v, e, 0, x, z, goalCells, lv);
    return true;
  }
  function board(v, e, seat, x, z, goalCells, lv) {
    v.seats[seat] = e; e.inVehicle = v; e.ride = { goal: { x, z }, goalCells: goalCells || null, lv: lv || 0 };
    e.path = [{ x, z }]; e.pathI = 0; e.goal = { x, z };
    if (e.crew) e.crew.act = seat === 0 ? 'Driving the ' + nameOf(v).toLowerCase() : 'Riding along';
  }
  function aiDrive(v, dt) {
    const a = v.ai, d = DEF[v.type];
    if (a.wait > 0) { a.wait -= dt; v.throttle = 0; v.steerIn = 0; v.brake = 1; if (a.wait <= 0) a.go = true; return; }
    const dx = a.dest.x - v.x, dz = a.dest.z - v.z, dist = Math.hypot(dx, dz);
    const want = Math.atan2(dx, dz), err = angDiff(v.yaw, want);
    const arriveR = a.home ? 6 : 9;
    if (dist < arriveR || (a.home && Bases.at(v.x, v.z) && Bases.at(v.x, v.z).isInside(v.x, v.z) && dist < 14)) { arrive(v); return; }
    // tagurdamine, kui kinni
    if (a.revT > 0) { a.revT -= dt; v.throttle = -0.8; v.steerIn = err > 0 ? 1 : -1; v.brake = 0; return; }
    v.steerIn = clamp(-err * 2.2, -1, 1) * (v.speed < 0 ? -1 : 1);
    const slow = dist < 30 ? 0.45 : Math.abs(err) > 1.0 ? 0.35 : 1;
    v.throttle = slow; v.brake = Math.abs(v.speed) > d.maxSpeed * 0.55 && dist < 20 ? 1 : 0;
    if (Math.abs(v.speed) < 1.2) { a.stuckT += dt; if (a.stuckT > 2.2) { a.stuckT = 0; a.revT = 1.3; a.stuckN = (a.stuckN || 0) + 1; if (a.stuckN > 5) arrive(v); } } else a.stuckT = 0;
  }
  function arrive(v) {
    v.throttle = 0; v.steerIn = 0; v.brake = 1; v.speed *= 0.3;
    v.ai = null;
    for (let k = 1; k >= 0; k--) { const e = v.seats[k]; if (e && e !== Player) leave(v, e); }
  }
  // konkurent ostab sõiduki samadel tingimustel (raha + vanaraud)
  function rivalBuy(r, type) {
    const d = DEF[type];
    const f = Math.atan2(-r.base.x, -r.base.z), x = r.base.x + Math.sin(f + 0.9) * 9, z = r.base.z + Math.cos(f + 0.9) * 9;
    return spawn(type, x, z, f, { team: r.team, rivalId: r.id });
  }
  function teamVehicles(team) { return list.filter((v) => v.team === team && !v.dead); }
  function OY0() { return Base.OY || 0; }

  // ---------- joonistus ----------
  const figs = [{ id: 9001, team: 'player', pos: { x: 0, y: 0, z: 0 }, yaw: 0, phase: 0, moveAmt: 0, aim: 0, pose: 'sit', hasGun: false, hurtT: 0, flash: 0, kind: 'human' }];
  function draw() {
    if (!M) initMeshes();
    for (const v of list) {
      M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
      const tint = v.dead ? [0.25, 0.22, 0.2, 0] : v.hurtT > 0 ? [1.6, 0.7, 0.6, 0] : null;
      const d = DEF[v.type];
      const rt = !tint && v.team !== 'crew' && typeof Rivals !== 'undefined' && Rivals.get(v.team) ? Rivals.get(v.team).tint : tint;
      GFX.draw(M[d.mesh], v.m, rt, null, { rust: 0.7 });
      for (let k = 0; k < d.wheels.length; k++) {
        const [wx, wy, wz] = d.wheels[k];
        M4.child(v.wm[k], v.m, wx, wy, wz, k < 2 ? -v.steer : 0, v.wheelRot / d.wheelS, 0, d.wheelS, d.wheelS, d.wheelS);
        GFX.draw(M.wheel, v.wm[k], v.dead ? tint : null, null, { rust: 0.3 });
      }
      // kuulipilduja: maailma suunas
      if (d.gun) {
        const gp = M4.point(v.m, d.gun.x, d.gun.y, d.gun.z, tmp);
        M4.compose(v.gm, gp.x, gp.y, gp.z, v.gunYaw, -v.gunPitch, 0);
        GFX.draw(M.gun, v.gm, tint, null, { rust: 0.4 });
      }
      if (!v.dead && GFX.env.night > 0.35) {
        const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw);
        GFX.addLight(v.x + fx * 6, v.y + 1.2, v.z + fz * 6, 16, 1.0, 0.95, 0.8, 1.8);
      }
      if (!v.dead && Math.abs(v.speed) > 6 && Math.random() < 0.5) FX.dust(v.x - Math.sin(v.yaw) * 1.6 + rand(-0.6, 0.6), v.y + 0.2, v.z - Math.cos(v.yaw) * 1.6 + rand(-0.6, 0.6), 2, 1);
      // mängija juhiistmel (kolmanda isiku vaates nähtav)
      if (Player.vehicle === v && Player.seat === 0 && Ents.drawHuman) {
        const f = figs[0]; seatWorld(v, 0, f.pos); f.pos.y -= 0.55; f.yaw = v.yaw; f.look = G.look; f.headYaw = 0;
        Ents.drawHuman(f);
      }
    }
  }
  function sound(dt) { /* mootorit kuuleb läbi tolmu */ }

  // ---------- salvestus ----------
  function serialize() { return list.map((v) => ({ id: v.id, type: v.type, team: v.team, x: v.x, z: v.z, yaw: v.yaw, hp: v.hp, dead: v.dead, cargo: v.cargo })); }
  function deserialize(arr) { reset(); for (const d of arr || []) { const v = spawn(d.type || 'buggy', d.x, d.z, d.yaw, { id: d.id, hp: d.hp, dead: !!d.dead, cargo: d.cargo || {}, team: d.team || 'crew' }); v.y = groundAt(v.x, v.z, 0.5); } }
  function reset() { for (const v of list) for (const e of v.seats) if (e && e !== Player) { e.inVehicle = null; e.ride = null; } list.length = 0; if (typeof Player !== 'undefined') { Player.vehicle = null; Player.seat = 0; } }

  return { DEF, list, initMeshes, spawn, near, update, draw, enter, leave, playerUpdate, camera, interactions, liftInteraction, serialize, deserialize, reset, cargoCount, sound,
    canBuy, buy, repair, repairCost, sell, owned, vehicleOnLift, tryRide, rivalBuy, teamVehicles, nameOf, cargoText };
})();
