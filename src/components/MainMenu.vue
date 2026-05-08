<template>
  <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-military-dark to-black">
    <div class="text-center">
      <!-- 标题 -->
      <h1 class="text-7xl font-military font-black hud-text mb-4 tracking-wider">
        TANK BATTLE
      </h1>
      <p class="text-2xl text-military-light mb-12 tracking-widest">
        3D 战争雷霆风格
      </p>
      
      <!-- 菜单按钮 -->
      <div class="space-y-4">
        <button 
          @click="emit('start-game')"
          class="menu-button px-12 py-4 text-2xl font-bold tracking-wider"
        >
          开始战斗
        </button>
      </div>
      
      <!-- 控制说明 -->
      <div class="mt-16 hud-panel p-6 inline-block">
        <h3 class="text-xl hud-text mb-4">操作说明</h3>
        <div class="text-left text-military-light space-y-2">
          <p>• <span class="hud-text">W/S</span> - 前进/后退</p>
          <p>• <span class="hud-text">A/D</span> - 车体左右旋转</p>
          <p>• <span class="hud-text">右键拖动</span> - 控制炮塔旋转 & 炮管仰角</p>
          <p>• <span class="hud-text">左键</span> - 射击</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'start-game'): void
}>()
</script>

<style scoped>
.menu-button {
  background: rgba(26, 31, 30, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 95, 77, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: #ffb82e;
  text-shadow: 0 0 10px rgba(255, 184, 46, 0.5);
  font-weight: 700;
  transition: all 0.3s;
}

.menu-button:hover:not(.opacity-50) {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 184, 46, 0.4);
  background: rgba(74, 95, 77, 0.9);
}

.menu-button:active:not(.opacity-50) {
  transform: scale(0.95);
}
</style>
