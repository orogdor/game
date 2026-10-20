// ============================================================
//  SÕIDUKID: bagi (kaks istekohta + tagumine kuulipilduja, kast asjade vedamiseks)
// ============================================================
const Vehicles = (() => {
  // istmed kohalikus ruumis (+z ette, +x vasakule): 0 = juht, 1 = kuulipildur (bagi) / kõrvalistuja (veok)
  const DEF = {
    buggy: { name: 'Buggy', desc: 'Fast, two seats, rear machine gun, small cargo box.', hp: 450, maxSpeed: 19, rev: 6, accel: 8.5, brake: 20, wheelBase: 2.5, cargoCap: 200, cost: { c: 900, s: 120 },
      gun: { x: 0, y: 2.3, z: -0.75 }, seats: [{ x: 0.42, y: 0.62, z: 0.15, sit: true }, { x: 0, y: 1.06, z: -1.15, sit: false }, { x: -0.42, y: 0.62, z: 0.15, sit: true, rider: true }, { x: 0.62, y: 1.0, z: -1.7, sit: true, rider: true }],
      wheels: [[0.86, 0.45, 1.18], [-0.86, 0.45, 1.18], [0.86, 0.45, -1.12], [-0.86, 0.45, -1.12]], wheelS: 1, mesh: 'body', len: 0.9 },
    hauler: { name: 'Hauler truck', desc: 'Slow and tough: big cargo bed for hauling diamonds, ore and scrap. Two seats, no gun.', hp: 800, maxSpeed: 14, rev: 5, accel: 6, brake: 16, wheelBase: 3.3, cargoCap: 600, cost: { c: 1400, s: 220 },
      gun: null, seats: [{ x: 0.45, y: 1.0, z: 1.25, sit: true }, { x: -0.45, y: 1.0, z: 1.25, sit: true }, { x: 0.6, y: 1.45, z: -0.5, sit: true, rider: true }, { x: -0.6, y: 1.45, z: -0.5, sit: true, rider: true }, { x: 0.6, y: 1.45, z: -1.8, sit: true, rider: true }, { x: -0.6, y: 1.45, z: -1.8, sit: true, rider: true }],
      wheels: [[1.0, 0.55, 1.55], [-1.0, 0.55, 1.55], [1.0, 0.55, -0.9], [-1.0, 0.55, -0.9], [1.0, 0.55, -1.85], [-1.0, 0.55, -1.85]], wheelS: 1.22, mesh: 'hauler', len: 1.3 },
    // MECH: linnast leitud osadest kokku pandud kõndiv soomusmasin, piloot juhib ja tulistab minigunniga
    mech: { name: 'Atlas mech', desc: 'Walking armour with a minigun. Built from parts found in the old colony city.', hp: 2600, maxSpeed: 7.2, rev: 3, accel: 6, brake: 16, wheelBase: 2.2, cargoCap: 100, cost: { c: 0, s: 0 },
      gun: null, mechGun: true, walker: true, noBuy: true, seats: [{ x: 0, y: 4.35, z: 0.55, sit: true }], wheels: [], wheelS: 1, mesh: 'mech', len: 1.1 },
  };
  const MECH_PARTS = { legs: 'Mech leg actuators', torso: 'Mech torso armour', gun: 'Minigun arm', reactor: 'Mech micro-reactor', cpu: 'Pilot control unit' };
  const PART_KEYS = Object.keys(MECH_PARTS);
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
    const PAINT = [0.86, 0.44, 0.09], PAINT2 = [0.58, 0.28, 0.06], STRIPE = [0.93, 0.9, 0.84], DARK = [0.07, 0.07, 0.08], GUNM = [0.15, 0.155, 0.165];
    const STEEL = [0.45, 0.46, 0.48], CHROME = [0.78, 0.78, 0.8], SEAT = [0.17, 0.15, 0.13], RED = [0.72, 0.1, 0.06], YEL = [0.95, 0.72, 0.1], GLASS = [0.2, 0.3, 0.36];
    const detail0 = MB.detail; MB.detail = true;
    let b = new MB(); b.jit = 0;
    const tube = (x0, y0, z0, x1, y1, z1, r = 0.045, col = DARK, mat = MAT.METAL) => {
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz);
      const yaw = Math.atan2(dx, dz), pitch = -Math.asin(dy / L);
      b.push().tf((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, yaw, pitch, 0).tf(0, 0, 0, 0, Math.PI / 2, 0).color(col, mat).cyl(0, -L / 2, 0, r, r, L, 8, true).pop();
    };
    // ümar "ketas" x-telje suunas (tuled, embleemid, rattad)
    const discX = (x, y, z, r, h, col, mat) => { b.push().tf(x, y, z, 0, 0, Math.PI / 2).color(col, mat).cyl(0, -h / 2, 0, r, r, h, 16, true).pop(); };
    const discZ = (x, y, z, r, h, col, mat) => { b.push().tf(x, y, z, 0, Math.PI / 2, 0).color(col, mat).cyl(0, -h / 2, 0, r, r, h, 16, true).pop(); };
    // poritiib: kaar ratta kohal (kolm kaldus plaati)
    const fender = (wx, wy, wz, R, w, col) => {
      for (const a of [-0.95, -0.42, 0.1, 0.62]) {
        const a1 = a + 0.26;
        b.push().tf(wx, wy + Math.cos(a1) * R, wz + Math.sin(a1) * R, 0, a1, 0).color(col, MAT.PAINTED).box(0, 0, 0, w, 0.045, R * 0.56).pop();
      }
    };

    // ===================== BAGI =====================
    b.color(DARK, MAT.METAL).boxB(0, 0.34, 0.1, 1.1, 0.12, 3.5);                                // raam
    b.color(PAINT2, MAT.PAINTED).boxB(0, 0.44, 0.15, 1.44, 0.1, 2.05);                           // põhi
    for (const sx of [1, -1]) {
      b.color(PAINT, MAT.PAINTED).boxB(sx * 0.73, 0.44, 0.12, 0.14, 0.44, 1.75);               // külgkast
      b.color(STRIPE, MAT.PAINTED).box(sx * 0.805, 0.8, 0.12, 0.012, 0.06, 1.75);               // triip
      b.color(DARK).box(sx * 0.805, 0.71, 0.12, 0.012, 0.025, 1.75);
      discX(sx * 0.806, 0.6, -0.1, 0.15, 0.012, STRIPE, MAT.PAINTED);                            // võistlusnumbri ring
      b.color(DARK).box(sx * 0.814, 0.6, -0.1, 0.006, 0.17, 0.05); b.color(DARK).box(sx * 0.814, 0.67, -0.07, 0.006, 0.04, 0.05);
      for (let k = 0; k < 4; k++) b.color(DARK).box(sx * 0.806, 0.58, 0.45 + k * 0.09, 0.012, 0.16, 0.04);   // õhuavad
      b.color(DARK, MAT.METAL).boxB(sx * 0.62, 0.3, 0.12, 0.3, 0.08, 1.2);                       // astmelaud
    }
    // kapott + nina
    b.push().tf(0, 0.74, 1.42, 0, 0.26, 0);
    b.color(PAINT, MAT.PAINTED).box(0, 0, 0, 1.38, 0.13, 1.0);
    for (const x of [0.17, -0.17]) b.color(STRIPE, MAT.PAINTED).box(x, 0.068, 0, 0.13, 0.008, 1.0);
    b.color(PAINT2, MAT.PAINTED).box(0, 0.11, -0.1, 0.42, 0.1, 0.42);                           // õhuvõtuava
    b.color(DARK).box(0, 0.11, 0.115, 0.36, 0.06, 0.012);
    b.pop();
    b.color(PAINT2, MAT.PAINTED).boxB(0, 0.36, 1.82, 1.3, 0.34, 0.2);
    b.push().tf(0, 0.3, 1.98, 0, -0.5, 0).color(GUNM, MAT.METAL).box(0, 0, 0, 1.2, 0.04, 0.42).pop();   // põhjakaitse
    for (let k = -3; k <= 3; k++) b.color(DARK).box(k * 0.13, 0.55, 1.93, 0.05, 0.2, 0.02);       // iluvõre
    // torustange
    tube(-0.72, 0.44, 2.0, 0.72, 0.44, 2.0, 0.05, GUNM); tube(-0.72, 0.44, 2.0, -0.72, 0.44, 1.7, 0.045, GUNM); tube(0.72, 0.44, 2.0, 0.72, 0.44, 1.7, 0.045, GUNM);
    for (const x of [0.38, -0.38]) tube(x, 0.44, 2.0, x * 0.9, 0.86, 1.82, 0.04, GUNM);
    // esituled (ümarad, korpusega)
    for (const x of [0.5, -0.5]) { discZ(x, 0.66, 1.9, 0.12, 0.14, DARK, MAT.METAL); discZ(x, 0.66, 1.91, 0.09, 0.14, [1, 0.96, 0.8], MAT.GLOW); }
    for (const x of [0.25, -0.25]) { discZ(x, 0.9, 1.82, 0.075, 0.1, DARK, MAT.METAL); discZ(x, 0.9, 1.83, 0.055, 0.1, [1, 0.85, 0.5], MAT.GLOW); }
    // vedrustus: õlad + vedrud (kollased)
    for (const [wx, wy, wz] of [[0.86, 0.45, 1.18], [-0.86, 0.45, 1.18], [0.86, 0.45, -1.12], [-0.86, 0.45, -1.12]]) {
      const sx = Math.sign(wx);
      tube(sx * 0.45, 0.42, wz + 0.28, sx * 0.66, 0.45, wz, 0.035, STEEL); tube(sx * 0.45, 0.42, wz - 0.28, sx * 0.66, 0.45, wz, 0.035, STEEL);
      tube(sx * 0.62, 0.52, wz, sx * 0.48, 1.0, wz - 0.12, 0.075, YEL, MAT.PAINTED);
      tube(sx * 0.62, 0.48, wz, sx * 0.47, 1.06, wz - 0.13, 0.03, CHROME);
      fender(wx * 1.0, wy, wz, 0.6, 0.42, PAINT);
      b.color(DARK).boxB(wx, 0.08, wz - (wz > 0 ? 0.62 : 0.58), 0.36, 0.34, 0.02);              // porilapp
    }
    // turvaraam
    for (const x of [0.72, -0.72]) {
      tube(x, 0.62, 0.95, x * 0.92, 1.72, 0.45); tube(x * 0.92, 1.72, 0.45, x * 0.92, 1.72, -0.35); tube(x * 0.92, 1.72, -0.35, x, 0.62, -0.55);
      tube(x, 0.62, -0.55, x, 0.66, -1.55); tube(x * 0.92, 1.72, -0.35, x, 0.66, -1.5, 0.035);   // tagumised toed
      tube(x, 0.62, 0.95, x, 0.62, -0.55, 0.04); tube(x, 0.62, 0.95, x * 0.92, 1.72, -0.35, 0.03);   // külgdiagonaal
    }
    tube(0.66, 1.72, 0.45, -0.66, 1.72, 0.45); tube(0.66, 1.72, -0.35, -0.66, 1.72, -0.35); tube(0.66, 1.72, 0.45, -0.66, 1.72, -0.35, 0.03);
    b.color(GUNM, MAT.METAL).boxB(0, 1.74, 0.05, 1.28, 0.03, 0.78);                              // katuseplaat
    for (let k = 0; k < 5; k++) b.color(DARK).box(0, 1.775, -0.25 + k * 0.15, 1.2, 0.012, 0.05);
    // tulederivi katusel
    b.color(DARK, MAT.METAL).box(0, 1.84, 0.46, 1.1, 0.1, 0.12);
    for (let k = 0; k < 4; k++) { const x = -0.42 + k * 0.28; discZ(x, 1.86, 0.52, 0.06, 0.04, [1, 0.97, 0.85], MAT.GLOW); }
    // peeglid, antenn + lipp
    for (const sx of [1, -1]) { tube(sx * 0.68, 1.12, 0.78, sx * 0.86, 1.18, 0.72, 0.02); b.color(DARK, MAT.METAL).box(sx * 0.9, 1.2, 0.72, 0.1, 0.12, 0.05); b.color([0.5, 0.6, 0.65], MAT.METAL).box(sx * 0.9, 1.2, 0.69, 0.08, 0.1, 0.01); }
    b.color(DARK).cyl(-0.72, 0.96, -1.56, 0.012, 0.008, 1.9, 6, true);                         // antenn taga (ei sega laskurit)
    b.color(RED, MAT.PAINTED).box(-0.72, 2.75, -1.68, 0.01, 0.16, 0.24); b.color(YEL, MAT.PAINTED).box(-0.722, 2.75, -1.68, 0.012, 0.05, 0.24);
    // istmed (kopp-istmed) + rihmad
    for (const x of [0.42, -0.42]) {
      b.color(SEAT, MAT.MATTE).boxB(x, 0.54, 0.08, 0.5, 0.12, 0.52);
      b.push().tf(x, 0.95, -0.22, 0, -0.16, 0);
      b.color(SEAT, MAT.MATTE).box(0, 0, 0, 0.46, 0.72, 0.1);
      for (const sx of [1, -1]) b.color(SEAT, MAT.MATTE).box(sx * 0.25, -0.05, 0.06, 0.07, 0.6, 0.16);
      b.color(SEAT, MAT.MATTE).box(0, 0.45, 0, 0.3, 0.2, 0.12);
      for (const sx of [1, -1]) b.color(RED, MAT.MATTE).box(sx * 0.1, 0.05, 0.065, 0.05, 0.62, 0.01);
      b.pop();
    }
    // armatuur + rool
    b.color(DARK, MAT.MATTE).box(0, 0.98, 0.86, 1.3, 0.16, 0.22);
    for (const x of [0.32, 0.5]) discZ(x, 1.02, 0.75, 0.04, 0.02, [0.4, 1.0, 0.6], MAT.GLOW);
    b.push().tf(0.42, 1.06, 0.62, 0, -0.95, 0).color(DARK).cyl(0, -0.02, 0, 0.19, 0.19, 0.04, 16, true).color(GUNM, MAT.METAL).cyl(0, -0.03, 0, 0.04, 0.04, 0.06, 8, true).pop();
    tube(0.42, 0.98, 0.85, 0.42, 1.06, 0.64, 0.025);
    // tagumine veokast + mootor + väljalasketorud
    b.color(GUNM, MAT.METAL).boxB(0, 0.6, -1.08, 1.46, 0.06, 1.0);
    for (let k = 0; k < 5; k++) b.color(DARK).box(0, 0.665, -1.5 + k * 0.2, 1.4, 0.01, 0.04);
    for (const x of [0.74, -0.74]) b.color(PAINT, MAT.PAINTED).boxB(x, 0.66, -1.08, 0.05, 0.3, 1.0);
    b.color(PAINT, MAT.PAINTED).boxB(0, 0.66, -1.57, 1.5, 0.3, 0.05);
    b.color([0.42, 0.33, 0.2], MAT.WORN).boxB(0.42, 0.66, -1.24, 0.46, 0.34, 0.42);              // puidust kast
    for (const z of [-1.07, -1.41]) b.color([0.3, 0.24, 0.14], MAT.WORN).box(0.42, 0.85, z, 0.47, 0.03, 0.03);
    for (const x of [-0.42, -0.58]) { b.color(RED, MAT.PAINTED).boxB(x, 0.66, -1.38, 0.14, 0.38, 0.26); b.color(DARK).box(x, 1.06, -1.32, 0.04, 0.04, 0.06); }   // kanistrid
    for (const sx of [0.5, -0.5]) { tube(sx, 0.45, -1.45, sx * 1.08, 0.5, -1.72, 0.05, CHROME); tube(sx * 1.08, 0.5, -1.72, sx * 1.08, 1.0, -1.74, 0.05, CHROME); b.color(DARK).cyl(sx * 1.08, 0.98, -1.74, 0.055, 0.06, 0.06, 10, true); }
    for (const x of [0.62, -0.62]) b.color([1, 0.1, 0.05], MAT.GLOW).box(x, 0.78, -1.6, 0.16, 0.08, 0.03);
    b.color(STEEL, MAT.METAL).cyl(0, 0.66, -0.75, 0.08, 0.06, 1.5, 10, true);                   // kuulipilduja post (kõrge: laskur näeb üle katuse)
    b.color(DARK, MAT.METAL).cyl(0, 2.08, -0.75, 0.16, 0.16, 0.06, 14, true);
    b.color(GUNM, MAT.METAL).boxB(0, 0.66, -1.15, 0.6, 0.38, 0.5);                             // laskuri astmealus
    b.push().tf(0, 0.86, -1.68, 0, Math.PI / 2, 0).color(DARK, MAT.MATTE).cyl(0, -0.12, 0, 0.36, 0.36, 0.24, 16, true).color(STEEL, MAT.METAL).cyl(0, -0.13, 0, 0.18, 0.18, 0.26, 10, true).pop();   // varuratas
    M.body = b.build();

    // ===================== VEOK =====================
    b = new MB(); b.jit = 0;
    const TRUCK = [0.42, 0.46, 0.32], TRUCK2 = [0.3, 0.33, 0.23], CANVAS = [0.62, 0.55, 0.4];
    for (const x of [0.52, -0.52]) b.color(DARK, MAT.METAL).boxB(x, 0.42, -0.1, 0.18, 0.24, 4.7);   // raamid
    // kabiin
    b.color(TRUCK, MAT.PAINTED).rbox(0, 1.28, 1.32, 1.96, 1.3, 1.5, 0.1);
    b.color(TRUCK2, MAT.PAINTED).rbox(0, 1.96, 1.28, 1.9, 0.08, 1.42, 0.03);
    b.color(DARK, MAT.METAL).box(0, 1.9, 2.08, 1.86, 0.06, 0.1);                                 // päikesesirm
    for (let k = 0; k < 4; k++) discZ(-0.6 + k * 0.4, 2.02, 2.06, 0.06, 0.08, [1, 0.72, 0.25], MAT.GLOW);   // katusetuled
    b.color(DARK, MAT.METAL).cyl(0.62, 2.0, 0.85, 0.09, 0.09, 0.05, 12, true); b.color([1, 0.5, 0.08], MAT.GLOW).cyl(0.62, 2.04, 0.85, 0.07, 0.05, 0.12, 12, true);   // vilkur
    for (const x of [0.46, -0.46]) b.color(GLASS, MAT.METAL).box(x, 1.55, 2.075, 0.84, 0.55, 0.02);   // esiklaas
    b.color(TRUCK2, MAT.PAINTED).box(0, 1.55, 2.08, 0.07, 0.58, 0.03);
    for (const sx of [1, -1]) {
      b.color(GLASS, MAT.METAL).box(sx * 0.985, 1.58, 1.42, 0.02, 0.48, 0.9);                   // külgaken
      b.color(DARK).box(sx * 0.985, 1.05, 1.42, 0.02, 0.6, 0.02); b.color(DARK).box(sx * 0.985, 1.05, 0.96, 0.02, 0.6, 0.02);   // ukse jooned
      b.color(CHROME, MAT.METAL).box(sx * 0.99, 1.2, 1.08, 0.03, 0.04, 0.16);                   // käepide
      b.color(GUNM, MAT.METAL).boxB(sx * 0.98, 0.42, 1.25, 0.22, 0.04, 0.5);                    // astmed
      b.color(GUNM, MAT.METAL).boxB(sx * 0.98, 0.68, 1.25, 0.18, 0.04, 0.46);
      tube(sx * 0.98, 1.75, 1.95, sx * 1.22, 1.7, 2.02, 0.02, DARK);                            // peeglid
      b.color(DARK, MAT.METAL).box(sx * 1.25, 1.55, 2.0, 0.07, 0.34, 0.18); b.color([0.5, 0.6, 0.65], MAT.METAL).box(sx * 1.25, 1.55, 1.9, 0.05, 0.3, 0.01);
      // kütusepaagid
      b.push().tf(sx * 0.82, 0.62, 0.15, 0, Math.PI / 2, 0).color(STEEL, MAT.METAL).cyl(0, -0.42, 0, 0.22, 0.22, 0.84, 16, true).pop();
      for (const z of [-0.12, 0.42]) b.push().tf(sx * 0.82, 0.62, z, 0, Math.PI / 2, 0).color(DARK, MAT.METAL).cyl(0, -0.03, 0, 0.235, 0.235, 0.06, 16, false).pop();
    }
    // nina: iluvõre, tuled, kaitseraud ohutriipudega
    b.color(TRUCK, MAT.PAINTED).rbox(0, 0.92, 2.2, 1.94, 0.6, 0.3, 0.06);
    b.color(DARK, MAT.METAL).box(0, 0.95, 2.36, 1.1, 0.42, 0.02);
    for (let k = -5; k <= 5; k++) b.color(CHROME, MAT.METAL).box(k * 0.1, 0.95, 2.37, 0.03, 0.4, 0.02);
    for (const x of [0.75, -0.75]) { discZ(x, 0.95, 2.34, 0.13, 0.08, CHROME, MAT.METAL); discZ(x, 0.95, 2.36, 0.1, 0.08, [1, 0.96, 0.8], MAT.GLOW); }
    b.color(GUNM, MAT.METAL).box(0, 0.48, 2.42, 2.12, 0.3, 0.22);
    for (let k = 0; k < 10; k++) b.color(k % 2 ? DARK : YEL, MAT.PAINTED).box(-0.95 + k * 0.21, 0.48, 2.535, 0.21, 0.24, 0.01);
    for (const x of [0.62, -0.62]) b.color(RED, MAT.PAINTED).box(x, 0.32, 2.56, 0.12, 0.08, 0.14);
    b.color(DARK).box(0, 0.88, 0.58, 1.9, 0.6, 0.06);                                            // kabiini tagasein
    // väljalasketoru kabiini taga
    b.color(CHROME, MAT.METAL).cyl(0.78, 0.7, 0.5, 0.07, 0.07, 1.75, 12, true); b.color(DARK, MAT.METAL).cyl(0.78, 1.0, 0.5, 0.1, 0.1, 0.7, 12, false);
    b.push().tf(0.78, 2.47, 0.48, 0, -0.5, 0).color(DARK, MAT.METAL).cyl(0, 0, 0, 0.075, 0.075, 0.1, 10, true).pop();
    // poritiivad
    fender(1.0, 0.55, 1.55, 0.72, 0.48, TRUCK);
    fender(-1.0, 0.55, 1.55, 0.72, 0.48, TRUCK);
    for (const sx of [1, -1]) {
      b.color(GUNM, MAT.METAL).boxB(sx * 1.0, 1.28, -1.35, 0.5, 0.05, 2.0);
      b.color(DARK).boxB(sx * 1.0, 0.12, -2.4, 0.46, 0.5, 0.03);
    }
    // kast: põrand, varbadega küljed, tagaluuk, kaared + osaline brezent
    b.color(TRUCK2, MAT.PAINTED).boxB(0, 0.82, -1.08, 2.1, 0.1, 3.0);
    for (const sx of [1, -1]) {
      b.color(TRUCK, MAT.PAINTED).boxB(sx * 1.03, 0.92, -1.08, 0.05, 0.42, 3.0);
      for (let k = 0; k < 5; k++) b.color(TRUCK2, MAT.PAINTED).boxB(sx * 1.06, 0.92, 0.3 - k * 0.7, 0.04, 0.48, 0.08);
    }
    b.color(TRUCK, MAT.PAINTED).boxB(0, 0.92, -2.56, 2.1, 0.42, 0.05);
    for (let k = 0; k < 8; k++) b.color(k % 2 ? DARK : YEL, MAT.PAINTED).box(-0.875 + k * 0.25, 1.05, -2.59, 0.25, 0.12, 0.01);
    for (const x of [0.85, -0.85]) b.color([1, 0.1, 0.05], MAT.GLOW).box(x, 0.88, -2.6, 0.2, 0.1, 0.03);
    for (const z of [0.25, -0.55, -1.35]) {
      for (const sx of [1, -1]) tube(sx * 1.02, 1.32, z, sx * 0.8, 2.0, z, 0.03, DARK);
      tube(0.8, 2.0, z, -0.8, 2.0, z, 0.03, DARK);
    }
    b.color(CANVAS, MAT.MATTE).boxB(0, 2.02, -0.15, 1.7, 0.04, 0.95);
    for (const sx of [1, -1]) b.push().tf(sx * 0.93, 1.67, -0.15, 0, 0, sx * -0.29).color(CANVAS, MAT.MATTE).box(0, 0, 0, 0.04, 0.72, 0.95).pop();
    b.color(CANVAS, MAT.MATTE).box(0, 1.67, 0.32, 1.8, 0.72, 0.04);
    // last: kastid, tünnid
    b.color([0.42, 0.33, 0.2], MAT.WORN).boxB(0.45, 0.92, -1.75, 0.7, 0.55, 0.7);
    b.color([0.36, 0.38, 0.32], MAT.WORN).boxB(-0.48, 0.92, -1.55, 0.62, 0.42, 0.9);
    for (const [x, z] of [[0.55, -2.25], [0.15, -2.25]]) { b.color([0.2, 0.35, 0.55], MAT.PAINTED).cyl(x, 0.92, z, 0.2, 0.2, 0.62, 14, true); b.color(DARK).cyl(x, 1.1, z, 0.205, 0.205, 0.03, 14, false); }
    M.hauler = b.build();

    // ===================== RATAS (telg piki x-telge) =====================
    b = new MB(); b.jit = 0;
    b.push().tf(0, 0, 0, 0, 0, Math.PI / 2);
    b.color([0.07, 0.07, 0.07], MAT.MATTE).cyl(0, -0.15, 0, 0.42, 0.42, 0.3, 24, true);
    b.color([0.07, 0.07, 0.07], MAT.MATTE).cyl(0, -0.17, 0, 0.39, 0.42, 0.02, 24, false); b.color([0.07, 0.07, 0.07], MAT.MATTE).cyl(0, 0.15, 0, 0.42, 0.39, 0.02, 24, false);
    for (let k = 0; k < 18; k++) {   // mustriklotsid
      const a = k / 18 * Math.PI * 2, off = k % 2 ? 0.075 : -0.075;
      b.push().tf(Math.sin(a) * 0.43, off, Math.cos(a) * 0.43, a, 0, 0).color([0.09, 0.09, 0.09], MAT.MATTE).box(0, 0, 0, 0.1, 0.15, 0.04).pop();
    }
    b.color(GUNM, MAT.METAL).cyl(0, -0.165, 0, 0.27, 0.27, 0.33, 18, true);                       // velg
    for (const yy of [-0.17, 0.17]) {
      b.color(STEEL, MAT.METAL).cyl(0, yy - 0.012, 0, 0.29, 0.29, 0.024, 18, false);
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.color(CHROME, MAT.METAL).box(Math.sin(a) * 0.255, yy, Math.cos(a) * 0.255, 0.03, 0.03, 0.03); }
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; b.push().tf(Math.sin(a) * 0.13, yy * 0.95, Math.cos(a) * 0.13, a, 0, 0).color(STEEL, MAT.METAL).box(0, 0, 0, 0.06, 0.03, 0.2).pop(); }
    }
    b.color(CHROME, MAT.METAL).cyl(0, -0.2, 0, 0.065, 0.065, 0.4, 12, true);                      // rummu kate
    b.pop();
    M.wheel = b.build();
    MB.detail = detail0;
    // kuulipilduja (pöördosa; toru +z suunas)
    b = new MB(); b.jit = 0;
    b.color(DARK, MAT.WORN).box(0, 0, 0.1, 0.16, 0.2, 0.8);
    b.color(STEEL, MAT.WORN).box(0, 0.02, 0.85, 0.07, 0.07, 0.9);
    b.color(DARK).box(0, 0.02, 1.32, 0.11, 0.11, 0.12);
    b.color([0.3, 0.32, 0.25], MAT.WORN).box(0.17, -0.06, 0.15, 0.16, 0.2, 0.3);   // padrunikast
    b.color(STEEL, MAT.WORN).box(0, -0.02, -0.12, 0.6, 0.22, 0.04);                // madal kilp (ei varja vaadet)
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
    // ---- mech: raske kõndiv tööülikond. Küürus kere suure kabiiniklaasiga, massiivsed õlakapslid,
    //      jämedad jalad, mõlema käega hoitav pöörlevate torudega kahur (oma disain) ----
    { const OL = [0.7, 0.44, 0.15], OL2 = [0.3, 0.31, 0.32], HZ = [0.9, 0.68, 0.12], BK = [0.07, 0.075, 0.08], ST = [0.46, 0.47, 0.49], GL = [1.0, 0.55, 0.15], GLS = [0.12, 0.2, 0.24];
      const md0 = MB.detail; MB.detail = true;
      b = new MB(); b.jit = 0;   // vaagen (0 = puusatelg)
      b.color(OL2, MAT.WORN).box(0, 0.05, 0, 1.7, 0.75, 1.2); b.color(BK, MAT.METAL).box(0, -0.35, 0.05, 1.2, 0.3, 0.9);
      b.color(ST, MAT.METAL).push().tf(0, 0, 0, 0, 0, Math.PI / 2).cyl(0, -1.3, 0, 0.36, 0.36, 2.6, 14).pop();
      for (const sx of [-1, 1]) b.color(OL, MAT.WORN).box(sx * 1.05, 0.1, 0, 0.35, 0.95, 1.0);
      b.color(BK, MAT.METAL).cyl(0, 0.4, 0, 0.55, 0.6, 0.4, 14); M.mPelvis = b.build();
      b = new MB(); b.jit = 0;   // reis (alla 1.6)
      b.color(OL, MAT.WORN).box(0, -0.8, 0.05, 0.75, 1.55, 0.95); b.color(OL2, MAT.WORN).box(0, -0.65, 0.53, 0.6, 1.0, 0.12);
      b.color(BK, MAT.METAL).box(-0.4, -0.8, -0.1, 0.08, 1.3, 0.6);
      b.color(ST, MAT.METAL).push().tf(0.3, -0.8, -0.5, 0, 0, 0).cyl(0, -0.6, 0, 0.11, 0.11, 1.2, 10).pop(); b.color(ST, MAT.METAL).push().tf(-0.25, -0.8, -0.5, 0, 0, 0).cyl(0, -0.55, 0, 0.08, 0.08, 1.1, 10).pop();
      for (let k = 0; k < 4; k++) b.color(k & 1 ? BK : HZ, MAT.MATTE).box(0.385, -0.3 - k * 0.16, 0.2, 0.02, 0.16, 0.55);
      b.color(ST, MAT.METAL).push().tf(0, -1.6, 0, 0, 0, Math.PI / 2).cyl(0, -0.42, 0, 0.34, 0.34, 0.84, 14).pop();
      Org.tube(b, [[0.42, -0.2, 0.35, 0.09], [0.46, -0.9, 0.42, 0.09]], 10, ST, MAT.METAL); Org.tube(b, [[0.46, -0.9, 0.42, 0.06], [0.44, -1.45, 0.3, 0.06]], 10, [0.75, 0.75, 0.78], MAT.METAL);   // hüdraulikakolb
      Org.tube(b, [[-0.38, -0.1, -0.35, 0.04], [-0.5, -0.8, -0.45, 0.04], [-0.42, -1.5, -0.3, 0.04]], 6, BK, MAT.MATTE);   // voolik
      Org.blob(b, 0, -0.45, 0.3, 0.45, 0.45, 0.32, OL, { amp: 0.02, mat: MAT.WORN }); M.mThigh = b.build();
      b = new MB(); b.jit = 0;   // säär + saabas (alla 1.7)
      b.color(OL, MAT.WORN).push().tf(0, 0.05, 0.35, 0, -0.25, 0).box(0, -0.1, 0, 0.8, 0.75, 0.35).pop();                  // põlvekaitse
      b.color(OL2, MAT.WORN).box(0, -0.8, -0.05, 0.68, 1.4, 0.8); b.color(BK, MAT.METAL).box(0, -0.75, 0.42, 0.42, 1.0, 0.08);
      b.color(ST, MAT.METAL).push().tf(0, -0.8, -0.5, 0, 0, 0).cyl(0, -0.6, 0, 0.12, 0.12, 1.2, 10).pop();
      b.color(OL, MAT.WORN).box(0, -1.55, 0.2, 1.0, 0.32, 1.7); b.color(BK, MAT.METAL).box(0, -1.72, 0.25, 1.05, 0.12, 1.8);
      for (const sx of [-0.3, 0.3]) b.color(OL2, MAT.WORN).box(sx, -1.6, 1.05, 0.38, 0.25, 0.3);                   // varbad
      b.color(OL2, MAT.WORN).box(0, -1.6, -0.75, 0.6, 0.3, 0.35);
      for (const sx of [-1, 1]) { Org.tube(b, [[sx * 0.38, -0.15, -0.2, 0.08], [sx * 0.4, -0.8, -0.3, 0.08]], 10, ST, MAT.METAL); Org.tube(b, [[sx * 0.4, -0.8, -0.3, 0.055], [sx * 0.36, -1.35, -0.1, 0.055]], 10, [0.75, 0.75, 0.78], MAT.METAL); }
      Org.blob(b, 0, -0.35, 0.33, 0.45, 0.4, 0.22, OL, { amp: 0.02 }); M.mShin = b.build();
      b = new MB(); b.jit = 0;   // kere (0 = pöördliiges kere all), küürus ette
      b.color(OL2, MAT.WORN).box(0, 0.3, -0.1, 1.5, 0.6, 1.3);                                                       // kõhuosa
      b.color(OL, MAT.WORN).push().tf(0, 1.25, 0.05, 0, 0.18, 0).box(0, 0, 0, 2.3, 1.5, 1.9).pop();                  // rind
      b.color(OL2, MAT.WORN).push().tf(0, 2.0, -0.1, 0, 0.18, 0).box(0, 0, 0, 1.9, 0.35, 1.6).pop();
      b.color(GLS, MAT.METAL).push().tf(0, 1.55, 1.0, 0, -0.5, 0).box(0, 0, 0, 1.55, 0.95, 0.06).pop();                // kabiiniklaas
      b.color(BK, MAT.METAL).push().tf(0, 1.55, 1.03, 0, -0.5, 0).box(0, 0.5, 0, 1.7, 0.1, 0.1).box(0, -0.5, 0, 1.7, 0.1, 0.1).box(-0.82, 0, 0, 0.1, 1.05, 0.1).box(0.82, 0, 0, 0.1, 1.05, 0.1).pop();
      for (let k = 0; k < 6; k++) b.color(k & 1 ? BK : HZ, MAT.MATTE).box(-0.95 + k * 0.38, 0.66, 0.98, 0.38, 0.14, 0.04);
      b.color(BK, MAT.METAL).box(0, 1.2, -1.15, 1.7, 1.4, 0.55);                                                       // seljakott: jahutus
      for (let k = 0; k < 5; k++) b.color(ST, MAT.METAL).box(-0.7 + k * 0.35, 1.2, -1.45, 0.1, 1.2, 0.06);
      for (const sx of [-1, 1]) { b.color(ST, MAT.METAL).cyl(sx * 0.6, 1.9, -1.2, 0.14, 0.12, 0.7, 10); b.color(BK, MAT.METAL).cyl(sx * 0.6, 2.58, -1.2, 0.15, 0.15, 0.06, 10); }   // heitgaasitorud
      b.color(ST, MAT.METAL).cyl(0.75, 2.2, -0.6, 0.04, 0.02, 1.3, 6); b.color([1, 0.15, 0.08], MAT.GLOW).box(0.75, 3.52, -0.6, 0.08, 0.08, 0.08);
      for (const sx of [-1, 1]) {   // õlakapslid
        b.color(OL, MAT.WORN).push().tf(sx * 1.55, 2.0, 0, 0, 0, -sx * 0.12).box(0, 0, 0, 1.05, 1.0, 1.55).pop();
        b.color(OL2, MAT.WORN).push().tf(sx * 1.55, 2.55, 0, 0, 0, -sx * 0.12).box(0, 0, 0, 0.9, 0.18, 1.35).pop();
        for (let k = 0; k < 3; k++) b.color(k & 1 ? BK : HZ, MAT.MATTE).box(sx * 2.09, 1.8 - k * 0.2 + 0.2, 0.3, 0.03, 0.2, 0.7);
        b.color(GL, MAT.GLOW).box(sx * 1.5, 1.55, 0.8, 0.35, 0.08, 0.04);
      }
      b.color(GL, MAT.GLOW).box(-0.55, 2.22, 0.75, 0.22, 0.12, 0.05); b.color(GL, MAT.GLOW).box(0.55, 2.22, 0.75, 0.22, 0.12, 0.05);   // prožektorid
      for (const sx of [-1, 1]) { Org.blob(b, sx * 1.55, 2.25, 0, 0.62, 0.42, 0.85, OL, { amp: 0.02 }); Org.tube(b, [[sx * 0.7, 1.6, -1.35, 0.06], [sx * 1.1, 2.1, -1.0, 0.06], [sx * 1.5, 1.85, -0.4, 0.06]], 8, BK, MAT.MATTE); Org.tube(b, [[sx * 0.5, 0.9, -1.4, 0.05], [sx * 0.9, 0.5, -1.1, 0.05], [sx * 1.05, 0.25, -0.5, 0.05]], 8, BK, MAT.MATTE); }
      Org.blob(b, 0, 2.25, -0.1, 1.0, 0.22, 0.9, OL2, { amp: 0.02 });
      M.mTorso = b.build();
      b = new MB(); b.jit = 0;   // käed + kahur ühes tükis; 0 = õlgade telg (kere kohalik y 1.9)
      const limb = (x0, y0, z0, x1, y1, z1, w, col) => { const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz); b.color(col, MAT.WORN).push().tf((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.atan2(dx, dz), -Math.asin(dy / L), 0).box(0, 0, 0, w, w, L).pop(); };
      for (const sx of [-1, 1]) {
        b.color(ST, MAT.METAL).push().tf(sx * 1.55, 0, 0, 0, 0, Math.PI / 2).cyl(0, -0.3, 0, 0.3, 0.3, 0.6, 12).pop();   // õlaliiges
        limb(sx * 1.75, -0.1, 0, sx * 1.7, -1.35, 0.2, 0.62, OL);                                                         // õlavars
        b.color(ST, MAT.METAL).sphere(sx * 1.7, -1.4, 0.25, 0.36, 10, 6, 1);                                               // küünarnukk
        limb(sx * 1.65, -1.45, 0.3, sx * 0.6, -1.4, 1.45, 0.52, OL);                                                        // küünarvars
        b.color(BK, MAT.METAL).box(sx * 0.55, -1.35, 1.5, 0.4, 0.5, 0.45);                                                  // käsi
        for (let f = 0; f < 3; f++) b.color(OL2, MAT.METAL).push().tf(sx * 0.42, -1.12 - f * 0.17, 1.62, 0, 0, sx * 0.5).box(-sx * 0.12, 0, 0, 0.32, 0.12, 0.14).pop();   // sõrmed ümber kahuri
        b.color(OL2, MAT.METAL).box(sx * 0.32, -1.5, 1.55, 0.12, 0.25, 0.14);   // pöial
      }
      b.color(OL2, MAT.WORN).box(0.15, -1.1, 1.6, 0.75, 0.75, 1.9);                                                       // kahuri korpus
      b.color(BK, MAT.METAL).box(0.15, -1.55, 1.3, 0.55, 0.45, 0.9);                                                      // padrunisalv
      b.color(ST, MAT.METAL).box(0.15, -0.62, 1.4, 0.12, 0.3, 1.0); b.color(ST, MAT.METAL).box(0.15, -0.5, 1.4, 0.2, 0.06, 1.2);   // kandesang
      for (let k = 0; k < 4; k++) b.color(k & 1 ? BK : HZ, MAT.MATTE).box(0.53, -1.1, 0.9 + k * 0.3, 0.02, 0.5, 0.3);
      b.color(ST, MAT.METAL).push().tf(0.15, -1.1, 2.6, 0, Math.PI / 2, 0).cyl(0, 0, 0, 0.36, 0.36, 0.3, 14).pop();
      b.color([1, 0.2, 0.1], MAT.GLOW).box(0.5, -0.8, 2.45, 0.05, 0.05, 0.05);
      for (const sx of [-1, 1]) { Org.tube(b, [[sx * 1.8, 0.1, -0.3, 0.07], [sx * 2.0, -0.7, -0.2, 0.07], [sx * 1.85, -1.4, 0.1, 0.07]], 8, BK, MAT.MATTE); Org.tube(b, [[sx * 1.7, -0.3, 0.25, 0.09], [sx * 1.72, -1.0, 0.3, 0.09]], 10, ST, MAT.METAL); Org.blob(b, sx * 1.72, -0.55, 0.0, 0.42, 0.55, 0.42, OL, { amp: 0.02 }); }
      Org.tube(b, [[0.15, -1.55, 1.0, 0.07], [0.6, -1.7, 0.6, 0.07], [1.1, -1.4, 0.3, 0.07], [1.6, -1.2, 0.2, 0.07]], 8, [0.6, 0.5, 0.2], MAT.METAL);   // padrunilint
      M.mArmsGun = b.build();
      b = new MB(); b.jit = 0;   // torukimp (pöörleb ümber z), kinnitub kahuri esiotsa
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.color(BK, MAT.METAL).push().tf(Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0, 0, Math.PI / 2, 0).cyl(0, 0, 0, 0.06, 0.06, 2.0, 8).pop(); }
      for (const zz of [0.6, 1.4, 1.95]) b.color(ST, MAT.METAL).push().tf(0, 0, zz, 0, Math.PI / 2, 0).cyl(0, 0, 0, 0.3, 0.3, 0.1, 12).pop();
      M.mBarrel = b.build();
      MB.detail = md0;
      b = new MB(); b.jit = 0;   // osa kast (korjatav)
      b.color([0.86, 0.5, 0.12], MAT.WORN).box(0, 0.3, 0, 0.9, 0.6, 0.7); b.color(BK, MAT.METAL).box(0, 0.62, 0, 0.94, 0.06, 0.74);
      b.color([1, 0.6, 0.15], MAT.GLOW).box(0, 0.3, 0.36, 0.5, 0.1, 0.02); M.partCrate = b.build(); }
    if (MODELS.obj && !MODELS.obj.tostuk) MODELS.obj.tostuk = M.lift;
    return M;
  }

  // ---------- olek ----------
  function spawn(type, x, z, yaw, extra) {
    if (!DEF[type]) type = DEFAULT_TYPE;
    const d = DEF[type];
    const v = Object.assign({ id: nextId++, type, team: 'crew', x, y: World.heightAt(x, z), z, yaw, speed: 0, steer: 0, hp: d.hp, maxHp: d.hp, cargo: d.gun ? { ammo_r: 240 } : {}, seats: d.seats.map(() => null),
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
    if (v.vx === undefined) { v.vx = Math.sin(v.yaw) * v.speed; v.vz = Math.cos(v.yaw) * v.speed; v.vy = 0; v.air = false; v.yawRate = 0; v.comp = 0; v.wOff = d.wheels.map(() => 0); }
    let fx = Math.sin(v.yaw), fz = Math.cos(v.yaw);
    const rx = Math.cos(v.yaw), rz = -Math.sin(v.yaw);
    let vF = v.vx * fx + v.vz * fz, vS = v.vx * rx + v.vz * rz;
    const B = Bases.at(v.x, v.z), paved = !!(B && B.isInside(v.x, v.z));
    const sand = paved ? 1 : 0.92;
    if (!v.air) {
      // mootor / pidur / tagurpidi
      const thr = v.throttle;
      if (v.brake) vF -= Math.sign(vF) * Math.min(Math.abs(vF), d.brake * 1.2 * dt);
      else if (thr > 0.05) vF += (vF < -0.3 ? d.brake : d.accel * (1 - Math.max(0, vF) / (d.maxSpeed * sand * 1.08))) * thr * dt;
      else if (thr < -0.05) vF += (vF > 0.3 ? -d.brake : -d.accel * 0.7) * -thr * dt;
      else vF -= Math.sign(vF) * Math.min(Math.abs(vF), (1.4 + Math.abs(vF) * 0.3) * dt);
      if (v.hand) vF -= Math.sign(vF) * Math.min(Math.abs(vF), 4.5 * dt);
      // kalle: ülesmäge aeglustab, allamäge kiirendab
      vF += 9.8 * Math.sin(v.pitch) * (v.pitch < 0 && thr > 0.05 ? 0.35 : 0.75) * dt;   // ülesmäge veojõud kompenseerib suurema osa kaldest
      // liiv pidurdab rohkem kui baasi põrand
      vF -= vF * (paved ? 0.02 : 0.06) * dt;
      vF = clamp(vF, -d.rev, d.maxSpeed * sand * 1.1);
      // külghaare: rehvid suruvad külglibisemise nulli (liivas ja käsipiduriga vähem) -> libisemine/drift
      const latMax = (paved ? 22 : 15) * (v.hand ? 0.28 : 1) * (v.type === 'hauler' ? 0.85 : 1);
      const dv = Math.min(Math.abs(vS), latMax * dt);
      v.latAcc = -Math.sign(vS) * dv / Math.max(dt, 1e-4);
      vS -= Math.sign(vS) * dv;
      // rool: kiirusega tundlikkus väheneb, libisemisel juhitavus väheneb
      const steerT = v.steerIn * 0.58 * (1 - Math.min(0.7, Math.abs(vF) / 26));
      v.steer += (steerT - v.steer) * Math.min(1, dt * 7);
      const slip = clamp(Math.abs(vS) / 6, 0, 0.6);
      const wantRate = d.walker ? v.steerIn * 1.15 : vF / d.wheelBase * Math.tan(v.steer) * (1 - slip * 0.5) + (v.hand ? v.steer * Math.sign(vF) * Math.min(1, Math.abs(vF) / 8) * 1.2 : 0);
      v.yawRate += (wantRate - v.yawRate) * Math.min(1, dt * 9);
    } else {
      v.yawRate *= Math.max(0, 1 - dt * 0.5);   // õhus pöörlemine ei muutu kuigi palju
      v.latAcc = 0;
    }
    v.yaw -= v.yawRate * dt;
    // maailma kiirus (kere pöörab, kiirusvektor jääb -> libisemine)
    v.vx = fx * vF + rx * vS; v.vz = fz * vF + rz * vS;
    fx = Math.sin(v.yaw); fz = Math.cos(v.yaw);
    // liikumine + kokkupõrked kahe ringiga (esi- ja tagaots)
    const ox = v.x, oz = v.z, oh = World.heightAt(ox, oz);
    let nx = v.x + v.vx * dt, nz = v.z + v.vz * dt;
    const L = d.len || 0.9, pF = { x: nx + fx * L, z: nz + fz * L }, pB = { x: nx - fx * L, z: nz - fz * L };
    const y0 = v.y + 0.35, y1 = v.y + 1.7;
    const hitF = World.collideCircle(pF, 1.0, y0, y1, true), hitB = World.collideCircle(pB, 1.0, y0, y1, true);
    nx = (pF.x + pB.x) / 2; nz = (pF.z + pB.z) / 2;
    if (hitF || hitB) {
      const moved = Math.hypot(nx - ox, nz - oz), sp = Math.hypot(v.vx, v.vz), want = sp * dt;
      if (sp > 7 && moved < want * 0.5) { const dmg = (sp - 7) * 6; v.hp -= dmg; v.hurtT = 0.3; UI.shake(0.4); Audio2.land(); }
      // kokkupõrge: kiirus pärast tegelikku liikumist (libiseb mööda seina)
      const k = hitF && vF > 0 || hitB && vF < 0 ? 0.35 : 0.8;
      v.vx = (nx - ox) / Math.max(dt, 1e-4) * k + v.vx * (1 - k) * 0.3; v.vz = (nz - oz) / Math.max(dt, 1e-4) * k + v.vz * (1 - k) * 0.3;
      v.yawRate *= 0.5;
    }
    // järsk kalju: ei sõida üles
    const nh = World.heightAt(nx, nz), hd = Math.hypot(nx - ox, nz - oz);
    if (!v.air && hd > 1e-4 && nh - oh > hd * 1.7 && !Bases.at(nx, nz)) { nx = ox; nz = oz; v.vx *= 0.3; v.vz *= 0.3; }
    v.x = clamp(nx, -World.HALF + 14, World.HALF - 14); v.z = clamp(nz, -World.HALF + 14, World.HALF - 14);
    // vertikaal: vedrustus maas, ballistika õhus (düünihüpped)
    const gy = groundAt(v.x, v.z, v.y);
    if (v.air) {
      v.vy -= 18 * dt; v.y += v.vy * dt;
      if (v.y <= gy) {
        const imp = -v.vy; v.y = gy; v.air = false; v.vy = 0;
        v.comp = Math.min(0.3, imp * 0.03);
        if (imp > 7) { UI.shake(Math.min(0.6, imp * 0.04)); Audio2.land(); FX.dust(v.x, v.y + 0.2, v.z, 10, 2); if (imp > 13) { v.hp -= (imp - 13) * 8; v.hurtT = 0.3; } }
      }
    } else {
      const vyG = (gy - v.y) / Math.max(dt, 1e-4);
      // maapind langeb kiiremini kui auto järgi jõuab -> lendu (ainult kiirusel)
      if (gy < v.y - 0.25 && Math.abs(vF) > 9 && !paved && !d.walker) { v.air = true; v.vy = clamp(v.lastVy || 0, -2, 9); }
      else { v.y += (gy - v.y) * Math.min(1, dt * 16); if (v.y < gy - 0.05) v.y = gy - 0.05; v.lastVy = clamp(vyG, -20, 20) * 0.6 + (v.lastVy || 0) * 0.4; }
    }
    v.comp = Math.max(0, (v.comp || 0) - dt * 0.8);
    // kere kalle: rataste maapinna järgi + kaldumine kurvis + tagant vajumine kiirendusel
    const hF = groundAt(v.x + fx * 1.25, v.z + fz * 1.25, v.y), hB = groundAt(v.x - fx * 1.25, v.z - fz * 1.25, v.y);
    const lx = Math.cos(v.yaw), lz = -Math.sin(v.yaw);
    const hL = groundAt(v.x + lx * 0.8, v.z + lz * 0.8, v.y), hR = groundAt(v.x - lx * 0.8, v.z - lz * 0.8, v.y);
    const accF = (vF - (v.lastVF || vF)) / Math.max(dt, 1e-4); v.lastVF = vF;
    if (!v.air) {
      v.pitch += (-Math.atan2(hF - hB, 2.5) - clamp(accF * 0.006, -0.05, 0.05) - v.pitch) * Math.min(1, dt * 8);
      v.roll += (Math.atan2(hL - hR, 1.6) + clamp((v.latAcc || 0) * 0.004, -0.09, 0.09) - v.roll) * Math.min(1, dt * 7);
    } else { v.pitch += (0.12 - v.pitch) * Math.min(1, dt * 0.8); v.roll *= Math.max(0, 1 - dt); }
    // rataste vedrustus (joonistamiseks)
    for (let k = 0; k < d.wheels.length; k++) {
      const [wx, wy, wz] = d.wheels[k];
      const px = v.x + fx * wz + lx * wx, pz = v.z + fz * wz + lz * wx;
      const want = v.air ? -0.18 : clamp(groundAt(px, pz, v.y) - (v.y + wz * -Math.sin(v.pitch) + wx * Math.sin(v.roll)), -0.2, 0.15);
      v.wOff[k] += (want - v.wOff[k]) * Math.min(1, dt * 14);
    }
    v.speed = vF; v.slip = Math.abs(vS);
    v.wheelRot += vF * dt / 0.45;
    if (d.walker) { const w0 = v.walkPh || 0; v.walkPh = w0 + (Math.abs(vF) * 0.85 + Math.abs(v.yawRate) * 1.4) * dt; if (Math.floor(w0 / Math.PI) !== Math.floor(v.walkPh / Math.PI)) { UI.shake(Math.min(0.25, 0.08 + Math.abs(vF) * 0.02) * (Player.vehicle === v ? 1 : Math.max(0, 1 - Math.hypot(Player.pos.x - v.x, Player.pos.z - v.z) / 40))); Audio2.land && Audio2.land(); FX.dust(v.x + rand(-1, 1), v.y + 0.1, v.z + rand(-1, 1), 6, 1.5); } }
    // libisemisel tolm rataste alt
    if (!v.air && !paved && Math.abs(vS) > 3 && Math.random() < 0.7) FX.dust(v.x - fx * 1.2 + rand(-0.8, 0.8), v.y + 0.15, v.z - fz * 1.2 + rand(-0.8, 0.8), 2, 1.2);
    // olendid: vaenlased saavad löögi, omad lükatakse eest
    for (const e of Ents.list) {
      if (!e.alive || e.kind === 'player' || e.inVehicle || e.kind === 'boss' || e.kind === 'core' || e.kind === 'rturret' || e.kind === 'jelly') continue;
      const ex = e.pos.x - v.x, ez = e.pos.z - v.z, dd = Math.hypot(ex, ez), m = 1.7 + (e.radius || 0.4);
      if (dd > m || dd < 1e-3 || Math.abs(e.pos.y - v.y) > 2) continue;
      const friendly = v.team === 'crew' ? (e.team === 'crew' || e.team === 'player') : e.team === v.team;
      if (!friendly && Math.abs(v.speed) > 5 && !(e.hitBy && e.hitBy > G.time.total)) {
        e.hitBy = G.time.total + 0.6;
        Ents.damage(e, Math.abs(v.speed) * 6, v.seats[0] === Player ? Player : v.seats[0] || null);
        { const k = e.kind === 'crab' || e.kind === 'kiskja' ? 0.5 : 0.85; v.speed *= k; if (v.vx !== undefined) { v.vx *= k; v.vz *= k; } }
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
          const fake = { pos: { x: gp.x, y: gp.y - 1.33, z: gp.z }, yaw: v.gunYaw, team: e.team, kind: 'turret', vehicle: true };
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
      if (v.claim) for (let k = 0; k < v.claim.length; k++) { const c = v.claim[k]; if (c && (!c.alive || !c.toVeh || c.toVeh.v !== v)) v.claim[k] = null; }
      { const g = v.seats[1]; if (g && g !== Player && g.vgun) { const wi = typeof Waves !== 'undefined' ? Waves.info() : null; if (!wi || wi.none || wi.done) { g.vgun = false; leave(v, g); if (g.crew && g.crew.task) g.crew.task.done = true; } } }
      if (Player.vehicle === v && Math.abs(v.speed) < 2.5 && (v.boardT = (v.boardT || 0) - dt) <= 0) { v.boardT = 0.5; boardFollowers(v, 6, true); }
      // järeletulija: sõit mängija juurde, siht liigub mängijaga kaasa
      if (v.ai && v.ai.pickup && (v.ai.rt = (v.ai.rt || 0) - dt) <= 0) { v.ai.rt = 1; const tx = Player.vehicle ? Player.vehicle.x : Player.pos.x, tz = Player.vehicle ? Player.vehicle.z : Player.pos.z; if (Math.hypot(tx - v.ai.dest.x, tz - v.ai.dest.z) > 12) { v.ai.dest = { x: tx, z: tz }; v.ai.route = null; v.ai.best = undefined; } }
      const drv = v.seats[0];
      if (drv && drv !== Player && v.ai) aiDrive(v, dt);
      else if (drv !== Player) { v.throttle = 0; v.steerIn = 0; v.brake = v.speed !== 0 && Math.abs(v.speed) < 0.4 ? 1 : 0; }
      if (Math.abs(v.speed) > 0.01 || drv || v.air || (v.vx && Math.hypot(v.vx, v.vz) > 0.01) || Math.abs(v.y - groundAt(v.x, v.z, v.y)) > 0.02) step(v, dt);
      // istujad kaasa
      for (let k = 0; k < seatsOf(v).length; k++) {
        const e = v.seats[k]; if (!e || e === Player) continue;
        if (!e.alive || e.downed) { leave(v, e); continue; }
        seatWorld(v, k, tmp2); e.pos.x = tmp2.x; e.pos.y = tmp2.y - (seatsOf(v)[k].sit ? 0.55 : 0); e.pos.z = tmp2.z; e.moveAmt = 0;
        if (k === 1) aiGunner(v, e, dt); else { e.yaw = v.yaw; e.pose = 'sit'; }
      }
      // baasis: kast tühjendatakse lattu
      if (v.team === 'crew' && cargoCount(v) > 0 && Base.isInside(v.x, v.z)) {
        const parts = [];
        if (v.cargo.metal > 0) { const cr = v.cargo.metal * Geysers.VAL; G.res.cr += cr; G.stats.metal = (G.stats.metal || 0) + v.cargo.metal; v.cargo.metal = 0; UI.toast('Precious metal from the ' + nameOf(v).toLowerCase() + ': +' + cr + ' ₵'); }
        for (const k in v.cargo) { const n = v.cargo[k]; if (n > 0 && k !== 'ammo_r') { Inv.stashAdd(k, n); parts.push(n + ' ' + (ITEMS[k] ? ITEMS[k].name : k)); v.cargo[k] = 0; } }
        if (parts.length) { UI.toast(nameOf(v) + ' unloaded to storage: ' + parts.join(' · ')); Audio2.pickup(); if (G.flags.stonesHome) Game.stonesHome(); }
      }
      if (v.hp <= 0) destroy(v);
    }
  }
  function destroy(v) {
    v.dead = true; v.hp = 0; v.speed = 0; v.vx = v.vz = 0;
    FX.explosion(v.x, v.y + 1, v.z, [1, 0.6, 0.3], 3); Audio2.explode(v.x, v.z, true); UI.shake(0.7);
    for (let k = 0; k < v.seats.length; k++) if (v.seats[k]) { const e = v.seats[k]; leave(v, e); if (e === Player) Player.hurt(35, null); else Ents.damage(e, 35, null); }
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
    if (DEF[v.type].mechGun) { Player._wBefore = Player.weapon; Player.weapon = 'minigun'; Player.yaw = v.yaw; Player.pitch = 0; if (!Player.mag.minigun) reloadGun(v); UI.toast('Mech online · WASD walk, mouse aims the minigun, hold E to climb out'); }
    Audio2.door(v.x, v.z);
    // jälgijad tulevad sõidukisse kaasa (esimene kuulipilduja taha, teised kõrvale / kasti)
    boardFollowers(v, 25, true);
    return true;
  }
  function freeRideSeat(v) {
    const S = seatsOf(v);
    if (!v.seats[1] && S.length > 1 && !(v.claim && v.claim[1])) return 1;
    for (let k = 2; k < S.length; k++) if (!v.seats[k] && !(v.claim && v.claim[k])) return k;
    if (!v.seats[0] && Player.vehicle === v && Player.seat !== 0) return -1;
    return -1;
  }
  function boardFollowers(v, R, say) {
    if (typeof Crew === 'undefined' || DEF[v.type].walker) return 0;
    const fs = Crew.followers().filter((e) => e.alive && !e.downed && !e.inVehicle && !e.toVeh && Math.hypot(e.pos.x - v.x, e.pos.z - v.z) < R)
      .sort((a, b) => Math.hypot(a.pos.x - v.x, a.pos.z - v.z) - Math.hypot(b.pos.x - v.x, b.pos.z - v.z));
    const names = [];
    for (const f of fs) {
      const k = freeRideSeat(v); if (k < 0) break;
      v.seats[k] = f; f.inVehicle = v; f.ride = null; f.path = null; f.pose = 'sit'; f.gesture = null;
      if (f.crew) { f.crew.act = k === 1 && DEF[v.type].gun ? 'Manning the machine gun' : 'Riding with you'; names.push(f.crew.name.split(' ')[0]); }
    }
    if (say && names.length) UI.toast(names.join(', ') + (names.length > 1 ? ' jump in with you' : DEF[v.type].gun && v.seats[1] && names[0] === v.seats[1].crew.name.split(' ')[0] ? ' mans the machine gun' : ' rides along'));
    if (names.length) Audio2.door && Audio2.door(v.x, v.z);
    const left = fs.length - names.length;
    if (say && left > 0) UI.toast('No room for ' + left + ' more – they follow on foot');
    return names.length;
  }
  function leave(v, e) {
    const k = v.seats.indexOf(e); if (k < 0) return;
    v.seats[k] = null;
    M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
    const st = seatsOf(v)[k] || {}, side = k === 0 ? 1 : st.x < 0 ? -1 : k === 1 ? -1 : 1;
    const p = M4.point(v.m, 1.5 * side, 0, k === 0 ? 0.1 : st.rider ? (st.z || 0) : -1.0, {});
    const q = { x: p.x, z: p.z }; World.collideCircle(q, 0.4, v.y + 0.3, v.y + 1.7, true);
    if (e === Player) {
      Player.vehicle = null; Player.seat = 0; v.hand = false;
      if (Player._wBefore) { Player.weapon = Player._wBefore; Player._wBefore = null; }
      Player.pos.x = q.x; Player.pos.z = q.z; Player.pos.y = Ents.groundY(q.x, q.z, v.y + 0.5); Player.vel.x = Player.vel.z = 0;
      Player.yaw = v.yaw + (k === 0 ? Math.PI / 2 : Math.PI); Player.pitch = 0;
      // kui juht lahkub, lahkub ka meeskonnaliige
      for (let s = 0; s < v.seats.length; s++) if (v.seats[s] && v.seats[s] !== Player) leave(v, v.seats[s]);
    } else {
      e.inVehicle = null; e.vgun = false; e.pos.x = q.x; e.pos.z = q.z; e.pos.y = Ents.groundY(q.x, q.z, v.y + 0.5); e.pose = 'stand';
      // jätka teekonda jalgsi sinna, kuhu sõit viis
      if (e.ride) { const r = e.ride; e.ride = null; if (r.goal) { e._noRide = true; Ents.goTo(e, r.goal.x, r.goal.z, r.goalCells, r.lv); e._noRide = false; } } else e.path = null;
    }
  }
  function reloadGun(v) {
    const wn = DEF[v.type].mechGun ? 'minigun' : 'bugmg';
    const need = WEAPONS[wn].mag - (Player.mag[wn] || 0); if (need <= 0) return true;
    let got = Math.min(need, v.cargo.ammo_r || 0); v.cargo.ammo_r = (v.cargo.ammo_r || 0) - got;
    if (got < need) got += Inv.take('ammo_r', need - got) || 0;
    if (!got) { UI.toast('No rifle ammo in the cargo box or your backpack.'); return false; }
    Player.mag[wn] = (Player.mag[wn] || 0) + got; Player.reloadT = 1.2; Audio2.reload(); return true;
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
    if (DEF[v.type].mechGun) return mechUpdate(v, P, dt, inp);
    if (seat === 0) {
      v.throttle = inp.moveY; v.steerIn = inp.moveX; v.brake = 0; v.hand = !!inp.jump;   // tühik = käsipidur (drift)
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
    P.inter = { key: 'veh' + seat, label: 'Hold E: get out', sub: seat === 0 ? 'Tap E: ' + (GN ? 'man the machine gun' : 'move to the passenger seat') + ' · Space: handbrake · cargo: ' + cargoText(v) : 'Tap E: take the wheel' + (GN ? ' · ammo ' + (P.mag.bugmg || 0) + ' + ' + (v.cargo.ammo_r || 0) : ''), hold: 0.6 };
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
  // mech: piloot kõnnib WASD-ga ja sihib hiirega (kere pöördub sihi suunas), minigun tulistab
  function mechUpdate(v, P, dt, inp) {
    v.throttle = inp.moveY; v.steerIn = inp.moveX; v.brake = 0; v.hand = false;
    v.gunYaw = P.yaw; v.gunPitch = P.pitch;
    const tw = angDiff(v.yaw, P.yaw); v.twist = clamp(tw, -1.3, 1.3);
    M4.compose(v.m, v.x, v.y, v.z, v.yaw, 0, 0);
    const ep = M4.point(v.m, 0, 5.8, 0, tmp);
    P.pos.x = ep.x + Math.sin(P.yaw) * 1.25; P.pos.z = ep.z + Math.cos(P.yaw) * 1.25; P.pos.y = ep.y - P.eyeH;
    P.vel.x = Math.sin(v.yaw) * v.speed; P.vel.z = Math.cos(v.yaw) * v.speed; P.vel.y = 0; P.onGround = true; P.speedNow = 0; P.moveAmt = 0;
    if ((inp.fire || inp.reload) && (P.mag.minigun || 0) <= 0 && P.reloadT <= 0) reloadGun(v);
    if (P.reloadT > 0) P.reloadT -= dt;
    else if (inp.fire && P.fireCool <= 0 && (P.mag.minigun || 0) > 0) { P.shoot(WEAPONS.minigun, inp); v.spin = 1; }
    if (P.fireCool > 0) P.fireCool -= dt;
    v.spin = Math.max(0, (v.spin || 0) - dt * 0.8); v.barrel = (v.barrel || 0) + v.spin * dt * 40;
    P.recoil = Math.max(0, P.recoil - dt * 6); P.kick = Math.max(0, P.kick - dt * 8);
    P.inter = { key: 'mech', label: 'Hold E: climb out', sub: 'Mech ' + Math.round(v.hp) + '/' + v.maxHp + ' hp · minigun ' + (P.mag.minigun || 0) + ' + ' + (v.cargo.ammo_r || 0) + ' rounds · R reload', hold: 0.8 };
    if (inp.actHeld) { P.interT += dt; if (P.interT >= 0.8) { P.interT = 0; P._actUsed = true; leave(v, P); return; } } else { P.interT = 0; P._actUsed = false; }
    Audio2.setListener(P.pos.x, P.pos.z, P.yaw);
  }
  // ---------- pooleli mech linnas: osad, kokkupanek ----------
  const bayOf = () => (World.sites.city && World.sites.city.mechBay) || null;
  function partName(k) { return MECH_PARTS[k] || 'mech part'; }
  function partMesh() { if (!M) initMeshes(); return M.partCrate; }
  function takePart(p) {
    p.gone = true; const f = G.flags.mechFound = G.flags.mechFound || [];
    if (!f.includes(p.data.part)) f.push(p.data.part);
    const inst = (G.flags.mechInst || []).length, n = new Set([...f, ...(G.flags.mechInst || [])]).size;
    Audio2.pickup(); UI.banner('Mech part found: ' + partName(p.data.part), n + ' / 5 parts · take it to the unfinished mech on the city plaza', 'good');
    if (!G.flags.mechHint) { G.flags.mechHint = true; UI.msg('An old colony work mech stands half-built in the city square. Find all five parts in the city buildings and fit them to bring it to life.', 'money'); }
    return inst;
  }
  function installParts() {
    const f = G.flags.mechFound || [], ins = G.flags.mechInst = G.flags.mechInst || [];
    for (const k of f) if (!ins.includes(k)) ins.push(k);
    G.flags.mechFound = [];
    Audio2.repair();
    if (ins.length >= PART_KEYS.length) {
      const b = bayOf(); G.flags.mechDone = true;
      const v = spawn('mech', b.x, b.z, b.yaw, { cargo: { ammo_r: 900 } });
      UI.banner('ATLAS MECH ONLINE', 'All five parts fitted. Climb in (E) – WASD walks, the mouse aims the minigun.', 'good'); Audio2.alarm && Audio2.alarm();
      return v;
    }
    UI.toast('Parts fitted: ' + ins.length + ' / 5');
    return null;
  }
  function bayMarker() {
    const b = bayOf(); if (!b || G.flags.mechDone) return null;
    const known = (G.flags.mechInst || []).length || (G.flags.mechFound || []).length || G.flags.mechSeen;
    return known ? { x: b.x, z: b.z, icon: 'scrap', col: '#ff8a2a', label: 'Unfinished mech ' + (G.flags.mechInst || []).length + '/5', kind: 'bag' } : null;
  }
  function bayInteractions(consider) {
    const b = bayOf(); if (!b || G.flags.mechDone) return;
    const d = Math.hypot(b.x - Player.pos.x, b.z - Player.pos.z);
    if (d < 45 && !G.flags.mechSeen) { G.flags.mechSeen = true; UI.msg('A half-built work mech stands in a gantry on the plaza. Its missing parts must be somewhere in the city.', 'money'); }
    if (d > 7) return;
    const ins = (G.flags.mechInst || []).length, f = (G.flags.mechFound || []).filter((k) => !(G.flags.mechInst || []).includes(k));
    const miss = PART_KEYS.filter((k) => !(G.flags.mechInst || []).includes(k) && !f.includes(k)).map(partName);
    if (f.length) consider({ key: 'mbay', label: 'Fit ' + f.length + ' mech part' + (f.length > 1 ? 's' : ''), sub: 'Fitted ' + ins + ' / 5' + (miss.length ? ' · still missing: ' + miss.join(', ') : ' · that completes it!'), hold: 2.5 + f.length, act: installParts, tick: () => FX.repair(b.x + rand(-1.5, 1.5), b.y + rand(1, 4), b.z + rand(-1.5, 1.5)) }, b.x, b.z, 6);
    else consider({ key: 'mbay', label: 'Unfinished mech · ' + ins + ' / 5 parts', sub: 'Missing: ' + miss.join(', ') + ' – search the city buildings', disabled: true }, b.x, b.z, 6);
  }
  // pooleli mechi joonistus raamis (paigaldatud osad nähtavad)
  const bayM = Array.from({ length: 10 }, () => M4.create());
  function drawBay() {
    const b = bayOf(); if (!b || G.flags.mechDone) return;
    if (Math.hypot(GFX.cam.pos.x - b.x, GFX.cam.pos.z - b.z) > 500) return;
    const ins = G.flags.mechInst || [], has = (k) => ins.includes(k);
    drawMech({ x: b.x, y: b.y + 0.1, z: b.z, yaw: b.yaw, walkPh: 0, twist: 0.2, gunPitch: 0.25, barrel: 0, mm: bayM, dead: false, hurtT: 0 }, { legs: has('legs'), torso: has('torso') || has('cpu') || has('reactor'), gun: has('gun'), frame: true });
  }
  function drawMech(v, show) {
    const ms = v.mm, R0 = ms[9], tint = v.dead ? [0.3, 0.27, 0.25, 0] : v.hurtT > 0 ? [1.6, 0.7, 0.6, 0] : null, o = { rust: v.dead ? 0.9 : 0.35 };
    const ph = v.walkPh || 0, lift = Math.abs(Math.sin(ph)) * 0.14;
    M4.compose(R0, v.x, v.y + 2.7 + lift, v.z, v.yaw, 0, Math.sin(ph) * 0.04, 1.15, 1, 1.15);
    GFX.draw(M.mPelvis, R0, tint, null, o);
    if (show.legs) for (const sd of [1, -1]) {
      const p2 = ph + (sd > 0 ? 0 : Math.PI), sw = Math.sin(p2) * 0.42, knee = Math.max(0, -Math.cos(p2)) * 0.6 + 0.12;
      const th = ms[sd > 0 ? 0 : 2], sh = ms[sd > 0 ? 1 : 3];
      M4.child(th, R0, sd * 1.2, 0, 0, 0, -sw - 0.15, 0, 1.1, 0.82, 1.05); GFX.draw(M.mThigh, th, tint, null, o);
      M4.child(sh, th, 0, -1.6, 0, 0, knee, 0, 1.0, 1, 1.05); GFX.draw(M.mShin, sh, tint, null, o);
    }
    if (show.torso) {
      const T = ms[4]; M4.child(T, R0, 0, 0.45, 0, v.twist || 0, 0, 0, 1.18, 1.3, 1.13);
      if (!(Player.vehicle && Player.vehicle.mm === v.mm)) GFX.draw(M.mTorso, T, tint, null, o);
      if (show.gun) {
        const A = ms[5], Bm = ms[6];
        M4.child(A, T, 0, 1.9, 0, 0, -(v.gunPitch || 0) * 0.9, 0); GFX.draw(M.mArmsGun, A, tint, null, o);
        M4.child(Bm, A, 0.15, -1.1, 2.7, 0, 0, v.barrel || 0); GFX.draw(M.mBarrel, Bm, tint, null, o);
      }
    }
  }
  // mängija kaamera sõidukis
  function camera(C) {
    const v = Player.vehicle;
    if (Player.seat === 1 && DEF[v.type].gun) return false;   // kuulipilduja: esimese isiku vaade
    if (DEF[v.type].mechGun) return false;   // mech: kabiinivaade
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
    bayInteractions(consider);
    for (const v of list) {
      if (Math.hypot(v.x - Player.pos.x, v.z - Player.pos.z) > 5) continue;
      M4.compose(v.m, v.x, v.y, v.z, v.yaw, v.pitch, v.roll);
      const dp = M4.point(v.m, 1.1, 0, 0.1, {}), rp = M4.point(v.m, 0, 0, -2.0, {});
      const nm = nameOf(v).toLowerCase(), GN = DEF[v.type].gun;
      if (v.team !== 'crew' && v.seats.some(Boolean)) continue;
      if (v.dead) { consider({ key: 'vd' + v.id, label: 'Strip the ' + nm + ' wreck', sub: 'Get scrap back · a new buggy can be bought at the car lift', hold: 2.0, act: () => { const n = Math.min(40, Inv.room('scrap')); if (n > 0) Inv.add('scrap', n); list.splice(list.indexOf(v), 1); UI.toast('+' + n + ' scrap from the wreck'); Audio2.repair(); }, tick: () => FX.repair(v.x + rand(-1, 1), v.y + 0.8, v.z + rand(-1, 1)) }, v.x, v.z, 3.5); continue; }
      if (DEF[v.type].walker) {
        if (!v.seats[0]) consider({ key: 've' + v.id, label: 'Climb into the mech', sub: 'hp ' + Math.round(v.hp) + '/' + v.maxHp + ' · ammo ' + (v.cargo.ammo_r || 0), act: () => enter(v, 0) }, v.x, v.z, 4.5);
        const rc = repairCost(v); if (rc > 0 && !v.seats[0]) consider({ key: 'vr' + v.id, label: 'Repair the mech', sub: rc + ' scrap', hold: 3, act: () => { if (!repair(v)) { UI.toast('Not enough scrap (' + rc + ')'); Audio2.deny(); } }, tick: () => FX.repair(v.x + rand(-1, 1), v.y + rand(1, 4), v.z + rand(-1, 1)) }, v.x, v.z, 5);
        if (Inv.count('ammo_r')) consider({ key: 'va' + v.id, label: 'Load rifle ammo into the mech', sub: Inv.count('ammo_r') + ' rounds in your pack', hold: 0.8, act: () => { const n = Inv.take('ammo_r', Inv.count('ammo_r')) || 0; v.cargo.ammo_r = (v.cargo.ammo_r || 0) + n; UI.toast('+' + n + ' rounds in the mech'); } }, v.x, v.z, 5);
        continue;
      }
      if (!v.seats[0]) consider({ key: 've' + v.id, label: (v.team === 'crew' ? 'Drive the ' : 'Steal the ') + nm, sub: 'hp ' + Math.round(v.hp) + '/' + v.maxHp + ' · cargo: ' + cargoText(v), act: () => enter(v, 0) }, dp.x, dp.z, 3.4);
      if (!v.seats[1] && GN && v.team === 'crew') consider({ key: 'vg' + v.id, label: 'Man the machine gun', sub: 'ammo in cargo ' + (v.cargo.ammo_r || 0), act: () => enter(v, 1) }, rp.x + Math.sin(v.yaw) * 0.6, rp.z + Math.cos(v.yaw) * 0.6, 2.6);
      if (v.team !== 'crew') continue;
      consider({ key: 'vc' + v.id, label: 'Open the ' + nm + ' cargo', sub: 'cargo ' + cargoCount(v) + '/' + DEF[v.type].cargoCap + ' · swap items between your backpack and the vehicle', act: () => UI.openCargo(v) }, rp.x, rp.z, 2.4);
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
  // vahetus: üks ese kahe inventari vahel (n = arv; Infinity = kõik)
  function moveToCargo(v, id, n) {
    const room = DEF[v.type].cargoCap - cargoCount(v); n = Math.min(n, Inv.count(id), room); if (n <= 0) return 0;
    const got = Inv.take(id, n); if (got) { v.cargo[id] = (v.cargo[id] || 0) + got; Audio2.pickup(); } return got;
  }
  function moveToPack(v, id, n) {
    n = Math.min(n, v.cargo[id] || 0, Inv.room(id)); if (n <= 0) return 0;
    const r = Inv.add(id, n), got = typeof r === 'number' ? r : n; if (!got) return 0; v.cargo[id] -= got; if (v.cargo[id] <= 0) delete v.cargo[id]; Audio2.pickup(); return got;
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
  const RIDE_MIN = 85, WALK_R = 75;
  function releaseClaim(e) {
    const w = e.toVeh; if (!w) return; e.toVeh = null;
    const v = w.v; if (v.claim && v.claim[w.seat] === e) v.claim[w.seat] = null;
    if (w.seat === 0 && !v.seats[0] && v.ai && !v.ai.go) v.ai = null;
  }
  const freeSeat = (v, k) => !v.seats[k] && !(v.claim && v.claim[k]);
  function tryRide(e, x, z, goalCells, lv) {
    if (e && e.toVeh) releaseClaim(e);
    if (!e || e._noRide || e.inVehicle || e.kind !== 'human' || e.downed || lv) return false;
    const team = e.team; if (team !== 'crew' && !e.rival) return false;
    const dist = Math.hypot(x - e.pos.x, z - e.pos.z); if (dist < RIDE_MIN) return false;
    const dOf = (v) => Math.hypot(v.x - e.pos.x, v.z - e.pos.z);
    // juba väljasõitev sõiduk sama sihtkohaga -> kõrvalistmele (kuulipilduja taha)
    for (const v of list) {
      if (v.dead || DEF[v.type].walker || v.team !== team || !v.ai || v.ai.go || v.ai.pickup || dOf(v) > WALK_R) continue;
      const ks = freeRideSeat(v); if (ks < 0) continue;
      if (Math.hypot(v.ai.dest.x - x, v.ai.dest.z - z) > 40 && !(v.ai.home && Bases.at(x, z) === Bases.at(v.ai.dest.x, v.ai.dest.z) && Bases.at(x, z))) continue;
      claim(v, e, ks, x, z, goalCells, lv); return true;
    }
    // vaba sõiduk: ainult siis, kui sinna kõndimine on palju lühem kui teekond ise
    const v = list.filter((q) => !q.dead && !DEF[q.type].walker && q.team === team && freeSeat(q, 0) && !q.seats.some(Boolean) && q !== Player.vehicle && !(q.reserved && q.reserved.alive && q.reserved.crew && q.reserved.crew.task && q.reserved.crew.task.type === 'pickup' && !q.reserved.crew.task.done) && dOf(q) < WALK_R && dOf(q) < dist * 0.5)
      .sort((a, b) => dOf(a) - dOf(b))[0];
    if (!v) return false;
    // sihtpunkt: baasi puhul garaaži tõstuk (kui on), muidu otse
    let dx = x, dz = z;
    const B = Bases.at(x, z);
    if (team === 'crew' && B === Base) { const lift = Base.objsOfType('tostuk')[0]; if (lift) { dx = lift.cx; dz = lift.cz; } else { const a = Math.atan2(e.pos.x - x, e.pos.z - z); dx = x + Math.sin(a) * 16; dz = z + Math.cos(a) * 16; } }
    v.ai = { dest: { x: dx, z: dz }, wait: 1.6, stuckT: 0, revT: 0, go: false, hold: 0, home: B === Base || (e.rival && Math.hypot(x - e.rival.base.x, z - e.rival.base.z) < 30) };
    claim(v, e, 0, x, z, goalCells, lv);
    return true;
  }
  // inimene kõnnib sõiduki juurde ja istub siis peale (mitte ei "teleporteeru")
  function claim(v, e, seat, x, z, goalCells, lv) {
    if (Math.hypot(v.x - e.pos.x, v.z - e.pos.z) < 3.5) { board(v, e, seat, x, z, goalCells, lv); return; }
    v.claim = v.claim || seatsOf(v).map(() => null); v.claim[seat] = e;
    e.toVeh = { v, seat, x, z, goalCells, lv, t: 0 };
    e.path = (Bases.pathWorld && Bases.pathWorld(e.pos.x, e.pos.z, v.x, v.z)) || [{ x: v.x, z: v.z }]; e.pathI = 0; e.goal = { x: v.x, z: v.z }; e.goalCells = null; e.goalLv = 0;
    if (e.crew) e.crew.act = seat === 0 ? 'Going to the ' + nameOf(v).toLowerCase() : 'Hopping on the ' + nameOf(v).toLowerCase();
  }
  // Ents.stepMove kutsub seda, kui inimene on teel sõiduki juurde
  function walkStep(e, dt, speed) {
    const w = e.toVeh, v = w.v; w.t += dt;
    if (v.dead || v.seats[w.seat] || (w.seat === 0 && v === Player.vehicle) || w.t > 45 || !v.claim || v.claim[w.seat] !== e || e.downed) {
      releaseClaim(e); e._noRide = true; Ents.goTo(e, w.x, w.z, w.goalCells, w.lv); e._noRide = false; return false;
    }
    if (Math.hypot(v.x - e.pos.x, v.z - e.pos.z) < 3.2) { v.claim[w.seat] = null; e.toVeh = null; board(v, e, w.seat, w.x, w.z, w.goalCells, w.lv); return false; }
    e.toVeh = null; const done = Ents.stepMove(e, dt, speed * 1.15); e.toVeh = w;
    if (done) { e.path = [{ x: v.x, z: v.z }]; e.pathI = 0; }
    return false;
  }
  function board(v, e, seat, x, z, goalCells, lv) {
    v.seats[seat] = e; e.inVehicle = v; e.ride = { goal: { x, z }, goalCells: goalCells || null, lv: lv || 0 };
    e.path = [{ x, z }]; e.pathI = 0; e.goal = { x, z };
    if (seat === 0 && v.ai) v.ai.wait = Math.max(v.ai.wait, 1.2);
    Audio2.door && Audio2.door(v.x, v.z);
    if (e.crew) {
      e.crew.act = seat === 0 ? 'Driving the ' + nameOf(v).toLowerCase() : DEF[v.type].gun ? 'Riding shotgun on the machine gun' : 'Riding along';
      // saak kasti: sõiduk tühjendab selle baasis lattu
      const c = e.crew;
      if (c.carry > 0 && c.carryKind && v.team === 'crew' && cargoCount(v) - (v.cargo.ammo_r || 0) + c.carry <= DEF[v.type].cargoCap) { v.cargo[c.carryKind] = (v.cargo[c.carryKind] || 0) + c.carry; c.carry = 0; c.carryKind = null; }
    }
  }
  // kaitse: putukaparve ajal istub võitleja baasis seisva bagi kuulipilduja taha
  function freeGunPost(e) {
    for (const v of list) {
      if (v.dead || v.team !== 'crew' || !DEF[v.type].gun || !freeSeat(v, 1) || v === Player.vehicle || !Base.isInside(v.x, v.z) || v.ai) continue;
      const r = v.gunRes; if (r && r !== e && r.alive && r.crew && r.crew.task && r.crew.task.type === 'vgun' && !r.crew.task.done) continue;
      v.gunRes = e; return v;
    }
    return null;
  }
  function manGun(v, e) {
    if (!freeSeat(v, 1) || v.dead) return false;
    v.seats[1] = e; e.inVehicle = v; e.ride = null; e.vgun = true; e.path = null;
    if (e.crew) e.crew.act = 'Manning the buggy machine gun';
    return true;
  }
  function aiDrive(v, dt) {
    const a = v.ai, d = DEF[v.type];
    if (!a.go && v.claim && v.claim.some((c, k) => k > 0 && c && !v.seats[k]) && (a.hold = (a.hold || 0) + dt) < 14) { v.throttle = 0; v.steerIn = 0; v.brake = 1; return; }
    if (a.wait > 0) { a.wait -= dt; v.throttle = 0; v.steerIn = 0; v.brake = 1; if (a.wait <= 0) a.go = true; return; }
    const fdist = Math.hypot(a.dest.x - v.x, a.dest.z - v.z);
    const arriveR = a.home ? 4 : 9;
    const BB = Bases.at(v.x, v.z), inB = !!(BB && BB.isInside(v.x, v.z));
    // edenemise valvur: kui 25 s jooksul sihtkohale lähemale ei jõua, jäetakse sõiduk maha ja minnakse jala
    if (a.best === undefined || fdist < a.best - 2) { a.best = fdist; a.bestT = 0; } else if ((a.bestT += dt) > 25) { abandon(v); return; }
    const onLiftRoute = a.route && a.route.length && a.route[a.route.length - 1].tight;
    if (fdist < (onLiftRoute ? 2.2 : arriveR) || (a.home && !onLiftRoute && inB && fdist < 6)) { arrive(v); return; }
    // marsruut läbi väravate / garaažiukse (inimuksed on sõidukile liiga kitsad)
    if (!a.route) { a.route = planRoute(v, a); a.ri = 0; }
    let tg = a.route[Math.min(a.ri, a.route.length - 1)];
    while (a.ri < a.route.length - 1 && Math.hypot(tg.x - v.x, tg.z - v.z) < (tg.tight ? 2.7 : 3.4)) { a.ri++; tg = a.route[a.ri]; }
    // takistuste vältimine väljas (kivid, kaktused, järsud nõlvad): proovi ette, vajadusel põike kõrvale
    if (a.detour) { a.detourT -= dt; if (a.detourT <= 0 || Math.hypot(a.detour.x - v.x, a.detour.z - v.z) < 2.5) a.detour = null; }
    if (!inB && !tg.tight && a.revT <= 0 && (a.probeT = (a.probeT || 0) - dt) <= 0) {
      a.probeT = 0.3;
      const T0 = a.detour || tg, L = Math.min(8, Math.hypot(T0.x - v.x, T0.z - v.z));
      if (L > 3 && !pathClear(v, Math.atan2(T0.x - v.x, T0.z - v.z), L)) pickDetour(v, a, Math.atan2(tg.x - v.x, tg.z - v.z));
    }
    const T = a.detour || tg;
    const dx = T.x - v.x, dz = T.z - v.z, dist = Math.hypot(dx, dz);
    const want = Math.atan2(dx, dz), err = angDiff(v.yaw, want);
    // tagurdamine, kui kinni
    if (a.revT > 0) { a.revT -= dt; v.throttle = -0.8; v.steerIn = err > 0 ? 1 : -1; v.brake = 0; if (a.revT <= 0 && a.pendDetour) { a.pendDetour = false; if (!pickDetour(v, a, Math.atan2(tg.x - v.x, tg.z - v.z), true)) a.revT = 1.2; } return; }
    // garaažist välja tagurpidi, kui sihtpunkt on selja taga ja lähedal
    if (a.backOut === undefined) a.backOut = Math.abs(err) > 2.0 && dist < 18;
    if (a.backOut) {
      const errB = angDiff(v.yaw + Math.PI, want);
      if (dist < 2.2 || Math.abs(errB) > 1.6 || (a.backT = (a.backT || 0) + dt) > 9) { a.backOut = false; a.ri = Math.min(a.ri + 1, a.route.length - 1); }
      else { v.throttle = -0.6; v.brake = 0; v.steerIn = clamp(errB * 2.2, -1, 1); return; }
    }
    // terav pööre kohapeal: tagurda nurga all (kolmepunktipööre)
    if (Math.abs(err) > 1.5 && dist < 10 && v.speed < 3.6) { a.revT = 1.1; return; }
    v.steerIn = clamp(-err * 2.2, -1, 1) * (v.speed < 0 ? -1 : 1);
    // sihtkiirus: baasi juures ja pööretel aeglaselt
    let vT = d.maxSpeed;
    if (BB) vT = Math.min(vT, inB ? 4 : 7);
    if (fdist < 25) vT = Math.min(vT, 5);
    const nx = a.route[a.ri + 1];
    if (nx && dist < 14) { const t2 = Math.abs(angDiff(want, Math.atan2(nx.x - tg.x, nx.z - tg.z))); if (t2 > 0.6) vT = Math.min(vT, t2 > 1.2 ? 3.5 : 6); }
    if (Math.abs(err) > 0.45) vT = Math.min(vT, Math.abs(err) > 1.1 ? 3 : 6.5);
    v.throttle = v.speed < vT ? (vT - v.speed > 3 ? 1 : 0.5) : 0;
    v.brake = v.speed > vT + 1.5 ? 1 : 0;
    if (Math.abs(v.speed) < 1.2) { a.stuckT += dt; if (a.stuckT > 2.2) { a.stuckT = 0; a.revT = 1.3; a.stuckN = (a.stuckN || 0) + 1; if (a.stuckN % 2 === 0) a.route = null;
      if (!inB) a.pendDetour = true; if (a.stuckN > 7) { abandon(v); return; } } } else a.stuckT = 0;
  }
  const _pb = { x: 0, z: 0 };
  function blockedAt(v, x, z) {
    _pb.x = x; _pb.z = z;
    if (World.collideCircle(_pb, 1.1, v.y + 0.35, v.y + 1.7, true)) return true;
    return World.heightAt(x, z) - v.y > 2.0 && !Bases.at(x, z);
  }
  function pathClear(v, an, L) { for (let r = 2.5; r <= L + 0.01; r += 1.8) if (blockedAt(v, v.x + Math.sin(an) * r, v.z + Math.cos(an) * r)) return false; return true; }
  function pickDetour(v, a, ang, wide) {
    const offs = wide ? [1.0, -1.0, 1.5, -1.5, 2.1, -2.1, 0.5, -0.5] : [0.45, -0.45, 0.85, -0.85, 1.3, -1.3, 1.8, -1.8];
    for (const off of offs) if (pathClear(v, ang + off, 9)) { a.detour = { x: v.x + Math.sin(ang + off) * 9, z: v.z + Math.cos(ang + off) * 9 }; a.detourT = 3; return true; }
    return false;
  }
  // marsruut: garaažist otse välja ja koju tagasi otse ukse eest sisse
  function liftFront(o, k) { const f = o.rot * Math.PI / 2; return { x: o.cx + Math.sin(f) * k, z: o.cz + Math.cos(f) * k }; }
  function planRoute(v, a) {
    const lifts = v.team === 'crew' ? Base.objsOfType('tostuk') : [];
    const from = lifts.find((o) => Math.hypot(o.cx - v.x, o.cz - v.z) < 4);
    const to = lifts.find((o) => Math.hypot(o.cx - a.dest.x, o.cz - a.dest.z) < 1);
    const out = [];
    let sx = v.x, sz = v.z;
    if (from) { const p = Object.assign(liftFront(from, 13), { tight: true }); out.push(p); sx = p.x; sz = p.z; }
    const ex = to ? liftFront(to, 19) : a.dest;
    const mid = Bases.vehicleRoute(sx, sz, ex.x, ex.z) || [{ x: ex.x, z: ex.z }];
    out.push(...mid);
    if (to) { for (const k of [11, 6.5]) out.push(Object.assign(liftFront(to, k), { tight: true })); out.push({ x: to.cx, z: to.cz, tight: true }); }
    return out;
  }
  function abandon(v) {
    // saak tagasi inimeste kätte (kast jääb muidu kõrbesse)
    for (const e of v.seats) {
      if (!e || e === Player || !e.crew || e.crew.carry > 0) continue;
      const k = Object.keys(v.cargo).find((q) => q !== 'ammo_r' && v.cargo[q] > 0);
      if (!k) break;
      const n = Math.min(v.cargo[k], 40); v.cargo[k] -= n; e.crew.carry = n; e.crew.carryKind = k;
    }
    if (v.team === 'crew' && Math.random() < 0.5) UI.toast('The ' + nameOf(v).toLowerCase() + ' got stuck – the crew continues on foot.');
    arrive(v);
  }
  function arrive(v) {
    v.throttle = 0; v.steerIn = 0; v.brake = 1; v.speed *= 0.3; if (v.vx !== undefined) { v.vx *= 0.3; v.vz *= 0.3; }
    v.ai = null;
    for (let k = v.seats.length - 1; k >= 0; k--) { const e = v.seats[k]; if (e && e !== Player) leave(v, e); }
  }
  // konkurent ostab sõiduki samadel tingimustel (raha + vanaraud)
  function rivalBuy(r, type) {
    const d = DEF[type];
    const f = Math.atan2(-r.base.x, -r.base.z), n = teamVehicles(r.team).length, x = r.base.x + Math.sin(f + 0.9 + n * 0.45) * 9, z = r.base.z + Math.cos(f + 0.9 + n * 0.45) * 9;
    return spawn(type, x, z, f, { team: r.team, rivalId: r.id });
  }
  function teamVehicles(team) { return list.filter((v) => v.team === team && !v.dead); }
  function OY0() { return Base.OY || 0; }

  // ---------- joonistus ----------
  const figs = [{ id: 9001, team: 'player', pos: { x: 0, y: 0, z: 0 }, yaw: 0, phase: 0, moveAmt: 0, aim: 0, pose: 'sit', hasGun: false, hurtT: 0, flash: 0, kind: 'human', seated: true }];
  function draw() {
    if (!M) initMeshes();
    drawBay();
    for (const v of list) {
      if (DEF[v.type].walker) { if (!v.mm) v.mm = Array.from({ length: 10 }, () => M4.create()); drawMech(v, { legs: true, torso: true, gun: true }); if (!v.dead && GFX.env.night > 0.35) GFX.addLight(v.x + Math.sin(v.yaw + (v.twist || 0)) * 8, v.y + 3, v.z + Math.cos(v.yaw + (v.twist || 0)) * 8, 18, 1, 0.9, 0.75, 1.8); continue; }
      M4.compose(v.m, v.x, v.y - (v.comp || 0), v.z, v.yaw, v.pitch, v.roll);
      const tint = v.dead ? [0.25, 0.22, 0.2, 0] : v.hurtT > 0 ? [1.6, 0.7, 0.6, 0] : null;
      const d = DEF[v.type];
      const rt = !tint && v.team !== 'crew' && typeof Rivals !== 'undefined' && Rivals.get(v.team) ? Rivals.get(v.team).tint : tint;
      GFX.draw(M[d.mesh], v.m, rt, null, { rust: v.dead ? 0.9 : 0.22 });
      for (let k = 0; k < d.wheels.length; k++) {
        const [wx, wy, wz] = d.wheels[k];
        M4.child(v.wm[k], v.m, wx, wy + (v.wOff ? v.wOff[k] : 0) - (v.comp || 0) * 0.3, wz, k < 2 ? -v.steer : 0, v.wheelRot / d.wheelS, 0, d.wheelS, d.wheelS, d.wheelS);
        GFX.draw(M.wheel, v.wm[k], v.dead ? tint : null, null, { rust: 0.15 });
      }
      // kuulipilduja: maailma suunas
      if (d.gun) {
        const gp = M4.point(v.m, d.gun.x, d.gun.y, d.gun.z, tmp);
        M4.compose(v.gm, gp.x, gp.y, gp.z, v.gunYaw, -v.gunPitch, 0);
        GFX.draw(M.gun, v.gm, tint, null, { rust: 0.2 });
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
  // mängija kutsub baasist kellegi sõidukiga enda juurde
  function callPickup() {
    if (Player.vehicle) { UI.toast('You are already in a vehicle'); return false; }
    const cands = list.filter((v) => !v.dead && v.team === 'crew' && !DEF[v.type].walker && !v.seats.some(Boolean) && !v.ai && (Base.isInside(v.x, v.z) || Math.hypot(v.x - Base.OX, v.z - Base.OZ) < 90))
      .sort((a, b) => Math.hypot(a.x - Base.OX, a.z - Base.OZ) - Math.hypot(b.x - Base.OX, b.z - Base.OZ));
    if (!cands.length) { UI.toast(owned().some((v) => !v.dead && !DEF[v.type].walker) ? 'No free vehicle at the base right now' : 'You have no vehicle at the base – buy one at the car lift'); Audio2.deny && Audio2.deny(); return false; }
    if (Math.hypot(Player.pos.x - cands[0].x, Player.pos.z - cands[0].z) < 40) { UI.toast('The ' + nameOf(cands[0]).toLowerCase() + ' is right here – just get in'); return false; }
    const v = cands[0], e = Crew.pickupDriver(v);
    if (!e) { UI.toast('Nobody at the base is free to drive'); Audio2.deny && Audio2.deny(); return false; }
    v.reserved = e;
    UI.msg(e.crew.name.split(' ')[0] + ' is coming to pick you up with the ' + nameOf(v).toLowerCase() + '.', 'good');
    Audio2.radio && Audio2.radio();
    return true;
  }
  // juht istub peale ja sõidab mängija juurde (Crew 'pickup' ülesanne kutsub)
  function startPickup(v, e) {
    if (v.dead || v.seats[0] || v.ai) return false;
    v.seats[0] = e; e.inVehicle = v; e.ride = null; e.path = null;
    v.ai = { dest: { x: Player.pos.x, z: Player.pos.z }, wait: 1.2, stuckT: 0, revT: 0, go: false, hold: 0, home: false, pickup: true, rt: 0 };
    if (e.crew) e.crew.act = 'Driving to pick you up';
    Audio2.door && Audio2.door(v.x, v.z);
    return true;
  }
  function serialize() { return list.map((v) => ({ id: v.id, type: v.type, team: v.team, x: v.x, z: v.z, yaw: v.yaw, hp: v.hp, dead: v.dead, cargo: v.cargo })); }
  function deserialize(arr) { reset(); for (const d of arr || []) { const v = spawn(d.type || 'buggy', d.x, d.z, d.yaw, { id: d.id, hp: d.hp, dead: !!d.dead, cargo: d.cargo || {}, team: d.team || 'crew' }); v.y = groundAt(v.x, v.z, 0.5); } }
  function reset() { for (const v of list) for (const e of v.seats) if (e && e !== Player) { e.inVehicle = null; e.ride = null; } list.length = 0; if (typeof Player !== 'undefined') { Player.vehicle = null; Player.seat = 0; } }

  return { DEF, list, initMeshes, spawn, near, update, draw, enter, leave, playerUpdate, camera, interactions, liftInteraction, serialize, deserialize, reset, cargoCount, sound,
    callPickup, startPickup, canBuy, buy, repair, repairCost, sell, owned, vehicleOnLift, tryRide, walkStep, releaseClaim, freeGunPost, manGun, rivalBuy, teamVehicles, nameOf, cargoText, loadPack, unloadToPack, moveToCargo, moveToPack, partName, partMesh, takePart, bayMarker, installParts };
})();
