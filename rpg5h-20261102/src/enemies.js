import * as THREE from 'three';
const skin=new THREE.MeshStandardMaterial({color:0x9a3a40,roughness:.85}),eyes=new THREE.MeshBasicMaterial({color:0xffbf65});
export function createEnemy(scene,x,z){
 const root=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,4,8),skin);
 body.position.y=1.2;root.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.33,10,8),skin);head.position.y=2;root.add(head);
 for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),eyes);e.position.set(s*.13,2.06,.29);root.add(e);}
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
 }
}
