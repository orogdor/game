import * as THREE from 'three';
const mats={grass:new THREE.MeshStandardMaterial({color:0x344d35,roughness:.9}),dirt:new THREE.MeshStandardMaterial({color:0x6b6041,roughness:.8}),bark:new THREE.MeshStandardMaterial({color:0x44392f,roughness:.7}),leaves:new THREE.MeshStandardMaterial({color:0x244c36,roughness:.5}),stone:new THREE.MeshStandardMaterial({color:0x5e696c,roughness:.8})};
const rand=(n)=>{let x=Math.sin(n*93.71+1.43)*47521;return x-Math.floor(x);};
export function createWorld(scene){
 scene.background=new THREE.Color(0x101e2a);scene.fog=new THREE.FogExp2(0x101e2a,0.024);
 scene.add(new THREE.HemisphereLight(0x9bcbf4,0x334124,2.0));
 const sun=new THREE.DirectionalLight(0xffe8b0,2.3);sun.position.set(-35,70,30);scene.add(sun);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(170,170),mats.grass);floor.rotation.x=-Math.PI/2;scene.add(floor);
 const path=new THREE.Mesh(new THREE.PlaneGeometry(10,130),mats.dirt);path.rotation.x=-Math.PI/2;path.position.y=.025;scene.add(path);
 const root=new THREE.Group();scene.add(root);
 const trunkGeo=new THREE.CylinderGeometry(.35,.55,5,7),leafGeo=new THREE.ConeGeometry(2.5,6,7);
 for(let i=0;i<115;i++){
   const x=(rand(i+7)-.5)*144,z=(rand(i+990)-.5)*144;
   if(Math.abs(x)<7&&Math.abs(z)<63)continue;
   const tree=new THREE.Group(),trunk=new THREE.Mesh(trunkGeo,mats.bark);
   trunk.position.y=2.5;tree.add(trunk);
   for(let j=0;j<2;j++){const crown=new THREE.Mesh(leafGeo,mats.leaves);crown.position.y=5.8+j*1.8;crown.scale.setScalar(.84-j*.16,1-j*.18,.84-j*.16);tree.add(crown);}
   tree.position.set(x,0,z);tree.scale.setScalar(.7+rand(i+75)*.85);root.add(tree);
 }
 for(let i=0;i<65;i++){
   const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+rand(i+300)*1.2,0),mats.stone);
   rock.position.set((rand(i+101)-.5)*140,.16+(rand(i+9)*.7)*.1,(rand(i+871)-.5)*140);
   rock.scale.set(1,.35+rand(i+9)*.7,.9);root.add(rock);
 }
 const ruin=new THREE.Group(),block=new THREE.BoxGeometry(1.6,5,1.6);
 for(const x of [-6,6])for(const z of [-8,8]){const pillar=new THREE.Mesh(block,mats.stone);pillar.position.set(x,2.5,z);ruin.add(pillar);}
 const arch=new THREE.Mesh(new THREE.BoxGeometry(15,1.2,2),mats.stone);arch.position.set(0,5.2,-8);ruin.add(arch);
 ruin.position.z=-24;scene.add(ruin);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(3,.23,8,36),new THREE.MeshStandardMaterial({color:0x39a5be,emissive:0x087e9f,emissiveIntensity:2}));ring.position.set(0,3,-32);scene.add(ring);
 const glow=new THREE.PointLight(0x24c0ff,18,18);glow.position.set(0,3,-32);scene.add(glow);
 return {portal:ring,glow,bounds:75};
}
