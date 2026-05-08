import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Projectile {
  public mesh: THREE.Mesh
  public body: CANNON.Body
  private lifeTime: number = 0
  private maxLifeTime: number = 5
  private trail: THREE.Line | null = null
  private trailPoints: THREE.Vector3[] = []
  
  constructor(
    scene: THREE.Scene,
    world: CANNON.World,
    position: THREE.Vector3,
    direction: THREE.Vector3
  ) {
    // 创建炮弹网格
    const geometry = new THREE.SphereGeometry(0.15, 8, 8)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffb82e,
      emissive: 0xff8800,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(position)
    this.mesh.castShadow = true
    scene.add(this.mesh)
    
    // 添加光晕效果
    const light = new THREE.PointLight(0xffb82e, 2, 10)
    this.mesh.add(light)
    
    // 创建物理体
    const shape = new CANNON.Sphere(0.15)
    this.body = new CANNON.Body({
      mass: 5,
      shape: shape,
      linearDamping: 0.01
    })
    this.body.position.set(position.x, position.y, position.z)
    
    // 设置初速度
    const speed = 80
    this.body.velocity.set(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    )
    
    world.addBody(this.body)
    
    // 创建尾迹
    this.createTrail(scene)
  }
  
  private createTrail(scene: THREE.Scene): void {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({
      color: 0xffb82e,
      transparent: true,
      opacity: 0.6
    })
    
    this.trail = new THREE.Line(geometry, material)
    scene.add(this.trail)
  }
  
  public update(deltaTime: number): void {
    this.lifeTime += deltaTime
    
    // 同步网格和物理体
    this.mesh.position.copy(this.body.position as any)
    this.mesh.quaternion.copy(this.body.quaternion as any)
    
    // 更新尾迹
    if (this.trail) {
      this.trailPoints.push(this.mesh.position.clone())
      
      // 限制尾迹点数量
      if (this.trailPoints.length > 20) {
        this.trailPoints.shift()
      }
      
      const positions = new Float32Array(this.trailPoints.length * 3)
      this.trailPoints.forEach((point, i) => {
        positions[i * 3] = point.x
        positions[i * 3 + 1] = point.y
        positions[i * 3 + 2] = point.z
      })
      
      this.trail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      this.trail.geometry.attributes.position.needsUpdate = true
    }
  }
  
  public shouldRemove(): boolean {
    return this.lifeTime > this.maxLifeTime || this.mesh.position.y < -10
  }
  
  public destroy(scene: THREE.Scene, world: CANNON.World): void {
    scene.remove(this.mesh)
    world.removeBody(this.body)
    
    if (this.trail) {
      scene.remove(this.trail)
      this.trail.geometry.dispose()
      if (Array.isArray(this.trail.material)) {
        this.trail.material.forEach(mat => mat.dispose())
      } else {
        this.trail.material.dispose()
      }
    }
    
    this.mesh.geometry.dispose()
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(mat => mat.dispose())
    } else {
      this.mesh.material.dispose()
    }
    
    // 创建爆炸效果
    this.createExplosion(scene)
  }
  
  private createExplosion(scene: THREE.Scene): void {
    // 简单的粒子爆炸效果
    const particleCount = 20
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = this.mesh.position.x + (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = this.mesh.position.y + (Math.random() - 0.5) * 2
      positions[i * 3 + 2] = this.mesh.position.z + (Math.random() - 0.5) * 2
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0xff3333,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    })
    
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    
    // 2秒后移除粒子
    setTimeout(() => {
      scene.remove(particles)
      geometry.dispose()
      material.dispose()
    }, 2000)
  }
}
