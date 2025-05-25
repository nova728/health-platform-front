<template>
    <div class="diet-record">
      <div class="date-selector">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          :disabled-date="disabledDate"
          @change="handleDateChange"
        />
        <div class="date-navigation">
          <el-button @click="changeDate(-1)">
            <el-icon><ArrowLeft /></el-icon>
            前一天
          </el-button>
          <el-button @click="setToday">今天</el-button>
          <el-button @click="changeDate(1)">
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
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
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
  .diet-record {
    padding: 20px;
  }
  
  .date-selector {
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
  
  :deep(.el-button .el-icon) {
    margin: 0 4px;
  }
  </style>