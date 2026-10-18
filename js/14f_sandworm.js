// ============================================================
//  LIIVAUSS: baasi süda (tuum) teeb heli, mis hoiab liivaussid ehitistest eemal.
//  Kui süda hävitatakse, tõuseb liivast hiiglaslik uss ja neelab baasi.
// ============================================================
const Sandworm = (() => {
  let M = null;
  const active = [];
  const SEG = 34;
  function initMeshes() {
    if (M) return M;
    M = {};
    const SKIN = [0.42, 0.3, 0.22], SKIN2 = [0.3, 0.2, 0.15], BONE = [0.86, 0.8, 0.66];
    // lüli: piki z-telge, pikkus 1, raadius 1 (skaleeritakse)
    let b = new MB(); b.jit = 0;
    b.push().tf(0, 0, 0, 0, Math.PI / 2, 0);
    b.color(SKIN, MAT.WORN).cyl(0, -0.5, 0, 1, 1, 1, 18, false);
    b.color(SKIN2, MAT.WORN).cyl(0, -0.5, 0, 1.06, 1.06, 0.16, 18, false);
    b.color(SKIN2, MAT.WORN).cyl(0, 0.3, 0, 1.04, 1.04, 0.12, 18, false);
    b.pop();
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.color(BONE, MAT.WORN).push().tf(Math.cos(a) * 1.0, Math.sin(a) * 1.0, -0.3, 0, 0, a - Math.PI / 2).cyl(0, 0, 0, 0.12, 0.0, 0.5, 6, true).pop(); }
    M.seg = b.build();
    // pea: avatud suu, hambaread, helendav kõri
    b = new MB(); b.jit = 0;
    b.push().tf(0, 0, 0, 0, Math.PI / 2, 0);
    b.color(SKIN, MAT.WORN).cyl(0, -0.5, 0, 1, 1.35, 0.9, 18, false);
    b.color([0.6, 0.12, 0.1], MAT.MATTE).cyl(0, -0.45, 0, 0.95, 1.25, 0.85, 18, false);
    b.color([1.0, 0.45, 0.2], MAT.GLOW).cyl(0, -0.5, 0, 0.55, 0.55, 0.05, 14, true);
    b.pop();
    for (let ring = 0; ring < 3; ring++) for (let k = 0; k < 14; k++) {
      const a = k / 14 * TAU + ring * 0.2, rr = 1.25 - ring * 0.2, z = 0.38 - ring * 0.18;
      b.color(BONE, MAT.WORN).push().tf(Math.cos(a) * rr, Math.sin(a) * rr, z, 0, 0, a + Math.PI / 2).push().tf(0, 0, 0, 0, -0.6, 0).cyl(0, 0, 0, 0.09, 0.0, 0.5 - ring * 0.08, 5, true).pop().pop();
    }
    // neli "huult" (lõualaba) avanevad väljapoole
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; b.color(SKIN2, MAT.WORN).push().tf(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.4, 0, 0, a).push().tf(0, 0, 0, 0, -0.5, 0).box(0, 0.05, 0.6, 1.1, 0.12, 1.3).pop().pop(); }
    M.head = b.build();
    return M;
  }
  // x,z: baasi keskpunkt. o.onBite – kui pea tabab baasi; o.onDone – kui uss on kadunud
  function devour(x, z, o) {
    if (!M) initMeshes();
    const yaw = Math.atan2(GFX.cam.pos.x - x, GFX.cam.pos.z - z) + Math.PI / 2 + rand(-0.4, 0.4);
    const w = { x, z, yaw, t: 0, dur: 11, R: o && o.R || 55, H: 48, rad: 6.5, bit: false, o: o || {}, ms: Array.from({ length: SEG + 1 }, () => M4.create()) };
    active.push(w);
    UI.banner('SANDWORM', 'The heart went silent. Something huge is coming up through the sand.', 'danger');
    Audio2.alarm && Audio2.alarm();
    return w;
  }
  // kaar: tõuseb liivast A juures, kõrgub baasi kohal, sukeldub B juures
  function pathAt(w, u) {
    const fx = Math.sin(w.yaw), fz = Math.cos(w.yaw);
    const x = w.x + fx * (u - 0.55) * w.R * 2, z = w.z + fz * (u - 0.55) * w.R * 2;
    const g = World.heightAt(x, z);
    const y = g - 10 + Math.sin(Math.PI * clamp(u, 0, 1)) * (w.H + 10);
    return { x, y, z, g };
  }
  function update(dt) {
    for (let i = active.length - 1; i >= 0; i--) {
      const w = active[i];
      w.t += dt;
      const head = clamp((w.t - 0.8) / (w.dur - 2.5), -0.2, 1.4) * 1.0;
      const d = Math.hypot(Player.pos.x - w.x, Player.pos.z - w.z);
      if (d < 600) UI.shake(Math.min(0.9, 0.35 + 60 / Math.max(60, d)) * (w.t < w.dur - 0.5 ? 1 : 0.3) * dt * 6);
      // liiv keeb ussi sisse- ja väljumiskohtades
      for (const u of [0, 1]) { const p = pathAt(w, u); if (Math.random() < 0.6) FX.dust(p.x + rand(-6, 6), p.g + 0.5, p.z + rand(-6, 6), 6, 4); }
      if (!w.bit && head >= 0.55) {
        w.bit = true;
        for (let k = 0; k < 8; k++) FX.explosion(w.x + rand(-14, 14), World.heightAt(w.x, w.z) + rand(1, 6), w.z + rand(-14, 14), [1, 0.6, 0.3], 3);
        Audio2.explode(w.x, w.z, true);
        if (w.o.onBite) w.o.onBite();
      }
      if (w.t >= w.dur) { active.splice(i, 1); if (w.o.onDone) w.o.onDone(); }
    }
  }
  function draw() {
    if (!active.length) return;
    for (const w of active) {
      const head = clamp((w.t - 0.8) / (w.dur - 2.5), -0.2, 1.4);
      for (let k = 0; k <= SEG; k++) {
        const u = head - k * 0.028;
        if (u < -0.05 || u > 1.05) continue;
        const p = pathAt(w, u), q = pathAt(w, u + 0.01);
        if (p.y < p.g - 9) continue;   // liiva all
        const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z, L = Math.hypot(dx, dy, dz) || 1;
        const yaw = Math.atan2(dx, dz), pitch = -Math.asin(dy / L);
        const r = w.rad * (k === 0 ? 1 : 1 - k / (SEG * 1.6));
        M4.compose(w.ms[k], p.x, p.y, p.z, yaw, pitch, k * 0.3, r, r, k === 0 ? r * 1.4 : r * 0.95 * 2.2);
        GFX.draw(k === 0 ? M.head : M.seg, w.ms[k], null, null, { rust: 0.6 });
      }
    }
  }
  function busy() { return active.length > 0; }
  function reset() { active.length = 0; }
  return { initMeshes, devour, update, draw, busy, reset };
})();
