export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  shoot: boolean
  mouseX: number
  mouseY: number
}

export class InputSystem {
  private keys: Set<string> = new Set()
  private mouseX: number = 0
  private mouseY: number = 0
  private shoot: boolean = false
  private canvas: HTMLCanvasElement
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.setupEventListeners()
  }
  
  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
    })
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })
    
    // 使用普通鼠标移动事件，不需要锁定指针
    this.canvas.addEventListener('mousemove', (e) => {
      // 只在画布内且鼠标按下时记录移动
      if (e.buttons === 2) { // 右键按下时旋转视角
        this.mouseX += e.movementX
        this.mouseY += e.movementY
      }
    })
    
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // 左键射击
        this.shoot = true
      }
    })
    
    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.shoot = false
      }
    })
    
    // 禁用右键菜单
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }
  
  public getInput(): InputState {
    const input: InputState = {
      forward: this.keys.has('KeyW'),
      backward: this.keys.has('KeyS'),
      left: this.keys.has('KeyA'),
      right: this.keys.has('KeyD'),
      shoot: this.shoot,
      mouseX: this.mouseX,
      mouseY: this.mouseY
    }
    
    // 重置鼠标移动增量
    this.mouseX = 0
    this.mouseY = 0
    
    // 重置射击状态（单发）
    this.shoot = false
    
    return input
  }
  
  public resetMouse(): void {
    this.mouseX = 0
    this.mouseY = 0
  }
}
