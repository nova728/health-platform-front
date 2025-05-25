<template>
  <div class="article-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="left-tools">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button v-if="articleId" type="text" class="preview-link" @click="previewArticle">
          <Eye class="icon" />
          预览文章
        </el-button>
      </div>
      <div class="center-tools">
        <span class="save-status" :class="{ 'saving': isSaving }">
          {{ saveStatus }}
        </span>
      </div>
      <div class="right-tools">
        <el-button @click="saveDraft" :loading="isSaving">
          <Save class="icon" />
          保存草稿
        </el-button>
        <el-button type="primary" @click="showPublishDialog">
          <Send class="icon" />
          发布文章
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 - 使用 flex 容器包装编辑器和侧边栏 -->
    <div class="editor-container">
      <!-- 左侧主编辑区域 -->
      <div class="editor-main">
        <!-- 标题输入 -->
        <el-input
            v-model="articleForm.title"
            placeholder="请输入标题（最多100个字）"
            class="title-input"
            maxlength="100"
            show-word-limit
        />

        <!-- 内容编辑器 -->
        <div class="editor-wrapper">
          <!-- 工具栏 -->
          <div class="editor-toolbar">
            <el-button-group>
              <el-button @click="handleFormat('bold')" :class="{ active: isFormatActive('bold') }">
                <el-icon><BoldIcon /></el-icon>
              </el-button>
              <el-button @click="handleFormat('italic')" :class="{ active: isFormatActive('italic') }">
                <el-icon><ItalicIcon /></el-icon>
              </el-button>
              <el-button @click="handleFormat('underline')" :class="{ active: isFormatActive('underline') }">
                <UnderlineIcon class="icon" />
              </el-button>
            </el-button-group>

            <el-divider direction="vertical" />

            <el-button-group>
              <el-button @click="insertHeading('h1')">H1</el-button>
              <el-button @click="insertHeading('h2')">H2</el-button>
              <el-button @click="insertHeading('h3')">H3</el-button>
            </el-button-group>

            <el-divider direction="vertical" />

            <el-button @click="insertImage">
              <ImageIcon class="icon" />
              插入图片
            </el-button>

            <el-button @click="insertLink">
              <Link2 class="icon" />
              插入链接
            </el-button>

            <el-button @click="insertCode">
              <FileCode class="icon" />
              插入代码
            </el-button>

            <el-button @click="insertTable">
              <Table2 class="icon" />
              插入表格
            </el-button>
          </div>

          <!-- 编辑器主体 -->
          <div class="editor-content" ref="editorRef"></div>
        </div>
      </div>

      <!-- 右侧设置面板 -->
      <div class="editor-sidebar">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>文章设置</span>
            </div>
          </template>

          <el-form :model="articleForm" label-width="80px">
            <el-form-item label="分类">
              <el-select v-model="articleForm.categoryId" placeholder="选择分类">
                <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="标签">
              <el-tag
                  v-for="tag in articleForm.tags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                  class="tag-item"
              >
                {{ tag }}
              </el-tag>

              <el-input
                  v-if="inputTagVisible"
                  ref="tagInputRef"
                  v-model="inputTag"
                  class="tag-input"
                  size="small"
                  @keyup.enter="confirmTag"
                  @blur="confirmTag"
              />

              <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
                + 添加标签
              </el-button>
            </el-form-item>

            <el-form-item label="封面图">
              <el-upload
                  class="cover-uploader"
                  :show-file-list="false"
                  :before-upload="beforeCoverUpload"
                  :http-request="uploadCover"
              >
                <img v-if="articleForm.coverImage" :src="articleForm.coverImage" class="cover-image">
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>

    <!-- 发布对话框 -->
    <el-dialog
        v-model="publishDialogVisible"
        title="发布文章"
        width="500px"
    >
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="发布时间">
          <el-radio-group v-model="publishForm.timeType">
            <el-radio :value="'now'">立即发布</el-radio>
            <el-radio :value="'schedule'">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="publishForm.timeType === 'schedule'" label="预计发布时间">
          <el-date-picker
              v-model="publishForm.scheduleTime"
              type="datetime"
              placeholder="选择日期时间"
              :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="文章可见性">
          <el-radio-group v-model="publishForm.visibility">
            <el-radio :value="'public'">公开</el-radio>
            <el-radio :value="'private'">私密</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="评论设置">
          <el-switch
              v-model="publishForm.allowComment"
              active-text="允许评论"
              inactive-text="禁止评论"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="publishArticle" :loading="isPublishing">
            确认发布
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片上传对话框 -->
    <el-dialog
        v-model="imageDialogVisible"
        title="插入图片"
        width="500px"
    >
      <el-tabs v-model="imageTabActive">
        <el-tab-pane label="本地上传" name="upload">
          <el-upload
              class="image-uploader"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :http-request="uploadImage"
              drag
          >
            <Upload class="icon" />
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="外链图片" name="url">
          <el-input
              v-model="imageUrl"
              placeholder="请输入图片链接"
          />
          <div class="dialog-footer">
            <el-button @click="insertImageUrl">确定</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 链接插入对话框 -->
    <el-dialog
        v-model="linkDialogVisible"
        title="插入链接"
        width="500px"
    >
      <el-form :model="linkForm" label-width="80px">
        <el-form-item label="链接文本">
          <el-input v-model="linkForm.text" placeholder="请输入链接显示的文本"/>
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="linkForm.url" placeholder="请输入链接地址"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="linkDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmInsertLink">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount,nextTick ,watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {useStore} from 'vuex'
import { debounce } from 'lodash'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Eye,
  Bold as BoldIcon,        // 添加 Icon 后缀作为别名
  Italic as ItalicIcon,    // 添加 Icon 后缀作为别名
  Underline as UnderlineIcon,  // 添加 Icon 后缀作为别名
  Image as ImageIcon,
  Link2,
  FileCode,
  Table2,
  Plus,
  Upload,
  Save,
  Send
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useStore()
const articleId = ref(route.params.id)


// API Methods
const BASE_URL = 'http://localhost:8088/api/articles';
const FORMAT_URL = 'http://localhost:8088/api/articles/format';

// 编辑器状态
const editorRef = ref(null)
const editor = ref(null)
const isSaving = ref(false)
const isPublishing = ref(false)
const saveStatus = ref('所有更改已保存')

// 文章表单数据
const articleForm = reactive({
  title: '',
  content: '',
  htmlContent: '',
  coverImage: '',
  categoryId: null,
  status: 0,           // 新增
  visibility: 'public', // 新增
  allowComment: true,   // 新增
  tags: [],
  publishTime: null    // 新增
})

// 发布对话框
const publishDialogVisible = ref(false)
const publishForm = reactive({
  timeType: 'now',
  scheduleTime: null,
  visibility: 'public',
  allowComment: true
})

// 标签输入
const inputTagVisible = ref(false)
const inputTag = ref('')
const tagInputRef = ref(null)

// 图片上传对话框
const imageDialogVisible = ref(false)
const imageTabActive = ref('upload')
const imageUrl = ref('')

// 链接对话框
const linkDialogVisible = ref(false)
const linkForm = reactive({
  text: '',
  url: ''
})

// 分类数据
const categories = ref([
  { id: 1, name: '健康讨论' },
  { id: 2, name: '生活分享' },
  { id: 3, name: '问题解答' },
  { id: 4, name: '经验交流' }
])

// 初始化编辑器
onMounted(() => {
  nextTick(async () => {
    try {
      if (!editorRef.value) {
        console.error('编辑器 DOM 元素未找到');
        return;
      }

      console.log('开始初始化编辑器...');
      editor.value = new Editor({
        element: editorRef.value,
        extensions: [
          StarterKit.configure({
            // 禁用 StarterKit 中的这些功能，因为我们将单独配置
            bold: false,
            italic: false,
          }),
          Bold,        // 单独添加 Bold 扩展
          Italic,      // 单独添加 Italic 扩展
          Underline,   // 单独添加 Underline 扩展
          Image,
          Link.configure({
            openOnClick: false
          }),
          Table.configure({
            resizable: true
          }),
          TableRow,
          TableCell,
          TableHeader
        ],
        content: '',
        onUpdate: ({ editor }) => {
          onEditorUpdate();
          articleForm.content = editor.getText();
          articleForm.htmlContent = editor.getHTML();
          Promise.resolve().then(() => autoSave());
        }
      });

      console.log('编辑器初始化完成');

      // 如果有文章ID，加载文章内容
      if (articleId.value) {
        await loadArticle();
      }
    } catch (error) {
      console.error('编辑器初始化失败:', error);
      ElMessage.error('编辑器初始化失败，请刷新页面重试');
    }
  });
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 编辑器功能方法
const handleFormat = (type) => {
  try {
    if (!editor.value) {
      console.error('编辑器未初始化');
      ElMessage.error('编辑器未初始化，请刷新页面重试');
      return;
    }

    // 使用正确的命令名称映射
    const commandMap = {
      'bold': 'toggleBold',
      'italic': 'toggleItalic',
      'underline': 'toggleUnderline'
    };

    const commandName = commandMap[type];

    if (!editor.value.commands[commandName]) {
      console.error(`命令 ${commandName} 不可用`);
      return;
    }

    // 使用正确的命令调用方式
    editor.value.chain().focus()[commandName]().run();

  } catch (error) {
    console.error('格式化操作失败:', error);
    ElMessage.error('格式化失败，请重试');
  }
};

const insertHeading = async (level) => {
  try {
    if (!editor.value) {
      console.warn('编辑器未初始化');
      return;
    }

    const { from, to } = editor.value.state.selection;
    const text = editor.value.state.doc.textBetween(from, to);

    if (!text.trim()) {
      if (editor.value.commands && editor.value.commands.toggleHeading) {
        editor.value.commands.toggleHeading({ level: parseInt(level.substr(1)) });
      }
      return;
    }

    const response = await updateHeadingFormat(level, text, from, to);
    if (response.code === 200) {
      // 更新编辑器内容
      if (editor.value.commands && editor.value.commands.setContent) {
        editor.value.commands.setContent(response.result.htmlContent);
      }
      // 更新表单内容
      articleForm.content = response.result.content;
      articleForm.htmlContent = response.result.htmlContent;
    }
  } catch (error) {
    console.error('标题格式化失败:', error);
    ElMessage.error(error.message || '标题格式化失败');
    // 失败时回退到默认行为
    if (editor.value?.commands && editor.value.commands.toggleHeading) {
      editor.value.commands.toggleHeading({ level: parseInt(level.substr(1)) });
    }
  }
};

const isFormatActive = (type) => {
  if (!editor.value || !editor.value.isActive) return false;

  // 使用相同的命令名称映射
  const commandMap = {
    'bold': 'bold',       // isActive 使用简单类型名称
    'italic': 'italic',
    'underline': 'underline'
  };

  try {
    return editor.value.isActive(commandMap[type]);
  } catch (error) {
    console.error(`检查格式 ${type} 状态失败:`, error);
    return false;
  }
};

const insertImage = () => {
  imageDialogVisible.value = true
}

const insertLink = () => {
  linkDialogVisible.value = true
}

const insertCode = () => {
  if (editor.value?.commands?.toggleCodeBlock) {
    editor.value.commands.toggleCodeBlock();
  }
}
const insertTable = () => {
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// 标签相关方法
const showTagInput = () => {
  inputTagVisible.value = true
  nextTick(() => {
    tagInputRef.value.input.focus()
  })
}

const confirmTag = () => {
  if (inputTag.value) {
    if (!articleForm.tags.includes(inputTag.value)) {
      articleForm.tags.push(inputTag.value)
    }
  }
  inputTagVisible.value = false
  inputTag.value = ''
}

const removeTag = (tag) => {
  articleForm.tags = articleForm.tags.filter(t => t !== tag)
}


// 图片上传相关方法
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const insertImageUrl = () => {
  if (imageUrl.value) {
    editor.value.chain().focus().setImage({ src: imageUrl.value }).run()
    imageUrl.value = ''
    imageDialogVisible.value = false
  }
}

// 封面图片上传
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 链接插入方法
const confirmInsertLink = () => {
  if (linkForm.url) {
    editor.value
        .chain()
        .focus()
        .setLink({ href: linkForm.url, target: '_blank' })
        .run()

    linkDialogVisible.value = false
    linkForm.text = ''
    linkForm.url = ''
  }
}

// 自动保存方法
const autoSave = debounce(async () => {
  if (!articleForm.title?.trim()) return;

  try {
    // 更改保存状态
    isSaving.value = true;
    saveStatus.value = '正在保存...';

    const userId = store.state.user.id;
    if (!userId) {
      throw new Error('请先登录');
    }

    // 构造请求数据
    const articleData = {
      title: articleForm.title,
      content: editor.value.getText() || '',
      htmlContent: editor.value.getHTML() || '',
      categoryId: articleForm.categoryId || 1,
      status: 0,
      visibility: articleForm.visibility || 'public',
      allowComment: articleForm.allowComment ?? true,
      tags: Array.isArray(articleForm.tags) ? articleForm.tags : [],
      coverImage: articleForm.coverImage || '',
      publishTime: articleForm.publishTime || null
    };

    let response;
    // 如果已有文章ID，则更新文章
    if (articleId.value) {
      response = await fetch(`${BASE_URL}/${userId}/${articleId.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(articleData)
      });
    } else {
      // 首次保存，创建新文章
      response = await fetch(`${BASE_URL}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(articleData)
      });
    }

    const responseData = await response.json();
    console.log('Save response:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || '保存失败');
    }

    // 如果是首次保存，设置文章ID并更新路由
    if (!articleId.value && responseData.data?.id) {
      articleId.value = responseData.data.id;
      // 使用 replace 而不是 push，这样不会创建新的历史记录
      await router.replace(`/editor/${responseData.data.id}`);
    }

    // 保存成功
    const now = new Date().toLocaleTimeString();
    saveStatus.value = '已保存 ' + now;
    setTimeout(() => {
      saveStatus.value = '所有更改已保存';
    }, 3000);

  } catch (error) {
    console.error('自动保存失败:', error);
    saveStatus.value = '保存失败 ' + error.message;
    ElMessage.error(error.message || '保存失败');
  } finally {
    isSaving.value = false;
  }
}, 3000);

// 监听编辑器内容变化
const onEditorUpdate = () => {
  if (editor.value) {
    articleForm.content = editor.value.getText();
    articleForm.htmlContent = editor.value.getHTML();
    saveStatus.value = '正在编辑...';
    autoSave();
  }
};

const publishArticle = async () => {
  try {
    if (!validateArticleForm()) return;

    isPublishing.value = true;
    const userId = store.state.user.id;

    if (!userId) {
      throw new Error('请先登录');
    }

    // 构造文章数据
    const articleData = {
      title: articleForm.title,
      content: editor.value.getText(),
      htmlContent: editor.value.getHTML(),
      coverImage: articleForm.coverImage || '',
      categoryId: articleForm.categoryId,
      status: 1, // 发布状态
      visibility: publishForm.visibility,
      allowComment: publishForm.allowComment,
      publishTime: publishForm.timeType === 'schedule' ?
          publishForm.scheduleTime?.toISOString() :
          new Date().toISOString(),
      tags: Array.from(articleForm.tags || [])
    };

    // 直接发布新文章或更新现有文章
    let response;
    if (articleId.value) {
      response = await updateArticle(articleData, userId);
    } else {
      response = await createArticle(articleData, userId);
    }

    if (response.code === 200) {
      ElMessage.success('文章发布成功');
      publishDialogVisible.value = false;

      // 发布成功后直接跳转
      if (response.data?.id) {
        await router.push(`/article/${response.data.id}`);
      } else if (articleId.value) {
        await router.push(`/article/${articleId.value}`);
      } else {
        await router.push('/forum');
      }
    } else {
      throw new Error(response.msg || '发布失败');
    }
  } catch (error) {
    console.error('发布文章失败:', error);
    ElMessage.error(error.message || '文章发布失败');
  } finally {
    isPublishing.value = false;
  }
};

// 保存草稿
const validateArticleForm = () => {
  if (!articleForm.title?.trim()) {
    ElMessage.warning('请填写文章标题');
    return false;
  }
  if (!articleForm.content?.trim()) {
    ElMessage.warning('请填写文章内容');
    return false;
  }
  if (!articleForm.categoryId) {
    ElMessage.warning('请选择文章分类');
    return false;
  }
  return true;
};

const showPublishDialog = () => {
  if (!articleForm.title || !articleForm.content) {
    ElMessage.warning('请填写文章标题和内容')
    return
  }
  publishDialogVisible.value = true
}

// 更新文本格式（加粗、斜体、下划线）
const updateTextFormat = async (type, content, startPos, endPos) => {
  const userId = store.state.user.id;
  if (!userId || !articleId.value) return;

  const response = await fetch(`${FORMAT_URL}/${userId}/${articleId.value}/style`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      type,
      content,
      startPos,
      endPos
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '更新格式失败');
  }
  return data;
};

// 更新标题格式
const updateHeadingFormat = async (level, content, startPos, endPos) => {
  const userId = store.state.user.id;
  if (!userId || !articleId.value) return;

  const response = await fetch(`${FORMAT_URL}/${userId}/${articleId.value}/heading`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      level,
      content,
      startPos,
      endPos
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '更新标题格式失败');
  }
  return data;
};

// 创建文章
const createArticle = async (articleData, userId) => {
  const response = await fetch(`${BASE_URL}/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(articleData)
  });

  const data = await response.json();
  console.log('data:',data)
  if (!response.ok) {
    throw new Error(data.message || '创建文章失败');
  }
  return data;
};

// 更新文章
const updateArticle = async (articleData, userId) => {
  const response = await fetch(`${BASE_URL}/${userId}/${articleId.value}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(articleData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '更新文章失败');
  }
  return data;
};

// 加载文章
const loadArticle = async () => {
  try {
    const userId = store.state.user.id;
    if (!userId || !articleId.value) {
      throw new Error('缺少用户ID或文章ID');
    }

    const response = await fetch(`${BASE_URL}/${userId}/${articleId.value}`, {
      credentials: 'include'
    });

    const responseData = await response.json();
    console.log('Article data:', responseData); // 添加日志以检查返回数据

    if (!response.ok) {
      throw new Error(responseData.message || '加载文章失败');
    }

    // 检查数据结构
    const articleData = responseData.data || responseData.result;
    if (!articleData) {
      throw new Error('返回的文章数据格式不正确');
    }

    // 使用可选链和默认值来安全地更新表单数据
    articleForm.title = articleData.title || '';
    articleForm.content = articleData.content || '';
    articleForm.categoryId = articleData.categoryId || categories.value[0]?.id;
    articleForm.tags = Array.isArray(articleData.tags) ? articleData.tags : [];
    articleForm.coverImage = articleData.coverImage || '';
    articleForm.visibility = articleData.visibility || 'public';
    articleForm.allowComment = articleData.allowComment ?? true;

    // 确保编辑器已初始化
    if (editor.value && articleData.htmlContent) {
      editor.value.commands.setContent(articleData.htmlContent);
    } else if (editor.value) {
      editor.value.commands.setContent(articleData.content || '');
    }

    // 更新状态
    saveStatus.value = '文章已加载';
  } catch (error) {
    console.error('加载文章失败:', error);
    ElMessage.error(error.message || '加载文章失败');

    // 可选：在加载失败时重定向到列表页面
    router.push('/my-articles');
  }
};

// 通用的图片上传方法
const uploadImageToServer = async (file) => {
  const userId = store.state.user.id;
  if (!userId) {
    throw new Error('请先登录');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/${userId}/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  const data = await response.json();
  console.log('Upload response data:', data);

  if (!response.ok) {
    throw new Error(data.message || '上传失败');
  }

  // 检查响应数据
  if (!data.data || !data.data.url) {
    console.error('Invalid response data:', data);
    throw new Error('返回的URL格式不正确');
  }

  return data.data.url;  // 返回正确的URL
};

// 上传封面图片
const uploadCover = async ({ file }) => {
  try {
    const url = await uploadImageToServer(file);
    articleForm.coverImage = url;
    ElMessage.success('封面上传成功');
  } catch (error) {
    console.error('封面上传失败:', error);
    ElMessage.error(error.message || '封面上传失败');
  }
};

// 上传内容图片
const uploadImage = async ({ file }) => {
  try {
    const url = await uploadImageToServer(file);
    editor.value.chain().focus().setImage({ src: url }).run();
    imageDialogVisible.value = false;
    ElMessage.success('图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    ElMessage.error(error.message || '图片上传失败');
  }
};

// 保存草稿
const saveDraft = async () => {
  try {
    if (!validateArticleForm()) {
      return;
    }

    isSaving.value = true;
    articleForm.status = 0; // 草稿状态

    const userId = store.state.user.id
    if (!userId) {
      throw new Error('请先登录');
    }

    const articleData = {
      ...articleForm,
      content: editor.value.getText(),
      htmlContent: editor.value.getHTML()
    };

    let response;
    if (articleId.value) {
      response = await updateArticle(articleData, userId);
    } else {
      response = await createArticle(articleData, userId);
    }

    // 检查响应数据结构
    if (response && response.code === 200 && response.data) {
      const savedArticle = response.data;
      if (savedArticle.id) {
        articleId.value = savedArticle.id;
        router.replace(`/forum`);
        ElMessage.success('草稿保存成功');
        return savedArticle;
      }
    }

    throw new Error('保存草稿失败：服务器响应异常');

  } catch (error) {
    console.error('保存草稿失败:', error);
    ElMessage.error(error.message || '保存失败');
    throw error;
  } finally {
    isSaving.value = false;
  }
};

// 离开页面提示
const handleBeforeUnload = (e) => {
  if (isSaving.value) {
    e.preventDefault()
    e.returnValue = '文章正在保存，确定要离开吗？'
  }
}

// 导航方法
const goBack = () => {
  if (isSaving.value) {
    ElMessageBox.confirm(
        '文章正在保存，确定要离开吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}

const previewArticle = () => {
  window.open(`/article/${articleId.value}/preview`, '_blank')
}

watch(() => articleForm.title, () => {
  if (articleForm.title?.trim()) {
    saveStatus.value = '正在编辑...';
    autoSave();
  }
});
</script>

<style scoped>
.article-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden; /* 防止内容溢出 */
}

.editor-main {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 100;
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
  height: calc(100vh - 65px); /* 减去头部高度 */
}

.left-tools, .right-tools {
  display: flex;
  gap: 12px;
  align-items: center;
}

.preview-link {
  color: #409eff;
}

.save-status {
  color: #909399;
  font-size: 14px;
}

.save-status.saving {
  color: #e6a23c;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.editor-main {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  height: 48px;
  padding: 0 20px;
}

.editor-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 500px;
}


.editor-toolbar {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 500px;
}

/* TipTap 编辑器样式 */
.editor-content :deep(.ProseMirror) {
  > * + * {
    margin-top: 0.75em;
  }

  /* 移除默认焦点边框 */
  &:focus {
    outline: none;
  }

  /* 自定义选择区域样式 */
  ::selection {
    background: rgba(64, 158, 255, 0.1);
    color: inherit;
  }

  /* 基础文本样式 */
  p {
    margin: 1em 0;
  }

  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.1;
    font-weight: 600;
    margin: 1.5em 0 0.5em;
  }

  /* 列表样式 */
  ul, ol {
    padding: 0 1rem;
  }

  /* 代码块样式 */
  code {
    background-color: rgba(97, 97, 97, 0.1);
    color: #616161;
    padding: 0.25em;
    border-radius: 0.25em;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
    }
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
  }

  /* 引用样式 */
  blockquote {
    padding-left: 1rem;
    border-left: 3px solid #999;
    color: #666;
  }

  /* 表格样式 */
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td, th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      background-color: #f8f9fa;
    }
  }
}

.editor-sidebar {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}

.settings-card {
  position: sticky;
  top: 0;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409EFF;
}

.cover-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.tag-input {
  width: 90px;
  margin-right: 8px;
  vertical-align: bottom;
}

.image-uploader {
  text-align: center;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
}

/* 编辑器工具栏按钮样式 */
.editor-toolbar .el-button {
  padding: 8px 12px;
}

.editor-toolbar .el-button.active {
  color: #409EFF;
  background-color: #ecf5ff;
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
}

.editor-toolbar .icon {
  margin-right: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-placeholder .icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #909399;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}
@media screen and (max-width: 1200px) {
  .editor-container {
    flex-direction: column;
    height: auto;
    overflow-y: visible;
  }

  .editor-sidebar {
    width: 100%;
    height: auto;
  }

  .settings-card {
    position: relative;
    margin-bottom: 20px;
  }
}
</style>