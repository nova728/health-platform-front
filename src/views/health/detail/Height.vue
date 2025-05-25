<template>
  <div class="height-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>身高详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前身高卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <RulerIcon class="card-icon" />
          <span>当前身高</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestHeight }}</span>
          <span class="unit">cm</span>
        </div>
        <div class="stat-status" :class="heightTrend.class">
          {{ heightTrend.text }}
        </div>
      </div>

      <!-- 身高图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">身高变化趋势</div>
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
          <div class="stat-label">平均身高</div>
          <div class="stat-number">{{ averageHeight }}</div>
          <div class="stat-unit">cm</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高记录</div>
          <div class="stat-number">{{ maxHeight }}</div>
          <div class="stat-unit">cm</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最低记录</div>
          <div class="stat-number">{{ minHeight }}</div>
          <div class="stat-unit">cm</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">近期变化</div>
          <div class="stat-number" :class="{ 'text-green': recentChange > 0, 'text-gray': recentChange === 0 }">
            {{ recentChange > 0 ? '+' : ''}}{{ recentChange }}
          </div>
          <div class="stat-unit">cm</div>
        </div>
      </div>

      <!-- 身高数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ heightHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="heightHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>身高 (cm)</th>
                  <th>变化</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in heightHistory" :key="index">
                  <td>{{ record.time }}</td>
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

    <!-- 记录身高模态框 -->
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录身高</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="height">身高 (cm)</label>
            <div class="input-wrapper">
              <input
                  id="height"
                  type="number"
                  step="0.1"
                  v-model="newHeight"
                  placeholder="请输入身高"
                  :class="{ 'error': heightError }"
              />
              <span class="unit">cm</span>
            </div>
            <span class="error-message" v-if="heightError">{{ heightErrorMessage }}</span>
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
              @click="recordHeight"
              :disabled="isRecording || !isValidInput"
          >
            <span v-if="!isRecording">记录身高</span>
            <span v-else>记录中...</span>
          </button>
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
import { ElMessage } from 'element-plus'
import {
  Ruler as RulerIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestHeight = ref(0)
const heightHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)

// 新记录状态
const newHeight = ref('')
const isRecording = ref(false)
const heightError = ref(false)
const heightErrorMessage = ref('')
const showRecordModal = ref(false)

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

// 计算属性
const heightTrend = computed(() => {
  const change = recentChange.value
  if (!change) return { text: '暂无变化', class: 'normal' }
  if (change > 0) return { text: `增长 ${change}cm`, class: 'high' }
  return { text: `无变化`, class: 'normal' }
})

const averageHeight = computed(() => {
  const heights = heightHistory.value.map(item => item.height)
  if (heights.length === 0) return 0
  const sum = heights.reduce((a, b) => a + b, 0)
  return Math.round((sum / heights.length) * 10) / 10
})

const maxHeight = computed(() => {
  const heights = heightHistory.value.map(item => item.height)
  if (heights.length === 0) return 0
  return Math.max(...heights)
})

const minHeight = computed(() => {
  const heights = heightHistory.value.map(item => item.height)
  if (heights.length === 0) return 0
  return Math.min(...heights)
})

const recentChange = computed(() => {
  if (heightHistory.value.length < 2) return 0
  const latest = heightHistory.value[0].height
  const previous = heightHistory.value[1].height
  return Math.round((latest - previous) * 10) / 10
})

const isValidInput = computed(() => {
  return newHeight.value && !heightError.value
})

const getChangeClass = (change) => {
  if (change > 0) return 'trend-up'
  if (change < 0) return 'trend-down'
  return 'trend-stable'
}

const validateHeight = () => {
  heightError.value = false
  heightErrorMessage.value = ''

  const height = Number(newHeight.value)

  if (isNaN(height) || height < 50 || height > 300) {
    heightError.value = true
    heightErrorMessage.value = '身高必须在50-300cm之间'
    return false
  }

  return true
}

const checkHeightWarnings = (newHeight, recentData) => {
  if (recentData.length < 2) return;

  // 检查单次记录是否在正常范围内
  if (newHeight < 100 || newHeight > 220) {
    ElMessage.warning('当前身高记录值异常，请确认数据准确性');
    return;
  }

  // 检查变化是否异常
  const lastRecord = recentData[0];
  const heightDiff = Math.abs(newHeight - lastRecord.height);

  if (heightDiff > 5) {
    ElMessage.warning('检测到身高变化异常，请确认数据准确性');
  }
};

const fetchHeightData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/height`, {
      params: { period }
    })

    if (response.data) {
      const rawData = response.data
          .filter(item => item.height != null)  // 只处理有身高数据的记录
          .map(item => ({
            time: new Date(item.measurementTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            height: item.height,
            timestamp: new Date(item.measurementTime).getTime()
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

      heightHistory.value = rawData.map((item, index) => ({
        ...item,
        change: index === rawData.length - 1 ? 0 :
            Math.round((item.height - rawData[index + 1].height) * 10) / 10
      }))

      if (heightHistory.value.length > 0) {
        latestHeight.value = heightHistory.value[0].height
      }

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch height data:', error)
    ElMessage.error('获取身高数据失败')
  } finally {
    loading.value = false
  }
}

const recordHeight = async () => {
  if (!validateHeight()) return

  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    isRecording.value = true
    const response = await axios.post(
        `http://localhost:8088/api/health/${userId}/height`,
        {
          height: Number(newHeight.value),
          measurementTime: new Date().toISOString()
        }
    )

    if (response.data) {
      newHeight.value = ''
      await fetchHeightData(selectedPeriod.value)
      ElMessage.success('身高记录成功')
      checkHeightWarnings(Number(newHeight.value), heightHistory.value);
      showRecordModal.value = false
    }
  } catch (error) {
    console.error('Failed to record height:', error)
    ElMessage.error('记录身高失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchHeightData(period)
}

const updateChart = () => {
  if (!myChart || !chartRef.value) return

  const sortedData = [...heightHistory.value].sort((a, b) => a.timestamp - b.timestamp)

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
        const heightData = params[0]
        return `${heightData.name}<br/>
                身高: ${heightData.value} cm`
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
      name: '身高 (cm)',
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
        data: sortedData.map(item => item.height),
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
  fetchHeightData(newPeriod)
})

// 生命周期钩子
onMounted(async () => {
  await fetchHeightData()

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
.height-detail {
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Chart container specific styles */
.chart-container {
  height: 300px;
  margin-top: 20px;
}

/* Status colors */
.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-stable {
  color: #909399;
}

.text-green {
  color: #67c23a;
}

.text-gray {
  color: #909399;
}
</style>