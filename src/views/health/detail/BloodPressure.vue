<template>
  <div class="blood-pressure-detail">
    <div class="header">
      <button class="back-button" @click="router.back()">
        <ChevronLeftIcon class="icon" />
        返回
      </button>
      <h2>血压详情</h2>
      <button class="add-button" @click="showRecordModal = true">
        <PlusIcon class="icon" />
      </button>
    </div>

    <div class="content">
      <!-- 当前血压卡片 -->
      <div class="current-stats card">
        <div class="stat-header">
          <ActivityIcon class="card-icon" />
          <span>当前血压</span>
        </div>
        <div class="stat-value">
          <span class="value">{{ latestBloodPressure.systolic }}/{{ latestBloodPressure.diastolic }}</span>
          <span class="unit">mmHg</span>
        </div>
        <div class="stat-status" :class="bloodPressureStatus.class">
          {{ bloodPressureStatus.text }}
        </div>
      </div>

      <!-- 血压图表 -->
      <div class="chart-card card">
        <div class="chart-header">
          <div class="title">今日血压变化</div>
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
          <div class="stat-label">平均收缩压</div>
          <div class="stat-number">{{ averageSystolic }}</div>
          <div class="stat-unit">mmHg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">平均舒张压</div>
          <div class="stat-number">{{ averageDiastolic }}</div>
          <div class="stat-unit">mmHg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高收缩压</div>
          <div class="stat-number">{{ maxSystolic }}</div>
          <div class="stat-unit">mmHg</div>
        </div>
        <div class="stat-card card">
          <div class="stat-label">最高舒张压</div>
          <div class="stat-number">{{ maxDiastolic }}</div>
          <div class="stat-unit">mmHg</div>
        </div>
      </div>

      <!-- 血压数据列表 -->
      <div class="data-list card">
        <div class="list-header">
          <h3>详细数据</h3>
          <span class="data-count">共 {{ bloodPressureHistory.length }} 条记录</span>
        </div>
        <div class="list-container">
          <div v-if="loading" class="loading">加载中...</div>
          <template v-else>
            <div v-if="bloodPressureHistory.length === 0" class="no-data">
              暂无数据
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                <tr>
                  <th>时间</th>
                  <th>收缩压 (mmHg)</th>
                  <th>舒张压 (mmHg)</th>
                  <th>状态</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(record, index) in bloodPressureHistory" :key="index">
                  <td>{{ record.time }}</td>
                  <td>{{ record.systolic }}</td>
                  <td>{{ record.diastolic }}</td>
                  <td>
                      <span :class="getBloodPressureClass(record.systolic, record.diastolic)">
                        {{ getBloodPressureStatusText(record.systolic, record.diastolic) }}
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

    <!-- 记录血压模态框 -->
    <div class="modal-overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>记录血压</h3>
          <button class="close-button" @click="showRecordModal = false">
            <XIcon class="icon" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label for="systolic">收缩压 (mmHg)</label>
            <div class="input-wrapper">
              <input
                  id="systolic"
                  type="number"
                  v-model="newBloodPressure.systolic"
                  placeholder="请输入收缩压"
                  :class="{ 'error': systolicError }"
              />
              <span class="unit">mmHg</span>
            </div>
            <span class="error-message" v-if="systolicError">{{ systolicErrorMessage }}</span>
          </div>

          <div class="input-group">
            <label for="diastolic">舒张压 (mmHg)</label>
            <div class="input-wrapper">
              <input
                  id="diastolic"
                  type="number"
                  v-model="newBloodPressure.diastolic"
                  placeholder="请输入舒张压"
                  :class="{ 'error': diastolicError }"
              />
              <span class="unit">mmHg</span>
            </div>
            <span class="error-message" v-if="diastolicError">{{ diastolicErrorMessage }}</span>
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
              @click="recordBloodPressure"
              :disabled="isRecording || !isValidInput"
          >
            <span v-if="!isRecording">记录血压</span>
            <span v-else>记录中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  Activity as ActivityIcon,
  ChevronLeft as ChevronLeftIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const chartRef = ref(null)
let myChart = null

// 数据状态
const latestBloodPressure = ref({ systolic: 120, diastolic: 80 })
const bloodPressureHistory = ref([])
const selectedPeriod = ref('day')
const loading = ref(false)

// 新记录状态
const newBloodPressure = ref({ systolic: '', diastolic: '' })
const isRecording = ref(false)
const systolicError = ref(false)
const diastolicError = ref(false)
const systolicErrorMessage = ref('')
const diastolicErrorMessage = ref('')
const showRecordModal = ref(false)

// 时间周期选项
const timePeriods = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

// 计算属性
const bloodPressureStatus = computed(() => {
  const { systolic, diastolic } = latestBloodPressure.value
  return getBloodPressureStatus(systolic, diastolic)
})

const averageSystolic = computed(() => {
  const sum = bloodPressureHistory.value.reduce((acc, curr) => acc + curr.systolic, 0)
  return Math.round(sum / bloodPressureHistory.value.length) || 0
})

const averageDiastolic = computed(() => {
  const sum = bloodPressureHistory.value.reduce((acc, curr) => acc + curr.diastolic, 0)
  return Math.round(sum / bloodPressureHistory.value.length) || 0
})

const maxSystolic = computed(() => {
  return Math.max(...bloodPressureHistory.value.map(item => item.systolic)) || 0
})

const maxDiastolic = computed(() => {
  return Math.max(...bloodPressureHistory.value.map(item => item.diastolic)) || 0
})

const isValidInput = computed(() => {
  return newBloodPressure.value.systolic &&
      newBloodPressure.value.diastolic &&
      !systolicError.value &&
      !diastolicError.value
})

const checkBloodPressureWarnings = (newSystolic, newDiastolic, recentData) => {
  if (recentData.length < 1) return;

  // 1. 检查当前血压范围
  if (newSystolic >= 140 || newDiastolic >= 90) {
    ElMessage.warning('当前血压偏高，建议放松心情，避免剧烈运动');
    return;
  }

  if (newSystolic < 90 || newDiastolic < 60) {
    ElMessage.warning('当前血压偏低，注意补充水分，避免剧烈运动');
    return;
  }

  // 2. 检查与上次记录的血压变化
  const lastReading = recentData[0];
  const systolicChange = Math.abs(newSystolic - lastReading.systolic);
  const diastolicChange = Math.abs(newDiastolic - lastReading.diastolic);

  if (systolicChange > 30 || diastolicChange > 20) {
    ElMessage.warning('血压变化幅度较大，请注意休息');
  }

  // 3. 检查最近记录的异常情况
  const recentReadings = recentData.slice(0, 5); // 检查最近5条记录
  const abnormalReadings = recentReadings.filter(record =>
      record.systolic >= 140 ||
      record.systolic < 90 ||
      record.diastolic >= 90 ||
      record.diastolic < 60
  );

  // 如果新记录也异常，且已有其他异常记录
  if ((newSystolic >= 140 || newSystolic < 90 ||
          newDiastolic >= 90 || newDiastolic < 60) &&
      abnormalReadings.length >= 2) {
    ElMessage.warning('检测到连续异常血压记录，建议及时就医');
  }

  // 4. 检查异常比例
  const totalReadings = recentReadings.length + 1; // 包括新记录
  const abnormalCount = abnormalReadings.length +
      (newSystolic >= 140 || newSystolic < 90 ||
      newDiastolic >= 90 || newDiastolic < 60 ? 1 : 0);

  if (abnormalCount / totalReadings >= 0.3) {
    ElMessage.warning('检测到较多异常血压记录，请注意定期复查');
  }
};

// 方法
const getBloodPressureStatus = (systolic, diastolic) => {
  if (systolic >= 140 || diastolic >= 90) {
    return { text: '血压偏高', class: 'high' }
  }
  if (systolic < 90 || diastolic < 60) {
    return { text: '血压偏低', class: 'low' }
  }
  return { text: '血压正常', class: 'normal' }
}

const getBloodPressureClass = (systolic, diastolic) => {
  if (systolic >= 140 || diastolic >= 90) return 'status-high'
  if (systolic < 90 || diastolic < 60) return 'status-low'
  return 'status-normal'
}

const getBloodPressureStatusText = (systolic, diastolic) => {
  if (systolic >= 140 || diastolic >= 90) return '血压偏高'
  if (systolic < 90 || diastolic < 60) return '血压偏低'
  return '血压正常'
}

const validateBloodPressure = () => {
  systolicError.value = false
  diastolicError.value = false
  systolicErrorMessage.value = ''
  diastolicErrorMessage.value = ''

  const systolic = Number(newBloodPressure.value.systolic)
  const diastolic = Number(newBloodPressure.value.diastolic)

  if (isNaN(systolic) || systolic < 60 || systolic > 200) {
    systolicError.value = true
    systolicErrorMessage.value = '收缩压必须在60-200之间'
    return false
  }

  if (isNaN(diastolic) || diastolic < 40 || diastolic > 130) {
    diastolicError.value = true
    diastolicErrorMessage.value = '舒张压必须在40-130之间'
    return false
  }

  if (systolic <= diastolic) {
    systolicError.value = true
    diastolicError.value = true
    systolicErrorMessage.value = '收缩压必须大于舒张压'
    return false
  }

  return true
}

const recordBloodPressure = async () => {
  if (!validateBloodPressure()) return

  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.error('User ID not found')
      return
    }

    isRecording.value = true
    const response = await axios.post(
        `http://localhost:8088/api/health/${userId}/blood-pressure`,
        {
          systolic: Number(newBloodPressure.value.systolic),
          diastolic: Number(newBloodPressure.value.diastolic),
          measurementTime: new Date().toISOString()
        }
    )

    if (response.data) {
      newBloodPressure.value = { systolic: '', diastolic: '' }
      await fetchBloodPressureData(selectedPeriod.value)
      ElMessage.success('血压记录成功')
      checkBloodPressureWarnings(systolic, diastolic, bloodPressureHistory.value);
      showRecordModal.value = false
    }
  } catch (error) {
    console.error('Failed to record blood pressure:', error)
    ElMessage.error('记录血压失败，请稍后重试')
  } finally {
    isRecording.value = false
  }
}

const fetchBloodPressureData = async (period = 'day') => {
  try {
    loading.value = true
    const userId = store.state.user?.id

    if (!userId) {
      console.error('User ID not found')
      return
    }

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/blood-pressure`, {
      params: { period }
    })

    if (response.data) {
      bloodPressureHistory.value = response.data
          .map(item => ({
            time: new Date(item.measurementTime).toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            systolic: item.systolic,
            diastolic: item.diastolic,
            timestamp: new Date(item.measurementTime).getTime()
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

      if (bloodPressureHistory.value.length > 0) {
        const latest = bloodPressureHistory.value[0]
        latestBloodPressure.value = {
          systolic: latest.systolic,
          diastolic: latest.diastolic
        }
      }

      updateChart()
    }
  } catch (error) {
    console.error('Failed to fetch blood pressure data:', error)
    ElMessage.error('获取血压数据失败')
  } finally {
    loading.value = false
  }
}

const changePeriod = (period) => {
  selectedPeriod.value = period
  fetchBloodPressureData(period)
}

const updateChart = () => {
  if (!myChart || !chartRef.value) return

  const sortedData = [...bloodPressureHistory.value].sort((a, b) => a.timestamp - b.timestamp)

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
        const systolicData = params[0]
        const diastolicData = params[1]
        return `${systolicData.name}<br/>
                收缩压: ${systolicData.value} mmHg<br/>
                舒张压: ${diastolicData.value} mmHg`
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
          } else if (selectedPeriod.value === 'week') {
            return value
          } else {
            return value
          }
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
      name: '血压 (mmHg)',
      min: function(value) {
        return Math.max(0, Math.floor(value.min - 10))
      },
      max: function(value) {
        return Math.ceil(value.max + 10)
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
    series: [
      {
        name: '收缩压',
        data: sortedData.map(item => item.systolic),
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
      },
      {
        name: '舒张压',
        data: sortedData.map(item => item.diastolic),
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
    ],
    legend: {
      data: ['收缩压', '舒张压'],
      top: 0
    }
  }

  myChart.setOption(option)
}

// 监听选择的时间周期变化
watch(selectedPeriod, (newPeriod) => {
  fetchBloodPressureData(newPeriod)
})

// 生命周期钩子
onMounted(async () => {
  await fetchBloodPressureData()

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
.blood-pressure-detail{
  padding: 20px;
  height: 100%;
  background-color: #f8fafc;
  overflow-y: auto;       /* 允许垂直滚动 */
  box-sizing: border-box;
}

</style>