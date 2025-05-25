<template>
  <div class="page-container">
    <el-row class="main-content" :gutter="20">
      <!-- 左侧导航栏 -->
      <el-col :span="4" class="menu-col">
        <div class="menu-container">
          <el-menu
              class="el-menu-vertical"
              :default-active="activeIndex"
              @select="handleSelect">
            <!-- 返回按钮 -->
            <el-menu-item index="back" @click="handleBack" class="menu-item">
              <el-icon><ArrowLeft /></el-icon>
              <span>返回个人中心</span>
            </el-menu-item>
            <el-divider />
            <el-menu-item index="1" class="menu-item">
              <el-icon><Lock /></el-icon>
              <span>账号安全</span>
            </el-menu-item>
            <el-menu-item index="2" class="menu-item">
              <el-icon><Bell /></el-icon>
              <span>消息通知</span>
            </el-menu-item>
            <el-menu-item index="3" class="menu-item">
              <el-icon><Monitor /></el-icon>
              <span>隐私设置</span>
            </el-menu-item>
            <el-menu-item index="4" class="menu-item">
              <el-icon><Setting /></el-icon>
              <span>通用设置</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="20">
        <el-card class="settings-card">
          <!-- 账号安全设置 -->
          <div v-if="activeIndex === '1'" class="settings-section">
            <div class="section-header">
              <h3>账号安全</h3>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>登录密码</h4>
                  <p class="setting-desc">定期更改密码可以让你的账号更安全</p>
                </div>
                <el-button type="primary" @click="showChangePasswordDialog">修改密码</el-button>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>手机绑定</h4>
                  <p class="setting-desc">已绑定: {{ userInfo.phone || '未绑定手机号' }}</p>
                </div>
                <el-button type="primary" @click="showPhoneBindDialog">
                  {{ userInfo.phone ? '更换手机' : '绑定手机' }}
                </el-button>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>邮箱绑定</h4>
                  <p class="setting-desc">已绑定: {{ userInfo.email || '未绑定邮箱' }}</p>
                </div>
                <el-button type="primary" @click="showEmailBindDialog">
                  {{ userInfo.email ? '更换邮箱' : '绑定邮箱' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 消息通知设置 -->
          <div v-if="activeIndex === '2'" class="settings-section">
            <div class="section-header">
              <h3>消息通知</h3>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>系统通知</h4>
                  <p class="setting-desc">接收系统更新、维护等重要通知</p>
                </div>
                <el-switch v-model="notificationSettings.system" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>运动提醒</h4>
                  <p class="setting-desc">定期提醒运动和活动</p>
                </div>
                <el-switch v-model="notificationSettings.exercise" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>饮食记录提醒</h4>
                  <p class="setting-desc">提醒记录每日饮食情况</p>
                </div>
                <el-switch v-model="notificationSettings.diet" />
              </div>
            </div>
          </div>

          <!-- 隐私设置 -->
          <div v-if="activeIndex === '3'" class="settings-section">
            <div class="section-header">
              <h3>隐私设置</h3>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>个人资料可见性</h4>
                  <p class="setting-desc">设置谁可以查看你的个人资料</p>
                </div>
                <el-select v-model="privacySettings.profile" placeholder="选择可见范围">
                  <el-option label="所有人" value="public" />
                  <el-option label="仅关注者" value="followers" />
                  <el-option label="仅自己" value="private" />
                </el-select>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>运动记录可见性</h4>
                  <p class="setting-desc">设置谁可以查看你的运动记录</p>
                </div>
                <el-select v-model="privacySettings.exercise" placeholder="选择可见范围">
                  <el-option label="所有人" value="public" />
                  <el-option label="仅关注者" value="followers" />
                  <el-option label="仅自己" value="private" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 通用设置 -->
          <div v-if="activeIndex === '4'" class="settings-section">
            <div class="section-header">
              <h3>通用设置</h3>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>语言设置</h4>
                  <p class="setting-desc">选择您偏好的语言</p>
                </div>
                <el-select v-model="generalSettings.language" placeholder="选择语言">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en" />
                </el-select>
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>主题设置</h4>
                  <p class="setting-desc">选择界面主题</p>
                </div>
                <el-select v-model="generalSettings.theme" placeholder="选择主题">
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                </el-select>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="400px"
        @close="handleDialogClose"
    >
      <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange">确认修改</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 绑定手机对话框 -->
    <el-dialog
        v-model="phoneDialogVisible"
        :title="userInfo.phone ? '更换手机' : '绑定手机'"
        width="400px"
    >
      <el-form
          :model="phoneForm"
          :rules="phoneRules"
          ref="phoneFormRef"
          label-width="100px"
      >
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="phoneForm.phone" />
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code">
            <el-input v-model="phoneForm.verificationCode" />
            <el-button
                type="primary"
                :disabled="countdown > 0"
                @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="phoneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPhoneBind">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 绑定邮箱对话框 -->
    <el-dialog
        v-model="emailDialogVisible"
        :title="userInfo.email ? '更换邮箱' : '绑定邮箱'"
        width="400px"
    >
      <el-form
          :model="emailForm"
          :rules="emailRules"
          ref="emailFormRef"
          label-width="100px"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="emailForm.email" />
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <div class="verification-code">
            <el-input v-model="emailForm.verificationCode" />
            <el-button
                type="primary"
                :disabled="emailCountdown > 0"
                @click="sendEmailVerificationCode"
            >
              {{ emailCountdown > 0 ? `${emailCountdown}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emailDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEmailBind">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Lock, Monitor, Setting, ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
const userId = store.state.user?.id

// 添加返回处理函数
const handleBack = () => {
  router.push('/editInformation')
}

// 当前选中的菜单项
const activeIndex = ref('1')

// 用户信息
const userInfo = ref(store.state.user || {})

// 各种设置的状态
const notificationSettings = reactive({
  system: true,
  exercise: true,
  diet: true
})

const privacySettings = reactive({
  profile: 'public',
  exercise: 'public'
})

const generalSettings = reactive({
  language: 'zh-CN',
  theme: 'light'
})

// 对话框的可见性状态
const passwordDialogVisible = ref(false)
const phoneDialogVisible = ref(false)
const emailDialogVisible = ref(false)

// 表单引用
const passwordFormRef = ref(null)
const phoneFormRef = ref(null)
const emailFormRef = ref(null)

// 密码表单数据和验证规则
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 手机表单数据和验证规则
const phoneForm = reactive({
  phone: '',
  verificationCode: ''
})

const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
}

// 邮箱表单数据和验证规则
const emailForm = reactive({
  email: '',
  verificationCode: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
}

// 验证码倒计时
const countdown = ref(0)
const emailCountdown = ref(0)

// 获取用户设置
const fetchUserSettings = async () => {
  try {
    const response = await axios.get(`http://localhost:8088/api/settings/${userId}`)
    if (response.data.code === 200) {
      const settings = response.data.data
      notificationSettings.system = settings.systemNotification
      notificationSettings.exercise = settings.exerciseNotification
      notificationSettings.diet = settings.dietNotification

      privacySettings.profile = settings.profileVisibility
      privacySettings.exercise = settings.exerciseVisibility

      generalSettings.language = settings.language
      generalSettings.theme = settings.theme
    }
  } catch (error) {
    ElMessage.error('获取设置失败，请重试')
  }
}

// 菜单选择处理
const handleSelect = (key) => {
  if (key === 'back') {
    handleBack()
    return
  }
  activeIndex.value = key
}

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  passwordDialogVisible.value = true
}

// 显示绑定手机对话框
const showPhoneBindDialog = () => {
  phoneDialogVisible.value = true
  phoneForm.phone = userInfo.value.phone || ''
}

// 显示绑定邮箱对话框
const showEmailBindDialog = () => {
  emailDialogVisible.value = true
  emailForm.email = userInfo.value.email || ''
}

// 发送手机验证码
const sendVerificationCode = async () => {
  try {
    if (!phoneForm.phone) {
      ElMessage.warning('请先输入手机号码')
      return
    }

    const response = await axios.post(`http://localhost:8088/api/settings/${userId}/send-phone-code`, {
      phone: phoneForm.phone
    })

    if (response.data.code === 200) {
      ElMessage.success('验证码已发送')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(response.data.message || '验证码发送失败')
    }
  } catch (error) {
    ElMessage.error('验证码发送失败，请重试')
  }
}

// 发送邮箱验证码
const sendEmailVerificationCode = async () => {
  try {
    if (!emailForm.email) {
      ElMessage.warning('请先输入邮箱地址')
      return
    }

    const response = await axios.post(`http://localhost:8088/api/settings/${userId}/send-email-code`, {
      email: emailForm.email
    })

    if (response.data.code === 200) {
      ElMessage.success('验证码已发送')
      emailCountdown.value = 60
      const timer = setInterval(() => {
        emailCountdown.value--
        if (emailCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(response.data.message || '验证码发送失败')
    }
  } catch (error) {
    ElMessage.error('验证码发送失败，请重试')
  }
}

// 提交密码修改
const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    const response = await axios.post(`http://localhost:8088/api/settings/${userId}/password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.data.code === 200) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      // 重置表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }
  } catch (error) {
    ElMessage.error('密码修改失败，请重试')
  }
}

// 提交手机绑定
const submitPhoneBind = async () => {
  if (!phoneFormRef.value) return

  try {
    await phoneFormRef.value.validate()
    const response = await axios.post(`http://localhost:8088/api/settings/${userId}/phone`, {
      phone: phoneForm.phone,
      verificationCode: phoneForm.verificationCode
    })

    if (response.data.code === 200) {
      ElMessage.success('手机号更新成功')
      phoneDialogVisible.value = false
      store.commit('setUser', { ...store.state.user, phone: phoneForm.phone })
      userInfo.value.phone = phoneForm.phone
      // 重置表单
      phoneForm.verificationCode = ''
    } else {
      ElMessage.error(response.data.message || '手机号更新失败')
    }
  } catch (error) {
    ElMessage.error('手机号更新失败，请重试')
  }
}

// 提交邮箱绑定
const submitEmailBind = async () => {
  if (!emailFormRef.value) return

  try {
    await emailFormRef.value.validate()
    const response = await axios.post(`http://localhost:8088/api/settings/${userId}/email`, {
      email: emailForm.email,
      verificationCode: emailForm.verificationCode
    })

    if (response.data.code === 200) {
      ElMessage.success('邮箱更新成功')
      emailDialogVisible.value = false
      store.commit('setUser', { ...store.state.user, email: emailForm.email })
      userInfo.value.email = emailForm.email
      // 重置表单
      emailForm.verificationCode = ''
    } else {
      ElMessage.error(response.data.message || '邮箱更新失败')
    }
  } catch (error) {
    ElMessage.error('邮箱更新失败，请重试')
  }
}

// 监听对话框关闭
const handleDialogClose = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 监听设置变更并保存
watch(notificationSettings, async (newSettings) => {
  try {
    const response = await axios.put(`http://localhost:8088/api/settings/${userId}/notifications`, {
      systemNotification: newSettings.system,
      exerciseNotification: newSettings.exercise,
      dietNotification: newSettings.diet
    })

    if (response.data.code !== 200) {
      ElMessage.error('通知设置保存失败')
    }
  } catch (error) {
    ElMessage.error('保存设置失败，请重试')
  }
}, { deep: true })

watch(privacySettings, async (newSettings) => {
  try {
    const response = await axios.put(`http://localhost:8088/api/settings/${userId}/privacy`, {
      profileVisibility: newSettings.profile,
      exerciseVisibility: newSettings.exercise
    })

    if (response.data.code !== 200) {
      ElMessage.error('隐私设置保存失败')
    }
  } catch (error) {
    ElMessage.error('保存设置失败，请重试')
  }
}, { deep: true })

watch(generalSettings, async (newSettings) => {
  try {
    const response = await axios.put(`http://localhost:8088/api/settings/${userId}/general`, {
      language: newSettings.language,
      theme: newSettings.theme
    })

    if (response.data.code !== 200) {
      ElMessage.error('通用设置保存失败')
    }
  } catch (error) {
    ElMessage.error('保存设置失败，请重试')
  }
}, { deep: true })

// 初始化时获取设置
onMounted(() => {
  fetchUserSettings()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 48px);
  background-color: #f5f7fa;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.main-content {
  margin: 0 auto;
  flex: 1;
  display: flex;
  width: 100%;
}

.menu-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  margin: 4px 8px;
  border-radius: 6px;
}

.menu-item .el-icon {
  margin-right: 12px;
}

.settings-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  height: 100%;
}

.settings-section {
  padding: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.setting-item:hover {
  background: #f0f2f5;
}

.setting-info {
  flex: 1;
  margin-right: 16px;
}

.setting-info h4 {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.setting-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.verification-code {
  display: flex;
  gap: 12px;
}

.verification-code .el-input {
  flex: 1;
}

.verification-code .el-button {
  width: 120px;
}

:deep(.el-select) {
  width: 160px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .main-content {
    flex-direction: column;
  }

  .menu-col {
    height: auto;
    margin-bottom: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .setting-item > .el-button,
  .setting-item > .el-select {
    width: 100%;
  }

  .verification-code {
    width: 100%;
    flex-direction: column;
  }

  .verification-code .el-button {
    width: 100%;
  }
}

/* 新增返回按钮样式 */
.menu-item.back-button {
  margin-bottom: 8px;
}

.el-divider {
  margin: 8px 0;
}
</style>