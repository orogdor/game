// ============================================================
//  VANA KOLOONIA LINN: kaardi servas, mahajäetud pärast seda, kui
//  orbiidil tankinud kolooniate laev alla kukkus ja tulnukad planeedi üle võtsid.
//  Palju vanarauda (rusud), mahajäänud varustust ja palju tulnukaid.
// ============================================================
const City = (() => {
  let mesh = null, glow = null;
  const ID = M4.create();
  const spots = [];      // tänavapunktid (tulnukate pesad, varustus)
  const lootSpots = [];  // majade ees, kuhu jäi varustust

  function build(rng) {
    const c = World.sites.city;
    spots.length = 0; lootSpots.length = 0;
    const detail0 = MB.detail; MB.detail = false;   // palju kaste: lihtne geomeetria
    const b = new MB(); b.jit = 0;
    const gl = new MB(); gl.jit = 0;
    const R = (a, z) => a + rng() * (z - a);
    const CON = [[0.56, 0.52, 0.47], [0.5, 0.47, 0.44], [0.62, 0.56, 0.48], [0.45, 0.43, 0.42]];
    const WIN = [0.06, 0.06, 0.07], BURN = [0.16, 0.13, 0.12], RUST = [0.45, 0.24, 0.13], STEEL = [0.36, 0.37, 0.39];
    const Y = (x, z) => World.heightAt(x, z);
    const G = 46;
    for (let gx = -5; gx <= 5; gx++) for (let gz = -5; gz <= 5; gz++) {
      const bx = c.x + gx * G, bz = c.z + gz * G;
      const dc = Math.hypot(bx - c.x, bz - c.z);
      if (dc > c.r - 18) continue;
      spots.push({ x: bx + G / 2, z: bz });   // tänavaristmik
      if (rng() < 0.16) {   // tühi krunt: rusuhunnik
        rubble(b, bx, bz, R(6, 11), rng, Y(bx, bz));
        lootSpots.push({ x: bx, z: bz });
        continue;
      }
      const w = R(14, 30), d = R(14, 30), floors = Math.max(1, Math.round(R(2, 7) * (1 - dc / (c.r * 1.6)))), FH = 3.4;
      const y0 = Y(bx, bz) - 0.6, col = CON[Math.floor(rng() * CON.length)];
      const yaw = (rng() < 0.5 ? 0 : 0.02) * (rng() - 0.5);
      // hoone korrused: ülemised varisenud (osaliselt)
      for (let f = 0; f < floors; f++) {
        const top = f >= floors - 2 && floors > 2;
        const fy = y0 + f * FH;
        let x0 = bx - w / 2, x1 = bx + w / 2, z0 = bz - d / 2, z1 = bz + d / 2;
        if (top && rng() < 0.7) { if (rng() < 0.5) x1 -= w * R(0.3, 0.6); else z0 += d * R(0.3, 0.6); }
        const cw = x1 - x0, cd = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        b.color(f === floors - 1 && rng() < 0.5 ? BURN : col, MAT.WORN).boxB(cx, fy, cz, cw, FH - 0.25, cd);
        b.color([0.3, 0.29, 0.28], MAT.WORN).boxB(cx, fy + FH - 0.25, cz, cw + 0.4, 0.25, cd + 0.4);   // vahelagi
        // aknad (tumedad avad) – mõned helendavad hõõguva tulnukalimaga
        for (const [sx, sz, len, alongX] of [[0, -1, cw, true], [0, 1, cw, true], [-1, 0, cd, false], [1, 0, cd, false]]) {
          const nWin = Math.floor(len / 3.2);
          for (let k = 0; k < nWin; k++) {
            if (rng() < 0.12) continue;
            const t = -len / 2 + 1.6 + k * (len - 3.2) / Math.max(1, nWin - 1);
            const wx = alongX ? cx + t : cx + sx * (cw / 2 + 0.03), wz = alongX ? cz + sz * (cd / 2 + 0.03) : cz + t;
            const lit = rng() < 0.025;
            (lit ? gl : b).color(lit ? [0.5, 1.0, 0.25] : WIN, lit ? MAT.GLOW : MAT.MATTE).box(wx, fy + 1.55, wz, alongX ? 1.5 : 0.08, 1.5, alongX ? 0.08 : 1.5);
          }
        }
        if (top && rng() < 0.6) for (let k = 0; k < 4; k++) b.color(RUST, MAT.RUST).push().tf(cx + R(-cw / 2, cw / 2), fy + FH, cz + R(-cd / 2, cd / 2), R(0, TAU), R(-0.6, 0.6), 0).cyl(0, 0, 0, 0.04, 0.04, R(1, 3), 5, true).pop();   // armatuur
      }
      // sissepääs ja rusud jalamil
      b.color(WIN, MAT.MATTE).boxB(bx, y0, bz + d / 2 + 0.02, 2.4, 3.2, 0.1);
      rubble(b, bx + R(-w / 2, w / 2), bz + d / 2 + R(1.5, 3.5), R(2, 4), rng, Y(bx, bz + d / 2 + 2));
      World.addCol({ t: 'b', x0: bx - w / 2, z0: bz - d / 2, x1: bx + w / 2, z1: bz + d / 2, y0: y0 - 2, y1: y0 + floors * FH, kind: 'struct' });
      lootSpots.push({ x: bx + R(-w / 3, w / 3), z: bz + d / 2 + 2.2 });
      // tänavalamp
      if (rng() < 0.55) {
        const lx = bx + w / 2 + 3, lz = bz + d / 2 + 3, ly = Y(lx, lz);
        const lean = R(-0.25, 0.25);
        b.color(STEEL, MAT.METAL).push().tf(lx, ly, lz, 0, 0, lean).cyl(0, 0, 0, 0.09, 0.07, 6.5, 6, true).box(0.6, 6.5, 0, 1.4, 0.12, 0.2).pop();
      }
    }
    // tänavatel mahajäetud autod ja barrikaadid
    for (let k = 0; k < 26; k++) {
      const s = spots[Math.floor(rng() * spots.length)]; if (!s) break;
      const x = s.x + R(-14, 14), z = s.z + R(-3, 3), y = Y(x, z), yaw = R(0, TAU);
      b.push().tf(x, y, z, yaw, 0, R(-0.1, 0.1));
      b.color(rng() < 0.5 ? [0.35, 0.18, 0.1] : [0.28, 0.3, 0.33], MAT.RUST).boxB(0, 0.3, 0, 1.9, 0.8, 4.2).boxB(0, 1.1, -0.3, 1.7, 0.7, 2.2);
      b.color(WIN, MAT.MATTE).boxB(0, 1.15, 0.82, 1.6, 0.55, 0.05);
      for (const [wx, wz] of [[0.95, 1.3], [-0.95, 1.3], [0.95, -1.3], [-0.95, -1.3]]) b.color([0.08, 0.08, 0.08], MAT.MATTE).push().tf(wx, 0.38, wz, 0, 0, Math.PI / 2).cyl(0, -0.12, 0, 0.38, 0.38, 0.24, 8, true).pop();
      b.pop();
      World.addCol({ t: 'c', x, z, r: 1.9, y0: y - 1, y1: y + 1.8, kind: 'wreck' });
    }
    // alla kukkunud kolooniate laev linna välisservas: hiiglaslik vrakk
    {
      const a = Math.atan2(c.z, c.x), sx = c.x + Math.cos(a) * (c.r + 25), sz = c.z + Math.sin(a) * (c.r + 25), sy = Y(sx, sz) - 4;
      const yaw = a + Math.PI / 2 + 0.3;
      b.push().tf(sx, sy, sz, yaw, 0.12, 0.18);
      const HULL = [0.32, 0.33, 0.35], HULL2 = [0.24, 0.25, 0.27];
      b.color(HULL, MAT.METAL).push().tf(0, 6, 0, 0, Math.PI / 2, 0).cyl(0, -45, 0, 9, 11, 90, 16, true).pop();
      for (let k = -4; k <= 4; k++) b.color(HULL2, MAT.METAL).push().tf(0, 6, k * 10, 0, Math.PI / 2, 0).cyl(0, -0.6, 0, 11.6, 11.6, 1.2, 16, false).pop();
      b.color(HULL2, MAT.METAL).push().tf(0, 6, 46, 0, Math.PI / 2, 0).cyl(0, 0, 0, 9, 2, 14, 16, true).pop();   // nina
      for (const sd of [1, -1]) b.color(HULL, MAT.METAL).push().tf(sd * 12, 4, -30, 0, 0, sd * 0.4).box(sd * 8, 0, 0, 18, 1.5, 22).pop();   // tiivad
      for (let k = 0; k < 3; k++) b.color([0.12, 0.11, 0.11], MAT.MATTE).push().tf(0, 6, -46, 0, Math.PI / 2, 0).cyl((k - 1) * 6, -1, 0, 2.6, 3.2, 3, 12, true).pop();   // mootorid
      b.color([0.08, 0.07, 0.07], MAT.MATTE).box(4, 9, 6, 6, 9, 14);   // rebenenud auk küljes
      b.pop();
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      for (let k = -4; k <= 4; k++) World.addCol({ t: 'c', x: sx + fx * k * 10, z: sz + fz * k * 10, r: 10, y0: sy - 5, y1: sy + 18, kind: 'wreck' });
      World.wrecks.push({ id: 900, x: sx + Math.cos(yaw) * 12, z: sz - Math.sin(yaw) * 12, y: sy, yaw, type: -1, m: M4.create(), rad: 4, scrap: 400, name: 'Crashed colony ship', known: false, mesh: null, city: true, hidden: true });
      c.ship = { x: sx, z: sz };
    }
    // rusuhunnikud = vanaraua allikad (sama korje nagu vrakkidel)
    for (let k = 0; k < 26; k++) {
      const s = lootSpots[Math.floor(rng() * lootSpots.length)]; if (!s) break;
      const x = s.x + R(-4, 4), z = s.z + R(-2, 3), y = Y(x, z);
      const pb = new MB(); pb.jit = 0; rubble(pb, 0, 0, R(2.2, 3.2), rng, 0, true);
      const m = M4.compose(M4.create(), x, y, z, R(0, TAU));
      const w = { id: 1000 + k, x, z, y, yaw: 0, type: -1, m, rad: 2.4, scrap: Math.floor(R(45, 95)), name: 'Collapsed building', known: false, mesh: pb.build(), city: true };
      w.col = World.addCol({ t: 'c', x, z, r: 2.0, y0: y - 2, y1: y + 2, kind: 'wreck' });
      World.wrecks.push(w);
    }
    mesh = b.build(); glow = gl.build();
    MB.detail = detail0;
  }
  function rubble(b, x, z, r, rng, y, local) {
    const CON = [[0.5, 0.47, 0.43], [0.42, 0.4, 0.38], [0.36, 0.3, 0.26]];
    for (let k = 0; k < 9; k++) {
      const a = rng() * TAU, d = rng() * r, s = 0.5 + rng() * r * 0.45;
      b.color(CON[Math.floor(rng() * CON.length)], MAT.WORN).push().tf(x + Math.cos(a) * d, (local ? 0 : y) + s * 0.2, z + Math.sin(a) * d, rng() * TAU, (rng() - 0.5) * 0.8, (rng() - 0.5) * 0.8).box(0, 0, 0, s * 1.4, s * 0.5, s).pop();
    }
    for (let k = 0; k < 3; k++) { const a = rng() * TAU; b.color([0.45, 0.24, 0.13], MAT.RUST).push().tf(x + Math.cos(a) * r * 0.4, (local ? 0 : y) + 0.5, z + Math.sin(a) * r * 0.4, rng() * TAU, rng() - 0.5, 0.6).cyl(0, 0, 0, 0.03, 0.03, 1.5 + rng() * 2, 5, true).pop(); }
  }
  function draw() {
    if (!mesh) return;
    const c = World.sites.city, cam = GFX.cam.pos;
    if (Math.hypot(cam.x - c.x, cam.z - c.z) > 1400) return;
    GFX.draw(mesh, ID, null, null, { rust: 1.1 });
    if (glow) GFX.draw(glow, ID, null, null, { shadow: false });
  }
  // uus mäng: mahajäänud varustus majade ette (kotid; kaardil alles siis, kui oled näinud)
  const LOOT = [['ammo_r', 60, 120], ['ammo_p', 40, 80], ['ammo_s', 12, 24], ['medkit', 1, 3], ['trauma', 1, 1], ['grenade', 1, 3], ['ration', 2, 4], ['stim', 1, 2], ['scrap', 15, 35],
    ['smg', 1, 1], ['shotgun', 1, 1], ['dmr', 1, 1], ['revolver', 1, 1], ['vest', 1, 1], ['helmet2', 1, 1], ['boots', 1, 1], ['pack_m', 1, 1], ['ammo_sn', 10, 20], ['ashot', 1, 1], ['plasma', 1, 1]];
  function spawnLoot() {
    const used = new Set();
    for (let k = 0; k < 18 && lootSpots.length; k++) {
      let s, t = 0; do { s = lootSpots[Math.floor(Math.random() * lootSpots.length)]; } while (used.has(s) && t++ < 20);
      used.add(s);
      const items = [];
      const n = randi(2, 4);
      for (let q = 0; q < n; q++) { const [id, a, bb] = LOOT[Math.floor(Math.random() * (q === 0 && Math.random() < 0.35 ? LOOT.length : 9))]; if (ITEMS[id]) items.push([id, randi(a, bb)]); }
      Ents.pickups.push({ kind: 'bag', x: s.x, y: Ents.groundY(s.x, s.z), z: s.z, data: { items }, id: Math.random(), city: true });
    }
  }
  function randomSpot() { return spots.length ? spots[Math.floor(Math.random() * spots.length)] : null; }
  function near(x, z, r) { const c = World.sites.city; return Math.hypot(x - c.x, z - c.z) < (r || c.r + 40); }
  return { build, draw, spawnLoot, randomSpot, near, get spots() { return spots; } };
})();
