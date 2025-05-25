<!-- DraggableBubble.vue -->
<template>
  <div class="bubble-wrapper">
    <div
        ref="bubbleRef"
        class="floating-bubble"
        :style="{
          left: `${position.x}px`,
          top: `${position.y}px`
        }"
        @mousedown.prevent="startDrag"
        @click.stop="toggleBot"
    >
      <bot-icon class="bubble-icon"/>
    </div>

    <el-dialog
        v-model="showBot"
        title="健康助手"
        width="800px"
        class="bot-dialog"
        :close-on-click-modal="false"
        :show-close="true"
        :modal="true"
        :append-to-body="true"
        destroy-on-close
    >
      <div class="bot-container">
        <Bot />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { Bot as BotIcon } from 'lucide-vue-next'
import Bot from '@/components/Bot.vue'

const bubbleRef = ref(null)
const showBot = ref(false)
const position = ref({
  x: 20,
  y: Math.max(60, (window.innerHeight - 60) / 2)
})

let isDragging = false
let startPos = { x: 0, y: 0 }
let startOffset = { x: 0, y: 0 }

// Drag handlers
const startDrag = (e) => {
  if (e.button !== 0) return
  isDragging = true
  startPos = {
    x: e.clientX,
    y: e.clientY
  }
  startOffset = {
    x: position.value.x,
    y: position.value.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e) => {
  if (!isDragging) return

  let newX = startOffset.x + (e.clientX - startPos.x)
  let newY = startOffset.y + (e.clientY - startPos.y)

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60

  newX = Math.max(0, Math.min(windowWidth - bubbleSize, newX))
  newY = Math.max(0, Math.min(windowHeight - bubbleSize, newY))

  position.value = {
    x: newX,
    y: newY
  }
}

const stopDrag = () => {
  if (!isDragging) return

  isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60
  const threshold = 50

  const newPosition = { ...position.value }

  if (newPosition.x < threshold) {
    newPosition.x = 0
  } else if (newPosition.x > windowWidth - bubbleSize - threshold) {
    newPosition.x = windowWidth - bubbleSize
  }

  if (newPosition.y < threshold) {
    newPosition.y = 0
  } else if (newPosition.y > windowHeight - bubbleSize - threshold) {
    newPosition.y = windowHeight - bubbleSize
  }

  position.value = newPosition
}

const toggleBot = (e) => {
  if (!isDragging) {
    showBot.value = !showBot.value
  }
}

const handleResize = () => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const bubbleSize = 60

  position.value = {
    x: Math.min(position.value.x, windowWidth - bubbleSize),
    y: Math.min(position.value.y, windowHeight - bubbleSize)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.bubble-wrapper {
  position: relative;
  z-index: 2000;
}

.floating-bubble {
  position: fixed;
  width: 60px;
  height: 60px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 2000;
  user-select: none;
  touch-action: none;
}

.floating-bubble:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background-color: #66b1ff;
  transform: scale(1.05);
}

.bubble-icon {
  font-size: 24px;
  color: white;
}

.floating-bubble:active {
  cursor: grabbing;
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.bot-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.bot-dialog .el-dialog__header) {
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}


:deep(.bot-dialog .el-dialog__body) {
  padding: 0;
  height: 800px;
  overflow: hidden;
}

.bot-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

@media screen and (max-height: 900px) {
  :deep(.bot-dialog .el-dialog__body) {
    height: 700px;
  }
}

@media screen and (max-height: 800px) {
  :deep(.bot-dialog .el-dialog__body) {
    height: 600px;
  }
}

@media screen and (max-width: 1100px) {
  :deep(.bot-dialog) {
    width: 90vw !important;
  }
}

:deep(.bot-dialog .el-dialog__headerbtn) {
  top: 16px;
}

:deep(.bot-dialog .el-dialog) {
  min-width: 600px;
}

</style>