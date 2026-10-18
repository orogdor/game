// ============================================================
//  ÜLESANDED: juhatavad mängijat läbi esimeste päevade
// ============================================================
const Objectives = (() => {
  const L = [
    { id: 'gen', text: 'Repair the old generator', hint: 'Go to the generator in the main building and hold the action button.', done: () => G.flags.gen },
    { id: 'term', text: 'Repair the comms terminal', hint: 'The terminal is next to the generator. Needs 15 scrap.', done: () => G.flags.term },
    { id: 'salv', text: 'Salvage scrap from a wreck', hint: 'The nearest wreck is marked on the compass. Bring the loot to the base.', done: () => G.flags.salvaged },
    { id: 'kris', text: 'Collect comet diamonds', hint: 'Wait for a comet. When it falls, run to the diamonds before the rivals.', done: () => G.stats.crystals >= 6, prog: () => Math.min(6, G.stats.crystals) + '/6' },
    { id: 'sell', text: 'Sell diamonds at the terminal', hint: 'Diamonds go into storage when you get inside. Then open the terminal.', done: () => G.flags.sold },
    { id: 'room', text: 'Build a new room and put a bed in it', hint: 'Build → Wall: drag walls so the area closes. Then Items → Living → Bed.', done: () => Base.rooms.size >= 2 && Base.countBeds() >= 2 },
    { id: 'hire', text: 'Hire your first helper', hint: 'Terminal → Hiring. Everyone needs a bed and a daily wage.', done: () => Crew.count() >= 1 || G.flags.hiredOnce },
    { id: 'hunt', text: 'Hunt desert goats and butcher the meat', hint: 'Goats graze near the glowing plants. Rams fight back.', done: () => G.flags.hunted },
    { id: 'scan', text: 'Build the deep scanner', hint: 'Items → Work. Needs 4 power and 15 diamonds.', done: () => Base.objsOfType('skanner').length > 0 || G.scan.found },
    { id: 'nest', text: 'Find the Stoneheart\'s nest', hint: 'The scanner searches for days. The rivals are searching at the same time.', done: () => G.flags.nestKnown, prog: () => Math.floor(G.scan.p) + ' %' },
    { id: 'boss', text: 'Kill the Stoneheart', hint: 'Bring at least 8 fighters and an armed vehicle. Break the regrowing crystal nodes, then crack the heart with heavy weapons.', done: () => G.flags.bossDead },
    { id: 'stones', text: 'Bring the heartstones to the base', hint: 'They prove the kill: colonisation rights and a fortune. The rivals want them too.', done: () => G.flags.stonesHome },
  ];
  const doneSet = new Set();
  function current() { return L.find((o) => !doneSet.has(o.id)); }
  function check() {
    if (G.mode === 'title') return;
    for (const o of L) {
      if (!doneSet.has(o.id) && o.done()) {
        doneSet.add(o.id);
        if (G.flags.objInit) UI.toast('Objective complete: ' + o.text);
      }
    }
    G.flags.objInit = true;
    UI.updateObjective();
  }
  function reset() { doneSet.clear(); }
  function serialize() { return [...doneSet]; }
  function deserialize(a) { doneSet.clear(); for (const x of a || []) doneSet.add(x); }
  return { L, current, check, reset, serialize, deserialize, doneSet };
})();
