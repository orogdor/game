import { Mesh, PlaneGeometry, MeshStandardMaterial, Vector3 } from 'three';

export function createGround(width = 100, height = 100, color = 0x4a7c59, position = new Vector3(), rotation = new Vector3()) {
    const geo = new PlaneGeometry(width, height);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setZ(i, Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5);
    }
    const mat = new MeshStandardMaterial({ color });
    const mesh = new Mesh(geo, mat); mesh.rotation.x = -Math.PI/2;
    
    if (position) mesh.position.copy(position);
    if (rotation) mesh.rotation.copy(rotation);
    
    return mesh;
}

export function createRoad(length = 20, width = 6, position = new Vector3(), rotation = new Vector3()) {
    const geo = new PlaneGeometry(length, width);
    const mat = new MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    const mesh = new Mesh(geo, mat); mesh.rotation.x = -Math.PI/2;
    
    if (position) mesh.position.copy(position);
    if (rotation) mesh.rotation.copy(rotation);
    
    return mesh;
}