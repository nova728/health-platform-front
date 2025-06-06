<template>
  <div class="medicine-management">
    <!-- 头部横幅区域 -->
    <div class="header-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="page-title">
            💊药品管理中心
          </h1>
        </div>
        <div class="banner-actions">
          <el-button type="primary" size="large" @click="showAddForm = true" class="add-button">
            <el-icon><Plus /></el-icon>
            添加用药记录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-autocomplete-wrapper">
          <el-autocomplete
              v-model="searchQuery"
              :fetch-suggestions="searchQuerySuggestions"
              placeholder="🔍 搜索药品名称了解相关信息"
              clearable
              size="large"
              class="search-input"
              @select="handleSearchSelect"
              @keyup.enter="searchMedicine"
              :trigger-on-focus="false"
              :debounce="300"
          >
            <template #append>
              <el-button @click="searchMedicine" type="primary" class="search-btn">
                搜索
              </el-button>
            </template>
            <template #default="{ item }">
              <div class="search-suggestion-item">
                <div class="suggestion-name">{{ item.value }}</div>
                <div class="suggestion-info">{{ item.info }}</div>
              </div>
            </template>
          </el-autocomplete>
        </div>
      </div>
      <div class="filter-controls">
        <el-select v-model="periodFilter" @change="fetchMedicineRecords" class="period-filter">
          <el-option label="📅 本周" value="week" />
          <el-option label="📅 本月" value="month" />
          <el-option label="📅 全部记录" value="all" />
        </el-select>
      </div>
    </div>    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 用药记录卡片 -->
      <el-card class="medicine-records-card" shadow="hover">
        <template #header>
          <div class="card-header">            
            <div class="header-title">
              <el-icon class="header-icon"><TrendCharts /></el-icon>
              <span>用药记录</span>
              <el-badge :value="medicineRecords.length" class="record-count" />
            </div>
            <div class="header-actions">
            </div>
          </div>
        </template>

        <div class="card-body">
          <el-empty v-if="!loading && !medicineRecords.length" 
                   description="还没有用药记录，点击上方按钮添加第一条记录吧！"
                   class="custom-empty"
                   :image-size="120">
            <template #image>
              <div class="empty-image">💊</div>
            </template>
          </el-empty>

          <el-scrollbar max-height="calc(70vh - 200px)" class="records-scrollbar">
            <div class="records-grid">
              <div
                  v-for="record in medicineRecords"
                  :key="record.id"
                  class="record-card"
              >
                <div class="record-header">
                  <div class="medicine-info">
                    <h3 class="medicine-name">{{ record.name }}</h3>
                    <el-tag size="small" type="success" class="status-tag">进行中</el-tag>
                  </div>
                  <div class="record-menu">
                    <el-dropdown trigger="click">
                      <el-button type="text" class="menu-btn">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="showMedicineDetails(record)">
                            <el-icon><InfoFilled /></el-icon>
                            查看详情
                          </el-dropdown-item>
                          <el-dropdown-item @click="setReminder(record.id)">
                            <el-icon><Bell /></el-icon>
                            设置提醒
                          </el-dropdown-item>
                          <el-dropdown-item @click="editRecord(record)">
                            <el-icon><Edit /></el-icon>
                            编辑记录
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>

                <div class="record-content">
                  <div class="info-grid">                    <div class="info-item">
                      <el-icon class="info-icon"><CirclePlus /></el-icon>
                      <div class="info-text">
                        <span class="info-label">剂量</span>
                        <span class="info-value">{{ record.dosage }}</span>
                      </div>
                    </div>
                    
                    <div class="info-item">
                      <el-icon class="info-icon"><Clock /></el-icon>
                      <div class="info-text">
                        <span class="info-label">频率</span>
                        <span class="info-value">{{ record.frequency }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="record.startDate" class="date-range">
                    <el-icon class="date-icon"><Calendar /></el-icon>
                    <span class="date-text">
                      {{ record.startDate }} 
                      <span class="date-separator">至</span>
                      {{ record.endDate || '持续服用中' }}
                    </span>
                  </div>                  <div v-if="record.notes" class="notes-section">
                    <el-icon class="notes-icon"><Document /></el-icon>
                    <p class="notes-text">{{ record.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-card>      <!-- 用药提醒卡片 -->
      <el-card class="medicine-reminders-card" shadow="hover">
        <template #header>
          <div class="card-header">            <div class="header-title">
              <el-icon class="header-icon"><Bell /></el-icon>
              <span>用药提醒</span>
              <el-badge :value="reminders.filter(r => r.isActive).length" class="reminder-count" type="warning" />
            </div>
          </div>
        </template>

        <div class="card-body">
          <el-empty v-if="!reminders.length" 
                   description="暂无用药提醒，为您的药品设置提醒吧！"
                   class="custom-empty"
                   :image-size="100">
            <template #image>
              <div class="empty-image">⏰</div>
            </template>
          </el-empty>          <el-scrollbar height="calc(70vh - 200px)" class="reminders-scrollbar">
            <div class="reminders-list">
              <div
                  v-for="reminder in reminders"
                  :key="reminder.id"
                  class="reminder-card"
                  :class="{ 'reminder-active': reminder.isActive }"
              >
                <div class="reminder-status">
                  <div class="status-indicator" :class="{ 'active': reminder.isActive }"></div>
                </div>                <div class="reminder-content">                  <div class="reminder-header">
                    <div class="reminder-info">
                      <h4 class="reminder-title">{{ generateReminderTitle(reminder) }}</h4>
                    </div>
                    <el-tag 
                        size="small" 
                        :type="reminder.isActive ? 'success' : 'info'"
                        class="reminder-status-tag"
                    >
                      {{ reminder.isActive ? '已启用' : '已禁用' }}
                    </el-tag>
                  </div>
                  
                  <div class="reminder-details">
                    <div class="detail-row">
                      <el-icon class="detail-icon"><Timer /></el-icon>
                      <span class="detail-text">{{ reminder.reminderTime }}</span>
                    </div>
                    <div class="detail-row">
                      <el-icon class="detail-icon"><Refresh /></el-icon>
                      <span class="detail-text">{{ formatRepeatType(reminder.repeatType) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="reminder-actions">
                  <el-switch
                      v-model="reminder.isActive"
                      @change="toggleReminder(reminder)"
                      class="reminder-switch"
                      :active-text="reminder.isActive ? '启用' : ''"
                      :inactive-text="!reminder.isActive ? '禁用' : ''"
                  />
                  <el-button
                      type="danger"
                      size="small"
                      @click="deleteReminder(reminder)"
                      class="delete-btn"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
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
            </el-descriptions>            </el-card>
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
  Delete,
  House,
  TrendCharts,
  MoreFilled,
  CirclePlus,
  View
} from '@element-plus/icons-vue'

const formatRepeatType = (type) => {
  const types = {
    'DAILY': '每天',
    'WEEKLY': '每周',
    'MONTHLY': '每月'
  };
  return types[type] || type;
};

const generateReminderTitle = (reminder) => {
  // 尝试多种方式获取药品名称
  let medicineName = '';
  
  // 1. 从关联的medicine对象获取
  if (reminder.medicine && reminder.medicine.name) {
    medicineName = reminder.medicine.name;
  }
  // 2. 从medicineName字段获取
  else if (reminder.medicineName) {
    medicineName = reminder.medicineName;
  }
  // 3. 从medicine对象的其他可能字段获取
  else if (reminder.medicine && reminder.medicine.medicineName) {
    medicineName = reminder.medicine.medicineName;
  }
  // 4. 默认值
  else {
    medicineName = '未知药品';
  }
  
  return `${medicineName} 服药提醒`;
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

// 搜索建议功能
const searchQuerySuggestions = async (queryString, cb) => {
  if (!queryString || queryString.length < 2) {
    cb([]);
    return;
  }

  try {
    // 先从本地用药记录中搜索匹配项
    const localSuggestions = medicineRecords.value
      .filter(record => 
        record.name?.toLowerCase().includes(queryString.toLowerCase()) ||
        record.dosage?.toLowerCase().includes(queryString.toLowerCase()) ||
        record.notes?.toLowerCase().includes(queryString.toLowerCase())
      )
      .map(record => ({
        value: record.name,
        info: `${record.dosage} - ${record.frequency}`,
        type: 'local',
        data: record
      }))
      .slice(0, 3); // 限制本地建议数量

    // 如果本地建议不足，从外部API获取药品建议
    let apiSuggestions = [];
    if (localSuggestions.length < 5) {
      try {
        const response = await MedicineService.searchDrugLabels(queryString);
        apiSuggestions = response.results?.slice(0, 5 - localSuggestions.length).map(result => ({
          value: result.openfda?.brand_name?.[0] || result.openfda?.generic_name?.[0],
          info: `${result.openfda?.manufacturer_name?.[0] || '未知厂商'} - ${result.openfda?.product_type?.[0] || '药品'}`,
          type: 'api',
          data: result
        })) || [];
      } catch (error) {
        console.log('外部药品搜索暂不可用，仅显示本地建议');
      }
    }

    // 合并本地和API建议
    const allSuggestions = [...localSuggestions, ...apiSuggestions];
    cb(allSuggestions);
    
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    cb([]);
  }
};

const handleSearchSelect = (item) => {
  if (item) {
    searchQuery.value = item.value;
    // 如果选择的是本地记录，直接过滤显示
    if (item.type === 'local') {
      searchMedicine();
    }
  }
};

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
    console.error('获取用药记录失败:', error)
    ElMessage.error('获取用药记录失败')
  } finally {
    loading.value = false
  }
}

const fetchReminders = async () => {
  try {
    const response = await MedicineService.getMedicineReminders(userId.value)
    reminders.value = response.data || []
    
    // 添加调试信息，查看返回的数据结构
    console.log('获取到的提醒数据:', response.data)
    if (response.data && response.data.length > 0) {
      console.log('第一个提醒的详细信息:', response.data[0])
    }
  } catch (error) {
    console.error('获取用药提醒失败:', error)
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

    const response = await MedicineService.deleteMedicineReminder(userId.value, reminder.id);

    if (response && response.code === 200) {
      ElMessage.success('删除提醒成功');
      await fetchReminders();
    } else {
      throw new Error(response?.message || '删除提醒失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除提醒失败:', error);
      ElMessage.error(error.message || '删除提醒失败');
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
    ElMessage.error('表单初始化失败，请刷新页面重试');
    return;
  }

  if (!userId.value) {
    ElMessage.error('用户未登录');
    router.push('/login');
    return;
  }

  try {
    // 表单验证
    const valid = await medicineFormRef.value.validate().catch(error => {
      console.error('表单验证出错:', error);
      return false;
    });

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
    const timings = (medicineForm.value.frequencyTiming || []).filter(time => time && time.trim());
    const expectedTimings = parseInt(medicineForm.value.frequencyTimes || '0');

    if (timings.length !== expectedTimings) {
      ElMessage.warning(`请填写完整的服用时间（需要 ${expectedTimings} 个时间）`);
      return;
    }

    // 构建提交数据
    const formData = {
      id: medicineForm.value.id || null,
      userId: userId.value,
      name: (medicineForm.value.name || '').trim(),
      dosage: `${medicineForm.value.dosageAmount || 0}${medicineForm.value.dosageUnit || ''}`,
      frequency: `每天${medicineForm.value.frequencyTimes || 1}次,${medicineForm.value.frequencyPeriod || ''}`,
      frequencyTiming: timings,
      startDate: medicineForm.value.startDate || null,
      endDate: medicineForm.value.endDate || null,
      notes: (medicineForm.value.notes || '').trim(),
      drugInfo: medicineForm.value.drugInfo ?
          (typeof medicineForm.value.drugInfo === 'string' ?
                  medicineForm.value.drugInfo :
                  JSON.stringify(medicineForm.value.drugInfo)
          ) : null
    };

    console.log('准备提交的数据:', formData);

    loading.value = true;
    let response;

    if (isEditing.value) {
      // 修改：传递medicineId参数
      response = await MedicineService.updateMedicineRecord(userId.value, formData.id, formData);
    } else {
      response = await MedicineService.createMedicineRecord(userId.value, formData);
    }

    // 检查响应 - 修改：直接检查code
    if (response && response.code === 200) {
      ElMessage.success(isEditing.value ? '更新成功' : '添加成功');
      showAddForm.value = false;
      isEditing.value = false;
      medicineForm.value = initMedicineForm();
      await fetchMedicineRecords();
    } else {
      throw new Error(response?.message || '操作失败');
    }
  } catch (error) {
    console.error('表单提交错误:', error);

    let errorMessage = '操作失败';
    if (error.message) {
      errorMessage = error.message;
    }

    ElMessage.error(errorMessage);
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

    const reminderData = {
      medicineId: reminderForm.value.medicineId,
      reminderTime: reminderForm.value.reminderTime,
      repeatType: reminderForm.value.repeatType.toUpperCase(),
      isActive: true
    };

    console.log('提交提醒数据:', reminderData);

    const response = await MedicineService.createMedicineReminder(userId.value, reminderData);

    if (response && response.code === 200) {
      ElMessage.success('设置提醒成功');
      await fetchReminders();
      showReminderForm.value = false;
      reminderForm.value = {
        medicineId: null,
        reminderTime: null,
        repeatType: 'daily',
        isActive: true
      };
    } else {
      throw new Error(response?.message || '设置提醒失败');
    }
  } catch (error) {
    console.error('设置提醒失败:', error);
    ElMessage.error(error.message || '设置提醒失败');
  }
};


const toggleReminder = async (reminder) => {
  try {
    const response = await MedicineService.updateReminderStatus(
        userId.value,
        reminder.id,
        reminder.isActive
    )

    // 修改：检查response.code
    if (response && response.code === 200) {
      ElMessage.success('更新提醒状态成功')
    } else {
      throw new Error(response?.message || '更新提醒状态失败');
    }
  } catch (error) {
    reminder.isActive = !reminder.isActive // 回滚状态
    console.error('更新提醒状态失败:', error)
    ElMessage.error(error.message || '更新提醒状态失败')
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
/* 全局样式 */
.medicine-management {
  height: 100vh;
  background: #f9fafb;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 头部横幅 */
.header-banner {
  background: linear-gradient(135deg, #b4b5f8 0%, #c3aef4 100%);
  color: white;
  padding: 10px 10px 45px;
  position: relative;
  overflow: hidden;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-text .page-title {
  font-size: 2.5rem;
  margin: 0 0 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

.add-button {
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 25px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.add-button:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

/* 搜索区域 */
.search-section {
  max-width: 1200px;
  margin: -50px auto 40px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-container {
  flex: 1;
}

.search-input {
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: white;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 25px;
  padding: 0 20px;
  box-shadow: none;
  border: none;
}

.search-btn {
  border-radius: 0 25px 25px 0;
  padding: 0 25px;
  border: none;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.period-filter {
  width: 150px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.period-filter :deep(.el-input__wrapper) {
  border-radius: 20px;
  border: none;
  box-shadow: none;
}

.refresh-btn {
  background: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* 搜索建议样式 */
.search-autocomplete-wrapper {
  position: relative;
}

.search-suggestion-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.search-suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.suggestion-info {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

/* 自动补全下拉框样式 */
:deep(.el-autocomplete-suggestion) {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  border: none;
  margin-top: 8px;
}

:deep(.el-autocomplete-suggestion__wrap) {
  padding: 8px 0;
}

:deep(.el-autocomplete-suggestion li) {
  padding: 10px 16px;
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

:deep(.el-autocomplete-suggestion li:hover) {
  background: #f0f9ff;
  transform: translateX(2px);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: stretch;
  min-height: 0;
}

/* 卡片通用样式 */
.medicine-records-card,
.medicine-reminders-card {
  border-radius: 20px;
  border: none;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.medicine-records-card:hover,
.medicine-reminders-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 25px;
  border-bottom: 1px solid #e2e8f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.header-icon {
  font-size: 24px;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
  padding: 4px;
  border-radius: 10px;
}

.record-count,
.reminder-count {
  margin-left: auto;
}

.card-body {
  padding: 25px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 记录网格 */
.records-grid {
  display: grid;
  gap: 20px;
}

.record-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.record-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 0 2px 2px 0;
}

.record-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  border-color: #4f46e5;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.medicine-info {
  flex: 1;
}

.medicine-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.status-tag {
  border-radius: 12px;
  font-size: 12px;
  padding: 4px 12px;
}

.record-menu .menu-btn {
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.record-menu .menu-btn:hover {
  background: #f1f5f9;
  color: #4f46e5;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-icon {
  font-size: 16px;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
  padding: 6px;
  border-radius: 6px;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #f59e0b;
}

.date-icon {
  color: #d97706;
  font-size: 14px;
}

.date-text {
  font-size: 13px;
  color: #92400e;
}

.date-separator {
  margin: 0 6px;
  font-weight: 500;
}

.notes-section {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.notes-icon {
  color: #0369a1;
  font-size: 14px;
  margin-top: 2px;
}

.notes-text {
  font-size: 13px;
  color: #0c4a6e;
  margin: 0;
  line-height: 1.4;
}

/* 提醒卡片样式 */
.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reminder-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.reminder-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.reminder-card.reminder-active {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.reminder-status {
  margin-right: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.reminder-content {
  flex: 1;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.reminder-info {
  flex: 1;
}

.reminder-title {
  font-size: 13px;
  font-weight: 600;
  color: #373737;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.reminder-medicine {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.reminder-status-tag {
  border-radius: 8px;
  font-size: 11px;
}

.reminder-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-icon {
  font-size: 12px;
  color: #64748b;
}

.detail-text {
  font-size: 12px;
  color: #64748b;
}

.reminder-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.reminder-switch {
  transform: scale(0.8);
}

.delete-btn {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

/* 空状态样式 */
.custom-empty {
  padding: 40px 20px;
}

.empty-image {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

/* 滚动条样式 */
.records-scrollbar,
.reminders-scrollbar {
  flex: 1;
  min-height: 0;
}

.records-scrollbar :deep(.el-scrollbar__thumb) {
  background: rgba(79, 70, 229, 0.3);
  border-radius: 10px;
}

.reminders-scrollbar :deep(.el-scrollbar__thumb) {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 10px;
}

/* 对话框和表单样式 */
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

:deep(.el-dialog__body) {
  padding-top: 20px;
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

/* 搜索建议样式 */
.search-autocomplete-wrapper {
  position: relative;
}

.search-suggestion-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.search-suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.suggestion-info {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

/* 自动补全下拉框样式 */
:deep(.el-autocomplete-suggestion) {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  border: none;
  margin-top: 8px;
}

:deep(.el-autocomplete-suggestion__wrap) {
  padding: 8px 0;
}

:deep(.el-autocomplete-suggestion li) {
  padding: 10px 16px;
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

:deep(.el-autocomplete-suggestion li:hover) {
  background: #f0f9ff;
  transform: translateX(2px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .medicine-records-card,
  .medicine-reminders-card {
    max-height: 60vh;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .search-section {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .banner-text .page-title {
    font-size: 2rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .search-section {
    margin: -20px auto 30px;
  }
  
  .main-content {
    padding: 0 15px 30px;
  }
  
  .banner-content {
    padding: 0 15px;
  }
  
  .medicine-records-card,
  .medicine-reminders-card {
    max-height: 50vh;
  }
}

</style>