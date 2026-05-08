import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Target {
  public mesh: THREE.Mesh
  public body: CANNON.Body
  private destroyed: boolean = false
  
  constructor(
    scene: THREE.Scene, 
    world: CANNON.World, 
    position: { x: number, y: number, z: number }
  ) {
    // 创建木箱外观
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // 棕色木箱
      roughness: 0.8,
      metalness: 0.1
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(position.x, position.y, position.z)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)
    
    // 创建物理体
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
    this.body = new CANNON.Body({
      mass: 100,
      shape: shape
    })
    this.body.position.set(position.x, position.y, position.z)
    world.addBody(this.body)
  }
  
  public update(): void {
    if (!this.destroyed) {
      // 同步物理体和网格
      this.mesh.position.copy(this.body.position as any)
      this.mesh.quaternion.copy(this.body.quaternion as any)
    }
  }
  
  public checkHit(projectilePosition: THREE.Vector3): boolean {
    if (this.destroyed) return false
    
    // 简单的距离检测
    const distance = this.mesh.position.distanceTo(projectilePosition)
    return distance < 1.5 // 如果炮弹在1.5米内就算击中
  }
  
  public destroy(scene: THREE.Scene, world: CANNON.World): void {
    if (this.destroyed) return
    
    this.destroyed = true
    
    // 移除网格和物理体
    scene.remove(this.mesh)
    world.removeBody(this.body)
    
    // 清理资源
    this.mesh.geometry.dispose()
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(mat => mat.dispose())
    } else {
      this.mesh.material.dispose()
    }
  }
  
  public isDestroyed(): boolean {
    return this.destroyed
  }
}
