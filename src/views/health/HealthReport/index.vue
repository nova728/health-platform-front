<template>
  <div class="health-report-container">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="健康概览" name="overview">
        <health-overview :report="latestReport" @refresh="handleRefresh"/>
      </el-tab-pane>
      <el-tab-pane label="详细指标" name="details">
        <health-metrics :report="latestReport"/>
      </el-tab-pane>
      <el-tab-pane label="历史报告" name="history">
        <health-report-history ref="historyRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getLatestReport } from '@/api/healthReport'
import HealthOverview from './components/HealthOverview.vue'
import HealthMetrics from './components/HealthMetrics.vue'
import HealthReportHistory from './components/HealthReportHistory.vue'

const store = useStore()
const activeTab = ref('overview')
const loading = ref(false)
const currentUserId = computed(() => store.state.user?.id)
const latestReport = ref({})
const historyRef = ref(null)

// 添加刷新处理方法
const handleRefresh = async () => {
  try {
    await fetchLatestReport()
    // 等待最新报告获取完成后再刷新历史记录
    await nextTick()
    if (historyRef.value) {
      await historyRef.value.refresh()
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  }
}

const fetchLatestReport = async () => {
  if (!currentUserId.value) {
    ElMessage.error('用户未登录')
    return
  }
  
  loading.value = true
  try {
    const response = await getLatestReport(currentUserId.value)
    if (response?.data) {
      latestReport.value = response.data
    } else {
      latestReport.value = {}
      ElMessage.warning('暂无报告数据')
    }
  } catch (error) {
    console.error('获取最新报告失败:', error)
    ElMessage.error('获取报告失败')
    latestReport.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLatestReport()
})
</script>

<style lang="scss" scoped>
.health-report-container {
  padding: 20px;
  height: calc(100vh - 120px); // 减去头部导航的高度
  overflow-y: auto; // 添加垂直滚动条
  
  // 美化滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 4px;
    
    &:hover {
      background: #909399;
    }
  }
}

.demo-tabs {
  height: 100%;
  
  :deep(.el-tabs__content) {
    height: calc(100% - 40px);
    overflow-y: auto;
  }
}
</style>