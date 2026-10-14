// ============================================================
//  EFEKTID: osakesed, jäljed, plahvatused
// ============================================================
const FX = (() => {
  const A = () => GFX.partAdd, P = () => GFX.partAlpha;
  let q = 1; // kvaliteedikordaja
  const n = (k) => Math.max(1, Math.round(k * q));
  // kustuvad valgused (plahvatused, välgud): kestavad mitu kaadrit ja tuhmuvad
  const fl = [];
  const flash = (x, y, z, r, c, i, life) => { if (fl.length < 24) fl.push({ x, y, z, r, c, i, life, t: life }); };
  return {
    setQuality(v) { q = v; },
    update(dt) {
      for (let k = fl.length - 1; k >= 0; k--) {
        const f = fl[k]; f.t -= dt;
        if (f.t <= 0) { fl.splice(k, 1); continue; }
        const a = f.t / f.life, fk = 0.85 + 0.15 * Math.sin(f.t * 60);
        GFX.addLight(f.x, f.y, f.z, f.r * (0.6 + 0.4 * a), f.c[0], f.c[1], f.c[2], f.i * a * a * fk);
      }
    },
    muzzle(x, y, z, dx, dy, dz, big) {
      const s = big ? 1.6 : 1;
      A().emit(x, y, z, dx * 2, dy * 2, dz * 2, 0.05, 0.35 * s, 0.15 * s, [1.0, 0.75, 0.35, 1.0], [1.0, 0.4, 0.1, 0]);
      A().emit(x + dx * 0.12, y + dy * 0.12, z + dz * 0.12, dx * 30, dy * 30, dz * 30, 0.035, 0.09 * s, 0.05, [1.0, 0.85, 0.5, 1.0], [1.0, 0.5, 0.15, 0], 0, 0, 0.012);
      for (let i = 0; i < 4; i++) {   // tähekujulised külgleegid
        const a = Math.random() * TAU, px = -dz, pz = dx, ux = px * Math.cos(a), uy = Math.sin(a), uz = pz * Math.cos(a);
        A().emit(x, y, z, ux * 9 + dx * 4, uy * 9 + dy * 4, uz * 9 + dz * 4, 0.03, 0.05 * s, 0.02, [1, 0.75, 0.35, 0.9], [1, 0.4, 0.1, 0], 0, 0, 0.01);
      }
      for (let i = 0; i < n(4); i++) A().emit(x, y, z, dx * 10 + rand(-2, 2), dy * 10 + rand(-2, 2), dz * 10 + rand(-2, 2), 0.08, 0.06, 0.02, [1, 0.7, 0.3, 1], [1, 0.3, 0, 0], 0, 0, 0.02);
      if (Math.random() < 0.6) P().emit(x + dx * 0.2, y + dy * 0.2, z + dz * 0.2, dx * 1.2 + rand(-0.2, 0.2), dy * 1.2 + rand(0.2, 0.5), dz * 1.2 + rand(-0.2, 0.2), rand(0.5, 0.9), 0.05 * s, 0.35 * s, [0.55, 0.52, 0.5, 0.22], [0.6, 0.57, 0.55, 0], -0.2, 2.5);
      GFX.addLight(x, y, z, big ? 9 : 6, 1.0, 0.7, 0.35, big ? 3 : 2);
    },
    tracer(ax, ay, az, bx, by, bz, col) {
      const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
      if (L < 0.5) return;
      const T = clamp(L / 400, 0.03, 0.12);
      A().emit(ax, ay, az, dx / T, dy / T, dz / T, T, 0.05, 0.04, col || [1, 0.8, 0.45, 0.9], col || [1, 0.6, 0.3, 0.5], 0, 0, 0.004);
      A().emit(ax, ay, az, dx / T, dy / T, dz / T, T, 0.12, 0.08, col ? [col[0], col[1], col[2], 0.25] : [1, 0.55, 0.2, 0.25], [1, 0.4, 0.1, 0], 0, 0, 0.0015);   // hõõguv halo
    },
    rail(ax, ay, az, bx, by, bz) {
      const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
      const steps = Math.min(80, Math.floor(L / 1.2));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        A().emit(ax + dx * t, ay + dy * t, az + dz * t, rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3), 0.5 + t * 0.2, 0.18, 0.02, [0.6, 0.85, 1.0, 1.0], [0.8, 0.4, 1.0, 0]);
      }
    },
    sparks(x, y, z, col, cnt, sp = 5) {
      for (let i = 0; i < n(cnt); i++) A().emit(x, y, z, rand(-sp, sp), rand(0, sp * 1.3), rand(-sp, sp), rand(0.2, 0.5), 0.05, 0.02, [col[0], col[1], col[2], 1], [col[0], col[1] * 0.5, col[2] * 0.3, 0], 12, 1, 0.02);
    },
    dust(x, y, z, cnt, size = 1) {
      for (let i = 0; i < n(cnt); i++) P().emit(x + rand(-0.3, 0.3), y, z + rand(-0.3, 0.3), rand(-1.2, 1.2), rand(0.3, 1.8), rand(-1.2, 1.2), rand(0.8, 1.8), 0.25 * size, 1.1 * size, [0.62, 0.48, 0.36, 0.55], [0.62, 0.48, 0.36, 0], -0.3, 1.2);
    },
    goo(x, y, z, col, cnt) {
      for (let i = 0; i < n(cnt); i++) P().emit(x, y, z, rand(-2.5, 2.5), rand(0.5, 3.5), rand(-2.5, 2.5), rand(0.4, 0.8), 0.12, 0.05, [col[0], col[1], col[2], 0.95], [col[0] * 0.6, col[1] * 0.6, col[2] * 0.6, 0], 12, 0.5);
    },
    impact(x, y, z, kind) {
      if (kind === 'metal') { this.sparks(x, y, z, [1, 0.8, 0.4], 8, 5); P().emit(x, y, z, 0, 0.4, 0, 0.5, 0.06, 0.3, [0.4, 0.38, 0.36, 0.35], [0.45, 0.43, 0.4, 0], -0.2, 2); }
      else if (kind === 'flesh') { this.goo(x, y, z, [0.55, 0.62, 0.25], 8); }
      else if (kind === 'crystal') { this.sparks(x, y, z, [0.6, 0.85, 1.0], 10, 4); A().emit(x, y, z, 0, 0, 0, 0.12, 0.05, 0.5, [0.6, 0.85, 1, 0.8], [0.8, 0.5, 1, 0]); }
      else {
        this.dust(x, y, z, 4, 0.45); this.sparks(x, y, z, [1, 0.7, 0.4], 2, 2);
        for (let i = 0; i < n(5); i++) P().emit(x, y, z, rand(-2, 2), rand(2, 5), rand(-2, 2), rand(0.4, 0.7), 0.04, 0.03, [0.32, 0.22, 0.15, 1], [0.3, 0.2, 0.14, 0.6], 14, 0.3);   // mullatükid
      }
    },
    explosion(x, y, z, col, s = 1) {
      if (typeof Ents !== 'undefined' && Ents.noise) Ents.noise(x, z, 35 * s, 'boom');
      // 1) välk
      A().emit(x, y + 0.3, z, 0, 0, 0, 0.1, 1.4 * s, 2.6 * s, [1, 0.9, 0.7, 0.55], [1, 0.6, 0.2, 0]);
      // 2) tulekera: mitu paisuvat ja tõusvat kuuma pilve
      for (let i = 0; i < n(10 * s); i++) {
        const a = Math.random() * TAU, r = rand(0, 1.2) * s;
        A().emit(x + Math.cos(a) * r, y + rand(0, 0.8) * s, z + Math.sin(a) * r, Math.cos(a) * rand(1, 4) * s, rand(1.5, 5) * s, Math.sin(a) * rand(1, 4) * s, rand(0.35, 0.7), 0.7 * s, 2.0 * s, [1, 0.62, 0.25, 0.45], [col[0] * 0.8, col[1] * 0.3, 0.05, 0], -1.5, 2.5);
      }
      // 3) sädemed ja hõõguvad killud kaartega
      for (let i = 0; i < n(22 * s); i++) A().emit(x, y + 0.3, z, rand(-9, 9) * s, rand(2, 12) * s, rand(-9, 9) * s, rand(0.5, 1.4), 0.08, 0.03, [1, 0.8, 0.4, 1], [1, 0.35, 0.05, 0], 14, 0.6, 0.025);
      for (let i = 0; i < n(18 * s); i++) A().emit(x, y, z, rand(-6, 6) * s, rand(0, 8) * s, rand(-6, 6) * s, rand(0.3, 0.7), 0.6 * s, 0.1, [col[0], col[1], col[2], 1], [col[0] * 0.5, col[1] * 0.3, 0, 0], 6, 2);
      // 4) tumedad prahitükid
      for (let i = 0; i < n(12 * s); i++) P().emit(x, y + 0.2, z, rand(-6, 6) * s, rand(4, 11) * s, rand(-6, 6) * s, rand(0.9, 1.6), 0.09 * s, 0.07 * s, [0.12, 0.1, 0.09, 1], [0.15, 0.12, 0.1, 0.8], 15, 0.3);
      // 5) maapinnalt paisuv tolmurõngas
      for (let i = 0; i < n(16 * s); i++) { const a = (i / 16) * TAU + rand(-0.15, 0.15); P().emit(x + Math.cos(a) * 0.6 * s, y - 0.3, z + Math.sin(a) * 0.6 * s, Math.cos(a) * rand(6, 9) * s, rand(0.2, 1.0), Math.sin(a) * rand(6, 9) * s, rand(1.0, 1.8), 0.6 * s, 2.6 * s, [0.62, 0.48, 0.36, 0.5], [0.62, 0.48, 0.36, 0], -0.2, 2.8); }
      // 6) tõusev suitsusammas
      for (let i = 0; i < n(14 * s); i++) P().emit(x + rand(-1, 1) * s, y + rand(0, 1.5) * s, z + rand(-1, 1) * s, rand(-1, 1), rand(1.5, 4) * s, rand(-1, 1), rand(2.5, 4.5), 1.2 * s, 4.5 * s, [0.22, 0.19, 0.17, 0.6], [0.42, 0.37, 0.33, 0], -0.6, 1.0);
      GFX.addLight(x, y + 1, z, 14 * s, col[0], col[1], col[2], 4);
      flash(x, y + 1.5, z, 18 * s, [1, 0.62, 0.28], 3.5 * Math.min(1.5, s), 0.6 + 0.3 * s);
    },
    crystalBurst(x, y, z) {
      for (let i = 0; i < n(26); i++) A().emit(x, y, z, rand(-5, 5), rand(1, 8), rand(-5, 5), rand(0.5, 1.2), 0.15, 0.03, [0.6, 0.85, 1.0, 1], [0.8, 0.5, 1, 0], 10, 1);
    },
    trail(p) {
      if (Math.random() < 0.6) {
        if (p.kind === 'shard') A().emit(p.x, p.y, p.z, 0, 0, 0, 0.35, 0.5, 0.1, [1, 0.4, 0.8, 0.8], [0.6, 0.3, 1, 0]);
        else P().emit(p.x, p.y, p.z, 0, 0.2, 0, 0.3, 0.15, 0.05, [0.85, 0.75, 0.5, 0.6], [0.8, 0.7, 0.5, 0]);
      }
    },
    beam(ax, ay, az, bx, by, bz) {
      const t = Math.random();
      A().emit(lerp(ax, bx, t), lerp(ay, by, t), lerp(az, bz, t), (bx - ax) * 0.8, (by - ay) * 0.8, (bz - az) * 0.8, 0.25, 0.08, 0.02, [0.6, 0.9, 1, 1], [0.8, 0.5, 1, 0]);
    },
    repair(x, y, z) { this.sparks(x, y, z, [1, 0.85, 0.5], 3, 3); },
    smoke(x, y, z) { P().emit(x + rand(-0.2, 0.2), y, z + rand(-0.2, 0.2), rand(-0.3, 0.3), rand(0.8, 1.5), rand(-0.3, 0.3), rand(2, 3.5), 0.3, 1.5, [0.2, 0.18, 0.17, 0.45], [0.3, 0.27, 0.25, 0], -0.1, 0.4); },
  };
})();
