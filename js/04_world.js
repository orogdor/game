// ============================================================
//  MAAILM: maastik, kaljud, taimed, vrakid, põrked, kiirtekontroll
// ============================================================
const World = (() => {
  const HALF = 2300, SIZE = 4600, RES = 960,   // kaart laiendatud: ühes servas vana koloonia linn
   STEP = SIZE / RES, N1 = RES + 1, CHK = 64, NCH = RES / CHK;
  const H = new Float32Array(N1 * N1);
  const mapRGB = new Uint8Array(N1 * N1 * 3);
  const sites = { base: { x: 0, z: 0 }, rivals: [], nest: { x: 0, z: 0 }, ribs: [], campLevel: [0, 0], nestLevel: 0, city: { x: 1e5, z: 1e5, level: 0, r: 230 } };
  const wrecks = [];
  const ores = [];   // rauamaagi kivid (kaevandamiseks on vaja maagipuuri)
  const groves = [];
  let seed = 1;
  let terrainMesh = null;
  let chunks = [];
  let terrainShadow = false;
  const instSets = [];

  // ---------- põrkeobjektide ruumiline räsi ----------
  const CELL = 10;
  const cells = new Map();
  let stamp = 1;
  const ckey = (cx, cz) => (cx + 512) * 4096 + (cz + 512);
  function bboxOf(c) {
    if (c.t === 'c') return [c.x - c.r, c.z - c.r, c.x + c.r, c.z + c.r];
    if (c.t === 'b') return [c.x0, c.z0, c.x1, c.z1];
    return [Math.min(c.ax, c.bx) - c.r, Math.min(c.az, c.bz) - c.r, Math.max(c.ax, c.bx) + c.r, Math.max(c.az, c.bz) + c.r];
  }
  function addCol(c) {
    const bb = bboxOf(c);
    c._cells = [];
    c._st = 0;
    for (let cx = Math.floor(bb[0] / CELL); cx <= Math.floor(bb[2] / CELL); cx++)
      for (let cz = Math.floor(bb[1] / CELL); cz <= Math.floor(bb[3] / CELL); cz++) {
        const k = ckey(cx, cz);
        let arr = cells.get(k); if (!arr) { arr = []; cells.set(k, arr); }
        arr.push(c); c._cells.push(k);
      }
    return c;
  }
  function clearOre(o) {
    o.gone = true;
    if (o.col) { removeCol(o.col); o.col = null; }
    if (GFX.cam && Math.hypot(GFX.cam.pos.x - o.x, GFX.cam.pos.z - o.z) < 150 && typeof FX !== 'undefined') {
      for (let k = 0; k < 4; k++) FX.dust && FX.dust(o.x + (Math.random() - 0.5) * o.rad, o.y + 0.4, o.z + (Math.random() - 0.5) * o.rad, 6, 1.8);
      if (typeof UI !== 'undefined' && G.mode === 'play' && Math.hypot(Player.pos.x - o.x, Player.pos.z - o.z) < 40) UI.toast('The ore vein is exhausted');
    }
  }
  // tühjaks korjatud vrakk kaob: kokkupõrge maha, tolmupilv (kui lähedal)
  function clearWreck(w) {
    w.gone = true;
    if (w.col) { removeCol(w.col); w.col = null; }
    else for (const arr of cells.values()) for (let k = arr.length - 1; k >= 0; k--) { const c = arr[k]; if (c.kind === 'wreck' && Math.hypot(c.x - w.x, c.z - w.z) < 0.5) arr.splice(k, 1); }
    if (GFX.cam && Math.hypot(GFX.cam.pos.x - w.x, GFX.cam.pos.z - w.z) < 150 && typeof FX !== 'undefined') {
      for (let k = 0; k < 5; k++) FX.dust && FX.dust(w.x + (Math.random() - 0.5) * w.rad, w.y + 0.5, w.z + (Math.random() - 0.5) * w.rad, 6, 2.2);
      if (typeof UI !== 'undefined' && G.mode === 'play' && Math.hypot(Player.pos.x - w.x, Player.pos.z - w.z) < 40) UI.toast(w.name + ' is stripped bare and gone');
    }
  }
  function removeCol(c) {
    if (!c._cells) return;
    for (const k of c._cells) { const arr = cells.get(k); if (!arr) continue; const i = arr.indexOf(c); if (i >= 0) arr.splice(i, 1); }
    c._cells = null;
  }
  const qOut = [];
  function query(x0, z0, x1, z1) {
    stamp++; qOut.length = 0;
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++)
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const arr = cells.get(ckey(cx, cz)); if (!arr) continue;
        for (const c of arr) if (c._st !== stamp) { c._st = stamp; qOut.push(c); }
      }
    return qOut;
  }

  // ---------- kõrguskaart ----------
  function nearSiteMask(x, z) {
    let k = smoothstep(95, 155, Math.hypot(x - sites.base.x, z - sites.base.z));
    for (const r of sites.rivals) k *= smoothstep(80, 130, Math.hypot(x - r.x, z - r.z));
    k *= smoothstep(70, 115, Math.hypot(x - sites.nest.x, z - sites.nest.z));
    k *= smoothstep(260, 340, Math.hypot(x - sites.city.x, z - sites.city.z));
    return k;
  }
  function rawH(x, z) {
    let h = Noise.fbm(x * 0.0032, z * 0.0032, 4) * 9;
    const a = 0.55, ca = Math.cos(a), sa = Math.sin(a);
    const u = x * ca - z * sa, v = x * sa + z * ca;
    const warp = Noise.n2(u * 0.005, v * 0.005) * 2.5;
    const ridge = 1 - Math.abs(Math.sin(u * 0.026 + warp));
    const dune = Math.pow(ridge, 2.4) * (0.55 + 0.45 * Noise.n2(v * 0.008 + 7, u * 0.008));
    const duneMask = smoothstep(-0.25, 0.45, Noise.n2(x * 0.0035 + 50, z * 0.0035 - 20));
    h += dune * 7 * duneMask;
    const m = Noise.fbm(x * 0.0052 + 300, z * 0.0052 - 120, 3);
    let mesa = smoothstep(0.30, 0.37, m) + smoothstep(0.43, 0.47, m) * 0.45;
    mesa *= nearSiteMask(x, z);
    h += mesa * (15 + Noise.n2(x * 0.02, z * 0.02) * 1.2);
    const d = Math.max(Math.abs(x), Math.abs(z));
    const e = smoothstep(HALF * 0.8, HALF * 0.98, d);
    h += e * (62 + Noise.fbm(x * 0.012, z * 0.012, 3) * 30);
    return h;
  }
  function heightFn(x, z) {
    let h = rawH(x, z);
    const rb = Math.hypot(x - sites.base.x, z - sites.base.z);
    h = lerp(0, h, smoothstep(56, 100, rb));
    sites.rivals.forEach((r, i) => {
      const rc = Math.hypot(x - r.x, z - r.z);
      h = lerp(sites.campLevel[i], h, smoothstep(58, 95, rc));
    });
    const rn = Math.hypot(x - sites.nest.x, z - sites.nest.z);
    const nl = sites.nestLevel;
    h = lerp(nl, h, smoothstep(40, 85, rn));
    h += -6 * (1 - smoothstep(4, 40, rn)) + 3.2 * Math.exp(-Math.pow((rn - 45) / 7, 2));
    // vana koloonia linn: tasandatud ala
    const rcity = Math.hypot(x - sites.city.x, z - sites.city.z);
    h = lerp(sites.city.level, h, smoothstep(sites.city.r, sites.city.r + 90, rcity));
    for (const v of sites.villages || []) { const rv = Math.hypot(x - v.x, z - v.z); if (rv < v.r + 60) h = lerp(v.level, h, smoothstep(v.r, v.r + 60, rv)); }
    // tunnelikraav: mäe sisse lõigatud koridor (kaetakse tunneli ja kaanega)
    for (const T of sites.tunnels || []) {
      const dx = x - T.ax, dz = z - T.az, along = dx * T.ux + dz * T.uz, t = along / T.L;
      if (t < -0.15 || t > 1.15) continue;
      const lat = Math.abs(-dx * T.uz + dz * T.ux); if (lat > 12) continue;
      const fl = T.hA + (T.hB - T.hA) * clamp(t, 0, 1);
      if (h > fl) h = lerp(fl, h, smoothstep(7, 11.5, lat));
    }
    return h;
  }
  function heightAt(x, z) {
    const fx = (x + HALF) / STEP, fz = (z + HALF) / STEP;
    let i = Math.floor(fx), j = Math.floor(fz);
    if (i < 0) i = 0; if (j < 0) j = 0; if (i > RES - 1) i = RES - 1; if (j > RES - 1) j = RES - 1;
    const u = clamp(fx - i, 0, 1), w = clamp(fz - j, 0, 1);
    const h00 = H[j * N1 + i], h10 = H[j * N1 + i + 1], h01 = H[(j + 1) * N1 + i], h11 = H[(j + 1) * N1 + i + 1];
    if (w > u) return h00 + (h11 - h01) * u + (h01 - h00) * w;
    return h00 + (h10 - h00) * u + (h11 - h10) * w;
  }
  function normalAt(x, z, out) {
    const e = 1.2;
    const hx = heightAt(x + e, z) - heightAt(x - e, z), hz = heightAt(x, z + e) - heightAt(x, z - e);
    out = out || {};
    const l = Math.hypot(hx, 2 * e, hz);
    out.x = -hx / l; out.y = (2 * e) / l; out.z = -hz / l;
    return out;
  }
  function slopeAt(x, z) { return 1 - normalAt(x, z).y; }

  function terrainColor(x, z, h, ny, forMap) {
    const slope = 1 - ny;
    const n1 = Noise.n2(x * 0.02, z * 0.02), n2 = Noise.n2(x * 0.09 + 3, z * 0.09);
    let c = mixRgb([0.62, 0.32, 0.19], [0.50, 0.24, 0.14], clamp(0.5 + n1 * 0.6, 0, 1));
    c = mixRgb(c, [0.70, 0.40, 0.25], clamp(n2 * 0.5, 0, 0.35));
    // tumedad basaltlaigud
    c = mixRgb(c, [0.30, 0.17, 0.13], smoothstep(0.35, 0.7, Noise.n2(x * 0.011 - 9, z * 0.011 + 4)) * 0.6);
    const strata = 0.5 + 0.5 * Math.sin(h * 1.25 + n1 * 2.0);
    const rock = mixRgb([0.40, 0.19, 0.12], [0.52, 0.27, 0.17], strata);
    c = mixRgb(c, rock, smoothstep(0.10, 0.28, slope));
    c = mixRgb(c, mixRgb([0.22, 0.11, 0.09], [0.33, 0.17, 0.12], strata), smoothstep(0.32, 0.6, slope));
    if (h > 12 && slope < 0.15) c = mixRgb(c, [0.55, 0.30, 0.20], smoothstep(12, 16, h) * 0.6);
    const rb = Math.hypot(x, z);
    c = mixRgb([0.30, 0.20, 0.17], c, smoothstep(30, 62, rb));
    sites.rivals.forEach((r) => { const d = Math.hypot(x - r.x, z - r.z); c = mixRgb([0.42, 0.33, 0.27], c, smoothstep(18, 40, d)); });
    const rn = Math.hypot(x - sites.nest.x, z - sites.nest.z);
    if (!forMap) c = mixRgb([0.22, 0.15, 0.17], c, smoothstep(20, 50, rn));
    const d = Math.max(Math.abs(x), Math.abs(z));
    c = mixRgb(c, [0.40, 0.25, 0.19], smoothstep(HALF * 0.82, HALF * 0.96, d) * 0.6);
    // lagunenud teed: pragunenud asfalt, kohati liiva all
    for (const r of sites.roads || []) {
      if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
      if (Math.hypot(x - sites.city.x, z - sites.city.z) < sites.city.r + 20) continue;   // linnas on oma teed
      const t = clamp(((x - r.ax) * r.dx + (z - r.az) * r.dz) / r.L2, 0, 1), px = r.ax + r.dx * t, pz = r.az + r.dz * t;
      const dd = Math.hypot(x - px, z - pz) + Noise.n2(x * 0.15, z * 0.15) * 0.8;
      if (dd > 7) continue;
      const k = (1 - smoothstep(4.5, 7, dd)) * (1 - smoothstep(0.2, 0.6, Noise.n2(x * 0.012 + 40, z * 0.012 - 7)) * 0.6);
      const crack = Noise.n2(x * 0.6, z * 0.6) > 0.45 ? 0.6 : 1, line = Math.abs(dd) < 0.18 && Math.sin(t * r.L * 0.8) > 0 ? 1 : 0;
      c = mixRgb(c, line ? [0.55, 0.5, 0.36] : [0.2 * crack + 0.05, 0.19 * crack + 0.05, 0.19 * crack + 0.05], k);
    }
    // linn: tolmune plaatidega väljak, ringteed ja radiaalteed (lagunenud asfalt)
    const cd = Math.hypot(x - sites.city.x, z - sites.city.z);
    if (cd < sites.city.r + 120) {
      const k = 1 - smoothstep(sites.city.r - 10, sites.city.r + 30, cd);
      const ang = Math.atan2(z - sites.city.z, x - sites.city.x) - (sites.city.roadA || 0);
      const sec = TAU / 8, ra = ((ang % sec) + sec * 1.5) % sec - sec / 2;   // nurk lähima radiaaltee suhtes
      const dRad = Math.abs(Math.sin(ra) * cd);
      let dRing = 1e9; for (const rr of sites.city.rings || CITY_RINGS) dRing = Math.min(dRing, Math.abs(cd - rr));
      const road = (dRad < 4.5 && cd > 16 && cd < sites.city.r + 110) || (dRing < 4.5 && cd < sites.city.r);
      const sandOver = smoothstep(0.15, 0.65, Noise.n2(x * 0.03 + 11, z * 0.03 - 5));
      const crack = Noise.n2(x * 0.5, z * 0.5) > 0.42 ? 0.65 : 1;
      const tiles = ((Math.floor(x / 3) + Math.floor(z / 3)) & 1) ? 0.96 : 1.04;
      const base = road ? [0.21 * crack, 0.2 * crack, 0.2 * crack] : [0.47 * tiles, 0.44 * tiles, 0.41 * tiles];
      const kk = road ? (1 - smoothstep(sites.city.r + 60, sites.city.r + 110, cd)) : k;
      c = mixRgb(c, mixRgb(base, c, sandOver * (road ? 0.45 : 0.6)), kk);
    }
    return c;
  }

  const CITY_RINGS = [60, 100, 140, 176, 212];   // linna ringteede raadiused
  // ---- teede marsruut: A* jämedal võrgul (järsud nõlvad ja mägede tipud on kallid) ----
  const RG = 16;
  function routeAStar(a, b) {
    const pad = 360, x0 = Math.max(-HALF * 0.86, Math.min(a.x, b.x) - pad), z0 = Math.max(-HALF * 0.86, Math.min(a.z, b.z) - pad);
    const x1 = Math.min(HALF * 0.86, Math.max(a.x, b.x) + pad), z1 = Math.min(HALF * 0.86, Math.max(a.z, b.z) + pad);
    const W = Math.ceil((x1 - x0) / RG) + 1, Hh = Math.ceil((z1 - z0) / RG) + 1, n = W * Hh;
    const hh = new Float32Array(n); for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) hh[j * W + i] = heightFn(x0 + i * RG, z0 + j * RG);
    const ci = (x) => clamp(Math.round((x - x0) / RG), 0, W - 1), cj = (z) => clamp(Math.round((z - z0) / RG), 0, Hh - 1);
    const s0 = cj(a.z) * W + ci(a.x), g = cj(b.z) * W + ci(b.x), gi = g % W, gj = (g / W) | 0;
    const base = Math.min(hh[s0], hh[g]);
    const cost = new Float32Array(n).fill(1e30), prev = new Int32Array(n).fill(-1), closed = new Uint8Array(n);
    const heap = []; const push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    cost[s0] = 0; push(s0, 0);
    const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (heap.length) {
      const [, k] = pop(); if (closed[k]) continue; closed[k] = 1; if (k === g) break;
      const i = k % W, j = (k / W) | 0;
      for (const [di, dj] of D8) {
        const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= Hh) continue;
        const nk = nj * W + ni; if (closed[nk]) continue;
        const L = RG * (di && dj ? 1.414 : 1), sl = Math.abs(hh[nk] - hh[k]) / L, up = Math.max(0, hh[nk] - base - 5);
        const c = cost[k] + L * (1 + 30 * Math.max(0, sl - 0.12) + up * 0.6);
        if (c < cost[nk]) { cost[nk] = c; prev[nk] = k; push(nk, c + Math.hypot(ni - gi, nj - gj) * RG); }
      }
    }
    if (prev[g] < 0 && g !== s0) return null;
    const cells = []; for (let k = g; k >= 0; k = prev[k]) { cells.push({ x: x0 + (k % W) * RG, z: z0 + ((k / W) | 0) * RG }); if (k === s0) break; }
    cells.reverse(); cells[0] = { x: a.x, z: a.z }; cells[cells.length - 1] = { x: b.x, z: b.z };
    // lihtsustus: pikad sirged lõigud, kui sirgel pole järske kohti
    const lineOK = (p, q) => { const L = Math.hypot(q.x - p.x, q.z - p.z), n2 = Math.max(2, Math.ceil(L / 8)); let ph = heightFn(p.x, p.z); const top = Math.max(heightFn(p.x, p.z), heightFn(q.x, q.z)) + 3; for (let k = 1; k <= n2; k++) { const t = k / n2, h = heightFn(p.x + (q.x - p.x) * t, p.z + (q.z - p.z) * t); if (h > top || Math.abs(h - ph) / (L / n2) > 0.3) return false; ph = h; } return true; };
    const out = [cells[0]]; let i = 0;
    while (i < cells.length - 1) { let j = Math.min(cells.length - 1, i + 40); while (j > i + 1 && !lineOK(cells[i], cells[j])) j--; out.push(cells[j]); i = j; }
    let len = 0; for (let k = 1; k < out.length; k++) len += Math.hypot(out[k].x - out[k - 1].x, out[k].z - out[k - 1].z);
    return { pts: out, len };
  }
  // sirgel mägi (kõrgem kui otsad + 7 m): tagasta lõigu algus ja lõpp (t)
  function mesaRun(a, b) {
    const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(L / 6), base = Math.max(heightFn(a.x, a.z), heightFn(b.x, b.z)) + 7;
    let best = null, st = -1;
    for (let k = 0; k <= n; k++) { const t = k / n, hi = heightFn(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) > base; if (hi && st < 0) st = k; if ((!hi || k === n) && st >= 0) { const len = (k - st) * L / n; if (!best || len > best.len) best = { t0: st / n, t1: k / n, len }; st = -1; } }
    if (!best || best.len < 30 || best.len > 420 || best.t0 < 0.08 || best.t1 > 0.92) return null;
    return best;
  }
  function addRoad(a, b, forceTunnel) {
    const ls = Math.hypot(b.x - a.x, b.z - a.z), run = mesaRun(a, b);
    const r = forceTunnel ? null : routeAStar(a, b);
    if (run && sites.tunnels.length < 3 && (forceTunnel || !r || r.len > ls * 1.3)) {
      const ux = (b.x - a.x) / ls, uz = (b.z - a.z) / ls;
      const pa = { x: a.x + ux * (run.t0 * ls - 14), z: a.z + uz * (run.t0 * ls - 14) }, pb = { x: a.x + ux * (run.t1 * ls + 14), z: a.z + uz * (run.t1 * ls + 14) };
      const T = { ax: pa.x, az: pa.z, bx: pb.x, bz: pb.z, hA: heightFn(pa.x, pa.z), hB: heightFn(pb.x, pb.z), L: Math.hypot(pb.x - pa.x, pb.z - pa.z), ux, uz, id: sites.tunnels.length };
      sites.tunnels.push(T);
      sites.roads.push(roadSeg(a, pa)); const ts = roadSeg(pa, pb); ts.tunnel = T; sites.roads.push(ts); sites.roads.push(roadSeg(pb, b));
      return;
    }
    if (!r) { sites.roads.push(roadSeg(a, b)); return; }
    for (let k = 1; k < r.pts.length; k++) sites.roads.push(roadSeg(r.pts[k - 1], r.pts[k]));
  }
  // tunneli koridor: kas punkt on tunneli kraavis; tagastab põranda kõrguse ja lae (kaane) kõrguse
  function tunnelAt(x, z) {
    for (const T of sites.tunnels || []) {
      const dx = x - T.ax, dz = z - T.az, t = (dx * T.ux + dz * T.uz) / T.L;
      if (t < -0.02 || t > 1.02) continue;
      const lat = Math.abs(-dx * T.uz + dz * T.ux); if (lat > 10.5) continue;
      return { T, t: clamp(t, 0, 1), lat, floor: T.hA + (T.hB - T.hA) * clamp(t, 0, 1) };
    }
    return null;
  }
  // kaane peal kõndija (mäe peal tunneli kohal)
  function lidAt(x, z, y) {
    if (y === undefined || !sites.tunnels || !sites.tunnels.length) return -1e9;
    const q = tunnelAt(x, z); if (!q || q.t <= 0.02 || q.t >= 0.98 || !q.T.lid) return -1e9;
    const lh = q.T.lid[Math.min(q.T.lid.length - 1, Math.floor(q.t * q.T.lid.length))];
    return y > q.floor + 7.5 ? lh : -1e9;
  }
  function roadSeg(a, b) { const dx = b.x - a.x, dz = b.z - a.z; return { ax: a.x, az: a.z, dx, dz, L2: dx * dx + dz * dz || 1, L: Math.hypot(dx, dz), x0: Math.min(a.x, b.x) - 8, x1: Math.max(a.x, b.x) + 8, z0: Math.min(a.z, b.z) - 8, z1: Math.max(a.z, b.z) + 8 }; }
  function generate(s) {
    seed = s;
    Noise.seed(s);
    const rng = mulberry32(s * 7 + 3);
    const a0 = rng() * TAU;
    sites.rivals = [
      { x: Math.cos(a0) * 1180, z: Math.sin(a0) * 1180 },   // baasid üksteisest kaugemal
      { x: Math.cos(a0 + 2.2 + rng() * 0.35) * 1260, z: Math.sin(a0 + 2.2 + rng() * 0.35) * 1260 },
    ];
    // pesa: kahest laagrist võimalikult kaugel
    let best = null, bestScore = -1;
    for (let k = 0; k < 40; k++) {
      const a = rng() * TAU, r = 1300 + rng() * 300;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.max(Math.abs(x), Math.abs(z)) > HALF * 0.78) continue;
      const sc = Math.min(...sites.rivals.map((q) => Math.hypot(q.x - x, q.z - z)), Math.hypot(x, z) * 0.9);
      if (sc > bestScore) { bestScore = sc; best = { x, z }; }
    }
    sites.nest = best || { x: -200, z: 200 };
    // vana koloonia linn kaardi ühes servas: rivaalidest ja pesast võimalikult kaugel
    { let bc = null, bs = -1;
      for (let k = 0; k < 48; k++) {
        const a = k / 48 * TAU, x = Math.cos(a) * 1650, z = Math.sin(a) * 1650;
        if (Math.max(Math.abs(x), Math.abs(z)) > HALF * 0.74) continue;
        const sc = Math.min(...sites.rivals.map((q) => Math.hypot(q.x - x, q.z - z)), Math.hypot(sites.nest.x - x, sites.nest.z - z) * 0.8);
        if (sc > bs) { bs = sc; bc = { x, z }; }
      }
      sites.city = Object.assign({ level: 0, r: 230, rings: CITY_RINGS }, bc || { x: 1600, z: 0 }); }
    sites.city.roadA = 0;
    // väikesed mahajäetud asulad (2–4 maja) ja lagunenud teed nende vahel
    sites.villages = [];
    for (let t = 0; t < 400 && sites.villages.length < 8; t++) {
      const a = rng() * TAU, r = 380 + rng() * 1250, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.max(Math.abs(x), Math.abs(z)) > HALF * 0.74) continue;
      if (Math.hypot(x, z) < 300 || sites.rivals.some((q) => Math.hypot(q.x - x, q.z - z) < 260) || Math.hypot(sites.nest.x - x, sites.nest.z - z) < 300 || Math.hypot(sites.city.x - x, sites.city.z - z) < 420) continue;
      if (sites.villages.some((v) => Math.hypot(v.x - x, v.z - z) < 380)) continue;
      sites.villages.push({ x, z, level: 0, r: 34 });
    }
    sites.campLevel = [0, 0];
    sites.nestLevel = 0;
    sites.campLevel = sites.rivals.map((r) => rawH(r.x, r.z));
    sites.nestLevel = rawH(sites.nest.x, sites.nest.z) * 0.5;
    sites.city.level = rawH(sites.city.x, sites.city.z) * 0.4;
    for (const v of sites.villages) v.level = rawH(v.x, v.z) * 0.6;
    sites.tunnels = [];
    sites.roads = [];
    { const nodes = [sites.city, ...sites.villages], done = [nodes[0]], rest = nodes.slice(1);
      sites.tunnels = [];
      const edges = [];
      while (rest.length) { let best = null; for (const a of done) for (const b of rest) { const d = Math.hypot(a.x - b.x, a.z - b.z); if (!best || d < best.d) best = { a, b, d }; } done.push(best.b); rest.splice(rest.indexOf(best.b), 1); edges.push([best.a, best.b]); }
      // teed ei lähe üle kaljude: tiiruga ümber (A*) või tunneliga läbi mäe
      for (const [a, b] of edges) addRoad(a, b, false);
      if (!sites.tunnels.length) {   // vähemalt üks tunnel: otsi asulapaar, mille vahel on mägi
        const all = [sites.city, ...sites.villages], pairs = [];
        for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const d = Math.hypot(all[i].x - all[j].x, all[i].z - all[j].z); if (d < 1000) pairs.push([all[i], all[j], d]); }
        pairs.sort((p, q) => p[2] - q[2]);
        for (const [a, b] of pairs) { if (sites.tunnels.length) break; if (mesaRun(a, b)) addRoad(a, b, true); }
      }
      // vana maantee linnast kaardi serva poole
      const ca = Math.atan2(sites.city.z, sites.city.x); { const ex = sites.city.x + Math.cos(ca + 0.4) * 600, ez = sites.city.z + Math.sin(ca + 0.4) * 600, k = Math.min(1, HALF * 0.8 / Math.max(Math.abs(ex), Math.abs(ez))); addRoad(sites.city, { x: ex * k, z: ez * k }, false); }
      const r0 = sites.roads[0]; if (r0) sites.city.roadA = Math.atan2(r0.dz, r0.dx); }   // linna radiaalteed joondatakse esimese maanteega (värav tee otsas)
    for (let j = 0; j < N1; j++) for (let i = 0; i < N1; i++) H[j * N1 + i] = heightFn(-HALF + i * STEP, -HALF + j * STEP);
    for (const T of sites.tunnels || []) { T.lid = []; for (let k = 0; k < Math.ceil(T.L / 8); k++) { const t = (k + 0.5) / Math.ceil(T.L / 8), x = T.ax + T.ux * t * T.L, z = T.az + T.uz * t * T.L; T.lid.push(Math.max(T.hA + (T.hB - T.hA) * t + 7.5, rawH(x - T.uz * 13, z + T.ux * 13), rawH(x + T.uz * 13, z - T.ux * 13)) + 0.2); } }
    buildTerrainMesh();
    scatter(rng);
    if (typeof City !== 'undefined') City.build(mulberry32(s * 13 + 7));
    if (typeof Tunnels !== 'undefined') Tunnels.build(mulberry32(s * 17 + 3));
  }

  let tPos = null, tNor = null, tCol = null;
  function recomputeNormal(i, j) {
    const k = j * N1 + i;
    const hl = H[j * N1 + Math.max(0, i - 1)], hr = H[j * N1 + Math.min(RES, i + 1)];
    const hd = H[Math.max(0, j - 1) * N1 + i], hu = H[Math.min(RES, j + 1) * N1 + i];
    let nx = hl - hr, ny = 2 * STEP, nz = hd - hu; const l = Math.hypot(nx, ny, nz);
    tNor[k * 3] = nx / l; tNor[k * 3 + 1] = ny / l; tNor[k * 3 + 2] = nz / l;
  }
  // komeedikraater: süvend + serv + kõrbenud pinnas
  function deformCrater(x, z, r, depth) {
    if (!tPos) return;
    const i0 = clamp(Math.floor((x - r * 1.6 + HALF) / STEP), 1, RES - 1), i1 = clamp(Math.ceil((x + r * 1.6 + HALF) / STEP), 1, RES - 1);
    const j0 = clamp(Math.floor((z - r * 1.6 + HALF) / STEP), 1, RES - 1), j1 = clamp(Math.ceil((z + r * 1.6 + HALF) / STEP), 1, RES - 1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = j * N1 + i, vx = -HALF + i * STEP, vz = -HALF + j * STEP, d = Math.hypot(vx - x, vz - z);
      const bowl = -depth * Math.pow(1 - smoothstep(0, r, d), 1.4);
      const rim = depth * 0.45 * Math.exp(-Math.pow((d - r * 0.95) / (r * 0.3), 2));
      H[k] += bowl + rim;
      tPos[k * 3 + 1] = H[k];
      const sc = 1 - smoothstep(r * 0.3, r * 1.45, d);
      tCol[k * 4] = tCol[k * 4] * (1 - 0.62 * sc) + 22 * sc;
      tCol[k * 4 + 1] = tCol[k * 4 + 1] * (1 - 0.66 * sc) + 14 * sc;
      tCol[k * 4 + 2] = tCol[k * 4 + 2] * (1 - 0.58 * sc) + 26 * sc;
    }
    for (let j = j0 - 1; j <= j1 + 1; j++) for (let i = i0 - 1; i <= i1 + 1; i++) recomputeNormal(clamp(i, 0, RES), clamp(j, 0, RES));
    rebuildChunksAround(x, z, r * 1.7);
  }
  function buildTerrainMesh() {
    const pos = new Float32Array(N1 * N1 * 3), nor = new Float32Array(N1 * N1 * 3), col = new Uint8Array(N1 * N1 * 4);
    tPos = pos; tNor = nor; tCol = col;
    for (let j = 0; j < N1; j++) for (let i = 0; i < N1; i++) {
      const k = j * N1 + i, x = -HALF + i * STEP, z = -HALF + j * STEP, h = H[k];
      pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      const hl = H[j * N1 + Math.max(0, i - 1)], hr = H[j * N1 + Math.min(RES, i + 1)];
      const hd = H[Math.max(0, j - 1) * N1 + i], hu = H[Math.min(RES, j + 1) * N1 + i];
      let nx = hl - hr, ny = 2 * STEP, nz = hd - hu; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      nor[k * 3] = nx; nor[k * 3 + 1] = ny; nor[k * 3 + 2] = nz;
      const c = terrainColor(x, z, h, ny);
      col[k * 4] = c[0] * 255; col[k * 4 + 1] = c[1] * 255; col[k * 4 + 2] = c[2] * 255; col[k * 4 + 3] = MAT.SAND;
      // kaardi värv (varjutusega); Kivisüdame kraater jääb kaardil peidetuks
      const rnest = Math.hypot(x - sites.nest.x, z - sites.nest.z);
      const cm = rnest < 80 ? terrainColor(x, z, h, ny, true) : c;
      let shade = clamp(0.75 + (nx * -0.6 + nz * -0.4) * 1.6 + (ny - 0.9) * 0.6, 0.35, 1.25);
      shade = lerp(0.98, shade, smoothstep(35, 80, rnest));
      mapRGB[k * 3] = clamp(cm[0] * 255 * shade, 0, 255); mapRGB[k * 3 + 1] = clamp(cm[1] * 255 * shade, 0, 255); mapRGB[k * 3 + 2] = clamp(cm[2] * 255 * shade, 0, 255);
    }
    buildChunks();
  }
  // maastik tükkideks: ainult nähtavad tükid joonistatakse, varjukaardile ainult lähedased
  function chunkMesh(ci, cj) {
    const n = CHK + 1, i0 = ci * CHK, j0 = cj * CHK;
    const pos = new Float32Array(n * n * 3), nor = new Float32Array(n * n * 3), col = new Uint8Array(n * n * 4);
    for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
      const k = (j0 + b) * N1 + (i0 + a), o = b * n + a;
      pos.set(tPos.subarray(k * 3, k * 3 + 3), o * 3); nor.set(tNor.subarray(k * 3, k * 3 + 3), o * 3); col.set(tCol.subarray(k * 4, k * 4 + 4), o * 4);
    }
    const idx = new Uint16Array(CHK * CHK * 6); let q = 0;
    for (let b = 0; b < CHK; b++) for (let a = 0; a < CHK; a++) {
      const v = b * n + a; idx[q++] = v; idx[q++] = v + n; idx[q++] = v + n + 1; idx[q++] = v; idx[q++] = v + n + 1; idx[q++] = v + 1;
    }
    return new GFX.Mesh({ pos, nor, col, idx });
  }
  function buildChunks() {
    for (const c of chunks) c.mesh.dispose();
    chunks = [];
    for (let cj = 0; cj < NCH; cj++) for (let ci = 0; ci < NCH; ci++) chunks.push({ ci, cj, mesh: chunkMesh(ci, cj) });
    terrainMesh = chunks.length ? chunks[0].mesh : null;
  }
  function rebuildChunksAround(x, z, r) {
    for (const c of chunks) {
      const x0 = -HALF + c.ci * CHK * STEP, z0 = -HALF + c.cj * CHK * STEP, x1 = x0 + CHK * STEP, z1 = z0 + CHK * STEP;
      if (x + r < x0 - STEP || x - r > x1 + STEP || z + r < z0 - STEP || z - r > z1 + STEP) continue;
      c.mesh.dispose(); c.mesh = chunkMesh(c.ci, c.cj);
    }
  }
  const IDENT = M4.create();
  function drawTerrain() {
    const cp = GFX.cam.pos;
    for (const c of chunks) {
      const m = c.mesh;
      if (Math.hypot(m.cx - cp.x, m.cz - cp.z) - m.rad > 1250 * Math.max(0.4, GFX.S.viewMul || 1)) continue;
      GFX.draw(m, IDENT, null, null, { rust: 0, shadow: terrainShadow });
    }
  }

  function okSpot(x, z, rBase = 64) {
    if (Math.max(Math.abs(x), Math.abs(z)) > HALF - 25) return false;
    if (Math.hypot(x, z) < rBase) return false;
    for (const r of sites.rivals) if (Math.hypot(x - r.x, z - r.z) < 64) return false;
    if (Math.hypot(x - sites.nest.x, z - sites.nest.z) < 50) return false;
    if (Math.hypot(x - sites.city.x, z - sites.city.z) < sites.city.r + 40) return false;
    for (const v of sites.villages || []) if (Math.hypot(x - v.x, z - v.z) < v.r + 25) return false;
    for (const T of sites.tunnels || []) { const dx = x - T.ax, dz = z - T.az, t = (dx * T.ux + dz * T.uz) / T.L; if (t > -0.25 && t < 1.25 && Math.abs(-dx * T.uz + dz * T.ux) < 22) return false; }
    return true;
  }

  function scatter(rng) {
    for (const s of instSets) GFX.removeInstSet(s);
    instSets.length = 0;
    wrecks.length = 0; groves.length = 0; ores.length = 0;
    for (const arr of cells.values()) arr.length = 0;
    cells.clear();
    const CH = 200, NC = Math.ceil(SIZE / CH);
    const sets = new Map();
    const getSet = (mesh, x, z, viewDist, shadow = true, max = 400) => {
      const cx = clamp(Math.floor((x + HALF) / CH), 0, NC - 1), cz = clamp(Math.floor((z + HALF) / CH), 0, NC - 1);
      const key = mesh.__id + ':' + cx + ':' + cz;
      let s = sets.get(key);
      if (!s) { s = GFX.addInstSet(new GFX.InstSet(mesh, max)); s.viewDist = viewDist; s.castShadow = shadow; s.rust = 0; sets.set(key, s); instSets.push(s); }
      return s;
    };
    let mid = 1; const tagMesh = (m) => { if (!m.__id) m.__id = mid++; return m; };
    MODELS.rocks.forEach(tagMesh); if (MODELS.rocksLo) MODELS.rocksLo.forEach(tagMesh); tagMesh(MODELS.spire); tagMesh(MODELS.candle); tagMesh(MODELS.shrub);
    const m = M4.create();
    // rahnud
    let placed = 0, tries = 0;
    while (placed < 1700 && tries < 30000) {
      tries++;
      const x = (rng() * 2 - 1) * (HALF - 20), z = (rng() * 2 - 1) * (HALF - 20);
      if (!okSpot(x, z)) continue;
      const sl = slopeAt(x, z);
      if (rng() > 0.25 + sl * 3) continue;
      const r = 0.7 + Math.pow(rng(), 2.2) * 3.6;
      const y = heightAt(x, z) - r * 0.25;
      M4.compose(m, x, y, z, rng() * TAU, (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.3, r, r * (0.6 + rng() * 0.5), r);
      const k = Math.floor(rng() * 4);
      const sh = 0.85 + rng() * 0.3;
      getSet(MODELS.rocks[k], x, z, 420).add(m, sh, sh * (0.95 + rng() * 0.1), sh);
      if (r > 1.0) addCol({ t: 'c', x, z, r: r * 0.85, y0: y - 2, y1: y + r * 1.2, kind: 'rock' });
      placed++;
    }
    // kivikesed
    for (let i = 0; i < 12000; i++) {
      const x = (rng() * 2 - 1) * (HALF - 20), z = (rng() * 2 - 1) * (HALF - 20);
      if (!okSpot(x, z, 30)) continue;
      const r = 0.15 + rng() * 0.45;
      M4.compose(m, x, heightAt(x, z) - r * 0.2, z, rng() * TAU, 0, 0, r, r * 0.7, r);
      getSet((MODELS.rocksLo || MODELS.rocks)[i % 4], x, z, 130, false).add(m, 1, 1, 1);
    }
    // kaljutornid
    for (let i = 0; i < 420; i++) {
      let x, z, ok = false;
      for (let t = 0; t < 60 && !ok; t++) {
        x = (rng() * 2 - 1) * (HALF - 40); z = (rng() * 2 - 1) * (HALF - 40);
        ok = okSpot(x, z, 90) && slopeAt(x, z) < 0.25;
      }
      if (!ok) continue;
      const s = 1.0 + rng() * 1.3;
      if (MODELS.formations) {
        const fs = s * 3.2, fm = MODELS.formations[Math.floor(rng() * 4)]; tagMesh(fm);
        M4.compose(m, x, heightAt(x, z) - 0.6, z, rng() * TAU, 0, 0, fs, fs * (1.25 + rng() * 0.7), fs);
        getSet(fm, x, z, 700).add(m, 1, 1, 1);
        addCol({ t: 'c', x, z, r: 2.6 * s, y0: -50, y1: 200, kind: 'rock' });
      } else {
        M4.compose(m, x, heightAt(x, z) - 0.5, z, rng() * TAU, 0, 0, s, s * (0.8 + rng() * 0.6), s);
        getSet(MODELS.spire, x, z, 700).add(m, 1, 1, 1);
        addCol({ t: 'c', x, z, r: 1.3 * s, y0: -50, y1: 200, kind: 'rock' });
      }
    }
    // kraatri ümber tornid
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + rng() * 0.3, r = 50 + rng() * 8;
      const x = sites.nest.x + Math.cos(a) * r, z = sites.nest.z + Math.sin(a) * r;
      const s = 1.2 + rng() * 1.2;
      M4.compose(m, x, heightAt(x, z) - 0.5, z, rng() * TAU, 0, 0, s, s * (1.0 + rng() * 0.8), s);
      getSet(MODELS.spire, x, z, 700).add(m, 0.8, 0.75, 0.8);
      addCol({ t: 'c', x, z, r: 1.3 * s, y0: -50, y1: 200, kind: 'rock' });
    }
    // salud (kitsede karjamaad)
    for (let g = 0; g < 120; g++) {
      let x, z, ok = false;
      for (let t = 0; t < 80 && !ok; t++) {
        const a = rng() * TAU, r = 90 + rng() * (HALF - 160);
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        ok = okSpot(x, z, 85) && slopeAt(x, z) < 0.12;
      }
      if (!ok) continue;
      groves.push({ x, z });
      const n = 6 + Math.floor(rng() * 9);
      for (let i = 0; i < n; i++) {
        const px = x + (rng() - 0.5) * 30, pz = z + (rng() - 0.5) * 30;
        const s = 0.7 + rng() * 0.8;
        M4.compose(m, px, heightAt(px, pz) - 0.1, pz, rng() * TAU, 0, 0, s, s, s);
        getSet(MODELS.candle, px, pz, 320).add(m, 1, 1, 1, rng() * 0.2);
      }
    }
    // põõsad
    for (let i = 0; i < 7000; i++) {
      const x = (rng() * 2 - 1) * (HALF - 20), z = (rng() * 2 - 1) * (HALF - 20);
      if (!okSpot(x, z, 50)) continue;
      const s = 0.6 + rng() * 1.0;
      M4.compose(m, x, heightAt(x, z) - 0.05, z, rng() * TAU, 0, 0, s, s, s);
      getSet(MODELS.shrub, x, z, 160, false).add(m, 1, 1, 1);
    }
    // roidekorvid
    sites.ribs = [];
    for (let i = 0; i < 22; i++) {
      let x, z, ok = false;
      for (let t = 0; t < 80 && !ok; t++) {
        const a = rng() * TAU, r = 130 + rng() * (HALF - 250);
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        ok = okSpot(x, z, 120) && slopeAt(x, z) < 0.1;
      }
      if (!ok) continue;
      const yaw = rng() * TAU;
      sites.ribs.push({ x, z, yaw, y: heightAt(x, z) - 0.8, m: M4.compose(M4.create(), x, heightAt(x, z) - 0.8, z, yaw, 0, (rng() - 0.5) * 0.2) });
      const fx = Math.sin(yaw) * 9.5, fz = Math.cos(yaw) * 9.5;
      addCol({ t: 'c', x: x + fx, z: z + fz, r: 2.0, y0: -50, y1: 200, kind: 'rock' });
      addCol({ t: 's', ax: x - Math.sin(yaw) * 9, az: z - Math.cos(yaw) * 9, bx: x + Math.sin(yaw) * 8, bz: z + Math.cos(yaw) * 8, r: 0.5, y0: -50, y1: 2.0, kind: 'rock' });
    }
    // vrakid
    const wreckNames = ['Rusty cargo truck', 'Crashed lander', 'Abandoned warehouse', 'Base module buried in sand', 'Spaceship wreck'];
    for (let i = 0; i < 200; i++) {
      let x, z, ok = false;
      for (let t = 0; t < 80 && !ok; t++) {
        const a = rng() * TAU, r = i < 4 ? 75 + rng() * 45 : 90 + rng() * (HALF - 160);
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        ok = okSpot(x, z, 70) && slopeAt(x, z) < 0.2 && !wrecks.some((w) => Math.hypot(w.x - x, w.z - z) < 30);
      }
      if (!ok) continue;
      const type = i < 4 ? i % 4 : ((i === 6 || i === 31 || i === 57) && MODELS.wrecks[4]) ? 4 : Math.floor(rng() * 4);
      const yaw = rng() * TAU;
      const y = heightAt(x, z) - (type === 3 ? 1.0 : type === 4 ? 1.6 : 0.25);
      const mm = M4.compose(M4.create(), x, y, z, yaw, (rng() - 0.5) * 0.25, (rng() - 0.5) * 0.25);
      const rad = [2.9, 2.7, 3.0, 3.0, 6.5][type];
      wrecks.push({ id: i, x, z, y, yaw, type, m: mm, rad, scrap: type === 4 ? 120 : 18 + Math.floor(rng() * 28), name: wreckNames[type], known: i < 4 });
      wrecks[wrecks.length - 1].col = addCol({ t: 'c', x, z, r: rad * 0.8, y0: y - 3, y1: y + 4, kind: 'wreck' }) || null;
    }
    // rauamaagi kivid: eraldi juhuarvudega (ülejäänud maailm ei muutu)
    let os = (seed * 7919 + 1013) >>> 0;
    const orng = () => { os = (Math.imul(os ^ (os >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0; os ^= os >>> 12; return (os >>> 0) / 4294967296; };
    for (let i = 0; i < 30; i++) {
      let x, z, ok = false;
      for (let t = 0; t < 60 && !ok; t++) {
        const a = orng() * TAU, r = i < 3 ? 70 + orng() * 50 : 110 + orng() * (HALF - 220);
        x = Math.cos(a) * r; z = Math.sin(a) * r;
        ok = okSpot(x, z, 60) && slopeAt(x, z) < 0.25 && !wrecks.some((w) => Math.hypot(w.x - x, w.z - z) < 22) && !ores.some((w) => Math.hypot(w.x - x, w.z - z) < 40);
      }
      if (!ok) continue;
      const yaw = orng() * TAU, type = orng() < 0.55 ? 0 : 1, y = heightAt(x, z) - 0.15, sc = 0.9 + orng() * 0.5;
      const o = { id: i, x, z, y, yaw, type, sc, rad: 1.5 * sc, amount: 40 + Math.floor(orng() * 35), name: 'Iron ore rock', known: false,
        m: M4.compose(M4.create(), x, y, z, yaw, 0, 0, sc, sc, sc) };
      o.col = addCol({ t: 'c', x, z, r: 1.15 * sc, y0: y - 2, y1: y + 2.2 * sc, kind: 'rock' });
      ores.push(o);
    }
    for (const s of instSets) s.computeBounds();
    // baasi kõrval: vana maandumisplats ja roostes veok
    sites.decor = [];
    if (MODELS.base_pad) {
      const px = 50, pz = -8, tx = 47, tz = 14;
      sites.decor.push({ mesh: MODELS.base_pad, m: M4.compose(M4.create(), px, heightAt(px, pz) - 0.2, pz, 0.3) });
      addCol({ t: 'c', x: px, z: pz, r: 2.9, y0: -5, y1: 1.4, kind: 'struct' });
      sites.decor.push({ mesh: MODELS.base_truck, m: M4.compose(M4.create(), tx, heightAt(tx, tz), tz, 2.2, 0, 0.04) });
      addCol({ t: 'c', x: tx, z: tz, r: 2.0, y0: -5, y1: 3, kind: 'wreck' });
      const props = [['scifi_crate', 46, -12.5, 0.2], ['scifi_crate', 47.4, -13.2, 0.9], ['scifi_crate', 46.6, -11.0, 1.7], ['barrel', 44.2, 11.5, 0], ['barrel', 45.1, 10.6, 1], ['barrel', 43.6, 10.2, 2]];
      for (const [k, x, z, yaw] of props) if (MODELS[k]) { sites.decor.push({ mesh: MODELS[k], m: M4.compose(M4.create(), x, heightAt(x, z), z, yaw) }); addCol({ t: 'c', x, z, r: 0.6, y0: -5, y1: 1.5, kind: 'struct' }); }
    }
  }

  // ---------- liikumine ja põrked ----------
  // p: {x,z} muudetakse; tagastab true kui põrkus
  function collideCircle(p, r, y0, y1, ignoreDoors) {
    const list = query(p.x - r - 0.5, p.z - r - 0.5, p.x + r + 0.5, p.z + r + 0.5);
    let hit = false;
    for (let it = 0; it < 3; it++) {
      for (const c of list) {
        if (c.y1 < y0 || c.y0 > y1 || c.off) continue;
        if (ignoreDoors && c.door && (ignoreDoors === true || !c.blocks || !c.blocks(ignoreDoors))) continue;   // lukus uks peatab võõra
        if (c.t === 'c') {
          const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = r + c.r;
          if (d < m) { const k = d > 0.0001 ? (m - d) / d : 0; p.x += dx * k + (d > 0.0001 ? 0 : m); p.z += dz * k; hit = true; }
        } else if (c.t === 'b') {
          const qx = clamp(p.x, c.x0, c.x1), qz = clamp(p.z, c.z0, c.z1);
          const dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz);
          if (d < r) {
            if (d > 0.0001) { p.x += (dx / d) * (r - d); p.z += (dz / d) * (r - d); }
            else {
              const l = p.x - c.x0, rr = c.x1 - p.x, t = p.z - c.z0, bb = c.z1 - p.z;
              const mn = Math.min(l, rr, t, bb);
              if (mn === l) p.x = c.x0 - r; else if (mn === rr) p.x = c.x1 + r; else if (mn === t) p.z = c.z0 - r; else p.z = c.z1 + r;
            }
            hit = true;
          }
        } else {
          const ex = c.bx - c.ax, ez = c.bz - c.az, ll = ex * ex + ez * ez;
          let t = ll > 0 ? ((p.x - c.ax) * ex + (p.z - c.az) * ez) / ll : 0; t = clamp(t, 0, 1);
          const qx = c.ax + ex * t, qz = c.az + ez * t, dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz), m = r + c.r;
          if (d < m) {
            if (d > 0.0001) { p.x += (dx / d) * (m - d); p.z += (dz / d) * (m - d); }
            else { p.x += -ez / Math.sqrt(ll) * m; p.z += ex / Math.sqrt(ll) * m; }
            hit = true;
          }
        }
      }
    }
    return hit;
  }

  // kiir vs staatilised objektid. Tagastab {t, col} või null
  function raycastCols(ox, oy, oz, dx, dy, dz, maxT, filter) {
    // kogume rakud kiirt mööda
    const steps = Math.ceil(maxT / (CELL * 0.5));
    stamp++;
    const cand = [];
    for (let s = 0; s <= steps; s++) {
      const t = Math.min(maxT, s * CELL * 0.5);
      const x = ox + dx * t, z = oz + dz * t;
      const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const arr = cells.get(ckey(cx + a, cz + b)); if (!arr) continue;
        for (const c of arr) if (c._st !== stamp) { c._st = stamp; cand.push(c); }
      }
    }
    let best = maxT, bc = null;
    for (const c of cand) {
      if (c.off || (c.noRay && !(c.door && c.hurt && filter && filter.hitDoors))) continue;
      if (filter && !filter(c)) continue;
      let t = -1;
      if (c.t === 'c') {
        const fx = ox - c.x, fz = oz - c.z;
        const a = dx * dx + dz * dz; if (a < 1e-8) continue;
        const b = 2 * (fx * dx + fz * dz), cc = fx * fx + fz * fz - c.r * c.r;
        const disc = b * b - 4 * a * cc; if (disc < 0) continue;
        const sq = Math.sqrt(disc);
        let t0 = (-b - sq) / (2 * a);
        if (t0 < 0) t0 = (-b + sq) / (2 * a);
        if (t0 < 0) continue;
        const y = oy + dy * t0; if (y < c.y0 || y > c.y1) continue;
        t = t0;
      } else if (c.t === 'b') {
        t = slab3(ox, oy, oz, dx, dy, dz, c.x0, c.y0, c.z0, c.x1, c.y1, c.z1);
      } else {
        // segment kui pööratud kast
        const ex = c.bx - c.ax, ez = c.bz - c.az, L = Math.hypot(ex, ez); if (L < 1e-5) continue;
        const ux = ex / L, uz = ez / L;
        const mx = (c.ax + c.bx) / 2, mz = (c.az + c.bz) / 2;
        const lox = (ox - mx) * ux + (oz - mz) * uz, loz = -(ox - mx) * uz + (oz - mz) * ux;
        const ldx = dx * ux + dz * uz, ldz = -dx * uz + dz * ux;
        t = slab3(lox, oy, loz, ldx, dy, ldz, -L / 2 - c.r, c.y0, -c.r, L / 2 + c.r, c.y1, c.r);
      }
      if (t >= 0 && t < best) { best = t; bc = c; }
    }
    return bc ? { t: best, col: bc } : null;
  }
  function slab3(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
    let tmin = -1e9, tmax = 1e9;
    const ax = [[ox, dx, x0, x1], [oy, dy, y0, y1], [oz, dz, z0, z1]];
    for (const [o, d, a, b] of ax) {
      if (Math.abs(d) < 1e-9) { if (o < a || o > b) return -1; continue; }
      let t1 = (a - o) / d, t2 = (b - o) / d;
      if (t1 > t2) { const q = t1; t1 = t2; t2 = q; }
      if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return -1;
    }
    if (tmax < 0) return -1;
    return tmin >= 0 ? tmin : 0;
  }
  function raycastTerrain(ox, oy, oz, dx, dy, dz, maxT) {
    let a = oy - heightAt(ox, oz);
    if (a < 0) return 0;
    let t = 0, prev = 0;
    while (t < maxT) {
      const step = clamp(a * 0.6, 0.4, 5);
      t = Math.min(maxT, t + step);
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      a = y - heightAt(x, z);
      if (a < 0) {
        let lo = prev, hi = t;
        for (let k = 0; k < 8; k++) {
          const mid = (lo + hi) / 2;
          if (oy + dy * mid - heightAt(ox + dx * mid, oz + dz * mid) < 0) hi = mid; else lo = mid;
        }
        return hi;
      }
      prev = t;
      if (t >= maxT) break;
    }
    return -1;
  }
  // nägemisjoon kahe punkti vahel (maastik + objektid)
  function lineOfSight(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.hypot(dx, dy, dz);
    if (L < 0.01) return true;
    const ux = dx / L, uy = dy / L, uz = dz / L;
    const tt = raycastTerrain(ax, ay, az, ux, uy, uz, L - 0.3);
    if (tt >= 0) return false;
    const hc = raycastCols(ax, ay, az, ux, uy, uz, L - 0.3, (c) => c.kind !== 'obj');
    return !hc;
  }

  function draw() {
    drawTerrain();
    const cx = GFX.cam.pos.x, cz = GFX.cam.pos.z, WL = MODELS.wrecksLo;
    for (const w of wrecks) {
      if (w.scrap <= 0) { if (!w.gone) clearWreck(w); continue; }
      if (w.type < 0) { if (w.mesh) GFX.draw(w.mesh, w.m, null, null, { rust: 1.0 }); continue; }
      GFX.draw(WL && Math.hypot(w.x - cx, w.z - cz) > 70 + w.rad * 6 ? WL[w.type] : MODELS.wrecks[w.type], w.m, null, null, { rust: 1.2 });
    }
    if (MODELS.oreRocks) for (const o of ores) {
      if (o.amount <= 0) { if (!o.gone) clearOre(o); continue; }
      const far = Math.hypot(o.x - cx, o.z - cz) > 60 && MODELS.oreRocksLo;
      GFX.draw((far ? MODELS.oreRocksLo : MODELS.oreRocks)[o.type], o.m, null, null, { rust: 1.0 });
    }
    for (const r of sites.ribs) GFX.draw(MODELS.ribcage, r.m, null, null, { rust: 0 });
    for (const d of sites.decor || []) GFX.draw(d.mesh, d.m, null, null, { rust: 1.1 });
    if (typeof City !== 'undefined') City.draw();
    if (typeof Tunnels !== 'undefined') Tunnels.draw();
  }

  return {
    HALF, SIZE, RES, STEP, N1, H, mapRGB, sites, wrecks, ores, groves, instSets,
    generate, heightAt, normalAt, tunnelAt, lidAt, slopeAt, addCol, removeCol, clearWreck, clearOre, query, collideCircle, deformCrater,
    raycastCols, raycastTerrain, lineOfSight, draw, okSpot,
    get terrainMesh() { return null; }, setTerrainShadow(v) { terrainShadow = v; },
  };
})();
