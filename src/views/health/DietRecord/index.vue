<template>
  <div class="diet-page-container">
    <!-- 头部横幅区域 -->
    <div class="header-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="page-title">
            🍎健康饮食管理中心
          </h1>
        </div>        <div class="banner-actions">
          <el-button type="primary" size="large" @click="handleAddFood" class="add-button">
            <el-icon><Plus /></el-icon>
            设置饮食目标
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">      <!-- 每日营养概览 -->
      <div class="daily-overview">
        <DailyNutrition
            ref="dailyNutritionRef"
            :userId="store.state.user?.id"
            :date="selectedDate"
            :custom-goals="currentGoals"
        />
      </div>

      <!-- 饮食记录与营养日历 -->
      <div class="content-grid">
        <!-- 饮食记录部分 -->
        <el-card class="diet-records-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><DataLine /></el-icon>
                <span>饮食记录</span>
              </div>            
            </div>
          </template>          
          <div class="card-body">
            <DietRecord
                ref="dietRecordRef"
                @nutrition-updated="handleNutritionUpdate"
                @date-change="handleDateChange"
            />
          </div>
        </el-card>

        <!-- 营养日历部分 -->
        <el-card class="nutrition-calendar-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><Calendar /></el-icon>
                <span>营养统计</span>
              </div>
            </div>
          </template>
          <div class="card-body">
            <NutritionCalendar />
          </div>
        </el-card>      </div>
    </div>

    <!-- 饮食目标设置对话框 -->
    <DietGoalDialog
      v-model="showGoalDialog"
      :current-goals="currentGoals"
      @save="handleSaveGoals"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Plus, DataLine, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { saveDietGoals, getCurrentDietGoals } from '@/api/dietGoals'
import DailyNutrition from './components/DailyNutrition.vue'
import DietRecord from './components/DietRecord.vue'
import NutritionCalendar from './components/NutritionCalendar.vue'
import DietGoalDialog from './components/DietGoalDialog.vue'

const store = useStore()
const dailyNutritionRef = ref(null)
const dietRecordRef = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showGoalDialog = ref(false)

// 当前饮食目标
const currentGoals = ref({
  calories: 2000,
  carbs: 250,
  protein: 120,
  fat: 65
})

const emit = defineEmits(['date-change', 'nutrition-updated'])

// 处理设置饮食目标（原来的添加食物功能）
const handleAddFood = () => {
  showGoalDialog.value = true
}

// 处理日期变化
const handleDateChange = (date) => {
  selectedDate.value = date
  emit('date-change', date)
  handleNutritionUpdate()
}

// 处理营养数据更新
const handleNutritionUpdate = async () => {
  try {
    if (dailyNutritionRef.value?.fetchNutritionData) {
      await dailyNutritionRef.value.fetchNutritionData()
    }
  } catch (error) {
    console.error('更新营养数据失败:', error)
  }
}

// 处理保存饮食目标
const handleSaveGoals = async (goals) => {
  try {
    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('用户信息不存在，请重新登录')
      return
    }

    // 保存到后端
    await saveDietGoals(userId, goals)
    
    // 更新本地目标
    currentGoals.value = { ...goals }
    
    // 同时保存到本地存储作为备份
    saveGoalsToLocal(goals)
    
    // 更新营养数据显示（如果有目标更新，重新计算百分比）
    if (dailyNutritionRef.value?.updateGoals) {
      dailyNutritionRef.value.updateGoals(goals)
    }
    
    ElMessage.success('饮食目标设置成功！')
  } catch (error) {
    console.error('保存饮食目标失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 从后端加载保存的目标
const loadSavedGoals = async () => {
  const userId = store.state.user?.id
  
  // 如果用户未登录，直接使用本地目标
  if (!userId) {
    console.warn('用户未登录，使用本地存储的目标')
    loadLocalGoals()
    return
  }

  // 尝试从后端加载
  try {
    console.log('尝试从后端加载饮食目标...')
    const response = await getCurrentDietGoals(userId)
    
    if (response && response.data) {
      currentGoals.value = { ...response.data }
      // 同时保存到本地作为备份
      saveGoalsToLocal(response.data)
      console.log('成功从后端加载饮食目标:', response.data)
      return
    } else {
      console.warn('后端返回空数据，使用本地目标')
    }
  } catch (backendError) {
    console.warn('后端加载失败，使用本地目标。错误:', backendError.message || backendError)
  }
  
  // 如果后端加载失败，从本地加载
  loadLocalGoals()
}

// 从localStorage加载保存的目标（备用方案）
const loadLocalGoals = () => {
  try {
    const saved = localStorage.getItem('dietGoals')
    if (saved) {
      currentGoals.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载本地保存的目标失败:', error)
  }
}

// 保存目标到localStorage
const saveGoalsToLocal = (goals) => {
  try {
    localStorage.setItem('dietGoals', JSON.stringify(goals))
  } catch (error) {
    console.error('保存目标到本地失败:', error)
  }
}

onMounted(async () => {
  // 组件挂载后初始化数据
  await loadSavedGoals()
  handleNutritionUpdate()
})
</script>

<style scoped>
/* 主容器样式 */
.diet-page-container {
  height: 85vh;
  background: #f9fafb;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 头部横幅 */
.header-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 10px 10px 25px;
  position: relative;
  overflow: hidden;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-text .page-title {
  font-size: 2.5rem;
  margin: 0 0 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.add-button {
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 25px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.add-button:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 20px auto 40px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

/* 每日概览样式 */
.daily-overview {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 30px;
}

.daily-overview:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  gap: 30px;
  align-items: start;
  min-height: auto;
}

/* 卡片通用样式 */
.diet-records-card,
.nutrition-calendar-card {
  border-radius: 20px;
  border: none;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.diet-records-card:hover,
.nutrition-calendar-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 25px;
  border-bottom: 1px solid #e2e8f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.header-icon {
  font-size: 24px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px;
  border-radius: 10px;
}

.card-body {
  padding: 5px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .main-content {
    padding: 0 10px;
  }
  
  .content-grid {
    gap: 20px;
  }
  
  .daily-overview,
  .card-body {
    padding: 15px;
  }
}
</style>