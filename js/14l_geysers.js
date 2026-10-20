// ============================================================
//  AURUGEISRID: purskavad iga natukese aja tagant väikese koguse väärismetalli (raha)
//  iga baasi lähedal üks väike, kaugemal kõrbes rikkamad
// ============================================================
const Geysers = (() => {
  const list = [];
  const VAL = 8;           // ₵ ühiku eest (müüakse ladu jõudes automaatselt)
  let M = null;
  const ID = M4.create();
  function mk(x, z, home, rng) {
    const R = (a, b) => a + rng() * (b - a);
    const rich = home ? 1 : R(1.7, 2.6);
    return { x, z, y: World.heightAt(x, z), home, rich, cap: Math.round(12 * rich), stock: Math.round(R(3, 6) * rich), t: R(8, 40), period: home ? 44 : R(55, 80), erupt: 0, wisp: 0, ms: M4.create(), seen: false };
  }
  function build(rng) {
    list.length = 0;
    const S = World.sites, R = (a, b) => a + rng() * (b - a);
    const good = (x, z) => {
      if (Math.max(Math.abs(x), Math.abs(z)) > World.HALF - 60) return false;
      if (World.slopeAt(x, z) > 0.1 || World.slopeAt(x + 3, z) > 0.12 || World.slopeAt(x, z + 3) > 0.12) return false;
      if (World.tunnelAt && World.tunnelAt(x, z)) return false;
      if (S.city && Math.hypot(x - S.city.x, z - S.city.z) < S.city.r + 40) return false;
      for (const v of S.villages || []) if (Math.hypot(x - v.x, z - v.z) < v.r + 20) return false;
      return !list.some((g) => Math.hypot(g.x - x, g.z - z) < 140);
    };
    const near = (cx, cz, r0, r1, home) => {
      for (let t = 0; t < 120; t++) {
        const a = R(0, TAU), d = R(r0, t > 80 ? r1 + 40 : r1), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (!good(x, z)) continue;
        if (home !== 'player' && Math.hypot(x, z) < 160) continue;
        list.push(mk(x, z, home, rng)); return;
      }
    };
    near(0, 0, 62, 95, 'player');
    (S.rivals || []).forEach((r, i) => near(r.x, r.z, 60, 100, 'rival' + i));
    let n = 0;
    for (let t = 0; t < 600 && n < 9; t++) {
      const a = R(0, TAU), d = R(330, World.HALF * 0.86), x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!World.okSpot(x, z, 300) || !good(x, z)) continue;
      list.push(mk(x, z, null, rng)); n++;
    }
  }
  function initMesh() {
    M = {};
    const b = new MB(), gl = new MB(); gl.jit = 0;
    const SIN = [0.78, 0.7, 0.58], SIN2 = [0.62, 0.48, 0.36], RUST = [0.66, 0.36, 0.2], OCH = [0.85, 0.64, 0.3];
    // sintriterrassid: lamedad ketaskihid, servadel mineraalikord
    b.color(SIN2, MAT.WORN).sphere(0, -0.45, 0, 4.3, 18, 8, 0.17);
    b.color(SIN, MAT.WORN).sphere(0, -0.1, 0, 2.9, 16, 7, 0.3);
    b.color(OCH, MAT.WORN).sphere(0, 0.25, 0, 1.8, 14, 6, 0.45);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + 0.3, r = 2.6 + (k % 3) * 0.9; b.color(k & 1 ? RUST : OCH, MAT.WORN).push().tf(Math.cos(a) * r, -0.05, Math.sin(a) * r, a, 0.15, 0).box(0, 0, 0, 0.9, 0.25, 1.6).pop(); }
    // korsten ja kraater
    b.color(SIN2, MAT.WORN).cyl(0, 0, 0, 1.2, 0.7, 1.6, 12, false);
    b.color([0.12, 0.1, 0.09], MAT.MATTE).cyl(0, 1.52, 0, 0.58, 0.58, 0.1, 12, true);
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; b.color(RUST, MAT.WORN).push().tf(Math.cos(a) * 0.95, 1.0, Math.sin(a) * 0.95, -a, 0, 0.5).box(0, 0, 0, 0.35, 0.6, 0.25).pop(); }
    gl.color([1.0, 0.62, 0.25], MAT.GLOW).cyl(0, 1.55, 0, 0.5, 0.5, 0.04, 12, true);
    M.base = b.build(); M.glow = gl.build();
    const nb = new MB();
    nb.color([1.0, 0.78, 0.32], MAT.METAL).sphere(0, 0.1, 0, 0.18, 7, 4, 0.7).sphere(0.22, 0.07, 0.1, 0.12, 6, 3, 0.7).sphere(-0.14, 0.06, 0.18, 0.1, 6, 3, 0.7);
    M.nug = nb.build();
  }
  function draw() {
    if (!list.length) return;
    if (!M) initMesh();
    const cam = GFX.cam.pos;
    for (const g of list) {
      const d = Math.hypot(g.x - cam.x, g.z - cam.z); if (d > 900) continue;
      M4.compose(g.ms, g.x, g.y, g.z, 0, 0, 0);
      GFX.draw(M.base, g.ms, null, null, { rust: 0.3 });
      GFX.draw(M.glow, g.ms, null, null, { shadow: false });
      if (d < 120) {
        const n = Math.min(8, Math.ceil(g.stock / Math.max(1, g.cap / 8)));
        g.nm = g.nm || Array.from({ length: 8 }, () => M4.create());
        for (let k = 0; k < n; k++) { const a = k * 2.4 + 0.7, r = 1.6 + (k % 3) * 0.55, x = g.x + Math.cos(a) * r, z = g.z + Math.sin(a) * r; M4.compose(g.nm[k], x, World.heightAt(x, z) + 0.15, z, a, 0, 0); GFX.draw(M.nug, g.nm[k], null, null, { rust: 0 }); }
        if (g.erupt > 0) GFX.addLight(g.x, g.y + 2, g.z, 10, 1.0, 0.7, 0.35, 1.2 * g.erupt / 4);
      }
    }
  }
  let pT = 0;
  function tick(dt) {
    if (!list.length || G.mode === 'title') return;
    const cam = GFX.cam.pos;
    for (const g of list) {
      g.t -= dt;
      if (g.t <= 0) {
        g.t = g.period * rand(0.8, 1.2); g.erupt = 4;
        g.stock = Math.min(g.cap, g.stock + Math.round(2 * g.rich));
        const d = Math.hypot(g.x - Player.pos.x, g.z - Player.pos.z);
        if (d < 160 && Audio2.explode) Audio2.explode(g.x, g.z, false);
      }
      const d = Math.hypot(g.x - cam.x, g.z - cam.z);
      if (g.erupt > 0) {
        g.erupt -= dt;
        if (d < 500 && GFX.partAlpha) {
          const k = Math.min(1, g.erupt / 3);
          for (let i = 0; i < 7; i++) GFX.partAlpha.emit(g.x + rand(-0.35, 0.35), g.y + 1.6, g.z + rand(-0.35, 0.35), rand(-0.9, 0.9), rand(14, 22) * (0.35 + 0.65 * k), rand(-0.9, 0.9), rand(1.6, 2.6), 0.6, 3.2, [0.96, 0.94, 0.9, 0.55], [0.86, 0.82, 0.78, 0], -2, 0.12);
          if (GFX.partAdd && Math.random() < 0.7) GFX.partAdd.emit(g.x, g.y + 1.9, g.z, rand(-3, 3), rand(6, 12), rand(-3, 3), rand(0.8, 1.4), 0.12, 0.05, [1.0, 0.8, 0.35, 1], [1.0, 0.6, 0.2, 0], 14, 0.2);
        }
      } else if (d < 250 && GFX.partAlpha && (g.wisp -= dt) <= 0) {
        g.wisp = 0.25;
        GFX.partAlpha.emit(g.x + rand(-0.3, 0.3), g.y + 1.6, g.z + rand(-0.3, 0.3), rand(-0.3, 0.3), rand(1.2, 2.2), rand(-0.3, 0.3), 2.5, 0.5, 2.2, [0.92, 0.9, 0.86, 0.22], [0.9, 0.88, 0.85, 0], -0.2, 0.3);
      }
    }
    // mängija korjab ise: seisa geisri kõrval
    pT -= dt;
    if (!Player.dead && pT <= 0) {
      pT = 0.6;
      for (const g of list) {
        if (g.stock <= 0 || Math.hypot(g.x - Player.pos.x, g.z - Player.pos.z) > 3.6) continue;
        g.stock--; G.res.cr += VAL; G.stats.metal = (G.stats.metal || 0) + 1;
        if (Audio2.crystal) Audio2.crystal();
        UI.toast('+' + VAL + ' ₵ precious metal' + (g.stock ? ' · ' + g.stock + ' left' : ''));
        break;
      }
    }
  }
  function take(g, n) { const k = Math.min(n, g.stock); g.stock -= k; return k; }
  function forBase() { return list.find((g) => g.home === 'player'); }
  function serialize() { return list.map((g) => [g.stock, Math.round(g.t)]); }
  function deserialize(a) { (a || []).forEach((v, i) => { const g = list[i]; if (g && v) { g.stock = Math.min(g.cap, v[0] | 0); g.t = v[1] || g.t; } }); }
  return { list, VAL, build, draw, tick, take, forBase, serialize, deserialize };
})();
