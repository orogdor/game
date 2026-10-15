// ============================================================
//  OLEMID: inimesed, olendid, mürsud, korjatavad asjad
// ============================================================
const Ents = (() => {
  const list = [];
  const projs = [];
  const pickups = [];
  const noises = [];
  let nextId = 1;
  const tmpV = { x: 0, y: 0, z: 0 };

  function groundY(x, z, y) { return Math.max(World.heightAt(x, z), Bases.floorAt(x, z, y)); }

  function spawn(kind, team, x, z, o = {}) {
    const e = Object.assign({
      id: nextId++, kind, team, pos: { x, y: groundY(x, z), z }, vel: { x: 0, y: 0, z: 0 }, yaw: rand(0, TAU),
      hp: 100, maxHp: 100, alive: true, radius: 0.4, hitY: 1.0, hitR: 0.5, speed: 0, moveAmt: 0, phase: rand(0, 6),
      state: 'idle', stateT: 0, cool: 0, path: null, pathI: 0, target: null, aim: 0, pose: 'stand', deathT: 0,
      lastPos: { x, z }, stuckT: 0, detour: null, flash: 0, spheres: [], parts: {}, hurtT: 0,
    }, o);
    e.hp = e.maxHp = o.maxHp || o.hp || defaultHp(kind);
    list.push(e);
    return e;
  }
  function defaultHp(kind) { return { human: 70, goat: 30, ram: 60, stalker: 55, kiskja: 320, crab: 170, jelly: 15, boss: 4000, core: 900, rturret: 260 }[kind] || 50; }
  function remove(e) { const i = list.indexOf(e); if (i >= 0) list.splice(i, 1); }

  function isHuman(e) { return e.kind === 'human' || e.kind === 'player'; }
  function friendly(a, b) {
    const fa = a.team === 'player' || a.team === 'crew', fb = b.team === 'player' || b.team === 'crew';
    if (fa && fb) return true;
    return a.team === b.team;
  }
  function noise(x, z, r, kind) { noises.push({ x, z, r, kind, t: 0.6 }); if (typeof Crew !== 'undefined' && Crew.hear && (kind === 'shot' || kind === 'boom')) Crew.hear(x, z, r, kind); }

  // ---------- liikumine ----------
  function goTo(e, x, z, goalCells, lv) {
    lv = lv || 0;
    // korrused: kui siht on teisel korrusel (või tuleb alla), mine läbi lähima sisetrepi
    const BB = Bases.at(e.pos.x, e.pos.z) || Bases.at(x, z);
    const cur = BB && BB.levelAt ? BB.levelAt(e.pos.x, e.pos.z, e.pos.y) : 0;
    let p = null;
    if (BB && (cur || lv)) {
      if (cur === lv) p = BB.pathUp(e.pos.x, e.pos.z, x, z) || [{ x, z }];
      else {
        const r = BB.stairRoute(lv > cur ? x : e.pos.x, lv > cur ? z : e.pos.z, lv > cur);
        if (r) {
          if (cur === 0) { const a = Bases.pathWorld(e.pos.x, e.pos.z, r.entry.x, r.entry.z) || [r.entry]; p = [...a, ...r.via, r.exit, ...(BB.pathUp(r.exit.x, r.exit.z, x, z) || [{ x, z }])]; }
          else { const a = BB.pathUp(e.pos.x, e.pos.z, r.entry.x, r.entry.z) || [r.entry]; const b = Bases.pathWorld(r.exit.x, r.exit.z, x, z, goalCells) || [{ x, z }]; p = [...a, ...r.via, r.exit, ...b]; }
        }
      }
    }
    if (!p) p = Bases.pathWorld(e.pos.x, e.pos.z, x, z, goalCells);
    e.goalLv = lv;
    e.path = p || [{ x, z }]; e.pathI = 0; e.goal = { x, z }; e.goalCells = goalCells || null; e.stuckT = 0; e.detour = null; e.stuckN = 0; e.wpBest = 1e9; e.wpT = 0;
    return !!p;
  }
  function stopMove(e) { e.path = null; e.pathI = 0; }
  function arrived(e) { return !e.path || e.pathI >= e.path.length; }
  function freeSpot(x, z, r) { const q = { x, z }; World.collideCircle(q, r, 0.3, 1.7, true); return Math.hypot(q.x - x, q.z - z) < 0.05; }
  function stepMove(e, dt, speed) {
    if (!e.path || e.pathI >= e.path.length) { e.moveAmt = Math.max(0, e.moveAmt - dt * 4); return true; }
    let tgt = e.detour || e.path[e.pathI];
    const dx = tgt.x - e.pos.x, dz = tgt.z - e.pos.z, d = Math.hypot(dx, dz);
    const reach = e.detour ? 1.0 : tgt.door ? 0.32 : e.pathI === e.path.length - 1 ? 0.4 : 0.75;
    if (d < reach) {
      if (e.detour) e.detour = null; else { e.pathI++; e.wpBest = 1e9; e.wpT = 0; }
      return e.pathI >= e.path.length;
    }
    // edenemise jälgimine vahepunkti suunas: kui ei lähene, jäta punkt vahele või otsi uus tee
    if (d < (e.wpBest || 1e9) - 0.15) { e.wpBest = d; e.wpT = 0; } else e.wpT = (e.wpT || 0) + dt;
    if (e.wpT > 2.6 && !e.detour) {
      e.wpT = 0; e.wpBest = 1e9;
      if (e.pathI < e.path.length - 1 && !tgt.door) e.pathI++;
      else if (e.goal) { const keep = e.stuckN || 0; goTo(e, e.goal.x, e.goal.z, e.goalCells, e.goalLv); e.stuckN = keep; }
      return false;
    }
    const sl = World.slopeAt(e.pos.x, e.pos.z);
    let sp = speed * (1 - clamp(sl - 0.25, 0, 0.5));
    let mx = dx / d, mz = dz / d;
    if (isHuman(e) && e.kind === 'human') {
      // elutruu liikumine: pööra enne astumist, kiirenda/aeglusta sujuvalt, aeglusta sihtkoha ja ukse ees
      const turn = Math.abs(angDiff(e.yaw, Math.atan2(mx, mz)));
      let want = sp * (turn > 1.6 ? 0.15 : turn > 0.9 ? 0.5 : 1);
      if (e.pathI === e.path.length - 1 && d < 1.6) want *= 0.45 + 0.55 * d / 1.6;
      if (tgt.door && d < 2.2) {
        want *= 0.55;
        // anna teed: kui keegi teine on juba ukseavas ja liigub vastu, oota hetk
        if (!e.doorWait || e.doorWait < 2.5) {
          let blocked = false;
          for (const o of list) {
            if (o === e || !o.alive || o.kind !== 'human' && o.kind !== 'player') continue;
            const od = Math.hypot(o.pos.x - tgt.x, o.pos.z - tgt.z);
            if (od < 1.0 && Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z) < 2.4 && (o.kind === 'player' || o.id < e.id)) { blocked = true; break; }
          }
          if (blocked) { e.doorWait = (e.doorWait || 0) + dt; want = 0; } else e.doorWait = 0;
        }
      } else e.doorWait = 0;
      if (e.limp > 0.05) want *= 1 - e.limp * 0.35 * (0.5 + 0.5 * Math.sin((e._ph || 0) * TAU * 2));   // lonkav samm
      e.curSp = (e.curSp || 0) + (want - (e.curSp || 0)) * Math.min(1, dt * (want > (e.curSp || 0) ? 3.2 : 6));
      sp = e.curSp;
    }
    // teiste inimeste vältimine: kui keegi on otse ees, astu kõrvale (paremale)
    if (isHuman(e)) {
      for (const o of list) {
        if (o === e || !o.alive || o.pose === 'lie' || !(o.kind === 'human' || o.kind === 'player')) continue;
        const ox = o.pos.x - e.pos.x, oz = o.pos.z - e.pos.z;
        if (Math.abs(ox) > 1.6 || Math.abs(oz) > 1.6) continue;
        const ahead = ox * mx + oz * mz, od = Math.hypot(ox, oz);
        if (ahead > 0.1 && od < 1.4 && od < d) {
          const lat = ox * -mz + oz * mx; // >0: teine on vasakul
          const w = (1.4 - od) / 1.4 * 0.9 * (o.path ? 1 : 1.4);
          const side = Math.abs(lat) < 0.05 ? (e.id < o.id ? 1 : -1) : -Math.sign(lat);
          const px0 = -mz, pz0 = mx; mx += px0 * side * w; mz += pz0 * side * w; // risti suunas
          const L = Math.hypot(mx, mz) || 1; mx /= L; mz /= L;
        }
      }
    }
    const step = Math.min(d, sp * dt);
    e.pos.x += mx * step; e.pos.z += mz * step;
    const want = Math.atan2(mx, mz);
    e.yaw += angDiff(e.yaw, want) * Math.min(1, dt * (e.kind === 'human' ? 6.5 : 10));
    World.collideCircle(e.pos, e.radius, e.pos.y + 0.3, e.pos.y + 1.7, isHuman(e));
    e.pos.y = groundY(e.pos.x, e.pos.z, e.pos.y);
    e.moveAmt = Math.min(1, e.moveAmt + dt * 5);
    e.speed = sp;
    // kinnijäämine: astmeline vabanemine (ukse taga ootamine ei ole kinnijäämine)
    if (e.doorWait > 0) { e.stuckT = 0; e.lastPos.x = e.pos.x; e.lastPos.z = e.pos.z; }
    e.stuckT += dt;
    if (e.stuckT > 1.0) {
      const moved = Math.hypot(e.pos.x - e.lastPos.x, e.pos.z - e.lastPos.z);
      if (moved < Math.max(0.35, sp * 0.18)) {
        const n = e.stuckN = (e.stuckN || 0) + 1;
        const BB = Bases.at(e.pos.x, e.pos.z) || Base;
        const cc = BB.toCell(e.pos.x, e.pos.z);
        const nxt = e.path[e.pathI];
        if (n >= 5 && nxt && Math.hypot(nxt.x - e.pos.x, nxt.z - e.pos.z) < 4.5 && freeSpot(nxt.x, nxt.z, e.radius)) {
          // viimane abinõu: astu otse järgmisse vahepunkti (see on alati vaba)
          e.pos.x = nxt.x; e.pos.z = nxt.z; e.pos.y = groundY(e.pos.x, e.pos.z, e.pos.y); e.detour = null;
        } else if (BB.inGrid(cc.i, cc.j) && e.goal) {
          const ctr = (n >= 3 && BB.escapeCell(cc.i, cc.j)) || BB.cellCenter(cc.i, cc.j);
          const k2 = n >= 3 ? 1 : 0.6;
          e.pos.x += (ctr.x - e.pos.x) * k2; e.pos.z += (ctr.z - e.pos.z) * k2;
          goTo(e, e.goal.x, e.goal.z, e.goalCells, e.goalLv);
          e.stuckN = n;
        } else {
          // väljas: proovi kordamööda mõlemat külge, iga kord kaugemale; vali vaba koht
          const fx = Math.sin(want), fz = Math.cos(want), dist = 2.5 + n * 1.5;
          let pickD = null;
          for (const side of (n % 2 ? [1, -1] : [-1, 1])) {
            const px = e.pos.x + (-fz * side) * dist - fx * (n >= 3 ? 2.5 : 1), pz = e.pos.z + (fx * side) * dist - fz * (n >= 3 ? 2.5 : 1);
            if (freeSpot(px, pz, e.radius + 0.2)) { pickD = { x: px, z: pz }; break; }
          }
          e.detour = pickD || { x: e.pos.x - fx * 3, z: e.pos.z - fz * 3 };
        }
      } else if (moved > 1) e.stuckN = 0;
      e.stuckT = 0; e.lastPos.x = e.pos.x; e.lastPos.z = e.pos.z;
    }
    return false;
  }
  function face(e, x, z, dt, k = 8) { e.yaw += angDiff(e.yaw, Math.atan2(x - e.pos.x, z - e.pos.z)) * Math.min(1, dt * k); }
  function separate(dt) {
    for (let i = 0; i < list.length; i++) {
      const a = list[i]; if (!a.alive || a.kind === 'boss' || a.kind === 'jelly' || a.pose === 'lie') continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]; if (!b.alive || b.kind === 'boss' || b.kind === 'jelly' || b.pose === 'lie') continue;
        const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
        if (Math.abs(dx) > 3 || Math.abs(dz) > 3) continue;
        const d = Math.hypot(dx, dz), m = a.radius + b.radius;
        if (d < m && d > 0.001) {
          // sõbrad (mõlemad liikvel) mahuvad üksteisest mööda: pehmem tõuge + külgsuunaline libisemine
          const soft = friendly(a, b) && a.kind !== 'player' && b.kind !== 'player' && (a.path || b.path) ? 0.22 : 0.5;
          const push = (m - d) * soft, nx = dx / d, nz = dz / d;
          if (soft < 0.5) { const sx = -nz * 0.25 * (m - d), sz = nx * 0.25 * (m - d); a.pos.x -= sx; a.pos.z -= sz; b.pos.x += sx; b.pos.z += sz; }
          if (a.kind !== 'player') { a.pos.x -= nx * push; a.pos.z -= nz * push; }
          if (b.kind !== 'player') { b.pos.x += nx * push; b.pos.z += nz * push; }
          if (a.kind === 'player') { b.pos.x += nx * push; b.pos.z += nz * push; }
          if (b.kind === 'player') { a.pos.x -= nx * push; a.pos.z -= nz * push; }
        }
      }
    }
  }

  // ---------- tabamussfäärid ----------
  function updateSpheres(e) {
    const s = e.spheres; s.length = 0;
    if (!e.alive) return;
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
    const x = e.pos.x, y = e.pos.y, z = e.pos.z;
    switch (e.kind) {
      case 'human': case 'player':
        if (e.pose === 'lie') { s.push([x, y + 0.5, z, 0.6, 1]); break; }
        s.push([x, y + 1.05, z, 0.42, 1]); s.push([x, y + 0.45, z, 0.32, 0.8]); s.push([x, y + 1.66, z, 0.2, 1.8]); break;
      case 'goat': case 'ram':
        s.push([x, y + 0.95, z, 0.6, 1]); s.push([x + fx * 0.85, y + 1.35, z + fz * 0.85, 0.32, 1.5]); break;
      case 'stalker':
        s.push([x, y + 0.55, z, 0.62, 1]); s.push([x + fx * 0.9, y + 0.55, z + fz * 0.9, 0.42, 1.5]); s.push([x - fx * 0.8, y + 0.5, z - fz * 0.8, 0.45, 0.8]); break;
      case 'crab':
        s.push([x, y + 0.75, z, 1.35, 1]); break;
      case 'kiskja':
        Kiskja.spheres(e, s); break;
      case 'jelly':
        s.push([x, y, z, 0.9, 1]); break;
      case 'core':
        s.push([x, y + 2.6, z, 2.2, 1]); break;
      case 'rturret':
        s.push([x, y + 1.3, z, 0.95, 1]); break;
      case 'boss':
        Boss.spheres(e, s); break;
      case 'bug':
        Waves.spheres(e, s); break;
    }
  }
  // kiir vs olemid
  function raycast(ox, oy, oz, dx, dy, dz, maxT, ignoreTeam, ignoreE) {
    let best = maxT, be = null, bm = 1, bi = -1;
    for (const e of list) {
      if (!e.alive || e === ignoreE || (ignoreTeam && friendly(e, { team: ignoreTeam }))) continue;
      if (e.kind === 'player' && ignoreTeam === 'player') continue;
      for (let i = 0; i < e.spheres.length; i++) {
        const sp = e.spheres[i];
        const fx = ox - sp[0], fy = oy - sp[1], fz = oz - sp[2];
        const b = fx * dx + fy * dy + fz * dz, c = fx * fx + fy * fy + fz * fz - sp[3] * sp[3];
        const disc = b * b - c; if (disc < 0) continue;
        let t = -b - Math.sqrt(disc); if (t < 0) t = -b + Math.sqrt(disc);
        if (t >= 0 && t < best) { best = t; be = e; bm = sp[4]; bi = i; }
      }
    }
    return be ? { e: be, t: best, mult: bm, idx: bi } : null;
  }

  // ---------- kahju ----------
  function damage(e, amt, src, opts = {}) {
    if (!e || !e.alive) return;
    // co-op: kaasmängija avatar saab haiget oma masinas; külalise lasud lähevad peremehele
    if (typeof Net !== 'undefined' && Net.active && Net.onDamage(e, amt, src, opts)) return;
    if (e.kind === 'player') { Player.hurt(amt, src); return; }
    if (e.kind === 'boss') { Boss.damage(e, amt, src, opts); return; }
    if (e.crew && e.crew.look && e.crew.look.eq) amt *= Inv.armorMul(e.crew.look.eq);
    e.hp -= amt; e.hurtT = 0.25; e.lastAttacker = src;
    if (e.onHurt) e.onHurt(e, src, amt);
    hurtReact(e, src, amt);
    if (e.hp <= 0) kill(e, src);
  }
  function hurtReact(e, src) {
    if (!src || !src.pos) return;
    if (e.kind === 'goat') { e.state = 'flee'; e.stateT = 5; e.fleeFrom = { x: src.pos.x, z: src.pos.z }; }
    if (e.kind === 'ram') { e.state = 'charge'; e.stateT = 12; e.target = src; }
    if (e.kind === 'stalker') { if (e.state === 'buried') emerge(e); e.state = 'hunt'; e.target = src; e.stateT = 20; }
    if (e.kind === 'crab') { e.state = 'angry'; e.target = src; e.stateT = 15; }
  }
  function kill(e, src) {
    e.alive = false; e.hp = 0; e.deathT = 0; e.pose = 'dead'; stopMove(e);
    const fx = { x: e.pos.x, y: e.pos.y, z: e.pos.z };
    if (e.kind === 'goat' || e.kind === 'ram') {
      e.meat = e.kind === 'ram' ? 5 : 3; e.butcherable = true;
      // karja reaktsioon
      for (const o of list) if (o.alive && o.herd === e.herd && o !== e) {
        if (o.kind === 'ram' && src && src.pos && Math.hypot(src.pos.x - o.pos.x, src.pos.z - o.pos.z) < 45) { o.state = 'charge'; o.target = src; o.stateT = 12; }
        else if (o.kind === 'goat') { o.state = 'flee'; o.stateT = 6; o.fleeFrom = src && src.pos ? { x: src.pos.x, z: src.pos.z } : fx; }
      }
      Audio2.goat(fx.x, fx.z);
    }
    if (e.kind === 'bug') Waves.onKill(e);
    if (e.kind === 'kiskja') Kiskja.onKill(e);
    if (e.kind === 'stalker') { Audio2.stalker(fx.x, fx.z); FX.goo(fx.x, fx.y + 0.5, fx.z, [0.55, 0.75, 0.2], 16); }
    if (e.kind === 'crab') {
      Audio2.crab(fx.x, fx.z);
      FX.crystalBurst(fx.x, fx.y + 1, fx.z);
      Comets.spawnLoose(fx.x, fx.z, 6 + randi(0, 3));
    }
    if (e.kind === 'jelly') { FX.sparks(fx.x, fx.y, fx.z, [0.8, 0.6, 1.0], 30, 6); e.remove = true; }
    if (e.kind === 'core') Rivals.coreDestroyed(e);
    if (e.kind === 'rturret') { FX.explosion(fx.x, fx.y + 1.5, fx.z, [1, 0.6, 0.3], 1); Audio2.explode(fx.x, fx.z, false); }
    if (e.kind === 'human') {
      Audio2.death(fx.x, fx.z);
      if (e.team === 'crew' && typeof Crew !== 'undefined') Crew.onDeath(e, src);
      else if (typeof Rivals !== 'undefined') Rivals.onUnitDeath(e, src);
    }
    if (src && src.kind === 'player') { G.stats.kills++; if (e.kind === 'bug' || e.kind === 'stalker' || e.kind === 'kiskja' || e.kind === 'crab' || e.kind === 'human') UI.hitMarker(true); }
  }

  // ---------- olendite AI ----------
  function nearestHuman(e, range, pred) {
    let best = null, bd = range;
    for (const o of list) {
      if (!o.alive || !isHuman(o)) continue;
      if (o.kind === 'player' && (Player.dead || G.mode === 'build')) continue;
      if (pred && !pred(o)) continue;
      const d = Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z);
      if (d < bd) { bd = d; best = o; }
    }
    return best ? { e: best, d: bd } : null;
  }
  function lightNear(x, z) {
    for (const o of Base.objs.values()) if (o.type === 'prozektor' && o.on && Math.hypot(o.cx - x, o.cz - z) < 22) return true;
    return false;
  }
  function emerge(e) { e.state = 'hunt'; e.stateT = 15; FX.dust(e.pos.x, e.pos.y + 0.3, e.pos.z, 14, 2.5); Audio2.stalker(e.pos.x, e.pos.z); }

  function updateGoat(e, dt) {
    const herd = Herds.get(e.herd);
    e.stateT -= dt;
    // ohud
    if (e.state !== 'flee' && e.state !== 'charge') {
      const th = nearestHuman(e, e.kind === 'ram' ? 7 : 11, (o) => o.team !== 'crew' || o.role === 'jahimees' || true);
      if (th && (th.e.kind !== 'player' || Player.speedNow > 1.5 || th.d < 6)) { e.state = 'flee'; e.stateT = 4 + Math.random() * 2; e.fleeFrom = { x: th.e.pos.x, z: th.e.pos.z }; }
      for (const n of noises) if (Math.hypot(n.x - e.pos.x, n.z - e.pos.z) < n.r && n.kind === 'shot') { e.state = 'flee'; e.stateT = 5; e.fleeFrom = { x: n.x, z: n.z }; }
    }
    if (e.state === 'flee') {
      const fx = e.pos.x - e.fleeFrom.x, fz = e.pos.z - e.fleeFrom.z, d = Math.hypot(fx, fz) || 1;
      if (!e.path || arrived(e) || Math.random() < dt * 0.5) { e.path = [{ x: e.pos.x + (fx / d) * 25 + rand(-6, 6), z: e.pos.z + (fz / d) * 25 + rand(-6, 6) }]; e.pathI = 0; }
      stepMove(e, dt, e.kind === 'ram' ? 8 : 9);
      if (e.stateT <= 0) { e.state = 'graze'; stopMove(e); if (herd) { herd.x = e.pos.x; herd.z = e.pos.z; } }
    } else if (e.state === 'charge') {
      const t = e.target;
      if (!t || !t.alive || e.stateT <= 0) { e.state = 'graze'; e.target = null; stopMove(e); }
      else {
        e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0;
        stepMove(e, dt, 8.5);
        const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
        if (d < 1.9 && e.cool <= 0) { damage(t, 11 * G.dk.edmg, e); e.cool = 1.5; FX.dust(t.pos.x, t.pos.y + 0.5, t.pos.z, 6, 1); Audio2.goat(e.pos.x, e.pos.z); }
      }
    } else {
      // karjatamine
      if (e.stateT <= 0) {
        e.stateT = rand(3, 9);
        if (herd && Math.random() < 0.6) { const a = rand(0, TAU), r = rand(0, 10); e.path = [{ x: herd.x + Math.cos(a) * r, z: herd.z + Math.sin(a) * r }]; e.pathI = 0; e.grazing = 0; }
        else { stopMove(e); e.grazing = rand(2, 6); }
        if (Math.random() < 0.1) Audio2.goat(e.pos.x, e.pos.z);
      }
      if (e.grazing > 0) e.grazing -= dt;
      stepMove(e, dt, 1.6);
    }
    if (e.cool > 0) e.cool -= dt;
  }

  function updateStalker(e, dt) {
    e.stateT -= dt; if (e.cool > 0) e.cool -= dt;
    const night = Econ.isNight();
    if (e.state === 'buried') {
      const th = nearestHuman(e, night ? 16 : 11);
      if (th) { e.target = th.e; emerge(e); }
      return;
    }
    if (e.state === 'flee') {
      if (!e.path || arrived(e)) { const a = rand(0, TAU); e.path = [{ x: e.pos.x + Math.cos(a) * 40, z: e.pos.z + Math.sin(a) * 40 }]; e.pathI = 0; }
      stepMove(e, dt, 9);
      if (e.stateT <= 0) { e.state = 'buried'; FX.dust(e.pos.x, e.pos.y + 0.2, e.pos.z, 10, 2); }
      return;
    }
    const range = night ? 46 : 22;
    if (!e.target || !e.target.alive || (e.target.kind === 'player' && (Player.dead || G.mode === 'build'))) {
      const th = nearestHuman(e, range);
      e.target = th ? th.e : null;
    }
    if (e.hp < e.maxHp * 0.25 && Math.random() < dt * 0.5) { e.state = 'flee'; e.stateT = 6; e.target = null; return; }
    if (e.target) {
      const t = e.target, d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
      if (d > range * 1.5) { e.target = null; return; }
      if (!e.path || e.pathI >= e.path.length || Math.random() < dt * 2) {
        if (Base.isInside(t.pos.x, t.pos.z) && d < 30) goTo(e, t.pos.x, t.pos.z); else { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; }
      }
      stepMove(e, dt, d < 8 ? 10.5 : 8.5);
      if (d < 2.3 && e.cool <= 0 && Math.abs(t.pos.y - e.pos.y) < 2) {
        damage(t, 11 * G.dk.edmg, e); e.cool = 1.05; e.lunge = 0.3; Audio2.stalker(e.pos.x, e.pos.z);
      }
    } else {
      // komeedi meelitus: liigub kraatri juurde ja tiirleb seal
      if (e.lure && e.lure.t > 0) {
        const L = e.lure, dl = Math.hypot(L.x - e.pos.x, L.z - e.pos.z);
        if (!e.path || arrived(e) || e.stateT <= 0) { e.stateT = rand(3, 7); const a = rand(0, TAU), r = dl > 25 ? 0 : rand(4, 16); e.path = [{ x: L.x + Math.cos(a) * r, z: L.z + Math.sin(a) * r }]; e.pathI = 0; }
        stepMove(e, dt, dl > 25 ? 7.5 : 3.5);
        return;
      }
      // ringlemine: öösel liigub baasi poole
      if (!e.path || arrived(e) || e.stateT <= 0) {
        e.stateT = rand(5, 12);
        let tx, tz;
        if (night && Math.random() < 0.55) { const a = rand(0, TAU); tx = Math.cos(a) * rand(30, 60); tz = Math.sin(a) * rand(30, 60); }
        else { const a = rand(0, TAU); tx = e.pos.x + Math.cos(a) * 30; tz = e.pos.z + Math.sin(a) * 30; }
        if (lightNear(tx, tz)) { tx = e.pos.x - (tx - e.pos.x); tz = e.pos.z - (tz - e.pos.z); }
        e.path = [{ x: tx, z: tz }]; e.pathI = 0;
      }
      stepMove(e, dt, 4.5);
      if (!night && Math.random() < dt * 0.05) { e.state = 'buried'; FX.dust(e.pos.x, e.pos.y + 0.2, e.pos.z, 10, 2); }
    }
    if (e.lunge > 0) e.lunge -= dt;
  }

  function updateCrab(e, dt) {
    e.stateT -= dt; if (e.cool > 0) e.cool -= dt;
    if (e.state !== 'angry') {
      const th = nearestHuman(e, 11);
      if (th) { e.state = 'angry'; e.target = th.e; e.stateT = 15; Audio2.crab(e.pos.x, e.pos.z); }
      else {
        // aeglane pööramine
        e.yaw += Math.sin(e.phase * 0.3) * dt * 0.2; e.phase += dt;
        if (Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) > 3) { e.path = [e.home]; e.pathI = 0; stepMove(e, dt, 1.5); }
        else e.moveAmt = Math.max(0, e.moveAmt - dt * 3);
        return;
      }
    }
    const t = e.target;
    if (!t || !t.alive || e.stateT <= 0 || Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z) > 38 || Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) > 45) {
      e.state = 'idle'; e.target = null; return;
    }
    const d = Math.hypot(t.pos.x - e.pos.x, t.pos.z - e.pos.z);
    face(e, t.pos.x, t.pos.z, dt, 3);
    if (d > 7) { e.path = [{ x: t.pos.x, z: t.pos.z }]; e.pathI = 0; stepMove(e, dt, 2.4); } else e.moveAmt = Math.max(0, e.moveAmt - dt * 3);
    if (d < 3.2 && e.cool <= 0) { damage(t, 16 * G.dk.edmg, e); e.cool = 1.6; e.claw = 0.4; Audio2.crab(e.pos.x, e.pos.z); }
    else if (d < 30 && e.cool <= 0) {
      e.cool = 2.6; Audio2.crab(e.pos.x, e.pos.z);
      for (let k = 0; k < 3; k++) {
        const tx = t.pos.x + (t.vel ? t.vel.x * 0.5 : 0) + rand(-1.5, 1.5), tz = t.pos.z + (t.vel ? t.vel.z * 0.5 : 0) + rand(-1.5, 1.5);
        const sx = e.pos.x, sy = e.pos.y + 1.6, sz = e.pos.z;
        const dist = Math.hypot(tx - sx, tz - sz), T = clamp(dist / 22, 0.4, 1.6);
        const ty = groundY(tx, tz) + 1.0;
        projs.push({ x: sx, y: sy, z: sz, vx: (tx - sx) / T, vy: (ty - sy) / T + 0.5 * 14 * T, vz: (tz - sz) / T, g: 14, life: 3, dmg: 9 * G.dk.edmg, owner: e, kind: 'spine', r: 0.4, delay: k * 0.12 });
      }
    }
  }

  function updateJelly(e, dt) {
    e.phase += dt;
    if (!e.drift) e.drift = { x: rand(-1, 1), z: rand(-1, 1) };
    e.pos.x += e.drift.x * dt * 1.2; e.pos.z += e.drift.z * dt * 1.2;
    if (Math.random() < dt * 0.05) e.drift = { x: rand(-1, 1), z: rand(-1, 1) };
    if (Math.abs(e.pos.x) > World.HALF - 80 || Math.abs(e.pos.z) > World.HALF - 80) { e.drift.x = -Math.sign(e.pos.x) * 0.8; e.drift.z = -Math.sign(e.pos.z) * 0.8; }
    e.pos.y = World.heightAt(e.pos.x, e.pos.z) + e.alt + Math.sin(e.phase * 0.7) * 1.2;
  }

  // ---------- mürsud ----------
  function updateProjs(dt) {
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.life -= dt;
      const ox = p.x, oy = p.y, oz = p.z;
      p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      FX.trail(p);
      let hit = false;
      // olemid
      for (const e of list) {
        if (!e.alive || e === p.owner || (p.owner && friendly(e, p.owner))) continue;
        for (const s of e.spheres) {
          if ((s[0] - p.x) ** 2 + (s[1] - p.y) ** 2 + (s[2] - p.z) ** 2 < (s[3] + p.r) ** 2) { damage(e, p.dmg, p.owner); hit = true; break; }
        }
        if (hit) break;
      }
      if (!hit && p.y < World.heightAt(p.x, p.z)) hit = true;
      if (!hit) {
        const dx = p.x - ox, dy = p.y - oy, dz = p.z - oz, L = Math.hypot(dx, dy, dz);
        if (L > 0 && World.raycastCols(ox, oy, oz, dx / L, dy / L, dz / L, L)) hit = true;
      }
      if (hit || p.life <= 0) {
        if (p.splash) {
          for (const e of list) {
            if (!e.alive || (p.owner && friendly(e, p.owner))) continue;
            const d = Math.hypot(e.pos.x - p.x, e.pos.y + 1 - p.y, e.pos.z - p.z);
            if (d < p.splash) damage(e, p.dmg * (1 - d / p.splash) * 1.2, p.owner);
          }
          FX.explosion(p.x, p.y, p.z, p.kind === 'shard' ? [1.0, 0.4, 0.8] : [1, 0.6, 0.3], 1.2);
          Audio2.explode(p.x, p.z, false);
        } else FX.dust(p.x, p.y, p.z, 4, 0.7);
        projs.splice(i, 1);
      }
    }
  }

  // ---------- uuendus ----------
  function update(dt) {
    for (const n of noises) n.t -= dt;
    for (let i = noises.length - 1; i >= 0; i--) if (noises[i].t <= 0) noises.splice(i, 1);
    for (const e of list) {
      if (e.hurtT > 0) e.hurtT -= dt;
      // komeedi meelitus kustub; ainult selleks tulnud olendid kaovad, kui keegi ei näe
      if (e.lure) {
        e.lure.t -= dt;
        if (e.lure.t <= 0) { if (e.lureSpawn && e.alive && !e.target && Math.hypot(e.pos.x - Player.pos.x, e.pos.z - Player.pos.z) > 140) e.remove = true; e.lure = null; }
      }
      if (!e.alive) {
        e.deathT += dt;
        if (e.kind === 'human' && e.deathT > 40) e.remove = true;
        if ((e.kind === 'goat' || e.kind === 'ram') && (e.deathT > 400 || (!e.butcherable && e.deathT > 8))) e.remove = true;
        if ((e.kind === 'stalker' || e.kind === 'crab' || e.kind === 'kiskja') && e.deathT > 25) e.remove = true;
        continue;
      }
      const far = Math.hypot(e.pos.x - Player.pos.x, e.pos.z - Player.pos.z) > 260 && Math.hypot(e.pos.x, e.pos.z) > 120 && !(typeof Net !== 'undefined' && Net.active && Net.nearAvatar(e.pos.x, e.pos.z, 260));
      if (far && e.kind !== 'human' && e.kind !== 'bug' && e.kind !== 'boss' && Math.random() > dt * 4) { updateSpheres(e); continue; }
      switch (e.kind) {
        case 'goat': case 'ram': updateGoat(e, dt); break;
        case 'stalker': updateStalker(e, dt); break;
        case 'kiskja': Kiskja.update(e, dt); break;
        case 'crab': updateCrab(e, dt); break;
        case 'jelly': updateJelly(e, dt); break;
        case 'bug': Waves.bugAI(e, dt); break;
        case 'human': if (e.ai) e.ai(e, dt); break;
        case 'boss': Boss.update(e, dt); break;
        case 'rturret': Rivals.turretAI(e, dt); break;
      }
      e.phase += dt * (e.speed || 0) * e.moveAmt * 1.6;
      updateSpheres(e);
    }
    separate(dt);
    for (let i = list.length - 1; i >= 0; i--) if (list[i].remove) list.splice(i, 1);
    updateProjs(dt);
    for (let i = pickups.length - 1; i >= 0; i--) { const p = pickups[i]; p.t = (p.t || 0) + dt; if (p.gone) pickups.splice(i, 1); }
  }

  // ---------- joonistamine ----------
  const R = M4.create(), B = M4.create();
  const HURT_T = [1.6, 0.6, 0.5, 0.2];
  let LAY_DY = 0.0, LAY_DZ = 0.2, LAY_YAW = 0;
  function mats(e, n) { if (!e.ms) { e.ms = []; } while (e.ms.length < n) e.ms.push(M4.create()); return e.ms; }
  const TEAM_TINT = { krell: [1.12, 0.82, 0.78, 0], klann: [0.86, 0.82, 1.05, 0] };
  // realistlik inimene: animatsioonid segatakse kiiruse järgi, relv käes IK-ga
  const hst = { type: 'male', tints: null, layers: [{ clip: 'idle', t: 0, w: 1 }, { clip: 'walk', t: 0, w: 0 }, { clip: 'run', t: 0, w: 0 }], aim: 0, pitch: 0, headYaw: 0, pose: 'stand', gun: false, recoil: 0 };
  function lookOf(e) {
    if (e.look) return e.look;
    if (e.crew) { if (!e.crew.look) e.crew.look = Look.forName(e.crew.name); return (e.look = e.crew.look); }
    if (e.team === 'krell' || e.team === 'klann') return (e.look = Look.rival(e.team));
    if (e.team === 'player') return (e.look = G.look || Look.player());
    return (e.look = Look.random());
  }
  // varumudel: lihtsad jäigad osad (kui nahastatud graafika pole saadaval)
  function drawHumanOld(e) {
    let P = MODELS.human[e.team === 'player' ? 'player' : e.team] || MODELS.human.crew;
    if (e.team === 'crew' && e.id % 2 && MODELS.human.crew2) P = MODELS.human.crew2;
    const G2 = P.rig;
    const ms = mats(e, 8);
    const tint = e.hurtT > 0 ? HURT_T : e.tint || TEAM_TINT[e.team] || null;
    const sw = Math.sin(e.phase || 0) * 0.6 * (e.moveAmt || 0);
    let rootPitch = 0, rootRoll = 0, rootY = e.pos.y, hip = G2.hip;
    if (e.pose === 'dead' || e.alive === false) { rootRoll = Math.PI / 2 * Math.min(1, (e.deathT || 0) * 2.5); rootY = e.pos.y + 0.25; }
    if (e.pose === 'lie') { rootPitch = -Math.PI / 2; rootY = e.lieY || e.pos.y + 0.55; }
    M4.compose(R, e.pos.x, rootY, e.pos.z, e.yaw, rootPitch, rootRoll);
    if (e.pose === 'lie') M4.child(R, R, 0, -0.9, 0.15, 0, 0, 0);
    const sit = e.pose === 'sit', sitDrop = sit ? hip * 0.42 : 0;
    M4.child(ms[0], R, 0, hip - sitDrop, G2.hipZ, 0, sit ? -0.08 : 0.05 * (e.moveAmt || 0), 0); GFX.draw(P.body, ms[0], tint);
    M4.child(ms[1], ms[0], G2.head[0], G2.head[1], G2.head[2], e.headYaw || 0, 0.04, 0); GFX.draw(P.head, ms[1], tint);
    const aim = e.aim || 0, ap = e.aimPitch || 0;
    M4.child(ms[2], ms[0], G2.armR[0], G2.armR[1], G2.armR[2], lerp(0, 0.28, aim), lerp(-sw, -1.42 - ap, aim), 0); GFX.draw(P.armR, ms[2], tint);
    M4.child(ms[3], ms[0], G2.armL[0], G2.armL[1], G2.armL[2], lerp(0, -0.45, aim), lerp(sw, -1.25 - ap, aim), 0); GFX.draw(P.armL, ms[3], tint);
    M4.child(ms[4], R, G2.legL[0], G2.legL[1] - sitDrop, G2.legL[2], 0, sit ? -1.5 : sw, 0); GFX.draw(P.legL, ms[4], tint);
    M4.child(ms[5], R, G2.legR[0], G2.legR[1] - sitDrop, G2.legR[2], 0, sit ? -1.5 : -sw, 0); GFX.draw(P.legR, ms[5], tint);
    if (e.hasGun !== false && e.pose !== 'lie' && e.pose !== 'sit' && e.alive !== false) {
      M4.child(ms[6], ms[0], G2.armR[0] * 0.45, G2.armR[1] - 0.1, 0.35, 0, -ap * aim, 0);
      GFX.draw(npcGunMesh(e) || MODELS.carbine, ms[6]);
    }
    if (e.flash > 0) e.flash -= 1 / 60;
  }
  const skOpt = { shadow: true };
  // FACS näoilmed (Vitruvian): pilgutus, rääkimine, naeratus, viha, kurbus, hirm, kulmud
  // järjekord = CHAR_DATA morph.names: blink, talk, smile, angry, sad, fear, oo, brows
  function faceTick(e, dt, pose) {
    const f = e._fw || (e._fw = new Float32Array(8)), tg = e._ft || (e._ft = new Float32Array(8));
    const alive = e.alive !== false, c = e.crew, t = G.time.total + (G.mode === 'title' ? performance.now() / 1000 : 0);
    tg.fill(0);
    // pilgutus
    if (e._bk === undefined) e._bk = Math.random() * 4;
    e._bk -= dt; if (e._bk < -0.16) e._bk = 1.5 + Math.random() * 4.5;
    const asleep = pose === 'lie' && c && /sleep|Sleep|magab|Resting/.test(c.act || '');
    let blink = e._bk < 0 ? 1 - Math.abs(e._bk + 0.08) / 0.08 : 0;
    if (!alive) blink = 0.85; else if (asleep || e.downed) blink = 1;
    const hpF = e.maxHp ? e.hp / e.maxHp : 1;
    if (alive && !asleep) {
      const talking = (e._said && t - e._said < 2.4) || e.gesture === 'talk' || e.gesture === 'sitTalk' || (e._talkT > 0);
      if (talking) { const ph = t * 9 + e.id; const a = Math.abs(Math.sin(ph)) * (0.55 + 0.45 * Math.sin(ph * 0.37)); tg[1] = 0.15 + a * 0.75; tg[6] = Math.max(0, Math.sin(ph * 0.53)) * 0.5; }
      if (c) {
        if (c.morale > 72 || e.gesture === 'cheer' || e.dance > 0.1) tg[2] = c.morale > 85 || e.dance > 0.1 ? 0.85 : 0.45;
        if (c.morale < 30 || e.mourn) tg[4] = e.mourn ? 0.9 : 0.6;
        if (e.gesture === 'wave' || e._greetT > 0) { tg[2] = Math.max(tg[2], 0.7); tg[7] = 0.6; }
      }
      if ((e.aim > 0.3 || e.target) && e.kind === 'human') tg[3] = 0.7;
      if (e._startle && t - e._startle.t < 2.5) { tg[5] = Math.max(tg[5], 0.75); tg[7] = 0.8; }
      if (hpF < 0.4 || e.hurtT > 0) { tg[5] = e.hurtT > 0 ? 0.9 : 0.5; tg[3] *= 0.5; tg[2] = 0; }
    }
    const k = Math.min(1, dt * 5);
    for (let i = 0; i < 8; i++) f[i] += (tg[i] - f[i]) * (i === 1 || i === 6 ? Math.min(1, dt * 14) : k);
    f[0] = Math.max(blink, f[5] * 0.15);
    let any = false;
    for (let i = 0; i < 8; i++) { if (f[i] < 0.01) f[i] = 0; else any = true; }
    return any ? f : null;
  }
  function drawHuman(e) {
    const cd = Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z);
    if (cd > 260) return;
    const L = lookOf(e);
    // kiirus asukoha muutusest (sujuvalt)
    const now = G.time.total + (G.mode === 'title' ? performance.now() / 1000 : 0);
    const dt = clamp(now - (e._at || now), 0, 0.1); e._at = now;
    if (e._lx === undefined) { e._lx = e.pos.x; e._lz = e.pos.z; e._v = 0; e._ph = Math.random(); e._it = Math.random() * 5; }
    const dist = Math.hypot(e.pos.x - e._lx, e.pos.z - e._lz); e._lx = e.pos.x; e._lz = e.pos.z;
    const vNow = dt > 0 ? Math.min(9, dist / dt) : 0;
    e._v += (vNow - e._v) * Math.min(1, dt * 8);
    const v = e.alive === false ? 0 : e._v;
    const runW = clamp((v - 2.2) / 1.6, 0, 1), moveW = clamp(v / 0.9, 0, 1);
    e._ph += dist / lerp(1.45, 2.8, runW);
    e._it += dt;
    const sad = e.crew && e.crew.morale < 25;
    const C = Chars.clips;
    if (e.gesture !== e._g) { e._g = e.gesture; e._gt = 0; }
    e._gt = (e._gt || 0) + dt;
    let idleClip = e.gesture && C[e.gesture] ? e.gesture : e.team === 'krell' || e.team === 'klann' || e.team === 'player' ? 'idle' : (sad ? 'sad' : (e.id % 3 === 0 ? 'idle2' : 'idle'));
    if ((e.pose === 'sit') && C.sit && !(idleClip === 'sit' || idleClip === 'sitTalk')) idleClip = 'sit';
    hst.layers[0].clip = idleClip; hst.layers[0].t = e.gesture ? e._gt : e._it; hst.layers[0].w = 1 - moveW;
    hst.layers[1].clip = e.crew && e.crew.carry && C.carry ? 'carry' : 'walk'; hst.layers[1].t = e._ph * (C.walk ? C.walk.dur : 1); hst.layers[1].w = moveW * (1 - runW);
    hst.layers[2].clip = 'run'; hst.layers[2].t = e._ph * (C.run ? C.run.dur : 1); hst.layers[2].w = moveW * runW;
    let pose = e.pose || 'stand';
    if (e.alive === false || pose === 'dead') { pose = 'dead'; hst.layers[0].clip = 'sad'; hst.layers[0].w = 1; hst.layers[1].w = hst.layers[2].w = 0; }
    const layClip = pose === 'lie' && C.lay;
    if (layClip) { hst.layers[0].clip = 'lay'; hst.layers[0].t = 0; hst.layers[0].w = 1; hst.layers[1].w = hst.layers[2].w = 0; }
    hst.type = L.type; hst.tints = Look.tints(L);
    hst.aim = e.aim || 0; hst.pitch = e.aimPitch || 0; hst.headYaw = e.headYaw || 0;
    hst.pose = pose === 'sit' ? 'sit' : 'stand';
    hst.gun = e.hasGun !== false && pose !== 'lie' && pose !== 'sit' && pose !== 'dead';
    hst.recoil = e.flash > 0 ? e.flash * 60 : 0;
    // elutruu kehakeel: väsimus, haavad, pilk, tants, varjes kükitamine, käes hoitav ese, seljakoorem
    {
      const c = e.crew, hpF = e.maxHp ? e.hp / e.maxHp : 1, alive = e.alive !== false;
      const tSl = alive && c ? Math.max(c.energy < 30 ? (30 - c.energy) / 30 : 0, c.morale < 25 ? (25 - c.morale) / 35 : 0, e.mourn ? 0.6 : 0) : 0;
      e._slump = (e._slump || 0) + (tSl - (e._slump || 0)) * Math.min(1, dt * 2);
      hst.slump = e.aim > 0.3 ? 0 : e._slump;
      e.limp = alive && hpF < 0.55 && e.kind === 'human' ? (0.55 - hpF) / 0.55 : 0;
      hst.limp = e.limp * moveW; hst.limpPh = e._ph;
      hst.hold = alive && hpF < 0.4 && !e.aim ? (0.4 - hpF) / 0.4 : 0;
      hst.headPitch = e.headPitch || 0;
      hst.sway = e.dance || 0; hst.swayT = e._it;
      hst.lunge = e.lunge2 || 0; hst.crouch = e.crouch || 0;
      hst.prop = e.prop && MODELS.life && MODELS.life[e.prop] && pose !== 'lie' ? e.prop : null;
      hst.backLoad = e.crew && e.crew.carry > 0 && MODELS.life ? (e.crew.carryKind === 'kris' ? 'sackKris' : e.crew.carryKind === 'meat' ? 'meatLoad' : 'scrapBundle') : null;
    }
    if (e.crew && !L.eq) Look.ensureEq(L);
    hst.gear = Look.gearLvl(L); hst.eq = L.eq || null; hst.gearTint = Look.gearTint(L);
    const sc = Look.scale(L);
    let rootPitch = 0, rootY = e.pos.y, roll = 0;
    if (pose === 'dead') { const k = Math.min(1, (e.deathT || 0) * 2.2); rootPitch = -Math.PI / 2 * k * k; rootY = e.pos.y + 0.12 * k - Math.max(0, (e.deathT || 0) - 30) * 0.05; }
    if (pose === 'lie' && !layClip) { rootPitch = -Math.PI / 2; rootY = e.lieY || e.pos.y + 0.55; }
    if (layClip) rootY = (e.lieY || e.pos.y + 0.55) + LAY_DY;
    M4.compose(R, e.pos.x, rootY, e.pos.z, e.yaw + (layClip ? LAY_YAW : 0), rootPitch, roll, sc[0], sc[1], sc[2]);
    if (pose === 'lie' && !layClip) M4.child(R, R, 0, -0.95, 0.12, 0, 0, 0);
    if (layClip) M4.child(R, R, 0, 0, LAY_DZ, 0, 0, 0);
    const tint = e.hurtT > 0 ? HURT_T : null;
    const ms = mats(e, 2);
    ms[0].set(R);
    skOpt.shadow = cd < 45;
    skOpt.morph = cd < 30 ? faceTick(e, dt, pose) : null;
    if (typeof npcGun === 'function') hst.gunK = npcGun(e);
    const r = Chars.draw(hst, ms[0], tint, skOpt);
    if (!r) { drawHumanOld(e); return; }
    if (r && r.hasGun) {
      ms[1].set(r.gun);
      GFX.draw(npcGunMesh(e), ms[1]);
      if (e.flash > 0) {
        const mp = M4.point(ms[1], 0, 0.04, 0.66, tmpV);
        GFX.addLight(mp.x, mp.y, mp.z, 6, 1, 0.7, 0.3, 2.5);
        e.flash -= 1 / 60;
      }
    } else if (e.flash > 0) e.flash -= 1 / 60;
    if (r && r.hasProp && hst.prop) { if (!e._pm) e._pm = M4.create(); e._pm.set(r.prop); GFX.draw(MODELS.life[hst.prop], e._pm, tint, null, { shadow: cd < 30 }); }
    if (r && r.hasBack && hst.backLoad) { if (!e._bm) e._bm = M4.create(); e._bm.set(r.back); GFX.draw(MODELS.life[hst.backLoad], e._bm, tint, null, { shadow: cd < 30 }); }
    if (r) { e.headPos = e.headPos || { x: 0, y: 0, z: 0 }; e.headPos.x = r.head.x; e.headPos.y = r.head.y; e.headPos.z = r.head.z; }
  }
  const titleFig = { id: 2, team: 'crew', pos: { x: 3.2, y: 0, z: 10.2 }, yaw: Math.PI - 0.25, phase: 0, moveAmt: 0, aim: 0, pose: 'stand', hasGun: true, hurtT: 0, flash: 0 };
  function drawTitleFigure() { titleFig.pos.y = groundY(titleFig.pos.x, titleFig.pos.z); titleFig.headYaw = Math.sin(G.time.total * 0.3) * 0.25; drawHuman(titleFig); }
  function drawGoat(e) {
    if (typeof Prey !== 'undefined' && Prey.draw(e)) return;
    const ms = mats(e, 7);
    const tint = e.hurtT > 0 ? HURT_T : null;
    const ram = e.kind === 'ram';
    const sc = ram ? 1.18 : 1.0 * (e.size || 1);
    const dead = !e.alive;
    M4.compose(R, e.pos.x, e.pos.y + (dead ? 0.15 : 0), e.pos.z, e.yaw, 0, dead ? Math.PI / 2 * Math.min(1, e.deathT * 3) : 0, sc, sc, sc);
    const bob = Math.abs(Math.sin(e.phase * 2)) * 0.05 * e.moveAmt;
    M4.child(ms[0], R, 0, bob, 0, 0, 0, 0); GFX.draw(MODELS.goatBody, ms[0], tint);
    const headDown = !dead && e.grazing > 0 ? 1.0 : 0;
    M4.child(ms[1], ms[0], 0, 1.1, 0.5, 0, headDown * 0.9 - (e.state === 'charge' ? -0.5 : 0), 0); GFX.draw(ram ? MODELS.ramHead : MODELS.goatHead, ms[1], tint);
    const sw = Math.sin(e.phase) * 0.7 * e.moveAmt;
    const legs = [[-0.2, 0.42, sw], [0.2, 0.42, -sw], [-0.2, -0.42, -sw], [0.2, -0.42, sw]];
    for (let k = 0; k < 4; k++) { M4.child(ms[2 + k], ms[0], legs[k][0], 0.85, legs[k][1], 0, dead ? -0.6 : legs[k][2], 0); GFX.draw(MODELS.goatLeg, ms[2 + k], tint); }
  }
  function drawStalker(e) {
    const M = MODELS.lo && Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 30 ? MODELS.lo : MODELS;
    const ms = mats(e, 7);
    const tint = e.hurtT > 0 ? HURT_T : null;
    const dead = !e.alive;
    let y = e.pos.y;
    if (e.state === 'buried') y -= 0.95;
    M4.compose(R, e.pos.x, y + (dead ? 0.1 : 0), e.pos.z, e.yaw, 0, dead ? Math.PI * 0.9 * Math.min(1, e.deathT * 3) : 0);
    M4.child(ms[0], R, 0, Math.sin(e.phase * 2) * 0.05 * e.moveAmt, 0, Math.sin(e.phase) * 0.08 * e.moveAmt, 0, 0);
    GFX.draw(M.stalkerBody, ms[0], tint);
    M4.child(ms[1], ms[0], 0, 0.6, 0.95, 0, (e.lunge > 0 ? -0.4 : 0) + Math.sin(e.phase * 3) * 0.05, 0); GFX.draw(M.stalkerHead, ms[1], tint);
    M4.child(ms[2], ms[0], 0, 0.55, -0.85, Math.sin(e.phase * 1.3 + 1) * 0.4, 0.1, 0); GFX.draw(M.stalkerTail, ms[2], tint);
    const sw = Math.sin(e.phase) * 0.6 * e.moveAmt;
    const legs = [[-1, 0.5, sw], [1, 0.5, -sw], [-1, -0.45, -sw], [1, -0.45, sw]];
    for (let k = 0; k < 4; k++) {
      const s = legs[k][0];
      M4.child(ms[3 + k], ms[0], s * 0.3, 0.55, legs[k][1], s < 0 ? Math.PI + legs[k][2] : legs[k][2], 0, 0);
      GFX.draw(M.stalkerLeg, ms[3 + k], tint);
    }
  }
  function drawCrab(e) {
    const M = MODELS.lo && Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 40 ? MODELS.lo : MODELS;
    const ms = mats(e, 9);
    const tint = e.hurtT > 0 ? HURT_T : e.state === 'angry' ? [1.15, 0.95, 0.9, 0] : null;
    const dead = !e.alive;
    M4.compose(R, e.pos.x, e.pos.y + (dead ? -0.3 : 0), e.pos.z, e.yaw, 0, dead ? 0.3 : 0);
    M4.child(ms[0], R, 0, Math.sin(e.phase * 2) * 0.04, 0, 0, 0, 0); GFX.draw(M.crabBody, ms[0], dead ? [0.4, 0.4, 0.4, 0] : tint);
    const sw = Math.sin(e.phase) * 0.4 * e.moveAmt;
    for (let k = 0; k < 6; k++) {
      const side = k < 3 ? -1 : 1, z = (k % 3 - 1) * 0.55;
      M4.child(ms[1 + k], ms[0], side * 1.0, 0.5, z, side < 0 ? Math.PI : 0, 0, (k % 2 ? sw : -sw) + (dead ? 0.6 : 0));
      GFX.draw(M.crabLeg, ms[1 + k], tint);
    }
    const cl = e.claw > 0 ? -0.6 : 0;
    if (e.claw > 0) e.claw -= 1 / 60;
    M4.child(ms[7], ms[0], -0.55, 0.55, 0.9, -0.3, cl, 0); GFX.draw(M.crabClaw, ms[7], tint);
    M4.child(ms[8], ms[0], 0.55, 0.55, 0.9, 0.3, cl, 0); GFX.draw(M.crabClaw, ms[8], tint);
  }
  function drawJelly(e) {
    const M = MODELS.lo && Math.hypot(e.pos.x - GFX.cam.pos.x, e.pos.z - GFX.cam.pos.z) > 45 ? MODELS.lo : MODELS;
    const ms = mats(e, 1);
    const p = 1 + Math.sin(e.phase * 2.2) * 0.08;
    M4.compose(ms[0], e.pos.x, e.pos.y, e.pos.z, e.phase * 0.2, 0, 0, p, 1 / p, p);
    GFX.draw(M.jelly, ms[0], [0.9, 0.9, 1, 0], null, { shadow: false });
  }
  function draw() {
    const px = GFX.cam.pos.x, pz = GFX.cam.pos.z;
    Boss.beacon();
    for (const e of list) {
      if (e.kind === 'player') continue;
      const d = Math.hypot(e.pos.x - px, e.pos.z - pz);
      if (d > 420) continue;
      if (!GFX.sphereInFrustum(e.pos.x, e.pos.y + 1, e.pos.z, e.kind === 'boss' ? 16 : 3) && d > 70) continue;
      switch (e.kind) {
        case 'human': drawHuman(e); break;
        case 'goat': case 'ram': drawGoat(e); break;
        case 'stalker': drawStalker(e); break;
        case 'kiskja': Kiskja.draw(e); break;
        case 'crab': drawCrab(e); break;
        case 'jelly': drawJelly(e); break;
        case 'bug': Waves.draw(e); break;
        case 'boss': Boss.draw(e); break;
        case 'core': Rivals.drawCore(e); break;
        case 'rturret': Rivals.drawTurret(e); break;
      }
    }
    for (const p of pickups) {
      if (!p.m) p.m = M4.create();
      M4.compose(p.m, p.x, p.y + 0.25 + Math.sin(p.t * 2) * 0.08, p.z, p.t * 0.8);
      GFX.draw(p.kind === 'stones' ? MODELS.heartStone : MODELS.bag, p.m, null, null, { shadow: false });
      if (p.kind === 'stones') GFX.addLight(p.x, p.y + 1, p.z, 8, 1, 0.4, 0.8, 2);
    }
    for (const p of projs) if (p.delay <= 0 && p.kind === 'shard') {
      if (!p.m) p.m = M4.create();
      M4.compose(p.m, p.x, p.y, p.z, p.life * 5, p.life * 7, 0, 1.4, 1.4, 1.4);
      GFX.draw(MODELS.shard, p.m, null, null, { shadow: false });
    }
  }
  function countAlive(pred) { let n = 0; for (const e of list) if (e.alive && pred(e)) n++; return n; }
  function clear() { list.length = 0; projs.length = 0; pickups.length = 0; noises.length = 0; nextId = 1; }

  return {
    __layDY: (v) => { LAY_DY = v; },
    list, projs, pickups, noises, spawn, remove, update, updateProjs, draw, drawTitleFigure, damage, kill, raycast, friendly, isHuman, noise, clear,
    goTo, stopMove, arrived, stepMove, face, groundY, nearestHuman, countAlive, updateSpheres, lightNear,
  };
})();

// ---------- karjad ----------
const Herds = (() => {
  const herds = new Map();
  let nid = 1;
  function create(x, z, n) {
    const h = { id: nid++, x, z, homeX: x, homeZ: z, max: n };
    herds.set(h.id, h);
    for (let i = 0; i < n; i++) spawnMember(h, i === 0 ? 'ram' : 'goat');
    return h;
  }
  function spawnMember(h, kind) {
    const a = rand(0, TAU), r = rand(2, 9);
    Ents.spawn(kind, 'wild', h.x + Math.cos(a) * r, h.z + Math.sin(a) * r, { herd: h.id, radius: 0.55, state: 'graze', size: rand(0.9, 1.1) });
  }
  function update(dt) {
    for (const h of herds.values()) {
      // kari triivib aeglaselt koduala ümber
      h.x += (h.homeX - h.x) * dt * 0.002 + Math.sin(G.time.total * 0.01 + h.id) * dt * 0.15;
      h.z += (h.homeZ - h.z) * dt * 0.002 + Math.cos(G.time.total * 0.013 + h.id) * dt * 0.15;
    }
  }
  function replenish() {
    for (const h of herds.values()) {
      const n = Ents.countAlive((e) => e.herd === h.id);
      const hasRam = Ents.countAlive((e) => e.herd === h.id && e.kind === 'ram') > 0;
      if (n < h.max && Math.hypot(h.x - Player.pos.x, h.z - Player.pos.z) > 70) spawnMember(h, hasRam ? 'goat' : 'ram');
    }
  }
  function clear() { herds.clear(); nid = 1; }
  return { create, update, replenish, get: (id) => herds.get(id), all: herds, clear };
})();
