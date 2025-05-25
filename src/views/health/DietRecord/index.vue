<template>
  <div class="diet-page-container">
    <div class="diet-page">
      <!-- 固定在顶部的营养概览 -->
      <div class="daily-overview">
        <DailyNutrition
            ref="dailyNutritionRef"
            :userId="store.state.user?.id"
            :date="selectedDate"
        />
      </div>

      <!-- 可滚动的主内容区域 -->
      <div class="scrollable-content">
        <!-- 左侧饮食记录 -->
        <div class="content-section diet-record-section">
          <DietRecord
              @nutrition-updated="handleNutritionUpdate"
              @date-change="handleDateChange"
          />
        </div>

        <!-- 右侧日历 -->
        <div class="content-section right-section">
          <div class="calendar-section">
            <NutritionCalendar />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import DailyNutrition from './components/DailyNutrition.vue'
import DietRecord from './components/DietRecord.vue'
import NutritionCalendar from './components/NutritionCalendar.vue'

const store = useStore()
const dailyNutritionRef = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

const emit = defineEmits(['date-change', 'nutrition-updated'])

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

onMounted(() => {
  // 组件挂载后初始化数据
  handleNutritionUpdate()
})
</script>

<style scoped>
.diet-page-container {
  min-height: 100vh;
  max-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #d7e3ec 100%);
  padding: 32px;
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
}

.diet-page {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
  padding-bottom: 32px;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.daily-overview {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-overview:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
}

.scrollable-content {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 32px;
  min-height: 700px;
}

.content-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}

.diet-record-section {
  display: flex;
  flex-direction: column;
}

.right-section {
  display: flex;
  flex-direction: column;
}

.calendar-section {
  height: 100%;
  min-height: 600px;
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
@media (max-width: 1200px) {
  .scrollable-content {
    grid-template-columns: 1fr;
  }

  .content-section {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .diet-page-container {
    padding: 16px;
  }

  .daily-overview,
  .content-section {
    padding: 16px;
  }
}

/* 美化滚动条样式 */
.diet-page-container::-webkit-scrollbar {
  width: 12px;
}

.diet-page-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin: 8px;
}

.diet-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(
      to bottom,
      rgba(59, 130, 246, 0.5),
      rgba(16, 185, 129, 0.5)
  );
  border-radius: 6px;
  border: 3px solid transparent;
  background-clip: padding-box;
  transition: all 0.3s ease;
}

.diet-page-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
      to bottom,
      rgba(59, 130, 246, 0.8),
      rgba(16, 185, 129, 0.8)
  );
  border: 2px solid transparent;
}

/* 添加平滑滚动效果 */
.diet-page-container {
  scroll-behavior: smooth;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .diet-page-container {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .diet-page-container {
    padding: 16px;
  }
}
</style>