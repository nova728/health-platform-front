<template>
  <div class="favorites-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">我的收藏</h2>
        <p class="page-subtitle">共 {{ total }} 篇文章</p>
      </div>
      <el-input
          v-model="searchText"
          placeholder="搜索收藏的文章..."
          prefix-icon="Search"
          class="search-input"
          @input="handleSearch"
          clearable
      />
    </div>

    <!-- 文章列表 -->
    <div class="articles-list" v-loading="loading">
      <el-empty
          v-if="favorites.length === 0 && !loading"
          description="暂无收藏的文章"
      >
        <el-button type="primary" @click="$router.push('/forum')">
          去浏览文章
        </el-button>
      </el-empty>

      <div v-else class="articles-scroll-container">
        <div class="article-items">
          <el-card
              v-for="article in favorites"
              :key="article.id"
              class="article-card"
              shadow="hover"
              :style="getCardStyle(article)"
          >
            <div class="article-header">
              <h3 class="article-title" @click="viewArticle(article.id)">
                {{ article.title }}
              </h3>
              <div class="article-meta">
                <el-avatar :size="24" :src="article.author?.avatar" />
                <span class="author-name">{{ article.author?.username }}</span>
                <span class="article-time">
                  {{ formatDate(article.createdAt) }}
                </span>
              </div>
            </div>

            <p class="article-excerpt">{{ article.content }}</p>

            <div class="article-tags" v-if="article.tags?.length">
              <el-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  size="small"
                  type="success"
                  effect="light"
              >
                {{ tag }}
              </el-tag>
            </div>

            <div class="article-footer">
              <div class="article-stats">
                <span><el-icon><View /></el-icon>{{ article.viewCount }}</span>
                <span><el-icon><ChatDotRound /></el-icon>{{ article.commentCount }}</span>
                <span><el-icon><Star /></el-icon>{{ article.likeCount }}</span>
              </div>
              <el-button
                  type="danger"
                  size="small"
                  plain
                  class="unfavorite-button"
                  @click="unfavoriteArticle(article.id)"
              >
                取消收藏
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, ChatDotRound, Star } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const store = useStore()
const loading = ref(false)
const favorites = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchText = ref('')

const fetchFavorites = async () => {
  if (!store.state.user?.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const response = await fetch(
        `http://localhost:8088/api/user/${store.state.user.id}/favorites?page=${currentPage.value}&size=${pageSize.value}&search=${searchText.value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
    )

    const data = await response.json()
    if (data.code === 200) {
      favorites.value = data.data.articles
      total.value = data.data.total
    }
  } catch (err) {
    ElMessage.error(err.message || '获取失败')
  } finally {
    loading.value = false
  }
}

const unfavoriteArticle = async (articleId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await fetch(
        `http://localhost:8088/api/articles/${store.state.user.id}/${articleId}/favorite`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
    )

    ElMessage.success('已取消收藏')
    await fetchFavorites()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '操作失败')
    }
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchFavorites()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchFavorites()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchFavorites()
}

const viewArticle = (id) => {
  router.push(`/article/detail/${id}`)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchFavorites()
})

  /*添加颜色*/
const getCardStyle = (article) => {
  const colors = [
    '#f6d365', '#fda085', '#84fab0', '#8fd3f4',
    '#a6c0fe', '#fbc2eb', '#fccb90', '#d4fc79',
    '#c2e9fb', '#e0c3fc', '#f093fb', '#f5576c',
    '#4facfe', '#43e97b', '#30cfd0'
  ]
  const index = article.id % colors.length
  const color = colors[index]
  const nextColor = colors[(index + 3) % colors.length]
  const isGradient = index % 2 === 0

  return {
    background: isGradient
        ? `linear-gradient(135deg, ${color}, ${nextColor})`
        : color,
    color: '#fff',
    border: 'none'
  }
}



</script>

<style scoped>
.favorites-container {
  padding: 32px;
  max-width: 1200px;
  margin: auto;
  background-color: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 24px;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
}

.search-input {
  width: 280px;
}

.articles-list {
  min-height: 300px;
}

.article-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  padding: 20px;
  border-radius: 12px;
  border: none;
  background-color: #ffffff;
}

.article-title {
  font-size: 25px;
  color: #000000;
  font-weight: bold;
  margin-bottom: 6px;
  cursor: pointer;
}

.article-title:hover {
  color: #409eff;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #000000;
  font-weight: bold;
}

.article-excerpt {
  margin: 12px 0;
  color: #000000;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  margin: 8px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.article-stats {
  display: flex;
  gap: 16px;
  color: #000000;
  font-size: 14px;
  font-weight: bold;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }

  .article-title {
    font-size: 18px;
  }
}

.unfavorite-button {
  color: #fff !important;
  background-color: rgb(30, 31, 34) !important;
  border: none !important;
  font-weight: 500;
  transition: background-color 0.2s;
}

.unfavorite-button:hover {
  background-color: rgba(255, 71, 87, 1) !important;
}

.articles-scroll-container {
  max-height: 600px; /* 可根据实际页面高度调整 */
  overflow-y: auto;
  padding-right: 8px;
}

</style>
