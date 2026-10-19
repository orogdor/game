// ============================================================
//  OSKUSTE TASEMED: mängija ja meeskond arenevad tegemise kaudu (0–5).
//  Tassimine -> rohkem kanda, võitlus -> julgem ja täpsem, töö -> kiirem, kõndimine -> vastupidavam.
// ============================================================
const Levels = (() => {
  const SK = {
    haul: { name: 'Hauling', short: 'Haul', th: [0, 60, 180, 420, 850, 1600], icon: '⬆' },     // koju toodud ühikud
    fight: { name: 'Combat', short: 'Fight', th: [0, 4, 12, 28, 55, 100], icon: '✦' },         // tapetud vaenlased
    work: { name: 'Work', short: 'Work', th: [0, 90, 300, 700, 1400, 2600], icon: '⚙' },       // töösekundid
    legs: { name: 'Endurance', short: 'Legs', th: [0, 2000, 6000, 14000, 28000, 50000], icon: '➜' },   // läbitud meetrid
  };
  const KEYS = Object.keys(SK);
  function data(who) { if (who === 'player') return (G.flags.plv = G.flags.plv || {}); return (who.xp = who.xp || {}); }
  function level(who, k) { if (!who) return 0; const x = data(who)[k] || 0, th = SK[k].th; let l = 0; while (l < 5 && x >= th[l + 1]) l++; return l; }
  function progress(who, k) { const l = level(who, k); if (l >= 5) return 1; const x = data(who)[k] || 0, th = SK[k].th; return clamp((x - th[l]) / (th[l + 1] - th[l]), 0, 1); }
  function add(who, k, v) {
    if (!who || !v) return;
    const d = data(who), before = level(who, k); d[k] = (d[k] || 0) + v; const after = level(who, k);
    if (after > before && typeof UI !== 'undefined') {
      const nm = who === 'player' ? 'You' : (who.name || 'Crew').split(' ')[0];
      UI.toast(nm + ' – ' + SK[k].name + ' level ' + after + ' · ' + perkText(who === 'player', k, after));
      if (typeof Audio2 !== 'undefined') Audio2.cash && Audio2.cash();
    }
  }
  function perkText(player, k, l) {
    if (k === 'haul') return player ? 'resources stack ' + Math.round(l * 20) + '% higher' : 'carries ' + Math.round(l * 15) + '% more per trip';
    if (k === 'fight') return player ? Math.round(l * 4) + '% more damage, less recoil' : 'braver, more accurate';
    if (k === 'work') return player ? 'actions ' + Math.round(l * 8) + '% faster' : 'works ' + Math.round(l * 8) + '% faster';
    return player ? '+' + l * 8 + ' max health, faster sprint' : 'walks ' + Math.round(l * 3) + '% faster';
  }
  function badges(who, player) {
    return '<div class="lvls">' + KEYS.map((k) => { const l = level(who, k); return `<span class="lv" title="${SK[k].name}: ${perkText(!!player, k, l)}"><b>${SK[k].short}</b> ${l}<i style="width:${Math.round(progress(who, k) * 100)}%"></i></span>`; }).join('') + '</div>';
  }
  // mõjud
  const crewCarry = (c) => 1 + level(c, 'haul') * 0.15;
  const crewWork = (c) => 1 + level(c, 'work') * 0.08;
  const crewSpeed = (c) => 1 + level(c, 'legs') * 0.03;
  const crewFear = (c) => 1 - level(c, 'fight') * 0.12;
  const crewAcc = (c) => level(c, 'fight') * 0.03;
  const pStack = () => 1 + level('player', 'haul') * 0.2;
  const pDmg = () => 1 + level('player', 'fight') * 0.04;
  const pHold = () => 1 - level('player', 'work') * 0.08;
  const pHp = () => 100 + level('player', 'legs') * 8;
  const pSprint = () => 1 + level('player', 'legs') * 0.02;
  return { SK, KEYS, level, progress, add, badges, perkText, crewCarry, crewWork, crewSpeed, crewFear, crewAcc, pStack, pDmg, pHold, pHp, pSprint };
})();
