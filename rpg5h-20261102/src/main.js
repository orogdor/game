import * as THREE from 'three';
import {createWorld} from './world.js';
import {createHero} from './hero.js';
import {createInput} from './input.js';
import {spawnEnemies,updateEnemies} from './enemies.js';
import {createHUD} from './hud.js';
import {createParticles} from './particles.js';
import {createCombat} from './combat.js';
import {createItems} from './items.js';
import {createBoss} from './boss.js';

const scene=new THREE.Scene(),world=createWorld(scene),hero=createHero(scene),enemies=spawnEnemies(scene,9);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.getElementById('game').appendChild(renderer.domElement);
const input=createInput(),hud=createHUD(),clock=new THREE.Clock(),look=new THREE.Vector3(),follow=new THREE.Vector3();
let messageDelay=0,finished=false,killsRecorded=0,portalEntered=false,boss=null;
const effects=createParticles(scene,THREE);
const combat=createCombat(scene,hero,enemies);
const items=createItems(scene,THREE);

function spawnLoot(x,z){
  items.spawn(x,z,'coin');
  if(Math.random()<0.3)items.spawn(x,z,'xp');
  if(Math.random()<0.25)items.spawn(x,z,'potion');
}

function levelUp(){
  hero.level++;
  hero.maxHp+=20;
  hero.hp=hero.maxHp;
  hero.xp-=hero.level*100;
  hud.message(`✦ Tase ${hero.level-1} → ${hero.level}!`);
}

function saveState(){
  const state={
    hero:{position:hero.group.position.clone(),hp:hero.hp,maxHp:hero.maxHp,xp:hero.xp,level:hero.level,gold:hero.gold,kills:hero.kills},
    enemies:enemies.map(e=>({...e,group:e.group.position.clone()})),
    boss:boss?.group?.position?.clone()||null,
    portal:world.portal.position.clone(),
    killsRecorded:killsRecorded,
    portalEntered:portalEntered
  };
  localStorage.setItem('rpg_save',JSON.stringify(state));
}

function loadState(){
  const saved=localStorage.getItem('rpg_save');
  if(!saved)return;
  try{
    const state=JSON.parse(saved);
    hero.group.position.copy(state.hero.position);
    hero.hp=state.hero.hp;
    hero.maxHp=state.hero.maxHp;
    hero.xp=state.hero.xp;
    hero.level=state.hero.level;
    hero.gold=state.hero.gold;
    hero.kills=state.hero.kills;
    enemies.length=0;
    state.enemies.forEach(e=>{
      const enemy=createEnemy(scene,e.group.position.x,e.group.position.z);
      enemy.hp=e.hp;
      enemies.push(enemy);
    });
    if(state.boss){
      boss={group:new THREE.Group(),hp:100,maxHp:100};
      boss.group.position.copy(state.boss);
      scene.add(boss.group);
      const body=new THREE.Mesh(new THREE.BoxGeometry(2.5,3.5,1.5),new THREE.MeshStandardMaterial({color:0x1a1a1a}));
      body.position.y=1.75;boss.group.add(body);
      const core=new THREE.Mesh(new THREE.SphereGeometry(0.7),new THREE.MeshBasicMaterial({color:0xff3300}));
      boss.group.add(core);
    }
    world.portal.position.copy(state.portal);
    killsRecorded=state.killsRecorded;
    portalEntered=state.portalEntered;
  }catch(e){console.error('Load error:',e);}
}

function createEnemy(scene,x,z){
  const root=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,4,8),new THREE.MeshStandardMaterial({color:0x9a3a40,roughness:.85}));
  body.position.y=1.2;root.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.33,10,8),new THREE.MeshStandardMaterial({color:0x9a3a40}));head.position.y=2;root.add(head);
  for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),new THREE.MeshBasicMaterial({color:0xffbf65}));e.position.set(s*.13,2.06,.29);root.add(e);}
  const hornL=new THREE.Mesh(new THREE.ConeGeometry(.05,.25,8),new THREE.MeshStandardMaterial({color:0x9a3a40}));hornL.position.set(-.15,2.15,-.1);root.add(hornL);
  const hornR=new THREE.Mesh(new THREE.ConeGeometry(.05,.25,8),new THREE.MeshStandardMaterial({color:0x9a3a40}));hornR.position.set(.15,2.15,-.1);root.add(hornR);
  root.position.set(x,0,z);scene.add(root);
  return {group:root,hp:40,maxHp:40,speed:1.5,damage:7,attackCooldown:0};
}

function updateHUD(){
  const xpNeeded=hero.level*100;
  const xpProgress=Math.min(100,(hero.xp/xpNeeded)*100).toFixed(0);
  hud.update(hero);
  document.getElementById('stats').innerHTML=`❤ ${Math.max(0,Math.round(hero.hp))}/${hero.maxHp}  ·  ⚔ ${hero.kills}  ·  ✦ ${hero.gold}  ·  📊 Tase: ${hero.level}  ·  XP: ${xpProgress}%`;
  
  const questEl=document.querySelector('.mission');
  if(portalEntered){
    questEl.innerHTML='<b>ESIMENE ÜLESANNE</b><p>Värav on leitud! Võita kõik koletised!</p>';
  }else{
    questEl.innerHTML='<b>ESIMENE ÜLESANNE</b><p>Leidke põhja suunas hõõguv värav. Võitle koletistega!</p>';
  }
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
      for(const old of before)if(!enemies.includes(old.enemy)){spawnLoot(old.x,old.z);killsRecorded++;hero.kills++;updateHUD();}
    }
    combat.update(dt);
    updateEnemies(enemies,hero,dt);
    
    if(boss){
      boss.update(dt,hero);
      if(input.consumeAttack()){
        const dist=hero.group.position.distanceTo(boss.group.position);
        if(dist<5){boss.damage(20);}
      }
    }
    
    for(const type of items.update(dt,hero)){
      if(type==='coin')hero.gold+=5;
      if(type==='xp'){hero.xp+=10;if(hero.xp>=hero.level*100)levelUp();}
      if(type==='potion')hero.hp=Math.min(hero.maxHp,hero.hp+25);
    }
    
    if(boss&&boss.isDead()){
      scene.remove(boss.group);
      boss=null;
      hud.message('✦ BOSS VÕIDUD! ✦');
      finished=true;
    }
    
    if(hero.group.position.distanceTo(world.portal.position)<4){finished=true;portalEntered=true;hud.message('✦ Värav on leitud! Sa võitsid selle esimese prototüübi!');}
  }
  world.portal.rotation.z+=dt*.22;
  follow.set(hero.group.position.x+8,12,hero.group.position.z+14);
  camera.position.lerp(follow,Math.min(1,dt*4));
  look.set(hero.group.position.x,1.3,hero.group.position.z-3);
  camera.lookAt(look);
  effects.update(dt);
  updateHUD();
  renderer.render(scene,camera);
}

let lastSaveTime=Date.now();
const saveInterval=45000;
function checkAutoSave(){
  if(Date.now()-lastSaveTime>=saveInterval){
    saveState();
    lastSaveTime=Date.now();
  }
}
setInterval(checkAutoSave,100);

document.addEventListener('visibilitychange',()=>{
  if(document.hidden)saveState();
  else loadState();
});

loadState();

camera.position.set(8,12,33);animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
window.__rpg={scene,hero,enemies,world,camera,renderer,items,combat,boss};
