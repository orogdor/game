import * as THREE from 'three';

// Matches the live game contracts: hero.group, enemy.group and enemy.hp.
export function createCombat(scene, hero, enemies) {
  let cooldown = 0;
  const range = 2.65, damage = 25, interval = 0.55;
  return {
    attack() {
      if (hero.hp <= 0 || cooldown > 0) return false;
      cooldown = interval;
      hero.attackCooldown = interval;
      let target = null, nearest = range;
      for (const enemy of enemies) {
        if (!enemy.group || enemy.hp <= 0) continue;
        const distance = hero.group.position.distanceTo(enemy.group.position);
        if (distance < nearest) { nearest = distance; target = enemy; }
      }
      if (!target) return false;
      target.hp = Math.max(0, target.hp - damage);
      if (target.hp === 0) {
        scene.remove(target.group);
        const index = enemies.indexOf(target);
        if (index !== -1) enemies.splice(index, 1);
        hero.kills += 1;
        hero.gold += 10;
        hero.xp += 15;
      } else {
        const away = new THREE.Vector3().subVectors(target.group.position, hero.group.position);
        away.y = 0;
        if (away.lengthSq() > 0.0001) {
          away.normalize().multiplyScalar(0.4);
          target.group.position.add(away);
        }
      }
      return true;
    },
    update(dt) {
      cooldown = Math.max(0, cooldown - Math.max(0, dt));
      hero.attackCooldown = cooldown;
    }
  };
}
