// ============================================================
//  SISEND: klaviatuur, hiir, puutetugi
// ============================================================
const Input = (() => {
  const keys = new Set();
  const pressed = new Set();
  let mdx = 0, mdy = 0, lmb = false, rmb = false, locked = false, lockFailed = false;
  let canvas = null;
  const isTouch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  // gfx: kasutaja graafikaseaded; null = võta graafikataseme vaikeväärtus
  const settings = { sens: 1.0, invert: false, vol: 0.8, quality: null, gfx: { res: null, view: 1000, shadows: null, fx: null, post: null, fov: 88, fps: false } };
  try { const s = JSON.parse(localStorage.getItem('roostes-seaded') || 'null'); if (s) { const gd = settings.gfx; Object.assign(settings, s); settings.gfx = Object.assign(gd, s.gfx || {}); } } catch (e) { /* ei salvesta */ }
  function saveSettings() { try { localStorage.setItem('roostes-seaded', JSON.stringify(settings)); } catch (e) { /* ignoreeri */ } }
  // puude olek
  const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const look = { id: null, x: 0, y: 0 };
  const T = { fire: false, fireId: null, fx: 0, fy: 0, actHeld: false, actId: null, jump: false, reload: false, swap: false, act: false, sprint: false };
  let tdx = 0, tdy = 0;

  function init(cv) {
    canvas = cv;
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      if (!e.repeat) pressed.add(e.code);
      if (e.code === 'KeyZ' && !e.repeat && !e.ctrlKey && !e.metaKey && G.mode === 'play') T.aimKey = !T.aimKey;
      keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code) && G.mode === 'play') e.preventDefault();
      Audio2.resume();
    });
    window.addEventListener('keyup', (e) => keys.delete(e.code));
    window.addEventListener('blur', () => { keys.clear(); lmb = rmb = false; T.fire = false; T.actHeld = false; joy.id = null; look.id = null; });
    cv.addEventListener('mousedown', (e) => {
      if (isTouch || G.mode !== 'play') return;
      Audio2.resume();
      if (!locked && !lockFailed) requestLock();
      if (e.button === 0) lmb = true;
      if (e.button === 2) rmb = true;
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 0) lmb = false; if (e.button === 2) rmb = false; });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', (e) => {
      if (G.mode !== 'play' || isTouch) return;
      if (locked) { mdx += e.movementX; mdy += e.movementY; }
      else if (rmb) { mdx += e.movementX; mdy += e.movementY; }
    });
    document.addEventListener('pointerlockchange', () => {
      locked = document.pointerLockElement === canvas;
      if (!locked && G.mode === 'play' && !isTouch && !lockFailed) {
        UI.lockHint(true);
        if (!selfUnlock && !UI.isPanelOpen() && !Player.dead) UI.openMenu();
      } else UI.lockHint(false);
      selfUnlock = false;
    });
    document.addEventListener('pointerlockerror', () => { lockFailed = true; UI.lockHint(false); UI.toast('Mouse lock isn\'t allowed here: look around by holding the right mouse button or with the arrow keys.'); });
    // puutekiht
    const tl = document.getElementById('touch');
    tl.addEventListener('pointerdown', onTDown, { passive: false });
    tl.addEventListener('pointermove', onTMove, { passive: false });
    tl.addEventListener('pointerup', onTUp, { passive: false });
    tl.addEventListener('pointercancel', onTUp, { passive: false });
  }
  function requestLock() {
    try {
      const p = canvas.requestPointerLock && canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => { lockFailed = true; UI.lockHint(false); });
    } catch (e) { lockFailed = true; }
  }
  let selfUnlock = false;
  function exitLock() { try { if (document.pointerLockElement) { selfUnlock = true; document.exitPointerLock(); } } catch (e) { /* ignoreeri */ } }

  function btnOf(e) { const b = e.target.closest && e.target.closest('.tb'); return b ? b.id : null; }
  function onTDown(e) {
    e.preventDefault();
    Audio2.init(); Audio2.resume();
    const b = btnOf(e);
    try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (er) { /* ignoreeri */ }
    if (b === 'tFire') { T.fire = true; T.fireId = e.pointerId; T.fx = e.clientX; T.fy = e.clientY; return; }
    if (b === 'tJump') { T.jump = true; return; }
    if (b === 'tReload') { T.reload = true; return; }
    if (b === 'tAim') { T.aim = !T.aim; e.target.closest('.tb').classList.toggle('on', T.aim); return; }
    if (b === 'tSwap') { T.swap = true; return; }
    if (b === 'tInv') { UI.openInv(); return; }
    if (b === 'tMed') { Inv.use('medkit'); return; }
    if (b === 'tGren') { Inv.use('grenade'); return; }
    if (b === 'tAct') { T.act = true; T.actHeld = true; T.actId = e.pointerId; return; }
    const W = window.innerWidth;
    if (e.clientX < W * 0.42 && joy.id === null) {
      joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = 0; joy.y = 0;
      UI.joy(true, joy.ox, joy.oy, 0, 0);
    } else if (look.id === null) {
      look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY;
    }
  }
  function onTMove(e) {
    if (e.pointerId === joy.id) {
      e.preventDefault();
      const R = 56;
      let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
      const l = Math.hypot(dx, dy);
      if (l > R * 1.6) { joy.ox += (dx / l) * (l - R * 1.6); joy.oy += (dy / l) * (l - R * 1.6); dx = e.clientX - joy.ox; dy = e.clientY - joy.oy; }
      const k = Math.min(1, Math.hypot(dx, dy) / R);
      const a = Math.atan2(dy, dx);
      joy.x = Math.cos(a) * k; joy.y = Math.sin(a) * k;
      UI.joy(true, joy.ox, joy.oy, joy.x * R, joy.y * R);
    } else if (e.pointerId === look.id) {
      e.preventDefault();
      tdx += e.clientX - look.x; tdy += e.clientY - look.y; look.x = e.clientX; look.y = e.clientY;
    } else if (e.pointerId === T.fireId) {
      e.preventDefault();
      tdx += (e.clientX - T.fx) * 0.85; tdy += (e.clientY - T.fy) * 0.85; T.fx = e.clientX; T.fy = e.clientY;
    }
  }
  function onTUp(e) {
    if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; UI.joy(false); }
    if (e.pointerId === look.id) look.id = null;
    if (e.pointerId === T.fireId) { T.fire = false; T.fireId = null; }
    if (e.pointerId === T.actId) { T.actHeld = false; T.actId = null; }
  }

  const out = { moveX: 0, moveY: 0, moveMag: 0, lookX: 0, lookY: 0, fire: false, jump: false, reload: false, swap: false, act: false, actHeld: false, sprint: false, assist: false, zoom: false };
  function frame(dt) {
    const k = (c) => keys.has(c);
    let mx = (k('KeyD') ? 1 : 0) - (k('KeyA') ? 1 : 0);
    let my = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0);
    if (joy.id !== null) { mx = joy.x; my = -joy.y; }
    out.moveX = mx; out.moveY = my; out.moveMag = Math.hypot(mx, my);
    const sm = 0.0022 * settings.sens, st = 0.0062 * settings.sens;
    const inv = settings.invert ? -1 : 1;
    let lx = mdx * sm + tdx * st, ly = (mdy * sm + tdy * st) * inv;
    // nooleklahvid pööramiseks (kui hiirt pole lukus)
    if (!locked) { if (k('ArrowLeft')) lx -= dt * 2.2; if (k('ArrowRight')) lx += dt * 2.2; }
    out.zoom = (rmb && (locked || lockFailed)) || !!T.aim || !!T.aimKey;
    if (out.zoom) { lx *= 0.55; ly *= 0.55; }
    out.lookX = lx; out.lookY = ly;
    mdx = mdy = 0; tdx = tdy = 0;
    out.fire = (lmb && (locked || lockFailed)) || T.fire;
    out.jump = pressed.has('Space') || T.jump;
    out.reload = pressed.has('KeyR') || T.reload;
    out.swap = pressed.has('KeyQ') || pressed.has('Digit1') || pressed.has('Digit2') || T.swap || (wheelSwap && (wheelSwap = false, true));
    out.act = pressed.has('KeyE') || pressed.has('KeyF') || T.act;
    out.actHeld = k('KeyE') || k('KeyF') || T.actHeld;
    out.sprint = k('ShiftLeft') || k('ShiftRight');
    out.assist = isTouch;
    T.jump = T.reload = T.swap = T.act = false;
    return out;
  }
  let wheelSwap = false;
  window.addEventListener('wheel', (e) => { if (G.mode === 'play' && locked && Math.abs(e.deltaY) > 20) wheelSwap = true; }, { passive: true });
  function endFrame() { pressed.clear(); }
  function wasPressed(code) { return pressed.has(code); }
  function reset() { keys.clear(); pressed.clear(); lmb = rmb = false; T.aim = false; T.aimKey = false; const ab = document.getElementById('tAim'); if (ab) ab.classList.remove('on'); T.fire = false; T.actHeld = false; joy.id = null; look.id = null; UI.joy(false); mdx = mdy = tdx = tdy = 0; }
  return { _T: T, init, frame, endFrame, wasPressed, reset, requestLock, exitLock, settings, saveSettings, get isTouch() { return isTouch; }, get locked() { return locked; }, get lockFailed() { return lockFailed; }, keys };
})();
