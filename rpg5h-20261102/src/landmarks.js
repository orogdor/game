import * as THREE from 'three';

export const createLandmarks = (scene, THREE) => {
  const landmarks = {};
  
  const createMesh = (geometry, material, position, rotation, scale) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.y = rotation;
    mesh.scale.setScalar(scale);
    scene.add(mesh);
    return mesh;
  };

  const createGroup = () => new THREE.Group();

  // Ancient Village
  landmarks.village = {
    group: createGroup(),
    buildings: [],
    addBuilding: (x, z) => {
      const geo = new THREE.BoxGeometry(2, 3, 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
      const mesh = createMesh(geo, mat, new THREE.Vector3(x, 1.5, z), Math.random() * 0.5, 1);
      landmarks.village.group.add(mesh);
      landmarks.village.buildings.push(mesh);
    }
  };

  // Broken Bridge
  landmarks.bridge = {
    group: createGroup(),
    segments: [],
    addSegment: (x, z) => {
      const geo = new THREE.BoxGeometry(4, 0.5, 1);
      const mat = new THREE.MeshStandardMaterial({ color: 0x6B5B4F });
      const mesh = createMesh(geo, mat, new THREE.Vector3(x, 0.25, z), 0, 1);
      landmarks.bridge.group.add(mesh);
      landmarks.bridge.segments.push(mesh);
    }
  };

  // Altar
  landmarks.altar = {
    group: createGroup(),
    add: () => {
      const geo = new THREE.CylinderGeometry(1.5, 2, 0.8, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x7D6E5A });
      const mesh = createMesh(geo, mat, new THREE.Vector3(0, 0.4, 0), Math.PI / 4, 1);
      landmarks.altar.group.add(mesh);
      
      const geo2 = new THREE.SphereGeometry(0.8, 16, 16);
      const mat2 = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
      const mesh2 = createMesh(geo2, mat2, new THREE.Vector3(0, 1.5, 0), 0, 1);
      landmarks.altar.group.add(mesh2);
    }
  };

  // Stairs
  landmarks.stairs = {
    group: createGroup(),
    steps: [],
    addStep: (x) => {
      const geo = new THREE.BoxGeometry(3, 0.15, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x7A6E5F });
      const mesh = createMesh(geo, mat, new THREE.Vector3(x, 0.15 * Math.floor(x), 0), 0, 1);
      landmarks.stairs.group.add(mesh);
      landmarks.stairs.steps.push(mesh);
    }
  };

  // Relic Monolith
  landmarks.monolith = {
    group: createGroup(),
    add: () => {
      const geo = new THREE.CylinderGeometry(0.5, 1, 4, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4A4A4A });
      const mesh = createMesh(geo, mat, new THREE.Vector3(0, 2, 0), Math.PI / 6, 1);
      landmarks.monolith.group.add(mesh);
      
      const geo2 = new THREE.BoxGeometry(0.8, 0.5, 0.8);
      const mat2 = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
      const mesh2 = createMesh(geo2, mat2, new THREE.Vector3(0, 4.5, 0), 0, 1);
      landmarks.monolith.group.add(mesh2);
    }
  };

  // Natural distribution near starting road
  const startRoadPos = new THREE.Vector3(0, 0, -20);
  
  landmarks.village.addBuilding(-5, -18);
  landmarks.village.addBuilding(5, -18);
  landmarks.village.addBuilding(-3, -22);
  landmarks.village.addBuilding(7, -22);
  
  landmarks.bridge.addSegment(-4, -10);
  landmarks.bridge.addSegment(-4, -6);
  landmarks.stairs.addStep(-5);
  landmarks.stairs.addStep(-4);
  landmarks.stairs.addStep(-3);
  
  landmarks.altar.add();
  landmarks.monolith.add();

  return landmarks;
};
