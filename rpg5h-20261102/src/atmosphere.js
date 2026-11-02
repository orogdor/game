import * as THREE from 'three'

export function createAtmosphere(scene) {
  const params = {
    fogColor: new THREE.Color(0x1a2b4c),
    dayFog: new THREE.Color(0x87ceeb),
    duskFog: new THREE.Color(0xff6b35),
    nightFog: new THREE.Color(0x0d1b2a),
    particleCount: 500,
    time: 0.5,
    dayTime: 0.5,
    duskTime: 0.75,
    nightTime: 0.95
  }

  const fog = new THREE.FogExp2(params.fogColor, 10)
  scene.fog = fog

  const positions = new Float32Array(params.particleCount * 3)
  const colors = new Float32Array(params.particleCount * 3)
  const sizes = new Float32Array(params.particleCount)
  
  for (let i = 0; i < params.particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = Math.random() * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    sizes[i] = Math.random() * 2 + 0.5
    
    const color = new THREE.Color()
    color.setHSL(Math.random(), 0.7, 0.6)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  const material = new THREE.PointsMaterial({
    size: 0.5, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
  })
  
  const particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)

  return {
    update(dt) {
      params.time += dt * 0.2
      if (params.time > 1) params.time = 0
      
      const dayColor = params.dayFog.clone().lerp(params.nightFog, Math.min(1, params.time - params.duskTime))
      fog.color.lerpColors(dayColor, params.fogColor, params.time < 0.5 ? 1 : 0)
      
      const positions = geometry.attributes.position.array
      for (let i = 0; i < params.particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(params.time * 2 + i) * 0.05
      }
      geometry.attributes.position.needsUpdate = true
      
      const colors = geometry.attributes.color.array
      for (let i = 0; i < params.particleCount; i++) {
        const t = (params.time - params.duskTime) % 1
        const intensity = Math.sin(t * Math.PI * 2 + i * 0.1) * 0.5 + 0.5
        colors[i * 3] *= intensity
        colors[i * 3 + 1] *= intensity
        colors[i * 3 + 2] *= intensity
      }
      geometry.attributes.color.needsUpdate = true
    },
    dispose() {
      particleSystem.geometry.dispose()
      particleSystem.material.dispose()
    }
  }
}
