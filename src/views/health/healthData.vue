<template>
  <div class="health-data">
    <h2>健康数据</h2>
    <div class="data-grid">
      <!-- 心率模块 -->
      <div class="data-card large" @click="navigateTo('heart-rate')">
        <div class="card-header">
          <HeartPulseIcon class="card-icon" />
          <span>心率</span>
        </div>
        <div class="card-content">
          <div class="current-value">{{latestHealthData.heartRate}}</div>
          <div class="unit">BPM</div>
          <div class="chart">
            <div ref="heartRateChartRef" style="width: 100%; height: 100%"></div>
          </div>
        </div>
      </div>

      <!-- 睡眠模块 -->
      <div class="data-card medium" @click="navigateTo('sleep')">
        <div class="card-header">
          <MoonIcon class="card-icon" />
          <span>睡眠</span>
        </div>
        <div class="card-content">
          <div class="sleep-stats">
            <div class="sleep-duration">{{ formatSleepDuration }}</div>
            <div class="sleep-quality">{{latestHealthData.sleepQuality}}</div>
          </div>
          <div class="sleep-chart">
            <div class="sleep-phases">
              <div class="deep" style="width: 30%"></div>
              <div class="light" style="width: 45%"></div>
              <div class="rem" style="width: 25%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步数模块 -->
      <div class="data-card medium" @click="navigateTo('steps')">
        <div class="card-header">
          <FootprintsIcon class="card-icon" />
          <span>步数</span>
        </div>
        <div class="card-content">
          <div class="steps-count">{{latestHealthData.steps}}</div>
          <div class="steps-progress">
            <el-progress
                :percentage="71"
                :format="() => '目标 12,000'"
                :stroke-width="10"
            />
          </div>
        </div>
      </div>

      <!-- 血压模块 -->
      <div class="data-card medium" @click="navigateTo('blood-pressure')">
        <div class="card-header">
          <ActivityIcon class="card-icon" />
          <span>血压</span>
        </div>
        <div class="card-content">
          <div class="bp-values">
            <span class="systolic">{{latestHealthData.bloodPressureSystolic}}</span>
            <span class="separator">/</span>
            <span class="diastolic">{{latestHealthData.bloodPressureDiastolic}}</span>
            <span class="unit">mmHg</span>
          </div>
          <div class="status normal">正常</div>
        </div>
      </div>

      <!-- 身高模块 -->
      <div class="data-card vertical" @click="navigateTo('height')">
        <div class="card-header">
          <RulerIcon class="card-icon" />
          <span>身高</span>
        </div>
        <div class="card-content height-content">
          <div class="height-display">
            <div class="height-value">{{ latestHealthData.height || '--' }}</div>
            <div class="unit">cm</div>
          </div>
          <div class="height-visual">
            <div class="ruler">
              <div class="marker" :style="{ bottom: heightPercentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 体重模块 -->
      <div class="data-card small" @click="navigateTo('weight')">
        <div class="card-header">
          <ScaleIcon class="card-icon" />
          <span>体重</span>
        </div>
        <div class="card-content">
          <div class="weight-value">{{ latestHealthData.weight }}</div>
          <div class="unit">kg</div>
        </div>
      </div>

      <!-- BMI模块 -->
      <div class="data-card small" @click="navigateTo('bmi')">
        <div class="card-header">
          <ActivitySquareIcon class="card-icon" />
          <span>BMI</span>
        </div>
        <div class="card-content">
          <div class="bmi-value">{{latestHealthData.bmi}}</div>
          <div class="status normal">正常</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick , computed} from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'

import {
  HeartPulse as HeartPulseIcon,
  Moon as MoonIcon,
  Footprints as FootprintsIcon,
  Activity as ActivityIcon,
  Scale as ScaleIcon,
  ActivitySquare as ActivitySquareIcon,
  Ruler as RulerIcon,
} from 'lucide-vue-next'

const store = useStore()
const router = useRouter()
const healthDataHistory = ref([])
const heartRateHistory = ref([])
const loading = ref(false)
const error = ref(null)
let resizeHandler = null
const heartRateChartRef = ref(null)
let heartRateChart = null

// 计算身高百分比
const heightPercentage = computed(() => {
  const height = latestHealthData.value.height
  if (!height) return 0
  // 假设身高范围在140-200cm之间
  return Math.min(100, Math.max(0, ((height - 140) / (200 - 140)) * 100))
})

const fetchHeartRateData = async () => {
  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/heart-rate`, {
      params: {
        period: 'week' // 默认显示周数据
      }
    })

    if (response.data) {
      heartRateHistory.value = response.data
          .map(item => ({
            time: new Date(item.measurementTime).toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            value: item.heartRate,
            timestamp: new Date(item.measurementTime).getTime()
          }))
          .sort((a, b) => a.timestamp - b.timestamp) // 按时间升序排序

      updateHeartRateChart()
    }
  } catch (error) {
    console.error('Failed to fetch heart rate data:', error)
  }
}

// 更新心率图表
const updateHeartRateChart = () => {
  if (!heartRateChart || !heartRateChartRef.value) return

  const option = {
    grid: {
      top: 5,
      right: 5,
      bottom: 10,
      left: 20,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>心率: ${params[0].value} BPM`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: heartRateHistory.value.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        fontSize: 10,
        interval: Math.floor(heartRateHistory.value.length / 4)
      },
      show: false
    },
    yAxis: {
      type: 'value',
      name: 'BPM',
      nameTextStyle: {
        padding: [0, 0, 0, 30]
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      show: false
    },
    series: [{
      data: heartRateHistory.value.map(item => item.value),
      type: 'line',
      smooth: true,
      symbolSize: 4,
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

  heartRateChart.setOption(option)
}

//睡眠时间小数->小时制
const formatSleepDuration = computed(() => {
  const duration = latestHealthData.value.sleepDuration
  if (!duration) return '0小时0分'

  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)

  return `${hours}小时${minutes}分`
})

// 计算最新的健康数据
const latestHealthData = computed(() => {
  if (healthDataHistory.value && healthDataHistory.value.length > 0) {
    return healthDataHistory.value[0] // 最新的数据
  }
  return {
    heartRate: 0,
    sleepDuration: 0,
    sleepQuality: '-',
    steps: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    weight: 0,
    bmi: 0
  }
})

const fetchHealthData = async () => {
  loading.value = true
  error.value = null
  try {
    const userId = store.state.user.id
    console.log('Fetching data for user:', userId)
    const response = await axios.get(`http://localhost:8088/api/health/${userId}/history`)
    console.log('Response:', response)
    if (response.data && Array.isArray(response.data)) {
      healthDataHistory.value = response.data
      console.log('Health data:', healthDataHistory.value)
    } else {
      console.warn('Received empty or invalid data:', response.data)
      healthDataHistory.value = []
    }
  } catch (err) {
    console.error('Error details:', err)
    error.value = '获取健康数据失败: ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

// 图表数据
const chartData = [
  { time: '00:00', value: 72 },
  { time: '04:00', value: 68 },
  { time: '08:00', value: 74 },
  { time: '12:00', value: 77 },
  { time: '16:00', value: 75 },
  { time: '20:00', value: 73 }
]

onMounted(async () => {
  await fetchHealthData()
  await fetchHeartRateData()
  await nextTick()
  if (heartRateChartRef.value) {
    heartRateChart = echarts.init(heartRateChartRef.value)
    updateHeartRateChart()

    resizeHandler = () => {
      heartRateChart?.resize()
    }
    window.addEventListener('resize', resizeHandler)
  }
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (heartRateChart) {
    heartRateChart.dispose()
    heartRateChart = null
  }
})
// 处理错误的方法
const handleRetry = () => {
  fetchHealthData()
}


const navigateTo = (route) => {
  router.push(`/healthCenter/${route}`)
}
</script>
<style scoped>
.health-data {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
}

.health-data h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1f36;
  margin-bottom: 24px;
  padding-left: 4px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 4px;
  min-height: min-content;
}

.health-data::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.health-data::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.data-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.data-card:hover::before {
  transform: translateX(100%);
}

.data-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.data-card.large {
  grid-column: span 2;
  grid-row: span 2;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
}

.data-card.medium {
  grid-column: span 1;
  grid-row: span 2;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
}

.data-card.vertical {
  grid-row: span 2;
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f9faff 100%);
  height: calc(100% + 24px + 40%); /* 计算两个卡片高度加间距 */
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #1a1f36;
}

.card-icon {
  width: 28px;
  height: 28px;
  stroke-width: 1.75;
  color: #409EFF;
  transition: all 0.3s ease;
}

.data-card:hover .card-icon {
  transform: scale(1.1);
  color: #66b1ff;
}

.card-content {
  height: calc(100% - 48px);
  display: flex;
  flex-direction: column;
}

/* 心率模块样式 */
.current-value {
  font-size: 56px;
  font-weight: 700;
  color: #1a1f36;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.unit {
  color: #8792a2;
  margin-top: 4px;
  font-size: 15px;
  font-weight: 500;
}

.chart {
  flex: 1;
  margin-top: 24px;
  position: relative;
  min-height: 200px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.04) 0%, transparent 100%);
}

/* 睡眠模块样式 */
.sleep-stats {
  text-align: center;
  padding: 16px 0;
}

.sleep-duration {
  font-size: 40px;
  font-weight: 700;
  color: #1a1f36;
  line-height: 1.2;
}

.sleep-quality {
  color: #67c23a;
  margin-top: 8px;
  font-weight: 600;
  font-size: 15px;
}

.sleep-phases {
  display: flex;
  height: 8px;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 24px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
}

.deep {
  background: linear-gradient(90deg, #409EFF, #66b1ff);
  transition: width 0.3s ease;
}

.light {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  transition: width 0.3s ease;
}

.rem {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
  transition: width 0.3s ease;
}

/* 步数模块样式 */
.steps-count {
  font-size: 44px;
  font-weight: 700;
  color: #1a1f36;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.2;
}

.steps-progress {
  padding: 0 12px;
}

/* 血压模块样式 */
.bp-values {
  font-size: 40px;
  font-weight: 700;
  color: #1a1f36;
  text-align: center;
  line-height: 1.2;
}

.separator {
  color: #8792a2;
  margin: 0 8px;
  font-weight: 400;
}

.status {
  text-align: center;
  margin-top: 16px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.status.normal {
  background: linear-gradient(135deg, #f0f9eb, #e7f6d9);
  color: #67c23a;
}

/* 身高模块样式 */
.height-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 20px 0;
  min-height: calc(100% - 100px); /* 减去 card-header 的高度 */
}

.height-display {
  text-align: center;
}

.height-value {
  font-size: 44px;
  font-weight: 700;
  color: #1a1f36;
  line-height: 1.2;
}

.height-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding: 20px 0;
  height: 100%;
  min-height: 240px; /* 确保有足够的高度显示标尺 */
}

.ruler {
  width: 8px;
  height: 80%;
  background: #f0f2f5;
  border-radius: 4px;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
}

.marker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #409EFF;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ruler::before {
  content: '';
  position: absolute;
  left: -8px;
  right: -8px;
  height: 2px;
  background: #e4e7ed;
}

/* 响应式布局优化 */
@media (max-width: 1400px) {
  .data-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .data-card.large {
    grid-column: span 1;
  }

  .data-card.vertical {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .health-data {
    padding: 16px;
  }

  .data-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .data-card.large,
  .data-card.medium,
  .data-card.vertical,
  .data-card.small {
    grid-column: span 1;
    grid-row: span 1;
    min-height: auto;
  }

  .card-content {
    min-height: auto;
  }

  .health-data h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }
}
</style>