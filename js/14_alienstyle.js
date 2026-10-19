// ============================================================
//  TULNUKATE ÜHTNE STIIL (Kivisüdame pesakond): tumelilla kitiin, heledamad plaadid,
//  happerohelised helendavad organid, merevaigukarva silmad, luuvärvi ogad.
// ============================================================
const AS = { CH: [0.2, 0.17, 0.24], CH2: [0.32, 0.27, 0.36], PLATE: [0.4, 0.34, 0.42], BELLY: [0.46, 0.42, 0.36], GLOW: [0.55, 1.0, 0.2], EYE: [1.0, 0.85, 0.25], BONE: [0.85, 0.8, 0.66], MOUTH: [0.45, 0.1, 0.14], MEM: [0.38, 0.24, 0.34] };
// ---------- orgaaniliste vormide abifunktsioonid (siledad normaalid) ----------
const Org = (() => {
  const v3 = (a, b, c) => [a, b, c];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // nelinurk õige keerdumisega (väljapoole normaali järgi)
  function oq(b, A, B, C, D, nA, nB, nC, nD) {
    const g = cross(sub(B, A), sub(C, A)), o = [nA[0] + nC[0], nA[1] + nC[1], nA[2] + nC[2]];
    if (dot(g, o) >= 0) b.quad(A, B, C, D, null, nA, nB, nC, nD); else b.quad(A, D, C, B, null, nA, nD, nC, nB);
  }
  function ot(b, A, B, C, out) { const g = cross(sub(B, A), sub(C, A)); if (dot(g, out) >= 0) b.tri(A, B, C, null, out, out, out); else b.tri(A, C, B, null, out, out, out); }
  const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
  // sile 3D-müra pinna konarlikkuseks
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const f = (t) => t * t * (3 - 2 * t), u = f(xf), v = f(yf), w = f(zf);
    let r = 0;
    for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) r += hash(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    return r * 2 - 1;
  }
  // toru mööda punkte [x,y,z,r]: kõverad jäsemed, kaelad, sabad, kombitsad, küünised
  function tube(b, pts, seg = 10, col, mat, opt) {
    opt = opt || {};
    const n = pts.length, rings = [];
    let prevN = null;
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
      const T = norm(sub(c, a));
      let N = prevN ? norm(sub(prevN, T.map((t) => t * (prevN[0] * T[0] + prevN[1] * T[1] + prevN[2] * T[2])))) : norm(cross(T, Math.abs(T[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
      if (!isFinite(N[0])) N = [1, 0, 0];
      const Bv = cross(T, N); prevN = N;
      const ring = [];
      for (let k = 0; k <= seg; k++) {
        const ang = k / seg * Math.PI * 2, cs = Math.cos(ang), sn = Math.sin(ang);
        const flat = opt.flat || 1, bump = opt.rough ? 1 + vnoise(p[0] * 3 + cs * 2, p[1] * 3 + sn * 2, p[2] * 3) * opt.rough : 1;
        const r = p[3] * bump, dx = N[0] * cs * r + Bv[0] * sn * r * flat, dy = N[1] * cs * r + Bv[1] * sn * r * flat, dz = N[2] * cs * r + Bv[2] * sn * r * flat;
        ring.push({ p: [p[0] + dx, p[1] + dy, p[2] + dz], n: norm([N[0] * cs + Bv[0] * sn, N[1] * cs + Bv[1] * sn, N[2] * cs + Bv[2] * sn]) });
      }
      rings.push(ring);
    }
    b.color(col, mat === undefined ? MAT.WORN : mat);
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) {
      const A = rings[i][k], B = rings[i][k + 1], C = rings[i + 1][k + 1], D = rings[i + 1][k];
      oq(b, A.p, D.p, C.p, B.p, A.n, D.n, C.n, B.n);
    }
    const end = (ring, p, q) => { const out = norm(sub([p[0], p[1], p[2]], [q[0], q[1], q[2]])); for (let k = 0; k < seg; k++) ot(b, [p[0], p[1], p[2]], ring[k].p, ring[k + 1].p, out); };
    if (pts[0][3] > 0.01) end(rings[0], pts[0], pts[1]);
    if (pts[n - 1][3] > 0.01) end(rings[n - 1], pts[n - 1], pts[n - 2]);
  }
  // konarlik ellipsoid (keha, pea, kott); amp = pinna müra, pinch = alakõhu lamendus
  function blob(b, cx, cy, cz, rx, ry, rz, col, opt) {
    opt = opt || {}; const seg = opt.seg || 18, rings = opt.rings || 12, amp = opt.amp === undefined ? 0.06 : opt.amp, fq = opt.fq || 2.2;
    const P = (t, a) => { const st = Math.sin(t), ct = Math.cos(t), ca = Math.cos(a), sa = Math.sin(a); let x = st * ca, y = ct, z = st * sa; const d = 1 + vnoise(x * fq + cx * 3, y * fq + cy * 3, z * fq + cz * 3) * amp + (opt.ridge ? Math.pow(Math.abs(Math.sin(a * opt.ridge)), 6) * 0.06 * st : 0); if (opt.flatBelly && y < 0) y *= opt.flatBelly; return [cx + x * rx * d, cy + y * ry * d, cz + z * rz * d]; };
    b.color(col, opt.mat === undefined ? MAT.WORN : opt.mat);
    const G = []; for (let j = 0; j <= rings; j++) { const row = []; for (let i = 0; i <= seg; i++) row.push(P(j / rings * Math.PI, i / seg * Math.PI * 2)); G.push(row); }
    const NR = []; for (let j = 0; j <= rings; j++) { const row = []; for (let i = 0; i <= seg; i++) { const a = G[Math.max(0, j - 1)][i], c = G[Math.min(rings, j + 1)][i], l = G[j][(i + seg - 1) % seg], r = G[j][(i + 1) % seg]; let nn = norm(cross(sub(r, l), sub(c, a))); const o = sub(G[j][i], [cx, cy, cz]); if (nn[0] * o[0] + nn[1] * o[1] + nn[2] * o[2] < 0) nn = nn.map((q) => -q); if (j === 0) nn = [0, 1, 0]; if (j === rings) nn = [0, -1, 0]; row.push(nn); } NR.push(row); }
    for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
      const A = G[j][i], B = G[j][i + 1], C = G[j + 1][i + 1], D = G[j + 1][i];
      oq(b, A, B, C, D, NR[j][i], NR[j][i + 1], NR[j + 1][i + 1], NR[j + 1][i]);
    }
  }
  // kõver küünis / kihv / sarv: kitsenev kaar
  function claw(b, x, y, z, dx, dy, dz, len, r, curl, col) {
    const pts = [], up = [0, 1, 0], d = norm([dx, dy, dz]), side = norm(cross(d, Math.abs(d[1]) > 0.9 ? [1, 0, 0] : up)), bend = cross(side, d);
    for (let k = 0; k <= 6; k++) { const t = k / 6, c = curl * t * t; pts.push([x + (d[0] * t + bend[0] * c) * len, y + (d[1] * t + bend[1] * c) * len, z + (d[2] * t + bend[2] * c) * len, r * (1 - t * 0.95)]); }
    tube(b, pts, 6, col || AS.BONE, MAT.WORN);
  }
  // segmenteeritud jäse (puusast küünisteni) kohalikus ruumis
  function limb(b, joints, r0, r1, col, tip) {
    const pts = []; const n = joints.length;
    for (let i = 0; i < n - 1; i++) { const a = joints[i], c = joints[i + 1]; for (let k = 0; k < 3; k++) { const t = k / 3, r = r0 + (r1 - r0) * ((i + t) / (n - 1)); const knob = k === 0 && i > 0 ? 1.25 : 1; pts.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t, r * knob]); } }
    const e = joints[n - 1]; pts.push([e[0], e[1], e[2], r1 * 0.6]);
    tube(b, pts, 8, col, MAT.WORN);
    if (tip) { const a = joints[n - 2]; claw(b, e[0], e[1], e[2], e[0] - a[0], e[1] - a[1], e[2] - a[2], tip, r1 * 0.7, 0.3); }
  }
  return { tube, blob, claw, limb, vnoise, oq };
})();
