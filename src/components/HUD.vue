<template>
  <div class="absolute inset-0 pointer-events-none">
    <!-- 顶部状态栏 -->
    <div class="absolute top-4 left-4 right-4 flex justify-between">
      <!-- 左侧信息 -->
      <div class="hud-panel p-4 pointer-events-auto">
        <div class="flex items-center space-x-6">
          <!-- 生命值 -->
          <div class="flex items-center space-x-2">
            <div class="text-sm text-military-light">HP</div>
            <div class="w-40 h-6 bg-military-dark border-2 border-military-green rounded overflow-hidden">
              <div 
                class="h-full transition-all duration-300"
                :class="healthColor"
                :style="{ width: health + '%' }"
              ></div>
            </div>
            <div class="text-lg hud-text font-bold">{{ health }}</div>
          </div>
          
          <!-- 弹药 -->
          <div class="flex items-center space-x-2">
            <div class="text-sm text-military-light">AMMO</div>
            <div class="text-2xl hud-text font-bold">{{ ammo }}</div>
          </div>
        </div>
      </div>
      
      <!-- 右侧分数 -->
      <div class="hud-panel p-4 pointer-events-auto">
        <div class="text-sm text-military-light mb-1">SCORE</div>
        <div class="text-3xl hud-text font-bold">{{ score }}</div>
      </div>
    </div>
    
    <!-- 准星 -->
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <svg width="60" height="60" class="crosshair">
        <circle cx="30" cy="30" r="25" fill="none" stroke="#ffb82e" stroke-width="2" opacity="0.6"/>
        <line x1="30" y1="10" x2="30" y2="20" stroke="#ffb82e" stroke-width="2"/>
        <line x1="30" y1="40" x2="30" y2="50" stroke="#ffb82e" stroke-width="2"/>
        <line x1="10" y1="30" x2="20" y2="30" stroke="#ffb82e" stroke-width="2"/>
        <line x1="40" y1="30" x2="50" y2="30" stroke="#ffb82e" stroke-width="2"/>
        <circle cx="30" cy="30" r="2" fill="#ffb82e"/>
      </svg>
    </div>
    
    <!-- 底部小地图占位 -->
    <div class="absolute bottom-4 right-4 hud-panel p-2 pointer-events-auto">
      <div class="w-40 h-40 bg-military-dark border border-military-green flex items-center justify-center">
        <div class="text-military-light text-sm">RADAR</div>
      </div>
    </div>
    
    <!-- 控制提示 -->
    <div class="absolute bottom-4 left-4 text-military-light text-sm space-y-1">
      <div><span class="hud-text">W/S</span> 前后移动 | <span class="hud-text">A/D</span> 车体旋转</div>
      <div>按住 <span class="hud-text">右键</span> 拖动控制炮塔 | <span class="hud-text">左键</span> 射击</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Game } from '../core/Game'

const props = defineProps<{
  game: Game | null
}>()

const health = ref(100)
const ammo = ref(30)
const score = ref(0)

const healthColor = computed(() => {
  if (health.value > 60) return 'bg-green-500'
  if (health.value > 30) return 'bg-yellow-500'
  return 'bg-hud-red'
})

let updateInterval: number | null = null

onMounted(() => {
  updateInterval = window.setInterval(() => {
    if (props.game) {
      health.value = props.game.health
      ammo.value = props.game.ammo
      score.value = props.game.score
    }
  }, 100)
})

onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.crosshair {
  filter: drop-shadow(0 0 5px rgba(255, 184, 46, 0.8));
  animation: crosshair-pulse 2s ease-in-out infinite;
}

@keyframes crosshair-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
