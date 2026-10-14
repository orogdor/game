// ============================================================
//  KIVISÜDA: hiiglaslik tulnukas, kelle pesas kasvavad südamekivid
// ============================================================
const Boss = (() => {
  const NODE_POS = [[0, 7.9, 3.2], [-2.1, 8.0, 0.6], [2.1, 7.9, -0.4], [0, 8.2, -2.6], [-1.2, 7.6, -4.6]];
  const HEART = [0, 2.5, 6.4];
  const BS = 1.7; // hiiglase suurus
  const LEGS = [[-3.4, 5.4, 3.8], [3.4, 5.4, 3.8], [-3.7, 5.4, 0], [3.7, 5.4, 0], [-3.4, 5.4, -3.8], [3.4, 5.4, -3.8]];
  const rings = [];
  let decor = [];
  const api = { e: null, rings };
  const tmp = {};

  function spawn(saved) {
    const n = World.sites.nest;
    const e = Ents.spawn('boss', 'wild', n.x, n.z, { radius: 8.5, state: 'sleep', maxHp: 1 });
    e.nodes = NODE_POS.map((p, i) => ({ hp: 320, max: 320, alive: true, m: M4.create(), i }));
    e.heartHp = 1600; e.heartMax = 1600;
    e.stompCD = 4; e.barrageCD = 6; e.summonCD = 25; e.chargeCD = 12; e.act = null; e.actT = 0; e.lastSeen = 0; e.roarT = 0;
    e.yaw = rand(0, TAU); e.ms = [];
    if (saved) {
      e.nodes.forEach((nd, i) => { nd.hp = saved.nodes[i]; nd.alive = nd.hp > 0; });
      e.heartHp = saved.heart;
      if (saved.dead) { e.alive = false; e.state = 'dead'; e.deathT = 999; }
    }
    api.e = e;
    // pesa kaunistused
    decor = [];
    const r = mulberry32(G.seed * 3 + 1);
    for (let i = 0; i < 16; i++) {
      const a = r() * TAU, d = 14 + r() * 24;
      const x = n.x + Math.cos(a) * d, z = n.z + Math.sin(a) * d;
      const s = 0.7 + r() * 1.3;
      decor.push(M4.compose(M4.create(), x, World.heightAt(x, z) - 0.4, z, r() * TAU, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6, s, s * (0.8 + r()), s));
    }
    return e;
  }
  function exposed(e) { return e.nodes.every((n) => !n.alive); }
  function local(e, p, out) {
    const c = Math.cos(e.yaw), s = Math.sin(e.yaw);
    out = out || {};
    out.x = e.pos.x + (p[0] * c + p[2] * s) * BS; out.y = e.pos.y + p[1] * BS; out.z = e.pos.z + (-p[0] * s + p[2] * c) * BS;
    return out;
  }
  function spheres(e, s) {
    // 0-2 keha, 3 pea, 4-8 sõlmed, 9 süda
    const B = [[0, 5.2, -3.5, 3.0], [0, 5.2, 0, 3.1], [0, 5.2, 3.5, 3.0], [0, 5.6, 8.6, 2.2]];
    for (const b of B) { local(e, b, tmp); s.push([tmp.x, tmp.y, tmp.z, b[3] * BS, 0]); }
    e.nodes.forEach((n, i) => { if (n.alive) { local(e, NODE_POS[i], tmp); s.push([tmp.x, tmp.y + 0.8 * BS, tmp.z, 1.35 * BS, 1, i]); } else s.push([0, -999, 0, 0.01, 0, i]); });
    if (exposed(e)) { local(e, HEART, tmp); s.push([tmp.x, tmp.y, tmp.z, 1.5 * BS, 1]); }
  }
  function wake(e, src) {
    if (e.state !== 'sleep') return;
    e.state = 'fight';
    Audio2.roar(e.pos.x, e.pos.z);
    UI.banner('The Stoneheart woke up', 'Shoot the crystal nodes on its back', 'danger');
    UI.msg('The ground shakes. The Stoneheart rises from its nest. The glowing crystal nodes on its back are its weak spots.', 'danger');
    UI.shake(0.8);
    G.flags.nestKnown = true;
  }
  function hit(e, dmg, src, idx, x, y, z) {
    if (!e.alive) return;
    wake(e, src);
    if (idx >= 4 && idx <= 8) {
      const n = e.nodes[idx - 4];
      if (!n.alive) return;
      n.hp -= dmg;
      FX.sparks(x, y, z, [1, 0.5, 0.85], 8, 5);
      UI.hitMarker(false);
      if (n.hp <= 0) {
        n.alive = false;
        FX.crystalBurst(x, y, z); FX.explosion(x, y, z, [1, 0.4, 0.8], 1.6);
        Audio2.roar(e.pos.x, e.pos.z); Audio2.explode(x, z, false);
        const left = e.nodes.filter((q) => q.alive).length;
        if (left > 0) UI.msg('Crystal node shattered! Remaining ' + left + '.', 'good');
        else { UI.banner('The heart is exposed', 'Shoot the glowing heart under its chest', 'good'); UI.msg('The Stoneheart\'s chest plates open. The heart is exposed!', 'good'); e.enraged = true; }
      }
    } else if (idx === 9) {
      e.heartHp -= dmg;
      FX.sparks(x, y, z, [1, 0.4, 0.6], 10, 5);
      UI.hitMarker(false);
      if (e.heartHp <= 0) die(e, src);
    } else {
      // soomus
      FX.sparks(x, y, z, [0.9, 0.8, 0.7], 3, 3);
      FX.dust(x, y, z, 2, 0.5);
      if (src === Player) UI.armorHit();
    }
  }
  function damage(e, amt, src) {
    // üldine kahju (mürsud, konkurendid): pisike kriimustus
    if (!e.alive) return;
    if (src && src.team && src.team !== 'player') { wake(e, src); }
    if (exposed(e)) { e.heartHp -= amt * 0.15; if (e.heartHp <= 0) die(e, src); }
  }
  function charge(r) {
    const e = api.e; if (!e || !e.alive) return;
    FX.explosion(e.pos.x, e.pos.y + 2, e.pos.z, [1, 0.6, 0.3], 4);
    Audio2.explode(e.pos.x, e.pos.z, true);
    wake(e, null);
    const alive = e.nodes.filter((n) => n.alive);
    if (alive.length) { for (const n of alive.slice(0, 2)) { n.alive = false; n.hp = 0; } UI.msg(r.short + ' charges shattered the Stoneheart\'s crystal nodes!', 'danger'); }
    else { e.heartHp -= 700; UI.msg(r.short + ' charges badly wounded the Stoneheart!', 'danger'); }
    if (e.heartHp <= 0) die(e, { team: r.team, rival: r });
  }
  function die(e, src) {
    setTimeout(() => Save.auto(true), 1500);
    e.alive = false; e.state = 'dead'; e.deathT = 0; e.heartHp = 0;
    G.flags.bossDead = true;
    local(e, HEART, tmp);
    const hx = tmp.x, hz = tmp.z;
    for (let i = 0; i < 5; i++) setTimeout(() => { FX.explosion(hx + rand(-5, 5), e.pos.y + rand(2, 7), hz + rand(-5, 5), [1, 0.4, 0.8], 2); Audio2.explode(hx, hz, i === 0); }, i * 350);
    Audio2.roar(e.pos.x, e.pos.z);
    UI.shake(1.2);
    if (src && src.team && src.team !== 'player' && src.team !== 'crew') {
      const r = src.rival || Rivals.get(src.team);
      setTimeout(() => Game.over('rival', r), 2500);
      return;
    }
    Ents.pickups.push({ kind: 'stones', x: hx, y: Ents.groundY(hx, hz), z: hz, data: { stones: 5 } });
    UI.banner('The Stoneheart has fallen', 'Take the heartstones to the base', 'good');
    UI.msg('The Stoneheart collapsed. Heartstones glow in its nest.', 'good');
    Objectives.check();
  }
  function nearestTarget(e, range) {
    let best = null, bd = range;
    for (const t of Ents.list) {
      if (!t.alive || !(t.kind === 'player' || t.kind === 'human')) continue;
      if (t.kind === 'player' && (Player.dead || G.mode === 'build')) continue;
      if (t.team === 'neutral') continue;
      const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
      const nd = Math.hypot(t.pos.x - World.sites.nest.x, t.pos.z - World.sites.nest.z);
      if (nd > 95) continue;
      const w = t.kind === 'player' ? d - 12 : d;
      if (w < bd) { bd = w; best = t; }
    }
    return best;
  }
  function update(e, dt) {
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += dt * 19;
      const n = Math.floor(r.r * 1.2);
      for (let k = 0; k < Math.min(30, n); k++) {
        const a = rand(0, TAU), x = r.x + Math.cos(a) * r.r, z = r.z + Math.sin(a) * r.r;
        if (Math.random() < 0.35) GFX.partAlpha.emit(x, World.heightAt(x, z) + 0.3, z, Math.cos(a) * 3, rand(1, 3), Math.sin(a) * 3, 0.8, 0.8, 2.2, [0.55, 0.42, 0.32, 0.6], [0.55, 0.42, 0.32, 0]);
      }
      for (const t of Ents.list) {
        if (!t.alive || r.hit.has(t) || !(t.kind === 'player' || t.kind === 'human')) continue;
        const d = Math.hypot(t.pos.x - r.x, t.pos.z - r.z);
        const grounded = t.kind !== 'player' || Player.onGround || Player.pos.y - Ents.groundY(Player.pos.x, Player.pos.z) < 0.5;
        if (Math.abs(d - r.r) < 1.6 && grounded) {
          r.hit.add(t);
          Ents.damage(t, 26 * G.dk.edmg, e);
          if (t.kind === 'player') { const k = 7 / Math.max(1, d); Player.vel.x += (t.pos.x - r.x) * k; Player.vel.z += (t.pos.z - r.z) * k; Player.vel.y = 4; Player.onGround = false; }
        }
      }
      if (r.r > r.max) rings.splice(i, 1);
    }
    if (!e.alive) { e.deathT += dt; return; }
    if (e.state === 'sleep') {
      e.phase += dt * 0.3;
      const t = nearestTarget(e, 85);
      if (t) wake(e, t);
      return;
    }
    const t = nearestTarget(e, 130);
    if (!t) {
      e.lastSeen += dt;
      const n = World.sites.nest, dn = Math.hypot(n.x - e.pos.x, n.z - e.pos.z);
      if (dn > 4) { e.path = [{ x: n.x, z: n.z }]; e.pathI = 0; Ents.stepMove(e, dt, 2.2); e.speed = 2.2; }
      if (e.lastSeen > 25) { e.state = 'sleep'; e.lastSeen = 0; }
      return;
    }
    e.lastSeen = 0;
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    const want = Math.atan2(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    const turn = e.enraged ? 1.4 : 0.9;
    e.yaw += clamp(angDiff(e.yaw, want), -turn * dt, turn * dt);
    for (const k of ['stompCD', 'barrageCD', 'summonCD', 'chargeCD']) e[k] -= dt;
    e.roarT -= dt;
    if (e.roarT <= 0) { e.roarT = rand(12, 20); Audio2.roar(e.pos.x, e.pos.z); }
    // tegevused
    if (e.act) {
      e.actT -= dt;
      if (e.act === 'stomp' && e.actT <= 0) {
        rings.push({ x: e.pos.x + Math.sin(e.yaw) * 6, z: e.pos.z + Math.cos(e.yaw) * 6, r: 1, max: 30, hit: new Set() });
        FX.dust(e.pos.x + Math.sin(e.yaw) * 6, e.pos.y + 0.3, e.pos.z + Math.cos(e.yaw) * 6, 30, 3);
        Audio2.explode(e.pos.x, e.pos.z, false);
        UI.shake(clamp(1 - d / 60, 0.2, 0.9));
        e.act = null; e.stompCD = e.enraged ? 4.5 : 6.5;
      } else if (e.act === 'charge') {
        e.path = [{ x: e.pos.x + Math.sin(e.yaw) * 10, z: e.pos.z + Math.cos(e.yaw) * 10 }]; e.pathI = 0;
        Ents.stepMove(e, dt, 11); e.speed = 11;
        if (d < 7.5 && !e.chargeHit) { e.chargeHit = true; Ents.damage(t, 30 * G.dk.edmg, e); if (t === Player) { Player.vel.x += Math.sin(e.yaw) * 12; Player.vel.z += Math.cos(e.yaw) * 12; Player.vel.y = 5; Player.onGround = false; } }
        if (e.actT <= 0) { e.act = null; e.chargeCD = 9; }
      } else if (e.actT <= 0) e.act = null;
      return;
    }
    const n = World.sites.nest;
    const leash = Math.hypot(n.x - e.pos.x, n.z - e.pos.z);
    if (d < 15 && e.stompCD <= 0) { e.act = 'stomp'; e.actT = 1.1; Audio2.roar(e.pos.x, e.pos.z); return; }
    if (e.enraged && d > 12 && d < 50 && e.chargeCD <= 0 && leash < 45) { e.act = 'charge'; e.actT = 1.8; e.chargeHit = false; Audio2.roar(e.pos.x, e.pos.z); return; }
    if (d > 13 && d < 95 && e.barrageCD <= 0) {
      e.barrageCD = e.enraged ? rand(4, 6) : rand(6, 9);
      const live = e.nodes.map((q, i) => (q.alive ? i : -1)).filter((i) => i >= 0);
      const k = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < k; i++) {
        const src = local(e, live.length ? NODE_POS[pick(live)] : [0, 8, 0], {});
        const tx = t.pos.x + (t.vel ? t.vel.x * 0.9 : 0) + rand(-4, 4), tz = t.pos.z + (t.vel ? t.vel.z * 0.9 : 0) + rand(-4, 4);
        const ty = Ents.groundY(tx, tz);
        const dist = Math.hypot(tx - src.x, tz - src.z), T = clamp(dist / 26, 0.9, 2.4);
        Ents.projs.push({ x: src.x, y: src.y + 1, z: src.z, vx: (tx - src.x) / T, vy: (ty - src.y - 1) / T + 0.5 * 12 * T, vz: (tz - src.z) / T, g: 12, life: 5, dmg: 15 * G.dk.edmg, owner: e, kind: 'shard', r: 0.6, splash: 3.6, delay: i * 0.14 });
      }
      Audio2.roar(e.pos.x, e.pos.z);
      return;
    }
    if (e.summonCD <= 0) {
      e.summonCD = rand(28, 40);
      for (let i = 0; i < 2; i++) { const a = rand(0, TAU); const s = Spawner.stalker(t.pos.x + Math.cos(a) * rand(10, 16), t.pos.z + Math.sin(a) * rand(10, 16), 'hunt'); s.target = t; FX.dust(s.pos.x, s.pos.y + 0.3, s.pos.z, 12, 2); }
      UI.msg('The sand is boiling. The Stoneheart is calling stalkers for help!', 'danger');
    }
    // liikumine
    if (d > 16 && leash < 42) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; Ents.stepMove(e, dt, e.enraged ? 3.6 : 2.4); e.speed = e.enraged ? 3.6 : 2.4; }
    else { e.moveAmt = Math.max(0, e.moveAmt - dt * 2); }
    if (Math.random() < dt * 3) { local(e, NODE_POS[randi(0, 4)], tmp); GFX.partAdd.emit(tmp.x + rand(-1, 1), tmp.y + rand(0, 2), tmp.z + rand(-1, 1), rand(-0.5, 0.5), rand(0.5, 1.5), rand(-0.5, 0.5), 2, 0.3, 0.05, [1, 0.4, 0.8, 1], [0.6, 0.6, 1, 0]); }
  }
  function draw(e) {
    const ms = e.ms;
    const M = MODELS.lo && Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 120 ? MODELS.lo : MODELS;
    while (ms.length < 14) ms.push(M4.create());
    const dead = !e.alive;
    const sink = dead ? Math.min(2.5, e.deathT * 0.6) : 0;
    const stompLift = e.act === 'stomp' ? Math.sin((1 - e.actT / 1.1) * Math.PI) * 0.35 : 0;
    const sleep = e.state === 'sleep';
    const breathe = Math.sin(G.time.total * (sleep ? 0.8 : 1.6)) * 0.12;
    M4.compose(ms[0], e.pos.x, e.pos.y - (sink + (sleep ? 1.6 : 0)) * BS, e.pos.z, e.yaw, -stompLift, dead ? Math.min(0.5, e.deathT * 0.2) : 0, BS, BS, BS);
    const tint = e.hurtT > 0 ? [1.4, 1.1, 1.1, 0] : null;
    M4.child(ms[1], ms[0], 0, breathe, 0, 0, 0, 0);
    GFX.draw(M.bossBody, ms[1], tint, null, { rust: 0 });
    M4.child(ms[2], ms[1], 0, 5.6, 6.0, Math.sin(G.time.total * 0.7) * 0.15, (sleep ? 0.5 : 0) + (e.act === 'stomp' ? -0.3 : 0) + Math.sin(e.phase * 0.5) * 0.05, 0);
    GFX.draw(M.bossHead, ms[2], tint, null, { rust: 0 });
    const sw = Math.sin(e.phase * 0.6);
    LEGS.forEach((L, i) => {
      const side = i % 2 ? 1 : -1, ph = (i % 2 === (Math.floor(i / 2) % 2) ? 1 : -1) * sw * 0.35 * e.moveAmt;
      M4.child(ms[3 + i], ms[0], L[0], L[1] + (sleep ? 1.2 : 0), L[2], 0, ph, side * (sleep ? 0.6 : 0.12));
      GFX.draw(M.bossLeg, ms[3 + i], tint, null, { rust: 0 });
    });
    e.nodes.forEach((n, i) => {
      if (!n.alive) return;
      const p = NODE_POS[i];
      M4.child(n.m, ms[1], p[0], p[1], p[2], i * 1.3, 0, 0);
      GFX.draw(M.bossNode, n.m, [1, 1, 1, 0.3 + 0.3 * Math.sin(G.time.total * 3 + i)], null, { shadow: true });
      if (i % 2 === 0 && !sleep) { local(e, p, tmp); GFX.addLight(tmp.x, tmp.y + 1.5, tmp.z, 14, 1, 0.4, 0.8, 1.6); }
    });
    if (exposed(e) && !dead) {
      M4.child(ms[9], ms[1], HEART[0], HEART[1], HEART[2], G.time.total, 0, 0, 1 + Math.sin(G.time.total * 5) * 0.12, 1 + Math.sin(G.time.total * 5) * 0.12, 1 + Math.sin(G.time.total * 5) * 0.12);
      GFX.draw(M.bossHeart, ms[9], [1, 1, 1, 0.6], null, { shadow: false });
      local(e, HEART, tmp); GFX.addLight(tmp.x, tmp.y, tmp.z, 16, 1, 0.3, 0.5, 3);
    }
    for (const m of decor) GFX.draw(MODELS.bossNode, m, [0.85, 0.8, 0.95, 0], null, { shadow: false });
    if (!dead || e.deathT < 30) GFX.addLight(World.sites.nest.x, World.sites.nest.y || World.heightAt(World.sites.nest.x, World.sites.nest.z) + 6, World.sites.nest.z, 45, 0.9, 0.35, 0.7, 1.2);
  }
  // taevasse ulatuv helendav sammas: näha üle kõrbe, tõmbab mängijat ja rivaale
  function beacon() {
    const e = api.e; if (!e || !e.alive || !MODELS.beacon) return;
    if (!api.bm) api.bm = M4.create(); const n = World.sites.nest;
    M4.compose(api.bm, n.x, World.heightAt(n.x, n.z) + 16, n.z, G.time.total * 0.2);
    GFX.draw(MODELS.beacon, api.bm, [1, 1, 1, 0], null, { shadow: false, rust: -1 });
  }
  function serialize() { const e = api.e; if (!e) return null; return { nodes: e.nodes.map((n) => Math.max(0, n.hp)), heart: e.heartHp, dead: !e.alive }; }
  // skanner
  function updateScanner(dt) {
    if (G.scan.found) return;
    const sc = Base.objsOfType('skanner').filter((o) => o.on);
    if (sc.length) {
      const rate = (32 / DAY_LEN) * (Crew.scientistAtScanner() ? 2.3 : 1) * (sc.length > 1 ? 1.4 : 1);
      G.scan.p = Math.min(100, G.scan.p + rate * dt);
      if (G.scan.p >= 100) {
        G.scan.found = true; G.flags.nestKnown = true;
        UI.banner('Nest found', 'The Stoneheart\'s location is on the map', 'good');
        UI.msg('The deep scanner found the Stoneheart\'s nest: ' + bearingWord(World.sites.nest.x, World.sites.nest.z) + ', ' + Math.round(Math.hypot(World.sites.nest.x, World.sites.nest.z) / 10) * 10 + ' m from the base.', 'good');
        Audio2.cash();
        Objectives.check();
      }
    }
    if (!G.flags.nestKnown && Math.hypot(Player.pos.x - World.sites.nest.x, Player.pos.z - World.sites.nest.z) < 140) {
      G.flags.nestKnown = true;
      UI.msg('Here… a crater, crystals and a giant breathing mountain of rock. This is the Stoneheart\'s nest.', 'good');
      Objectives.check();
    }
  }
  api.spawn = spawn; api.spheres = spheres; api.hit = hit; api.damage = damage; api.charge = charge; api.update = update; api.draw = draw;
  api.beacon = beacon; api.serialize = serialize; api.updateScanner = updateScanner; api.exposed = exposed;
  return api;
})();
