// ============================================================
//  SALVESTUS
// ============================================================
const Save = (() => {
  const KEY = 'roostes-lootus-v1';
  function data() {
    return {
      v: 1, seed: G.seed, diff: G.diff, time: G.time, res: G.res, carry: G.carry, debt: G.debt, up: G.up, scan: G.scan,
      flags: Object.assign({}, G.flags, { music: false }), stats: G.stats, market: G.market, candidates: G.candidates,
      player: { x: Player.pos.x, z: Player.pos.z, yaw: Player.yaw, hp: Player.hp },
      base: Base.serialize(), crew: Crew.serialize(), rivals: Rivals.serialize(), boss: Boss.serialize(), comets: Comets.serialize(),
      wrecks: World.wrecks.map((w) => [w.scrap, w.known ? 1 : 0]), obj: Objectives.serialize(), log: G.log.slice(-25), waypoint: UI.waypoint,
      pickups: Ents.pickups.filter((p) => !p.gone).map((p) => ({ kind: p.kind, x: p.x, z: p.z, data: p.data })),
      look: Look.clean(G.look), pname: G.pname, inv: Inv.serialize(), pmag: Player.mag,
    };
  }
  function save() {
    if (G.mode !== 'play' && G.mode !== 'build') return false;
    if (typeof Net !== 'undefined' && Net.role === 'guest') return false;   // külaline ei kirjuta oma salvestust üle
    try { localStorage.setItem(KEY, JSON.stringify(data())); return true; } catch (e) { return false; }
  }
  function load() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function has() { return !!load(); }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignoreeri */ } }
  function auto() { save(); }
  return { data, save, load, has, clear, auto };
})();

// ============================================================
//  MÄNG: käivitus, tsükkel, režiimid
// ============================================================
const Game = (() => {
  let canvas = null, last = 0, qKey = 'mid', powerT = 0, objT = 0, titleT = 0, fpsAcc = 0, fpsN = 0;
  const Q = {
    low: { maxScale: 1, cap: 560, shadows: false, size: 1024, range: 50, terrainShadow: false, fx: 0.5, post: false, msaa: 0 },
    mid: { maxScale: 1.5, cap: 760, shadows: true, size: 1024, range: 50, terrainShadow: false, fx: 0.8, post: true, msaa: 2 },
    high: { maxScale: 2, cap: 1300, shadows: true, size: 2048, range: 72, terrainShadow: true, fx: 1, post: true, msaa: 4 },
  };
  function quality() { return qKey; }
  function setQuality(k) {
    qKey = k; Input.settings.quality = k; Input.saveSettings();
    applyGfx();
  }
  // graafikataseme vaikeväärtused + kasutaja täpsemad seaded (eraldusvõime, nähtavus, varjud, efektid, järeltöötlus)
  function applyGfx() {
    const q = Q[qKey], g = Input.settings.gfx || {};
    const sh = g.shadows == null ? (q.shadows ? (q.size >= 2048 ? 'high' : 'mid') : 'off') : g.shadows;
    GFX.S.shadowsOn = sh !== 'off'; GFX.S.shadowRange = sh === 'high' ? 72 : 50;
    const post = g.post == null ? q.post : g.post;
    GFX.setupPost(post, post ? q.msaa || 2 : 0);
    const ss = sh === 'high' ? 2048 : 1024;
    if (sh !== 'off' && GFX.S.shadowSize !== ss) GFX.setShadowSize(ss);
    GFX.setTerrain(null, false); World.setTerrainShadow(sh === 'high');
    FX.setQuality(g.fx == null ? q.fx : g.fx);
    GFX.S.viewMul = (g.view || 1000) / 1000;
    resize();
  }
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const q = Q[qKey], g = Input.settings.gfx || {};
    let s = Math.min(window.devicePixelRatio || 1, q.maxScale);
    const short = Math.min(w, h);
    if (short * s > q.cap) s = q.cap / short;
    if (g.res) s = g.res * (window.devicePixelRatio || 1);
    GFX.resize(w, h, s);
    const portrait = Input.isTouch && h > w * 1.15 && G.mode === 'play';
    UI.rotHint(portrait);
    if (portrait) setTimeout(() => UI.rotHint(false), 6000);
  }

  function boot(hotData) {
    try { const vt = document.getElementById('verTag'); if (vt) vt.textContent = 'K73 ' + (typeof K73_VERSION !== 'undefined' ? K73_VERSION : ''); } catch (e) { /* */ }
    canvas = document.getElementById('gl');
    let ok = false;
    let initErr = '';
    try { ok = GFX.init(canvas, { antialias: true, preserve: !!window.__TEST }); } catch (e) { console.error(e); ok = false; initErr = String(e && e.message || e).slice(0, 300); }
    if (!ok) { const L = document.getElementById('loading'); L.style.cssText += ';font-size:14px;letter-spacing:0;padding:20px;text-align:center'; L.textContent = initErr ? 'Graphics failed to start: ' + initErr : 'This device doesn\'t support WebGL2 graphics. Try a newer browser.'; return; }
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); document.getElementById('loading').hidden = false; document.getElementById('loading').textContent = 'Graphics reset. Reload the page.'; });
    buildModels();
    Chars.init();
    Input.init(canvas);
    Build.init(canvas);
    Audio2.setVolume(Input.settings.vol);
    qKey = Input.settings.quality || (Input.isTouch ? 'mid' : 'high');
    G.seed = 4242;
    World.generate(G.seed);
    setQuality(qKey);
    UI.init();
    Base.setupStart();
    Base.rebuildNow();
    G.time.t = 0.555; G.time.day = 1;
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 200));
    document.addEventListener('visibilitychange', () => { if (document.hidden && (G.mode === 'play')) { Save.auto(); } });
    // avaekraan
    G.mode = 'title';
    UI.showTitle(Save.has());
    document.getElementById('loading').hidden = true;
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) {
      try { window.claude.hot.snapshot(() => (G.mode === 'play' || G.mode === 'build' ? { save: Save.data() } : {})); } catch (e) { /* ignoreeri */ }
    }
    if (hotData && hotData.save) { try { continueGame(hotData.save); } catch (e) { console.error(e); } }
    last = performance.now();
    requestAnimationFrame(loop);
  }

  function resetState() {
    G.time = { day: 1, t: 0.03, total: 0 };
    G.res = { cr: 150, scrap: 40, kris: 0, lihv: 0, meat: 0, food: 6 };
    G.carry = { kris: 0, scrap: 0, meat: 0, stones: 0 };
    G.dk = DIFFS[G.diff] || DIFFS.tavaline;
    G.debt = { left: Math.round(30000 * G.dk.debt), nextDay: 4, amount: 0, idx: 0, grace: false, warned: false };
    G.debt.amount = Econ.debtAmount(0);
    G.up = { rifle: 1, rail: false, armor: 0 };
    G.scan = { p: 0, found: false };
    G.flags = {};
    G.stats = { kills: 0, crystals: 0, deaths: 0, meat: 0, comets: 0 };
    G.market = { price: 38 };
    G.candidates = [];
    G.log = [];
    G.paused = false;
    UI.waypoint = null;
  }
  function setupWorld(seed) {
    G.seed = seed;
    World.generate(seed);
    GFX.setTerrain(null, false); World.setTerrainShadow(Q[qKey].terrainShadow);
    UI.buildMapCanvas();
    Ents.clear(); Herds.clear(); Comets.reset(); Rivals.reset(); Objectives.reset();
    Ents.list.push(Player);
  }
  function newGame() {
    if (typeof Waves !== 'undefined') Waves.reset();
    resetState();
    G.dk = DIFFS[G.diff];
    setupWorld(Math.floor(Math.random() * 1e6) + 7);
    Base.setupStart();
    Base.rebuildNow();
    Spawner.init();
    Rivals.init(false);
    Boss.spawn();
    Econ.genCandidates();
    Inv.startKit();
    Player.reset(-1, 1.5, Math.PI); Player.fillMags();
    Player.yaw = Math.PI;
    startPlay();
    UI.banner('Day 1', 'Mining station K-7 is yours. Bring it back to life.');
    UI.msg('The main building is dark and rusty. The generator is broken, but there are 40 scrap in storage.', 'warn');
    setTimeout(() => { if (G.mode === 'play') UI.msg('Bank: first debt payment ' + fmtInt(G.debt.amount) + ' ₵ is due on the morning of day 4.', 'money'); }, 6000);
    Objectives.check();
    Save.save();
  }
  function continueGame(d) {
    d = d || Save.load();
    if (!d) { newGame(); return; }
    resetState();
    G.diff = d.diff || 'tavaline'; G.dk = DIFFS[G.diff];
    setupWorld(d.seed);
    Object.assign(G.time, d.time); Object.assign(G.res, d.res); Object.assign(G.carry, d.carry); Object.assign(G.debt, d.debt);
    Object.assign(G.up, d.up); Object.assign(G.scan, d.scan); G.flags = d.flags || {}; Object.assign(G.stats, d.stats); Object.assign(G.market, d.market);
    G.candidates = d.candidates || []; G.log = d.log || [];
    if (d.look) G.look = d.look; if (d.pname) G.pname = d.pname;
    Inv.deserialize(d.inv, d.carry);
    UI.waypoint = d.waypoint || null;
    Base.deserialize(d.base);
    Base.rebuildNow();
    (d.wrecks || []).forEach((w, i) => { if (World.wrecks[i]) { World.wrecks[i].scrap = Array.isArray(w) ? w[0] : w; World.wrecks[i].known = Array.isArray(w) ? !!w[1] : false; } });
    Spawner.init();
    Rivals.deserialize(d.rivals);
    Rivals.init(true);
    Boss.spawn(d.boss);
    Comets.deserialize(d.comets || {});
    Crew.deserialize(d.crew);
    for (const p of d.pickups || []) Ents.pickups.push({ kind: p.kind, x: p.x, y: Ents.groundY(p.x, p.z), z: p.z, data: p.data });
    Objectives.deserialize(d.obj);
    Player.reset(d.player.x, d.player.z, d.player.yaw);
    Player.hp = d.player.hp || Player.maxHp;
    if (d.pmag) Object.assign(Player.mag, d.pmag); else Player.fillMags();
    startPlay();
    UI.banner('Day ' + G.time.day, Econ.dayLine());
    Objectives.check();
  }
  function startPlay() {
    UI.hideTitle();
    document.getElementById('end').hidden = true;
    G.mode = 'play';
    UI.showHUD(true);
    UI.updateObjective();
    Base.updatePower(true);
    resize();
    if (GFX.S.skinErr) UI.msg('Character graphics didn\'t start (' + GFX.S.skinErr + '). Using simple models.', 'warn');
    if (!Input.isTouch) UI.lockHint(true);
  }
  function toTitle() {
    G.mode = 'title';
    Input.exitLock();
    Audio2.setMusic(false);
    UI.showTitle(Save.has());
    G.time.t = 0.555;
  }
  function toggleBuild() {
    if (G.mode === 'play' && !Player.dead) { UI.closePanel(); Build.enter(); }
    else if (G.mode === 'build') Build.exit();
  }
  function over(kind, r) {
    if (G.mode === 'over') return;
    G.mode = 'over';
    Input.exitLock();
    Save.clear();
    const texts = {
      pankrot: 'The bank didn\'t wait. The creditors took station K-7 and everything in it. Your family\'s debt stays in the dark.',
      rival: (r ? r.name : 'Rival') + ' reached the Stoneheart before you. The heartstones left the planet on their ship and your debt remains.',
    };
    UI.end(kind, texts[kind] || '', endStats());
  }
  function endStats() { return { day: G.time.day, crystals: G.stats.crystals, comets: G.stats.comets, crew: Crew.count(), debt: G.debt.left }; }
  function stonesHome() {
    UI.banner('The heartstones are home', 'Open the terminal and sell them', 'good');
    UI.msg('The heartstones glow in storage. The bank at the terminal is waiting.', 'good');
    Objectives.check();
    setTimeout(() => {
      if (G.mode !== 'play') return;
      const term = Base.objsOfType('terminal')[0];
      if (G.flags.term && term && !term.broken && Base.power.lightsOn) { if (!UI.isPanelOpen()) UI.openTerminal('pank'); }
      else { UI.msg('An orbital buyer made contact by radio and came for the stones in person.', 'good'); setTimeout(() => victory(), 2500); }
    }, 2200);
  }
  function victory(byInstallments) {
    if (G.mode === 'over') return;
    UI.closePanel();
    G.mode = 'over';
    Input.exitLock();
    Save.clear();
    Audio2.cash();
    if (byInstallments) {
      UI.end('win', 'The last instalment went to the bank. Without the Stoneheart, with nothing but comet diamonds, sweat and a rusty station. Back on the home world the lights come on again in your family\'s windows.', endStats());
      return;
    }
    const value = Math.round(34000 * G.dk.debt);
    const rest = value - G.debt.left;
    G.debt.left = 0;
    UI.end('win', 'The ' + fmtInt(value) + ' ₵ from the heartstones paid off the debt to the last cent' + (rest > 0 ? ' and ' + fmtInt(rest) + ' ₵ was left over' : '') + '. Back on the home world the lights come on again in your family\'s windows. Rusty station K-7 stays yours.', endStats());
  }

  // ---------- tsükkel ----------
  function handleKeys() {
    const P = (c) => Input.wasPressed(c);
    if (UI.isPanelOpen()) { if (P('Escape') || ((P('KeyI') || P('Tab')) && UI.panelKind === 'inv')) UI.closePanel(); return; }
    if (G.mode === 'play') {
      if (Net.active && (P('Enter') || P('KeyY'))) Net.openChat();
      else if (P('KeyI') || P('Tab')) UI.openInv();
      else if (P('KeyH')) Inv.use('medkit');
      else if (P('KeyG')) Inv.use('grenade');
      else if (P('KeyB')) toggleBuild();
      else if (P('KeyT')) UI.openTerminal();
      else if (P('KeyC')) UI.openCrew();
      else if (P('KeyV')) Crew.followNear(18);
      else if (P('KeyM')) UI.openMap();
      else if (P('Escape') || P('KeyP')) UI.openMenu();
    } else if (G.mode === 'build') {
      if (P('Escape') || P('KeyB')) Build.exit();
    }
  }
  const humans = [];
  function simulate(dt) {
    Econ.update(dt);
    if (G.mode !== 'play' && !(G.mode === 'build' && Net.isHost())) return;   // co-op: maailm jookseb edasi ka ehitamise ajal
    Weather.update(dt);
    powerT -= dt;
    if (powerT <= 0) { powerT = 0.5; Base.updatePower(!Econ.isNight()); }
    humans.length = 0;
    for (const e of Ents.list) if (e.alive && (e.kind === 'human' || e.kind === 'player')) humans.push(e);
    Base.update(dt, humans);
    Rivals.updateBases(dt, humans);
    Herds.update(dt);
    Ents.update(dt);
    Crew.update(dt);
    Waves.update(dt);
    Rivals.update(dt);
    Comets.update(dt);
    Boss.updateScanner(dt);
    objT -= dt; if (objT <= 0) { objT = 1; Objectives.check(); }
    const nearBase = Math.hypot(Player.pos.x, Player.pos.z) < 30;
    Audio2.setHum(Base.power.supply > 0 && nearBase ? 1 - Math.hypot(Player.pos.x, Player.pos.z) / 30 : 0);
    // stalkerid hommikul tagasi liiva
    if (!Econ.isNight()) for (const e of Ents.list) if (e.kind === 'stalker' && e.alive && e.state !== 'buried' && !e.target && !(e.lure && e.lure.t > 0) && Math.random() < dt * 0.1) e.state = 'buried';
  }
  function cameraPlay() {
    const C = GFX.cam;
    const e = Player.eye();
    const sh = UI.getShake();
    C.useTarget = false;
    C.pos.x = e.x + (Math.random() - 0.5) * sh * 0.25; C.pos.y = e.y + (Math.random() - 0.5) * sh * 0.25; C.pos.z = e.z + (Math.random() - 0.5) * sh * 0.25;
    if (Player.dead) { C.pos.y = Player.pos.y + 0.5 + Math.min(1, Player.deadT) * 0.2; }
    C.yaw = Player.yaw; C.pitch = Player.pitch + (Player.dead ? -0.4 : 0);
    const aspect = GFX.S.w / GFX.S.h;
    const hf = ((Input.settings.gfx && Input.settings.gfx.fov) || 88) / 2;
    let vf = 2 * Math.atan(Math.tan(hf * DEG) / aspect);
    vf = clamp(vf, 36 * DEG, 100 * DEG);
    vf *= 1 - (Player.weapon === 'sniper' ? 0.82 : Player.weapon === 'rail' ? 0.62 : 0.5) * (Player.adsT || 0);
    { const cr = document.getElementById('cross'); if (cr) cr.style.opacity = String(1 - Math.min(1, (Player.adsT || 0) * 1.6)); }
    C.fov = vf;
    GFX.S.vmFov = (aspect < 1 ? 64 : 56) * DEG;
    C.far = Math.max(450, 1400 * (GFX.S.viewMul || 1)); C.near = 0.08;
  }
  function cameraTitle(dt) {
    titleT += dt;
    const C = GFX.cam;
    // madal kinokaamera, päike taustal, aeglane triiv
    const a = Math.sin(titleT * 0.045) * 0.12;
    C.useTarget = true;
    C.pos.x = 11 + Math.sin(a) * 6; C.pos.z = 15 + Math.cos(a) * 2; C.pos.y = 1.35 + Math.sin(titleT * 0.11) * 0.15;
    C.target.x = -6; C.target.y = 2.9; C.target.z = -3;
    const aspect = GFX.S.w / GFX.S.h;
    C.fov = clamp(2 * Math.atan(Math.tan(40 * DEG) / aspect), 45 * DEG, 80 * DEG);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - last) / 1000; last = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);
    const inp = Input.frame(dt);
    Player.zoom = inp.zoom;
    if (G.mode === 'play' || G.mode === 'build') handleKeys();
    if (Net.role === 'guest' && (G.mode === 'play' || G.mode === 'build')) {
      // co-op külaline: maailm tuleb peremehelt, kohapeal ainult oma tegelane
      if (G.mode === 'play' && !G.paused) Player.update(dt, inp);
      else if (G.mode === 'build' && !G.paused) Build.update(dt);
      Net.guestSim(dt);
    } else if (G.mode === 'play' && (!G.paused || Net.isHost())) {
      if (!G.paused) Player.update(dt, inp);
      simulate(dt);
    } else if (G.mode === 'build' && (!G.paused || Net.isHost())) {
      if (!G.paused) Build.update(dt);
      if (Net.isHost()) simulate(dt); else Base.update(dt * 0, []);
    } else if (G.mode === 'title' || G.mode === 'over') {
      G.time.t = (G.time.t + dt / 1500) % 1;
      if (G.mode === 'title' && (G.time.t > 0.585 || G.time.t < 0.55)) G.time.t = 0.555;
      Base.update(dt, []);
    }
    Net.update(dt);
    if (!G.paused || Net.active) { GFX.partAdd.update(dt); GFX.partAlpha.update(dt); Audio2.update(dt); FX.update(dt); }
    render(dt);
    Input.endFrame();
    // kaadrisageduse näidik
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 0.5) { const el = document.getElementById('fpsBox'), on = Input.settings.gfx && Input.settings.gfx.fps; if (el) { el.hidden = !on; if (on) el.textContent = Math.round(fpsN / fpsAcc) + ' FPS · ' + GFX.S.w + '×' + GFX.S.h + ' · ' + Math.round((GFX.S.tris || 0) / 1000) + 'k tri'; } fpsAcc = 0; fpsN = 0; }
  }
  function render(dt) {
    Econ.updateEnv();
    if (G.mode === 'play') cameraPlay();
    else if (G.mode === 'title' || G.mode === 'over') cameraTitle(dt);
    GFX.updateCamera();
    const sc = G.mode === 'build' ? { x: Build.cam.tx, y: 0, z: Build.cam.tz } : G.mode === 'play' ? { x: Player.pos.x + Math.sin(Player.yaw) * 18, y: Player.pos.y, z: Player.pos.z + Math.cos(Player.yaw) * 18 } : { x: 2, y: 0, z: 0 };
    GFX.beginShadowCenter(sc.x, sc.z);
    World.draw();
    if (G.mode === 'title') { Base.power.lightsOn = true; GFX.addLight(-1, 2.6, 6.2, 9, 1, 0.75, 0.45, 2.2); }
    Base.draw(G.mode === 'build', GFX.env.night > 0.5 || G.mode === 'title', G.time.total);
    if (G.mode !== 'title') { Rivals.drawBases(GFX.env.night > 0.5, G.time.total); Ents.draw(); Net.drawExtra(); Crew.torchLights(); Comets.draw(); Rivals.draw(); } else Ents.drawTitleFigure();
    Build.draw();
    if (G.mode === 'play') Player.drawViewmodel(dt);
    GFX.render(sc);
    UI.update(dt);
  }
  // testimiseks: simuleeri ilma joonistamata
  const idle = { moveX: 0, moveY: 0, moveMag: 0, lookX: 0, lookY: 0, fire: false, jump: false, reload: false, swap: false, act: false, actHeld: false, sprint: false, assist: false };
  function debugTick(dt, steps, inp) {
    for (let i = 0; i < steps; i++) {
      if (G.mode === 'play' && !G.paused) { Player.update(dt, Object.assign({}, idle, inp || {})); simulate(dt); GFX.partAdd.update(dt); GFX.partAlpha.update(dt); }
    }
  }
  return { boot, newGame, continueGame, toTitle, toggleBuild, over, victory, stonesHome, quality, setQuality, applyGfx, resize, debugTick, get pixels() { return [GFX.S.w, GFX.S.h]; } };
})();
