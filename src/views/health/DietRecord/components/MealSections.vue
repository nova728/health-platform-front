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
            <el-button type="primary" size="small" @click="showAddFood(type.value)">
              <el-icon><Plus /></el-icon>添加食物
            </el-button>
          </div>

          <!-- 食物列表 -->
          <el-table
              :data="getMealsByType(type.value)"
              style="width: 100%"
              v-loading="loading"
          >
            <el-table-column prop="foodName" label="食物名称" />
            <el-table-column label="份量" width="120">
              <template #default="scope">
                {{ scope.row.servingAmount }}{{ scope.row.servingUnit }}
              </template>
            </el-table-column>
            <el-table-column prop="calories" label="热量(kcal)" width="120" />
            <el-table-column prop="carbs" label="碳水(g)" width="100" />
            <el-table-column prop="protein" label="蛋白质(g)" width="100" />
            <el-table-column prop="fat" label="脂肪(g)" width="100" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 无数据提示 -->
          <el-empty
              v-if="!getMealsByType(type.value).length"
              description="暂无记录"
          >
            <el-button type="primary" @click="showAddFood(type.value)">
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
import { Plus } from '@element-plus/icons-vue'
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  height: 100%;
  transition: all 0.3s ease;
}

:deep(.el-tabs__nav) {
  background: rgba(255, 255, 255, 0.8);
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-tabs__item) {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  padding: 12px 32px;
  border-radius: 12px;
}

:deep(.el-tabs__item.is-active) {
  background: linear-gradient(120deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.meal-header h4 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

:deep(.el-button--primary) {
  background: linear-gradient(120deg, #409EFF, #67C23A);
  border: none;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

:deep(.el-table th) {
  background: #f5f7fa;
  font-weight: 600;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  transform: scale(1.001);
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.meal-content {
  animation: slideIn 0.4s ease-out;
}

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
</style>