// ============================================================
//  CO-OP (P2P): sõber saab sinu mängu appi tulla.
//  Peremees (host) jooksutab kogu maailma; külaline (guest) näeb peremehe seisu,
//  liigub ja tulistab ise ning saadab oma teod peremehele.
//  Ühendus: WebRTC andmekanal. Kätlus PeerJS kaudu (6-täheline kood) või käsitsi koodidega.
// ============================================================
const Net = (() => {
  const VER = 'k73-coop-1';
  const PREFIX = 'k73c-';
  const ICE = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
  ];
  const MAX_GUESTS = 3;
  const HOST_ID = -7;          // peremehe enda tegelane külalise maailmas
  const CH = 15000;            // sõnumi tükk (andmekanali piirang)
  const S = {
    role: null, active: false, peer: null, code: '', status: '', err: '', peers: [], link: null,
    manual: null, joinCode: '', manualIn: '', chat: [], chatIn: '', myAvatarId: 0, hostName: 'Host', hostLook: null,
  };
  let applying = false, replaying = false, fxDepth = 0, chunkId = 0;
  const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;

  // ---------- ühenduse ümbris: tükeldab suured sõnumid ----------
  function mkLink(rawSend, closeFn) {
    const L = { open: true, parts: new Map(), onmsg: null, onclose: null };
    L.send = (obj) => {
      if (!L.open) return;
      let s; try { s = JSON.stringify(obj); } catch (e) { console.warn('net encode', e); return; }
      try {
        if (s.length <= CH) rawSend(s);
        else { const id = ++chunkId, n = Math.ceil(s.length / CH); for (let i = 0; i < n; i++) rawSend('\u0001' + id + '|' + i + '|' + n + '|' + s.slice(i * CH, (i + 1) * CH)); }
      } catch (e) { console.warn('net send', e); }
    };
    L.recv = (s) => {
      if (typeof s !== 'string') { try { s = new TextDecoder().decode(s); } catch (e) { return; } }
      if (s.charCodeAt(0) === 1) {
        const a = s.indexOf('|'), b = s.indexOf('|', a + 1), c = s.indexOf('|', b + 1);
        const id = s.slice(1, a), i = +s.slice(a + 1, b), n = +s.slice(b + 1, c);
        let P = L.parts.get(id); if (!P) { P = { n, got: 0, a: new Array(n) }; L.parts.set(id, P); }
        if (P.a[i] === undefined) { P.a[i] = s.slice(c + 1); P.got++; }
        if (P.got < P.n) return;
        L.parts.delete(id); s = P.a.join('');
      }
      let m; try { m = JSON.parse(s); } catch (e) { return; }
      if (L.onmsg) try { L.onmsg(m); } catch (e) { console.error('net msg', m && m.t, e); }
    };
    L.close = () => { if (!L.open) return; L.open = false; try { closeFn(); } catch (e) { /* ignoreeri */ } if (L.onclose) L.onclose(); };
    L.dead = () => { if (!L.open) return; L.open = false; if (L.onclose) L.onclose(); };
    return L;
  }
  function linkFromPeerConn(conn) {
    const L = mkLink((s) => conn.send(s), () => conn.close());
    conn.on('data', (d) => L.recv(d));
    conn.on('close', () => L.dead());
    conn.on('error', () => L.dead());
    return L;
  }
  function linkFromDC(dc, pc) {
    const L = mkLink((s) => dc.send(s), () => { dc.close(); pc && pc.close(); });
    dc.onmessage = (ev) => L.recv(ev.data);
    dc.onclose = () => L.dead();
    if (pc) pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') L.dead(); };
    return L;
  }

  // ---------- PeerJS laadimine ----------
  let peerLib = null;
  function loadPeerJS() {
    if (window.Peer) return Promise.resolve();
    if (peerLib) return peerLib;
    const srcs = ['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js'];
    peerLib = new Promise((res, rej) => {
      let i = 0;
      const next = () => {
        if (i >= srcs.length) { peerLib = null; rej(new Error('lib')); return; }
        const s = document.createElement('script'); s.src = srcs[i++]; s.async = true;
        s.onload = () => (window.Peer ? res() : next()); s.onerror = () => { s.remove(); next(); };
        document.head.appendChild(s);
      };
      next();
    });
    return peerLib;
  }
  function genCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }

  // ---------- käsitsi kätlus (ilma koodiserverita) ----------
  async function pack(desc) {
    const txt = JSON.stringify({ type: desc.type, sdp: desc.sdp });
    try {
      if (window.CompressionStream) {
        const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        const buf = new Uint8Array(await new Response(cs).arrayBuffer());
        let b = ''; for (let i = 0; i < buf.length; i++) b += String.fromCharCode(buf[i]);
        return 'Z' + btoa(b);
      }
    } catch (e) { /* tihendamine pole saadaval */ }
    return 'J' + btoa(unescape(encodeURIComponent(txt)));
  }
  async function unpack(code) {
    code = (code || '').trim().replace(/\s+/g, '');
    if (code[0] === 'Z') {
      const b = atob(code.slice(1)), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
      const ds = new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return JSON.parse(await new Response(ds).text());
    }
    if (code[0] === 'J') return JSON.parse(decodeURIComponent(escape(atob(code.slice(1)))));
    throw new Error('code');
  }
  function iceDone(pc) {
    return new Promise((res) => {
      if (pc.iceGatheringState === 'complete') return res();
      const t = setTimeout(res, 3500);
      pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } });
    });
  }
  async function manualHostStart() {
    if (!(G.mode === 'play' || G.mode === 'build')) return;
    const pc = new RTCPeerConnection({ iceServers: ICE });
    const dc = pc.createDataChannel('k73', { ordered: true });
    S.manual = { pc, dc, offer: '', answer: '', step: 'offer' };
    setStatus('Creating your invitation code…');
    dc.onopen = () => { const L = linkFromDC(dc, pc); S.manual = null; becomeHost(); hostAccept(L); };
    await pc.setLocalDescription(await pc.createOffer());
    await iceDone(pc);
    S.manual.offer = await pack(pc.localDescription);
    setStatus('Send this code to your friend. Then paste their answer code below.');
  }
  async function manualHostAnswer(code) {
    try { await S.manual.pc.setRemoteDescription(await unpack(code)); setStatus('Connecting…'); }
    catch (e) { setStatus('', 'That answer code is not valid.'); }
  }
  async function manualJoin(code) {
    try {
      const pc = new RTCPeerConnection({ iceServers: ICE });
      S.manual = { pc, answer: '', step: 'answer' };
      pc.ondatachannel = (ev) => { const dc = ev.channel; const go = () => { S.manual = null; guestConnected(linkFromDC(dc, pc)); }; if (dc.readyState === 'open') go(); else dc.onopen = go; };
      await pc.setRemoteDescription(await unpack(code));
      await pc.setLocalDescription(await pc.createAnswer());
      await iceDone(pc);
      S.manual.answer = await pack(pc.localDescription);
      setStatus('Send this answer code back to the host. The game starts by itself when they paste it.');
    } catch (e) { S.manual = null; setStatus('', 'That invitation code is not valid.'); }
  }

  // ---------- olek ja paneel ----------
  function setStatus(s, err) { S.status = s || ''; S.err = err || ''; refresh(); }
  function refresh() { if (UI.isPanelOpen() && UI.panelKind === 'coop') UI.renderPanel(true); }
  function isHost() { return S.role === 'host' && S.active && S.peers.some((p) => p.ready); }
  function peerCount() { return S.peers.filter((p) => p.ready).length; }

  // ============================================================
  //  PEREMEES
  // ============================================================
  async function host() {
    if (S.role === 'host' && S.peer) return;
    setStatus('Opening the connection…');
    try { await loadPeerJS(); } catch (e) { setStatus('', 'Could not load the connection library. Use "Connect without a code" below.'); return; }
    const tryOpen = (n) => {
      const code = genCode();
      const peer = new window.Peer(PREFIX + code, { debug: 1, config: { iceServers: ICE } });
      peer.on('open', () => { S.peer = peer; S.code = code; becomeHost(); setStatus('Waiting for your friend…'); });
      peer.on('connection', (conn) => {
        conn.on('open', () => { if (S.peers.length >= MAX_GUESTS) { conn.send(JSON.stringify({ t: 'full' })); setTimeout(() => conn.close(), 500); return; } hostAccept(linkFromPeerConn(conn)); });
      });
      peer.on('error', (err) => {
        if (err && err.type === 'unavailable-id' && n < 4) { peer.destroy(); tryOpen(n + 1); return; }
        if (err && (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error')) setStatus('', 'The code server is not reachable. Use "Connect without a code" below.');
        else setStatus(S.status, 'Connection error: ' + (err && err.type || err));
      });
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* ignoreeri */ } });
    };
    tryOpen(0);
  }
  function becomeHost() { S.role = 'host'; S.active = true; installWraps(); }
  function stopHost() {
    for (const P of S.peers.slice()) { P.link.send({ t: 'bye' }); dropPeer(P, true); }
    if (S.peer) { try { S.peer.destroy(); } catch (e) { /* ignoreeri */ } }
    if (S.manual && S.manual.pc) try { S.manual.pc.close(); } catch (e) { /* ignoreeri */ }
    S.peer = null; S.code = ''; S.role = null; S.active = false; S.manual = null; S.peers.length = 0;
    setStatus('');
  }
  function hostAccept(L) {
    const P = { link: L, ready: false, name: 'Friend', look: null, av: null, sent: new Map(), ack: 0, tick: 0, h: {}, ev: [], st: null, lastSt: 0 };
    S.peers.push(P);
    L.onmsg = (m) => hostMsg(P, m);
    L.onclose = () => dropPeer(P);
    setStatus('A friend is connecting…');
  }
  function dropPeer(P, quiet) {
    const i = S.peers.indexOf(P); if (i < 0) return;
    S.peers.splice(i, 1);
    if (P.av) {
      for (const m of Crew.members()) if (m.crew.leader === P.av) { m.crew.follow = false; m.crew.leader = null; if (m.crew.task) m.crew.task.done = true; }
      Ents.remove(P.av);
    }
    try { P.link.close(); } catch (e) { /* ignoreeri */ }
    if (!quiet && P.ready) UI.msg(P.name + ' left the game.', 'warn');
    else if (P.ready) for (const Q of S.peers) if (Q.ready) Q.link.send({ t: 'ui', m: 'msg', a: [P.name + ' left the game.', 'warn'] });
    if (S.role === 'host' && !S.peers.length && !S.peer) { S.role = null; S.active = false; }
    refresh();
  }
  function avatarPos() { const a = Player.yaw + Math.PI * 0.75; return { x: Player.pos.x + Math.sin(a) * 2, z: Player.pos.z + Math.cos(a) * 2 }; }
  function hostMsg(P, m) {
    switch (m.t) {
      case 'hi': {
        if (m.v !== VER) { P.link.send({ t: 'err', s: 'Different game version. Both players should reload the page.' }); setTimeout(() => dropPeer(P, true), 800); return; }
        P.name = String(m.name || 'Friend').slice(0, 20); P.look = m.look || null;
        const ap = avatarPos();
        P.av = Ents.spawn('human', 'player', ap.x, ap.z, { maxHp: 100, radius: 0.38, netPeer: P, netName: P.name, look: P.look || Look.player(), hasGun: true, aim: 0.4, gunK: 'carbine' });
        P.av.nx = ap.x; P.av.nz = ap.z; P.av.ny = P.av.pos.y;
        const save = Save.data();
        P.link.send({ t: 'wel', v: VER, save, av: P.av.id, hn: G.pname || 'Host', hl: Look.clean(G.look), at: { x: ap.x, z: ap.z, yaw: Player.yaw } });
        P.ready = true; P.joinT = G.time.total;
        replaying = true; try { UI.msg(P.name + ' joined your game!', 'good'); UI.banner('Co-op', P.name + ' joined', 'good'); } finally { replaying = false; }
        Audio2.radio();
        for (const Q of S.peers) if (Q !== P && Q.ready) Q.link.send({ t: 'ui', m: 'msg', a: [P.name + ' joined the game.', 'good'] });
        setStatus(peerCount() + ' friend' + (peerCount() === 1 ? '' : 's') + ' in your game.');
        return;
      }
      case 'st': {
        P.st = m; P.lastSt = G.time.total;
        if (m.lk) { P.look = m.lk; if (P.av) P.av.look = m.lk; }
        return;
      }
      case 'ev': { replaying = true; try { for (const ev of m.l) playEv(ev); } finally { replaying = false; } for (const Q of S.peers) if (Q !== P) Q.ev.push(...m.l); return; }
      case 'dmg': {
        const e = entById(m.i); if (!e || !e.alive) return;
        Ents.damage(e, m.a, P.av || Player, m.o || {});
        return;
      }
      case 'bh': { const e = Boss.e; if (e && e.alive) Boss.hit(e, m.d, P.av || Player, m.i, m.x, m.y, m.z); return; }
      case 'res': {
        for (const d of m.l) {
          const tgt = d.c === 'res' ? G.res : d.c === 'stash' ? (G.stash || (G.stash = {})) : G.flags;
          if (d.d !== undefined) {
            tgt[d.k] = (tgt[d.k] || 0) + d.d;
            if (d.c === 'stash' && tgt[d.k] <= 0) delete tgt[d.k];
            if (d.c === 'res' && tgt[d.k] < 0) tgt[d.k] = 0;
          } else {
            const old = tgt[d.k];
            if (d.v === null) delete tgt[d.k]; else tgt[d.k] = d.v;
            if (d.c === 'flags' && old !== d.v) flagHook(d.k, d.v);
          }
          P.ack = Math.max(P.ack, d.s);
        }
        Objectives.check();
        return;
      }
      case 'bop': {
        applying = true;
        try {
          const a = m.a;
          if (m.k === 'addObj') { if (Base.objs.has(a[5])) a[5] = undefined; Base.addObj(a[0], a[1], a[2], a[3], a[4], a[5]); }
          else if (m.k === 'setRoomStyle') { const rid = Base.roomAt(a[0], a[1]); if (rid) Base.setRoomStyle(rid, a[2], a[3]); }
          else if (m.k === 'addWalls') Base.addWalls(a[0]);
          else if (m.k === 'removeWalls') Base.removeWalls(a[0], a[1]);
          else if (m.k === 'removeObj') Base.removeObj(a[0]);
          else if (m.k === 'setOpening') Base.setOpening(a[0], a[1], a[2], a[3]);
        } finally { applying = false; }
        Base.updatePower(!Econ.isNight()); Crew.assignBeds(); Objectives.check();
        return;
      }
      case 'rep': { const o = Base.objs.get(m.i); if (!o) return; if (!m.p) o.broken = false; o.hp = o.maxHp; Base.updatePower(!Econ.isNight()); Objectives.check(); return; }
      case 'wk': { const w = World.wrecks[m.i]; if (w) w.scrap = Math.max(0, w.scrap - m.n); G.flags.salvaged = true; Objectives.check(); return; }
      case 'mn': { const cl = Comets.nearestCluster(m.x, m.z, 0.8); if (cl) Comets.mine(cl, P.av); return; }
      case 'bt': { const e = entById(m.i); if (!e) return; e.meat = (e.meat || 0) - m.n; if (e.meat <= 0) { e.butcherable = false; e.remove = true; } G.flags.hunted = true; return; }
      case 'pick': {
        const p = Ents.pickups.find((q) => !q.gone && Math.abs(q.x - m.x) < 0.6 && Math.abs(q.z - m.z) < 0.6); if (!p) return;
        const d = p.data || (p.data = {});
        if (!d.items) { d.items = []; for (const k of ['kris', 'scrap', 'meat']) if (d[k]) d.items.push([k, d[k]]); if (d.stones) d.items.push(['stones', d.stones]); }
        for (const [id, n] of m.took) { const it = d.items.find((q) => q[0] === id); if (it) it[1] -= n; }
        d.items = d.items.filter((q) => q[1] > 0);
        if (!d.items.length) p.gone = true;
        return;
      }
      case 'drop': { const q = m.p; Ents.pickups.push({ kind: q.kind, x: q.x, y: Ents.groundY(q.x, q.z), z: q.z, data: q.data, id: Math.random() }); return; }
      case 'fol': { const e = entById(m.i); if (e && e.crew && P.av) Crew.setFollow(e, m.on, P.av); return; }
      case 'foln': { if (P.av) Crew.followNear(18, P.av); return; }
      case 'chat': { gotChat(P.name, m.s, P.av); for (const Q of S.peers) if (Q !== P) Q.link.send({ t: 'chat', n: P.name, s: m.s, i: P.av ? P.av.id : 0 }); return; }
      case 'bye': dropPeer(P); return;
    }
  }
  function flagHook(k, v) {
    if (k === 'stonesHome' && v) Game.stonesHome();
    if (k === 'term' && v) Econ.genCandidates();
    if (k === 'music') Audio2.setMusic(!!v);
  }
  function entById(id) { for (const e of Ents.list) if (e.id === id) return e; return null; }
  function nearAvatar(x, z, r) { for (const P of S.peers) if (P.av && Math.hypot(P.av.pos.x - x, P.av.pos.z - z) < r) return true; return false; }

  // --- olemite hetktõmmised ---
  const WL = ['alive', 'hp', 'maxHp', 'pose', 'state', 'gesture', 'aim', 'aimPitch', 'headYaw', 'headPitch', 'hasGun', 'prop', 'lieY', 'dance', 'lunge2', 'crouch', 'mourn', 'torch', 'downed',
    'moveAmt', 'speed', 'grazing', 'size', 'lunge', 'claw', 'roarT', 'act', 'actT', 'heartHp', 'heartMax', 'big', 'alt', 'butcherable', 'meat', 'gunK', 'onPost', 'leaving', 'radius', 'netName'];
  const PULSE = ['hurtT', 'flash'];   // saadetakse ainult tõusu korral, külaline vähendab ise
  const GUN_OF = { rifle: 'carbine', shotgun: 'shotgun', ashot: 'shotgun', smg: 'smg', pistol: 'smg', revolver: 'smg', sniper: 'dmr', dmr: 'dmr', rail: 'dmr', lmg: 'lmg', plasma: 'carbineTan', gl: 'carbine' };
  function aimOf(firedT, ads) { return ads > 0.3 || G.time.total - (firedT || -99) < 2.5 ? 1 : 0.35; }
  const hostSelf = { id: HOST_ID, kind: 'human', team: 'player', pos: { x: 0, y: 0, z: 0 }, yaw: 0 };
  function syncHostSelf() {
    const h = hostSelf;
    h.pos.x = Player.pos.x; h.pos.y = Player.pos.y; h.pos.z = Player.pos.z; h.yaw = Player.yaw;
    h.alive = !Player.dead; h.hp = Player.hp; h.maxHp = Player.maxHp; h.pose = Player.dead ? 'dead' : 'stand';
    h.aim = aimOf(S.firedT, Player.adsT); h.aimPitch = Player.pitch; h.hasGun = true; h.gunK = GUN_OF[Player.weapon] || 'carbine';
    h.moveAmt = Player.moveAmt; h.netName = G.pname || 'Host'; h.look = G.look; h.hurtT = Player.hurtT;
    h.flash = G.time.total - (S.firedT || -9) < 0.06 ? 0.06 : 0;
  }
  function encEnt(P, e, full) {
    let prev = P.sent.get(e.id);
    const o = { i: e.id };
    if (!prev) { prev = { f: {}, lk: '', cr: '', n: 0 }; P.sent.set(e.id, prev); o.k = e.kind; o.tm = e.team; full = true; }
    const x = r2(e.pos.x), y = r2(e.pos.y), z = r2(e.pos.z), yw = r2(e.yaw);
    if (full || x !== prev.x || y !== prev.y || z !== prev.z || yw !== prev.yw) { o.p = [x, y, z, yw]; prev.x = x; prev.y = y; prev.z = z; prev.yw = yw; }
    let f = null;
    for (const k of WL) {
      let v = e[k];
      if (v === undefined) v = null; else if (typeof v === 'number') v = r3(v); else if (typeof v === 'object' && v !== null) continue;
      if (full ? v !== null : prev.f[k] !== v && !(prev.f[k] === undefined && v === null)) { (f || (f = {}))[k] = v; prev.f[k] = v; }
    }
    for (const k of PULSE) { const v = e[k] || 0; if (v > (prev.f[k] || 0) + 0.005) { (f || (f = {}))[k] = r3(v); } prev.f[k] = v; }
    if (!e.alive && (full || prev.f.deathT === undefined)) { (f || (f = {})).deathT = r2(e.deathT || 0); prev.f.deathT = 1; }
    if (f) o.f = f;
    // harvem: välimus, meeskonna andmed, sõlmed, siht
    if (full || (prev.n++ % 6) === 0) {
      if (e.crew) {
        const c = e.crew, cr = [c.name, c.role, c.trait, c.carry || 0, c.carryKind || null, Math.round(c.morale), Math.round(c.energy), c.follow ? 1 : 0, c.act || ''];
        const js = JSON.stringify(cr); if (js !== prev.cr) { o.cr = cr; prev.cr = js; }
      }
      const L = e.crew ? e.crew.look : e.look;
      if (L && (full || (prev.n % 24) === 1)) { const lk = Look.clean(L), js = JSON.stringify(lk); if (js !== prev.lk) { o.lk = lk; prev.lk = js; } }
      if (e.nodes) { const nd = e.nodes.map((n) => Math.max(0, Math.round(n.hp))), js = nd.join(','); if (js !== prev.nd) { o.nd = nd; prev.nd = js; } }
      if (e.rival && !prev.rv) { o.rv = e.rival.id; prev.rv = 1; }
    }
    if (e.kind === 'kiskja' || e.kind === 'boss') { const tg = e.target && e.target.pos ? (e.target === Player ? HOST_ID : e.target.id || 0) : 0; if (tg !== prev.tg) { o.tg = tg; prev.tg = tg; } }
    return (o.k || o.p || o.f || o.cr || o.lk || o.nd || o.rv || o.tg !== undefined) ? o : null;
  }
  function snapFor(P) {
    const me = P.av, mx = me ? me.pos.x : Player.pos.x, mz = me ? me.pos.z : Player.pos.z;
    const out = [], seen = new Set();
    syncHostSelf();
    const all = [hostSelf];
    for (const e of Ents.list) all.push(e);
    for (const e of all) {
      if (e === Player || e === me || e.remove) continue;
      const imp = e.kind === 'boss' || e.kind === 'core' || e.kind === 'rturret' || e.id === HOST_ID;
      if (!imp && Math.hypot(e.pos.x - mx, e.pos.z - mz) > 420) continue;
      seen.add(e.id);
      const o = encEnt(P, e, false);
      if (o) out.push(o);
    }
    const rm = [];
    for (const id of P.sent.keys()) if (!seen.has(id)) { rm.push(id); P.sent.delete(id); }
    const pj = [];
    for (const p of Ents.projs) if (p.delay <= 0 && Math.hypot(p.x - mx, p.z - mz) < 250) pj.push([r2(p.x), r2(p.y), r2(p.z), r2(p.vx), r2(p.vy), r2(p.vz), p.g, p.kind]);
    return { t: 's', tm: [r3(G.time.t), G.time.day], e: out, rm, pj };
  }
  // --- baas ja muu aeglasem olek ---
  function baseKey(B) {
    const d = B.serialize();
    return JSON.stringify([d.walls, d.openings, d.styles, d.objs.map((o) => [o.id, o.type, o.i, o.j, o.rot])]);
  }
  function hostTick(dt) {
    // avatarid: sujuv liikumine külalise saadetud asukohta
    for (const P of S.peers) {
      const a = P.av, st = P.st; if (!a || !st) continue;
      const dead = !!st.d;
      if (!dead && !Ents.list.includes(a)) { a.remove = false; Ents.list.push(a); }
      if (dead && a.alive) { a.alive = false; a.pose = 'dead'; a.deathT = 0; }
      else if (!dead && !a.alive) { a.alive = true; a.pose = 'stand'; a.deathT = 0; a.hp = a.maxHp; }
      const [x, y, z, yaw, pitch] = st.p;
      const k = Math.min(1, dt * 14);
      if (Math.hypot(a.pos.x - x, a.pos.z - z) > 8) { a.pos.x = x; a.pos.z = z; a.pos.y = y; }
      else { a.pos.x += (x - a.pos.x) * k; a.pos.z += (z - a.pos.z) * k; a.pos.y += (y - a.pos.y) * k; }
      a.yaw += angDiff(a.yaw, yaw) * k; a.aimPitch = pitch; a.aim = st.a; a.gunK = st.w; a.moveAmt = st.mv; a.hp = st.hp; a.maxHp = st.mh;
      if (st.f && st.f !== P.lastF) { P.lastF = st.f; a.flash = 0.06; }
    }
    for (const P of S.peers) {
      if (!P.ready) continue;
      P.tick++;
      const h = P.h;
      h.s = (h.s || 0) - dt;
      if (h.s <= 0) { h.s = 1 / 12; P.link.send(snapFor(P)); }
      if (P.ev.length) { P.link.send({ t: 'ev', l: P.ev.splice(0) }); }
      h.g = (h.g || 0) - dt;
      if (h.g <= 0) {
        h.g = 0.5;
        const fl = JSON.stringify(G.flags);
        const g = { t: 'g', ack: P.ack, res: G.res, stash: G.stash || {}, debt: G.debt, up: G.up, scan: G.scan, market: G.market, stats: G.stats, w: [r3(Weather.storm), Weather.target] };
        if (fl !== h.fl) { g.flags = G.flags; h.fl = fl; }
        P.link.send(g);
      }
      h.bd = (h.bd || 0) - dt;
      if (h.bd <= 0) {
        h.bd = 0.25;
        const L = [], data = [];
        const pv = h.objs || (h.objs = new Map());
        for (const o of Base.objs.values()) {
          const row = [o.id, Math.round(o.hp || 0), o.on ? 1 : 0, o.broken ? 1 : 0, r2(o.aim || 0), r2(o.pitch || 0)];
          const js = row.join(',');
          if (pv.get(o.id) !== js) { pv.set(o.id, js); L.push(row); }
          const dj = JSON.stringify(o.data || {});
          if (pv.get('d' + o.id) !== dj) { pv.set('d' + o.id, dj); data.push([o.id, o.data || {}]); }
        }
        const dark = []; for (const r of Base.rooms.values()) if (r.dark) dark.push(r.cells[0]);
        const pw = Base.power, pwk = [pw.supply, pw.demand, pw.ok, pw.lightsOn, dark.join(';')].join('|');
        if (L.length || data.length || pwk !== h.pw) { h.pw = pwk; P.link.send({ t: 'bd', o: L, d: data, pw: { supply: pw.supply, demand: pw.demand, ok: pw.ok, lightsOn: pw.lightsOn }, dk: dark }); }
      }
      h.slow = (h.slow || 0) - dt;
      if (h.slow <= 0) {
        h.slow = 1;
        const bk = baseKey(Base); if (bk !== h.base) { h.base = bk; h.objs = null; P.link.send({ t: 'b', d: Base.serialize() }); }
        const rv = Rivals.list.map((r) => ({ id: r.id, alive: r.alive, found: r.found, bb: r.bb ? r.bb.serialize() : null })), rk = JSON.stringify(rv);
        if (rk !== h.rv) { h.rv = rk; P.link.send({ t: 'rv', l: rv }); }
        const cm = Comets.sites.map((s) => [r2(s.x), r2(s.z), s.exact ? 1 : 0, r2(s.ox || 0), r2(s.oz || 0), s.loose ? 1 : 0, s.clusters.map((c) => [r2(c.x), r2(c.z), c.amount, r2(c.yaw)])]), ck = JSON.stringify(cm);
        if (ck !== h.cm) { h.cm = ck; P.link.send({ t: 'cm', l: cm }); }
        const wr = World.wrecks.map((w) => w.scrap), wk = wr.join(',');
        if (wk !== h.wr) { h.wr = wk; P.link.send({ t: 'wr', l: wr }); }
        const ob = Objectives.serialize(), ok = ob.join(',');
        if (ok !== h.ob) { h.ob = ok; P.link.send({ t: 'ob', l: ob }); }
      }
      h.pk = (h.pk || 0) - dt;
      if (h.pk <= 0) {
        h.pk = 0.5;
        const pk = Ents.pickups.filter((p) => !p.gone).map((p) => [p.kind, r2(p.x), r2(p.z), p.data || {}]), kk = JSON.stringify(pk);
        if (kk !== h.pkk) { h.pkk = kk; P.link.send({ t: 'pk', l: pk }); }
      }
      // külaline vaikinud liiga kaua
      if (G.time.total - P.lastSt > 25 && G.time.total - (P.joinT || 0) > 25) { UI.msg(P.name + ' lost connection.', 'warn'); dropPeer(P, true); }
    }
  }
  function onDamageHost(e, amt, src) {
    if (!e.netPeer) return false;
    e.hurtT = 0.25;
    e.netPeer.link.send({ t: 'hurt', a: r2(amt), x: src && src.pos ? r2(src.pos.x) : null, z: src && src.pos ? r2(src.pos.z) : null });
    return true;
  }

  // ============================================================
  //  KÜLALINE
  // ============================================================
  async function join(code) {
    code = (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) { setStatus('', 'The code has 6 letters and numbers.'); return; }
    setStatus('Opening the connection…');
    try { await loadPeerJS(); } catch (e) { setStatus('', 'Could not load the connection library. Use "Connect without a code" below.'); return; }
    if (S.peer) try { S.peer.destroy(); } catch (e) { /* ignoreeri */ }
    const peer = new window.Peer({ debug: 1, config: { iceServers: ICE } });
    S.peer = peer;
    peer.on('open', () => {
      setStatus('Looking for game ' + code + '…');
      const conn = peer.connect(PREFIX + code, { reliable: true, serialization: 'raw' });
      const to = setTimeout(() => { if (!S.link) setStatus('', 'No answer. Check the code, or try "Connect without a code".'); }, 15000);
      conn.on('open', () => { clearTimeout(to); guestConnected(linkFromPeerConn(conn)); });
    });
    peer.on('error', (err) => {
      const t = err && err.type;
      if (t === 'peer-unavailable') setStatus('', 'No game with that code. Ask your friend for the code again.');
      else if (t === 'network' || t === 'server-error' || t === 'socket-error') setStatus('', 'The code server is not reachable. Use "Connect without a code" below.');
      else setStatus('', 'Connection error: ' + (t || err));
    });
  }
  function guestConnected(L) {
    S.link = L; S.role = 'guest';
    L.onmsg = guestMsg;
    L.onclose = () => { if (S.role === 'guest') lostHost('The connection to the host was lost.'); };
    L.send({ t: 'hi', v: VER, name: G.pname || 'Friend', look: Look.clean(G.look || Look.player()) });
    setStatus('Connected! Loading the world…');
  }
  function lostHost(why) {
    const was = S.active;
    S.active = false; S.role = null; S.link = null;
    if (S.peer) try { S.peer.destroy(); } catch (e) { /* ignoreeri */ }
    S.peer = null;
    clearProxies();
    if (was) { UI.closePanel(); Game.toTitle(); UI.msg(why, 'danger'); UI.banner('Co-op ended', why, 'danger'); }
    else setStatus('', why);
  }
  const prox = new Map();
  let netProjs = [], flights = [], pending = [], seq = 0, outEv = [], stT = 0, lastLook = '';
  const raw = { res: {}, stash: {}, flags: {} };
  function mkResProxy(cat) {
    return new Proxy(raw[cat], {
      set(o, k, v) {
        const old = o[k]; o[k] = v;
        if (!applying && S.role === 'guest' && old !== v) {
          const d = { s: ++seq, c: cat, k };
          if ((typeof v === 'number' || v === undefined) && (typeof old === 'number' || old === undefined) && cat !== 'flags') d.d = (v || 0) - (old || 0);
          else d.v = v === undefined ? null : v;
          pending.push(d);
        }
        return true;
      },
      deleteProperty(o, k) {
        const old = o[k]; delete o[k];
        if (!applying && S.role === 'guest' && old !== undefined) { const d = { s: ++seq, c: cat, k }; if (typeof old === 'number' && cat !== 'flags') d.d = -old; else d.v = null; pending.push(d); }
        return true;
      },
    });
  }
  function installProxies() {
    for (const c of ['res', 'stash', 'flags']) { const src = c === 'res' ? G.res : c === 'stash' ? (G.stash || {}) : (G.flags || {}); for (const k of Object.keys(raw[c])) delete raw[c][k]; Object.assign(raw[c], src); }
    G.res = mkResProxy('res'); G.stash = mkResProxy('stash'); G.flags = mkResProxy('flags');
  }
  function clearProxies() {
    for (const e of prox.values()) Ents.remove(e);
    prox.clear(); netProjs = []; flights = []; pending = []; outEv = [];
    if (G.res && G.res !== raw.res) { G.res = Object.assign({}, raw.res); G.stash = Object.assign({}, raw.stash); G.flags = Object.assign({}, raw.flags); }
    for (const t of tags.values()) t.remove(); tags.clear();
  }
  function setRaw(cat, data) {
    const o = raw[cat];
    for (const k of Object.keys(o)) if (!(k in data)) delete o[k];
    Object.assign(o, data);
    // veel kinnitamata muudatused peale
    for (const d of pending) if (d.c === cat) { if (d.d !== undefined) o[d.k] = (o[d.k] || 0) + d.d; else if (d.v === null) delete o[d.k]; else o[d.k] = d.v; }
  }
  function guestWelcome(m) {
    const myLook = G.look, myName = G.pname;
    const save = m.save;
    S.hostName = m.hn; S.hostLook = m.hl; S.myAvatarId = m.av;
    applying = true;
    try {
      Game.continueGame(save);
      G.look = myLook || Look.player(); G.pname = myName || 'Friend';
      const st = G.stash; Inv.startKit(); G.stash = st;
      Player.fillMags(); Player.reset(m.at.x, m.at.z, m.at.yaw); Player.weapon = Inv.curWeapon() || 'rifle';
      // maailma olendid tulevad peremehelt
      Ents.list.length = 0; Ents.list.push(Player); Ents.projs.length = 0;
      Herds.clear();
      Comets.timer = 1e9;
      installProxies();
    } finally { applying = false; }
    S.active = true;
    installWraps();
    UI.closePanel();
    UI.banner('Co-op', 'You joined ' + S.hostName + '\'s game', 'good');
    UI.msg('You are in ' + S.hostName + '\'s game. Storage, money and the base are shared. The terminal and crew stay with the host.', 'good');
  }
  function guestMsg(m) {
    switch (m.t) {
      case 'wel': if (m.v !== VER) { lostHost('Different game version. Reload the page.'); return; } guestWelcome(m); return;
      case 'err': lostHost(m.s); return;
      case 'full': lostHost('That game is full.'); return;
      case 'bye': lostHost('The host ended the co-op game.'); return;
      case 's': if (S.active) applySnap(m); return;
      case 'g': {
        if (!S.active) return;
        applying = true;
        try {
          pending = pending.filter((d) => d.s > m.ack);
          setRaw('res', m.res); setRaw('stash', m.stash || {});
          if (m.flags) setRaw('flags', m.flags);
          Object.assign(G.debt, m.debt); Object.assign(G.up, m.up); Object.assign(G.scan, m.scan); Object.assign(G.market, m.market);
          Weather.storm = m.w[0]; Weather.target = m.w[1];
        } finally { applying = false; }
        return;
      }
      case 'b': if (S.active) { Base.deserialize(m.d); Base.rebuildNow(); } return;
      case 'bd': {
        if (!S.active) return;
        for (const [id, hp, on, br, aim, pitch] of m.o) { const o = Base.objs.get(id); if (!o) continue; o.hp = hp; o.on = !!on; o.broken = !!br; if (o.type === 'kahur' || o.type === 'myyrturel') { o.aim = aim; o.pitch = pitch; } }
        for (const [id, d] of m.d) { const o = Base.objs.get(id); if (o) o.data = d; }
        Object.assign(Base.power, m.pw);
        for (const r of Base.rooms.values()) r.dark = false;
        for (const c of m.dk) { const rid = Base.roomAt(c[0], c[1]); const r = rid && Base.rooms.get(rid); if (r) r.dark = true; }
        return;
      }
      case 'rv': {
        if (!S.active) return;
        for (const d of m.l) {
          const r = Rivals.get(d.id); if (!r) continue;
          r.alive = d.alive; r.found = d.found;
          if (d.bb && r.bb) { const js = JSON.stringify(d.bb); if (js !== r._netbb) { r._netbb = js; r.bb.deserialize(d.bb); r.bb.rebuildNow(); } }
          if (r.bb && !r.alive) r.bb.power.lightsOn = false;
        }
        return;
      }
      case 'cm': if (S.active) applyComets(m.l); return;
      case 'wr': if (S.active) m.l.forEach((v, i) => { if (World.wrecks[i]) World.wrecks[i].scrap = v; }); return;
      case 'ob': if (S.active) { Objectives.deserialize(m.l); UI.updateObjective(); } return;
      case 'pk': {
        if (!S.active) return;
        const old = Ents.pickups.slice();
        Ents.pickups.length = 0;
        for (const [kind, x, z, data] of m.l) {
          const o = old.find((p) => p.kind === kind && Math.abs(p.x - x) < 0.05 && Math.abs(p.z - z) < 0.05);
          Array.prototype.push.call(Ents.pickups, { kind, x, y: Ents.groundY(x, z), z, data, t: o ? o.t : 0, id: o ? o.id : Math.floor(Math.random() * 1e9), m: o ? o.m : null });
        }
        return;
      }
      case 'ev': if (S.active) { replaying = true; try { for (const ev of m.l) playEv(ev); } finally { replaying = false; } } return;
      case 'ui': if (S.active) { replaying = true; try { UI[m.m](...m.a); } finally { replaying = false; } } return;
      case 'hurt': if (S.active) Player.hurt(m.a, m.x !== null ? { pos: { x: m.x, z: m.z } } : null); return;
      case 'toast': UI.toast(m.s); return;
      case 'chat': gotChat(m.n, m.s, prox.get(m.i)); return;
      case 'cf': if (S.active) flights.push(m.f); return;
    }
  }
  function mkProxyEnt(d) {
    const p = d.p || [0, 0, 0, 0];
    let e;
    if (d.k === 'boss') { e = Boss.spawn(); }
    else e = Ents.spawn(d.k, d.tm, p[0], p[2], {});
    e.id = d.i; e.net = true; e.ai = null; e.state = undefined;
    e.pos.x = p[0]; e.pos.y = p[1]; e.pos.z = p[2]; e.yaw = p[3];
    e.nx = p[0]; e.ny = p[1]; e.nz = p[2]; e.nyaw = p[3];
    prox.set(d.i, e);
    return e;
  }
  function applySnap(m) {
    G.time.t = m.tm[0]; G.time.day = m.tm[1];
    for (const d of m.e) {
      let e = prox.get(d.i);
      if (!e) { if (!d.k) continue; e = mkProxyEnt(d); }
      if (d.p) { e.nx = d.p[0]; e.ny = d.p[1]; e.nz = d.p[2]; e.nyaw = d.p[3]; }
      if (d.f) for (const k in d.f) { const v = d.f[k]; if (v === null) delete e[k]; else e[k] = v; }
      if (d.f && d.f.alive === false && e.pose !== 'lie') e.pose = 'dead';
      if (d.cr) { const c = e.crew || (e.crew = { rel: {} }); [c.name, c.role, c.trait, c.carry, c.carryKind, c.morale, c.energy, c.follow, c.act] = d.cr; c.follow = !!c.follow; }
      if (d.lk) { e.look = d.lk; if (e.crew) e.crew.look = d.lk; }
      if (d.nd && e.nodes) d.nd.forEach((hp, i) => { if (e.nodes[i]) { e.nodes[i].hp = hp; e.nodes[i].alive = hp > 0; } });
      if (d.rv) e.rival = Rivals.get(d.rv);
      if (d.tg !== undefined) e.netTg = d.tg;
    }
    for (const id of m.rm) { const e = prox.get(id); if (e) { Ents.remove(e); prox.delete(id); } }
    netProjs = m.pj.map((q) => ({ x: q[0], y: q[1], z: q[2], vx: q[3], vy: q[4], vz: q[5], g: q[6], kind: q[7], life: 1, delay: 0, r: 0.3 }));
  }
  function applyComets(L) {
    const S2 = Comets.sites, keep = new Set();
    for (const [x, z, exact, ox, oz, loose, cls] of L) {
      let s = S2.find((q) => Math.abs(q.x - x) < 0.05 && Math.abs(q.z - z) < 0.05);
      if (!s) {
        if (!loose) World.deformCrater(x, z, 7.5, 1.8);
        s = { id: 9e5 + Math.floor(Math.random() * 1e5), x, z, y: World.heightAt(x, z), clusters: [], age: 99, exact: !!exact, ox, oz, loose: !!loose, claimed: {} };
        S2.push(s);
      }
      s.exact = !!exact;
      const nc = [];
      for (const [cx, cz, amount, yaw] of cls) {
        let c = s.clusters.find((q) => Math.abs(q.x - cx) < 0.05 && Math.abs(q.z - cz) < 0.05);
        if (!c) c = { id: 9e5 + Math.floor(Math.random() * 1e5), x: cx, z: cz, y: World.heightAt(cx, cz) - 0.15, yaw, m: M4.create(), site: s };
        c.amount = amount; nc.push(c);
      }
      s.clusters = nc; keep.add(s);
    }
    for (let i = S2.length - 1; i >= 0; i--) if (!keep.has(S2[i])) S2.splice(i, 1);
  }
  const gHumans = [];
  function guestSim(dt) {
    if (!S.active) return;
    G.time.total += dt;
    Weather.timer = 1e9; Weather.update(dt);
    // proksid: sujuv liikumine, animatsioonifaas, tabamussfäärid
    const k = 1 - Math.exp(-dt * 12);
    for (const e of prox.values()) {
      if (e.nx !== undefined) {
        const d = Math.hypot(e.nx - e.pos.x, e.nz - e.pos.z);
        if (d > 10) { e.pos.x = e.nx; e.pos.z = e.nz; e.pos.y = e.ny; }
        else { e.pos.x += (e.nx - e.pos.x) * k; e.pos.z += (e.nz - e.pos.z) * k; e.pos.y += (e.ny - e.pos.y) * k; }
        e.yaw += angDiff(e.yaw, e.nyaw) * k;
      }
      if (e.kind === 'jelly') e.phase += dt; else e.phase += dt * (e.speed || 0) * (e.moveAmt || 0) * 1.6;
      if (e.hurtT > 0) e.hurtT -= dt;
      if (!e.alive) e.deathT = (e.deathT || 0) + dt;
      if (e.netTg !== undefined) e.target = e.netTg === S.myAvatarId ? Player : e.netTg ? prox.get(e.netTg) || null : null;
      Ents.updateSpheres(e);
    }
    gHumans.length = 0;
    for (const e of Ents.list) if (e.alive && (e.kind === 'human' || e.kind === 'player')) gHumans.push(e);
    Base.update(dt, gHumans);
    Rivals.updateBases(dt, gHumans);
    if (G.mode === 'play') Ents.updateProjs(dt);
    for (const p of Ents.pickups) p.t = (p.t || 0) + dt;
    for (const p of netProjs) { p.vy -= (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; FX.trail(p); }
    // kukkuvad komeedid (ainult pilt)
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]; f.t += dt;
      const kk = clamp(f.t / f.T, 0, 1), ee = kk * kk * (0.4 + 0.6 * kk);
      const x = lerp(f.sx, f.tx, ee), y = lerp(f.sy, f.ty, ee) + Math.sin(kk * Math.PI) * 30, z = lerp(f.sz, f.tz, ee);
      GFX.partAdd.emit(x, y, z, 0, 0, 0, 0.15, 7, 3, [1.0, 0.95, 0.85, 1], [0.6, 0.8, 1, 0]);
      for (let j = 0; j < 4; j++) GFX.partAdd.emit(x + rand(-1.5, 1.5), y + rand(-1.5, 1.5), z + rand(-1.5, 1.5), rand(-3, 3), rand(-3, 3), rand(-3, 3), rand(0.8, 1.8), rand(2, 4), 0.5, [1, 0.6, 0.3, 0.9], [0.6, 0.3, 1, 0]);
      GFX.addLight(x, y, z, 120, 1, 0.8, 0.6, 3);
      if (f.t >= f.T) flights.splice(i, 1);
    }
    const nearBase = Math.hypot(Player.pos.x, Player.pos.z) < 30;
    Audio2.setHum(Base.power.supply > 0 && nearBase ? 1 - Math.hypot(Player.pos.x, Player.pos.z) / 30 : 0);
  }
  function guestSend(dt) {
    if (!S.link) return;
    stT -= dt;
    if (stT <= 0 && S.active) {
      stT = 1 / 20;
      const st = { t: 'st', p: [r2(Player.pos.x), r2(Player.pos.y), r2(Player.pos.z), r3(Player.yaw), r3(Player.pitch)], w: GUN_OF[Player.weapon] || 'carbine', d: Player.dead ? 1 : 0, a: aimOf(S.firedT, Player.adsT), hp: Math.round(Player.hp), mh: Player.maxHp, mv: r2(G.mode === 'build' ? 0 : Player.moveAmt), f: S.fireN || 0 };
      const lj = JSON.stringify(Look.clean(G.look)); if (lj !== lastLook) { lastLook = lj; st.lk = Look.clean(G.look); }
      S.link.send(st);
    }
    if (outEv.length) S.link.send({ t: 'ev', l: outEv.splice(0) });
    const fresh = pending.filter((d) => !d.sent);
    if (fresh.length) { for (const d of fresh) d.sent = true; S.link.send({ t: 'res', l: fresh.map((d) => ({ s: d.s, c: d.c, k: d.k, d: d.d, v: d.v })) }); }
  }
  function onDamageGuest(e, amt, src, opts) {
    if (e === Player || !e.net) return false;
    e.hurtT = 0.25;
    S.link && S.link.send({ t: 'dmg', i: e.id, a: r2(amt), o: opts && Object.keys(opts).length ? opts : undefined });
    return true;
  }

  // ============================================================
  //  SÜNDMUSED (efektid ja helid mõlemas suunas)
  // ============================================================
  const FXL = ['muzzle', 'tracer', 'rail', 'sparks', 'dust', 'goo', 'impact', 'explosion', 'crystalBurst', 'beam', 'repair', 'smoke'];
  const AUL = { shoot: 1, explode: 0, goat: 0, kiskja: 0, stalker: 0, crab: 0, roar: 0, death: 0, cometWhoosh: -1, alarm: -1, powerOn: -1 };
  function evPos(code, a) {
    if (code[0] === 'f') return [a[0], a[2]];
    if (code === 'n') return [a[0], a[1]];
    const k = code.slice(2), i = AUL[k];
    if (i < 0) return null;
    if (k === 'explode' && a[2]) return null;
    return [a[i], a[i + 1]];
  }
  function queueEv(code, a) {
    if (!S.active || replaying) return;
    let args;
    try { args = JSON.parse(JSON.stringify(a)); } catch (e) { return; }
    const ev = [code, args];
    if (S.role === 'guest') { outEv.push(ev); return; }
    const p = evPos(code, args);
    for (const P of S.peers) {
      if (!P.ready) continue;
      if (p && P.av && Math.hypot(p[0] - P.av.pos.x, p[1] - P.av.pos.z) > 280) continue;
      P.ev.push(ev);
    }
  }
  function playEv(ev) {
    const [code, a] = ev;
    try {
      if (code === 'n') { Ents.noise(a[0], a[1], a[2], a[3]); return; }
      if (code[0] === 'f') { const f = FX[code.slice(2)]; if (f) f.apply(FX, a); return; }
      if (code[0] === 'a') { const f = Audio2[code.slice(2)]; if (f) f.apply(Audio2, a); }
    } catch (e) { /* vigane sündmus */ }
  }
  let wrapped = false;
  function installWraps() {
    if (wrapped) return; wrapped = true;
    for (const k of FXL) {
      const f = FX[k]; if (typeof f !== 'function') continue;
      FX[k] = function (...a) { if (fxDepth === 0) queueEv('f.' + k, a); fxDepth++; try { return f.apply(this, a); } finally { fxDepth--; } };
    }
    for (const k in AUL) {
      const f = Audio2[k]; if (typeof f !== 'function') continue;
      Audio2[k] = function (...a) {
        if (k === 'shoot' && a[1] === undefined && S.active && !replaying) queueEv('a.shoot', [a[0], r2(Player.pos.x), r2(Player.pos.z)]);
        else queueEv('a.' + k, a);
        return f.apply(this, a);
      };
    }
    const noise0 = Ents.noise;
    Ents.noise = function (x, z, r, kind) { if (S.role === 'guest' && S.active && !replaying) outEv.push(['n', [r2(x), r2(z), r, kind]]); return noise0(x, z, r, kind); };
    const msg0 = UI.msg, ban0 = UI.banner;
    UI.msg = function (...a) { if (S.role === 'host' && S.active && !replaying) for (const P of S.peers) if (P.ready) P.link.send({ t: 'ui', m: 'msg', a }); return msg0.apply(this, a); };
    UI.banner = function (...a) { if (S.role === 'host' && S.active && !replaying) for (const P of S.peers) if (P.ready) P.link.send({ t: 'ui', m: 'banner', a }); return ban0.apply(this, a); };
    const shoot0 = Player.shoot;
    Player.shoot = function (...a) { S.firedT = G.time.total; S.fireN = (S.fireN || 0) + 1; return shoot0.apply(this, a); };
    const launch0 = Comets.launch;
    Comets.launch = function (...a) {
      const r = launch0.apply(this, a);
      const f = Comets.flying[Comets.flying.length - 1];
      if (S.role === 'host' && S.active && f) for (const P of S.peers) if (P.ready) P.link.send({ t: 'cf', f: { sx: f.sx, sy: f.sy, sz: f.sz, tx: f.tx, ty: f.ty, tz: f.tz, t: 0, T: f.T } });
      return r;
    };
    // --- külalise teod, mis muudavad jagatud maailma ---
    const G1 = (fn, after) => function (...a) { const before = after ? after.pre(...a) : null; const r = fn.apply(this, a); if (S.role === 'guest' && S.active && after) after.post(before, ...a); return r; };
    salvage = G1(salvage, { pre: (w) => w.scrap, post: (b, w) => { if (b - w.scrap > 0) S.link.send({ t: 'wk', i: World.wrecks.indexOf(w), n: b - w.scrap }); } });
    butcher = G1(butcher, { pre: (e) => e.meat, post: (b, e) => { if (b - e.meat > 0) S.link.send({ t: 'bt', i: e.id, n: b - e.meat }); } });
    pickupBag = G1(pickupBag, {
      pre: (p) => { const d = p.data || {}; const it = d.items ? d.items.map((q) => q.slice()) : ['kris', 'scrap', 'meat', 'stones'].filter((k) => d[k]).map((k) => [k, d[k]]); return { x: p.x, z: p.z, it }; },
      post: (b, p) => { const now = (p.data && p.data.items) || []; const took = b.it.map(([id, n]) => { const q = now.find((x) => x[0] === id); return [id, n - (q ? q[1] : 0)]; }).filter((q) => q[1] > 0); if (took.length) S.link.send({ t: 'pick', x: b.x, z: b.z, took }); },
    });
    repairObj = G1(repairObj, { pre: () => G.res.scrap, post: (b, o, cost, after, partial) => { if (b >= cost) S.link.send({ t: 'rep', i: o.id, p: partial ? 1 : 0 }); } });
    const mine0 = Comets.mine;
    Comets.mine = function (cl, who) { const b = cl.amount; mine0.call(this, cl, who); if (S.role === 'guest' && S.active && who === Player && cl.amount < b) S.link.send({ t: 'mn', x: cl.x, z: cl.z }); };
    const sf0 = Crew.setFollow, fn0 = Crew.followNear, ab0 = Crew.assignBeds;
    Crew.setFollow = function (e, on, who) { if (S.role === 'guest' && S.active) { S.link.send({ t: 'fol', i: e.id, on: !!on }); return; } return sf0(e, on, who); };
    Crew.followNear = function (range, who) { if (S.role === 'guest' && S.active) { S.link.send({ t: 'foln' }); return; } return fn0(range, who); };
    Crew.assignBeds = function () { if (S.role === 'guest' && S.active) return; return ab0(); };
    const bh0 = Boss.hit;
    Boss.hit = function (e, dmg, src, idx, x, y, z) { if (S.role === 'guest' && S.active) { e.hurtT = 0.2; S.link.send({ t: 'bh', d: r2(dmg), i: idx, x: r2(x), y: r2(y), z: r2(z) }); return; } return bh0.call(this, e, dmg, src, idx, x, y, z); };
    // ehitamine: külalise muudatused peremehele
    for (const k of ['addWalls', 'removeWalls', 'addObj', 'removeObj', 'setOpening', 'setRoomStyle']) {
      const f = Base[k];
      Base[k] = function (...a) {
        const r = f.apply(this, a);
        if (S.role === 'guest' && S.active && !applying) {
          if (k === 'addObj') { if (r) S.link.send({ t: 'bop', k, a: [a[0], a[1], a[2], a[3], a[4] || null, r.id] }); }
          else if (k === 'setRoomStyle') { const rm = Base.rooms.get(a[0]); if (rm) S.link.send({ t: 'bop', k, a: [rm.cells[0][0], rm.cells[0][1], a[1], a[2]] }); }
          else S.link.send({ t: 'bop', k, a });
        }
        return r;
      };
    }
    // külalise maha visatud kotid
    const pk = Ents.pickups;
    pk.push = function (...items) {
      if (S.role === 'guest' && S.active) for (const p of items) S.link.send({ t: 'drop', p: { kind: p.kind, x: r2(p.x), z: r2(p.z), data: p.data } });
      return Array.prototype.push.apply(this, items);
    };
  }
  function onDamage(e, amt, src, opts) {
    if (S.role === 'host') return onDamageHost(e, amt, src);
    if (S.role === 'guest') return onDamageGuest(e, amt, src, opts);
    return false;
  }

  // ============================================================
  //  JOONISTAMINE: peremehe mürsud, nimesildid
  // ============================================================
  const tags = new Map(), tp = {};
  function drawExtra() {
    if (!S.active) return;
    if (S.role === 'guest') for (const p of netProjs) if (p.kind === 'shard') { if (!p.m) p.m = M4.create(); M4.compose(p.m, p.x, p.y, p.z, G.time.total * 5, G.time.total * 7, 0, 1.4, 1.4, 1.4); GFX.draw(MODELS.shard, p.m, null, null, { shadow: false }); }
    // nimesildid kaasmängijate kohal
    const seen = new Set();
    const list = S.role === 'host' ? S.peers.map((P) => P.av).filter(Boolean) : [...prox.values()].filter((e) => e.team === 'player' && e.kind === 'human');
    for (const e of list) {
      if (!e.alive || !e.headPos) continue;
      const p = GFX.project(e.headPos.x, e.headPos.y + 0.45, e.headPos.z, tp);
      if (!p || p.d > 90) continue;
      let el = tags.get(e);
      if (!el) { el = document.createElement('div'); el.className = 'ntag'; document.getElementById('hud').appendChild(el); tags.set(e, el); }
      const nm = e.netName || (e.id === HOST_ID ? S.hostName : 'Friend');
      if (el.textContent !== nm) el.textContent = nm;
      el.style.display = 'block';
      el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px) translate(-50%, -100%)`;
      el.style.opacity = String(clamp((90 - p.d) / 20, 0.25, 1));
      seen.add(e);
    }
    for (const [e, el] of tags) if (!seen.has(e)) { if (!Ents.list.includes(e)) { el.remove(); tags.delete(e); } else el.style.display = 'none'; }
  }

  // ============================================================
  //  VESTLUS
  // ============================================================
  function gotChat(name, text, ent) {
    text = String(text || '').slice(0, 160);
    S.chat.push({ n: name, s: text }); if (S.chat.length > 40) S.chat.shift();
    replaying = true; try { UI.msg(name + ': ' + text, 'info'); } finally { replaying = false; }
    if (ent && UI.bubble) UI.bubble(ent, text);
    Audio2.radio();
    refresh();
  }
  function sendChat(text) {
    text = String(text || '').trim().slice(0, 160); if (!text || !S.active) return;
    const me = G.pname || (S.role === 'host' ? 'Host' : 'Friend');
    S.chat.push({ n: me, s: text }); if (S.chat.length > 40) S.chat.shift();
    if (S.role === 'guest') S.link.send({ t: 'chat', s: text });
    else for (const P of S.peers) if (P.ready) P.link.send({ t: 'chat', n: me, s: text, i: HOST_ID });
    replaying = true; try { UI.msg(me + ': ' + text, 'info'); } finally { replaying = false; }
  }
  function openChat() { UI.openPanel('coop', 'chat'); setTimeout(() => { const i = document.getElementById('nChatIn'); if (i) i.focus(); }, 30); }
  function toastTo(who, text) { if (who && who.netPeer) who.netPeer.link.send({ t: 'toast', s: text }); }

  // ============================================================
  //  PANEEL
  // ============================================================
  function renderPanel(body) {
    const inGame = G.mode === 'play' || G.mode === 'build';
    document.getElementById('pTitle').textContent = 'Co-op';
    const tabsL = [];
    if (S.role !== 'guest' && inGame) tabsL.push(['host', 'Invite a friend']);
    if (S.role !== 'host' && (!inGame || S.role === 'guest')) tabsL.push(['join', 'Join a friend']);
    if (S.active) tabsL.push(['chat', 'Messages']);
    let tab = UI.panelTab;
    if (!tabsL.find((t) => t[0] === tab)) tab = tabsL[0] ? tabsL[0][0] : 'join';
    UI.tabs(tabsL, tab);
    const E = UI.esc;
    let h = '';
    const stat = (S.status ? `<p class="nstat">${E(S.status)}</p>` : '') + (S.err ? `<p class="nerr">${E(S.err)}</p>` : '');
    if (tab === 'host') {
      if (S.code) {
        h += `<p class="note">Give your friend this code. They open K73, tap <b>Join a friend (co-op)</b> and type it in.</p><div class="ncode">${E(S.code)}</div>`;
      } else if (!S.manual) {
        h += `<p class="note">Your friend joins this world as a second player. Storage, money, the base and the crew are shared. Your game keeps running while they play — the host's device does the heavy lifting, so it should be the faster one.</p>
          <div class="menu" style="margin-top:12px">${UI.btn('host', 'Start hosting (get a code)', { primary: true })}</div>`;
      }
      h += stat;
      if (S.peers.length) h += '<div style="margin-top:10px">' + S.peers.map((P, i) => `<div class="row"><div class="grow"><div class="t">${E(P.name)}</div><div class="s">${P.ready ? 'Playing' : 'Connecting…'}</div></div>${UI.btn('kick:' + i, 'Remove')}</div>`).join('') + '</div>';
      if (S.manual && S.manual.offer !== undefined) {
        h += `<h4 class="nh">Connect without a code</h4><p class="note">1. Copy this invitation and send it to your friend (any messenger).</p>
          <textarea class="ncodebox" readonly id="nOffer">${E(S.manual.offer || 'Creating…')}</textarea><div class="menu">${UI.btn('copyOffer', 'Copy invitation')}</div>
          <p class="note">2. Paste the answer code your friend sends back:</p><textarea class="ncodebox" id="nAnsIn" placeholder="Answer code">${E(S.manualIn)}</textarea><div class="menu">${UI.btn('useAns', 'Connect', { primary: true })}</div>`;
      } else if (!S.code || S.peers.length === 0) {
        h += `<p class="note" style="margin-top:14px">Code server blocked on your network? ${UI.btn('manualHost', 'Connect without a code')}</p>`;
      }
      if (S.active && S.role === 'host') h += `<div class="menu" style="margin-top:14px">${UI.btn('stop', 'Stop co-op')}</div>`;
    } else if (tab === 'join') {
      if (S.role === 'guest' && S.active) {
        h += `<p class="note">You are playing in <b>${E(S.hostName)}</b>'s game.</p><div class="menu" style="margin-top:12px">${UI.btn('leave', 'Leave the game')}</div>`;
      } else {
        h += `<p class="note">Type the 6-character code from your friend. You join their world with your own character.</p>
          <div class="nrow"><input id="nCode" class="ninput" maxlength="7" autocomplete="off" autocapitalize="characters" placeholder="CODE" value="${E(S.joinCode)}">${UI.btn('join', 'Join', { primary: true })}</div>${stat}`;
        if (S.manual && S.manual.answer !== undefined && S.manual.step === 'answer') {
          h += `<p class="note">Send this answer code back to your friend:</p><textarea class="ncodebox" readonly id="nAns">${E(S.manual.answer || 'Creating…')}</textarea><div class="menu">${UI.btn('copyAns', 'Copy answer')}</div>`;
        } else {
          h += `<h4 class="nh">Connect without a code</h4><p class="note">If the code doesn't work, ask your friend for an invitation from "Connect without a code" and paste it here:</p>
            <textarea class="ncodebox" id="nOfferIn" placeholder="Invitation">${E(S.manualIn)}</textarea><div class="menu">${UI.btn('useOffer', 'Create answer')}</div>`;
        }
      }
    } else if (tab === 'chat') {
      h += `<div class="nchat">${S.chat.map((c) => `<div><b>${E(c.n)}:</b> ${E(c.s)}</div>`).join('') || '<div class="note">No messages yet. Press Enter in the game to write.</div>'}</div>
        <div class="nrow"><input id="nChatIn" class="ninput" maxlength="160" autocomplete="off" placeholder="Message" value="${E(S.chatIn)}">${UI.btn('say', 'Send', { primary: true })}</div>
        <div class="menu" style="margin-top:8px">${['Follow me!', 'Help!', 'Comet!', 'Back to base', 'Thanks!'].map((q, i) => UI.btn('q:' + i, q)).join('')}</div>`;
    }
    body.innerHTML = h;
    const ci = document.getElementById('nCode'); if (ci) { ci.oninput = () => { S.joinCode = ci.value; }; ci.onkeydown = (ev) => { if (ev.key === 'Enter') join(ci.value); ev.stopPropagation(); }; }
    for (const id of ['nAnsIn', 'nOfferIn']) { const t = document.getElementById(id); if (t) { t.oninput = () => { S.manualIn = t.value; }; t.onkeydown = (ev) => ev.stopPropagation(); } }
    const chi = document.getElementById('nChatIn');
    if (chi) { chi.oninput = () => { S.chatIn = chi.value; }; chi.onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') { sendChat(chi.value); S.chatIn = ''; UI.closePanel(); } else if (ev.key === 'Escape') UI.closePanel(); }; }
    const nc = body.querySelector('.nchat'); if (nc) nc.scrollTop = nc.scrollHeight;
    const copy = (id) => { const t = document.getElementById(id); if (!t) return; t.select(); try { navigator.clipboard.writeText(t.value).then(() => UI.toast('Copied'), () => { document.execCommand('copy'); UI.toast('Copied'); }); } catch (e) { try { document.execCommand('copy'); UI.toast('Copied'); } catch (e2) { /* ignoreeri */ } } };
    UI.bindActs(body, {
      host: () => host(),
      stop: () => { stopHost(); UI.msg('Co-op stopped.', 'warn'); },
      kick: (i) => { const P = S.peers[+i]; if (P) { P.link.send({ t: 'err', s: 'The host removed you from the game.' }); setTimeout(() => dropPeer(P), 300); } },
      join: () => join((document.getElementById('nCode') || {}).value || S.joinCode),
      leave: () => leave(),
      manualHost: () => { manualHostStart(); refresh(); },
      copyOffer: () => copy('nOffer'), copyAns: () => copy('nAns'),
      useAns: () => manualHostAnswer((document.getElementById('nAnsIn') || {}).value || S.manualIn),
      useOffer: () => { manualJoin((document.getElementById('nOfferIn') || {}).value || S.manualIn); setStatus('Creating your answer…'); },
      say: () => { const v = (document.getElementById('nChatIn') || {}).value; sendChat(v); S.chatIn = ''; refresh(); },
      q: (i) => { sendChat(['Follow me!', 'Help!', 'Comet!', 'Back to base', 'Thanks!'][+i]); UI.closePanel(); },
    });
  }
  function leave() {
    if (S.role === 'guest') { if (S.link) S.link.send({ t: 'bye' }); const L = S.link; S.role = null; lostHostQuiet(); if (L) setTimeout(() => L.close(), 200); }
    else if (S.role === 'host') stopHost();
  }
  function lostHostQuiet() {
    const was = S.active;
    S.active = false; S.link = null;
    if (S.peer) try { S.peer.destroy(); } catch (e) { /* ignoreeri */ }
    S.peer = null; clearProxies(); setStatus('');
    if (was) { UI.closePanel(); Game.toTitle(); }
  }
  function update(dt) {
    if (S.role === 'host' && S.active) hostTick(dt);
    else if (S.role === 'guest') guestSend(dt);
  }

  return {
    get role() { return S.role; }, get active() { return S.active; }, isHost, peerCount,
    update, guestSim, drawExtra, renderPanel, onDamage, nearAvatar, openChat, toastTo, leave, host, join,
    get S() { return S; },
    _manualHost: manualHostStart, _manualAnswer: manualHostAnswer, _manualJoin: manualJoin,
  };
})();
