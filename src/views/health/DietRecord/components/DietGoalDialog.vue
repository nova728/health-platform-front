<template>
  <el-dialog
    v-model="visible"
    title="设置饮食目标"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="diet-goal-form">
      <div class="form-section">
        <h4 class="section-title">📊 每日营养目标</h4>
        <div class="goal-grid">
          <div class="goal-item">
            <label class="goal-label">
              <span class="goal-icon">🔥</span>
              热量 (kcal)
            </label>
            <el-input-number
              v-model="formData.calories"
              :min="800"
              :max="5000"
              :step="50"
              size="large"
              controls-position="right"
            />
          </div>

          <div class="goal-item">
            <label class="goal-label">
              <span class="goal-icon">🌾</span>
              碳水化合物 (g)
            </label>
            <el-input-number
              v-model="formData.carbs"
              :min="50"
              :max="800"
              :step="5"
              size="large"
              controls-position="right"
            />
          </div>

          <div class="goal-item">
            <label class="goal-label">
              <span class="goal-icon">💪</span>
              蛋白质 (g)
            </label>
            <el-input-number
              v-model="formData.protein"
              :min="30"
              :max="300"
              :step="5"
              size="large"
              controls-position="right"
            />
          </div>

          <div class="goal-item">
            <label class="goal-label">
              <span class="goal-icon">🥑</span>
              脂肪 (g)
            </label>
            <el-input-number
              v-model="formData.fat"
              :min="20"
              :max="200"
              :step="5"
              size="large"
              controls-position="right"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4 class="section-title">⚡ 快速设置</h4>
        <div class="preset-buttons">
          <el-button @click="setPreset('lose-weight')" class="preset-btn">
            📉 减脂目标
          </el-button>
          <el-button @click="setPreset('maintain')" class="preset-btn">
            ⚖️ 维持体重
          </el-button>
          <el-button @click="setPreset('gain-muscle')" class="preset-btn">
            💪 增肌目标
          </el-button>
        </div>
      </div>

      <div class="form-section">
        <h4 class="section-title">📝 备注</h4>
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="3"
          placeholder="记录你的饮食计划或特殊要求..."
          maxlength="200"
          show-word-limit
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">取消</el-button>
        <el-button type="primary" @click="handleSave" size="large" :loading="saving">
          保存目标
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentGoals: {
    type: Object,
    default: () => ({
      calories: 2000,
      carbs: 250,
      protein: 120,
      fat: 65
    })
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const saving = ref(false)

const formData = reactive({
  calories: 2000,
  carbs: 250,
  protein: 120,
  fat: 65,
  note: ''
})

// 预设目标
const presets = {
  'lose-weight': {
    calories: 1600,
    carbs: 150,
    protein: 120,
    fat: 45,
    note: '减脂目标：适度控制热量，保持蛋白质摄入'
  },
  'maintain': {
    calories: 2000,
    carbs: 250,
    protein: 100,
    fat: 65,
    note: '维持体重：均衡营养，保持健康'
  },
  'gain-muscle': {
    calories: 2500,
    carbs: 300,
    protein: 150,
    fat: 80,
    note: '增肌目标：增加蛋白质和热量摄入'
  }
}

const setPreset = (type) => {
  const preset = presets[type]
  Object.assign(formData, preset)
  ElMessage.success(`已设置为${getPresetName(type)}`)
}

const getPresetName = (type) => {
  const names = {
    'lose-weight': '减脂目标',
    'maintain': '维持体重',
    'gain-muscle': '增肌目标'
  }
  return names[type]
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  try {
    saving.value = true
    
    // 验证数据
    if (formData.calories < 800 || formData.calories > 5000) {
      ElMessage.error('热量目标应在800-5000之间')
      return
    }

    // 发送保存事件
    emit('save', { ...formData })
    ElMessage.success('饮食目标设置成功！')
    handleClose()
  } catch (error) {
    console.error('保存饮食目标失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 监听对话框显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 初始化表单数据
    Object.assign(formData, props.currentGoals)
  }
})

watch(visible, (val) => {
  if (!val) {
    emit('update:modelValue', false)
  }
})
</script>

<style scoped>
.diet-goal-form {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.goal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.goal-icon {
  font-size: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
  padding-left: 15px;
}

.preset-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preset-btn {
  flex: 1;
  min-width: 120px;
  height: 44px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
  transform: translateY(-1px);
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  resize: none;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

:deep(.el-dialog__header) {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-dialog__body) {
  padding: 0 24px 24px 24px;
}

:deep(.el-dialog__footer) {
  padding: 20px 24px 24px 24px;
  border-top: 1px solid #f1f5f9;
}

/* 绿色主题按钮样式 */
:deep(.el-button--primary) {
  background-color: #10b981;
  border-color: #10b981;
}

:deep(.el-button--primary:hover) {
  background-color: #059669;
  border-color: #059669;
}

:deep(.el-button--primary:active) {
  background-color: #047857;
  border-color: #047857;
}

:deep(.el-button--primary:focus) {
  background-color: #10b981;
  border-color: #10b981;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .goal-grid {
    grid-template-columns: 1fr;
  }
  
  .preset-buttons {
    flex-direction: column;
  }
  
  .preset-btn {
    min-width: auto;
  }
}
</style>
