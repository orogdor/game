import * as THREE from 'three';

export function createRuinsGroup() {
    const group = new THREE.Group();

    // Castle Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), 
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1 }));
    group.add(base);

    // Main Tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), 
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 }));
    tower.position.y = 3; group.add(tower);

    // Ruins Debris
    const debrisGeos = [new THREE.BoxGeometry(1, 1, 1), 
        new THREE.BoxGeometry(2, 0.5, 1)];
    debrisGeos.forEach((geo, i) => {
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x333333 })); group.add(mesh);
        mesh.position.set(i * 2, 0.5 + Math.random(), 0);
    });

    // Portal Ring
    const portalGeo = new THREE.TorusGeometry(1.5, 0.4, 64, 8);
    const portalMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, emissive: 0x00ffff, emissivity: 0.8, transparent: true, opacity: 0.7 
    });
    const ring = new THREE.Mesh(portalGeo, portalMat); ring.position.set(0,2.5,4.3); group.add(ring);

    // Portal Core
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), 
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }));
    core.position.set(0,2.5,4.3); group.add(core);

    return group;
}