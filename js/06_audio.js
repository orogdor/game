// ============================================================
//  HELI: kõik helid sünteesitakse WebAudioga
// ============================================================
const Audio2 = (() => {
  let ctx = null, master = null, sfxBus = null, ambBus = null, musBus = null, noiseBuf = null;
  let windSrc = null, windFilt = null, windGain = null, humOsc = null, humGain = null, revIn = null, gustT = 0, ambT = 8;
  const L = { x: 0, z: 0, yaw: 0 };
  let vol = 0.8, musicOn = false, musicTimer = 0, musicStep = 0;
  let lastFoot = 0;
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    comp.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(comp);
    ambBus = ctx.createGain(); ambBus.gain.value = 0.5; ambBus.connect(comp);
    musBus = ctx.createGain(); musBus.gain.value = 0.22; musBus.connect(comp);
    // kõrbe kaja: sünteesitud impulss (hajus peegeldus kaljudelt, ~2.4 s)
    try {
      const len = Math.floor(ctx.sampleRate * 2.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < len; i++) { const t = i / ctx.sampleRate; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * (t < 0.012 ? t / 0.012 : 1) * (1 + 0.6 * Math.exp(-Math.pow((t - 0.32 - c * 0.05) / 0.03, 2))); }
      }
      const conv = ctx.createConvolver(); conv.buffer = ir;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      revIn = ctx.createGain(); revIn.gain.value = 0.5;
      revIn.connect(lp); lp.connect(conv); conv.connect(comp);
    } catch (e) { revIn = null; }
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // tuul
    windSrc = ctx.createBufferSource(); windSrc.buffer = noiseBuf; windSrc.loop = true;
    windFilt = ctx.createBiquadFilter(); windFilt.type = 'bandpass'; windFilt.frequency.value = 400; windFilt.Q.value = 0.6;
    windGain = ctx.createGain(); windGain.gain.value = 0.12;
    windSrc.connect(windFilt); windFilt.connect(windGain); windGain.connect(ambBus); windSrc.start();
    // generaatori sumin
    humOsc = ctx.createOscillator(); humOsc.type = 'sawtooth'; humOsc.frequency.value = 50;
    const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 160;
    humGain = ctx.createGain(); humGain.gain.value = 0;
    humOsc.connect(hf); hf.connect(humGain); humGain.connect(ambBus); humOsc.start();
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function setVolume(v) { vol = v; if (master) master.gain.value = v; }
  function setListener(x, z, yaw) { L.x = x; L.z = z; L.yaw = yaw; }
  function spatial(x, z, range = 60) {
    if (x === undefined) return { g: 1, p: 0 };
    const dx = x - L.x, dz = z - L.z, d = Math.hypot(dx, dz);
    const g = 1 / (1 + (d / range) * (d / range) * 4);
    // parem = -cos(yaw), sin(yaw)
    const rx = -Math.cos(L.yaw), rz = Math.sin(L.yaw);
    const p = d > 0.5 ? clamp((dx * rx + dz * rz) / d, -1, 1) * 0.8 : 0;
    return { g, p, d };
  }
  // ruumiline väljund: valjus + panoraam + kaugusega summutuv kõrgsagedus + kajasaade (kaugemal suhteliselt rohkem kaja)
  function out(x, z, range, rev = 0.25) {
    const s = spatial(x, z, range);
    if (s.g < 0.01) return null;
    const g = ctx.createGain(); g.gain.value = s.g;
    const d = s.d || 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.max(900, 18000 / (1 + d / 35)); lp.Q.value = 0.5;
    g.connect(lp);
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = s.p; lp.connect(p); p.connect(sfxBus); }
    else lp.connect(sfxBus);
    if (revIn && rev > 0) { const rs = ctx.createGain(); rs.gain.value = rev * (0.5 + Math.min(1.5, d / 40)) * Math.min(1, 0.4 + s.g); lp.connect(rs); rs.connect(revIn); }
    return g;
  }
  const crack = (d, t, pk) => nz(d, t, 0.025, 'highpass', 5000, 0, 0.7, pk, 0.001);          // ülehelikiirusega "plaks"
  const mech = (d, t, f, pk) => { nz(d, t, 0.03, 'bandpass', f, f * 0.7, 6, pk, 0.001); tn(d, t, 0.02, 'square', f * 0.5, f * 0.3, pk * 0.4, 0.001); };
  function nz(dest, t, dur, type, f0, f1, q, peak, attack = 0.005) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function tn(dest, t, dur, type, f0, f1, peak, attack = 0.005) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  const ok = () => ctx && ctx.state !== 'closed';
  const api = {
    init, resume, setVolume, setListener,
    shoot(kind, x, z) {
      if (!ok()) return; const d = out(x, z, 90, kind === 'pistol' || kind === 'smg' ? 0.25 : 0.4); if (!d) return; const t = ctx.currentTime;
      if (kind !== 'rail' && kind !== 'plasma') { crack(d, t, kind === 'sniper' ? 0.55 : kind === 'smg' || kind === 'pistol' ? 0.25 : 0.38); mech(d, t + 0.012, kind === 'lmg' ? 1300 : 2100, 0.1); }
      if (kind === 'plasma') { tn(d, t, 0.25, 'sawtooth', 900, 140, 0.25); tn(d, t, 0.3, 'sine', 420, 60, 0.4); nz(d, t, 0.3, 'bandpass', 2400, 600, 3, 0.3); return; }
      if (kind === 'gl') { tn(d, t, 0.2, 'sine', 140, 50, 0.7); nz(d, t, 0.18, 'lowpass', 900, 150, 0.8, 0.6); mech(d, t + 0.25, 900, 0.15); return; }
      if (kind === 'rail') { tn(d, t, 0.35, 'sawtooth', 1400, 90, 0.35); nz(d, t, 0.4, 'bandpass', 3000, 400, 1, 0.5); tn(d, t, 0.6, 'sine', 90, 30, 0.6); }
      else if (kind === 'shotgun') { nz(d, t, 0.32, 'lowpass', 2200, 200, 0.8, 1.0); tn(d, t, 0.2, 'sine', 95, 35, 0.8); nz(d, t + 0.45, 0.08, 'bandpass', 900, 600, 3, 0.18); nz(d, t + 0.62, 0.07, 'bandpass', 1200, 800, 3, 0.18); }
      else if (kind === 'sniper') { nz(d, t, 0.45, 'lowpass', 3000, 150, 0.7, 1.0); tn(d, t, 0.35, 'sine', 70, 28, 0.9); nz(d, t + 0.9, 0.06, 'bandpass', 1400, 900, 3, 0.2); nz(d, t + 1.05, 0.08, 'bandpass', 900, 700, 3, 0.2); }
      else if (kind === 'pistol') { nz(d, t, 0.1, 'bandpass', 2200, 500, 1.1, 0.6); tn(d, t, 0.08, 'triangle', 200, 70, 0.35); }
      else if (kind === 'smg') { nz(d, t, 0.07, 'bandpass', 2600, 900, 1.2, 0.45); tn(d, t, 0.05, 'square', 180, 80, 0.15); }
      else if (kind === 'lmg') { nz(d, t, 0.18, 'bandpass', 1100, 250, 0.9, 0.8); tn(d, t, 0.14, 'triangle', 100, 40, 0.6); }
      else if (kind === 'turret') { nz(d, t, 0.09, 'bandpass', 1800, 600, 1.2, 0.45); tn(d, t, 0.07, 'square', 160, 60, 0.2); }
      else if (kind === 'enemy') { nz(d, t, 0.14, 'bandpass', 1100, 300, 1.0, 0.5); tn(d, t, 0.1, 'triangle', 140, 50, 0.3); }
      else { nz(d, t, 0.16, 'bandpass', 1500, 300, 0.9, 0.7); tn(d, t, 0.12, 'triangle', 120, 45, 0.5); nz(d, t, 0.05, 'highpass', 4000, 0, 0.7, 0.3); }
    },
    reload() {   // salv välja, salv sisse (plastik + metall), lukk ette
      if (!ok()) return; const t = ctx.currentTime;
      mech(sfxBus, t, 1500, 0.12); nz(sfxBus, t + 0.05, 0.12, 'bandpass', 700, 400, 2, 0.08);
      nz(sfxBus, t + 0.55, 0.05, 'bandpass', 1100, 700, 4, 0.16); tn(sfxBus, t + 0.56, 0.03, 'square', 700, 400, 0.08);
      mech(sfxBus, t + 0.85, 2600, 0.14); mech(sfxBus, t + 0.93, 1900, 0.16);
    },
    empty() { if (!ok()) return; tn(sfxBus, ctx.currentTime, 0.04, 'square', 1800, 1700, 0.08); },
    hit(kind) { if (!ok()) return; const t = ctx.currentTime; if (kind === 'flesh') nz(sfxBus, t, 0.08, 'lowpass', 900, 200, 1, 0.25); else tn(sfxBus, t, 0.05, 'square', 2400, 1800, 0.06); },
    hitMarker() { if (!ok()) return; tn(sfxBus, ctx.currentTime, 0.04, 'sine', 1900, 1600, 0.1); },
    hurt() { if (!ok()) return; const t = ctx.currentTime; tn(sfxBus, t, 0.18, 'sawtooth', 160, 70, 0.25); nz(sfxBus, t, 0.15, 'lowpass', 600, 100, 1, 0.3); },
    explode(x, z, big) { if (!ok()) return; const d = out(x, z, big ? 400 : 140, 0.6); if (!d) return; const t = ctx.currentTime + spatial(x, z).d / 340;
      crack(d, t, big ? 0.9 : 0.6);
      tn(d, t, big ? 2.2 : 0.9, 'sine', big ? 70 : 95, 22, big ? 1.0 : 0.75); nz(d, t, big ? 2.5 : 1.0, 'lowpass', big ? 900 : 1800, 60, 0.7, big ? 1.0 : 0.7, 0.01);
      nz(d, t + 0.05, big ? 3.5 : 1.8, 'lowpass', 260, 50, 0.5, big ? 0.6 : 0.35, 0.2);                       // järelkõmin
      for (let i = 0; i < (big ? 14 : 8); i++) nz(d, t + 0.15 + Math.random() * (big ? 1.4 : 0.8), 0.03, 'bandpass', 1500 + Math.random() * 3000, 0, 3, 0.05 + Math.random() * 0.08, 0.001);   // kukkuv praht
    },
    cometWhoosh(x, z) { if (!ok()) return; const t = ctx.currentTime; nz(sfxBus, t, 6.5, 'bandpass', 180, 1400, 0.8, 0.35, 3.5); tn(sfxBus, t, 6.5, 'sawtooth', 40, 90, 0.08, 4); },
    door(x, z) { if (!ok()) return; const d = out(x, z, 18); if (!d) return; const t = ctx.currentTime; nz(d, t, 0.35, 'bandpass', 500, 1200, 2, 0.12, 0.05); },
    pickup() { if (!ok()) return; const t = ctx.currentTime; tn(sfxBus, t, 0.08, 'sine', 900, 1300, 0.15); tn(sfxBus, t + 0.06, 0.1, 'sine', 1300, 1800, 0.12); },
    crystal() { if (!ok()) return; const t = ctx.currentTime; tn(sfxBus, t, 0.25, 'sine', 1600 + Math.random() * 400, 2600, 0.1); tn(sfxBus, t, 0.3, 'triangle', 2400, 3200, 0.05); },
    ui() { if (!ok()) return; tn(sfxBus, ctx.currentTime, 0.05, 'triangle', 700, 900, 0.1); },
    build() { if (!ok()) return; const t = ctx.currentTime; nz(sfxBus, t, 0.12, 'bandpass', 700, 200, 2, 0.3); tn(sfxBus, t, 0.1, 'square', 180, 90, 0.15); nz(sfxBus, t + 0.12, 0.1, 'bandpass', 900, 300, 2, 0.25); },
    deny() { if (!ok()) return; const t = ctx.currentTime; tn(sfxBus, t, 0.12, 'square', 220, 200, 0.12); tn(sfxBus, t + 0.13, 0.15, 'square', 180, 160, 0.12); },
    cash() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 3; i++) tn(sfxBus, t + i * 0.07, 0.12, 'sine', 1200 + i * 300, 1500 + i * 300, 0.12); },
    alarm() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 4; i++) { tn(sfxBus, t + i * 0.5, 0.24, 'square', 620, 620, 0.12); tn(sfxBus, t + i * 0.5 + 0.25, 0.24, 'square', 470, 470, 0.12); } },
    radio() { if (!ok()) return; const t = ctx.currentTime; nz(sfxBus, t, 0.18, 'bandpass', 2500, 1200, 3, 0.06); tn(sfxBus, t + 0.02, 0.06, 'sine', 1800, 1800, 0.05); },
    repair() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 3; i++) nz(sfxBus, t + i * 0.12, 0.06, 'bandpass', 2000 + i * 300, 800, 4, 0.18); },
    powerOn() { if (!ok()) return; const t = ctx.currentTime; tn(sfxBus, t, 1.2, 'sawtooth', 30, 120, 0.25, 0.4); nz(sfxBus, t, 0.6, 'lowpass', 300, 2000, 1, 0.2, 0.3); },
    goat(x, z) { if (!ok()) return; const d = out(x, z, 40); if (!d) return; const t = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(330, t + 0.5);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 22; const lg = ctx.createGain(); lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(f); f.connect(g); g.connect(d); o.start(t); lfo.start(t); o.stop(t + 0.6); lfo.stop(t + 0.6); },
    kiskja(x, z) { if (!ok()) return; const d = out(x, z, 70); if (!d) return; const t = ctx.currentTime; tn(d, t, 1.1, 'sawtooth', 150, 48, 0.32, 0.08); tn(d, t + 0.05, 0.9, 'square', 76, 40, 0.12, 0.1); nz(d, t, 1.0, 'bandpass', 1400, 320, 4, 0.45, 0.06); },
    stalker(x, z) { if (!ok()) return; const d = out(x, z, 45); if (!d) return; const t = ctx.currentTime; nz(d, t, 0.6, 'bandpass', 3000, 900, 6, 0.4, 0.05); tn(d, t, 0.5, 'sawtooth', 90, 60, 0.15);
      for (let i = 0; i < 6; i++) nz(d, t + 0.55 + i * 0.045, 0.025, 'bandpass', 4200 - i * 200, 0, 8, 0.12, 0.001); },   // lõugade klõbin
    crab(x, z) { if (!ok()) return; const d = out(x, z, 50); if (!d) return; const t = ctx.currentTime; for (let i = 0; i < 5; i++) nz(d, t + i * 0.05, 0.04, 'highpass', 3000, 0, 2, 0.2); },
    roar(x, z) { if (!ok()) return; const d = out(x, z, 300, 0.8); if (!d) return; const t = ctx.currentTime; tn(d, t, 2.5, 'sawtooth', 55, 32, 0.7, 0.3); tn(d, t, 2.5, 'square', 82, 40, 0.25, 0.3); nz(d, t, 2.5, 'lowpass', 500, 120, 1, 0.6, 0.3);
      nz(d, t + 0.2, 2.0, 'bandpass', 700, 380, 5, 0.35, 0.4); tn(d, t + 0.1, 2.2, 'sawtooth', 27, 22, 0.5, 0.5);   // kurgu formant + infrabass
      for (let i = 0; i < 10; i++) nz(d, t + 0.3 + Math.random() * 2, 0.06, 'lowpass', 600, 0, 1, 0.12, 0.002); },   // kivide ragin
    death(x, z) { if (!ok()) return; const d = out(x, z, 40); if (!d) return; const t = ctx.currentTime; tn(d, t, 0.5, 'sawtooth', 300, 60, 0.25); },
    step(sand) { if (!ok()) return; const now = ctx.currentTime; if (now - lastFoot < 0.1) return; lastFoot = now;
      if (sand) { nz(sfxBus, now, 0.09, 'lowpass', 600 + Math.random() * 300, 0, 1, 0.08); nz(sfxBus, now + 0.02, 0.07, 'highpass', 3500 + Math.random() * 1500, 0, 0.7, 0.025); }   // liiva krigin
      else { nz(sfxBus, now, 0.06, 'bandpass', 1300 + Math.random() * 400, 0, 1.5, 0.06); tn(sfxBus, now, 0.04, 'sine', 140, 90, 0.05); } },
    land() { if (!ok()) return; nz(sfxBus, ctx.currentTime, 0.15, 'lowpass', 500, 100, 1, 0.25); },
    setWind(strength) { if (windGain) windGain.gain.value = 0.06 + strength * 0.2; if (windFilt) windFilt.frequency.value = 300 + strength * 500; },
    setHum(v) { if (humGain) humGain.gain.value = v * 0.08; },
    setMusic(on) { musicOn = on; },
    update(dt) {
      if (!ok()) return;
      // tuulepuhangud ja harvad kauged helid öösel
      gustT -= dt;
      if (gustT <= 0 && windGain && windFilt) { gustT = 3 + Math.random() * 6; const t = ctx.currentTime, b = windGain.gain.value; windGain.gain.setTargetAtTime(b * (1.6 + Math.random()), t, 0.8); windGain.gain.setTargetAtTime(b, t + 1.5 + Math.random() * 2, 1.2); windFilt.frequency.setTargetAtTime(windFilt.frequency.value * 1.4, t, 0.8); windFilt.frequency.setTargetAtTime(windFilt.frequency.value, t + 2, 1.5); }
      ambT -= dt;
      if (ambT <= 0) {
        ambT = 14 + Math.random() * 25;
        const night = typeof Econ !== 'undefined' && Econ.isNight && Econ.isNight();
        const a = Math.random() * TAU, r = 120 + Math.random() * 150, ax = L.x + Math.cos(a) * r, az = L.z + Math.sin(a) * r;
        const d = out(ax, az, 400, 1.0);
        if (d) { const t = ctx.currentTime;
          if (night) { tn(d, t, 1.6, 'sawtooth', 210, 95, 0.12, 0.3); nz(d, t, 1.4, 'bandpass', 1300, 500, 6, 0.1, 0.3); }   // kauge ulg
          else { for (let i = 0; i < 5; i++) nz(d, t + i * 0.18 + Math.random() * 0.1, 0.25, 'lowpass', 400, 90, 1, 0.08, 0.02); }   // kivivaring
        }
      }
      if (!musicOn) return;
      musicTimer -= dt;
      if (musicTimer <= 0) {
        // vana jukeboksi lugu: aeglane mollirada
        const seq = [57, 60, 64, 62, 60, 57, 55, 57, 52, 55, 59, 57, 55, 52, 50, 52];
        const bass = [45, 45, 40, 40, 43, 43, 38, 40];
        const t = ctx.currentTime, n = seq[musicStep % seq.length];
        const f = 440 * Math.pow(2, (n - 69) / 12);
        tn(musBus, t, 0.5, 'triangle', f, f, 0.25, 0.02);
        tn(musBus, t, 0.5, 'sine', f * 2, f * 2, 0.05, 0.02);
        if (musicStep % 2 === 0) { const b = bass[(musicStep / 2) % bass.length]; tn(musBus, t, 0.9, 'sine', 440 * Math.pow(2, (b - 69) / 12), 0, 0.3, 0.02); }
        musicStep++; musicTimer = 0.42;
      }
    },
  };
  return api;
})();
