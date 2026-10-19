// ============================================================
//  INVENTAR: esemed, seljakoti pesad, varustus, hoidla, kasutamine
// ============================================================
const ITEMS = (() => {
  const s = (d) => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return {
    kris: { name: 'Raw diamond', cat: 'res', stack: 10, col: '#92d9ff', desc: 'A raw diamond from a comet. Sell it at the comms terminal or polish it to raise its value.', icon: s('<path d="M16 3l7 9-7 17-7-17z"/><path d="M9 12h14M13 12l3 17M19 12l-3 17"/>') },
    scrap: { name: 'Scrap', cat: 'res', stack: 20, col: '#c9b9a2', desc: 'Building material. Used for building, repairs and making ammo.', icon: s('<path d="M16 4l10 6v12l-10 6-10-6V10z"/><circle cx="16" cy="16" r="4"/><path d="M6 10l10 6 10-6"/>') },
    meat: { name: 'Raw meat', cat: 'res', stack: 5, col: '#e7b98a', desc: 'Desert goat meat. The cook turns it into food.', icon: s('<path d="M8 20c-3-5 1-13 9-13 6 0 9 4 8 8-1 5-7 8-12 8-2 0-4-1-5-3z"/><circle cx="12" cy="21" r="3"/><path d="M10 23l-4 4"/>') },
    acid: { name: 'Acid gland', cat: 'res', stack: 10, col: '#9dff4a', desc: 'An acid sac from a dead acid mantis. Sell it at the comms terminal (' + 16 + ' ₵ each).', icon: s('<path d="M16 5c5 6 8 10 8 15a8 8 0 0 1-16 0c0-5 3-9 8-15z"/><path d="M12 20a4 4 0 0 0 4 4"/>') },
    ore: { name: 'Iron ore', cat: 'res', stack: 15, col: '#c06a44', desc: 'Iron ore from the desert rocks. Smelt it into steel at the Ore works or sell it at the comms terminal.', icon: s('<path d="M6 22l5-12 8-3 7 8-3 10-11 1z"/><path d="M11 10l3 7 5-10M14 17l-3 9M14 17l9-2"/>') },
    stones: { name: 'Heartstones', cat: 'quest', stack: 5, col: '#ff8fd0', desc: 'The Stoneheart\'s heart-crystals: proof that the giant is dead. Whoever brings them in gets the colonisation rights to the planet – they wipe out the whole debt.', icon: s('<path d="M16 27s-10-6-10-13a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7-10 13-10 13z"/><path d="M12 14l4 4 4-4"/>') },
    ammo_r: { name: 'Carbine ammo', cat: 'ammo', stack: 90, col: '#ddb45c', desc: '5.56 mm rounds for the carbine. Reloading takes them from your backpack.', icon: s('<path d="M8 26V12l2-5 2 5v14zM15 26V12l2-5 2 5v14zM22 26V12l2-5 2 5v14z"/><path d="M8 22h4M15 22h4M22 22h4"/>') },
    ammo_c: { name: 'Railgun charge', cat: 'ammo', stack: 15, col: '#92d9ff', desc: 'Crystal-battery charge for the railgun.', icon: s('<rect x="9" y="6" width="14" height="20" rx="2"/><path d="M16 10v6l-3 0 6 6v-6h-3"/>') },
    medkit: { name: 'Medkit', cat: 'use', stack: 3, col: '#ff7a66', desc: 'Restores 55 health. Shortcut H.', icon: s('<rect x="5" y="9" width="22" height="17" rx="2"/><path d="M12 9V6h8v3M16 13v9M11.5 17.5h9"/>') },
    ration: { name: 'Ration pack', cat: 'use', stack: 5, col: '#e7b98a', desc: 'A can from the home world. Restores 20 health.', icon: s('<rect x="7" y="8" width="18" height="18" rx="3"/><path d="M7 13h18M12 8V6h8v2"/>') },
    stim: { name: 'Stimulant', cat: 'use', stack: 3, col: '#97d276', desc: '25 seconds of faster running and faster healing.', icon: s('<path d="M20 4l8 8M23 7l-12 12-5 1 1-5 12-12M6 26l3-3"/>') },
    grenade: { name: 'Grenade', cat: 'use', stack: 4, col: '#c9592b', desc: 'Throwable explosive, detonates on impact. Shortcut G.', icon: s('<circle cx="15" cy="19" r="8"/><path d="M13 11V8h5v3M18 8l5-3M11 19h8M15 15v8"/>') },
    carbine: { name: 'Carbine', cat: 'weapon', stack: 1, col: '#eedfc6', slot: 'w', desc: 'Reliable automatic carbine. Upgrades in the workshop.', icon: s('<path d="M3 15h18l3-2h5v4h-5l-2 1H11l-2 6H6l1-6H3z"/><path d="M14 18v3"/>') },
    shotgun: { name: 'Shotgun', cat: 'weapon', stack: 1, col: '#d9a46a', slot: 'w', desc: 'Pump-action: 9 pellets per shot. Devastating up close, useless at range.', icon: s('<path d="M2 14h20l2-1h6v3h-6l-1 1H13l-1 1H9l-2 6H4l1-6H2z"/><path d="M15 17h6"/>') },
    pistol: { name: 'Pistol', cat: 'weapon', stack: 1, col: '#c9b9a2', slot: 'w', desc: 'Semi-automatic. Accurate and light, one shot per press.', icon: s('<path d="M5 11h20v4H13l-1 2h-2l-2 7H4l2-9H5z"/><path d="M11 15v2"/>') },
    smg: { name: 'PP-9 SMG', cat: 'weapon', stack: 1, col: '#9fb0c0', slot: 'w', desc: 'Very fast fire, 40-round mag. Uses pistol ammo.', icon: s('<path d="M4 13h18v4H14l-1 6h-3l1-6H8l-1 3H4z"/><path d="M22 14h5M12 17v4"/>') },
    sniper: { name: 'Sniper rifle', cat: 'weapon', stack: 1, col: '#a7b98a', slot: 'w', desc: 'Bolt-action rifle with a scope: damage 120, 5-round mag. Only accurate when scoped.', icon: s('<path d="M1 15h22l2-1h6v2h-6l-1 1H12l-1 1H9l-2 6H4l1-6H1z"/><rect x="9" y="10" width="9" height="3" rx="1"/><path d="M11 13v2M16 13v2"/>') },
    ammo_sn: { name: 'Sniper ammo', cat: 'ammo', stack: 30, col: '#a7b98a', desc: '.338 calibre rounds for the sniper rifle.', icon: s('<path d="M10 28V12l2-7 2 7v16zM18 28V12l2-7 2 7v16z"/><path d="M10 24h4M18 24h4"/>') },
    lmg: { name: 'Machine gun', cat: 'weapon', stack: 1, col: '#b0a080', slot: 'w', desc: '100-round belt. Heavy: you move slower. Uses carbine ammo.', icon: s('<path d="M2 13h22l2-1h4v3h-4l-1 1H12l-2 7H7l1-7H2z"/><rect x="10" y="16" width="6" height="5" rx="1"/><path d="M20 16l-1 4"/>') },
    ammo_s: { name: 'Shotgun shells', cat: 'ammo', stack: 36, col: '#d9a46a', desc: '12-gauge shells for the shotgun.', icon: s('<rect x="7" y="8" width="6" height="18" rx="1"/><rect x="19" y="8" width="6" height="18" rx="1"/><path d="M7 21h6M19 21h6"/>') },
    ammo_p: { name: 'Pistol ammo', cat: 'ammo', stack: 120, col: '#c9b9a2', desc: '9 mm rounds for the pistol and SMG.', icon: s('<path d="M9 26V14l2-4 2 4v12zM19 26V14l2-4 2 4v12z"/>') },
    rail: { name: 'Railgun', cat: 'weapon', stack: 1, col: '#92d9ff', slot: 'w', desc: 'Pierces everything in a line. Slow but deadly.', icon: s('<path d="M3 13h22l4-2v8l-4-2H11l-2 6H6l1-6H3z"/><path d="M12 13v4M16 13v4M20 13v4"/>') },
    helmet: { name: 'Combat helmet', cat: 'gear', stack: 1, col: '#c9b9a2', slot: 'helmet', arm: 0.15, desc: 'Steel helmet. Damage −15%. Visible on the character too.', icon: s('<path d="M5 19a11 11 0 0 1 22 0v3H5z"/><path d="M5 19h22M10 22v3h12v-3"/>') },
    helmet2: { name: 'Visor helmet', cat: 'gear', stack: 1, col: '#ffb35c', slot: 'helmet', arm: 0.22, desc: 'Helmet with a closed UAC visor. Damage −22%.', icon: s('<path d="M5 18a11 11 0 0 1 22 0v5H5z"/><path d="M7 18h18v3H7z"/><path d="M10 25h12"/>') },
    vest_l: { name: 'Light carrier vest', cat: 'gear', stack: 1, col: '#b8b48a', slot: 'vest', arm: 0.1, cap: 6, gear: 2, desc: 'Carrier vest with pouches: +6 slots, damage −10%.', icon: s('<path d="M10 4l-4 4v20h20V8l-4-4-3 4h-6z"/><path d="M9 15h6v5H9zM17 15h6v5h-6z"/>') },
    vest: { name: 'Plate vest', cat: 'gear', stack: 1, col: '#9fb0a0', slot: 'vest', arm: 0.25, cap: 6, gear: 2, spd: -0.04, desc: 'Vest with ceramic plates: +6 slots, damage −25%, slightly slower.', icon: s('<path d="M10 4l-4 4v20h20V8l-4-4-3 4h-6z"/><path d="M10 11h12v8H10z"/><path d="M10 22h12"/>') },
    vest_h: { name: 'Heavy armour', cat: 'gear', stack: 1, col: '#8f9aa8', slot: 'vest', arm: 0.38, cap: 4, gear: 3, spd: -0.1, desc: 'Doom 3 style full armour with pauldrons: +4 slots, damage −38%, 10% slower.', icon: s('<path d="M9 4L3 9l3 6 3-2v15h14V13l3 2 3-6-6-5-3 4h-4z"/><path d="M12 12h8v7h-8z"/>') },
    boots: { name: 'Combat boots', cat: 'gear', stack: 1, col: '#a08a6a', slot: 'boots', spd: 0.07, desc: 'High boots. You run 7% faster.', icon: s('<path d="M9 4h8v13l8 4v5H7z"/><path d="M7 22h18M9 9h8"/>') },
    gloves: { name: 'Tactical gloves', cat: 'gear', stack: 1, col: '#9a9a8a', slot: 'gloves', rel: 0.8, desc: 'You reload 20% faster.', icon: s('<path d="M10 28V14l-3-4 2-2 4 4V5h2v8V4h2v9V5h2v9l2-3 2 1-3 8v8z"/>') },
    pack_s: { name: 'Small backpack', cat: 'gear', stack: 1, col: '#c9b9a2', slot: 'pack', cap: 6, desc: '+6 slots.', icon: s('<path d="M10 11h12l1 15H9z"/><path d="M13 11V8a3 3 0 0 1 6 0v3"/>') },
    revolver: { name: '.44 Revolver', cat: 'weapon', stack: 1, col: '#d8c3a0', slot: 'w', desc: 'Six-shot magnum revolver: damage 58, slow but hits hard. Uses .44 rounds.', icon: s('<path d="M4 11h17v3h-6l-1 1h-3l-2 9H5l2-8H4z"/><circle cx="15" cy="13" r="3"/>') },
    dmr: { name: 'DMR marksman rifle', cat: 'weapon', stack: 1, col: '#c8b48a', slot: 'w', desc: 'Semi-automatic rifle with a scope: damage 48, 15-round mag. Uses carbine ammo.', icon: s('<path d="M1 15h22l2-1h6v2h-6l-1 1H12l-1 1H9l-2 6H4l1-6H1z"/><rect x="10" y="10" width="9" height="3" rx="1"/>') },
    arc: { name: 'Arc thrower', cat: 'weapon', stack: 1, col: '#b6e0ff', slot: 'w', desc: 'Colony mining prototype found in a tunnel: a bolt of lightning (damage 46) that jumps on to 3 more enemies nearby. Uses plasma cells. Not sold anywhere.', icon: s('<path d="M3 13h18l4 2-4 2H12l-2 6H7l1-6H3z"/><path d="M24 9l3 3-3 1 3 3"/>') },
    exo: { name: 'Tunnel-rat exo rig', cat: 'gear', stack: 1, col: '#ffb35c', slot: 'vest', arm: 0.34, cap: 8, gear: 3, spd: 0.06, desc: 'Powered work exoskeleton from the old tunnel crews: +8 slots, damage −34% and you move 6% faster. Not sold anywhere.', icon: s('<path d="M9 4L4 9l3 5 2-1v15h14V13l2 1 3-5-5-5-3 4h-4z"/><path d="M12 13h8M12 18h8M12 23h8M16 13v13"/>') },
    plasma: { name: 'Plasma rifle', cat: 'weapon', stack: 1, col: '#8fe3ff', slot: 'w', desc: 'Fires bolts of superheated plasma: damage 30, fast, never needs bullets — only plasma cells.', icon: s('<path d="M3 13h20l5 2-5 2H12l-2 6H7l1-6H3z"/><path d="M15 13v4M18 13v4M21 13v4"/>') },
    gl: { name: 'Grenade launcher', cat: 'weapon', stack: 1, col: '#a8b07a', slot: 'w', desc: 'Six-shot drum launcher. 40 mm grenades explode on impact, splash damage 150.', icon: s('<circle cx="13" cy="16" r="6"/><path d="M19 13h10v5H19M7 19l-2 6h3l2-5"/>') },
    ashot: { name: 'Auto shotgun', cat: 'weapon', stack: 1, col: '#c49a6a', slot: 'w', desc: 'Fully automatic shotgun with a 10-shell drum. Brutal up close.', icon: s('<path d="M2 13h22l2-1h4v3h-4l-1 1H13l-2 7H8l1-7H2z"/><circle cx="14" cy="20" r="3"/>') },
    ammo_44: { name: '.44 rounds', cat: 'ammo', stack: 36, col: '#d8c3a0', desc: 'Magnum rounds for the revolver.', icon: s('<path d="M10 27V13l2-5 2 5v14zM18 27V13l2-5 2 5v14z"/><path d="M10 23h4M18 23h4"/>') },
    ammo_pl: { name: 'Plasma cell', cat: 'ammo', stack: 120, col: '#8fe3ff', desc: 'Charged plasma cells for the plasma rifle.', icon: s('<rect x="10" y="5" width="12" height="22" rx="3"/><path d="M13 10h6M13 15h6M13 20h6"/>') },
    ammo_gl: { name: '40 mm grenade', cat: 'ammo', stack: 12, col: '#a8b07a', desc: 'Impact grenades for the grenade launcher.', icon: s('<path d="M11 27V12a5 5 0 0 1 10 0v15z"/><path d="M11 21h10"/>') },
    helmet3: { name: 'Exo helmet', cat: 'gear', stack: 1, col: '#8fe3ff', slot: 'helmet', arm: 0.3, desc: 'Sealed exo-suit helmet with a sensor visor. Damage −30%.', icon: s('<path d="M5 20a11 11 0 0 1 22 0v4H5z"/><path d="M8 17h16v3H8z"/><path d="M16 6v-3"/>') },
    vest_x: { name: 'Exo armour', cat: 'gear', stack: 1, col: '#8fe3ff', slot: 'vest', arm: 0.45, cap: 8, gear: 3, spd: -0.04, desc: 'Powered exo armour with servo joints: +8 slots, damage −45%, barely slows you.', icon: s('<path d="M9 4L3 9l3 6 3-2v15h14V13l3 2 3-6-6-5-3 3h-4z"/><path d="M12 15h8v6h-8z"/>') },
    boots2: { name: 'Servo boots', cat: 'gear', stack: 1, col: '#8fe3ff', slot: 'boots', spd: 0.14, desc: 'Powered boots. You run 14% faster.', icon: s('<path d="M9 4h8v13l8 4v5H7z"/><path d="M7 22h18M9 9h8M12 14h3"/>') },
    gloves2: { name: 'Grip gloves', cat: 'gear', stack: 1, col: '#c8b48a', slot: 'gloves', rel: 0.65, desc: 'Reinforced tactical gloves. You reload 35% faster.', icon: s('<path d="M10 28V14l-3-4 2-2 4 4V5h2v8V4h2v9V5h2v9l2-3 2 1-3 8v8z"/><path d="M11 22h9"/>') },
    pack_m: { name: 'Military rucksack', cat: 'gear', stack: 1, col: '#a8b07a', slot: 'pack', cap: 14, desc: 'Big military rucksack with side pouches: +14 slots.', icon: s('<path d="M8 8h16l2 19H6z"/><path d="M12 8V5a4 4 0 0 1 8 0v3M9 15h14v6H9zM5 14h3v8H5zM24 14h3v8h-3z"/>') },
    trauma: { name: 'Trauma kit', cat: 'use', stack: 2, col: '#ff5a4a', desc: 'Full surgical kit. Restores all health. Shortcut H uses medkits first.', icon: s('<rect x="4" y="8" width="24" height="18" rx="2"/><path d="M12 8V5h8v3M16 12v10M11 17h10"/><path d="M4 13h24"/>') },
    pack: { name: 'Large backpack', cat: 'gear', stack: 1, col: '#c9b9a2', slot: 'pack', cap: 12, desc: 'Expedition pack with a sleeping mat: +12 slots.', icon: s('<path d="M9 9h14l2 18H7z"/><path d="M12 9V6a4 4 0 0 1 8 0v3M10 16h12v5H10z"/>') },
  };
})();

const Inv = (() => {
  // DayZ-laadne: taskud + vesti pesad + seljakoti pesad. Iga konteiner on oma ruudustik.
  const POCKETS = 10, V0 = 10, VMAX = 8, K0 = 18, KMAX = 14, TOTAL = 32;
  const BASE_SLOTS = POCKETS, PACK_SLOTS = KMAX;
  const EQ_KEYS = ['helmet', 'vest', 'gloves', 'boots', 'pack', 'w1', 'w2'];
  function fresh() {
    return { v: 2, slots: new Array(TOTAL).fill(null), eq: { w1: 'carbine', w2: null, helmet: null, vest: null, gloves: null, boots: null, pack: null }, sel: 'w1' };
  }
  function ensure() {
    if (!G.inv) G.inv = fresh();
    if (!G.stash) G.stash = {};
    return G.inv;
  }
  function capOf(id) { return id && ITEMS[id] ? ITEMS[id].cap || 0 : 0; }
  function sections(eq) {
    const v = ensure(); eq = eq || v.eq;
    const out = [{ key: 'pocket', name: 'Pockets', from: 0, n: POCKETS }];
    if (eq.vest) out.push({ key: 'vest', name: ITEMS[eq.vest].name, from: V0, n: Math.min(VMAX, capOf(eq.vest)) });
    if (eq.pack) out.push({ key: 'pack', name: ITEMS[eq.pack].name, from: K0, n: Math.min(KMAX, capOf(eq.pack)) });
    return out;
  }
  let idxCache = null, idxKey = '';
  function idx() {
    const v = ensure(), k = v.eq.vest + '|' + v.eq.pack;
    if (idxCache && k === idxKey) return idxCache;
    idxCache = []; for (const sc of sections()) for (let i = 0; i < sc.n; i++) idxCache.push(sc.from + i);
    idxKey = k; return idxCache;
  }
  function nSlots() { return idx().length; }
  function count(id) { const v = ensure(); let n = 0; for (const i of idx()) { const s = v.slots[i]; if (s && s.id === id) n += s.n; } return n; }
  function used() { const v = ensure(); let n = 0; for (const i of idx()) if (v.slots[i]) n++; return n; }
  // kui palju mahub
  function room(id) {
    const v = ensure(), st = ITEMS[id].stack; let r = 0;
    for (const i of idx()) { const s = v.slots[i]; if (!s) r += st; else if (s.id === id) r += st - s.n; }
    return r;
  }
  function add(id, n) {
    const v = ensure(), st = ITEMS[id].stack; let left = n;
    for (const i of idx()) { if (left <= 0) break; const s = v.slots[i]; if (s && s.id === id && s.n < st) { const k = Math.min(st - s.n, left); s.n += k; left -= k; } }
    for (const i of idx()) { if (left <= 0) break; if (!v.slots[i]) { const k = Math.min(st, left); v.slots[i] = { id, n: k }; left -= k; } }
    if (n - left > 0 && typeof UI !== 'undefined') UI.invDirty();
    return n - left;
  }
  function take(id, n) {
    const v = ensure(); let left = n; const L = idx();
    for (let q = L.length - 1; q >= 0 && left > 0; q--) { const i = L[q]; const s = v.slots[i]; if (s && s.id === id) { const k = Math.min(s.n, left); s.n -= k; left -= k; if (s.n <= 0) v.slots[i] = null; } }
    if (n - left > 0 && typeof UI !== 'undefined') UI.invDirty();
    return n - left;
  }
  // relvad
  function weaponIn(slot) { return ensure().eq[slot]; }
  const W_OF = { carbine: 'rifle', rail: 'rail', sniper: 'sniper', shotgun: 'shotgun', pistol: 'pistol', smg: 'smg', lmg: 'lmg', revolver: 'revolver', dmr: 'dmr', plasma: 'plasma', gl: 'gl', ashot: 'ashot', arc: 'arc' };
  function curWeapon() { const v = ensure(); const w = v.eq[v.sel] || v.eq.w1 || v.eq.w2; return W_OF[w] || null; }
  function ammoFor(w) { const X = { revolver: 'ammo_44', plasma: 'ammo_pl', arc: 'ammo_pl', gl: 'ammo_gl', ashot: 'ammo_s', dmr: 'ammo_r' }; if (X[w]) return X[w]; return w === 'rail' ? 'ammo_c' : w === 'sniper' ? 'ammo_sn' : w === 'shotgun' ? 'ammo_s' : (w === 'pistol' || w === 'smg') ? 'ammo_p' : 'ammo_r'; }
  function swap() { const v = ensure(); const o = v.sel === 'w1' ? 'w2' : 'w1'; if (v.eq[o]) { v.sel = o; return true; } return false; }
  function hasWeapon(id) { const v = ensure(); return EQ_KEYS.some((k) => v.eq[k] === id) || count(id) > 0 || (G.stash[id] || 0) > 0; }
  // konteineri vahetus: sisu kolitakse ümber; kui ei mahu, jääb vana alles
  function setContainer(key, id, freedSlot) {
    const v = ensure(), old = v.eq[key];
    const from = key === 'vest' ? V0 : K0, max = key === 'vest' ? VMAX : KMAX;
    const moved = [];
    for (let i = from; i < from + max; i++) if (v.slots[i]) { moved.push(v.slots[i]); v.slots[i] = null; }
    const snapshot = v.slots.slice();
    v.eq[key] = id; idxCache = null;
    let ok = true;
    for (const it of moved) if (add(it.id, it.n) < it.n) { ok = false; break; }
    if (!ok) { v.slots = snapshot; for (let i = from, q = 0; q < moved.length; i++, q++) v.slots[i] = moved[q]; v.eq[key] = old; idxCache = null; return false; }
    return true;
  }
  function freeSlotExcept(skipFrom, skipN) { const v = ensure(); for (const i of idx()) { if (i >= skipFrom && i < skipFrom + skipN) continue; if (!v.slots[i]) return i; } return -1; }
  // varustamine pesast
  function equipFromSlot(i, toKey) {
    const v = ensure(); const s = v.slots[i]; if (!s) return false;
    const def = ITEMS[s.id];
    if (!def.slot) return false;
    let key = def.slot;
    if (def.slot === 'w') key = toKey === 'w1' || toKey === 'w2' ? toKey : !v.eq.w1 ? 'w1' : !v.eq.w2 ? 'w2' : v.sel;
    else if (toKey && toKey !== key) { UI.toast(def.name + ' doesn\'t go in that slot.'); return false; }
    const prev = v.eq[key];
    if (key === 'vest' || key === 'pack') {
      v.slots[i] = null;
      if (!setContainer(key, s.id)) { v.slots[i] = s; UI.toast('The contents won\'t fit — empty it first.'); return false; }
      if (prev && add(prev, 1) < 1) { stashOrDrop(prev); }
    } else { v.eq[key] = s.id; v.slots[i] = prev ? { id: prev, n: 1 } : null; }
    if (def.slot === 'w') v.sel = key;
    afterEquip();
    return true;
  }
  function stashOrDrop(id) {
    if (Base.isInside(Player.pos.x, Player.pos.z)) { stashAdd(id, 1); UI.toast(ITEMS[id].name + ' went to storage.'); }
    else { const p = Player.pos; Ents.pickups.push({ kind: 'bag', x: p.x, y: Ents.groundY(p.x, p.z), z: p.z, data: { items: [[id, 1]] }, id: Math.random() }); UI.toast(ITEMS[id].name + ' was dropped.'); }
  }
  function unequip(key, toSlot) {
    const v = ensure(); const id = v.eq[key]; if (!id) return false;
    if (key[0] === 'w') { const other = key === 'w1' ? 'w2' : 'w1'; if (!v.eq[other]) { UI.toast('You have to carry at least one weapon.'); return false; } }
    if (key === 'vest' || key === 'pack') {
      if (!setContainer(key, null)) { UI.toast('The contents won\'t fit anywhere — empty ' + ITEMS[id].name.toLowerCase() + ' enne.'); return false; }
      if (!add(id, 1)) { stashOrDrop(id); }
      afterEquip(); return true;
    }
    let free = toSlot !== undefined && !v.slots[toSlot] && idx().includes(toSlot) ? toSlot : freeSlotExcept(-1, 0);
    if (free < 0) { UI.toast('No free slot.'); return false; }
    v.slots[free] = { id, n: 1 }; v.eq[key] = null;
    if (key[0] === 'w' && v.sel === key) v.sel = key === 'w1' ? 'w2' : 'w1';
    afterEquip();
    return true;
  }
  // tegelase välimus järgib varustust
  function syncLook() {
    if (!G.look) return; const v = ensure();
    const eq = { helmet: v.eq.helmet, vest: v.eq.vest, gloves: v.eq.gloves, boots: v.eq.boots, pack: v.eq.pack };
    const o = G.look.eq || {};
    if (Object.keys(eq).some((k) => eq[k] !== o[k])) { G.look.eq = eq; Look.touch(G.look); }
  }
  function afterEquip() {
    syncLook();
    const w = curWeapon();
    if (w && Player.weapon !== w) { Player.weapon = w; Player.reloadT = 0; Player.fireCool = 0.3; }
    UI.invDirty();
  }
  function moveSlot(a, b) {
    const v = ensure(); if (a === b) return;
    const A = v.slots[a], B = v.slots[b];
    if (A && B && A.id === B.id && ITEMS[A.id].stack > 1) { const k = Math.min(ITEMS[A.id].stack - B.n, A.n); B.n += k; A.n -= k; if (A.n <= 0) v.slots[a] = null; }
    else { v.slots[a] = B; v.slots[b] = A; }
    UI.invDirty();
  }
  function split(i) {
    const v = ensure(); const s = v.slots[i]; if (!s || s.n < 2) return;
    for (const j of idx()) if (!v.slots[j]) { const k = Math.floor(s.n / 2); s.n -= k; v.slots[j] = { id: s.id, n: k }; UI.invDirty(); return; }
    UI.toast('No free slot in the backpack.');
  }
  function drop(i) {
    const v = ensure(); const s = v.slots[i]; if (!s) return;
    if (s.id === 'stones') { UI.toast('Heartstones can\'t be dropped.'); return; }
    const p = Player.pos, a = Player.yaw;
    Ents.pickups.push({ kind: 'bag', x: p.x + Math.sin(a) * 1.2, y: Ents.groundY(p.x + Math.sin(a) * 1.2, p.z + Math.cos(a) * 1.2), z: p.z + Math.cos(a) * 1.2, data: { items: [[s.id, s.n]] }, id: Math.random() });
    v.slots[i] = null; Audio2.pickup(); UI.invDirty();
  }
  // ---------- kasutamine ----------
  let stimT = 0;
  function use(id) {
    if (!count(id)) return false;
    if (id === 'medkit' || id === 'ration') {
      if (Player.hp >= Player.maxHp - 1) { UI.toast('You\'re already healthy.'); return false; }
      take(id, 1); Player.hp = Math.min(Player.maxHp, Player.hp + (id === 'medkit' ? 55 : 20));
      Audio2.repair(); UI.toast(id === 'medkit' ? 'Medkit: +55 health' : 'Ate: +20 health');
      return true;
    }
    if (id === 'trauma') {
      if (Player.hp >= Player.maxHp - 1) { UI.toast('You\'re already healthy.'); return false; }
      take(id, 1); Player.hp = Player.maxHp; Audio2.repair(); UI.toast('Trauma kit: fully healed'); return true;
    }
    if (id === 'stim') { take(id, 1); stimT = 25; Audio2.pickup(); UI.toast('Stimulant active for 25 s'); return true; }
    if (id === 'grenade') return throwGrenade();
    return false;
  }
  function throwGrenade() {
    if (G.mode !== 'play' || Player.dead) return false;
    if (!take('grenade', 1)) { UI.toast('No grenades.'); Audio2.deny(); return false; }
    const e = Player.eye(), cp = Math.cos(Player.pitch);
    const dx = Math.sin(Player.yaw) * cp, dy = Math.sin(Player.pitch) + 0.28, dz = Math.cos(Player.yaw) * cp;
    const sp = 17;
    Ents.projs.push({ x: e.x + dx * 0.6, y: e.y - 0.15, z: e.z + dz * 0.6, vx: dx * sp + Player.vel.x * 0.5, vy: dy * sp, vz: dz * sp + Player.vel.z * 0.5, g: 13, life: 3.2, dmg: 160, splash: 7.5, owner: Player, kind: 'grenade', r: 0.12, delay: 0 });
    Audio2.reload(); UI.toast('Grenade!');
    return true;
  }
  function update(dt) { if (stimT > 0) stimT -= dt; }
  function speedMul() { return (stimT > 0 ? 1.3 : 1) * gearSpd(ensure().eq); }
  function regenMul() { return stimT > 0 ? 3 : 1; }
  function armorMul(eq) { let m = 1; if (!eq) return 1; for (const k of ['helmet', 'vest']) if (eq[k] && ITEMS[eq[k]]) m *= 1 - (ITEMS[eq[k]].arm || 0); return m; }
  function dmgMul() { return armorMul(ensure().eq); }
  function gearSpd(eq) { let m = 1; if (!eq) return 1; for (const k of ['vest', 'boots']) if (eq[k] && ITEMS[eq[k]]) m += ITEMS[eq[k]].spd || 0; return m; }
  function reloadMul() { const g = ensure().eq.gloves; return g && ITEMS[g] ? ITEMS[g].rel || 1 : 1; }
  // ---------- hoidla ----------
  const RES_KEYS = { kris: 'kris', scrap: 'scrap', meat: 'meat', ore: 'ore', acid: 'acid' };
  function stashCount(id) { ensure(); if (RES_KEYS[id]) return G.res[RES_KEYS[id]] || 0; return G.stash[id] || 0; }
  function toStash(id, n) {
    ensure(); const k = take(id, n); if (!k) return 0;
    if (id === 'stones') { G.flags.stonesHome = true; }
    else if (RES_KEYS[id]) G.res[RES_KEYS[id]] += k; else G.stash[id] = (G.stash[id] || 0) + k;
    return k;
  }
  function fromStash(id, n) {
    ensure(); const have = stashCount(id); n = Math.min(n, have, room(id)); if (n <= 0) return 0;
    if (RES_KEYS[id]) G.res[RES_KEYS[id]] -= n; else { G.stash[id] -= n; if (G.stash[id] <= 0) delete G.stash[id]; }
    add(id, n); return n;
  }
  function stashAdd(id, n) { ensure(); if (RES_KEYS[id]) G.res[RES_KEYS[id]] += n; else G.stash[id] = (G.stash[id] || 0) + n; }
  // baasi sisenedes: ressursid hoidlasse
  function depositResources() {
    const parts = [];
    for (const id of ['kris', 'scrap', 'meat', 'ore', 'acid', 'stones']) { const n = count(id); if (!n) continue; toStash(id, n); parts.push(id === 'stones' ? 'The heartstones are home!' : '+' + n + ' ' + ITEMS[id].name.toLowerCase()); }
    return parts;
  }
  // kõik seljakotist kotti (surm): ainult ressursid
  function dropResourcesBag(x, z) {
    const items = [];
    for (const id of ['kris', 'scrap', 'meat', 'ore', 'acid', 'stones']) { const n = count(id); if (n) { take(id, n); items.push([id, n]); } }
    if (items.length) Ents.pickups.push({ kind: items.some((q) => q[0] === 'stones') ? 'stones' : 'bag', x, y: Ents.groundY(x, z), z, data: { items } });
  }
  // korja kott: lisab mahtuva, ülejääk jääb kotti
  function pickBag(p) {
    const d = p.data || {};
    // vana formaat
    if (!d.items) { d.items = []; for (const k of ['kris', 'scrap', 'meat']) if (d[k]) d.items.push([k, d[k]]); if (d.stones) d.items.push(['stones', d.stones]); }
    const got = [];
    for (const it of d.items) { const k = add(it[0], it[1]); if (k) { it[1] -= k; got.push(k + '× ' + ITEMS[it[0]].name.toLowerCase()); } }
    d.items = d.items.filter((it) => it[1] > 0);
    if (!d.items.length) p.gone = true;
    if (got.length) { Audio2.pickup(); UI.toast('You picked up: ' + got.join(', ')); }
    if (d.items.length) UI.toast('Not everything fit in the backpack.');
    if (got.some((g) => g.indexOf('heartstones') >= 0)) { UI.banner('You have the heartstones', 'Take them to the base — fast', 'good'); Objectives.check(); }
  }
  // vastase kukkunud sõduri saak
  function rivalLoot(e) {
    const items = [];
    if (Math.random() < 0.75) items.push(['ammo_r', randi(12, 32)]);
    if (Math.random() < 0.16) items.push(['medkit', 1]);
    if (Math.random() < 0.13) items.push(['grenade', 1]);
    if (Math.random() < 0.12) items.push(['ration', 1]);
    if (Math.random() < 0.05) items.push(['stim', 1]);
    if (Math.random() < 0.06) items.push([pick(['helmet', 'helmet', 'helmet2']), 1]);
    if (Math.random() < 0.05) items.push([pick(['vest_l', 'vest', 'vest', 'vest_h']), 1]);
    if (Math.random() < 0.05) items.push([pick(['boots', 'gloves', 'pack_s', 'pack']), 1]);
    if (e.carry) items.push(['kris', e.carry]);
    if (e.carryScrap) items.push(['scrap', e.carryScrap]);
    return items;
  }
  function serialize() { const v = ensure(); return { v: 2, slots: v.slots.map((s) => (s ? [s.id, s.n] : 0)), eq: v.eq, sel: v.sel, stash: G.stash }; }
  function deserialize(d, oldCarry) {
    G.inv = fresh(); G.stash = {}; idxCache = null;
    if (d) {
      G.stash = d.stash || {};
      if (d.v === 2) {
        d.slots.forEach((s, i) => { if (s && ITEMS[s[0]] && i < TOTAL) G.inv.slots[i] = { id: s[0], n: s[1] }; });
        Object.assign(G.inv.eq, d.eq || {});
      } else { // vana 16+8 pesa: tuleta vest looja valikust, sisu uuesti sisse
        Object.assign(G.inv.eq, d.eq || {});
        if (!G.inv.eq.vest) G.inv.eq.vest = 'vest_l';
        idxCache = null;
        for (const s of d.slots) if (s && ITEMS[s[0]]) { const k = add(s[0], s[1]); if (k < s[1]) stashAdd(s[0], s[1] - k); }
      }
      G.inv.sel = d.sel || 'w1';
    } else {
      startKit();
      if (oldCarry) for (const k of ['kris', 'scrap', 'meat', 'stones']) if (oldCarry[k]) add(k, oldCarry[k]);
      if (G.up && G.up.rail) { G.inv.eq.w2 = 'rail'; G.stash.ammo_c = 10; }
    }
    idxCache = null; syncLook();
  }
  function startKit() {
    G.inv = fresh(); idxCache = null; G.stash = { ammo_r: 150, medkit: 1, ration: 3 };
    // looja valik "Varustus" määrab algvarustuse
    const g = G.look && G.look.gear !== undefined ? G.look.gear : 2;
    const k = Look.kit(g);
    for (const s of ['helmet', 'vest', 'gloves', 'boots']) G.inv.eq[s] = k[s];
    if (g <= 1) { G.inv.eq.pack = 'pack_s'; G.res && (G.res.cr += 60); }
    idxCache = null;
    add('ammo_r', 90); add('medkit', 1); add('ration', 2);
    syncLook();
  }
  return { BASE_SLOTS, PACK_SLOTS, EQ_KEYS, sections, idx, armorMul, gearSpd, reloadMul, syncLook, ensure, nSlots, count, used, room, add, take, curWeapon, ammoFor, swap, weaponIn, hasWeapon, equipFromSlot, unequip, moveSlot, split, drop, use, throwGrenade,
    update, speedMul, regenMul, dmgMul, stashCount, toStash, fromStash, stashAdd, depositResources, dropResourcesBag, pickBag, rivalLoot, serialize, deserialize, startKit, get stimT() { return stimT; } };
})();
