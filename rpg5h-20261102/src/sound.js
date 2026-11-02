export function createSound() {
  let ctx, osc, gain, noise;
  
  const init = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      noise.loop = true;
    }
  };

  const playTone = (freq, type, duration, vol = 0.3) => {
    if (!ctx) init();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);
  };

  const playNoise = (duration, vol = 0.3) => {
    if (!ctx) init();
    noise.connect(gain || (gain = ctx.createGain()));
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    noise.start();
    noise.stop(ctx.currentTime + duration + 0.1);
  };

  const attack = () => playTone(440, 'sine', 0.3, 0.2);
  const pickup = () => playTone(880, 'triangle', 0.5, 0.25);
  const hurt = () => {
    if (!ctx) init();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };
  const ambient = () => {
    if (!ctx) init();
    noise.connect(gain || (gain = ctx.createGain()));
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;
  };
  const setMuted = (muted) => {
    if (ctx && gain) gain.gain.value = muted ? 0 : 0.3;
  };
  const dispose = () => {
    ctx?.close();
    osc?.disconnect();
    gain?.disconnect();
    noise?.disconnect();
    ctx = null;
    osc = null;
    gain = null;
    noise = null;
  };

  return { attack, pickup, hurt, ambient, setMuted, dispose };
}
