<template>
  <div class="steps-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>步数详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前步数卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <FootprintsIcon class="card-icon" />
          <span>当前步数</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestSteps }}</span>
          <span class="unit">步</span>
        </div>
        <div class="progress-status">
          <el-progress
              :percentage="progressPercentage"
              :format="() => `${progressPercentage}%`"
              :stroke-width="10"
          />
          <div class="goal-text">目标 {{ dailyGoal }} 步</div>
        </div>
      </div>

      <!-- 步数图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">步数趋势</div>
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
          <div class="stat-label">日均步数</div>
          <div class="stat-number">{{ averageSteps }}</div>
          <div class="stat-unit">步/天</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">本周总步数</div>
          <div class="stat-number">{{ weeklyTotalSteps }}</div>
          <div class="stat-unit">步</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">完成率</div>
          <div class="stat-number">{{ completionRate }}</div>
          <div class="stat-unit">%</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">消耗热量</div>
          <div class="stat-number">{{ caloriesBurned }}</div>
          <div class="stat-unit">千卡</div>
        </div>
      </div>

      <!-- 步数数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ stepsHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="stepsHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>步数</th>
                  <th>完成率</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in stepsHistory" :key="index">
                  <td>{{ record.time }}</td>
                  <td>{{ record.value }}</td>
                  <td>
                      <span :class="getCompletionClass(record.value)">
                        {{ getCompletionStatus(record.value) }}
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 记录步数模态框 -->
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录步数</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="steps">步数</label>
            <div class="input-wrapper">
              <input
                  id="steps"
                  type="number"
                  v-model="newSteps"
                  placeholder="请输入步数"
                  :class="{ 'error': inputError }"
              />
              <span class="unit">步</span>
            </div>
            <span class="error-message" v-if="inputError">{{ errorMessage }}</span>
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
              @click="recordSteps"
              :disabled="isRecording || !newSteps"
          >
            <span v-if="!isRecording">记录步数</span>
            <span v-else>记录中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/health_data_style.css';
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon,
  Footprints as FootprintsIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestSteps = ref(0)
const stepsHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)
const dailyGoal = ref(12000) // 每日目标步数
const showRecordModal = ref(false)
const newSteps = ref('')
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
const progressPercentage = computed(() => {
  return Math.min(Math.round((latestSteps.value / dailyGoal.value) * 100), 100)
})

const averageSteps = computed(() => {
  if (stepsHistory.value.length === 0) return 0
  const sum = stepsHistory.value.reduce((acc, curr) => acc + curr.value, 0)
  return Math.round(sum / stepsHistory.value.length)
})

const weeklyTotalSteps = computed(() => {
  return stepsHistory.value
      .filter(record => {
        const recordDate = new Date(record.timestamp)
        const today = new Date()
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return recordDate >= weekAgo
      })
      .reduce((acc, curr) => acc + curr.value, 0)
})

const completionRate = computed(() => {
  if (stepsHistory.value.length === 0) return 0
  const completedDays = stepsHistory.value.filter(record => record.value >= dailyGoal.value).length
  return Math.round((completedDays / stepsHistory.value.length) * 100)
})

const caloriesBurned = computed(() => {
  // 假设每1000步消耗40卡路里
  return Math.round(latestSteps.value * 0.04)
})

// 方法
const getCompletionStatus = (steps) => {
  const percentage = (steps / dailyGoal.value) * 100
  if (percentage >= 100) return '已达标'
  if (percentage >= 70) return '接近目标'
  return '继续加油'
}

const getCompletionClass = (steps) => {
  const percentage = (steps / dailyGoal.value) * 100
  if (percentage >= 100) return 'status-high'
  if (percentage >= 70) return 'status-normal'
  return 'status-low'
}

// 验证步数
const validateSteps = (value) => {
  const steps = Number(value)
  if (isNaN(steps)) {
    errorMessage.value = '请输入有效的数字'
    return false
  }
  if (steps < 0 || steps > 100000) {
    errorMessage.value = '步数必须在0-100000之间'
    return false
  }
  return true
}

const checkStepsWarnings = (newSteps, recentData) => {
  if (recentData.length < 2) return;

  // 检查单次记录是否异常
  if (newSteps > 50000) {
    ElMessage.warning('当前步数记录偏高，请确认数据准确性');
    return;
  }

  // 计算与上次记录的差异
  const lastRecord = recentData[0];
  const timeDiff = (new Date() - new Date(lastRecord.timestamp)) / (1000 * 60 * 60); // 小时差

  if (timeDiff < 24) { // 如果是同一天内的记录
    const stepsDiff = Math.abs(newSteps - lastRecord.value);
    if (stepsDiff > 20000) {
      ElMessage.warning('检测到步数变化较大，请确认数据准确性');
    }
  }
};

// 记录步数
const recordSteps = async () => {
  inputError.value = false
  errorMessage.value = ''

  if (!validateSteps(newSteps.value)) {
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
        `http://localhost:8088/api/health/${userId}/steps`,
        {
          steps: Number(newSteps.value),
          measurementTime: new Date().toISOString()
        }
    )

    if (response.data) {
      newSteps.value = ''
      await fetchStepsData(selectedPeriod.value)
      ElMessage.success('步数记录成功')
      checkStepsWarnings(Number(newSteps.value), stepsHistory.value);
      showRecordModal.value = false
    }
  } catch (error) {
    console.error('Failed to record steps:', error)
    ElMessage.error('记录步数失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchStepsData(period)
}

// 更新图表
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
        return `${params[0].name}<br/>步数: ${params[0].value} 步`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stepsHistory.value.map(item => item.time),
      axisLabel: {
        formatter: function(value) {
          if (selectedPeriod.value === 'day') {
            return value.split(' ')[1]
          }
          return value
        },
        rotate: selectedPeriod.value !== 'day' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '步数',
      axisLine: {
        show: true
      },
      splitLine: {
        show: true
      }
    },
    series: [{
      data: stepsHistory.value.map(item => item.value),
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: '#3b82f6'
      }
    }]
  }

  myChart.setOption(option)
}

// 获取步数数据
const fetchStepsData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/steps`, {
      params: { period }
    })

    if (response.data) {
      stepsHistory.value = response.data
          .map(item => ({
            time: new Date(item.measurementTime).toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            value: item.steps,
            timestamp: new Date(item.measurementTime).getTime()
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

      if (stepsHistory.value.length > 0) {
        latestSteps.value = stepsHistory.value[0].value
      }

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch steps data:', error)
    ElMessage.error('获取步数数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(async () => {
  await fetchStepsData()

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
.steps-detail {
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;
  box-sizing: border-box;
}

.progress-status {
  margin-top: 20px;
  width: 100%;
  max-width: 300px;
}

.goal-text {
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin-top: 8px;
}

/* 修改图表样式以适应柱状图 */
.chart-container {
  height: 300px;
  margin-top: 20px;
}


</style>