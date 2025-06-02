<template>
  <div class="daily-nutrition-container" v-loading="loading">
    <div class="nutrition-content" v-if="nutritionData">
      <div class="nutrition-grid">
        <div class="nutrition-card calories">
          <div class="card-header">
            <div class="card-icon">🔥</div>
            <div class="card-info">
              <span class="card-label">热量</span>
              <span class="card-unit">kcal</span>
            </div>
          </div>
          <div class="card-value">{{ totalCalories }}</div>
          <div class="progress-container">
            <el-progress
                :percentage="Math.min(nutritionData.caloriesPercentage, 100)"
                :color="getProgressColor(nutritionData.caloriesPercentage, '#3b82f6')"
                :stroke-width="8"
                :show-text="false"
            />
            <div class="progress-info">
              <span class="current">{{ Math.round(nutritionData.caloriesPercentage) }}%</span>
              <span class="target">目标: {{ nutritionData.recommendedCalories }}</span>
            </div>
          </div>
        </div>

        <div class="nutrition-card carbs">
          <div class="card-header">
            <div class="card-icon">🌾</div>
            <div class="card-info">
              <span class="card-label">碳水化合物</span>
              <span class="card-unit">g</span>
            </div>
          </div>
          <div class="card-value">{{ totalCarbs }}</div>
          <div class="progress-container">
            <el-progress
                :percentage="Math.min(nutritionData.carbsPercentage, 100)"
                :color="getProgressColor(nutritionData.carbsPercentage, '#10b981')"
                :stroke-width="8"
                :show-text="false"
            />
            <div class="progress-info">
              <span class="current">{{ Math.round(nutritionData.carbsPercentage) }}%</span>
              <span class="target">目标: {{ nutritionData.recommendedCarbs }}</span>
            </div>
          </div>
        </div>

        <div class="nutrition-card protein">
          <div class="card-header">
            <div class="card-icon">💪</div>
            <div class="card-info">
              <span class="card-label">蛋白质</span>
              <span class="card-unit">g</span>
            </div>
          </div>
          <div class="card-value">{{ totalProtein }}</div>
          <div class="progress-container">
            <el-progress
                :percentage="Math.min(nutritionData.proteinPercentage, 100)"
                :color="getProgressColor(nutritionData.proteinPercentage, '#f59e0b')"
                :stroke-width="8"
                :show-text="false"
            />
            <div class="progress-info">
              <span class="current">{{ Math.round(nutritionData.proteinPercentage) }}%</span>
              <span class="target">目标: {{ nutritionData.recommendedProtein }}</span>
            </div>
          </div>
        </div>

        <div class="nutrition-card fat">
          <div class="card-header">
            <div class="card-icon">🥑</div>
            <div class="card-info">
              <span class="card-label">脂肪</span>
              <span class="card-unit">g</span>
            </div>
          </div>
          <div class="card-value">{{ totalFat }}</div>
          <div class="progress-container">
            <el-progress
                :percentage="Math.min(nutritionData.fatPercentage, 100)"
                :color="getProgressColor(nutritionData.fatPercentage, '#ef4444')"
                :stroke-width="8"
                :show-text="false"
            />
            <div class="progress-info">
              <span class="current">{{ Math.round(nutritionData.fatPercentage) }}%</span>
              <span class="target">目标: {{ nutritionData.recommendedFat }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-data-state">
      <div class="no-data-icon">📊</div>
      <h4 class="no-data-title">暂无营养数据</h4>
      <p class="no-data-subtitle">开始记录您的饮食来查看营养分析</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getDailyNutrition } from '@/api/diet'
import { ElMessage } from 'element-plus'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  customGoals: {
    type: Object,
    default: null
  }
})

// 先声明所有响应式变量
const loading = ref(false)
const mounted = ref(false)
const nutritionData = ref(null)
const totalCalories = ref(0)
const totalCarbs = ref(0)
const totalProtein = ref(0)
const totalFat = ref(0)

// 自定义目标值
const currentGoals = ref({
  calories: 2000,
  carbs: 250,
  protein: 120,
  fat: 65
})

// 更新目标的方法
const updateGoals = (newGoals) => {
  currentGoals.value = { ...newGoals }
  // 重新计算百分比
  recalculatePercentages()
}

// 重新计算百分比
const recalculatePercentages = () => {
  if (nutritionData.value) {
    nutritionData.value.caloriesPercentage = (nutritionData.value.totalCalories / currentGoals.value.calories) * 100
    nutritionData.value.carbsPercentage = (nutritionData.value.totalCarbs / currentGoals.value.carbs) * 100
    nutritionData.value.proteinPercentage = (nutritionData.value.totalProtein / currentGoals.value.protein) * 100
    nutritionData.value.fatPercentage = (nutritionData.value.totalFat / currentGoals.value.fat) * 100
    
    // 更新推荐值显示
    nutritionData.value.recommendedCalories = currentGoals.value.calories
    nutritionData.value.recommendedCarbs = currentGoals.value.carbs
    nutritionData.value.recommendedProtein = currentGoals.value.protein
    nutritionData.value.recommendedFat = currentGoals.value.fat
  }
}

// 工具函数
const getProgressColor = (percentage, baseColor) => {
  if (percentage < 80) return baseColor
  if (percentage < 100) return '#f59e0b'
  return '#ef4444'
}

// 数据获取函数
const fetchNutritionData = async () => {
  if (!props.userId) {
    console.warn('No userId provided')
    return
  }
  loading.value = true
  try {
    const { data } = await getDailyNutrition(props.userId, props.date)

    if (data) {
      nutritionData.value = data
      
      // 使用自定义目标值或后端返回的推荐值
      if (props.customGoals || Object.keys(currentGoals.value).some(key => currentGoals.value[key] !== 0)) {
        // 使用自定义目标重新计算百分比
        nutritionData.value.recommendedCalories = currentGoals.value.calories
        nutritionData.value.recommendedCarbs = currentGoals.value.carbs
        nutritionData.value.recommendedProtein = currentGoals.value.protein
        nutritionData.value.recommendedFat = currentGoals.value.fat
        
        nutritionData.value.caloriesPercentage = (data.totalCalories / currentGoals.value.calories) * 100
        nutritionData.value.carbsPercentage = (data.totalCarbs / currentGoals.value.carbs) * 100
        nutritionData.value.proteinPercentage = (data.totalProtein / currentGoals.value.protein) * 100
        nutritionData.value.fatPercentage = (data.totalFat / currentGoals.value.fat) * 100
      }
      
      // 确保数据格式化和默认值处理
      totalCalories.value = data.totalCalories ? Number(data.totalCalories).toFixed(1) : '0.0'
      totalCarbs.value = data.totalCarbs ? Number(data.totalCarbs).toFixed(1) : '0.0'
      totalProtein.value = data.totalProtein ? Number(data.totalProtein).toFixed(1) : '0.0'
      totalFat.value = data.totalFat ? Number(data.totalFat).toFixed(1) : '0.0'
    } else {
      // 重置数据
      nutritionData.value = null
      totalCalories.value = '0.0'
      totalCarbs.value = '0.0'
      totalProtein.value = '0.0'
      totalFat.value = '0.0'
    }
  } catch (error) {
    console.error('获取营养摄入数据失败:', error)
    ElMessage.error('获取营养摄入数据失败')
  } finally {
    loading.value = false
  }
}


// 生命周期钩子
onMounted(() => {
  mounted.value = true
  fetchNutritionData()
})

onUnmounted(() => {
  mounted.value = false
})

// 暴露方法供父组件调用
defineExpose({
  fetchNutritionData,
  updateGoals
})

// 监听日期变化
watch(() => props.date, (newDate) => {
  if (newDate && mounted.value) {
    fetchNutritionData()
  }
})

// 监听自定义目标变化
watch(() => props.customGoals, (newGoals) => {
  if (newGoals) {
    updateGoals(newGoals)
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
/* 主容器样式 */
.daily-nutrition-container {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 头部区域 */
.nutrition-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nutrition-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}


.nutrition-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nutrition-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

.header-decoration {
  display: flex;
  gap: 8px;
  z-index: 2;
}

.decoration-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.decoration-circle.primary {
  background: rgba(255, 255, 255, 0.8);
  animation-delay: 0s;
}

.decoration-circle.secondary {
  background: rgba(255, 255, 255, 0.6);
  animation-delay: 0.5s;
}

.decoration-circle.tertiary {
  background: rgba(255, 255, 255, 0.4);
  animation-delay: 1s;
}

/* 内容区域 */
.nutrition-content {
  padding: 24px;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 营养卡片样式 */
.nutrition-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.nutrition-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0;
  transition: all 0.3s ease;
}

.nutrition-card.calories::before {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.nutrition-card.carbs::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.nutrition-card.protein::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.nutrition-card.fat::before {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.nutrition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.nutrition-card:hover::before {
  opacity: 1;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
}

.card-unit {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* 卡片值 */
.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

/* 进度条容器 */
.progress-container {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.current {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.target {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* 进度条美化 */
:deep(.el-progress-bar__outer) {
  border-radius: 8px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-progress-bar__inner) {
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:deep(.el-progress-bar__inner::after) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

/* 空数据状态 */
.no-data-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 16px;
  margin: 32px;
}

.no-data-icon {
  font-size: 64px;
  margin-bottom: 16px;
  filter: grayscale(50%);
}

.no-data-title {
  font-size: 20px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 8px 0;
}

.no-data-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* 加载状态美化 */
:deep(.el-loading-mask) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

:deep(.el-loading-spinner .path) {
  stroke: #10b981;
  stroke-width: 3;
}

:deep(.el-loading-text) {
  color: #10b981;
  font-weight: 500;
  margin-top: 16px;
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .nutrition-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

@media (max-width: 1199px) and (min-width: 900px) {
  .nutrition-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (max-width: 899px) and (min-width: 768px) {
  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .nutrition-header {
    padding: 24px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .nutrition-content {
    padding: 24px;
  }
  
  .nutrition-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .nutrition-title {
    font-size: 20px;
  }
  
  .card-value {
    font-size: 28px;
  }
  
  .no-data-state {
    padding: 60px 24px;
    margin: 24px;
  }
}

@media (max-width: 480px) {
  .nutrition-header {
    padding: 20px;
  }
  
  .nutrition-content {
    padding: 20px;
  }
  
  .nutrition-card {
    padding: 20px;
  }
  
  .card-icon {
    font-size: 28px;
  }
  
  .card-value {
    font-size: 24px;
  }
  
  .nutrition-title {
    font-size: 18px;
  }
}

/* 特殊状态样式 */
.nutrition-card.over-target {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.nutrition-card.near-target {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.nutrition-card.under-target {
  border-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}
</style>