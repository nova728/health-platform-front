<!-- components/HotRanking.vue -->
<template>
  <div class="hot-ranking">
    <div class="hot-ranking-header">
      <div class="left">
        <el-icon><List /></el-icon>
        <span>热榜</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <el-empty :description="error" />
    </div>

    <!-- 热榜列表 -->
    <div v-else class="hot-ranking-list">
      <div v-for="(article, index) in props.articles"
           :key="article.id"
           class="hot-ranking-item"
           @click="viewArticle(article.id)">
        <div :class="['ranking-number', {'top-three': index < 3}]">
          {{ index + 1 }}
        </div>
        <div class="content">
          <div class="title-row">
            <h3 class="title">{{ article.title }}</h3>
            <el-tag v-if="article.isHot" type="danger" size="small" class="hot-tag">热</el-tag>
          </div>
          <p class="subtitle">{{ article.content }}</p>
          <div class="heat-info">
            <div class="stats">
              <span>
                <el-icon><View /></el-icon>
                {{ article.viewCount }}
              </span>
              <span>
                <el-icon><ChatDotRound /></el-icon>
                {{ article.commentCount }}
              </span>
              <span>
                <el-icon><Star /></el-icon>
                {{ article.likeCount }}
              </span>
            </div>
            <div class="hot-score">
              热度 {{ formatNumber(article.hotScore) }}
              <el-icon class="fire-icon"><Flame /></el-icon>
            </div>
          </div>
        </div>
        <div class="image-wrapper" v-if="article.coverImage">
          <el-image
              :src="article.coverImage"
              :alt="article.title"
              fit="cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  List,
  View,
  ChatDotRound,
  Star,
} from '@element-plus/icons-vue'
import {
  Flame
} from 'lucide-vue-next'

// 接收 props
const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const router = useRouter()

// 格式化数字函数
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  console.log('hhh',num)
  return num.toString()
}

// 查看文章详情
const viewArticle = (id) => {
  router.push(`/article/detail/${id}`)
}
</script>

<style scoped>
.hot-ranking {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading-state,
.error-state {
  padding: 20px;
}

.hot-ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.hot-ranking-item {
  display: flex;
  padding: 16px;
  gap: 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.hot-ranking-item:hover {
  background-color: #f5f7fa;
}

.ranking-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
}

.ranking-number.top-three {
  background-color: #ff6b6b;
  color: white;
}

.content {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.subtitle {
  font-size: 13px;
  color: #909399;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.heat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hot-score {
  color: #ff6b6b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;  /* 添加图标和文字之间的间距 */
}

.fire-icon {
  color: #ff4500;  /* 设置火苗图标为橙红色 */
}

.image-wrapper {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.el-image {
  width: 100%;
  height: 100%;
}

.hot-tag {
  flex-shrink: 0;
}
</style>