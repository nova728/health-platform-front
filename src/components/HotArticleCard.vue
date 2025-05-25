<template>
  <div v-if="!article" class="hot-article-placeholder">
    <el-empty description="暂无热门文章" />
  </div>
  <el-card v-else class="hot-article-card" :body-style="{ padding: '0' }">
    <!-- 保持原有的卡片内容结构 -->
    <div class="hot-article-content">
      <div class="hot-article-content">
        <!-- 热门标签 -->
        <div v-if="isHot" class="hot-badge">
          <el-tag type="danger" effect="dark">
            <template #icon>
              <Flame class="fire-icon" />
            </template>
            热门
          </el-tag>
        </div>

        <!-- 文章主体内容 -->
        <div class="article-body" @click="viewArticle">
          <h3 class="title">{{ article.title }}</h3>

          <!-- 文章封面 -->
          <div v-if="article.coverImage" class="cover">
            <el-image :src="article.coverImage" fit="cover" />
          </div>

          <!-- 文章摘要 -->
          <p class="summary">{{ article.content }}</p>

          <!-- 文章数据 -->
          <div class="metrics">
          <span class="metric">
            <el-icon><View /></el-icon>
            {{ article.viewCount }}
          </span>
            <span class="metric">
            <el-icon><MessageSquare /></el-icon>
            {{ article.commentCount }}
          </span>
            <span class="metric">
            <el-icon><Star /></el-icon>
            {{ article.likeCount }}
          </span>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="actions">
          <el-button-group>
            <el-button @click="handleLike" :type="article.isLiked ? 'primary' : ''">
              <el-icon><ThumbsUp /></el-icon>
            </el-button>
            <el-button @click="showShareMenu">
              <el-icon><Share2 /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 分享菜单 -->
      <el-dialog v-model="shareDialogVisible" title="分享到" width="300px">
        <div class="share-options">
          <el-button @click="shareToSocial('wechat')" class="share-btn wechat">
            微信
          </el-button>
          <el-button @click="shareToSocial('weibo')" class="share-btn weibo">
            微博
          </el-button>
        </div>
      </el-dialog>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  View,
  Star,
  MessageSquare,
  ThumbsUp,
  Share2,
  Flame
} from 'lucide-vue-next'
import { useForumStore } from '@/store/forumStore'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const store = useForumStore()
const shareDialogVisible = ref(false)

// 计算热度分数
const hotScore = computed(() => {
  return props.article.viewCount * 1 +
      props.article.likeCount * 3 +
      props.article.commentCount * 5
})

// 是否热门
const isHot = computed(() => hotScore.value > 1000)

// 查看文章
const viewArticle = () => {
  router.push(`/article/${props.article.id}`)
}

// 处理点赞
const handleLike = async () => {
  await store.handleLike(props.article)
}

// 显示分享菜单
const showShareMenu = () => {
  shareDialogVisible.value = true
}

// 社交分享
const shareToSocial = async (platform) => {
  try {
    const url = window.location.origin + `/article/${props.article.id}`
    const text = props.article.title

    switch(platform) {
      case 'wechat':
        // 实际项目中需要集成微信 SDK
        await navigator.clipboard.writeText(url)
        ElMessage.success('链接已复制，请打开微信分享')
        break
      case 'weibo':
        window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`)
        break
    }
    shareDialogVisible.value = false

    // 更新积分
    await store.awardPoints('share')
  } catch (error) {
    ElMessage.error('分享失败')
  }
}
</script>

<style scoped>
.hot-article-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.hot-article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.fire-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  color: #fff;
}

.article-body {
  padding: 16px;
  cursor: pointer;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
}

.cover {
  width: 100%;
  height: 200px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.metrics {
  display: flex;
  gap: 16px;
  color: #999;
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
}

.actions {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.share-options {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.share-btn {
  width: 100px;
}

.share-btn.wechat {
  background-color: #07c160;
  color: white;
}

.share-btn.weibo {
  background-color: #e6162d;
  color: white;
}

.hot-article-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>