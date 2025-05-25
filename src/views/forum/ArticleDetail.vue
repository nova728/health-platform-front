<template>
  <div class="page-wrapper">
    <div class="article-container" ref="container">
      <div class="article-content">
        <el-card class="main-card">
          <button class="back-button" @click="router.back()">
            <ChevronLeftIcon class="icon" />
            返回
          </button>
          <!-- 文章头部 -->
          <div class="article-header">
            <h1 class="title">{{ article.title }}</h1>
            <div class="meta">
              <el-avatar
                  :size="48"
                  :src="article.author?.avatar"
                  class="author-avatar"
              />
              <div class="info">
                <span class="author">{{ article.author?.username }}</span>
                <div class="details">
                <span class="detail-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(article.createdAt) }}
                </span>
                  <span class="detail-item">
                  <el-icon><Folder /></el-icon>
                  {{ getCategoryName(article.categoryId) }}
                </span>
                  <span class="detail-item">
                  <el-icon><View /></el-icon>
                  {{ article.viewCount }} 阅读
                </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 正文内容 -->
          <div class="article-body" v-html="article.htmlContent"></div>

          <!-- 标签 -->
          <div class="tags" v-if="article.tags?.length">
            <el-tag
                v-for="tag in article.tags"
                :key="tag"
                class="custom-tag"
                effect="plain"
            >
              # {{ tag }}
            </el-tag>
          </div>

          <!-- 操作栏 -->
          <ArticleInteractionBar
              :isLiked="article.isLiked"
              :isFavorited="article.isFavorited"
              :likeCount="article.likeCount"
              :favoriteCount="article.favoriteCount"
              :commentCount="article.commentCount"
              @like="handleLike"
              @favorite="handleFavorite"
              @comment="showCommentDrawer = true"
              @share="handleShare"
          />
        </el-card>
      </div>

      <!-- 悬浮评论按钮 -->
      <div class="float-comment-btn" @click="showCommentDrawer = true">
        <el-badge :value="article.commentCount" :max="99">
          <el-button type="primary" circle>
            <el-icon><MessageSquare /></el-icon>
          </el-button>
        </el-badge>
      </div>

      <!-- 右侧评论抽屉 -->
      <el-drawer
          v-model="showCommentDrawer"
          direction="rtl"
          size="35%"
          :with-header="false"
          custom-class="comment-drawer"
          destroy-on-close
      >
        <div class="drawer-container">
          <!-- 评论抽屉头部 -->
          <div class="drawer-header">
            <h3>评论 {{ article.commentCount }}</h3>
            <el-button type="text" @click="showCommentDrawer = false">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>

          <!-- 评论列表区域 -->
          <div class="drawer-content">
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :size="40" :src="comment.user.avatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-info">
                    <span class="username">{{ comment.user.username }}</span>
                    <span class="time">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <div class="text">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <span class="reply-btn" @click="handleReplyClick(comment)">回复</span>
                  </div>

                  <!-- 回复列表 -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                      <el-avatar :size="32" :src="reply.user.avatar" class="reply-avatar" />
                      <div class="reply-content">
                        <div class="reply-info">
                          <span class="username">{{ reply.user.username }}</span>
                          <span class="time">{{ formatDate(reply.createdAt) }}</span>
                        </div>
                        <div class="text">{{ reply.content }}</div>
                        <div class="comment-actions">
                          <span class="reply-btn" @click="handleReplyClick(comment, reply)">回复</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部评论输入框 -->
          <div class="drawer-footer">
            <div class="comment-input-container">
              <div class="input-header" v-if="activeComment">
                <span>回复 {{ replyToUser ? `@${replyToUser.username}` : '评论' }}</span>
                <el-button type="text" @click="cancelReply">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-input
                  v-model="inputContent"
                  type="textarea"
                  :rows="3"
                  :placeholder="activeComment ? replyPlaceholder : '写下你的评论...'"
                  resize="none"
                  class="comment-input"
              />
              <div class="input-footer">
                <el-button
                    type="primary"
                    :disabled="!inputContent.trim()"
                    @click="activeComment ? handleSubmitReply() : handleSubmitComment()"
                >
                  {{ activeComment ? '发表回复' : '发表评论' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import ArticleInteractionBar from '@/components/ArticleInteractionBar.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useStore } from 'vuex'
import {
  Star, Calendar, Folder, View, ThumbsUp,
  Bookmark, Delete, MessageSquare,ArrowLeft,ChevronLeft as ChevronLeftIcon,
} from 'lucide-vue-next'
import '@/assets/styles/ArticleDetail_style.css';

const route = useRoute()
const router = useRouter()
const store = useStore()
const articleId = route.params.id

// 评论抽屉控制
const showCommentDrawer = ref(false)

const comments = ref([])
const inputContent = ref('')
const activeComment = ref(null)
const replyPlaceholder = ref('写下你的回复...')
const replyToUser = ref(null)

const article = ref({
  id: null,
  title: '',
  content: '',
  htmlContent: '',
  coverImage: '',
  categoryId: null,
  status: 1,
  visibility: 'public',
  allowComment: true,
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  author: {
    id: null,
    username: '',
    avatar: ''
  },
  tags: [],
  isLiked: false,
  isFavorited: false,
  createdAt: null,
  updatedAt: null,
  publishTime: null
})

const getCategoryName = (categoryId) => {
  const categoryMap = {
    1: '健康讨论',
    2: '生活分享',
    3: '问题解答',
    4: '经验交流'
  }
  return categoryMap[categoryId] || '未知分类'
}

const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制链接失败')
  }
}

const handleReplyClick = (parentComment, replyComment = null) => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  activeComment.value = parentComment
  inputContent.value = ''

  if (replyComment) {
    replyToUser.value = replyComment.user
    replyPlaceholder.value = `回复 @${replyComment.user.username}`
    inputContent.value = `@${replyComment.user.username} `
  } else {
    replyToUser.value = parentComment.user
    replyPlaceholder.value = '写下你的回复...'
  }
}

const cancelReply = () => {
  activeComment.value = null
  replyToUser.value = null
  replyPlaceholder.value = '写下你的回复...'
  inputContent.value = ''
}

// 获取文章详情
const fetchArticle = async () => {
  try {
    const userId = store.state.user?.id || 0
    const response = await fetch(`http://localhost:8088/api/articles/${userId}/${articleId}`)
    if (!response.ok) throw new Error('获取文章失败')

    const data = await response.json()
    console.log('完整响应数据:', data)

    if (data.code !== 200) {
      throw new Error(data.msg || '获取文章失败')
    }

    if (data.data) {
      article.value = {
        ...article.value,
        ...data.data,
        id: articleId
      }
      console.log('更新后的文章数据:', article.value)
      await incrementViewCount()
    } else {
      throw new Error('文章数据格式错误')
    }
  } catch (error) {
    console.error('获取文章详情错误:', error)
    ElMessage.error(error.message)
  }
}

// 增加阅读量
const incrementViewCount = async () => {
  try {
    const userId = store.state.user?.id || 0
    await fetch(`http://localhost:8088/api/articles/${userId}/${articleId}/view`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('增加阅读量失败:', error)
  }
}

// 处理点赞
const handleLike = async () => {
  if (!store.state.user.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const method = article.value.isLiked ? 'DELETE' : 'POST'
    const response = await fetch(
        `http://localhost:8088/api/articles/${articleId}/${userId}/like`,
        {
          method,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
    )

    if (!response.ok) throw new Error('操作失败')

    const data = await response.json()
    if (data.code === 200 && data.data) {
      article.value = {
        ...article.value,
        ...data.data
      }
      ElMessage.success(article.value.isLiked ? '点赞成功' : '已取消点赞')
    } else {
      throw new Error(data.msg || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error(error.message)
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!store.state.user.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const method = article.value.isFavorited ? 'DELETE' : 'POST'
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/favorite`,
        {
          method,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
    )

    if (!response.ok) throw new Error('操作失败')

    const data = await response.json()
    if (data.code === 200) {
      article.value.isFavorited = !article.value.isFavorited
      // 更新收藏数
      if (article.value.isFavorited) {
        article.value.favoriteCount = (article.value.favoriteCount || 0) + 1
      } else {
        article.value.favoriteCount = Math.max((article.value.favoriteCount || 0) - 1, 0)
      }
      ElMessage.success(article.value.isFavorited ? '收藏成功' : '已取消收藏')
    } else {
      throw new Error(data.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
// 获取评论列表
const fetchComments = async () => {
  try {
    const userId = store.state.user?.id || 0
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`
    )
    if (!response.ok) {
      throw new Error('获取评论失败')
    }
    const data = await response.json()
    if (data.code === 200 && data.data) {
      comments.value = data.data.comments
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 提交评论
const handleSubmitComment = async () => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const userId = store.state.user.id
    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ content: inputContent.value })
        }
    )

    if (!response.ok) {
      throw new Error('评论失败')
    }

    const data = await response.json()
    if (data.code === 200 && data.data) {
      const newComment = {
        id: data.data.id,
        content: data.data.content,
        createdAt: data.data.createdAt,
        user: {
          id: store.state.user.id,
          username: store.state.user.username,
          avatar: store.state.user.avatar
        },
        replies: []
      }
      comments.value.unshift(newComment)
      article.value.commentCount++
      inputContent.value = ''
      ElMessage.success('评论成功')
    } else {
      throw new Error(data.msg || '评论失败')
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 提交回复

const handleSubmitReply = async () => {
  if (!store.state.user) {
    ElMessage.warning('请先登录')
    return
  }

  if (!activeComment.value) {
    ElMessage.warning('回复对象不存在')
    return
  }

  try {
    const userId = store.state.user.id
    const requestBody = {
      content: inputContent.value,
      parentId: activeComment.value.id,
      replyToUserId: replyToUser.value?.id // 添加回复对象的用户ID
    }

    console.log('Submitting reply with data:', requestBody)

    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(requestBody)
        }
    )

    if (!response.ok) {
      throw new Error('回复失败')
    }

    const data = await response.json()
    if (data.code === 200 && data.data) {
      const newReply = {
        ...data.data,
        user: {
          id: store.state.user.id,
          username: store.state.user.username,
          avatar: store.state.user.avatar
        }
      }

      if (!activeComment.value.replies) {
        activeComment.value.replies = []
      }

      activeComment.value.replies.push(newReply)
      article.value.commentCount++
      inputContent.value = ''
      cancelReply()
      ElMessage.success('回复成功')
    } else {
      throw new Error(data.msg || '回复失败')
    }
  } catch (error) {
    console.error('Reply error:', error)
    ElMessage.error(error.message)
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  console.log('当前文章ID:', articleId)
  if (!articleId) {
    error.value = '无效的文章ID'
    return
  }
  fetchArticle()
  fetchComments()
})
</script>

<style scoped>

</style>