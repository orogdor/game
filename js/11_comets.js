// ============================================================
//  KOMEEDID ja KRISTALLID
// ============================================================
const COMPASS = ['to the north', 'to the northeast', 'to the east', 'to the southeast', 'to the south', 'to the southwest', 'to the west', 'to the northwest'];
function bearingWord(dx, dz) { const a = Math.atan2(dx, -dz); const k = Math.round(((a + TAU) % TAU) / (TAU / 8)) % 8; return COMPASS[k]; }

const Comets = (() => {
  const sites = [];
  const flying = [];
  let timer = 85, nextId = 1, clusterId = 1;
  // kuni 2 komeeti päevas: rohkem kristalle, aga harvem
  function schedule() { timer = rand(120, 175); }
  function todayCount() { const f = G.flags; if (f.cometDay !== G.time.day) { f.cometDay = G.time.day; f.cometN = 0; } return f.cometN || 0; }
  function pickSpot() {
    for (let t = 0; t < 200; t++) {
      const a = rand(0, TAU), r = rand(80, 650);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!World.okSpot(x, z, 70)) continue;
      if (World.slopeAt(x, z) > 0.12) continue;
      if (sites.some((s) => Math.hypot(s.x - x, s.z - z) < 40)) continue;
      if (Math.hypot(x - World.sites.nest.x, z - World.sites.nest.z) < 90) continue;
      return { x, z };
    }
    return { x: 120, z: 80 };
  }
  function launch(spot) {
    spot = spot || pickSpot();
    const a = rand(0, TAU);
    const ty = World.heightAt(spot.x, spot.z);
    flying.push({ sx: spot.x + Math.cos(a) * 560, sy: ty + 340, sz: spot.z + Math.sin(a) * 560, tx: spot.x, ty, tz: spot.z, t: 0, T: 7.5 });
    const d = Math.hypot(spot.x - Player.pos.x, spot.z - Player.pos.z);
    UI.msg('Radio: a comet is entering the atmosphere! Impact ' + bearingWord(spot.x - Player.pos.x, spot.z - Player.pos.z) + ', about ' + Math.round(d / 10) * 10 + ' m away.', 'comet');
    UI.banner('Comet!', 'Diamonds falling ' + bearingWord(spot.x - Player.pos.x, spot.z - Player.pos.z), 'comet');
    Audio2.cometWhoosh();
    Audio2.radio();
  }
  function impact(f) {
    const x = f.tx, z = f.tz;
    World.deformCrater(x, z, 7.5, 1.8);
    const y = World.heightAt(x, z);
    const radar = Base.objsOfType('radar').some((o) => o.on);
    // radar näeb täpselt ainult baasi lähedal (220 m); kaugemal annab umbkaudse ala, ilma radarita veel laiema
    const near = Math.hypot(x, z) < 220, exact = radar && near, rr = exact ? 0 : radar ? 30 : 55;
    const oa = rand(0, TAU), od = rand(0.35, 0.85) * rr;
    const s = { id: nextId++, x, z, y, clusters: [], age: 0, exact, r: rr, ox: Math.cos(oa) * od, oz: Math.sin(oa) * od, claimed: {} };
    const n = randi(10, 14);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), r = i === 0 ? 0 : rand(2, 7.5);
      const cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r;
      s.clusters.push({ id: clusterId++, x: cx, z: cz, y: World.heightAt(cx, cz) - 0.15, amount: Math.max(4, Math.round(randi(6, 11) * G.dk.yield)), yaw: rand(0, TAU), m: M4.create(), site: s });
    }
    sites.push(s);
    FX.explosion(x, y + 1, z, [1.0, 0.75, 0.5], 3);
    FX.crystalBurst(x, y + 2, z);
    for (let i = 0; i < 40; i++) GFX.partAlpha.emit(x + rand(-4, 4), y + 0.5, z + rand(-4, 4), rand(-9, 9), rand(2, 10), rand(-9, 9), rand(2, 4), 1.5, 5, [0.55, 0.42, 0.32, 0.7], [0.55, 0.42, 0.32, 0], 2, 0.8);
    Audio2.explode(x, z, true);
    const d = Math.hypot(x - Player.pos.x, z - Player.pos.z);
    UI.shake(clamp(1.4 - d / 250, 0.15, 1.2));
    G.stats.comets++;
    UI.msg(exact ? 'Radar: a comet fell close by. The exact location is on the map.' : radar ? 'Radar: a comet fell far away – only the rough area is known. Send a scout or go look yourself.' : 'A comet fell! Only a wide rough area is on the map. A radar mast narrows it; scouts find the exact spot.', 'comet');
    if (G.time.day >= 2 && Math.random() < 0.7) {
      for (let i = 0; i < randi(1, 2); i++) { const a = rand(0, TAU); Spawner.stalker(x + Math.cos(a) * rand(10, 20), z + Math.sin(a) * rand(10, 20), 'buried'); }
    }
    lure(x, z);
    if (typeof Rivals !== 'undefined') Rivals.onComet(s);
    G.flags.firstComet = true;
    Objectives.check();
  }
  // kukkumise mürin ja valgus meelitavad tulnukad kraatri juurde
  function lure(x, z) {
    const L = { x, z, t: 150 };
    let n = 0;
    for (const e of Ents.list) {
      if (!e.alive || (e.kind !== 'stalker' && e.kind !== 'kiskja' && e.kind !== 'bug')) continue;
      if (Math.hypot(e.pos.x - x, e.pos.z - z) > 340) continue;
      e.lure = { x: x + rand(-8, 8), z: z + rand(-8, 8), t: L.t }; if (e.kind === 'stalker' && e.state === 'buried') { e.state = 'roam'; } n++;
    }
    // uued tulijad kaugemalt
    const day = G.time.day, night = Econ.isNight();
    const cnt = 2 + (day >= 3 ? 1 : 0) + (night ? 1 : 0);
    for (let i = 0; i < cnt; i++) {
      const a = rand(0, TAU), r = rand(60, 110), sx = x + Math.cos(a) * r, sz = z + Math.sin(a) * r;
      if (!World.okSpot || World.okSpot(sx, sz, 20)) { const s = Spawner.stalker(sx, sz, 'roam'); s.lure = { x: x + rand(-10, 10), z: z + rand(-10, 10), t: L.t }; s.lureSpawn = true; }
    }
    if ((night || day >= 4) && Math.random() < 0.45 && typeof Kiskja !== 'undefined') {
      const a = rand(0, TAU), k = Kiskja.spawn(x + Math.cos(a) * 170, z + Math.sin(a) * 170); if (k) { k.lure = { x, z, t: L.t }; k.lureSpawn = true; }
    }
    UI.msg('The impact echoes across the desert. Something out there will come for the crystals too.', 'danger');
  }
  function spawnLoose(x, z, n) {
    const s = { id: nextId++, x, z, y: World.heightAt(x, z), clusters: [], age: 0, exact: true, ox: 0, oz: 0, loose: true, claimed: {} };
    s.clusters.push({ id: clusterId++, x, z, y: s.y - 0.1, amount: n, yaw: rand(0, TAU), m: M4.create(), site: s });
    sites.push(s);
  }
  function update(dt) {
    if (G.mode === 'play') timer -= dt;
    if (timer <= 0) {
      if (todayCount() >= 2) timer = Math.max(20, (1 - G.time.t) * DAY_LEN + rand(15, 80));   // järgmine päev
      else { G.flags.cometN = (G.flags.cometN || 0) + 1; launch(); schedule(); }
    }
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i];
      f.t += dt;
      const k = clamp(f.t / f.T, 0, 1), e = k * k * (0.4 + 0.6 * k);
      const x = lerp(f.sx, f.tx, e), y = lerp(f.sy, f.ty, e) + Math.sin(k * Math.PI) * 30, z = lerp(f.sz, f.tz, e);
      const vx = (f.tx - f.sx) / f.T, vy = (f.ty - f.sy) / f.T, vz = (f.tz - f.sz) / f.T;
      GFX.partAdd.emit(x, y, z, 0, 0, 0, 0.15, 7, 3, [1.0, 0.95, 0.85, 1], [0.6, 0.8, 1, 0]);
      for (let j = 0; j < 4; j++) GFX.partAdd.emit(x + rand(-1.5, 1.5), y + rand(-1.5, 1.5), z + rand(-1.5, 1.5), -vx * 0.05 + rand(-3, 3), -vy * 0.05 + rand(-3, 3), -vz * 0.05 + rand(-3, 3), rand(0.8, 1.8), rand(2, 4), 0.5, [1, 0.6, 0.3, 0.9], [0.6, 0.3, 1, 0]);
      GFX.partAlpha.emit(x, y, z, rand(-2, 2), rand(-2, 2), rand(-2, 2), 3, 3, 9, [0.35, 0.3, 0.3, 0.35], [0.4, 0.35, 0.35, 0]);
      GFX.addLight(x, y, z, 120, 1, 0.8, 0.6, 3);
      if (f.t >= f.T) { flying.splice(i, 1); impact(f); }
    }
    for (let i = sites.length - 1; i >= 0; i--) {
      const s = sites[i];
      s.age += dt;
      s.clusters = s.clusters.filter((c) => c.amount > 0);
      if (!s.clusters.length) sites.splice(i, 1);
    }
  }
  function draw() {
    for (const s of sites) {
      let tot = 0;
      for (const c of s.clusters) {
        const sc = 0.55 + Math.min(c.amount, 7) * 0.09;
        M4.compose(c.m, c.x, c.y, c.z, c.yaw, 0, 0, sc, sc, sc);
        GFX.draw(MODELS.crystalCluster, c.m, [1, 1, 1, 0], null, { shadow: true });
        tot += c.amount;
      }
      if (tot > 0) GFX.addLight(s.x, s.y + 2.5, s.z, 14 + Math.min(tot, 30) * 0.25, 0.55, 0.8, 1.0, 0.9 + GFX.env.night * 1.2);
    }
  }
  function nearestCluster(x, z, maxD) {
    let best = null, bd = maxD;
    for (const s of sites) for (const c of s.clusters) {
      if (c.amount <= 0) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }
  function mine(cl, who) {
    if (cl.amount <= 0) return;
    if (who === Player) {
      if (Inv.room('kris') <= 0) { UI.toast('Backpack full! Take your things to the base.'); Audio2.deny(); return; }
      const nk = Math.min(hasTech('drill') ? 2 : 1, cl.amount, Inv.room('kris')); Inv.add('kris', nk); cl.amount -= nk - 1; G.stats.crystals += nk; Save.auto();
      Audio2.crystal();
      Objectives.check();
    }
    cl.amount--;
    FX.sparks(cl.x, cl.y + 0.6, cl.z, [0.6, 0.85, 1], 5, 3);
  }
  function takeUnits(cl, n) { const k = Math.min(n, cl.amount); cl.amount -= k; if (k) FX.sparks(cl.x, cl.y + 0.6, cl.z, [0.6, 0.85, 1], 4, 3); return k; }
  function siteTotal(s) { return s.clusters.reduce((a, c) => a + c.amount, 0); }
  function activeSites() { return sites.filter((s) => !s.loose && siteTotal(s) > 0); }
  function serialize() { return { timer, sites: sites.map((s) => ({ x: s.x, z: s.z, exact: s.exact, r: s.r, ox: s.ox, oz: s.oz, loose: !!s.loose, clusters: s.clusters.map((c) => [c.x, c.z, c.amount, c.yaw]) })) }; }
  function deserialize(d) {
    sites.length = 0; flying.length = 0;
    timer = d.timer || 120;
    for (const sd of d.sites || []) {
      if (!sd.loose) World.deformCrater(sd.x, sd.z, 7.5, 1.8);
      const s = { id: nextId++, x: sd.x, z: sd.z, y: World.heightAt(sd.x, sd.z), clusters: [], age: 0, exact: sd.exact, r: sd.r || 28, ox: sd.ox, oz: sd.oz, loose: sd.loose, claimed: {} };
      for (const c of sd.clusters) s.clusters.push({ id: clusterId++, x: c[0], z: c[1], y: World.heightAt(c[0], c[1]) - 0.15, amount: c[2], yaw: c[3], m: M4.create(), site: s });
      sites.push(s);
    }
  }
  function reset() { sites.length = 0; flying.length = 0; timer = 85; }
  return { sites, flying, update, draw, launch, nearestCluster, mine, takeUnits, siteTotal, activeSites, spawnLoose, serialize, deserialize, reset, get timer() { return timer; }, set timer(v) { timer = v; } };
})();

// ============================================================
//  ASUSTAJA: metsloomad, ööhiilijad
// ============================================================
const Spawner = (() => {
  function stalker(x, z, state = 'roam') {
    return Ents.spawn('stalker', 'wild', x, z, { radius: 0.6, state, stateT: 10, daySpawned: state === 'buried' ? false : undefined, maxHp: 85 });
  }
  function crab(x, z) {
    return Ents.spawn('crab', 'wild', x, z, { radius: 1.3, state: 'idle', home: { x, z }, maxHp: 240 });
  }
  function jelly() {
    const LIM = Math.min(World.HALF - 80, 1700), x = rand(-LIM, LIM), z = rand(-LIM, LIM);
    return Ents.spawn('jelly', 'wild', x, z, { alt: rand(9, 20), radius: 0.8, maxHp: 15 });
  }
  function rockySpot() {
    for (let t = 0; t < 200; t++) {
      const a = rand(0, TAU), r = rand(110, Math.min(World.HALF - 80, 1700));
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!World.okSpot(x, z, 100) || World.slopeAt(x, z) > 0.15) continue;
      // lähedal kaljud
      const near = World.query(x - 12, z - 12, x + 12, z + 12).some((c) => c.kind === 'rock');
      if (near || t > 120) return { x, z };
    }
    return { x: 200, z: -150 };
  }
  function init() {
    Herds.clear();
    const gr = World.groves.slice(0, 48);
    for (const g of gr) Herds.create(g.x, g.z, randi(4, 6));
    for (let i = 0; i < 44; i++) { const p = rockySpot(); crab(p.x, p.z); }
    for (let i = 0; i < 60; i++) jelly();
    for (let i = 0; i < 32; i++) { const a = rand(0, TAU), r = rand(130, World.HALF - 100); stalker(Math.cos(a) * r, Math.sin(a) * r, 'buried').daySpawned = false; }
  }
  function nightSpawn() {
    if (typeof Kiskja !== 'undefined') Kiskja.nightSpawn();
    const n = Math.min(12, Math.round((3 + G.time.day * 0.8) * G.dk.raid));
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), r = rand(140, 240);
      stalker(Math.cos(a) * r, Math.sin(a) * r, 'roam');
    }
  }
  function clearNight() {
    if (typeof Kiskja !== 'undefined') Kiskja.clearNight();
    for (const e of Ents.list) if (e.kind === 'stalker' && e.alive && e.state !== 'buried') e.remove = true;
  }
  function daily() {
    if (Ents.countAlive((e) => e.kind === 'crab') < 44) { const p = rockySpot(); crab(p.x, p.z); }
    while (Ents.countAlive((e) => e.kind === 'jelly') < 60) jelly();
    if (Ents.countAlive((e) => e.kind === 'stalker' && e.state === 'buried') < 32) { const a = rand(0, TAU), r = rand(130, World.HALF - 100); stalker(Math.cos(a) * r, Math.sin(a) * r, 'buried').daySpawned = false; }
  }
  return { init, nightSpawn, clearNight, daily, stalker, crab, jelly };
})();
