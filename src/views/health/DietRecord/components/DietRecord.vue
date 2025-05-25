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
</script>

<style scoped>
.diet-record {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.date-navigation {
  display: flex;
  gap: 10px;
}

:deep(.el-date-editor) {
  width: 180px;
}

.diet-record-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.date-selector-wrapper {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.meals-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>