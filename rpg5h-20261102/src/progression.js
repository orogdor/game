export function createProgression(hero) {
  const heroData = {
    level: 1,
    xp: 0,
    maxXp: 100,
    baseHp: 100,
    currentHp: 100,
    baseSkill: 10,
    skillMultiplier: 1.2,
    hpGrowth: 10,
    skillGrowth: 5,
    maxHpgrowth: 50,
    maxSkillGrowth: 30
  };

  function gain(amount) {
    heroData.xp += amount;
    if (heroData.xp >= heroData.maxXp) {
      levelUp();
    }
  }

  function levelUp() {
    heroData.level++;
    heroData.xp = 0;
    heroData.maxXp = Math.floor(heroData.maxXp * 1.5);
    const hpGrowth = Math.min(heroData.hpGrowth, heroData.maxHpgrowth);
    heroData.currentHp = heroData.baseHp + (heroData.level - 1) * hpGrowth;
    const cappedSkillGrowth = Math.min(heroData.skillGrowth, heroData.maxSkillGrowth);
    heroData.baseSkill += cappedSkillGrowth;
    heroData.skillMultiplier = Math.min(2.0, heroData.skillMultiplier + 0.1);
  }

  function getProgress() {
    const maxHp = heroData.baseHp + (heroData.level - 1) * heroData.hpGrowth;
    return {
      level: heroData.level,
      xp: heroData.xp,
      maxXp: heroData.maxXp,
      hp: heroData.currentHp,
      maxHp: maxHp,
      skill: heroData.baseSkill * heroData.skillMultiplier,
      progressPct: (heroData.xp / heroData.maxXp) * 100
    };
  }

  function update(dt) {
    // Optional passive XP gain from time
    const passiveGain = dt * 5;
    if (passiveGain > 0) gain(passiveGain);
    return getProgress();
  }

  return { gain, getProgress, update };
}
