<template>
  <div class="food-image-recognition">
    <!-- 上传区域 -->
    <div class="upload-section">
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        >
        
        <div v-if="!previewImage && !isUploading" class="upload-content">
          <el-icon class="upload-icon"><Camera /></el-icon>
          <div class="upload-text">
            <p class="primary-text">📸 点击上传或拖拽图片到此处</p>
            <p class="secondary-text">AI 智能识别食物营养成分</p>
            <p class="hint-text">支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</p>
          </div>
        </div>

        <div v-if="isUploading" class="uploading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p class="uploading-text">🔍 AI 正在分析食物...</p>
        </div>

        <div v-if="previewImage && !isUploading" class="preview-content">
          <img :src="previewImage" alt="预览图片" class="preview-image">
          <div class="preview-overlay">
            <el-button type="primary" @click="recognizeImage" class="action-button">
              <el-icon><Search /></el-icon>
              识别食物
            </el-button>
            <el-button @click="clearImage" class="action-button secondary">
              <el-icon><Delete /></el-icon>
              重新选择
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="recognitionResults.length > 0" class="results-section">
      <h3 class="results-title">
        <el-icon><Trophy /></el-icon>
        识别结果
      </h3>
      
      <div class="results-list">
        <div 
          v-for="(food, index) in recognitionResults"
          :key="index"
          class="result-item"
          :class="{ 'high-confidence': food.trust > 0.8 }"
        >
          <div class="result-content">
            <div class="food-info">
              <h4 class="food-name">{{ food.name }}</h4>
              <div class="nutrition-info">
                <span v-if="food.calorie" class="calorie">
                  <el-icon><Chicken /></el-icon>
                  {{ Math.round(food.calorie) }} 千卡
                </span>
                <span class="confidence" :class="getConfidenceClass(food.trust)">
                  <el-icon><Medal /></el-icon>
                  置信度: {{ Math.round(food.trust * 100) }}%
                </span>
              </div>
            </div>
            <div class="result-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="addToMeal(food)"
              >
                <el-icon><Plus /></el-icon>
                添加到餐记录
              </el-button>
              <el-button 
                type="info" 
                size="small"
                @click="searchSimilar(food.name)"
              >
                <el-icon><Search /></el-icon>
                搜索类似
              </el-button>
            </div>
          </div>
          <div class="confidence-bar">
            <div 
              class="confidence-fill" 
              :style="{ width: food.trust * 100 + '%' }"
              :class="getConfidenceClass(food.trust)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-section">
      <el-alert
        :title="errorMessage"
        type="error"
        show-icon
        :closable="true"
        @close="clearError"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Camera, 
  Loading, 
  Search, 
  Delete, 
  Trophy, 
  Chicken, 
  Medal, 
  Plus 
} from '@element-plus/icons-vue'
import { recognizeFoodFromImage, fileToBase64, compressImage } from '@/api/food'

// 响应式数据
const fileInput = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const previewImage = ref('')
const recognitionResults = ref([])
const errorMessage = ref('')

// 发射事件
const emit = defineEmits(['food-recognized', 'search-food', 'add-to-meal'])

// 触发文件选择
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

// 处理文件
const processFile = async (file) => {
  try {
    clearError()
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('请选择图片文件')
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('图片文件大小不能超过5MB')
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)

    // 清空之前的结果
    recognitionResults.value = []

  } catch (error) {
    showError(error.message)
  }
}

// 识别图片
const recognizeImage = async () => {
  if (!previewImage.value) {
    showError('请先选择图片')
    return
  }

  try {
    isUploading.value = true
    clearError()

    // 从预览图片中获取base64数据
    const base64Data = previewImage.value.split(',')[1]
    
    // 调用识别API
    const response = await recognizeFoodFromImage(base64Data)
    
    if (response.data && response.data.foods && response.data.foods.length > 0) {
      recognitionResults.value = response.data.foods.sort((a, b) => b.trust - a.trust)
      emit('food-recognized', recognitionResults.value)
      ElMessage.success(`成功识别到 ${response.data.foods.length} 种食物`)
    } else {
      showError('未能识别出食物，请尝试更换图片')
    }

  } catch (error) {
    showError(error.response?.data?.error || '识别失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}

// 清除图片
const clearImage = () => {
  previewImage.value = ''
  recognitionResults.value = []
  clearError()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 获取置信度样式类
const getConfidenceClass = (trust) => {
  if (trust >= 0.8) return 'high'
  if (trust >= 0.6) return 'medium'
  return 'low'
}

// 添加到餐记录
const addToMeal = (food) => {
  emit('add-to-meal', food)
  ElMessage.success(`已将 ${food.name} 添加到待选列表`)
}

// 搜索类似食物
const searchSimilar = (foodName) => {
  emit('search-food', foodName)
}

// 显示错误
const showError = (message) => {
  errorMessage.value = message
  ElMessage.error(message)
}

// 清除错误
const clearError = () => {
  errorMessage.value = ''
}

// 暴露给父组件的方法
defineExpose({  clearImage,
  clearError
})
</script>

<style scoped>
.food-image-recognition {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.food-image-recognition:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 3px dashed #e2e8f0;
  border-radius: 20px;
  padding: 60px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.upload-area:hover {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
}

.upload-area.drag-over {
  border-color: #059669;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  transform: scale(1.04);
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.25);
}

.upload-area.uploading {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  cursor: not-allowed;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 64px;
  color: #10b981;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
  color: #059669;
}

.upload-text .primary-text {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.upload-text .secondary-text {
  font-size: 16px;
  color: #10b981;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.upload-text .hint-text {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.uploading-content {
  text-align: center;
}

.loading-icon {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
  animation: rotate 2s linear infinite;
}

.uploading-text {
  font-size: 16px;
  color: #3b82f6;
  margin: 0;
  font-weight: 500;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-content {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 16px;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 30px 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-button {
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-button:not(.secondary) {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
}

.action-button:not(.secondary):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #374151;
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.results-section {
  margin-top: 30px;
}

.results-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-title::before {
  content: '🎯';
  font-size: 24px;
}

.results-list {
  display: grid;
  gap: 16px;
}

.result-item {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.result-item:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  background: rgba(255, 255, 255, 1);
}

.result-item.high-confidence {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-info {
  flex: 1;
}

.food-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.nutrition-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
}

.calorie {
  font-weight: 500;
  color: #dc2626;
}

.confidence {
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  margin-left: 16px;
}

.confidence.high {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.confidence.medium {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.confidence.low {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.confidence-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 12px;
}

.confidence-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.confidence-fill.high {
  background: linear-gradient(90deg, #10b981, #059669);
}

.confidence-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.confidence-fill.low {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.error-section {
  background: rgba(254, 226, 226, 0.8);
  border: 2px solid #fecaca;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: #dc2626;
  font-weight: 500;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .upload-area {
    padding: 40px 20px;
    min-height: 200px;
  }
  
  .upload-icon {
    font-size: 48px;
  }
  
  .upload-text .primary-text {
    font-size: 16px;
  }
  
  .upload-text .secondary-text {
    font-size: 14px;
  }
  
  .preview-overlay {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .result-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }  
  .confidence {
    margin-left: 0;
  }
}

.uploading-content {
  text-align: center;
}

.loading-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 12px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-content {
  position: relative;
  max-width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-overlay {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.results-section {
  margin-top: 24px;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.result-item.high-confidence {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.food-info {
  flex: 1;
}

.food-name {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.nutrition-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.calorie {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
}

.confidence {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.confidence.high {
  color: #67c23a;
}

.confidence.medium {
  color: #e6a23c;
}

.confidence.low {
  color: #f56c6c;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.confidence-bar {
  height: 4px;
  background-color: #f5f7fa;
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.confidence-fill.high {
  background-color: #67c23a;
}

.confidence-fill.medium {
  background-color: #e6a23c;
}

.confidence-fill.low {
  background-color: #f56c6c;
}

.error-section {
  margin-top: 16px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .food-image-recognition {
    padding: 16px;
  }

  .upload-area {
    padding: 32px 16px;
    min-height: 150px;
  }

  .result-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .result-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .nutrition-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
