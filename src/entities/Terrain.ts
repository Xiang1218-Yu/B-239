import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Terrain {
  public mesh: THREE.Mesh
  public body: CANNON.Body
  
  constructor(scene: THREE.Scene, world: CANNON.World) {
    // 创建地形网格
    const size = 200
    const segments = 50
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
    
    // 添加高度变化
    const positions = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 1]
      // 简单的正弦波地形
      positions[i + 2] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2
    }
    geometry.computeVertexNormals()
    
    // 创建材质
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a5f4d,
      roughness: 0.8,
      metalness: 0.2,
      flatShading: false
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    scene.add(this.mesh)
    
    // 创建物理体（平坦的地面）
    const groundShape = new CANNON.Plane()
    this.body = new CANNON.Body({
      mass: 0, // 静态物体
      shape: groundShape
    })
    // 将平面旋转，使其水平朝上（法线朝向+Y）
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(this.body)
    
    // 添加网格线（方便观察）
    const gridHelper = new THREE.GridHelper(size, segments, 0x8b9d8a, 0x4a5f4d)
    gridHelper.position.y = 0.1
    scene.add(gridHelper)
  }
}
