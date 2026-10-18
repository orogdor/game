// ============================================================
//  TOAESEMED, MIDA MEESKOND (JA MÄNGIJA) KASUTAB: igale toa ülesandele vähemalt üks kasulik asi
// ============================================================
const Gadgets = (() => {
  const day = () => G.time.day;
  const usesToday = (o) => (o.data.gDay === day() ? o.data.gUses || 0 : 0);
  const addUse = (o) => { if (o.data.gDay !== day()) { o.data.gDay = day(); o.data.gUses = 0; } o.data.gUses++; };
  const nearVehicle = (o, r = 10) => (typeof Vehicles !== 'undefined' ? Vehicles.list.find((v) => !v.dead && v.team === 'crew' && v.hp < v.maxHp && Math.hypot(v.x - o.cx, v.z - o.cz) < r) : null);

  // want(c, e, o): kas see inimene tahaks praegu seda kasutada; use(e, o): mis juhtub (e võib olla Player)
  const DEF = {
    kapp: { t: 4, act: 'Checking gear', perDay: 99,
      want: (c, e, o) => c.lockerDay !== day() && (Econ.hour() < 9 || Econ.hour() > 19),
      use: (e, o) => { const c = e.crew; if (c) { c.lockerDay = day(); c.morale = Math.min(100, c.morale + 5); } heal(e, 15); return 'Gear checked · +5 morale, +15 health'; } },
    kohvimasin: { t: 4, act: 'Making coffee', perDay: 40, power: true,
      want: (c, e, o) => c.energy < 60 && (c.coffeeDay !== day() || (c.coffees || 0) < 2),
      use: (e, o) => { const c = e.crew; if (c) { if (c.coffeeDay !== day()) { c.coffeeDay = day(); c.coffees = 0; } c.coffees++; c.energy = Math.min(100, c.energy + 30); c.morale = Math.min(100, c.morale + 2); } else Player.hp = Math.min(Player.maxHp, Player.hp + 5); return 'Coffee · +30 energy'; } },
    pesumasin: { t: 6, act: 'Doing laundry', perDay: 30, power: true,
      want: (c, e, o) => c.laundryDay !== day() && c.hygiene < 85,
      use: (e, o) => { const c = e.crew; if (c) { c.laundryDay = day(); c.cleanUntil = G.time.total + DAY_LEN; } return 'Clean clothes · hygiene drops half as fast for a day'; } },
    ravikapp: { t: 10, act: 'Packing medkits', perDay: 2, power: true,
      want: (c, e, o) => (G.stash.medkit || 0) < 6 && G.res.cr >= 15,
      use: (e, o) => { if (G.res.cr < 15) return null; G.res.cr -= 15; G.stash.medkit = (G.stash.medkit || 0) + 1; heal(e, 999); return 'Medkit packed into storage (15 ₵) · ' + G.stash.medkit + ' in storage'; } },
    moonapress: { t: 8, act: 'Pressing ammo', perDay: 4, power: true,
      want: (c, e, o) => G.res.scrap >= 2 && (G.stash.ammo_r || 0) < 300,
      use: (e, o) => { if (G.res.scrap < 2) return null; G.res.scrap -= 2; G.stash.ammo_r = (G.stash.ammo_r || 0) + 20; return '+20 rifle rounds to storage (2 scrap) · for the MG nest, buggy gun and your rifle'; } },
    treipink: { t: 10, act: 'Turning parts on the lathe', perDay: 3, power: true,
      want: (c, e, o) => true,
      use: (e, o) => { G.res.scrap += 3; return '+3 scrap from salvaged parts'; } },
    uurimislaud: { t: 12, act: 'Analysing samples', perDay: 2, power: true,
      want: (c, e, o) => true,
      use: (e, o) => { if (!G.scan.found) { G.scan.p = Math.min(99.5, (G.scan.p || 0) + 3); return 'Samples analysed · nest search +3 %'; } G.res.cr += 40; return 'Research data sold · +40 ₵'; } },
    raadiojaam: { t: 8, act: 'Listening to the radio', perDay: 3, power: true,
      want: (c, e, o) => true,
      use: (e, o) => {
        let n = 0; for (const s of Comets.activeSites()) if (!s.exact) { s.exact = true; n++; }
        let raid = '';
        if (typeof Rivals !== 'undefined') for (const r of Rivals.list) if (r.alive && r.raidT > 0 && r.raidT < DAY_LEN * 0.5) raid += ' · ' + r.short + ' raid expected in ~' + Math.max(1, Math.round(r.raidT / DAY_LEN * 24)) + ' h';
        if (raid) UI.msg('Radio: intercepted chatter' + raid + '.', 'warn');
        return (n ? n + ' comet impact site(s) located exactly' : 'Radio sweep done') + raid;
      } },
    piljard: { t: 12, act: 'Playing pool', perDay: 99,
      want: (c, e, o) => c.poolDay !== day() && Econ.hour() > 17,
      use: (e, o) => { const c = e.crew; if (c) { c.poolDay = day(); c.morale = Math.min(100, c.morale + 8); for (const m of Crew.members()) if (m !== e && Math.hypot(m.pos.x - o.cx, m.pos.z - o.cz) < 4) { c.rel[m.id] = (c.rel[m.id] || 0) + 6; m.crew.morale = Math.min(100, m.crew.morale + 3); } } return 'Pool game · +8 morale'; } },
    toovanker: { t: 10, act: 'Fixing a vehicle', perDay: 99,
      want: (c, e, o) => !!nearVehicle(o),
      use: (e, o) => { const v = nearVehicle(o); if (!v) return null; v.hp = Math.min(v.maxHp, v.hp + 150); return 'Vehicle repaired · ' + Math.round(v.hp) + '/' + v.maxHp + ' hp'; } },
  };
  function heal(e, n) { if (e === Player) Player.hp = Math.min(Player.maxHp, Player.hp + n); else e.hp = Math.min(e.maxHp, e.hp + n); }
  function usable(o) { const d = DEF[o.type]; return d && (!d.power || o.on) && !o.broken && usesToday(o) < d.perDay; }

  // meeskond: vali kasulik ese (kutsutakse chooseTask-ist)
  function crewChoice(e) {
    const c = e.crew; if (!c) return null;
    let best = null, bd = 1e9;
    for (const o of Base.objs.values()) {
      const d = DEF[o.type]; if (!d || !usable(o)) continue;
      if (o.data.gBusy && o.data.gBusy !== e.id && G.time.total - (o.data.gBusyT || 0) < 30) continue;
      if (!d.want(c, e, o)) continue;
      const dd = Math.hypot(o.cx - e.pos.x, o.cz - e.pos.z); if (dd < bd) { bd = dd; best = o; }
    }
    if (!best || bd > 90 || Math.random() < 0.35) return null;
    best.data.gBusy = e.id; best.data.gBusyT = G.time.total;
    return { type: 'gadget', step: 0, obj: best, t: DEF[best.type].t };
  }
  function apply(e, o) {
    const d = DEF[o.type]; if (!d || !usable(o)) return null;
    const msg = d.use(e, o); if (msg === null) return null;
    addUse(o); o.data.gBusy = 0; o.anim = 0;
    return msg;
  }
  // mängija interaktsioon
  function playerInteraction(o) {
    const d = DEF[o.type]; if (!d) return null;
    const nm = OBJ[o.type].name;
    if (d.power && !o.on) return { label: nm, sub: 'No power', disabled: true };
    if (usesToday(o) >= d.perDay) return { label: nm, sub: 'Used up for today', disabled: true };
    if (o.type === 'toovanker' && !nearVehicle(o)) return { label: nm, sub: 'Park a damaged vehicle next to it', disabled: true };
    return { label: OBJ[o.type].useLabel || 'Use: ' + nm, sub: OBJ[o.type].desc.split('.')[0], hold: Math.min(2.5, d.t / 3), act: () => { const m = apply(Player, o); if (m) { UI.toast(m); Audio2.pickup(); } else UI.toast('Nothing to do right now'); } };
  }
  function actText(type) { return DEF[type] ? DEF[type].act : 'Working'; }

  // ---------- mudelid ----------
  function initMeshes() {
    if (MODELS.obj.kapp) return;
    const DARK = [0.1, 0.1, 0.11], STEEL = [0.36, 0.37, 0.39], RED = [0.6, 0.12, 0.08];
    const mk = (fn) => { const b = new MB(); b.jit = 0; fn(b); return b.build(); };
    MODELS.obj.kapp = mk((b) => { for (const x of [-0.3, 0.3]) { b.color([0.32, 0.4, 0.34], MAT.RUST).boxB(x, 0, -0.55, 0.56, 1.9, 0.5); for (let k = 0; k < 3; k++) b.color(DARK).box(x, 1.55 + k * 0.05, -0.29, 0.3, 0.02, 0.02); b.color(STEEL).box(x + 0.18, 1.0, -0.29, 0.03, 0.14, 0.03); } });
    MODELS.obj.kohvimasin = mk((b) => { b.color([0.5, 0.36, 0.22], MAT.WORN).boxB(0, 0, -0.45, 0.9, 0.85, 0.6); b.color(STEEL, MAT.WORN).boxB(0, 0.85, -0.55, 0.45, 0.55, 0.38); b.color(DARK).boxB(0, 1.0, -0.35, 0.2, 0.12, 0.12); b.color([1, 0.4, 0.15], MAT.GLOW).box(0.15, 1.3, -0.35, 0.05, 0.05, 0.02); b.color([0.9, 0.9, 0.88]).cyl(-0.25, 0.85, -0.4, 0.05, 0.05, 0.1, 8, true); });
    MODELS.obj.pesumasin = mk((b) => { b.color([0.86, 0.86, 0.84], MAT.WORN).boxB(0, 0, -0.4, 0.75, 0.9, 0.7); b.push().tf(0, 0.45, -0.05, 0, Math.PI / 2, 0).color(DARK).cyl(0, -0.02, 0, 0.26, 0.26, 0.04, 16, true).color([0.4, 0.55, 0.65]).cyl(0, -0.03, 0, 0.2, 0.2, 0.05, 16, true).pop(); b.color(DARK).box(0.22, 0.82, -0.05, 0.2, 0.06, 0.02); });
    MODELS.obj.ravikapp = mk((b) => { b.color([0.9, 0.9, 0.9], MAT.WORN).boxB(0, 0, -0.6, 0.9, 1.9, 0.4); b.color(RED).box(0, 1.5, -0.39, 0.3, 0.1, 0.02); b.color(RED).box(0, 1.5, -0.39, 0.1, 0.3, 0.02); b.color([0.7, 0.85, 0.9]).box(0, 0.8, -0.39, 0.75, 0.6, 0.02); });
    MODELS.obj.moonapress = mk((b) => { b.color([0.3, 0.32, 0.26], MAT.WORN).boxB(0, 0, 0, 0.9, 0.85, 0.7); b.color(STEEL, MAT.WORN).boxB(0, 0.85, -0.1, 0.18, 0.9, 0.18); b.color(DARK).boxB(0, 1.55, 0, 0.5, 0.15, 0.45); b.push().tf(0.3, 1.62, 0, 0, 0, 0.5).color(STEEL).box(0, 0, 0, 0.5, 0.05, 0.05).pop(); b.color([0.75, 0.6, 0.2], MAT.WORN).boxB(-0.25, 0.85, 0.15, 0.2, 0.12, 0.2); });
    MODELS.obj.treipink = mk((b) => { b.color([0.28, 0.33, 0.36], MAT.WORN).boxB(0, 0, 0, 1.8, 0.8, 0.6); b.color(STEEL, MAT.WORN).boxB(-0.65, 0.8, 0, 0.4, 0.45, 0.45); b.color(STEEL).boxB(0.6, 0.8, 0, 0.3, 0.3, 0.35); b.push().tf(0, 1.02, 0, 0, 0, Math.PI / 2).color([0.6, 0.6, 0.62], MAT.WORN).cyl(0, -0.45, 0, 0.05, 0.05, 0.9, 10, true).pop(); b.color([0.9, 0.7, 0.1]).box(0, 0.6, 0.31, 1.6, 0.05, 0.02); });
    MODELS.obj.uurimislaud = mk((b) => { b.color([0.85, 0.86, 0.88], MAT.WORN).boxB(0, 0, 0, 1.0, 0.85, 0.75); b.color(DARK).boxB(-0.2, 0.85, -0.1, 0.18, 0.06, 0.25); b.color(STEEL).boxB(-0.2, 0.91, -0.15, 0.05, 0.4, 0.05); b.color(DARK).boxB(-0.2, 1.25, -0.05, 0.08, 0.2, 0.08); b.color([0.4, 0.8, 1.0], MAT.GLOW).box(0.25, 1.1, -0.2, 0.4, 0.28, 0.03); b.color(DARK).boxB(0.25, 0.85, -0.2, 0.05, 0.15, 0.05); b.color([0.6, 0.9, 1.0], MAT.GLOW).cyl(0.3, 0.85, 0.15, 0.04, 0.04, 0.12, 8, true); });
    MODELS.obj.raadiojaam = mk((b) => { b.color([0.32, 0.3, 0.26], MAT.WORN).boxB(0, 0, -0.1, 1.0, 0.8, 0.7); b.color(DARK, MAT.WORN).boxB(0, 0.8, -0.25, 0.85, 0.5, 0.35); for (let k = 0; k < 4; k++) b.color([0.2, 1, 0.4], MAT.GLOW).box(-0.3 + k * 0.12, 1.15, -0.07, 0.05, 0.03, 0.02); b.color([1, 0.6, 0.1], MAT.GLOW).box(0.25, 1.0, -0.07, 0.2, 0.12, 0.02); b.color(STEEL).cyl(0.4, 1.3, -0.3, 0.015, 0.01, 1.2, 6, true); b.color(DARK).boxB(-0.25, 0.8, 0.12, 0.25, 0.08, 0.15); });
    MODELS.obj.piljard = mk((b) => { b.color([0.32, 0.2, 0.12], MAT.WORN).boxB(0, 0.55, 0, 2.1, 0.23, 1.2); for (const [x, z] of [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]]) b.color([0.26, 0.16, 0.1], MAT.WORN).boxB(x, 0, z, 0.14, 0.56, 0.14); b.color([0.12, 0.42, 0.22], MAT.WORN).boxB(0, 0.78, 0, 1.9, 0.03, 1.0); for (const [x, z] of [[-0.95, -0.5], [0.95, -0.5], [-0.95, 0.5], [0.95, 0.5], [0, 0.5], [0, -0.5]]) b.color(DARK).cyl(x, 0.79, z, 0.05, 0.05, 0.02, 8, true); for (let k = 0; k < 5; k++) b.color(k % 2 ? [0.9, 0.85, 0.2] : [0.8, 0.15, 0.1]).cyl(0.3 + k * 0.06, 0.81, (k % 3) * 0.06 - 0.06, 0.028, 0.028, 0.056, 8, true); b.color([0.75, 0.6, 0.4]).box(-0.4, 0.84, 0.3, 1.1, 0.02, 0.02); });
    MODELS.obj.toovanker = mk((b) => { b.color([0.75, 0.1, 0.08], MAT.RUST).boxB(0, 0.12, 0, 0.9, 0.85, 0.55); for (let k = 0; k < 4; k++) b.color(DARK).box(0, 0.3 + k * 0.2, 0.28, 0.8, 0.02, 0.02); for (const [x, z] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) b.color(DARK).cyl(x, 0, z, 0.06, 0.06, 0.12, 8, true); b.color(STEEL, MAT.WORN).box(0.1, 1.02, 0, 0.5, 0.04, 0.08); b.color(STEEL).box(-0.25, 1.05, 0.05, 0.08, 0.08, 0.3); });
  }
  return { DEF, crewChoice, apply, playerInteraction, actText, initMeshes, usable };
})();
