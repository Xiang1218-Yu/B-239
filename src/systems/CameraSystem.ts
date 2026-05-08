import * as THREE from 'three'

export class CameraSystem {
  private camera: THREE.PerspectiveCamera
  private target: THREE.Object3D | null = null
  
  // 相机偏移
  private offset = new THREE.Vector3(0, 8, 15)
  private lookAtOffset = new THREE.Vector3(0, 2, 0)
  
  // 平滑参数
  private smoothness = 5
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera
  }
  
  public setTarget(target: THREE.Object3D): void {
    this.target = target
  }
  
  public update(deltaTime: number): void {
    if (!this.target) return
    
    // 计算期望的相机位置（在目标后方）
    const desiredPosition = new THREE.Vector3()
    desiredPosition.copy(this.offset)
    desiredPosition.applyQuaternion(this.target.quaternion)
    desiredPosition.add(this.target.position)
    
    // 平滑插值到期望位置
    this.camera.position.lerp(desiredPosition, deltaTime * this.smoothness)
    
    // 相机看向目标稍微靠上的位置
    const lookAtPosition = new THREE.Vector3()
    lookAtPosition.copy(this.target.position)
    lookAtPosition.add(this.lookAtOffset)
    
    this.camera.lookAt(lookAtPosition)
  }
  
  public setOffset(x: number, y: number, z: number): void {
    this.offset.set(x, y, z)
  }
  
  public setSmoothness(value: number): void {
    this.smoothness = value
  }
}
