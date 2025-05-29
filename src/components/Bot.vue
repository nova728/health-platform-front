<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Bot, Send, Loader2, Activity, Heart, Brain, X } from 'lucide-vue-next'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage, ElButton } from 'element-plus'

// 定义 emit
const emit = defineEmits(['close'])

const store = useStore()
const message = ref('')
const loading = ref(false)
const chatContainer = ref(null)
const chatHistory = ref([
  {
    type: 'assistant',
    content: '你好！我是你的专业健康助手，基于先进的AI技术为您提供个性化的健康分析和建议。我可以帮您：\n\n🏃 分析健康数据\n💪 制定运动计划\n🥗 提供营养建议\n😴 改善睡眠质量\n❓ 解答健康问题\n\n请告诉我您想了解什么？'
  }
])

// API基础URL
const API_BASE = 'http://localhost:8088/api/ai'

// 快捷功能按钮
const quickActions = ref([
  { 
    label: '健康分析', 
    icon: Activity, 
    action: 'analysis',
    description: '分析我的整体健康状况'
  },
  { 
    label: '运动计划', 
    icon: Heart, 
    action: 'exercise',
    description: '为我制定个性化运动计划'
  },
  { 
    label: '营养建议', 
    icon: Brain, 
    action: 'nutrition',
    description: '获取营养饮食建议'
  }
])

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 获取用户ID
const getUserId = () => {
  return store.state.user?.id || 1 // 默认用户ID为1
}

// 获取健康分析
const getHealthAnalysis = async () => {
  const userId = getUserId()
  try {
    const response = await axios.get(`${API_BASE}/comprehensive-analysis/${userId}`)
    return response.data.data || response.data.msg || '暂无分析数据'
  } catch (error) {
    console.error('获取健康分析失败:', error)
    throw new Error('获取健康分析失败，请稍后重试')
  }
}

// 获取运动计划
const getExercisePlan = async (goals = '保持健康', preferences = '适中强度') => {
  const userId = getUserId()
  try {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('goals', goals)
    params.append('preferences', preferences)
    const response = await axios.post(`${API_BASE}/exercise-plan`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data.data || response.data.msg || '暂无运动计划'
  } catch (error) {
    console.error('获取运动计划失败:', error)
    throw new Error('获取运动计划失败，请稍后重试')
  }
}

// 获取营养建议
const getNutritionAdvice = async (dietaryRestrictions = '', goals = '均衡营养') => {
  const userId = getUserId()
  try {
    const response = await axios.post(`${API_BASE}/nutrition-advice`, {
      userId,
      dietaryRestrictions,
      goals
    })
    return response.data.data || response.data.msg || '暂无营养建议'
  } catch (error) {
    console.error('获取营养建议失败:', error)
    throw new Error('获取营养建议失败，请稍后重试')
  }
}

// 健康问答
const askHealthQuestion = async (question) => {
  const userId = getUserId()
  try {
    const params = new URLSearchParams()
    params.append('question', question)
    if (userId) {
      params.append('userId', userId)
    }
    const response = await axios.post(`${API_BASE}/health-qa`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data.data || response.data.msg || '抱歉，暂时无法回答这个问题'
  } catch (error) {
    console.error('健康问答失败:', error)
    throw new Error('获取回答失败，请稍后重试')
  }
}

// AI健康助手对话
const chatWithAssistant = async (userMessage) => {
  const userId = getUserId()
  try {
    const response = await axios.post(`${API_BASE}/chat`, {
      userId,
      message: userMessage,
      context: chatHistory.value.slice(-3).map(msg => `${msg.type}: ${msg.content}`).join('\n')
    })
    return response.data.data || response.data.msg || '抱歉，我现在无法回应'
  } catch (error) {
    console.error('AI对话失败:', error)
    throw new Error('对话失败，请稍后重试')
  }
}

// 快捷操作处理
const handleQuickAction = async (action) => {
  loading.value = true
  
  let actionText = ''
  let response = ''
  
  try {
    switch (action) {
      case 'analysis':
        actionText = '请分析我的健康状况'
        response = await getHealthAnalysis()
        break
      case 'exercise':
        actionText = '请为我制定运动计划'
        response = await getExercisePlan()
        break
      case 'nutrition':
        actionText = '请给我营养建议'
        response = await getNutritionAdvice()
        break
    }
    
    // 添加用户操作到聊天记录
    chatHistory.value.push({
      type: 'user',
      content: actionText
    })
    
    // 添加AI回复
    chatHistory.value.push({
      type: 'assistant',
      content: response
    })
    
    scrollToBottom()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!message.value.trim() || loading.value) return

  const userMessage = message.value.trim()
  chatHistory.value.push({
    type: 'user',
    content: userMessage
  })

  message.value = ''
  loading.value = true
  scrollToBottom()

  try {
    let response = ''
    
    // 根据消息内容判断调用哪个API
    if (userMessage.includes('分析') || userMessage.includes('健康状况') || userMessage.includes('身体情况')) {
      response = await getHealthAnalysis()
    } else if (userMessage.includes('运动') || userMessage.includes('锻炼') || userMessage.includes('健身')) {
      response = await getExercisePlan()
    } else if (userMessage.includes('营养') || userMessage.includes('饮食') || userMessage.includes('吃什么')) {
      response = await getNutritionAdvice()
    } else {
      // 默认使用健康问答或对话API
      response = await askHealthQuestion(userMessage)
    }

    chatHistory.value.push({
      type: 'assistant',
      content: response
    })
  } catch (error) {
    ElMessage.error(error.message)
    chatHistory.value.push({
      type: 'assistant',
      content: '抱歉，我遇到了一些问题，请稍后再试。如果问题持续存在，请联系技术支持。'
    })
  } finally {
    loading.value = false
    scrollToBottom()
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
    const userId = getUserId()
    if (!userId) return

    // 获取个性化建议
    const response = await axios.get(`${API_BASE}/personalized-advice/${userId}`)
    if (response.data && response.data.data) {
      const advice = response.data.data.advice || '欢迎使用智能健康助手！'
      
      setTimeout(() => {
        chatHistory.value.push({
          type: 'assistant',
          content: `基于您的健康数据，我为您准备了个性化建议：\n\n${advice}`
        })
        scrollToBottom()
      }, 1000)
    }
  } catch (error) {
    console.error('获取初始健康建议失败:', error)
    // 如果获取失败，显示默认的功能介绍
    setTimeout(() => {
      chatHistory.value.push({
        type: 'assistant',
        content: '您可以尝试以下功能：\n• 询问健康问题\n• 请求健康分析\n• 获取运动建议\n• 了解营养知识\n\n有什么我可以帮助您的吗？'
      })
      scrollToBottom()
    }, 1000)
  }
})
</script>

<template>
  <div class="health-bot">    <div class="bot-header">
      <Bot class="bot-icon" />
      <h3>智能健康助手</h3>
      <div class="ai-badge">DeepSeek AI</div>
      <button class="close-button" @click="handleClose">
        <X class="close-icon" />
      </button>
    </div>

    <!-- 快捷操作按钮 -->
    <div class="quick-actions" v-if="chatHistory.length <= 2">
      <div class="quick-actions-title">快速开始</div>
      <div class="action-buttons">
        <button
          v-for="action in quickActions"
          :key="action.action"
          @click="handleQuickAction(action.action)"
          :disabled="loading"
          class="action-button"
        >
          <component :is="action.icon" class="action-icon" />
          <div class="action-content">
            <div class="action-label">{{ action.label }}</div>
            <div class="action-desc">{{ action.description }}</div>
          </div>
        </button>
      </div>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-for="(msg, index) in chatHistory"
           :key="index"
           :class="['message', msg.type]">
        <div class="message-avatar" v-if="msg.type === 'assistant'">
          <Bot class="avatar-icon" />
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          <div class="message-time">{{ formatTime(new Date()) }}</div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="loading" class="message assistant">
        <div class="message-avatar">
          <Bot class="avatar-icon" />
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <textarea
            v-model="message"
            placeholder="输入您的健康问题，或尝试说：分析我的健康状况、制定运动计划、营养建议..."
            @keypress="handleKeyPress"
            :disabled="loading"
            rows="1"
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
      <div class="input-footer">
        <span class="powered-by">Powered by DeepSeek AI</span>
      </div>
    </div>
  </div>
</template>

<script>
// 格式化消息内容
const formatMessage = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/###\s(.*?)(<br>|$)/g, '<h3>$1</h3>')
    .replace(/##\s(.*?)(<br>|$)/g, '<h2>$1</h2>')
    .replace(/#\s(.*?)(<br>|$)/g, '<h1>$1</h1>')
    .replace(/🏃|💪|🥗|😴|❓|🎯|📊|⚡|✨|💡/g, '<span class="emoji">$&</span>')
}

// 格式化时间
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export default {
  methods: {
    formatMessage,
    formatTime
  }
}
</script>

<style scoped>
.health-bot {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.bot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.bot-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.bot-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.ai-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  margin-left: 8px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  width: 20px;
  height: 20px;
}

.quick-actions {
  padding: 20px 24px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.quick-actions-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
}

.action-button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.action-desc {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  gap: 16px;
  background: rgba(250, 250, 250, 0.5);
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
  animation: fadeInUp 0.3s ease-out;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.avatar-icon {
  width: 18px;
  height: 18px;
  color: white;
}

.message-content {
  background: white;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  min-width: 0;
  flex: 1;
}

.message.user .message-content {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3) {
  margin: 8px 0 4px 0;
  font-weight: 600;
}

.message-text :deep(h1) { font-size: 16px; }
.message-text :deep(h2) { font-size: 15px; }
.message-text :deep(h3) { font-size: 14px; }

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.message.user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.message-text :deep(.emoji) {
  font-size: 16px;
  margin: 0 2px;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.input-container {
  padding: 20px 24px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  transition: all 0.2s;
  background: #fafafa;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea::placeholder {
  color: #94a3b8;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.send-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-button svg {
  width: 20px;
  height: 20px;
}

.input-footer {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.powered-by {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
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

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
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

:deep(.el-dialog) {
  padding: 0 !important;
}

:deep(.el-dialog__body) {
  border: none !important;
  padding: 20px; 
}

:deep(.el-dialog__header) {
  padding: 0; 
  border-bottom: none !important; 
  position: relative; 
}

/* Hide the default title */
:deep(.el-dialog__title) {
  display: none !important;
}

:deep(.el-dialog__headerbtn) {
  position: absolute !important;
  top: 15px !important; 
  right: 15px !important;  
  z-index: 10;    
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-bot {
    border-radius: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-button {
    min-width: unset;
  }
  
  .message {
    max-width: 95%;
  }
  
  .input-container {
    padding: 16px 16px 12px;
  }
  
  .chat-container {
    padding: 16px;
  }
}
</style>