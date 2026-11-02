import * as THREE from 'three';
const skin=new THREE.MeshStandardMaterial({color:0x9a3a40,roughness:.85}),eyes=new THREE.MeshBasicMaterial({color:0xffbf65});
export function createEnemy(scene,x,z){
 const root=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,4,8),skin);
 body.position.y=1.2;root.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.33,10,8),skin);head.position.y=2;root.add(head);
 for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),eyes);e.position.set(s*.13,2.06,.29);root.add(e);}
 const hornL=new THREE.Mesh(new THREE.ConeGeometry(.05,.25,8),skin);hornL.position.set(-.15,2.15,-.1);root.add(hornL);
 const hornR=new THREE.Mesh(new THREE.ConeGeometry(.05,.25,8),skin);hornR.position.set(.15,2.15,-.1);root.add(hornR);
 const clawL=new THREE.Mesh(new THREE.TorusGeometry(.06,.03,4,8,Math.PI),skin);clawL.position.set(-.25,1.7,.2);clawL.rotation.x=Math.PI/2;root.add(clawL);
 const clawR=new THREE.Mesh(new THREE.TorusGeometry(.06,.03,4,8,Math.PI),skin);clawR.position.set(.25,1.7,.2);clawR.rotation.x=Math.PI/2;root.add(clawR);
 root.position.set(x,0,z);scene.add(root);
 return {group:root,hp:40,maxHp:40,speed:1.5,damage:7,attackCooldown:0};
}
export function spawnEnemies(scene,count=8){
 const enemies=[];
 for(let i=0;i<count;i++){const a=i*2.399,r=11+i*2.7;enemies.push(createEnemy(scene,Math.sin(a)*r,Math.cos(a)*r-12));}
 return enemies;
}
export function updateEnemies(enemies,hero,dt){
 for(const e of enemies){e.attackCooldown-=dt;
  const dx=hero.group.position.x-e.group.position.x,dz=hero.group.position.z-e.group.position.z,d=Math.hypot(dx,dz);
  if(d<15&&d>1.25){e.group.position.x+=dx/d*e.speed*dt;e.group.position.z+=dz/d*e.speed*dt;e.group.rotation.y=Math.atan2(dx,dz);}
  else if(d<=1.25&&e.attackCooldown<=0){hero.hp=Math.max(0,hero.hp-e.damage);e.attackCooldown=1.3;}
  const distToHero=d/Math.max(1,d-1.25);
  e.group.children[0].scale.setScalar(1+Math.min(distToHero*.3,0.4));
  if(e.group.children[2]&&e.group.children[3]){const cL=e.group.children[2],cR=e.group.children[3];
   cL.position.x=-.25*(1+distToHero);cR.position.x=.25*(1+distToHero);}
 }
}
