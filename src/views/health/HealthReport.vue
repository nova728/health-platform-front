<template>
  <div class="health-report">
    <div class="report-header">
      <h2>健康报告</h2>
      <el-button type="primary" @click="generateReport" :loading="loading">
        <el-icon><DocumentAdd /></el-icon>
        生成新报告
      </el-button>
    </div>

    <!-- 健康评分卡片 -->
    <el-card class="health-score-card">
      <div class="score-content">
        <div class="score-circle">
          <el-progress
              type="dashboard"
              :percentage="healthScore"
              :color="scoreColors"
              :width="120"
          >
            <template #default="{ percentage }">
              <div class="score-value">
                <span class="number">{{ percentage }}</span>
                <span class="label">健康评分</span>
              </div>
            </template>
          </el-progress>
        </div>
        <div class="score-details">
          <div class="detail-item" v-for="(score, index) in subScores" :key="index">
            <span class="label">{{ score.label }}</span>
            <el-progress
                :percentage="score.value"
                :color="score.color"
                :stroke-width="8"
                :format="(val) => `${val}分`"
            />
          </div>
        </div>
      </div>
    </el-card>

    <div class="statistics-section">
      <el-card class="statistics-card">
        <template #header>
          <div class="card-header">
            <span>健康数据统计</span>
            <el-select
                v-model="timeRange"
                size="small"
                placeholder="选择时间范围"
                @change="loadStatistics"
                class="time-range-select">
              <el-option label="最近一周" value="week" />
              <el-option label="最近一月" value="month" />
              <el-option label="最近三月" value="quarter" />
            </el-select>
          </div>
        </template>

        <div class="statistics-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalExerciseTime || 0 }}h</div>
              <div class="stat-label">运动总时长</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.avgCalories || 0 }}kcal</div>
              <div class="stat-label">平均消耗</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><LocationInformation /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.exerciseCount || 0 }}次</div>
              <div class="stat-label">运动次数</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><MoonNight /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.avgSleepDuration || 0 }}h</div>
              <div class="stat-label">平均睡眠</div>
            </div>
          </div>
        </div>

        <div class="achievement-section">
          <h4>达标情况</h4>
          <div class="achievement-list">
            <el-progress
                v-for="(item, index) in achievements"
                :key="index"
                :percentage="item.percentage"
                :color="item.color"
                :format="() => item.label"
                :stroke-width="10"
                class="achievement-item"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 健康建议 -->
    <el-card class="suggestions-card">
      <template #header>
        <div class="card-header">
          <span>健康建议</span>
          <el-tag type="success">已更新</el-tag>
        </div>
      </template>
      <div class="suggestions-content">
        <div v-for="(suggestion, index) in healthSuggestions" :key="index" class="suggestion-item">
          <el-alert
              :title="suggestion.title"
              :type="suggestion.type"
              :description="suggestion.content"
              :closable="false"
              show-icon
          />
        </div>
      </div>
    </el-card>

    <!-- 生成报告对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="生成健康报告"
        width="500px"
    >
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="报告类型">
          <el-select v-model="reportForm.type" placeholder="请选择报告类型">
            <el-option label="周度报告" value="weekly" />
            <el-option label="月度报告" value="monthly" />
            <el-option label="年度报告" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="reportForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="包含指标">
          <el-checkbox-group v-model="reportForm.metrics">
            <el-checkbox label="weight">体重变化</el-checkbox>
            <el-checkbox label="sleep">睡眠质量</el-checkbox>
            <el-checkbox label="exercise">运动记录</el-checkbox>
            <el-checkbox label="diet">饮食分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGenerateReport" :loading="loading">
            生成报告
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { DocumentAdd,Timer, Aim, LocationInformation, MoonNight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getHealthScore, generateHealthReport, getTrendData } from '@/api/health-report.js'
import { useStore } from 'vuex'

const store = useStore()
const userId = computed(() => store.state.user?.id)
const loading = ref(false)

const timeRange = ref('week')

const statistics = ref({
  totalExerciseTime: 0,
  avgCalories: 0,
  exerciseCount: 0,
  avgSleepDuration: 0
})

// 健康评分
const healthScore = ref(0)
const scoreColors = [
  { color: '#f56c6c', percentage: 60 },
  { color: '#e6a23c', percentage: 75 },
  { color: '#67c23a', percentage: 90 }
]

// 达标情况数据
const achievements = ref([
  {
    label: '运动达标',
    percentage: 80,
    color: '#67c23a'
  },
  {
    label: '睡眠达标',
    percentage: 70,
    color: '#409eff'
  },
  {
    label: '营养达标',
    percentage: 60,
    color: '#e6a23c'
  }
])

// 子项评分
const subScores = ref([])

// 趋势图表
const trendChartRef = ref(null)
const selectedMetric = ref('weight')
let trendChart = null

// 健康建议
const healthSuggestions = ref([])

// 对话框控制
const dialogVisible = ref(false)
const reportForm = ref({
  type: 'weekly',
  dateRange: [],
  metrics: ['weight', 'sleep', 'exercise']
})

// 加载健康评分
const loadHealthScore = async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    loading.value = true
    const res = await getHealthScore(userId.value)
    if (res.code === 200 && res.data) {  // 检查返回结果
      healthScore.value = res.data.totalScore

      // 设置子评分
      const scores = res.data.subScores
      subScores.value = [
        { label: '运动指数', value: scores.exerciseScore, color: '#67c23a' },
        { label: '睡眠质量', value: scores.sleepScore, color: '#409eff' },
        { label: '身体状况', value: scores.physicalScore, color: '#e6a23c' }
      ]
    } else {
      throw new Error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('Failed to load health score:', error)
    ElMessage.error(error.message || '获取健康评分失败')
  } finally {
    loading.value = false
  }
}

// 加载趋势数据
const loadTrendData = async () => {  // 修改函数名
  if (!userId.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    loading.value = true
    const res = await getTrendData(userId.value, selectedMetric.value)
    if (res.code === 200 && res.data) {  // 检查返回结果
      updateTrendChart(res.data)
    } else {
      throw new Error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('Failed to load trend data:', error)
    ElMessage.error(error.message || '获取趋势数据失败')
  } finally {
    loading.value = false
  }
}

// 更新趋势图表
const updateTrendChart = (data) => {
  if (!trendChart) return

  const dates = data.map(item => {
    if (selectedMetric.value === 'weight') {
      return new Date(item.measurementTime).toLocaleDateString()
    } else if (selectedMetric.value === 'sleep') {
      return new Date(item.date).toLocaleDateString()
    } else {
      return new Date(item.recordDate).toLocaleDateString()
    }
  })

  const values = data.map(item => {
    switch (selectedMetric.value) {
      case 'weight': return item.weight
      case 'sleep': return item.duration
      case 'steps': return item.steps
      case 'heartRate': return item.heartRate
      default: return 0
    }
  })

  const option = {
    grid: {
      top: 40,
      right: 20,
      bottom: 40,
      left: 50,
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: getMetricUnit()
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#409EFF',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64,158,255,0.2)'
          }, {
            offset: 1,
            color: 'rgba(64,158,255,0)'
          }]
        }
      }
    }]
  }
  trendChart.setOption(option)
}

// 获取度量单位
const getMetricUnit = () => {
  switch (selectedMetric.value) {
    case 'weight': return '体重(kg)'
    case 'sleep': return '睡眠时长(h)'
    case 'steps': return '步数'
    case 'heartRate': return '心率(bpm)'
    default: return ''
  }
}

// 生成报告
const generateReport = () => {
  dialogVisible.value = true
}

const handleGenerateReport = async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    loading.value = true
    const res = await generateHealthReport(userId.value, reportForm.value)
    if (res.code === 200 && res.data) {  // 检查返回结果
      healthSuggestions.value = res.data.suggestions
      dialogVisible.value = false
      ElMessage.success('报告生成成功！')
    } else {
      throw new Error(res.message || '生成报告失败')
    }
  } catch (error) {
    console.error('Failed to generate report:', error)
    ElMessage.error(error.message || '生成报告失败')
  } finally {
    loading.value = false
  }
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  loadTrendData()
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
}

const loadStatistics = async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    loading.value = true
    // 这里调用后端API获取统计数据
    // const res = await getHealthStatistics(userId.value, timeRange.value)
    // if (res.code === 200 && res.data) {
    //   statistics.value = res.data
    // }

    // 模拟数据，实际使用时替换为真实API调用
    statistics.value = {
      totalExerciseTime: Math.floor(Math.random() * 20 + 10),
      avgCalories: Math.floor(Math.random() * 300 + 200),
      exerciseCount: Math.floor(Math.random() * 10 + 5),
      avgSleepDuration: (Math.random() * 2 + 6).toFixed(1)
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadHealthScore()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style scoped>
.health-report {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.health-score-card {
  margin-bottom: 20px;
}

.score-content {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px;
}

.score-circle {
  flex-shrink: 0;
}

.score-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value .number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.score-value .label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item .label {
  width: 80px;
  color: #606266;
}

.time-range-select {
  width: 110px; /* 设置固定宽度 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestions-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header :deep(.el-input__wrapper) {
  width: 110px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .score-content {
    flex-direction: column;
    align-items: center;
  }

  .score-details {
    width: 100%;
  }
}

.statistics-section {
  margin-bottom: 20px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 12px;
  background-color: #e6f2ff;
  color: #409EFF;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.achievement-section {
  margin-top: 24px;
}

.achievement-section h4 {
  margin-bottom: 16px;
  color: #606266;
  font-weight: 500;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}
</style>