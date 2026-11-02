import * as THREE from 'three';

export function createItems(scene, THREE3 = THREE) {
  const items = [];
  const maxItems = 24;
  function spawn(x, z, type) {
    if (items.length >= maxItems || !['coin','potion','xp'].includes(type)) return null;
    const geo = type === 'coin'
      ? new THREE3.CylinderGeometry(.3,.3,.1,12)
      : type === 'potion' ? new THREE3.SphereGeometry(.3,10,8) : new THREE3.OctahedronGeometry(.3);
    const mat = new THREE3.MeshStandardMaterial({
      color: type === 'coin' ? 0xffd34d : type === 'potion' ? 0x4fda70 : 0x50d9ff,
      metalness: type === 'coin' ? .65 : .05, roughness: .35,
      emissive: type === 'xp' ? 0x155b88 : 0x000000
    });
    const mesh = new THREE3.Mesh(geo,mat);
    mesh.position.set(x,.55,z);
    mesh.userData.type = type;
    scene.add(mesh);
    items.push(mesh);
    return mesh;
  }
  function update(dt, hero) {
    const heroPos = hero?.group?.position || hero?.position;
    const collected = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.rotation.y += dt * 2.4;
      item.position.y = .55 + Math.sin(item.rotation.y*1.5)*.12;
      if (heroPos && item.position.distanceTo(heroPos) < 1.55) {
        collected.push(item.userData.type);
        scene.remove(item);
        item.geometry.dispose();
        item.material.dispose();
        items.splice(i,1);
      }
    }
    return collected;
  }
  function dispose() {
    for (const item of items) {
      scene.remove(item); item.geometry.dispose(); item.material.dispose();
    }
    items.length = 0;
  }
  function list() {
    return items.map(item=>({type:item.userData.type,position:item.position.clone(),collected:false}));
  }
  return {spawn,update,dispose,list};
}
