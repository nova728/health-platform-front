<template>
  <div class="sleep-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>睡眠详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前睡眠卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <MoonIcon class="card-icon" />
          <span>最近睡眠</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ formatSleepDuration }}</span>
        </div>
        <div class="stat-status" :class="sleepQualityStatus.class">
          {{ sleepQualityStatus.text }}
        </div>
      </div>

      <!-- 睡眠图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">睡眠趋势</div>
          <div class="time-selector">
            <button
                v-for="period in timePeriods"
                :key="period.value"
                :class="{ active: selectedPeriod === period.value }"
                @click="changePeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-container" ref="chartRef"></div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-label">平均睡眠时长</div>
          <div class="stat-number">{{ averageSleepDuration }}</div>
          <div class="stat-unit">小时</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">深度睡眠</div>
          <div class="stat-number">{{ deepSleepPercentage }}</div>
          <div class="stat-unit">%</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">浅度睡眠</div>
          <div class="stat-number">{{ lightSleepPercentage }}</div>
          <div class="stat-unit">%</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">REM睡眠</div>
          <div class="stat-number">{{ remSleepPercentage }}</div>
          <div class="stat-unit">%</div>
        </div>
      </div>

      <!-- 睡眠数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ sleepHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="sleepHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>日期</th>
                  <th>时长</th>
                  <th>质量</th>
                  <th>深睡比例</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in sleepHistory" :key="index">
                  <td>{{ record.date }}</td>
                  <td>{{ formatDuration(record.duration) }}</td>
                  <td>
                    <span :class="getSleepQualityClass(record.quality)">
                      {{ record.quality }}
                    </span>
                  </td>
                  <td>{{ record.deepSleepPercentage }}%</td>
                </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 记录睡眠模态框 -->
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录睡眠</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="sleepDuration">睡眠时长 (小时)</label>
            <div class="input-wrapper">
              <input
                  id="sleepDuration"
                  type="number"
                  v-model="newSleepDuration"
                  placeholder="请输入睡眠时长"
                  step="0.5"
                  :class="{ 'error': inputError }"
              />
              <span class="unit">小时</span>
            </div>
            <span class="error-message" v-if="inputError">{{ errorMessage }}</span>
          </div>

          <div class="input-group">
            <label>睡眠质量</label>
            <select v-model="newSleepQuality">
              <option value="优">优</option>
              <option value="良">良</option>
              <option value="一般">一般</option>
              <option value="差">差</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button
              class="cancel-button"
              @click="showRecordModal = false"
              :disabled="isRecording"
          >
            取消
          </button>
          <button
              class="record-button"
              @click="recordSleep"
              :disabled="isRecording || !newSleepDuration"
          >
            <span v-if="!isRecording">记录睡眠</span>
            <span v-else>记录中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from "element-plus"
import '@/assets/styles/health_data_style.css'
import {
  Moon as MoonIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const sleepHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)

const newSleepDuration = ref('')
const newSleepQuality = ref('良')
const isRecording = ref(false)
const inputError = ref(false)
const errorMessage = ref('')

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

// 计算属性
const formatSleepDuration = computed(() => {
  if (sleepHistory.value.length === 0) return '0小时0分'
  const duration = sleepHistory.value[0].duration
  return formatDuration(duration)
})

const sleepQualityStatus = computed(() => {
  if (sleepHistory.value.length === 0) return { text: '无数据', class: 'normal' }
  const quality = sleepHistory.value[0].quality
  switch (quality) {
    case '优': return { text: '睡眠质量优', class: 'excellent' }
    case '良': return { text: '睡眠质量良好', class: 'good' }
    case '一般': return { text: '睡眠质量一般', class: 'normal' }
    case '差': return { text: '睡眠质量差', class: 'poor' }
    default: return { text: '无数据', class: 'normal' }
  }
})

const averageSleepDuration = computed(() => {
  if (sleepHistory.value.length === 0) return 0
  const sum = sleepHistory.value.reduce((acc, curr) => acc + curr.duration, 0)
  return (sum / sleepHistory.value.length).toFixed(1)
})

const deepSleepPercentage = computed(() => {
  return sleepHistory.value.length ? sleepHistory.value[0].deepSleepPercentage : 0
})

const lightSleepPercentage = computed(() => {
  return sleepHistory.value.length ? sleepHistory.value[0].lightSleepPercentage : 0
})

const remSleepPercentage = computed(() => {
  return sleepHistory.value.length ? sleepHistory.value[0].remSleepPercentage : 0
})

// 辅助函数
const formatDuration = (hours) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}小时${minutes}分`
}

const getSleepQualityClass = (quality) => {
  switch (quality) {
    case '优': return 'status-excellent'
    case '良': return 'status-good'
    case '一般': return 'status-normal'
    case '差': return 'status-poor'
    default: return 'status-normal'
  }
}

// 验证睡眠时长
const validateSleepDuration = (value) => {
  const duration = Number(value)
  if (isNaN(duration)) {
    errorMessage.value = '请输入有效的数字'
    return false
  }
  if (duration < 0 || duration > 24) {
    errorMessage.value = '睡眠时长必须在0-24小时之间'
    return false
  }
  return true
}

const checkSleepWarnings = (newDuration, recentData) => {
  if (recentData.length < 1) return;

  // 检查睡眠时长是否异常
  if (newDuration < 4) {
    ElMessage.warning('睡眠时间过短，请保证充足的休息时间');
    return;
  }

  if (newDuration > 12) {
    ElMessage.warning('睡眠时间过长，建议保持规律的作息时间');
    return;
  }

  // 检查与上次记录的差异
  const lastRecord = recentData[0];
  const durationDiff = Math.abs(newDuration - lastRecord.duration);

  if (durationDiff > 4) {
    ElMessage.warning('睡眠时长变化较大，建议保持规律的作息时间');
  }
};

const showRecordModal = ref(false)

const fetchSleepData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/sleep`, {
      params: { period }
    })

    if (response.data) {
      sleepHistory.value = response.data.map(item => ({
        date: new Date(item.date).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        duration: item.duration,
        quality: item.quality,
        deepSleepPercentage: item.deepSleepPercentage,
        lightSleepPercentage: item.lightSleepPercentage,
        remSleepPercentage: item.remSleepPercentage,
        timestamp: new Date(item.date).getTime()
      })).sort((a, b) => b.timestamp - a.timestamp)

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch sleep data:', error)
    ElMessage.error('获取睡眠数据失败')
  } finally {
    loading.value = false
  }
}

const recordSleep = async () => {
  inputError.value = false
  errorMessage.value = ''

  if (!validateSleepDuration(newSleepDuration.value)) {
    inputError.value = true
    return
  }

  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    isRecording.value = true
    const response = await axios.post(
        `http://localhost:8088/api/health/${userId}/sleep`,
        {
          duration: Number(newSleepDuration.value),
          quality: newSleepQuality.value,
          date: new Date().toISOString()
        }
    )

    if (response.data) {
      newSleepDuration.value = ''
      newSleepQuality.value = '良'
      await fetchSleepData(selectedPeriod.value)
      ElMessage.success('睡眠记录成功')
      checkSleepWarnings(Number(newSleepDuration.value), sleepHistory.value);
      showRecordModal.value = false
    }
  } catch (error) {
    console.error('Failed to record sleep:', error)
    ElMessage.error('记录睡眠失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchSleepData(period)
}

const updateChart = () => {
  if (!myChart || !chartRef.value) return

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>睡眠时长: ${formatDuration(params[0].value)}`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sleepHistory.value.map(item => item.date),
      axisLabel: {
        formatter: function(value) {
          return value.split(' ')[0]
        },
        rotate: selectedPeriod.value !== 'day' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '睡眠时长 (小时)',
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [{
      data: sleepHistory.value.map(item => item.duration),
      type: 'line',
      smooth: true,
      symbolSize: 6,
      lineStyle: {
        color: '#722ed1',
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
            color: 'rgba(114,46,209,0.2)'
          }, {
            offset: 1,
            color: 'rgba(114,46,209,0)'
          }]
        }
      }
    }]
  }

  myChart.setOption(option)
}

onMounted(async () => {
  await fetchSleepData()

  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)
    updateChart()

    window.addEventListener('resize', () => {
      myChart?.resize()
    })
  }
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style scoped>
.sleep-detail {
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;       /* 允许垂直滚动 */
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-button, .add-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f4f4f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover, .add-button:hover {
  background: #e4e4e7;
}

.icon {
  width: 20px;
  height: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.current-stats {
  text-align: center;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #303133;
}

.stat-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  margin-top: 12px;
  font-size: 14px;
}

.excellent {
  background: #f0f9eb;
  color: #67c23a;
}

.good {
  background: #f4f4f5;
  color: #909399;
}

.poor {
  background: #fef0f0;
  color: #f56c6c;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.time-selector {
  display: flex;
  gap: 8px;
}

.time-selector button {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.time-selector button.active {
  background: #722ed1;
  color: white;
  border-color: #722ed1;
}

.chart-container {
  height: calc(100% - 60px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0;
}

.stat-unit {
  color: #909399;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

th {
  font-weight: 600;
  color: #909399;
}

.status-excellent {
  color: #67c23a;
}

.status-good {
  color: #409eff;
}

.status-poor {
  color: #f56c6c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 8px;
}

input.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button, .record-button {
  padding: 8px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.cancel-button {
  background: #f4f4f5;
}

.record-button {
  background: #722ed1;
  color: white;
}

.record-button:disabled {
  background: #b4b4b4;
  cursor: not-allowed;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.add-button .icon {
  width: 30px !important;
  height: 30px !important;
  stroke-width: 2 !important;
}


@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>