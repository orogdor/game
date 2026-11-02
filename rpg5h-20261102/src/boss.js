import * as THREE from 'three';

export function createBoss(scene, THREE) {
  const group = new THREE.Group();
  const hp = 100;
  const maxHp = 100;
  
  // Dark silhouette body
  const bodyGeo = new THREE.BoxGeometry(2.5, 3.5, 1.5);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);
  
  // Horns
  const hornGeo = new THREE.ConeGeometry(0.35, 2, 8);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
  const horns = [
    new THREE.Mesh(hornGeo, hornMat),
    new THREE.Mesh(hornGeo, hornMat)
  ];
  horns[0].position.set(1.2, 2.5, 0);
  horns[0].rotation.z = -0.3;
  horns[1].position.set(-1.2, 2.5, 0);
  horns[1].rotation.z = 0.3;
  group.add(...horns);
  
  // Glowing core
  const coreGeo = new THREE.SphereGeometry(0.7);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);
  
  // Position at north
  group.position.set(0, 0, -15);
  scene.add(group);
  
  let attackCooldown = 0;
  let hitCooldown = 0;
  let telegraphing = false;
  let telegraphTimer = 0;
  let lastHitTime = 0;
  
  function update(dt, hero) {
    if (attackCooldown > 0) attackCooldown -= dt;
    if (hitCooldown > 0) hitCooldown -= dt;
    
    if (telegraphing && attackCooldown <= 0) {
      telegraphTimer += dt * 2;
      group.rotation.y = Math.sin(telegraphTimer) * 0.3;
      if (telegraphTimer > Math.PI) {
        telegraphing = false;
        telegraphTimer = 0;
        attackCooldown = 1.5;
      }
    } else if (!telegraphing && hero.position.z < -14) {
      telegraphing = true;
      telegraphTimer = 0;
    }
    
    if (hitCooldown <= 0) {
      group.scale.set(1.2, 1.2, 1.2);
      hitCooldown = 0.3;
    } else {
      group.scale.lerp(new THREE.Vector3(1, 1, 1), dt * 5);
    }
    
    core.material.color.setHSL(0.08, 1, 0.5 + Math.sin(Date.now() * 0.005) * 0.2);
  }
  
  function damage(amount) {
    hp = Math.max(0, hp - amount);
    lastHitTime = Date.now();
    hitCooldown = 0.5;
    return hp <= 0;
  }
  
  function isDead() {
    return hp <= 0;
  }
  
  return { group, hp, maxHp, update, damage, isDead };
}
