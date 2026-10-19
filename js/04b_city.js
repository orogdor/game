// ============================================================
//  VANA KOLOONIA LINN: kaardi servas, mahajäetud pärast seda, kui
//  orbiidil tankinud kolooniate laev alla kukkus ja tulnukad planeedi üle võtsid.
//  Palju vanarauda (rusud), mahajäänud varustust ja palju tulnukaid.
// ============================================================
const City = (() => {
  let mesh = null, glow = null, domes = null, vmesh = null, vglow = null, vdomes = null;
  const vLoot = [];
  const ID = M4.create();
  const spots = [];      // tänavapunktid (tulnukate pesad, varustus)
  const lootSpots = [];  // majade ees, kuhu jäi varustust

  function build(rng) {
    const c = World.sites.city;
    spots.length = 0; lootSpots.length = 0;
    const detail0 = MB.detail; MB.detail = false;   // palju kaste: lihtne geomeetria
    let b = new MB(); b.jit = 0;      // kõik tahked osad
    let gl = new MB(); gl.jit = 0;    // helendavad osad
    let dm = new MB(); dm.jit = 0;    // kuplid (joonistatakse kahepoolselt, et ka seest näha)
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
    function hab(cx, cz, w, d, floors, doorSide, rng, opts) {
      const hall = opts && opts.hall;
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
            // lüüsiraam: hoiatustriibulised postid ja päis (tööstuslik koloonia)
            b.push().tf((p0x + p1x) / 2, y0, (p0z + p1z) / 2, Math.atan2(ux, uz), 0, 0);
            for (const sg of [-1, 1]) for (let q = 0; q < 4; q++) b.color(q & 1 ? HB : HY, MAT.MATTE).boxB(0, q * 0.675, sg * (L / n / 2), T + 0.24, 0.675, 0.32);
            hazardZ(0, 2.62, 0, T + 0.26, 0.34, L / n + 0.3);
            b.pop();
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
      for (const [qx, qz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const px = cx + qx * w / 2, pz = cz + qz * d / 2;
        b.color(FRAME, MAT.METAL).push().tf(px, y0, pz, Math.PI / 4, 0, 0).boxB(0, 0, 0, 0.95, FH * floors + 0.3, 0.95).boxB(0, FH * floors + 0.3, 0, 0.7, 0.4, 0.7);
        for (let q = 0; q < 3; q++) b.color(q & 1 ? HB : HY, MAT.MATTE).boxB(0, q * 0.4, 0, 1.02, 0.4, 1.02);
        b.pop();
        if ((qx + qz) === 0) beacon(px, y0 + FH * floors + 0.7, pz);
      }
      // välised torud tagaseinal (ukse vastas) + püstitoru maani
      { const bs = (doorSide + 2) % 4, py = y0 + FH * floors - 0.7, o = T / 2 + 0.35, PC = [0.42, 0.4, 0.36];
        const L0 = bs === 0 || bs === 2;
        const zz = bs === 0 ? cz + d / 2 + o : bs === 2 ? cz - d / 2 - o : 0, xx = bs === 1 ? cx + w / 2 + o : bs === 3 ? cx - w / 2 - o : 0;
        if (L0) { pipe(cx - w / 2 + 0.6, py, zz, cx + w / 2 - 0.6, py, zz, 0.22, PC); pipe(cx - w / 2 + 0.6, py - 0.55, zz, cx + w / 2 - 0.6, py - 0.55, zz, 0.14, [0.5, 0.3, 0.16]); b.color(PC, MAT.METAL).cyl(cx - w / 2 + 0.6, y0, zz, 0.22, 0.22, py - y0, 8, false); }
        else { pipe(xx, py, cz - d / 2 + 0.6, xx, py, cz + d / 2 - 0.6, 0.22, PC); pipe(xx, py - 0.55, cz - d / 2 + 0.6, xx, py - 0.55, cz + d / 2 - 0.6, 0.14, [0.5, 0.3, 0.16]); b.color(PC, MAT.METAL).cyl(xx, y0, cz - d / 2 + 0.6, 0.22, 0.22, py - y0, 8, false); }
      }
      // vahelaed + katus (osaliselt sisse kukkunud)
      for (let f = 1; f <= floors; f++) {
        if (hall && f < floors) continue;
        const fy = y0 + f * FH;
        if (f === floors && ruin > 0.45) {   // katuses auk
          b.color(col, MAT.WORN).boxB(cx - w / 4, fy, cz, w / 2, 0.35, d);
          b.color(col, MAT.WORN).push().tf(cx + w / 4, fy - 1.4, cz, 0, 0, 0.35).boxB(0, 0, 0, w / 2, 0.3, d * 0.8).pop();   // kokkukukkunud plaat
        } else b.color(f === floors ? FRAME : [0.36, 0.36, 0.37], MAT.METAL).boxB(cx, fy, cz, w + 0.5, 0.35, d + 0.5);
      }
      // katusel: kuppel / antenn / päikesepaneelid
      const top = y0 + floors * FH + 0.35, deco = hall ? 2 : rng();
      // katuseventilaatorid (tumedad restid)
      for (let k = 0; k < (w * d > 120 ? 2 : 1); k++) { const vx = cx + R(-w / 3, w / 3), vz = cz + R(-d / 3, d / 3); b.color([0.34, 0.34, 0.33], MAT.METAL).boxB(vx, top, vz, 2.0, 0.9, 2.0); b.color(DARK, MAT.MATTE).cyl(vx, top + 0.9, vz, 0.75, 0.75, 0.05, 10, true); for (let q = -1; q <= 1; q++) b.color(FRAME, MAT.METAL).box(vx, top + 0.98, vz + q * 0.4, 1.6, 0.08, 0.1); }
      if (hall) for (let k = 0; k < Math.floor(w / 4.5); k++) {   // saehamba katus + katuseaknad
        const sx = cx - w / 2 + 2.2 + k * 4.5;
        b.color(PAN[1], MAT.WORN).push().tf(sx, top + 0.9, cz, 0, 0, 0.42).box(0, 0, 0, 4.4, 0.25, d * 0.9).pop();
        gl.color(ACC[0], MAT.GLOW).box(sx + 1.9, top + 1.0, cz, 0.12, 1.6, d * 0.85);
      }
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
    // ---- futuristlik torn-pilvelõhkuja (sisse ei pääse): astmelised silindrid, helendavad vööd, antenn ----
    function spire(x, z, r, h) {
      const y0 = Y(x, z) - 0.3; let yy = y0, rr = r;
      const tiers = 3 + Math.floor(rng() * 2);
      for (let k = 0; k < tiers; k++) {
        const th = h / tiers * (k === 0 ? 1.3 : 0.9);
        b.color(PAN[k % 3], MAT.WORN).cyl(x, yy, z, rr, rr * 0.92, th, 24, true);
        for (let q = 1; q < th / 3.2; q++) gl.color(ACC[1], MAT.GLOW).cyl(x, yy + q * 3.2, z, rr * 0.96 + 0.02, rr * 0.96 + 0.02, 0.08, 24, false);
        for (let q = 0; q < 6; q++) { const a = q / 6 * TAU; b.color(FRAME, MAT.METAL).push().tf(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0, 0, 0).boxB(0, 0, 0, 0.35, th, 0.35).pop(); }   // välised ribid
        b.color(FRAME, MAT.METAL).cyl(x, yy + th, z, rr * 1.12, rr * 1.12, 0.5, 24, true);
        yy += th + 0.5; rr *= 0.72;
      }
      b.color(FRAME, MAT.METAL).cyl(x, yy, z, 0.12, 0.05, 9, 8, true); gl.color(ACC[0], MAT.GLOW).sphere(x, yy + 9, z, 0.25, 8, 5, 1);
      if (rng() < 0.5) { b.color(BURN2, MAT.WORN).push().tf(x + r * 0.6, y0 + h * 0.55, z, 0, 0, 0).box(0, 0, 0, 1.2, 4, r * 0.9).pop(); }   // tulekahju jälg
      World.addCol({ t: 'c', x, z, r: r + 0.3, y0: y0 - 2, y1: y0 + h + 6, kind: 'struct' });
      return { x, z, y: y0, h };
    }
    const BURN2 = [0.12, 0.1, 0.1];
    // ---- tööstuslik sci-fi (Alien / Quake / Tiberian Sun): hoiatustriibud, märgutuled, torud, talad ----
    const HY = [0.86, 0.66, 0.12], HB = [0.07, 0.07, 0.07], RED = [1.0, 0.16, 0.08], RUSTC = [0.46, 0.27, 0.15], STEEL = [0.4, 0.41, 0.42];
    function hazardZ(x, y, z, t, h, L) {   // kohalikus raamis: triibud piki z-telge
      const n = Math.max(2, Math.round(L / 0.7));
      for (let k = 0; k < n; k++) b.color(k & 1 ? HB : HY, MAT.MATTE).boxB(x, y, z - L / 2 + (k + 0.5) * L / n, t, h, L / n);
    }
    function beacon(x, y, z) { b.color(FRAME, MAT.METAL).cyl(x, y - 0.2, z, 0.2, 0.2, 0.22, 8, true); gl.color(RED, MAT.GLOW).sphere(x, y + 0.14, z, 0.17, 6, 4, 1); }
    // tala kahe 3D-punkti vahel (ristlõige w×h)
    function beam(x0, y0, z0, x1, y1, z1, w, h, col, mat) {
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz); if (L < 0.05) return;
      b.color(col, mat == null ? MAT.METAL : mat).push().tf((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.atan2(dx, dz), -Math.asin(dy / L), 0).box(0, 0, 0, w, h, L).pop();
    }
    // toru kahe punkti vahel, äärikutega
    function pipe(x0, y0, z0, x1, y1, z1, r, col) {
      const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz); if (L < 0.05) return;
      b.color(col, MAT.METAL).push().tf((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.atan2(dx, dz), -Math.asin(dy / L), 0).push().tf(0, 0, 0, 0, Math.PI / 2, 0);
      b.cyl(0, -L / 2, 0, r, r, L, 8, false);
      const nf = Math.max(1, Math.floor(L / 3.2));
      for (let k = 0; k <= nf; k++) b.color(FRAME, MAT.METAL).cyl(0, -L / 2 + k * L / nf - 0.07, 0, r * 1.35, r * 1.35, 0.14, 8, true);
      b.pop().pop();
    }
    // ---- atmosfääriprotsessor: hiiglaslik kaheksanurkne torn, tugipiilarid, korstnad, oranž hõõgus ----
    function atmo(x, z, s) {
      const y0 = Y(x, z) - 0.3, P8 = Math.PI / 8;
      b.color(FRAME, MAT.METAL).cyl(x, y0, z, 15 * s, 14 * s, 3.2, 8, true, P8);
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; b.color(k & 1 ? HB : HY, MAT.MATTE).push().tf(x + Math.cos(a) * 14.2 * s, y0 + 2.9, z + Math.sin(a) * 14.2 * s, -a + Math.PI / 2, 0, 0).boxB(0, 0, 0, 5.6 * s, 0.35, 0.5).pop(); }
      const H1 = 30 * s, yb = y0 + 3.2;
      b.color(PAN[1], MAT.WORN).cyl(x, yb, z, 9 * s, 8 * s, H1, 8, true, P8);
      for (let k = 1; k < H1 / 5; k++) { b.color(FRAME, MAT.METAL).cyl(x, yb + k * 5, z, (9 - k * 5 / H1) * s + 0.35, (9 - k * 5 / H1) * s + 0.35, 0.7, 8, false, P8); gl.color(ACC[0], MAT.GLOW).cyl(x, yb + k * 5 - 1.4, z, (9 - k * 5 / H1) * s + 0.05, (9 - k * 5 / H1) * s + 0.05, 0.12, 8, false, P8); }
      // ülemine masinaplokk
      const yu = yb + H1;
      b.color(PAN[2], MAT.WORN).cyl(x, yu, z, 12 * s, 12 * s, 9 * s, 8, true, P8);
      b.color(FRAME, MAT.METAL).cyl(x, yu - 0.6, z, 12.5 * s, 12.5 * s, 0.9, 8, true, P8).cyl(x, yu + 9 * s, z, 12.6 * s, 11 * s, 1.2, 8, true, P8);
      gl.color(ACC[0], MAT.GLOW).cyl(x, yu + 4 * s, z, 12.05 * s, 12.05 * s, 0.9, 8, false, P8);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; beacon(x + Math.cos(a) * 11.6 * s, yu + 9 * s + 1.5, z + Math.sin(a) * 11.6 * s); }
      // korstnad + tipu hõõgus
      const yt = yu + 9 * s + 1.2;
      b.color([0.3, 0.3, 0.31], MAT.METAL).cyl(x, yt, z, 5 * s, 3.4 * s, 16 * s, 8, true, P8);
      gl.color([1.0, 0.5, 0.15], MAT.GLOW).cyl(x, yt + 16 * s, z, 3.3 * s, 3.3 * s, 0.2, 8, true, P8);
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4, px = x + Math.cos(a) * 8 * s, pz = z + Math.sin(a) * 8 * s; b.color(STEEL, MAT.METAL).cyl(px, yt, pz, 1.3 * s, 1.1 * s, 10 * s, 8, true); b.color(HB, MAT.MATTE).cyl(px, yt + 10 * s - 1, pz, 1.15 * s, 1.15 * s, 1, 8, false); }
      // tugipiilarid ja suured torud maani
      for (let k = 0; k < 4; k++) {
        const a = k / 4 * TAU + Math.PI / 4, fx = Math.cos(a), fz = Math.sin(a);
        beam(x + fx * 20 * s, y0, z + fz * 20 * s, x + fx * 9 * s, yb + H1 * 0.65, z + fz * 9 * s, 2.2 * s, 2.6 * s, PAN[0], MAT.WORN);
        b.color(FRAME, MAT.METAL).boxB(x + fx * 20 * s, y0, z + fz * 20 * s, 4 * s, 2.4, 4 * s);
        World.addCol({ t: 'c', x: x + fx * 19 * s, z: z + fz * 19 * s, r: 2.4 * s, y0: y0 - 1, y1: y0 + 6, kind: 'struct' });
        const b2 = a + Math.PI / 4, gx = Math.cos(b2), gz = Math.sin(b2);
        pipe(x + gx * 9 * s, y0 + 10, z + gz * 9 * s, x + gx * 22 * s, y0 + 1.6, z + gz * 22 * s, 0.9 * s, RUSTC);
        b.color(STEEL, MAT.METAL).boxB(x + gx * 23 * s, y0, z + gz * 23 * s, 3, 2.8, 3); beacon(x + gx * 23 * s, y0 + 3.2, z + gz * 23 * s);
        World.addCol({ t: 'c', x: x + gx * 23 * s, z: z + gz * 23 * s, r: 2.1, y0: y0 - 1, y1: y0 + 3, kind: 'struct' });
      }
      World.addCol({ t: 'c', x, z, r: 14.5 * s, y0: y0 - 2, y1: yt + 16 * s, kind: 'struct' });
      return { y: yu + 4 * s };
    }
    // ---- mahutipark: püstmahutid, kuppelkaaned, triibuline jalam, torusild ----
    function tanks(x, z, rr) {
      const n = 2 + Math.floor(rng() * 3), pts = [];
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU + rng(), d = n === 2 ? rr * 0.45 : rr * 0.55, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, r = R(2.6, 3.6), h = R(6, 10), y0 = Y(px, pz) - 0.2;
        const col = rng() < 0.5 ? [0.66, 0.64, 0.6] : [0.52, 0.5, 0.46];
        b.color(col, MAT.WORN).cyl(px, y0, pz, r, r, h, 14, true);
        for (let q = 0; q < 4; q++) b.color(q & 1 ? HB : HY, MAT.MATTE).cyl(px, y0 + q * 0.35, pz, r + 0.04, r + 0.04, 0.35, 14, false);
        b.color(FRAME, MAT.METAL).cyl(px, y0 + h * 0.5, pz, r + 0.08, r + 0.08, 0.3, 14, false).cyl(px, y0 + h, pz, r + 0.12, r + 0.12, 0.3, 14, true);
        b.color(col, MAT.WORN).sphere(px, y0 + h + 0.3, pz, r * 0.96, 12, 5, 0.3);
        if (rng() < 0.4) b.color(RUSTC, MAT.RUST).push().tf(px, y0 + h * 0.6, pz, rng() * TAU, 0, 0).box(r * 0.98, 0, 0, 0.1, h * 0.5, r * 0.8).pop();   // roostetriip
        // redel
        const la = rng() * TAU, lx = px + Math.cos(la) * (r + 0.3), lz = pz + Math.sin(la) * (r + 0.3);
        b.color(FRAME, MAT.METAL).push().tf(lx, y0, lz, -la + Math.PI / 2, 0, 0).boxB(-0.3, 0, 0, 0.06, h + 1, 0.06).boxB(0.3, 0, 0, 0.06, h + 1, 0.06).pop();
        beacon(px, y0 + h + 0.3 + r * 0.3 + 0.2, pz);
        World.addCol({ t: 'c', x: px, z: pz, r: r + 0.2, y0: y0 - 1, y1: y0 + h + r * 0.3, kind: 'struct' });
        pts.push([px, pz, y0 + h * 0.7]);
      }
      for (let k = 1; k < pts.length; k++) { const [ax, az, ay] = pts[k - 1], [bx, bz] = pts[k]; pipe(ax, ay, az, bx, ay, bz, 0.35, RUSTC); pipe(ax, ay - 0.8, az, bx, ay - 0.8, bz, 0.22, STEEL); }
      return pts.length;
    }
    // ---- konteinerite virnad ----
    function containers(x, z, rr) {
      const yaw = rng() * Math.PI, fx = Math.sin(yaw), fz = Math.cos(yaw), sxv = Math.cos(yaw), szv = -Math.sin(yaw);
      const CC = [[0.62, 0.3, 0.14], [0.22, 0.36, 0.5], [0.55, 0.55, 0.52], [0.3, 0.4, 0.26], [0.7, 0.55, 0.16]];
      const cols = Math.max(1, Math.floor(rr * 2 / 3.2));
      for (let i = 0; i < cols; i++) for (let j = 0; j < 2; j++) {
        if (rng() < 0.2) continue;
        const off = (i - (cols - 1) / 2) * 3.0, along = (j - 0.5) * 7.2;
        const px = x + sxv * off + fx * along, pz = z + szv * off + fz * along, y0 = Y(px, pz) - 0.05;
        const hN = 1 + Math.floor(rng() * 3);
        for (let q = 0; q < hN; q++) {
          const cc = CC[Math.floor(rng() * CC.length)], tw = q > 0 ? R(-0.12, 0.12) : 0;
          b.color(cc, MAT.WORN).push().tf(px, y0 + q * 2.62, pz, yaw + tw, 0, 0).boxB(0, 0, 0, 2.45, 2.6, 6.1);
          for (let r2 = -2; r2 <= 2; r2++) b.color(cc.map((v) => v * 0.8), MAT.WORN).boxB(0, 0.15, r2 * 1.2, 2.55, 2.3, 0.14);
          b.color(FRAME, MAT.METAL).boxB(0, 0, 3.0, 2.5, 2.62, 0.14).boxB(0, 0, -3.0, 2.5, 2.62, 0.14);
          b.pop();
        }
        World.addCol({ t: 's', ax: px - fx * 3, az: pz - fz * 3, bx: px + fx * 3, bz: pz + fz * 3, r: 1.3, y0: y0 - 1, y1: y0 + hN * 2.62, kind: 'struct' });
      }
      if (rng() < 0.6) {   // ümberkukkunud konteiner
        const px = x + R(-3, 3), pz = z + R(-3, 3), a = rng() * TAU;
        b.color(CC[Math.floor(rng() * CC.length)], MAT.WORN).push().tf(px, Y(px, pz) + 1.2, pz, a, 0, 1.35).box(0, 0, 0, 2.45, 2.6, 6.1).pop();
        World.addCol({ t: 's', ax: px - Math.sin(a) * 3, az: pz - Math.cos(a) * 3, bx: px + Math.sin(a) * 3, bz: pz + Math.cos(a) * 3, r: 1.4, y0: Y(px, pz) - 1, y1: Y(px, pz) + 2.6, kind: 'struct' });
      }
    }
    // ---- sidetaldrik: sõrestikalus, kallutatud taldrik ----
    function dish(x, z) {
      const y0 = Y(x, z) - 0.2, yaw = rng() * TAU;
      b.color(STEEL, MAT.METAL).boxB(x, y0, z, 5, 2.4, 5);
      hazardZ(x + 2.55, y0 + 1.9, z, 0.1, 0.4, 5);
      b.color(FRAME, MAT.METAL).cyl(x, y0 + 2.4, z, 0.9, 0.7, 5, 8, true);
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.78; beam(x + Math.cos(a) * 2.4, y0 + 2.4, z + Math.sin(a) * 2.4, x, y0 + 6.5, z, 0.25, 0.25, FRAME); }
      dm.color([0.7, 0.7, 0.68], MAT.METAL).push().tf(x, y0 + 8.2, z, yaw, -0.85, 0).sphere(0, 0, 0, 5.5, 18, 7, 0.22).pop();
      b.push().tf(x, y0 + 8.2, z, yaw, -0.85, 0);
      b.color(FRAME, MAT.METAL).box(0, 2.6, 0, 0.15, 5, 0.15);
      b.pop();
      gl.push().tf(x, y0 + 8.2, z, yaw, -0.85, 0).color(RED, MAT.GLOW).sphere(0, 5.2, 0, 0.3, 6, 4, 1).pop();
      World.addCol({ t: 'c', x, z, r: 3.4, y0: y0 - 1, y1: y0 + 8, kind: 'struct' });
    }
    // ---- tornkraana: sõrestikmast, nool, vastukaal, rippuv konks ----
    function crane(x, z) {
      const y0 = Y(x, z) - 0.2, H = R(24, 32), yaw = rng() * TAU, fx = Math.sin(yaw), fz = Math.cos(yaw), M = 1.1;
      b.color(FRAME, MAT.METAL).boxB(x, y0, z, 4, 1.2, 4);
      const MC = [0.8, 0.6, 0.12];
      for (const [qx, qz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) b.color(MC, MAT.METAL).boxB(x + qx * M, y0 + 1.2, z + qz * M, 0.22, H, 0.22);
      for (let k = 0; k < H / 2.4; k++) {
        const ya = y0 + 1.2 + k * 2.4, yb2 = ya + 2.4;
        beam(x - M, ya, z - M, x + M, yb2, z - M, 0.1, 0.1, MC); beam(x + M, ya, z + M, x - M, yb2, z + M, 0.1, 0.1, MC);
        beam(x - M, ya, z + M, x - M, yb2, z - M, 0.1, 0.1, MC); beam(x + M, ya, z - M, x + M, yb2, z + M, 0.1, 0.1, MC);
      }
      const yt = y0 + 1.2 + H;
      // kabiin
      b.color(PAN[0], MAT.WORN).boxB(x + fz * 1.8, yt - 2.6, z - fx * 1.8, 2, 2.2, 2.2); gl.color(ACC[1], MAT.GLOW).boxB(x + fz * 1.8 + fx * 1.12, yt - 1.9, z - fx * 1.8 + fz * 1.12, 1.2, 0.8, 0.05);
      // nool ja vastunool (kolmnurkne sõrestik lihtsustatult)
      beam(x - fx * 10, yt + 0.5, z - fz * 10, x + fx * 30, yt + 0.5, z + fz * 30, 1.2, 1.0, MC);
      beam(x - fx * 10, yt + 0.5, z - fz * 10, x, yt + 6, z, 0.18, 0.18, FRAME); beam(x, yt + 6, z, x + fx * 30, yt + 1, z + fz * 30, 0.12, 0.12, FRAME);
      b.color(MC, MAT.METAL).boxB(x, yt, z, 2.2, 6.2, 2.2);
      b.color([0.42, 0.42, 0.4], MAT.WORN).push().tf(x - fx * 8.5, yt - 1.6, z - fz * 8.5, yaw, 0, 0).boxB(0, 0, 0, 2.6, 2.2, 3).pop();
      b.push().tf(x - fx * 8.5, yt - 1.6, z - fz * 8.5, yaw, 0, 0); hazardZ(1.32, 0.6, 0, 0.06, 0.7, 3); hazardZ(-1.32, 0.6, 0, 0.06, 0.7, 3); b.pop();
      beacon(x, yt + 6.4, z); beacon(x + fx * 30, yt + 1.2, z + fz * 30);
      // konks
      const hd = R(14, 26), hx = x + fx * hd, hz = z + fz * hd, hy = R(Y(hx, hz) + 4, yt - 4);
      b.color(DARK, MAT.METAL).boxB(hx, hy, hz, 0.06, yt - hy, 0.06);
      b.color(HY, MAT.METAL).boxB(hx, hy - 0.9, hz, 1.0, 0.9, 0.6);
      World.addCol({ t: 'c', x, z, r: 2.2, y0: y0 - 1, y1: yt + 6, kind: 'struct' });
    }
    // ---- kuppelkasvuhoone: suur klaaskuppel ribidega, sisse saab ukse kaudu ----
    function greenhouse(x, z, r) {
      const y0 = Y(x, z) + 0.02, n = 18, doorK = Math.floor(rng() * n);
      b.color([0.3, 0.3, 0.31], MAT.METAL).cyl(x, y0 - 0.3, z, r + 0.4, r + 0.4, 0.35, 32, true);
      for (let k = 0; k < n; k++) {
        const a0 = k / n * TAU, a1 = (k + 1) / n * TAU;
        if (k === doorK) { gl.color(ACC[2], MAT.GLOW).sphere(x + Math.cos(a0 + 0.17) * r, y0 + 2.9, z + Math.sin(a0 + 0.17) * r, 0.15, 6, 4, 1); continue; }
        const broken = rng() < 0.12;
        World.addCol({ t: 's', ax: x + Math.cos(a0) * r, az: z + Math.sin(a0) * r, bx: x + Math.cos(a1) * r, bz: z + Math.sin(a1) * r, r: 0.3, y0: y0 - 1, y1: y0 + (broken ? 0.8 : 3), kind: 'struct' });
        b.color(FRAME, MAT.METAL).boxB(x + Math.cos(a0) * r, y0, z + Math.sin(a0) * r, 0.3, 2.8, 0.3);
      }
      // ribid
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; for (let q = 0; q < 6; q++) { const t0 = q / 6 * Math.PI / 2, t1 = (q + 1) / 6 * Math.PI / 2; const p0 = [x + Math.cos(a) * Math.cos(t0) * r, y0 + Math.sin(t0) * r * 0.7, z + Math.sin(a) * Math.cos(t0) * r], p1 = [x + Math.cos(a) * Math.cos(t1) * r, y0 + Math.sin(t1) * r * 0.7, z + Math.sin(a) * Math.cos(t1) * r]; const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]); b.color(FRAME, MAT.METAL).push().tf((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2, Math.atan2(p1[0] - p0[0], p1[2] - p0[2]), -Math.asin((p1[1] - p0[1]) / L), 0).box(0, 0, 0, 0.18, 0.18, L).pop(); } }
      dm.color([0.42, 0.6, 0.62], MAT.METAL).sphere(x, y0, z, r, 20, 10, 0.7);
      // taimelaud ja kuivanud tulnukataimed
      for (let k = 0; k < 6; k++) { const a = rng() * TAU, d = rng() * r * 0.6, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; b.color([0.3, 0.26, 0.2], MAT.WORN).boxB(px, y0, pz, 2.4, 0.7, 1.0); b.color([0.3, 0.42, 0.22], MAT.MATTE).cyl(px, y0 + 0.7, pz, 0.08, 0.02, 1.2, 5, true); gl.color([0.6, 1.0, 0.4], MAT.GLOW).sphere(px, y0 + 1.9, pz, 0.12, 6, 4, 1); }
      lootSpots.push({ x: x + rng() * 3, z: z + rng() * 3 });
    }
    // ---- kõrgraudtee: sambad ringtee kohal, osaliselt alla kukkunud ----
    function monorail(R0, segs) {
      for (let k = 0; k < segs; k++) {
        const a0 = k / segs * TAU, a1 = (k + 1) / segs * TAU;
        const x0 = c.x + Math.cos(a0) * R0, z0 = c.z + Math.sin(a0) * R0, x1 = c.x + Math.cos(a1) * R0, z1 = c.z + Math.sin(a1) * R0;
        const y0 = Y(x0, z0), H = 9;
        b.color(PAN[1], MAT.WORN).cyl(x0, y0 - 0.3, z0, 0.7, 0.55, H, 12, true);
        b.color(FRAME, MAT.METAL).push().tf(x0, y0 + H, z0, Math.atan2(x1 - x0, z1 - z0), 0, 0).boxB(0, 0, 0, 3.0, 0.5, 1.6).pop();
        World.addCol({ t: 'c', x: x0, z: z0, r: 0.8, y0: y0 - 1, y1: y0 + H, kind: 'struct' });
        const fall = rng() < 0.18, L = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        if (fall) { b.color([0.5, 0.5, 0.5], MAT.WORN).push().tf(mx, Y(mx, mz) + 2.5, mz, yaw, 0.32, 0.1).box(0, 0, 0, 2.2, 0.8, L).pop(); continue; }   // alla kukkunud lõik
        b.color([0.62, 0.62, 0.6], MAT.WORN).push().tf(mx, y0 + H + 0.5, mz, yaw, 0, 0).boxB(0, 0, 0, 2.2, 0.7, L + 0.3).pop();
        gl.color(ACC[1], MAT.GLOW).push().tf(mx, y0 + H + 1.22, mz, yaw, 0, 0).box(0, 0, 0, 0.12, 0.04, L * 0.95).pop();
        if (rng() < 0.08) { b.color([0.72, 0.72, 0.7], MAT.WORN).push().tf(mx, y0 + H + 2.2, mz, yaw, 0, 0).rbox(0, 0, 0, 2.6, 2.6, 12, 0.9).pop(); gl.color(ACC[0], MAT.GLOW).push().tf(mx, y0 + H + 2.4, mz, yaw, 0, 0).box(1.32, 0, 0, 0.04, 0.5, 10).box(-1.32, 0, 0, 0.04, 0.5, 10).pop(); }   // seisma jäänud vagun
      }
    }
    // ---- linn: üks lagunenud linnamüür ümber kogu linna, väravad radiaalteede otstes ----
    const WR = c.r - 6, NW = 84, RAD = 8;   // 8 radiaalteed
    const gateAt = (a) => { for (let k = 0; k < RAD; k++) { const ga = k / RAD * TAU + c.roadA; if (Math.abs(angDiff(a, ga)) < 0.05) return true; } return false; };
    for (let k = 0; k < NW; k++) {
      const a0 = k / NW * TAU, a1 = (k + 1) / NW * TAU, am = (a0 + a1) / 2;
      if (gateAt(am)) { // värav: kaks massiivset posti + helendav kaar
        for (const aa of [a0, a1]) { const x = c.x + Math.cos(aa) * WR, z = c.z + Math.sin(aa) * WR; b.color(FRAME, MAT.METAL).cyl(x, Y(x, z) - 0.3, z, 1.3, 1.1, 9.5, 14, true); gl.color(ACC[0], MAT.GLOW).cyl(x, Y(x, z) + 8.6, z, 1.15, 1.15, 0.12, 14, false); World.addCol({ t: 'c', x, z, r: 1.3, y0: Y(x, z) - 2, y1: Y(x, z) + 10, kind: 'struct' }); }
        continue;
      }
      const x0 = c.x + Math.cos(a0) * WR, z0 = c.z + Math.sin(a0) * WR, x1 = c.x + Math.cos(a1) * WR, z1 = c.z + Math.sin(a1) * WR;
      const br = rng();
      if (br < 0.1) { rubble(b, (x0 + x1) / 2, (z0 + z1) / 2, 3.5, rng, Y(x0, z0)); continue; }   // läbimurre
      const h = br < 0.28 ? R(1.2, 3.0) : R(6.2, 7.5);
      const yA = Math.min(Y(x0, z0), Y(x1, z1)) - 0.3;
      wallSeg(x0, z0, x1, z1, yA, h, 1.3, PAN[1], h > 5 ? { stripe: ACC[0] } : null);
      if (h > 5) { // paneelid ja ülemine sõiduraja serv
        const yaw = Math.atan2(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        b.color(PAN[2], MAT.WORN).push().tf(mx, yA, mz, yaw, 0, 0).boxB(0.7, 1.2, 0, 0.12, h - 2.4, Math.hypot(x1 - x0, z1 - z0) * 0.8).boxB(-0.7, 1.2, 0, 0.12, h - 2.4, Math.hypot(x1 - x0, z1 - z0) * 0.8).pop();
      } else rubble(b, (x0 + x1) / 2, (z0 + z1) / 2, 2.5, rng, Y(x0, z0));
      if (k % 7 === 3) { const x = x0, z = z0, y = Y(x, z) - 0.3; b.color(PAN[0], MAT.WORN).cyl(x, y, z, 3.6, 3.2, 11, 18, true); b.color(FRAME, MAT.METAL).cyl(x, y + 11, z, 4, 4, 0.8, 18, true); gl.color(ACC[0], MAT.GLOW).cyl(x, y + 9, z, 3.3, 3.3, 0.1, 18, false); World.addCol({ t: 'c', x, z, r: 3.7, y0: y - 2, y1: y + 12, kind: 'struct' }); }   // bastion
    }
    // ---- hoonete paigutus: tihe kvartalivõrk ringteede ja radiaalteede vahel ----
    const RINGS = c.rings || [60, 100, 140, 176, 212], RW = 5.5;
    const occ = [];
    const free = (x, z, r) => occ.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + r + 1.5);
    const take = (x, z, r) => occ.push({ x, z, r });
    const nearRadial = (x, z, m) => { const ang = Math.atan2(z - c.z, x - c.x) - c.roadA, sec = TAU / RAD, ra = ((ang % sec) + sec * 1.5) % sec - sec / 2; return Math.abs(Math.sin(ra) * Math.hypot(x - c.x, z - c.z)) < m; };
    const nearRing = (x, z, m) => { const d = Math.hypot(x - c.x, z - c.z); return RINGS.some((rr) => Math.abs(d - rr) < m); };
    const doorTo = (hx, hz) => { const gx = c.x - hx, gz = c.z - hz; return Math.abs(gx) > Math.abs(gz) ? (gx > 0 ? 1 : 3) : (gz > 0 ? 0 : 2); };
    // keskväljak: maandumisplats, atmosfääriprotsessor, juhtimistorn ja skybridge
    { const y0 = Y(c.x, c.z);
      b.color([0.26, 0.27, 0.28], MAT.METAL).cyl(c.x, y0 - 0.25, c.z, 14, 14, 0.35, 32, true);
      gl.color(ACC[0], MAT.GLOW).cyl(c.x, y0 + 0.11, c.z, 13, 13, 0.02, 32, false);
      b.color([0.24, 0.25, 0.26], MAT.METAL).cyl(c.x, y0 - 0.24, c.z, 12.6, 12.6, 0.36, 32, true);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; gl.color(ACC[1], MAT.GLOW).box(c.x + Math.cos(a) * 9, y0 + 0.13, c.z + Math.sin(a) * 9, 1.6, 0.02, 1.6); }
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; b.color(k & 1 ? HB : HY, MAT.MATTE).push().tf(c.x + Math.cos(a) * 14.1, y0 - 0.2, c.z + Math.sin(a) * 14.1, -a + Math.PI / 2, 0, 0).boxB(0, 0, 0, 3.7, 0.4, 0.5).pop(); }
      take(c.x, c.z, 15);
      const ax = c.x - 30, az = c.z + 16; const ap = atmo(ax, az, 0.85); take(ax, az, 22);
      const sp = spire(c.x + 26, c.z - 12, 4.2, 44); take(c.x + 26, c.z - 12, 6);
      const L = Math.hypot(ax - sp.x, az - sp.z), yaw = Math.atan2(ax - sp.x, az - sp.z), yy = Math.min(ap.y, y0 + 22);
      b.color(PAN[0], MAT.WORN).push().tf((ax + sp.x) / 2, yy, (az + sp.z) / 2, yaw, 0, 0).rbox(0, 0, 0, 2.8, 2.8, L - 16, 1.1).pop();
      gl.color(ACC[1], MAT.GLOW).push().tf((ax + sp.x) / 2, yy, (az + sp.z) / 2, yaw, 0, 0).box(1.43, 0, 0, 0.04, 0.4, L - 17).box(-1.43, 0, 0, 0.04, 0.4, L - 17).pop();
      for (const t of [0.35, 0.65]) { const px = sp.x + (ax - sp.x) * t, pz = sp.z + (az - sp.z) * t; b.color(FRAME, MAT.METAL).push().tf(px, Y(px, pz) - 0.3, pz, yaw, 0, 0).boxB(0, 0, 0, 1.4, yy - Y(px, pz) - 1.1, 1.4).pop(); World.addCol({ t: 'c', x: px, z: pz, r: 1.0, y0: y0 - 1, y1: yy, kind: 'struct' }); take(px, pz, 1.2); }
    }
    // pooleli mech: kokkupanekuhall väljakul (osad on linna majadesse laiali)
    { let bay = null;
      for (let k = 0; k < 40 && !bay; k++) { const a = k / 40 * TAU + 0.3, rr = 40, x = c.x + Math.cos(a) * rr, z = c.z + Math.sin(a) * rr; if (free(x, z, 7.5) && !nearRadial(x, z, RW + 7.5)) bay = { x, z }; }
      if (!bay) bay = { x: c.x + 36, z: c.z + 30 };
      take(bay.x, bay.z, 7.5);
      const yaw = Math.atan2(c.x - bay.x, c.z - bay.z), y0 = Y(bay.x, bay.z), fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      c.mechBay = { x: bay.x, z: bay.z, y: y0, yaw };
      b.push().tf(bay.x, y0, bay.z, yaw, 0, 0);
      b.color([0.24, 0.24, 0.25], MAT.METAL).boxB(0, -0.2, 0, 9, 0.3, 9);
      hazardZ(4.3, 0.1, 0, 0.4, 0.04, 9); hazardZ(-4.3, 0.1, 0, 0.4, 0.04, 9);
      for (const sx of [-1, 1]) { b.color(STEEL, MAT.METAL).boxB(sx * 3.9, 0, -1.5, 0.9, 10, 0.9); b.color(STEEL, MAT.METAL).boxB(sx * 3.9, 0, 1.5, 0.6, 10, 0.6); for (let k = 0; k < 4; k++) b.color(FRAME, MAT.METAL).boxB(sx * 3.9, 2 + k * 2.2, 0, 0.3, 0.3, 3); }
      b.color([0.86, 0.66, 0.12], MAT.METAL).boxB(0, 10, -1.5, 8.8, 0.8, 0.9); b.color(FRAME, MAT.METAL).boxB(0, 10, 1.5, 8.6, 0.5, 0.6);
      b.color(DARK, MAT.METAL).boxB(1.2, 6.5, -1.5, 0.05, 3.5, 0.05); b.color(HY, MAT.METAL).boxB(1.2, 6.0, -1.5, 0.6, 0.5, 0.4);
      for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) b.color(FRAME, MAT.METAL).boxB(sx * 2.6, 2.4 + k * 2.4, -2.2, 1.8, 0.12, 0.8);   // hoolduspoodiumid
      b.color([0.3, 0.3, 0.32], MAT.WORN).boxB(-3.2, 0, 3.4, 1.4, 1.3, 0.9); gl.push().tf(bay.x, y0, bay.z, yaw, 0, 0).color(ACC[2], MAT.GLOW).boxB(-3.2, 1.0, 3.86, 0.9, 0.25, 0.02).pop();
      b.pop();
      for (const sx of [-1, 1]) for (const sz of [-1.5, 1.5]) World.addCol({ t: 'c', x: bay.x + rx * sx * 3.9 + fx * sz, z: bay.z + rz * sx * 3.9 + fz * sz, r: 0.6, y0: y0 - 1, y1: y0 + 10.5, kind: 'struct' });
      beacon(bay.x + rx * 4.3, y0 + 10.7, bay.z + rz * 4.3); beacon(bay.x - rx * 4.3, y0 + 10.7, bay.z - rz * 4.3);
    }
    monorail(140, 40);
    // kvartali tüübid: elamud, tööstus, tornid, kasvuhooned
    const THEMES = { res: [['hab', 6], ['hab2', 3], ['spire_s', 1], ['dish', 0.6]], ind: [['tanks', 3], ['cont', 3], ['hall', 3], ['crane', 1.2], ['hab', 1.5]],
      tower: [['spire', 2], ['hab2', 3], ['hab', 2], ['dish', 0.8]], park: [['green', 2], ['hab', 3], ['cont', 0.6]] };
    const pickW = (list) => { let s2 = 0; for (const [, w2] of list) s2 += w2; let u = rng() * s2; for (const [t, w2] of list) { u -= w2; if (u <= 0) return t; } return list[0][0]; };
    // pinnad: [ringide vahe 0, 1, 2, 3] ja plats
    const bands = [];
    for (let i = 0; i < RINGS.length - 1; i++) bands.push([RINGS[i] + RW, RINGS[i + 1] - RW, i]);
    const sizeOf = (t) => {
      if (t === 'hab') { const w = R(9, 14), d = R(7, 11); return { w, d, fr: Math.hypot(w, d) / 2 }; }
      if (t === 'hab2') { const w = R(10, 15), d = R(8, 12); return { w, d, fr: Math.hypot(w, d) / 2 }; }
      if (t === 'hall') { const w = R(16, 20), d = R(10, 13); return { w, d, fr: Math.hypot(w, d) / 2 }; }
      return { fr: { tanks: 9, cont: 8.5, crane: 4, dish: 4, spire: 6, spire_s: 3.5, green: 11 }[t] || 6 };
    };
    for (const [r0, r1, bi] of bands) for (let sct = 0; sct < RAD; sct++) {
      const aS = sct / RAD * TAU + c.roadA, sec = TAU / RAD;
      const tr = rng();
      const theme = bi === 0 ? (tr < 0.45 ? 'tower' : tr < 0.8 ? 'res' : 'park') : bi === 1 ? (tr < 0.3 ? 'tower' : tr < 0.65 ? 'res' : tr < 0.85 ? 'park' : 'ind') : (tr < 0.55 ? 'ind' : tr < 0.85 ? 'res' : 'park');
      const list = THEMES[theme];
      let fails = 0, placed = 0;
      while (fails < 26 && placed < 9) {
        const t = pickW(list), S = sizeOf(t);
        if (S.fr * 2 > r1 - r0) { fails++; continue; }
        const rr = R(r0 + S.fr, r1 - S.fr), marg = (RW + S.fr) / rr;
        if (sec - 2 * marg <= 0) { fails++; continue; }
        const a = aS + marg + rng() * (sec - 2 * marg);
        const x = c.x + Math.cos(a) * rr, z = c.z + Math.sin(a) * rr;
        if (!free(x, z, S.fr)) { fails++; continue; }
        take(x, z, S.fr); placed++;
        if (t === 'hab') hab(x, z, S.w, S.d, 1, doorTo(x, z), rng);
        else if (t === 'hab2') hab(x, z, S.w, S.d, 2 + (rng() < 0.25 ? 1 : 0), doorTo(x, z), rng);
        else if (t === 'hall') hab(x, z, S.w, S.d, 2, doorTo(x, z), rng, { hall: true });
        else if (t === 'tanks') tanks(x, z, S.fr);
        else if (t === 'cont') containers(x, z, S.fr);
        else if (t === 'crane') crane(x, z);
        else if (t === 'dish') dish(x, z);
        else if (t === 'spire') spire(x, z, R(3, 4.4), R(26, 46));
        else if (t === 'spire_s') spire(x, z, R(1.8, 2.6), R(14, 22));
        else if (t === 'green') greenhouse(x, z, R(8.5, 10.5));
      }
      for (const rr of [r0 - RW, r1 + RW]) spots.push({ x: c.x + Math.cos(aS + sec / 2) * rr, z: c.z + Math.sin(aS + sec / 2) * rr });   // ringteel
    }
    // plats: väiksemad hooned keskväljaku ääres
    for (let k = 0, f = 0; k < 6 && f < 30;) {
      const S = sizeOf('hab'), a = rng() * TAU, rr = R(22, RINGS[0] - RW - S.fr), x = c.x + Math.cos(a) * rr, z = c.z + Math.sin(a) * rr;
      if (!free(x, z, S.fr) || nearRadial(x, z, RW + S.fr)) { f++; continue; }
      take(x, z, S.fr); k++; hab(x, z, S.w, S.d, 1 + (rng() < 0.4 ? 1 : 0), doorTo(x, z), rng);
    }
    // ---- kõvakattega teed: asfaltplaadid, äärekivid, teekattemärgistus; kohati lõhutud või liiva all ----
    const sandAt = (x, z) => smoothstep(0.15, 0.65, Noise.n2(x * 0.03 + 11, z * 0.03 - 5));
    function slab(B, x0, z0, x1, z1, w, o) {
      const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.3) return;
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      if (sandAt(mx, mz) > (o.sand || 0.62)) return;   // liiva all
      const yA = Y(x0, z0), yB = Y(x1, z1), yaw = Math.atan2(x1 - x0, z1 - z0), pitch = -Math.atan2(yB - yA, L), my = (yA + yB) / 2;
      if (rng() < (o.broken || 0.07)) {   // lõhutud: kallutatud tükid
        for (let k = 0; k < 3; k++) B.color([0.2, 0.2, 0.21], MAT.WORN).push().tf(mx + R(-w / 3, w / 3), my + 0.05, mz + R(-w / 3, w / 3), rng() * TAU, R(-0.25, 0.25), R(-0.25, 0.25)).box(0, 0, 0, R(1.4, 2.6), 0.3, R(1.4, 2.6)).pop();
        return;
      }
      const v = R(0.85, 1.12), patch = rng() < 0.12;
      const col = patch ? [0.36 * v, 0.35 * v, 0.33 * v] : [0.17 * v, 0.17 * v, 0.18 * v];
      B.push().tf(mx, my + (o.lift || 0), mz, yaw, pitch, 0);
      B.color(col, MAT.WORN).box(0, -0.18, 0, w, 0.52, L + 0.06);
      if (o.dash && (o.i & 1) === 0) B.color([0.62, 0.55, 0.3], MAT.MATTE).box(0, 0.085, 0, 0.18, 0.012, L * 0.55);
      if (o.edge) for (const sg of [-1, 1]) if (rng() < 0.75) B.color([0.55, 0.54, 0.5], MAT.MATTE).box(sg * (w / 2 - 0.45), 0.085, 0, 0.14, 0.012, L);
      if (o.curb && !o.curbSkip) for (const sg of [-1, 1]) if (rng() < 0.85) B.color([0.44, 0.43, 0.41], MAT.WORN).boxB(sg * (w / 2 + 0.2), -0.3, 0, 0.4, 0.55, L + 0.02);
      B.pop();
    }
    RINGS.forEach((rr, ri) => {
      const n = Math.round(TAU * rr / 6);
      for (let k = 0; k < n; k++) {
        const a0 = k / n * TAU, a1 = (k + 1) / n * TAU;
        const x0 = c.x + Math.cos(a0) * rr, z0 = c.z + Math.sin(a0) * rr, x1 = c.x + Math.cos(a1) * rr, z1 = c.z + Math.sin(a1) * rr;
        slab(b, x0, z0, x1, z1, 9, { dash: true, edge: ri !== 2, curb: true, curbSkip: nearRadial((x0 + x1) / 2, (z0 + z1) / 2, 7), i: k, lift: 0 });
      }
    });
    for (let k = 0; k < RAD; k++) {
      const a = k / RAD * TAU + c.roadA, ca = Math.cos(a), sa = Math.sin(a);
      for (let d = 16, i = 0; d < c.r + 90; d += 6, i++) {
        const x0 = c.x + ca * d, z0 = c.z + sa * d, x1 = c.x + ca * (d + 6), z1 = c.z + sa * (d + 6);
        const inRing = nearRing((x0 + x1) / 2, (z0 + z1) / 2, 5);
        if (d < RINGS[0] && !free((x0 + x1) / 2, (z0 + z1) / 2, 3)) continue;   // väljaku hooned
        slab(b, x0, z0, x1, z1, 9, { dash: !inRing, edge: !inRing, curb: d < c.r - 10, curbSkip: nearRing((x0 + x1) / 2, (z0 + z1) / 2, 7), i, lift: inRing ? 0.015 : 0, broken: d > c.r ? 0.16 : 0.07 });
      }
    }
    // vallilõik valitud kõrgusega (kõrgus maapinnast)
    function wallSegH(x0, z0, x1, z1, h, broken) {
      const yA = Y(x0, z0), yB = Y(x1, z1), y0 = Math.min(yA, yB) - 0.3;
      wallSeg(x0, z0, x1, z1, y0, h + 0.3, 0.7, PAN[1], h > 3 ? { stripe: ACC[0] } : null);
      if (broken) rubble(b, (x0 + x1) / 2, (z0 + z1) / 2, 2.2, rng, y0 + 0.3);
    }
    // tänavad komplekside vahel (tulnukate kogunemiskohad)
    // tänavatel mahajäetud koloonia sõidukid
    for (let k = 0; k < 18; k++) {
      const s = spots[Math.floor(rng() * spots.length)]; if (!s) break;
      const x = s.x + R(-10, 10), z = s.z + R(-10, 10), y = Y(x, z), yaw = R(0, TAU);
      if (!free(x, z, 2.6)) continue;
      take(x, z, 2.6);
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
    // mechi osade kohad: 5 eri majas, üksteisest kaugel
    { const pts = []; const pool = lootSpots.slice();
      for (let t = 0; t < 400 && pts.length < 5 && pool.length; t++) { const q = pool[Math.floor(rng() * pool.length)]; if (pts.every((o) => Math.hypot(o.x - q.x, o.z - q.z) > 60)) pts.push(q); }
      for (let t = 0; t < 50 && pts.length < 5 && pool.length; t++) { const q = pool[Math.floor(rng() * pool.length)]; if (!pts.includes(q)) pts.push(q); }
      c.mechParts = pts; }
    mesh = b.build(); glow = gl.build(); domes = dm.build();
    // ---- väikesed mahajäetud asulad: 2–4 koloonia maja, vallijupid, vanaraud, veidi varustust ----
    b = new MB(); b.jit = 0; gl = new MB(); gl.jit = 0; dm = new MB(); dm.jit = 0;
    vLoot.length = 0;
    const vNames = ['Abandoned outpost', 'Deserted farmstead', 'Empty relay station', 'Dead settlement'];
    (World.sites.villages || []).forEach((v, vi) => {
      const nH = 2 + Math.floor(rng() * 3), a0 = rng() * TAU;
      const before = lootSpots.length;
      for (let q = 0; q < nH; q++) {
        const a = a0 + q / nH * TAU + R(-0.3, 0.3), rr = nH === 2 ? 9 : R(10, 15);
        const hx = v.x + Math.cos(a) * rr, hz = v.z + Math.sin(a) * rr;
        const gx = v.x - hx, gz = v.z - hz;   // uks küla keskpaiga poole
        const doorSide = Math.abs(gx) > Math.abs(gz) ? (gx > 0 ? 1 : 3) : (gz > 0 ? 0 : 2);
        hab(hx, hz, R(7, 11), R(6, 9), 1, doorSide, rng);
      }
      for (let k = before; k < lootSpots.length; k++) vLoot.push(lootSpots[k]);
      lootSpots.length = before;
      // lagunenud piirdevalli jupid
      for (let k = 0; k < 6; k++) {
        if (rng() < 0.45) continue;
        const a1 = k / 6 * TAU + a0, a2 = a1 + 0.6, r2 = v.r - 4;
        wallSegH(v.x + Math.cos(a1) * r2, v.z + Math.sin(a1) * r2, v.x + Math.cos(a2) * r2, v.z + Math.sin(a2) * r2, R(1, 3.2), rng() < 0.5);
      }
      if (rng() < 0.6) tower(v.x + R(-4, 4), v.z + R(-4, 4), 1.2, R(7, 11));
      // vanaraua hunnik
      const x = v.x + R(-6, 6), z = v.z + R(-6, 6), y = Y(x, z);
      const pb = new MB(); pb.jit = 0; rubble(pb, 0, 0, R(2.2, 3), rng, 0, true);
      const w = { id: 1100 + vi, x, z, y, yaw: 0, type: -1, m: M4.compose(M4.create(), x, y, z, R(0, TAU)), rad: 2.4, scrap: Math.floor(R(40, 75)), name: vNames[vi % vNames.length], known: false, mesh: pb.build(), city: true };
      w.col = World.addCol({ t: 'c', x, z, r: 2.0, y0: y - 2, y1: y + 2, kind: 'wreck' });
      World.wrecks.push(w);
      v.name = vNames[vi % vNames.length];
    });
    // maanteed asulate vahel: asfaltplaadid järgivad maastikku, suur osa lagunenud või liiva all
    for (const r of World.sites.roads || []) {
      if (r.tunnel) continue;   // tunnelis on oma põrand
      const n = Math.floor(r.L / 6);
      for (let k = 0; k < n; k++) {
        const x0 = r.ax + r.dx * k / n, z0 = r.az + r.dz * k / n, x1 = r.ax + r.dx * (k + 1) / n, z1 = r.az + r.dz * (k + 1) / n, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        if (Math.hypot(mx - c.x, mz - c.z) < c.r + 92) continue;
        if ((World.sites.villages || []).some((v) => Math.hypot(mx - v.x, mz - v.z) < v.r)) continue;
        if (Math.hypot(mx, mz) < 90 || World.sites.rivals.some((q) => Math.hypot(mx - q.x, mz - q.z) < 90) || Math.hypot(mx - World.sites.nest.x, mz - World.sites.nest.z) < 80) continue;
        if (Noise.n2(mx * 0.012 + 40, mz * 0.012 - 7) > 0.42) continue;
        slab(b, x0, z0, x1, z1, 8, { dash: true, edge: true, i: k, broken: 0.14, sand: 0.5 });
      }
    }
    vmesh = b.build(); vglow = gl.build(); vdomes = dm.build();
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
    if (vmesh) { GFX.draw(vmesh, ID, null, null, { rust: 1.1 }); GFX.draw(vglow, ID, null, null, { shadow: false }); GFX.draw(vdomes, ID, null, null, { rust: 0.6, cull: false }); }
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
    const parts = ['legs', 'torso', 'gun', 'reactor', 'cpu'], c = World.sites.city;
    (c.mechParts || []).forEach((q, k) => { if (parts[k]) Ents.pickups.push({ kind: 'mechpart', x: q.x, y: Ents.groundY(q.x, q.z), z: q.z, data: { part: parts[k] }, id: Math.random(), city: true }); });
    for (const s of vLoot) if (Math.random() < 0.6) { const items = []; for (let q = 0; q < randi(1, 3); q++) { const [id, a, bb] = LOOT[Math.floor(Math.random() * 9)]; if (ITEMS[id]) items.push([id, randi(a, bb)]); } Ents.pickups.push({ kind: 'bag', x: s.x, y: Ents.groundY(s.x, s.z), z: s.z, data: { items }, id: Math.random(), city: true }); }
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
