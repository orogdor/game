// ============================================================
//  KASUTAJALIIDES
// ============================================================
const ICON = (() => {
  const s = (d, extra = '') => `<svg class="svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  return {
    coin: s('<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2a3.4 3.4 0 1 0 0 5.6"/><path d="M8.5 11h4M8.5 13h4"/>'),
    scrap: s('<path d="M12 3l7.5 4.3v8.6L12 20.2l-7.5-4.3V7.3z"/><circle cx="12" cy="11.6" r="2.8"/>'),
    crystal: s('<path d="M12 2.5l5 6.5-5 12.5-5-12.5z"/><path d="M7 9h10"/>'),
    food: s('<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>'),
    power: s('<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>'),
    hammer: s('<path d="M14.5 5.5l4 4"/><path d="M12.5 7.5l-8.8 8.8a1.8 1.8 0 0 0 2.5 2.5l8.8-8.8"/><path d="M13 4l2.5-1.5 6 6L20 11l-2-2-2.5 2.5-4-4z"/>'),
    menu: s('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    people: s('<circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 13.6c3 0 5 1.8 5 4.6"/>'),
    terminal: s('<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M7 9l3 2.5L7 14M12 14h5M9 20h6"/>'),
    map: s('<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>'),
    pause: s('<path d="M8 5v14M16 5v14"/>'),
    fire: s('<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>'),
    jump: s('<path d="M6 13l6-6 6 6M6 19l6-6 6 6"/>'),
    reload: s('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    swap: s('<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>'),
    rotL: s('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v5h5"/>'),
    rotR: s('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    undo: s('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    check: s('<path d="M4.5 12.5l5 5 10-11"/>'),
    close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    eye: s('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
    room: s('<rect x="4" y="4" width="16" height="16"/><path d="M4 9h5M15 4v5"/>'),
    door: s('<path d="M6 21V4h12v17"/><path d="M3 21h18"/><circle cx="14.5" cy="12.5" r=".9" fill="currentColor"/>'),
    window: s('<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14M4 12h16"/>'),
    box: s('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'),
    brush: s('<path d="M18.5 3.5l2 2-9 9-2-2z"/><path d="M9.5 12.5c-3 0-5 2-5 5 0 1.2-.8 2.3-2 3 4 .5 9-1 9-5"/>'),
    trash: s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    house: s('<path d="M3.5 11.5L12 4l8.5 7.5"/><path d="M6 10v10h12V10"/>'),
    heart: s('<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>'),
    flag: s('<path d="M5 21V4M5 4h11l-2 3.5 2 3.5H5"/>'),
    pin: s('<path d="M12 21s6.5-6.6 6.5-11.5a6.5 6.5 0 0 0-13 0C5.5 14.4 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>'),
    bag: s('<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    hand: s('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7c-2.5 0-4-1-5.5-3L3 14.5a1.6 1.6 0 0 1 2.5-2L8 15"/>'),
    save: s('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>'),
    gear: s('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
    help: s('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.5 2.4c-.7.3-1 .9-1 1.6v.5M12 17.2v.3"/>'),
    exit: s('<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>'),
    expand: s('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  };
})();

const UI = (() => {
  const $ = (id) => document.getElementById(id);
  let hudT = 0, compT = 0, miniT = 0;
  let feedEls = [];
  let toastT = 0, bannerT = 0, hitT = 0, armorT = 0, dmgV = 0, dmgDirT = 0;
  let shakeV = 0;
  let mapCanvas = null;
  let panelKind = null, panelTab = null, panelRefreshT = 0;
  let waypoint = null;
  let fireConfirm = null;

  function init() {
    if (Input.isTouch) document.body.classList.add('touch');
    $('menuBtns').innerHTML = `<button class="hbtn" id="bBuild" aria-label="Build">${ICON.hammer}<span class="k">B</span></button><button class="hbtn" id="bInv" aria-label="Backpack">${ICON.bag}<span class="k">I</span></button><button class="hbtn" id="bMenu" aria-label="Menu">${ICON.menu}<span class="k">Esc</span></button>`;
    $('bBuild').onclick = () => { Audio2.ui(); Game.toggleBuild(); };
    $('bMenu').onclick = () => { Audio2.ui(); openMenu(); };
    $('bInv').onclick = () => { Audio2.ui(); openInv(); };
    $('mini').onclick = () => { Audio2.ui(); openMap(); };
    $('tFire').innerHTML = ICON.fire; $('tJump').innerHTML = ICON.jump; $('tReload').innerHTML = ICON.reload; $('tSwap').innerHTML = ICON.swap;
    $('tInv').innerHTML = ICON.bag; $('tMed').innerHTML = '<span style="font-size:20px;font-weight:800;color:#ff7a66">✚</span>'; $('tGren').innerHTML = ITEMS.grenade.icon;
    $('pClose').onclick = () => { Audio2.ui(); closePanel(); };
    $('panel').addEventListener('pointerdown', (e) => { if (e.target === $('panel')) closePanel(); });
    // ehitusriba
    $('bTop').innerHTML = `<span class="ttl">BUILD</span><span id="bRes" style="display:flex;gap:5px;flex-wrap:wrap"></span><span class="sp"></span>
      <button class="bbtn" id="bUndo" aria-label="Võta tagasi">${ICON.undo}<span>Back</span></button>
      <button class="bbtn" id="bRotL" aria-label="Pööra kaamerat vasakule">${ICON.rotL}</button><button class="bbtn" id="bRotR" aria-label="Pööra kaamerat paremale">${ICON.rotR}</button>
      <button class="bbtn primary" id="bDone">${ICON.check}<span>Done</span></button>`;
    $('bUndo').onclick = () => Build.doUndo();
    $('bRotL').onclick = () => { Build.cam.vyaw = 2.4; };
    $('bRotR').onclick = () => { Build.cam.vyaw = -2.4; };
    $('bDone').onclick = () => { Audio2.ui(); Build.exit(); };
    buildMapCanvas();
  }
  function buildMapCanvas() {
    const N = World.N1;
    mapCanvas = document.createElement('canvas'); mapCanvas.width = N; mapCanvas.height = N;
    const ctx = mapCanvas.getContext('2d');
    const img = ctx.createImageData(N, N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i, o = k * 4;
      img.data[o] = World.mapRGB[k * 3]; img.data[o + 1] = World.mapRGB[k * 3 + 1]; img.data[o + 2] = World.mapRGB[k * 3 + 2]; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- teated ----------
  function msg(text, kind = '') {
    G.log.push({ text, kind, day: G.time.day, t: Econ.clockStr() });
    if (G.log.length > 60) G.log.shift();
    const el = document.createElement('div');
    el.className = 'msg ' + kind; el.textContent = text;
    $('feed').appendChild(el);
    feedEls.push({ el, t: kind === 'danger' || kind === 'comet' ? 11 : 8 });
    while (feedEls.length > 4) { const f = feedEls.shift(); f.el.remove(); }
    if (kind === 'danger' || kind === 'comet' || kind === 'rival') Audio2.radio();
  }
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); toastT = 2.6; }
  function banner(title, sub, kind = '') { const el = $('banner'); el.className = kind; el.querySelector('h2').textContent = title; el.querySelector('p').textContent = sub || ''; void el.offsetWidth; el.classList.add('on'); bannerT = 3.8; }
  function damage(amt, ang) {
    dmgV = Math.min(1, dmgV + amt / 30);
    if (ang !== null && ang !== undefined) { const d = $('dmgDir'); d.style.transform = `rotate(${-ang}rad)`; d.style.opacity = 1; dmgDirT = 1.2; }
  }
  function hitMarker(kill) { const el = $('hitm'); el.classList.toggle('kill', !!kill); el.style.opacity = 1; hitT = kill ? 0.35 : 0.15; }
  function armorHit() { $('armor').style.opacity = 1; armorT = 0.7; }
  function whiz() { }
  function shake(v) { shakeV = Math.max(shakeV, v); }
  function getShake() { return shakeV; }
  function joy(on, x, y, kx, ky) {
    const j = $('joy');
    if (!on) { j.style.display = 'none'; return; }
    j.style.display = 'block'; j.style.left = x + 'px'; j.style.top = y + 'px';
    j.firstElementChild.style.transform = `translate(${kx || 0}px, ${ky || 0}px)`;
  }
  function lockHint(on) { $('lockHint').hidden = !on || Input.isTouch || G.mode !== 'play'; }

  // ---------- HUD ----------
  function showHUD(on) { $('hud').hidden = !on; $('touch').hidden = !on || !Input.isTouch; }
  function resChips() {
    const p = Base.power;
    const pw = `<span class="chip pw ${p.ok ? '' : 'bad'}" title="Energia: toodang / tarbimine">${ICON.power}<span class="num">${p.demand}/${p.supply}</span></span>`;
    return `<span class="chip cr" title="Krediidid">${ICON.coin}<span class="num">${fmtInt(G.res.cr)}</span></span>
      <span class="chip sc" title="Scrap">${ICON.scrap}<span class="num">${G.res.scrap}</span></span>
      <span class="chip kr" title="Toorteemandid hoidlas (+ lihvitud)">${ICON.crystal}<span class="num">${G.res.kris}${G.res.lihv ? '<small style="opacity:.75"> +' + G.res.lihv + '</small>' : ''}</span></span>
      ${(G.res.acid || 0) > 0 ? `<span class="chip" title="Acid glands" style="color:#9dff4a">${ICON.scrap}<span class="num">${G.res.acid}</span></span>` : ''}
      ${(G.res.ore || 0) > 0 || G.flags.drill ? `<span class="chip or" title="Iron ore" style="color:#d98a62">${ICON.scrap}<span class="num">${G.res.ore || 0}</span></span>` : ''}
      <span class="chip fd" title="Toit (toores liha)">${ICON.food}<span class="num">${G.res.food}${G.res.meat ? '<small style="opacity:.75"> +' + G.res.meat + '</small>' : ''}</span></span>` + pw + threatChip();
  }
  function threatChip() {
    const s = Base.signature();
    return `<span class="chip th" style="color:${s.col}" title="Baasi ohutase ${s.tier}: müra ${s.noise} + valgus ${s.light} + esemeid ${s.count} = ${s.total}. Mida rohkem, seda suurem putukaparv.">${ICON.eye || ICON.power}<span class="num">${s.total}</span></span>`;
  }
  let lastRes = '';
  function updateHUD() {
    const r = resChips();
    if (r !== lastRes) { $('res').innerHTML = r; lastRes = r; if (G.mode === 'build') $('bRes').innerHTML = r; }
    const dd = G.debt.nextDay - G.time.day;
    const hot = dd <= 1;
    $('clock').innerHTML = `<b>Day ${G.time.day}</b> · ${Econ.clockStr()}${Weather.storm > 0.5 ? ' · dust storm' : ''} · <span class="debt ${hot ? 'hot' : ''}">payment ${fmtInt(G.debt.amount)} ₵ ${dd <= 0 ? 'today' : dd === 1 ? 'tomorrow' : dd + ' d left'}</span>`;
    const hpk = clamp(Player.hp / Player.maxHp, 0, 1);
    $('hp').firstElementChild.style.transform = `scaleX(${hpk})`;
    $('hp').lastElementChild.textContent = Math.ceil(Player.hp) + ' / ' + Player.maxHp;
    const used = Inv.used(), ns = Inv.nSlots();
    let cs = `<span class="${used >= ns ? 'full' : ''}">${ICON.bag} <b>${used}/${ns}</b></span>`;
    const ck = Inv.count('kris'), csr = Inv.count('scrap'), cm = Inv.count('meat'), cst = Inv.count('stones');
    if (ck) cs += `<span style="color:var(--crystal)">${ICON.crystal} <b>${ck}</b></span>`;
    if (csr) cs += `<span>${ICON.scrap} <b>${csr}</b></span>`;
    if (cm) cs += `<span style="color:#e7b98a">${ICON.food} <b>${cm}</b></span>`;
    if (cst) cs += `<span style="color:#ff8fd0">${ICON.heart} <b>heartstones</b></span>`;
    const med = Inv.count('medkit'), gr = Inv.count('grenade');
    if (med) cs += `<span style="color:#ff7a66" title="Ravikomplekt (H)">✚ <b>${med}</b></span>`;
    if (gr) cs += `<span style="color:var(--rust-hi)" title="Granaat (G)">◉ <b>${gr}</b></span>`;
    if (Inv.stimT > 0) cs += `<span style="color:var(--good)">stim ${Math.ceil(Inv.stimT)} s</span>`;
    $('carry').innerHTML = cs;
    $('tMed').hidden = !med; $('tGren').hidden = !gr;
    const st = weaponStats(Player.weapon);
    $('wname').textContent = st.name;
    const am = $('ammo');
    if (Player.reloadT > 0) { am.className = 'reload'; am.textContent = 'laen…'; }
    const res = Inv.count(Inv.ammoFor(Player.weapon));
    if (Player.reloadT <= 0) { am.className = res || Player.mag[Player.weapon] ? '' : 'empty'; am.innerHTML = `${Player.mag[Player.weapon]}<small> / ${res}</small>`; }
    $('tAmmo').textContent = Player.reloadT > 0 ? 'laen…' : Player.mag[Player.weapon] + ' / ' + res;
    const v = Inv.ensure(); $('tSwap').hidden = !(v.eq.w1 && v.eq.w2);
    if (panelKind === 'inv' && invDirtyF && !invDrag) { invDirtyF = false; renderPanel(true); }
  }
  function updateObjective() {
    const o = Objectives.current();
    if (!o) { $('obj').hidden = true; return; }
    $('obj').hidden = false;
    $('objText').innerHTML = esc(o.text) + (o.prog ? `<span class="p">${o.prog()}</span>` : '');
    $('objHint').textContent = o.hint || '';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ---------- markerid ----------
  function markers() {
    const out = [];
    out.push({ x: 0, z: 0, icon: 'house', col: '#eedfc6', label: 'Base', kind: 'base' });
    for (const s of Comets.sites) {
      if (!s.clusters.length) continue;
      out.push({ x: s.x + s.ox, z: s.z + s.oz, icon: 'crystal', col: '#92d9ff', label: s.loose ? 'Diamonds' : 'Comet', kind: 'comet', approx: !s.exact });
    }
    if (!G.flags.nestKnown && Boss.e && Boss.e.alive) out.push({ x: World.sites.nest.x, z: World.sites.nest.z, icon: 'heart', col: '#c58bff', label: 'Pillar of light?', kind: 'nest' });
    if (G.flags.nestKnown && !G.flags.stonesHome) out.push({ x: World.sites.nest.x, z: World.sites.nest.z, icon: 'heart', col: '#ff8fd0', label: 'Stoneheart', kind: 'nest' });
    for (const r of Rivals.list) if (r.base) out.push({ x: r.base.x, z: r.base.z, icon: 'flag', col: r.alive ? (r.id === 'krell' ? '#ff6d55' : '#b796ff') : '#6f604f', label: r.short, kind: 'rival' });
    if (World.sites.city && World.sites.city.x < 1e4) out.push({ x: World.sites.city.x, z: World.sites.city.z, icon: 'house', col: '#a9a39a', label: 'Old colony city', kind: 'city' });
    for (const v of World.sites.villages || []) out.push({ x: v.x, z: v.z, icon: 'house', col: '#8f877c', label: v.name || 'Abandoned settlement', kind: 'city' });
    for (const p of Ents.pickups) if (!p.gone && !(p.city && !p.seen)) out.push({ x: p.x, z: p.z, icon: p.kind === 'stones' ? 'heart' : 'bag', col: p.kind === 'stones' ? '#ff8fd0' : p.kind === 'mechpart' ? '#ff8a2a' : '#ddb45c', label: p.kind === 'stones' ? 'Heartstones' : p.kind === 'mechpart' ? 'Mech part' : 'Items', kind: 'bag' });
    { const mb = Vehicles.bayMarker(); if (mb) out.push(mb); }
    const cur = Objectives.current();
    if (cur && cur.id === 'salv') {
      const w = World.wrecks.filter((q) => q.scrap > 0).sort((a, b) => Math.hypot(a.x - Player.pos.x, a.z - Player.pos.z) - Math.hypot(b.x - Player.pos.x, b.z - Player.pos.z))[0];
      if (w) out.push({ x: w.x, z: w.z, icon: 'scrap', col: '#c9c2b6', label: 'Wreck', kind: 'wreck' });
    }
    const wm = Waves.marker(); if (wm) out.push({ x: wm.x, z: wm.z, icon: 'flag', col: '#9ccf5a', label: 'Swarm', kind: 'wave' });
    if (waypoint) out.push({ x: waypoint.x, z: waypoint.z, icon: 'pin', col: '#ddb45c', label: 'Waypoint', kind: 'wp' });
    return out;
  }
  function updateCompass() {
    const W = $('compass').clientWidth;
    const head = Math.atan2(Math.sin(Player.yaw), -Math.cos(Player.yaw));
    const span = Math.PI * 0.62;
    let h = '';
    const dirs = [['N', 0], ['NE', Math.PI / 4], ['E', Math.PI / 2], ['SE', 3 * Math.PI / 4], ['S', Math.PI], ['SW', -3 * Math.PI / 4], ['W', -Math.PI / 2], ['NW', -Math.PI / 4]];
    for (const [n, a] of dirs) {
      const rel = angDiff(head, a);
      if (Math.abs(rel) > span) continue;
      h += `<div class="cm dir" style="left:${(W / 2 + (rel / span) * (W / 2)).toFixed(1)}px;${n.length > 1 ? 'font-size:10px;color:var(--muted)' : ''}">${n}</div>`;
    }
    for (let a = -Math.PI; a < Math.PI; a += Math.PI / 12) {
      const rel = angDiff(head, a); if (Math.abs(rel) > span) continue;
      h += `<div class="tick" style="left:${(W / 2 + (rel / span) * (W / 2)).toFixed(1)}px"></div>`;
    }
    const mk = markers().map((m) => { m.d = Math.hypot(m.x - Player.pos.x, m.z - Player.pos.z); return m; }).sort((p, q) => q.d - p.d); // kaugemad enne, lähemad peale
    for (const m of mk) {
      const dx = m.x - Player.pos.x, dz = m.z - Player.pos.z, d = m.d;
      if (d < 4) continue;
      // lähemad suuremad, kaugemad väiksemad (logaritmiline skaala)
      // kõrval 120%, teisel pool kaarti (≈ kaardi laius) 5%; logaritmiline vahepeal
      const tt = clamp(Math.log(Math.max(d, 15) / 15) / Math.log((World.SIZE || 3600) / 15), 0, 1);
      const sc = 1.2 + (0.05 - 1.2) * tt;
      if (m.kind === 'base' && d < 30) continue;
      const a = Math.atan2(dx, -dz);
      let rel = angDiff(head, a);
      const edge = Math.abs(rel) > span;
      rel = clamp(rel, -span, span);
      h += `<div class="cm" style="left:${(W / 2 + (rel / span) * (W / 2 - 10)).toFixed(1)}px;color:${m.col};transform:translateX(-50%) scale(${sc.toFixed(2)});opacity:${((edge ? 0.55 : 1) * (0.5 + 0.5 * (1 - tt))).toFixed(2)}">${ICON[m.icon]}<small>${m.approx ? '~' : ''}${d >= 1000 ? (d / 1000).toFixed(1) + 'k' : Math.round(d)}</small></div>`;
    }
    $('compass').innerHTML = h;
  }
  function drawMinimap() {
    const cv = $('mini'), ctx = cv.getContext('2d'), S = cv.width, R = S / 2;
    const viewR = 110, k = R / viewR;
    ctx.save();
    ctx.clearRect(0, 0, S, S);
    ctx.beginPath(); ctx.arc(R, R, R, 0, TAU); ctx.clip();
    ctx.fillStyle = '#2a1d15'; ctx.fillRect(0, 0, S, S);
    ctx.translate(R, R);
    const head = Math.atan2(Math.sin(Player.yaw), -Math.cos(Player.yaw));
    ctx.rotate(-head);
    const px = Player.pos.x, pz = Player.pos.z;
    const mpp = World.SIZE / World.RES; // meetrit pikslis
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(mapCanvas, (-World.HALF - px) * k, (-World.HALF - pz) * k, World.SIZE * k + mpp * k, World.SIZE * k + mpp * k);
    // baasi ruumid
    ctx.fillStyle = 'rgba(238,223,198,.85)';
    for (const b of Bases.list) {
      if (Math.abs(b.OX - px) > viewR + 50 || Math.abs(b.OZ - pz) > viewR + 50) continue;
      ctx.fillStyle = b === Base ? 'rgba(238,223,198,.85)' : 'rgba(255,120,95,.75)';
      for (const r of b.rooms.values()) for (const [i, j] of r.cells) ctx.fillRect((b.X0 + i * b.CS - px) * k, (b.Z0 + j * b.CS - pz) * k, b.CS * k + 0.6, b.CS * k + 0.6);
    }
    const radar = Base.objsOfType('radar').some((o) => o.on);
    for (const e of Ents.list) {
      if (!e.alive || e.kind === 'player') continue;
      const dx = e.pos.x - px, dz = e.pos.z - pz; if (Math.abs(dx) > viewR || Math.abs(dz) > viewR) continue;
      let col = null;
      if (e.team === 'crew') col = '#5fd3c4';
      else if ((e.team === 'krell' || e.team === 'klann') && e.kind === 'human' && (radar || Math.hypot(dx, dz) < 45)) col = e.team === 'krell' ? '#ff6d55' : '#b796ff';
      else if (e.kind === 'stalker' && e.state !== 'buried' && (radar || Math.hypot(dx, dz) < 35)) col = '#ffa53d';
      else if (e.kind === 'kiskja' && (radar || Math.hypot(dx, dz) < 40)) col = '#ff3b2e';
      else if (e.kind === 'boss') col = '#ff8fd0';
      if (!col) continue;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx * k, dz * k, e.kind === 'boss' ? 6 : 3.2, 0, TAU); ctx.fill();
    }
    for (const m of markers()) {
      const dx = m.x - px, dz = m.z - pz;
      let x = dx * k, z = dz * k; const d = Math.hypot(x, z);
      if (d > R - 9) { x *= (R - 9) / d; z *= (R - 9) / d; }
      if (m.approx && d < R - 9) { ctx.strokeStyle = m.col; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, z, 28 * k, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.fillStyle = m.col; ctx.strokeStyle = '#120d0b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, z, 5, 0, TAU); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    // mängija nool
    ctx.save(); ctx.translate(R, R);
    ctx.fillStyle = '#e57b42'; ctx.strokeStyle = '#120d0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------- kaadri uuendus ----------
  // jutumullid tegelaste kohal
  const bubbles = [];
  function bubble(e, text) {
    if (!e || G.mode !== 'play') return;
    if (Math.hypot(e.pos.x - Player.pos.x, e.pos.z - Player.pos.z) > 22) return;
    let b = bubbles.find((q) => q.e === e) || bubbles.find((q) => q.t <= 0);
    if (!b) { if (bubbles.length >= 5) return; const el = document.createElement('div'); el.className = 'bub'; $('hud').appendChild(el); b = { el, e: null, t: 0 }; bubbles.push(b); }
    b.e = e; b.t = 4.5; b.el.textContent = text; b.el.style.display = 'block';
  }
  const bp = {};
  function updateBubbles(dt) {
    for (const b of bubbles) {
      if (b.t <= 0) continue;
      b.t -= dt;
      const e = b.e, hp = e.headPos;
      const p = hp && e.alive ? GFX.project(hp.x, hp.y + 0.32, hp.z, bp) : null;
      if (b.t <= 0 || !p || p.d > 24) { b.el.style.display = 'none'; if (b.t <= 0) b.e = null; continue; }
      b.el.style.display = 'block';
      b.el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px) translate(-50%, -100%)`;
      b.el.style.opacity = String(clamp(b.t / 0.6, 0, 1) * clamp((24 - p.d) / 6, 0, 1));
    }
  }
  function update(dt) {
    updateBubbles(dt);
    hudT -= dt; compT -= dt; miniT -= dt;
    if (G.mode === 'play' || G.mode === 'build') {
      if (hudT <= 0) { hudT = 0.12; updateHUD(); }
      if (G.mode === 'play') {
        if (compT <= 0) { compT = 0.05; updateCompass(); }
        if (miniT <= 0) { miniT = 0.1; drawMinimap(); }
        updatePrompt();
      }
    }
    for (const f of feedEls) { f.t -= dt; if (f.t < 1) f.el.classList.add('out'); }
    while (feedEls.length && feedEls[0].t <= 0) { feedEls.shift().el.remove(); }
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
    if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').classList.remove('on'); }
    if (hitT > 0) { hitT -= dt; if (hitT <= 0) $('hitm').style.opacity = 0; }
    if (armorT > 0) { armorT -= dt; if (armorT <= 0) $('armor').style.opacity = 0; }
    dmgV = Math.max(0, dmgV - dt * 0.9);
    const lowHp = Player.hp < Player.maxHp * 0.3 && !Player.dead ? 0.35 + Math.sin(G.time.total * 5) * 0.1 : 0;
    $('dmg').style.opacity = Math.max(dmgV, lowHp, Player.dead ? 0.8 : 0);
    if (dmgDirT > 0) { dmgDirT -= dt; if (dmgDirT <= 0) $('dmgDir').style.opacity = 0; }
    shakeV = Math.max(0, shakeV - dt * 1.6);
    if (panelKind && G.mode !== 'title') { panelRefreshT -= dt; if (panelRefreshT <= 0) { panelRefreshT = 0.5; if ((panelKind === 'crew' && !(document.activeElement && document.activeElement.id === 'cheatIn')) || (panelKind === 'terminal' && panelTab === 'pank')) renderPanel(true); } }
  }
  function updatePrompt() {
    const it = Player.inter;
    const el = $('prompt'), ta = $('tAct');
    if (!it || Player.dead) { el.hidden = true; ta.hidden = true; return; }
    el.hidden = false;
    el.classList.toggle('dis', !!it.disabled);
    $('pLabel').textContent = it.label;
    $('pSub').textContent = it.sub || '';
    el.querySelector('.pk').textContent = it.hold ? 'hold E' : 'E';
    $('pBar').firstElementChild.style.width = it.hold ? clamp(Player.interT / it.hold, 0, 1) * 100 + '%' : '0';
    if (Input.isTouch) {
      el.querySelector('.pk').style.display = 'none';
      ta.hidden = !!it.disabled;
      ta.firstElementChild.textContent = it.label;
    }
  }

  // portree pildina (vahemälu välimuse kaupa)
  const avaCache = new WeakMap();
  function ava(look) {
    if (!look || !Chars.ready) return '';
    let u = avaCache.get(look);
    if (u && u.v !== look.__v) u = null;
    if (!u) { const cv = Chars.portrait(look, { w: 112, h: 136 }); if (!cv) return ''; u = { url: cv.toDataURL('image/png'), v: look.__v }; avaCache.set(look, u); }
    u = u.url;
    return `<img class="ava" src="${u}" alt="" width="56" height="68">`;
  }

  // ---------- inventar ----------
  let invSel = null, invDirtyF = false, invDrag = null;
  function invDirty() { invDirtyF = true; }
  function openInv() { invSel = null; openPanel('inv'); }
  function nearStash() { return G.mode === 'play' && Base.isInside(Player.pos.x, Player.pos.z); }
  function slotHTML(s, attrs, sel) {
    if (!s) return `<div class="islot empty" ${attrs}></div>`;
    const d = ITEMS[s.id];
    return `<div class="islot ${sel ? 'sel' : ''}" ${attrs} title="${d.name}"><span class="iic" style="color:${d.col}">${d.icon}</span>${s.n > 1 ? `<b class="in">${s.n}</b>` : ''}</div>`;
  }
  const EQ_SLOTS = { helmet: ['Helmet', 'helmet'], vest: ['Vest', 'vest'], gloves: ['Gloves', 'gloves'], pack: ['Backpack', 'pack'], boots: ['Boots', 'boots'], w1: ['Weapon 1', 'carbine'], w2: ['Weapon 2', 'pistol'] };
  function eqSlot(k, sel) {
    const v = Inv.ensure(), id = v.eq[k], [nm, ghost] = EQ_SLOTS[k];
    const inner = id ? `<span class="iic" style="color:${ITEMS[id].col}">${ITEMS[id].icon}</span>` : `<span class="iic gh">${ITEMS[ghost].icon}</span>`;
    return `<div class="eqc ${k[0] === 'w' ? 'wpn' : ''}"><div class="islot eq ${id ? '' : 'empty'} ${sel ? 'sel' : ''}" data-eq="${k}" title="${id ? ITEMS[id].name : nm}">${inner}${(k === 'w1' || k === 'w2') && v.sel === k && id ? '<b class="in">●</b>' : ''}</div><span>${nm}</span></div>`;
  }
  function nearBags() { const p = Player.pos; return Ents.pickups.filter((q) => !q.gone && (q.kind === 'bag' || q.kind === 'stones') && q.data && q.data.items && Math.hypot(q.x - p.x, q.z - p.z) < 3.5); }
  function renderInv(body) {
    $('pTitle').textContent = 'Inventory'; $('pTabs').innerHTML = '';
    const v = Inv.ensure(), stash = nearStash();
    const arm = Math.round((1 - Inv.dmgMul()) * 100), spd = Math.round((Inv.gearSpd(v.eq) - 1) * 100), rel = Math.round((1 - Inv.reloadMul()) * 100);
    const es = (k) => eqSlot(k, invSel === 'eq:' + k);
    let h = `<div class="invWrap"><div class="invL">
      <div class="doll"><div class="dcol">${es('helmet')}${es('vest')}${es('gloves')}</div>
        <div class="invAva">${G.look ? `<img src="${invAva()}" alt="">` : ''}<div class="invName">${esc(G.pname || 'You')}</div><div class="invHp num">${Math.ceil(Player.hp)} / ${Player.maxHp} HP</div></div>
        <div class="dcol">${es('pack')}${es('boots')}</div></div>
      <div class="dweap">${es('w1')}${es('w2')}</div>
      <div class="dstats"><span>Armour <b class="num">${arm ? '−' + arm + '%' : '—'}</b></span><span>Speed <b class="num">${spd ? (spd > 0 ? '+' : '−') + Math.abs(spd) + '%' : '±0'}</b></span><span>Reload <b class="num">${rel ? '−' + rel + '%' : '—'}</b></span></div></div>
      <div class="invM"><div class="invHead"><span>With you <b class="num">${Inv.used()} / ${Inv.nSlots()}</b> slots</span><span class="note">Drag · tap to select</span></div>`;
    for (const sc of Inv.sections()) {
      let u = 0; for (let i = 0; i < sc.n; i++) if (v.slots[sc.from + i]) u++;
      const ic = sc.key === 'pocket' ? ICON.bag || '' : ITEMS[v.eq[sc.key]].icon;
      h += `<div class="isec"><div class="isech"><span class="iic">${ic}</span><span>${esc(sc.name)}</span><b class="num">${u}/${sc.n}</b></div><div class="igrid">`;
      for (let i = 0; i < sc.n; i++) h += slotHTML(v.slots[sc.from + i], `data-slot="${sc.from + i}"`, invSel === 's:' + (sc.from + i));
      h += `</div></div>`;
    }
    if (!v.eq.vest) h += `<div class="isec locked">No vest — a vest gives extra slots and armour.</div>`;
    if (!v.eq.pack) h += `<div class="isec locked">No backpack — a pack gives 6–12 extra slots.</div>`;
    h += `${invDetail()}</div>`;
    if (stash) {
      h += `<div class="invR"><div class="invHead"><span>Base storage</span>${btn('stashAll', 'Resources to storage')}</div><div class="slist" data-drop="stash">`;
      const ids = Object.keys(ITEMS).filter((id) => Inv.stashCount(id) > 0 && id !== 'stones');
      if (!ids.length) h += `<div class="note" style="padding:10px">Storage is empty.</div>`;
      for (const id of ids) { const d = ITEMS[id], c = Inv.stashCount(id); const big = d.cat === 'res' || c < 2 ? '' : btn('takeAll:' + id, 'All'); h += `<div class="srow"><span class="iic" style="color:${d.col}">${d.icon}</span><div class="grow"><div class="t">${d.name}</div><div class="s num">${c}</div></div>${d.slot && d.slot !== 'w' ? btn('wear:' + id, 'Wear') : ''}${btn('take:' + id, 'Take 1')}${big}</div>`; }
      h += `</div><p class="note">Drag an item here to put it in storage.</p></div>`;
    } else {
      const bags = nearBags();
      h += `<div class="invR"><div class="invHead"><span>Ground</span></div><div class="slist" data-drop="ground">`;
      if (!bags.length) h += `<div class="note" style="padding:10px">Nothing nearby. Drag an item here to drop it.</div>`;
      bags.forEach((q, bi) => q.data.items.forEach((it, ii) => { const d = ITEMS[it[0]]; if (!d) return; h += `<div class="srow"><span class="iic" style="color:${d.col}">${d.icon}</span><div class="grow"><div class="t">${d.name}</div><div class="s num">${it[1]}</div></div>${btn('gtake:' + bi + ':' + ii, 'Take')}</div>`; }));
      h += `</div><div class="note" style="padding:6px 2px">You can reach storage inside the base. Shortcuts: <b>H</b> heal · <b>G</b> grenade · <b>Q</b> weapon · <b>I</b> inventory</div></div>`;
    }
    h += '</div>';
    body.innerHTML = h;
    bindInv(body);
  }
  let invAvaUrl = null, invAvaLook = null, invAvaV = -1;
  function invAva() { if (invAvaLook !== G.look || invAvaV !== G.look.__v || !invAvaUrl) { const cv = Chars.portrait(G.look, { full: true, w: 150, h: 230, yaw: 0.35 }); invAvaUrl = cv ? cv.toDataURL() : ''; invAvaLook = G.look; invAvaV = G.look.__v; } return invAvaUrl; }
  function selItem() {
    const v = Inv.ensure();
    if (!invSel) return null;
    if (invSel.startsWith('s:')) { const i = +invSel.slice(2); const s = v.slots[i]; return s ? { s, i } : null; }
    if (invSel.startsWith('eq:')) { const k = invSel.slice(3); return v.eq[k] ? { s: { id: v.eq[k], n: 1 }, eq: k } : null; }
    return null;
  }
  function invDetail() {
    const it = selItem();
    if (!it) return `<div class="idet empty">Select an item to see what you can do with it.</div>`;
    const d = ITEMS[it.s.id];
    let acts = '';
    if (it.eq) acts += btn('uneq:' + it.eq, 'Take off');
    else {
      if (d.cat === 'use') acts += btn('use:' + it.s.id, d.cat === 'use' && it.s.id === 'grenade' ? 'Throw' : 'Use', { primary: true });
      if (d.slot) acts += btn('equip:' + it.i, 'Equip', { primary: true });
      if (it.s.n > 1) acts += btn('split:' + it.i, 'Split in half');
      if (nearStash()) acts += btn('stash:' + it.i, 'To storage');
      if (it.s.id !== 'stones') acts += btn('drop:' + it.i, 'Drop');
    }
    return `<div class="idet"><span class="iic big" style="color:${d.col}">${d.icon}</span><div class="grow"><div class="t">${d.name}${it.s.n > 1 ? ' × ' + it.s.n : ''}</div><div class="s">${d.desc}</div><div class="iacts">${acts}</div></div></div>`;
  }
  function bindInv(body) {
    const rer = () => renderPanel(true);
    bindActs(body, {
      use: (id) => { Inv.use(id); rer(); },
      equip: (i) => { Inv.equipFromSlot(+i); invSel = null; rer(); },
      uneq: (k) => { Inv.unequip(k); invSel = null; rer(); },
      split: (i) => { Inv.split(+i); rer(); },
      drop: (i) => { Inv.drop(+i); invSel = null; rer(); },
      stash: (i) => { const s = Inv.ensure().slots[+i]; if (s) { Inv.toStash(s.id, s.n); if (G.flags.stonesHome) Game.stonesHome(); } invSel = null; rer(); },
      take: (id) => { if (!Inv.fromStash(id, 1)) toast('No room in the backpack.'); rer(); },
      takeAll: (id) => { if (!Inv.fromStash(id, Inv.stashCount(id))) toast('No room in the backpack.'); rer(); },
      wear: (id) => { // hoidlast otse selga: vana läheb hoidlasse
        const vv = Inv.ensure(), key = ITEMS[id].slot, prev = vv.eq[key];
        if (prev && !Inv.unequip(key)) { rer(); return; }
        if (prev) { const k = Inv.take(prev, 1); if (k) Inv.stashAdd(prev, 1); }
        if (!Inv.fromStash(id, 1)) { toast('No room.'); rer(); return; }
        const L = Inv.idx(); for (let q = L.length - 1; q >= 0; q--) { const sl = vv.slots[L[q]]; if (sl && sl.id === id) { Inv.equipFromSlot(L[q]); break; } }
        Audio2.ui(); rer();
      },
      gtake: (a) => { const [bi, ii] = a.split(':').map(Number); const q = nearBags()[bi]; if (!q) return; const it = q.data.items[ii]; if (!it) return; const k = Inv.add(it[0], it[1]); if (!k) toast('No room.'); it[1] -= k; q.data.items = q.data.items.filter((x) => x[1] > 0); if (!q.data.items.length) q.gone = true; if (k) Audio2.pickup(); if (it[0] === 'stones' && k) Objectives.check(); rer(); },
      stashAll: () => { const p = Inv.depositResources(); if (p.length) toast(p.join(' · ') + ' to storage'); if (G.flags.stonesHome) Game.stonesHome(); rer(); },
    });
    body.querySelectorAll('.islot').forEach((el) => {
      el.onpointerdown = (e) => {
        const key = el.dataset.slot !== undefined ? 's:' + el.dataset.slot : 'eq:' + el.dataset.eq;
        invDrag = { key, x: e.clientX, y: e.clientY, el, ghost: null, has: !el.classList.contains('empty') };
        try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      };
      el.onpointermove = (e) => {
        if (!invDrag || !invDrag.has) return;
        if (!invDrag.ghost && Math.hypot(e.clientX - invDrag.x, e.clientY - invDrag.y) > 8) {
          const g = el.cloneNode(true); g.classList.add('ghost'); document.body.appendChild(g); invDrag.ghost = g;
        }
        if (invDrag.ghost) { invDrag.ghost.style.left = e.clientX - 28 + 'px'; invDrag.ghost.style.top = e.clientY - 28 + 'px'; }
      };
      el.onpointerup = el.onpointercancel = (e) => {
        const d = invDrag; invDrag = null; if (!d) return;
        if (d.ghost) {
          d.ghost.remove();
          const t = document.elementFromPoint(e.clientX, e.clientY);
          const ts = t && t.closest('[data-slot]'), te = t && t.closest('[data-eq]'), tst = t && t.closest('[data-drop="stash"]');
          const v = Inv.ensure();
          if (d.key.startsWith('s:')) {
            const i = +d.key.slice(2);
            const tg = t && t.closest('[data-drop="ground"]');
            if (ts) Inv.moveSlot(i, +ts.dataset.slot);
            else if (te) Inv.equipFromSlot(i, te.dataset.eq);
            else if (tst && nearStash()) { const s = v.slots[i]; if (s) Inv.toStash(s.id, s.n); if (G.flags.stonesHome) Game.stonesHome(); }
            else if (tg || !t || !t.closest('#pCard')) Inv.drop(i);
          } else if (d.key.startsWith('eq:')) {
            const k = d.key.slice(3);
            if (ts) Inv.unequip(k, +ts.dataset.slot);
            else if (te && te.dataset.eq !== k && (k === 'w1' || k === 'w2') && (te.dataset.eq === 'w1' || te.dataset.eq === 'w2')) { const a = v.eq.w1; v.eq.w1 = v.eq.w2; v.eq.w2 = a; if (!v.eq[v.sel]) v.sel = v.eq.w1 ? 'w1' : 'w2'; }
            else if (tst && nearStash()) { const id = v.eq[k]; if (Inv.unequip(k)) { Inv.toStash(id, 1); } }
          }
          invSel = null; Audio2.ui(); rer(); return;
        }
        invSel = invSel === d.key ? null : (d.has ? d.key : null); Audio2.ui(); rer();
      };
    });
  }
  // ---------- paneelid ----------
  function openPanel(kind, tab) {
    panelKind = kind; panelTab = tab || null;
    $('panel').hidden = false; $('pCard').classList.toggle('wide', kind === 'inv');
    $('touch').hidden = true;
    G.paused = true;
    Input.exitLock(); Input.reset();
    renderPanel();
  }
  function closePanel() {
    $('panel').hidden = true; panelKind = null; G.paused = false; fireConfirm = null;
    $('touch').hidden = !(G.mode === 'play' && Input.isTouch);
    if (G.mode === 'play' && !Input.isTouch && !Input.lockFailed) lockHint(true);
  }
  function isPanelOpen() { return !!panelKind; }
  function tabs(list, cur) {
    $('pTabs').innerHTML = list.map(([k, n]) => `<button class="tab ${k === cur ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('');
    $('pTabs').querySelectorAll('.tab').forEach((b) => (b.onclick = () => { Audio2.ui(); panelTab = b.dataset.tab; renderPanel(); }));
  }
  function renderPanel(soft) {
    const body = $('pBody');
    const scroll = body.scrollTop;
    if (panelKind === 'terminal') renderTerminal(body);
    else if (panelKind === 'crew') renderCrew(body);
    else if (panelKind === 'map') { if (!soft) renderMap(body); }
    else if (panelKind === 'menu') renderMenu(body);
    else if (panelKind === 'help') renderHelp(body);
    else if (panelKind === 'inv') renderInv(body);
    else if (panelKind === 'coop') Net.renderPanel(body);
    else if (panelKind === 'saves') renderSaves(body);
    else if (panelKind === 'garage') renderGarage(body);
    else if (panelKind === 'roomjob') renderRoomJob(body);
    if (soft) body.scrollTop = scroll;
  }
  function btn(id, label, opts = {}) { return `<button class="pbtn ${opts.primary ? 'primary' : ''}" data-act="${id}" ${opts.disabled ? 'disabled' : ''}>${label}</button>`; }
  function bindActs(body, map) { body.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => { const A = b.dataset.act, c = A.indexOf(':'), f = map[c < 0 ? A : A.slice(0, c)]; if (f) { Audio2.ui(); f(c < 0 ? undefined : A.slice(c + 1), b); } })); }

  function openTerminal(tab) {
    if (Net.role === 'guest') { toast('Only the host can use the terminal in co-op.'); Audio2.deny(); return; }
    const term = Base.objsOfType('terminal')[0];
    if (!G.flags.term || (term && term.broken)) { toast('The comms terminal is broken. Repair it in the main building.'); Audio2.deny(); return; }
    if (!Base.power.lightsOn) { toast('The terminal has no power. Repair the generator.'); Audio2.deny(); return; }
    openPanel('terminal', tab || 'turg');
  }
  function renderTerminal(body) {
    $('pTitle').textContent = 'Comms terminal';
    tabs([['turg', 'Market'], ['varbamine', 'Hiring'], ['tookoda', 'Workshop'], ['pank', 'Bank and search']], panelTab);
    let h = '';
    const t = panelTab;
    if (t === 'turg') {
      const p = G.market.price, pl = Math.round(p * 1.6);
      h += `<div class="kv"><div><div class="k">Diamond price today</div><div class="v" style="color:var(--crystal)">${p} ₵/pc</div></div><div><div class="k">Money</div><div class="v" style="color:var(--brass)">${fmtInt(G.res.cr)} ₵</div></div><div><div class="k">Next debt payment</div><div class="v">${fmtInt(G.debt.amount)} ₵</div></div></div>`;
      h += `<div class="row"><div class="grow"><div class="t">Raw diamonds · ${G.res.kris}</div><div class="s">${p} ₵ each. The price changes every morning.</div></div>${btn('sell:10', 'Sell 10', { disabled: G.res.kris < 1 })}${btn('sell:all', 'Sell all · ' + fmtInt(G.res.kris * p) + ' ₵', { primary: true, disabled: G.res.kris < 1 })}</div>`;
      h += `<div class="row"><div class="grow"><div class="t">Polished diamonds · ${G.res.lihv}</div><div class="s">${pl} ₵ each. Build a diamond polisher to polish them.</div></div>${btn('selll', 'Sell all · ' + fmtInt(G.res.lihv * pl) + ' ₵', { primary: true, disabled: G.res.lihv < 1 })}</div>`;
      if ((G.res.acid || 0) > 0 || G.flags.acid) h += `<div class="row"><div class="grow"><div class="t">Acid glands · ${G.res.acid || 0}</div><div class="s">${Aliens.ACID_PRICE} ₵ each. Hunt acid mantises in the desert and harvest their glands.</div></div>${btn('sella', 'Sell all · ' + fmtInt((G.res.acid || 0) * Aliens.ACID_PRICE) + ' ₵', { disabled: !(G.res.acid > 0) })}</div>`;
      if ((G.res.ore || 0) > 0 || G.flags.drill) h += `<div class="row"><div class="grow"><div class="t">Iron ore · ${G.res.ore || 0}</div><div class="s">9 ₵ each. Smelting it at the Ore works gives steel scrap instead.</div></div>${btn('sello', 'Sell all · ' + fmtInt((G.res.ore || 0) * 9) + ' ₵', { disabled: !(G.res.ore > 0) })}</div>`;
      h += `<div class="row"><div class="grow"><div class="t">Raw meat · ${G.res.meat}</div><div class="s">4 ₵ each. The crew needs meat for food.</div></div>${btn('sellm', 'Sell all', { disabled: G.res.meat < 1 })}</div>`;
      h += `<div class="row"><div class="grow"><div class="t">20 scrap</div><div class="s">The cargo shuttle delivers right away. In storage: ${G.res.scrap}.</div></div>${btn('buy:scrap', 'Buy · 45 ₵', { disabled: G.res.cr < 45 })}</div>`;
      h += `<div class="row"><div class="grow"><div class="t">5 meals</div><div class="s">Canned food from the home world. Food: ${G.res.food}.</div></div>${btn('buy:food', 'Buy · 40 ₵', { disabled: G.res.cr < 40 })}</div>`;
      h += `<h4 class="subh">Equipment · delivered to storage</h4>`;
      for (const [k, o] of Object.entries(SHOP)) {
        if (o.needRail && !Inv.hasWeapon('rail')) continue;
        const owned = o.once && Inv.hasWeapon(o.id);
        h += `<div class="row"><span class="iic" style="color:${ITEMS[o.id].col}">${ITEMS[o.id].icon}</span><div class="grow"><div class="t">${o.name}${owned ? ' · have' : ''}</div><div class="s">${ITEMS[o.id].desc} In storage ${Inv.stashCount(o.id)}.</div></div>${owned ? '' : btn('buy:' + k, 'Buy · ' + o.cost + ' ₵', { disabled: G.res.cr < o.cost })}</div>`;
      }
    } else if (t === 'varbamine') {
      const ms = Crew.members();
      const wages = ms.reduce((a, m) => a + m.crew.wage, 0);
      h += `<div class="kv"><div><div class="k">Crew</div><div class="v">${ms.length} / 10</div></div><div><div class="k">Free beds</div><div class="v">${Crew.freeBeds()}</div></div><div><div class="k">Wages per day</div><div class="v" style="color:var(--brass)">${fmtInt(wages)} ₵</div></div></div>`;
      if (!G.candidates.length) h += `<div class="empty">No more candidates today. New ones arrive tomorrow morning.</div>`;
      h += '<div class="cards">';
      for (const c of G.candidates) {
        const ch = Crew.canHire(c);
        h += `<div class="card"><div class="chead">${ava(c.look)}<div><div class="role">${ROLES[c.role].name}</div><h4>${esc(c.name)}</h4><div class="stars">${'★'.repeat(c.skill)}${'☆'.repeat(3 - c.skill)}</div></div></div>
          <div class="trait"><b>${TRAITS[c.trait].name}.</b> ${TRAITS[c.trait].desc} <span style="color:var(--muted)">Courage: ${fearName(fearOf(c))}</span></div><div class="story">„${esc(c.story)}“</div>
          <div class="s" style="font-size:12.5px;color:var(--muted)">${ROLES[c.role].desc}</div>
          <div class="money">${c.wage} ₵ per day · income ${c.fee} ₵</div>
          ${ch.ok ? btn('hire:' + c.id, 'Hire', { primary: true }) : `<button class="pbtn" disabled>${ch.why}</button>`}</div>`;
      }
      h += '</div><p class="note" style="margin-top:10px">Every hire needs their own bed and gets paid every morning. If wages go unpaid, morale drops and people leave. Not everyone may be who they claim to be.</p>';
    } else if (t === 'tookoda') {
      if (!Base.objsOfType('toolaud').length) h += `<div class="empty">A workshop needs a workbench.<br>Build it: Build → Items → Work → Workbench.</div>`;
      else {
        const ups = upgradeList();
        for (const u of ups) {
          const af = !Build.afford(u.cost) && !u.owned && u.avail;
          h += `<div class="row"><div class="grow"><div class="t">${u.name}${u.owned ? ' · have' : ''}</div><div class="s">${u.desc}</div><div class="s num" style="font-size:11.5px;margin-top:2px">${Build.costStr(u.cost)}</div></div>${u.owned ? '' : btn('up:' + u.id, u.avail ? 'Buy' : 'Locked', { primary: af, disabled: !af })}</div>`;
        }
        h += `<h4 class="subh">Craft · goes to storage</h4>`;
        for (const [k, c] of Object.entries(CRAFT)) {
          if (c.needRail && !Inv.hasWeapon('rail')) continue;
          const ok = G.res.scrap >= c.s && G.res.kris >= (c.k || 0);
          h += `<div class="row"><span class="iic" style="color:${ITEMS[c.id].col}">${ITEMS[c.id].icon}</span><div class="grow"><div class="t">${c.name}</div><div class="s num" style="font-size:11.5px">${c.s} scrap${c.k ? ' · ' + c.k + ' diamond' : ''} · in storage ${Inv.stashCount(c.id)}</div></div>${btn('craft:' + k, 'Craft', { disabled: !ok })}</div>`;
        }
      }
    } else if (t === 'pank') {
      const paid = 30000 * G.dk.debt - G.debt.left;
      h += `<div class="kv"><div><div class="k">Debt to the bank</div><div class="v" style="color:var(--danger)">${fmtInt(G.debt.left)} ₵</div></div><div><div class="k">Next payment</div><div class="v">${fmtInt(G.debt.amount)} ₵</div></div><div><div class="k">Due</div><div class="v">Day ${G.debt.nextDay}, morning</div></div></div>`;
      h += `<div class="row"><div class="grow"><div class="t">Pay the next instalment now</div><div class="s">The bank takes the payment automatically on the due date. If you have no money, you get one day's grace.</div></div>${btn('pay', 'Pay ' + fmtInt(G.debt.amount) + ' ₵', { disabled: G.res.cr < G.debt.amount })}</div>`;
      h += `<h4 style="font-family:var(--font-display);letter-spacing:.1em;text-transform:uppercase;color:var(--rust-hi);margin:16px 0 4px">Stoneheart search</h4><p class="note" style="margin:0 0 8px">The heartstones are worth the whole debt. Whoever finds the nest first gets to the stones.</p>`;
      const bar = (name, p, col, extra) => `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>${name}</span><span class="num">${extra || Math.floor(p) + ' %'}</span></div><div class="prog"><i style="width:${clamp(p, 0, 100)}%;background:${col}"></i></div></div>`;
      const sc = Base.objsOfType('skanner').length;
      h += bar('Your deep scanner', G.scan.found || G.flags.nestKnown ? 100 : G.scan.p, 'var(--crystal)', G.flags.nestKnown ? 'nest found' : sc ? null : 'no scanner');
      for (const r of Rivals.list) h += bar(r.name, r.alive ? r.progress : 0, r.id === 'krell' ? '#ff6d55' : '#b796ff', r.alive ? (r.found ? 'nest found' : null) : 'camp destroyed');
      h += `<p class="note" style="margin-top:10px">Rivals play by your rules: they start with one commander and the same money, hire and pay people, buy scrap, build and search for the nest with a deep scanner or by scouting. Destroying their camp core ends their search – and the same goes for you: protect your own base core.</p>`;
      if (G.flags.stonesHome) h += `<div class="row"><div class="grow"><div class="t">The heartstones are in storage</div><div class="s">Sell them and wipe out the whole debt.</div></div>${btn('win', 'Sell the heartstones', { primary: true })}</div>`;
    }
    body.innerHTML = h;
    bindActs(body, {
      sell: (a) => { const n = a === 'all' ? G.res.kris : 10; const v = Econ.sellKris(n); if (v) { toast('+' + fmtInt(v) + ' ₵'); G.flags.sold = true; Objectives.check(); } renderPanel(true); },
      selll: () => { const v = Econ.sellLihv(G.res.lihv); if (v) { toast('+' + fmtInt(v) + ' ₵'); G.flags.sold = true; Objectives.check(); } renderPanel(true); },
      sella: () => { const v = Econ.sellAcid(G.res.acid); if (v) toast('+' + v + ' ₵'); renderPanel(true); },
      sello: () => { const v = Econ.sellOre(G.res.ore); if (v) toast('+' + v + ' ₵'); renderPanel(true); },
      sellm: () => { const v = Econ.sellMeat(G.res.meat); if (v) toast('+' + v + ' ₵'); renderPanel(true); },
      buy: (k) => { if (Econ.buy(k)) toast(k === 'scrap' ? '+20 scrap' : k === 'food' ? '+5 meals' : SHOP[k].name + ' is in storage'); renderPanel(true); },
      craft: (k) => { const c = CRAFT[k]; if (!c) return; if (G.res.scrap < c.s || G.res.kris < (c.k || 0)) { toast('Not enough material'); Audio2.deny(); return; } G.res.scrap -= c.s; G.res.kris -= c.k || 0; Inv.stashAdd(c.id, c.n); Audio2.repair(); toast(c.name + ' ready · in storage'); renderPanel(true); },
      hire: (id) => { const c = G.candidates.find((q) => q.id === id); if (c) { const r = Crew.hire(c); if (r.ok) { G.flags.hiredOnce = true; toast(c.name + ' has been hired'); } else toast(r.why); } renderPanel(true); },
      up: (id) => { buyUpgrade(id); renderPanel(true); },
      pay: () => { if (Econ.payDebtEarly()) { toast('Payment made'); msg('You paid an instalment early. Next payment on day ' + G.debt.nextDay + '.', 'money'); } renderPanel(true); },
      win: () => { closePanel(); Game.victory(); },
    });
  }
  function upgradeList() {
    return [
      { id: 'r2', name: 'Carbine Mk2', desc: 'Damage 22, mag 28, faster fire.', cost: { c: 150, s: 20 }, owned: G.up.rifle >= 2, avail: true },
      { id: 'r3', name: 'Carbine Mk3', desc: 'Damage 30, mag 32, even faster fire.', cost: { c: 350, s: 40 }, owned: G.up.rifle >= 3, avail: G.up.rifle >= 2 },
      { id: 'rail', name: 'Railgun', desc: 'Piercing shot, damage 150. Essential against the Stoneheart. Switch weapons with Q or the button.', cost: { c: 600, s: 60, k: 10 }, owned: G.up.rail, avail: true },
      { id: 'a1', name: 'Suit armour I', desc: '+50 health.', cost: { c: 250, s: 30 }, owned: G.up.armor >= 1, avail: true },
      { id: 'a2', name: 'Suit armour II', desc: '+50 more health.', cost: { c: 500, s: 50, k: 20 }, owned: G.up.armor >= 2, avail: G.up.armor >= 1 },
    ];
  }
  function buyUpgrade(id) {
    const u = upgradeList().find((q) => q.id === id);
    if (!u || u.owned || !u.avail) return;
    const af = Build.afford(u.cost); if (af) { toast(af); Audio2.deny(); return; }
    G.res.cr -= u.cost.c || 0; G.res.scrap -= u.cost.s || 0; G.res.kris -= u.cost.k || 0;
    if (id === 'r2') G.up.rifle = 2; if (id === 'r3') G.up.rifle = 3;
    if (id === 'rail') { G.up.rail = true; const v = Inv.ensure(); if (!v.eq.w2) v.eq.w2 = 'rail'; else Inv.stashAdd('rail', 1); Inv.stashAdd('ammo_c', 10); Player.mag.rail = 5; toast('The railgun is equipped. Charges are in storage.'); }
    if (id === 'a1' || id === 'a2') { G.up.armor++; Player.maxHp = 100 + G.up.armor * 50; Player.hp = Player.maxHp; }
    Player.mag.rifle = Math.min(Player.mag.rifle, weaponStats('rifle').mag);
    Audio2.cash(); toast(u.name + ' is yours');
  }
  function renderCrew(body) {
    $('pTitle').textContent = 'Crew'; $('pTabs').innerHTML = '';
    const ms = Crew.members();
    let h = `<div class="kv"><div><div class="k">People</div><div class="v">${ms.length} / 10</div></div><div><div class="k">Free beds</div><div class="v">${Crew.freeBeds()}</div></div><div><div class="k">Food</div><div class="v">${G.res.food} <small style="font-size:12px;color:var(--muted)">+${G.res.meat} meat</small></div></div></div>`;
    h += `<div class="card lvcard"><h4>You · skills</h4>${Levels.badges('player', true)}<div class="note">Skills grow by doing: carry loot home, fight, work (hold-E jobs) and walk. Each level gives a bonus – hover a badge.</div></div>`;
    if (ms.length) h += `<div class="row"><div class="grow note">Companions come with you and protect you. Key <kbd>V</kbd> calls everyone nearby.</div>${btn('folall', ms.some((m) => !m.crew.follow) ? 'Everyone follow me' : 'Everyone back to work')}</div>`;
    if (!ms.length) h += `<div class="empty">You're still alone here.<br>Hire helpers at the comms terminal. Every person needs a bed.</div>`;
    h += '<div class="cards">';
    const bar = (v) => `<div class="bar ${v < 30 ? 'low' : v < 60 ? 'mid' : ''}"><i style="width:${clamp(v, 0, 100)}%"></i></div>`;
    for (const m of ms) {
      const c = m.crew;
      h += `<div class="card"><div class="chead">${ava(c.look)}<div><div class="role">${ROLES[c.role].name}</div><h4>${esc(c.name)}</h4><div class="stars">${'★'.repeat(c.skill)}${'☆'.repeat(3 - c.skill)}</div></div></div>
        <div class="act">Now: ${esc(c.act || '—')}</div>
        <div class="bars"><span>Health</span>${bar((m.hp / m.maxHp) * 100)}<span>Hunger</span>${bar(c.hunger)}<span>Thirst</span>${bar(c.thirst === undefined ? 90 : c.thirst)}<span>Hygiene</span>${bar(c.hygiene === undefined ? 80 : c.hygiene)}<span>Sleep</span>${bar(c.energy)}<span>Morale</span>${bar(c.morale)}</div>
        <div class="trait"><b>${TRAITS[c.trait].name}.</b> ${TRAITS[c.trait].desc} <span style="color:var(--muted)">Courage: ${fearName(fearOf(c))}</span></div>
        ${Levels.badges(c, false)}
        <div class="money">${c.wage} ₵ per day${c.bed ? '' : ' · <span style="color:var(--danger)">no bed</span>'}</div>
        ${crewGear(m)}
        <div class="row">${btn('fol:' + m.id, c.follow ? 'Send back to work' : 'Ask to follow', c.follow ? { primary: true } : {})}${btn('fire:' + m.id, fireConfirm === m.id ? 'Kinnita: vallanda' : 'Dismiss')}</div></div>`;
    }
    h += '</div>';
    h += `<div class="row" style="margin-top:14px"><input id="cheatIn" placeholder="Code" autocomplete="off" autocapitalize="off" spellcheck="false" style="flex:1;min-width:0;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);color:inherit;font:inherit">${btn('cheat', 'OK')}</div>`;
    body.innerHTML = h;
    const ci = $('cheatIn'); if (ci) ci.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') { tryCode(ci.value); ci.value = ''; } };
    bindActs(body, { cheat: () => { const c = $('cheatIn'); if (c) { tryCode(c.value); c.value = ''; } }, ceq: (a) => { const [id, key] = a.split(':'); const m = ms.find((q) => String(q.id) === id); if (m) cycleCrewGear(m, key); renderPanel(true); },
      fol: (id) => { const m = ms.find((q) => String(q.id) === id); if (m) Crew.setFollow(m, !m.crew.follow); renderPanel(true); },
      folall: () => { const on = ms.some((m) => !m.crew.follow); for (const m of ms) if (m.crew.follow !== on) Crew.setFollow(m, on); renderPanel(true); },
      fire: (id) => { const m = ms.find((q) => String(q.id) === id); if (!m) return; if (fireConfirm === m.id) { Crew.fire(m); fireConfirm = null; } else fireConfirm = m.id; renderPanel(true); } });
  }
  // meeskonna varustus: klõps vahetab hoidlas oleva järgmise eseme vastu (vana läheb hoidlasse)
  const CREW_EQ = [['helmet', 'Helmet'], ['vest', 'Vest'], ['gloves', 'Gloves'], ['boots', 'Boots'], ['pack', 'Bag']];
  function crewGear(m) {
    const eq = Look.ensureEq(m.crew.look) || {};
    const arm = Math.round((1 - Inv.armorMul(eq)) * 100);
    return `<div class="cgear">${CREW_EQ.map(([k, nm]) => { const id = eq[k]; const ic = id ? `<span class="iic" style="color:${ITEMS[id].col}">${ITEMS[id].icon}</span>` : `<span class="iic gh">${ITEMS[EQ_SLOTS[k][1]].icon}</span>`; return `<button class="cgs ${id ? '' : 'empty'}" data-act="ceq:${m.id}:${k}" title="${nm}: ${id ? ITEMS[id].name : 'puudub'} — klõps vahetab hoidlast">${ic}</button>`; }).join('')}<span class="note num">${arm ? '−' + arm + '%' : ''}</span></div>`;
  }
  function cycleCrewGear(m, key) {
    const L = m.crew.look, eq = Look.ensureEq(L); if (!eq) return;
    const all = Object.keys(ITEMS).filter((id) => ITEMS[id].slot === key);
    const cur = eq[key];
    const start = cur ? all.indexOf(cur) + 1 : 0;
    let next = null;
    for (let q = start; q < all.length; q++) if (Inv.stashCount(all[q]) > 0) { next = all[q]; break; }
    if (cur) Inv.stashAdd(cur, 1);
    if (next) { G.stash[next]--; if (G.stash[next] <= 0) delete G.stash[next]; }
    eq[key] = next; Look.touch(L); Audio2.ui();
    if (!next && !cur) toast('No suitable item in storage. Buy one at the comms terminal or take one from enemies.');
    else toast(m.crew.name.split(' ')[0] + ': ' + (next ? ITEMS[next].name : (EQ_SLOTS[key][0] + ' taken')));
  }
  function renderMap(body) {
    $('pTitle').textContent = 'Map'; $('pTabs').innerHTML = '';
    body.innerHTML = `<canvas id="mapCv" width="640" height="640"></canvas>
      <div class="legend"><span><i style="background:#eedfc6"></i>Base</span><span><i style="background:#92d9ff"></i>Comet</span><span><i style="background:#ff6d55"></i>Krell-Varga</span><span><i style="background:#a9a39a"></i>Old city</span><span><i style="background:#b796ff"></i>Clan</span><span><i style="background:#ff8fd0"></i>Stoneheart</span><span><i style="background:#ddb45c"></i>Waypoint / items</span><span><i style="background:#9a8f80"></i>Wreck</span></div>
      <div class="row"><div class="grow note">Tap the map to mark a waypoint on the compass.</div>${btn('clear', 'Remove waypoint', { disabled: !waypoint })}</div>`;
    const cv = $('mapCv');
    drawBigMap(cv);
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * World.SIZE - World.HALF, z = ((e.clientY - r.top) / r.height) * World.SIZE - World.HALF;
      waypoint = { x, z }; Audio2.ui(); drawBigMap(cv);
      body.querySelector('[data-act="clear"]').disabled = false;
    });
    bindActs(body, { clear: () => { waypoint = null; drawBigMap(cv); renderPanel(); } });
  }
  function drawBigMap(cv) {
    const ctx = cv.getContext('2d'), S = cv.width, k = S / World.SIZE;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(mapCanvas, 0, 0, S, S);
    ctx.fillStyle = 'rgba(17,13,11,.18)'; ctx.fillRect(0, 0, S, S);
    const P = (x, z) => [(x + World.HALF) * k, (z + World.HALF) * k];
    for (const w of World.wrecks) { if (w.gone || w.scrap <= 0) continue; const [x, y] = P(w.x, w.z); ctx.fillStyle = w.scrap > 0 ? '#9a8f80' : '#5a5148'; ctx.fillRect(x - 3, y - 3, 6, 6); }
    // rauamaak: nähtud kivid; maagipuuriga tuleb kaasa uuringukaart (kõik kivid)
    for (const o of World.ores) { if (o.gone || o.amount <= 0 || !(o.known || G.flags.drill)) continue; const [x, y] = P(o.x, o.z); ctx.fillStyle = '#c8643c'; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y + 3); ctx.lineTo(x - 4, y + 3); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = 'rgba(238,223,198,.9)';
    for (const b of Bases.list) { ctx.fillStyle = b === Base ? 'rgba(238,223,198,.9)' : 'rgba(255,120,95,.85)'; for (const r of b.rooms.values()) for (const [ci, cj] of r.cells) { const [x, y] = P(b.X0 + ci * b.CS, b.Z0 + cj * b.CS); ctx.fillRect(x, y, b.CS * k + 0.5, b.CS * k + 0.5); } }
    for (const m of markers()) {
      const [x, y] = P(m.x, m.z);
      if (m.approx) { ctx.strokeStyle = m.col; ctx.lineWidth = 2; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(x, y, 28 * k, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.fillStyle = m.col; ctx.strokeStyle = '#120d0b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, m.kind === 'base' ? 8 : 6.5, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.font = '600 13px "Barlow Semi Condensed", sans-serif'; ctx.fillStyle = '#eedfc6'; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 3;
      ctx.strokeText(m.label, x + 10, y + 4); ctx.fillText(m.label, x + 10, y + 4);
    }
    for (const e of Ents.list) if (e.alive && e.team === 'crew') { const [x, y] = P(e.pos.x, e.pos.z); ctx.fillStyle = '#5fd3c4'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill(); }
    const [px, py] = P(Player.pos.x, Player.pos.z);
    const head = Math.atan2(Math.sin(Player.yaw), -Math.cos(Player.yaw));
    ctx.save(); ctx.translate(px, py); ctx.rotate(head);
    ctx.fillStyle = '#e57b42'; ctx.strokeStyle = '#120d0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, 9); ctx.lineTo(0, 4); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.font = '700 15px "Big Shoulders Stencil Display", sans-serif'; ctx.fillStyle = 'rgba(238,223,198,.8)'; ctx.fillText('N', S / 2 - 4, 18);
  }
  function openMenu() { if (G.mode === 'build') { Build.exit(); } openPanel('menu', 'menu'); }
  function renderMenu(body) {
    $('pTitle').textContent = 'Pause';
    tabs([['menu', 'Menu'], ['seaded', 'Settings'], ['logi', 'Radio log']], panelTab);
    let h = '';
    if (panelTab === 'menu') {
      h = `<div class="menu">
        <button class="primary" data-act="resume">${ICON.check} Continue</button>
        <button data-act="term">${ICON.terminal} Terminal</button>
        <button data-act="crew">${ICON.people} Crew</button>
        <button data-act="map">${ICON.map} Map</button>
        <button data-act="build">${ICON.hammer} Build</button>
        <button data-act="coop">${ICON.people} ${Net.active ? (Net.role === 'host' ? 'Co-op: ' + Net.peerCount() + ' joined' : 'Co-op: connected') : 'Co-op: invite a friend'}</button>
        <button data-act="help">${ICON.help} How to play</button>
        <button data-act="save">${ICON.save} Save / load</button>
        <button data-act="quit">${ICON.exit} To main menu</button></div>
        <p class="note" style="margin-top:12px">The game saves by itself every few minutes, every morning and after important events (3 rotating autosaves). Use Save / load to keep a game in a slot or to move it to another device as a file.</p>`;
    } else if (panelTab === 'seaded') {
      const q = Game.quality(), gf = Input.settings.gfx;
      h = `<div class="set">
        <label for="sSens">Look sensitivity</label><input type="range" id="sSens" min="0.3" max="2.5" step="0.05" value="${Input.settings.sens}">
        <label for="sVol">Volume</label><input type="range" id="sVol" min="0" max="1" step="0.05" value="${Input.settings.vol}">
        <label>Invert vertical look</label><div class="seg"><button data-act="inv:0" class="${!Input.settings.invert ? 'on' : ''}">No</button><button data-act="inv:1" class="${Input.settings.invert ? 'on' : ''}">Yes</button></div>
        <label>Graphics preset</label><div class="seg"><button data-act="q:low" class="${q === 'low' ? 'on' : ''}">Low</button><button data-act="q:mid" class="${q === 'mid' ? 'on' : ''}">Medium</button><button data-act="q:high" class="${q === 'high' ? 'on' : ''}">High</button></div>
        <label>Resolution</label><div class="seg">${[[null, 'Auto'], [0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.5, '150%'], [2, '200%']].map(([v, n]) => `<button data-act="gres:${v}" class="${gf.res === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <label for="sView">View distance</label><div class="rowv"><input type="range" id="sView" min="300" max="1400" step="50" value="${gf.view || 1000}"><span id="sViewV">${gf.view || 1000} m</span></div>
        <label for="sFov">Field of view</label><div class="rowv"><input type="range" id="sFov" min="65" max="110" step="1" value="${gf.fov || 88}"><span id="sFovV">${gf.fov || 88}°</span></div>
        <label>Texture quality</label><div class="seg">${[[null, 'Auto'], ['low', 'Low'], ['mid', 'Medium'], ['high', 'High']].map(([v, n]) => `<button data-act="gtex:${v}" class="${(gf.tex || null) === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <label>Shadows</label><div class="seg">${[[null, 'Auto'], ['off', 'Off'], ['mid', 'Medium'], ['high', 'High']].map(([v, n]) => `<button data-act="gsh:${v}" class="${gf.shadows === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <label>Effects</label><div class="seg">${[[null, 'Auto'], [0.5, 'Low'], [0.8, 'Medium'], [1, 'High']].map(([v, n]) => `<button data-act="gfx:${v}" class="${gf.fx === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <label>Glow and smoothing</label><div class="seg">${[[null, 'Auto'], [false, 'Off'], [true, 'On']].map(([v, n]) => `<button data-act="gpo:${v}" class="${gf.post === v ? 'on' : ''}">${n}</button>`).join('')}</div>
        <label>Show FPS</label><div class="seg"><button data-act="gfps:0" class="${!gf.fps ? 'on' : ''}">No</button><button data-act="gfps:1" class="${gf.fps ? 'on' : ''}">Yes</button></div>
        <label>Fullscreen</label><div>${btn('fs', 'Toggle')}</div></div>
        <p class="note" style="margin-top:14px">Rendering at ${Game.pixels[0]}×${Game.pixels[1]} pixels. If the game stutters, lower the resolution or view distance first, then shadows and texture quality. "Auto" follows the graphics preset.</p>`;
    } else {
      h = G.log.slice().reverse().map((l) => `<div class="row"><div class="grow"><div class="s num" style="font-size:11px">P${l.day} · ${l.t}</div><div>${esc(l.text)}</div></div></div>`).join('') || '<div class="empty">The radio is silent.</div>';
    }
    body.innerHTML = h;
    const sens = $('sSens'), vol = $('sVol');
    if (sens) sens.oninput = () => { Input.settings.sens = +sens.value; Input.saveSettings(); };
    if (vol) vol.oninput = () => { Input.settings.vol = +vol.value; Audio2.setVolume(+vol.value); Input.saveSettings(); };
    const sv = $('sView'), sf = $('sFov');
    if (sv) { sv.oninput = () => { $('sViewV').textContent = sv.value + ' m'; }; sv.onchange = () => { Input.settings.gfx.view = +sv.value; Input.saveSettings(); Game.applyGfx(); }; }
    if (sf) sf.oninput = () => { Input.settings.gfx.fov = +sf.value; $('sFovV').textContent = sf.value + '°'; Input.saveSettings(); };
    bindActs(body, {
      resume: () => closePanel(),
      term: () => { closePanel(); openTerminal(); },
      crew: () => { openPanel('crew'); },
      map: () => { openPanel('map'); },
      build: () => { closePanel(); Game.toggleBuild(); },
      coop: () => { openPanel('coop', Net.role === 'guest' ? 'join' : 'host'); },
      help: () => { openPanel('help'); },
      save: () => { openPanel('saves'); },
      quit: () => { Save.save(); closePanel(); Net.leave(); Game.toTitle(); },
      inv: (v) => { Input.settings.invert = v === '1'; Input.saveSettings(); renderPanel(); },
      q: (v) => { Game.setQuality(v); renderPanel(); },
      gres: (v) => { Input.settings.gfx.res = ((v) => (v === 'null' ? null : v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v))(v); Input.saveSettings(); Game.applyGfx(); renderPanel(); },
      gsh: (v) => { Input.settings.gfx.shadows = ((v) => (v === 'null' ? null : v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v))(v); Input.saveSettings(); Game.applyGfx(); renderPanel(); },
      gfx: (v) => { Input.settings.gfx.fx = ((v) => (v === 'null' ? null : v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v))(v); Input.saveSettings(); Game.applyGfx(); renderPanel(); },
      gpo: (v) => { Input.settings.gfx.post = ((v) => (v === 'null' ? null : v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v))(v); Input.saveSettings(); Game.applyGfx(); renderPanel(); },
      gtex: (v) => { Input.settings.gfx.tex = v === 'null' ? null : v; Input.saveSettings(); Game.applyGfx(); renderPanel(); toast(v === 'low' ? 'Textures: low (fastest)' : v === 'mid' ? 'Textures: medium' : v === 'high' ? 'Textures: high (sharpest)' : 'Textures: follow the graphics preset'); },
      gfps: (v) => { Input.settings.gfx.fps = v === '1'; Input.saveSettings(); renderPanel(); },
      fs: () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => toast('Fullscreen isn\'t allowed here')); } catch (e) { toast('Fullscreen isn\'t allowed here'); } },
    });
  }
  // ---------- salvestused ----------
  let svConfirm = null;
  function fmtPlay(sec) { const m = Math.round((sec || 0) / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function renderSaves(body) {
    $('pTitle').textContent = 'Saved games'; $('pTabs').innerHTML = '';
    const inGame = (G.mode === 'play' || G.mode === 'build') && Net.role !== 'guest';
    const byId = {}; for (const r of Save.list()) byId[r.id] = r;
    const ids = [...Save.SLOTS, ...Save.AUTOS.filter((k) => byId[k]).sort((a, b) => byId[b].t - byId[a].t), ...(byId.import ? ['import'] : [])];
    const rows = ids.map((id) => {
      const r = byId[id], manual = Save.SLOTS.includes(id);
      const title = Save.NAMES[id] || id;
      if (!r) return `<div class="svRow"><div class="svThumb">empty</div><div><div class="svName">${title}</div><div class="svMeta">Empty slot</div>
        <div class="svBtns">${inGame ? btn('ss:' + id, 'Save here', { primary: true }) : ''}</div></div></div>`;
      const ok = Save.ok(id), m = r.meta || {};
      const meta = ok ? `${esc(m.pname || '')} · Day ${m.day || '?'} · Debt ${fmtInt(m.debt || 0)} ₵${m.play ? ' · ' + fmtPlay(m.play) : ''}<br>${new Date(r.t).toLocaleString()}${r.ver ? ' · ' + esc(r.ver) : ''}`
        : 'This save is damaged and can\'t be loaded. An older save may still work.';
      const c = svConfirm && svConfirm.id === id ? svConfirm.kind : null;
      return `<div class="svRow ${ok ? '' : 'bad'}"><div class="svThumb" style="${r.thumb ? `background-image:url(${r.thumb})` : ''}">${r.thumb ? '' : 'K73'}</div><div>
        <div class="svName">${title}${r.kind === 'auto' ? '<small>automatic</small>' : ''}</div><div class="svMeta">${meta}</div>
        <div class="svBtns">${ok ? btn('ld:' + id, c === 'ld' ? 'Confirm load' : 'Load', { primary: true }) : ''}${manual && inGame ? btn('ss:' + id, c === 'ss' ? 'Confirm overwrite' : 'Save here') : ''}${ok ? btn('ex:' + id, 'Save to file') : ''}${btn('rm:' + id, c === 'rm' ? 'Confirm delete' : 'Delete')}</div></div></div>`;
    }).join('');
    body.innerHTML = `<div class="svList">${rows}</div>
      <div class="svImp">${btn('imp', 'Open a save file…')}<input type="file" id="svFile" accept=".k73,.json,application/json" hidden></div>
      <p class="note" style="margin-top:10px">Saves are kept in this browser. "Save to file" downloads a .k73 file you can keep as a backup or open on another device with "Open a save file".</p>`;
    const confirm2 = (kind, id, f) => { if (svConfirm && svConfirm.id === id && svConfirm.kind === kind) { svConfirm = null; f(); } else { svConfirm = { kind, id }; renderPanel(true); } };
    bindActs(body, {
      ss: (id) => { const go = () => { toast(Save.saveSlot(id) ? 'Saved to ' + Save.NAMES[id] : 'Saving failed'); setTimeout(() => renderPanel(true), 60); }; if (byId[id]) confirm2('ss', id, go); else go(); },
      ld: (id) => {
        const go = () => { const d = Save.load(id); if (!d) { toast('This save can\'t be loaded'); return; } closePanel(); Audio2.init(); Audio2.resume(); Net.leave(); Game.continueGame(d); };
        if (inGame) confirm2('ld', id, go); else go();
      },
      ex: (id) => { toast(Save.exportFile(id) ? 'Save file downloaded' : 'Download isn\'t allowed here'); },
      rm: (id) => confirm2('rm', id, () => { Save.remove(id); renderPanel(true); if (G.mode === 'title') showTitle(Save.has()); }),
      imp: () => { $('svFile').click(); },
    });
    $('svFile').onchange = (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      Save.importFile(f).then(() => { toast('Save file opened. Press Load to play it.'); renderPanel(true); if (G.mode === 'title') showTitle(Save.has()); })
        .catch((er) => toast(er.message || 'Couldn\'t open the file'));
    };
  }
  function openHelp() { openPanel('help'); }
  function openMap() { openPanel('map'); }
  // ---------- garaaž: sõidukite ostmine, parandamine, müük ----------
  let garageObj = null;
  function openGarage(o) { garageObj = o; openPanel('garage'); }
  function renderGarage(body) {
    $('pTitle').textContent = 'Garage'; $('pTabs').innerHTML = '';
    const o = garageObj, onLift = o ? Vehicles.vehicleOnLift(o) : null;
    let h = `<div class="kv"><div><div class="k">Money</div><div class="v">${fmtInt(G.res.cr)} ₵</div></div><div><div class="k">Scrap</div><div class="v">${fmtInt(G.res.scrap)}</div></div><div><div class="k">On the lift</div><div class="v">${onLift ? esc(Vehicles.nameOf(onLift)) : 'empty'}</div></div></div>`;
    h += '<h4 style="margin:12px 0 6px">Buy</h4><div class="cards">';
    for (const [k, d] of Object.entries(Vehicles.DEF)) {
      if (d.noBuy) continue;
      const why = Vehicles.canBuy(k, o);
      h += `<div class="card"><h4>${esc(d.name)}</h4><div class="act">${esc(d.desc)}</div>
        <div class="trait">${d.hp} hp · top speed ${Math.round(d.maxSpeed * 3.6)} km/h · cargo ${d.cargoCap}${d.gun ? ' · rear machine gun' : ''}</div>
        <div class="row">${btn('vbuy:' + k, 'Buy · ' + fmtInt(d.cost.c) + ' ₵ + ' + d.cost.s + ' scrap', { primary: !why, disabled: !!why })}</div>${why ? `<div class="note">${esc(why)}</div>` : ''}</div>`;
    }
    h += '</div>';
    const own = Vehicles.owned();
    h += '<h4 style="margin:14px 0 6px">Your vehicles</h4>';
    if (!own.length) h += '<div class="empty">No vehicles yet.</div>';
    else {
      h += '<div class="cards">';
      for (const v of own) {
        const near = o && Math.hypot(v.x - o.cx, v.z - o.cz) < 9, d = Math.round(Math.hypot(v.x - Player.pos.x, v.z - Player.pos.z));
        const rc = Vehicles.repairCost(v);
        h += `<div class="card"><h4>${esc(Vehicles.nameOf(v))}${v.dead ? ' (wreck)' : ''}</h4><div class="act">${Math.round(v.hp)} / ${v.maxHp} hp · ${d} m away · cargo: ${esc(Vehicles.cargoText(v))}</div>
          <div class="row">${v.dead ? '' : btn('vrep:' + v.id, rc > 0 ? 'Repair · ' + rc + ' scrap' : 'In good shape', { disabled: !near || rc <= 0 || G.res.scrap < rc })}${v.dead ? '' : btn('vsell:' + v.id, 'Sell', { disabled: !near })}</div>${!near && !v.dead ? '<div class="note">Bring it to the garage to repair or sell it.</div>' : ''}</div>`;
      }
      h += '</div>';
    }
    body.innerHTML = h;
    const byId = (id) => Vehicles.list.find((v) => String(v.id) === id);
    bindActs(body, {
      vbuy: (k) => { if (Vehicles.buy(k, o)) closePanel(); else renderPanel(true); },
      vrep: (id) => { const v = byId(id); if (v) Vehicles.repair(v); renderPanel(true); },
      vsell: (id) => { const v = byId(id); if (v) Vehicles.sell(v); renderPanel(true); },
    });
  }
  // ---------- toa ülesanne ----------
  let jobRoom = 0;
  function openRoomJob(rid) { jobRoom = rid; openPanel('roomjob'); }
  function renderRoomJob(body) {
    const r = Base.rooms.get(jobRoom);
    $('pTitle').textContent = 'Room job'; $('pTabs').innerHTML = '';
    if (!r) { body.innerHTML = '<div class="empty">This room no longer exists.</div>'; return; }
    const items = {}; for (const o of Base.objs.values()) if (!o.lv && Base.roomAt(o.i, o.j) === jobRoom) items[OBJ[o.type].name] = (items[OBJ[o.type].name] || 0) + 1;
    const st = Base.roomJobStatus(jobRoom);
    let h = `<div class="kv"><div><div class="k">Room</div><div class="v">${r.cells.length} tiles</div></div><div><div class="k">Job</div><div class="v">${st ? esc(st.def.name) : '—'}</div></div><div><div class="k">Bonus</div><div class="v" style="color:${st && st.ok ? '#97d276' : '#ff8a6a'}">${st ? (st.ok ? 'active' : 'off') : '—'}</div></div></div>`;
    h += `<p class="note">Items now: ${Object.entries(items).map(([n, c]) => esc(n) + (c > 1 ? ' ×' + c : '')).join(', ') || 'none'}${st && !st.ok ? ' · <b>' + esc(st.why) + '</b>' : ''}</p>`;
    h += '<div class="cards">';
    for (const [k, d] of Object.entries(ROOM_PURPOSES)) {
      const on = st && st.key === k;
      const allowed = d.allow.map((t) => OBJ[t] ? OBJ[t].name : t).join(', ');
      h += `<div class="card"><h4>${esc(d.name)}</h4><div class="act">${esc(d.bonus)}</div><div class="trait"><b>Needs:</b> ${esc(d.needTxt)}<br><b>Only:</b> ${esc(allowed)}</div>
        <div class="row">${btn('rjob:' + k, on ? 'Chosen' : 'Choose', { primary: on })}</div></div>`;
    }
    h += '</div>';
    if (st) h += `<div class="row" style="margin-top:10px">${btn('rjob:none', 'Remove the job')}</div>`;
    body.innerHTML = h;
    bindActs(body, { rjob: (k) => { Base.setRoomJob(jobRoom, k === 'none' ? null : k); const s2 = Base.roomJobStatus(jobRoom); if (s2) toast(s2.ok ? s2.def.name + ' – bonus active!' : s2.def.name + ' – ' + s2.why); renderPanel(true); } });
  }
  // salakood meeskonna menüüs
  function tryCode(v) {
    const code = String(v || '').trim().toLowerCase();
    if (code === 'money') {
      G.res.cr += 10000; G.res.scrap += 10000;
      Audio2.cash(); toast('Code accepted: +10 000 ₵ and +10 000 scrap'); msg('Someone wired 10 000 ₵ and a shipment of building material to the station.', 'money');
      return true;
    }
    if (code) toast('Unknown code');
    return false;
  }
  let codeBuf = '';
  window.addEventListener('keydown', (e) => {
    if (panelKind !== 'crew' || (document.activeElement && document.activeElement.id === 'cheatIn')) return;
    if (e.key && e.key.length === 1) { codeBuf = (codeBuf + e.key.toLowerCase()).slice(-12); if (codeBuf.endsWith('money')) { codeBuf = ''; tryCode('money'); } }
  });
  function openCrew() { if (Net.role === 'guest') { toast('Only the host manages the crew in co-op. Press V near people to take them along.'); return; } openPanel('crew'); }
  function renderHelp(body) {
    $('pTitle').textContent = 'How to play'; $('pTabs').innerHTML = '';
    body.innerHTML = `<div class="help">
      <h4>The story</h4><p>This was a colony world getting rich fast. Then a huge ship that was refuelling in orbit came down in the desert – and out of the wreck crawled the <b>Stoneheart</b>, a giant alien. Its workers, the acid mantises and the bug swarms, took the planet over. The colonists fled and left everything behind.</p>
      <p>Now someone has invented the <b>base heart</b>: a device whose hum keeps the sandworms away from buildings. People can settle here again. Whoever brings in the Stoneheart's heartstones – the proof that it is dead – gets the colonisation rights to the whole planet. That proof is worth a fortune.</p>
      <p>The ruins of the <b>old colony city</b> lie at the edge of the map, farther out than any camp. The noise and the lights draw aliens there, but the city is full of scrap and abandoned gear. Old <b>road tunnels</b> lead through the mountains – hippo-sized burrow beasts live in them, but the tunnel crews left gear behind that you can't buy anywhere (an arc thrower and an exo rig). A half-built work <b>mech</b> stands in a gantry on the city plaza: find its five parts in the city buildings, fit them and you get a walking armour with a minigun.</p>
      <h4>Objective</h4><p>Keep the station and its heart alive, pay the bank its instalments and kill the Stoneheart. Its heartstones prove the kill and wipe out the whole debt. Two rivals are hunting the same thing.</p>
      <h4>Phone controls</h4><ul><li>Left thumb: move. Push all the way to run.</li><li>Right side: look around. Slide your finger on the fire button to aim at the same time.</li><li>The action button appears when there's something to do. Some actions must be held.</li><li>The hammer opens building, the minimap opens the big map.</li></ul>
      <h4>Computer controls</h4><ul><li><kbd>WASD</kbd> move, <kbd>Shift</kbd> run, <kbd>Space</kbd> jump, mouse to look and shoot, right button or <kbd>Z</kbd> aims down the sights (more accurate, slower).</li><li><kbd>V</kbd> call nearby companions to follow you (press again to send them back). In front of a companion <kbd>E</kbd> calls one.</li><li><kbd>E</kbd> action (hold), <kbd>R</kbd> reload, <kbd>Q</kbd> switch weapon.</li><li><kbd>B</kbd> build, <kbd>T</kbd> terminal, <kbd>C</kbd> crew, <kbd>M</kbd> map, <kbd>Esc</kbd> pause.</li><li>While building: <kbd>WASD</kbd> move the camera, <kbd>Q</kbd>/<kbd>E</kbd> rotate, <kbd>R</kbd> rotate item, <kbd>Ctrl+Z</kbd> undo.</li></ul>
      <h4>Building</h4><p>Drag out a room on the floor like in The Sims. A door appears by itself; you can add more doors and windows. Put items in rooms: beds, table, stove, workbench, scanner. Cannons, solar panels, radar and floodlights go outside. Every device needs power. Give rooms a <b>Room job</b> (barracks, canteen, workshop, lab …): when only the right items are inside, the room gives a bonus. Build the <b>Ore works</b> and buy an ore drill there to mine the reddish iron ore rocks in the desert; smelt the ore into steel scrap or sell it.</p>
      <h4>Money and food</h4><p>Comets bring raw diamonds. Collect them before the rivals and take them to the base; storage fills when you step inside. Sell them at the terminal. Desert goats give meat, which the stove turns into food. Every hire eats and wants wages every morning.</p>
      <h4>Threats</h4><p>Sand stalkers come out at night. Spineshields won't attack if you keep your distance, but diamonds grow on their backs. Acid mantises – the Stoneheart's workers – roam in packs and now and then march on a base heart. The night swarms go for the <b>base heart</b> and the <b>loudest machines</b> (generators, factories, cannons) and chew through locked doors – they only bite people who get in their way. The bigger your base, the bigger the swarms and raids. Rival raiders go for your base heart too. Doors are locked to strangers: they must hack a lock (30 s) or shoot the door in – and so must you at their camps. <b>If a base heart is destroyed, its hum stops and a sandworm swallows the whole base.</b></p>
      <h4>Stoneheart</h4><p>Build the deep scanner to find the nest. Do not go alone: you need a full squad – at least <b>8 fighters</b> – and a <b>vehicle with a machine gun</b>. The crystal nodes on its back regrow if you stop shooting them. When they all break, the heart is exposed, but only heavy weapons (the buggy machine gun, railgun or grenade launcher) really crack it. Jump over the shockwave.</p></div>`;
  }

  // ---------- ehitus-UI ----------
  function showBuild(on) {
    $('build').hidden = !on;
    $('hud').hidden = on;
    if (on) { $('bRes').innerHTML = resChips(); }
    else showHUD(true);
  }
  // ehitusmenüü: tööriistad rühmadena (Toad / Uksed ja aknad / Esemed / Kujundus / Lammuta),
  // esemed võrgustikus, otsing, "kõik" ja "viimati kasutatud", taskukohased eespool
  const BGROUPS = [['rooms', 'Rooms', 'room', [['wall', 'Room / wall'], ['upper', '2nd floor'], ['tall', 'Tall room']]],
    ['open', 'Doors & windows', 'door', [['door', 'Door'], ['doorW', 'Wide door'], ['window', 'Window'], ['windowW', 'Wide window'], ['windowT', 'Tall window 2×2']]],
    ['floor', 'Balcony & floor', 'box', [['floor', 'Balcony / floor']]],
    ['obj', 'Items', 'box', [['obj', 'Items']]],
    ['deco', 'Jobs & paint', 'brush', [['job', 'Room job'], ['paint', 'Paint']]],
    ['demolish', 'Demolish', 'trash', [['demolish', 'Demolish']]]];
  const bLast = {};
  function bGroupOf(t) { for (const g of BGROUPS) if (g[3].some(([k]) => k === t)) return g[0]; return null; }
  function itemMatches(S, k, d) {
    if (d.fixed) return false;
    if (S.level && (d.where === 'out' || d.needsUpper)) return false;
    const q = (S.q || '').trim().toLowerCase();
    if (q) return (d.name + ' ' + (d.desc || '') + ' ' + k).toLowerCase().includes(q);
    if (S.cat === 'all') return true;
    if (S.cat === 'recent') return (S.recent || []).includes(k);
    return d.cat === S.cat;
  }
  function renderItems(S) {
    const el = $('bItems'); if (!el) return;
    const list = Object.entries(OBJ).filter(([k, d]) => itemMatches(S, k, d));
    if (S.cat === 'recent' && !(S.q || '').trim()) list.sort((a, b) => S.recent.indexOf(a[0]) - S.recent.indexOf(b[0]));
    else list.sort((a, b) => (Build.afford(a[1].cost) ? 1 : 0) - (Build.afford(b[1].cost) ? 1 : 0));   // afford() tagastab puuduse kirjelduse
    const cs = (have, need, unit) => (need ? `<span class="${have >= need ? 'ok' : 'no'}">${need} ${unit}</span> ` : '');
    let h = '';
    for (const [k, d] of list) {
      const af = Build.afford(d.cost);
      const where = d.where === 'out' ? '<i class="tag out">outdoor</i>' : d.where === 'in' ? '<i class="tag in">indoor</i>' : '';
      const pw = d.power > 0 ? '<i class="tag pw">' + d.power + '⚡</i>' : d.power < 0 ? '<i class="tag gen">+' + -d.power + '⚡</i>' : '';
      const th = SIG[k] && (SIG[k][0] + SIG[k][1]) >= 3 ? '<i class="tag th">noise +' + (SIG[k][0] + SIG[k][1] + 1) + '</i>' : '';
      const catN = (OBJ_CATS.find((c) => c[0] === d.cat) || [, ''])[1];
      h += `<button class="item ${S.item === k ? 'on' : ''} ${af ? 'na' : ''}" data-i="${k}"><b>${d.name}</b><span class="c">${cs(G.res.scrap, d.cost.s, 'scrap')}${cs(G.res.cr, d.cost.c, '₵')}${cs(G.res.kris, d.cost.k, 'diam.')}</span><span class="tags">${where}${pw}${th}${S.cat === 'all' || S.cat === 'recent' || S.q ? '<i class="tag">' + catN + '</i>' : ''}</span><span class="d">${d.desc}</span></button>`;
    }
    if (!list.length) h = `<div class="bEmpty">${S.cat === 'recent' && !S.q ? 'Nothing placed yet. Pick from a category.' : 'Nothing found.'}</div>`;
    el.innerHTML = h;
    el.querySelectorAll('.item').forEach((b) => (b.onclick = () => {
      Audio2.ui(); const k = b.dataset.i;
      S.recent = [k, ...(S.recent || []).filter((x) => x !== k)].slice(0, 12);
      try { localStorage.setItem('k73_recent', JSON.stringify(S.recent)); } catch (e) { /* ei salvesta */ }
      Build.selectItem(k);
    }));
  }
  function buildTools(S) {
    if (!S.recent) { try { S.recent = JSON.parse(localStorage.getItem('k73_recent') || '[]'); } catch (e) { S.recent = []; } }
    const grp = bGroupOf(S.tool);
    if (grp) bLast[grp] = S.tool;
    // ülemine rida: rühmad + korrus + vaade
    let t = '<div class="bgroups">' + BGROUPS.filter((g) => g[0] !== 'floor' || S.level).map(([k, n, ic]) => `<button class="tool grp ${grp === k ? 'on' : ''}" data-g="${k}">${ICON[ic]}<span>${n}</span></button>`).join('') + '</div>';
    t += `<div class="butil"><button class="tool ${S.level ? 'on' : ''}" data-t="level">${ICON.room}<span>${S.level ? 'Floor 2' : 'Floor 1'}</span></button><button class="tool ${S.tool === 'look' ? 'on' : ''}" data-t="look">${ICON.eye}<span>View</span></button></div>`;
    $('bTools').innerHTML = t;
    $('bTools').querySelectorAll('.grp').forEach((b) => (b.onclick = () => { Audio2.ui(); const g = BGROUPS.find((x) => x[0] === b.dataset.g); const tools = g[3].filter(([k]) => k !== 'floor' || S.level); Build.setTool(bLast[g[0]] && tools.some(([k]) => k === bLast[g[0]]) ? bLast[g[0]] : tools[0][0]); }));
    $('bTools').querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { Audio2.ui(); Build.setTool(b.dataset.t); }));
    let h = '';
    const G0 = BGROUPS.find((x) => x[0] === grp);
    if (G0 && G0[3].length > 1) {
      const sub = G0[3].filter(([k]) => k !== 'floor' || S.level);
      h += '<div id="bSub">' + sub.map(([k, n]) => `<button class="cat ${S.tool === k ? 'on' : ''}" data-s="${k}">${n}</button>`).join('') + '</div>';
    }
    if (S.tool === 'obj') {
      const cnt = (c) => Object.entries(OBJ).filter(([k, d]) => !d.fixed && d.cat === c && !(S.level && (d.where === 'out' || d.needsUpper))).length;
      const cats = [['recent', 'Recent'], ['all', 'All'], ...OBJ_CATS];
      h += `<div id="bCats"><input id="bSearch" type="search" placeholder="Search items…" value="${(S.q || '').replace(/"/g, '&quot;')}" autocomplete="off">${cats.map(([k, n]) => `<button class="cat ${S.cat === k && !S.q ? 'on' : ''}" data-c="${k}">${n}${k !== 'recent' && k !== 'all' ? ' <small>' + cnt(k) + '</small>' : ''}</button>`).join('')}</div><div id="bItems"></div>`;
    }
    $('bBody').innerHTML = h;
    $('bBody').querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { Audio2.ui(); Build.setTool(b.dataset.s); }));
    $('bBody').querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { Audio2.ui(); S.cat = b.dataset.c; S.q = ''; buildTools(S); }));
    if (S.tool === 'obj') {
      const si = $('bSearch');
      si.oninput = () => { S.q = si.value; $('bBody').querySelectorAll('[data-c]').forEach((b) => b.classList.toggle('on', !S.q && b.dataset.c === S.cat)); renderItems(S); };
      si.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Escape') { si.value = ''; S.q = ''; renderItems(S); si.blur(); } };
      renderItems(S);
    }
    $('bUndo').disabled = false;
  }
  function buildInfo(t, cls) { const el = $('bInfo'); el.textContent = t || ''; el.className = cls || ''; }
  function buildConfirm(c) {
    const el = $('bConfirm');
    if (!c || !Input.isTouch) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `${c.canRotate ? `<button class="bbtn" id="cRot">${ICON.rotR}<span>Rotate</span></button>` : ''}<button class="bbtn" id="cCan">${ICON.close}<span>Cancel</span></button><button class="bbtn primary" id="cOk" ${c.ok ? '' : 'disabled'}>${ICON.check}<span>${c.label} · ${c.cost}</span></button>`;
    if (c.canRotate) $('cRot').onclick = () => { Audio2.ui(); Build.rotate(); };
    $('cCan').onclick = () => { Audio2.ui(); Build.cancelPending(); };
    $('cOk').onclick = () => { Build.commitPending(); };
  }

  // ---------- magamine ----------
  function sleep() {
    if (Net.role === 'guest') { toast('Only the host can sleep through the night in co-op.'); return; }
    const f = $('fade');
    f.style.opacity = 1;
    G.paused = true;
    setTimeout(() => { Econ.sleep(); Player.hp = Player.maxHp; }, 950);
    setTimeout(() => { f.style.opacity = 0; G.paused = false; toast('You wake up rested. A new day.'); }, 1700);
  }

  // ---------- avaekraan / lõpp ----------
  function showTitle(hasSave) {
    $('title').hidden = false; showHUD(false); $('build').hidden = true; $('end').hidden = true;
    const ds = $('diffSeg');
    ds.innerHTML = Object.entries(DIFFS).map(([k, d]) => `<button class="${G.diff === k ? 'on' : ''}" data-d="${k}">${d.name}</button>`).join('');
    ds.querySelectorAll('button').forEach((b) => (b.onclick = () => { G.diff = b.dataset.d; Audio2.ui(); showTitle(hasSave); }));
    const tb = $('titleBtns');
    tb.innerHTML = `${hasSave ? '<button class="primary" id="tCont">Continue</button>' : ''}<button class="${hasSave ? '' : 'primary'}" id="tNew">Start a new game</button><button id="tLoad">Load game</button><button id="tJoin">Join a friend (co-op)</button><button id="tHelp">How to play</button>`;
    $('tLoad').onclick = () => { Audio2.init(); openPanel('saves'); };
    $('tJoin').onclick = () => { Audio2.init(); Audio2.resume(); Creator.open(() => { showTitle(hasSave); openPanel('coop', 'join'); }); };
    $('tNew').onclick = () => { Audio2.init(); Audio2.resume(); Creator.open(() => Game.newGame()); };
    if (hasSave) $('tCont').onclick = () => { Audio2.init(); Audio2.resume(); Game.continueGame(); };
    $('tHelp').onclick = () => { Audio2.init(); openPanel('help'); };
    const d = DIFFS[G.diff];
    $('ledger').innerHTML = `<span>Debt to the bank</span><b>${fmtInt(30000 * d.debt)} ₵</b><span>First payment</span><b>on the morning of day 4</b><span>Helpers up to</span><b>10 people</b><span>Rivals</span><b>2 and they're not friendly</b>`;
  }
  function hideTitle() { $('title').hidden = true; }
  function end(kind, sub, stats) {
    showHUD(false); $('build').hidden = true; $('panel').hidden = true; panelKind = null;
    const el = $('end'); el.hidden = false;
    const t = { win: 'Debt paid off', pankrot: 'Bankrupt', rival: 'The others got there first', core: 'Core destroyed' }[kind] || 'The end';
    const s = stats;
    el.firstElementChild.innerHTML = `<h2 class="${kind === 'win' ? 'win' : 'lose'}">${t}</h2><p>${sub}</p>
      <div class="ledger"><span>Days in the desert</span><b>${s.day}</b><span>Diamonds collected</span><b>${s.crystals}</b><span>Comets seen</span><b>${s.comets}</b><span>Crew at the end</span><b>${s.crew}</b><span>Debt remaining</span><b>${fmtInt(s.debt)} ₵</b></div>
      <div class="tbtns"><button class="primary" id="eNew">New game</button><button id="eTitle">To main menu</button></div>`;
    $('eNew').onclick = () => { el.hidden = true; Game.newGame(); };
    $('eTitle').onclick = () => { el.hidden = true; Game.toTitle(); };
  }
  function rotHint(on) { $('rotHint').hidden = !on; }
  return {
    bubble, init, msg, toast, banner, damage, hitMarker, armorHit, whiz, shake, getShake, joy, lockHint, showHUD, update, updateObjective,
    openTerminal, openCrew, openMap, openMenu, openHelp, openInv, invDirty, closePanel, isPanelOpen, openPanel, btn, bindActs, esc, tabs,
    openRoomJob, openGarage, showBuild, buildTools, buildInfo, buildConfirm, sleep, showTitle, hideTitle, end, buildMapCanvas, rotHint, renderPanel,
    get panelKind() { return panelKind; }, get panelTab() { return panelTab; },
    get waypoint() { return waypoint; }, set waypoint(v) { waypoint = v; },
  };
})();
