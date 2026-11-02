import * as THREE from 'three';
import {Hero} from './actors/hero.js';
import {createGround} from './world/terrain.js';
import {createRuinsGroup} from './world/ruins.js';
import {createPineTree} from './world/trees.js';
import {save,load} from './systems/save.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x172534);scene.fog=new THREE.Fog(0x172534,18,78);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;document.querySelector('#game').append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xb8d8ff,0x273119,2));const sun=new THREE.DirectionalLight(0xffd8a0,2.4);sun.position.set(-12,24,10);scene.add(sun);
const ground=createGround(120,120,0x324e38);scene.add(ground);
const ruins=createRuinsGroup();ruins.position.set(0,0,-26);scene.add(ruins);
for(let i=0;i<90;i++){const x=(Math.random()-.5)*105,z=(Math.random()-.5)*105;if(Math.abs(x)<6&&z>-31&&z<12)continue;const t=createPineTree(3+Math.random()*5);t.position.set(x,0,z);scene.add(t);}
const hero=new Hero(scene);hero.group.position.set(0,1.1,7);
const monsters=[];for(let i=0;i<6;i++){const group=new THREE.Group(),body=new THREE.Mesh(new THREE.DodecahedronGeometry(.7,1),new THREE.MeshStandardMaterial({color:0x743c4e,roughness:.7}));group.add(body);for(const dx of [-.4,.4]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.12),new THREE.MeshBasicMaterial({color:0xffce64}));eye.position.set(dx,.15,.62);group.add(eye);}group.position.set((Math.random()-.5)*17,1,-4-i*4);scene.add(group);monsters.push({group,hp:2});}
const keys=new Set();let attack=false,hp=100,kills=0,cooldown=0,won=false;const stats=document.querySelector('#stats'),quest=document.querySelector('#quest'),message=document.querySelector('#message');
addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.code==='Space'){attack=true;e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const dirs={up:'w',down:'s',left:'a',right:'d'};for(const b of document.querySelectorAll('[data-key]')){const k=dirs[b.dataset.key];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(k));}
document.querySelector('#attack').addEventListener('pointerdown',e=>{e.preventDefault();attack=true;});
const saved=load();if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)){hero.group.position.set(saved.x,1.1,saved.z);kills=saved.kills||0;hp=saved.hp||100;}
const clock=new THREE.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const v=new THREE.Vector3(dx,0,dz);if(v.lengthSq())v.normalize().multiplyScalar(7*dt);hero.group.position.add(v);hero.group.position.x=THREE.MathUtils.clamp(hero.group.position.x,-52,52);hero.group.position.z=THREE.MathUtils.clamp(hero.group.position.z,-52,52);
if(v.lengthSq())hero.group.rotation.y=Math.atan2(v.x,v.z);cooldown-=dt;if(attack&&cooldown<=0){cooldown=.45;hero.sword.rotation.x=-1.4;for(const m of monsters){if(m.hp>0&&m.group.position.distanceTo(hero.group.position)<3){m.hp--;if(m.hp<=0){scene.remove(m.group);kills++;message.textContent='Vaenlane alistatud!';}}}}attack=false;hero.sword.rotation.x=THREE.MathUtils.lerp(hero.sword.rotation.x,0,.12);
for(const m of monsters){if(m.hp<=0)continue;const toward=hero.group.position.clone().sub(m.group.position);toward.y=0;const d=toward.length();if(d<15&&d>1.5)m.group.position.addScaledVector(toward.normalize(),dt*1.3);if(d<1.6){hp=Math.max(0,hp-dt*5);}}
camera.position.lerp(hero.group.position.clone().add(new THREE.Vector3(0,9,13)),.07);camera.lookAt(hero.group.position.x,1,hero.group.position.z);stats.textContent='Elu '+Math.ceil(hp)+'  Videtud '+kills+'/3';if(kills>=3)quest.textContent='Mine helendavasse portaali!';if(kills>=3&&hero.group.position.distanceTo(ruins.position)<5&&!won){won=true;message.textContent='VIT! Sgaviku Vrav on avatud!';}
if(hp<=0){message.textContent='Kaotasid! Vrskenda mngu uuesti alustamiseks.';}renderer.render(scene,camera);}
frame();setInterval(()=>save({x:hero.group.position.x,z:hero.group.position.z,kills,hp}),10000);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});window.__rpg={scene,hero,monsters,renderer};