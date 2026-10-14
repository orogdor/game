// ============================================================
//  REALISTLIKUD TEGELASED: nahastatud võrgud, ümbersihitud animatsioonid,
//  relva hoidmine (IK), istumine/lamamine/surm, välimuse toonid
// ============================================================
const Chars = (() => {

  // 4096 atlas: nõrgemal seadmel (väike MAX_TEXTURE_SIZE / vähe mälu) vähendame enne üleslaadimist 2048-le
  function fitTex(im) {
    let lim = 4096;
    try { lim = Math.min(lim, GFX.gl.getParameter(GFX.gl.MAX_TEXTURE_SIZE)); } catch (e) {}
    const mem = navigator.deviceMemory || 8;
    if (mem <= 3 || /Android.*Mobile|iPhone/.test(navigator.userAgent) && mem < 6) lim = Math.min(lim, 2048);
    if (im.width <= lim) return im;
    const c = document.createElement('canvas'); c.width = c.height = lim;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, lim, lim);
    return c;
  }
  const REG = CHAR_DATA.reg;
  const types = {}, clips = {};
  let ready = false;

  // ---------- kvaternioonid (Float32Array, nihe o) ----------
  const qt = new Float32Array(4), qt2 = new Float32Array(4);
  function qmul(out, oo, a, ao, b, bo) {
    const ax = a[ao], ay = a[ao + 1], az = a[ao + 2], aw = a[ao + 3], bx = b[bo], by = b[bo + 1], bz = b[bo + 2], bw = b[bo + 3];
    out[oo] = aw * bx + ax * bw + ay * bz - az * by;
    out[oo + 1] = aw * by - ax * bz + ay * bw + az * bx;
    out[oo + 2] = aw * bz + ax * by - ay * bx + az * bw;
    out[oo + 3] = aw * bw - ax * bx - ay * by - az * bz;
  }
  function qrotv(q, o, x, y, z, out) {
    const qx = q[o], qy = q[o + 1], qz = q[o + 2], qw = q[o + 3];
    const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
  }
  function qaxis(out, ax, ay, az, ang) { const s = Math.sin(ang / 2); out[0] = ax * s; out[1] = ay * s; out[2] = az * s; out[3] = Math.cos(ang / 2); return out; }
  // pööre, mis viib ühiksuuna a suunda b
  function qfromto(out, ax, ay, az, bx, by, bz) {
    const la = Math.hypot(ax, ay, az) || 1, lb = Math.hypot(bx, by, bz) || 1;
    ax /= la; ay /= la; az /= la; bx /= lb; by /= lb; bz /= lb;
    const d = ax * bx + ay * by + az * bz;
    if (d < -0.99999) { let px = 1, py = 0, pz = 0; if (Math.abs(ax) > 0.9) { px = 0; py = 1; } const cx = ay * pz - az * py, cy = az * px - ax * pz, cz = ax * py - ay * px, l = Math.hypot(cx, cy, cz); return qaxis(out, cx / l, cy / l, cz / l, Math.PI); }
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    out[0] = cx; out[1] = cy; out[2] = cz; out[3] = 1 + d;
    const l = Math.hypot(out[0], out[1], out[2], out[3]); out[0] /= l; out[1] /= l; out[2] /= l; out[3] /= l;
    return out;
  }
  function qfromBasis(out, m) { // m: 9 (veergudena x,y,z)
    const m00 = m[0], m10 = m[1], m20 = m[2], m01 = m[3], m11 = m[4], m21 = m[5], m02 = m[6], m12 = m[7], m22 = m[8];
    const t = m00 + m11 + m22;
    if (t > 0) { const s = Math.sqrt(t + 1) * 2; out[3] = 0.25 * s; out[0] = (m21 - m12) / s; out[1] = (m02 - m20) / s; out[2] = (m10 - m01) / s; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; out[3] = (m21 - m12) / s; out[0] = 0.25 * s; out[1] = (m01 + m10) / s; out[2] = (m02 + m20) / s; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; out[3] = (m02 - m20) / s; out[0] = (m01 + m10) / s; out[1] = 0.25 * s; out[2] = (m12 + m21) / s; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; out[3] = (m10 - m01) / s; out[0] = (m02 + m20) / s; out[1] = (m12 + m21) / s; out[2] = 0.25 * s; }
    return out;
  }

  function b64(s, T) { return new T(bytesOf(s).buffer); }

  // ---------- laadimine ----------
  function init() {
    for (const [name, c] of Object.entries(CHAR_DATA.clips)) {
      const q16 = b64(c.q, Int16Array), q = new Float32Array(q16.length);
      for (let i = 0; i < q.length; i++) q[i] = q16[i] / 32767;
      const h16 = b64(c.h, Int16Array), h = new Float32Array(h16.length);
      for (let i = 0; i < h.length; i++) h[i] = h16[i] / 10000;
      clips[name] = { name, n: c.n, dur: c.dur, loop: c.loop, bones: c.bones, nb: c.bones.length, q, h };
    }
    for (const [name, d] of Object.entries(CHAR_DATA.chars)) {
      const p16 = b64(d.pos, Int16Array), pos = new Float32Array(p16.length);
      for (let i = 0; i < pos.length; i++) pos[i] = p16[i] * (2.2 / 32767);
      const morph = d.morph ? { idx: b64(d.morph.idx, Uint32Array), dq: b64(d.morph.d, Int16Array), sc: d.morph.sc / 32767, n: d.morph.n } : null;
      const mesh = new GFX.SkinMesh({ pos, nor: b64(d.nor, Int8Array), uv: b64(d.uv, Uint16Array), jn: b64(d.jn, Uint8Array), wt: b64(d.wt, Uint8Array), idx: d.i32 ? b64(d.idx, Uint32Array) : b64(d.idx, Uint16Array), morph });
      const nj = d.joints.length;
      const T = { name, mesh, alb: null, mask: null, nj, avg: d.avg, morphNames: d.morph ? d.morph.names : [], height: d.height, hairStyles: d.hairStyles || [], beardStyles: d.beardStyles || [], hairR: d.hairR || null, beardR: d.beardR || null, rcache: {}, idxOf: {},
        parent: new Int16Array(nj), bp: new Float32Array(nj * 3), bq: new Float32Array(nj * 4), tq: new Float32Array(nj * 4), off: new Float32Array(nj * 3), ibm: new Float32Array(nj * 16), clipMap: {}, desc: [] };
      d.joints.forEach((j, k) => {
        T.idxOf[j.n] = k; T.parent[k] = j.p;
        T.bp.set(j.bp, k * 3); T.bq.set(j.bq, k * 4); T.tq.set(j.tq, k * 4);
      });
      const inv = new Float32Array(4), v = new Float32Array(3);
      for (let k = 0; k < nj; k++) {
        const p = T.parent[k];
        if (p >= 0) {
          inv[0] = -T.bq[p * 4]; inv[1] = -T.bq[p * 4 + 1]; inv[2] = -T.bq[p * 4 + 2]; inv[3] = T.bq[p * 4 + 3];
          qrotv(inv, 0, T.bp[k * 3] - T.bp[p * 3], T.bp[k * 3 + 1] - T.bp[p * 3 + 1], T.bp[k * 3 + 2] - T.bp[p * 3 + 2], v);
          T.off.set(v, k * 3);
        }
        // IBM = inverse([bq | bp])
        const m = M4.create();
        composeQ(m, T.bq, k * 4, T.bp[k * 3], T.bp[k * 3 + 1], T.bp[k * 3 + 2]);
        M4.invert(m, m); T.ibm.set(m, k * 16);
      }
      // järglaste loendid (hierarhia järjekorras)
      for (let k = 0; k < nj; k++) { const out = []; for (let j = k; j < nj; j++) { let a = j; while (a >= 0 && a !== k) a = T.parent[a]; if (a === k) out.push(j); } T.desc.push(Int16Array.from(out)); }
      for (const c of Object.values(clips)) {
        const map = new Int16Array(nj).fill(-1);
        c.bones.forEach((bn, bi) => { if (T.idxOf[bn] !== undefined) map[T.idxOf[bn]] = bi; });
        T.clipMap[c.name] = map;
      }
      T.hips = T.idxOf.Hips; T.hipH = T.bp[T.hips * 3 + 1];
      if (d.tiers) { const [a, m, h] = d.tiers; T.rng = { 1: [[0, a]], 2: [[0, a + m]], 3: [[0, a], [a + m, h]] }; }
      T.fit = d.fit || {}; T.sm = new Float32Array(nj * 16);
      const J = (n) => (T.idxOf[n] === undefined ? -1 : T.idxOf[n]);
      T.j = { spine: J('Spine'), spine1: J('Spine1'), spine2: J('Spine2'), neck: J('Neck'), head: J('Head'), armR: J('RightArm'), foreR: J('RightForeArm'), handR: J('RightHand'), armL: J('LeftArm'), foreL: J('LeftForeArm'), handL: J('LeftHand'),
        upL: J('LeftUpLeg'), legL: J('LeftLeg'), footL: J('LeftFoot'), upR: J('RightUpLeg'), legR: J('RightLeg'), footR: J('RightFoot') };
      T.fingersR = []; T.fingersL = [];
      for (const f of ['Index', 'Middle', 'Ring', 'Pinky']) for (let s = 1; s <= 3; s++) { const r = J('RightHand' + f + s), l = J('LeftHand' + f + s); if (r >= 0) T.fingersR.push([r, s]); if (l >= 0) T.fingersL.push([l, s]); }
      // käe kohalikud teljed T-poosist: sõrmed piki kätt, peopesa alla
      T.handAx = {};
      for (const [side, hk, sx] of [['R', T.j.handR, -1], ['L', T.j.handL, 1]]) {
        const q = new Float32Array([-T.tq[hk * 4], -T.tq[hk * 4 + 1], -T.tq[hk * 4 + 2], T.tq[hk * 4 + 3]]);
        T.handAx[side] = { f: Array.from(qrotv(q, 0, sx, 0, 0, new Float32Array(3))), p: Array.from(qrotv(q, 0, 0, -1, 0, new Float32Array(3))) };
      }
      types[name] = T;
      if (name !== 'soldier') try { T.gear = buildGear(T); } catch (e) { console.error(e); T.gear = []; }
      const im = new Image(); im.onload = () => { try { T.alb = GFX.texFromImage(fitTex(im)); } catch (e) { console.error(e); } }; im.onerror = () => console.error('char tex fail', name); im.src = d.tex;
      const mk = new Image(); mk.onload = () => { T.mask = GFX.texFromImage(mk, { mask: true }); }; mk.src = d.mask;
    }
    ready = true;
  }
  function composeQ(m, q, o, x, y, z) {
    const qx = q[o], qy = q[o + 1], qz = q[o + 2], qw = q[o + 3];
    const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz, xx = qx * x2, xy = qx * y2, xz = qx * z2, yy = qy * y2, yz = qy * z2, zz = qz * z2, wx = qw * x2, wy = qw * y2, wz = qw * z2;
    m[0] = 1 - (yy + zz); m[1] = xy + wz; m[2] = xz - wy; m[3] = 0;
    m[4] = xy - wz; m[5] = 1 - (xx + zz); m[6] = yz + wx; m[7] = 0;
    m[8] = xz + wy; m[9] = yz - wx; m[10] = 1 - (xx + yy); m[11] = 0;
    m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
    return m;
  }

  // ---------- poosi arvutus ----------
  const MAXJ = 72;
  const tmpD = [new Float32Array(MAXJ * 4), new Float32Array(MAXJ * 4), new Float32Array(MAXJ * 4)];
  const tmpH = [new Float32Array(3), new Float32Array(3), new Float32Array(3)];
  const D = new Float32Array(MAXJ * 4), Gq = new Float32Array(MAXJ * 4), P = new Float32Array(MAXJ * 3), Hh = new Float32Array(3);
  const v3 = new Float32Array(3), q4 = new Float32Array(4), q5 = new Float32Array(4), bm = new Float32Array(16), tm = new Float32Array(16);

  function sampleInto(T, clip, t, outD, outH) {
    const map = T.clipMap[clip.name], n = clip.n, nb = clip.nb;
    let f = clip.dur > 0 ? (t / clip.dur) * (clip.loop ? n : n - 1) : 0;
    if (clip.loop) { f %= n; if (f < 0) f += n; } else f = clamp(f, 0, n - 1);
    const f0 = Math.floor(f), f1 = clip.loop ? (f0 + 1) % n : Math.min(n - 1, f0 + 1), a = f - f0;
    const q = clip.q;
    for (let k = 0; k < T.nj; k++) {
      const bi = map[k], o = k * 4;
      if (bi < 0) { const p = T.parent[k]; if (p < 0) { outD[o] = 0; outD[o + 1] = 0; outD[o + 2] = 0; outD[o + 3] = 1; } else { outD[o] = outD[p * 4]; outD[o + 1] = outD[p * 4 + 1]; outD[o + 2] = outD[p * 4 + 2]; outD[o + 3] = outD[p * 4 + 3]; } continue; }
      const i0 = (f0 * nb + bi) * 4, i1 = (f1 * nb + bi) * 4;
      let x = q[i0] + (q[i1] - q[i0]) * a, y = q[i0 + 1] + (q[i1 + 1] - q[i0 + 1]) * a, z = q[i0 + 2] + (q[i1 + 2] - q[i0 + 2]) * a, w = q[i0 + 3] + (q[i1 + 3] - q[i0 + 3]) * a;
      const l = Math.hypot(x, y, z, w) || 1;
      outD[o] = x / l; outD[o + 1] = y / l; outD[o + 2] = z / l; outD[o + 3] = w / l;
    }
    const h = clip.h;
    outH[0] = h[f0 * 3] + (h[f1 * 3] - h[f0 * 3]) * a; outH[1] = h[f0 * 3 + 1] + (h[f1 * 3 + 1] - h[f0 * 3 + 1]) * a; outH[2] = h[f0 * 3 + 2] + (h[f1 * 3 + 2] - h[f0 * 3 + 2]) * a;
  }
  // segab kaalutud klippe D-sse
  function blendClips(T, layers) {
    let wsum = 0, first = true;
    for (let li = 0; li < layers.length && li < 3; li++) {
      const L = layers[li]; if (!(L.w > 0.001)) continue;
      const c = clips[L.clip]; if (!c) continue;
      const d = tmpD[li], h = tmpH[li];
      sampleInto(T, c, L.t, d, h);
      if (first) { D.set(d.subarray(0, T.nj * 4)); for (let i = 0; i < T.nj * 4; i++) D[i] *= L.w; Hh[0] = h[0] * L.w; Hh[1] = h[1] * L.w; Hh[2] = h[2] * L.w; first = false; }
      else {
        for (let k = 0; k < T.nj; k++) {
          const o = k * 4; const s = (D[o] * d[o] + D[o + 1] * d[o + 1] + D[o + 2] * d[o + 2] + D[o + 3] * d[o + 3]) < 0 ? -L.w : L.w;
          D[o] += d[o] * s; D[o + 1] += d[o + 1] * s; D[o + 2] += d[o + 2] * s; D[o + 3] += d[o + 3] * s;
        }
        Hh[0] += h[0] * L.w; Hh[1] += h[1] * L.w; Hh[2] += h[2] * L.w;
      }
      wsum += L.w;
    }
    if (first) { for (let k = 0; k < T.nj; k++) { D[k * 4] = 0; D[k * 4 + 1] = 0; D[k * 4 + 2] = 0; D[k * 4 + 3] = 1; } Hh[0] = Hh[1] = Hh[2] = 0; return; }
    for (let k = 0; k < T.nj; k++) { const o = k * 4, l = Math.hypot(D[o], D[o + 1], D[o + 2], D[o + 3]) || 1; D[o] /= l; D[o + 1] /= l; D[o + 2] /= l; D[o + 3] /= l; }
    Hh[0] /= wsum; Hh[1] /= wsum; Hh[2] /= wsum;
  }
  // pööra alampuu D-d (maailmaruumis, enne FK-d)
  function rotSubD(T, k, q) { if (k < 0) return; for (const j of T.desc[k]) { qmul(q5, 0, q, 0, D, j * 4); D.set(q5, j * 4); } }
  function fk(T) {
    for (let k = 0; k < T.nj; k++) {
      qmul(Gq, k * 4, D, k * 4, T.tq, k * 4);
      const p = T.parent[k];
      if (p < 0) {
        P[k * 3] = T.bp[k * 3] + Hh[0] * T.hipH; P[k * 3 + 1] = T.bp[k * 3 + 1] + Hh[1] * T.hipH; P[k * 3 + 2] = T.bp[k * 3 + 2] + Hh[2] * T.hipH;
      } else {
        qrotv(Gq, p * 4, T.off[k * 3], T.off[k * 3 + 1], T.off[k * 3 + 2], v3);
        P[k * 3] = P[p * 3] + v3[0]; P[k * 3 + 1] = P[p * 3 + 1] + v3[1]; P[k * 3 + 2] = P[p * 3 + 2] + v3[2];
      }
    }
  }
  // pööra alampuu G-d ümber liigese k ja arvuta asukohad uuesti
  function rotSubG(T, k, q) {
    const ds = T.desc[k];
    const px = P[k * 3], py = P[k * 3 + 1], pz = P[k * 3 + 2];
    for (const j of ds) {
      qmul(q5, 0, q, 0, Gq, j * 4); Gq.set(q5, j * 4);
      if (j !== k) { qrotv(q, 0, P[j * 3] - px, P[j * 3 + 1] - py, P[j * 3 + 2] - pz, v3); P[j * 3] = px + v3[0]; P[j * 3 + 1] = py + v3[1]; P[j * 3 + 2] = pz + v3[2]; }
    }
  }
  // kahe luu IK: a (õlg) b (küünarnukk) c (käsi) -> sihtpunkt t, poolus pole
  function ik2(T, a, b, c, tx, ty, tz, polx, poly, polz) {
    if (a < 0 || b < 0 || c < 0) return;
    const sx = P[a * 3], sy = P[a * 3 + 1], sz = P[a * 3 + 2];
    const la = Math.hypot(P[b * 3] - sx, P[b * 3 + 1] - sy, P[b * 3 + 2] - sz), lb = Math.hypot(P[c * 3] - P[b * 3], P[c * 3 + 1] - P[b * 3 + 1], P[c * 3 + 2] - P[b * 3 + 2]);
    let dx = tx - sx, dy = ty - sy, dz = tz - sz, d = Math.hypot(dx, dy, dz) || 1e-4;
    const dm = Math.min(d, (la + lb) * 0.999); const nx = dx / d, ny = dy / d, nz = dz / d;
    const ca = clamp((la * la + dm * dm - lb * lb) / (2 * la * dm), -1, 1), sa = Math.sqrt(1 - ca * ca);
    let pdot = polx * nx + poly * ny + polz * nz;
    let px = polx - nx * pdot, py = poly - ny * pdot, pz = polz - nz * pdot; const pl = Math.hypot(px, py, pz) || 1; px /= pl; py /= pl; pz /= pl;
    const ex = sx + (nx * ca + px * sa) * la, ey = sy + (ny * ca + py * sa) * la, ez = sz + (nz * ca + pz * sa) * la;
    qfromto(q4, P[b * 3] - sx, P[b * 3 + 1] - sy, P[b * 3 + 2] - sz, ex - sx, ey - sy, ez - sz); rotSubG(T, a, q4);
    const hx = sx + nx * dm, hy = sy + ny * dm, hz = sz + nz * dm;
    qfromto(q4, P[c * 3] - P[b * 3], P[c * 3 + 1] - P[b * 3 + 1], P[c * 3 + 2] - P[b * 3 + 2], hx - P[b * 3], hy - P[b * 3 + 1], hz - P[b * 3 + 2]); rotSubG(T, b, q4);
  }
  // sea käe maailmapööre: sõrmesuund f ja peopesa normaal p (mudeliruumis)
  const basA = new Float32Array(9), qa = new Float32Array(4), qb = new Float32Array(4);
  function orient(f, p, out) {
    let fl = Math.hypot(f[0], f[1], f[2]); const fx = f[0] / fl, fy = f[1] / fl, fz = f[2] / fl;
    const d = p[0] * fx + p[1] * fy + p[2] * fz; let px = p[0] - fx * d, py = p[1] - fy * d, pz = p[2] - fz * d; const pl = Math.hypot(px, py, pz) || 1; px /= pl; py /= pl; pz /= pl;
    basA[0] = fx; basA[1] = fy; basA[2] = fz; basA[3] = px; basA[4] = py; basA[5] = pz; basA[6] = fy * pz - fz * py; basA[7] = fz * px - fx * pz; basA[8] = fx * py - fy * px;
    return qfromBasis(out, basA);
  }
  function setHand(T, k, side, f, p) {
    if (k < 0) return;
    const ax = T.handAx[side];
    orient(f, p, qa); orient(ax.f, ax.p, qb); // qa * inv(qb) = maailmapööre kohalikest telgedest
    qb[0] = -qb[0]; qb[1] = -qb[1]; qb[2] = -qb[2];
    qmul(q4, 0, qa, 0, qb, 0); // soovitud G_hand
    // delta = soovitud * inv(praegune)
    qt[0] = -Gq[k * 4]; qt[1] = -Gq[k * 4 + 1]; qt[2] = -Gq[k * 4 + 2]; qt[3] = Gq[k * 4 + 3];
    qmul(qt2, 0, q4, 0, qt, 0);
    rotSubG(T, k, qt2);
  }
  function curl(T, list, k, amt) {
    if (k < 0 || !list.length) return;
    // külgtelg = sõrm x peopesa käe raamis
    const side = list === T.fingersR ? 'R' : 'L', ax = T.handAx[side];
    const lx = ax.f[1] * ax.p[2] - ax.f[2] * ax.p[1], ly = ax.f[2] * ax.p[0] - ax.f[0] * ax.p[2], lz = ax.f[0] * ax.p[1] - ax.f[1] * ax.p[0];
    for (const [j, s] of list) {
      qrotv(Gq, j * 4, lx, ly, lz, v3);
      qaxis(q4, v3[0], v3[1], v3[2], amt * (s === 1 ? 0.95 : 0.8) * (side === 'R' ? -1 : 1));
      rotSubG(T, j, q4);
    }
  }

  // ---------- olek & joonistamine ----------
  // st: { type, look(tints), layers:[{clip,t,w}], aim(0..1), pitch, headYaw, pose('stand'|'sit'|'lie'|'dead'), gun(bool) }
  const gunM = new Float32Array(16), handM = new Float32Array(16);
  function pose(T, st) {
    blendClips(T, st.layers);
    const J = T.j;
    const lc = st.layers[0] && st.layers[0].clip;
    if (st.pose === 'sit' && !(lc === 'sit' || lc === 'sitTalk') && !(clips.sit && st.layers[0].w > 0.5)) {
      qaxis(q4, 1, 0, 0, -Math.PI / 2); rotSubD(T, J.upL, q4); rotSubD(T, J.upR, q4);
      qaxis(q4, 1, 0, 0, Math.PI / 2 - 0.08); rotSubD(T, J.legL, q4); rotSubD(T, J.legR, q4);
      Hh[0] = 0; Hh[2] = -0.05; Hh[1] = (0.5 - T.hipH) / T.hipH;
    }
    // ülakeha sihtimiskalle
    const pitch = (st.pitch || 0) * (st.aim || 0);
    if (Math.abs(pitch) > 0.001 && J.spine >= 0) { qaxis(q4, 1, 0, 0, -pitch / 3); rotSubD(T, J.spine, q4); rotSubD(T, J.spine1, q4); rotSubD(T, J.spine2, q4); }
    if (st.headYaw && J.neck >= 0) { qaxis(q4, 0, 1, 0, st.headYaw); rotSubD(T, J.neck, q4); }
    // ---- protseduurilised kihid (elutruu kehakeel) ----
    const sl = st.slump || 0;                                    // väsimus / kurbus: küür ja pea longus
    if (sl > 0.01 && J.spine >= 0) { qaxis(q4, 1, 0, 0, sl * 0.14); rotSubD(T, J.spine, q4); rotSubD(T, J.spine1, q4); if (J.neck >= 0) { qaxis(q4, 1, 0, 0, sl * 0.3); rotSubD(T, J.neck, q4); } }
    if (st.headPitch && J.neck >= 0) { qaxis(q4, 1, 0, 0, st.headPitch); rotSubD(T, J.neck, q4); }
    if (st.limp > 0.01 && T.hips >= 0) {                         // lonkamine: puus kallutus ja vajumine haige jala peal
      const w = Math.sin((st.limpPh || 0) * TAU);
      qaxis(q4, 0, 0, 1, w * 0.08 * st.limp); rotSubD(T, T.hips, q4);
      if (J.spine1 >= 0) { qaxis(q4, 0, 0, 1, -w * 0.06 * st.limp); rotSubD(T, J.spine1, q4); }
      Hh[1] -= Math.max(0, w) * 0.035 * st.limp;
    }
    if (st.sway > 0.01 && T.hips >= 0) {                         // tants: puusad ja õlad rütmis
      const t = st.swayT || 0;
      qaxis(q4, 0, 0, 1, Math.sin(t * 4.4) * 0.1 * st.sway); rotSubD(T, T.hips, q4);
      if (J.spine1 >= 0) { qaxis(q4, 0, 1, 0, Math.sin(t * 2.2) * 0.3 * st.sway); rotSubD(T, J.spine1, q4); }
      Hh[1] -= Math.abs(Math.sin(t * 4.4)) * 0.03 * st.sway;
    }
    if (st.lunge > 0.01 && J.spine >= 0) { qaxis(q4, 1, 0, 0, st.lunge * 0.35); rotSubD(T, J.spine, q4); }   // tõuge/kaklus
    if (st.crouch > 0.01) { Hh[1] -= st.crouch * 0.28; if (J.spine >= 0) { qaxis(q4, 1, 0, 0, st.crouch * 0.25); rotSubD(T, J.spine, q4); } }   // varjes kükitamine
    fk(T);
    if (st.gun) gunPose(T, st);
    else if (st.hold > 0.01 && J.armL >= 0 && J.spine1 >= 0) {   // haavatu hoiab kätt haaval
      const s1 = J.spine1 * 3;
      ik2(T, J.armL, J.foreL, J.handL, P[s1] + 0.05, P[s1 + 1] - 0.06, P[s1 + 2] + 0.15, 0.6, -1, 0);
    }
  }
  // relv rinna ees: sihtimisel õla juures, muidu madalal
  const gf = [0, 0, 1], gu = [0, 1, 0], gl = [1, 0, 0];
  // vasaku käe haardekoht relva ruumis (z ette, y üles): käekaitse keskel; püstolitel teine käsi pidemel
  const FORE = { carbine: [0.3, -0.012], carbineTan: [0.3, -0.012], rifle: [0.3, -0.012], shotgun: [0.33, -0.02], smg: [0.19, -0.015], sniper: [0.32, -0.01], lmg: [0.31, -0.03],
    dmr: [0.34, -0.012], plasma: [0.26, -0.03], gl: [0.22, -0.035], ashot: [0.27, -0.025], rail: [0.3, -0.04], pistol: [0.0, -0.075], revolver: [0.01, -0.07] };
  function gunPose(T, st) {
    const J = T.j; if (J.armR < 0) return;
    const aim = st.aim || 0;
    const p = lerp(-0.4, (st.pitch || 0), aim) + (st.recoil || 0) * 0.08;
    const yawOff = lerp(0.7, 0.0, aim);
    const cp = Math.cos(p), sp = Math.sin(p), cy = Math.cos(yawOff), sy = Math.sin(yawOff);
    gf[0] = sy * cp; gf[1] = sp; gf[2] = cy * cp;
    gu[0] = -sy * sp; gu[1] = cp; gu[2] = -cy * sp;
    gl[0] = gu[1] * gf[2] - gu[2] * gf[1]; gl[1] = gu[2] * gf[0] - gu[0] * gf[2]; gl[2] = gu[0] * gf[1] - gu[1] * gf[0];
    const sR = J.armR * 3, s2 = J.spine2 * 3;
    // relva joone algus: madal valmisolek rinna ees / sihtimisel parem õlg
    const ox = lerp(P[s2] - 0.06, P[sR] + 0.09, aim), oy = lerp(P[s2 + 1] + 0.06, P[sR + 1], aim), oz = lerp(P[s2 + 2] + 0.15, P[sR + 2] + 0.03, aim);
    const back = (st.recoil || 0) * 0.05;
    const gd = lerp(0.10, 0.15, aim) - back;
    const grx = ox + gf[0] * gd - gu[0] * 0.075, gry = oy + gf[1] * gd - gu[1] * 0.075, grz = oz + gf[2] * gd - gu[2] * 0.075;
    // randme koht: veidi relvast vasakul ja all, et peopesa jääks käekaitse alla ja sõrmed haaraksid ümber
    const F = FORE[st.gunK] || FORE.carbine, fd = gd + 0.06 + F[0] - 0.04, fu = -0.035 + F[1] - 0.03, fs = F[0] > 0.05 ? 0.035 : 0.02;
    const flx = ox + gf[0] * fd + gu[0] * fu + gl[0] * fs, fly = oy + gf[1] * fd + gu[1] * fu + gl[1] * fs, flz = oz + gf[2] * fd + gu[2] * fu + gl[2] * fs;
    ik2(T, J.armR, J.foreR, J.handR, grx, gry, grz, -0.6, -1, -0.3);
    ik2(T, J.armL, J.foreL, J.handL, flx, fly, flz, 0.2, -1, -0.15);
    setHand(T, J.handR, 'R', [gl[0] * 0.75 - gu[0] * 0.45 + gf[0] * 0.35, gl[1] * 0.75 - gu[1] * 0.45 + gf[1] * 0.35, gl[2] * 0.75 - gu[2] * 0.45 + gf[2] * 0.35], [gl[0], gl[1], gl[2]]);
    setHand(T, J.handL, 'L', [-gl[0] * 0.8 + gf[0] * 0.45, -gl[1] * 0.8 + gf[1] * 0.45, -gl[2] * 0.8 + gf[2] * 0.45], [gu[0] * 0.9 - gl[0] * 0.35, gu[1] * 0.9 - gl[1] * 0.35, gu[2] * 0.9 - gl[2] * 0.35]);
    curl(T, T.fingersR, J.handR, 0.72);
    curl(T, T.fingersL, J.handL, 0.55);
    // relva maatriks mudeliruumis: alguspunkt õlal, Z = ette
    gunM[0] = gl[0]; gunM[1] = gl[1]; gunM[2] = gl[2]; gunM[3] = 0;
    gunM[4] = gu[0]; gunM[5] = gu[1]; gunM[6] = gu[2]; gunM[7] = 0;
    gunM[8] = gf[0]; gunM[9] = gf[1]; gunM[10] = gf[2]; gunM[11] = 0;
    gunM[12] = ox + gf[0] * (gd + 0.06) - gu[0] * 0.035; gunM[13] = oy + gf[1] * (gd + 0.06) - gu[1] * 0.035; gunM[14] = oz + gf[2] * (gd + 0.06) - gu[2] * 0.035; gunM[15] = 1;
  }
  function writeBones(T, row, hide) {
    const out = GFX.boneRowData(row);
    for (let k = 0; k < T.nj; k++) {
      if (hide && hide[k]) { const c = hide === T.fpHide ? (k === T.j.spine2 || T.parent[k] === T.j.spine2 ? T.j.spine2 : T.j.neck) : T.j.neck; out.fill(0, k * 12, k * 12 + 12); out[k * 12 + 3] = P[c * 3]; out[k * 12 + 7] = P[c * 3 + 1]; out[k * 12 + 11] = P[c * 3 + 2]; continue; }
      const hr = T.handScale && T.handRoot ? T.handRoot[k] : -1;
      if (hr >= 0) {   // esimese isiku vaates käed ja sõrmed väiksemaks (randme ümber), et need ei paistaks kohmakad
        const s = T.handScale;
        composeQ(bm, Gq, k * 4, P[hr * 3] + (P[k * 3] - P[hr * 3]) * s, P[hr * 3 + 1] + (P[k * 3 + 1] - P[hr * 3 + 1]) * s, P[hr * 3 + 2] + (P[k * 3 + 2] - P[hr * 3 + 2]) * s);
        for (const c of [0, 1, 2, 4, 5, 6, 8, 9, 10]) bm[c] *= s;
      } else composeQ(bm, Gq, k * 4, P[k * 3], P[k * 3 + 1], P[k * 3 + 2]);
      M4.mul(tm, bm, T.ibm.subarray(k * 16, k * 16 + 16));
      T.sm.set(tm, k * 16);
      const o = k * 12;
      out[o] = tm[0]; out[o + 1] = tm[4]; out[o + 2] = tm[8]; out[o + 3] = tm[12];
      out[o + 4] = tm[1]; out[o + 5] = tm[5]; out[o + 6] = tm[9]; out[o + 7] = tm[13];
      out[o + 8] = tm[2]; out[o + 9] = tm[6]; out[o + 10] = tm[10]; out[o + 11] = tm[14];
    }
  }
  // tagastab: { gun: maailmamaatriks või null } ; m = mudeli maailmamaatriks
  const DEF_OPT = {};
  // joonistatavad indeksivahemikud: varustuse aste + valitud soeng + valitud habe (teisi ei joonistata üldse)
  function rangesFor(T, gear, tints) {
    if (!T.rng) return null;
    const g = clamp(gear === undefined ? 2 : gear, 1, 3);
    if (!T.hairR) return T.rng[g];
    const hs = (tints && tints.hs) || '', bs = (tints && tints.bs) || '', key = g + '|' + hs + '|' + bs;
    let r = T.rcache[key];
    if (!r) {
      r = T.rng[g].slice();
      if (T.hairR[hs]) r.push(T.hairR[hs]);
      if (T.beardR && T.beardR[bs]) r.push(T.beardR[bs]);
      T.rcache[key] = r;
    }
    return r;
  }
  const res = { gun: M4.create(), hasGun: false, head: { x: 0, y: 0, z: 0 }, prop: M4.create(), hasProp: false, back: M4.create(), hasBack: false };
  const pf = new Float32Array(3), pq = new Float32Array(3), backT = M4.create();
  function draw(st, m, tint, opt) {
    if (!ready) return null;
    const T = types[st.type] || types.male;
    if (!T.alb || !T.mask) return null;
    const row = GFX.boneRow(); if (row < 0) return null;
    pose(T, st);
    writeBones(T, row);
    if (T.rng) (opt = opt || DEF_OPT).ranges = rangesFor(T, st.gear, st.tints); else if (opt) opt.ranges = null;
    GFX.drawSkinned(T, m, row, st.tints || defaultTints(T), tint, 1.3, opt);
    if (T.gear && T.gear.length) {
      if (poolFrame !== GFX.S.frame) { poolFrame = GFX.S.frame; poolI = 0; }
      const gt = st.gearTint || GEAR_T;
      for (const g of T.gear) {
        if (g.lvl > st.gear || (g.need && !(st.eq && g.items.includes(st.eq[g.need])))) continue;
        if (poolI >= pool.length) pool.push(new Float32Array(16));
        const mm = pool[poolI++];
        M4.mul(mm, m, T.sm.subarray(g.j * 16, g.j * 16 + 16));
        GFX.draw(g.mesh, mm, g.tinted ? (tint || gt) : tint, null, { rust: 0.9, shadow: !opt || opt.shadow !== false });
      }
    }
    res.hasGun = !!st.gun;
    if (st.gun) M4.mul(res.gun, m, gunM);
    // käes hoitava eseme maatriks (parem käsi): X = sõrmede suund, Y = pöidla suund, Z = peopesa normaal
    if (st.prop && T.j.handR >= 0) {
      const hk = T.j.handR, ax = T.handAx.R;
      const f = qrotv(Gq, hk * 4, ax.f[0], ax.f[1], ax.f[2], pf), pp = qrotv(Gq, hk * 4, ax.p[0], ax.p[1], ax.p[2], pq);
      const sx = f[1] * pp[2] - f[2] * pp[1], sy = f[2] * pp[0] - f[0] * pp[2], sz = f[0] * pp[1] - f[1] * pp[0];
      const hx = P[hk * 3] + f[0] * 0.075 + pp[0] * 0.035, hy = P[hk * 3 + 1] + f[1] * 0.075 + pp[1] * 0.035, hz = P[hk * 3 + 2] + f[2] * 0.075 + pp[2] * 0.035;
      handM[0] = f[0]; handM[1] = f[1]; handM[2] = f[2]; handM[3] = 0; handM[4] = sx; handM[5] = sy; handM[6] = sz; handM[7] = 0;
      handM[8] = pp[0]; handM[9] = pp[1]; handM[10] = pp[2]; handM[11] = 0; handM[12] = hx; handM[13] = hy; handM[14] = hz; handM[15] = 1;
      M4.mul(res.prop, m, handM); res.hasProp = true;
    } else res.hasProp = false;
    // selja maatriks (kantav koorem): selgroo 2. lüli siduspoosi järgi
    if (st.backLoad && T.j.spine2 >= 0 && T.fit && T.fit.chest) {
      const [cy, , , zb] = T.fit.chest;
      M4.mul(res.back, m, T.sm.subarray(T.j.spine2 * 16, T.j.spine2 * 16 + 16));
      M4.mul(res.back, res.back, M4.compose(backT, 0, cy - 0.3, zb - 0.03));
      res.hasBack = true;
    } else res.hasBack = false;
    const h = T.j.head * 3; M4.point(m, P[h], P[h + 1] + 0.1, P[h + 2], res.head);
    return res;
  }

  // esimese isiku vaade: tegelase silm kaamera kohal. ads 0..1 toob sihiku ekraani keskele
  const eyeT = new Float32Array(16), gunOut = new Float32Array(16);
  function drawFP(st, camM, outM, ads, opt) {
    if (!ready) return null;
    const T = types[st.type] || types.male;
    if (!T.alb || !T.mask) return null;
    const row = GFX.boneRow(true); if (row < 0) return null;
    pose(T, st);
    const h = T.j.head * 3;
    // silm relva suhtes: relv paremal all ees
    // kitsal (püst)ekraanil tuuakse relv keskele lähemale, et see ei jääks serva taha
    let ex = gunM[12] + (st.narrow ? 0.07 : 0.12), ey = gunM[13] + (st.narrow ? 0.19 : 0.2), ez = gunM[14] - (st.narrow ? 0.4 : 0.37);
    // sihik (punane punkt) relva ruumis (0, 0.112, 0.06) -> mudeliruum
    const sx = gunM[4] * 0.112 + gunM[8] * 0.06 + gunM[12], sy = gunM[5] * 0.112 + gunM[9] * 0.06 + gunM[13], sz = gunM[6] * 0.112 + gunM[10] * 0.06 + gunM[14];
    ex = lerp(ex, sx, ads); ey = lerp(ey, sy, ads); ez = lerp(ez, sz - 0.2, ads);
    M4.compose(eyeT, -ex, -ey, -ez);
    M4.mul(outM, camM, eyeT);
    // peida kõik peale käte (õlast alates)
    if (!T.fpHide) { T.fpHide = new Uint8Array(T.nj).fill(1); for (const n of ['LeftArm', 'RightArm']) if (T.idxOf[n] !== undefined) for (const j of T.desc[T.idxOf[n]]) T.fpHide[j] = 0; }
    if (!T.handRoot) {
      T.handRoot = new Int16Array(T.nj).fill(-1);
      for (const h of [T.j.handR, T.j.handL]) if (h >= 0) { T.handRoot[h] = h; for (const d of T.desc[h] || []) T.handRoot[d] = h; }
    }
    T.handScale = 0.8;
    writeBones(T, row, T.fpHide);
    T.handScale = 0;
    if (T.rng) (opt = opt || DEF_OPT).ranges = rangesFor(T, st.gear, st.tints); else if (opt) opt.ranges = null;
    GFX.drawSkinned(T, outM, row, st.tints || defaultTints(T), null, 1.3, opt);
    M4.mul(gunOut, outM, gunM);
    return gunOut;
  }

  // portree: full = kogu keha, muidu pea ja õlad. yaw = pööre
  const pM = M4.create(), pst = { type: 'male', tints: null, layers: [{ clip: 'idle2', t: 0.8, w: 1 }], aim: 0, pitch: 0, headYaw: 0, pose: 'stand', gun: false };
  function portrait(look, o = {}) {
    if (!ready) return null;
    const T = types[look.type] || types.male;
    if (!T.alb || !T.mask) return null;
    pst.type = T.name; pst.layers[0].clip = o.clip || 'idle2'; pst.layers[0].t = o.t || 0.8; pst.gun = !!o.gun; pst.aim = 0;
    pose(T, pst);
    writeBones(T, GFX.PORTRAIT_ROW);
    const sc = Look.scale(look);
    M4.compose(pM, 0, 0, 0, o.yaw || 0, 0, 0, sc[0], sc[1], sc[2]);
    const h = T.j.head * 3, hy = (P[h + 1] + 0.08) * sc[1];
    const w = o.w || 160, hh = o.h || 200;
    let eye, tgt, fov;
    if (o.full) { const H = (look.height || T.height); eye = [0, H * 0.55, 3.6]; tgt = [0, H * 0.5, 0]; fov = 0.62 * (H / 1.8) * 0.5 + 0.3; }
    else { eye = [0.0, hy + 0.02, 0.75]; tgt = [0, hy - 0.06, 0]; fov = 0.52; }
    if (o.eye) { eye = o.eye; tgt = o.tgt; fov = o.fov || 0.5; }
    pst.gear = Look.gearLvl(look); pst.eq = look.eq || null; pst.gearTint = Look.gearTint(look);
    const lt = Look.tints(look);
    const ex = gearExtras(T, pst, pM, []); ex.morph = o.face || null; ex.ranges = rangesFor(T, pst.gear, lt);
    return GFX.portrait(T, GFX.PORTRAIT_ROW, lt, pM, eye, tgt, fov, w, hh, o.canvas, ex);
  }

  // ---------- Doom 3 stiilis varustus (jäigad osad luude küljes, sidumispoosi ruumis) ----------
  const pool = []; let poolI = 0, poolFrame = -1;
  const GEAR_T = [1, 1, 1, 0];
  function buildGear(T) {
    const out = [];
    const F = T.fit, bp = (n) => { const k = T.idxOf[n]; return [T.bp[k * 3], T.bp[k * 3 + 1], T.bp[k * 3 + 2]]; };
    const PLATE = [0.40, 0.41, 0.38], STRAP = [0.11, 0.11, 0.115], POUCH = [0.36, 0.33, 0.25], METAL = [0.30, 0.31, 0.33];
    const add = (jn, lvl, fn, tinted, need, items) => { if (T.idxOf[jn] === undefined) return; const b = new MB(); b.jit = 0.004; fn(b); out.push({ j: T.idxOf[jn], lvl, mesh: b.build(), tinted, need, items }); };
    // SDF-varustus (GEAR_DATA): kohalikus raamis mudel paigutatakse siduspoosi
    const GD = typeof GEAR_DATA !== 'undefined' ? GEAR_DATA : null, rawC = {};
    const raw = (k) => rawC[k] || (rawC[k] = decodeSdfRaw(GD[k].lod[0]));
    const addS = (jn, lvl, parts, tinted, need, items) => { if (T.idxOf[jn] === undefined) return; out.push({ j: T.idxOf[jn], lvl, mesh: sdfMerge(parts), tinted, need, items }); };
    const TM = (x, y, z, yaw = 0, pitch = 0) => M4.compose(M4.create(), x, y, z, yaw, pitch, 0);
    // kahepoolne kuppel: lo(a) = alumine laiuskraad suunas a (a=0 ette)
    const dome = (b, c, rx, ry, rz, lo, hi = Math.PI / 2, seg = 16, rings = 6, a0 = 0, a1 = TAU) => {
      for (let i = 0; i < seg; i++) {
        const u0 = a0 + (a1 - a0) * i / seg, u1 = a0 + (a1 - a0) * (i + 1) / seg;
        const P = (a, k) => { const l = lo(a), t = l + (hi - l) * k; return [c[0] + Math.sin(a) * Math.cos(t) * rx, c[1] + Math.sin(t) * ry, c[2] + Math.cos(a) * Math.cos(t) * rz]; };
        for (let j = 0; j < rings; j++) { const A = P(u0, j / rings), B = P(u1, j / rings), C = P(u1, (j + 1) / rings), D = P(u0, (j + 1) / rings); b.quad(A, B, C, D).quad(A, D, C, B); }
      }
      return b;
    };
    if (F.waist) {
      const [y, hw, zf, zb] = F.waist, cz = (zf + zb) / 2, ra = Math.min(hw, 0.17) + 0.018, rb = (zf - zb) / 2 + 0.018;
      add('Hips', 1, (b) => {
        const n = 16;
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
          const x0 = Math.sin(a0) * ra, z0 = cz + Math.cos(a0) * rb, x1 = Math.sin(a1) * ra, z1 = cz + Math.cos(a1) * rb;
          const len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0);
          b.push().tf((x0 + x1) / 2, y - 0.025, (z0 + z1) / 2, yaw).color(STRAP).boxB(0, 0, 0, 0.012, 0.05, len + 0.006).pop();
        }
        if (GD) return;
        b.color(METAL).boxB(0, y - 0.03, zf + 0.012, 0.06, 0.06, 0.02); // pannal
        for (const [a, w, h] of [[1.25, 0.08, 0.09], [-1.25, 0.08, 0.09], [2.3, 0.07, 0.08], [-2.3, 0.07, 0.08], [Math.PI, 0.12, 0.08]]) {
          const x = Math.sin(a) * (ra + 0.02), z = cz + Math.cos(a) * (rb + 0.02);
          b.push().tf(x, y - 0.075, z, a).color(POUCH, MAT.RUST).boxB(0, 0, 0, w, h, 0.045).color(STRAP).boxB(0, h - 0.012, 0.005, w + 0.004, 0.022, 0.05).pop();
        }
      });
      if (GD) {
        const parts = [[raw('buckle'), TM(0, y, zf + 0.01)]];
        for (const [a, w, h] of [[1.25, 0.08, 0.09], [-1.25, 0.08, 0.09], [2.3, 0.07, 0.08], [-2.3, 0.07, 0.08], [Math.PI, 0.12, 0.08]]) {
          const x = Math.sin(a) * (ra + 0.004), z = cz + Math.cos(a) * (rb + 0.004);
          parts.push([raw('pouch'), TM(x, y - 0.075, z, a), w / 0.084, h / 0.094, 1]);
        }
        addS('Hips', 1, parts);
      }
    }
    if (T.idxOf.Head !== undefined) {
      const h = bp('Head');
      add('Head', 1, (b) => {
        b.color(STRAP).boxB(h[0] + 0.074, h[1] + 0.06, h[2] + 0.005, 0.018, 0.04, 0.034);
        b.color(METAL).boxB(h[0] + 0.078, h[1] + 0.07, h[2] + 0.005, 0.014, 0.022, 0.022);
        b.push().tf(h[0] + 0.075, h[1] + 0.06, h[2] + 0.02, -0.55, 0.12, 0).color(STRAP).boxB(0, 0, 0, 0.008, 0.008, 0.085).pop();
        b.color([0.9, 0.3, 0.1], MAT.GLOW).boxB(h[0] + 0.092, h[1] + 0.085, h[2] - 0.005, 0.004, 0.008, 0.008);
      });
    }
    // ---- nähtav varustus: kiivrid, seljakotid, kindad ----
    if (T.idxOf.Head !== undefined) {
      // Vitruviani kolba keskpunkt peaaluse luu suhtes (kiiver mõõdetakse tegelase pikkuse järgi)
      const hk = (T.height || 1.75) / 1.75, h = bp('Head'), c = [h[0], h[1] + 0.104 * hk, h[2] + 0.024 * hk];
      const lo = (a) => -0.42 + 0.5 * Math.max(0, Math.cos(a)) ** 2;
      const HEL = [0.30, 0.31, 0.27], HEL2 = [0.24, 0.25, 0.26];
      if (GD) {
        addS('Head', 0, [[raw('helmet'), TM(c[0], c[1], c[2]), hk, hk, hk]], false, 'helmet', ['helmet']);
        addS('Head', 0, [[raw('helmet2'), TM(c[0], c[1], c[2]), hk, hk, hk]], false, 'helmet', ['helmet2']);
        addS('Head', 0, [[raw('helmet3'), TM(c[0], c[1], c[2]), hk, hk, hk]], false, 'helmet', ['helmet3']);
      } else add('Head', 0, (b) => {
        b.color(HEL, MAT.WORN); dome(b, c, 0.112, 0.118, 0.128, lo);
        b.color(HEL, MAT.WORN); dome(b, c, 0.118, 0.06, 0.134, (a) => lo(a) - 0.02, lo(0) + 0.12, 16, 1); // serv
        b.color(STRAP).boxB(c[0] + 0.104, c[1] - 0.09, c[2], 0.012, 0.08, 0.02).boxB(c[0] - 0.104, c[1] - 0.09, c[2], 0.012, 0.08, 0.02);
        b.color(METAL).boxB(c[0], c[1] + 0.07, c[2] + 0.115, 0.05, 0.035, 0.03); // öövaate kinnitus
        b.color(HEL, MAT.RUST).boxB(c[0] + 0.07, c[1] + 0.02, c[2] - 0.07, 0.03, 0.05, 0.05);
      }, false, 'helmet', ['helmet']);
      if (!GD) add('Head', 0, (b) => { // Doom 3 visiirkiiver
        b.color(HEL2, MAT.WORN); dome(b, c, 0.118, 0.125, 0.132, (a) => -0.6 + 0.55 * Math.max(0, Math.cos(a)) ** 4);
        b.color([0.04, 0.045, 0.05], MAT.N); dome(b, [c[0], c[1] - 0.005, c[2] + 0.004], 0.122, 0.13, 0.136, () => -0.62, -0.02, 10, 2, -1.05, 1.05);
        b.color([1.0, 0.55, 0.15], MAT.GLOW); dome(b, [c[0], c[1] - 0.005, c[2] + 0.006], 0.124, 0.13, 0.138, () => -0.2, -0.17, 8, 1, -0.8, 0.8);
        b.color(HEL2, MAT.RUST).boxB(c[0], c[1] + 0.1, c[2] - 0.02, 0.03, 0.04, 0.2);
        for (const sx of [-1, 1]) b.color(METAL).boxB(c[0] + sx * 0.118, c[1] - 0.04, c[2] - 0.01, 0.02, 0.06, 0.06);
      }, false, 'helmet', ['helmet2']);
      if (!GD) add('Head', 0, (b) => { // eksokiiver: suletud, sensorvisiir
        b.color([0.2, 0.22, 0.24], MAT.WORN); dome(b, c, 0.124, 0.132, 0.14, (a) => -0.72 + 0.1 * Math.max(0, Math.cos(a)) ** 2);
        b.color([0.05, 0.06, 0.07], MAT.N); dome(b, [c[0], c[1] - 0.01, c[2] + 0.006], 0.128, 0.136, 0.144, () => -0.5, -0.08, 10, 2, -1.1, 1.1);
        b.color([0.45, 0.85, 1.0], MAT.GLOW); dome(b, [c[0], c[1] - 0.01, c[2] + 0.008], 0.13, 0.138, 0.146, () => -0.3, -0.24, 10, 1, -0.9, 0.9);
        b.color([0.12, 0.13, 0.14], MAT.RUST).boxB(c[0], c[1] - 0.17, c[2] + 0.06, 0.12, 0.06, 0.1);
        for (const sx of [-1, 1]) b.color([0.3, 0.32, 0.34]).boxB(c[0] + sx * 0.13, c[1] - 0.06, c[2] - 0.02, 0.03, 0.09, 0.09);
        b.color([0.25, 0.26, 0.27]).boxB(c[0] + 0.1, c[1] + 0.08, c[2] - 0.06, 0.008, 0.16, 0.008);
      }, false, 'helmet', ['helmet3']);
    }
    if (F.chest && T.idxOf.Spine2 !== undefined) {
      const [cy, , , zb] = F.chest;
      const bag = (big) => (b) => {
        const w = big ? 0.34 : 0.27, hh = big ? 0.5 : 0.32, d = big ? 0.2 : 0.14, z = zb - d / 2 - 0.035, y0 = cy - (big ? 0.36 : 0.22);
        b.color([0.27, 0.26, 0.20], MAT.WORN).boxB(0, y0, z, w, hh, d);
        b.color([0.22, 0.21, 0.17], MAT.WORN).boxB(0, y0 + hh - 0.02, z - 0.01, w + 0.02, 0.07, d + 0.03); // kaas
        b.color(POUCH, MAT.RUST).boxB(0, y0 + 0.05, z - d / 2 - 0.03, w * 0.7, hh * 0.38, 0.06);
        if (big) { for (const sx of [-1, 1]) b.color(POUCH, MAT.RUST).boxB(sx * (w / 2 + 0.035), y0 + 0.06, z, 0.07, hh * 0.5, d * 0.7); b.color([0.2, 0.24, 0.2]).cyl(0, y0 + hh + 0.06, z, 0.05, 0.05, 0.02, 8); b.push().tf(0, y0 + hh + 0.08, z, 0, 0, Math.PI / 2).color([0.2, 0.24, 0.2]).cyl(0, -0.17, 0, 0.055, 0.055, 0.34, 8).pop(); }
        for (const sx of [-1, 1]) b.color(STRAP).boxB(sx * 0.09, y0 + hh * 0.2, zb - 0.02, 0.035, hh * 0.85, 0.025);
        b.color(METAL).boxB(0, y0 + hh * 0.55, z - d / 2 - 0.004, 0.05, 0.02, 0.01);
      };
      if (GD) {
        addS('Spine2', 0, [[raw('packBig'), TM(0, cy - 0.36, zb - 0.03)]], false, 'pack', ['pack', 'pack_m']);
        addS('Spine2', 0, [[raw('packSmall'), TM(0, cy - 0.22, zb - 0.03)]], false, 'pack', ['pack_s']);
      } else {
        add('Spine2', 0, bag(true), false, 'pack', ['pack', 'pack_m']);
        add('Spine2', 0, bag(false), false, 'pack', ['pack_s']);
      }
    }
    for (const side of ['Left', 'Right']) {
      const hn = side + 'Hand'; if (T.idxOf[hn] === undefined || T.idxOf[side + 'ForeArm'] === undefined) continue;
      const p = bp(hn), f = bp(side + 'ForeArm');
      const dx = p[0] - f[0], dy = p[1] - f[1], dz = p[2] - f[2], L = Math.hypot(dx, dy, dz) || 1;
      const yaw = Math.atan2(dx, dz), pitch = -Math.asin(dy / L);
      if (GD) { addS(hn, 0, [[raw('glove'), TM(p[0], p[1], p[2], yaw, pitch)]], false, 'gloves', ['gloves', 'gloves2']); continue; }
      add(hn, 0, (b) => {
        b.push().tf(p[0], p[1], p[2], yaw, pitch, 0);
        b.color([0.09, 0.09, 0.085], MAT.WORN).box(0, 0.0, 0.045, 0.085, 0.045, 0.1); // kinnas
        b.color([0.2, 0.2, 0.19], MAT.WORN).box(0, 0.02, 0.05, 0.07, 0.015, 0.06); // knokikaitse
        b.color(STRAP).box(0, 0, -0.025, 0.08, 0.055, 0.05); // mansett
        b.pop();
      }, false, 'gloves', ['gloves', 'gloves2']);
    }
    return out;
  }
  function gearExtras(T, st, m, outList) {
    outList.length = 0;
    if (!T.gear) return outList;
    for (const g of T.gear) {
      if (g.lvl > st.gear || (g.need && !(st.eq && g.items.includes(st.eq[g.need])))) continue;
      const mm = new Float32Array(16); M4.mul(mm, m, T.sm.subarray(g.j * 16, g.j * 16 + 16));
      outList.push({ mesh: g.mesh, m: mm, tint: g.tinted ? (st.gearTint || GEAR_T) : GEAR_T });
    }
    return outList;
  }

  // ---------- välimus ----------
  const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  function defaultTints(T) { if (!T._dt) T._dt = makeTints(T.name, { }); return T._dt; }
  // look: {skin, hair, hairStyle, beard, top, bottom, shoes, armor, accent}
  const ARMOR_BASE = [0.23, 0.245, 0.21], STEEL = [0.17, 0.18, 0.19];
  function beardStyle(look) { if (look.type !== 'male') return 'none'; if (look.beardStyle) return look.beardStyle; return look.beard ? 'full' : 'none'; }
  function makeTints(type, look, out) {
    const T = types[type] || types.male;
    const t = out || new Float32Array(128);
    for (let i = 0; i < 32; i++) { t[i * 4] = 1; t[i * 4 + 1] = 1; t[i * 4 + 2] = 1; t[i * 4 + 3] = 0; }
    const set = (reg, rgb, mode) => { t[reg * 4] = rgb[0]; t[reg * 4 + 1] = rgb[1]; t[reg * 4 + 2] = rgb[2]; t[reg * 4 + 3] = mode; };
    const hide = (reg) => { t[reg * 4 + 3] = -1; };
    const a = T.avg || {};
    if (look.skin && a.skin) set(REG.skin, [look.skin[0] / a.skin[0], look.skin[1] / a.skin[1], look.skin[2] / a.skin[2]], 0);
    // kulmud (maalitud nahale): nahatoon, veidi juuksevärvi poole
    if (REG.brow !== undefined && look.skin && a.skin && a.brow) { const hc = look.hair || [0.2, 0.14, 0.1], k = 0.3; set(REG.brow, [0, 1, 2].map((i) => (look.skin[i] * (1 - k) + hc[i] * k) / a.skin[i]), 0); }
    const gray = (reg, key, col) => { if (!col) return; const L = Math.max(0.05, lum(a[key] || [0.5, 0.5, 0.5])); set(reg, [col[0] / L, col[1] / L, col[2] / L], 1); };
    gray(REG.top, 'top', look.top); gray(REG.bottom, 'bottom', look.bottom); gray(REG.shoes, 'shoes', look.shoes);
    t.hs = ''; t.bs = '';
    if (type === 'male' || type === 'female') {
      const eq0 = look.eq || {}, hc = look.hair || [0.2, 0.14, 0.1], sk = look.skin || [0.87, 0.67, 0.53];
      const skinT = look.skin && a.skin ? [sk[0] / a.skin[0], sk[1] / a.skin[1], sk[2] / a.skin[2]] : [1, 1, 1];
      if (T.hairR) {
        // v2: soeng ja habe = eraldi indeksivahemikud; juuksed alfa-testiga (režiim 1.25)
        const keys = Object.keys(T.hairR);
        let st = look.hairStyle === 'bald' ? 'bald' : T.hairR[look.hairStyle] ? look.hairStyle : (type === 'male' ? 'short' : 'bob');
        if (eq0.helmet) st = 'bald';
        t.hs = st === 'bald' ? '' : st;
        gray(REG.hair, 'hair', hc); t[REG.hair * 4 + 3] = 1.25;
        const bst = beardStyle(look);
        t.bs = T.beardR && T.beardR[bst] && eq0.helmet !== 'helmet2' ? bst : '';
        if (REG.beard_f !== undefined) { gray(REG.beard_f, 'beard3d', [hc[0] * 0.92, hc[1] * 0.92, hc[2] * 0.92]); t[REG.beard_f * 4 + 3] = 1.25; }
        // kõrred, peanahk, kulmud: nahatoon (tihedus maski G/B kanalis teeb ülemineku sujuvaks)
        for (const r of [REG.beard, REG.scalp]) if (r !== undefined) set(r, skinT, 0);
        const bk = type !== 'male' ? 0 : { none: 0, stubble: 0.4, moustache: 0.16, goatee: 0.18, vandyke: 0.16, chinstrap: 0.22, mutton: 0.22, short: 0.7, full: 0.8, long: 0.8 }[bst] || 0;
        const sk2 = st === 'bald' ? 0.1 : st === 'buzz' ? 0.85 : 0.7;
        set(30, [hc[0] * 0.85, hc[1] * 0.85, hc[2] * 0.85], bk);
        set(31, [hc[0] * 0.9, hc[1] * 0.9, hc[2] * 0.9], sk2);
      } else {
        const names = T.hairStyles.map(([n]) => n);
        const st = look.hairStyle === 'bald' ? 'bald' : names.includes(look.hairStyle) ? look.hairStyle : (type === 'male' ? 'short' : 'bun');
        for (const [name, reg] of T.hairStyles) { if (name === st && st !== 'bald') gray(reg, 'hair', look.hair); else hide(reg); }
        if (eq0.helmet) for (const [, reg] of T.hairStyles) hide(reg);
      }
      // Doom 3 soomus: vormitud plaadid (regioon armor = rinnaplaat, pads = õlakud/käsivarred/põlved)
      const gear = Look.gearLvl(look), gt = Look.gearTint(look), eq = look.eq || {};
      if (eq.boots) set(REG.shoes, [0.07 / Math.max(0.05, lum(a.shoes || [0.1, 0.1, 0.1])), 0.07 / Math.max(0.05, lum(a.shoes || [0.1, 0.1, 0.1])), 0.065 / Math.max(0.05, lum(a.shoes || [0.1, 0.1, 0.1]))], 2);
      const pc = [ARMOR_BASE[0] * gt[0], ARMOR_BASE[1] * gt[1], ARMOR_BASE[2] * gt[2]];
      // kolm astet: 1 kerge (vöö), 2 keskmine (kuulivest + põlve-/säärekaitsmed), 3 raske (täismetallist turvis)
      if (REG.heavy !== undefined && a.heavy) {
        if (gear === 2) { gray(REG.armor, 'armor', pc); } else hide(REG.armor);
        if (REG.pads !== undefined) { if (gear === 2) { gray(REG.pads, 'pads', [pc[0] * 0.75, pc[1] * 0.75, pc[2] * 0.75]); t[REG.pads * 4 + 3] = 2; } else hide(REG.pads); }
        if (gear >= 3) { gray(REG.heavy, 'heavy', [STEEL[0] * gt[0], STEEL[1] * gt[1], STEEL[2] * gt[2]]); t[REG.heavy * 4 + 3] = 2; } else hide(REG.heavy);
      } else {
        if (gear >= 2) { gray(REG.armor, 'armor', pc); t[REG.armor * 4 + 3] = 2; } else hide(REG.armor);
        if (REG.pads !== undefined) { if (gear >= 3) { gray(REG.pads, 'pads', pc); t[REG.pads * 4 + 3] = 2; } else hide(REG.pads); }
      }
      gray(REG.accent, 'accent', look.accent || [0.85, 0.42, 0.08]);
      hide(REG.hat);
    } else if (type === 'soldier') {
      if (look.armor) gray(REG.armor, 'armor', look.armor);
      if (look.accent) gray(REG.accent, 'accent', look.accent);
    }
    return t;
  }
  return { init, draw, drawFP, portrait, makeTints, types, clips, get ready() { return ready; }, REG };
})();
