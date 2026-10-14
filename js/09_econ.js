// ============================================================
//  MÄNGU OLEK, AEG, MAJANDUS, VÕLG
// ============================================================
const DAY_LEN = 360;
const DIFFS = {
  kerge: { name: 'Easy', edmg: 0.6, rival: 0.7, debt: 0.7, yield: 1.3, raid: 0.7 },
  tavaline: { name: 'Normal', edmg: 1.0, rival: 1.0, debt: 1.0, yield: 1.0, raid: 1.0 },
  karm: { name: 'Hard', edmg: 1.35, rival: 1.3, debt: 1.3, yield: 0.85, raid: 1.3 },
};
const G = {
  mode: 'title', seed: 1, diff: 'tavaline', dk: DIFFS.tavaline,
  time: { day: 1, t: 0.03, total: 0 },
  res: { cr: 150, scrap: 40, kris: 0, lihv: 0, meat: 0, food: 6 },
  carry: { kris: 0, scrap: 0, meat: 0, stones: 0 },
  debt: { left: 30000, nextDay: 4, amount: 200, idx: 0, grace: false, warned: false },
  up: { rifle: 1, rail: false, armor: 0 },
  scan: { p: 0, found: false },
  flags: {},
  stats: { kills: 0, crystals: 0, deaths: 0, meat: 0, comets: 0 },
  market: { price: 38 },
  candidates: [],
  log: [],
};
const CARRY_MAX = 40;
// kaubasüstiku pood: tuuakse baasi hoidlasse
const SHOP = {
  ammo: { id: 'ammo_r', n: 60, cost: 40, name: '60 carbine rounds' },
  med: { id: 'medkit', n: 1, cost: 70, name: 'Medkit' },
  ration: { id: 'ration', n: 3, cost: 35, name: '3 ration packs' },
  gren: { id: 'grenade', n: 2, cost: 90, name: '2 grenades' },
  stim: { id: 'stim', n: 1, cost: 80, name: 'Stimulant' },
  helmet: { id: 'helmet', n: 1, cost: 220, name: 'Combat helmet' },
  helmet2: { id: 'helmet2', n: 1, cost: 480, name: 'Visor helmet' },
  vest_l: { id: 'vest_l', n: 1, cost: 160, name: 'Light carrier vest' },
  vest: { id: 'vest', n: 1, cost: 360, name: 'Plate vest' },
  vest_h: { id: 'vest_h', n: 1, cost: 640, name: 'Heavy armour' },
  boots: { id: 'boots', n: 1, cost: 120, name: 'Combat boots' },
  gloves: { id: 'gloves', n: 1, cost: 110, name: 'Tactical gloves' },
  pack_s: { id: 'pack_s', n: 1, cost: 110, name: 'Small backpack' },
  pack: { id: 'pack', n: 1, cost: 240, name: 'Large backpack' },
  cells: { id: 'ammo_c', n: 10, cost: 120, name: '10 railgun charges', needRail: true },
  pistol: { id: 'pistol', n: 1, cost: 140, name: 'Pistol', once: true },
  shotgun: { id: 'shotgun', n: 1, cost: 320, name: 'Shotgun', once: true },
  smg: { id: 'smg', n: 1, cost: 380, name: 'PP-9 SMG', once: true },
  sniper: { id: 'sniper', n: 1, cost: 620, name: 'Sniper rifle', once: true },
  lmg: { id: 'lmg', n: 1, cost: 750, name: 'Machine gun', once: true },
  snammo: { id: 'ammo_sn', n: 10, cost: 50, name: '10 sniper rounds' },
  shells: { id: 'ammo_s', n: 18, cost: 45, name: '18 shotgun shells' },
  pammo: { id: 'ammo_p', n: 80, cost: 40, name: '80 pistol rounds' },
  revolver: { id: 'revolver', n: 1, cost: 260, name: '.44 Revolver', once: true },
  dmr: { id: 'dmr', n: 1, cost: 680, name: 'DMR marksman rifle', once: true },
  ashot: { id: 'ashot', n: 1, cost: 820, name: 'Auto shotgun', once: true },
  gl: { id: 'gl', n: 1, cost: 980, name: 'Grenade launcher', once: true },
  plasma: { id: 'plasma', n: 1, cost: 1400, name: 'Plasma rifle', once: true },
  a44: { id: 'ammo_44', n: 18, cost: 45, name: '18 .44 rounds' },
  plcell: { id: 'ammo_pl', n: 60, cost: 90, name: '60 plasma cells' },
  glam: { id: 'ammo_gl', n: 6, cost: 110, name: '6 grenades (40 mm)' },
  helmet3: { id: 'helmet3', n: 1, cost: 900, name: 'Exo helmet' },
  vest_x: { id: 'vest_x', n: 1, cost: 1500, name: 'Exo armour' },
  boots2: { id: 'boots2', n: 1, cost: 420, name: 'Servo boots' },
  gloves2: { id: 'gloves2', n: 1, cost: 260, name: 'Grip gloves' },
  pack_m: { id: 'pack_m', n: 1, cost: 420, name: 'Military rucksack' },
  trauma: { id: 'trauma', n: 1, cost: 190, name: 'Trauma kit' },
};
// töökojas valmistamine: vanarauast
const CRAFT = {
  ammo: { id: 'ammo_r', n: 30, s: 6, name: '30 carbine rounds' },
  gren: { id: 'grenade', n: 1, s: 14, name: 'Grenade' },
  cells: { id: 'ammo_c', n: 5, s: 10, k: 1, name: '5 railgun charges', needRail: true },
  shells: { id: 'ammo_s', n: 12, s: 6, name: '12 shotgun shells' },
  pammo: { id: 'ammo_p', n: 40, s: 5, name: '40 pistol rounds' },
  snammo: { id: 'ammo_sn', n: 5, s: 6, name: '5 sniper rounds' },
  a44: { id: 'ammo_44', n: 12, s: 6, name: '12 .44 rounds' },
  plcell: { id: 'ammo_pl', n: 30, s: 8, k: 1, name: '30 plasma cells' },
  glam: { id: 'ammo_gl', n: 2, s: 16, name: '2 grenades (40 mm)' },
  helmet: { id: 'helmet', n: 1, s: 22, name: 'Combat helmet' },
  vest_l: { id: 'vest_l', n: 1, s: 26, name: 'Light carrier vest' },
  vest: { id: 'vest', n: 1, s: 55, k: 2, name: 'Plate vest' },
};
function carryTotal() { return Inv.count('kris') + Inv.count('scrap') + Inv.count('meat'); }

const ROLES = {
  valvur: { name: 'Guard', wage: 30, desc: 'Guards the base and shoots intruders.' },
  jahimees: { name: 'Hunter', wage: 22, desc: 'Hunts desert goats and brings the meat home.' },
  kaevur: { name: 'Miner', wage: 26, desc: 'Collects comet diamonds and scrap from wrecks.' },
  insener: { name: 'Engineer', wage: 34, desc: 'Repairs cannons, produces scrap and adds power.' },
  kokk: { name: 'Cook', wage: 18, desc: 'Cooks meat into food and keeps the crew\'s morale up.' },
  arst: { name: 'Medic', wage: 32, desc: 'Heals the wounded and you too.' },
  teadlane: { name: 'Scientist', wage: 40, desc: 'Speeds up the deep scanner and polishes crystals.' },
};
const TRAITS = {
  tapne: { name: 'Marksman', desc: 'Shoots more accurately and hits harder.' },
  kiire: { name: 'Quick feet', desc: 'Moves a quarter faster.' },
  vintske: { name: 'Wiry', desc: 'Lasts half again as long.' },
  roomus: { name: 'Cheerful', desc: 'Morale doesn\'t drop easily and spreads to others.' },
  ahne: { name: 'Greedy', desc: 'Knows the job, but wants hefty pay.' },
  argpyks: { name: 'Coward', desc: 'Runs and hides from fights.' },
  ookull: { name: 'Night owl', desc: 'Also works at night, sleeps during the day.' },
  tugev: { name: 'Strong back', desc: 'Carries twice as much at once.' },
  vaikne: { name: 'Quiet', desc: 'Says nothing about themselves.' },
  laisk: { name: 'Lazy', desc: 'Works slowly, but is cheap.' },
  veteran: { name: 'Former mercenary', desc: 'Tough in a fight, expensive to pay.' },
};
const STORIES = [
  'Left two kids and a debt at home. Just like you.', 'Once mined on Titan and talks about it far too much.', 'Can\'t remember the last time they saw the sun.',
  'Sent their last wages to their mother. Needs work right now.', 'Former banker. Won\'t say why former.', 'Sings while working. Badly.', 'Lost their ship in a card game.',
  'Believes the Stoneheart really exists.', 'Fled a city where the lights went out.', 'Has a cat. The cat stayed home.', 'Afraid of nothing but silence.',
  'Collects desert flower seeds.', 'Served two contracts with Krell-Varga. Didn\'t want a third.', 'Writes letters home that never get sent.',
  'Says they can smell a goat a kilometre away.', 'Was rich once. Not anymore.', 'Looking for a brother who vanished in the desert.', 'Knows a hundred ways to stop rust.',
  'Sleeps with a gun under the pillow.', 'Dreams of a green lawn.', 'Carries a photo of a sea they\'ve never seen.', 'Owes three banks and one brother.',
];
const SPY_STORIES = ['Answers questions with questions.', 'Came out of nowhere, without a single reference.', 'Asks a lot about where the storage is.'];

const Econ = (() => {
  function hour() { return (6 + G.time.t * 24) % 24; }
  function isNight() { const h = hour(); return h >= 20.6 || h < 5.4; }
  function clockStr() { const h = hour(); const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10; return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }
  function sunElev() { const h = hour(); return Math.sin(((h - 5.5) / 15) * Math.PI) * 36; }

  // ---------- keskkond ----------
  function updateEnv() {
    const e = GFX.env, h = hour();
    const el = sunElev() * DEG;
    const az = ((h - 5.5) / 15) * Math.PI + 0.6;
    const night = smoothstep(2 * DEG, -9 * DEG, el);
    const golden = smoothstep(30 * DEG, 3 * DEG, el) * (1 - night);
    const se = Math.max(el, 4 * DEG);
    let sd = [Math.cos(se) * Math.cos(az), Math.sin(se), Math.cos(se) * Math.sin(az)];
    // öösel valgustab gaasihiid (külm kuma)
    const md = [-0.45, 0.62, -0.64];
    const L = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    const dir = L(sd, md, night); const dl = Math.hypot(dir[0], dir[1], dir[2]);
    e.sunDir = [dir[0] / dl, dir[1] / dl, dir[2] / dl];
    // punane Marsi päikeseloojang: sügav veinpunane laes, hõõguv oranž horisont, tumedad siluetid
    const dayC = { sun: [1.55, 0.94, 0.64], sky: [0.30, 0.17, 0.15], gnd: [0.22, 0.10, 0.07], fog: [0.50, 0.22, 0.14], zen: [0.19, 0.065, 0.06], hor: [0.86, 0.33, 0.17] };
    const goldC = { sun: [1.85, 0.62, 0.26], sky: [0.31, 0.14, 0.12], gnd: [0.21, 0.08, 0.05], fog: [0.50, 0.15, 0.07], zen: [0.11, 0.028, 0.035], hor: [1.02, 0.29, 0.10] };
    const nightC = { sun: [0.15, 0.15, 0.24], sky: [0.07, 0.055, 0.075], gnd: [0.04, 0.025, 0.025], fog: [0.07, 0.035, 0.04], zen: [0.012, 0.008, 0.02], hor: [0.10, 0.04, 0.04] };
    const mix3 = (k) => L(L(dayC[k], goldC[k], golden), nightC[k], night);
    e.sunCol = mix3('sun'); e.skyCol = mix3('sky'); e.gndCol = mix3('gnd'); e.fogCol = mix3('fog'); e.zenith = mix3('zen'); e.horizon = mix3('hor');
    e.night = night;
    const storm = Weather.storm;
    e.fogDen = lerp(lerp(0.0021 + golden * 0.0013, 0.0045, night), 0.016, storm);
    e.fogDen = Math.max(e.fogDen, 2.0 / (1000 * (GFX.S.viewMul || 1)));   // lühem nähtavus = tihedam udu (peidab kaugete asjade kadumise)
    if (storm > 0) { e.fogCol = L(e.fogCol, L([0.62, 0.42, 0.30], [0.12, 0.09, 0.08], night), storm * 0.8); e.sunCol = L(e.sunCol, [e.sunCol[0] * 0.4, e.sunCol[1] * 0.4, e.sunCol[2] * 0.4], storm); }
    e.exposure = lerp(lerp(1.0, 1.08, golden), 1.9, night);
    e.bloom = lerp(0.7, 1.1, night);
    e.planetDir = [0.35, 0.62, -0.70];
    e.time = G.time.total;
  }

  // ---------- päevavahetus ----------
  let lastHour = 6;
  function update(dt) {
    G.time.t += dt / DAY_LEN;
    G.time.total += dt;
    if (G.time.t >= 1) { G.time.t -= 1; G.time.day++; newDay(); }
    const h = hour();
    if (lastHour < 20.6 && h >= 20.6) onDusk();
    lastHour = h;
    if (!G.debt.warned && G.time.day === G.debt.nextDay - 1 && h > 12) {
      G.debt.warned = true;
      UI.msg('Bank: payment due tomorrow morning ' + fmtInt(G.debt.amount) + ' ₵.', 'warn');
    }
  }
  function onDusk() {
    UI.msg('The sun is setting. Stalkers are coming out of the sand.', 'warn');
    Spawner.nightSpawn();
  }
  function debtAmount(idx) { return Math.round((200 + idx * 120 + idx * idx * 22) * G.dk.debt / 10) * 10; }
  function newDay() {
    const d = G.time.day;
    UI.banner('Day ' + d, Econ.dayLine());
    // turuhind
    G.market.price = Math.round(clamp(G.market.price + rand(-7, 7) + (38 - G.market.price) * 0.3, 24, 58));
    // palgad
    if (typeof Crew !== 'undefined') Crew.payWages();
    // võlg
    if (d >= G.debt.nextDay) {
      if (G.res.cr >= G.debt.amount) {
        G.res.cr -= G.debt.amount; G.debt.left = Math.max(0, G.debt.left - G.debt.amount);
        UI.msg('The bank took a debt payment ' + fmtInt(G.debt.amount) + ' ₵. Debt remaining: ' + fmtInt(G.debt.left) + ' ₵.', 'money');
        Audio2.cash();
        G.debt.idx++; G.debt.nextDay = d + 3; G.debt.amount = Math.min(G.debt.left, debtAmount(G.debt.idx)); G.debt.grace = false; G.debt.warned = false;
        if (G.debt.left <= 0) { Game.victory(true); return; }
      } else if (!G.debt.grace) {
        G.debt.grace = true;
        UI.msg('Debt payment missed! The bank gives you until tomorrow morning: ' + fmtInt(G.debt.amount) + ' ₵.', 'danger');
        UI.banner('Payment missed', 'Find ' + fmtInt(G.debt.amount) + ' ₵ by tomorrow morning', 'danger');
        Audio2.alarm();
      } else {
        Game.over('pankrot');
        return;
      }
    }
    // kandidaadid
    genCandidates();
    Herds.replenish();
    if (typeof Rivals !== 'undefined') Rivals.daily();
    Spawner.daily();
    G.flags.dayStartKris = G.res.kris;
    Save.auto(true);
  }
  function dayLine() {
    const dd = G.debt.nextDay - G.time.day;
    return dd <= 0 ? 'Debt payment today!' : 'Next debt payment ' + (dd === 1 ? 'tomorrow' : dd + ' days from now') + ': ' + fmtInt(G.debt.amount) + ' ₵';
  }
  function sleep() {
    // magamine: hüppa hommikusse
    const left = 1 - G.time.t;
    G.time.total += left * DAY_LEN;
    G.time.t = 0.0;
    G.time.day++;
    if (typeof Crew !== 'undefined') Crew.afterSleep();
    Spawner.clearNight();
    newDay();
  }

  // ---------- turg ----------
  function sellKris(n) {
    n = Math.min(n, G.res.kris); if (n <= 0) return 0;
    const v = n * G.market.price;
    G.res.kris -= n; G.res.cr += v; Audio2.cash();
    return v;
  }
  function sellLihv(n) {
    n = Math.min(n, G.res.lihv); if (n <= 0) return 0;
    const v = Math.round(n * G.market.price * 1.6);
    G.res.lihv -= n; G.res.cr += v; Audio2.cash();
    return v;
  }
  function sellMeat(n) {
    n = Math.min(n, G.res.meat); if (n <= 0) return 0;
    const v = n * 4; G.res.meat -= n; G.res.cr += v; Audio2.cash(); return v;
  }
  function buy(kind) {
    const offers = { scrap: { cost: 45, give: () => { G.res.scrap += 20; } }, food: { cost: 40, give: () => { G.res.food += 5; } } };
    for (const [k, o] of Object.entries(SHOP)) offers[k] = { cost: o.cost, give: () => { Inv.stashAdd(o.id, o.n); if (ITEMS[o.id].cat === 'weapon') { const am = Inv.ammoFor(o.id); Inv.stashAdd(am, { ammo_s: 18, ammo_p: 60, ammo_r: 100, ammo_sn: 15 }[am] || 30); } } };
    if (SHOP[kind] && SHOP[kind].once && Inv.hasWeapon(SHOP[kind].id)) return false;
    const o = offers[kind]; if (!o) return false;
    if (G.res.cr < o.cost) return false;
    G.res.cr -= o.cost; o.give(); Audio2.cash(); Save.auto(); return true;
  }
  function payDebtEarly() {
    if (G.res.cr < G.debt.amount) return false;
    G.res.cr -= G.debt.amount; G.debt.left = Math.max(0, G.debt.left - G.debt.amount);
    G.debt.idx++; G.debt.nextDay = Math.max(G.debt.nextDay, G.time.day + 1) + 3; G.debt.amount = Math.min(G.debt.left, debtAmount(G.debt.idx)); G.debt.grace = false; G.debt.warned = false;
    Audio2.cash();
    if (G.debt.left <= 0) setTimeout(() => Game.victory(true), 600); else Save.auto(true);
    return true;
  }

  // ---------- kandidaadid ----------
  function genCandidates() {
    const out = [];
    const used = new Set();
    const roleKeys = Object.keys(ROLES);
    for (let k = 0; k < 3; k++) {
      let role = pick(roleKeys);
      // esimesel päeval vähemalt üks kaevur või jahimees
      if (G.time.day <= 2 && k === 0) role = pick(['kaevur', 'jahimees']);
      const skill = randi(1, 3);
      let trait = pick(Object.keys(TRAITS));
      let spy = false;
      if (trait === 'vaikne') spy = Math.random() < 0.55; else spy = Math.random() < 0.05;
      let wage = ROLES[role].wage * (0.8 + 0.25 * skill);
      if (trait === 'ahne') wage *= 1.35; if (trait === 'laisk') wage *= 0.75; if (trait === 'veteran') wage *= 1.25;
      wage = Math.round(wage);
      let name;
      name = Names.random(null, used); used.add(name);
      const story = spy && Math.random() < 0.6 ? pick(SPY_STORIES) : pick(STORIES);
      out.push({ id: Math.random().toString(36).slice(2, 8), look: Look.clean(Look.forName(name)), name, role, skill, trait, wage, fee: wage * 2, story, spy, spyFor: pick(['krell', 'klann']) });
    }
    G.candidates = out;
  }

  return { hour, isNight, clockStr, sunElev, updateEnv, update, newDay, dayLine, sleep, sellKris, sellLihv, sellMeat, buy, payDebtEarly, genCandidates, debtAmount };
})();

// ---------- ilm: tolmutormid ----------
const Weather = {
  storm: 0, target: 0, timer: 200,
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      if (this.target > 0) { this.target = 0; this.timer = rand(380, 700); }
      else if (G.time.day >= 2) { this.target = 1; this.timer = rand(50, 90); UI.msg('A dust storm is approaching. Visibility is dropping.', 'warn'); }
      else this.timer = 200;
    }
    this.storm += (this.target - this.storm) * Math.min(1, dt * 0.25);
    Audio2.setWind(0.2 + this.storm * 0.8);
    if (this.storm > 0.2 && GFX.partAlpha) {
      for (let i = 0; i < Math.floor(this.storm * 6); i++) {
        const c = GFX.cam.pos;
        GFX.partAlpha.emit(c.x + rand(-25, 25), c.y + rand(-3, 8), c.z + rand(-25, 25), 14 + rand(-2, 2), rand(-0.5, 0.5), 6 + rand(-2, 2), 2.2, 1.5, 3.5, [0.62, 0.45, 0.32, 0.25 * this.storm], [0.62, 0.45, 0.32, 0]);
      }
    }
  },
};
