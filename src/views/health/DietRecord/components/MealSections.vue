<template>
  <div class="meal-sections">
    <!-- 餐次标签页 -->
    <el-tabs v-model="activeMealType" class="meal-tabs">
      <el-tab-pane
          v-for="type in mealTypes"
          :key="type.value"
          :label="type.label"
          :name="type.value"
      >
        <!-- 餐次内容 -->
        <div class="meal-content">
          <div class="meal-header">
            <h4>{{ type.label }}</h4>
            <el-button type="primary" size="default" @click="showAddFood(type.value)" class="add-food-button">
              <el-icon><Plus /></el-icon>添加食物
            </el-button>
          </div>

          <!-- 食物列表 -->
          <div class="food-list-container">
            <el-table
                :data="getMealsByType(type.value)"
                style="width: 100%"
                v-loading="loading"
                class="food-table"
                empty-text="暂无食物记录"
            >
              <el-table-column prop="foodName" label="食物名称" min-width="150">
                <template #default="scope">
                  <div class="food-name-cell">
                    <span class="food-name">{{ scope.row.foodName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="份量" width="120" align="center">
                <template #default="scope">
                  <el-tag type="info" size="small" class="serving-tag">
                    {{ scope.row.servingAmount }}{{ scope.row.servingUnit }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="calories" label="热量(kcal)" width="100" align="center">
                <template #default="scope">
                  <span class="nutrition-value calories">{{ scope.row.calories }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="carbs" label="碳水(g)" width="90" align="center">
                <template #default="scope">
                  <span class="nutrition-value carbs">{{ scope.row.carbs }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="protein" label="蛋白质(g)" width="100" align="center">
                <template #default="scope">
                  <span class="nutrition-value protein">{{ scope.row.protein }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="fat" label="脂肪(g)" width="90" align="center">
                <template #default="scope">
                  <span class="nutrition-value fat">{{ scope.row.fat }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right" align="center">
                <template #default="scope">
                  <el-button
                      type="danger"
                      size="small"
                      @click="handleDelete(scope.row)"
                      class="delete-button"
                      circle
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 无数据提示 -->
          <el-empty
              v-if="!getMealsByType(type.value).length"
              description="暂无记录"
              class="custom-empty"
              :image-size="80"
          >
            <template #image>
              <div class="empty-image">🍽️</div>
            </template>
            <el-button type="primary" @click="showAddFood(type.value)" class="empty-add-button">
              <el-icon><Plus /></el-icon>
              添加食物
            </el-button>
          </el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { deleteMeal } from '@/api/diet'
import { useStore } from 'vuex'

const props = defineProps({
  meals: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:meals', 'add-food'])

const store = useStore()
const loading = ref(false)
const activeMealType = ref('BREAKFAST')

// 定义餐次类型
const mealTypes = [
  { label: '早餐', value: 'BREAKFAST' },
  { label: '午餐', value: 'LUNCH' },
  { label: '晚餐', value: 'DINNER' },
  { label: '加餐', value: 'SNACK' }
]

// 根据餐次类型获取对应的食物记录
const getMealsByType = (type) => {
  return props.meals.filter(meal => meal.mealType === type)
}

// 显示添加食物对话框
const showAddFood = (mealType) => {
  emit('add-food', mealType)
}

// 处理删除食物记录
const handleDelete = async (meal) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条记录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }

    loading.value = true
    // 触发父组件的删除处理
    emit('delete-meal', meal.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.meal-sections {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标签页样式 */
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

:deep(.el-tabs__nav-wrap) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-tabs__item) {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.3s ease;
  border: none !important;
}

:deep(.el-tabs__item:hover) {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

:deep(.el-tabs__item.is-active) {
  background: linear-gradient(120deg, #10b981, #059669);
  color: white;
  font-weight: 600;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

:deep(.el-tabs__active-bar) {
  display: none;
}

/* 餐次内容 */
.meal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.4s ease-out;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.meal-header h4 {
  font-size: 18px;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
}

.add-food-button {
  border-radius: 20px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.add-food-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, #059669, #047857);
}

/* 食物列表 */
.food-list-container {
  flex: 1;
  overflow: auto;
}

:deep(.food-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #475569;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 12px;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background: #fafbfc;
  transform: scale(1.001);
}

:deep(.el-table__row:hover td) {
  background: transparent;
}

/* 食物名称 */
.food-name-cell {
  display: flex;
  align-items: center;
}

.food-name {
  font-weight: 500;
  color: #1e293b;
}

/* 营养值样式 */
.nutrition-value {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 13px;
}

.nutrition-value.calories {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.nutrition-value.carbs {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.nutrition-value.protein {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.nutrition-value.fat {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

/* 份量标签 */
.serving-tag {
  border-radius: 12px;
  font-weight: 500;
  background: rgba(100, 116, 139, 0.1);
  color: #475569;
  border: none;
}

/* 删除按钮 */
.delete-button {
  width: 32px;
  height: 32px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: scale(1.1);
}

/* 空状态 */
.custom-empty {
  padding: 40px 20px;
}

.empty-image {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-add-button {
  border-radius: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.empty-add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .meal-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .add-food-button {
    align-self: center;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 8px;
  }
}
</style>