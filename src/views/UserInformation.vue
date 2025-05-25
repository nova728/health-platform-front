<template>
  <div class="page-container">
    <el-row class="main-content" :gutter="20">
      <!-- 左侧导航栏 -->
      <el-col :span="4" class="menu-col">
        <div class="menu-container">
          <div class="menu-header">
            <span class="menu-title">个人中心</span>
          </div>
          <el-menu
              default-active="1"
              class="el-menu-vertical"
              :router="true"
              @select="handleSelect"
          >
            <el-menu-item index="1" class="menu-item">
              <el-icon><UserFilled /></el-icon>
              <span>信息设置</span>
            </el-menu-item>
            <el-menu-item index="2" class="menu-item" @click="router.push({ name: 'Setting' })">
              <el-icon><Lock /></el-icon>
              <span>账号设置</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="20">
        <el-card class="user-info-card" :body-style="{ padding: '0px' }">
          <!-- 顶部背景和头像区域 -->
          <div class="profile-header">
            <div class="profile-background"></div>
            <div class="profile-info">
              <div class="avatar-container">
                <el-avatar
                    :size="100"
                    :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                    class="user-avatar"
                    @click="changeAvatar"
                />
                <div class="avatar-edit" @click="changeAvatar">
                  <el-icon><Camera /></el-icon>
                </div>
              </div>
              <h2 class="profile-name">{{ userInfo.username }}</h2>
              <p class="profile-id">ID: {{ userInfo.id }}</p>
            </div>
          </div>

          <!-- 信息内容区域 -->
          <div class="info-content">
            <div class="section-header">
              <h3 class="section-title">基本信息</h3>
              <el-button type="primary" plain @click="openEditDialog" class="edit-button">
                <el-icon><Edit /></el-icon>编辑资料
              </el-button>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">用户昵称</div>
                <div class="info-value">{{ userInfo.username }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">性别</div>
                <div class="info-value">{{ userInfo.gender ? '男' : '女' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">电话</div>
                <div class="info-value">{{ userInfo.phone || '未设置' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">邮箱</div>
                <div class="info-value">{{ userInfo.email || '未设置' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">所在城市</div>
                <div class="info-value">{{ userInfo.address || '未设置' }}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">个人简介</div>
                <div class="info-value">{{ userInfo.introduction || '未设置' }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 上传头像的弹窗 -->
    <el-dialog
        title="更改头像"
        v-model="avatarDialogVisible"
        width="400px"
        class="avatar-dialog"
    >
      <div class="upload-container">
        <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :http-request="handleCustomUpload"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
            accept="image/*"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar-preview" alt=""/>
          <div v-else class="upload-area">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">点击上传头像</div>
            <div class="upload-tip">支持 jpg、png 格式，大小不超过 2MB</div>
          </div>
        </el-upload>
        <el-button
            type="primary"
            :loading="uploadLoading"
            @click="handleAvatarUpload"
            style="margin-top: 16px"
            :disabled="!imageFile"
        >
          确认上传
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑信息的弹窗 -->
    <el-dialog
        title="编辑个人信息"
        v-model="editDialogVisible"
        width="500px"
        class="edit-dialog"
    >
      <el-form
          :model="editForm"
          label-width="100px"
          :rules="rules"
          ref="editFormRef"
          class="edit-form"
      >
        <el-form-item label="用户昵称" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="所在城市" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入所在城市" />
        </el-form-item>
        <el-form-item label="个人简介" prop="introduction">
          <el-input
              type="textarea"
              v-model="editForm.introduction"
              rows="3"
              placeholder="介绍一下你自己吧"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitLoading">
            确认更新
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { reactive, toRefs, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import store from "@/store/index.js"
import { Camera, Edit, House, Lock, Plus, UserFilled } from "@element-plus/icons-vue"

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const router=useRouter();



const state = reactive({
  avatarDialogVisible: false,
  editDialogVisible: false,
  userInfo: store.state.user || {
    username: '',
    avatar: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    introduction: ''
  },
  uploadLoading: false,
  submitLoading: false,
  imageUrl: '', // 预览图片的URL
  imageFile: null // 待上传的图片文件
})

const {
  avatarDialogVisible,
  editDialogVisible,
  userInfo,
  uploadLoading,
  submitLoading,
  imageUrl,
  imageFile
} = toRefs(state)

const editFormRef = ref(null)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 编辑表单数据
const editForm = reactive({
  username: '',
  gender: 1,
  phone: '',
  email: '',
  address: '',
  introduction: ''
})

// 打开编辑弹窗
const openEditDialog = () => {
  editForm.username = userInfo.value.username
  editForm.gender = userInfo.value.gender
  editForm.phone = userInfo.value.phone
  editForm.email = userInfo.value.email
  editForm.address = userInfo.value.address
  editForm.introduction = userInfo.value.introduction || ''
  editDialogVisible.value = true
}

// 处理头像加载错误
const handleAvatarError = () => {
  userInfo.value.avatar = defaultAvatar
}

// 处理对话框关闭
const handleDialogClose = () => {
  state.imageUrl = ''
  state.imageFile = null
  // 如果存在之前创建的 blob URL，需要释放它
  if (state.imageUrl && state.imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.imageUrl)
  }
}

// 处理头像选择改变
const handleAvatarChange = (uploadFile) => {
  const file = uploadFile.raw
  if (file) {
    // 如果之前有 blob URL，先释放它
    if (state.imageUrl && state.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.imageUrl)
    }
    state.imageFile = file
    state.imageUrl = URL.createObjectURL(file)
  }
}

// 处理头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }

  return isJPGOrPNG && isLt2M
}

// 添加自定义上传处理函数
const handleCustomUpload = async (options) => {
  // 这个函数不会被调用，因为我们设置了 auto-upload="false"
  // 实际上传在 handleAvatarUpload 中处理
}

// 修改头像上传处理函数
// 修改 handleAvatarUpload 函数
const handleAvatarUpload = async () => {
  if (!state.imageFile) {
    ElMessage.warning('请先选择图片')
    return
  }

  try {
    state.uploadLoading = true
    const formData = new FormData()
    formData.append('file', state.imageFile)

    const response = await axios.post(
        `http://localhost:8088/api/user/${userInfo.value.id}/uploadAvatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${store.state.token}`
          }
        }
    )

    // 添加调试输出
    console.log('完整响应对象:', response)
    console.log('响应数据:', response.data)
    console.log('状态码:', response.status)
    console.log('响应头:', response.headers)

    if (response.data.code === 200) {
      ElMessage.success('头像上传成功')
      console.log('头像URL:', response.data.data) // 查看具体的URL值

      const avatarUrl = response.data.data
      userInfo.value.avatar = avatarUrl
      store.commit('setUser', { ...store.state.user, avatar: avatarUrl })

      handleDialogClose()
      avatarDialogVisible.value = false
    } else {
      throw new Error(response.data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败详细信息:', error.response || error)
    ElMessage.error(error.message || '头像上传失败，请重试')
  } finally {
    state.uploadLoading = false
  }
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    submitLoading.value = true

    const response = await axios.put(`http://localhost:8088/api/user/${userInfo.value.id}/update`, editForm)

    if (response.data.code === 200) {
      Object.assign(userInfo.value, editForm)
      store.commit('setUser', { ...store.state.user, ...editForm })
      ElMessage.success('个人信息更新成功')
      editDialogVisible.value = false
    } else {
      ElMessage.error(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const changeAvatar = () => {
  avatarDialogVisible.value = true
}

const handleSelect = (key) => {
  console.log('selected:', key)
}
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 48px); /* 减去padding的高度 */
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

.user-info-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  height: 100%; /* 让卡片占满整个高度 */
  display: flex;
  flex-direction: column;
}

.profile-header {
  position: relative;
  min-height: 200px; /* 使用最小高度而不是固定高度 */
  flex-shrink: 0; /* 防止头部被压缩 */
}

.profile-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(135deg, #1890ff, #52c41a);
}

.profile-info {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-top: 25px;
}

.user-avatar {
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
}

.avatar-edit:hover {
  background: rgba(0,0,0,0.8);
}

.profile-name {
  margin: 30px 0 4px;
  color: #1a1a1a;
  font-size: 24px;
}

.profile-id {
  color: #8c8c8c;
  font-size: 14px;
}

.info-content {
  padding: 24px;
  margin-top: 60px;
  flex: 1; /* 让内容区域占据剩余空间 */
  overflow-y: auto; /* 内容过多时可以滚动 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px; /* 添加底部间距 */
}

.info-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.info-item:hover {
  background: #f0f2f5;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-value {
  color: #1a1a1a;
  font-size: 16px;
}

.upload-container {
  text-align: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.upload-area {
  padding: 40px 20px;
}

.upload-icon {
  font-size: 28px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.upload-text {
  color: #1a1a1a;
  font-size: 16px;
  margin-bottom: 4px;
}

.upload-tip {
  color: #8c8c8c;
  font-size: 12px;
}

.edit-form {
  padding: 20px 0;
}

.el-row {
  flex: 1;
  height: 100%;
}

.menu-col {
  height: 100%;
}


/* 响应式调整 */
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item.full-width {
    grid-column: span 1;
  }

  .profile-header {
    min-height: 180px;
  }
}
</style>