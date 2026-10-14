// ============================================================
//  INIMESE VÄLIMUSE GENERAATOR: sugu, nahatoon, juuksed, habe,
//  pikkus, kehaehitus, riided. Kasutab realistlikke mudeleid (Chars).
// ============================================================
// ---------- nimed: eesnimi soo järgi + perekonnanimi (eesti ja rahvusvahelised, kosmosekolonistide segu) ----------
const Names = (() => {
  const M = ['Tõnu', 'Kalev', 'Margus', 'Rein', 'Andres', 'Indrek', 'Jaan', 'Peeter', 'Viktor', 'Kaspar', 'Oskar', 'Toomas', 'Rasmus', 'Jaak', 'Gustav',
    'Hugo', 'Arvo', 'Ilmar', 'Priit', 'Sander', 'Ervin', 'Mihkel', 'Tõnis', 'Joosep', 'Ott', 'Siim', 'Marko', 'Raul', 'Urmas', 'Aivar', 'Henrik', 'Karl',
    'Erik', 'Lars', 'Mats', 'Nils', 'Anton', 'Felix', 'Leo', 'Max', 'Victor', 'Dmitri', 'Ivan', 'Yuri', 'Pavel', 'Marek', 'Tomasz', 'Jonas', 'Elias',
    'Diego', 'Mateo', 'Rafael', 'Kenji', 'Hiro', 'Ravi', 'Omar', 'Kofi', 'Malik', 'Connor', 'Jack', 'Wade', 'Hicks', 'Dallas', 'Rico', 'Zane', 'Cole'];
  const F = ['Kersti', 'Maarja', 'Tiina', 'Liina', 'Kristi', 'Triin', 'Helen', 'Ene', 'Aino', 'Mirt', 'Liisi', 'Brita', 'Helmi', 'Ülle', 'Malle', 'Eeva',
    'Signe', 'Kertu', 'Nora', 'Anu', 'Riina', 'Pille', 'Laura', 'Kadi', 'Marta', 'Kaisa', 'Grete', 'Kärt', 'Elo', 'Merit', 'Hanna', 'Liis', 'Sigrid',
    'Ingrid', 'Astrid', 'Freya', 'Elsa', 'Mila', 'Nadia', 'Olga', 'Irina', 'Vera', 'Katja', 'Zofia', 'Lena', 'Sofia', 'Lucia', 'Carmen', 'Yuki', 'Mei',
    'Priya', 'Amara', 'Zara', 'Ripley', 'Rachel', 'Dizzy', 'Jo', 'Sam', 'Tess', 'Kate', 'Ada', 'Iris', 'Nova'];
  const L = ['Kask', 'Lell', 'Saar', 'Ojamets', 'Raud', 'Kuld', 'Hiis', 'Vares', 'Lepp', 'Tamm', 'Pärn', 'Kivi', 'Rebane', 'Kotkas', 'Põld', 'Kaljurand',
    'Vaher', 'Mänd', 'Sepp', 'Valk', 'Koger', 'Leht', 'Aas', 'Mets', 'Kallas', 'Rand', 'Kuusk', 'Ilves', 'Org', 'Tuul', 'Rist', 'Laine', 'Kangur', 'Paju',
    'Ots', 'Kruus', 'Põder', 'Karu', 'Hunt', 'Sarapuu', 'Kõiv', 'Järv', 'Lind', 'Nurk', 'Oja', 'Vask', 'Tina', 'Sild', 'Torn',
    'Novak', 'Kowalski', 'Ivanov', 'Petrov', 'Sokolov', 'Lindqvist', 'Berg', 'Holm', 'Strand', 'Virtanen', 'Koskinen', 'Nieminen', 'Moreau', 'Laurent',
    'Costa', 'Silva', 'Reyes', 'Ortega', 'Tanaka', 'Sato', 'Nakamura', 'Chen', 'Wong', 'Patel', 'Okafor', 'Mensah', 'Hale', 'Cross', 'Stone', 'Ward',
    'Hudson', 'Gorman', 'Bishop', 'Drake', 'Frost', 'Kane', 'Rook', 'Vance', 'Mercer', 'Holt', 'Quinn', 'Reed'];
  const MS = new Set(M), FS = new Set(F);
  const pk = (a) => a[Math.floor(Math.random() * a.length)];
  function first(sex) { return pk(sex === 'female' ? F : M); }
  function random(sex, used) {
    sex = sex || (Math.random() < 0.5 ? 'male' : 'female');
    for (let i = 0; i < 40; i++) { const n = first(sex) + ' ' + pk(L); if (!used || !used.has(n)) return n; }
    return first(sex) + ' ' + pk(L) + ' ' + (2 + Math.floor(Math.random() * 8));
  }
  // sugu nime järgi (eesnimi); tundmatu -> null
  function sexOf(name) { const f = String(name || '').trim().split(/\s+/)[0]; return FS.has(f) ? 'female' : MS.has(f) ? 'male' : null; }
  return { M, F, L, first, random, sexOf };
})();

const Look = (() => {
  // nahatoonid heledast tumedani (sRGB, ligikaudu päris nahatoonide järgi)
  const SKIN = [[0.97, 0.83, 0.73], [0.93, 0.75, 0.63], [0.87, 0.67, 0.53], [0.80, 0.60, 0.46], [0.70, 0.50, 0.36], [0.58, 0.40, 0.28], [0.45, 0.30, 0.21], [0.34, 0.22, 0.15]];
  const HAIR = [[0.05, 0.045, 0.04], [0.13, 0.085, 0.055], [0.26, 0.17, 0.10], [0.42, 0.30, 0.18], [0.70, 0.56, 0.34], [0.52, 0.22, 0.10], [0.50, 0.49, 0.47], [0.80, 0.78, 0.75]];
  const HAIR_NAMES = ['Black', 'Dark brown', 'Brown', 'Light brown', 'Blond', 'Red', 'Grey', 'White'];
  // Doom 3 / UAC tööülikonnad: summutatud oliiv, khaki, hall, tumesinine, roostes oranž
  const TOPS = [[0.30, 0.32, 0.24], [0.38, 0.35, 0.28], [0.22, 0.24, 0.27], [0.17, 0.19, 0.24], [0.42, 0.34, 0.24], [0.27, 0.27, 0.28], [0.20, 0.22, 0.17], [0.13, 0.13, 0.14], [0.29, 0.23, 0.18]];
  const BOTTOMS = [[0.18, 0.18, 0.19], [0.30, 0.32, 0.24], [0.17, 0.19, 0.24], [0.30, 0.24, 0.18], [0.36, 0.33, 0.27], [0.24, 0.24, 0.25]];
  const SHOES = [[0.075, 0.07, 0.065], [0.12, 0.10, 0.085], [0.15, 0.15, 0.14]];
  const STYLES_M = ['bald', 'buzz', 'short', 'sidepart', 'slick', 'mohawk', 'curly', 'medium', 'long', 'manbun'];
  const STYLES_F = ['pixie', 'bob', 'bun', 'ponytail', 'braid', 'long', 'wavy', 'curly', 'undercut'];
  const BEARDS = ['none', 'stubble', 'moustache', 'goatee', 'vandyke', 'chinstrap', 'mutton', 'short', 'full', 'long'];
  const BEARD_NAMES = { none: 'Clean-shaven', stubble: 'Stubble', moustache: 'Moustache', goatee: 'Goatee', vandyke: 'Van Dyke', chinstrap: 'Chinstrap',
    mutton: 'Mutton chops', short: 'Short beard', full: 'Full beard', long: 'Long beard' };
  const STYLE_NAMES = { bald: 'Bald', buzz: 'Buzz cut', short: 'Crew cut', sidepart: 'Side part', slick: 'Slicked back', mohawk: 'Mohawk', curly: 'Curly',
    medium: 'Medium', long: 'Long', manbun: 'Man bun', pixie: 'Pixie', bob: 'Bob', bun: 'Bun', ponytail: 'Ponytail', braid: 'Braid', wavy: 'Wavy', undercut: 'Undercut' };
  const jit = (c, a) => c.map((v) => clamp(v * (1 + (Math.random() - 0.5) * a), 0, 1));

  function random(sex) {
    sex = sex || (Math.random() < 0.5 ? 'male' : 'female');
    const age = Math.random();
    let hair = HAIR[Math.floor(Math.random() * 6)];
    if (age > 0.82) hair = HAIR[6 + (Math.random() < 0.4 ? 1 : 0)];
    const L = {
      sex, type: sex,
      skin: jit(SKIN[Math.floor(Math.random() * SKIN.length)], 0.06),
      hair: jit(hair, 0.1),
      hairStyle: sex === 'male' ? pick(age > 0.75 ? ['bald', 'bald', 'buzz', 'short', 'sidepart', 'slick'] : ['buzz', 'short', 'short', 'sidepart', 'sidepart', 'slick', 'mohawk', 'curly', 'medium', 'medium', 'long', 'manbun'])
        : pick(['pixie', 'bob', 'bob', 'bun', 'ponytail', 'ponytail', 'braid', 'long', 'long', 'wavy', 'curly', 'undercut']),
      beardStyle: sex === 'male' ? pick(['none', 'none', 'none', 'stubble', 'stubble', 'stubble', 'moustache', 'goatee', 'vandyke', 'chinstrap', 'mutton', 'short', 'short', 'full', 'full', 'long']) : 'none',
      top: jit(pick(TOPS), 0.12), bottom: jit(pick(BOTTOMS), 0.1), shoes: pick(SHOES),
      height: sex === 'male' ? rand(1.68, 1.94) : rand(1.56, 1.80), gear: pick([1, 2, 2, 3]), gearCol: randi(0, 4),
      build: rand(0.9, 1.14),
    };
    return L;
  }
  function forName(name) { return random(Names.sexOf(name) || (Math.random() < 0.5 ? 'male' : 'female')); }
  function rival(team) {
    const armor = team === 'krell' ? [0.55, 0.16, 0.12] : team === 'klann' ? [0.34, 0.24, 0.50] : [0.5, 0.5, 0.5];
    return { sex: 'male', type: 'soldier', armor: jit(armor, 0.12), accent: team === 'krell' ? [0.85, 0.55, 0.15] : [0.85, 0.85, 0.80], height: rand(1.78, 1.95), build: rand(0.98, 1.1) };
  }
  function player() {
    return { sex: 'male', type: 'male', skin: SKIN[2], hair: HAIR[2], hairStyle: 'short', beardStyle: 'stubble', gear: 3, gearCol: 1, top: [0.30, 0.32, 0.24], bottom: [0.22, 0.23, 0.20], shoes: SHOES[0], height: 1.80, build: 1.0 };
  }
  const cache = new WeakMap();
  function tints(L) {
    if (!L) return null;
    let c = cache.get(L);
    if (!c || c.v !== L.__v) { c = { t: Chars.makeTints(L.type, L, c && c.t), v: L.__v }; cache.set(L, c); }
    return c.t;
  }
  // varustuse toon (soomusplaadid): Doom 3 oliiv/hall/must
  const GEAR = [[1.0, 1.0, 1.0, 0], [0.86, 0.95, 0.72, 0], [0.62, 0.64, 0.68, 0], [1.05, 0.92, 0.72, 0], [0.5, 0.5, 0.52, 0]];
  function gearTint(L) { return GEAR[(L && L.gearCol) || 0] || GEAR[0]; }
  // nähtava varustuse tase: vest/soomus määrab plaadid (2) ja õlakud (3); ilma vestita ainult vöö (1)
  function gearLvl(L) {
    if (!L) return 2;
    if (L.eq) { const v = L.eq.vest && ITEMS[L.eq.vest]; return v ? v.gear || 2 : 1; }
    return L.gear === undefined ? (L.type === 'soldier' ? 0 : 2) : L.gear;
  }
  // vanad salvestused: varustus tuletatakse looja valikust
  // varustuse astmed: 1 kerge (särk, püksid, vöö), 2 keskmine (kuulivest, kerge kiiver, põlve- ja säärekaitsmed), 3 raske (täismetallist turvis + visiirkiiver)
  function kit(g) {
    if (g >= 3) return { helmet: 'helmet2', vest: 'vest_h', gloves: 'gloves', boots: 'boots', pack: null };
    if (g >= 2) return { helmet: 'helmet', vest: 'vest', gloves: null, boots: 'boots', pack: null };
    return { helmet: null, vest: null, gloves: null, boots: null, pack: null };
  }
  function ensureEq(L) {
    if (!L || L.type === 'soldier') return null;
    if (!L.eq) { L.eq = kit(L.gear === undefined ? 2 : L.gear); touch(L); }
    return L.eq;
  }
  function touch(L) { L.__v = (L.__v || 0) + 1; }
  // mudeli skaala: pikkus normaliseeritud mudeli pikkusele
  function scale(L) {
    const T = Chars.types[L.type];
    const base = T ? T.height : 1.8;
    const s = (L.height || base) / base;
    return [s * (L.build || 1), s, s * (0.5 + (L.build || 1) * 0.5)];
  }
  // salvestamiseks (ilma vahemäluta)
  function clean(L) { if (!L) return null; const o = {}; for (const k of Object.keys(L)) if (k[0] !== '_') o[k] = L[k]; return o; }
  return { BEARDS, BEARD_NAMES, GEAR, gearTint, gearLvl, ensureEq, kit, SKIN, HAIR, HAIR_NAMES, TOPS, BOTTOMS, SHOES, STYLES_M, STYLES_F, STYLE_NAMES, random, forName, rival, player, tints, touch, scale, clean };
})();
