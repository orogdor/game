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
      Object.assign(r, { res: { cr: 150, scrap: 40, kris: 0 }, slots: 3, men: 0, hireT: DAY_LEN * rand(0.1, 0.2), salvT: DAY_LEN * rand(0.2, 0.4), cmdT: 0, progress: 0, alive: true, raidT: DAY_LEN * (r.id === 'krell' ? 1.75 : 2.6), assaultT: -1, assaultActive: false, found: false, core: null, structs: [], cols: [] });
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
        for (const t of r.turrets || []) Ents.spawn('rturret', r.team, t[0], t[1], { maxHp: OBJ.kahur.hp, radius: 0.8, rival: r, yaw: t[2], aim: t[2], cool: 0, scanT: 0 });
        if (!r.cmdT) spawnCommander(r);
        topUpGuards(r);
      }
    });
  }

  // ---------- konkurentide baasid: ehitavad tube nagu mängija ----------
  // esimene tuba = sama mis mängija alustusmaja: vana generaator ja üks voodi (skänner ostetakse eraldi)
  const FURN = [['vanagen', 'voodi'], ['nari', 'laud'], ['generaator', 'nari', 'laud'], ['nari', 'nari', 'toolaud'], ['nari', 'diivan', 'pliit'], ['nari', 'laud', 'ravila'], ['lihvija', 'nari'], ['nari', 'nari', 'jukebox']];
  function guardTarget(r) { return Math.min(10, 2 + (r.bb ? r.bb.countBeds() : 2)); }
  // ---------- inimesed: konkurent alustab ühest komandörist ja palkab inimesi nagu mängija ----------
  // Kõik arvud on samad mis mängija poolel: algressursid, palkamistasu ja palk (valvur), meeskonna max 10 ja voodid,
  // relvakahju/täpsus/kiirus nagu mängija valvuril, kahur nagu mängija kahur, ehitus maksab sama palju vanarauda/krediite.
  const HUMAN_HP = 70, CMD_HP = 100;   // sama mis mängija meeskonnal ja mängijal
  const WAGE = ROLES.valvur.wage, FEE = WAGE * 2, FOOD_CR = 8;   // toit: mängija poes 5 toitu = 40 ₵
  const UNIT = { dmg: 11, acc: 0.62, speed: 4.4 };                // nagu mängija valvur (crewDmg/crewAcc/speedOf)
  function menCap(r) { return Math.max(0, Math.min(10, r.bb ? r.bb.countBeds() : 0)); }   // nagu mängijal: iga palgatu vajab voodit, max 10
  // eelarve: palgad ja toit kaheks päevaks + (väikese meeskonna korral) järgmise palkamise tasu jäävad alati alles
  function reserve(r) { return ((r.men || 0) + 1) * (WAGE + FOOD_CR) * 2 + ((r.men || 0) < 4 ? FEE : 0); }
  function spend(r, cost, keep = 0) {
    const s = cost.s || 0, c = cost.c || 0, k = cost.k || 0;
    const packs = Math.max(0, Math.ceil((s - r.res.scrap) / 20));   // vanarauda puudu -> ostab turult nagu mängija (20 vr = 45 ₵)
    if (r.res.cr - packs * 45 - c < keep || (r.res.kris || 0) < k) return false;
    r.res.cr -= packs * 45; r.res.scrap += packs * 20;
    r.res.scrap -= s; r.res.cr -= c; r.res.kris -= k; return true;
  }
  // raha on, vanarauda pole: ostab turult (20 vr = 45 ₵, sama hind mis mängijal), et ehitus ja remont ei seisaks
  function buyScrap(r) {
    let n = 0;
    while (r.res.scrap < 60 && r.res.cr - 45 >= reserve(r) + 60 && n < 4) { r.res.cr -= 45; r.res.scrap += 20; n++; }
    return n;
  }
  function sellKris(r) {
    const keep = r.bb && !r.bb.objsOfType('skanner').length && r.res.cr >= 250 ? Math.min(r.res.kris, OBJ.skanner.cost.k || 0) : 0;   // kui raha on, hoiab skänneri jaoks teemandid alles
    const n = r.res.kris - keep; if (n > 0) { r.res.cr += n * G.market.price; r.res.kris = keep; }
  }
  function unitsOf(r) { return Ents.list.filter((u) => u.alive && !u.remove && u.kind === 'human' && u.team === r.team && !u.commander); }
  function freeMen(r) { return Math.max(0, (r.men || 0) - unitsOf(r).length); }
  // võta missiooniks n meest: kõigepealt kasarmust, siis valvurite seast (vähemalt keep jääb koju)
  function takeMen(r, n, keep = 1) {
    let got = Math.min(n, freeMen(r));
    if (got < n) {
      const guards = unitsOf(r).filter((u) => u.mission === 'guard');
      while (got < n && guards.length > keep) { const g = guards.pop(); g.remove = true; got++; }
    }
    return got;
  }
  function topUpGuards(r) {
    if (!r.alive || !r.base) return;
    const g = unitsOf(r).filter((u) => u.mission === 'guard').length;
    const k = Math.min(freeMen(r), guardTarget(r) - g);
    for (let i = 0; i < k; i++) spawnUnit(r, r.base.x + rand(-10, 10), r.base.z + rand(-10, 10), 'guard');
  }
  function spawnCommander(r) {
    if (!r.alive || Ents.list.some((u) => u.alive && u.commander && u.team === r.team)) return;
    const look = Object.assign(Look.player(), { top: r.color.map((v) => v * 0.6), gearCol: 1, hairStyle: r.id === 'krell' ? 'short' : 'long', beardStyle: r.id === 'krell' ? 'none' : 'full' });
    const e = spawnUnit(r, r.base.x + rand(-4, 4), r.base.z + rand(-4, 4), 'guard', { commander: true, maxHp: CMD_HP, look });
    e.cmdName = r.id === 'krell' ? 'Director Varga' : 'Chieftain Sarn';
    return e;
  }
  function commanderOf(r) { return Ents.list.find((u) => u.alive && u.commander && u.team === r.team) || null; }
  function sendCommander(r, mission, extra) {
    const c = commanderOf(r); if (!c || c.mission !== 'guard') return false;
    Object.assign(c, { mission, path: null, carry: 0, scavCl: null, salvGo: false }, extra || {});
    return true;
  }
  // kas retk jõuab enne pimedat kohale (päeval ~220 s valgust); liiga kaugele ei minda
  const TRIP_MAX = 1100;
  function daylightLeft() { const h = Econ.hour(); return h >= 5.4 && h < 20.6 ? (20.6 - h) / 24 * DAY_LEN : 0; }
  function tripOK(r, x, z) {
    const d = Math.hypot(x - r.base.x, z - r.base.z);
    if (d > TRIP_MAX) return false;
    const fast = typeof Vehicles !== 'undefined' && Vehicles.teamVehicles(r.team).some((v) => !v.seats[0]);
    // lähedale ainult siis, kui jõuab enne pimedat; kaugele (kui midagi lähemal pole) minnakse hommikul ja ollakse vajadusel öö väljas
    const t = d / (fast ? 14 : UNIT.speed);
    return daylightLeft() > t + 15 || daylightLeft() > DAY_LEN * 0.45;
  }
  function hireTick(r, dt) {
    r.hireT = (r.hireT || 0) - dt;
    if (r.hireT > 0) return;
    r.hireT = DAY_LEN * rand(0.1, 0.25);
    // nagu mängija: päevas 3 kandidaati, vaja vaba voodit ja raha palkamistasuks (+ homse palga varu)
    if ((r.slots || 0) <= 0 || (r.men || 0) >= menCap(r)) return;
    if (r.res.cr < FEE + (r.men + 1) * (WAGE + FOOD_CR) * 3) return;   // palkab alles siis, kui 3 päeva palgad on olemas
    r.res.cr -= FEE; r.slots--;
    r.men = (r.men || 0) + 1;
    topUpGuards(r);
    const d = Math.hypot(Player.pos.x - r.base.x, Player.pos.z - r.base.z);
    if (d < 120 || Math.random() < 0.25) UI.msg('Radio: ' + r.short + ' hired a new mercenary (' + r.men + ' people).', 'rival');
  }
  function setupBase(r, cx, cy, cz, face, fromSave) {
    const fx = Math.sin(face), fz = Math.cos(face);
    const ox = cx - fx * 28, oz = cz - fz * 28;
    // kohad, kuhu tube ei ehitata (tuum, kahurid, masinad)
    r.keep = [[cx, cz, 11]];
    for (const s of r.structs) if (s.mesh !== MODELS.obj.barrikaad) r.keep.push([s.m[12], s.m[14], 5.5]);
    r.bb = createBase({ ox, oy: cy, oz, player: false, team: r.team, accent: r.id === 'krell' ? [1.0, 0.18, 0.1] : [0.75, 0.3, 1.0], style: r.id === 'krell' ? 6 : 1, doorToward: { x: cx, z: cz } });
    Bases.list.push(r.bb);
    r.buildT = r.buildT || rand(50, 80);
    if (fromSave && r.bbData) { r.bb.deserialize(r.bbData); r.bbData = null; }
    else { r.roomsBuilt = 0; growBase(r); r.res.scrap -= Math.min(r.res.scrap, 40); }   // nagu mängija: terminal (15) + generaator (25) tuleb parandada
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
  function furnish(r, room, list, pay) {
    const b = r.bb;
    for (const type of list) {
      const def = OBJ[type]; let done = false;
      if (pay && !spend(r, def.cost || {}, reserve(r))) continue;
      for (let tries = 0; tries < 40 && !done; tries++) {
        const [ci, cj] = room.cells[Math.floor(Math.random() * room.cells.length)];
        const rot = b.autoRot(type, ci, cj);
        if (b.canPlaceObj(type, ci, cj, rot).ok) { b.addObj(type, ci, cj, rot); done = true; }
      }
    }
    b.updatePower(true);
  }
  function growBase(r, pay) {
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
    if (pay && (r.men || 0) < menCap(r) - 1) return false;   // ehitab juurde alles siis, kui voodid hakkavad täis saama
    if (pay && !spend(r, { s: 2 * ((rect[2] - rect[0] + 1) + (rect[3] - rect[1] + 1)) * 3 }, reserve(r))) return false;   // seinad 3 vr/lõik
    const room = b.addRoom(rect[0], rect[1], rect[2], rect[3], style, Math.random() < 0.4 ? 1 : 0);
    if (!room) return false;
    furnish(r, room, FURN[(r.roomsBuilt || 0) % FURN.length], pay);
    r.roomsBuilt = (r.roomsBuilt || 0) + 1;
    return true;
  }
  function updateBuilders(dt) {
    for (const r of list) {
      if (!r.alive || !r.bb) continue;
      r.buildT -= dt;
      if (r.buildT > 0) continue;
      r.buildT = rand(100, 160);
      buyScrap(r);
      // sõiduk samadel tingimustel: garaaž (tõstuk) + sõiduk, kui raha jätkub ja mehi on
      if (typeof Vehicles !== 'undefined' && !Vehicles.teamVehicles(r.team).length && (r.men || 0) >= 3) {
        const vc = Vehicles.DEF.buggy.cost, gc = r.hasGarage ? { s: 0, c: 0 } : OBJ.tostuk.cost;
        if (spend(r, { s: vc.s + gc.s, c: vc.c + gc.c }, reserve(r) + 150)) {
          r.hasGarage = true; Vehicles.rivalBuy(r, 'buggy');
          if (Math.hypot(Player.pos.x - r.base.x, Player.pos.z - r.base.z) < 200 || Math.random() < 0.5) UI.msg('Radio: ' + r.short + ' bought an armed buggy.', 'rival');
        }
      }
      // teine sõiduk: veok saagi vedamiseks (samad hinnad mis mängijal)
      else if (typeof Vehicles !== 'undefined' && r.hasGarage && Vehicles.teamVehicles(r.team).length === 1 && (r.men || 0) >= 5) {
        const vc = Vehicles.DEF.hauler.cost;
        if (spend(r, { s: vc.s, c: vc.c }, reserve(r) + 250)) {
          Vehicles.rivalBuy(r, 'hauler');
          if (Math.hypot(Player.pos.x - r.base.x, Player.pos.z - r.base.z) < 200 || Math.random() < 0.5) UI.msg('Radio: ' + r.short + ' bought a hauler truck.', 'rival');
        }
      }
      if (r.bb.rooms.size >= 8) continue;
      if (growBase(r, true)) {
        r.bb.rebuildNow();
        const d = Math.hypot(Player.pos.x - r.base.x, Player.pos.z - r.base.z);
        if (d < 120) UI.msg(r.short + ' is expanding their base.', 'rival');
        // aeg-ajalt uus kahur baasi ette
        const tur = Ents.countAlive((e) => e.kind === 'rturret' && e.rival === r);
        if (tur < Math.floor(r.bb.rooms.size / 3) && spend(r, OBJ.kahur.cost, reserve(r))) {   // kahur maksab sama palju mis mängijal
          const face = Math.atan2(-r.base.x, -r.base.z), a = face + rand(-0.9, 0.9), x = r.base.x + Math.sin(a) * rand(12, 16), z = r.base.z + Math.cos(a) * rand(12, 16);
          Ents.spawn('rturret', r.team, x, z, { maxHp: OBJ.kahur.hp, radius: 0.8, rival: r, yaw: a, aim: a, cool: 0, scanT: 0 });
          (r.turrets = r.turrets || []).push([x, z, a]);
        }
      }
    }
  }
  function updateBases(dt, humans) { for (const r of list) if (r.bb) r.bb.update(dt, humans); }
  function drawBases(night, time) { for (const r of list) if (r.bb) r.bb.draw(false, night, time); }
  function spawnUnit(r, x, z, mission, extra) {
    const e = Ents.spawn('human', r.team, x, z, Object.assign({
      maxHp: HUMAN_HP, radius: 0.38, ai: unitAI, mission, home: { x: r.base.x, z: r.base.z },
      dmg: UNIT.dmg, acc: UNIT.acc, speedU: UNIT.speed, skill: randi(1, 3), fear: (extra && extra.commander) ? 0.3 : rand(0.1, 0.85), scanT: rand(0, 0.5), cool: rand(0, 1), carry: 0, rival: r,
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
    if (e.inVehicle) return;   // sõidab (Vehicles juhib)
    if (e.cool > 0) e.cool -= dt;
    // haavatud korjaja/ründaja taandub koju (palgatud inimesi on vähe)
    if ((e.mission === 'scav' || e.mission === 'raid' || e.mission === 'hunt' || e.mission === 'salvage') && e.hp < e.maxHp * (0.12 + (e.fear === undefined ? 0.5 : e.fear) * 0.55)) { e.mission = 'flee'; e.path = null; }
    e.scanT -= dt;
    if (e.scanT <= 0) {
      e.scanT = 0.4 + Math.random() * 0.3;
      const rng = e.mission === 'guard' ? 46 : e.mission === 'assault' ? 34 : 38;
      e.threat = findTarget(e, rng);
      if (!e.threat && e.mission === 'raid' && pcore && pcore.alive && Math.hypot(pcore.pos.x - e.pos.x, pcore.pos.z - e.pos.z) < 30) e.threat = pcore;
      if (e.mission === 'assault' && Boss.e && Boss.e.alive && !e.threat && Math.hypot(Boss.e.pos.x - e.pos.x, Boss.e.pos.z - e.pos.z) < 40) e.threat = Boss.e;
    }
    const t = e.threat;
    const sp = e.speedU || 4;
    if (e.mission === 'flee') e.speedFlee = sp * (1.1 + (e.fear || 0.5) * 0.6);
    if (t && targetAlive(t) && e.mission !== 'flee') {
      const tp = targetPoint(t), d = Math.hypot(tp.x - e.pos.x, tp.z - e.pos.z);
      Ents.face(e, tp.x, tp.z, dt, 9);
      e.aim = Math.min(1, e.aim + dt * 4);
      e.aimPitch = Math.atan2(tp.y - (e.pos.y + 1.35), d);
      if (d > 24) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 1.5) { e.path = [{ x: tp.x, z: tp.z }]; e.pathI = 0; } Ents.stepMove(e, dt, sp); }
      else if (d < 9 && t.kind !== 'turret') { const ax = e.pos.x - (tp.x - e.pos.x), az = e.pos.z - (tp.z - e.pos.z); e.path = [{ x: ax, z: az }]; e.pathI = 0; e.aimLock = Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z); Ents.stepMove(e, dt, sp * 0.7); e.aimLock = undefined; }
      else {
        e.aimLock = Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z);
        // väike külgsamm
        e.strafe = (e.strafe || rand(-1, 1)) ; if (Math.random() < dt * 0.4) e.strafe = -e.strafe;
        const sx = Math.cos(e.yaw) * e.strafe, sz = -Math.sin(e.yaw) * e.strafe;
        e.path = [{ x: e.pos.x + sx * 2, z: e.pos.z + sz * 2 }]; e.pathI = 0; Ents.stepMove(e, dt, sp * 0.45);
        e.aimLock = undefined;
      }
      if (e.cool <= 0 && Math.abs(angDiff(e.yaw, Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z))) < 0.35) {
        fireAt(e, t, e.dmg, e.acc * (t === Player ? 0.8 : 1), 'enemy');
        e.cool = t === Player ? rand(0.75, 1.1) : rand(0.45, 0.6);
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
        if (!e.raidGo && pcore && pcore.alive) {
          // peamine siht: baasi süda (tuum). Kui see hävib, on mängijal kõik läbi.
          const a = rand(0, TAU); Ents.goTo(e, pcore.pos.x + Math.sin(a) * 9, pcore.pos.z + Math.cos(a) * 9); e.raidGo = true; e.raidCore = true;
        }
        if (e.raidCore && pcore && pcore.alive) {
          const d = Math.hypot(pcore.pos.x - e.pos.x, pcore.pos.z - e.pos.z);
          if (d < 14) { e.threat = pcore; e.path = null; } else Ents.stepMove(e, dt, sp);
          break;
        }
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
          e.stoleKris = k; e.carryScrap = s;
          if (k || s) UI.msg(e.rival.short + ' stole from storage ' + k + ' diamonds and ' + s + ' scrap!', 'danger');
          e.mission = 'return'; e.raidGo = false; Ents.goTo(e, e.home.x, e.home.z);
        }
        if (Math.random() < dt * 0.05 && !e.path) Ents.goTo(e, 0, 0);
        break;
      }
      case 'scav': {   // komandör kannab nagu mängija (40), palgaline nagu mängija kaevur (8)
        const s = e.site;
        if (!s || Comets.siteTotal(s) <= 0 || e.carry >= (e.commander ? CARRY_MAX : 8)) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        if (!e.scavCl || e.scavCl.amount <= 0) {
          e.scavCl = s.clusters.filter((c) => c.amount > 0).sort((a, b) => Math.hypot(a.x - e.pos.x, a.z - e.pos.z) - Math.hypot(b.x - e.pos.x, b.z - e.pos.z))[0];
          if (e.scavCl) Ents.goTo(e, e.scavCl.x + rand(-1, 1), e.scavCl.z + rand(-1, 1));
          e.mineT = 0;
        }
        if (Ents.stepMove(e, dt, sp) && e.scavCl) {
          e.mineT += dt * (0.75 + e.skill * 0.25);
          if (Math.random() < 0.3) FX.beam(e.pos.x, e.pos.y + 1.2, e.pos.z, e.scavCl.x, e.scavCl.y + 0.5, e.scavCl.z);
          if (e.mineT > 2.4) { e.mineT = 0; e.carry += Comets.takeUnits(e.scavCl, 1); e.carryKris = true; }
        }
        break;
      }
      case 'return': case 'flee': {
        if (!e.path) Ents.goTo(e, e.home.x, e.home.z);
        if (Ents.stepMove(e, dt, e.mission === 'flee' ? e.speedFlee || sp : sp) || Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z) < 8) {
          const rv = e.rival;
          if (rv.alive) {
            if (e.carryKris) rv.res.kris += e.carry;
            if (e.carryAcid) rv.res.cr += e.carry * Aliens.ACID_PRICE;
            if (e.stoleKris) rv.res.kris += e.stoleKris;
            if (e.carryScrap) rv.res.scrap += e.carryScrap;
            sellKris(rv);
          }
          if (e.commander) { Object.assign(e, { mission: 'guard', carry: 0, carryKris: false, carryAcid: false, prey: null, carryScrap: 0, stoleKris: 0, path: null, site: null, scavCl: null, wreck: null, salvGo: false, stateT: 0 }); }
          else e.remove = true;
        }
        break;
      }
      case 'assault': {
        const b = Boss.e;
        if (!b || !b.alive) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.3) Ents.goTo(e, b.pos.x + rand(-20, 20), b.pos.z + rand(-20, 20));
        Ents.stepMove(e, dt, sp);
        break;
      }
      case 'hunt': {   // tulnukajaht: tapa, lõika happenäärmed, vii koju (müüakse nagu mängijal)
        if (e.prey && e.prey.alive && e.prey.flee > 0) { const dead = Ents.list.find((o) => o.kind === 'alien' && !o.alive && o.harvestable && Math.hypot(o.pos.x - e.pos.x, o.pos.z - e.pos.z) < 45); if (dead) e.prey = dead; }
        const g = e.prey;
        if (!g || (!g.alive && !g.harvestable) || e.carry > 0) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        const d = Math.hypot(g.pos.x - e.pos.x, g.pos.z - e.pos.z);
        if (g.alive) {
          if (d > 18) { if (!e.path || Ents.arrived(e) || Math.random() < dt * 0.8) { e.path = [{ x: g.pos.x, z: g.pos.z }]; e.pathI = 0; } Ents.stepMove(e, dt, sp); }
          else {
            Ents.face(e, g.pos.x, g.pos.z, dt, 8); e.aim = Math.min(1, e.aim + dt * 4); e.moveAmt = Math.max(0, e.moveAmt - dt * 4);
            if (e.cool <= 0 && World.lineOfSight(e.pos.x, e.pos.y + 1.4, e.pos.z, g.pos.x, g.pos.y + 1, g.pos.z)) { fireAt(e, g, e.dmg, e.acc, 'enemy'); e.cool = rand(0.45, 0.6); }
          }
        } else {
          if (d > 2.4) { if (!e.path || Ents.arrived(e)) Ents.goTo(e, g.pos.x, g.pos.z); Ents.stepMove(e, dt, sp); }
          else { e.hasGun = false; e.mineT = (e.mineT || 0) + dt; if (e.mineT > 2.5) { e.mineT = 0; e.carry = Aliens.harvest(g); e.carryAcid = true; e.hasGun = true; } }
        }
        break;
      }
      case 'salvage': {
        const w = e.wreck;
        if (!w || w.scrap <= 0 || e.carry > 0) { e.mission = 'return'; Ents.goTo(e, e.home.x, e.home.z); break; }
        if (!e.salvGo) { const a = Math.atan2(e.pos.z - w.z, e.pos.x - w.x); Ents.goTo(e, w.x + Math.cos(a) * (w.rad + 0.9), w.z + Math.sin(a) * (w.rad + 0.9)); e.salvGo = true; e.mineT = 0; }
        if (Ents.stepMove(e, dt, sp) || Math.hypot(e.pos.x - w.x, e.pos.z - w.z) < w.rad + 1.6) {
          e.hasGun = false; e.mineT += dt * (0.75 + e.skill * 0.25);   // sama tempo mis mängija meeskonnal
          if (Math.random() < 0.2) FX.repair(w.x + rand(-1, 1), w.y + 1, w.z + rand(-1, 1));
          if (e.mineT > 6) { const n = Math.min(10, w.scrap); w.scrap -= n; e.carryScrap = (e.carryScrap || 0) + n; e.carry = n; e.hasGun = true; if (w.scrap <= 0 && World.clearWreck) World.clearWreck(w); }
        }
        break;
      }
    }
  }
  function onUnitDeath(e, src) {
    const r = e.rival;
    if (r) {
      if (e.commander) {
        r.cmdT = 4.5;
        UI.msg((e.cmdName || r.short + ' commander') + ' collapsed – their rescue team carries them back to base.', 'good');
      } else r.men = Math.max(0, (r.men || 0) - 1);
    }
    const items = Inv.rivalLoot(e);
    if (items.length) Ents.pickups.push({ kind: 'bag', x: e.pos.x, y: Ents.groundY(e.pos.x, e.pos.z), z: e.pos.z, data: { items }, id: Math.random() });
    if (e.kind === 'human' && src && src.kind === 'player') G.stats.rivalsKilled = (G.stats.rivalsKilled || 0) + 1;
  }
  function onComet(site) {
    for (const r of list) {
      if (!r.alive) continue;
      (r.sites = r.sites || []).push(site);   // meeles: komandör/mehed lähevad kohale, kui vabanevad
      pending.push({ t: G.time.total + rand(16, 38), fn: () => {
        if (!r.alive || Comets.siteTotal(site) <= 0 || !tripOK(r, site.x, site.z)) return;
        // väike seltskond: komandör läheb ise (nagu mängija), suurem saadab 2–3 meest
        const n = (r.men || 0) >= 3 ? takeMen(r, 3, 1) : 0;
        if (n < 2 && !sendCommander(r, 'scav', { site })) { if (!n) return; }
        for (let k = 0; k < n; k++) spawnUnit(r, r.base.x + rand(-6, 6), r.base.z + rand(-6, 6), 'scav', { site });   // jalgsi oma baasist
        if (Math.random() < 0.6) UI.msg('Radio: ' + r.short + ' collectors are driving toward the comet.', 'warn');
      } });
    }
  }
  function launchRaid(r) {
    const avail = freeMen(r) + Math.max(0, unitsOf(r).filter((u) => u.mission === 'guard').length - 1);
    if (avail < 3) { r.raidT = DAY_LEN * rand(0.4, 0.7); return; }   // liiga vähe mehi
    const n = takeMen(r, Math.min(7, avail), 1);
    const p = r.base;   // tulevad jalgsi oma baasist
    for (let k = 0; k < n; k++) spawnUnit(r, p.x + rand(-6, 6), p.z + rand(-6, 6), 'raid');
    const dir = bearingWord(p.x, p.z);
    UI.msg(r.short + ' raid approaching ' + dir + '! ' + n + ' armed mercenaries.', 'danger');
    UI.banner('Attack!', r.short + ' is due ' + dir.replace(/s$/, 'st'), 'danger');
    Audio2.alarm();
    G.flags.raids = (G.flags.raids || 0) + 1;
  }
  function launchAssault(r) {
    const b = World.sites.nest;
    const n = takeMen(r, 8, 1);
    if (n < 2) { r.assaultT = DAY_LEN * 0.3; return; }
    const p = r.base;
    for (let k = 0; k < n; k++) spawnUnit(r, p.x + rand(-6, 6), p.z + rand(-6, 6), 'assault');
    r.assaultActive = true;
    UI.msg('Intercepted radio: ' + r.short + ' sent ' + n + ' men to attack the Stoneheart\'s nest!', 'danger');
  }
  function update(dt) {
    for (let i = pending.length - 1; i >= 0; i--) if (G.time.total >= pending[i].t) { const p = pending.splice(i, 1)[0]; p.fn(); }
    for (const r of list) {
      if (!r.alive) continue;
      hireTick(r, dt);
      // komandör ärkab nagu mängija: 4,5 s pärast baasis, päästearve kuni 50 ₵
      if (r.cmdT > 0) { r.cmdT -= dt; if (r.cmdT <= 0) { r.cmdT = 0; r.res.cr -= Math.min(r.res.cr, 50); spawnCommander(r); } }
      // pesa otsimine samadel tingimustel: süvaskänner (32%/päev, 2+ skännerit x1.4) või keegi jõuab pesast 140 m kaugusele
      if (!r.found && r.bb) {
        const sc = r.bb.objsOfType('skanner').filter((o) => o.on !== false).length;
        if (sc) r.progress = Math.min(100, r.progress + (32 / DAY_LEN) * (sc > 1 ? 1.4 : 1) * dt);
        const n = World.sites.nest;
        if (Ents.list.some((u) => u.alive && u.team === r.team && u.kind === 'human' && Math.hypot(u.pos.x - n.x, u.pos.z - n.z) < 140)) r.progress = 100;
      }
      // teemandid on peamine sissetulek: kui mõnel teadaoleval komeedil on veel kristalle, läheb komandör (või vaba mees) korjama
      r.siteT = (r.siteT || 0) - dt;
      if (r.siteT <= 0) {
        r.siteT = 20;
        r.sites = (r.sites || []).filter((q) => Comets.siteTotal(q) > 0 && Math.hypot(q.x - r.base.x, q.z - r.base.z) < TRIP_MAX);
        const site = r.sites.sort((a, b) => Math.hypot(a.x - r.base.x, a.z - r.base.z) - Math.hypot(b.x - r.base.x, b.z - r.base.z))[0];
        if (site && !Econ.isNight() && tripOK(r, site.x, site.z) && !unitsOf(r).some((u) => u.mission === 'scav') && !(commanderOf(r) && commanderOf(r).mission === 'scav')) {
          const k = (r.men || 0) >= 3 ? takeMen(r, 2, 1) : 0;
          for (let i = 0; i < k; i++) spawnUnit(r, r.base.x + rand(-6, 6), r.base.z + rand(-6, 6), 'scav', { site });
          if (!k) sendCommander(r, 'scav', { site });
        }
      }
      // tulnukajaht (happenäärmed), kui lähedal komeete pole
      r.huntT = (r.huntT || rand(30, 60)) - dt;
      if (r.huntT <= 0) {
        r.huntT = rand(40, 70);
        const busy = unitsOf(r).some((u) => u.mission === 'hunt') || (commanderOf(r) && commanderOf(r).mission !== 'guard');
        const hasSite = (r.sites || []).some((q) => tripOK(r, q.x, q.z));
        const al = !busy && !Econ.isNight() ? Aliens.nearestPack(r.base.x, r.base.z, 500) : null;
        if (al && tripOK(r, al.pos.x, al.pos.z) && (!hasSite || (r.men || 0) >= 4)) {
          const packN = Ents.list.filter((o) => o.kind === 'alien' && o.alive && o.pack === al.pack).length;
          const k = (r.men || 0) >= 3 ? takeMen(r, Math.min(3, packN + 1), 1) : 0;
          for (let i = 0; i < k; i++) spawnUnit(r, r.base.x + rand(-6, 6), r.base.z + rand(-6, 6), 'hunt', { prey: al });
          if (!k && packN <= 2 && !hasSite) sendCommander(r, 'hunt', { prey: al });
        }
      }
      // öösel tulevad korjajad koju (hiilijad)
      if (Econ.isNight()) for (const u of Ents.list) if (u.alive && u.team === r.team && (u.mission === 'scav' || u.mission === 'salvage' || u.mission === 'hunt') && !u.carry && !u.inVehicle) { const g = u.site || u.wreck || u.prey; if (!g || (Math.hypot(g.x - u.pos.x, g.z - u.pos.z) > 80 && Math.hypot(u.home.x - u.pos.x, u.home.z - u.pos.z) < 120)) { u.mission = 'return'; u.path = null; } }
      // süvaskänner on esimene suur ost (pesa leidmiseks), nagu mängijal
      if (r.bb && !r.bb.objsOfType('skanner').length && r.res.kris >= (OBJ.skanner.cost.k || 0) && r.res.cr >= (OBJ.skanner.cost.c || 0) + reserve(r)) {
        for (const room of r.bb.rooms.values()) { const before = r.bb.objsOfType('skanner').length; furnish(r, room, ['skanner'], true); if (r.bb.objsOfType('skanner').length > before) { r.bb.rebuildNow(); break; } }
      }
      // vanaraua korjamine vrakkidest (nagu mängija kaevur) – kui komeete pole
      r.salvT -= dt;
      if (r.salvT <= 0) {
        r.salvT = DAY_LEN * rand(0.2, 0.35);
        const hasSites = (r.sites || []).some((q) => tripOK(r, q.x, q.z));
        if (r.res.scrap < (r.men >= 3 ? 160 : 80) && (!hasSites || (r.men || 0) >= 3) && World.wrecks && !Econ.isNight()) {
          const w = World.wrecks.filter((q) => q.scrap > 0 && !q.gone && Math.hypot(q.x - r.base.x, q.z - r.base.z) < 420 && tripOK(r, q.x, q.z)).sort((a, b) => Math.hypot(a.x - r.base.x, a.z - r.base.z) - Math.hypot(b.x - r.base.x, b.z - r.base.z))[0];
          if (w) {
            const k = (r.men || 0) >= 3 ? takeMen(r, 2, 1) : 0;
            for (let i = 0; i < k; i++) spawnUnit(r, r.base.x + rand(-6, 6), r.base.z + rand(-6, 6), 'salvage', { wreck: w });
            if (!k && !hasSites) sendCommander(r, 'salvage', { wreck: w });
          }
        }
      }
      r.raidT -= dt;
      if (r.raidT <= 0) { r.raidT = DAY_LEN * rand(1.3, 2.2); if (G.time.day >= 2) launchRaid(r); }
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
      sellKris(r);
      // palgad ja toit nagu mängijal; kellele ei jätku, see lahkub
      const bill = (r.men || 0) * (WAGE + FOOD_CR);
      if (r.res.cr >= bill) r.res.cr -= bill;
      else { const canPay = Math.floor(r.res.cr / (WAGE + FOOD_CR)); r.res.cr -= canPay * (WAGE + FOOD_CR); const quit = r.men - canPay; r.men = canPay; for (const u of unitsOf(r).slice(0, Math.max(0, unitsOf(r).length - r.men))) u.remove = true; if (quit > 0) UI.msg('Radio: ' + quit + ' of ' + r.short + '\'s unpaid mercenaries walked out.', 'rival'); }
      r.slots = 3;
      if (r.bb) r.bb.repairAllDoors();   // öösel parandatakse lõhutud/häkitud uksed
      topUpGuards(r);
      buyScrap(r);
    }
  }
  // mängija baasi tuum: sama mis konkurentidel (900 elu); kui see hävib, on mäng läbi
  let pcore = null;
  function spawnPlayerCore(hp) {
    const x = Base.OX + 2, z = Base.OZ + 13;
    pcore = Ents.spawn('core', 'crew', x, z, { maxHp: 900, radius: 2.2, playerCore: true });
    if (hp !== undefined && hp !== null) pcore.hp = Math.max(1, hp);
    const y = World.heightAt(x, z);
    if (pcore.col) World.removeCol(pcore.col);
    pcore.col = World.addCol({ t: 'c', x, z, r: 2.0, y0: y - 2, y1: y + 5, kind: 'struct' });
    return pcore;
  }
  function playerCoreHp() { return pcore && pcore.alive ? Math.round(pcore.hp) : (pcore ? 0 : null); }
  function coreDestroyed(e) {
    if (e.playerCore) {
      FX.explosion(e.pos.x, e.pos.y + 3, e.pos.z, [1, 0.6, 0.3], 4); Audio2.explode(e.pos.x, e.pos.z, true); UI.shake(0.8);
      UI.msg('The base heart is silent. The sand starts to tremble…', 'danger');
      // südame heli vaikib -> liivauss neelab baasi, siis mäng läbi
      Sandworm.devour(Base.OX, Base.OZ, { R: 60, onBite: () => { Base.power.lightsOn = false; }, onDone: () => Game.over('core') });
      return;
    }
    const r = e.rival; if (!r) return;
    r.alive = false;
    FX.explosion(e.pos.x, e.pos.y + 3, e.pos.z, [1, 0.6, 0.3], 4);
    Audio2.explode(e.pos.x, e.pos.z, true);
    UI.shake(0.8);
    UI.msg(r.name + ' camp heart has been destroyed! Its hum fell silent – a sandworm is coming for their camp.', 'good');
    if (r.bb) Sandworm.devour(r.base.x, r.base.z, { R: 55, onBite: () => { r.bb.reset(); r.bb.rebuildNow(); UI.banner('Camp swallowed', r.short + ' is out of the game', 'good'); } });
    for (const u of Ents.list) if (u.alive && u.team === r.team && u.kind === 'human') { u.mission = 'flee'; u.path = null; }
    for (const u of Ents.list) if (u.alive && u.kind === 'rturret' && u.rival === r) Ents.kill(u, null);
    Ents.pickups.push({ kind: 'bag', x: e.pos.x + 3, y: Ents.groundY(e.pos.x + 3, e.pos.z), z: e.pos.z, data: { items: [['kris', 25], ['scrap', 40], ['ammo_r', 90], ['medkit', 2], ['grenade', 2]] }, id: Math.random() });
    G.flags[r.id + 'Dead'] = true;
    if (r.bb) r.bb.power.lightsOn = false;
  }
  function turretAI(e, dt) {
    if (e.cool > 0) e.cool -= dt;
    e.scanT -= dt;
    if (e.scanT <= 0) { e.scanT = 0.35; e.threat = findThreat(e.pos.x, e.pos.y + 1.7, e.pos.z, 34, e.team, Crew.turretTargets()); }
    const t = e.threat;
    if (t && targetAlive(t)) {
      const tp = targetPoint(t);
      const want = Math.atan2(tp.x - e.pos.x, tp.z - e.pos.z);
      e.aim += angDiff(e.aim, want) * Math.min(1, dt * 5);
      if (e.cool <= 0 && Math.abs(angDiff(e.aim, want)) < 0.15) {
        e.cool = 0.26;
        const fake = { pos: { x: e.pos.x, y: e.pos.y + 0.3, z: e.pos.z }, yaw: e.aim, team: e.team };
        fireAt(fake, t, 9, 0.75, 'turret');
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
    const alive = e.alive, col = e.rival ? e.rival.color : [0.35, 0.95, 0.6];
    GFX.draw(MODELS.camp_core || MODELS.obj.core, e.m, e.hurtT > 0 ? [1.5, 0.8, 0.7, 0] : alive ? [1, 1, 1, 0] : [0.3, 0.3, 0.3, 0], null, { rust: 1 });
    if (alive) GFX.addLight(e.pos.x, e.pos.y + 4.5, e.pos.z, 18, col[0], col[1], col[2], 2.2);
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
  function serialize() { return list.map((r) => ({ id: r.id, progress: r.progress, alive: r.alive, raidT: r.raidT, found: r.found, assaultT: r.assaultT, coreHp: r.core ? r.core.hp : 0, buildT: r.buildT, roomsBuilt: r.roomsBuilt, men: r.men || 0, hireT: r.hireT, cmdT: r.cmdT || 0, res: r.res, slots: r.slots, turrets: r.turrets || [], bb: r.bb ? r.bb.serialize() : null })); }
  function deserialize(arr) {
    for (const d of arr || []) { const r = get(d.id); if (!r) continue; Object.assign(r, { progress: d.progress, alive: d.alive, raidT: d.raidT, found: d.found, assaultT: d.assaultT, coreHp: d.coreHp, buildT: d.buildT, roomsBuilt: d.roomsBuilt || 0, bbData: d.bb || null, men: d.men !== undefined ? d.men : 4, hireT: d.hireT || DAY_LEN * 0.3, cmdT: 0, res: d.res || { cr: 300, scrap: 60, kris: 0 }, slots: d.slots !== undefined ? d.slots : 3, turrets: d.turrets || [], salvT: DAY_LEN * 0.3 }); }
  }
  return { list, get, reset, init, updateBases, drawBases, update, daily, onComet, onUnitDeath, coreDestroyed, unitAI, turretAI, draw, drawCore, drawTurret, launchRaid, serialize, deserialize, spawnUnit, freeMen, menCap, spawnPlayerCore, playerCoreHp, get playerCore() { return pcore; } };
})();
