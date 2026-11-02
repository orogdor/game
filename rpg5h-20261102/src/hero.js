import * as THREE from 'three';
export function createHero(scene){
 const hero=new THREE.Group();scene.add(hero);
 const cloth=new THREE.MeshStandardMaterial({color:0x2a7894,roughness:.85}),metal=new THREE.MeshStandardMaterial({color:0xbec5bc,metalness:.5,roughness:.4}),skin=new THREE.MeshStandardMaterial({color:0xc49a75});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.76,5,10),cloth);body.position.y=1.55;hero.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,8),skin);head.position.y=2.35;hero.add(head);
 const helm=new THREE.Mesh(new THREE.ConeGeometry(.38,.56,8),metal);helm.position.y=2.75;hero.add(helm);
 for(const side of [-1,1]){
   const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.6,4,6),metal);arm.position.set(side*.55,1.65,0);arm.rotation.z=side*.18;hero.add(arm);
   const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.7,4,6),cloth);leg.position.set(side*.22,.62,0);hero.add(leg);
 }
 const sword=new THREE.Mesh(new THREE.BoxGeometry(.12,1.25,.18),metal);sword.position.set(.73,1.03,.3);sword.rotation.z=-.25;hero.add(sword);
 hero.position.set(0,0,19);
 return {group:hero,hp:100,maxHp:100,xp:0,level:1,gold:0,kills:0,attackCooldown:0};
}
