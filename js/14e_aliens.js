// ============================================================
//  TULNUKAD: happekullid (karjades kõrbes). Surnud tulnukast saab happenäärmeid
//  (hape) – seda müüakse terminalis. Jahivad ka meeskonna jahimehed ja konkurendid.
// ============================================================
const Aliens = (() => {
  const ACID_PRICE = 16;               // ₵ tükk (terminalis)
  const MAX_PACKS = 9, HOME_R = 26, AGGRO_R = 15, LEASH = 70;
  let M = null, spawnT = 3;
  const R = M4.create();

  // ---------- mudelid (protseduursed) ----------
  function initMeshes() {
    if (M) return M;
    M = {};
    const CH = [0.2, 0.17, 0.24], CH2 = [0.32, 0.27, 0.36], BELLY = [0.46, 0.42, 0.36], ACID = [0.55, 1.0, 0.2], EYE = [1.0, 0.85, 0.25];
    let b = new MB(); b.jit = 0;
    // tagakeha: suur happekott, helendab läbi kitiini
    b.color(CH, MAT.WORN).sphere(0, 1.05, -0.75, 0.62, 10, 7, 0.78);
    b.color(ACID, MAT.GLOW).sphere(0, 1.12, -0.95, 0.42, 10, 7, 0.8);
    for (let k = 0; k < 5; k++) b.color(CH2, MAT.WORN).push().tf(0, 1.05, -0.4 - k * 0.2, 0, 0, 0).cyl(0, -0.02, 0, 0.6 - k * 0.07, 0.6 - k * 0.07, 0.04, 14, false).pop();
    b.push().tf(0, 1.05, -0.55, 0, Math.PI / 2, 0);
    for (let k = 0; k < 5; k++) b.color(CH2, MAT.WORN).cyl(0, -0.1 + k * 0.17, 0, 0.64 - Math.abs(k - 2) * 0.06, 0.64 - Math.abs(k - 2) * 0.06, 0.03, 16, false);
    b.pop();
    b.color(BELLY, MAT.MATTE).sphere(0, 0.82, -0.6, 0.45, 10, 6, 0.6);
    // rindmik + kael
    b.color(CH, MAT.WORN).sphere(0, 1.15, 0.12, 0.38, 10, 7, 0.9);
    b.color(CH2, MAT.WORN).sphere(0, 1.36, 0.2, 0.22, 8, 6, 0.6);
    // pea: pikk kolp, neli silma, lõuad
    b.push().tf(0, 1.5, 0.55, 0, -0.25, 0);
    b.color(CH, MAT.WORN).sphere(0, 0, 0, 0.26, 10, 7, 0.75);
    b.color(CH2, MAT.WORN).sphere(0, 0.04, -0.18, 0.2, 8, 6, 0.7);
    for (const x of [0.12, -0.12]) for (const y of [0.07, -0.02]) b.color(EYE, MAT.GLOW).sphere(x, y, 0.21, 0.045, 6, 4, 1);
    for (const x of [0.1, -0.1]) b.push().tf(x, -0.14, 0.18, x > 0 ? -0.35 : 0.35, 0.3, 0).color(CH2, MAT.WORN).cyl(0, 0, 0, 0.035, 0.008, 0.26, 6, true).pop();
    b.pop();
    // seljaogad
    for (let k = 0; k < 4; k++) b.push().tf(0, 1.55 - k * 0.04, -0.2 - k * 0.3, 0, -0.5, 0).color(CH2, MAT.WORN).cyl(0, 0, 0, 0.06, 0.005, 0.32 - k * 0.04, 6, true).pop();
    M.body = b.build();
    // jalg (kaks lüli): puusast väljapoole ja alla
    b = new MB(); b.jit = 0;
    b.push().tf(0, 0, 0, 0, 0, -0.9).color(CH, MAT.WORN).cyl(0, 0, 0, 0.07, 0.05, 0.62, 8, true).pop();
    b.push().tf(0.5, 0.36, 0, 0, 0, 0.35).color(CH2, MAT.WORN).cyl(0, -1.15, 0, 0.012, 0.05, 1.15, 8, true).pop();
    b.color(CH2, MAT.WORN).sphere(0.5, 0.36, 0, 0.07, 6, 4, 1);
    M.leg = b.build();
    // vikatkäsi
    b = new MB(); b.jit = 0;
    b.color(CH, MAT.WORN).push().tf(0, 0, 0, 0, -0.6, 0).cyl(0, 0, 0, 0.06, 0.045, 0.5, 8, true).pop();
    b.push().tf(0, 0.28, 0.4, 0, 1.9, 0).color([0.62, 0.6, 0.5], MAT.METAL).box(0, 0.25, 0, 0.03, 0.55, 0.1).pop();
    M.arm = b.build();
    // happeklomp (lendav)
    b = new MB(); b.jit = 0; b.color(ACID, MAT.GLOW).sphere(0, 0, 0, 0.18, 8, 5, 1); M.glob = b.build();
    return M;
  }

  // ---------- populatsioon ----------
  function packs() { const s = new Set(); for (const e of Ents.list) if (e.kind === 'alien' && e.alive) s.add(e.pack); return s.size; }
  function spawnPack(x, z) {
    const id = 'p' + Math.random().toString(36).slice(2, 7), n = randi(2, 3);
    for (let k = 0; k < n; k++) {
      const a = rand(0, TAU), r = rand(2, 7);
      Ents.spawn('alien', 'wild', x + Math.cos(a) * r, z + Math.sin(a) * r, { maxHp: 32, radius: 0.9, speed: 0, state: 'roam', home: { x, z }, pack: id, cool: rand(0, 2), hitY: 1.1, hitR: 0.8 });
    }
  }
  function farFromBases(x, z, d) { if (Math.hypot(x, z) < d) return false; for (const r of Rivals.list) if (r.base && Math.hypot(x - r.base.x, z - r.base.z) < d) return false; return true; }
  function populate(force) {
    let n = packs(), tries = 0;
    while (n < (force ? MAX_PACKS : MAX_PACKS) && tries++ < 40) {
      const a = rand(0, TAU), r = rand(180, World.HALF - 120), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!farFromBases(x, z, 140) || Math.hypot(x - Player.pos.x, z - Player.pos.z) < 120) continue;
      if (World.slopeAt(x, z) > 0.45) continue;
      spawnPack(x, z); n++;
      if (!force) break;
    }
  }

  // ---------- AI ----------
  const isPrey = (o) => o.alive && (o.kind === 'human' || (o.kind === 'player' && !Player.dead && G.mode !== 'build')) && !o.inVehicle;
  function nearestHuman(e, range) {
    let best = null, bd = range;
    for (const o of Ents.list) { if (!isPrey(o)) continue; const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z); if (d < bd) { bd = d; best = o; } }
    return best;
  }
  function alertPack(e, t) {
    for (const o of Ents.list) if (o.kind === 'alien' && o.alive && o.pack === e.pack && o.state !== 'hunt' && Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z) < 30) { o.state = 'hunt'; o.target = t; o.stateT = 18; }
  }
  function update(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    if (e.swing > 0) e.swing -= dt;
    e.stateT -= dt;
    if (e.flee > 0) { e.flee -= dt; Ents.stepMove(e, dt, 5); e.speed = 5; return; }
    if (e.state !== 'hunt') {
      const t = e.hp < e.maxHp * 0.25 ? null : nearestHuman(e, AGGRO_R);
      if (t) { e.state = 'hunt'; e.target = t; e.stateT = 18; Audio2.stalker(e.pos.x, e.pos.z); alertPack(e, t); }
      else {
        // rüüsteretk: kari läheb mõne baasi südame (tuuma) kallale
        if (e.raid) {
          const c = e.raid.core;
          if (!c || !c.alive || (e.raid.t += dt) > 260) { e.raid = null; e.path = null; }
          else {
            const d = Math.hypot(c.pos.x - e.pos.x, c.pos.z - e.pos.z);
            e.speed = 4.2;
            if (d > 4.2) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.3) Ents.goTo(e, c.pos.x + rand(-2.5, 2.5), c.pos.z + rand(-2.5, 2.5)); Ents.stepMove(e, dt, 4.2); }
            else { Ents.face(e, c.pos.x, c.pos.z, dt, 5); e.moveAmt = Math.max(0, e.moveAmt - dt * 4); if (e.cool <= 0) { Ents.damage(c, 14, e); e.cool = 1.5; e.swing = 0.35; Audio2.crab(e.pos.x, e.pos.z); FX.goo(c.pos.x, c.pos.y + 1.5, c.pos.z, [0.55, 1.0, 0.2], 4); } }
            return;
          }
        }
        // rahulik uitamine karja kodu ümber
        if (!e.path || Ents.arrived(e) || e.stateT <= 0) {
          e.stateT = rand(4, 11);
          if (Math.random() < 0.6) Ents.goTo(e, e.home.x + rand(-HOME_R, HOME_R), e.home.z + rand(-HOME_R, HOME_R));
          else e.path = null;
        }
        if (e.path) Ents.stepMove(e, dt, 1.6); else e.moveAmt = Math.max(0, e.moveAmt - dt * 3);
        e.speed = 1.6;
        return;
      }
    }
    // raskelt haavatud kull põgeneb pessa
    if (e.hp < e.maxHp * 0.25) { e.state = 'roam'; e.target = null; e.stateT = 8; Ents.goTo(e, e.home.x + rand(-8, 8), e.home.z + rand(-8, 8)); e.flee = 6; return; }
    const t = e.target;
    if (!t || !t.alive || t.inVehicle || e.stateT <= 0 || Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z) > 48 || (!e.raid && Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) > LEASH)) {
      e.state = 'roam'; e.target = null; e.path = null; return;
    }
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    Ents.face(e, t.pos.x, t.pos.z, dt, 5);
    e.speed = 5.6;
    if (d > 2.2) { if (!e.path || Math.random() < dt * 2) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; } Ents.stepMove(e, dt, d > 9 ? 5.6 : 4.2); }
    else e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
    if (d < 2.6 && e.cool <= 0) { Ents.damage(t, 7 * G.dk.edmg, e); e.cool = 1.9; e.swing = 0.35; Audio2.crab(e.pos.x, e.pos.z); e.stateT = 18; }
    else if (d > 6 && d < 24 && e.cool <= 0 && Math.random() < dt * 1.5) {
      // happesülg: kaarega klomp, pritsib maandumisel
      e.cool = rand(3.5, 5); e.spit = 0.4;
      const tx = t.pos.x + (t.vel ? t.vel.x * 0.4 : 0), tz = t.pos.z + (t.vel ? t.vel.z * 0.4 : 0);
      const sx = e.pos.x + Math.sin(e.yaw) * 0.8, sy = e.pos.y + 1.6, sz = e.pos.z + Math.cos(e.yaw) * 0.8;
      const dist = Math.hypot(tx - sx, tz - sz), T = clamp(dist / 18, 0.45, 1.5), ty = Ents.groundY ? Ents.groundY(tx, tz) + 0.9 : World.heightAt(tx, tz) + 0.9;
      Ents.projs.push({ x: sx, y: sy, z: sz, vx: (tx - sx) / T, vy: (ty - sy) / T + 0.5 * 14 * T, vz: (tz - sz) / T, g: 14, life: 3, dmg: 6 * G.dk.edmg, owner: e, kind: 'acid', r: 0.35, delay: 0 });
      Audio2.stalker(e.pos.x, e.pos.z);
    }
  }
  function hurt(e, src) {
    if (!src || !src.pos || !e.alive) return;
    e.state = 'hunt'; e.target = src; e.stateT = 20; alertPack(e, src);
  }
  function onKill(e) {
    e.acid = randi(3, 5); e.harvestable = true;
    FX.goo(e.pos.x, e.pos.y + 0.8, e.pos.z, [0.55, 1.0, 0.2], 18);
    Audio2.stalker(e.pos.x, e.pos.z);
  }
  // lahkamine: kes iganes (mängija / meeskond / konkurent) saab happenäärmed
  function harvest(e, n) { const k = Math.min(n || e.acid, e.acid || 0); e.acid -= k; if (e.acid <= 0) { e.harvestable = false; e.remove = true; } return k; }
  function spheres(e, s) {
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw), x = e.pos.x, y = e.pos.y, z = e.pos.z;
    s.push([x - fx * 0.7, y + 1.05, z - fz * 0.7, 0.62, 1]); s.push([x + fx * 0.15, y + 1.15, z + fz * 0.15, 0.4, 1]); s.push([x + fx * 0.55, y + 1.5, z + fz * 0.55, 0.26, 1.8]);
  }
  function isThreat(e) { return e.alive && e.state === 'hunt'; }

  // ---------- joonistus ----------
  function draw(e) {
    if (!M) initMeshes();
    const ms = e.ms || (e.ms = Array.from({ length: 9 }, () => M4.create()));
    const R = ms[8];
    const dead = !e.alive;
    const tint = e.hurtT > 0 ? [1.6, 0.6, 0.5, 0.2] : dead ? [0.45, 0.45, 0.42, 0] : null;
    const bob = dead ? 0 : Math.sin(e.phase * 2) * 0.05 * e.moveAmt;
    M4.compose(R, e.pos.x, e.pos.y + (dead ? -0.55 : bob), e.pos.z, e.yaw, 0, dead ? 0.9 : 0);
    GFX.draw(M.body, R, tint, null, { rust: 0.1 });
    const ph = e.phase * 2.2, mv = e.moveAmt;
    for (let k = 0; k < 6; k++) {
      const side = k < 3 ? 1 : -1, i = k % 3, z = 0.25 - i * 0.42;
      const sw = Math.sin(ph + i * 2.1 + (side > 0 ? 0 : Math.PI)) * 0.45 * mv;
      M4.child(ms[k], R, side * 0.25, 1.0, z, (side > 0 ? 0 : Math.PI) + sw + (i - 1) * 0.35 * side, 0, dead ? 0.9 : Math.max(0, Math.cos(ph + i * 2.1)) * 0.25 * mv);
      GFX.draw(M.leg, ms[k], tint, null, { rust: 0.1 });
    }
    const sl = e.swing > 0 ? 1.2 : 0;
    for (const side of [1, -1]) { M4.child(ms[6 + (side > 0 ? 0 : 1)], R, side * 0.25, 1.32, 0.38, side * 0.2, -0.3 - sl, 0); GFX.draw(M.arm, ms[6 + (side > 0 ? 0 : 1)], tint, null, { rust: 0.1 }); }
    if (!dead && GFX.env.night > 0.4) GFX.addLight(e.pos.x, e.pos.y + 1.4, e.pos.z, 6, 0.5, 1.0, 0.25, 0.9);
  }
  function drawProjs() {
    if (!M) initMeshes();
    for (const p of Ents.projs) if (p.kind === 'acid' && p.delay <= 0) {
      if (!p.m) p.m = M4.create();
      M4.compose(p.m, p.x, p.y, p.z, 0);
      GFX.draw(M.glob, p.m, null, null, { shadow: false });
      if (Math.random() < 0.4) FX.goo(p.x, p.y, p.z, [0.55, 1.0, 0.2], 1);
    }
  }

  let raidT = DAY_LEN * 1.2;
  function launchRaid() {
    const cores = Ents.list.filter((c) => c.kind === 'core' && c.alive);
    if (!cores.length) return false;
    const core = pick(cores);
    // lähim kari valitud tuumale
    const al = nearestPack(core.pos.x, core.pos.z, 900); if (!al) return false;
    const n = Ents.list.filter((o) => o.kind === 'alien' && o.alive && o.pack === al.pack);
    for (const o of n) { o.raid = { core, t: 0 }; o.home = { x: core.pos.x, z: core.pos.z }; o.state = 'roam'; o.path = null; }
    if (core.playerCore) { UI.msg('Acid mantises are heading for your base core! (' + n.length + ')', 'danger'); Audio2.alarm && Audio2.alarm(); }
    return true;
  }
  function nearestPack(x, z, r) { return Ents.list.filter((e) => e.kind === 'alien' && e.alive && !e.raid && Math.hypot(e.pos.x - x, e.pos.z - z) < r).sort((a, b) => Math.hypot(a.pos.x - x, a.pos.z - z) - Math.hypot(b.pos.x - x, b.pos.z - z))[0] || null; }
  function tick(dt) {
    raidT -= dt;
    if (raidT <= 0) { raidT = DAY_LEN * rand(0.9, 1.6); if (G.time.day >= 2) launchRaid(); }
    spawnT -= dt;
    if (spawnT <= 0) { spawnT = 45; populate(packs() === 0); }
    // happeklombi pritsmed: maandudes kahjustab lähedal olijaid veidi
    for (const e of Ents.list) if (e.kind === 'alien' && !e.alive && e.deathT > 300) { e.remove = true; e.harvestable = false; }
  }
  function reset() { spawnT = 2; raidT = DAY_LEN * 1.2; }

  return { initMeshes, update, hurt, onKill, harvest, spheres, isThreat, draw, drawProjs, tick, reset, populate, launchRaid, ACID_PRICE, nearestPack: (x, z, r) => Ents.list.filter((e) => e.kind === 'alien' && e.alive && Math.hypot(e.pos.x - x, e.pos.z - z) < r).sort((a, b) => Math.hypot(a.pos.x - x, a.pos.z - z) - Math.hypot(b.pos.x - x, b.pos.z - z))[0] || null };
})();
