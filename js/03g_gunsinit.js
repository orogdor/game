// Relvade ja turrettide SDF-mudelid (GUN_DATA) asendavad koodist ehitatud versioonid
function decodeSdfRaw(L, metalFix) {
  const u8 = bytesOf(L.b);
  const nv = L.nv, nt = L.nt; let o = 0;
  const q = new Uint16Array(u8.buffer.slice(o, o + nv * 6)); o += nv * 6;
  const nq = new Int8Array(u8.buffer.slice(o, o + nv * 3)); o += nv * 3;
  const col = new Uint8Array(u8.buffer.slice(o, o + nv * 4)); o += nv * 4;
  if (metalFix) for (let i = 3; i < col.length; i += 4) if (col[i] === 30) col[i] = 205;   // staatiline metall: pikslitäpne metallitekstuur (mitte märg läige)
  const idx = new Uint16Array(u8.buffer.slice(o, o + nt * 6));
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } // CCW esikülg
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) { pos[i] = L.mn[i % 3] + q[i] * L.sc; nor[i] = nq[i] / 127; }
  return { pos, nor, col, idx };
}
function decodeSdfMesh(L, metalFix) { return new GFX.Mesh(decodeSdfRaw(L, metalFix)); }
// mitu SDF-mudelit teisendatult üheks võrguks: parts = [[raw, m4 (veerupõhine), sx?, sy?, sz?]]
function sdfMerge(parts) {
  let nv = 0, ni = 0;
  for (const [r] of parts) { nv += r.pos.length / 3; ni += r.idx.length; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Uint8Array(nv * 4), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let vo = 0, io = 0;
  for (const [r, m, sx = 1, sy = 1, sz = 1] of parts) {
    const n = r.pos.length / 3;
    for (let i = 0; i < n; i++) {
      const x = r.pos[i * 3] * sx, y = r.pos[i * 3 + 1] * sy, z = r.pos[i * 3 + 2] * sz;
      const nx = r.nor[i * 3] / sx, ny = r.nor[i * 3 + 1] / sy, nz = r.nor[i * 3 + 2] / sz;
      const o = (vo + i) * 3;
      pos[o] = m[0] * x + m[4] * y + m[8] * z + m[12]; pos[o + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; pos[o + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      const ax = m[0] * nx + m[4] * ny + m[8] * nz, ay = m[1] * nx + m[5] * ny + m[9] * nz, az = m[2] * nx + m[6] * ny + m[10] * nz, l = Math.hypot(ax, ay, az) || 1;
      nor[o] = ax / l; nor[o + 1] = ay / l; nor[o + 2] = az / l;
    }
    col.set(r.col, vo * 4);
    for (let i = 0; i < r.idx.length; i++) idx[io + i] = r.idx[i] + vo;
    vo += n; io += r.idx.length;
  }
  return new GFX.Mesh({ pos, nor, col, idx });
}
function applyGunModels() {
  if (typeof GUN_DATA === 'undefined') return;
  const g = (k, l = 0) => (GUN_DATA[k] ? decodeSdfMesh(GUN_DATA[k].lod[Math.min(l, GUN_DATA[k].lod.length - 1)]) : null);
  for (const k of ['carbine', 'carbineTan', 'shotgun', 'pistol', 'smg', 'sniper', 'lmg', 'revolver', 'dmr', 'plasma', 'gl', 'ashot']) { const m = g(k); if (m) MODELS[k] = m; }
  const rail = g('rail'); if (rail) MODELS.railFPS = rail;
  if (GUN_DATA.carbine) { MODELS.rifleFPS = MODELS.carbine; MODELS.rifleNPC = g('carbine', 1); }
  MODELS.npcGuns = {}; for (const k of ['carbine', 'carbineTan', 'shotgun', 'smg', 'dmr', 'lmg']) { const m = g(k, 1); if (m) MODELS.npcGuns[k] = m; }
  const O = MODELS.obj;
  const kb = g('kahurBase'), kh = g('kahurHead'), mt = g('myyrTop');
  if (kb) O.kahur = kb; if (kh) O.kahurHead = kh; if (mt) O.myyrturelTop = mt;
  // mööbel
  if (typeof FURN_DATA !== 'undefined') for (const k in FURN_DATA) O[k] = decodeSdfMesh(FURN_DATA[k].lod[0], true);
  // uksed ja aknad
  if (typeof ARCH_DATA !== 'undefined') for (const k in ARCH_DATA) O[k] = decodeSdfMesh(ARCH_DATA[k].lod[0], true);
  // tehnika (generaator, hüdropoonika, lihvija, raviala, töölaud, skanner, radar, prožektor, päikesepaneel)
  if (typeof TECH_DATA !== 'undefined') for (const k in TECH_DATA) O[k] = decodeSdfMesh(TECH_DATA[k].lod[0], true);
}
// Olendid ja loodus (CRE_DATA): hiilija, parveputukas, okaskilp, meduus, Kivisüda, kivid, taimed, kristallid.
// MODELS.lo hoiab kaugvaate (LOD1) versioone (mitteloendatav, et mudelite läbikäijad seda topelt ei loeks).
function applyCreatureModels() {
  if (typeof CRE_DATA === 'undefined') return;
  const lo = {};
  Object.defineProperty(MODELS, 'lo', { value: lo, enumerable: false, configurable: true });
  const g = (k, l) => (CRE_DATA[k] ? decodeSdfMesh(CRE_DATA[k].lod[Math.min(l, CRE_DATA[k].lod.length - 1)]) : null);
  const map = { stalkerBody: 'sbody', stalkerHead: 'shead', stalkerTail: 'stail', stalkerLeg: 'sleg', bugBody: 'bbody', bugHead: 'bhead', bugTail: 'btail', bugLeg: 'bleg',
    crabBody: 'cbody', crabLeg: 'cleg', crabClaw: 'cclaw', jelly: 'jelly', bossBody: 'kbody', bossHead: 'khead', bossLeg: 'kleg', bossNode: 'knode', bossHeart: 'kheart',
    spire: 'spire', candle: 'candle', shrub: 'shrub', ribcage: 'ribcage', crystalCluster: 'crystalCluster', crystalBit: 'crystalBit', shard: 'shard', heartStone: 'heartStone' };
  for (const k in map) { const m0 = g(map[k], 0); if (!m0) continue; MODELS[k] = m0; lo[k] = g(map[k], 1); }
  if (CRE_DATA.rock0) { MODELS.rocks = [0, 1, 2, 3].map((i) => g('rock' + i, 0)); MODELS.rocksLo = [0, 1, 2, 3].map((i) => g('rock' + i, 1)); }
}
// Baasi välisosad ja peahoone moodulid (BASE_DATA)
function applyBaseModels() {
  if (typeof BASE_DATA === 'undefined') return;
  for (const k in BASE_DATA) MODELS.obj[k] = decodeSdfMesh(BASE_DATA[k].lod[0], true);
}
// Maailma rekvisiit (PROP_DATA): vrakid, rivaalide laagrid, kastid, lipp, kott, liha; kaljumoodustised CRE_DATA-st
function applyPropModels() {
  if (typeof GEAR_DATA !== 'undefined') { MODELS.life = {}; for (const k of ['wrench', 'tablet', 'cup', 'bowl', 'medkit', 'ladle', 'cutter', 'flashlight', 'sackKris', 'scrapBundle', 'meatLoad', 'memorial']) if (GEAR_DATA[k]) MODELS.life[k] = decodeSdfMesh(GEAR_DATA[k].lod[0]); }
  if (typeof CRE_DATA !== 'undefined' && CRE_DATA.form0) MODELS.formations = [0, 1, 2, 3].map((i) => decodeSdfMesh(CRE_DATA['form' + i].lod[0]));
  if (typeof PROP_DATA === 'undefined') return;
  const P = PROP_DATA, g = (k, l = 0) => decodeSdfMesh(P[k].lod[Math.min(l, P[k].lod.length - 1)]);
  if (P.wreck0) {
    MODELS.wrecks = [0, 1, 2, 3].map((i) => g('wreck' + i)); MODELS.wrecksLo = [0, 1, 2, 3].map((i) => g('wreck' + i, 1));
    if (P.ship_wreck) { MODELS.wrecks[4] = g('ship_wreck'); MODELS.wrecksLo[4] = g('ship_wreck', 1); }
  }
  for (const k of ['camp_core', 'camp_cargo', 'camp_pad', 'camp_lander', 'camp_turbine', 'camp_lights', 'comm_tower', 'scifi_crate', 'barrel', 'q_crate', 'q_crate_long', 'q_container', 'q_pod', 'base_pad', 'base_truck', 'bag', 'meat']) if (P[k]) MODELS[k] = g(k);
  if (P.flagpole) MODELS.obj.flagpole = g('flagpole');
  if (P.ore_rock && P.ore_rock2) { MODELS.oreRocks = [g('ore_rock'), g('ore_rock2')]; MODELS.oreRocksLo = [g('ore_rock', 1), g('ore_rock2', 1)]; }
  if (P.ore_works) MODELS.obj.maagitehas = g('ore_works');
}

