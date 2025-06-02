<template>
  <el-dialog
      v-model="dialogVisible"
      title="添加食物"
      width="80%"
      :before-close="handleClose"
      destroy-on-close
      class="food-search-dialog"
      append-to-body
  >    <el-tabs v-model="activeTab" class="search-tabs">
      <el-tab-pane label="搜索食物" name="search">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-container">
            <el-input
                v-model="searchQuery"
                placeholder="搜索食物名称..."
                clearable
                @input="handleSearch"
                class="search-input"
                size="large"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleSearch" type="primary" class="search-btn">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
        </div>        <!-- 搜索结果列表 -->
        <div class="search-results" v-loading="searching">
          <template v-if="searchResults.length">
            <div class="results-header">
              <div class="results-info">
                <span class="results-count">找到 {{ getTotalResults() }} 条结果</span>
                <span class="results-subtitle">选择您需要的食物</span>
              </div>
              <div class="pagination-controls" v-if="getPagination().totalPages > 1">
                <el-pagination
                  :total="getPagination().totalResults"
                  :page-size="20"
                  :current-page="currentPage"
                  @current-change="handlePageChange"
                  layout="prev, pager, next"
                  :pager-count="5"
                  class="custom-pagination"
                />
              </div>
            </div>
            <div class="food-list">
              <div 
                v-for="food in getFormattedResults()" 
                :key="food.id"
                class="food-item"
                @click="handleFoodSelect(food)"
              >
                <div class="food-content">
                  <div class="food-info">
                    <h4 class="food-name">{{ food.foodName }}</h4>
                    <p v-if="food.brandName" class="brand-name">{{ food.brandName }}</p>
                    <span class="food-type">{{ food.foodType }}</span>
                  </div>
                  <div class="nutrition-summary">
                    <div class="nutrition-item">
                      <span class="nutrition-label">热量</span>
                      <span class="nutrition-value">{{ food.calories }}kcal</span>
                    </div>
                    <div class="nutrition-item">
                      <span class="nutrition-label">碳水</span>
                      <span class="nutrition-value">{{ food.carbs }}g</span>
                    </div>
                    <div class="nutrition-item">
                      <span class="nutrition-label">蛋白质</span>
                      <span class="nutrition-value">{{ food.protein }}g</span>
                    </div>
                    <div class="nutrition-item">
                      <span class="nutrition-label">脂肪</span>
                      <span class="nutrition-value">{{ food.fat }}g</span>
                    </div>
                  </div>
                  <div class="food-actions">
                    <el-button
                        type="primary"
                        size="default"
                        @click.stop="handleFoodSelect(food)"
                        class="select-btn"
                    >
                      选择
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div
            v-else-if="!searching"
            class="empty-state"
          >
            <div class="empty-content">
              <el-icon class="empty-icon"><Search /></el-icon>
              <h3 class="empty-title">
                {{ searchQuery ? '没有找到匹配的食物' : '请输入食物名称进行搜索' }}
              </h3>
              <p class="empty-subtitle">
                {{ searchQuery ? '请尝试其他关键词' : '支持中英文食物名称搜索' }}
              </p>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="拍照识别" name="photo">
        <FoodImageRecognition 
          @food-recognized="handleFoodRecognized" 
          @search-food="handleImageSearchFood"
          @add-to-meal="handleAddRecognizedFood"
        />      </el-tab-pane>
    </el-tabs>    <!-- 食物份量设置对话框 -->
    <el-dialog
        v-model="servingDialogVisible"
        title="设置份量"
        width="500px"
        append-to-body
        class="serving-dialog"
    >
      <div class="serving-form">
        <div class="selected-food-card">
          <div class="food-header">
            <h3 class="food-title">{{ selectedFood?.foodName }}</h3>
            <span v-if="selectedFood?.brandName" class="food-brand">{{ selectedFood?.brandName }}</span>
          </div>
          <div class="base-nutrition-info">
            <h4 class="nutrition-title">
              基础营养成分 (每100{{ selectedFood?.servingUnit || 'g' }})
            </h4>
            <div class="nutrition-grid">
              <div class="nutrition-card">
                <span class="nutrition-label">热量</span>
                <span class="nutrition-value">{{ selectedFood?.calories }}kcal</span>
              </div>
              <div class="nutrition-card">
                <span class="nutrition-label">碳水</span>
                <span class="nutrition-value">{{ selectedFood?.carbs }}g</span>
              </div>
              <div class="nutrition-card">
                <span class="nutrition-label">蛋白质</span>
                <span class="nutrition-value">{{ selectedFood?.protein }}g</span>
              </div>
              <div class="nutrition-card">
                <span class="nutrition-label">脂肪</span>
                <span class="nutrition-value">{{ selectedFood?.fat }}g</span>
              </div>
            </div>
          </div>
        </div>

        <div class="serving-input-section">
          <el-form :model="servingForm" label-position="top">
            <el-form-item label="食用份量">
              <div class="amount-input-wrapper">
                <el-input-number
                    v-model="servingForm.amount"
                    :min="0"
                    :precision="1"
                    :step="0.5"
                    @change="calculateNutrition"
                    class="amount-input"
                    size="large"
                />
                <span class="unit-label">{{ selectedFood?.servingUnit || 'g' }}</span>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="calculated-nutrition-card">
          <h4 class="section-title">实际摄入营养</h4>
          <div class="nutrition-grid">
            <div class="nutrition-card highlight">
              <span class="nutrition-label">热量</span>
              <span class="nutrition-value">{{ calculatedNutrition.calories }}kcal</span>
            </div>
            <div class="nutrition-card highlight">
              <span class="nutrition-label">碳水</span>
              <span class="nutrition-value">{{ calculatedNutrition.carbs }}g</span>
            </div>
            <div class="nutrition-card highlight">
              <span class="nutrition-label">蛋白质</span>
              <span class="nutrition-value">{{ calculatedNutrition.protein }}g</span>
            </div>
            <div class="nutrition-card highlight">
              <span class="nutrition-label">脂肪</span>
              <span class="nutrition-value">{{ calculatedNutrition.fat }}g</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="servingDialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="confirmServing" size="large" class="confirm-btn">
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Camera } from '@element-plus/icons-vue'
import { searchFood as dietSearchFood } from '@/api/diet'
import { searchFood, recognizeFoodFromImage } from '@/api/food'
import { debounce } from 'lodash-es'
import FoodImageRecognition from './FoodImageRecognition.vue'

const props = defineProps({
  visible: Boolean,
  mealType: String
})

const emit = defineEmits(['update:visible', 'confirm'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 标签页
const activeTab = ref('search')

// 搜索相关
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const currentPage = ref(1)
const rawApiResponse = ref(null)

// 份量设置相关
const servingDialogVisible = ref(false)
const selectedFood = ref(null)
const servingForm = ref({
  amount: 100
})
const calculatedNutrition = ref({
  calories: 0,
  carbs: 0,
  protein: 0,
  fat: 0
})

// 获取总结果数
const getTotalResults = () => {
  if (!rawApiResponse.value || !rawApiResponse.value.foods_search) {
    return searchResults.value.length
  }
  return parseInt(rawApiResponse.value.foods_search.total_results || 0)
}

// 获取分页信息
const getPagination = () => {
  if (!rawApiResponse.value || !rawApiResponse.value.foods_search) {
    return {
      currentPage: 1,
      totalPages: 1,
      totalResults: searchResults.value.length
    }
  }
  
  const foodsSearch = rawApiResponse.value.foods_search
  const totalResults = parseInt(foodsSearch.total_results || 0)
  const maxResults = parseInt(foodsSearch.max_results || 20)
  
  return {
    currentPage: parseInt(foodsSearch.page_number || 1),
    totalPages: Math.ceil(totalResults / maxResults),
    totalResults: totalResults
  }
}

// 获取格式化后的结果
const getFormattedResults = () => {
  if (!rawApiResponse.value || !rawApiResponse.value.foods_search || !rawApiResponse.value.foods_search.results) {
    return searchResults.value
  }
  
  const results = rawApiResponse.value.foods_search.results
  if (!results.food || !Array.isArray(results.food)) {
    return []
  }
  
  return results.food.map(food => {
    const serving = food.servings && food.servings.serving ? 
      (Array.isArray(food.servings.serving) ? food.servings.serving[0] : food.servings.serving) : null
    
    return {
      id: food.food_id,
      foodName: food.food_name,
      brandName: food.brand_name || null,
      foodType: food.food_type,
      calories: serving ? parseFloat(serving.calories) : 0,
      carbs: serving ? parseFloat(serving.carbohydrate) : 0,
      protein: serving ? parseFloat(serving.protein) : 0,
      fat: serving ? parseFloat(serving.fat) : 0,
      servingUnit: serving ? (serving.metric_serving_unit || 'g') : 'g',
      servingAmount: serving ? parseFloat(serving.metric_serving_amount) : 100,
      servingDescription: serving ? serving.serving_description : '100g',
      originalData: food
    }
  })
}

// 处理页码变化
const handlePageChange = async (page) => {
  currentPage.value = page
  await performSearch()
}

// 执行搜索
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    rawApiResponse.value = null
    return
  }
  try {
    searching.value = true
    const response = await searchFood(searchQuery.value, currentPage.value, 20)
    rawApiResponse.value = response
    searchResults.value = getFormattedResults()
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败: ' + (error.message || '未知错误'))
    searchResults.value = []
    rawApiResponse.value = null
  } finally {
    searching.value = false
  }
}

// 处理搜索
const handleSearch = debounce(async () => {
  currentPage.value = 1 // 重置页码
  await performSearch()
}, 300)

// 处理食物选择
const handleFoodSelect = (food) => {
  selectedFood.value = food
  servingForm.value.amount = 100
  calculateNutrition()
  servingDialogVisible.value = true
}

// 计算实际营养
const calculateNutrition = () => {
  if (!selectedFood.value) return

  const baseAmount = selectedFood.value.servingAmount || 100
  const ratio = servingForm.value.amount / baseAmount
  calculatedNutrition.value = {
    calories: (selectedFood.value.calories * ratio).toFixed(1),
    carbs: (selectedFood.value.carbs * ratio).toFixed(1),
    protein: (selectedFood.value.protein * ratio).toFixed(1),
    fat: (selectedFood.value.fat * ratio).toFixed(1)
  }
}

// 确认添加食物
const confirmServing = () => {
  if (!selectedFood.value) return

  const foodRecord = {
    ...selectedFood.value,
    ...calculatedNutrition.value,
    servingAmount: servingForm.value.amount,
    mealType: props.mealType
  }

  emit('confirm', foodRecord)
  servingDialogVisible.value = false
  dialogVisible.value = false
  resetForm()
}

// 处理图片识别结果
const handleFoodRecognized = (foods) => {
  console.log('识别到的食物:', foods)
}

// 从图片识别结果中搜索类似食物
const handleImageSearchFood = (foodName) => {
  activeTab.value = 'search'
  searchQuery.value = foodName
  handleSearch()
}

// 添加识别的食物
const handleAddRecognizedFood = (food) => {
  // 转换图像识别结果为标准食物对象
  const standardFood = {
    id: Date.now().toString(),
    foodName: food.name,
    calories: food.calorie || 0,
    carbs: 0, // 图像识别通常没有详细营养信息
    protein: 0,
    fat: 0,
    servingUnit: 'g',
    servingAmount: 100,
    servingDescription: '100g',
    confidence: food.trust
  }
  
  selectedFood.value = standardFood
  servingForm.value.amount = 100
  calculateNutrition()
  servingDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  searchQuery.value = ''
  searchResults.value = []
  rawApiResponse.value = null
  selectedFood.value = null
  servingForm.value.amount = 100
  activeTab.value = 'search'
  currentPage.value = 1
}

// 处理关闭
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}
</script>

<style scoped>
/* 主对话框样式 */
:deep(.food-search-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.15);
  animation: dialogSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

:deep(.food-search-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 24px 32px;
  margin: 0;
  color: white;
}

:deep(.food-search-dialog .el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.food-search-dialog .el-dialog__close) {
  color: white;
  font-size: 20px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

:deep(.food-search-dialog .el-dialog__close:hover) {
  opacity: 1;
  transform: scale(1.1);
}

:deep(.food-search-dialog .el-dialog__body) {
  padding: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

/* 标签页样式 */
.search-tabs {
  margin-bottom: 32px;
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__nav-wrap) {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 6px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-tabs__nav) {
  border: none;
  background: transparent;
}

:deep(.el-tabs__item) {
  padding: 0 28px;
  height: 48px;
  line-height: 48px;
  border: none;
  color: #64748b;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin: 0 4px;
  position: relative;
}

:deep(.el-tabs__item:hover) {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  transform: translateY(-1px);
}

:deep(.el-tabs__item.is-active) {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

:deep(.el-tabs__active-bar) {
  display: none;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  position: relative;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding: 8px 16px;
  height: 56px;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #10b981;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  transform: translateY(-2px);
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1), 0 8px 24px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

:deep(.search-input .el-input__inner) {
  font-size: 16px;
  color: #1e293b;
  font-weight: 500;
}

.search-icon {
  color: #10b981;
  font-size: 20px;
}

:deep(.search-btn) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

:deep(.search-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* 搜索结果样式 */
.search-results {
  min-height: 400px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.results-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.results-count {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.results-subtitle {
  font-size: 14px;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  justify-content: flex-end;
}

:deep(.custom-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* 食物列表样式 */
.food-list {
  padding: 24px 32px;
  max-height: 500px;
  overflow-y: auto;
}

.food-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.food-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.food-item:hover {
  border-color: #10b981;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
  transform: translateY(-4px);
}

.food-item:hover::before {
  opacity: 1;
}

.food-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.food-info {
  flex: 1;
}

.food-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.brand-name {
  font-size: 14px;
  color: #10b981;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.food-type {
  display: inline-block;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.nutrition-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 70px;
}

.nutrition-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.nutrition-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.food-actions {
  display: flex;
  gap: 12px;
}

:deep(.select-btn) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

:deep(.select-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: white;
  border-radius: 16px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #4b5563;
  margin: 0 0 12px 0;
}

.empty-subtitle {
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
}

/* 份量设置对话框样式 */
:deep(.serving-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.15);
}

:deep(.serving-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 24px 32px;
  margin: 0;
}

:deep(.serving-dialog .el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

:deep(.serving-dialog .el-dialog__close) {
  color: white;
  opacity: 0.8;
}

.serving-form {
  padding: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.selected-food-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.food-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.food-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.food-brand {
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
}

.base-nutrition-info,
.calculated-nutrition-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.nutrition-title,
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.nutrition-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.nutrition-card.highlight {
  border-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.nutrition-card .nutrition-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.nutrition-card .nutrition-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.nutrition-card.highlight .nutrition-value {
  color: #059669;
}

.serving-input-section {
  margin-bottom: 24px;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.amount-input-wrapper:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

:deep(.amount-input .el-input-number) {
  border: none;
  background: transparent;
}

:deep(.amount-input .el-input__wrapper) {
  border: none;
  background: transparent;
  box-shadow: none;
}

.unit-label {
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
}

/* 对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #e2e8f0;
}

:deep(.confirm-btn) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 28px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

:deep(.confirm-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* 动画效果 */
@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.food-search-dialog .el-dialog) {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .food-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .nutrition-summary {
    justify-content: center;
  }
  
  .results-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>