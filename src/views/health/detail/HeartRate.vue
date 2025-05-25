<template>
  <div class="heart-rate-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>心率详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前心率卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <HeartPulseIcon class="card-icon" />
          <span>当前心率</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestHeartRate }}</span>
          <span class="unit">BPM</span>
        </div>
        <div class="stat-status" :class="heartRateStatus.class">
          {{ heartRateStatus.text }}
        </div>
      </div>

      <!-- 心率图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">今日心率变化</div>
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
          <div class="stat-label">日平均心率</div>
          <div class="stat-number">{{ averageHeartRate }}</div>
          <div class="stat-unit">BPM</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高心率</div>
          <div class="stat-number">{{ maxHeartRate }}</div>
          <div class="stat-unit">BPM</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最低心率</div>
          <div class="stat-number">{{ minHeartRate }}</div>
          <div class="stat-unit">BPM</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">静息心率</div>
          <div class="stat-number">{{ restingHeartRate }}</div>
          <div class="stat-unit">BPM</div>
        </div>
      </div>

      <!-- 心率数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ heartRateHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="heartRateHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>心率 (BPM)</th>
                  <th>状态</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in heartRateHistory" :key="index">
                  <td>{{ record.time }}</td>
                  <td>{{ record.value }}</td>
                  <td>
                      <span :class="getHeartRateClass(record.value)">
                        {{ getHeartRateStatus(record.value) }}
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
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录心率</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="heartRate">心率值 (BPM)</label>
            <div class="input-wrapper">
              <input
                  id="heartRate"
                  type="number"
                  v-model="newHeartRate"
                  placeholder="请输入心率值"
                  :class="{ 'error': inputError }"
              />
              <span class="unit">BPM</span>
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
              @click="recordHeartRate"
              :disabled="isRecording || !newHeartRate"
          >
            <span v-if="!isRecording">记录心率</span>
            <span v-else>记录中...</span>
          </button>
        </div>
      </div>
    </div>

  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed,watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from "element-plus";
import '@/assets/styles/health_data_style.css';
import {
  HeartPulse as HeartPulseIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestHeartRate = ref(75)
const heartRateHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)
const abnormalHeartRateCount = ref(0)

const newHeartRate = ref('')
const isRecording = ref(false)
const inputError = ref(false)
const errorMessage = ref('')

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

const checkHeartRateWarnings = (newRate, recentData) => {
  if (recentData.length < 1) return;

  // 检查心率是否在正常范围内
  if (newRate < 60) {
    ElMessage.warning('当前心率偏低，请注意休息');
    return;
  }

  if (newRate > 100) {
    ElMessage.warning('当前心率偏高，建议放松一下');
    return;
  }

  // 检查与上次记录的心率变化
  const lastRate = recentData[0].value;
  const rateChange = Math.abs(newRate - lastRate);

  if (rateChange > 20) {
    ElMessage.warning(`心率变化幅度较大 (${rateChange} BPM)，请注意身体状况`);
  }

  // 检查连续异常记录
  let consecutiveAbnormal = 0;
  for (let i = 0; i < Math.min(3, recentData.length); i++) {
    if (recentData[i].value < 60 || recentData[i].value > 100) {
      consecutiveAbnormal++;
    }
  }

  if (consecutiveAbnormal >= 2 && (newRate < 60 || newRate > 100)) {
    ElMessage.warning('检测到连续异常心率记录，请注意身体状况');
  }
};


// 监听选择的时间周期变化
watch(selectedPeriod, (newPeriod) => {
  fetchHeartRateData(newPeriod)
})

// 获取心率状态
const getHeartRateStatus = (rate) => {
  if (rate < 60) return '心率偏低'
  if (rate > 100) return '心率偏高'
  return '心率正常'
}

// 获取心率状态的CSS类
const getHeartRateClass = (rate) => {
  if (rate < 60) return 'status-low'
  if (rate > 100) return 'status-high'
  return 'status-normal'
}

// 验证心率值
const validateHeartRate = (value) => {
  const rate = Number(value)
  if (isNaN(rate)) {
    errorMessage.value = '请输入有效的数字'
    return false
  }
  if (rate < 0 || rate > 250) {
    errorMessage.value = '心率值必须在0-250之间'
    return false
  }
  return true
}

// 添加模态框控制状态
const showRecordModal = ref(false)

// 修改记录心率的方法
const recordHeartRate = async () => {
  inputError.value = false
  errorMessage.value = ''

  if (!validateHeartRate(newHeartRate.value)) {
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
        `http://localhost:8088/api/health/${userId}/heart-rate`,
        {
          heartRate: Number(newHeartRate.value),
          measurementTime: new Date().toISOString()
        }
    )

    if (response.data) {
      newHeartRate.value = ''
      await fetchHeartRateData(selectedPeriod.value)
      ElMessage.success('心率记录成功')
      checkHeartRateWarnings(Number(newHeartRate.value), heartRateHistory.value);
      showRecordModal.value = false  // 成功后关闭模态框
    }
  } catch (error) {
    console.error('Failed to record heart rate:', error)
    ElMessage.error('记录心率失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}

// 计算属性
const heartRateStatus = computed(() => {
  const rate = latestHeartRate.value
  if (rate < 60) return { text: '心率偏低', class: 'low' }
  if (rate > 100) return { text: '心率偏高', class: 'high' }
  return { text: '心率正常', class: 'normal' }
})

const averageHeartRate = computed(() => {
  const sum = heartRateHistory.value.reduce((acc, curr) => acc + curr.value, 0)
  return Math.round(sum / heartRateHistory.value.length) || 0
})

const maxHeartRate = computed(() => {
  return Math.max(...heartRateHistory.value.map(item => item.value)) || 0
})

const minHeartRate = computed(() => {
  return Math.min(...heartRateHistory.value.map(item => item.value)) || 0
})

const restingHeartRate = ref(62)

// 获取心率数据
const fetchHeartRateData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/heart-rate`, {
      params: {
        period: period
      }
    })

    if (response.data) {
      console.log('Raw heart rate data:', response.data)

      // 将API返回的数据转换为图表所需格式并按时间排序
      heartRateHistory.value = response.data
          .map(item => ({
            time: new Date(item.measurementTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            value: item.heartRate,
            timestamp: new Date(item.measurementTime).getTime() // 转换为时间戳用于排序
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // 降序排序，最新的在前面

      console.log('Processed heart rate data:', heartRateHistory.value)

      // 更新最新心率（取排序后的第一条记录）
      if (heartRateHistory.value.length > 0) {
        latestHeartRate.value = heartRateHistory.value[0].value
      }

      // 为图表重新排序（升序）
      const chartData = [...heartRateHistory.value].sort((a, b) => a.timestamp - b.timestamp)
      heartRateHistory.value = chartData

      // 更新图表
      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch heart rate data:', error)
    ElMessage.error('获取心率数据失败')
  } finally {
    loading.value = false
  }
}


const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchHeartRateData(period)
}

// 更新图表方法
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
        return `${params[0].name}<br/>心率: ${params[0].value} BPM`;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: heartRateHistory.value.map(item => item.time),
      axisLabel: {
        formatter: function(value) {
          if (selectedPeriod.value === 'day') {
            // 日视图只显示时间
            return value.split(' ')[1];
          } else if (selectedPeriod.value === 'week') {
            // 周视图显示日期和时间
            return value;
          } else {
            // 月视图显示完整日期时间
            return value;
          }
        },
        rotate: selectedPeriod.value !== 'day' ? 45 : 0 // 长日期时旋转标签
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '心率 (BPM)',
      min: function(value) {
        return Math.max(0, Math.floor(value.min - 10));
      },
      max: function(value) {
        return Math.ceil(value.max + 10);
      },
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
      data: heartRateHistory.value.map(item => item.value),
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
    }]
  }

  myChart.setOption(option)
}

// 生命周期钩子
onMounted(async () => {
  await fetchHeartRateData()

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

</style>