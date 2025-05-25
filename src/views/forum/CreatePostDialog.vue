<template>
  <el-dialog
      v-model="dialogVisible"
      title="发布新帖子"
      width="50%"
      :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="板块" prop="category">
        <el-select v-model="form.category" placeholder="选择板块">
          <el-option label="健康讨论" value="1" />
          <el-option label="生活分享" value="2" />
          <el-option label="问题解答" value="3" />
          <el-option label="经验交流" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
            v-model="form.content"
            type="textarea"
            rows="6"
            placeholder="请输入帖子内容"
        />
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">发布</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  title: '',
  category: '',
  content: '',
  images: []
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度在3到50个字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择板块', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容不能少于10个字符', trigger: 'blur' }
  ]
}

const handleImageChange = (file) => {
  form.images.push(file.raw)
}

const handleClose = () => {
  dialogVisible.value = false
  form.title = ''
  form.category = ''
  form.content = ''
  form.images = []
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现发帖逻辑
      ElMessage.success('发布成功')
      handleClose()
    }
  })
}

defineExpose({
  dialogVisible
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>