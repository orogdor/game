// ============================================================
//  BAAS: Sims-stiilis ruumid, seinad, uksed, aknad, esemed, energia, teekonnad
// ============================================================
const OBJ = {
  tostuk: { name: 'Car lift + garage door', cat: 'garaaz', cost: { s: 120, c: 200 }, size: [2, 3], where: 'in', power: 1, h: 0.2, needsTall: true, garage: true, desc: 'For a two-storey (tall) room. Place it with its front against an outer wall – that wall becomes a roll-up garage door. Buy and repair vehicles here.' },
  sisetrepp: { name: 'Indoor stairs', cat: 'garaaz', cost: { s: 30, c: 0 }, size: [1, 2], where: 'in', power: 0, h: 0.1, inner: true, needsUpper: true, desc: 'Stairs to the upper floor. Build the upper floor first (Build → 2nd floor). The high end needs a free tile behind it.' },
  voodi: { name: 'Bed', cat: 'elu', cost: { s: 25, c: 0 }, size: [1, 1], where: 'in', power: 0, h: 0.9, beds: 1, desc: 'One bed. Every hired person needs their own bed.' },
  nari: { name: 'Bunk bed', cat: 'elu', cost: { s: 40, c: 40 }, size: [1, 1], where: 'in', power: 0, h: 2.0, beds: 2, desc: 'Two beds on a single tile.' },
  laud: { name: 'Dining table', cat: 'elu', cost: { s: 15, c: 0 }, size: [1, 1], where: 'in', power: 0, h: 0.8, seats: 4, desc: 'Eating at a table lifts morale.' },
  pliit: { name: 'Stove', cat: 'olme', cost: { s: 30, c: 60 }, size: [1, 1], where: 'in', power: 1, h: 1.0, desc: 'Turns raw meat into food: a cook gets two meals from one piece of meat.' },
  diivan: { name: 'Sofa', cat: 'elu', cost: { s: 20, c: 20 }, size: [1, 1], where: 'in', power: 0, h: 0.9, desc: 'A place to rest in free time. Lifts morale.' },
  jukebox: { name: 'Jukebox', cat: 'elu', cost: { s: 20, c: 120 }, size: [1, 1], where: 'in', power: 1, h: 1.5, desc: 'Old music lifts everyone\'s morale.' },
  taim: { name: 'Potted desert flower', cat: 'elu', cost: { s: 5, c: 15 }, size: [1, 1], where: 'any', power: 0, h: 1.3, desc: 'A bit of life among the rust. Small morale bonus.' },
  toolaud: { name: 'Workbench', cat: 'too', cost: { s: 30, c: 0 }, size: [1, 1], where: 'in', power: 1, h: 1.0, desc: 'Unlocks weapon upgrades. An engineer produces scrap here.' },
  lihvija: { name: 'Diamond polisher', cat: 'too', cost: { s: 60, c: 150 }, size: [2, 1], where: 'in', power: 2, h: 1.9, desc: 'A polished diamond sells for 1.6 times more.' },
  ravila: { name: 'Medical bay', cat: 'too', cost: { s: 40, c: 100 }, size: [1, 1], where: 'in', power: 1, h: 2.0, desc: 'Heals the wounded. You wake up here after an accident.' },
  skanner: { name: 'Deep scanner', cat: 'too', cost: { s: 120, c: 300, k: 15 }, size: [2, 2], where: 'in', power: 4, h: 3.9, desc: 'Searches for the location of the Stoneheart\'s nest. A scientist speeds up the search.' },
  generaator: { name: 'Generator', cat: 'energia', cost: { s: 70, c: 120 }, size: [2, 1], where: 'in', power: -6, h: 2.1, desc: 'Gives 6 units of power.' },
  paike: { name: 'Solar panel', cat: 'energia', cost: { s: 35, c: 60 }, size: [1, 1], where: 'out', power: -2, solar: true, h: 1.8, desc: 'Gives 2 units of power during the day.' },
  radar: { name: 'Radar mast', cat: 'kaitse', cost: { s: 50, c: 80 }, size: [1, 1], where: 'out', power: 1, h: 4.5, desc: 'Shows the exact comet impact site and attackers on the map.' },
  kahur: { name: 'Autocannon', cat: 'kaitse', cost: { s: 60, c: 150 }, size: [1, 1], where: 'out', power: 1, h: 1.6, hp: 220, desc: 'Shoots enemies within 34 m.' },
  barrikaad: { name: 'Barricade', cat: 'vall', cost: { s: 10, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 1.1, desc: 'Cover from bullets.' },
  prozektor: { name: 'Floodlight', cat: 'kaitse', cost: { s: 15, c: 30 }, size: [1, 1], where: 'out', power: 1, h: 4.2, desc: 'Lights up the surroundings at night. Stalkers avoid light.' },
  vesi: { name: 'Water dispenser', cat: 'olme', cost: { s: 15, c: 40 }, size: [1, 1], where: 'in', power: 1, h: 1.6, desc: 'Purified water. The crew comes here to quench their thirst.' },
  dush: { name: 'Shower', cat: 'olme', cost: { s: 30, c: 60 }, size: [1, 1], where: 'in', power: 1, h: 2.3, desc: 'Washing keeps morale up. Without it people stink and quarrel.' },
  wc: { name: 'Dry toilet', cat: 'olme', cost: { s: 20, c: 20 }, size: [1, 1], where: 'in', power: 0, h: 2.2, desc: 'Without a toilet people go in the desert. Needed for good morale.' },
  teler: { name: 'Old TV', cat: 'elu', cost: { s: 15, c: 70 }, size: [1, 1], where: 'in', power: 1, h: 1.6, desc: 'Home world TV channels crackle through the static. Evening entertainment.' },
  trenn: { name: 'Training bench', cat: 'elu', cost: { s: 25, c: 30 }, size: [1, 1], where: 'in', power: 0, h: 1.4, desc: 'Training in free time. Guards and hunters love it.' },
  kasvu: { name: 'Hydroponics', cat: 'olme', cost: { s: 50, c: 140 }, size: [2, 1], where: 'in', power: 2, h: 1.9, desc: 'Grows algae and beans: one meal every 2 hours.' },
  relvakapp: { name: 'Gun locker', cat: 'too', cost: { s: 40, c: 60 }, size: [1, 1], where: 'in', power: 0, h: 2.0, desc: 'Access to the stored weapons. The crew shoots 15% more accurately.' },
  myyr: { name: 'Concrete wall', cat: 'vall', cost: { s: 12, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 2.7, hp: 600, desc: 'Thick concrete block with a firing slit. Bugs have to chew through it. Can be placed side by side in a line.' },
  myyrturel: { name: 'Wall turret', cat: 'kaitse', cost: { s: 45, c: 180 }, size: [1, 1], where: 'out', power: 1, h: 3.4, hp: 750, desc: 'Concrete wall with an autocannon on top. Fires over the wall up to 46 m. Fits into a wall line.' },
  vallikaik: { name: 'Rampart walk', cat: 'vall', cost: { s: 10, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 2.0, deck: 2.0, sy: 2.0 / 1.5, hp: 400, desc: 'Platform behind the wall. You shoot over the wall from there. Reach it by stairs.' },
  trepp: { name: 'Stairs', cat: 'vall', cost: { s: 8, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 0.1, ramp: 2.0, sy: 2.0 / 1.5, hp: 300, desc: 'Leads up to the rampart walk. Rotate so the high end faces the rampart.' },
  torn: { name: 'Watchtower', cat: 'kaitse', cost: { s: 60, c: 150 }, size: [2, 2], where: 'out', power: 1, h: 6.0, deck: 6.1, hp: 700, desc: 'A guard in the tower sees far and shoots more accurately. Floodlight at night. You can climb up.' },
  varav: { name: 'Gate', cat: 'vall', cost: { s: 40, c: 0 }, size: [2, 1], where: 'out', power: 1, h: 2.7, hp: 800, gate: true, desc: 'Opens for your own people. Locked during a bug swarm.' },
  varav3: { name: 'Wide gate', cat: 'vall', cost: { s: 60, c: 30 }, size: [3, 1], where: 'out', power: 1, h: 2.7, hp: 1100, gate: true, sx: 1.5, mesh: 'varav', desc: 'A 6 m gate – room for a vehicle and a group of people.' },
  suurvarav: { name: 'Big gate', cat: 'vall', cost: { s: 85, c: 60 }, size: [4, 1], where: 'out', power: 2, h: 2.7, hp: 1500, gate: true, sx: 2, mesh: 'varav', desc: 'An 8 m wall gate for trucks. Opens for your own people and vehicles.' },
  kmpesa: { name: 'MG nest', cat: 'kaitse', cost: { s: 30, c: 80 }, size: [2, 1], where: 'out', power: 0, h: 1.0, hp: 350, desc: 'Sandbagged nest. A crew member mans it during a swarm. Uses carbine ammo from storage.' },
  siil: { name: 'Tank trap', cat: 'vall', cost: { s: 5, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 1.2, hp: 500, desc: 'Steel hedgehog. Big bugs can\'t get through.' },
  okas: { name: 'Barbed wire', cat: 'vall', cost: { s: 6, c: 0 }, size: [1, 1], where: 'out', power: 0, h: 0.9, hp: 120, desc: 'Slows and hurts bugs that climb through it.' },
  maagitehas: { name: 'Ore works', cat: 'too', cost: { s: 60, c: 150 }, size: [2, 1], where: 'any', power: 2, h: 2.4, desc: 'Crusher and smelter. Sells the ore drill (needed to mine iron ore rocks in the desert) and smelts iron ore into steel scrap.' },
  kaardilaud: { name: 'Map table', cat: 'too', cost: { s: 20, c: 60 }, size: [1, 1], where: 'in', power: 1, h: 1.1, desc: 'The heart of the command post. With a radar it shows the swarm\'s direction and size an hour ahead.' },
  // kasutatavad toaesemed (meeskond ja mängija kasutavad, vt 14d_gadgets.js)
  kapp: { name: 'Personal lockers', cat: 'elu', cost: { s: 25, c: 20 }, size: [1, 1], where: 'in', power: 0, h: 1.9, useLabel: 'Check your gear', desc: 'Everyone checks their gear morning and evening: +5 morale and a little health. Barracks item.' },
  kohvimasin: { name: 'Coffee machine', cat: 'olme', cost: { s: 15, c: 60 }, size: [1, 1], where: 'in', power: 1, h: 1.5, useLabel: 'Make coffee', desc: 'Tired people drink coffee: +30 energy so they keep working. Canteen item.' },
  pesumasin: { name: 'Washing machine', cat: 'olme', cost: { s: 25, c: 70 }, size: [1, 1], where: 'in', power: 1, h: 0.9, useLabel: 'Do laundry', desc: 'Clean clothes: hygiene drops half as fast for a day. Washroom item.' },
  ravikapp: { name: 'Medicine cabinet', cat: 'too', cost: { s: 30, c: 90 }, size: [1, 1], where: 'in', power: 1, h: 1.9, useLabel: 'Pack a medkit', desc: 'Packs medkits into storage (15 ₵ each, up to 2 a day, 6 in stock) and patches up whoever uses it. Infirmary item.' },
  moonapress: { name: 'Ammo press', cat: 'too', cost: { s: 40, c: 90 }, size: [1, 1], where: 'in', power: 1, h: 1.7, useLabel: 'Press rifle ammo', desc: 'Turns 2 scrap into 20 rifle rounds for storage, up to 4 times a day. Armoury item.' },
  treipink: { name: 'Lathe', cat: 'too', cost: { s: 50, c: 110 }, size: [2, 1], where: 'in', power: 1, h: 1.2, useLabel: 'Turn parts', desc: 'Salvages parts: +3 scrap per job, 3 jobs a day. Workshop item.' },
  uurimislaud: { name: 'Research bench', cat: 'too', cost: { s: 40, c: 140 }, size: [1, 1], where: 'in', power: 1, h: 1.3, useLabel: 'Analyse samples', desc: 'Sample analysis: +3 % to the nest search (twice a day); after the nest is found, research data sells for 40 ₵. Lab item.' },
  raadiojaam: { name: 'Radio station', cat: 'kaitse', cost: { s: 30, c: 110 }, size: [1, 1], where: 'in', power: 1, h: 2.5, useLabel: 'Listen to the radio', desc: 'Radio sweeps (3 a day) pinpoint comet impact sites and warn about rival raids. Command post item.' },
  piljard: { name: 'Pool table', cat: 'elu', cost: { s: 30, c: 120 }, size: [2, 1], where: 'in', power: 0, h: 0.85, useLabel: 'Play pool', desc: 'An evening game: +8 morale and better relations with people nearby. Rec room item.' },
  toovanker: { name: 'Tool cart', cat: 'garaaz', cost: { s: 25, c: 60 }, size: [1, 1], where: 'in', power: 0, h: 1.1, useLabel: 'Fix the vehicle', desc: 'Crew fix damaged vehicles parked next to it for free (+150 hp a job). Garage item.' },
  terminal: { name: 'Comms terminal', fixed: true, size: [1, 1], where: 'in', power: 0, h: 1.6 },
  hoidla: { name: 'Storage', fixed: true, size: [1, 1], where: 'in', power: 0, h: 1.4 },
  vanagen: { name: 'Old generator', fixed: true, size: [2, 1], where: 'in', power: -4, h: 2.1 },
};
// tubade ülesanded: kui toas on AINULT lubatud esemed ja nõutud asjad olemas, annab tuba boonuse
const ROOM_PURPOSES = {
  barracks: { name: 'Barracks', allow: ['voodi', 'nari', 'taim', 'diivan', 'kapp'], need: (m) => (m.voodi || 0) + (m.nari || 0) * 2 >= 2, needTxt: 'at least 2 beds', bonus: 'Sleep recovers 30% faster.' },
  canteen: { name: 'Canteen', allow: ['laud', 'pliit', 'vesi', 'taim', 'jukebox', 'teler', 'kasvu', 'kohvimasin'], need: (m) => m.laud && (m.pliit || m.vesi), needTxt: 'a table + a stove or water dispenser', bonus: 'Eating lifts morale twice as much.' },
  washroom: { name: 'Washroom', allow: ['dush', 'wc', 'vesi', 'taim', 'pesumasin'], need: (m) => m.dush && m.wc, needTxt: 'a shower + a toilet', bonus: 'Showers take half the time and lift morale twice as much.' },
  infirmary: { name: 'Infirmary', allow: ['ravila', 'voodi', 'vesi', 'taim', 'ravikapp'], need: (m) => m.ravila, needTxt: 'a medical bay', bonus: 'Wounds heal 60% faster indoors.' },
  armoury: { name: 'Armoury', allow: ['relvakapp', 'toolaud', 'taim', 'moonapress'], need: (m) => m.relvakapp && m.toolaud, needTxt: 'a gun locker + a workbench', bonus: 'The crew shoots 10% more accurately.' },
  workshop: { name: 'Workshop', allow: ['toolaud', 'lihvija', 'maagitehas', 'taim', 'treipink'], need: (m) => m.lihvija || m.maagitehas, needTxt: 'a diamond polisher or the ore works', bonus: 'Polishing and smelting give 20% more.' },
  lab: { name: 'Science lab', allow: ['skanner', 'kaardilaud', 'taim', 'uurimislaud'], need: (m) => m.skanner, needTxt: 'the deep scanner', bonus: 'The deep scanner searches 35% faster.' },
  command: { name: 'Command post', allow: ['kaardilaud', 'relvakapp', 'taim', 'raadiojaam'], need: (m) => m.kaardilaud, needTxt: 'a map table', bonus: 'Swarm warnings with direction and size – even without a radar.' },
  rec: { name: 'Rec room', allow: ['diivan', 'teler', 'jukebox', 'trenn', 'taim', 'laud', 'piljard'], need: (m) => ((m.diivan ? 1 : 0) + (m.teler ? 1 : 0) + (m.jukebox ? 1 : 0) + (m.trenn ? 1 : 0)) >= 2, needTxt: '2 of: sofa, TV, jukebox, training bench', bonus: 'Everyone in the room slowly gains morale.' },
  garage: { name: 'Garage', allow: ['tostuk', 'toolaud', 'relvakapp', 'taim', 'toovanker'], need: (m) => m.tostuk, needTxt: 'a car lift', bonus: 'Vehicle repairs cost half.' },
};
// baasi müra ja valgus: [müra, valgus] töötavana. Iga ese lisab ka 1 punkti lihtsalt olemasoluga.
const SIG = {
  generaator: [10, 1], vanagen: [12, 1], lihvija: [6, 1], jukebox: [5, 1], teler: [2, 1], pliit: [2, 1], kasvu: [2, 3], toolaud: [2, 0],
  skanner: [5, 3], radar: [3, 1], kahur: [3, 1], myyrturel: [3, 1], varav: [2, 1], varav3: [2, 1], suurvarav: [3, 1], vesi: [1, 0], dush: [1, 0], trenn: [1, 0],
  ravila: [1, 1], kaardilaud: [1, 1], prozektor: [1, 9], torn: [1, 6], paike: [0, 0], maagitehas: [7, 2],
};
const THREAT_TIERS = [[0, 'Quiet', '#97d276'], [35, 'Noticeable', '#e8d06a'], [70, 'Resonant', '#ffa04a'], [120, 'Lighthouse', '#ff5b47']];
const OBJ_CATS = [['elu', 'Living'], ['olme', 'Kitchen & bath'], ['too', 'Work'], ['garaaz', 'Garage & stairs'], ['energia', 'Power'], ['kaitse', 'Defence'], ['vall', 'Walls & gates']];
const POWER_PRIO = { kasvu: 6, vesi: 6, dush: 3, teler: 1, kahur: 9, myyrturel: 9, radar: 8, skanner: 7, ravila: 6, pliit: 5, lihvija: 4, toolaud: 4, maagitehas: 4, prozektor: 3, jukebox: 2 };
const ROOM_STYLES = [
  { name: 'Rusty', wall: [0.40, 0.30, 0.25], wall2: [0.26, 0.19, 0.16], floor: [0.27, 0.23, 0.21], floor2: [0.23, 0.20, 0.18], ceil: [0.28, 0.25, 0.23] },
  { name: 'Steel panel', wall: [0.46, 0.47, 0.46], wall2: [0.28, 0.29, 0.30], floor: [0.31, 0.31, 0.31], floor2: [0.27, 0.27, 0.27], ceil: [0.40, 0.40, 0.39] },
  { name: 'Ochre', wall: [0.58, 0.43, 0.28], wall2: [0.36, 0.24, 0.17], floor: [0.40, 0.27, 0.21], floor2: [0.35, 0.24, 0.19], ceil: [0.50, 0.42, 0.33] },
  { name: 'Amber blue', wall: [0.27, 0.40, 0.42], wall2: [0.15, 0.22, 0.24], floor: [0.22, 0.25, 0.27], floor2: [0.19, 0.22, 0.24], ceil: [0.33, 0.40, 0.40] },
  { name: 'Hospital white', wall: [0.62, 0.62, 0.58], wall2: [0.40, 0.43, 0.41], floor: [0.48, 0.49, 0.47], floor2: [0.43, 0.44, 0.42], ceil: [0.60, 0.60, 0.58] },
  { name: 'Army green', wall: [0.35, 0.37, 0.26], wall2: [0.20, 0.22, 0.15], floor: [0.26, 0.26, 0.22], floor2: [0.22, 0.22, 0.19], ceil: [0.33, 0.35, 0.28] },
  { name: 'Plum dusk', wall: [0.38, 0.28, 0.37], wall2: [0.21, 0.15, 0.21], floor: [0.26, 0.21, 0.24], floor2: [0.22, 0.18, 0.21], ceil: [0.37, 0.31, 0.36] },
  { name: 'Sooty concrete', wall: [0.34, 0.33, 0.31], wall2: [0.20, 0.19, 0.18], floor: [0.24, 0.23, 0.22], floor2: [0.21, 0.20, 0.19], ceil: [0.26, 0.25, 0.24] },
  { name: 'Doom UAC', wall: [0.30, 0.31, 0.29], wall2: [0.15, 0.15, 0.16], floor: [0.20, 0.20, 0.20], floor2: [0.16, 0.16, 0.17], ceil: [0.24, 0.24, 0.24] },
];

// ------------------------------------------------------------
//  Baasi tehas: sama süsteem mängija ja vastaste baasidele.
//  Seinad tõmmatakse ruudustiku servadele; tuba tekib, kui seinad
//  sulgevad ala täielikult (Sims-stiilis).
// ------------------------------------------------------------
function createBase(opt) {
  opt = opt || {};
  const N = 40, CS = 2, WH = 3.0, WT = 0.2, FLOOR_Y = 0.1, LOW_H = 0.85;
  const OX = opt.ox || 0, OZ = opt.oz || 0, OY = opt.oy || 0;
  const X0 = OX - 40, Z0 = OZ - 40;
  const IS_PLAYER = !!opt.player;
  const ACCENT = opt.accent || [1.0, 0.55, 0.16];
  const DEF_STYLE = opt.style !== undefined ? opt.style : 1;
  const cellRoom = new Int16Array(N * N);
  const cellObj = new Int16Array(N * N);
  const cellObjUp = new Int16Array(N * N);   // teise korruse esemed
  // TEINE KORRUS ehitatakse nagu esimene: oma seinad -> oma toad. Toad võivad esimesest korrusest kuni 3 ruutu üle ulatuda.
  const upWalls = new Set();                  // teise korruse seinad 'v:i:j'
  const wide = new Set(), upWide = new Set();   // laiad uksed/aknad (alumine / ülemine korrus)
  const upOpen = new Map();                   // teise korruse avad: 'door' | 'window'
  const voids = new Set();                    // kustutatud vahelagi (teise korruse toas, esimese korruse toa kohal) -> kõrge ruum
  const upper = new Set();                    // arvutatud: teise korruse tubade rakud 'i:j'
  const upRoomCell = new Int16Array(N * N);   // arvutatud: teise korruse toa id raku kohta
  const upRooms = new Map();                  // id -> { id, cells, style }
  const lowDist = new Uint8Array(N * N);      // kaugus esimese korruse toast (ruutudes, 8 suunda)
  const OVERHANG = 3;
  const cellStyle = new Uint8Array(N * N).fill(255);
  const cellRust = new Uint8Array(N * N);
  const walls = new Set();
  const rooms = new Map();
  const objs = new Map();
  const openings = new Map(); // 'v:i:j' -> 'door'|'window'
  let nextRoomId = 1, nextObjId = 1;
  let meshes = { main: [null, null], low: [null, null], roof: [null, null], up: [null, null], upLow: [null, null], glass: null, strips: null };
  let viewLevel = 0;   // ehitusrežiimis vaadatav korrus
  const colliders = [];
  const roomJob = new Map();   // toa id -> ROOM_PURPOSES võti
  const doors = [];
  const gdoors = [];   // garaažiuksed (rullukse)
  let gPanel = null;
  const frames = []; // ukse- ja aknaraamid (SDF mudelid)
  // instantsitud SDF-moodulid (põrandad, katus, katuseserv, nurgapostid); joonistatakse ainult selle baasi draw() kaudu
  let inst = [];
  const _im = M4.create();
  function makeInst(list, mesh, rust, roofOnly, upperLv) {
    if (!list.length || !mesh) return;
    const st = new GFX.InstSet(mesh, list.length); st.manual = true; st.rust = rust; st.roofOnly = roofOnly; st.upper = !!upperLv; st.viewDist = 650;
    for (const [x, y, z, yaw, c] of list) { M4.compose(_im, x, y, z, yaw); st.add(_im, c[0], c[1], c[2], 0); }
    GFX.addInstSet(st); inst.push(st);
  }
  const sconces = [];
  const power = { supply: 0, demand: 0, ok: true, lightsOn: !IS_PLAYER };
  let dirty = true;
  const baseM = M4.compose(M4.create(), 0, OY, 0, 0);

  const inGrid = (i, j) => i >= 0 && j >= 0 && i < N && j < N;
  const inArea = (i, j) => i >= 2 && j >= 2 && i <= N - 3 && j <= N - 3;
  const roomAt = (i, j) => (inGrid(i, j) ? cellRoom[j * N + i] : 0);
  const objAt = (i, j) => (inGrid(i, j) ? cellObj[j * N + i] : 0);
  const objUpAt = (i, j) => (inGrid(i, j) ? cellObjUp[j * N + i] : 0);
  const upRoomAt = (i, j) => (inGrid(i, j) ? upRoomCell[j * N + i] : 0);
  const hiAt = (i, j) => upRoomAt(i, j) > 0;                                   // teise korruse tuba (seinad/katus 2 korruse kõrgusel)
  const upAt = (i, j) => hiAt(i, j) && !voids.has(i + ':' + j);              // teise korruse põrand olemas
  const tallAt = (i, j) => roomAt(i, j) > 0 && hiAt(i, j) && voids.has(i + ':' + j);   // vahelagi kustutatud -> kõrge ruum
  const lowDistAt = (i, j) => (inGrid(i, j) ? lowDist[j * N + i] : 99);
  function upWallAt(t, i, j) { return upWalls.has(t + ':' + i + ':' + j); }
  function upOpening(t, i, j) { const k = t + ':' + i + ':' + j; return upWalls.has(k) ? (upOpen.get(k) || null) : null; }
  // teise korruse toad (nagu computeRooms, aga upWalls põhjal); tuba kehtib, kui kõik rakud on esimesest korrusest <= 3 ruudu kaugusel
  function computeUpRooms() {
    // kaugus esimese korruse tubadest
    lowDist.fill(99); const q = [];
    for (let k = 0; k < N * N; k++) if (cellRoom[k] > 0) { lowDist[k] = 0; q.push(k); }
    for (let h = 0; h < q.length; h++) {
      const k = q[h], i = k % N, j = (k / N) | 0, d = lowDist[k];
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ni = i + di, nj = j + dj; if (!inGrid(ni, nj)) continue; const nk = nj * N + ni; if (lowDist[nk] > d + 1) { lowDist[nk] = d + 1; q.push(nk); } }
    }
    const outside = new Uint8Array(N * N), st = [];
    for (let i = 0; i < N; i++) for (const j of [0, N - 1]) { const k = j * N + i; if (!outside[k]) { outside[k] = 1; st.push(k); } }
    for (let j = 0; j < N; j++) for (const i of [0, N - 1]) { const k = j * N + i; if (!outside[k]) { outside[k] = 1; st.push(k); } }
    while (st.length) {
      const k = st.pop(), i = k % N, j = (k / N) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj; if (!inGrid(ni, nj)) continue;
        const nk = nj * N + ni; if (outside[nk]) continue;
        const [t, a, b] = edgeOf(i, j, di, dj); if (upWalls.has(ekey(t, a, b))) continue;
        outside[nk] = 1; st.push(nk);
      }
    }
    upRoomCell.fill(0); upRooms.clear(); upper.clear();
    const seen = new Uint8Array(N * N); let id = 1;
    for (let k0 = 0; k0 < N * N; k0++) {
      if (outside[k0] || seen[k0]) continue;
      const cells = []; const s2 = [k0]; seen[k0] = 1;
      while (s2.length) {
        const k = s2.pop(), i = k % N, j = (k / N) | 0; cells.push([i, j]);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = i + di, nj = j + dj; if (!inGrid(ni, nj)) continue;
          const nk = nj * N + ni; if (seen[nk] || outside[nk]) continue;
          const [t, a, b] = edgeOf(i, j, di, dj); if (upWalls.has(ekey(t, a, b))) continue;
          seen[nk] = 1; s2.push(nk);
        }
      }
      if (cells.some(([i, j]) => lowDist[j * N + i] > OVERHANG)) continue;   // ulatub esimesest korrusest üle 3 ruudu -> põrandat ei tule
      const votes = new Map();
      for (const [i, j] of cells) { const r = rooms.get(cellRoom[j * N + i]); if (r) votes.set(r.style, (votes.get(r.style) || 0) + 1); }
      let style = 1, bv = 0; for (const [sty, n] of votes) if (n > bv) { bv = n; style = sty; }
      const r = { id, cells, style }; upRooms.set(id, r);
      for (const [i, j] of cells) { upRoomCell[j * N + i] = id; upper.add(i + ':' + j); }
      id++;
    }
    for (const k of [...voids]) { const [i, j] = k.split(':').map(Number); if (!(roomAt(i, j) && hiAt(i, j))) voids.delete(k); }
  }
  function canPlaceUpWall(t, i, j) {
    const [[ai, aj], [bi, bj]] = t === 'v' ? [[i - 1, j], [i, j]] : [[i, j - 1], [i, j]];
    if (!inGrid(ai, aj) || !inGrid(bi, bj) || !inArea(ai, aj) && !inArea(bi, bj)) return { ok: false, why: 'Outside the build area.' };
    if (upWallAt(t, i, j)) return { ok: false, why: 'There\'s already a wall here.' };
    if (Math.min(lowDistAt(ai, aj), lowDistAt(bi, bj)) > OVERHANG) return { ok: false, why: 'Upper rooms may reach at most ' + OVERHANG + ' tiles past the ground floor.' };
    if (holeAt(ai, aj) && holeAt(bi, bj)) return { ok: false, why: 'The stairwell is in the way.' };
    for (const c of [[ai, aj], [bi, bj]]) if (inGrid(c[0], c[1]) && objUpAt(c[0], c[1])) { const o = objs.get(objUpAt(c[0], c[1])); if (o && o.w * o.h > 1 && cellsOf(o.i, o.j, o.w, o.h).some(([x, y]) => (x === ai && y === aj)) && cellsOf(o.i, o.j, o.w, o.h).some(([x, y]) => (x === bi && y === bj))) return { ok: false, why: 'An item is in the way.' }; }
    return { ok: true };
  }
  function upChanged() { const before = upRooms.size; computeUpRooms(); pruneObjects(); dirty = true; return upRooms.size - before; }
  function addUpWalls(edges) { const out = []; for (const [t, i, j] of edges) if (canPlaceUpWall(t, i, j).ok) { upWalls.add(t + ':' + i + ':' + j); out.push([t, i, j]); } if (out.length) upChanged(); return out; }
  function removeUpWalls(edges) { const out = []; for (const [t, i, j] of edges) { const k = t + ':' + i + ':' + j; if (upWalls.delete(k)) { upOpen.delete(k); out.push([t, i, j]); } } if (out.length) upChanged(); return out; }
  function isUpWallCustom(t, i, j) { return upWalls.has(t + ':' + i + ':' + j); }
  function canSetUpOpening(t, i, j, type) {
    if (!upWallAt(t, i, j)) return { ok: false, why: 'There\'s no upper-floor wall here.' };
    const [[ai, aj], [bi, bj]] = t === 'v' ? [[i - 1, j], [i, j]] : [[i, j - 1], [i, j]];
    const inA = hiAt(ai, aj), inB = hiAt(bi, bj);
    if (type === 'window' && inA && inB) return { ok: false, why: 'Windows only go in outer walls.' };
    if (type === 'door' && !(inA && inB)) return { ok: false, why: 'An upstairs door has to lead into another upstairs room.' };
    return { ok: true };
  }
  function setUpOpening(t, i, j, type, w) { const k = t + ':' + i + ':' + j; if (type && type !== 'wall') upOpen.set(k, type); else upOpen.delete(k); if (w && type && type !== 'wall') upWide.add(k); else upWide.delete(k); dirty = true; }
  function isWide(t, i, j, lv) { return (lv ? upWide : wide).has(t + ':' + i + ':' + j); }
  // vahelagi: kustuta / taasta (kõrge ruum tekib kustutatud põranda kohale)
  function canVoid(i, j) {
    if (!hiAt(i, j)) return { ok: false, why: 'No upper-floor room here.' };
    if (!roomAt(i, j)) return { ok: false, why: 'Only floor above a ground-floor room can be removed.' };
    if (holeAt(i, j)) return { ok: false, why: 'That is the stairwell.' };
    if (objUpAt(i, j)) return { ok: false, why: 'Something stands on this floor tile.' };
    for (const so of objs.values()) if (so.type === 'sisetrepp') { const ex = stairExit(so); if (ex && ex.i === i && ex.j === j) return { ok: false, why: 'The top of the stairs needs this floor.' }; }
    return { ok: true };
  }
  function setVoid(i, j, on) { const k = i + ':' + j; if (on) { if (!canVoid(i, j).ok) return false; voids.add(k); } else voids.delete(k); pruneObjects(); dirty = true; return true; }
  const voidAt = (i, j) => voids.has(i + ':' + j);
  // ühe esimese korruse toa seinad üles (tööriist "2nd floor"): uued servad
  function upperWallsFor(rid) {
    const r = rooms.get(rid); if (!r) return [];
    const out = [];
    for (const [t, i, j] of roomEdges(r)) if (!upWalls.has(ekey(t, i, j))) out.push([t, i, j]);
    return out;
  }
  function raiseRoom(rid) {   // kopeerib toa seinad üles + aknad/uksed
    const r = rooms.get(rid); if (!r) return 0;
    let n = 0;
    for (const [t, i, j] of roomEdges(r)) {
      const k = ekey(t, i, j); if (upWalls.has(k)) continue;
      upWalls.add(k); n++;
      const [ra, rb] = edgeRooms(t, i, j), lo = openings.get(k);
      if (ra && rb && lo === 'door') upOpen.set(k, 'door');
    }
    upChanged();
    return n;
  }
  // trepiava teisel korrusel (siseterepi rakud)
  const holeAt = (i, j) => { const id = objAt(i, j); return !!id && objs.get(id) && objs.get(id).type === 'sisetrepp'; };
  const cellCenter = (i, j) => ({ x: X0 + (i + 0.5) * CS, z: Z0 + (j + 0.5) * CS });
  const toCell = (x, z) => ({ i: Math.floor((x - X0) / CS), j: Math.floor((z - Z0) / CS) });
  const containsWorld = (x, z) => x >= X0 && z >= Z0 && x < X0 + N * CS && z < Z0 + N * CS;
  const ekey = (t, i, j) => t + ':' + i + ':' + j;
  // v-serv (i,j): x = X0+i*CS, rakkude (i-1,j) ja (i,j) vahel; h-serv (i,j): z = Z0+j*CS, rakkude (i,j-1) ja (i,j) vahel
  function edgeRooms(t, i, j) { return t === 'v' ? [roomAt(i - 1, j), roomAt(i, j)] : [roomAt(i, j - 1), roomAt(i, j)]; }
  function edgeCells(t, i, j) { return t === 'v' ? [[i - 1, j], [i, j]] : [[i, j - 1], [i, j]]; }
  function isWall(t, i, j) { return walls.has(ekey(t, i, j)); }
  function edgeType(t, i, j) { if (!isWall(t, i, j)) return null; return openings.get(ekey(t, i, j)) || 'wall'; }
  function edgeOf(i, j, di, dj) {
    if (di === 1) return ['v', i + 1, j]; if (di === -1) return ['v', i, j];
    if (dj === 1) return ['h', i, j + 1]; return ['h', i, j];
  }
  function edgeBlocked(i, j, di, dj) { const [t, a, b] = edgeOf(i, j, di, dj); const et = edgeType(t, a, b); return et === 'wall' || et === 'window'; }
  function footprint(type, rot) { const s = OBJ[type].size; return rot % 2 ? [s[1], s[0]] : [s[0], s[1]]; }
  function objCenter(o) { return { x: X0 + (o.i + o.w / 2) * CS, z: Z0 + (o.j + o.h / 2) * CS }; }
  function objYaw(o) { return o.rot * (Math.PI / 2); }
  // esikülje servad (rot 0 -> +z, 1 -> +x, 2 -> -z, 3 -> -x); tõstukil saavad neist garaažiuks
  function frontEdges(i, j, w, h, rot) {
    const e = [];
    if (rot === 0) for (let ii = i; ii < i + w; ii++) e.push(['h', ii, j + h]);
    else if (rot === 2) for (let ii = i; ii < i + w; ii++) e.push(['h', ii, j]);
    else if (rot === 1) for (let jj = j; jj < j + h; jj++) e.push(['v', i + w, jj]);
    else for (let jj = j; jj < j + h; jj++) e.push(['v', i, jj]);
    return e;
  }
  // ---------- müüride ühendused: nurgad, ristmikud, otsad, tornid ----------
  const JOIN = { myyr: 1, myyrturel: 1, varav: 1, varav3: 1, suurvarav: 1, torn: 1, vallikaik: 1 };
  const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // vallikäik (platvorm) seisab müüri taga: see ei tee müürist nurka ega ristmikku
  function joinAt(i, j, self) { const id = objAt(i, j); if (!id || id === self.id) return null; const q = objs.get(id); return q && JOIN[q.type] && q.type !== 'vallikaik' ? q : null; }
  const _jm = M4.create();
  function drawJoined(o, mesh, tint, rust) {
    if (!o.jm) o.jm = [M4.create(), M4.create(), M4.create(), M4.create(), M4.create()];
    const yawOf = (di, dj) => Math.atan2(di, dj); // lokaalne +z -> maailma (di,dj) suund
    if (o.type === 'torn') {
      GFX.draw(mesh, o.m, tint, null, { rust });
      let k = 0;
      for (const [di, dj] of DIRS4) {
        // külje kõrval olevad rakud (2 tk)
        let hit = false;
        for (let t = 0; t < 2 && !hit; t++) {
          const ni = di > 0 ? o.i + o.w : di < 0 ? o.i - 1 : o.i + t, nj = dj > 0 ? o.j + o.h : dj < 0 ? o.j - 1 : o.j + t;
          const q = joinAt(ni, nj, o); if (q && q.type !== 'torn') hit = true;
        }
        if (!hit) continue;
        M4.compose(o.jm[k], o.cx, o.y, o.cz, yawOf(di, dj)); GFX.draw(MODELS.obj.tornSkirt, o.jm[k], tint, null, { rust }); k++;
      }
      return;
    }
    // müür: telje suund maailmas (lokaalne x)
    const axX = Math.abs(o.m[0]) > 0.5;
    const conn = DIRS4.map(([di, dj], a) => {
      const q = joinAt(o.i + di, o.j + dj, o); if (!q) return false;
      // risti asuv paralleelne müür (topeltmüür) ei tee nurka
      const isPerpDir = axX ? a >= 2 : a < 2;
      if (isPerpDir && (q.type === 'myyr' || q.type === 'myyrturel') && (Math.abs(q.m[0]) > 0.5) === axX) return false;
      return true;
    });
    const along = axX ? [0, 1] : [2, 3], perp = axX ? [2, 3] : [0, 1];
    const anyPerp = conn[perp[0]] || conn[perp[1]];
    if (!anyPerp) {
      GFX.draw(mesh, o.m, tint, null, { rust });
      let k = 0;
      for (const a of along) if (!conn[a]) { const [di, dj] = DIRS4[a]; M4.compose(o.jm[k], o.cx, o.y, o.cz, yawOf(di, dj)); GFX.draw(MODELS.obj.myyrCap, o.jm[k], tint, null, { rust }); k++; }
      return;
    }
    M4.compose(o.jm[4], o.cx, o.y, o.cz, 0); GFX.draw(o.type === 'myyrturel' ? MODELS.obj.myyrHub : MODELS.obj.myyrPost, o.jm[4], tint, null, { rust });
    let k = 0;
    for (let a = 0; a < 4; a++) {
      if (!conn[a]) continue;
      const [di, dj] = DIRS4[a]; M4.compose(o.jm[k], o.cx, o.y, o.cz, yawOf(di, dj)); GFX.draw(MODELS.obj.myyrArm, o.jm[k], tint, null, { rust }); k++;
    }
  }

  // ---------- tubade tuvastus ----------
  // välisala = rakud, kuhu pääseb ruudustiku servast ühtki seina ületamata
  function computeRooms() {
    const prev = new Int16Array(cellRoom);
    const outside = new Uint8Array(N * N);
    const q = [];
    for (let i = 0; i < N; i++) for (const j of [0, N - 1]) { const k = j * N + i; if (!outside[k]) { outside[k] = 1; q.push(k); } }
    for (let j = 0; j < N; j++) for (const i of [0, N - 1]) { const k = j * N + i; if (!outside[k]) { outside[k] = 1; q.push(k); } }
    while (q.length) {
      const k = q.pop(), i = k % N, j = (k / N) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj; if (!inGrid(ni, nj)) continue;
        const nk = nj * N + ni; if (outside[nk]) continue;
        const [t, a, b] = edgeOf(i, j, di, dj); if (walls.has(ekey(t, a, b))) continue;
        outside[nk] = 1; q.push(nk);
      }
    }
    cellRoom.fill(0);
    const seen = new Uint8Array(N * N);
    const usedIds = new Set();
    const newRooms = new Map();
    for (let k0 = 0; k0 < N * N; k0++) {
      if (outside[k0] || seen[k0]) continue;
      const cells = []; const st = [k0]; seen[k0] = 1;
      while (st.length) {
        const k = st.pop(), i = k % N, j = (k / N) | 0; cells.push([i, j]);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = i + di, nj = j + dj; if (!inGrid(ni, nj)) continue;
          const nk = nj * N + ni; if (seen[nk] || outside[nk]) continue;
          const [t, a, b] = edgeOf(i, j, di, dj); if (walls.has(ekey(t, a, b))) continue;
          seen[nk] = 1; st.push(nk);
        }
      }
      // id: varasem enamus, kui vaba
      const votes = new Map(), sv = new Map(); let rustN = 0;
      for (const [i, j] of cells) {
        const k = j * N + i, p = prev[k]; if (p) votes.set(p, (votes.get(p) || 0) + 1);
        if (cellStyle[k] !== 255) sv.set(cellStyle[k], (sv.get(cellStyle[k]) || 0) + 1);
        if (cellRust[k]) rustN++;
      }
      let id = 0, bv = 0;
      for (const [p, n] of votes) if (n > bv && !usedIds.has(p)) { bv = n; id = p; }
      if (!id) id = nextRoomId++;
      usedIds.add(id);
      let style = DEF_STYLE, sb = 0;
      for (const [s, n] of sv) if (n > sb) { sb = n; style = s; }
      const rust = rustN * 2 > cells.length ? 1.0 : 0.1;
      let i0 = N, j0 = N, i1 = -1, j1 = -1, sx = 0, sz = 0;
      for (const [i, j] of cells) {
        const k = j * N + i; cellRoom[k] = id; cellStyle[k] = style; cellRust[k] = rust > 0.5 ? 1 : 0;
        i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j); sx += i; sz += j;
      }
      const old = rooms.get(id);
      const r = { id, cells, i0, j0, i1, j1, style, rust, ci: sx / cells.length, cj: sz / cells.length, _lm: old ? old._lm : null };
      // lambid: hõre muster, vähemalt üks
      r.lamps = cells.filter(([i, j]) => (i - i0) % 3 === 1 && (j - j0) % 3 === 1);
      if (!r.lamps.length) { let b = cells[0], bd = 1e9; for (const c of cells) { const d = (c[0] - r.ci) ** 2 + (c[1] - r.cj) ** 2; if (d < bd) { bd = d; b = c; } } r.lamps = [b]; }
      newRooms.set(id, r);
    }
    rooms.clear();
    for (const [k, v] of newRooms) rooms.set(k, v);
    nextRoomId = Math.max(nextRoomId, ...[...rooms.keys()].map((x) => x + 1), 1);
    computeUpRooms();
    dirty = true;
  }
  // välja jäänud siseesemed eemaldatakse; tagastab eemaldatud
  function pruneObjects() {
    const removed = [];
    for (const k of [...upOpen.keys()]) if (!upWalls.has(k)) upOpen.delete(k);
    for (const o of [...objs.values()]) {
      const def = OBJ[o.type];
      if (o.lv || def.needsUpper) { if (cellsOf(o.i, o.j, o.w, o.h).some(([a, b]) => !upAt(a, b))) { removed.push(o); removeObj(o.id); } continue; }
      if (def.needsTall && cellsOf(o.i, o.j, o.w, o.h).some(([a, b]) => !tallAt(a, b))) { removed.push(o); removeObj(o.id); continue; }
      const inRoom = !!roomAt(o.i, o.j);
      if ((def.where === 'in' && !inRoom) || (def.where === 'out' && inRoom)) { removed.push(o); removeObj(o.id); }
    }
    return removed;
  }

  // ---------- seinad ----------
  // joon tipust (vi,vj) tippu (wi,wj) mööda telge → servade loend
  function lineEdges(vi, vj, wi, wj) {
    const out = [];
    if (vi === wi) { for (let j = Math.min(vj, wj); j < Math.max(vj, wj); j++) out.push(['v', vi, j]); }
    else if (vj === wj) { for (let i = Math.min(vi, wi); i < Math.max(vi, wi); i++) out.push(['h', i, vj]); }
    return out;
  }
  function canPlaceWall(t, i, j) {
    if (t === 'v' ? (i < 2 || i > N - 2 || j < 2 || j > N - 3) : (j < 2 || j > N - 2 || i < 2 || i > N - 3)) return { ok: false, why: 'Outside the build area.' };
    const [[ai, aj], [bi, bj]] = edgeCells(t, i, j);
    const oa = objAt(ai, aj), ob = objAt(bi, bj);
    if (oa && oa === ob) return { ok: false, why: 'The wall would go through an item.' };
    if (!IS_PLAYER) return { ok: true };
    // ei tohi lõigata läbi kellegi seismiskoha ega õueseme
    const sa = objs.get(oa), sb = objs.get(ob);
    if ((sa && OBJ[sa.type].where === 'out') || (sb && OBJ[sb.type].where === 'out')) return { ok: false, why: 'The outdoor device would sit under a wall.' };
    return { ok: true };
  }
  function addWalls(edges) {
    const added = [];
    for (const [t, i, j] of edges) { const k = ekey(t, i, j); if (walls.has(k)) continue; if (!canPlaceWall(t, i, j).ok) continue; walls.add(k); added.push([t, i, j]); }
    if (added.length) { computeRooms(); for (const r of rooms.values()) if (doorCount(r.id) === 0) autoDoor(r); }
    return added;
  }
  // eemaldab seinad; keeldub, kui mõni püsiese jääks toast välja
  function removeWalls(edges, check) {
    const removed = [];
    const before = new Set(walls), beforeOpen = new Map(openings), beforeRooms = new Map(rooms), beforeCell = new Int16Array(cellRoom);
    for (const [t, i, j] of edges) { const k = ekey(t, i, j); if (walls.delete(k)) { removed.push([t, i, j]); openings.delete(k); } }
    if (!removed.length) return { ok: true, removed };
    computeRooms();
    if (check !== false) for (const o of objs.values()) if (OBJ[o.type].fixed && !roomAt(o.i, o.j)) {
      walls.clear(); for (const k of before) walls.add(k); openings.clear(); for (const [k, v] of beforeOpen) openings.set(k, v);
      rooms.clear(); for (const [k, v] of beforeRooms) rooms.set(k, v); cellRoom.set(beforeCell); dirty = true;
      return { ok: false, why: 'The main building\'s walls can\'t be demolished.', removed: [] };
    }
    const lost = pruneObjects();
    return { ok: true, removed, lost };
  }
  // ristkülikukujuline tuba (vastaste ehitaja ja algseis)
  function rectEdges(i0, j0, i1, j1) {
    return [...lineEdges(i0, j0, i1 + 1, j0), ...lineEdges(i0, j1 + 1, i1 + 1, j1 + 1), ...lineEdges(i0, j0, i0, j1 + 1), ...lineEdges(i1 + 1, j0, i1 + 1, j1 + 1)];
  }
  function addRoom(i0, j0, i1, j1, style, rust) {
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * N + i; if (style !== undefined) cellStyle[k] = style; cellRust[k] = rust > 0.5 ? 1 : 0; }
    addWalls(rectEdges(i0, j0, i1, j1));
    return rooms.get(roomAt(i0, j0));
  }
  function setRoomStyle(rid, style, rust) {
    const r = rooms.get(rid); if (!r) return;
    for (const [i, j] of r.cells) { const k = j * N + i; if (style !== undefined) cellStyle[k] = style; if (rust !== undefined) cellRust[k] = rust > 0.5 ? 1 : 0; }
    if (style !== undefined) r.style = style; if (rust !== undefined) r.rust = rust;
    dirty = true;
  }
  function roomEdges(r) {
    const out = [];
    for (const [i, j] of r.cells) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (roomAt(i + di, j + dj) === r.id) continue;
      const e = edgeOf(i, j, di, dj); if (isWall(e[0], e[1], e[2])) out.push(e);
    }
    return out;
  }
  // uus tuba: üks uks, eelistatult naabertuppa, muidu õue baasi keskpunkti poole
  function autoDoor(r) {
    const cand = [];
    for (const [t, i, j] of roomEdges(r)) {
      const [[ai, aj], [bi, bj]] = edgeCells(t, i, j);
      if (objAt(ai, aj) || objAt(bi, bj)) continue;
      if (openings.get(ekey(t, i, j))) continue;
      const [a, b] = edgeRooms(t, i, j);
      cand.push({ t, i, j, other: a === r.id ? b : a });
    }
    if (!cand.length) return;
    const shared = cand.filter((c) => c.other);
    let pickC = null;
    if (shared.length) pickC = shared[Math.floor(shared.length / 2)];
    else {
      let best = -1e9;
      const tx = opt.doorToward ? (opt.doorToward.x - X0) / CS : N / 2, tz = opt.doorToward ? (opt.doorToward.z - Z0) / CS : N / 2 + 6;
      for (const c of cand) {
        const ex = c.t === 'v' ? c.i : c.i + 0.5, ez = c.t === 'v' ? c.j + 0.5 : c.j;
        const sc = -Math.hypot(ex - tx, ez - tz);
        if (sc > best) { best = sc; pickC = c; }
      }
    }
    if (pickC) setOpening(pickC.t, pickC.i, pickC.j, 'door');
  }
  function setOpening(t, i, j, type, w) { const k = ekey(t, i, j); if (!type) openings.delete(k); else openings.set(k, type); if (w && type) wide.add(k); else wide.delete(k); dirty = true; }
  function canPlaceOpening(t, i, j, type) {
    if (!isWall(t, i, j)) return { ok: false, why: 'There\'s no wall here.' };
    const [a, b] = edgeRooms(t, i, j);
    if (type === 'window' && a && b) return { ok: false, why: 'Windows only go in outer walls.' };
    const cur = openings.get(ekey(t, i, j));
    if (cur === 'garage') return { ok: false, why: 'This is the garage door – remove the car lift to change it.' };
    if (cur === type) return { ok: false, why: type === 'door' ? 'There\'s already a door here.' : 'There\'s already a window here.' };
    if (type === 'door') {
      const [[ai, aj], [bi, bj]] = edgeCells(t, i, j);
      if (objAt(ai, aj) || objAt(bi, bj)) return { ok: false, why: 'An item is blocking the door.' };
    }
    return { ok: true };
  }
  function doorCount(rid) { const r = rooms.get(rid); if (!r) return 0; let n = 0; for (const [t, i, j] of roomEdges(r)) if (openings.get(ekey(t, i, j)) === 'door') n++; return n; }

  // ---------- esemed ----------
  function cellsOf(i, j, w, h) { const out = []; for (let jj = j; jj < j + h; jj++) for (let ii = i; ii < i + w; ii++) out.push([ii, jj]); return out; }
  // siseterepp: madal ots esiküljel (+z kohalik), kõrge ots tagaküljel; esimene vaba rakk ees = sissepääs, kõrge otsa taga = väljapääs üleval
  function stairDir(o) { const r = o.rot % 4; return r === 0 ? [0, 1] : r === 1 ? [1, 0] : r === 2 ? [0, -1] : [-1, 0]; }
  function stairEntry(o) { const [di, dj] = stairDir(o); return di > 0 ? { i: o.i + o.w, j: o.j } : di < 0 ? { i: o.i - 1, j: o.j } : dj > 0 ? { i: o.i, j: o.j + o.h } : { i: o.i, j: o.j - 1 }; }
  function stairExit(o) { const [di, dj] = stairDir(o); return di > 0 ? { i: o.i - 1, j: o.j } : di < 0 ? { i: o.i + o.w, j: o.j } : dj > 0 ? { i: o.i, j: o.j - 1 } : { i: o.i, j: o.j + o.h }; }
  function nearDoor(i, j) { for (const [t, a, b] of [['v', i, j], ['v', i + 1, j], ['h', i, j], ['h', i, j + 1]]) if (edgeType(t, a, b) === 'door') return true; return false; }
  // müüri/valli peale ehitatav kahur, värav vms vahetab selle välja
  const REPLACERS = { kahur: 1, myyrturel: 1, varav: 1, varav3: 1, suurvarav: 1, kmpesa: 1 }, REPLACEABLE = { myyr: 1, vallikaik: 1, barrikaad: 1, okas: 1, siil: 1 };
  function replaceSet(type, i, j, rot) {
    const out = new Set(); if (!REPLACERS[type]) return out;
    const [w, h] = footprint(type, rot);
    for (const [ii, jj] of cellsOf(i, j, w, h)) { const id = objAt(ii, jj); const o = id && objs.get(id); if (o && REPLACEABLE[o.type]) out.add(id); }
    return out;
  }
  function canPlaceReplacing(type, i, j, rot) {
    const rep = replaceSet(type, i, j, rot);
    const r = canPlaceObj(type, i, j, rot, 0, rep);
    return Object.assign({}, r, { replace: [...rep].map((id) => objs.get(id)) });
  }
  function placeReplacing(type, i, j, rot) {
    const chk = canPlaceReplacing(type, i, j, rot); if (!chk.ok) return null;
    for (const o of chk.replace) removeObj(o.id);
    return { o: addObj(type, i, j, rot), removed: chk.replace };
  }
  function canPlaceObj(type, i, j, rot, lv, ignore) {
    const def = OBJ[type];
    const [w, h] = footprint(type, rot);
    if (lv) {   // teine korrus: ainult toaesemed, teise korruse põrandal, mitte trepiava kohal
      if (def.where === 'out' || def.needsUpper || def.fixed) return { ok: false, why: 'This item can\'t go on the upper floor.' };
      let rm = -1;
      for (const [ii, jj] of cellsOf(i, j, w, h)) {
        if (!inArea(ii, jj) || !upAt(ii, jj)) return { ok: false, why: 'This spot has no upper floor.' };
        if (holeAt(ii, jj)) return { ok: false, why: 'The stairwell is here.' };
        if (objUpAt(ii, jj)) return { ok: false, why: 'That spot is already taken.' };
        const r = upRoomAt(ii, jj); if (rm === -1) rm = r; else if (rm !== r) return { ok: false, why: 'An item can\'t be in two rooms at once.' };
        for (const so of objs.values()) if (so.type === 'sisetrepp') { const ex = stairExit(so); if (ex && ex.i === ii && ex.j === jj) return { ok: false, why: 'Keep the top of the stairs free.' }; }
      }
      for (const [ii, jj] of cellsOf(i, j, w, h)) {
        if (ii + 1 < i + w && upWallAt('v', ii + 1, jj)) return { ok: false, why: 'A wall is in the way.' };
        if (jj + 1 < j + h && upWallAt('h', ii, jj + 1)) return { ok: false, why: 'A wall is in the way.' };
      }
      return { ok: true };
    }
    if (def.needsUpper) {
      for (const [ii, jj] of cellsOf(i, j, w, h)) if (!upAt(ii, jj)) return { ok: false, why: 'Needs an upper-floor room with floor above (Floor 2: build walls, or tool 2nd floor).' };
      const ex = stairExit({ i, j, w, h, rot, type });
      if (!ex || !upAt(ex.i, ex.j) || roomAt(ex.i, ex.j) !== roomAt(i, j) || upRoomAt(ex.i, ex.j) !== upRoomAt(i, j) || objUpAt(ex.i, ex.j)) return { ok: false, why: 'The high end of the stairs needs a free upper-floor tile behind it (in the same room).' };
      const en = stairEntry({ i, j, w, h, rot, type });
      if (!en || roomAt(en.i, en.j) !== roomAt(i, j) || objAt(en.i, en.j)) return { ok: false, why: 'Leave a free tile in front of the low end of the stairs.' };
      for (const [ii, jj] of cellsOf(i, j, w, h)) if (objUpAt(ii, jj)) return { ok: false, why: 'Something stands on the upper floor there.' };
    }
    if (def.needsTall) {
      for (const [ii, jj] of cellsOf(i, j, w, h)) if (!tallAt(ii, jj)) return { ok: false, why: 'Needs a two-storey tall room (tool Tall room, or remove the floor upstairs).' };
    }
    if (def.garage) {
      for (const [t, a, b] of frontEdges(i, j, w, h, rot)) {
        if (!isWall(t, a, b)) return { ok: false, why: 'The front (garage door side) must be against a wall.' };
        const [r1, r2] = edgeRooms(t, a, b);
        if (r1 && r2) return { ok: false, why: 'The garage door must be in an outer wall.' };
        const op = openings.get(ekey(t, a, b)); if (op === 'door') return { ok: false, why: 'There is a door in that wall – move it first.' };
      }
    }
    let room = -1;
    for (const [ii, jj] of cellsOf(i, j, w, h)) {
      if (!inArea(ii, jj)) return { ok: false, why: 'Outside the build area.' };
      if (objAt(ii, jj) && !(ignore && ignore.has(objAt(ii, jj)))) return { ok: false, why: 'That spot is already taken.' };
      const r = roomAt(ii, jj);
      if (def.where === 'in' && !r) return { ok: false, why: 'This item goes inside a room.' };
      if (def.where === 'out' && r) return { ok: false, why: 'This item goes outside.' };
      if (room === -1) room = r; else if (room !== r) return { ok: false, why: 'An item can\'t be in two rooms at once.' };
      if (nearDoor(ii, jj)) return { ok: false, why: 'Nothing can be placed in front of a door.' };
      for (const so of objs.values()) if (so.type === 'sisetrepp') { const en = stairEntry(so); if (en && en.i === ii && en.j === jj) return { ok: false, why: 'Keep the foot of the stairs free.' }; }
    }
    if (def.where !== 'in') { const c = cellCenter(i, j); if (Math.hypot(c.x - OX, c.z - OZ) > 54) return { ok: false, why: 'Too far from the base.' }; }
    for (const [ii, jj] of cellsOf(i, j, w, h)) {
      if (ii + 1 < i + w && isWall('v', ii + 1, jj)) return { ok: false, why: 'A wall is in the way.' };
      if (jj + 1 < j + h && isWall('h', ii, jj + 1)) return { ok: false, why: 'A wall is in the way.' };
    }
    if (room > 0) { const acc = roomAccess(room, cellsOf(i, j, w, h)); if (!acc.ok) return { ok: false, why: acc.why }; }
    return { ok: true };
  }
  function roomAccess(rid, extra) {
    const r = rooms.get(rid); if (!r) return { ok: true };
    const blocked = new Set((extra || []).map(([a, b]) => b * N + a));
    const free = (a, b) => roomAt(a, b) === rid && !objAt(a, b) && !blocked.has(b * N + a);
    const starts = [];
    for (const [t, i, j] of roomEdges(r)) if (openings.get(ekey(t, i, j)) === 'door') for (const [a, b] of edgeCells(t, i, j)) if (roomAt(a, b) === rid) starts.push([a, b]);
    if (!starts.length) return { ok: true };
    const seen = new Set(), q = [];
    for (const [a, b] of starts) if (free(a, b) && !seen.has(b * N + a)) { seen.add(b * N + a); q.push([a, b]); }
    while (q.length) {
      const [a, b] = q.pop();
      for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const na = a + da, nb = b + db, k = nb * N + na;
        if (seen.has(k) || !free(na, nb) || edgeBlocked(a, b, da, db)) continue;
        seen.add(k); q.push([na, nb]);
      }
    }
    let total = 0; for (const [a, b] of r.cells) if (free(a, b)) total++;
    if (seen.size < total) return { ok: false, why: 'The item would block off part of the room. Leave a way through.' };
    if (extra && extra.length) {
      let near = false;
      for (const [a, b] of extra) for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (seen.has((b + db) * N + (a + da))) near = true;
      if (!near) return { ok: false, why: 'Nobody could reach the item.' };
    }
    return { ok: true };
  }
  function escapeCell(i, j) {
    const seen = new Set([j * N + i]); let q = [[i, j]];
    for (let depth = 0; depth < 8 && q.length; depth++) {
      const nq = [];
      for (const [a, b] of q) for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const na = a + da, nb = b + db, k = nb * N + na;
        if (!inGrid(na, nb) || seen.has(k) || edgeBlocked(a, b, da, db)) continue;
        seen.add(k);
        if (!objAt(na, nb)) {
          let exits = 0;
          for (const [ea, eb] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (inGrid(na + ea, nb + eb) && !objAt(na + ea, nb + eb) && !edgeBlocked(na, nb, ea, eb) && !(na + ea === i && nb + eb === j)) exits++;
          if (exits > 0) return cellCenter(na, nb);
        }
        nq.push([na, nb]);
      }
      q = nq;
    }
    return null;
  }
  function addObj(type, i, j, rot, extra, id) {
    const def = OBJ[type];
    const [w, h] = footprint(type, rot);
    const o = Object.assign({ id: id || nextObjId++, type, i, j, rot, w, h, hp: def.hp || 100, maxHp: def.hp || 100, broken: false, on: true, anim: 0, cool: 0, target: null, data: {} }, extra || {});
    nextObjId = Math.max(nextObjId, o.id + 1);
    objs.set(o.id, o);
    const grid = o.lv ? cellObjUp : cellObj;
    for (const [ii, jj] of cellsOf(i, j, w, h)) grid[jj * N + ii] = o.id;
    o.m = M4.create(); updateObjMatrix(o);
    if (def.garage) for (const [t, a, b] of frontEdges(i, j, w, h, rot)) if (walls.has(ekey(t, a, b))) openings.set(ekey(t, a, b), 'garage');
    dirty = true;
    return o;
  }
  function updateObjMatrix(o) { const c = objCenter(o); const fy = (roomAt(o.i, o.j) ? FLOOR_Y : 0) + OY + (o.lv ? WH : 0); const sy = OBJ[o.type].sy || 1, sx = OBJ[o.type].sx || 1; M4.compose(o.m, c.x, fy, c.z, objYaw(o), 0, 0, sx, sy, 1); o.cx = c.x; o.cz = c.z; o.y = fy; }
  function removeObj(id) {
    const o = objs.get(id); if (!o) return;
    const grid = o.lv ? cellObjUp : cellObj;
    for (const [ii, jj] of cellsOf(o.i, o.j, o.w, o.h)) if (grid[jj * N + ii] === id) grid[jj * N + ii] = 0;
    if (OBJ[o.type].garage) for (const [t, a, b] of frontEdges(o.i, o.j, o.w, o.h, o.rot)) if (openings.get(ekey(t, a, b)) === 'garage') openings.delete(ekey(t, a, b));
    objs.delete(id); dirty = true;
  }
  function autoRot(type, i, j) {
    const [w0, h0] = OBJ[type].size;
    if (OBJ[type].garage) for (let rot = 0; rot < 4; rot++) { const [w, h] = footprint(type, rot); if (frontEdges(i, j, w, h, rot).every(([t, a, b]) => isWall(t, a, b) && edgeRooms(t, a, b).filter(Boolean).length === 1)) return rot; }
    for (let rot = 0; rot < 4; rot++) {
      const [w, h] = footprint(type, rot);
      let wall = false;
      if (rot === 0) for (let ii = i; ii < i + w; ii++) wall = wall || isWall('h', ii, j);
      if (rot === 2) for (let ii = i; ii < i + w; ii++) wall = wall || isWall('h', ii, j + h);
      if (rot === 1) for (let jj = j; jj < j + h; jj++) wall = wall || isWall('v', i, jj);
      if (rot === 3) for (let jj = j; jj < j + h; jj++) wall = wall || isWall('v', i + w, jj);
      if (wall) return rot;
    }
    return w0 >= h0 ? 0 : 1;
  }
  function useCells(o, frontOnly) {
    const out = [];
    const isIn = (ii, jj) => ii >= o.i && ii < o.i + o.w && jj >= o.j && jj < o.j + o.h;
    for (const [ii, jj] of cellsOf(o.i, o.j, o.w, o.h)) {
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = ii + di, nj = jj + dj;
        if (isIn(ni, nj) || !inGrid(ni, nj) || (o.lv ? objUpAt(ni, nj) || holeAt(ni, nj) || !upAt(ni, nj) : objAt(ni, nj))) continue;
        if (edgeBlocked(ii, jj, di, dj)) continue;
        const [t, a, b] = edgeOf(ii, jj, di, dj);
        if (edgeType(t, a, b) === 'door') continue;
        const front = (o.rot === 0 && dj === 1) || (o.rot === 2 && dj === -1) || (o.rot === 1 && di === 1) || (o.rot === 3 && di === -1);
        if (frontOnly && !front) continue;
        if (!out.some((c) => c[0] === ni && c[1] === nj)) out.push([ni, nj, front]);
      }
    }
    out.sort((a, b) => (b[2] ? 1 : 0) - (a[2] ? 1 : 0));
    return out;
  }
  // müra + valgus + esemete arv -> ohutase, millest sõltub putukaparve suurus
  let sigCache = null, sigT = -9;
  function signature(force) {
    const now = G.time ? G.time.total : 0;
    if (!force && sigCache && now - sigT < 1) return sigCache;
    let noise = 0, light = 0, count = 0;
    for (const o of objs.values()) {
      const d = OBJ[o.type]; if (!d || o.type === 'terminal' || o.type === 'hoidla') continue;
      count++;
      const sg = SIG[o.type]; if (!sg) continue;
      const running = d.power > 0 ? o.on : d.power < 0 ? !o.broken : true;
      if (!running) continue;
      noise += sg[0]; light += sg[1];
    }
    if (power.lightsOn) {
      for (const r of rooms.values()) light += r.lamps.length * 0.7;
      for (const [, t] of openings) if (t === 'window') light += 1.5;
      for (const s of sconces) if (s.ext) light += 0.8;
    }
    const crew = Ents.list.filter((e) => e.alive && e.team === 'crew' && e.kind === 'human').length;
    noise += crew * 1.5;
    noise = Math.round(noise); light = Math.round(light);
    const total = noise + light + count;
    let tier = THREAT_TIERS[0]; for (const t of THREAT_TIERS) if (total >= t[0]) tier = t;
    sigCache = { noise, light, count, crew, total, tier: tier[1], col: tier[2], mult: Math.min(3.5, 0.55 + total / 70) };
    sigT = now; return sigCache;
  }
  function objsOfType(type) { const out = []; for (const o of objs.values()) if (o.type === type) out.push(o); return out; }
  function countBeds() { let n = 0; for (const o of objs.values()) n += OBJ[o.type].beds || 0; return n; }

  // ---------- energia ----------
  function updatePower(isDay) {
    let supply = 0;
    const cons = [];
    for (const o of objs.values()) {
      const d = OBJ[o.type];
      if (d.power < 0) { if (!o.broken && (!d.solar || isDay)) supply += -d.power; }
      else if (d.power > 0) cons.push(o);
    }
    if (IS_PLAYER && typeof Crew !== 'undefined') supply += Crew.engineerBonus();
    if (!IS_PLAYER) supply = Math.max(supply, 99);
    cons.sort((a, b) => (POWER_PRIO[b.type] || 0) - (POWER_PRIO[a.type] || 0));
    let left = supply, demand = 0;
    for (const o of cons) {
      const p = OBJ[o.type].power; demand += p;
      if (o.broken || o.hp <= 0) { o.on = false; continue; }
      if (left >= p) { o.on = true; left -= p; } else o.on = false;
    }
    power.supply = IS_PLAYER ? supply : Math.max(demand, 1); power.demand = demand; power.ok = demand <= supply; power.lightsOn = supply > 0;
  }

  // ---------- geomeetria ----------
  function rebuild() {
    dirty = false;
    for (const k of ['main', 'low', 'roof', 'up', 'upLow']) for (let q = 0; q < 2; q++) if (meshes[k][q]) { meshes[k][q].dispose(); meshes[k][q] = null; }
    if (meshes.glass) { meshes.glass.dispose(); meshes.glass = null; }
    if (meshes.strips) { meshes.strips.dispose(); meshes.strips = null; }
    for (const st of inst) GFX.removeInstSet(st);
    inst = []; frames.length = 0;
    const O = MODELS.obj, sdf = !!O.floorTile;
    const IL = { floor: [[], []], roof: [[], []], edge: [[], []], post: [[], []], upFloor: [[], []], upPost: [[], []] };
    const SL = new MB(); SL.jit = 0;
    const WARM = [1.0, 0.82, 0.55], REDL = [1.0, 0.12, 0.06];
    const B = { main: [new MB(), new MB()], low: [new MB(), new MB()], roof: [new MB(), new MB()], up: [new MB(), new MB()], upLow: [new MB(), new MB()] };
    for (const k in B) for (const b of B[k]) b.jit = 0.025;
    const G = new MB(); G.jit = 0;
    const rustQ = (rid) => { const r = rooms.get(rid); return r && r.rust > 0.5 ? 1 : 0; };
    const EXT = [0.46, 0.44, 0.42], EXT2 = [0.30, 0.29, 0.28], POST = [0.22, 0.21, 0.21];
    sconces.length = 0;
    // põrandad, laed, katused (raku kaupa: toad võivad olla mis tahes kujuga)
    for (const r of rooms.values()) {
      const st = ROOM_STYLES[r.style] || ROOM_STYLES[1];
      const q = r.rust > 0.5 ? 1 : 0;
      for (const [i, j] of r.cells) {
        const c = cellCenter(i, j);
        const col = (i + j) % 2 ? st.floor : st.floor2;
        if (sdf) IL.floor[q].push([c.x, OY, c.z, ((i * 7 + j * 3) % 4) * Math.PI / 2, col.map((v) => v / 0.78)]);
        else for (const b of [B.main[q], B.low[q]]) b.color(col, r.rust > 0.5 ? MAT.RUST : MAT.WORN).boxB(c.x, -0.1, c.z, CS, FLOOR_Y + 0.1, CS);
        const x0 = c.x - CS / 2, x1 = c.x + CS / 2, z0 = c.z - CS / 2, z1 = c.z + CS / 2;
        const upC = hiAt(i, j), tl = tallAt(i, j), hole = holeAt(i, j), RY = WH;
        if (!hole && !tl) B.roof[q].color(st.ceil).quad([x0, WH - 0.01, z0], [x1, WH - 0.01, z0], [x1, WH - 0.01, z1], [x0, WH - 0.01, z1]);
        if (upC) continue;   // teise korruse tuba peal: põrand/katus tehakse allpool teise korruse tsüklis
        if (sdf) IL.roof[q].push([c.x, OY + RY, c.z, 0, EXT2.map((v) => v / 0.62)]);
        else B.roof[q].color(EXT2, MAT.RUST).boxB(c.x, RY, c.z, CS + 0.02, 0.16, CS + 0.02);
        // äärisrinnatis seal, kus naaberrakk pole tuba
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (roomAt(i + di, j + dj)) continue;
          if (sdf) { IL.edge[q].push([c.x + di * (CS / 2 + 0.07), OY + RY, c.z + dj * (CS / 2 + 0.07), di ? Math.PI / 2 : 0, EXT.map((v) => v / 0.72)]); continue; }
          B.roof[q].color(EXT, MAT.RUST).boxB(c.x + di * (CS / 2 + 0.07), RY + 0.16, c.z + dj * (CS / 2 + 0.07), di ? 0.14 : CS + 0.28, 0.22, dj ? 0.14 : CS + 0.28);
        }
      }
      const rr = mulberry32(r.id * 31 + 7);
      if (r.id % 2 === 0 || rooms.size === 1) {
        const c0 = cellCenter(r.cells[0][0], r.cells[0][1]);
        const ax = c0.x - 0.4, az = c0.z - 0.4, ah = 3.2 + rr() * 2.2, RYm = hiAt(r.cells[0][0], r.cells[0][1]) ? WH * 2 : WH;
        if (sdf) frames.push({ mesh: 'roofMast', roof: true, m: M4.compose(M4.create(), ax, OY + RYm + 0.16, az, rr() * TAU, 0, 0, 1, ah / 4, 1) });
        else {
          B.roof[q].color(PAL.metalDark).cyl(ax, WH + 0.16, az, 0.07, 0.04, ah, 5);
          for (let k = 1; k < 4; k++) B.roof[q].color(PAL.metalDark).boxB(ax, WH + 0.16 + ah * k / 4, az, 0.5 - k * 0.1, 0.03, 0.03);
          SL.color(REDL, MAT.GLOW).boxB(ax, WH + 0.16 + ah, az, 0.12, 0.12, 0.12);
        }
      }
      const nv = Math.min(4, 1 + Math.floor(r.cells.length / 6));
      for (let k = 0; k < nv; k++) {
        const cc = r.cells[Math.floor(rr() * r.cells.length)], c = cellCenter(cc[0], cc[1]);
        if (sdf) { const kind = ['roofAC', 'roofVent', 'roofTank'][Math.floor(rr() * 3)]; frames.push({ mesh: kind, roof: true, t: [0.62, 0.61, 0.6, 0], m: M4.compose(M4.create(), c.x + (rr() - 0.5) * 0.6, OY + (hiAt(cc[0], cc[1]) ? WH * 2 : WH) + 0.16, c.z + (rr() - 0.5) * 0.6, Math.floor(rr() * 4) * Math.PI / 2) }); }
        else if (rr() < 0.5) B.roof[q].color([0.42, 0.42, 0.40], MAT.RUST).boxB(c.x, WH + 0.16, c.z, 0.9 + rr() * 0.5, 0.5, 0.7 + rr() * 0.5);
        else B.roof[q].color([0.36, 0.36, 0.35], MAT.RUST).cyl(c.x, WH + 0.16, c.z, 0.25, 0.22, 0.8 + rr() * 0.6, 7);
      }
    }
    const wallFace = (b, ax, az, bx, bz, nx, nz, y0, y1, col, mat) => {
      const ox = nx * WT / 2, oz = nz * WT / 2;
      const p0 = [ax + ox, y0, az + oz], p1 = [bx + ox, y0, bz + oz], p2 = [bx + ox, y1, bz + oz], p3 = [ax + ox, y1, az + oz];
      const cr = (bx - ax) * nz - (bz - az) * nx;
      b.color(col, mat);
      if (cr > 0) b.quad(p0, p1, p2, p3); else b.quad(p1, p0, p3, p2);
    };
    const wallSeg = (q, ax, az, bx, bz, nx, nz, y0, y1, colA, matA, colB, matB, low) => {
      const b = low ? B.low[q] : B.main[q];
      const top = low ? Math.min(y1, LOW_H) : y1;
      if (top <= y0) return;
      wallFace(b, ax, az, bx, bz, nx, nz, y0, top, colA, matA);
      wallFace(b, ax, az, bx, bz, -nx, -nz, y0, top, colB, matB);
      const ox = nx * WT / 2, oz = nz * WT / 2;
      b.color(POST).quad([ax - ox, top, az - oz], [bx - ox, top, bz - oz], [bx + ox, top, bz + oz], [ax + ox, top, az + oz]);
      b.color(POST).quad([ax + ox, top, az + oz], [bx + ox, top, bz + oz], [bx - ox, top, bz - oz], [ax - ox, top, az - oz]);
    };
    const sideStyle = (rid) => {
      if (!rid) return { col: EXT, col2: EXT2, mat: MAT.RUST };
      const r = rooms.get(rid); const st = ROOM_STYLES[r.style] || ROOM_STYLES[1];
      return { col: st.wall, col2: st.wall2, mat: r.rust > 0.5 ? MAT.RUST : MAT.WORN };
    };
    const addWallCol = (ax, az, bx, bz, y0, y1, extra) => { colliders.push(Object.assign({ t: 's', ax, az, bx, bz, r: WT / 2 + 0.02, y0: y0 + OY, y1: y1 + OY, kind: 'wall' }, extra || {})); };
    for (const c of colliders) World.removeCol(c);
    colliders.length = 0;
    doors.length = 0; gdoors.length = 0;
    const posts = new Set();
    for (const key of walls) {
      const [t, si, sj] = key.split(':'); const i = +si, j = +sj;
      const [ra, rb] = edgeRooms(t, i, j);
      const q = Math.max(rustQ(ra), rustQ(rb));
      let ax, az, bx, bz, nx, nz;
      if (t === 'v') { ax = X0 + i * CS; bx = ax; az = Z0 + j * CS; bz = az + CS; nx = 1; nz = 0; }
      else { az = Z0 + j * CS; bz = az; ax = X0 + i * CS; bx = ax + CS; nx = 0; nz = 1; }
      posts.add(i + ':' + j); posts.add(t === 'v' ? i + ':' + (j + 1) : (i + 1) + ':' + j);
      const sA = sideStyle(rb), sB = sideStyle(ra);
      const op = openings.get(key);
      const L = CS, ux = (bx - ax) / L, uz = (bz - az) / L;
      const P = (s) => [ax + ux * s, az + uz * s];
      const seg = (s0, s1, y0, y1, low) => {
        const [x0, z0] = P(s0), [x1, z1] = P(s1);
        const bands = [[y0, Math.min(y1, 0.28), true], [Math.max(y0, 0.28), Math.min(y1, WH - 0.25), false], [Math.max(y0, WH - 0.25), y1, true]];
        for (const [b0, b1, dark] of bands) { if (b1 <= b0) continue; wallSeg(q, x0, z0, x1, z1, nx, nz, b0, b1, dark ? sA.col2 : sA.col, sA.mat, dark ? sB.col2 : sB.col, sB.mat, low); }
      };
      // seinavalgusti: tagaplaat põhivõrku, helendav kuppel valgusribade võrku
      const sconce = (side, ext) => {
        const [mx, mz] = P(L / 2), o = WT / 2;
        const px = mx + nx * side * o, pz = mz + nz * side * o, y = ext ? 2.55 : 2.15;
        B.main[q].color([0.09, 0.09, 0.1]).boxB(px + nx * side * 0.03, y - 0.14, pz + nz * side * 0.03, t === 'v' ? 0.06 : 0.34, 0.3, t === 'v' ? 0.34 : 0.06);
        SL.color(ext ? WARM : [1.0, 0.86, 0.66], MAT.GLOW).boxB(px + nx * side * 0.1, y - 0.08, pz + nz * side * 0.1, t === 'v' ? 0.1 : 0.24, 0.14, t === 'v' ? 0.24 : 0.1);
        B.main[q].color([0.09, 0.09, 0.1]).boxB(px + nx * side * 0.12, y + 0.06, pz + nz * side * 0.12, t === 'v' ? 0.16 : 0.32, 0.04, t === 'v' ? 0.32 : 0.16);
        sconces.push({ x: px + nx * side * 0.5, y: y - 0.3 + OY, z: pz + nz * side * 0.5, ext, rid: ext ? 0 : (side > 0 ? rb : ra) });
      };
      const ribs = (s0, s1, y0, y1, side) => {
        const o = WT / 2 + 0.03, b = B.main[q];
        for (let s = s0 + 0.5; s < s1 - 0.1; s += 1.0) { const [x, z] = P(s); b.color(EXT2, MAT.RUST).boxB(x + nx * side * o, y0, z + nz * side * o, t === 'v' ? 0.05 : 0.08, y1 - y0, t === 'v' ? 0.08 : 0.05); }
        const [mx, mz] = P((s0 + s1) / 2);
        b.color(EXT2, MAT.RUST).boxB(mx + nx * side * o, 0.05, mz + nz * side * o, t === 'v' ? 0.06 : (s1 - s0), 0.55, t === 'v' ? (s1 - s0) : 0.06);
        b.color([0.18, 0.18, 0.2]).boxB(mx + nx * side * (o + 0.03), 2.38, mz + nz * side * (o + 0.03), t === 'v' ? 0.06 : (s1 - s0), 0.12, t === 'v' ? (s1 - s0) : 0.06);
        if ((i + j) % 2 === 0) SL.color(ACCENT, MAT.GLOW).boxB(mx + nx * side * (o + 0.07), 2.41, mz + nz * side * (o + 0.07), t === 'v' ? 0.03 : (s1 - s0) * 0.8, 0.05, t === 'v' ? (s1 - s0) * 0.8 : 0.03);
      };
      const extSide = ra && !rb ? 1 : rb && !ra ? -1 : 0;
      const yawW = t === 'v' ? Math.PI / 2 : 0;
      // kast seina pinnal: s = koht piki seina, out = kaugus pinnast, side = kumb pool
      const pbox = (b, s, y, len, h, dep, out, side, col, mat) => {
        const [x, z] = P(s), o = WT / 2 + out + dep / 2;
        b.color(col, mat || 0).boxB(x + nx * side * o, y, z + nz * side * o, t === 'v' ? dep : len, h, t === 'v' ? len : dep);
      };
      // nurgaliist (45°) seina tasapinnas
      const chamfer = (b, s, y, len, rot, col, dep) => {
        const [x, z] = P(s);
        b.push().tf(x, y, z, yawW, 0, rot).color(col).boxB(0, -0.06, 0, len, 0.12, dep).pop();
      };
      const PANEL = [0.44, 0.43, 0.42], PANEL2 = [0.32, 0.31, 0.30], TRIM = [0.22, 0.22, 0.22];
      const COOL = [0.55, 0.85, 1.0], GREEN = [0.35, 1.0, 0.5];
      // futuristlik välissein: sokkel, valgusriba, tõstetud paneelid, karniis
      const extDeco = (side) => {
        const b = B.main[q];
        pbox(b, L / 2, 0, L, 0.34, 0.07, 0, side, TRIM, MAT.RUST);
        pbox(SL, L / 2, 0.35, L * 0.94, 0.035, 0.02, 0.06, side, ACCENT, MAT.GLOW);
        for (const s of [L * 0.255, L * 0.745]) {
          pbox(b, s, 0.55, L * 0.44, 1.62, 0.035, 0, side, sA_ext().col3, MAT.RUST);
          pbox(b, s, 0.7, L * 0.3, 1.32, 0.02, 0.035, side, PANEL2, MAT.RUST);
        }
        if ((i + j) % 2 === 0) pbox(SL, L / 2, 0.6, 0.03, 1.5, 0.02, 0.03, side, ACCENT, MAT.GLOW);
        pbox(b, L / 2, WH - 0.44, L, 0.3, 0.09, 0, side, TRIM, MAT.RUST);
        pbox(b, L / 2, WH - 0.14, L, 0.14, 0.05, 0, side, PANEL2, MAT.RUST);
        if ((i * 7 + j * 3) % 5 === 0) { pbox(b, L * 0.75, 2.2, 0.56, 0.3, 0.05, 0.05, side, [0.06, 0.06, 0.07]); for (let k = 0; k < 4; k++) pbox(b, L * 0.75, 2.24 + k * 0.065, 0.5, 0.025, 0.02, 0.1, side, PANEL); }
        // lainepleki ribid paneelidel, needid servades, rõhtrihmad
        for (const s0 of [L * 0.255, L * 0.745]) {
          for (let k = -3; k <= 3; k++) pbox(b, s0 + k * 0.11, 0.74, 0.028, 1.28, 0.016, 0.055, side, PANEL);
          for (let k = -4; k <= 4; k++) { pbox(b, s0 + k * 0.095, 0.6, 0.018, 0.018, 0.012, 0.035, side, PANEL); pbox(b, s0 + k * 0.095, 2.1, 0.018, 0.018, 0.012, 0.035, side, PANEL); }
        }
        pbox(b, L / 2, 1.38, L, 0.07, 0.03, 0.035, side, TRIM, MAT.RUST);
        for (const sv of [0.03, L - 0.03]) pbox(b, sv, 0.34, 0.06, WH - 0.8, 0.05, 0, side, TRIM, MAT.RUST);
        // kaablikanal karniisi all + kinnitused
        pbox(b, L / 2, WH - 0.62, L, 0.07, 0.07, 0.03, side, [0.16, 0.16, 0.17]);
        for (const sv of [0.3, L / 2, L - 0.3]) pbox(b, sv, WH - 0.66, 0.06, 0.15, 0.12, 0, side, TRIM);
      };
      const sA_ext = () => ({ col3: [0.27, 0.28, 0.3] });
      // sisesein: liistud, vertikaalne vuuk, laevalgusriba
      const intDeco = (side) => {
        const b = B.main[q];
        pbox(b, L / 2, 0, L, 0.16, 0.025, 0, side, TRIM);
        pbox(SL, L / 2, 0.165, L * 0.96, 0.02, 0.015, 0.01, side, COOL, MAT.GLOW);
        pbox(b, L / 2, 0.2, 0.03, WH - 0.5, 0.012, 0, side, TRIM);
        pbox(b, L / 2, WH - 0.22, L, 0.12, 0.06, 0, side, TRIM);
        pbox(SL, L / 2, WH - 0.1, L * 0.96, 0.03, 0.03, 0.03, side, [1.0, 0.9, 0.76], MAT.GLOW);
        // paneelitud alumine osa, käsipuu, ülemised vuugid, torustik lae all
        const wc = side > 0 ? sA.col2 : sB.col2, wm = side > 0 ? sA.mat : sB.mat;
        for (const s0 of [L * 0.25, L * 0.75]) {
          pbox(b, s0, 0.24, L * 0.46, 0.72, 0.03, 0, side, wc, wm);
          pbox(b, s0, 0.32, L * 0.36, 0.56, 0.012, 0.03, side, TRIM);
        }
        pbox(b, L / 2, 1.0, L, 0.06, 0.05, 0, side, TRIM);
        for (const sv of [L * 0.25, L * 0.75]) pbox(b, sv, 1.1, 0.02, WH - 1.45, 0.01, 0, side, TRIM);
        pbox(b, L / 2, WH - 0.42, L, 0.06, 0.06, 0.05, side, [0.2, 0.2, 0.21]);
        pbox(b, L / 2, WH - 0.52, L, 0.04, 0.04, 0.06, side, [0.42, 0.3, 0.16]);
        for (const sv of [0.25, L / 2, L - 0.25]) pbox(b, sv, WH - 0.56, 0.05, 0.22, 0.13, 0, side, TRIM);
        if ((i * 3 + j * 5) % 4 === 0) { pbox(b, L * 0.75, 1.35, 0.22, 0.3, 0.06, 0, side, [0.24, 0.25, 0.26]); pbox(SL, L * 0.75 + 0.06, 1.55, 0.03, 0.03, 0.01, 0.06, side, [0.35, 1.0, 0.5], MAT.GLOW); }
      };
      if (op === 'garage') {
        const GH = 2.7;
        seg(0, L, GH, WH, false);
        const [mx, mz] = P(L / 2);
        B.main[q].color([0.16, 0.16, 0.17], MAT.RUST).boxB(mx, GH - 0.06, mz, t === 'v' ? WT + 0.26 : L, 0.32, t === 'v' ? L : WT + 0.26);
        for (const side of [1, -1]) if (side === extSide) { pbox(SL, L / 2, GH + 0.12, L * 0.92, 0.04, 0.02, 0.16, side, [1.0, 0.72, 0.2], MAT.GLOW); pbox(B.main[q], L / 2, 0.0, L, 0.03, 0.4, 0, side, [0.75, 0.6, 0.12]); }
        const [p0x, p0z] = P(0), [p3x, p3z] = P(L);
        addWallCol(p0x, p0z, p3x, p3z, GH, WH);
        const gcol = { t: 's', ax: p0x, az: p0z, bx: p3x, bz: p3z, r: 0.12, y0: OY, y1: OY + GH, kind: 'door', door: true, noRay: true, garage: true };
        colliders.push(gcol);
        gdoors.push({ x: mx, z: mz, t, L, GH, open: 0, col: gcol, m: M4.create() });
      } else if (op === 'door') {
        const W_ = wide.has(key), dw = W_ ? 1.7 : 1.4, sOff = (L - dw) / 2;
        seg(0, sOff, 0, WH, false); seg(L - sOff, L, 0, WH, false); seg(0, L, 2.3, WH, false);
        seg(0, sOff, 0, WH, true); seg(L - sOff, L, 0, WH, true);
        const b = B.main[q];
        const [fx0, fz0] = P(sOff), [fx1, fz1] = P(L - sOff), [mx, mz] = P(L / 2);
        // futuristlik raam: paksud piidad, kaldnurgad, helendav kontuur ja olekutuli
        const FR = [0.15, 0.155, 0.17], FR2 = [0.24, 0.25, 0.27];
        if (MODELS.obj.doorFrame && !W_) frames.push({ mesh: 'doorFrame', m: M4.compose(M4.create(), mx, OY, mz, yawW) });
        else {
          b.color(FR).boxB(fx0, 0, fz0, t === 'v' ? WT + 0.16 : 0.16, 2.42, t === 'v' ? 0.16 : WT + 0.16);
          b.color(FR).boxB(fx1, 0, fz1, t === 'v' ? WT + 0.16 : 0.16, 2.42, t === 'v' ? 0.16 : WT + 0.16);
          b.color(FR2).boxB(mx, 2.3, mz, t === 'v' ? WT + 0.18 : dw + 0.34, 0.24, t === 'v' ? dw + 0.34 : WT + 0.18);
        }
        for (const side of [1, -1]) {
          const ext = side === extSide, col = ext ? ACCENT : COOL;
          if (!ext && !(side > 0 ? rb : ra)) continue;
          if (!MODELS.obj.doorFrame || W_) { pbox(SL, sOff + 0.1, 0.1, 0.03, 2.0, 0.02, 0.09, side, col, MAT.GLOW); pbox(SL, L - sOff - 0.1, 0.1, 0.03, 2.0, 0.02, 0.09, side, col, MAT.GLOW); }
          pbox(SL, L / 2, 2.62, dw - 0.3, 0.03, 0.02, 0.09, side, col, MAT.GLOW);
          pbox(SL, L / 2, 0.035, dw - 0.2, 0.012, 0.15, -0.02, side, col, MAT.GLOW);
        }
        const [p0x, p0z] = P(0), [p1x, p1z] = P(sOff), [p2x, p2z] = P(L - sOff), [p3x, p3z] = P(L);
        addWallCol(p0x, p0z, p1x, p1z, 0, WH); addWallCol(p2x, p2z, p3x, p3z, 0, WH); addWallCol(p1x, p1z, p2x, p2z, 2.3, WH);
        const dcol = { t: 's', ax: p1x, az: p1z, bx: p2x, bz: p2z, r: 0.1, y0: OY, y1: OY + 2.3, kind: 'door', door: true, noRay: true };
        colliders.push(dcol);
        const ext = extSide;
        doors.push({ x: mx, z: mz, t, ux, uz, k: dw / 1.4, open: 0, col: dcol, m1: M4.create(), m2: M4.create(), ext, nx: nx * extSide, nz: nz * extSide, lm: M4.create() });
      } else if (op === 'window') {
        const W_ = wide.has(key), ww = W_ ? 1.7 : 1.5, sOff = (L - ww) / 2, y0w = W_ ? 0.6 : 1.0, y1w = W_ ? 2.45 : 2.0;
        seg(0, L, 0, y0w, false); seg(0, L, y1w, WH, false); seg(0, sOff, y0w, y1w, false); seg(L - sOff, L, y0w, y1w, false);
        seg(0, L, 0, Math.min(LOW_H, y0w), true);
        const [mx, mz] = P(L / 2);
        G.color([0.42, 0.62, 0.70]).boxB(mx, y0w, mz, t === 'v' ? 0.04 : ww, y1w - y0w, t === 'v' ? ww : 0.04);
        const b = B.main[q];
        const FR = [0.15, 0.155, 0.17];
        if (MODELS.obj.windowFrame && !W_) frames.push({ mesh: 'windowFrame', m: M4.compose(M4.create(), mx, OY, mz, yawW + (extSide < 0 ? Math.PI : 0)) });
        else {
          b.color(FR).boxB(mx, y0w - 0.07, mz, t === 'v' ? WT + 0.2 : ww + 0.16, 0.09, t === 'v' ? ww + 0.16 : WT + 0.2);
          b.color(FR).boxB(mx, y1w - 0.02, mz, t === 'v' ? WT + 0.14 : ww + 0.16, 0.08, t === 'v' ? ww + 0.16 : WT + 0.14);
          b.color(FR).boxB(mx, (y0w + y1w) / 2 - 0.03, mz, t === 'v' ? WT + 0.04 : ww, 0.03, t === 'v' ? ww : WT + 0.04);
          if (W_) for (const s_ of [sOff, L - sOff]) { const [jx, jz] = P(s_); b.color(FR).boxB(jx, y0w, jz, t === 'v' ? WT + 0.12 : 0.08, y1w - y0w, t === 'v' ? 0.08 : WT + 0.12); }
        }
        for (const side of [1, -1]) {
          const ext = side === extSide;
          if (!ext && !(side > 0 ? rb : ra)) continue;
          pbox(SL, L / 2, y0w, ww - 0.2, 0.025, 0.03, 0.08, side, ext ? ACCENT : [1.0, 0.9, 0.76], MAT.GLOW);
        }
        const [p0x, p0z] = P(0), [p3x, p3z] = P(L), [p1x, p1z] = P(sOff), [p2x, p2z] = P(L - sOff);
        addWallCol(p0x, p0z, p3x, p3z, 0, y0w); addWallCol(p0x, p0z, p3x, p3z, y1w, WH);
        addWallCol(p0x, p0z, p1x, p1z, y0w, y1w); addWallCol(p2x, p2z, p3x, p3z, y0w, y1w);
        addWallCol(p1x, p1z, p2x, p2z, y0w, y1w, { noRay: true, glass: true });
      } else {
        seg(0, L, 0, WH, false); seg(0, L, 0, WH, true);
        if (extSide) extDeco(extSide);
        if (rb) intDeco(1);
        if (ra) intDeco(-1);
        // seinavalgustid: toa poolel igal teisel seinalõigul, väljas igal neljandal
        if (rb && (i + j) % 2 === 1) sconce(1, false);
        if (ra && (i + j) % 2 === 1) sconce(-1, false);
        if (extSide && (i + j) % 4 === 1) sconce(extSide, true);
        const [p0x, p0z] = P(0), [p3x, p3z] = P(L);
        addWallCol(p0x, p0z, p3x, p3z, 0, WH);
      }
    }
    // ---------- teise korruse toad: põrand (v.a kustutatud vahelagi), üleulatuva osa alumine pind, lagi ja katus ----------
    const upPillars = new Set();
    for (const ur of upRooms.values()) {
      const st = ROOM_STYLES[ur.style] || ROOM_STYLES[1];
      for (const [i, j] of ur.cells) {
        const c = cellCenter(i, j), col = (i + j) % 2 ? st.floor : st.floor2;
        const x0 = c.x - CS / 2, x1 = c.x + CS / 2, z0 = c.z - CS / 2, z1 = c.z + CS / 2, RY = WH * 2;
        const vd = voidAt(i, j), hole = holeAt(i, j), over = !roomAt(i, j);
        if (!vd && !hole) {
          if (sdf) IL.upFloor[0].push([c.x, OY + WH, c.z, ((i * 5 + j * 3) % 4) * Math.PI / 2, col.map((v) => v / 0.78)]);
          else B.up[0].color(col, MAT.WORN).boxB(c.x, WH - 0.05, c.z, CS, FLOOR_Y + 0.05, CS);
        }
        if (over) {   // üleulatuv osa: alt nähtav plaat + äär
          B.main[0].color([0.22, 0.22, 0.23], MAT.RUST).boxB(c.x, WH - 0.24, c.z, CS + 0.02, 0.22, CS + 0.02);
          B.main[0].color(st.ceil).quad([x0, WH - 0.25, z0], [x1, WH - 0.25, z0], [x1, WH - 0.25, z1], [x0, WH - 0.25, z1]);
          // tugipost, kui ulatub üle 2 ruudu
          if (lowDistAt(i, j) >= OVERHANG) for (const [vi, vj] of [[i, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]]) {
            const around = [[vi - 1, vj - 1], [vi, vj - 1], [vi - 1, vj], [vi, vj]].filter(([a, b]) => hiAt(a, b)).length;
            if (around === 4) continue;                              // keskel, mitte ääres
            if (around !== 1 && (vi + vj) % 2) continue;              // äärtel iga teine, nurkades alati
            upPillars.add(vi + ':' + vj);
          }
        }
        B.roof[0].color(st.ceil).quad([x0, RY - 0.01, z0], [x1, RY - 0.01, z0], [x1, RY - 0.01, z1], [x0, RY - 0.01, z1]);
        if (sdf) IL.roof[0].push([c.x, OY + RY, c.z, 0, EXT2.map((v) => v / 0.62)]);
        else B.roof[0].color(EXT2, MAT.RUST).boxB(c.x, RY, c.z, CS + 0.02, 0.16, CS + 0.02);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (!hiAt(i + di, j + dj)) {
            if (sdf) IL.edge[0].push([c.x + di * (CS / 2 + 0.07), OY + RY, c.z + dj * (CS / 2 + 0.07), di ? Math.PI / 2 : 0, EXT.map((v) => v / 0.72)]);
            else B.roof[0].color(EXT, MAT.RUST).boxB(c.x + di * (CS / 2 + 0.07), RY + 0.16, c.z + dj * (CS / 2 + 0.07), di ? 0.14 : CS + 0.28, 0.22, dj ? 0.14 : CS + 0.28);
          }
          // rõduäär: põrand -> kustutatud vahelagi (seina pole)
          const ni = i + di, nj = j + dj;
          if (!vd && !hole && voidAt(ni, nj) && upRoomAt(ni, nj) && !upWalls.has(ekey(...edgeOf(i, j, di, dj)))) {
            const ex = c.x + di * CS / 2, ez = c.z + dj * CS / 2, ax = ex - (dj ? CS / 2 : 0), az = ez - (di ? CS / 2 : 0), bx = ex + (dj ? CS / 2 : 0), bz = ez + (di ? CS / 2 : 0);
            const bu = B.up[0];
            bu.color([0.2, 0.2, 0.21], MAT.RUST).boxB(ex, WH + FLOOR_Y + 0.98, ez, dj ? CS : 0.07, 0.07, di ? CS : 0.07);
            bu.color([0.2, 0.2, 0.21], MAT.RUST).boxB(ex, WH + FLOOR_Y + 0.45, ez, dj ? CS : 0.04, 0.04, di ? CS : 0.04);
            for (let k = 0; k <= 4; k++) bu.color([0.24, 0.24, 0.25]).boxB(ax + (bx - ax) * k / 4, WH + FLOOR_Y, az + (bz - az) * k / 4, 0.05, 1.0, 0.05);
            bu.color([0.16, 0.16, 0.17]).boxB(ex, WH - 0.2, ez, dj ? CS : 0.1, 0.3, di ? CS : 0.1);   // põranda serv
            colliders.push({ t: 's', ax, az, bx, bz, r: 0.08, y0: OY + WH, y1: OY + WH + 1.15, kind: 'wall', noRay: true });
          }
        }
      }
    }
    for (const k of upPillars) {
      const [vi, vj] = k.split(':').map(Number), x = X0 + vi * CS, z = Z0 + vj * CS;
      B.main[0].color(POST, MAT.WORN).boxB(x, -1.2, z, 0.34, WH + 1.0, 0.34);
      B.main[0].color([0.08, 0.08, 0.09]).boxB(x, -0.05, z, 0.5, 0.2, 0.5);
      B.low[0].color(POST, MAT.WORN).boxB(x, 0, z, 0.34, LOW_H, 0.34);
      colliders.push({ t: 'c', x, z, r: 0.24, y0: OY - 1, y1: OY + WH, kind: 'wall' });
    }
    // ---------- teise korruse seinad ----------
    const upPosts = new Set();
    for (const key of upWalls) {
      const [t, si, sj] = key.split(':'); const i = +si, j = +sj;
      const [[ai, aj], [bi, bj]] = edgeCells(t, i, j);
      const uA = hiAt(ai, aj), uB = hiAt(bi, bj);   // seinad joonistatakse ka siis, kui tuba pole veel kinni
      const [ra, rb] = edgeRooms(t, i, j);
      const q = Math.max(rustQ(ra), rustQ(rb));
      let ax, az, bx, bz, nx, nz;
      if (t === 'v') { ax = X0 + i * CS; bx = ax; az = Z0 + j * CS; bz = az + CS; nx = 1; nz = 0; }
      else { az = Z0 + j * CS; bz = az; ax = X0 + i * CS; bx = ax + CS; nx = 0; nz = 1; }
      upPosts.add(i + ':' + j); upPosts.add(t === 'v' ? i + ':' + (j + 1) : (i + 1) + ':' + j);
      const upStyle = (u) => { const r = upRooms.get(u); const st = ROOM_STYLES[(r && r.style) || 1] || ROOM_STYLES[1]; return { col: st.wall, col2: st.wall2, mat: MAT.WORN }; };
      const sA = uB ? upStyle(upRoomAt(bi, bj)) : sideStyle(0), sB = uA ? upStyle(upRoomAt(ai, aj)) : sideStyle(0);
      const lowerOp = openings.get(key);
      const op = upOpening(t, i, j);
      const L = CS, ux = (bx - ax) / L, uz = (bz - az) / L;
      const P = (s_) => [ax + ux * s_, az + uz * s_];
      const useg = (s0, s1, y0, y1) => {
        const [x0, z0] = P(s0), [x1, z1] = P(s1);
        for (const low of [false, true]) {
          const bands = [[y0, Math.min(y1, 0.3), true], [Math.max(y0, 0.3), Math.min(y1, WH - 0.25), false], [Math.max(y0, WH - 0.25), y1, true]];
          for (const [b0, b1, dark] of bands) {
            const top = low ? Math.min(b1, LOW_H) : b1; if (top <= b0) continue;
            const bld = low ? B.upLow[q] : B.up[q];
            wallFace(bld, x0, z0, x1, z1, nx, nz, WH + b0, WH + top, dark ? sA.col2 : sA.col, sA.mat);
            wallFace(bld, x0, z0, x1, z1, -nx, -nz, WH + b0, WH + top, dark ? sB.col2 : sB.col, sB.mat);
            if (top === (low ? Math.min(y1, LOW_H) : y1)) { const ox = nx * WT / 2, oz = nz * WT / 2; bld.color(POST).quad([x0 - ox, WH + top, z0 - oz], [x1 - ox, WH + top, z1 - oz], [x1 + ox, WH + top, z1 + oz], [x0 + ox, WH + top, z0 + oz]); }
          }
        }
      };
      const uW = upWide.has(t + ':' + i + ':' + j);
      if (op === 'door') {
        const dw = uW ? 1.7 : 1.4, sOff = (L - dw) / 2;
        useg(0, sOff, 0, WH); useg(L - sOff, L, 0, WH); useg(sOff, L - sOff, 2.3, WH);
        const [p0x, p0z] = P(0), [p1x, p1z] = P(sOff), [p2x, p2z] = P(L - sOff), [p3x, p3z] = P(L);
        addWallCol(p0x, p0z, p1x, p1z, WH, WH * 2); addWallCol(p2x, p2z, p3x, p3z, WH, WH * 2); addWallCol(p1x, p1z, p2x, p2z, WH + 2.3, WH * 2);
      } else if (op === 'window') {
        const ww = uW ? 1.7 : 1.5, sOff = (L - ww) / 2, a0 = uW ? 0.6 : 1.0, a1 = uW ? 2.45 : 2.0;
        useg(0, L, 0, a0); useg(0, L, a1, WH); useg(0, sOff, a0, a1); useg(L - sOff, L, a0, a1);
        const [mx, mz] = P(L / 2);
        G.color([0.42, 0.62, 0.70]).boxB(mx, WH + a0, mz, t === 'v' ? 0.04 : ww, a1 - a0, t === 'v' ? ww : 0.04);
        B.up[q].color([0.15, 0.155, 0.17]).boxB(mx, WH + a0 - 0.07, mz, t === 'v' ? WT + 0.2 : ww + 0.16, 0.09, t === 'v' ? ww + 0.16 : WT + 0.2);
        B.up[q].color([0.15, 0.155, 0.17]).boxB(mx, WH + a1 - 0.02, mz, t === 'v' ? WT + 0.14 : ww + 0.16, 0.08, t === 'v' ? ww + 0.16 : WT + 0.14);
        const [p0x, p0z] = P(0), [p3x, p3z] = P(L), [p1x, p1z] = P(sOff), [p2x, p2z] = P(L - sOff);
        addWallCol(p0x, p0z, p3x, p3z, WH, WH + a0); addWallCol(p0x, p0z, p3x, p3z, WH + a1, WH * 2);
        addWallCol(p0x, p0z, p1x, p1z, WH + a0, WH + a1); addWallCol(p2x, p2z, p3x, p3z, WH + a0, WH + a1);
        addWallCol(p1x, p1z, p2x, p2z, WH + a0, WH + a1, { noRay: true, glass: true });
      } else {
        useg(0, L, 0, WH);
        const [p0x, p0z] = P(0), [p3x, p3z] = P(L);
        addWallCol(p0x, p0z, p3x, p3z, WH, WH * 2);
        // seinavalgusti teisel korrusel
        for (const [side, ok, rid] of [[1, uB, rb], [-1, uA, ra]]) {
          if (!ok || (i + j) % 2 !== 1) continue;
          const [mx, mz] = P(L / 2), o = WT / 2;
          SL.color([1.0, 0.86, 0.66], MAT.GLOW).boxB(mx + nx * side * (o + 0.1), WH + 2.07, mz + nz * side * (o + 0.1), t === 'v' ? 0.1 : 0.24, 0.14, t === 'v' ? 0.24 : 0.1);
          sconces.push({ x: mx + nx * side * (o + 0.5), y: OY + WH + 1.85, z: mz + nz * side * (o + 0.5), ext: false, rid });
        }
      }
    }
    for (const k of upPosts) {
      const [i, j] = k.split(':').map(Number);
      const x = X0 + i * CS, z = Z0 + j * CS;
      if (sdf) IL.upPost[0].push([x, OY + WH, z, ((i + j) % 4) * Math.PI / 2, [1, 1, 1]]);
      else B.up[0].color(POST, MAT.WORN).cyl(x, WH, z, 0.15, 0.15, WH + 0.05, 8, true, Math.PI / 8);
      B.upLow[0].color(POST, MAT.WORN).boxB(x, WH, z, 0.3, LOW_H + 0.02, 0.3);
    }
    const isG = (t, i, j) => openings.get(ekey(t, i, j)) === 'garage';
    for (const k of posts) {
      const [i, j] = k.split(':').map(Number);
      if ((isG('h', i - 1, j) && isG('h', i, j)) || (isG('v', i, j - 1) && isG('v', i, j))) continue;   // garaažiukse keskel posti pole
      const x = X0 + i * CS, z = Z0 + j * CS;
      const q = Math.max(rustQ(roomAt(i - 1, j - 1)), rustQ(roomAt(i, j - 1)), rustQ(roomAt(i - 1, j)), rustQ(roomAt(i, j)));
      if (sdf) IL.post[q].push([x, OY, z, ((i + j) % 4) * Math.PI / 2, [1, 1, 1]]);
      else {
        B.main[q].color(POST, q ? MAT.RUST : MAT.WORN).cyl(x, 0, z, 0.15, 0.15, WH + 0.05, 8, true, Math.PI / 8);
        B.main[q].color([0.08, 0.08, 0.09]).cyl(x, 0, z, 0.18, 0.18, 0.26, 8, true, Math.PI / 8);
        B.main[q].color([0.08, 0.08, 0.09]).cyl(x, WH - 0.26, z, 0.17, 0.17, 0.26, 8, true, Math.PI / 8);
      }
      B.low[q].color(POST, q ? MAT.RUST : MAT.WORN).boxB(x, 0, z, 0.3, LOW_H + 0.02, 0.3);
    }
    for (const o of objs.values()) {
      const d = OBJ[o.type];
      const x0 = X0 + o.i * CS, z0 = Z0 + o.j * CS;
      const sh = o.type === 'barrikaad' ? 0.1 : 0.22;
      const ly = o.lv ? WH : 0;
      const c = { t: 'b', x0: x0 + sh, z0: z0 + sh, x1: x0 + o.w * CS - sh, z1: z0 + o.h * CS - sh, y0: OY + ly, y1: OY + ly + d.h + (o.lv ? FLOOR_Y : 0), kind: 'obj', obj: o };
      if (d.garage) continue;   // tõstuki peale saab sõita – kokkupõrget pole
      if (o.type === 'sisetrepp') {   // astmed + käsipuud; teisel korrusel piire ümber trepiava (kõrge ots lahti)
        const q = rustQ(roomAt(o.i, o.j)), cc = objCenter(o), yw = objYaw(o), n = 12, run = (2 * CS) / n;
        for (const b of [B.main[q], B.low[q]]) {
        b.push().tf(cc.x, 0, cc.z, yw);
        for (let k = 0; k < n; k++) b.color(k % 2 ? [0.3, 0.3, 0.31] : [0.26, 0.26, 0.27], MAT.WORN).boxB(0, FLOOR_Y, CS - (k + 0.5) * run, 1.6, (k + 1) / n * WH, run + 0.01);
        for (const sx of [-0.86, 0.86]) {
          b.color([0.16, 0.16, 0.17], MAT.RUST).boxB(sx, FLOOR_Y, 0, 0.08, 0.2, 2 * CS);
          for (let k = 0; k <= 4; k++) b.color([0.2, 0.2, 0.21]).boxB(sx, FLOOR_Y + k / 4 * WH + 0.05, CS - k / 4 * 2 * CS, 0.05, 0.95, 0.05);
        }
        b.pop();
        }
        // teise korruse piire: pikad küljed + madala otsa kohal
        const bu = B.up[q], [di, dj] = stairDir(o);
        const hx0 = X0 + o.i * CS, hz0 = Z0 + o.j * CS, hx1 = hx0 + o.w * CS, hz1 = hz0 + o.h * CS;
        const rails = [];
        if (di === 0) { rails.push([hx0, hz0, hx0, hz1], [hx1, hz0, hx1, hz1]); rails.push(dj > 0 ? [hx0, hz1, hx1, hz1] : [hx0, hz0, hx1, hz0]); }
        else { rails.push([hx0, hz0, hx1, hz0], [hx0, hz1, hx1, hz1]); rails.push(di > 0 ? [hx1, hz0, hx1, hz1] : [hx0, hz0, hx0, hz1]); }
        for (const [rx0, rz0, rx1, rz1] of rails) {
          const mx = (rx0 + rx1) / 2, mz = (rz0 + rz1) / 2, lx = Math.abs(rx1 - rx0), lz = Math.abs(rz1 - rz0);
          bu.color([0.2, 0.2, 0.21], MAT.RUST).boxB(mx, WH + FLOOR_Y + 0.95, mz, Math.max(lx, 0.06), 0.06, Math.max(lz, 0.06));
          for (let k = 0; k <= 4; k++) bu.color([0.22, 0.22, 0.23]).boxB(rx0 + (rx1 - rx0) * k / 4, WH + FLOOR_Y, rz0 + (rz1 - rz0) * k / 4, 0.05, 0.95, 0.05);
          colliders.push({ t: 's', ax: rx0, az: rz0, bx: rx1, bz: rz1, r: 0.08, y0: OY + WH, y1: OY + WH + 1.1, kind: 'wall', noRay: true });
        }
        continue;
      }
      if (o.type === 'paike' || o.type === 'prozektor' || o.type === 'radar') { const cc = objCenter(o); Object.assign(c, { x0: cc.x - 0.45, x1: cc.x + 0.45, z0: cc.z - 0.45, z1: cc.z + 0.45 }); }
      if (o.type === 'okas' || o.type === 'trepp') continue;
      if (o.type === 'myyr' || o.type === 'myyrturel' || d.gate || o.type === 'vallikaik') { c.x0 = x0 + 0.02; c.z0 = z0 + 0.02; c.x1 = x0 + o.w * CS - 0.02; c.z1 = z0 + o.h * CS - 0.02; }
      if (d.gate) { c.door = false; o.col = c; c.off = !!o.open && o.open > 0.6; }
      colliders.push(c);
    }
    for (const c of colliders) World.addCol(c);
    for (const k of ['main', 'low', 'roof', 'up', 'upLow']) for (let q = 0; q < 2; q++) meshes[k][q] = B[k][q].p.length ? B[k][q].build() : null;
    meshes.glass = G.p.length ? G.build() : null;
    meshes.strips = SL.p.length ? SL.build() : null;
    if (sdf) for (let q = 0; q < 2; q++) {
      const rust = q === 1 ? 1.25 : 0.32;
      makeInst(IL.floor[q], O.floorTile, rust, false); makeInst(IL.roof[q], O.roofTile, rust, true);
      makeInst(IL.edge[q], O.roofEdge, rust, true); makeInst(IL.post[q], O.wallPost, rust, true);
      makeInst(IL.upFloor[q], O.floorTile, rust, false, true); makeInst(IL.upPost[q], O.wallPost, rust, true, true);
    }
    for (const o of objs.values()) updateObjMatrix(o);
  }

  // ---------- teekonnaotsing ----------
  const PASS = { varav: 1, varav3: 1, suurvarav: 1, trepp: 1, okas: 1, sisetrepp: 1, tostuk: 1 };
  // sõidukirežiim: inimuksed ei sobi, läbitav ainult väravad ja garaaž
  const VPASS = { varav: 1, varav3: 1, suurvarav: 1, tostuk: 1 };
  let vehMode = false;
  function walkable(i, j) { if (!inGrid(i, j)) return false; const id = objAt(i, j); if (!id) return true; const o = objs.get(id); return !!(o && (vehMode ? VPASS : PASS)[o.type]); }
  function vehiclePath(ax, az, bx, bz) { vehMode = true; try { return pathWorld(ax, az, bx, bz); } finally { vehMode = false; } }
  function canStep(i, j, di, dj) {
    if (!inGrid(i + di, j + dj)) return false;
    if (di && dj) {
      const es = [edgeOf(i, j, di, 0), edgeOf(i, j, 0, dj), edgeOf(i + di, j, 0, dj), edgeOf(i, j + dj, di, 0)];
      for (const [t, a, b] of es) if (isWall(t, a, b)) return false;
      return true;
    }
    if (vehMode) { const [t, a, b] = edgeOf(i, j, di, dj); if (edgeType(t, a, b) === 'door') return false; }
    return !edgeBlocked(i, j, di, dj);
  }
  function doorCenter(t, ei, ej) { return t === 'v' ? { x: X0 + ei * CS, z: Z0 + (ej + 0.5) * CS } : { x: X0 + (ei + 0.5) * CS, z: Z0 + ej * CS }; }
  const gScore = new Float32Array(N * N), came = new Int32Array(N * N), closed = new Uint8Array(N * N);
  function findPath(si, sj, goals) {
    si = clamp(si, 0, N - 1); sj = clamp(sj, 0, N - 1);
    const goalSet = new Set(goals.map((g) => clamp(g[1], 0, N - 1) * N + clamp(g[0], 0, N - 1)));
    if (!goalSet.size) return null;
    const start = sj * N + si;
    if (goalSet.has(start)) return [[si, sj]];
    gScore.fill(1e9); came.fill(-1); closed.fill(0);
    const gl = [...goalSet].map((k) => [k % N, Math.floor(k / N)]);
    const hfn = (i, j) => { let m = 1e9; for (const g of gl) { const d = Math.max(Math.abs(g[0] - i), Math.abs(g[1] - j)) + 0.41 * Math.min(Math.abs(g[0] - i), Math.abs(g[1] - j)); if (d < m) m = d; } return m; };
    const open = [start]; gScore[start] = 0;
    const fScore = new Map(); fScore.set(start, hfn(si, sj));
    let iter = 0;
    while (open.length && iter++ < 5000) {
      let bi = 0, bf = 1e9;
      for (let k = 0; k < open.length; k++) { const f = fScore.get(open[k]); if (f < bf) { bf = f; bi = k; } }
      const cur = open[bi]; open.splice(bi, 1);
      if (goalSet.has(cur)) { const path = []; let c = cur; while (c !== -1) { path.push([c % N, Math.floor(c / N)]); c = came[c]; } return path.reverse(); }
      closed[cur] = 1;
      const ci = cur % N, cj = Math.floor(cur / N);
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (!di && !dj) continue;
        const ni = ci + di, nj = cj + dj; if (!inGrid(ni, nj)) continue;
        const nk = nj * N + ni;
        if (closed[nk]) continue;
        if (!walkable(ni, nj) && !goalSet.has(nk)) continue;
        if (!canStep(ci, cj, di, dj)) continue;
        if (di && dj && (!walkable(ci + di, cj) || !walkable(ci, cj + dj))) continue;
        const g = gScore[cur] + (di && dj ? 1.414 : 1);
        if (g < gScore[nk]) { gScore[nk] = g; came[nk] = cur; fScore.set(nk, g + hfn(ni, nj)); if (!open.includes(nk)) open.push(nk); }
      }
    }
    return null;
  }
  // sõidukile: ka 1 m kõrval paralleelsed jooned peavad olema vabad (ei lõika nurki)
  function lineOK(ax, az, bx, bz) {
    if (!straightOK(ax, az, bx, bz)) return false;
    if (!vehMode) return true;
    const L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L * 1.0, nz = (bx - ax) / L * 1.0;
    return straightOK(ax + nx, az + nz, bx + nx, bz + nz) && straightOK(ax - nx, az - nz, bx - nx, bz - nz);
  }
  function straightOK(ax, az, bx, bz) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 0.3));
    let pc = toCell(ax, az), px = ax, pz = az;
    for (let k = 1; k <= n; k++) {
      const t = k / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      const c = toCell(x, z);
      if (c.i !== pc.i || c.j !== pc.j) {
        if (inGrid(pc.i, pc.j) && inGrid(c.i, c.j)) {
          const di = Math.sign(c.i - pc.i), dj = Math.sign(c.j - pc.j);
          if (Math.abs(c.i - pc.i) > 1 || Math.abs(c.j - pc.j) > 1) return false;
          if (!canStep(pc.i, pc.j, di, dj)) return false;
          if (!walkable(c.i, c.j)) return false;
          if (!(di && dj)) {
            const [et, ei, ej] = edgeOf(pc.i, pc.j, di, dj);
            if (edgeType(et, ei, ej) === 'door') {
              const dc = doorCenter(et, ei, ej);
              if (et === 'v') { const tt = (dc.x - px) / ((x - px) || 1e-6); if (Math.abs(pz + (z - pz) * tt - dc.z) > 0.28) return false; }
              else { const tt = (dc.z - pz) / ((z - pz) || 1e-6); if (Math.abs(px + (x - px) * tt - dc.x) > 0.28) return false; }
            }
          }
        } else if (inGrid(c.i, c.j) && !walkable(c.i, c.j)) return false;
        pc = c;
      }
      px = x; pz = z;
    }
    return true;
  }
  function pathWorld(ax, az, bx, bz, goalsCells) {
    const sc = toCell(ax, az), bc = toCell(bx, bz);
    const inA = inGrid(sc.i, sc.j), inB = inGrid(bc.i, bc.j);
    if (!inA && !inB && !goalsCells) return [{ x: bx, z: bz }];
    const si = clamp(sc.i, 0, N - 1), sj = clamp(sc.j, 0, N - 1);
    const goals = goalsCells || [[clamp(bc.i, 0, N - 1), clamp(bc.j, 0, N - 1)]];
    const cellsPath = findPath(si, sj, goals);
    if (!cellsPath) return null;
    const pts = [];
    if (!inA) pts.push(cellCenter(si, sj));
    for (let k = 0; k < cellsPath.length; k++) {
      const [i, j] = cellsPath[k];
      if (k > 0) {
        const [pi, pj] = cellsPath[k - 1], di = i - pi, dj = j - pj;
        if (Math.abs(di) + Math.abs(dj) === 1) {
          const [et, ei, ej] = edgeOf(pi, pj, di, dj);
          if (edgeType(et, ei, ej) === 'door') { const dc = doorCenter(et, ei, ej); pts.push({ x: dc.x - di * 0.7, z: dc.z - dj * 0.7, door: true }); pts.push({ x: dc.x + di * 0.7, z: dc.z + dj * 0.7, door: true }); }
        }
      }
      pts.push(cellCenter(i, j));
    }
    if (!goalsCells) pts.push({ x: bx, z: bz });
    const out = [{ x: ax, z: az }];
    let k = 0;
    while (k < pts.length) {
      let far = k, lim = pts.length - 1;
      for (let q = k; q < pts.length; q++) if (pts[q].door) { lim = q; break; }
      for (let m = lim; m > k; m--) if (lineOK(out[out.length - 1].x, out[out.length - 1].z, pts[m].x, pts[m].z)) { far = m; break; }
      out.push(pts[far]); k = far + 1;
    }
    out.shift();
    return out;
  }

  // ---------- uuendus ja joonistus ----------
  const OFF_T = [0.25, 0.22, 0.2, 0], ON_T = [1, 1, 1, 0], DMG_T = [1, 0.55, 0.45, 0];
  function update(dt, humans) {
    if (dirty) rebuild();
    for (const d of doors) {
      let near = false;
      for (const h of humans) if (h.alive !== false && Math.abs(h.pos.x - d.x) < 2.4 && Math.abs(h.pos.z - d.z) < 2.4 && Math.abs(h.pos.y - OY) < 3) { near = true; break; }
      const prev = d.open;
      d.open = clamp(d.open + (near ? dt * 3.5 : -dt * 2.2), 0, 1);
      if (prev < 0.05 && d.open >= 0.05 && typeof Audio2 !== 'undefined') Audio2.door(d.x, d.z);
    }
    for (const d of gdoors) {
      let near = false;
      for (const h of humans) if (h.alive !== false && (h.kind === 'player' || h.team === 'crew' || h.team === 'player') && Math.hypot(h.pos.x - d.x, h.pos.z - d.z) < 5 && Math.abs(h.pos.y - OY) < 4) { near = true; break; }
      if (!near && typeof Vehicles !== 'undefined') near = Vehicles.near(d.x, d.z, 7.5);
      const prev = d.open;
      d.open = clamp(d.open + (near ? dt * 0.9 : -dt * 0.6), 0, 1);
      d.col.off = d.open > 0.75;
      if ((prev < 0.02 && d.open >= 0.02) || (prev > 0.98 && d.open <= 0.98)) Audio2.door(d.x, d.z);
    }
    for (const o of objs.values()) {
      o.anim += dt; if (o.cool > 0) o.cool -= dt;
      if (OBJ[o.type].gate) {
        let near = false;
        const locked = typeof Waves !== 'undefined' && Waves.active() || !o.on, R = 2.5 + o.w * CS * 0.5;
        if (!locked) for (const h of humans) if (h.alive !== false && (h.kind === 'player' || h.team === 'crew') && Math.abs(h.pos.x - o.cx) < R && Math.abs(h.pos.z - o.cz) < R) { near = true; break; }
        if (!near && !locked && typeof Vehicles !== 'undefined') { const v = Vehicles.near(o.cx, o.cz, R + 5); if (v && v.team === 'crew') near = true; }
        const prev = o.open || 0;
        o.open = clamp(prev + (near ? dt * 1.6 : -dt * 1.2), 0, 1);
        if (o.col) o.col.off = o.open > 0.6;
        if ((prev < 0.05 && o.open >= 0.05) || (prev > 0.95 && o.open <= 0.95)) Audio2.door(o.cx, o.cz);
      }
    }
  }
  const tmpLm = M4.create();
  function draw(buildMode, isNight, time) {
    if (dirty) rebuild();
    const low = buildMode;
    const cam = GFX.cam.pos;
    if (Math.hypot(cam.x - OX, cam.z - OZ) > 700) return;
    // ehitusrežiim: 1. korrus = madalad seinad, teine korrus peidus; 2. korrus = alumised seinad täies kõrguses + ülemise korruse madalad seinad
    const lv1 = low && viewLevel === 1;
    for (const st of inst) st.want = st.upper ? (st.roofOnly ? !low : !low || lv1) : !(low && st.roofOnly);
    for (let q = 0; q < 2; q++) {
      const rust = q === 1 ? 1.25 : 0.32;
      const mm = low && !lv1 ? meshes.low[q] : meshes.main[q];
      if (mm) GFX.draw(mm, baseM, null, null, { rust });
      const um = low ? (lv1 ? meshes.upLow[q] : null) : meshes.up[q];
      if (um) GFX.draw(um, baseM, null, null, { rust });
      if (!low && meshes.roof[q]) GFX.draw(meshes.roof[q], baseM, null, null, { rust });
    }
    const lit = power.lightsOn;
    if (meshes.strips && !low) {
      const pulse = 0.85 + 0.15 * Math.sin(time * 2.2);
      GFX.draw(meshes.strips, baseM, lit ? [pulse, pulse, pulse, 0.35] : [0.18, 0.15, 0.13, 0], null, { shadow: false });
    }
    if (meshes.glass && !low) GFX.draw(meshes.glass, baseM, [1, 1, 1, 0], lit && isNight ? [0.5, 0.35, 0.18] : [0, 0, 0], { alpha: 0.42, cull: false });
    if (!low) for (const f of frames) GFX.draw(MODELS.obj[f.mesh], f.m, f.t || null, null, { rust: 0.4 });
    if (!low) for (const d of doors) {
      const dk = d.k || 1, off = (0.36 + d.open * 0.62) * dk, yaw = d.t === 'v' ? Math.PI / 2 : 0;
      M4.compose(d.m1, d.x - d.ux * off, OY + 0.08, d.z - d.uz * off, yaw, 0, 0, dk, 1, 1);
      M4.compose(d.m2, d.x + d.ux * off, OY + 0.08, d.z + d.uz * off, yaw, 0, 0, dk, 1, 1);
      GFX.draw(MODELS.obj.doorPanel, d.m1, null, null, { rust: 0.5 });
      GFX.draw(MODELS.obj.doorPanel, d.m2, null, null, { rust: 0.5 });
      if (d.ext) {
        M4.compose(d.lm, d.x + d.nx * 0.22, OY + 2.62, d.z + d.nz * 0.22, Math.atan2(d.nx, d.nz));
        GFX.draw(MODELS.obj.doorLamp, d.lm, lit ? ON_T : OFF_T, null, { shadow: false });
        if (lit && isNight) GFX.addLight(d.x + d.nx * 1.6, OY + 2.4, d.z + d.nz * 1.6, 9, 1.0, 0.78, 0.5, 1.4);
      }
    }
    if (!low && gdoors.length) {
      if (!gPanel) {   // lainepleki rullukse paneel (1 x 1, skaleeritakse)
        const b = new MB(); b.jit = 0;
        b.color([0.5, 0.48, 0.44], MAT.RUST).box(0, 0.5, 0, 1, 1, 0.06);
        for (let k = 0; k < 12; k++) b.color(k % 2 ? [0.42, 0.4, 0.37] : [0.56, 0.54, 0.5], MAT.RUST).box(0, (k + 0.5) / 12, 0, 1.0, 0.035, 0.09);
        b.color([0.85, 0.65, 0.1], MAT.WORN).box(0, 0.03, 0, 1.0, 0.06, 0.1);
        gPanel = b.build();
      }
      for (const d of gdoors) {
        const h = d.GH * (1 - d.open * 0.92);
        M4.compose(d.m, d.x, OY + d.GH - h, d.z, d.t === 'v' ? Math.PI / 2 : 0, 0, 0, d.L, h, 1);
        GFX.draw(gPanel, d.m, null, null, { rust: 0.6 });
      }
    }
    // seinavalgustite valgus (lähimad valitakse renderdajas)
    if (lit) {
      // ainult lähimad seinavalgustid saavad päris valguse (muidu sulab tuba valgeks)
      const near = [];
      for (const s of sconces) {
        if (s.ext && !isNight) continue;
        const d = Math.hypot(s.x - cam.x, s.z - cam.z);
        if (d < 40) near.push([d, s]);
      }
      near.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < Math.min(5, near.length); k++) { const s = near[k][1]; GFX.addLight(s.x, s.y, s.z, s.ext ? 7 : 3.8, 1.0, 0.78, 0.5, s.ext ? 1.0 : 0.6); }
    }
    for (const r of rooms.values()) {
      if (!r._lm) r._lm = [];
      r.lamps.forEach(([i, j], k) => {
        const c = cellCenter(i, j);
        if (!r._lm[k]) r._lm[k] = M4.create();
        M4.compose(r._lm[k], c.x, OY + WH - 0.06, c.z, 0);
        if (!low && !holeAt(i, j) && !tallAt(i, j)) GFX.draw(MODELS.obj.ceilLamp, r._lm[k], lit && !r.dark ? ON_T : OFF_T, null, { shadow: false });
        if (hiAt(i, j) && (!low || lv1)) {
          if (!r._lu) r._lu = []; if (!r._lu[k]) r._lu[k] = M4.create();
          M4.compose(r._lu[k], c.x, OY + WH * 2 - 0.06, c.z, 0);
          if (!low) GFX.draw(MODELS.obj.ceilLamp, r._lu[k], lit && !r.dark ? ON_T : OFF_T, null, { shadow: false });
        }
      });
      if (lit && !r.dark && hiAt(r.ci, r.cj)) { const c = cellCenter(r.ci, r.cj); GFX.addLight(c.x, OY + WH * 2 - 0.5, c.z, Math.max(r.i1 - r.i0 + 1, r.j1 - r.j0 + 1) * CS * 0.6 + 2.3, 1.0, 0.82, 0.62, 1.3); }
      if (lit && !r.dark) {
        const c = cellCenter(r.ci, r.cj);
        const span = Math.max(r.i1 - r.i0 + 1, r.j1 - r.j0 + 1) * CS;
        const fl = Math.sin(time * 0.37 + r.ci * 1.7) > 0.93 ? 0.55 + 0.45 * (Math.sin(time * 41 + r.cj) > 0 ? 1 : 0.2) : 1;
        const flick = (r.rust > 0.5 ? 0.85 + 0.15 * Math.sin(time * 23 + Math.sin(time * 3.1) * 4) : 1) * fl;
        GFX.addLight(c.x, OY + WH - 0.5, c.z, span * 0.6 + 2.3, 1.0, 0.82, 0.62, 1.45 * flick);
      }
    }
    for (const o of objs.values()) {
      const d = OBJ[o.type];
      if (o.type === 'sisetrepp') continue;
      if (o.lv && low && !lv1) continue;
      let mesh = MODELS.obj[d.mesh || o.type];
      if (o.type === 'vanagen') mesh = MODELS.obj.generaator;
      if (!mesh) continue;
      const powered = d.power > 0 ? o.on : d.power < 0 ? !o.broken : true;
      const tint = o.broken ? OFF_T : o.hp < o.maxHp * 0.4 ? DMG_T : powered ? ON_T : [0.55, 0.5, 0.48, 0];
      const rust = o.type === 'vanagen' || o.type === 'terminal' || o.type === 'hoidla' ? 1.3 : 0.3;
      if (o.type === 'myyr' || o.type === 'torn') { drawJoined(o, mesh, tint, rust); continue; }
      if (o.type === 'myyrturel') { drawJoined(o, MODELS.obj.myyr, tint, rust); GFX.draw(MODELS.obj.myyrturelTop, o.m, tint, null, { rust }); }
      else GFX.draw(mesh, o.m, tint, null, { rust });
      if (o.type === 'kahur' || o.type === 'myyrturel') {
        if (!o.hm) o.hm = M4.create();
        if (o.aim === undefined) o.aim = objYaw(o);
        M4.child(o.hm, o.m, 0, o.type === 'kahur' ? 1.55 : 3.55, 0, o.aim - objYaw(o), o.pitch || 0, 0);
        GFX.draw(MODELS.obj.kahurHead, o.hm, tint, null, { rust: 0.4 });
      } else if (o.type === 'radar') {
        if (!o.hm) o.hm = M4.create();
        M4.child(o.hm, o.m, 0, 4.35, 0, o.on ? o.anim * 1.6 : 0.4, 0, 0);
        GFX.draw(MODELS.obj.radarDish, o.hm, tint, null, { rust: 0.2 });
      } else if (o.type === 'skanner') {
        if (!o.hm) o.hm = M4.create();
        M4.child(o.hm, o.m, 0, 1.6 + Math.sin(o.anim * 0.8) * 0.6 * (o.on ? 1 : 0), 0, o.on ? o.anim * 0.9 : 0, 0, 0);
        GFX.draw(MODELS.obj.skannerRing, o.hm, tint, null, { rust: 0 });
      }
      if (o.type === 'prozektor' && o.on && isNight) GFX.addLight(o.cx + Math.sin(objYaw(o)) * 6, OY + 3.2, o.cz + Math.cos(objYaw(o)) * 6, 24, 1.0, 0.95, 0.85, 2.2);
      if (o.type === 'pliit' && o.on && o.data.cooking > 0) GFX.addLight(o.cx, OY + 1.4, o.cz, 4, 1.0, 0.5, 0.15, 1.2);
      if (d.gate) {
        if (!o.hm) o.hm = M4.create();
        M4.child(o.hm, o.m, (o.open || 0) * 3.6, 0, 0, 0, 0, 0);
        GFX.draw(MODELS.obj.varavPanel, o.hm, tint, null, { rust: 0.6 });
      }
      if (o.type === 'torn' && o.on && isNight) { const a = o.anim * 0.4; GFX.addLight(o.cx + Math.sin(a) * 14, OY + 2, o.cz + Math.cos(a) * 14, 20, 1.0, 0.95, 0.85, 2.0); }
      if (o.type === 'teler' && o.on && (o.data.watch || 0) > 0) { const f = 0.6 + 0.4 * Math.sin(time * 13 + Math.sin(time * 3.7) * 3); GFX.addLight(o.cx, OY + 1.2, o.cz, 4.5, 0.55, 0.7, 1.0, 0.9 * f); }
      if (o.type === 'kasvu' && o.on) GFX.addLight(o.cx, OY + 1.6, o.cz, 4, 0.8, 0.35, 1.0, 0.7);
    }
  }

  // ---------- algne roostes peahoone ----------
  function setupStart() {
    reset();
    const r = addRoom(17, 18, 21, 21, 0, 1.0);
    for (const k of [...openings.keys()]) openings.delete(k);
    setOpening('h', 19, 22, 'door');
    setOpening('v', 17, 19, 'window');
    setOpening('h', 19, 18, 'window');
    addObj('vanagen', 17, 18, 0, { broken: true });
    addObj('terminal', 20, 18, 0, { broken: true });
    addObj('hoidla', 21, 20, 3);
    addObj('voodi', 17, 20, 1);
    return r;
  }
  function reset() {
    roomJob.clear();
    cellRoom.fill(0); cellObj.fill(0); cellObjUp.fill(0); upper.clear(); voids.clear(); upWalls.clear(); upOpen.clear(); upRoomCell.fill(0); upRooms.clear(); cellStyle.fill(255); cellRust.fill(0); walls.clear(); rooms.clear(); objs.clear(); openings.clear();
    nextRoomId = 1; nextObjId = 1; dirty = true;
  }
  function isInside(x, z) { const c = toCell(x, z); return roomAt(c.i, c.j) > 0; }
  // põranda kõrgus; y = olija praegune kõrgus (teise korruse jaoks)
  function floorAt(x, z, y) {
    const c = toCell(x, z); if (!inGrid(c.i, c.j)) return -1e9;
    const id = cellObj[c.j * N + c.i], o = id ? objs.get(id) : null;
    if (o && o.type === 'sisetrepp') {   // siseterepp: põrandast teise korruse põrandani
      const lx = (x - o.cx), lz = (z - o.cz), yw = objYaw(o);
      const back = -(lx * Math.sin(yw) + lz * Math.cos(yw));
      return OY + FLOOR_Y + clamp(0.5 + back / (2 * CS), 0, 1) * WH;
    }
    if (y !== undefined && y > OY + WH * 0.55 && upAt(c.i, c.j)) return OY + WH + FLOOR_Y;
    if (roomAt(c.i, c.j) > 0) return OY + FLOOR_Y;
    if (!o) return -1e9;
    const d = OBJ[o.type];
    if (d.deck) return OY + d.deck;
    if (d.ramp) { // kõrgem ots objekti tagaküljel (pöörde suunas -z)
      const lx = (x - o.cx), lz = (z - o.cz), yw = objYaw(o);
      const back = -(lx * Math.sin(yw) + lz * Math.cos(yw)); // >0 tagumise serva poole
      return OY + clamp(0.5 + back / CS, 0, 1) * d.ramp;
    }
    return -1e9;
  }
  function levelAt(x, z, y) { const c = toCell(x, z); return y > OY + WH * 0.55 && upAt(c.i, c.j) ? 1 : 0; }
  // teise korruse lisamine / eemaldamine tervele toale
  // kõrge tuba: seinad üles (kui pole) ja kogu vahelagi ära
  function setTall(rid, on) {
    const r = rooms.get(rid); if (!r) return false;
    if (on) { if (!r.cells.every(([i, j]) => hiAt(i, j))) raiseRoom(rid); for (const [i, j] of r.cells) if (canVoid(i, j).ok) voids.add(i + ':' + j); }
    else for (const [i, j] of r.cells) voids.delete(i + ':' + j);
    pruneObjects(); dirty = true; return true;
  }
  function roomIsTall(rid) { const r = rooms.get(rid); return !!(r && r.cells.length && r.cells.every(([i, j]) => tallAt(i, j))); }
  function setUpper(rid, on) {
    const r = rooms.get(rid); if (!r) return false;
    if (on) { raiseRoom(rid); for (const [i, j] of r.cells) voids.delete(i + ':' + j); }
    else { const ur = new Set(r.cells.map(([i, j]) => upRoomAt(i, j)).filter(Boolean)); removeUpRooms(ur); }
    pruneObjects(); dirty = true; return true;
  }
  // teise korruse toa(de) eemaldamine: seinad, mis ei piira ühtki teist alles jäävat tuba
  function removeUpRooms(ids) {
    for (const k of [...upWalls]) {
      const [t, a, b] = k.split(':'); const [[ai, aj], [bi, bj]] = edgeCells(t, +a, +b);
      const ua = upRoomAt(ai, aj), ub = upRoomAt(bi, bj);
      const keepA = ua && !ids.has(ua), keepB = ub && !ids.has(ub);
      if ((ids.has(ua) || ids.has(ub)) && !keepA && !keepB) { upWalls.delete(k); upOpen.delete(k); }
    }
    for (const id of ids) { const r = upRooms.get(id); if (r) for (const [i, j] of r.cells) voids.delete(i + ':' + j); }
    upChanged();
  }
  // toa ülesanne ja selle olek
  function setRoomJob(rid, key) { if (!rooms.has(rid)) return false; if (key && ROOM_PURPOSES[key]) roomJob.set(rid, key); else roomJob.delete(rid); return true; }
  function roomJobStatus(rid) {
    const key = roomJob.get(rid); if (!key || !rooms.has(rid)) return null;
    const def = ROOM_PURPOSES[key], m = {}, bad = new Set();
    for (const o of objs.values()) { if (o.lv || roomAt(o.i, o.j) !== rid) continue; m[o.type] = (m[o.type] || 0) + 1; if (!def.allow.includes(o.type) && !OBJ[o.type].fixed) bad.add(OBJ[o.type].name); }
    if (bad.size) return { key, def, ok: false, why: 'Remove: ' + [...bad].join(', ') };
    if (!def.need(m)) return { key, def, ok: false, why: 'Needs ' + def.needTxt };
    return { key, def, ok: true, why: '' };
  }
  function roomHasUpper(rid) { const r = rooms.get(rid); return !!(r && r.cells.length && r.cells.some(([i, j]) => hiAt(i, j))); }
  // teekond korruste vahel: lähim siseterepp
  // teise korruse teekond (BFS üle ülemise korruse rakkude; seinast läbi ainult alumise ukse kohalt)
  function pathUp(ax, az, bx, bz) {
    const s0 = toCell(ax, az), g = toCell(bx, bz);
    if (!inGrid(s0.i, s0.j) || !inGrid(g.i, g.j)) return null;
    const ok = (i, j) => inGrid(i, j) && upAt(i, j) && !holeAt(i, j) && (!objUpAt(i, j) || (i === g.i && j === g.j));
    const prev = new Map(), k0 = s0.j * N + s0.i, kg = g.j * N + g.i;
    prev.set(k0, -1); const q = [k0];
    while (q.length) {
      const k = q.shift(); if (k === kg) break;
      const i = k % N, j = (k - i) / N;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj, nk = nj * N + ni;
        if (prev.has(nk) || !ok(ni, nj)) continue;
        const t = di ? 'v' : 'h', ei = di > 0 ? i + 1 : di < 0 ? i : i, ej = dj > 0 ? j + 1 : dj < 0 ? j : j;
        if (upWallAt(t, ei, ej) && upOpening(t, ei, ej) !== 'door') continue;
        prev.set(nk, k); q.push(nk);
      }
    }
    if (!prev.has(kg)) return null;
    const pts = []; for (let k = kg; k !== -1 && k !== k0; k = prev.get(k)) { const i = k % N; pts.push(cellCenter(i, (k - i) / N)); }
    pts.reverse(); if (pts.length) pts[pts.length - 1] = { x: bx, z: bz }; else pts.push({ x: bx, z: bz });
    return pts;
  }
  function stairRoute(x, z, goingUp) {
    let best = null, bd = 1e9;
    for (const o of objs.values()) if (o.type === 'sisetrepp') { const d = Math.hypot(o.cx - x, o.cz - z); if (d < bd) { bd = d; best = o; } }
    if (!best) return null;
    const [di, dj] = stairDir(best), L = CS - 0.35;
    const lo = { x: best.cx + di * L, z: best.cz + dj * L }, hi = { x: best.cx - di * L, z: best.cz - dj * L };
    const en = stairEntry(best), ex = stairExit(best);
    const ce = cellCenter(en.i, en.j), cx = cellCenter(ex.i, ex.j);
    return goingUp ? { entry: ce, via: [lo, hi], exit: cx } : { entry: cx, via: [hi, lo], exit: ce };
  }
  function bounds() {
    let r = 0;
    for (const rm of rooms.values()) for (const [i, j] of rm.cells) { const c = cellCenter(i, j); r = Math.max(r, Math.hypot(c.x - OX, c.z - OZ) + 1.5); }
    for (const o of objs.values()) r = Math.max(r, Math.hypot((o.cx || OX) - OX, (o.cz || OZ) - OZ) + 1);
    return r;
  }
  function serialize() {
    const styles = [];
    for (const r of rooms.values()) styles.push([r.cells[0][0], r.cells[0][1], r.style, r.rust]);
    const jobs = []; for (const [rid, k] of roomJob) { const r = rooms.get(rid); if (r) jobs.push([r.cells[0][0], r.cells[0][1], k]); }
    return { v: 2, jobs, walls: [...walls], openings: [...openings.entries()], styles, up2: 1, upWalls: [...upWalls], upOpen: [...upOpen.entries()], wide: [...wide], upWide: [...upWide], voids: [...voids], objs: [...objs.values()].map((o) => ({ id: o.id, type: o.type, i: o.i, j: o.j, rot: o.rot, hp: o.hp, broken: o.broken, data: o.data, lv: o.lv || 0 })) };
  }
  function deserialize(d) {
    reset();
    if (d.v === 2) {
      for (const k of d.walls) walls.add(k);
      computeRooms();
      for (const [i, j, st, ru] of d.styles || []) { const rid = roomAt(i, j); if (rid) setRoomStyle(rid, st, ru); }
    } else {
      for (const r of d.rooms || []) addRoom(r.i0, r.j0, r.i1, r.j1, r.style, r.rust);
    }
    openings.clear();
    for (const [k, v] of d.openings) if (walls.has(k)) openings.set(k, v);
    wide.clear(); upWide.clear(); for (const k of d.wide || []) if (openings.has(k)) wide.add(k); for (const k of d.upWide || []) upWide.add(k);
    if (d.up2) {
      for (const k of d.upWalls || []) upWalls.add(k);
      for (const [k, v] of d.upOpen || []) if (v === 'door' || v === 'window') upOpen.set(k, v);
      for (const k of d.voids || []) voids.add(k);
    } else if ((d.upper && d.upper.length) || (d.tall && d.tall.length)) {
      // vana salvestus: teise korruse seinad tuletatakse esimese korruse seintest nagu varem
      const hi = new Set([...(d.upper || []), ...(d.tall || [])]), oldUp = new Set(d.upper || []);
      const H = (i, j) => hi.has(i + ':' + j);
      for (const k of walls) {
        const [t, a, b] = k.split(':'); const i = +a, j = +b; const [[ai, aj], [bi, bj]] = edgeCells(t, i, j);
        const uA = H(ai, aj), uB = H(bi, bj); if (!uA && !uB) continue;
        upWalls.add(k);
        const lo = openings.get(k);
        if (uA && uB) { if (lo === 'door' && oldUp.has(ai + ':' + aj) && oldUp.has(bi + ':' + bj)) upOpen.set(k, 'door'); }
        else if (lo === 'window' || ((i + j) % 2 === 0 && lo !== 'door' && lo !== 'garage')) upOpen.set(k, 'window');
      }
      for (const k of d.upWalls || []) upWalls.add(k);
      for (const [k, v] of d.upOpen || []) { if (v === 'door' || v === 'window') upOpen.set(k, v); else if (v === 'wall') upOpen.delete(k); }
      for (const k of d.tall || []) voids.add(k);
    }
    for (const [i, j, k] of d.jobs || []) { const rid = roomAt(i, j); if (rid) roomJob.set(rid, k); }
    for (const o of d.objs) addObj(o.type, o.i, o.j, o.rot, { hp: o.hp, broken: o.broken, data: o.data || {}, lv: o.lv || 0 }, o.id);
    computeRooms();
    dirty = true;
  }
  return {
    N, CS, X0, Z0, OX, OY, OZ, WH, FLOOR_Y, IS_PLAYER, rooms, objs, openings, walls, power, doors, sconces,
    inGrid, inArea, roomAt, objAt, objUpAt, upAt, holeAt, levelAt, setUpper, roomHasUpper, stairRoute, pathUp, tallAt, setTall, roomIsTall, frontEdges, gdoors, setRoomJob, roomJobStatus, roomJob, canPlaceReplacing, placeReplacing, upRoomAt, upRooms, hiAt, lowDistAt, OVERHANG, canVoid, setVoid, voidAt, upperWallsFor, raiseRoom, removeUpRooms, upWallAt, upOpening, isWide, canPlaceUpWall, addUpWalls, removeUpWalls, isUpWallCustom, canSetUpOpening, setUpOpening, stairDir, upper, cellCenter, toCell, containsWorld, isWall, edgeType, edgeRooms, edgeCells, footprint, objCenter, objYaw,
    lineEdges, canPlaceWall, addWalls, removeWalls, rectEdges, addRoom, setRoomStyle, roomEdges, autoDoor, setOpening, canPlaceOpening, doorCount,
    canPlaceObj, addObj, removeObj, autoRot, useCells, objsOfType, signature, countBeds, updatePower, roomAccess, escapeCell,
    findPath, pathWorld, vehiclePath, straightOK, update, draw, setupStart, reset, isInside, floorAt, bounds,
    serialize, deserialize, markDirty: () => { dirty = true; }, rebuildNow: () => rebuild(), computeRooms,
    get viewLevel() { return viewLevel; }, set viewLevel(v) { viewLevel = v ? 1 : 0; },
  };
}

const Base = createBase({ ox: 0, oy: 0, oz: 0, player: true, accent: [1.0, 0.55, 0.16], style: 1, doorToward: { x: 0, z: 14 } });
// kõik baasid (mängija + vastased): ühised päringud
const Bases = {
  list: [Base],
  at(x, z) { for (const b of this.list) if (b.containsWorld(x, z)) return b; return null; },
  floorAt(x, z, y) { const b = this.at(x, z); return b ? b.floorAt(x, z, y) : -1e9; },
  isInsideAny(x, z) { const b = this.at(x, z); return !!(b && b.isInside(x, z)); },
  pathWorld(ax, az, bx, bz, goalCells) {
    if (goalCells) return Base.pathWorld(ax, az, bx, bz, goalCells);
    const b = this.at(ax, az) || this.at(bx, bz);
    return b ? b.pathWorld(ax, az, bx, bz) : [{ x: bx, z: bz }];
  },
  // sõidukite marsruut: läbi väravate ja garaažiukse, mööda baase
  vehicleRoute(ax, az, bx, bz) {
    const A = this.at(ax, az), B = this.at(bx, bz);
    let out = [];
    if (A && A.vehiclePath) { const p = A.vehiclePath(ax, az, bx, bz); if (p) out = p; else return null; }
    if (B && B !== A && B.vehiclePath) { if (out.length) out.pop(); const s = out.length ? out[out.length - 1] : { x: ax, z: az }; const p = B.vehiclePath(s.x, s.z, bx, bz); if (p) out = out.concat(p); else return null; }
    if (!out.length) out = [{ x: bx, z: bz }];
    return out;
  },
};
