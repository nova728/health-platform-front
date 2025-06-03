<template>
  <div class="nutrition-statistics">    <!-- 视图切换和时间范围选择 -->
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
    </div>    <!-- 日历视图 -->
    <div v-show="currentView === 'calendar'" class="calendar-view">
      <div class="custom-calendar">
        <!-- 日历头部 -->
        <div class="calendar-header">
          <el-button @click="prevMonth" icon="ArrowLeft" circle size="small"></el-button>
          <span class="month-year">{{ formatMonthYear(currentDate) }}</span>
          <el-button @click="nextMonth" icon="ArrowRight" circle size="small"></el-button>
        </div>

        <!-- 星期标题 -->
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <!-- 日期网格 -->
        <div class="days-grid">
          <div
              v-for="date in calendarDays"
              :key="`${date.year}-${date.month}-${date.day}`"
              class="day-cell"
              :class="{
              'other-month': !date.isCurrentMonth,
              'today': date.isToday,
              'has-data': date.hasData,
              'selected': selectedDateStr === date.fullDate
            }"
              @click="handleDateClick({ day: date.fullDate })"
          >
            <span class="day-number">{{ date.day }}</span>
            <div class="nutrition-indicators" v-if="date.hasData && nutritionCache[date.fullDate]">
              <div class="nutrition-dot calories"
                   :style="{ opacity: getNutritionOpacity(nutritionCache[date.fullDate].caloriesPercentage) }"></div>
              <div class="nutrition-dot carbs"
                   :style="{ opacity: getNutritionOpacity(nutritionCache[date.fullDate].carbsPercentage) }"></div>
              <div class="nutrition-dot protein"
                   :style="{ opacity: getNutritionOpacity(nutritionCache[date.fullDate].proteinPercentage) }"></div>
              <div class="nutrition-dot fat"
                   :style="{ opacity: getNutritionOpacity(nutritionCache[date.fullDate].fatPercentage) }"></div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 日详情对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="`${selectedDate} 饮食记录`"
        width="800px"
        :before-close="handleCloseDialog"
        :z-index="3000"
        :append-to-body="true"
        :destroy-on-close="false"
        center
    ><div v-if="selectedDayData" class="day-detail-content">
      <!-- 营养摘要 -->
      <div class="nutrition-summary">
        <h3>营养摘要</h3>
        <div class="nutrition-cards">
          <div class="nutrition-card">
            <div class="icon">🔥</div>
            <div class="info">
              <span class="label">热量</span>
              <span class="value">{{ Math.round(selectedDayData.totalCalories) }}kcal</span>
              <span class="progress">{{ Math.round((selectedDayData.totalCalories / selectedDayData.recommendedCalories) * 100) }}%</span>
            </div>
          </div>
          <div class="nutrition-card">
            <div class="icon">🍞</div>
            <div class="info">
              <span class="label">碳水</span>
              <span class="value">{{ Math.round(selectedDayData.totalCarbs) }}g</span>
              <span class="progress">{{ Math.round((selectedDayData.totalCarbs / selectedDayData.recommendedCarbs) * 100) }}%</span>
            </div>
          </div>
          <div class="nutrition-card">
            <div class="icon">🥩</div>
            <div class="info">
              <span class="label">蛋白质</span>
              <span class="value">{{ Math.round(selectedDayData.totalProtein) }}g</span>
              <span class="progress">{{ Math.round((selectedDayData.totalProtein / selectedDayData.recommendedProtein) * 100) }}%</span>
            </div>
          </div>
          <div class="nutrition-card">
            <div class="icon">🥑</div>
            <div class="info">
              <span class="label">脂肪</span>
              <span class="value">{{ Math.round(selectedDayData.totalFat) }}g</span>
              <span class="progress">{{ Math.round((selectedDayData.totalFat / selectedDayData.recommendedFat) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>      <!-- 餐次记录 -->
      <div class="meals-section" v-if="selectedDayMeals && selectedDayMeals.length > 0">
        <h3>餐次记录</h3>
        <div class="meals-list">
          <div v-for="meal in groupMealsByType(selectedDayMeals)" :key="meal.type" class="meal-item">
            <div class="meal-header">
              <span class="meal-type">{{ getMealTypeName(meal.type) }}</span>
              <span class="meal-time">{{ formatTime(meal.time) }}</span>
            </div>            <div class="food-items">
              <div v-for="food in meal.foods" :key="food.id" class="food-item">
                <div class="food-info">
                  <span class="food-name">{{ food.foodName }}</span>
                  <span class="food-amount">{{ food.servingAmount }}{{ food.servingUnit }}</span>
                </div>
                <div class="food-nutrition">
                  <span>{{ Math.round(food.calories) }}kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当有营养数据但没有具体餐食记录时显示 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>这一天还没有详细的餐食记录</p>
        <el-button type="primary" @click="goToAddMeal">添加餐食</el-button>
      </div>
    </div>

      <!-- 当完全没有数据时显示 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <p>{{ selectedDate }}暂无营养数据</p>
        <p class="empty-subtitle">开始记录您的饮食来查看营养分析</p>
        <el-button type="primary" @click="goToAddMeal">添加今日餐食</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getDailyNutrition, getNutritionStats, getMonthlyNutrition } from '@/api/diet'
import NutritionChart from './NutritionChart.vue'
import { ElMessage } from 'element-plus'

// 定义组件事件
const emit = defineEmits(['add-meal'])

const store = useStore()
const router = useRouter()
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
const selectedDateStr = ref('')
const selectedDayData = ref(null)
const selectedDayMeals = ref([])
const nutritionCache = ref({})
const loading = ref(false)

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 生成日历天数数据
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 获取本月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 获取第一天是星期几
  const firstDayWeek = firstDay.getDay()

  // 获取本月天数
  const daysInMonth = lastDay.getDate()

  const days = []

  // 添加上个月的尾部日期
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      fullDate: formatDate(date),
      isCurrentMonth: false,
      isToday: isToday(formatDate(date)),
      hasData: !!nutritionCache.value[formatDate(date)]
    })
  }

  // 添加本月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const fullDate = formatDate(date)
    days.push({
      day,
      month: month + 1,
      year,
      fullDate,
      isCurrentMonth: true,
      isToday: isToday(fullDate),
      hasData: !!nutritionCache.value[fullDate]
    })
  }

  // 添加下个月的开头日期，补满6行
  const totalCells = 42 // 6行 * 7列
  const remainingCells = totalCells - days.length
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      month: month + 2 > 12 ? 1 : month + 2,
      year: month + 1 > 11 ? year + 1 : year,
      fullDate: formatDate(date),
      isCurrentMonth: false,
      isToday: isToday(formatDate(date)),
      hasData: !!nutritionCache.value[formatDate(date)]
    })
  }

  return days
})

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化月年显示
const formatMonthYear = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}年${month}月`
}

// 上一个月
const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

// 下一个月
const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// 获取营养指示器的透明度
const getNutritionOpacity = (percentage) => {
  const p = Number(percentage) || 0
  return Math.min(0.3 + (p / 100) * 0.7, 1)
}

// 获取某天的营养数据
const getDayNutrition = async (dateData) => {
  const dateStr = dateData.day
  console.log('获取营养数据 for date:', dateStr)

  // 先检查缓存
  if (nutritionCache.value[dateStr]) {
    console.log('从缓存获取数据:', nutritionCache.value[dateStr])
    return nutritionCache.value[dateStr]
  }

  try {
    const userId = store.state.user?.id
    if (!userId) {
      console.log('用户ID未找到')
      return null
    }

    console.log('从API获取营养数据:', { userId, dateStr })
    const response = await getDailyNutrition(userId, dateStr)
    console.log('API响应:', response)

    if (response.data) {
      nutritionCache.value[dateStr] = response.data
      console.log('缓存已更新:', nutritionCache.value[dateStr])
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
  actual: statsData.value.fat || [],  recommended: statsData.value.recommendedFat || []
}))

// 判断是否是今天
const isToday = (dateStr) => {
  const today = new Date()
  const targetDate = new Date(dateStr)

  return today.getFullYear() === targetDate.getFullYear() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getDate() === targetDate.getDate()
}

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

// 处理日期点击
const handleDateClick = (data) => {
  console.log('=== 日期点击事件触发 ===')
  console.log('点击的日期:', data.day)
  console.log('data对象:', data)

  try {
    // 设置选中的日期
    selectedDate.value = formatSelectedDate(data.day)
    console.log('设置的selectedDate:', selectedDate.value)

    // 立即显示对话框
    dialogVisible.value = true
    console.log('dialogVisible设置为true')

    // 异步加载该日期的详细数据
    loadDayDetails(data)
  } catch (error) {
    console.error('handleDateClick出错:', error)
  }
}

// 加载日详情数据
const loadDayDetails = async (dateData) => {
  try {
    console.log('开始加载日详情数据:', dateData.day)    // 获取营养数据和餐次记录
    const userId = store.state.user?.id
    if (userId) {
      try {
        console.log('获取营养数据和餐食记录 for:', { userId, date: dateData.day })
        // 使用与DietRecord相同的方式获取数据
        const nutritionResponse = await getDailyNutrition(userId, dateData.day)
        console.log('营养数据API响应:', nutritionResponse)

        if (nutritionResponse.data) {
          // 设置营养数据
          selectedDayData.value = {
            totalCalories: nutritionResponse.data.totalCalories || 0,
            totalCarbs: nutritionResponse.data.totalCarbs || 0,
            totalProtein: nutritionResponse.data.totalProtein || 0,
            totalFat: nutritionResponse.data.totalFat || 0,
            recommendedCalories: nutritionResponse.data.recommendedCalories || 2000,
            recommendedCarbs: nutritionResponse.data.recommendedCarbs || 250,
            recommendedProtein: nutritionResponse.data.recommendedProtein || 60,
            recommendedFat: nutritionResponse.data.recommendedFat || 67
          }
          
          // 设置餐次记录
          selectedDayMeals.value = nutritionResponse.data.meals || []
          console.log('设置营养数据:', selectedDayData.value)
          console.log('设置餐食数据:', selectedDayMeals.value)
        } else {
          console.log('当天没有数据')
          selectedDayData.value = null
          selectedDayMeals.value = []
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        selectedDayData.value = null
        selectedDayMeals.value = []
      }
    } else {
      console.log('用户ID不存在，无法获取餐食记录')
      selectedDayMeals.value = []
    }
  } catch (error) {
    console.error('获取日详情失败:', error)
    selectedDayData.value = null
    selectedDayMeals.value = []
  }
}

// 格式化选中日期显示
const formatSelectedDate = (dateStr) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]

  return `${year}年${month}月${day}日 ${weekday}`
}

// 获取餐次类型名称
const getMealTypeName = (mealType) => {
  const mealTypeMap = {
    'breakfast': '早餐',
    'lunch': '午餐',
    'dinner': '晚餐',
    'snack': '加餐'
  }
  return mealTypeMap[mealType] || mealType
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) {
    return '--:--'
  }
  
  const date = new Date(timeStr)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '--:--'
  }
  
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 关闭对话框
const handleCloseDialog = () => {
  dialogVisible.value = false
  selectedDayData.value = null
  selectedDayMeals.value = []
}

// 跳转到添加餐食
const goToAddMeal = () => {
  dialogVisible.value = false
  // 将当前选中的日期通过事件发送给父组件
  emit('add-meal', selectedDate.value)
}

// 按餐次类型分组餐食记录
const groupMealsByType = (meals) => {
  if (!meals || meals.length === 0) return []
  
  // 按餐次类型分组
  const mealsByType = {}
  
  meals.forEach(meal => {
    const type = meal.mealType
    if (!mealsByType[type]) {
      mealsByType[type] = {
        type: type,
        time: meal.createTime,
        foods: []
      }
    }
    
    // 将餐食添加到对应分组
    mealsByType[type].foods.push(meal)
  })
  
  // 转换为数组
  return Object.values(mealsByType)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStatisticsData()
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
/* 主容器样式 */
.nutrition-statistics {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
}

/* 控制区域样式 */
.controls-section {
  padding: 24px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

/* 视图切换按钮组 */
.view-toggle {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

:deep(.view-toggle .el-radio-button) {
  margin: 0 2px;
}

:deep(.view-toggle .el-radio-button__inner) {
  padding: 12px 24px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:deep(.view-toggle .el-radio-button__inner:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

:deep(.view-toggle .el-radio-button.is-active .el-radio-button__inner) {
  background: white;
  color: #10b981;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 范围选择器 */
.range-selector {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

:deep(.range-selector .el-radio-button__inner) {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:deep(.range-selector .el-radio-button__inner:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

:deep(.range-selector .el-radio-button.is-active .el-radio-button__inner) {
  background: white;
  color: #10b981;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 统计视图样式 */
.statistics-view {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  min-height: 0;
}

/* 标签页美化 */
:deep(.el-tabs__header) {
  margin-bottom: 24px;
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-tabs__nav-wrap) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-tabs__nav) {
  border: none;
  display: flex;
  gap: 4px;
}

:deep(.el-tabs__item) {
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  border: none;
  color: #64748b;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  margin: 0;
}

:deep(.el-tabs__item:hover) {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  transform: translateY(-1px);
}

:deep(.el-tabs__item.is-active) {
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 图表容器美化 */
.chart {
  height: 450px;
  margin: 24px auto 0;
  background: white;
  border-radius: 20px;
  /* padding: 32px; */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width: none;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.chart:hover {
  box-shadow: 0 12px 48px rgba(16, 185, 129, 0.15);
  transform: translateY(-4px);
  border-color: #10b981;
}

/* 日历视图样式 */
.calendar-view {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  min-height: 0;
}

/* 日期数字样式 */
.date-number {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  transition: color 0.3s ease;
}

.calendar-cell:hover .date-number {
  color: #10b981;
}

.nutrition-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nutrition-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 20px;
}

.label {
  width: 18px;
  text-align: center;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 6px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.value {
  min-width: 28px;
  text-align: right;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 6px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* 营养进度条颜色定制 */
.nutrition-bar:nth-child(1) .progress-fill {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.nutrition-bar:nth-child(2) .progress-fill {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.nutrition-bar:nth-child(3) .progress-fill {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.nutrition-bar:nth-child(4) .progress-fill {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .controls-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .view-toggle,
  .range-selector {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .statistics-view,
  .calendar-view {
    padding: 16px;
  }

  .chart,
  .calendar-wrapper {
    padding: 16px;
  }

  :deep(.el-calendar__title) {
    font-size: 18px;
  }

  .calendar-cell {
    padding: 8px 4px;
  }

  .date-number {
    font-size: 14px;
  }

  .nutrition-bar {
    height: 16px;
  }

  .progress-bar {
    height: 6px;
  }

  .label {
    width: 14px;
    font-size: 10px;
  }

  .value {
    min-width: 24px;
    font-size: 9px;
  }
}

/* 动画效果 */
.nutrition-statistics {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 空数据状态 */
.no-data {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  font-size: 16px;
}

/* 日详情对话框样式 */
.day-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.nutrition-summary h3 {
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nutrition-summary h3::before {
  content: '📊';
  font-size: 18px;
}

.nutrition-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.nutrition-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.nutrition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.nutrition-card .icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.nutrition-card .info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nutrition-card .label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.nutrition-card .value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.nutrition-card .progress {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.meals-section h3 {
  color: #1f2937;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meals-section h3::before {
  content: '🍽️';
  font-size: 18px;
}

.meals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meal-item {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.meal-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #10b981;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
}

.meal-type {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.meal-time {
  color: #64748b;
  font-size: 14px;
}

.food-items {
  padding: 10px 15px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.food-item:last-child {
  border-bottom: none;
}

.food-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f5f9;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.food-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.food-amount {
  font-size: 12px;
  color: #64748b;
}

.food-nutrition {
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
  text-align: right;
  min-width: 70px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-state p {
  font-size: 18px;
  color: #64748b;
  margin: 8px 0;
}

.empty-subtitle {
  font-size: 14px !important;
  color: #94a3b8 !important;
  margin-bottom: 24px !important;
}

.empty-state .el-button {
  margin-top: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  padding: 12px 24px;
  font-size: 16px;
}

.loading-state {
  padding: 24px;
}

/* 自定义日历样式 */
.custom-calendar {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.custom-calendar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.month-year {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 16px;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  font-size: 14px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  padding: 2px;
}

.day-cell {
  min-height: 120px;
  background: white;
  border-radius: 8px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.day-cell:hover {
  background: rgba(16, 185, 129, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
  border: 2px solid rgba(16, 185, 129, 0.2);
}

.day-cell.other-month {
  background: #f8fafc;
  color: #cbd5e1;
}

.day-cell.other-month .day-number {
  color: #cbd5e1;
}

.day-cell.today {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 2px solid #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.day-cell.today .day-number {
  color: #10b981;
  font-weight: 700;
}

.day-cell.has-data {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.day-cell.selected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
}

.day-cell.selected .day-number {
  color: white;
  font-weight: 700;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.nutrition-indicators {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: auto;
}

.nutrition-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nutrition-dot.calories {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.nutrition-dot.carbs {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.nutrition-dot.protein {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.nutrition-dot.fat {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.day-cell:hover .nutrition-dot {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.day-cell.selected .nutrition-indicators {
  filter: brightness(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-calendar {
    padding: 16px;
  }

  .calendar-header {
    margin-bottom: 16px;
  }

  .month-year {
    font-size: 18px;
  }

  .weekday {
    padding: 8px 4px;
    font-size: 12px;
  }

  .day-cell {
    min-height: 80px;
    padding: 8px 4px;
  }

  .day-number {
    font-size: 14px;
  }

  .nutrition-dot {
    width: 6px;
    height: 6px;
  }
}

/* 动画效果 */
.day-cell {
  animation: fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>