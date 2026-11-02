import * as THREE from 'three';
export function createHero(scene){
 const hero=new THREE.Group();scene.add(hero);
 const armor=new THREE.MeshStandardMaterial({color:0x8b7355,roughness:.6,metalness:.4}),cloth=new THREE.MeshStandardMaterial({color:0x2a7894,roughness:.85}),skin=new THREE.MeshStandardMaterial({color:0xc49a75});
 const chest=new THREE.Mesh(new THREE.CylinderGeometry(.35,.38,1.2,16),armor);chest.position.y=1.5;hero.add(chest);
 const shoulders=[-1,1].map(s=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,0.9,12),armor);p.position.set(s*.35,1.65,0);hero.add(p)});
 const gauntlets=[-1,1].map(s=>{const g=new THREE.Mesh(new THREE.CylinderGeometry(.14,.17,0.8,10),armor);g.position.set(s*.55,1.25,0);hero.add(g)});
 const chestPlate=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.2),armor);chestPlate.position.y=1.4;hero.add(chestPlate);
 const backPlate=new THREE.Mesh(new THREE.BoxGeometry(.58,.25,.18),armor);backPlate.position.y=1.4;hero.add(backPlate);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),skin);head.position.y=2.35;hero.add(head);
 const helm=new THREE.Mesh(new THREE.ConeGeometry(.38,.56,8),armor);helm.position.y=2.75;hero.add(helm);
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.45,.08,.12),new THREE.MeshStandardMaterial({color:0x1a1a2e}));visor.position.set(0,2.65,0);hero.add(visor);
 for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.22,.24,1.3,12),armor);leg.position.set(side*.22,.62,0);hero.add(leg)};
 const boots=[-1,1].map(s=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,0.5,10),new THREE.MeshStandardMaterial({color:0x4a3b2a}));b.position.set(s*.22,.15,0);hero.add(b)});
 const sword=new THREE.Mesh(new THREE.BoxGeometry(.12,1.25,.18),armor);sword.position.set(.73,1.03,.3);sword.rotation.z=-.25;hero.add(sword);
 const shield=new THREE.Mesh(new THREE.CylinderGeometry(.45,.5,1.6,16),new THREE.MeshStandardMaterial({color:0x8b7355}));shield.position.set(-.5,-.1,-.8);hero.add(shield);
 const cape=new THREE.Mesh(new THREE.ConeGeometry(.25,.75,4),cloth);cape.position.y=1.6;cape.rotation.x=.3;hero.add(cape);
 hero.position.set(0,0,19);return {group:hero,hp:100,maxHp:100,xp:0,level:1,gold:0,kills:0,attackCooldown:0};
}
