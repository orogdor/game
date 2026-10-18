// ============================================================
//  VANA KOLOONIA LINN: kaardi servas, mahajäetud pärast seda, kui
//  orbiidil tankinud kolooniate laev alla kukkus ja tulnukad planeedi üle võtsid.
//  Palju vanarauda (rusud), mahajäänud varustust ja palju tulnukaid.
// ============================================================
const City = (() => {
  let mesh = null, glow = null, domes = null;
  const ID = M4.create();
  const spots = [];      // tänavapunktid (tulnukate pesad, varustus)
  const lootSpots = [];  // majade ees, kuhu jäi varustust

  function build(rng) {
    const c = World.sites.city;
    spots.length = 0; lootSpots.length = 0;
    const detail0 = MB.detail; MB.detail = false;   // palju kaste: lihtne geomeetria
    const b = new MB(); b.jit = 0;      // kõik tahked osad
    const gl = new MB(); gl.jit = 0;    // helendavad osad
    const dm = new MB(); dm.jit = 0;    // kuplid (joonistatakse kahepoolselt, et ka seest näha)
    const R = (a, z) => a + rng() * (z - a);
    const Y = (x, z) => World.heightAt(x, z);
    // koloonia arhitektuur: heledad komposiitpaneelid, tumedad raamid, oranžid/sinised märgutuled
    const PAN = [[0.72, 0.7, 0.66], [0.64, 0.63, 0.6], [0.7, 0.66, 0.58]], FRAME = [0.22, 0.23, 0.25], DARK = [0.08, 0.08, 0.09], DIRT = [0.48, 0.38, 0.3];
    const ACC = [[1.0, 0.55, 0.15], [0.3, 0.75, 1.0], [0.55, 1.0, 0.3]];
    const wallCol = (x0, z0, x1, z1, y0, h, t) => World.addCol({ t: 's', ax: x0, az: z0, bx: x1, bz: z1, r: (t || 0.4) / 2 + 0.05, y0: y0 - 1, y1: y0 + h, kind: 'struct' });
    // ---- sirge seinalõik kahe punkti vahel (paks kast: näha mõlemalt poolt) ----
    function wallSeg(x0, z0, x1, z1, y0, h, t, col, opts) {
      const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.2) return;
      const yaw = Math.atan2(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      b.push().tf(mx, y0, mz, yaw, 0, 0);
      b.color(col, MAT.WORN).boxB(0, 0, 0, t, h, L);
      b.color(FRAME, MAT.METAL).boxB(0, h - 0.18, 0, t + 0.12, 0.22, L + 0.02);           // ülaserv
      b.color(DIRT, MAT.WORN).boxB(0, 0, 0, t + 0.04, 0.5, L + 0.02);                       // tolmune jalam
      if (opts && opts.stripe) gl.push().tf(mx, y0, mz, yaw, 0, 0).color(opts.stripe, MAT.GLOW).boxB(0, h * 0.62, 0, t + 0.03, 0.06, L * 0.9).pop();
      b.pop();
      World.addCol({ t: 's', ax: x0, az: z0, bx: x1, bz: z1, r: (t || 0.4) / 2 + 0.05, y0: opts && opts.raised ? y0 : y0 - 1, y1: y0 + h, kind: 'struct' });
    }
    // ---- hoone: ristkülik, avad (uks/aknad), sisu, katus; sisse saab minna ----
    function hab(cx, cz, w, d, floors, doorSide, rng) {
      const y0 = Y(cx, cz) + 0.05, FH = 4.2, T = 0.4, col = PAN[Math.floor(rng() * PAN.length)], acc = ACC[Math.floor(rng() * ACC.length)];
      const ruin = rng();   // > 0.6: osa seinast varisenud
      // põrand
      b.color([0.3, 0.3, 0.31], MAT.METAL).boxB(cx, y0 - 0.3, cz, w + 0.6, 0.35, d + 0.6);
      for (let k = -1; k <= 1; k++) gl.color(acc, MAT.GLOW).box(cx + k * w * 0.3, y0 + 0.07, cz, 0.12, 0.02, d * 0.85);   // põrandatuled
      // seinad: iga külg jagatud 2.4 m lõikudeks; uksel ava, osadel aknaribad
      const sides = [[cx - w / 2, cz + d / 2, cx + w / 2, cz + d / 2, 0], [cx + w / 2, cz - d / 2, cx - w / 2, cz - d / 2, 2], [cx + w / 2, cz + d / 2, cx + w / 2, cz - d / 2, 1], [cx - w / 2, cz - d / 2, cx - w / 2, cz + d / 2, 3]];
      for (const [ax, az, bx, bz, side] of sides) {
        const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.6)), ux = (bx - ax) / L, uz = (bz - az) / L;
        const doorAt = side === doorSide ? Math.floor(n / 2) : side === (doorSide + 2) % 4 && rng() < 0.4 ? Math.floor(n / 3) : -1;
        for (let k = 0; k < n; k++) {
          const s0 = k * L / n, s1 = (k + 1) * L / n;
          const p0x = ax + ux * s0, p0z = az + uz * s0, p1x = ax + ux * s1, p1z = az + uz * s1;
          const gone = ruin > 0.6 && k > 0 && k < n - 1 && rng() < 0.18 && k !== doorAt;
          if (k === doorAt) {   // uks: ava + raam + ülal paneel
            wallSeg(p0x, p0z, p1x, p1z, y0 + 2.7, FH * floors - 2.7, T, col, { raised: true });
            gl.color(acc, MAT.GLOW).push().tf((p0x + p1x) / 2, y0, (p0z + p1z) / 2, Math.atan2(ux, uz), 0, 0).box(0, 2.75, 0, T + 0.1, 0.08, L / n * 0.8).pop();
            continue;
          }
          if (gone) { wallSeg(p0x, p0z, p1x, p1z, y0, R(0.6, 1.6), T, col); continue; }   // varisenud: madal jupp
          // akendega lõik: sein alla, klaasita ava keskel, sein üles (iga korrus)
          for (let f = 0; f < floors; f++) {
            const fy = y0 + f * FH;
            if (rng() < 0.55) { wallSeg(p0x, p0z, p1x, p1z, fy, 1.1, T, col); wallSeg(p0x, p0z, p1x, p1z, fy + 2.3, FH - 2.3, T, col, f === 0 ? { stripe: acc } : null);
              b.color(FRAME, MAT.METAL).push().tf((p0x + p1x) / 2, fy, (p0z + p1z) / 2, Math.atan2(ux, uz), 0, 0).boxB(0, 1.1, 0, T + 0.06, 1.2, 0.18).pop(); }
            else wallSeg(p0x, p0z, p1x, p1z, fy, FH, T, col, f === 0 ? { stripe: acc } : null);
          }
        }
      }
      // nurgasambad (ümarad)
      for (const [qx, qz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.color(FRAME, MAT.METAL).cyl(cx + qx * w / 2, y0, cz + qz * d / 2, 0.45, 0.45, FH * floors + 0.3, 10, true);
      // vahelaed + katus (osaliselt sisse kukkunud)
      for (let f = 1; f <= floors; f++) {
        const fy = y0 + f * FH;
        if (f === floors && ruin > 0.45) {   // katuses auk
          b.color(col, MAT.WORN).boxB(cx - w / 4, fy, cz, w / 2, 0.35, d);
          b.color(col, MAT.WORN).push().tf(cx + w / 4, fy - 1.4, cz, 0, 0, 0.35).boxB(0, 0, 0, w / 2, 0.3, d * 0.8).pop();   // kokkukukkunud plaat
        } else b.color(f === floors ? FRAME : [0.36, 0.36, 0.37], MAT.METAL).boxB(cx, fy, cz, w + 0.5, 0.35, d + 0.5);
      }
      // katusel: kuppel / antenn / päikesepaneelid
      const top = y0 + floors * FH + 0.35, deco = rng();
      if (deco < 0.4) { dm.color([0.55, 0.62, 0.66], MAT.METAL).sphere(cx, top, cz, Math.min(w, d) * 0.3, 14, 7, 0.6); }
      else if (deco < 0.7) { b.color(FRAME, MAT.METAL).cyl(cx + w * 0.25, top, cz - d * 0.25, 0.06, 0.03, 6, 6, true); gl.color(ACC[0], MAT.GLOW).sphere(cx + w * 0.25, top + 6, cz - d * 0.25, 0.15, 6, 4, 1); }
      else for (let k = 0; k < 3; k++) b.color([0.12, 0.16, 0.28], MAT.METAL).push().tf(cx - w * 0.3 + k * w * 0.3, top + 0.5, cz, 0, 0.35, 0).box(0, 0, 0, w * 0.26, 0.06, d * 0.5).pop();
      // sisustus: konsoolid, kastid, ümberkukkunud kapid, kusagil helendab ekraan
      for (let k = 0; k < Math.round(w * d / 40); k++) {
        const ix = cx + R(-w / 2 + 1.5, w / 2 - 1.5), iz = cz + R(-d / 2 + 1.5, d / 2 - 1.5), it = rng();
        if (Math.abs(ix - cx) < 1.6 && side2(doorSide) && Math.abs(iz - cz) > d / 2 - 3) continue;
        if (it < 0.35) { b.color(FRAME, MAT.METAL).boxB(ix, y0, iz, 1.4, 1.0, 0.7); gl.color(rng() < 0.5 ? ACC[1] : ACC[2], MAT.GLOW).push().tf(ix, y0 + 1.25, iz, 0, -0.5, 0).box(0, 0, 0, 1.1, 0.5, 0.04).pop(); }
        else if (it < 0.7) { b.color([0.36, 0.3, 0.22], MAT.WORN).boxB(ix, y0, iz, R(0.8, 1.3), R(0.6, 1.1), R(0.8, 1.3)); }
        else b.color([0.4, 0.42, 0.45], MAT.METAL).push().tf(ix, y0 + 0.35, iz, rng() * TAU, 0, Math.PI / 2).box(0, 0, 0, 0.7, 2.0, 0.6).pop();
      }
      lootSpots.push({ x: cx + R(-w / 4, w / 4), z: cz + R(-d / 4, d / 4) });
      spots.inside = (spots.inside || 0) + 1;
    }
    function side2() { return true; }
    // ---- silindriline torn (maamärk, sisse ei pääse) ----
    function tower(x, z, r, h) {
      const y0 = Y(x, z) - 0.3;
      b.color(PAN[0], MAT.WORN).cyl(x, y0, z, r, r * 0.85, h, 16, true);
      for (let k = 1; k < h / 5; k++) b.color(FRAME, MAT.METAL).cyl(x, y0 + k * 5, z, r * 1.04 - k * 0.01, r * 1.04 - k * 0.01, 0.35, 16, false);
      for (let k = 1; k < h / 5; k++) gl.color(ACC[0], MAT.GLOW).cyl(x, y0 + k * 5 - 1.2, z, r * 0.95, r * 0.95, 0.06, 16, false);
      b.color(FRAME, MAT.METAL).cyl(x, y0 + h, z, r * 1.25, r * 1.25, 1.2, 16, true);
      dm.color([0.55, 0.62, 0.66], MAT.METAL).sphere(x, y0 + h + 1.2, z, r * 1.1, 14, 7, 0.55);
      World.addCol({ t: 'c', x, z, r: r + 0.2, y0: y0 - 2, y1: y0 + h + 4, kind: 'struct' });
    }
    // ---- linn: kompleksid kahes ringis, iga kompleksi ümber lagunenud vall ----
    const comps = [];
    comps.push({ x: c.x, z: c.z, r: 30, center: true });
    for (let ring = 1; ring <= 2; ring++) {
      const n = ring === 1 ? 6 : 11, rr = ring === 1 ? 82 : 160;
      for (let k = 0; k < n; k++) { const a = k / n * TAU + ring * 0.4 + R(-0.12, 0.12); comps.push({ x: c.x + Math.cos(a) * rr * R(0.92, 1.08), z: c.z + Math.sin(a) * rr * R(0.92, 1.08), r: R(24, 32) }); }
    }
    for (const cp of comps) {
      const y0 = Y(cp.x, cp.z);
      // vall: hulknurk, sissepääs linna keskuse poole, varisenud lõigud
      const nW = 14, gateK = cp.center ? -1 : Math.round(((Math.atan2(c.z - cp.z, c.x - cp.x) + TAU) % TAU) / TAU * nW) % nW;
      for (let k = 0; k < nW; k++) {
        if (k === gateK || (cp.center && k % 7 === 0)) continue;   // värav / avad
        const a0 = k / nW * TAU, a1 = (k + 1) / nW * TAU;
        const x0 = cp.x + Math.cos(a0) * cp.r, z0 = cp.z + Math.sin(a0) * cp.r, x1 = cp.x + Math.cos(a1) * cp.r, z1 = cp.z + Math.sin(a1) * cp.r;
        const br = rng();
        if (br < 0.15) continue;                                                    // täiesti läbi murtud
        const h = br < 0.35 ? R(0.8, 2.0) : R(3.4, 4.2);                            // osaliselt varisenud
        wallSegH(x0, z0, x1, z1, h, br < 0.35);
        b.color(FRAME, MAT.METAL).cyl(x0, Y(x0, z0) - 0.3, z0, 0.55, 0.5, h + 0.6, 10, true);   // vallipost
        if (h > 3) gl.color(ACC[0], MAT.GLOW).sphere(x0, Y(x0, z0) + h + 0.4, z0, 0.18, 6, 4, 1);
      }
      if (cp.center) {   // keskväljak: maandumisplats + juhtimistorn
        b.color([0.26, 0.27, 0.28], MAT.METAL).cyl(cp.x, y0 - 0.25, cp.z, 12, 12, 0.35, 24, true);
        gl.color(ACC[0], MAT.GLOW).cyl(cp.x, y0 + 0.11, cp.z, 11, 11, 0.02, 24, false);
        b.color([0.26, 0.27, 0.28], MAT.METAL).cyl(cp.x, y0 - 0.24, cp.z, 10.6, 10.6, 0.36, 24, true);
        tower(cp.x + 20, cp.z - 4, 3.2, 26);
        continue;
      }
      // hooned kompleksi sees (1–3), uks kompleksi värava poole
      const nB = 1 + Math.floor(rng() * 3);
      const ga = gateK / nW * TAU;
      for (let q = 0; q < nB; q++) {
        const w = R(9, 15), d = R(8, 13), floors = rng() < 0.35 ? 2 : 1;
        const off = nB === 1 ? 0 : (q - (nB - 1) / 2) * 13;
        const bx = cp.x + Math.cos(ga + Math.PI / 2) * off - Math.cos(ga) * 4, bz = cp.z + Math.sin(ga + Math.PI / 2) * off - Math.sin(ga) * 4;
        // uks: külg, mis on värava poole
        const gx = Math.cos(ga), gz = Math.sin(ga);
        const doorSide = Math.abs(gx) > Math.abs(gz) ? (gx > 0 ? 1 : 3) : (gz > 0 ? 0 : 2);
        hab(bx, bz, w, d, floors, doorSide, rng);
      }
      if (rng() < 0.4) tower(cp.x - Math.cos(ga) * (cp.r - 6), cp.z - Math.sin(ga) * (cp.r - 6), 1.6, R(10, 16));
      spots.push({ x: cp.x + Math.cos(ga) * (cp.r + 8), z: cp.z + Math.sin(ga) * (cp.r + 8) });   // värava ees
      rubble(b, cp.x + Math.cos(ga) * (cp.r - 4), cp.z + Math.sin(ga) * (cp.r - 4), R(2, 3.5), rng, Y(cp.x, cp.z));
    }
    // vallilõik valitud kõrgusega (kõrgus maapinnast)
    function wallSegH(x0, z0, x1, z1, h, broken) {
      const yA = Y(x0, z0), yB = Y(x1, z1), y0 = Math.min(yA, yB) - 0.3;
      wallSeg(x0, z0, x1, z1, y0, h + 0.3, 0.7, PAN[1], h > 3 ? { stripe: ACC[0] } : null);
      if (broken) rubble(b, (x0 + x1) / 2, (z0 + z1) / 2, 2.2, rng, y0 + 0.3);
    }
    // tänavad komplekside vahel (tulnukate kogunemiskohad)
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, rr = k % 2 ? 120 : 200; spots.push({ x: c.x + Math.cos(a) * rr, z: c.z + Math.sin(a) * rr }); }
    // tänavatel mahajäetud koloonia sõidukid
    for (let k = 0; k < 18; k++) {
      const s = spots[Math.floor(rng() * spots.length)]; if (!s) break;
      const x = s.x + R(-10, 10), z = s.z + R(-10, 10), y = Y(x, z), yaw = R(0, TAU);
      b.push().tf(x, y, z, yaw, 0, R(-0.15, 0.15));
      b.color(rng() < 0.5 ? [0.66, 0.64, 0.6] : [0.3, 0.42, 0.5], MAT.WORN).boxB(0, 0.45, 0, 2.0, 0.9, 4.4).boxB(0, 1.35, -0.4, 1.8, 0.75, 2.4);
      b.color(DARK, MAT.MATTE).boxB(0, 1.4, 0.82, 1.7, 0.6, 0.05);
      for (const [wx, wz] of [[1.05, 1.4], [-1.05, 1.4], [1.05, -1.4], [-1.05, -1.4]]) b.color([0.1, 0.1, 0.1], MAT.MATTE).push().tf(wx, 0.42, wz, 0, 0, Math.PI / 2).cyl(0, -0.15, 0, 0.42, 0.42, 0.3, 8, true).pop();
      b.pop();
      World.addCol({ t: 'c', x, z, r: 2.0, y0: y - 1, y1: y + 2, kind: 'wreck' });
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
    mesh = b.build(); glow = gl.build(); domes = dm.build();
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
    if (domes) GFX.draw(domes, ID, null, null, { rust: 0.6, cull: false });
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
