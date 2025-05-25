<template>
  <el-dialog
      v-model="dialogVisible"
      title="添加食物"
      width="70%"
      :before-close="handleClose"
  >
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
          v-model="searchQuery"
          placeholder="搜索食物名称"
          clearable
          @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 搜索结果列表 -->
    <div class="search-results" v-loading="searching">
      <template v-if="searchResults.length">
        <el-table
            :data="searchResults"
            height="400"
            @row-click="handleFoodSelect"
        >
          <el-table-column prop="foodName" label="食物名称" />
          <el-table-column label="营养成分(每100g)" width="400">
            <template #default="scope">
              <div class="nutrition-info">
                <span>热量: {{ scope.row.calories }}kcal</span>
                <span>碳水: {{ scope.row.carbs }}g</span>
                <span>蛋白质: {{ scope.row.protein }}g</span>
                <span>脂肪: {{ scope.row.fat }}g</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleFoodSelect(scope.row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-empty
          v-else-if="!searching"
          description="暂无搜索结果"
      />
    </div>

    <!-- 食物份量设置对话框 -->
    <el-dialog
        v-model="servingDialogVisible"
        title="设置份量"
        width="30%"
        append-to-body
    >
      <div class="serving-form">
        <div class="selected-food-info">
          <h4>{{ selectedFood?.foodName }}</h4>
          <p class="base-nutrition">
            基础营养成分(每100{{ selectedFood?.servingUnit || 'g' }})：
          </p>
          <div class="nutrition-info">
            <span>热量: {{ selectedFood?.calories }}kcal</span>
            <span>碳水: {{ selectedFood?.carbs }}g</span>
            <span>蛋白质: {{ selectedFood?.protein }}g</span>
            <span>脂肪: {{ selectedFood?.fat }}g</span>
          </div>
        </div>

        <el-form :model="servingForm" label-width="100px">
          <el-form-item label="食用份量">
            <el-input-number
                v-model="servingForm.amount"
                :min="0"
                :precision="1"
                :step="0.5"
                @change="calculateNutrition"
            />
            <span class="unit">{{ selectedFood?.servingUnit || 'g' }}</span>
          </el-form-item>
        </el-form>

        <div class="calculated-nutrition">
          <h4>实际摄入营养:</h4>
          <div class="nutrition-info">
            <span>热量: {{ calculatedNutrition.calories }}kcal</span>
            <span>碳水: {{ calculatedNutrition.carbs }}g</span>
            <span>蛋白质: {{ calculatedNutrition.protein }}g</span>
            <span>脂肪: {{ calculatedNutrition.fat }}g</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="servingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmServing">
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
import { Search } from '@element-plus/icons-vue'
import { searchFood } from '@/api/diet'
import { debounce } from 'lodash-es'

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

// 搜索相关
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)

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

// 处理搜索
const handleSearch = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    searching.value = true
    const response = await searchFood(searchQuery.value)
    searchResults.value = response || []
    console.log('转换后的搜索结果:', searchResults.value)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
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

  const ratio = servingForm.value.amount / 100
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

// 重置表单
const resetForm = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedFood.value = null
  servingForm.value.amount = 100
}

// 处理关闭
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  animation: dialogFadeIn 0.4s ease-out;
}

.search-section {
  margin-bottom: 24px;
}

:deep(.el-input) {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.el-input:focus-within) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.serving-form {
  padding: 24px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 20px;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.search-results {
  margin-bottom: 20px;
  min-height: 200px;
}

.nutrition-info {
  display: flex;
  gap: 16px;
}

.selected-food-info {
  margin-bottom: 24px;
}

.base-nutrition {
  margin: 8px 0;
  color: #606266;
}

.unit {
  margin-left: 8px;
}

.calculated-nutrition {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

:deep(.el-input-number) {
  width: 150px;
}
</style>