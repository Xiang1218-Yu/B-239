import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import type { InputState } from '../systems/InputSystem'
import { Projectile } from './Projectile'

export class Tank {
  public mesh: THREE.Group
  public body: CANNON.Body
  
  private hull: THREE.Mesh
  private turret: THREE.Mesh
  private barrel: THREE.Mesh
  
  // 运动参数
  private speed = 15
  private rotationSpeed = 2
  private turretRotationSpeed = 0.002
  
  // 炮塔旋转角度
  private turretRotation = 0
  private barrelElevation = 0
  
  constructor(scene: THREE.Scene, world: CANNON.World, position: { x: number, y: number, z: number }) {
    // 创建坦克组
    this.mesh = new THREE.Group()
    
    // 车体
    const hullGeometry = new THREE.BoxGeometry(3, 1.5, 4)
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a4a3d,
      roughness: 0.7,
      metalness: 0.5
    })
    this.hull = new THREE.Mesh(hullGeometry, hullMaterial)
    this.hull.castShadow = true
    this.hull.receiveShadow = true
    this.mesh.add(this.hull)
    
    // 炮塔
    const turretGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 8)
    const turretMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3a2e,
      roughness: 0.6,
      metalness: 0.6
    })
    this.turret = new THREE.Mesh(turretGeometry, turretMaterial)
    this.turret.position.y = 1.25
    this.turret.castShadow = true
    this.turret.receiveShadow = true
    this.mesh.add(this.turret)
    
    // 炮管
    const barrelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8)
    const barrelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1f1e,
      roughness: 0.4,
      metalness: 0.8
    })
    this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
    this.barrel.rotation.z = Math.PI / 2
    this.barrel.position.set(1.5, 0, 0)
    this.barrel.castShadow = true
    this.turret.add(this.barrel)
    
    // 添加履带装饰
    this.addTracks()
    
    // 设置位置
    this.mesh.position.set(position.x, position.y, position.z)
    scene.add(this.mesh)
    
    // 创建物理体
    const shape = new CANNON.Box(new CANNON.Vec3(1.5, 0.75, 2))
    this.body = new CANNON.Body({
      mass: 1000,
      shape: shape,
      linearDamping: 0.9,  // 增大线性阻尼，防止滑行
      angularDamping: 0.8,  // 增大角阻尼，防止过度旋转
      fixedRotation: false,  // 允许旋转
      allowSleep: false  // 不休眠，保持活跃
    })
    this.body.position.set(position.x, position.y, position.z)
    
    // 锁定X和Z轴的旋转，只允许Y轴旋转（防止翻车）
    this.body.angularFactor.set(0, 1, 0)
    
    world.addBody(this.body)
  }
  
  private addTracks(): void {
    // 简单的履带装饰
    const trackGeometry = new THREE.BoxGeometry(2.5, 0.5, 5)
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1f1e,
      roughness: 0.9,
      metalness: 0.3
    })
    
    const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial)
    leftTrack.position.set(-1.5, -0.5, 0)
    leftTrack.castShadow = true
    this.mesh.add(leftTrack)
    
    const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial)
    rightTrack.position.set(1.5, -0.5, 0)
    rightTrack.castShadow = true
    this.mesh.add(rightTrack)
  }
  
  public update(deltaTime: number, input: InputState): void {
    // 移动控制
    const velocity = new CANNON.Vec3()
    const forward = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3(1, 0, 0)
    forward.applyQuaternion(this.mesh.quaternion)
    right.applyQuaternion(this.mesh.quaternion)
    
    // W/S 前后移动
    if (input.forward) {
      velocity.x += forward.x * this.speed
      velocity.z += forward.z * this.speed
    }
    if (input.backward) {
      velocity.x -= forward.x * this.speed
      velocity.z -= forward.z * this.speed
    }
    
    // A/D 车体左右旋转
    if (input.left) {
      this.body.angularVelocity.y = this.rotationSpeed
    } else if (input.right) {
      this.body.angularVelocity.y = -this.rotationSpeed
    } else {
      this.body.angularVelocity.y = 0
    }
    
    // 只设置水平方向的速度，保留Y轴（垂直）速度不变
    this.body.velocity.x = velocity.x
    this.body.velocity.z = velocity.z
    
    // 炮塔独立控制（鼠标水平移动控制炮塔旋转）
    this.turretRotation -= input.mouseX * this.turretRotationSpeed
    
    // 炮管仰角控制（鼠标垂直移动）
    this.barrelElevation -= input.mouseY * this.turretRotationSpeed
    
    // 限制炮管仰角
    this.barrelElevation = Math.max(-0.2, Math.min(0.3, this.barrelElevation))
    
    // 应用炮塔和炮管旋转
    this.turret.rotation.y = this.turretRotation
    this.barrel.rotation.y = this.barrelElevation
    
    // 同步物理体和网格
    this.mesh.position.copy(this.body.position as any)
    this.mesh.quaternion.copy(this.body.quaternion as any)
  }
  
  public shoot(scene: THREE.Scene, world: CANNON.World): Projectile {
    // 计算炮弹发射位置和方向
    const barrelEnd = new THREE.Vector3(3, 0, 0)
    barrelEnd.applyQuaternion(this.turret.quaternion)
    barrelEnd.applyQuaternion(this.mesh.quaternion)
    barrelEnd.add(this.mesh.position)
    barrelEnd.y += 1.25
    
    // 发射方向
    const direction = new THREE.Vector3(1, 0, 0)
    direction.applyQuaternion(this.turret.quaternion)
    direction.applyQuaternion(this.mesh.quaternion)
    direction.normalize()
    
    return new Projectile(scene, world, barrelEnd, direction)
  }
}
