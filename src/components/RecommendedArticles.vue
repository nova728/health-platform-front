<template>
  <div class="recommended-articles">
    <h3 class="section-title">推荐阅读</h3>

    <div v-loading="loading" class="article-list">
      <div v-for="article in recommendations"
           :key="article.id"
           class="recommended-item"
           @click="viewArticle(article.id)"
      >
        <el-image
            v-if="article.coverImage"
            :src="article.coverImage"
            class="cover"
        />
        <div class="content">
          <h4 class="title">{{ article.title }}</h4>
          <p class="summary">{{ article.content }}</p>
          <div class="meta">
            <span class="author">{{ article.author?.username }}</span>
            <span class="date">{{ formatDate(article.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useForumStore } from '@/store/forumStore'
import dayjs from 'dayjs'

const router = useRouter()
const store = useForumStore()
const userStore=useStore()
const loading = ref(false)
const recommendations = ref([])

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const viewArticle = (id) => {
  router.push(`/article/${id}`)
}

const fetchRecommendations = async () => {
  try {
    loading.value = true;
    const userId = userStore.state.user?.id;

    if (!userId) {
      recommendations.value = [];
      return;
    }

    const response = await fetch(`http://localhost:8088/api/articles/list/recommended/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 200) {
      recommendations.value = data.data || [];
    } else {
      console.error('获取推荐文章失败:', data.message);
      recommendations.value = [];
    }
  } catch (error) {
    console.error('获取推荐文章失败:', error);
    recommendations.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecommendations()
})
</script>


<style scoped>
.recommended-articles {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.section-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommended-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommended-item:hover {
  background-color: #f5f7fa;
}

.cover {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.content {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
}

.summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  font-size: 12px;
  color: #999;
}

.meta > span {
  margin-right: 12px;
}
</style>