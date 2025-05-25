<template>
  <div class="my-articles">
    <el-tabs v-model="activeTab" class="article-tabs">
      <el-tab-pane label="已发布" name="published">
        <!-- 已发布文章列表 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else>
          <div v-if="publishedArticles.length === 0" class="empty-state">
            <el-empty description="暂无已发布的文章">
              <el-button class="create-btn" @click="createNewArticle">写文章</el-button>
            </el-empty>
          </div>
          <div v-else class="article-list">
            <div v-for="article in publishedArticles"
                 :key="article.id"
                 class="article-item">
              <div class="article-content">
                <h3>{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.content }}</p>
                <div class="article-meta">
                  <span>
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(article.createdAt) }}
                  </span>
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
              </div>
              <div class="article-actions">
                <el-button class="edit-btn" size="small" @click="editArticle(article.id)">
                  编辑
                </el-button>
                <el-button class="delete-btn" size="small" @click="deleteArticle(article.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="草稿箱" name="drafts">
        <!-- 草稿箱文章列表 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else>
          <div v-if="draftArticles.length === 0" class="empty-state">
            <el-empty description="暂无草稿">
              <el-button class="create-btn" @click="createNewArticle">写文章</el-button>
            </el-empty>
          </div>
          <div v-else class="article-list">
            <div v-for="article in draftArticles"
                 :key="article.id"
                 class="article-item">
              <div class="article-content">
                <h3>{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.content }}</p>
                <div class="article-meta">
                  <span>
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(article.createdAt) }}
                  </span>
                </div>
              </div>
              <div class="article-actions">
                <el-button class="edit-btn" size="small" @click="editArticle(article.id)">
                  编辑
                </el-button>
                <el-button class="publish-btn" size="small" @click="publishArticle(article.id)">
                  发布
                </el-button>
                <el-button class="delete-btn" size="small" @click="deleteArticle(article.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, View, ChatDotRound, Star } from '@element-plus/icons-vue';
import axios from 'axios';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const activeTab = ref('published');
const loading = ref(false);
const publishedArticles = ref([]);
const draftArticles = ref([]);

// 获取当前用户ID
const userId = computed(() => store.state.user.id);

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`http://localhost:8088/api/user/articles/my/${userId.value}`);
    const articles = response.data.data;
    publishedArticles.value = articles.published || [];
    draftArticles.value = articles.drafts || [];
  } catch (error) {
    ElMessage.error('获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

// 编辑文章
const editArticle = (articleId) => {
  if (!articleId) {
    ElMessage.error('无效的文章ID');
    return;
  }
  router.push(`/editor/${articleId}`);
};

// 发布文章
const publishArticle = async (articleId) => {
  try {
    await axios.put(`http://localhost:8088/api/user/articles/${userId.value}/${articleId}/publish`);
    ElMessage.success('文章发布成功');
    await fetchArticles();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '文章发布失败');
  }
};

// 删除文章
const deleteArticle = async (articleId) => {
  try {
    if (!articleId || !userId.value) {
      ElMessage.error('参数错误：缺少文章ID或用户ID');
      return;
    }
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await axios.delete(`http://localhost:8088/api/user/articles/${userId.value}/${articleId}`);
    ElMessage.success('文章删除成功');
    await fetchArticles();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '文章删除失败');
    }
  }
};

// 创建新文章
const createNewArticle = () => {
  router.push({ name: 'CreateArticle' });
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onMounted(() => {
  if (userId.value) {
    fetchArticles();
  } else {
    router.push('/login');
  }
});
</script>

<style scoped>
.my-articles {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  height: calc(100vh - 60px);
}

.article-tabs {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 4px;
}

/* 自定义滚动条样式 */
:deep(.el-tabs__content::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-tabs__content::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 3px;
}

:deep(.el-tabs__content::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

/* 按钮基础样式 */
.article-actions :deep(.el-button) {
  color: white;
  border: none;
}

/* 创建按钮 */
.create-btn {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
  color: white !important;
}

.create-btn:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

/* 编辑按钮 */
.edit-btn {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

.edit-btn:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

/* 发布按钮 */
.publish-btn {
  background-color: #4CAF50 !important;
  border-color: #4CAF50 !important;
}

.publish-btn:hover {
  background-color: #6abe6e !important;
  border-color: #6abe6e !important;
}

/* 删除按钮 */
.delete-btn {
  background-color: #FF9800 !important;
  border-color: #FF9800 !important;
}

.delete-btn:hover {
  background-color: #ffb74d !important;
  border-color: #ffb74d !important;
}

.loading-state,
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.article-item:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.article-content {
  flex: 1;
  margin-right: 20px;
}

.article-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.article-excerpt {
  color: #606266;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.el-button + .el-button {
  margin-left: 0;
}
</style>