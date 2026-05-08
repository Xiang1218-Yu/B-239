<template>
  <div class="w-full h-full relative">
    <GameCanvas v-if="gameStarted" @game-ready="onGameReady" />
    <MainMenu v-else @start-game="startGame" />
    <HUD v-if="gameStarted && gameReady" :game="game" />
    <GameOver 
      v-if="gameStarted && gameReady"
      :show="showGameOver" 
      :reason="gameOverReason" 
      @restart="restartGame" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import MainMenu from './components/MainMenu.vue'
import HUD from './components/HUD.vue'
import GameOver from './components/GameOver.vue'
import type { Game } from './core/Game'

const gameStarted = ref(false)
const gameReady = ref(false)
const game = ref<Game | null>(null)
const showGameOver = ref(false)
const gameOverReason = ref<'ammo' | 'health' | null>(null)

const startGame = () => {
  gameStarted.value = true
}

const onGameReady = (gameInstance: Game) => {
  game.value = gameInstance
  gameReady.value = true
  
  // 监控弹药和生命值
  startMonitoring()
}

const startMonitoring = () => {
  setInterval(() => {
    if (game.value && !showGameOver.value) {
      // 检查弹药
      if (game.value.ammo <= 0) {
        gameOverReason.value = 'ammo'
        showGameOver.value = true
      }
      // 检查生命值
      if (game.value.health <= 0) {
        gameOverReason.value = 'health'
        showGameOver.value = true
      }
    }
  }, 100)
}

const restartGame = () => {
  if (game.value) {
    game.value.restart()
    showGameOver.value = false
    gameOverReason.value = null
  }
}
</script>
