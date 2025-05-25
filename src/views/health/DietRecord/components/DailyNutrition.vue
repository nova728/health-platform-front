<template>
  <div class="daily-nutrition" v-loading="loading">
    <h3>今日营养摄入概览</h3>
    <div class="nutrition-grid" v-if="nutritionData">
      <div class="nutrition-item">
        <span class="label">热量</span>
        <span class="value">{{ totalCalories }}kcal</span>
        <el-progress
            :percentage="nutritionData.caloriesPercentage"
            :color="getProgressColor(nutritionData.caloriesPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedCalories }}kcal</span>
      </div>

      <div class="nutrition-item">
        <span class="label">碳水化合物</span>
        <span class="value">{{ totalCarbs }}g</span>
        <el-progress
            :percentage="nutritionData.carbsPercentage"
            :color="getProgressColor(nutritionData.carbsPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedCarbs }}g</span>
      </div>

      <div class="nutrition-item">
        <span class="label">蛋白质</span>
        <span class="value">{{ totalProtein }}g</span>
        <el-progress
            :percentage="nutritionData.proteinPercentage"
            :color="getProgressColor(nutritionData.proteinPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedProtein }}g</span>
      </div>

      <div class="nutrition-item">
        <span class="label">脂肪</span>
        <span class="value">{{ totalFat }}g</span>
        <el-progress
            :percentage="nutritionData.fatPercentage"
            :color="getProgressColor(nutritionData.fatPercentage)"
        />
        <span class="recommended">目标: {{ nutritionData.recommendedFat }}g</span>
      </div>
    </div>
    <div v-else class="no-data">暂无数据</div>
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

// 工具函数
const getProgressColor = (percentage) => {
  if (percentage < 80) return '#67C23A'
  if (percentage < 100) return '#E6A23C'
  return '#F56C6C'
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
  fetchNutritionData
})

// 监听日期变化
watch(() => props.date, (newDate) => {
  if (newDate && mounted.value) {
    fetchNutritionData()
  }
})
</script>

<style scoped>
.daily-nutrition {
  position: relative;
  overflow: hidden;
}

.daily-nutrition::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #67C23A, #E6A23C, #F56C6C);
  opacity: 0.8;
}

h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
  background: linear-gradient(120deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: 16px;
  opacity: 0;
  animation: fadeIn 0.6s ease forwards 0.3s;
}

.nutrition-item {
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nutrition-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 12px 12px 20px #d1d9e6, -12px -12px 20px #ffffff;
}

.label {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 12px;
  display: block;
  font-weight: 500;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(120deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 12px 0;
  display: block;
  transition: all 0.3s ease;
}

.recommended {
  font-size: 0.8rem;
  color: #909399;
  margin-top: 8px;
  display: block;
  text-align: right;
}

:deep(.el-progress-bar__outer) {
  border-radius: 6px;
  background: rgba(144,147,153,0.1);
}

:deep(.el-progress-bar__inner) {
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>