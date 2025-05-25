<template>
  <div class="medicine-management">
    <!-- 头部搜索和添加区域 -->
    <div class="header-section">
      <div class="search-box">
        <el-input
            v-model="searchQuery"
            placeholder="搜索药品..."
            clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="searchMedicine">搜索</el-button>
          </template>
        </el-input>
      </div>

      <el-button type="primary" @click="showAddForm = true">
        <el-icon><Plus /></el-icon>
        添加用药记录
      </el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 用药记录卡片 -->
      <el-card class="medicine-records">
        <template #header>
          <div class="card-header">
            <span>用药记录</span>
            <div class="header-actions">
              <el-select v-model="periodFilter" @change="fetchMedicineRecords">
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
                <el-option label="全部" value="all" />
              </el-select>
              <el-button type="text" @click="refreshRecords">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <el-empty v-if="!loading && !medicineRecords.length" description="暂无用药记录" />

        <el-scrollbar v-else height="400px">
          <div class="records-list">
            <el-card
                v-for="record in medicineRecords"
                :key="record.id"
                shadow="hover"
            >
              <!-- 在 record-content 中 -->
              <div class="record-content">
                <div class="record-info">
                  <h3 class="medicine-title">{{ record.name }}</h3>
                  <div class="details-row">
      <span class="detail-item">
        <el-icon><Stopwatch /></el-icon>
        剂量: {{ record.dosage }}
      </span>
                    <span class="detail-item">
        <el-icon><Timer /></el-icon>
        频率: {{ record.frequency }}
      </span>
                  </div>
                  <div v-if="record.startDate" class="date-info">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ record.startDate }} - {{ record.endDate || '持续服用中' }}</span>
                  </div>
                  <div v-if="record.notes" class="notes-section">
                    <el-icon><Document /></el-icon>
                    <p>{{ record.notes }}</p>
                  </div>
                </div>
                <div class="record-actions">
                  <el-tooltip content="查看详情" placement="top">
                    <el-button circle type="info" @click="showMedicineDetails(record)">
                      <el-icon><InfoFilled /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="设置提醒" placement="top">
                    <el-button circle type="primary" @click="setReminder(record.id)">
                      <el-icon><Bell /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="编辑记录" placement="top">
                    <el-button circle type="success" @click="editRecord(record)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </el-card>
          </div>
        </el-scrollbar>
      </el-card>

      <!-- 用药提醒卡片 -->
      <el-card class="medicine-reminders">
        <template #header>
          <div class="card-header">
            <span>用药提醒</span>
          </div>
        </template>

        <el-empty v-if="!reminders.length" description="暂无用药提醒" />

        <el-scrollbar v-else height="300px">
          <div class="reminders-list">
            <div
                v-for="reminder in reminders"
                :key="reminder.id"
                class="reminder-item"
            >
              <el-icon class="reminder-icon"><Clock /></el-icon>
              <div class="reminder-info">
                <div class="reminder-header">
                  <span class="medicine-name">{{ reminder.medicineName }}</span>
                  <el-tag size="small" :type="reminder.isActive ? 'success' : 'info'">
                    {{ reminder.isActive ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
                <div class="reminder-details">
        <span class="time">
          <el-icon><Timer /></el-icon>
          {{ reminder.reminderTime }}
        </span>
                  <span class="repeat-type">
          <el-icon><Calendar /></el-icon>
          {{ formatRepeatType(reminder.repeatType) }}
        </span>
                </div>
              </div>
              <div class="reminder-actions">
                <el-switch
                    v-model="reminder.isActive"
                    @change="toggleReminder(reminder)"
                    class="reminder-switch"
                />
                <el-tooltip content="删除提醒" placement="top">
                  <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      @click="deleteReminder(reminder)"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-card>
    </div>

    <!-- 添加/编辑用药记录对话框 -->
    <el-dialog
        v-model="showAddForm"
        :title="isEditing ? '编辑用药记录' : '添加用药记录'"
        width="500px"
        destroy-on-close
    >
      <el-form
          ref="medicineFormRef"
          :model="medicineForm"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="药品名称" prop="name">
          <el-autocomplete
              v-model="medicineForm.name"
              :fetch-suggestions="querySearch"
              placeholder="输入药品名称(至少2个字符)"
              @select="handleSelect"
              class="w-full"
              :trigger-on-focus="false"
          />
        </el-form-item>

        <!-- 剂量部分 -->
        <el-form-item label="用药剂量">
          <el-form-item prop="dosageAmount" class="dosage-form-item" style="margin-bottom: 0">
            <el-input-number
                v-model="medicineForm.dosageAmount"
                :min="0.1"
                :step="0.1"
                :precision="1"
                controls-position="right"
                class="dosage-input"
            />
          </el-form-item>
          <el-form-item prop="dosageUnit" style="margin-bottom: 0">
            <el-select
                v-model="medicineForm.dosageUnit"
                class="unit-select"
                placeholder="单位"
            >
              <el-option label="毫克(mg)" value="mg" />
              <el-option label="克(g)" value="g" />
              <el-option label="毫升(ml)" value="ml" />
              <el-option label="片" value="片" />
              <el-option label="粒" value="粒" />
              <el-option label="支" value="支" />
            </el-select>
          </el-form-item>
        </el-form-item>

        <!-- 频率部分 -->
        <el-form-item label="服用频率">
          <el-form-item prop="frequencyTimes" class="frequency-form-item">
            <el-select
                v-model="medicineForm.frequencyTimes"
                class="frequency-select"
            >
              <el-option label="每天1次" value="1" />
              <el-option label="每天2次" value="2" />
              <el-option label="每天3次" value="3" />
              <el-option label="每天4次" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item prop="frequencyPeriod" class="period-form-item">
            <el-select
                v-model="medicineForm.frequencyPeriod"
                class="period-select"
            >
              <el-option label="餐前" value="beforeMeal" />
              <el-option label="餐后" value="afterMeal" />
              <el-option label="空腹" value="emptyStomach" />
              <el-option label="任意时间" value="anytime" />
            </el-select>
          </el-form-item>
        </el-form-item>

        <el-form-item label="服用时间" v-if="medicineForm.frequencyTimes">
          <div class="time-select-container">
            <el-time-select
                v-for="index in Number(medicineForm.frequencyTimes)"
                :key="index"
                v-model="medicineForm.frequencyTiming[index-1]"
                class="time-select-item"
                :start="'00:00'"
                :step="'00:30'"
                :end="'23:30'"
                placeholder="选择时间"
            />
          </div>
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
              v-model="medicineForm.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
              v-model="medicineForm.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              :disabled-date="disableInvalidEndDates"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
              v-model="medicineForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请填写用药注意事项等信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelForm">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 设置提醒对话框 -->
    <el-dialog
        v-model="showReminderForm"
        title="设置用药提醒"
        width="400px"
    >
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒时间" required>
          <el-time-picker
              v-model="reminderForm.reminderTime"
              format="HH:mm"
              value-format="HH:mm:ss"
              placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item label="重复类型" required>
          <el-select v-model="reminderForm.repeatType">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showReminderForm = false">取消</el-button>
        <el-button type="primary" @click="submitReminder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 药品详情对话框 -->
    <el-dialog
        v-model="showDetailsDialog"
        title="药品详情"
        width="800px"
        :fullscreen="false"
    >
      <el-scrollbar height="600px">
        <div class="drug-details">
          <!-- 基本信息 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="品牌名">{{ selectedMedicine.brandName }}</el-descriptions-item>
              <el-descriptions-item label="通用名">{{ selectedMedicine.genericName }}</el-descriptions-item>
              <el-descriptions-item label="制造商">{{ selectedMedicine.manufacturer }}</el-descriptions-item>
              <el-descriptions-item label="使用方式">{{ selectedMedicine.route }}</el-descriptions-item>
              <el-descriptions-item label="药品类型">{{ selectedMedicine.productType }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 使用信息 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>使用信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用途">{{ selectedMedicine.purpose }}</el-descriptions-item>
              <el-descriptions-item label="适应症">{{ selectedMedicine.indications }}</el-descriptions-item>
              <el-descriptions-item label="用法用量">{{ selectedMedicine.dosage }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 警告信息 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span class="text-red-600">警告信息</span>
              </div>
            </template>
            <el-collapse>
              <el-collapse-item title="警告事项" name="1">
                <div class="p-3">{{ selectedMedicine.warnings }}</div>
              </el-collapse-item>
              <el-collapse-item title="禁忌" name="2">
                <div class="p-3">{{ selectedMedicine.doNotUse }}</div>
              </el-collapse-item>
              <el-collapse-item title="用药期间注意事项" name="3">
                <div class="p-3">{{ selectedMedicine.whenUsing }}</div>
              </el-collapse-item>
              <el-collapse-item title="停药指征" name="4">
                <div class="p-3">{{ selectedMedicine.stopUse }}</div>
              </el-collapse-item>
            </el-collapse>
          </el-card>

          <!-- 其他信息 -->
          <el-card>
            <template #header>
              <div class="card-header">
                <span>其他信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="储存条件">{{ selectedMedicine.storage }}</el-descriptions-item>
              <el-descriptions-item label="有效成分">{{ selectedMedicine.activeIngredient }}</el-descriptions-item>
              <el-descriptions-item label="非活性成分">{{ selectedMedicine.inactiveIngredient }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted ,watch, nextTick} from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage,ElMessageBox } from 'element-plus'
import MedicineService from '@/services/MedicineService'
import {
  Search,
  Plus,
  Bell,
  Clock,
  Edit,
  Refresh,
  InfoFilled,
  Calendar,
  Document,
  Timer,
  Stopwatch,
  Delete
} from '@element-plus/icons-vue'

const formatRepeatType = (type) => {
  const types = {
    'DAILY': '每天',
    'WEEKLY': '每周',
    'MONTHLY': '每月'
  };
  return types[type] || type;
};

const router = useRouter()
const store = useStore()
const userId = ref(store.state.user?.id)
const medicineFormRef = ref(null)

const medicineRecords = ref([])
const reminders = ref([])
const searchQuery = ref('')
const loading = ref(false)
const showAddForm = ref(false)
const showReminderForm = ref(false)
const showDetailsDialog = ref(false)
const isEditing = ref(false)
const periodFilter = ref('week')
const selectedMedicine = ref(null)

const reminderForm = ref({
  medicineId: null,
  reminderTime: null,
  repeatType: 'daily',
  isActive: true
});

const initMedicineForm = () => ({
  id: null,
  name: '',
  dosageAmount: 1,
  dosageUnit: '',
  frequencyTimes: '',
  frequencyPeriod: '',
  frequencyTiming: [],
  startDate: '',
  endDate: '',
  notes: '',
  drugInfo: null
})

const medicineForm = ref(initMedicineForm())

// 日期禁用函数
const disablePastDates = (date) => {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

const disableInvalidEndDates = (date) => {
  if (!medicineForm.value.startDate) return false
  return date < new Date(medicineForm.value.startDate)
}

const formRules = {
  name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' },
    { min: 2, message: '药品名称至少2个字符', trigger: 'blur' }
  ],
  // 剂量相关的验证
  dosageAmount: [
    { required: true, message: '请输入用药剂量', trigger: 'blur' },
    { type: 'number', min: 0.1, message: '剂量必须大于0', trigger: 'blur' }
  ],
  dosageUnit: [
    { required: true, message: '请选择剂量单位', trigger: 'change' }
  ],
  // 频率相关的验证
  frequencyTimes: [
    { required: true, message: '请选择服用次数', trigger: 'change' }
  ],
  frequencyPeriod: [
    { required: true, message: '请选择服用时段', trigger: 'change' }
  ],
  // 日期相关的验证
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ]
}

const searchResults = ref([])

const querySearch = async (queryString, cb) => {
  if (queryString.length < 2) {
    cb([]);
    return;
  }

  try {
    const response = await MedicineService.searchDrugLabels(queryString);
    const suggestions = response.results?.map(result => ({
      value: result.openfda?.brand_name?.[0] || result.openfda?.generic_name?.[0],
      data: result
    })) || [];
    cb(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    cb([]);
  }
};


const handleSelect = (item) => {
  if (item) {
    medicineForm.value.name = item.value
    medicineForm.value.drugInfo = item.data
    const result = item.data;
    selectedMedicine.value = {
      name: item.value,
      brandName: result.openfda?.brand_name?.[0] || '未提供',
      genericName: result.openfda?.generic_name?.[0] || '未提供',
      manufacturer: result.openfda?.manufacturer_name?.[0] || '未提供',
      route: result.openfda?.route?.[0] || '未提供',
      productType: result.openfda?.product_type?.[0] || '未提供',
      purpose: result.purpose?.[0] || '暂无信息',
      indications: result.indications_and_usage?.[0] || '暂无信息',
      dosage: result.dosage_and_administration?.[0] || '暂无信息',
      warnings: result.warnings?.[0] || '暂无信息',
      doNotUse: result.do_not_use?.[0] || '暂无信息',
      whenUsing: result.when_using?.[0] || '暂无信息',
      stopUse: result.stop_use?.[0] || '暂无信息',
      storage: result.storage_and_handling?.[0] || '暂无信息',
      activeIngredient: result.active_ingredient?.[0] || '暂无信息',
      inactiveIngredient: result.inactive_ingredient?.[0] || '暂无信息'
    };
    if (item.data.dosage_and_administration?.[0]) {
      ElMessage.info('已自动填充推荐用法用量,请根据实际情况调整')
    }
  }
};

const fetchMedicineRecords = async () => {
  try {
    loading.value = true
    const response = await MedicineService.getUserMedicineRecords(userId.value, periodFilter.value)
    medicineRecords.value = response.data || []
  } catch (error) {
    ElMessage.error('获取用药记录失败')
  } finally {
    loading.value = false
  }
}

const fetchReminders = async () => {
  try {
    const response = await MedicineService.getMedicineReminders(userId.value)
    reminders.value = response.data || []
  } catch (error) {
    ElMessage.error('获取用药提醒失败')
  }
}

const deleteReminder = async (reminder) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除${reminder.medicineName}的提醒吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    await MedicineService.deleteMedicineReminder(userId.value, reminder.id);
    ElMessage.success('删除提醒成功');
    await fetchReminders(); // 刷新提醒列表
  } catch (error) {
    if (error !== 'cancel') { // 忽略取消操作的错误
      console.error('删除提醒失败:', error);
      ElMessage.error('删除提醒失败');
    }
  }
};

const refreshRecords = () => {
  fetchMedicineRecords()
  fetchReminders()
}

const showMedicineDetails = async (record) => {
  try {
    loading.value = true;
    console.log('显示药品详情, 药品名称:', record.name);

    let drugData = null;

    // 处理本地存储的药品信息
    if (record.drugInfo) {
      try {
        drugData = typeof record.drugInfo === 'string'
            ? JSON.parse(record.drugInfo)
            : record.drugInfo;

        if (drugData.results && drugData.results.length > 0) {
          drugData = drugData.results[0];
        }

        console.log('从本地存储获取的药品信息:', drugData);
      } catch (e) {
        console.warn('解析本地药品信息失败:', e);
        drugData = null;
      }
    }

    // 如果没有本地数据，尝试从 API 获取
    if (!drugData || !drugData.openfda) {
      try {
        // 先使用药品名称尝试精确搜索
        let response = await MedicineService.searchDrugLabels(record.name);

        if (!response.results?.length) {
          // 如果精确搜索失败，尝试使用更简单的搜索条件
          const simpleName = record.name.split(' ')[0]; // 只使用第一个词
          console.log('使用简化名称搜索:', simpleName);
          response = await MedicineService.searchDrugLabels(simpleName);
        }

        if (response.results?.length > 0) {
          drugData = response.results[0];
          // 更新本地存储
          await MedicineService.updateMedicineRecord(userId.value, {
            ...record,
            drugInfo: JSON.stringify(drugData)
          });
          console.log('从API获取的药品信息:', drugData);
        }
      } catch (error) {
        console.error('API 搜索失败:', error);
      }
    }

    if (drugData && drugData.openfda) {
      setSelectedMedicine(drugData);
      showDetailsDialog.value = true;
    } else {
      ElMessage({
        message: '未找到该药品的详细信息，请检查药品名称是否正确或稍后重试',
        type: 'warning',
        duration: 5000
      });
    }
  } catch (error) {
    console.error('获取药品详情失败:', error);
    ElMessage.error('获取药品详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};


const setSelectedMedicine = (data) => {
  try {
    console.log('开始处理药品数据:', data);

    // 初始化 selectedMedicine
    selectedMedicine.value = {
      name: '暂无信息',
      brandName: '暂无信息',
      genericName: '暂无信息',
      manufacturer: '暂无信息',
      route: '暂无信息',
      productType: '暂无信息',
      purpose: '暂无信息',
      indications: '暂无信息',
      dosage: '暂无信息',
      warnings: '暂无信息',
      doNotUse: '暂无信息',
      whenUsing: '暂无信息',
      stopUse: '暂无信息',
      storage: '暂无信息',
      activeIngredient: '暂无信息',
      inactiveIngredient: '暂无信息'
    };

    // 如果数据是字符串，先解析成对象
    let drugData = data;
    if (typeof data === 'string') {
      drugData = JSON.parse(data);
    }

    // 确保数据和 openfda 对象存在
    if (!drugData || !drugData.openfda) {
      console.error('无效的药品数据');
      return;
    }

    const openfda = drugData.openfda;
    console.log('openfda 数据:', openfda);

    // 更新药品信息
    selectedMedicine.value = {
      name: openfda.brand_name?.[0] || openfda.generic_name?.[0] || '暂无信息',
      brandName: openfda.brand_name?.[0] || '暂无信息',
      genericName: openfda.generic_name?.[0] || '暂无信息',
      manufacturer: openfda.manufacturer_name?.[0] || '暂无信息',
      route: openfda.route?.[0] || '暂无信息',
      productType: openfda.product_type?.[0] || '暂无信息',
      purpose: drugData.purpose?.[0] || '暂无信息',
      indications: drugData.indications_and_usage?.[0] || '暂无信息',
      dosage: drugData.dosage_and_administration?.[0] || '暂无信息',
      warnings: drugData.warnings?.[0] || '暂无信息',
      doNotUse: drugData.do_not_use?.[0] || '暂无信息',
      whenUsing: drugData.when_using?.[0] || '暂无信息',
      stopUse: drugData.stop_use?.[0] || '暂无信息',
      storage: drugData.storage_and_handling?.[0] || '暂无信息',
      activeIngredient: drugData.active_ingredient?.[0] || '暂无信息',
      inactiveIngredient: drugData.inactive_ingredient?.[0] || '暂无信息'
    };

    console.log('设置后的药品信息:', selectedMedicine.value);
  } catch (error) {
    console.error('设置药品信息时出错:', error);
    ElMessage.error('处理药品信息失败');
  }
};


const editRecord = (record) => {
  isEditing.value = true

  // 解析剂量，增加更严格的匹配
  const dosageMatch = record.dosage?.match(/^([\d.]+)\s*(.+)$/)

  // 解析频率，增加容错处理
  const frequencyMatch = record.frequency?.match(/每天(\d+)次[,，]?\s*(.+)/)

  medicineForm.value = {
    ...initMedicineForm(), // 先初始化默认值
    id: record.id,
    name: record.name,
    dosageAmount: dosageMatch ? parseFloat(dosageMatch[1]) : 1,
    dosageUnit: dosageMatch ? dosageMatch[2].trim() : '',
    frequencyTimes: frequencyMatch ? frequencyMatch[1] : '1',
    frequencyPeriod: frequencyMatch ? frequencyMatch[2].trim() : '',
    frequencyTiming: Array.isArray(record.frequencyTiming) ?
        record.frequencyTiming :
        new Array(parseInt(frequencyMatch?.[1] || 1)).fill(''),
    startDate: record.startDate || '',
    endDate: record.endDate || '',
    notes: record.notes || '',
    drugInfo: record.drugInfo || null
  }

  // 确保表单显示
  nextTick(() => {
    showAddForm.value = true
  })
}

const cancelForm = () => {
  showAddForm.value = false
  isEditing.value = false
  medicineForm.value = initMedicineForm()
}

const submitForm = async () => {
  if (!medicineFormRef.value) {
    console.warn('表单引用不存在');
    return;
  }

  if (!userId.value) {
    ElMessage.error('用户未登录');
    router.push('/login');
    return;
  }

  try {
    // 表单验证
    console.log('开始表单验证:', medicineForm.value);
    const valid = await medicineFormRef.value.validate();

    if (!valid) {
      ElMessage.warning('请填写必要信息');
      return;
    }

    // 验证剂量和频率
    if (!medicineForm.value.dosageAmount || !medicineForm.value.dosageUnit) {
      ElMessage.warning('请完整填写用药剂量');
      return;
    }

    if (!medicineForm.value.frequencyTimes || !medicineForm.value.frequencyPeriod) {
      ElMessage.warning('请完整填写服用频率');
      return;
    }

    // 验证服用时间
    const timings = medicineForm.value.frequencyTiming.filter(time => time);
    if (timings.length !== parseInt(medicineForm.value.frequencyTimes)) {
      ElMessage.warning('请填写完整的服用时间');
      return;
    }

    // 构建提交数据
    const formData = {
      id: medicineForm.value.id,
      userId: userId.value,
      name: medicineForm.value.name.trim(),
      dosage: `${medicineForm.value.dosageAmount}${medicineForm.value.dosageUnit}`,
      frequency: `每天${medicineForm.value.frequencyTimes}次,${medicineForm.value.frequencyPeriod}`,
      frequencyTiming: medicineForm.value.frequencyTiming.filter(time => time),
      startDate: medicineForm.value.startDate,
      endDate: medicineForm.value.endDate || null,
      notes: medicineForm.value.notes?.trim() || '',
      // 将 drugInfo 转换为 JSON 字符串
      drugInfo: medicineForm.value.drugInfo ? JSON.stringify(medicineForm.value.drugInfo) : null
    };

    console.log('准备提交的数据:', formData);

    // 提交数据
    const method = isEditing.value ? 'updateMedicineRecord' : 'createMedicineRecord';
    loading.value = true;
    const response = await MedicineService[method](userId.value, formData);

    if (response?.code === 200) {
      ElMessage.success(isEditing.value ? '更新成功' : '添加成功');
      showAddForm.value = false;
      await fetchMedicineRecords();
      medicineForm.value = initMedicineForm();
    } else {
      throw new Error(response?.message || '操作失败');
    }
  } catch (error) {
    console.error('表单提交错误:', error);
    if (error.response?.data) {
      console.error('错误详情:', error.response.data);
    }
    ElMessage.error(error.message || (isEditing.value ? '更新失败' : '添加失败'));
  } finally {
    loading.value = false;
  }
};

const setReminder = (medicineId) => {
  reminderForm.value.medicineId = medicineId
  showReminderForm.value = true
}

const submitReminder = async () => {
  try {
    if (!reminderForm.value.reminderTime) {
      ElMessage.warning('请选择提醒时间');
      return;
    }

    // 直接使用时间字符串，因为已经在 el-time-picker 中设置了 value-format="HH:mm:ss"
    const reminderData = {
      medicineId: reminderForm.value.medicineId,
      reminderTime: reminderForm.value.reminderTime, // 直接使用时间字符串
      repeatType: reminderForm.value.repeatType.toUpperCase(),
      isActive: true
    };

    console.log('提交提醒数据:', reminderData);

    await MedicineService.createMedicineReminder(
        userId.value,
        reminderData
    );

    ElMessage.success('设置提醒成功');
    await fetchReminders();
    showReminderForm.value = false;
    // 重置表单
    reminderForm.value = {
      medicineId: null,
      reminderTime: null,
      repeatType: 'daily',
      isActive: true
    };
  } catch (error) {
    console.error('设置提醒失败:', error);
    ElMessage.error('设置提醒失败');
  }
};

const toggleReminder = async (reminder) => {
  try {
    await MedicineService.updateReminderStatus(
        userId.value,
        reminder.id,
        reminder.isActive
    )
    ElMessage.success('更新提醒状态成功')
  } catch (error) {
    reminder.isActive = !reminder.isActive
    ElMessage.error('更新提醒状态失败')
  }
}

const searchMedicine = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入要搜索的药品名称');
    return;
  }

  try {
    loading.value = true;
    console.log('搜索药品:', searchQuery.value);

    // 先尝试精确搜索
    let response = await MedicineService.searchDrugLabels(searchQuery.value);

    // 如果没有找到结果，尝试使用更简单的搜索条件
    if (!response.results?.length) {
      const simpleQuery = searchQuery.value.split(' ')[0];
      console.log('使用简化搜索词:', simpleQuery);
      response = await MedicineService.searchDrugLabels(simpleQuery);
    }

    if (response.results?.length > 0) {
      const result = response.results[0];
      setSelectedMedicine(result);
      showDetailsDialog.value = true;
    } else {
      ElMessage({
        message: '未找到相关药品信息，请检查药品名称是否正确',
        type: 'warning',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('搜索药品失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  if (!userId.value) {
    router.push('/login')
    return
  }
  await refreshRecords()
})

// 监听剂量单位变化
watch(() => medicineForm.value.dosageUnit, (newVal) => {
  if (newVal && medicineForm.value.dosageAmount) {
    // 自动转换一些常见的单位换算
    if (newVal === 'g' && medicineForm.value.dosageAmount >= 1000) {
      medicineForm.value.dosageAmount /= 1000
    }
  }
})

// 监听服用频率变化
watch(() => medicineForm.value.frequencyTimes, (newVal) => {
  if (newVal) {
    // 重置服用时间数组
    medicineForm.value.frequencyTiming = Array(Number(newVal))
        .fill('')
        .map((_, index) => medicineForm.value.frequencyTiming[index] || '')
  }
}, { immediate: true })
</script>

<style scoped>
.dosage-form-item :deep(.el-input-number) {
  margin-right: 10px;
}

.el-time-select {
  margin-bottom: 10px;
}

:deep(.el-select) {
  margin-right: 10px;
}

/* 频率选择框样式 */
.frequency-select {
  width: 120px !important;
}

/* 时段选择框样式 */
.period-select {
  width: 120px !important;
}

/* 确保选择框内容居中对齐 */
:deep(.el-select .el-input__inner) {
  text-align: left;
  padding-left: 12px;
}

/* 单位选择框样式 */
.unit-select {
  width: 120px !important;
}

.medicine-management {
  padding: 20px;
  height: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: calc(100% - 80px);
}

.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;
}

.record-item {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.record-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.record-info .dosage {
  color: #606266;
  font-size: 14px;
  margin: 4px 0;
}

.record-info .dates {
  color: #909399;
  font-size: 12px;
  margin: 4px 0;
}

.record-info .notes {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.reminder-info {
  flex: 1;
  margin-left: 12px;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  transition: all 0.3s ease;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.record-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.1);
}

.medicine-title {
  font-size: 18px;
  color: #303133;
  margin: 0 0 12px;
  font-weight: 600;
}

.details-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

.notes-section {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 8px;
}

.notes-section p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.record-actions {
  display: flex;
  gap: 8px;
  padding: 4px;
}

.el-card.medicine-records {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  border-bottom: 1px solid #ebeef5;
  padding: 16px;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.records-list {
  padding: 16px;
}

/* 按钮样式美化 */
.record-actions .el-button {
  transition: all 0.3s ease;
}

.record-actions .el-button:hover {
  transform: scale(1.1);
}

.medicine-name {
  display: block;
  font-weight: 500;
  color: #303133;
}

.reminder-time {
  font-size: 12px;
  color: #909399;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .search-box {
    width: 100%;
    margin-bottom: 10px;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    margin-top: 8px;
  }
}

/* Element Plus 深度选择器样式覆盖 */
:deep(.el-card__header) {
  padding: 12px 16px;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-button--text) {
  padding: 0;
}

.drug-details {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.p-3 {
  padding: 12px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}

:deep(.el-descriptions__cell) {
  padding: 12px 20px;
}

:deep(.el-collapse-item__content) {
  padding: 0;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-form-item__content) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.dosage-input {
  width: 120px !important;
}

:deep(.el-form-item__error) {
  position: relative;
  top: 100%;
  left: 0;
}

.nested-form-item {
  display: flex;
  gap: 10px;
  width: 100%;
}

.time-select-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-select-item {
  width: calc(50% - 5px);
  min-width: 120px;
}

.reminder-item {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.reminder-item:hover {
  background-color: #f0f2f5;
  transform: translateY(-2px);
}

.reminder-info {
  flex: 1;
  margin-right: 12px;
}

.reminder-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 12px;
}

.reminder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.medicine-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.reminder-details {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 13px;
}

.time, .repeat-type {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reminder-switch {
  flex-shrink: 0;
}

.reminder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reminder-switch {
  margin-right: 4px;
}
</style>