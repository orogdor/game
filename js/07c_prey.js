// ============================================================
//  SAAKLOOM: kõrbekits ja jäär (orgaaniline SDF-mudel, 11 liigutatavat osa, 2 LOD-taset)
// ============================================================
const Prey = (() => {
  let P = null;
  function decode(L) {
    const u8 = bytesOf(L.b);
    const nv = L.nv, nt = L.nt; let o = 0;
    const q = new Uint16Array(u8.buffer.slice(o, o + nv * 6)); o += nv * 6;
    const nq = new Int8Array(u8.buffer.slice(o, o + nv * 3)); o += nv * 3;
    const col = new Uint8Array(u8.buffer.slice(o, o + nv * 4)); o += nv * 4;
    const idx = new Uint16Array(u8.buffer.slice(o, o + nt * 6));
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } // CCW esikülg
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
    for (let i = 0; i < nv * 3; i++) { pos[i] = L.mn[i % 3] + q[i] * L.sc; nor[i] = nq[i] / 127; }
    return new GFX.Mesh({ pos, nor, col, idx });
  }
  function init() {
    if (P || typeof PREY_DATA === 'undefined') return;
    P = {};
    for (const k in PREY_DATA) { const d = PREY_DATA[k]; P[k] = { piv: d.piv, m: d.lod.map(decode) }; }
  }
  const rel = (a, b) => [P[a].piv[0] - P[b].piv[0], P[a].piv[1] - P[b].piv[1], P[a].piv[2] - P[b].piv[2]];
  const R = M4.create();
  const HURT_T = [1.6, 0.6, 0.5, 0.2];
  function draw(e) {
    if (!P) return false;
    if (!e.pm) { e.pm = []; for (let i = 0; i < 11; i++) e.pm.push(M4.create()); }
    const ms = e.pm, tint = e.hurtT > 0 ? HURT_T : null;
    const ram = e.kind === 'ram', sc = ram ? 1.18 : 1.0 * (e.size || 1);
    const lod = Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 32 ? 1 : 0;
    const dead = !e.alive, dk = dead ? Math.min(1, e.deathT * 3) : 0;
    const ph = e.phase, mv = e.moveAmt || 0, t = performance.now() / 1000 + e.id * 1.7;
    const run = clamp((e.speed || 0) / 8, 0, 1) * mv;
    M4.compose(R, e.pos.x, e.pos.y + dk * 0.24 * sc, e.pos.z, e.yaw, 0, dk * Math.PI / 2, sc, sc, sc);
    const bob = Math.abs(Math.sin(ph * 2)) * (0.03 + 0.05 * run) * mv;
    const graze = !dead && e.grazing > 0 ? 1 : 0;
    const b = P.body.piv;
    M4.child(ms[0], R, b[0], b[1] + bob + Math.sin(t * 1.6) * 0.006, b[2], 0, graze * 0.08 + 0.06 * run, Math.sin(ph) * 0.03 * mv);
    GFX.draw(P.body.m[lod], ms[0], tint);
    // kael + pea
    let r = rel('head', 'body');
    const charge = e.state === 'charge' ? 0.55 : 0;
    const look = graze ? Math.sin(t * 0.5) * 0.15 : Math.sin(t * 0.37) * 0.35 * (1 - mv);
    const chew = graze ? Math.sin(t * 5) * 0.04 : 0;
    M4.child(ms[1], ms[0], r[0], r[1], r[2], look, graze * 1.55 + charge - 0.06 * run + Math.sin(ph * 2) * 0.05 * mv + chew + dk * 0.6, 0);
    GFX.draw((ram && P.headRam ? P.headRam : P.head).m[lod], ms[1], tint);
    r = rel('tail', 'body');
    M4.child(ms[2], ms[0], r[0], r[1], r[2], Math.sin(t * 3.1) * 0.35 * (0.4 + mv), -0.2 * run, 0); GFX.draw(P.tail.m[lod], ms[2], tint);
    // jalad: diagonaalne sammumine
    const L = [['UF', 'LF', 0], ['UB', 'LB', Math.PI]];
    let n = 3;
    for (let s = 0; s < 2; s++) {
      const k = s ? 'R' : 'L';
      for (const [u, l, off] of L) {
        const p = ph + off + s * Math.PI;
        const sw = Math.sin(p), lift = Math.max(0, Math.cos(p));
        const front = u === 'UF';
        const up = P['leg' + u + k];
        M4.child(ms[n], R, up.piv[0], up.piv[1] + bob, up.piv[2], 0, sw * (0.45 + 0.25 * run) * mv + (dead ? (front ? -0.7 : 0.6) * dk : 0), 0);
        GFX.draw(up.m[lod], ms[n], tint);
        const rr = rel('leg' + l + k, 'leg' + u + k);
        M4.child(ms[n + 1], ms[n], rr[0], rr[1], rr[2], 0, (front ? 1 : -1) * lift * (0.6 + 0.5 * run) * mv + (dead ? (front ? 0.9 : -0.6) * dk : 0), 0);
        GFX.draw(P['leg' + l + k].m[lod], ms[n + 1], tint);
        n += 2;
      }
    }
    return true;
  }
  return { init, draw };
})();
