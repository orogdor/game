// ============================================================
//  SÕJAUDU: kaardil on näha ainult see, mida mängija või meeskond on oma silmaga näinud
// ============================================================
const Fog = (() => {
  const CELL = 20;
  let N = 0, grid = null, cv = null, ctx = null, img = null, dirty = false, t = 0;
  function ensure() {
    if (grid) return;
    N = Math.ceil(World.SIZE / CELL);
    grid = new Uint8Array(N * N);
  }
  function cell(x, z) { const i = Math.floor((x + World.HALF) / CELL), j = Math.floor((z + World.HALF) / CELL); return i < 0 || j < 0 || i >= N || j >= N ? -1 : j * N + i; }
  function seen(x, z) { ensure(); if (G.flags && G.flags.noFog) return true; const k = cell(x, z); return k >= 0 && grid[k] === 1; }
  function reveal(x, z, r) {
    ensure();
    const i0 = Math.floor((x - r + World.HALF) / CELL), i1 = Math.floor((x + r + World.HALF) / CELL);
    const j0 = Math.floor((z - r + World.HALF) / CELL), j1 = Math.floor((z + r + World.HALF) / CELL);
    for (let j = Math.max(0, j0); j <= Math.min(N - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(N - 1, i1); i++) {
      const k = j * N + i; if (grid[k]) continue;
      const cx = -World.HALF + (i + 0.5) * CELL, cz = -World.HALF + (j + 0.5) * CELL;
      if ((cx - x) * (cx - x) + (cz - z) * (cz - z) > r * r) continue;
      grid[k] = 1; dirty = true;
    }
  }
  // kaardi peale joonistatav udukiht (N×N pikslit; joonistamisel silutakse)
  function canvas() {
    ensure();
    if (!cv) { cv = document.createElement('canvas'); cv.width = N; cv.height = N; ctx = cv.getContext('2d'); img = ctx.createImageData(N, N); dirty = true; }
    if (dirty) {
      dirty = false;
      const d = img.data;
      for (let k = 0; k < N * N; k++) { const o = k * 4; d[o] = 18; d[o + 1] = 13; d[o + 2] = 10; d[o + 3] = grid[k] ? 0 : 236; }
      ctx.putImageData(img, 0, 0);
    }
    return cv;
  }
  const isOn = () => !(G.flags && G.flags.noFog);
  function tick(dt) {
    if (G.mode === 'title') return;
    t -= dt; if (t > 0) return; t = 0.4;
    reveal(0, 0, 70);   // baas ise
    const eyes = [];
    if (!Player.dead) { eyes.push({ x: Player.pos.x, z: Player.pos.z, r: 95, who: null }); }
    for (const m of Crew.members()) eyes.push({ x: m.pos.x, z: m.pos.z, r: m.crew.job === 'scout' ? 110 : 70, who: m });
    for (const e of eyes) reveal(e.x, e.z, e.r);
    // komeedi täpne koht selgub, kui keegi on kohal (avastaja kaugemalt)
    for (const s of Comets.sites) {
      if (s.exact || !s.clusters.length) continue;
      for (const e of eyes) {
        const d = Math.hypot(s.x - e.x, s.z - e.z);
        if (d > (e.who && e.who.crew.job === 'scout' ? 75 : 55)) continue;
        s.exact = true; s.ox = 0; s.oz = 0;
        UI.msg(e.who ? e.who.crew.name.split(' ')[0] + ' found the exact spot of a comet – it is now marked on the map.' : 'You found the exact spot of the comet.', 'comet');
        if (e.who) Levels.add(e.who.crew, 'legs', 6);
        break;
      }
    }
  }
  // salvestus: bitikaart base64-na
  function serialize() {
    ensure();
    const b = new Uint8Array(Math.ceil(N * N / 8));
    for (let k = 0; k < N * N; k++) if (grid[k]) b[k >> 3] |= 1 << (k & 7);
    let s = ''; for (let i = 0; i < b.length; i += 4096) s += String.fromCharCode.apply(null, b.subarray(i, i + 4096));
    return btoa(s);
  }
  function deserialize(str) {
    reset();
    if (!str) { reveal(0, 0, 420); return; }   // vana salvestus: baasi ümbrus on juba tuttav
    try {
      const s = atob(str);
      for (let k = 0; k < N * N; k++) { const by = s.charCodeAt(k >> 3); if (by & (1 << (k & 7))) grid[k] = 1; }
    } catch (e) { /* katkine */ }
    dirty = true;
  }
  function reset() { ensure(); grid.fill(0); dirty = true; t = 0; }
  return { seen, reveal, canvas, tick, serialize, deserialize, reset, isOn, CELL };
})();
