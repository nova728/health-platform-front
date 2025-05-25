<template>
  <div class="exercise-record">
    <div class="page-header">
      <h2>运动记录</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showGoalSettingDialog">
          <el-icon><Setting /></el-icon>目标设置
        </el-button>
        <el-button type="primary" @click="addRecord">
          <el-icon><Plus /></el-icon>添加记录
        </el-button>
      </div>
    </div>

    <!-- 运动数据概览 -->
    <div class="overview-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>本周运动时长</span>
            <el-tag :type="getDurationTagType" size="small">{{ getDurationStatus }}</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">{{ weeklyStats.totalDuration?.toFixed(1) || '0.0' }}</span>
          <span class="unit">小时</span>
        </div>
        <div class="stat-progress">
          <el-progress
              :percentage="calculatePercentage(weeklyStats.totalDuration, goalForm.weeklyDurationGoal)"
              :format="formatProgress"
          />
        </div>
        <div class="stat-target">目标：{{ goalForm.weeklyDurationGoal }}小时/周</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>本周消耗</span>
            <el-tag :type="getCaloriesTagType" size="small">{{ getCaloriesStatus }}</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">{{ weeklyStats.totalCalories || 0 }}</span>
          <span class="unit">千卡</span>
        </div>
        <div class="stat-progress">
          <el-progress
              :percentage="calculatePercentage(weeklyStats.totalCalories, goalForm.weeklyCaloriesGoal)"
              :format="formatProgress"
          />
        </div>
        <div class="stat-target">目标：{{ goalForm.weeklyCaloriesGoal }}千卡/周</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>运动次数</span>
            <el-tag :type="getCountTagType" size="small">{{ getCountStatus }}</el-tag>
          </div>
        </template>
        <div class="stat-value">
          <span class="number">{{ weeklyStats.exerciseCount || 0 }}</span>
          <span class="unit">次</span>
        </div>
        <div class="stat-progress">
          <el-progress
              :percentage="calculatePercentage(weeklyStats.exerciseCount, goalForm.weeklyCountGoal)"
              :format="formatProgress"
          />
        </div>
        <div class="stat-target">目标：{{ goalForm.weeklyCountGoal }}次/周</div>
      </el-card>
    </div>

    <!-- 运动记录列表 -->
    <div class="record-section">
      <div class="table-header">
        <h3>详细记录</h3>
        <div class="table-actions">
          <el-select v-model="currentPeriod" placeholder="选择时间范围">
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="全部" value="all" />
          </el-select>
        </div>
      </div>

      <el-table
          v-loading="loading"
          :data="paginatedRecords"
          style="width: 100%"
          :empty-text="loading ? '加载中...' : '暂无数据'"
      >
        <el-table-column prop="recordDate" label="日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.recordDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="exerciseType" label="运动类型" width="100">
          <template #default="scope">
            <el-tag :type="getExerciseTypeTag(scope.row.exerciseType)" size="small">
              {{ scope.row.exerciseType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="100">
          <template #default="scope">
            {{ scope.row.duration }} 分钟
          </template>
        </el-table-column>
        <el-table-column prop="calories" label="消耗" width="100">
          <template #default="scope">
            {{ scope.row.calories }} 千卡
          </template>
        </el-table-column>
        <el-table-column prop="intensity" label="强度" width="120">
          <template #default="scope">
            <el-rate
                v-model="scope.row.intensity"
                disabled
                :max="3"
                :colors="['#67C23A', '#E6A23C', '#F56C6C']"
            />
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button
                  size="small"
                  @click="editRecord(scope.row)"
                  :disabled="loading"
              >
                编辑
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteRecord(scope.row)"
                  :disabled="loading"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加分页器 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            :total="exerciseRecords.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加运动记录' : '编辑运动记录'"
        width="500px"
        @close="handleDialogClose"
    >
      <el-form
          ref="recordFormRef"
          :model="recordForm"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="运动类型" prop="exerciseType">
          <el-select v-model="recordForm.exerciseType" placeholder="请选择运动类型">
            <el-option
                v-for="type in exerciseTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期" prop="recordDate">
          <el-date-picker
              v-model="recordForm.recordDate"
              type="date"
              placeholder="选择日期"
              :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number
              v-model="recordForm.duration"
              :min="1"
              :max="999"
              controls-position="right"
          />
        </el-form-item>

        <el-form-item label="消耗(千卡)" prop="calories">
          <el-input-number
              v-model="recordForm.calories"
              :min="1"
              :max="9999"
              controls-position="right"
          />
        </el-form-item>

        <el-form-item label="运动强度" prop="intensity">
          <el-rate
              v-model="recordForm.intensity"
              :max="3"
              :colors="['#67C23A', '#E6A23C', '#F56C6C']"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
              v-model="recordForm.notes"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="submitting">取消</el-button>
          <el-button
              type="primary"
              @click="submitForm"
              :loading="submitting"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
        v-model="goalDialogVisible"
        title="运动目标设置"
        width="500px"
        @close="handleGoalDialogClose"
    >
      <el-form
          ref="goalFormRef"
          :model="goalForm"
          :rules="goalRules"
          label-width="140px"
      >
        <el-form-item label="每周运动时长" prop="weeklyDurationGoal">
          <el-input-number
              v-model="goalForm.weeklyDurationGoal"
              :min="0"
              :max="168"
              :precision="1"
              :step="0.5"
              controls-position="right"
          >
            <template #append>小时</template>
          </el-input-number>
          <div class="form-tip">建议每周运动5-10小时</div>
        </el-form-item>

        <el-form-item label="每周消耗热量" prop="weeklyCaloriesGoal">
          <el-input-number
              v-model="goalForm.weeklyCaloriesGoal"
              :min="0"
              :max="50000"
              :step="100"
              controls-position="right"
          >
            <template #append>千卡</template>
          </el-input-number>
          <div class="form-tip">建议每周消耗2000-4000千卡</div>
        </el-form-item>

        <el-form-item label="每周运动次数" prop="weeklyCountGoal">
          <el-input-number
              v-model="goalForm.weeklyCountGoal"
              :min="0"
              :max="50"
              :precision="0"
              :step="1"
              controls-position="right"
          >
            <template #append>次</template>
          </el-input-number>
          <div class="form-tip">建议每周运动3-7次</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="goalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGoals" :loading="submittingGoals">
            保存设置
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { InfoFilled } from '@element-plus/icons-vue'

// Store
const store = useStore()

// 基础数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const recordFormRef = ref(null)
const currentPeriod = ref('week')
const exerciseRecords = ref([])
const weeklyStats = ref({
  totalDuration: 0,
  totalCalories: 0,
  exerciseCount: 0
})
const currentPage = ref(1)
const pageSize = ref(10)

// 将goalForm改为ref而不是reactive
const goalForm = ref({
  weeklyDurationGoal: 7,
  weeklyCaloriesGoal: 3500,
  weeklyCountGoal: 5
})

const paginatedRecords = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return exerciseRecords.value.slice(startIndex, endIndex)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1  // 重置到第一页
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

//目标
const goalDialogVisible = ref(false)
const goalFormRef = ref(null)
const submittingGoals = ref(false)

const goalRules = {
  weeklyDurationGoal: [
    { required: true, message: '请设置每周运动时长目标', trigger: 'blur' },
    { type: 'number', min: 0, max: 168, message: '每周运动时长必须在0-168小时之间', trigger: 'blur' }
  ],
  weeklyCaloriesGoal: [
    { required: true, message: '请设置每周消耗热量目标', trigger: 'blur' },
    { type: 'number', min: 0, max: 50000, message: '每周消耗热量必须在0-50000千卡之间', trigger: 'blur' }
  ],
  weeklyCountGoal: [
    { required: true, message: '请设置每周运动次数目标', trigger: 'blur' },
    { type: 'number', min: 0, max: 50, message: '每周运动次数必须在0-50次之间', trigger: 'blur' }
  ]
}

const getDurationTagType = computed(() => {
  const duration = weeklyStats.value.totalDuration || 0
  const goal = goalForm.weeklyDurationGoal
  if (duration >= goal) return 'success'
  if (duration >= goal * 0.7) return 'warning'
  return 'danger'
})

// 方法
const showGoalSettingDialog = () => {
  fetchUserGoals()
  goalDialogVisible.value = true
}

const handleGoalDialogClose = () => {
  if (goalFormRef.value) {
    goalFormRef.value.resetFields()
  }
}

// API调用方法
const fetchUserGoals = async () => {
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/exercise/goals`)
    if (response.data) {
      goalForm.value = {
        weeklyDurationGoal: response.data.weeklyDurationGoal || 7,
        weeklyCaloriesGoal: response.data.weeklyCaloriesGoal || 3500,
        weeklyCountGoal: response.data.weeklyCountGoal || 5
      }
    } else {
      goalForm.value = {
        weeklyDurationGoal: 7,
        weeklyCaloriesGoal: 3500,
        weeklyCountGoal: 5
      }
    }
  } catch (error) {
    console.error('Failed to fetch exercise goals:', error)
    goalForm.value = {
      weeklyDurationGoal: 7,
      weeklyCaloriesGoal: 3500,
      weeklyCountGoal: 5
    }
  }
}

const submitGoals = async () => {
  if (!goalFormRef.value) return

  try {
    await goalFormRef.value.validate()

    submittingGoals.value = true
    const userId = store.state.user?.id
    if (!userId) return

    await axios.put(`http://localhost:8088/api/health/${userId}/exercise/goals`, goalForm.value)

    ElMessage.success('运动目标设置成功')
    goalDialogVisible.value = false

    // 重新获取周统计数据以更新显示
    await fetchWeeklyStats()
  } catch (error) {
    if (error.name === 'ValidationError') return
    console.error('Failed to update exercise goals:', error)
    ElMessage.error('保存运动目标失败')
  } finally {
    submittingGoals.value = false
  }
}


// 运动类型选项
const exerciseTypes = [
  { label: '跑步', value: '跑步' },
  { label: '游泳', value: '游泳' },
  { label: '骑行', value: '骑行' },
  { label: '健身', value: '健身' },
  { label: '瑜伽', value: '瑜伽' },
  { label: '步行', value: '步行' },
  { label: '篮球', value: '篮球' },
  { label: '足球', value: '足球' },
  { label: '其他', value: '其他' }
]

// 表单数据
const recordForm = reactive({
  exerciseType: '',
  recordDate: new Date(),
  duration: 30,
  calories: 300,
  intensity: 2,
  notes: ''
})

// 表单验证规则
const rules = {
  exerciseType: [
    { required: true, message: '请选择运动类型', trigger: 'change' }
  ],
  recordDate: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入运动时长', trigger: 'blur' },
    { type: 'number', min: 1, message: '时长必须大于0', trigger: 'blur' }
  ],
  calories: [
    { required: true, message: '请输入消耗热量', trigger: 'blur' },
    { type: 'number', min: 1, message: '消耗必须大于0', trigger: 'blur' }
  ],
  intensity: [
    { required: true, message: '请选择运动强度', trigger: 'change' }
  ]
}

// 计算属性
const getDurationStatus = computed(() => {
  const duration = weeklyStats.value.totalDuration || 0
  const goal = goalForm.value.weeklyDurationGoal
  if (duration >= goal) return '已达标'
  if (duration >= goal * 0.7) return '加油'
  return '继续努力'
})

const getCaloriesTagType = computed(() => {
  const calories = weeklyStats.value.totalCalories || 0
  const goal = goalForm.value.weeklyDurationGoal
  if (calories >= goal) return 'success'
  if (calories >= goal * 0.7) return 'warning'
  return 'danger'
})

const getCaloriesStatus = computed(() => {
  const calories = weeklyStats.value.totalCalories || 0
  const goal = goalForm.value.weeklyCaloriesGoal
  if (calories >= goal) return '已达标'
  if (calories >= goal * 0.7) return '加油'
  return '继续努力'
})

const getCountTagType = computed(() => {
  const count = weeklyStats.value.exerciseCount || 0
  const goal = goalForm.value.weeklyCountGoal
  if (count >= goal) return 'success'
  if (count >= goal * 0.7) return 'warning'
  return 'danger'
})

const getCountStatus = computed(() => {
  const count = weeklyStats.value.exerciseCount || 0
  const goal = goalForm.value.weeklyCountGoal
  if (count >= goal) return '已达标'
  if (count >= goal * 0.7) return '加油'
  return '继续努力'
})

// 方法
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatProgress = (percentage) => `${percentage}%`

const calculatePercentage = (current, target) => {
  if (!current || !target) return 0
  const percentage = (current / target) * 100
  return Math.min(100, Math.round(percentage))
}

const getExerciseTypeTag = (type) => {
  const typeMap = {
    '跑步': 'success',
    '游泳': 'info',
    '骑行': 'warning',
    '健身': 'danger',
    '瑜伽': 'success',
    '步行': 'info',
    '篮球': 'warning',
    '足球': 'primary'
  }
  return typeMap[type] || ''
}

const disabledDate = (date) => {
  return date > new Date()
}

// 重置表单状态
const resetFormState = () => {
  Object.assign(recordForm, {
    exerciseType: '',
    recordDate: new Date(),
    duration: 30,
    calories: 300,
    intensity: 2,
    notes: ''
  })
}

// API调用相关方法
const fetchExerciseRecords = async () => {
  try {
    loading.value = true
    const userId = store.state.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    let url = `http://localhost:8088/api/health/${userId}/exercise`
    let params = { period: currentPeriod.value }

    const response = await axios.get(url, { params })
    exerciseRecords.value = response.data

    // 重置分页到第一页
    currentPage.value = 1
  } catch (error) {
    console.error('Failed to fetch exercise records:', error)
    ElMessage.error('获取运动记录失败')
  } finally {
    loading.value = false
  }
}

const fetchWeeklyStats = async () => {
  try {
    const userId = store.state.user?.id
    if (!userId) return

    const response = await axios.get(`http://localhost:8088/api/health/${userId}/exercise/stats/weekly`)
    weeklyStats.value = response.data
  } catch (error) {
    console.error('Failed to fetch weekly stats:', error)
  }
}

// CRUD操作
const addRecord = () => {
  dialogType.value = 'add'
  resetFormState()
  dialogVisible.value = true
}

const editRecord = (row) => {
  dialogType.value = 'edit'
  Object.assign(recordForm, {
    ...row,
    recordDate: new Date(row.recordDate)
  })
  dialogVisible.value = true
}

const deleteRecord = async (row) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这条运动记录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const userId = store.state.user?.id
    if (!userId) return

    loading.value = true
    await axios.delete(`http://localhost:8088/api/health/${userId}/exercise/${row.id}`)

    ElMessage.success('删除成功')
    await fetchExerciseRecords()
    await fetchWeeklyStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete exercise record:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!recordFormRef.value) return

  try {
    await recordFormRef.value.validate()

    submitting.value = true
    const userId = store.state.user?.id
    if (!userId) return

    const formData = {
      ...recordForm,
      recordDate: recordForm.recordDate.toISOString().split('T')[0]
    }

    if (dialogType.value === 'add') {
      await axios.post(`http://localhost:8088/api/health/${userId}/exercise`, formData)
      ElMessage.success('添加成功')
    } else {
      await axios.put(`http://localhost:8088/api/health/${userId}/exercise/${formData.id}`, formData)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    await fetchExerciseRecords()
    await fetchWeeklyStats()
  } catch (error) {
    if (error.name === 'ValidationError') return
    console.error('Failed to submit exercise record:', error)
    ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
  resetFormState()
}

// 监听周期变化
watch(currentPeriod, () => {
  fetchExerciseRecords()
})

// 生命周期钩子
onMounted(async () => {
  try {
    await fetchUserGoals() // 先加载目标设置
    await Promise.all([
      fetchExerciseRecords(),
      fetchWeeklyStats()
    ])
  } catch (error) {
    console.error('Error initializing data:', error)
  }
})

</script>


<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.record-section {
  padding-bottom: 30px;
}

.stat-target {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.target-tip {
  font-size: 14px;
  color: #909399;
  cursor: help;
}

.target-tip:hover {
  color: #409EFF;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease-in-out;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-value .number {
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s;
}

.stat-card:hover .stat-value .number {
  transform: scale(1.1);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-input-group__append) {
  padding: 0 15px;
}

.exercise-record {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  text-align: center;
  margin: 15px 0;
}

.stat-value .number {
  font-size: 36px;
  font-weight: 600;
  color: #303133;
}

.stat-value .unit {
  font-size: 14px;
  color: #909399;
  margin-left: 5px;
}

.stat-progress {
  margin: 15px 0;
}

.stat-target {
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.record-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-tag) {
  text-align: center;
  min-width: 60px;
}

:deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }

  .exercise-record {
    padding: 10px;
  }
}
</style>