<template>
  <div class="bmi-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>BMI详情</h2>
      <button class="add-button" @click="showRecordModal = true">
      </button>
    </div>

    <div class="content">
      <!-- 当前BMI卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <ActivitySquareIcon class="card-icon" />
          <span>当前BMI</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestBMI }}</span>
        </div>
        <div class="stat-status" :class="bmiStatus.class">
          {{ bmiStatus.text }}
        </div>
      </div>

      <!-- BMI图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">BMI变化趋势</div>
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
          <div class="stat-label">平均BMI</div>
          <div class="stat-number">{{ averageBMI }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高BMI</div>
          <div class="stat-number">{{ maxBMI }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最低BMI</div>
          <div class="stat-number">{{ minBMI }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">近期变化</div>
          <div class="stat-number" :class="{ 'text-red': recentChange > 0, 'text-green': recentChange < 0 }">
            {{ recentChange > 0 ? '+' : ''}}{{ recentChange }}
          </div>
        </div>
      </div>

      <!-- BMI数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ bmiHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="bmiHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>BMI</th>
                  <th>体重 (kg)</th>
                  <th>身高 (cm)</th>
                  <th>变化</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in bmiHistory" :key="index">
                  <td>{{ record.time }}</td>
                  <td>{{ record.bmi }}</td>
                  <td>{{ record.weight }}</td>
                  <td>{{ record.height }}</td>
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
  </div>
</template>

<script setup>
import '@/assets/styles/health_data_style.css'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import {
  ActivitySquare as ActivitySquareIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestBMI = ref(0)
const bmiHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)
const showRecordModal = ref(false)

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

// 计算属性
const bmiStatus = computed(() => {
  const bmi = latestBMI.value
  if (!bmi) return { text: '-', class: 'normal' }
  if (bmi < 18.5) return { text: '偏瘦', class: 'low' }
  if (bmi < 24) return { text: '正常', class: 'normal' }
  if (bmi < 28) return { text: '超重', class: 'high' }
  return { text: '肥胖', class: 'danger' }
})

const averageBMI = computed(() => {
  if (bmiHistory.value.length === 0) return 0
  const sum = bmiHistory.value.reduce((acc, curr) => acc + curr.bmi, 0)
  return (sum / bmiHistory.value.length).toFixed(1)
})

const maxBMI = computed(() => {
  if (bmiHistory.value.length === 0) return 0
  return Math.max(...bmiHistory.value.map(item => item.bmi))
})

const minBMI = computed(() => {
  if (bmiHistory.value.length === 0) return 0
  return Math.min(...bmiHistory.value.map(item => item.bmi))
})

const recentChange = computed(() => {
  if (bmiHistory.value.length < 2) return 0
  const latest = bmiHistory.value[0].bmi
  const previous = bmiHistory.value[1].bmi
  return Number((latest - previous).toFixed(1))
})

const getChangeClass = (change) => {
  if (change > 0) return 'trend-up'
  if (change < 0) return 'trend-down'
  return 'trend-stable'
}

const checkBMIWarnings = (newBMI, recentData) => {
  if (recentData.length < 2) return

  // 检查BMI范围变化
  if (newBMI > 28 || newBMI < 18.5) {
    ElMessage.warning('当前BMI不在健康范围内，建议咨询医生')
    return
  }

  // 检查与上次记录的BMI变化
  const lastBMI = recentData[0].bmi
  const bmiChange = Math.abs(newBMI - lastBMI)

  if (bmiChange > 2) {
    ElMessage.warning('BMI变化较大，建议注意饮食和运动')
  }

  // 检查短期内的异常变化趋势
  const recentRecords = recentData.slice(0, 5)
  const abnormalChanges = recentRecords.filter((record, index) => {
    if (index === recentRecords.length - 1) return false
    const change = Math.abs(record.bmi - recentRecords[index + 1].bmi)
    return change > 1
  })

  if (abnormalChanges.length >= 2) {
    ElMessage.warning('检测到BMI频繁波动，建议保持规律的生活作息')
  }
}

const fetchBMIData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/bmi`, {
      params: { period }
    })

    if (response.data) {
      bmiHistory.value = response.data.map(item => ({
        time: new Date(item.measurementTime).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        bmi: parseFloat(item.bmi.toFixed(1)),
        weight: item.weight,
        height: item.height,
        timestamp: new Date(item.measurementTime).getTime()
      })).sort((a, b) => b.timestamp - a.timestamp)

      // 计算每条记录相对于前一条的变化量
      bmiHistory.value = bmiHistory.value.map((item, index) => ({
        ...item,
        change: index === bmiHistory.value.length - 1 ? 0 :
            Number((item.bmi - bmiHistory.value[index + 1].bmi).toFixed(1))
      }))

      if (bmiHistory.value.length > 0) {
        latestBMI.value = bmiHistory.value[0].bmi
      }

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch BMI data:', error)
    ElMessage.error('获取BMI数据失败')
  } finally {
    loading.value = false
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchBMIData(period)
}

const updateChart = () => {
  if (!myChart || !chartRef.value) return

  const sortedData = [...bmiHistory.value].sort((a, b) => a.timestamp - b.timestamp)

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
        const bmiData = params[0]
        return `${bmiData.name}<br/>
                BMI: ${bmiData.value}`
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
      name: 'BMI',
      axisLine: {
        lineStyle: {
          color: '#409EFF'
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
        data: sortedData.map(item => item.bmi),
        type: 'line',
        smooth: true,
        symbolSize: 6,
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
      }
    ]
  }

  myChart.setOption(option)
}

// 监听时间周期变化
watch(selectedPeriod, (newPeriod) => {
  fetchBMIData(newPeriod)
})

// 生命周期钩子
onMounted(async () => {
  await fetchBMIData()

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
.add-button{
  background-color: transparent;
  box-shadow: none !important;
}

.bmi-detail{
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>