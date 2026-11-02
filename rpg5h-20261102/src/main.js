import * as THREE from 'three';
import {createWorld} from './world.js';
import {createHero} from './hero.js';
import {createInput} from './input.js';
import {spawnEnemies,updateEnemies} from './enemies.js';
import {createHUD} from './hud.js';
import {createParticles} from './particles.js';
import {createCombat} from './combat.js';
import {createItems} from './items.js';

const scene=new THREE.Scene(),world=createWorld(scene),hero=createHero(scene),enemies=spawnEnemies(scene,9);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.getElementById('game').appendChild(renderer.domElement);
const input=createInput(),hud=createHUD(),clock=new THREE.Clock(),look=new THREE.Vector3(),follow=new THREE.Vector3();
let messageDelay=0,finished=false;
const effects=createParticles(scene,THREE);
const combat=createCombat(scene,hero,enemies);
const items=createItems(scene,THREE);

function spawnLoot(x,z){
 items.spawn(x,z,'coin');
 if(Math.random()<0.3)items.spawn(x,z,'xp');
 if(Math.random()<0.25)items.spawn(x,z,'potion');
}

function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.06);
 if(hero.hp>0&&!finished){
  const dir=input.direction();
  hero.group.position.x=THREE.MathUtils.clamp(hero.group.position.x+dir.x*6*dt,-world.bounds,world.bounds);
  hero.group.position.z=THREE.MathUtils.clamp(hero.group.position.z+dir.z*6*dt,-world.bounds,world.bounds);
  if(dir.x||dir.z)hero.group.rotation.y=Math.atan2(dir.x,dir.z);
  if(input.consumeAttack()){
    const before=enemies.map(enemy=>({enemy,x:enemy.group.position.x,z:enemy.group.position.z}));
    combat.attack();
    for(const old of before)if(!enemies.includes(old.enemy))spawnLoot(old.x,old.z);
  }
  combat.update(dt);
  updateEnemies(enemies,hero,dt);
  
  for(const type of items.update(dt,hero)){
    if(type==='coin')hero.gold+=5;
    if(type==='xp')hero.xp+=10;
    if(type==='potion')hero.hp=Math.min(hero.maxHp,hero.hp+25);
  }
  
  if(hero.group.position.distanceTo(world.portal.position)<4){finished=true;hud.message('✦ Värav on leitud! Sa võitsid selle esimese prototüübi!');}
 }
 world.portal.rotation.z+=dt*.22;
 follow.set(hero.group.position.x+8,12,hero.group.position.z+14);
 camera.position.lerp(follow,Math.min(1,dt*4));
 look.set(hero.group.position.x,1.3,hero.group.position.z-3);
 camera.lookAt(look);
 effects.update(dt);
 hud.update(hero);renderer.render(scene,camera);
}
camera.position.set(8,12,33);animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
window.__rpg={scene,hero,enemies,world,camera,renderer,items,combat};
