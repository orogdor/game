// ============================================================
//  UUED TULNUKAD
//   lendur  – nahkhiire moodi happelendurid parvedes; sukelduvad ja hammustavad, siis tõusevad
//   põis    – aeglane mürgipõis; jõuab lähedale, paisub ja plahvatab (tulista eemalt – plahvatab ka siis)
//   mardikas – soomustatud piiramismardikas; esikilp peab kuule, loobib kaugelt happemürske ehitistele ja inimestele
// ============================================================
const Fauna = (() => {
  let M = null;
  const clouds = [];   // mürgipilved { x, y, z, r, t }
  function initMeshes() {
    if (M) return M;
    M = {};
    const CH = AS.CH, CH2 = AS.CH2, AC = AS.GLOW, EYE = AS.EYE, MEM = AS.MEM;
    let b = new MB(); b.jit = 0;   // lenduri keha
    b.color(CH, MAT.WORN).sphere(0, 0, 0, 0.35, 10, 7, 0.75); b.color(CH2, MAT.WORN).sphere(0, 0.05, 0.38, 0.22, 8, 6, 0.85);
    for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * 0.09, 0.1, 0.56, 0.04, 6, 4, 1);
    b.color(AC, MAT.GLOW).sphere(0, -0.05, -0.32, 0.16, 8, 5, 1);
    b.color(CH, MAT.WORN).push().tf(0, 0, -0.45, 0, -1.4, 0).cyl(0, 0, 0, 0.08, 0.0, 0.7, 6, true).pop();
    M.glider = b.build();
    b = new MB(); b.jit = 0;   // tiib (+x poole), pöörleb ümber z
    b.color(MEM, MAT.MATTE).box(0.75, 0, 0, 1.5, 0.03, 0.8); b.color(CH, MAT.WORN).box(0.75, 0.02, 0.38, 1.5, 0.06, 0.06);
    for (let k = 0; k < 3; k++) b.color(CH, MAT.WORN).push().tf(0.5 + k * 0.45, 0.02, 0.05, 0, 0, 0).box(0, 0, 0, 0.04, 0.05, 0.75).pop();
    M.wing = b.build();
    b = new MB(); b.jit = 0;   // mürgipõis: lihakas kott, kõhtmikul jalakesed
    b.color(AS.CH2, MAT.WORN).sphere(0, 1.3, 0, 1.0, 14, 9, 1);
    b.color([0.62, 0.95, 0.25], MAT.GLOW).sphere(0, 1.3, 0, 0.82, 12, 8, 1.05);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.color(AS.PLATE, MAT.WORN).push().tf(Math.cos(a) * 0.95, 1.3, Math.sin(a) * 0.95, 0, 0, 0).sphere(0, 0, 0, 0.22, 6, 4, 1).pop(); }
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; b.color(CH, MAT.WORN).push().tf(Math.cos(a) * 0.5, 0.45, Math.sin(a) * 0.5, 0, 0, 0).cyl(0, -0.45, 0, 0.06, 0.03, 0.6, 5, true).pop(); }
    b.color(EYE, MAT.GLOW).sphere(0, 1.6, 0.92, 0.09, 6, 4, 1);
    M.bloat = b.build();
    b = new MB(); b.jit = 0;   // mardikas: kõrge kilp ees, kitiinkest, mortiir seljal
    b.color(AS.CH, MAT.WORN).sphere(0, 1.1, -0.3, 1.5, 14, 9, 0.62);
    for (let k = 0; k < 5; k++) b.color(AS.CH2, MAT.WORN).push().tf(0, 1.1, -1.3 + k * 0.55, 0, 0, 0).box(0, 0.75, 0, 2.2 - Math.abs(k - 2) * 0.3, 0.12, 0.45).pop();
    b.color(AS.PLATE, MAT.WORN).push().tf(0, 1.2, 1.25, 0, -0.35, 0).box(0, 0, 0, 2.4, 1.8, 0.35).pop();   // esikilp
    for (let k = 0; k < 4; k++) b.color(AS.BONE, MAT.WORN).push().tf(-0.9 + k * 0.6, 2.1, 1.25, 0, -0.7, 0).cyl(0, 0, 0, 0.1, 0, 0.45, 6, true).pop();
    for (const sx of [-1, 1]) b.color(EYE, MAT.GLOW).sphere(sx * 0.35, 0.9, 1.45, 0.08, 6, 4, 1);
    b.color(AS.CH, MAT.WORN).push().tf(0, 1.9, -0.6, 0, 0.6, 0).cyl(0, 0, 0, 0.35, 0.3, 1.1, 10, true).pop();   // mortiiritoru
    b.color(AC, MAT.GLOW).push().tf(0, 1.9, -0.6, 0, 0.6, 0).cyl(0, 1.05, 0, 0.26, 0.26, 0.06, 10, true).pop();
    M.beetle = b.build();
    b = new MB(); b.jit = 0; b.color(AS.CH, MAT.WORN).cyl(0, -0.9, 0, 0.12, 0.06, 0.95, 6, true); M.bleg = b.build();
    b = new MB(); b.jit = 0; b.color(AC, MAT.GLOW).sphere(0, 0, 0, 0.35, 8, 5, 1); M.glob = b.build();
    return M;
  }

  const isPrey = (o) => o.alive && !o.inVehicle && (o.kind === 'human' || (o.kind === 'player' && !Player.dead && G.mode !== 'build'));
  function nearest(e, r) { let best = null, bd = r; for (const o of Ents.list) { if (!isPrey(o)) continue; const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z); if (d < bd) { bd = d; best = o; } } return best; }

  // ---------- lendur ----------
  function spawnFlock(x, z) {
    const n = randi(3, 5);
    for (let k = 0; k < n; k++) { const e = Ents.spawn('glider', 'wild', x + rand(-6, 6), z + rand(-6, 6), { maxHp: 38, radius: 0.6, home: { x, z }, alt: rand(9, 14), ang: rand(0, TAU), state: 'circle', cool: 0 }); e.hp = e.maxHp; e.pos.y = World.heightAt(e.pos.x, e.pos.z) + e.alt; }
  }
  function gliderAI(e, dt) {
    e.cool -= dt; e.flap = (e.flap || 0) + dt * (e.state === 'dive' ? 4 : 9);
    const g = World.heightAt(e.pos.x, e.pos.z);
    if (e.state === 'circle') {
      e.ang += dt * 0.6;
      const tx = e.home.x + Math.cos(e.ang) * 16, tz = e.home.z + Math.sin(e.ang) * 16;
      moveTo(e, tx, tz, g + e.alt, 7, dt);
      if ((e.scan = (e.scan || 0) - dt) <= 0) { e.scan = 0.5; const t = nearest(e, 32); if (t) { for (const o of Ents.list) if (o.kind === 'glider' && o.alive && Math.hypot(o.home.x - e.home.x, o.home.z - e.home.z) < 2) { o.state = 'dive'; o.target = t; o.cool = rand(0, 1.5); } } }
      return;
    }
    const t = e.target;
    if (!t || !t.alive || Math.hypot(t.pos.x - e.home.x, t.pos.z - e.home.z) > 90) { e.state = 'circle'; e.target = null; return; }
    if (e.state === 'climb') { moveTo(e, e.pos.x + Math.sin(e.yaw) * 10, e.pos.z + Math.cos(e.yaw) * 10, g + 9, 9, dt); if ((e.climbT -= dt) <= 0) e.state = 'dive'; return; }
    // sukeldumine sihtmärgi pihta
    const ty = t.pos.y + 1.2, d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    moveTo(e, t.pos.x, t.pos.z, e.cool > 0 ? g + 7 : ty, e.cool > 0 ? 6 : 13, dt);
    if (d < 1.6 && Math.abs(e.pos.y - ty) < 1.4 && e.cool <= 0) { Ents.damage(t, 10 * G.dk.edmg, e); e.cool = rand(2, 3.5); e.state = 'climb'; e.climbT = 1.5; Audio2.stalker(e.pos.x, e.pos.z); }
  }
  function moveTo(e, tx, tz, ty, sp, dt) {
    const dx = tx - e.pos.x, dz = tz - e.pos.z, d = Math.hypot(dx, dz) || 1;
    e.pos.x += dx / d * Math.min(d, sp * dt); e.pos.z += dz / d * Math.min(d, sp * dt);
    e.pos.y += (ty - e.pos.y) * Math.min(1, dt * 2.5);
    e.pos.y = Math.max(e.pos.y, World.heightAt(e.pos.x, e.pos.z) + 0.6);
    e.yaw += angDiff(e.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 5); e.moveAmt = 1; e.speed = sp;
  }

  // ---------- mürgipõis ----------
  function spawnBloat(x, z) { const e = Ents.spawn('bloat', 'wild', x, z, { maxHp: 60, radius: 1.0, home: { x, z }, state: 'idle', fuse: 0 }); e.hp = e.maxHp; return e; }
  function bloatAI(e, dt) {
    if (e.fuse > 0) { e.fuse -= dt; e.swell = 1 + (1.2 - e.fuse) * 0.35; if (e.fuse <= 0) { Ents.kill(e, null); } return; }
    if ((e.scan = (e.scan || 0) - dt) <= 0) { e.scan = 0.6; e.target = nearest(e, 36); }
    const t = e.target;
    if (t && t.alive) {
      const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
      if (d < 3.2) { e.fuse = 1.2; Audio2.stalker(e.pos.x, e.pos.z); return; }
      if (!e.path || Math.random() < dt) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; e.goal = null; }
      Ents.stepMove(e, dt, 2.4); e.speed = 2.4; return;
    }
    if (!e.path || Ents.arrived(e)) { if (Math.random() < dt * 0.3) Ents.goTo(e, e.home.x + rand(-20, 20), e.home.z + rand(-20, 20)); }
    else Ents.stepMove(e, dt, 0.9);
    e.speed = 0.9;
  }
  function explode(e) {
    if (e.popped) return; e.popped = true;
    const x = e.pos.x, y = e.pos.y + 1.3, z = e.pos.z;
    FX.explosion(x, y, z, [0.55, 1.0, 0.25], 1.6); FX.goo(x, y, z, [0.55, 1.0, 0.25], 30); Audio2.explode(x, z, false);
    for (const o of Ents.list) { if (!o.alive || o === e) continue; const d = Math.hypot(o.pos.x - x, o.pos.z - z); if (d < 6 && Math.abs(o.pos.y - e.pos.y) < 4) Ents.damage(o, 55 * (1 - d / 6) * G.dk.edmg + 5, e); }
    clouds.push({ x, y: y - 0.8, z, r: 4.5, t: 5 });
    e.remove = true;
  }

  // ---------- piiramismardikas ----------
  function spawnBeetle(x, z, raid) { const e = Ents.spawn('beetle', 'wild', x, z, { maxHp: 340, radius: 1.5, home: { x, z }, state: raid ? 'raid' : 'roam', cool: rand(1, 3), raid: !!raid }); e.hp = e.maxHp; return e; }
  function beetleTarget(e) {
    // ehitis (kahur, sein, värav) baasi lähedal; muidu inimene
    if (e.raid || Math.hypot(e.pos.x - Base.OX, e.pos.z - Base.OZ) < 90) {
      let best = null, bd = 60;
      for (const o of Base.objs.values()) { if (o.lv) continue; const c = Base.objCenter(o), d = Math.hypot(c.x - e.pos.x, c.z - e.pos.z); const w = OBJ[o.type].cat === 'kaitse' || OBJ[o.type].cat === 'vall' ? 0.6 : 1; if (d * w < bd) { bd = d * w; best = { obj: o, x: c.x, z: c.z }; } }
      const pc = typeof Rivals !== 'undefined' ? Rivals.playerCore : null;
      if (pc && pc.alive && Math.hypot(pc.pos.x - e.pos.x, pc.pos.z - e.pos.z) < 55) best = { core: pc, x: pc.pos.x, z: pc.pos.z };
      if (best) return best;
    }
    const t = nearest(e, 42); return t ? { ent: t, x: t.pos.x, z: t.pos.z } : null;
  }
  function beetleAI(e, dt) {
    e.cool -= dt;
    if ((e.scan = (e.scan || 0) - dt) <= 0) { e.scan = 1.0; e.tgt = beetleTarget(e); }
    const g = e.tgt;
    if (g && g.ent && g.ent.alive) { g.x = g.ent.pos.x; g.z = g.ent.pos.z; }
    if (!g) {
      const hx = e.raid ? Base.OX : e.home.x, hz = e.raid ? Base.OZ : e.home.z;
      if (!e.path || Ents.arrived(e)) Ents.goTo(e, hx + rand(-25, 25), hz + rand(-25, 25));
      Ents.stepMove(e, dt, e.raid ? 3.2 : 1.5); e.speed = e.raid ? 3.2 : 1.5; return;
    }
    const d = Math.hypot(g.x - e.pos.x, g.z - e.pos.z);
    Ents.face(e, g.x, g.z, dt, 2.5);
    if (d > 30) { if (!e.path || Math.random() < dt * 0.5) Ents.goTo(e, g.x, g.z); Ents.stepMove(e, dt, 3.2); e.speed = 3.2; }
    else if (d < 12) { const a = Math.atan2(e.pos.x - g.x, e.pos.z - g.z); e.path = [{ x: e.pos.x + Math.sin(a) * 6, z: e.pos.z + Math.cos(a) * 6 }]; e.pathI = 0; e.goal = null; Ents.stepMove(e, dt, 2.2); e.speed = 2.2; }
    else e.moveAmt = Math.max(0, e.moveAmt - dt * 3);
    // happemürsk kaarega
    if (d < 34 && e.cool <= 0) {
      e.cool = rand(3.2, 4.5); e.recoil = 0.4;
      const sx = e.pos.x - Math.sin(e.yaw) * 0.6, sy = e.pos.y + 2.8, sz = e.pos.z - Math.cos(e.yaw) * 0.6, tx = g.x + rand(-1.5, 1.5), tz = g.z + rand(-1.5, 1.5);
      const ty = World.heightAt(tx, tz) + 0.5, T = clamp(d / 14, 1.2, 2.6), gg = 12;
      Ents.projs.push({ x: sx, y: sy, z: sz, vx: (tx - sx) / T, vy: (ty - sy) / T + 0.5 * gg * T, vz: (tz - sz) / T, g: gg, life: 5, dmg: 22 * G.dk.edmg, owner: e, kind: 'acid', r: 0.45, delay: 0, splash: 4.5, onHit: mortarHit });
      Audio2.stalker(e.pos.x, e.pos.z);
    }
  }
  function mortarHit(p) {
    FX.goo(p.x, p.y, p.z, [0.55, 1.0, 0.25], 14);
    for (const o of Base.objs.values()) { const c = Base.objCenter(o); if (Math.hypot(c.x - p.x, c.z - p.z) < 3.5) { o.hp -= 40 * G.dk.edmg; if (o.hp <= 0 && Base.objs.has(o.id)) { FX.explosion(c.x, 1.2, c.z, [0.8, 0.6, 0.4], 0.6); UI.msg(OBJ[o.type].name + ' was dissolved by acid!', 'danger'); Base.removeObj(o.id); } } }
  }
  // esikilp: eest tulev kahju väheneb
  function armor(e, src) {
    if (e.kind !== 'beetle' || !src || !src.pos) return 1;
    const a = Math.atan2(src.pos.x - e.pos.x, src.pos.z - e.pos.z);
    return Math.abs(angDiff(e.yaw, a)) < 0.9 ? 0.3 : 1.25;
  }

  function update(e, dt) {
    if (e.kind === 'glider') gliderAI(e, dt);
    else if (e.kind === 'bloat') bloatAI(e, dt);
    else beetleAI(e, dt);
  }
  function hurt(e, src) {
    if (!src || !src.pos || !e.alive) return;
    if (e.kind === 'glider' && e.state === 'circle') { for (const o of Ents.list) if (o.kind === 'glider' && o.alive && Math.hypot(o.home.x - e.home.x, o.home.z - e.home.z) < 2) { o.state = 'dive'; o.target = src; } }
    if (e.kind === 'bloat' && !e.target) e.target = src;
    if (e.kind === 'beetle' && !e.tgt) e.tgt = { ent: src, x: src.pos.x, z: src.pos.z };
  }
  function onKill(e) {
    if (e.kind === 'bloat') { explode(e); return; }
    FX.goo(e.pos.x, e.pos.y + 0.6, e.pos.z, [0.55, 1.0, 0.25], e.kind === 'beetle' ? 24 : 8);
    if (e.kind === 'beetle') { e.acid = randi(4, 6); e.harvestable = true; }
  }
  function spheres(e, s) {
    const x = e.pos.x, y = e.pos.y, z = e.pos.z, fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
    if (e.kind === 'glider') s.push([x, y, z, 0.75, 1.3]);
    else if (e.kind === 'bloat') s.push([x, y + 1.3, z, 1.05 * (e.swell || 1), 1.5]);
    else { s.push([x - fz * 0, y + 1.2, z, 1.45, 1]); s.push([x + fx * 1.3, y + 1.2, z + fz * 1.3, 0.9, 0.6]); }
  }
  function draw(e) {
    if (!M) initMeshes();
    const ms = e.ms || (e.ms = Array.from({ length: 8 }, () => M4.create())), R0 = ms[7];
    const dead = !e.alive, tint = e.hurtT > 0 ? [1.6, 0.6, 0.5, 0.2] : dead ? [0.45, 0.42, 0.4, 0] : null;
    if (e.kind === 'glider') {
      let y = e.pos.y; if (dead) { e.fallY = (e.fallY === undefined ? e.pos.y : e.fallY); e.fallY = Math.max(World.heightAt(e.pos.x, e.pos.z) + 0.2, e.fallY - 0.25); y = e.fallY; }
      M4.compose(R0, e.pos.x, y, e.pos.z, e.yaw, e.state === 'dive' && !dead ? 0.35 : 0, dead ? 1.4 : 0);
      GFX.draw(M.glider, R0, tint, null, { rust: 0.1 });
      const fl = dead ? 0.2 : Math.sin(e.flap || 0) * 0.7;
      M4.child(ms[0], R0, 0.2, 0.05, 0, 0, 0, fl); GFX.draw(M.wing, ms[0], tint, null, { rust: 0.1 });
      M4.child(ms[1], R0, -0.2, 0.05, 0, Math.PI, 0, fl); GFX.draw(M.wing, ms[1], tint, null, { rust: 0.1 });
      return;
    }
    if (e.kind === 'bloat') {
      const sw = (e.swell || 1) * (1 + Math.sin(e.phase * 3) * 0.04);
      M4.compose(R0, e.pos.x, e.pos.y, e.pos.z, e.yaw, 0, 0, sw, sw, sw);
      GFX.draw(M.bloat, R0, e.fuse > 0 && Math.sin(e.fuse * 30) > 0 ? [1.8, 1.8, 0.8, 0.4] : tint, null, { rust: 0.1 });
      if (!dead && GFX.env.night > 0.3) GFX.addLight(e.pos.x, e.pos.y + 1.3, e.pos.z, 7, 0.5, 1.0, 0.3, 1.0);
      return;
    }
    M4.compose(R0, e.pos.x, e.pos.y, e.pos.z, e.yaw, 0, dead ? 0.6 : 0);
    GFX.draw(M.beetle, R0, tint, null, { rust: 0.15 });
    const ph = e.phase * 1.4, mv = e.moveAmt;
    for (let k = 0; k < 6; k++) { const sd = k < 3 ? 1 : -1, i = k % 3; M4.child(ms[k], R0, sd * 1.25, 1.0, 0.8 - i * 0.8, 0, Math.sin(ph + i * 2 + (sd > 0 ? 0 : Math.PI)) * 0.4 * mv, sd * 0.5); GFX.draw(M.bleg, ms[k], tint, null, { rust: 0.15 }); }
  }
  function drawExtra() {
    if (!M) initMeshes();
    for (const c of clouds) { for (let k = 0; k < 2; k++) if (Math.random() < 0.6) FX.goo(c.x + rand(-c.r, c.r), c.y + rand(0, 1.5), c.z + rand(-c.r, c.r), [0.5, 0.9, 0.2], 1); GFX.addLight(c.x, c.y + 1, c.z, 6, 0.4, 0.9, 0.2, 0.7); }
  }
  // ---------- populatsioon ----------
  let spawnT = 3;
  function farFromBases(x, z, d) { if (Math.hypot(x - Base.OX, z - Base.OZ) < d) return false; for (const r of Rivals.list) if (r.base && Math.hypot(x - r.base.x, z - r.base.z) < d) return false; return Math.hypot(x - Player.pos.x, z - Player.pos.z) > 110; }
  function tick(dt) {
    if (typeof City !== 'undefined' && City.ensureTech) City.ensureTech();
    // mürgipilved
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i]; c.t -= dt;
      for (const o of Ents.list) if (o.alive && (o.kind === 'human' || o.kind === 'player') && Math.hypot(o.pos.x - c.x, o.pos.z - c.z) < c.r && !o.inVehicle) Ents.damage(o, 7 * dt * G.dk.edmg, null);
      if (c.t <= 0) clouds.splice(i, 1);
    }
    for (const e of Ents.list) if ((e.kind === 'glider' || e.kind === 'beetle') && !e.alive && e.deathT > 200) e.remove = true;
    if ((spawnT -= dt) > 0) return; spawnT = 40;
    const cnt = (k) => Ents.list.filter((e) => e.kind === k && e.alive && !e.raid).length;
    const night = Econ.isNight && Econ.isNight();
    for (let t = 0; t < 30; t++) {
      const a = rand(0, TAU), r = rand(260, World.HALF - 160), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!farFromBases(x, z, 150) || World.slopeAt(x, z) > 0.5) continue;
      if (cnt('glider') < 18) { spawnFlock(x, z); break; }
      if (cnt('bloat') < (night ? 10 : 5)) { spawnBloat(x, z); if (Math.random() < 0.5) spawnBloat(x + rand(-8, 8), z + rand(-8, 8)); break; }
      if (cnt('beetle') < 4) { spawnBeetle(x, z, false); break; }
      break;
    }
  }
  function reset() { spawnT = 3; clouds.length = 0; }
  return { initMeshes, update, hurt, onKill, spheres, draw, drawExtra, tick, reset, armor, spawnBeetle, spawnBloat, spawnFlock };
})();
