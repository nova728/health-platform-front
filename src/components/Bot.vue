<script setup>
import { ref, onMounted } from 'vue'
import { Bot, Send, Loader2 } from 'lucide-vue-next'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = useStore()
const message = ref('')
const loading = ref(false)
const chatHistory = ref([
  {
    type: 'assistant',
    content: '你好！我是你的健康助手，可以为你提供健康咨询和建议。'
  }
])

// 获取健康建议
const getHealthAdvice = async (userHealthData) => {
  try {
    // 使用后端API发送健康数据获取建议
    const response = await axios.post('http://localhost:8088/api/chat/send', {
      message: generatePrompt(userHealthData)
    })

    return response.data.response
  } catch (error) {
    console.error('Failed to get health advice:', error)
    throw error
  }
}

// 生成提示语
const generatePrompt = (healthData) => {
  return `基于以下健康数据生成健康建议：
    - 心率：${healthData.heartRate} BPM
    - 血压：${healthData.bloodPressureSystolic}/${healthData.bloodPressureDiastolic} mmHg
    - BMI：${healthData.bmi}
    - 睡眠时长：${healthData.sleepDuration} 小时
    请提供具体的健康建议和改善方案。`
}

// 发送消息
const sendMessage = async () => {
  if (!message.value.trim()) return

  chatHistory.value.push({
    type: 'user',
    content: message.value
  })

  const userMessage = message.value
  message.value = ''
  loading.value = true

  try {
    const response = await axios.post('http://localhost:8088/api/chat/send', {
      message: userMessage
    })

    chatHistory.value.push({
      type: 'assistant',
      content: response.data.response
    })
  } catch (error) {
    console.error('Failed to get response:', error)
    ElMessage.error('获取回复失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 监听回车键
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 获取初始健康建议
onMounted(async () => {
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/history`)
    if (response.data && response.data.length > 0) {
      const healthData = response.data[0]
      const advice = await getHealthAdvice(healthData)

      chatHistory.value.push({
        type: 'assistant',
        content: advice
      })
    }
  } catch (error) {
    console.error('Failed to get initial health advice:', error)
  }
})
</script>

<template>
  <div class="health-bot">
    <div class="bot-header">
      <Bot class="bot-icon" />
      <h3>智能健康助手</h3>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-for="(msg, index) in chatHistory"
           :key="index"
           :class="['message', msg.type]">
        <div class="message-content">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <div class="input-container">
      <textarea
          v-model="message"
          placeholder="输入您的健康问题..."
          @keypress="handleKeyPress"
          :disabled="loading"
      />
      <button
          @click="sendMessage"
          :disabled="loading || !message.trim()"
          class="send-button"
      >
        <Loader2 v-if="loading" class="animate-spin" />
        <Send v-else />
      </button>
    </div>
  </div>
</template>

<style scoped>
.health-bot {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.bot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px; /* 增加左右内边距 */
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.bot-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.bot-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px; /* 增加内边距 */
  display: flex;
  flex-direction: column;
  min-height: 500px;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.message.assistant .message-content {
  background: #f1f5f9;
  color: #334155;
}

.message.user .message-content {
  background: #3b82f6;
  color: white;
}

.input-container {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  min-height: 80px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.send-button svg {
  width: 20px;
  height: 20px;
}

/* 自定义滚动条样式 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>