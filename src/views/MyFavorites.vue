<template>
  <div class="favorites-container">
    <div class="page-header">
      <h2>我的收藏</h2>
      <el-input
          v-model="searchText"
          placeholder="搜索收藏的文章..."
          prefix-icon="Search"
          class="search-input"
          @input="handleSearch"
      />
    </div>

    <!-- 文章列表 -->
    <div class="articles-list" v-loading="loading">
      <el-empty v-if="favorites.length === 0 && !loading" description="暂无收藏的文章">
        <el-button type="primary" @click="$router.push('/forum')">去浏览文章</el-button>
      </el-empty>

      <div v-else class="article-items">
        <el-card v-for="article in favorites" :key="article.id" class="article-card">
          <div class="article-content">
            <div class="article-header">
              <h3 class="article-title" @click="viewArticle(article.id)">{{ article.title }}</h3>
              <div class="article-meta">
                <el-avatar :size="24" :src="article.author?.avatar" />
                <span class="author-name">{{ article.author?.username }}</span>
                <span class="article-time">{{ formatDate(article.createdAt) }}</span>
              </div>
            </div>

            <p class="article-excerpt">{{ article.content }}</p>

            <div class="article-footer">
              <div class="article-stats">
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

              <div class="article-actions">
                <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="unfavoriteArticle(article.id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
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

// 获取收藏文章列表
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
    )

    if (!response.ok) {
      throw new Error('获取收藏列表失败')
    }

    const data = await response.json()
    if (data.code === 200) {
      favorites.value = data.data.articles
      total.value = data.data.total
    }
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

// 取消收藏
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
    )

    if (!response.ok) {
      throw new Error('取消收藏失败')
    }

    ElMessage.success('已取消收藏')
    await fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 查看文章详情
const viewArticle = (id) => {
  router.push(`/article/detail/${id}`)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchFavorites()
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchFavorites()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchFavorites()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.search-input {
  width: 300px;
}

.articles-list {
  min-height: 400px;
}

.article-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  margin-bottom: 12px;
}

.article-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #303133;
  cursor: pointer;
}

.article-title:hover {
  color: #409EFF;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.article-excerpt {
  color: #606266;
  margin: 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  color: #909399;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .favorites-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .search-input {
    width: 100%;
  }
}
</style>