// ============================================================
//  TEGELASE LOOJA: välimus enne uut mängu
// ============================================================
const Creator = (() => {
  let look = null, name = '', yaw = 0.35, onDone = null, drag = null, dirty = true;
  const $ = (id) => document.getElementById(id);
  const css = (c) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const NAMES_M = ['Tõnu', 'Kalev', 'Margus', 'Rein', 'Andres', 'Indrek', 'Jaan', 'Peeter'], NAMES_F = ['Kersti', 'Maarja', 'Tiina', 'Liina', 'Kristi', 'Triin', 'Helen', 'Ene'];
  const same = (a, b) => a && b && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 0.04;

  function open(done) {
    openT = 0;
    onDone = done;
    look = G.look ? JSON.parse(JSON.stringify(Look.clean(G.look))) : Look.player();
    name = G.pname || 'Tõnu';
    $('creator').hidden = false; $('title').hidden = true;
    render();
    const cv = $('crCv');
    cv.onpointerdown = (e) => { drag = { x: e.clientX }; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ } };
    cv.onpointermove = (e) => { if (!drag) return; yaw += (e.clientX - drag.x) * 0.012; drag.x = e.clientX; dirty = true; };
    cv.onpointerup = cv.onpointercancel = () => { drag = null; };
    $('crL').onclick = () => { yaw -= 0.6; dirty = true; };
    $('crR').onclick = () => { yaw += 0.6; dirty = true; };
    loop();
  }
  function close(go) { $('creator').hidden = true; onDone = null; if (!go && G.mode === 'title') $('title').hidden = false; }
  function isOpen() { return !$('creator').hidden; }
  function loop() {
    if (!isOpen()) return;
    if (dirty) { draw(); }
    requestAnimationFrame(loop);
  }
  let openT = 0;
  function status(t) { let el = $('crStat'); if (!el) { el = document.createElement('div'); el.id = 'crStat'; $('crPrev').appendChild(el); } el.textContent = t || ''; el.hidden = !t; }
  function draw() {
    openT++;
    try {
      if (GFX.S.noSkin) { dirty = false; status('Character graphics didn\'t start: ' + (GFX.S.skinErr || '?') + ' [' + GFX.glInfo() + ']'); return; }
      if (!Chars.ready) { if (openT > 240) status('Characters didn\'t load.'); return; }
      const T = Chars.types[look.type];
      if (!T || !T.alb || !T.mask) { if (openT > 240) status('Textures didn\'t load (' + (T ? (T.alb ? 'värv ok' : 'värv puudub') + ', ' + (T.mask ? 'mask ok' : 'mask puudub') : 'tüüp puudub') + ') [' + GFX.glInfo() + ']'); return; }
      dirty = false;
      Look.touch(look);
      const face = EXPR[expr] || null;
      const a = Chars.portrait(look, { full: true, yaw, w: 300, h: 440, canvas: $('crCv'), face });
      Chars.portrait(look, { full: false, yaw: 0.25, w: 184, h: 224, canvas: $('crFace'), face });
      if (!a) status('Portrait failed. [' + GFX.glInfo() + ']');
      else if (GFX.S.portraitErr || GFX.S.portraitEmpty) status('Portrait empty: ' + (GFX.S.portraitErr || 'pikslid tühjad') + ' [' + GFX.glInfo() + ']');
      else status('');
    } catch (e) { dirty = false; status('Error: ' + (e && e.message || e)); console.error(e); }
  }
  // näoilmed (Vitruviani FACS): blink, talk, smile, angry, sad, fear, oo, brows
  let expr = 'neutral';
  const EXPR = { neutral: null, smile: new Float32Array([0, 0, 1, 0, 0, 0, 0, 0.2]), talk: new Float32Array([0, 0.75, 0.2, 0, 0, 0, 0.3, 0.2]), angry: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0]),
    sad: new Float32Array([0, 0, 0, 0, 1, 0, 0, 0]), fear: new Float32Array([0, 0.25, 0, 0, 0, 1, 0, 0.8]), blink: new Float32Array([1, 0, 0, 0, 0, 0, 0, 0]) };
  function sw(id, list, cur) {
    return `<div class="sw" id="${id}">${list.map((c, i) => `<button data-i="${i}" class="${same(c, cur) ? 'on' : ''}" style="background:${css(c)}" aria-label="Värv ${i + 1}"></button>`).join('')}</div>`;
  }
  function seg(id, opts, cur) { return `<div class="seg2" id="${id}">${opts.map(([k, n]) => `<button data-k="${k}" class="${k === cur ? 'on' : ''}">${n}</button>`).join('')}</div>`; }
  function render() {
    const male = look.type === 'male';
    const hcm = Math.round((look.height || 1.8) * 100);
    const build = look.build || 1;
    const bName = build < 0.95 ? 'Slim' : build < 1.05 ? 'Medium' : build < 1.11 ? 'Strong' : 'Stocky';
    $('crCtl').innerHTML = `<h2>Your character</h2><div class="sub">The last hope of a family in debt. Who are you?</div>
      <div class="crRow"><span>Name</span><input type="text" id="crName" maxlength="24" value="${name.replace(/"/g, '&quot;')}"></div>
      <div class="crRow"><span>Body</span>${seg('crSex', [['male', 'Male'], ['female', 'Female']], look.type)}</div>
      <div class="crRow"><span>Skin tone</span>${sw('crSkin', Look.SKIN, look.skin)}</div>
      <div class="crRow"><span>Hairstyle</span>${seg('crStyle', (male ? Look.STYLES_M : Look.STYLES_F).map((k) => [k, Look.STYLE_NAMES[k]]), look.hairStyle)}</div>
      <div class="crRow"><span>Hair colour</span>${sw('crHair', Look.HAIR, look.hair)}</div>
      ${male ? `<div class="crRow"><span>Beard</span>${seg('crBeard', Look.BEARDS.map((k) => [k, Look.BEARD_NAMES[k]]), look.beardStyle || (look.beard ? 'full' : 'none'))}</div>` : ''}
      <div class="crRow"><span>Expression</span>${seg('crExpr', [['neutral', 'Calm'], ['smile', 'Smile'], ['talk', 'Talk'], ['angry', 'Angry'], ['sad', 'Sad'], ['fear', 'Afraid'], ['blink', 'Eyes shut']], expr)}</div>
      <div class="crRow"><span>Height</span><div class="rvw"><input type="range" id="crH" min="${male ? 165 : 152}" max="${male ? 200 : 186}" value="${hcm}"><span class="rv">${hcm} cm</span></div></div>
      <div class="crRow"><span>Build</span><div class="rvw"><input type="range" id="crB" min="88" max="116" value="${Math.round(build * 100)}"><span class="rv">${bName}</span></div></div>
      <div class="crRow"><span>Equipment</span>${seg('crGear', [['1', 'Light'], ['2', 'Medium'], ['3', 'Heavy']], String(look.gear === undefined ? 3 : look.gear))}</div>
      <div class="crRow"><span>Armour colour</span><div class="sw" id="crGearC">${Look.GEAR.map((c, i) => `<button data-i="${i}" class="${(look.gearCol || 0) === i ? 'on' : ''}" style="background:${css([0.4 * c[0], 0.41 * c[1], 0.38 * c[2]])}" aria-label="Toon ${i + 1}"></button>`).join('')}</div></div>
      <div class="crRow"><span>Suit</span>${sw('crTop', Look.TOPS, look.top)}</div>
      <div class="crRow"><span>Trousers</span>${sw('crBot', Look.BOTTOMS, look.bottom)}</div>
      <div id="crBtns"><button class="primary" id="crGo">Start</button><button id="crRnd">Random</button><button id="crBack">Back</button></div>`;
    $('crName').oninput = (e) => { name = e.target.value; };
    const bindSw = (id, key, list) => $(id).querySelectorAll('button').forEach((b) => (b.onclick = () => { look[key] = list[+b.dataset.i].slice(); Audio2.ui(); changed(); }));
    bindSw('crSkin', 'skin', Look.SKIN); bindSw('crHair', 'hair', Look.HAIR); bindSw('crTop', 'top', Look.TOPS); bindSw('crBot', 'bottom', Look.BOTTOMS);
    $('crSex').querySelectorAll('button').forEach((b) => (b.onclick = () => {
      if (look.type === b.dataset.k) return;
      look.type = look.sex = b.dataset.k;
      look.height = b.dataset.k === 'male' ? 1.8 : 1.68;
      if (b.dataset.k === 'female') { look.beard = false; look.beardStyle = 'none'; look.hairStyle = 'bun'; if (NAMES_M.includes(name)) name = NAMES_F[0]; }
      else { look.hairStyle = 'short'; if (NAMES_F.includes(name)) name = NAMES_M[0]; }
      Audio2.ui(); changed();
    }));
    $('crExpr').querySelectorAll('button').forEach((b) => (b.onclick = () => { expr = b.dataset.k; Audio2.ui(); changed(); }));
    $('crGear').querySelectorAll('button').forEach((b) => (b.onclick = () => { look.gear = +b.dataset.k; delete look.eq; Audio2.ui(); changed(); }));
    $('crGearC').querySelectorAll('button').forEach((b) => (b.onclick = () => { look.gearCol = +b.dataset.i; Audio2.ui(); changed(); }));
    $('crStyle').querySelectorAll('button').forEach((b) => (b.onclick = () => { look.hairStyle = b.dataset.k; Audio2.ui(); changed(); }));
    if (male) {
      $('crBeard').querySelectorAll('button').forEach((b) => (b.onclick = () => { look.beardStyle = b.dataset.k; delete look.beard; Audio2.ui(); changed(); }));
    }
    $('crH').oninput = (e) => { look.height = +e.target.value / 100; e.target.nextElementSibling.textContent = e.target.value + ' cm'; dirty = true; };
    $('crB').oninput = (e) => { look.build = +e.target.value / 100; dirty = true; };
    $('crB').onchange = () => render();
    $('crRnd').onclick = () => { const r = Look.random(); look = r; name = pick(r.type === 'male' ? NAMES_M : NAMES_F); Audio2.ui(); changed(); };
    $('crBack').onclick = () => { Audio2.ui(); close(); };
    $('crGo').onclick = () => {
      G.look = look; G.pname = (name || '').trim() || (look.type === 'male' ? 'Tõnu' : 'Kersti');
      const f = onDone; close(true); if (f) f();
    };
    dirty = true;
  }
  function changed() { render(); }
  return { open, close, isOpen };
})();
