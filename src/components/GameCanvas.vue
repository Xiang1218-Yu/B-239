<template>
  <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  <div 
    v-if="loading" 
    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80"
  >
    <div class="text-center">
      <div class="text-4xl hud-text loading-text mb-4">LOADING</div>
      <div class="text-xl text-military-light">初始化战场系统...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Game } from '../core/Game'

const emit = defineEmits<{
  (e: 'game-ready', game: Game): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
let game: Game | null = null

onMounted(async () => {
  if (!canvasRef.value) return
  
  try {
    game = new Game(canvasRef.value)
    await game.init()
    game.start()
    
    loading.value = false
    emit('game-ready', game)
  } catch (error) {
    console.error('游戏初始化失败:', error)
  }
})

onBeforeUnmount(() => {
  if (game) {
    game.dispose()
  }
})
</script>
