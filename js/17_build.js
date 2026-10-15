// ============================================================
//  EHITUSREŽIIM (Sims-stiilis)
// ============================================================
const Build = (() => {
  const S = { tool: 'look', cat: 'elu', item: null, rot: 0, rotManual: false, style: 1, level: 0 };
  const cam = { tx: 0, tz: 4, yaw: 0.7, pitch: 0.92, dist: 26, vyaw: 0 };
  let hover = null, drag = null, pending = null, lastPointer = null;
  const undo = [];
  const pointers = new Map();
  let gesture = null;
  let gridMesh = null, boxMesh = null;
  const tmpM = M4.create(), tmpM2 = M4.create();
  const GREEN = [0.3, 1.0, 0.45, 0], RED = [1.0, 0.25, 0.2, 0], YEL = [1.0, 0.85, 0.3, 0], BLUE = [0.4, 0.8, 1.0, 0];

  function initMeshes() {
    let b = new MB(); b.jit = 0;
    const N = Base.N, CS = Base.CS, X0 = Base.X0, Z0 = Base.Z0, w = 0.05;
    for (let i = 2; i <= N - 2; i++) {
      const x = X0 + i * CS;
      b.color([1, 0.95, 0.85], MAT.GLOW).quad([x - w, 0, Z0 + 2 * CS], [x - w, 0, Z0 + (N - 2) * CS], [x + w, 0, Z0 + (N - 2) * CS], [x + w, 0, Z0 + 2 * CS]);
      const z = Z0 + i * CS;
      b.color([1, 0.95, 0.85], MAT.GLOW).quad([X0 + 2 * CS, 0, z + w], [X0 + (N - 2) * CS, 0, z + w], [X0 + (N - 2) * CS, 0, z - w], [X0 + 2 * CS, 0, z - w]);
    }
    gridMesh = b.build();
    b = new MB(); b.jit = 0;
    b.color([1, 1, 1], MAT.GLOW).box(0, 0, 0, 1, 1, 1);
    boxMesh = b.build();
  }

  // ---------- režiim ----------
  function enter() {
    if (!gridMesh) initMeshes();
    G.mode = 'build';
    Input.exitLock(); Input.reset();
    const p = Player.pos;
    const bb = Base.bounds(); cam.tx = clamp(Math.hypot(p.x, p.z) < bb + 12 ? p.x * 0.5 : 0, -30, 30); cam.tz = clamp(Math.hypot(p.x, p.z) < bb + 12 ? p.z * 0.5 + 3 : 3, -30, 30);
    cam.yaw = Player.yaw + Math.PI; cam.dist = 26;
    pending = null; drag = null; hover = null;
    S.level = 0; Base.viewLevel = 0;
    undo.length = 0;
    UI.showBuild(true);
    setTool(Input.isTouch ? 'look' : 'wall');
    G.flags.builtOnce = true;
  }
  function exit() {
    pending = null; drag = null; GFX.cam.shiftY = 0;
    S.level = 0; Base.viewLevel = 0;
    G.mode = 'play';
    UI.showBuild(false);
    Crew.assignBeds();
    Base.updatePower(!Econ.isNight());
    for (const m of Crew.members()) m.path = null;
    Save.auto();
    Objectives.check();
  }
  function setLevel(lv) {
    S.level = lv ? 1 : 0; Base.viewLevel = S.level; pending = null; drag = null; hover = null;
    if (S.level && (S.tool === 'wall' || S.tool === 'door' || S.tool === 'window')) S.tool = 'look';
    UI.buildTools(S); UI.buildConfirm(null); info();
    UI.toast(S.level ? 'Floor 2 – place items upstairs' : 'Floor 1');
  }
  function setTool(t) {
    if (t === 'level') { setLevel(!S.level); return; }
    if (S.level && (t === 'wall' || t === 'door' || t === 'window')) { deny('Walls, doors and windows are built on floor 1 – the upper floor follows them.'); return; }
    S.tool = t; pending = null; drag = null;
    if (t !== 'obj') S.item = null;
    UI.buildTools(S);
    UI.buildConfirm(null);
    info();
  }
  function selectItem(type) {
    S.item = type; S.rotManual = false; S.tool = 'obj';
    const c = { x: cam.tx, z: cam.tz };
    const cell = Base.toCell(c.x, c.z);
    if (Input.isTouch) { pending = { kind: 'obj', type, i: cell.i, j: cell.j, rot: Base.autoRot(type, cell.i, cell.j), lv: S.level }; showPendingConfirm(); }
    UI.buildTools(S);
    info();
  }

  // ---------- kaamera ----------
  function update(dt) {
    const k = (c) => Input.keys.has(c);
    const sp = cam.dist * 0.9 * dt;
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    let mx = 0, mz = 0;
    if (k('KeyW') || k('ArrowUp')) { mx += fx; mz += fz; }
    if (k('KeyS') || k('ArrowDown')) { mx -= fx; mz -= fz; }
    if (k('KeyD') || k('ArrowRight')) { mx += rx; mz += rz; }
    if (k('KeyA') || k('ArrowLeft')) { mx -= rx; mz -= rz; }
    cam.tx = clamp(cam.tx + mx * sp, -42, 42); cam.tz = clamp(cam.tz + mz * sp, -42, 42);
    if (k('KeyQ')) cam.yaw += dt * 1.6;
    if (k('KeyE')) cam.yaw -= dt * 1.6;
    cam.yaw += cam.vyaw * dt; cam.vyaw *= Math.pow(0.02, dt);
    if (Input.wasPressed('KeyR')) rotate();
    if (Input.wasPressed('KeyZ') && (k('ControlLeft') || k('ControlRight') || k('MetaLeft'))) doUndo();
    if (Input.wasPressed('Delete') || Input.wasPressed('KeyX')) setTool('demolish');
    if (Input.wasPressed('Enter') && pending) commitPending();
    const C = GFX.cam;
    const pitch = lerp(0.62, 1.05, clamp((cam.dist - 12) / 50, 0, 1));
    C.useTarget = true;
    C.target.x = cam.tx; C.target.y = S.level ? Base.WH : 0; C.target.z = cam.tz;
    C.pos.x = cam.tx + Math.sin(cam.yaw) * Math.cos(pitch) * cam.dist;
    C.pos.y = C.target.y + Math.sin(pitch) * cam.dist;
    C.pos.z = cam.tz + Math.cos(cam.yaw) * Math.cos(pitch) * cam.dist;
    C.fov = 55 * DEG;
    const bb = document.getElementById('bBottom'), tb = document.getElementById('bTop');
    if (bb && window.innerHeight) {
      const H = window.innerHeight;
      const top = tb ? tb.getBoundingClientRect().bottom : 0, bot = bb.getBoundingClientRect().top;
      const center = (top + bot) / 2;
      C.shiftY = clamp(1 - (2 * center) / H, 0, 0.75);
    }
    document.getElementById('build').classList.toggle('placing', !!(pending && Input.isTouch && pending.kind === 'obj'));
  }
  function rotate() {
    if (pending && pending.kind === 'obj') { pending.rot = (pending.rot + 1) % 4; S.rotManual = true; showPendingConfirm(); info(); }
    else if (S.item) { S.rot = ((hover && hover.rot !== undefined ? hover.rot : S.rot) + 1) % 4; S.rotManual = true; info(); }
  }

  // ---------- osutamine ----------
  function groundAt(sx, sy) {
    const r = GFX.screenRay(sx, sy);
    if (Math.abs(r.d.y) < 1e-4) return null;
    const t = (Base.FLOOR_Y + (S.level ? Base.WH : 0) - r.o.y) / r.d.y;
    if (t < 0) return null;
    return { x: r.o.x + r.d.x * t, z: r.o.z + r.d.z * t };
  }
  function edgeAt(p) {
    const fx = (p.x - Base.X0) / Base.CS, fz = (p.z - Base.Z0) / Base.CS;
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j;
    const d = [[u, 'v', i, j], [1 - u, 'v', i + 1, j], [w, 'h', i, j], [1 - w, 'h', i, j + 1]].sort((a, b) => a[0] - b[0])[0];
    if (d[0] > 0.4) return null;
    return { t: d[1], i: d[2], j: d[3] };
  }
  function computeHover(sx, sy) {
    const p = groundAt(sx, sy);
    if (!p) { hover = null; return; }
    const c = Base.toCell(p.x, p.z);
    hover = { x: p.x, z: p.z, i: c.i, j: c.j, vi: Math.round((p.x - Base.X0) / Base.CS), vj: Math.round((p.z - Base.Z0) / Base.CS) };
    if (S.tool === 'door' || S.tool === 'window' || (S.tool === 'demolish' && !S.level)) hover.edge = edgeAt(p);
    if (S.tool === 'obj' && S.item) {
      const [w, h] = Base.footprint(S.item, S.rot);
      hover.oi = Math.round((p.x - Base.X0) / Base.CS - w / 2); hover.oj = Math.round((p.z - Base.Z0) / Base.CS - h / 2);
      hover.rot = S.rotManual ? S.rot : Base.autoRot(S.item, hover.oi, hover.oj);
      const [w2, h2] = Base.footprint(S.item, hover.rot);
      hover.oi = Math.round((p.x - Base.X0) / Base.CS - w2 / 2); hover.oj = Math.round((p.z - Base.Z0) / Base.CS - h2 / 2);
    }
  }
  function onDown(e) {
    if (G.mode !== 'build') return;
    Audio2.resume();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, type: e.pointerType, button: e.button });
    try { e.target.setPointerCapture(e.pointerId); } catch (er) { /* ignoreeri */ }
    if (pointers.size >= 2) { drag = null; gesture = { d: pinchDist(), a: pinchAng(), c: pinchCenter() }; return; }
    if (e.pointerType === 'mouse' && (e.button === 2 || e.button === 1)) { gesture = { mouse: true, button: e.button }; return; }
    lastPointer = { x: e.clientX, y: e.clientY };
    computeHover(e.clientX, e.clientY);
    if (!hover) return;
    if (S.tool === 'wall' || S.tool === 'demolish') { drag = { vi: hover.vi, vj: hover.vj, wi: hover.vi, wj: hover.vj }; if (S.tool === 'wall') { pending = null; UI.buildConfirm(null); } }
    else if (S.tool === 'obj' && S.item && e.pointerType !== 'mouse') { movePendingObj(); }
    info();
  }
  function onMove(e) {
    if (G.mode !== 'build') return;
    const p = pointers.get(e.pointerId);
    if (p) { p.px = p.x; p.py = p.y; p.x = e.clientX; p.y = e.clientY; }
    if (pointers.size >= 2 && gesture && !gesture.mouse) {
      const d = pinchDist(), a = pinchAng(), c = pinchCenter();
      cam.dist = clamp(cam.dist * (gesture.d / Math.max(10, d)), 12, 75);
      cam.yaw += angDiff(gesture.a, a) * -1;
      panBy(c.x - gesture.c.x, c.y - gesture.c.y);
      gesture = { d, a, c };
      return;
    }
    if (gesture && gesture.mouse && p) {
      if (gesture.button === 2) cam.yaw -= (p.x - p.px) * 0.006;
      else panBy(p.x - p.px, p.y - p.py);
      return;
    }
    if (p && S.tool === 'look' && p.type !== 'mouse') { panBy(p.x - p.px, p.y - p.py); return; }
    if (p && S.tool === 'look' && p.type === 'mouse' && (e.buttons & 1)) { panBy(p.x - p.px, p.y - p.py); return; }
    computeHover(e.clientX, e.clientY);
    if (drag && hover) {
      const dx = hover.vi - drag.vi, dz = hover.vj - drag.vj;
      if (Math.abs(dx) >= Math.abs(dz)) { drag.wi = hover.vi; drag.wj = drag.vj; } else { drag.wi = drag.vi; drag.wj = hover.vj; }
    }
    if (p && S.tool === 'obj' && S.item && p.type !== 'mouse') movePendingObj();
    info();
  }
  function onUp(e) {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (gesture) { if (pointers.size === 0) gesture = null; return; }
    if (G.mode !== 'build' || !p) return;
    const moved = Math.hypot(e.clientX - p.sx, e.clientY - p.sy);
    const touch = p.type !== 'mouse';
    computeHover(e.clientX, e.clientY);
    const line = drag ? Base.lineEdges(drag.vi, drag.vj, drag.wi, drag.wj) : [];
    drag = null;
    if (S.tool === 'wall') {
      if (line.length) { if (touch) { pending = { kind: 'walls', edges: line }; showPendingConfirm(); } else commitWalls(line); }
    } else if (S.tool === 'demolish' && line.length && moved >= 25) {
      const ex = line.filter(([t, i, j]) => Base.isWall(t, i, j));
      if (ex.length) { if (touch) { pending = { kind: 'demolish', tg: { kind: 'walls', edges: ex } }; showPendingConfirm(); } else doDemolish({ kind: 'walls', edges: ex }); }
    } else if (S.tool === 'obj' && S.item) {
      if (touch) { movePendingObj(); showPendingConfirm(); }
      else if (hover) commitObj(S.item, hover.oi, hover.oj, hover.rot);
    } else if ((S.tool === 'door' || S.tool === 'window') && hover && hover.edge && moved < 25) {
      if (touch) { pending = { kind: 'edge', e: hover.edge, type: S.tool }; showPendingConfirm(); }
      else commitEdge(hover.edge, S.tool);
    } else if (S.tool === 'paint' && hover && moved < 25) {
      paintAt(hover);
    } else if (S.tool === 'upper' && hover && moved < 25) {
      const rid = Base.roomAt(hover.i, hover.j);
      if (!rid) deny('Tap a room to give it a second floor.');
      else if (touch) { pending = { kind: 'upper', rid }; showPendingConfirm(); }
      else commitUpper(rid);
    } else if (S.tool === 'demolish' && hover && moved < 25) {
      if (touch) { const tg = demolishTarget(hover); if (tg) { pending = { kind: 'demolish', tg }; showPendingConfirm(); } }
      else demolishAt(hover);
    }
    info();
  }
  function movePendingObj() {
    if (!hover || !S.item) return;
    pending = { kind: 'obj', type: S.item, i: hover.oi, j: hover.oj, rot: hover.rot, lv: S.level };
  }
  function pinchDist() { const a = [...pointers.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
  function pinchAng() { const a = [...pointers.values()]; return Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x); }
  function pinchCenter() { const a = [...pointers.values()]; return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; }
  function panBy(dx, dy) {
    const k = cam.dist / Math.max(300, window.innerHeight) * 1.4;
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    cam.tx = clamp(cam.tx - (rx * dx - fx * dy) * k, -42, 42);
    cam.tz = clamp(cam.tz - (rz * dx - fz * dy) * k, -42, 42);
  }
  function onWheel(e) { if (G.mode !== 'build') return; cam.dist = clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.1), 12, 75); }
  function rectOf(d) { return { i0: Math.min(d.i0, d.i1), j0: Math.min(d.j0, d.j1), i1: Math.max(d.i0, d.i1), j1: Math.max(d.j0, d.j1) }; }

  // ---------- teostus ----------
  function afford(cost) {
    if ((cost.s || 0) > G.res.scrap) return 'Need ' + cost.s + ' scrap (have ' + G.res.scrap + ')';
    if ((cost.c || 0) > G.res.cr) return 'Need ' + cost.c + ' ₵ (have ' + G.res.cr + ')';
    if ((cost.k || 0) > G.res.kris) return 'Need ' + cost.k + ' diamonds (have ' + G.res.kris + ')';
    return null;
  }
  function pay(cost, sign = 1) { G.res.scrap -= (cost.s || 0) * sign; G.res.cr -= (cost.c || 0) * sign; G.res.kris -= (cost.k || 0) * sign; }
  function half(cost) { return { s: Math.floor((cost.s || 0) / 2), c: Math.floor((cost.c || 0) / 2), k: Math.floor((cost.k || 0) / 2) }; }
  function costStr(c) { const p = []; if (c.s) p.push(c.s + ' scrap'); if (c.c) p.push(c.c + ' ₵'); if (c.k) p.push(c.k + ' diamonds'); return p.join(' · ') || 'free'; }
  const WALL_COST = 3;
  function wallInfo(edges) {
    let n = 0, bad = null;
    for (const [t, i, j] of edges) { if (Base.isWall(t, i, j)) continue; const ok = Base.canPlaceWall(t, i, j); if (!ok.ok) { bad = ok.why; continue; } n++; }
    return { n, bad, cost: { s: n * WALL_COST } };
  }
  function commitWalls(edges) {
    const wi = wallInfo(edges);
    if (!wi.n) { deny(wi.bad || 'There\'s already a wall here.'); return false; }
    const af = afford(wi.cost); if (af) { deny(af); return false; }
    const roomsBefore = new Set(Base.rooms.keys()), nBefore = Base.rooms.size;
    const added = Base.addWalls(edges);
    pay({ s: added.length * WALL_COST });
    undo.push({ type: 'walls', edges: added, cost: { s: added.length * WALL_COST } });
    Audio2.build();
    for (const [t, i, j] of added) { const c = t === 'v' ? { x: Base.X0 + i * Base.CS, z: Base.Z0 + (j + 0.5) * Base.CS } : { x: Base.X0 + (i + 0.5) * Base.CS, z: Base.Z0 + j * Base.CS }; FX.dust(c.x, 0.4, c.z, 2, 0.8); }
    const fresh = [...Base.rooms.values()].filter((r) => !roomsBefore.has(r.id));
    if (Base.rooms.size > nBefore || fresh.length) { UI.toast('Room is ready: ' + (fresh[0] ? fresh[0].cells.length : '') + ' tiles. A door appeared by itself.'); Audio2.powerOn(); }
    pending = null; UI.buildConfirm(null);
    Objectives.check();
    return true;
  }
  function commitObj(type, i, j, rot, lv) {
    if (lv === undefined) lv = S.level;
    const ok = Base.canPlaceObj(type, i, j, rot, lv);
    if (!ok.ok) { deny(ok.why); return false; }
    const cost = OBJ[type].cost;
    const af = afford(cost); if (af) { deny(af); return false; }
    pay(cost);
    const o = Base.addObj(type, i, j, rot, lv ? { lv: 1 } : null);
    undo.push({ type: 'obj', id: o.id, cost });
    Audio2.build();
    FX.dust(o.cx, o.y + 0.3, o.cz, 8, 1);
    if (Input.isTouch) { pending = null; UI.buildConfirm(null); }
    if (OBJ[type].beds) Crew.assignBeds();
    Base.updatePower(!Econ.isNight());
    Objectives.check();
    return true;
  }
  const upperCost = (rid) => ({ s: Base.rooms.get(rid).cells.length * 6 });
  function commitUpper(rid) {
    if (Base.roomHasUpper(rid)) { deny('This room already has a second floor. Use Demolish on floor 2 to remove it.'); return false; }
    const r = Base.rooms.get(rid);
    if (r.cells.length < 4) { deny('The room is too small for a second floor.'); return false; }
    const cost = upperCost(rid), af = afford(cost); if (af) { deny(af); return false; }
    pay(cost); Base.setUpper(rid, true);
    undo.push({ type: 'upper', rid, cost });
    Audio2.build(); pending = null; UI.buildConfirm(null);
    let hasStairs = false; for (const o of Base.objs.values()) if (o.type === 'sisetrepp' && Base.roomAt(o.i, o.j) === rid) hasStairs = true;
    UI.toast(hasStairs ? 'Second floor built.' : 'Second floor built. Add Indoor stairs (Items → Living) so people can get up.');
    return true;
  }
  function commitEdge(ed, type) {
    const cur = Base.edgeType(ed.t, ed.i, ed.j);
    if (cur === type) {
      if (type === 'door') {
        const [ra, rb] = Base.edgeRooms(ed.t, ed.i, ed.j);
        if ((ra && Base.doorCount(ra) <= 1) || (rb && Base.doorCount(rb) <= 1)) { deny('A room needs at least one door.'); return false; }
      }
      Base.setOpening(ed.t, ed.i, ed.j, null);
      const refund = type === 'door' ? 4 : 3; G.res.scrap += refund;
      undo.push({ type: 'edge', ed, prev: type, now: null, cost: { s: -refund } });
      Audio2.build(); pending = null; UI.buildConfirm(null); return true;
    }
    const ok = Base.canPlaceOpening(ed.t, ed.i, ed.j, type);
    if (!ok.ok) { deny(ok.why); return false; }
    const cost = { s: type === 'door' ? 8 : 6 };
    const af = afford(cost); if (af) { deny(af); return false; }
    pay(cost);
    undo.push({ type: 'edge', ed, prev: cur === 'wall' ? null : cur, now: type, cost });
    Base.setOpening(ed.t, ed.i, ed.j, type);
    Audio2.build(); pending = null; UI.buildConfirm(null);
    return true;
  }
  function paintAt(h) {
    const rid = Base.roomAt(h.i, h.j);
    if (!rid) { deny('Tap a room to tint it.'); return; }
    const r = Base.rooms.get(rid);
    if (r.rust > 0.5) {
      if (G.res.scrap < 10) { deny('Cleaning a rusty room costs 10 scrap.'); return; }
      G.res.scrap -= 10; Base.setRoomStyle(rid, 1, 0.1);
      UI.toast('Rust scraped off and repainted');
    } else {
      let st = (r.style + 1) % ROOM_STYLES.length; if (st === 0) st = 1;
      Base.setRoomStyle(rid, st);
      UI.toast('Room colour: ' + ROOM_STYLES[st].name);
    }
    S.style = Base.rooms.get(rid).style;
    Base.markDirty(); Audio2.ui();
  }
  function demolishTarget(h) {
    if (S.level) {
      const uid = Base.objUpAt(h.i, h.j);
      if (uid) return { kind: 'obj', o: Base.objs.get(uid) };
      const rid = Base.roomAt(h.i, h.j);
      if (rid && Base.upAt(h.i, h.j)) return { kind: 'upper', rid };
      return null;
    }
    if (h.edge && Base.isWall(h.edge.t, h.edge.i, h.edge.j)) return { kind: 'walls', edges: [[h.edge.t, h.edge.i, h.edge.j]] };
    const oid = Base.objAt(h.i, h.j);
    if (oid) return { kind: 'obj', o: Base.objs.get(oid) };
    return null;
  }
  function demolishAt(h) {
    const tg = demolishTarget(h);
    if (!tg) return;
    doDemolish(tg);
  }
  function doDemolish(tg) {
    if (tg.kind === 'upper') {
      for (const o of Base.objs.values()) if (Base.roomAt(o.i, o.j) === tg.rid && (o.lv || o.type === 'sisetrepp')) { deny('Remove the stairs and the upstairs items first.'); return; }
      const ref = half(upperCost(tg.rid)); pay(ref, -1);
      Base.setUpper(tg.rid, false);
      UI.toast('Second floor removed. Refund: ' + costStr(ref));
      Audio2.build(); pending = null; UI.buildConfirm(null); undo.length = 0; return;
    }
    if (tg.kind === 'obj') {
      const o = tg.o;
      if (OBJ[o.type].fixed) { deny(OBJ[o.type].name + ' is part of the main building and stays.'); return; }
      const ref = half(OBJ[o.type].cost);
      pay(ref, -1);
      Base.removeObj(o.id);
      UI.toast(OBJ[o.type].name + ' demolished. Refund: ' + costStr(ref));
    } else {
      const res = Base.removeWalls(tg.edges, true);
      if (!res.ok) { deny(res.why); return; }
      const ref = { s: res.removed.length * 1, c: 0, k: 0 };
      for (const o of res.lost || []) { const h2 = half(OBJ[o.type].cost || {}); ref.s += h2.s; ref.c += h2.c; ref.k += h2.k; }
      pay(ref, -1);
      UI.toast(res.removed.length + ' wall segments demolished' + ((res.lost || []).length ? ', ' + res.lost.length + ' items were left outside and dismantled' : '') + '. Refund: ' + costStr(ref));
      Base.updatePower(!Econ.isNight());
    }
    Audio2.build(); pending = null; UI.buildConfirm(null);
    undo.length = 0;
    Crew.assignBeds();
  }
  function doUndo() {
    const u = undo.pop();
    if (!u) { UI.toast('Nothing to undo'); return; }
    if (u.type === 'walls') { const r = Base.removeWalls(u.edges, true); if (!r.ok) { deny(r.why); undo.push(u); return; } pay(u.cost, -1); for (const o of r.lost || []) pay(OBJ[o.type].cost, -1); }
    else if (u.type === 'obj') { Base.removeObj(u.id); pay(u.cost, -1); }
    else if (u.type === 'edge') { Base.setOpening(u.ed.t, u.ed.i, u.ed.j, u.prev); pay(u.cost, -1); }
    else if (u.type === 'upper') { for (const o of Base.objs.values()) if (Base.roomAt(o.i, o.j) === u.rid && (o.lv || o.type === 'sisetrepp')) { deny('Remove the stairs and the upstairs items first.'); undo.push(u); return; } Base.setUpper(u.rid, false); pay(u.cost, -1); }
    Audio2.ui(); UI.toast('Undone');
    Crew.assignBeds();
  }
  function deny(why) { Audio2.deny(); UI.buildInfo(why, 'bad'); UI.toast(why); }
  function commitPending() {
    if (!pending) return;
    if (pending.kind === 'walls') commitWalls(pending.edges);
    else if (pending.kind === 'obj') commitObj(pending.type, pending.i, pending.j, pending.rot, pending.lv || 0);
    else if (pending.kind === 'upper') commitUpper(pending.rid);
    else if (pending.kind === 'edge') commitEdge(pending.e, pending.type);
    else if (pending.kind === 'demolish') doDemolish(pending.tg);
  }
  function cancelPending() { pending = null; UI.buildConfirm(null); if (S.tool === 'obj') { S.item = null; UI.buildTools(S); } info(); }
  function showPendingConfirm() {
    if (!pending) { UI.buildConfirm(null); return; }
    let label = 'Build', ok = true, cost = '';
    if (pending.kind === 'walls') { const wi = wallInfo(pending.edges); cost = costStr(wi.cost); ok = wi.n > 0 && !afford(wi.cost); label = 'Build wall'; }
    else if (pending.kind === 'obj') { cost = costStr(OBJ[pending.type].cost); ok = Base.canPlaceObj(pending.type, pending.i, pending.j, pending.rot, pending.lv || 0).ok && !afford(OBJ[pending.type].cost); label = 'Place'; }
    else if (pending.kind === 'upper') { const c = upperCost(pending.rid); cost = costStr(c); ok = !afford(c) && !Base.roomHasUpper(pending.rid); label = '2nd floor'; }
    else if (pending.kind === 'edge') { const cur = Base.edgeType(pending.e.t, pending.e.i, pending.e.j); if (cur === pending.type) { label = 'Remove'; cost = '+' + (pending.type === 'door' ? 4 : 3) + ' scrap'; } else { cost = (pending.type === 'door' ? 8 : 6) + ' scrap'; ok = Base.canPlaceOpening(pending.e.t, pending.e.i, pending.e.j, pending.type).ok; } }
    else if (pending.kind === 'demolish') { label = 'Demolish'; cost = pending.tg.kind === 'obj' ? OBJ[pending.tg.o.type].name : pending.tg.kind === 'upper' ? 'Second floor' : pending.tg.edges.length + ' wall segments'; }
    UI.buildConfirm({ label, cost, ok, canRotate: pending.kind === 'obj' });
  }

  // ---------- info ----------
  function info() {
    let txt = '', cls = '';
    const hints = {
      look: Input.isTouch ? 'Drag with one finger to move the camera. Use two fingers to zoom and rotate.' : 'WASD moves, Q/E rotates, the wheel zooms.',
      wall: 'Drag walls from corner to corner. When the walls fully enclose an area, a room and a door appear. A wall segment costs 3 scrap.',
      door: 'Tap the wall where you want a door. Tap again to remove it.',
      window: 'Tap the outer wall where you want a window.',
      obj: S.item ? '' : 'Pick an item from the catalogue.',
      paint: 'Tap a room to change its colour. Cleaning a rusty room costs 10 scrap.',
      demolish: S.level ? 'Tap an upstairs item, or an empty upper floor to remove it.' : 'Tap an item or a wall. Drag to demolish a whole wall line. You get part of the cost back.',
      upper: 'Tap a room to build a second floor on it (6 scrap per tile). Then add Indoor stairs and switch to Floor 2 to furnish it.',
    };
    txt = hints[S.tool] || '';
    if (S.tool === 'wall' && (drag || (pending && pending.kind === 'walls'))) {
      const edges = drag ? Base.lineEdges(drag.vi, drag.vj, drag.wi, drag.wj) : pending.edges;
      const wi = wallInfo(edges), af = afford(wi.cost);
      txt = 'Wall ' + edges.length * Base.CS + ' m · ' + (wi.n ? costStr(wi.cost) : 'already there') + (wi.bad ? ' · ' + wi.bad : '') + (af ? ' · ' + af : '');
      cls = wi.n && !af ? 'good' : 'bad';
    }
    if (S.tool === 'obj' && S.item) {
      const d = OBJ[S.item];
      const t = pending && pending.kind === 'obj' ? pending : hover ? { i: hover.oi, j: hover.oj, rot: hover.rot } : null;
      txt = d.name + ' · ' + costStr(d.cost) + (d.power > 0 ? ' · uses ' + d.power + ' ⚡' : d.power < 0 ? ' · gives ' + -d.power + ' ⚡' : '');
      if (t) { const ok = Base.canPlaceObj(S.item, t.i, t.j, t.rot, S.level); const af = afford(d.cost); if (!ok.ok) { txt += ' · ' + ok.why; cls = 'bad'; } else if (af) { txt += ' · ' + af; cls = 'bad'; } else cls = 'good'; }
    }
    UI.buildInfo(txt, cls);
    if (pending && Input.isTouch) showPendingConfirm();
  }

  // ---------- joonistamine ----------
  function draw() {
    if (G.mode !== 'build') return;
    const LY = S.level ? Base.WH : 0;
    M4.compose(tmpM, 0, Base.FLOOR_Y + 0.03 + LY, 0, 0);
    GFX.draw(gridMesh, tmpM, [1, 1, 1, 0], null, { alpha: 0.13, shadow: false });
    if (S.level) for (const r of Base.rooms.values()) if (Base.roomHasUpper(r.id)) for (const [i, j] of r.cells) { const c = Base.cellCenter(i, j); const m = M4.compose(M4.create(), c.x, LY + 0.13, c.z, 0, 0, 0, Base.CS - 0.14, 0.03, Base.CS - 0.14); GFX.draw(boxMesh, m, BLUE, null, { alpha: 0.12, shadow: false }); }
    const box = (x, y, z, sx, sy, sz, tint, a) => { const m = M4.compose(M4.create(), x, y + LY, z, 0, 0, 0, sx, sy, sz); GFX.draw(boxMesh, m, tint, null, { alpha: a, shadow: false }); };
    const rectBox = (r, tint) => {
      const x0 = Base.X0 + r.i0 * Base.CS, x1 = Base.X0 + (r.i1 + 1) * Base.CS, z0 = Base.Z0 + r.j0 * Base.CS, z1 = Base.Z0 + (r.j1 + 1) * Base.CS;
      box((x0 + x1) / 2, 0.16, (z0 + z1) / 2, x1 - x0, 0.1, z1 - z0, tint, 0.35);
      box((x0 + x1) / 2, 0.6, z0, x1 - x0, 1.0, 0.18, tint, 0.45); box((x0 + x1) / 2, 0.6, z1, x1 - x0, 1.0, 0.18, tint, 0.45);
      box(x0, 0.6, (z0 + z1) / 2, 0.18, 1.0, z1 - z0, tint, 0.45); box(x1, 0.6, (z0 + z1) / 2, 0.18, 1.0, z1 - z0, tint, 0.45);
    };
    const cellsBox = (r, tint) => { for (const [i, j] of r.cells) { const c = Base.cellCenter(i, j); box(c.x, 0.16, c.z, Base.CS - 0.08, 0.1, Base.CS - 0.08, tint, 0.35); } };
    const vertexBox = (vi, vj, tint) => box(Base.X0 + vi * Base.CS, 0.5, Base.Z0 + vj * Base.CS, 0.4, 1.0, 0.4, tint, 0.8);
    if (S.tool === 'wall') {
      const edges = drag ? Base.lineEdges(drag.vi, drag.vj, drag.wi, drag.wj) : pending && pending.kind === 'walls' ? pending.edges : null;
      if (edges && edges.length) {
        const af = !!afford(wallInfo(edges).cost);
        for (const [t, i, j] of edges) edgeBox({ t, i, j }, Base.isWall(t, i, j) ? BLUE : (!Base.canPlaceWall(t, i, j).ok || af) ? RED : GREEN);
      }
      if (drag) { vertexBox(drag.vi, drag.vj, YEL); vertexBox(drag.wi, drag.wj, YEL); }
      else if (hover) vertexBox(hover.vi, hover.vj, YEL);
    }
    if (S.tool === 'demolish' && drag && (drag.wi !== drag.vi || drag.wj !== drag.vj)) {
      for (const [t, i, j] of Base.lineEdges(drag.vi, drag.vj, drag.wi, drag.wj)) if (Base.isWall(t, i, j)) edgeBox({ t, i, j }, RED);
    }
    if (S.tool === 'obj' && S.item) {
      const t = pending && pending.kind === 'obj' ? pending : hover ? { type: S.item, i: hover.oi, j: hover.oj, rot: hover.rot } : null;
      if (t) {
        const [w, h] = Base.footprint(S.item, t.rot);
        const ok = Base.canPlaceObj(S.item, t.i, t.j, t.rot, S.level).ok && !afford(OBJ[S.item].cost);
        const cx = Base.X0 + (t.i + w / 2) * Base.CS, cz = Base.Z0 + (t.j + h / 2) * Base.CS;
        const fy = (Base.roomAt(t.i, t.j) ? Base.FLOOR_Y : 0) + LY;
        M4.compose(tmpM2, cx, fy, cz, t.rot * Math.PI / 2, 0, 0, 1, OBJ[S.item].sy || 1, 1);
        const mesh = MODELS.obj[S.item];
        if (mesh) GFX.draw(mesh, tmpM2, ok ? [0.7, 1.3, 0.8, 0.2] : [1.4, 0.5, 0.45, 0.2], null, { alpha: 0.7, shadow: false });
        else if (S.item === 'sisetrepp') {   // trepi eelvaade: astmeline kiil
          const yw = t.rot * Math.PI / 2, sx = Math.sin(yw), sz = Math.cos(yw);
          for (let k = 0; k < 6; k++) { const off = Base.CS - (k + 0.5) * (2 * Base.CS / 6), hh = (k + 1) / 6 * Base.WH; const m = M4.compose(M4.create(), cx + sx * off, fy + hh / 2, cz + sz * off, yw, 0, 0, 1.6, hh, 2 * Base.CS / 6); GFX.draw(boxMesh, m, ok ? GREEN : RED, null, { alpha: 0.45, shadow: false }); }
        }
        box(cx, 0.14, cz, w * Base.CS - 0.1, 0.06, h * Base.CS - 0.1, ok ? GREEN : RED, 0.4);
        // esikülje nool
        const fx = Math.sin(t.rot * Math.PI / 2), fz = Math.cos(t.rot * Math.PI / 2);
        const ext = (t.rot % 2 ? w : h) * Base.CS / 2 + 0.3;
        box(cx + fx * ext, 0.16, cz + fz * ext, 0.35, 0.06, 0.35, YEL, 0.7);
      }
    }
    if ((S.tool === 'door' || S.tool === 'window') && hover && hover.edge) {
      const e2 = pending && pending.kind === 'edge' ? pending.e : hover.edge;
      edgeBox(e2, Base.isWall(e2.t, e2.i, e2.j) ? (S.tool === 'door' ? YEL : BLUE) : RED);
    } else if (pending && pending.kind === 'edge') edgeBox(pending.e, YEL);
    if ((S.tool === 'paint' || S.tool === 'demolish' || S.tool === 'upper') && (hover || pending)) {
      const tg = pending && pending.kind === 'demolish' ? pending.tg : S.tool === 'demolish' && hover && !drag ? demolishTarget(hover) : null;
      if (tg && tg.kind === 'obj') { const o = tg.o; box(o.cx, 0.7, o.cz, o.w * Base.CS, 1.4, o.h * Base.CS, RED, 0.35); }
      else if (tg && tg.kind === 'upper') cellsBox(Base.rooms.get(tg.rid), RED);
      else if (tg && tg.kind === 'walls') { for (const [t, i, j] of tg.edges) edgeBox({ t, i, j }, RED); }
      else if ((S.tool === 'paint' || S.tool === 'upper') && hover) { const rid = Base.roomAt(hover.i, hover.j); if (rid) cellsBox(Base.rooms.get(rid), YEL); }
    }
    // toad, mida ei saa liigutada: peahoone silt
  }
  function edgeBox(ed, tint) {
    const box = (x, y, z, sx, sy, sz) => { const m = M4.compose(M4.create(), x, y, z, 0, 0, 0, sx, sy, sz); GFX.draw(boxMesh, m, tint, null, { alpha: 0.6, shadow: false }); };
    if (ed.t === 'v') box(Base.X0 + ed.i * Base.CS, 0.7, Base.Z0 + (ed.j + 0.5) * Base.CS, 0.35, 1.4, Base.CS);
    else box(Base.X0 + (ed.i + 0.5) * Base.CS, 0.7, Base.Z0 + ed.j * Base.CS, Base.CS, 1.4, 0.35);
  }
  function init(canvas) {
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
  }
  return { S, cam, init, enter, exit, update, draw, setTool, selectItem, rotate, doUndo, commitPending, cancelPending, costStr, afford, rotateCam: (d) => { cam.yaw += d; }, setLevel, get pending() { return pending; } };
})();
