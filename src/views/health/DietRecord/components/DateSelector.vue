<template>
    <div class="date-selector-container">
      <div class="date-selector">
        <div class="date-picker-section">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            :disabled-date="disabledDate"
            @change="handleDateChange"
            class="date-picker"
          />
        </div>
        <div class="date-navigation">
          <el-button @click="changeDate(-1)" class="nav-button prev-button">
            <el-icon><ArrowLeft /></el-icon>
            前一天
          </el-button>
          <el-button @click="setToday" class="nav-button today-button">
            <el-icon><Calendar /></el-icon>
            今天
          </el-button>
          <el-button @click="changeDate(1)" class="nav-button next-button">
            后一天
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </template>
    <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'
  import { getDailyNutrition } from '@/api/diet'
  import { useStore } from 'vuex'
  
  const store = useStore()
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const loading = ref(false)
  
  // 禁用未来日期
  const disabledDate = (time) => {
    return time.getTime() > Date.now()
  }
  
  // 处理日期变化
  const handleDateChange = async (date) => {
    if (!date) return
    
    try {
      loading.value = true
      const userId = store.state.user?.id
      if (!userId) {
        ElMessage.error('请先登录')
        return
      }

      selectedDate.value = date
      // 通知父组件日期变化
      emit('date-change', date)
    } catch (error) {
      console.error('加载数据失败:', error)
      ElMessage.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }
  
  // 日期导航
  const changeDate = (days) => {
    const date = new Date(selectedDate.value)
    date.setDate(date.getDate() + days)
    
    // 检查是否超过今天
    if (date.getTime() > Date.now()) {
      ElMessage.warning('不能选择未来日期')
      return
    }
    
    selectedDate.value = date.toISOString().split('T')[0]
    handleDateChange(selectedDate.value)
  }
  
  // 设置为今天
  const setToday = () => {
    selectedDate.value = new Date().toISOString().split('T')[0]
    handleDateChange(selectedDate.value)
  }
  
  // 加载每日营养数据
  const loadDailyNutrition = async (date) => {
    try {
      const userId = store.state.user?.id
      if (!userId) return
      
      const response = await getDailyNutrition(userId, date)
      if (response.data) {
        // 这里可以发出事件通知父组件数据已更新
        emit('nutrition-updated', response.data)
      }
    } catch (error) {
      console.error('获取营养数据失败:', error)
      throw error
    }
  }
  
  // 定义事件
  const emit = defineEmits(['nutrition-updated'])
  
  // 组件挂载时加载今天的数据
  onMounted(() => {
    handleDateChange(selectedDate.value)
  })
  </script>
    <style scoped>
  .date-selector-container {
    width: 100%;
  }
  
  .date-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .date-picker-section {
    flex-shrink: 0;
  }
  
  :deep(.date-picker) {
    width: 200px;
  }
  
  :deep(.el-date-editor) {
    border-radius: 20px;
    border: 2px solid #e2e8f0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  :deep(.el-date-editor:focus-within) {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  .date-navigation {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .nav-button {
    padding: 10px 20px;
    border-radius: 15px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .nav-button:hover {
    border-color: #10b981;
    color: #10b981;
    background: rgba(16, 185, 129, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
  
  .today-button {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: transparent;
    color: white;
  }
  
  .today-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    border-color: transparent;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  
  :deep(.el-button .el-icon) {
    margin: 0 6px;
  }
  
  /* 响应式布局 */
  @media (max-width: 768px) {
    .date-selector {
      flex-direction: column;
      gap: 15px;
    }
    
    .date-navigation {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .nav-button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
  </style>