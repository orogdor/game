// ============================================================
//  KONKURENDID: laagrid, rüüsteretked, korjajad, Kivisüdame jaht
// ============================================================
const Rivals = (() => {
  const list = [
    { id: 'krell', team: 'krell', name: 'Krell-Varga Mining', short: 'Krell-Varga', color: [0.85, 0.28, 0.2], tint: [1.6, 0.5, 0.4, 0], speed: 3.9, hpBonus: 12 },
    { id: 'klann', team: 'klann', name: 'Black Sands Clan', short: 'Clan', color: [0.62, 0.5, 0.85], tint: [0.8, 0.65, 1.3, 0], speed: 4.5, hpBonus: 0 },
  ];
  const TAUNTS = {
    krell: ['This planet belongs to the company. You are a temporary expense.', 'Your rust heap won\'t survive the next dust storm.', 'Our scanners are ten years ahead of yours.', 'The offer still stands: sell K-7 to us. Half price.', 'Every diamond you pick up is missing from our balance sheet. We\'re writing it down.'],
    klann: ['The desert doesn\'t remember your name, newcomer.', 'We saw your lights last night. Pretty. Shame if they went out.', 'The Stoneheart belongs to those born in the desert.', 'The sand swallows everything. Your debts too.', 'Your goats taste good. Thanks.'],
  };
  const pending = [];
  let tauntT = 200;
  function get(id) { return list.find((r) => r.id === id); }

  function reset() {
    for (const r of list) {
      Object.assign(r, { progress: r.id === 'krell' ? 7 : 4, alive: true, raidT: DAY_LEN * (r.id === 'krell' ? 1.75 : 2.6), assaultT: -1, assaultActive: false, found: false, core: null, structs: [], cols: [] });
    }
    pending.length = 0; tauntT = 200;
    for (const r of list) { r.bb = null; r.bbData = null; r.roomsBuilt = 0; r.buildT = 0; }
    Bases.list.length = 1;
  }
  function init(fromSave) {
    list.forEach((r, i) => {
      r.base = World.sites.rivals[i];
      const cx = r.base.x, cz = r.base.z, cy = World.heightAt(cx, cz);
      const face = Math.atan2(-cx, -cz);
      r.structs = [];
      for (const c of r.cols || []) World.removeCol(c);
      r.cols = [];
      const addS = (mesh, x, z, yaw, tint, sc = 1) => { const m = M4.compose(M4.create(), x, World.heightAt(x, z), z, yaw, 0, 0, sc, sc, sc); r.structs.push({ mesh, m, tint }); };
      addS(MODELS.obj.flagpole, cx + Math.sin(face + 1.2) * 7, cz + Math.cos(face + 1.2) * 7, face, r.tint);
      for (let k = 0; k < 7; k++) {
        const a = face + (k - 3) * 0.32, x = cx + Math.sin(a) * 22, z = cz + Math.cos(a) * 22;
        const yaw = a + Math.PI / 2;
        addS(MODELS.obj.barrikaad, x, z, a, null);
        const ux = Math.cos(a), uz = -Math.sin(a);
        r.cols.push(World.addCol({ t: 's', ax: x - ux * 0.95, az: z - uz * 0.95, bx: x + ux * 0.95, bz: z + uz * 0.95, r: 0.3, y0: cy - 1, y1: cy + 1.1, kind: 'struct' }));
      }
      for (let k = 0; k < 5; k++) { const a = face + (k % 2 ? 1 : -1) * rand(0.9, 1.4), d = rand(7, 11); addS(k % 2 ? (MODELS.q_container || MODELS.camp_cargo) : (MODELS.q_crate_long || MODELS.camp_cargo), cx + Math.cos(a) * d, cz + Math.sin(a) * d, rand(0, TAU), null); }
      // maandumisplats + maandur, tuuleturbiin ja tuled konkurendi tagahoovis
      if (MODELS.camp_pad) {
        const bx = cx + Math.sin(face - 1.75) * 30, bz = cz + Math.cos(face - 1.75) * 30;
        addS(MODELS.camp_pad, bx, bz, face, null);
        const m = M4.compose(M4.create(), bx, World.heightAt(bx, bz) + 1.8, bz, face + 0.6); r.structs.push({ mesh: MODELS.camp_lander, m, tint: null });
        r.cols.push(World.addCol({ t: 'c', x: bx, z: bz, r: 4.3, y0: cy - 2, y1: cy + 5, kind: 'struct' }));
        const tx = cx + Math.sin(face + 1.5) * 22, tz = cz + Math.cos(face + 1.5) * 22;
        addS(MODELS.camp_turbine, tx, tz, face + 1.2, null);
        r.cols.push(World.addCol({ t: 'c', x: tx, z: tz, r: 1.2, y0: cy - 2, y1: cy + 6, kind: 'struct' }));
        if (MODELS.comm_tower) {
          const ax = cx + Math.sin(face + 1.05) * 24, az = cz + Math.cos(face + 1.05) * 24;
          addS(MODELS.comm_tower, ax, az, face, null);
          r.cols.push(World.addCol({ t: 'c', x: ax, z: az, r: 3.5, y0: cy - 2, y1: cy + 11, kind: 'struct' }));
          r.beacon = [ax, World.heightAt(ax, az) + 11.2, az];
        }
        if (MODELS.scifi_crate) for (let k = 0; k < 4; k++) { const a = face - 0.95 - k * 0.12, d = 13 + (k % 2) * 1.5; addS(k === 2 && MODELS.q_pod ? MODELS.q_pod : (MODELS.q_crate || MODELS.scifi_crate), cx + Math.sin(a) * d, cz + Math.cos(a) * d, a, null); }
        for (const da of [-0.55, 0.55]) { const lx = cx + Math.sin(face + da) * 17, lz = cz + Math.cos(face + da) * 17; addS(MODELS.camp_lights, lx, lz, face, null); r.cols.push(World.addCol({ t: 'c', x: lx, z: lz, r: 0.9, y0: cy - 2, y1: cy + 3.2, kind: 'struct' })); r.lights = (r.lights || []).concat([[lx, lz]]); }
      }
      setupBase(r, cx, cy, cz, face, fromSave);
      if (!fromSave || r.alive) {
        r.core = Ents.spawn('core', r.team, cx, cz, { maxHp: 900, radius: 2.2, rival: r });
        if (r.coreHp !== undefined) { r.core.hp = r.coreHp; }
        r.cols.push(World.addCol({ t: 'c', x: cx, z: cz, r: 2.0, y0: cy - 2, y1: cy + 5, kind: 'struct' }));
        for (let k = 0; k < 2; k++) {
          const a = face + (k ? 0.5 : -0.5), x = cx + Math.sin(a) * 10, z = cz + Math.cos(a) * 10;
          Ents.spawn('rturret', r.team, x, z, { maxHp: 260, radius: 0.8, rival: r, yaw: face, aim: face, cool: 0, scanT: 0 });
        }
        for (let k = 0; k < guardTarget(r); k++) spawnUnit(r, cx + rand(-10, 10), cz + rand(-10, 10), 'guard');
      }
    });
  }

  // ---------- konkurentide baasid: ehitavad tube nagu mängija ----------
  const FURN = [['generaator', 'nari', 'laud'], ['nari', 'nari', 'toolaud'], ['nari', 'diivan', 'pliit'], ['skanner', 'nari'], ['nari', 'laud', 'ravila'], ['lihvija', 'nari'], ['nari', 'nari', 'jukebox']];
  function guardTarget(r) { return Math.min(10, 2 + (r.bb ? r.bb.countBeds() : 2)); }
  function setupBase(r, cx, cy, cz, face, fromSave) {
    const fx = Math.sin(face), fz = Math.cos(face);
    const ox = cx - fx * 28, oz = cz - fz * 28;
    // kohad, kuhu tube ei ehitata (tuum, kahurid, masinad)
    r.keep = [[cx, cz, 11]];
    for (const s of r.structs) if (s.mesh !== MODELS.obj.barrikaad) r.keep.push([s.m[12], s.m[14], 5.5]);
    r.bb = createBase({ ox, oy: cy, oz, player: false, accent: r.id === 'krell' ? [1.0, 0.18, 0.1] : [0.75, 0.3, 1.0], style: r.id === 'krell' ? 6 : 1, doorToward: { x: cx, z: cz } });
    Bases.list.push(r.bb);
    r.buildT = r.buildT || rand(50, 80);
    if (fromSave && r.bbData) { r.bb.deserialize(r.bbData); r.bbData = null; }
    else { r.roomsBuilt = 0; for (let k = 0; k < 2; k++) growBase(r); }
    r.bb.rebuildNow();
    if (!r.alive) r.bb.power.lightsOn = false;
  }
  function rectFree(r, i0, j0, i1, j1) {
    const b = r.bb, c = b.N / 2;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!b.inArea(i, j) || b.roomAt(i, j) || b.objAt(i, j)) return false;
      if (Math.hypot(i + 0.5 - c, j + 0.5 - c) > 15) return false;
      const w = b.cellCenter(i, j);
      for (const [kx, kz, kr] of r.keep) if (Math.hypot(w.x - kx, w.z - kz) < kr) return false;
    }
    return true;
  }
  function furnish(r, room, list) {
    const b = r.bb;
    for (const type of list) {
      const def = OBJ[type]; let done = false;
      for (let tries = 0; tries < 40 && !done; tries++) {
        const [ci, cj] = room.cells[Math.floor(Math.random() * room.cells.length)];
        const rot = b.autoRot(type, ci, cj);
        if (b.canPlaceObj(type, ci, cj, rot).ok) { b.addObj(type, ci, cj, rot); done = true; }
      }
    }
    b.updatePower(true);
  }
  function growBase(r) {
    const b = r.bb, c = b.N / 2;
    const style = r.id === 'krell' ? 6 : 1;
    let rect = null;
    if (!b.rooms.size) { const w = 5, h = 4; rect = [c - 3, c - 2, c - 3 + w - 1, c - 2 + h - 1]; if (!rectFree(r, ...rect)) rect = null; }
    for (let tries = 0; tries < 60 && !rect && b.rooms.size; tries++) {
      const rooms = [...b.rooms.values()], base = rooms[Math.floor(Math.random() * rooms.length)];
      const w = 3 + Math.floor(Math.random() * 3), h = 3 + Math.floor(Math.random() * 3);
      const side = Math.floor(Math.random() * 4);
      let i0, j0;
      if (side === 0) { i0 = base.i1 + 1; j0 = base.j0 + Math.floor(Math.random() * (base.j1 - base.j0 + 1)) - Math.floor(h / 2); }
      else if (side === 1) { i0 = base.i0 - w; j0 = base.j0 + Math.floor(Math.random() * (base.j1 - base.j0 + 1)) - Math.floor(h / 2); }
      else if (side === 2) { j0 = base.j1 + 1; i0 = base.i0 + Math.floor(Math.random() * (base.i1 - base.i0 + 1)) - Math.floor(w / 2); }
      else { j0 = base.j0 - h; i0 = base.i0 + Math.floor(Math.random() * (base.i1 - base.i0 + 1)) - Math.floor(w / 2); }
      const cand = [i0, j0, i0 + w - 1, j0 + h - 1];
      if (rectFree(r, ...cand)) rect = cand;
    }
    if (!rect) return false;
    const room = b.addRoom(rect[0], rect[1], rect[2], rect[3], style, Math.random() < 0.4 ? 1 : 0);
    if (!room) return false;
    furnish(r, room, FURN[(r.roomsBuilt || 0) % FURN.length]);
    r.roomsBuilt = (r.roomsBuilt || 0) + 1;
    return true;
  }
  function updateBuilders(dt) {
    for (const r of list) {
      if (!r.alive || !r.bb) continue;
      r.buildT -= dt * (G.dk.rival || 1);
      if (r.buildT > 0) continue;
      r.buildT = rand(100, 160);
      if (r.bb.rooms.size >= 8) continue;
      if (growBase(r)) {
        r.bb.rebuildNow();
        const d = Math.hypot(Player.pos.x - r.base.x, Player.pos.z - r.base.z);
        if (d < 120) UI.msg(r.short + ' is expanding their base.', 'rival');
        // aeg-ajalt uus kahur baasi ette
        const tur = Ents.countAlive((e) => e.kind === 'rturret' && e.rival === r);
        if (tur < 2 + Math.floor(r.bb.rooms.size / 3)) {
          const face = Math.atan2(-r.base.x, -r.base.z), a = face + rand(-0.9, 0.9), x = r.base.x + Math.sin(a) * rand(12, 16), z = r.base.z + Math.cos(a) * rand(12, 16);
          Ents.spawn('rturret', r.team, x, z, { maxHp: 260, radius: 0.8, rival: r, yaw: a, aim: a, cool: 0, scanT: 0 });
        }
      }
    }
  }
  function updateBases(dt, humans) { for (const r of list) if (r.bb) r.bb.update(dt, humans); }
  function drawBases(night, time) { for (const r of list) if (r.bb) r.bb.draw(false, night, time); }
  function spawnUnit(r, x, z, mission, extra) {
    const day = G.time.day;
    const e = Ents.spawn('human', r.team, x, z, Object.assign({
      maxHp: Math.min(120, 58 + day * 4 + r.hpBonus), radius: 0.38, ai: unitAI, mission, home: { x: r.base.x, z: r.base.z },
      dmg: 6 * G.dk.edmg, acc: Math.min(0.66, 0.48 + day * 0.012), speedU: r.speed, scanT: rand(0, 0.5), cool: rand(0, 1), carry: 0, rival: r,
    }, extra || {}));
    return e;
  }
  function towardSpawn(r, tx, tz, dist) {
    const dx = r.base.x - tx, dz = r.base.z - tz, L = Math.hypot(dx, dz) || 1;
    const px = -dz / L, pz = dx / L, j = rand(-18, 18);
    const d = Math.min(dist, L - 10);
    return { x: tx + (dx / L) * d + px * j, z: tz + (dz / L) * d + pz * j };
  }

  // ---------- üksuse AI ----------
  function findTarget(e, range) {
    const extra = Crew.turretTargets();
    return findThreat(e.pos.x, e.pos.y + 1.4, e.pos.z, range, e.team, extra);
  }
  function unitAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    e.scanT -= dt;
    if (e.scanT <= 0) {
      e.scanT = 0.4 + Math.random() * 0.3;
      const rng = e.mission === 'guard' ? 46 : e.mission === 'assault' ? 34 : 38;
      e.threat = findTarget(e, rng);
      if (e.mission === 'assault' && Boss.e && Boss.e.alive && !e.threat && Math.hypot(Boss.e.pos.x - e.pos.x, Boss.e.pos.z - e.pos.z) < 40 && e.planted) e.threat = Boss.e;
    }
    const t = e.threat;
    const sp = e.speedU || 4;
    if (t && targetAlive(t) && e.mission !== 'flee') {
      const tp = targetPoint(t), d = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
      Ents.face(e, tp.x, tp.z, dt, 9);
      e.aim = Math.min(1, e.aim + dt * 4);
      e.aimPitch = Math.atan2(tp.y - (e.pos.y + 1.35), d);
      if (d > 24) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 1.5) { e.path = [{ x: tp.x, z: tp.z }]; e.pathI = 0; } Ents.stepMove(e, dt, sp); }
      else if (d < 9 && t.kind !== 'turret') { const ax = e.pos.x - (tp.x - e.pos.x), az = e.pos.z - (tp.z - e.pos.z); e.path = [{ x: ax, z: az }]; e.pathI = 0; Ents.stepMove(e, dt, sp * 0.7); }
      else {
        // väike külgsamm
        e.strafe = (e.strafe || rand(-1, 1)) ; if (Math.random() < dt * 0.4) e.strafe = -e.strafe;
        const sx = Math.cos(e.yaw) * e.strafe, sz = -Math.sin(e.yaw) * e.strafe;
        e.path = [{ x: e.pos.x + sx * 2, z: e.pos.z + sz * 2 }]; e.pathI = 0; Ents.stepMove(e, dt, sp * 0.45);
      }
      if (e.cool <= 0 && Math.abs(angDiff(e.yaw, Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z))) < 0.35) {
        fireAt(e, t, t.kind === 'boss' ? 5 : e.dmg, e.acc, 'enemy');
        e.cool = rand(0.55, 0.95);
      }
      return;
    }
    e.aim = Math.max(0, e.aim - dt * 2);
    switch (e.mission) {
      case 'guard': {
        e.stateT -= dt;
        if (Ents.arrived(e) && e.stateT <= 0) { e.stateT = rand(4, 10); Ents.goTo(e, e.home.x + rand(-15, 15), e.home.z + rand(-15, 15)); }
        Ents.stepMove(e, dt, sp * 0.6);
        break;
      }
      case 'raid': {
        if (!e.raidGo) {
          const h = Base.objsOfType('hoidla')[0];
          if (h) { const cells = Base.useCells(h).map((c) => [c[0], c[1]]); e.goalCells = cells; Ents.goTo(e, h.cx, h.cz, cells); e.raidObj = h; }
          else Ents.goTo(e, 0, 0);
          e.raidGo = true;
        }
        const arrivedNow = Ents.stepMove(e, dt, sp);
        if (arrivedNow || (e.raidObj && Math.hypot(e.raidObj.cx - e.pos.x, e.raidObj.cz - e.pos.z) < 2.8)) {
          const k = Math.min(15, Math.floor(G.res.kris * 0.4) + (G.res.kris > 0 ? 1 : 0), G.res.kris);
          const s = Math.min(20, Math.floor(G.res.scrap * 0.3));
          G.res.kris -= k; G.res.scrap -= s;
          e.carry = k; e.carryScrap = s;
          if (k || s) UI.msg(e.rival.short + ' stole from storage ' + k + ' diamonds and ' + s + ' scrap!', 'danger');
          e.mission = 'return'; e.raidGo = false; Ents.goTo(e, e.home.x, e.home.z);
        }
        if (Math.random() < dt * 0.05 && !e.path) Ents.goTo(e, 0, 0);
        break;
      }
      case 'scav': {
        const s = e.site;
        if (!s || Comets.siteTotal(s) <= 0 || e.carry >= 12) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        if (!e.scavCl || e.scavCl.amount <= 0) {
          e.scavCl = s.clusters.filter((c) => c.amount > 0).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
          if (e.scavCl) Ents.goTo(e, e.scavCl.x + rand(-1, 1), e.scavCl.z + rand(-1, 1));
          e.mineT = 0;
        }
        if (Ents.stepMove(e, dt, sp) && e.scavCl) {
          e.mineT += dt;
          if (Math.random() < 0.3) FX.beam(e.pos.x, e.pos.y + 1.2, e.pos.z, e.scavCl.x, e.scavCl.y + 0.5, e.scavCl.z);
          if (e.mineT > 2.0) { e.mineT = 0; e.carry += Comets.takeUnits(e.scavCl, 1); }
        }
        break;
      }
      case 'return': case 'flee': {
        if (!e.path) Ents.goTo(e, e.home.x, e.home.z);
        if (Ents.stepMove(e, dt, sp) || Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) < 8) {
          if (e.carry && e.rival.alive) { e.rival.progress = Math.min(100, e.rival.progress + e.carry * 0.4 * G.dk.rival); }
          e.remove = true;
        }
        break;
      }
      case 'assault': {
        const b = Boss.e;
        if (!b || !b.alive) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        const d = Math.hypot(b.pos.x - e.pos.x, b.pos.z - e.pos.z);
        if (d > 26) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.3) Ents.goTo(e, b.pos.x + rand(-6, 6), b.pos.z + rand(-6, 6)); Ents.stepMove(e, dt, sp); }
        else {
          e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
          e.plantT = (e.plantT || 0) + dt;
          e.hasGun = false;
          if (Math.random() < dt * 2) FX.sparks(e.pos.x, e.pos.y + 0.4, e.pos.z, [1, 0.8, 0.3], 3, 2);
          if (e.plantT > 9 && !e.planted) {
            e.planted = true; e.hasGun = true;
            const party = Ents.list.filter((u) => u.alive && u.team === e.team && u.mission === 'assault' && u.planted);
            if (party.length >= 2 && !e.rival.chargeSet) {
              e.rival.chargeSet = true;
              UI.msg('Intercepted radio: ' + e.rival.short + ' planted charges under the Stoneheart!', 'danger');
              pending.push({ t: G.time.total + 12, fn: () => { e.rival.chargeSet = false; Boss.charge(e.rival); } });
            }
          }
        }
        break;
      }
    }
  }
  function onUnitDeath(e, src) {
    const items = Inv.rivalLoot(e);
    if (items.length) Ents.pickups.push({ kind: 'bag', x: e.pos.x, y: Ents.groundY(e.pos.x, e.pos.z), z: e.pos.z, data: { items }, id: Math.random() });
    if (e.kind === 'human' && src && src.kind === 'player') G.stats.rivalsKilled = (G.stats.rivalsKilled || 0) + 1;
  }
  function onComet(site) {
    for (const r of list) {
      if (!r.alive) continue;
      const n = randi(2, 3);
      pending.push({ t: G.time.total + rand(16, 38), fn: () => {
        if (!r.alive || Comets.siteTotal(site) <= 0) return;
        const p = towardSpawn(r, site.x, site.z, 130);
        for (let k = 0; k < n; k++) spawnUnit(r, p.x + rand(-4, 4), p.z + rand(-4, 4), 'scav', { site });
        if (Math.random() < 0.6) UI.msg('Radio: ' + r.short + ' collectors are driving toward the comet.', 'warn');
      } });
    }
  }
  function launchRaid(r) {
    const n = Math.min(7, Math.round((2 + G.time.day * 0.45) * G.dk.raid));
    const p = towardSpawn(r, 0, 0, 150);
    for (let k = 0; k < n; k++) spawnUnit(r, p.x + rand(-6, 6), p.z + rand(-6, 6), 'raid');
    const dir = bearingWord(p.x, p.z);
    UI.msg(r.short + ' raid approaching ' + dir + '! ' + n + ' armed mercenaries.', 'danger');
    UI.banner('Attack!', r.short + ' is due ' + dir.replace(/s$/, 'st'), 'danger');
    Audio2.alarm();
    G.flags.raids = (G.flags.raids || 0) + 1;
  }
  function launchAssault(r) {
    const b = World.sites.nest;
    const n = Math.min(8, 4 + Math.floor(G.time.day / 3));
    const p = towardSpawn(r, b.x, b.z, 110);
    for (let k = 0; k < n; k++) spawnUnit(r, p.x + rand(-6, 6), p.z + rand(-6, 6), 'assault');
    r.assaultActive = true;
    UI.msg('Intercepted radio: ' + r.short + ' sent ' + n + ' men to attack the Stoneheart\'s nest!', 'danger');
  }
  function update(dt) {
    for (let i = pending.length - 1; i >= 0; i--) if (G.time.total >= pending[i].t) { const p = pending.splice(i, 1)[0]; p.fn(); }
    for (const r of list) {
      if (!r.alive) continue;
      r.raidT -= dt;
      if (r.raidT <= 0) { r.raidT = DAY_LEN * rand(1.3, 2.2) / G.dk.raid; if (G.time.day >= 2) launchRaid(r); }
      if (r.progress >= 100 && !r.found && Boss.e && Boss.e.alive) {
        r.found = true; G.flags.nestKnown = true;
        UI.msg('Intercepted radio: ' + r.short + ' found the Stoneheart\'s nest! The coordinates are now on your map too.', 'danger');
        UI.banner(r.short + ' found the nest', 'They\'re coming to kill the Stoneheart. Get there first!', 'danger');
        r.assaultT = 45;
        Objectives.check();
      }
      if (r.found && r.assaultT > 0 && Boss.e && Boss.e.alive) {
        r.assaultT -= dt;
        if (r.assaultT <= 0) { launchAssault(r); r.assaultT = DAY_LEN * 0.85; }
      }
    }
    updateBuilders(dt);
    tauntT -= dt;
    if (tauntT <= 0) {
      tauntT = rand(150, 260);
      const al = list.filter((r) => r.alive);
      if (al.length) { const r = pick(al); UI.msg(r.short + ': ' + pick(TAUNTS[r.id]), 'rival'); Audio2.radio(); }
    }
  }
  function daily() {
    for (const r of list) {
      if (!r.alive) continue;
      r.progress = Math.min(100, r.progress + rand(5.5, 9) * G.dk.rival);
      const g = Ents.countAlive((e) => e.team === r.team && e.mission === 'guard');
      for (let k = g; k < guardTarget(r); k++) spawnUnit(r, r.base.x + rand(-10, 10), r.base.z + rand(-10, 10), 'guard');
    }
  }
  function coreDestroyed(e) {
    const r = e.rival; if (!r) return;
    r.alive = false;
    FX.explosion(e.pos.x, e.pos.y + 3, e.pos.z, [1, 0.6, 0.3], 4);
    Audio2.explode(e.pos.x, e.pos.z, true);
    UI.shake(0.8);
    UI.msg(r.name + ' camp has been destroyed! Their search is over.', 'good');
    UI.banner('Camp destroyed', r.short + ' is out of the game', 'good');
    for (const u of Ents.list) if (u.alive && u.team === r.team && u.kind === 'human') { u.mission = 'flee'; u.path = null; }
    for (const u of Ents.list) if (u.alive && u.kind === 'rturret' && u.rival === r) Ents.kill(u, null);
    Ents.pickups.push({ kind: 'bag', x: e.pos.x + 3, y: Ents.groundY(e.pos.x + 3, e.pos.z), z: e.pos.z, data: { items: [['kris', 25], ['scrap', 40], ['ammo_r', 90], ['medkit', 2], ['grenade', 2]] }, id: Math.random() });
    G.flags[r.id + 'Dead'] = true;
    if (r.bb) r.bb.power.lightsOn = false;
  }
  function turretAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    e.scanT -= dt;
    if (e.scanT <= 0) { e.scanT = 0.35; e.threat = findThreat(e.pos.x, e.pos.y + 1.7, e.pos.z, 32, e.team, Crew.turretTargets()); }
    const t = e.threat;
    if (t && targetAlive(t)) {
      const tp = targetPoint(t);
      const want = Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z);
      e.aim += angDiff(e.aim, want) * Math.min(1, dt * 5);
      if (e.cool <= 0 && Math.abs(angDiff(e.aim, want)) < 0.15) {
        e.cool = 0.42;
        const fake = { pos: { x: e.pos.x, y: e.pos.y + 0.3, z: e.pos.z }, yaw: e.aim, team: e.team };
        fireAt(fake, t, 7 * G.dk.edmg, 0.55, 'turret');
      }
    } else e.aim += dt * 0.4;
  }
  const tmpM = M4.create();
  function draw() {
    for (const r of list) {
      if (!r.base) continue;
      for (const s of r.structs) GFX.draw(s.mesh, s.m, s.tint, null, { rust: 0.8 });
      if (r.alive && r.lights && GFX.env.night > 0.25) for (const [lx, lz] of r.lights) GFX.addLight(lx, World.heightAt(lx, lz) + 4.5, lz, 20, 1.0, 0.6, 0.3, 1.2);
      if (r.alive && r.beacon && Math.sin(G.time.total * 3) > 0) GFX.partAdd.emit(r.beacon[0], r.beacon[1], r.beacon[2], 0, 0, 0, 0.05, 0.9, 0.9, [1, 0.15, 0.05, 1], [1, 0.1, 0, 0.6]);
    }
  }
  function drawCore(e) {
    if (!e.m) e.m = M4.create();
    M4.compose(e.m, e.pos.x, e.pos.y, e.pos.z, G.time.total * 0.2);
    const alive = e.alive;
    GFX.draw(MODELS.camp_core || MODELS.obj.core, e.m, e.hurtT > 0 ? [1.5, 0.8, 0.7, 0] : alive ? [1, 1, 1, 0] : [0.3, 0.3, 0.3, 0], null, { rust: 1 });
    if (alive) GFX.addLight(e.pos.x, e.pos.y + 4.5, e.pos.z, 18, e.rival.color[0], e.rival.color[1], e.rival.color[2], 2.2);
    else if (Math.random() < 0.3) FX.smoke(e.pos.x, e.pos.y + 3, e.pos.z);
  }
  function drawTurret(e) {
    if (!e.m) { e.m = M4.create(); e.hm = M4.create(); }
    M4.compose(e.m, e.pos.x, e.pos.y, e.pos.z, 0);
    const tint = !e.alive ? [0.25, 0.25, 0.25, 0] : e.hurtT > 0 ? [1.6, 0.7, 0.6, 0] : e.rival.tint;
    GFX.draw(MODELS.obj.kahur, e.m, tint, null, { rust: 1 });
    M4.child(e.hm, e.m, 0, 1.55, 0, e.aim, e.alive ? 0 : 0.5, 0);
    GFX.draw(MODELS.obj.kahurHead, e.hm, tint, null, { rust: 1 });
  }
  function serialize() { return list.map((r) => ({ id: r.id, progress: r.progress, alive: r.alive, raidT: r.raidT, found: r.found, assaultT: r.assaultT, coreHp: r.core ? r.core.hp : 0, buildT: r.buildT, roomsBuilt: r.roomsBuilt, bb: r.bb ? r.bb.serialize() : null })); }
  function deserialize(arr) {
    for (const d of arr || []) { const r = get(d.id); if (!r) continue; Object.assign(r, { progress: d.progress, alive: d.alive, raidT: d.raidT, found: d.found, assaultT: d.assaultT, coreHp: d.coreHp, buildT: d.buildT, roomsBuilt: d.roomsBuilt || 0, bbData: d.bb || null }); }
  }
  return { list, get, reset, init, updateBases, drawBases, update, daily, onComet, onUnitDeath, coreDestroyed, unitAI, turretAI, draw, drawCore, drawTurret, launchRaid, serialize, deserialize, spawnUnit };
})();
