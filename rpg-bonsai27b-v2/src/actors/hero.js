import * as THREE from 'three';

export class Hero {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x777, roughness: 0.8 });
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.6), armorMat);
    this.group.add(chest);

    const helmMat = new THREE.MeshStandardMaterial({ color: 0x333 });
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16), helmMat);
    this.group.add(helm);

    const swordMat = new THREE.MeshStandardMaterial({ color: 0xccc });
    this.sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.02), swordMat);
    this.sword.position.set(0.6, 1, -0.3);
    this.group.add(this.sword);

    this.speed = 0;
  }

  update(dt) {
    const t = Date.now() * 0.001;
    this.group.position.y += Math.sin(t) * 0.02;
    if (this.speed > 0) {
      this.sword.rotation.x = Math.sin(t * this.speed) * 0.6;
    }
  }

  move(dx, dy, dz, dt) {
    this.group.position.x += dx * dt;
    this.group.position.y += dy * dt;
    this.group.position.z += dz * dt;
  }

  lookAt(x, y, z) {
    this.group.lookAt(x, y, z);
  }

  setSpeed(v) { this.speed = v; }
}