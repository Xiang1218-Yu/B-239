# 玩家操作后 输入→更新→渲染 协作流程

## 一、整体架构概览

项目采用经典的 **游戏主循环 (Game Loop)** 架构，核心调度中心为 `Game.ts` 中的 `animate()` 方法。每一帧依次执行：

```
输入采集 → 物理步进 → 逻辑更新 → 相机更新 → 画面渲染
```

三个核心模块：

| 模块 | 入口类 | 职责 |
|------|--------|------|
| 输入 | `InputSystem` | 监听键盘/鼠标事件，输出 `InputState` |
| 更新 | `Game.animate()` + 各实体 `update()` | 物理步进、坦克移动、炮弹飞行、碰撞检测、状态变更 |
| 渲染 | `THREE.WebGLRenderer` + `CameraSystem` | 相机跟随、Three.js 场景绘制 |

---

## 二、主循环流程图

```mermaid
flowchart TD
    A["🎮 玩家操作<br/>键盘 W/S/A/D · 鼠标左键/右键"] --> B

    subgraph 输入模块 ["📥 输入模块 (InputSystem)"]
        B["监听 window keydown/keyup<br/>记录按键状态到 keys:Set"]
        C["监听 canvas mousemove(movementX/Y)<br/>累计鼠标偏移量"]
        D["监听 canvas mousedown/mouseup<br/>设置 shoot 标志"]
        B & C & D --> E["getInput() 打包为 InputState<br/>{forward, backward, left, right,<br/>shoot, mouseX, mouseY}<br/>⚠️ 调用后重置鼠标增量与 shoot"]
    end

    E --> F

    subgraph 更新模块 ["🔄 更新模块 (Game.animate)"]
        F["requestAnimationFrame 回调"] --> G["clock.getDelta() 获取 deltaTime"]
        G --> H["world.step(1/60, deltaTime, 3)<br/>Cannon.js 物理世界步进"]

        H --> I["inputSystem.getInput()<br/>获取当前帧输入状态"]
        I --> J["playerTank.update(deltaTime, input)<br/>根据 input 设置坦克速度/旋转/炮塔角度<br/>同步 mesh ← body 位置"]

        I --> K{"input.shoot && ammo > 0?"}
        K -- 是 --> L["shoot()<br/>ammo-- · 创建 Projectile<br/>加入 projectiles[]"]

        J --> M["遍历 projectiles[] 更新炮弹<br/>projectile.update(deltaTime)<br/>同步 mesh ← body 位置 + 更新尾迹"]
        L --> M

        M --> N{"炮弹 vs 目标碰撞检测<br/>target.checkHit(projectile.position)"}
        N -- 击中 --> O["target.destroy() · projectile.destroy()<br/>score += 100 · 生成爆炸粒子"]
        N -- 未击中 --> P{"projectile.shouldRemove()?<br/>超时/坠地"}
        P -- 是 --> Q["projectile.destroy() 移除炮弹"]
        P -- 否 --> R["保留炮弹到下一帧"]

        O --> S["targets.forEach target.update()<br/>同步未摧毁目标的 mesh ← body"]
        Q --> S
        R --> S
    end

    S --> T

    subgraph 渲染模块 ["🎨 渲染模块"]
        T["cameraSystem.update(deltaTime)<br/>根据坦克位置计算期望相机位置<br/>lerp 平滑插值 · lookAt 坦克上方"]
        T --> U["renderer.render(scene, camera)<br/>Three.js 绘制完整场景"]
    end

    U -->|"下一帧"| F

    style 输入模块 fill:#e8f5e9,stroke:#4caf50,color:#1b5e20
    style 更新模块 fill:#fff3e0,stroke:#ff9800,color:#e65100
    style 渲染模块 fill:#e3f2fd,stroke:#2196f3,color:#0d47a1
```

---

## 三、输入模块详细流程

```mermaid
flowchart LR
    subgraph 事件源
        KBD["⌨️ 键盘事件"]
        MSE["🖱️ 鼠标事件"]
    end

    KBD -->|"keydown"| A["keys.add(e.code)"]
    KBD -->|"keyup"| B["keys.delete(e.code)"]

    MSE -->|"mousemove (右键按下)"| C["mouseX += movementX<br/>mouseY += movementY"]
    MSE -->|"mousedown (左键)"| D["shoot = true"]
    MSE -->|"mouseup (左键)"| E["shoot = false"]

    A & B & C & D & E --> F["getInput()"]

    F --> G["返回 InputState {<br/>forward: keys.has('KeyW'),<br/>backward: keys.has('KeyS'),<br/>left: keys.has('KeyA'),<br/>right: keys.has('KeyD'),<br/>shoot: this.shoot,<br/>mouseX, mouseY<br/>}"]

    G -->|"重置状态"| H["mouseX = 0<br/>mouseY = 0<br/>shoot = false"]

    style 事件源 fill:#f3e5f5,stroke:#9c27b0,color:#4a148c
```

**关键设计**：`InputSystem` 采用 **增量消费** 模式——`getInput()` 被调用后会重置 `mouseX`、`mouseY` 和 `shoot`，确保每帧只消费一次，避免重复射击或视角漂移。

---

## 四、更新模块详细流程

```mermaid
flowchart TD
    A["animate() 每帧入口"] --> B["获取 deltaTime"]
    B --> C["Cannon.js 物理步进<br/>world.step()"]
    C --> D["获取 InputState"]
    D --> E["Tank.update()"]

    E --> E1["根据 forward/backward 设置<br/>body.velocity.x/z"]
    E --> E2["根据 left/right 设置<br/>body.angularVelocity.y"]
    E --> E3["根据 mouseX/Y 设置<br/>turret.rotation.y / barrel.rotation.y"]
    E1 & E2 & E3 --> E4["同步 mesh ← body<br/>position + quaternion"]

    D --> F{"shoot && ammo > 0?"}
    F -- 是 --> G["创建 Projectile<br/>计算发射位置/方向<br/>ammo--"]

    E4 --> H["更新所有炮弹"]
    G --> H

    H --> H1["projectile.update()<br/>同步 mesh ← body<br/>追加尾迹点"]
    H1 --> H2{"碰撞检测"}
    H2 -- "击中目标" --> H3["score += 100<br/>destroy 双方<br/>生成爆炸粒子"]
    H2 -- "未击中" --> H4{"超时/坠地?"}
    H4 -- 是 --> H5["destroy 炮弹"]
    H4 -- 否 --> H6["保留至下帧"]
    H3 & H5 & H6 --> I["targets.update()<br/>同步存活目标"]

    I --> J["交给渲染模块"]

    style A fill:#fff3e0,stroke:#ff9800
    style H3 fill:#ffcdd2,stroke:#f44336
```

---

## 五、渲染模块详细流程

```mermaid
flowchart LR
    A["cameraSystem.update(deltaTime)"] --> B["计算期望位置<br/>offset 旋转到坦克朝向<br/>+ 坦克世界坐标"]
    B --> C["camera.position.lerp<br/>平滑插值跟随"]
    C --> D["camera.lookAt<br/>坦克位置 + lookAtOffset"]
    D --> E["renderer.render(scene, camera)<br/>Three.js 完整渲染管线"]

    style A fill:#e3f2fd,stroke:#2196f3
    style E fill:#e3f2fd,stroke:#2196f3
```

---

## 六、HUD 数据同步（独立通道）

HUD (`HUD.vue`) 的数据更新走 **独立的定时器通道**，不参与主循环：

```mermaid
flowchart LR
    A["HUD.vue onMounted"] --> B["setInterval(100ms)"]
    B --> C["读取 game.health / ammo / score"]
    C --> D["更新 Vue ref → 触发 DOM 重绘"]

    style A fill:#fce4ec,stroke:#e91e63
```

这意味着 HUD 刷新频率约为 **10 FPS**，与游戏主循环（通常 60 FPS）解耦，减少不必要的 Vue 响应式开销。

---

## 七、单帧时序总结

```
┌──────────────────────────────────────────────────────────┐
│                     一帧 (≈16.7ms @60FPS)                │
│                                                          │
│  ① InputSystem.getInput()                                │
│     ↓  返回 InputState + 重置增量                         │
│  ② world.step()                                          │
│     ↓  Cannon.js 物理引擎步进                              │
│  ③ Tank.update(deltaTime, input)                         │
│     ↓  应用移动/旋转 + mesh←body同步                       │
│  ④ 炮弹更新 + 碰撞检测                                     │
│     ↓  击中→加分/销毁  超时→销毁                            │
│  ⑤ Target.update() × N                                   │
│     ↓  mesh←body同步                                      │
│  ⑥ CameraSystem.update(deltaTime)                        │
│     ↓  lerp跟随 + lookAt                                  │
│  ⑦ renderer.render(scene, camera)                        │
│     ↓  GPU绘制                                           │
│  ⑧ requestAnimationFrame → 下一帧                        │
└──────────────────────────────────────────────────────────┘
```

---

## 八、关键源码位置索引

| 关注点 | 文件 | 行号 |
|--------|------|------|
| 主循环调度 | `src/core/Game.ts` | 204-261 |
| 输入事件监听 | `src/systems/InputSystem.ts` | 23-57 |
| 输入状态打包 | `src/systems/InputSystem.ts` | 59-78 |
| 坦克移动/炮塔控制 | `src/entities/Tank.ts` | 110-157 |
| 射击与炮弹创建 | `src/core/Game.ts` | 221-224, 263-272 |
| 碰撞检测 | `src/core/Game.ts` | 231-241 |
| 相机跟随 | `src/systems/CameraSystem.ts` | 22-39 |
| 渲染调用 | `src/core/Game.ts` | 260 |
| HUD 数据轮询 | `src/components/HUD.vue` | 84-91 |
