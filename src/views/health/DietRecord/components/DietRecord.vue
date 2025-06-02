<template>
  <div class="diet-record">
    <!-- 固定在顶部的日期选择器 -->
    <div class="date-selector-wrapper">
      <DateSelector @date-change="handleDateChange" />
    </div>
      <!-- 可滚动的餐次记录 -->    
    <div class="meals-wrapper">
      <MealSections 
        :meals="dailyMeals"
        :loading="loading"
        :selected-date="selectedDate"
        @add-food="showFoodSearch"
        @delete-meal="handleDeleteMeal"
      />
    </div>

    <!-- 食物搜索对话框 -->
    <FoodSearchDialog
      v-model:visible="foodSearchVisible"
      :meal-type="currentMealType"
      @confirm="handleAddFood"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDailyNutrition, addMeal, deleteMeal } from '@/api/diet'
import { useStore } from 'vuex'
import DateSelector from './DateSelector.vue'
import MealSections from './MealSections.vue'
import FoodSearchDialog from './FoodSearchDialog.vue'

const store = useStore()
const loading = ref(false)
const dailyMeals = ref([])
const foodSearchVisible = ref(false)
const currentMealType = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])

onMounted(async () => {
  const date = selectedDate.value
  await handleDateChange(date)
})

// 添加 handleDateChange 方法
const handleDateChange = async (date) => {
  try {
    loading.value = true
    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }

    selectedDate.value = date
    const response = await getDailyNutrition(userId, date)
    if (response.data) {
      dailyMeals.value = response.data.meals || []
      // 同时发送数据更新和日期变化事件
      emit('nutrition-updated', response.data)
      emit('date-change', date)
    }
  } catch (error) {
    console.error('获取营养数据失败:', error)
    ElMessage.error('获取营养数据失败')
  } finally {
    loading.value = false
  }
}


// 显示食物搜索
const showFoodSearch = (mealType) => {
  currentMealType.value = mealType
  foodSearchVisible.value = true
}

// 处理添加食物
const handleAddFood = async (foodData) => {
  try {
    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }

    const response = await addMeal(userId, selectedDate.value, {
      ...foodData,
      mealType: currentMealType.value
    })

    if (response.data) {
      ElMessage.success('添加成功')
      dailyMeals.value = response.data.meals
      emit('nutrition-updated', response.data)
    }
  } catch (error) {
    console.error('添加失败:', error)
    if (error.response) {
      ElMessage.error(`添加失败: ${error.response.data?.message || '服务器错误'}`)
    } else {
      ElMessage.error('添加失败: 网络错误')
    }
  }
}

// 处理删除餐食
const handleDeleteMeal = async (mealId) => {
  try {
    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }

    loading.value = true
    const response = await deleteMeal(userId, mealId)
    
    if (response.status === 200) {
      ElMessage.success('删除成功')
      await handleDateChange(selectedDate.value)
      emit('nutrition-updated', response.data)
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 定义事件
const emit = defineEmits(['nutrition-updated', 'date-change'])

// 暴露方法给父组件调用
defineExpose({
  showFoodSearch,
  handleDateChange
})
</script>

<style scoped>
.diet-record {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.date-selector-wrapper {
  flex-shrink: 0;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.meals-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

:deep(.el-date-editor) {
  width: 180px;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.el-date-editor:focus-within) {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
</style>