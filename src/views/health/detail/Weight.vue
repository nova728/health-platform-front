<template>
  <div class="weight-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>体重详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前体重卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <ScaleIcon class="card-icon" />
          <span>当前体重</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestWeight }}</span>
          <span class="unit">kg</span>
        </div>
        <div class="stat-status" :class="weightTrend.class">
          {{ weightTrend.text }}
        </div>
      </div>

      <!-- 体重图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">体重变化趋势</div>
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
          <div class="stat-label">平均体重</div>
          <div class="stat-number">{{ averageWeight }}</div>
          <div class="stat-unit">kg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高体重</div>
          <div class="stat-number">{{ maxWeight }}</div>
          <div class="stat-unit">kg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最低体重</div>
          <div class="stat-number">{{ minWeight }}</div>
          <div class="stat-unit">kg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">近期变化</div>
          <div class="stat-number" :class="{ 'text-red': recentChange > 0, 'text-green': recentChange < 0 }">
            {{ recentChange > 0 ? '+' : ''}}{{ recentChange }}
          </div>
          <div class="stat-unit">kg</div>
        </div>
      </div>

      <!-- 体重数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ weightHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="weightHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>体重 (kg)</th>
                  <th>变化</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in weightHistory" :key="index">
                  <td>{{ record.time }}</td>
                  <td>{{ record.weight }}</td>
                  <td>
                      <span :class="getChangeClass(record.change)">
                        {{ record.change > 0 ? '+' : ''}}{{ record.change }}
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

    <!-- 记录体重模态框 -->
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录体重</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="weight">体重 (kg)</label>
            <div class="input-wrapper">
              <input
                  id="weight"
                  type="number"
                  step="0.1"
                  v-model="newWeight"
                  placeholder="请输入体重"
                  :class="{ 'error': weightError }"
              />
              <span class="unit">kg</span>
            </div>
            <span class="error-message" v-if="weightError">{{ weightErrorMessage }}</span>
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
              @click="recordWeight"
              :disabled="isRecording || !isValidInput"
          >
            <span v-if="!isRecording">记录体重</span>
            <span v-else>记录中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/health_data_style.css';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  Scale as ScaleIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestWeight = ref(0)
const weightHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)

// 新记录状态
const newWeight = ref('')
const isRecording = ref(false)
const weightError = ref(false)
const weightErrorMessage = ref('')
const showRecordModal = ref(false)

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

// 计算属性
const weightTrend = computed(() => {
  const change = recentChange.value
  if (!change) return { text: '暂无变化', class: 'normal' }
  if (change > 0) return { text: `增重 ${change}kg`, class: 'high' }
  return { text: `减重 ${Math.abs(change)}kg`, class: 'low' }
})

const averageWeight = computed(() => {
  const weights = weightHistory.value.map(item => item.weight)
  if (weights.length === 0) return 0
  const sum = weights.reduce((a, b) => a + b, 0)
  return Math.round((sum / weights.length) * 10) / 10
})

const maxWeight = computed(() => {
  const weights = weightHistory.value.map(item => item.weight)
  if (weights.length === 0) return 0
  return Math.max(...weights)
})

const minWeight = computed(() => {
  const weights = weightHistory.value.map(item => item.weight)
  if (weights.length === 0) return 0
  return Math.min(...weights)
})

const recentChange = computed(() => {
  if (weightHistory.value.length < 2) return 0
  const latest = weightHistory.value[0].weight
  const previous = weightHistory.value[1].weight
  return Math.round((latest - previous) * 10) / 10
})

const isValidInput = computed(() => {
  return newWeight.value && !weightError.value
})

const getChangeClass = (change) => {
  if (change > 0) return 'trend-up'
  if (change < 0) return 'trend-down'
  return 'trend-stable'
}

const checkWeightWarnings = (newWeight, recentData) => {
  if (recentData.length < 2) return;

  // 计算最近记录的体重变化
  const weightChanges = []
  for (let i = 0; i < Math.min(7, recentData.length - 1); i++) {
    weightChanges.push(recentData[i].weight - recentData[i + 1].weight)
  }

  // 添加最新记录与上一次记录的变化
  const latestChange = newWeight - recentData[0].weight;
  weightChanges.unshift(latestChange);

  // 检查快速增重或减重
  const totalChange = weightChanges.reduce((a, b) => a + b, 0)
  if (Math.abs(totalChange) > 2) {
    ElMessage.warning(`检测到体重${totalChange > 0 ? '快速增加' : '快速下降'}，请注意健康饮食`)
  }

  // 检查体重波动
  const fluctuations = weightChanges.filter(change => Math.abs(change) > 1)
  if (fluctuations.length >= 2) {
    ElMessage.warning('体重波动较大，建议保持规律作息和饮食')
  }
}

const validateWeight = () => {
  weightError.value = false
  weightErrorMessage.value = ''

  const weight = Number(newWeight.value)

  if (isNaN(weight) || weight < 20 || weight > 300) {
    weightError.value = true
    weightErrorMessage.value = '体重必须在20-300kg之间'
    return false
  }

  return true
}

const fetchWeightData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/weight`, {
      params: { period }
    })

    if (response.data) {
      // 处理数据并计算变化量
      const rawData = response.data.map(item => ({
        time: new Date(item.measurementTime).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        weight: item.weight,
        timestamp: new Date(item.measurementTime).getTime()
      })).sort((a, b) => b.timestamp - a.timestamp) // 按时间降序排序

      // 计算每条记录相对于前一条的变化量
      weightHistory.value = rawData.map((item, index) => ({
        ...item,
        change: index === rawData.length - 1 ? 0 :
            Math.round((item.weight - rawData[index + 1].weight) * 10) / 10
      }))

      if (weightHistory.value.length > 0) {
        latestWeight.value = weightHistory.value[0].weight
      }

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch weight data:', error)
    ElMessage.error('获取体重数据失败')
  } finally {
    loading.value = false
  }
}

const recordWeight = async () => {
  if (!validateWeight()) return

  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    isRecording.value = true

    // 记录体重
    const weightResponse = await axios.post(
        `http://localhost:8088/api/health/${userId}/weight`,
        {
          weight: Number(newWeight.value),
          measurementTime: new Date().toISOString()
        }
    )

    if (weightResponse.data) {
      // 在记录新体重后检查体重警告
      checkWeightWarnings(Number(newWeight.value), weightHistory.value)

      try {
        // 获取最新的身高数据
        const heightResponse = await axios.get(
            `http://localhost:8088/api/health/${userId}/height`
        )

        if (heightResponse.data && heightResponse.data.length > 0) {
          const latestHeight = heightResponse.data[0].height
          // 计算并记录 BMI
          const heightInMeters = latestHeight / 100
          const bmi = Number(newWeight.value) / (heightInMeters * heightInMeters)

          try {
            await axios.post(
                `http://localhost:8088/api/health/${userId}/bmi/calculate`,
                {
                  bmi: Math.round(bmi * 10) / 10,
                  weight: Number(newWeight.value),
                  height: latestHeight,
                  measurementTime: new Date().toISOString()
                }
            )
          } catch (bmiError) {
            console.warn('BMI 记录失败，但不影响体重记录:', bmiError)
          }
        }
      } catch (heightError) {
        console.warn('获取身高数据失败，但不影响体重记录:', heightError)
      }

      // 无论BMI计算和记录是否成功，都更新体重数据并显示成功提示
      newWeight.value = ''
      await fetchWeightData(selectedPeriod.value)
      ElMessage.success('体重记录成功')
      showRecordModal.value = false
    }
  } catch (error) {
    console.error('Failed to record weight:', error)
    ElMessage.error('记录体重失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}


const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchWeightData(period)
}

const updateChart = () => {
  if (!myChart || !chartRef.value) return

  const sortedData = [...weightHistory.value].sort((a, b) => a.timestamp - b.timestamp)

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
        const weightData = params[0]
        return `${weightData.name}<br/>
                体重: ${weightData.value} kg`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedData.map(item => item.time),
      axisLabel: {
        formatter: function(value) {
          if (selectedPeriod.value === 'day') {
            return value.split(' ')[1]
          }
          return value
        },
        rotate: selectedPeriod.value !== 'day' ? 45 : 0
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '体重 (kg)',
      axisLine: {
        lineStyle: {
          color: '#3b99f6'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    series: [
      {
        data: sortedData.map(item => item.weight),
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          color: '#f56c6c',
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
              color: 'rgba(245,108,108,0.2)'
            }, {
              offset: 1,
              color: 'rgba(245,108,108,0)'
            }]
          }
        }
      }
    ]
  }

  myChart.setOption(option)
}

// 监听时间周期变化
watch(selectedPeriod, (newPeriod) => {
  fetchWeightData(newPeriod)
})

// 生命周期钩子
onMounted(async () => {
  await fetchWeightData()

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
.weight-detail{
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
