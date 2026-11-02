import * as THREE from 'three'

export function createParticles(scene, THREE) {
  const MAX_PARTICLES = 500
  const PARTICLES = []
  let geometry, material
  
  function init() {
    geometry = new THREE.BufferGeometry()
    material = new THREE.PointsMaterial({
      size: 2,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    })
    
    const points = new THREE.Points(geometry, material)
    scene.add(points)
  }
  
  function burst(position, color, count = 10) {
    for (let i = 0; i < count; i++) {
      if (PARTICLES.length >= MAX_PARTICLES) return
      
      const particle = {
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 1,
        color: color || 0xffffff
      }
      
      particle.position.copy(position).add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )
      )
      
      particle.velocity.set(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      )
      
      particle.life = Math.random() * 0.5 + 0.5
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(
        PARTICLES.map(p => p.position), 3
      ))
    }
  }
  
  function update(dt) {
    const positions = []
    
    for (let i = 0; i < PARTICLES.length; i++) {
      const p = PARTICLES[i]
      
      p.position.add(p.velocity.clone().multiplyScalar(dt))
      p.life -= dt
      
      if (p.life > 0) {
        positions.push(p.position.x, p.position.y, p.position.z)
      } else {
        PARTICLES.splice(i, 1)
        i--
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(
      positions.flat(), 3
    ))
    
    const colors = []
    for (let i = 0; i < PARTICLES.length; i++) {
      const p = PARTICLES[i]
      const alpha = Math.min(p.life * 1.5, 1)
      colors.push(p.color.r, p.color.g, p.color.b, alpha)
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(
      colors.flat(), 4
    ))
  }
  
  function dispose() {
    if (geometry) {
      geometry.dispose()
      geometry = null
    }
    if (material) {
      material.dispose()
      material = null
    }
    PARTICLES.length = 0
  }
  
  init()
  
  return { burst, update, dispose }
}
