<script setup>
import { ThumbsUp, MessageSquare, Star, Share2 } from 'lucide-vue-next'

// 定义组件属性
const props = defineProps({
  isLiked: Boolean,
  isFavorited: Boolean,
  likeCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
})

// 定义事件
const emit = defineEmits(['like', 'favorite', 'comment', 'share'])

// 简单的事件触发函数
const handleLike = () => emit('like')
const handleFavorite = () => emit('favorite')
const handleComment = () => emit('comment')
const handleShare = () => emit('share')
</script>

<template>
  <div class="interaction-bar">
    <!-- 点赞按钮 -->
    <button
        class="interaction-btn"
        :class="{ 'is-active': isLiked }"
        @click="handleLike"
    >
      <ThumbsUp
          :size="20"
          :class="{ 'fill-current': isLiked }"
      />
      <span>{{ likeCount }}</span>
    </button>

    <!-- 收藏按钮 -->
    <button
        class="interaction-btn"
        :class="{ 'is-active': isFavorited }"
        @click="handleFavorite"
    >
      <Star
          :size="20"
          :class="{ 'fill-current': isFavorited }"
      />
      <span>{{ favoriteCount || 0 }}</span>
    </button>

    <!-- 评论按钮 -->
    <button
        class="interaction-btn"
        @click="handleComment"
    >
      <MessageSquare :size="20" />
      <span>{{ commentCount }}</span>
    </button>

    <!-- 分享按钮 -->
    <button
        class="interaction-btn"
        @click="handleShare"
    >
      <Share2 :size="20" />
      <span>分享</span>
    </button>
  </div>
</template>

<style scoped>
.interaction-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.interaction-btn:hover {
  background-color: #f3f4f6;
}

.interaction-btn span {
  font-size: 14px;
  font-weight: 500;
}

.interaction-btn.is-active {
  color: #3b82f6;
}

/* 收藏按钮激活状态使用黄色 */
.interaction-btn.is-active:has(.lucide-star) {
  color: #eab308;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .interaction-bar {
    padding: 8px 12px;
    gap: 16px;
  }

  .interaction-btn {
    padding: 6px 8px;
  }

  .interaction-btn span {
    font-size: 12px;
  }
}
</style>