<template>
  <div class="nutrition-statistics">
    <!-- 视图切换和时间范围选择 -->
    <div class="controls-section">
      <el-radio-group v-model="currentView" class="view-toggle">
        <el-radio-button label="statistics">统计图表</el-radio-button>
        <el-radio-button label="calendar">日历视图</el-radio-button>
      </el-radio-group>

      <div v-if="currentView === 'statistics'" class="range-selector">
        <el-radio-group v-model="dateRange" size="small">
          <el-radio-button label="week">近一周</el-radio-button>
          <el-radio-button label="month">近一月</el-radio-button>
          <el-radio-button label="halfYear">近半年</el-radio-button>
          <el-radio-button label="year">近一年</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 统计视图 -->
    <div v-show="currentView === 'statistics'" class="statistics-view">
      <el-tabs v-model="activeNutrient">
        <el-tab-pane label="热量" name="calories">
          <div class="chart">
            <NutritionChart
                :chart-data="processedChartData"
                :loading="loading"
                unit="kcal"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="碳水" name="carbs">
          <div class="chart">
            <NutritionChart
                :chart-data="carbsChartData"
                :loading="loading"
                unit="g"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="蛋白质" name="protein">
          <div class="chart">
            <NutritionChart
                :chart-data="proteinChartData"
                :loading="loading"
                unit="g"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="脂肪" name="fat">
          <div class="chart">
            <NutritionChart
                :chart-data="fatChartData"
                :loading="loading"
                unit="g"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 日历视图 -->
    <div v-show="currentView === 'calendar'" class="calendar-view">
      <div class="calendar-wrapper">
        <el-calendar v-model="currentDate">
          <template #dateCell="{ data }">
            <div class="calendar-cell">
              <span class="date-number">{{ data.day.split('-').slice(-1)[0] }}</span>
              <div class="nutrition-bars" v-if="nutritionCache[data.day]">
                <div class="nutrition-bar">
                  <span class="label">卡</span>
                  <div class="progress-bar">
                    <div class="progress-fill"
                         :style="getProgressStyle(nutritionCache[data.day].caloriesPercentage, '#409EFF')">
                    </div>
                  </div>
                  <span class="value">{{ Math.round(nutritionCache[data.day].totalCalories) }}</span>
                </div>
                <div class="nutrition-bar">
                  <span class="label">碳</span>
                  <div class="progress-bar">
                    <div class="progress-fill"
                         :style="getProgressStyle(nutritionCache[data.day].carbsPercentage, '#67C23A')">
                    </div>
                  </div>
                  <span class="value">{{ Math.round(nutritionCache[data.day].totalCarbs) }}</span>
                </div>
                <div class="nutrition-bar">
                  <span class="label">蛋</span>
                  <div class="progress-bar">
                    <div class="progress-fill"
                         :style="getProgressStyle(nutritionCache[data.day].proteinPercentage, '#E6A23C')">
                    </div>
                  </div>
                  <span class="value">{{ Math.round(nutritionCache[data.day].totalProtein) }}</span>
                </div>
                <div class="nutrition-bar">
                  <span class="label">脂</span>
                  <div class="progress-bar">
                    <div class="progress-fill"
                         :style="getProgressStyle(nutritionCache[data.day].fatPercentage, '#F56C6C')">
                    </div>
                  </div>
                  <span class="value">{{ Math.round(nutritionCache[data.day].totalFat) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </div>

    <!-- 日详情对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="selectedDate"
        width="30%"
    >
      <DayDetailContent
          v-if="selectedDayNutrition"
          :nutrition-data="selectedDayNutrition"
      />
      <div v-else class="no-data">
        暂无数据
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { getDailyNutrition, getNutritionStats, getMonthlyNutrition } from '@/api/diet'
import NutritionChart from './NutritionChart.vue'
import DayDetailContent from './DayDetailContent.vue'
import { ElMessage } from 'element-plus'

const store = useStore()
const statsData = ref({
  dates: [],
  calories: [],
  carbs: [],
  protein: [],
  fat: [],
  recommendedCalories: [],
  recommendedCarbs: [],
  recommendedProtein: [],
  recommendedFat: []
})
const currentView = ref('statistics')
const dateRange = ref('week')
const activeNutrient = ref('calories')
const currentDate = ref(new Date())
const dialogVisible = ref(false)
const selectedDate = ref('')
const selectedDayNutrition = ref(null)
const nutritionCache = ref({})
const loading = ref(false)

// 获取某天的营养数据
const getDayNutrition = async (dateData) => {
  const dateStr = dateData.day
  if (nutritionCache.value[dateStr]) {
    return nutritionCache.value[dateStr]
  }

  try {
    const userId = store.state.user?.id
    if (!userId) return null

    const response = await getDailyNutrition(userId, dateStr)
    if (response.data) {
      nutritionCache.value[dateStr] = response.data
      return response.data
    }
    return null
  } catch (error) {
    console.error('获取营养数据失败:', error)
    return null
  }
}

// 获取统计数据
const fetchStatisticsData = async () => {
  loading.value = true
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await getNutritionStats(userId, dateRange.value)
    if (response.data) {
      statsData.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取营养完成百分比
const getDayNutritionPercentage = (date, type) => {
  const nutrition = nutritionCache.value[date]
  if (!nutrition) return 0

  const percentage = (() => {
    switch(type) {
      case 'calories':
        return (nutrition.totalCalories / nutrition.recommendedCalories) * 100
      case 'carbs':
        return (nutrition.totalCarbs / nutrition.recommendedCarbs) * 100
      case 'protein':
        return (nutrition.totalProtein / nutrition.recommendedProtein) * 100
      case 'fat':
        return (nutrition.totalFat / nutrition.recommendedFat) * 100
      default:
        return 0
    }
  })()

  return Math.min(Math.round(percentage), 100)
}

// 缓存每日营养数据
const loadMonthNutrition = async (year, month) => {
  try {
    const userId = store.state.user?.id
    if (!userId) return

    loading.value = true
    const response = await getMonthlyNutrition(userId, year, month)

    if (response?.data) {
      // 清空当前月份的缓存
      nutritionCache.value = {}

      // 将每天的数据存入缓存
      response.data.forEach(dayData => {
        const dateStr = dayData.date.split('T')[0] // 确保日期格式正确
        nutritionCache.value[dateStr] = {
          totalCalories: Number(dayData.totalCalories || 0),
          totalCarbs: Number(dayData.totalCarbs || 0),
          totalProtein: Number(dayData.totalProtein || 0),
          totalFat: Number(dayData.totalFat || 0),
          recommendedCalories: Number(dayData.recommendedCalories || 2000),
          recommendedCarbs: Number(dayData.recommendedCarbs || 250),
          recommendedProtein: Number(dayData.recommendedProtein || 60),
          recommendedFat: Number(dayData.recommendedFat || 70),
          caloriesPercentage: ((dayData.totalCalories || 0) / (dayData.recommendedCalories || 2000) * 100),
          carbsPercentage: ((dayData.totalCarbs || 0) / (dayData.recommendedCarbs || 250) * 100),
          proteinPercentage: ((dayData.totalProtein || 0) / (dayData.recommendedProtein || 60) * 100),
          fatPercentage: ((dayData.totalFat || 0) / (dayData.recommendedFat || 70) * 100)
        }
      })

      console.log('营养数据缓存:', nutritionCache.value) // 添加日志用于调试
    }
  } catch (error) {
    console.error('加载月度营养数据失败:', error)
    ElMessage.error('加载月度营养数据失败')
  } finally {
    loading.value = false
  }
}

// 修改图表数据计算
const caloriesChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.calories || [],
  recommended: statsData.value.recommendedCalories || []
}))

const carbsChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.carbs || [],
  recommended: statsData.value.recommendedCarbs || []
}))

const proteinChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.protein || [],
  recommended: statsData.value.recommendedProtein || []
}))

const fatChartData = computed(() => ({
  dates: statsData.value.dates || [],
  actual: statsData.value.fat || [],
  recommended: statsData.value.recommendedFat || []
}))

// 监听日期范围变化
watch(dateRange, () => {
  fetchStatisticsData()
})

// 监听日期变化，加载对应月份的数据
watch(() => currentDate.value, (newDate) => {
  const year = newDate.getFullYear()
  const month = newDate.getMonth() + 1
  loadMonthNutrition(year, month)
})

// 显示日详情
const showDayDetail = async (dateData) => {
  selectedDate.value = dateData.day
  selectedDayNutrition.value = await getDayNutrition(dateData)
  dialogVisible.value = true
}


// 组件挂载时获取数据
onMounted(() => {
  fetchStatisticsData()
})

onMounted(() => {
  const now = new Date()
  loadMonthNutrition(now.getFullYear(), now.getMonth() + 1)
})

// 添加数据处理函数
const processChartData = (data) => {
  if (!data || !data.dates || !data.dates.length) return data

  let processedData = { ...data }

  // 根据不同时间范围处理数据
  if (dateRange.value === 'year') {
    // 按月聚合数据
    const monthlyData = aggregateDataByMonth(data)
    processedData = {
      dates: monthlyData.dates,
      actual: monthlyData.actual,
      recommended: monthlyData.recommended
    }
  } else if (dateRange.value === 'halfYear') {
    // 每两周取一个点
    processedData = sampleData(data, 14)
  } else if (dateRange.value === 'month') {
    // 每3天取一个点
    processedData = sampleData(data, 3)
  }

  return processedData
}

// 按月聚合数据
const aggregateDataByMonth = (data) => {
  const monthlyMap = new Map()

  data.dates.forEach((date, index) => {
    const monthKey = date.substring(0, 7) // 获取年月 (YYYY-MM)
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        actualSum: 0,
        recommendedSum: 0,
        count: 0
      })
    }

    const monthly = monthlyMap.get(monthKey)
    monthly.actualSum += data.actual[index] || 0
    monthly.recommendedSum += data.recommended[index] || 0
    monthly.count++
  })

  const sortedMonths = Array.from(monthlyMap.entries()).sort()

  return {
    dates: sortedMonths.map(([month]) => month),
    actual: sortedMonths.map(([_, data]) => +(data.actualSum / data.count).toFixed(1)),
    recommended: sortedMonths.map(([_, data]) => +(data.recommendedSum / data.count).toFixed(1))
  }
}

// 数据采样
const sampleData = (data, interval) => {
  const sampled = {
    dates: [],
    actual: [],
    recommended: []
  }

  for (let i = 0; i < data.dates.length; i += interval) {
    sampled.dates.push(data.dates[i])
    sampled.actual.push(data.actual[i])
    sampled.recommended.push(data.recommended[i])
  }

  return sampled
}

// 处理后的图表数据
const processedChartData = computed(() => {
  return processChartData({
    dates: statsData.value.dates || [],
    actual: statsData.value[activeNutrient.value] || [],
    recommended: statsData.value[`recommended${activeNutrient.value.charAt(0).toUpperCase() + activeNutrient.value.slice(1)}`] || []
  })
})

const getProgressStyle = (percentage, color) => {
  // 确保百分比是数字
  const validPercentage = Number(percentage) || 0

  return {
    width: `${Math.min(validPercentage, 100)}%`,
    backgroundColor: color,
    background: validPercentage > 100 ?
        `repeating-linear-gradient(45deg, ${color} 0%, ${color} 10%, ${color}88 10%, ${color}88 20%)` :
        color
  }
}
</script>

<style scoped>
.nutrition-statistics {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.controls-section {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.view-toggle {
  transition: all 0.3s ease;
}

:deep(.el-radio-button__inner) {
  padding: 8px 20px;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__inner:hover) {
  transform: translateY(-1px);
}

.range-selector {
  margin-left: 16px;
}

/* 统计视图样式 */
.statistics-view {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.chart {
  height: 400px;
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  max-width: 300px;
  margin: 16px auto 0;
}

.chart:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

/* 日历视图样式 */
.calendar-view {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.calendar-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

:deep(.el-calendar-table) {
  table-layout: fixed;
}

:deep(.el-calendar-table td) {
  height: auto;
  padding: 0;
  border: 1px solid #ebeef5;
}

:deep(.el-calendar-day) {
  height: 100%;
  padding: 4px;
  min-height: 120px;
}

.calendar-cell {
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-number {
  font-size: 14px;
  color: #606266;
}

.nutrition-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nutrition-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}

.label {
  width: 20px;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 0.3s ease;
}

.value {
  min-width: 36px;
  text-align: right;
  color: #909399;
  font-size: 12px;
}

:deep(.el-calendar__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

:deep(.el-calendar__title) {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-calendar__body) {
  padding: 12px 20px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 优化tabs样式 */
:deep(.el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: linear-gradient(90deg, transparent, #dcdfe6, transparent);
}

:deep(.el-tabs__item) {
  font-size: 14px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
  transform: scale(1.05);
}
</style>