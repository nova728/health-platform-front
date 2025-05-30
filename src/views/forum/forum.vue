<template>
  <div class="forum-container">
    <div class="forum">
      <!-- 顶部搜索和发帖区域 -->
      <div class="forum-header">
        <el-input
            v-model="searchText"
            placeholder="🔍 搜索文章..."
            class="search-input"
            @input="handleSearch"
        />
        <el-button type="primary" @click="navigateToEditor">
          <el-icon><Plus /></el-icon>发布文章
        </el-button>
      </div>

      <div class="forum-content">
        <!-- 左侧分类 -->
        <div class="forum-categories">
          <div class="category-title">热点内容</div>
          <!-- 只保留热榜选项 -->
          <el-menu
              :default-active="activeTab"
              @select="handleTabSelect"
          >
            <el-menu-item index="hot">
              <el-icon><List /></el-icon>
              <span>热榜</span>
            </el-menu-item>
          </el-menu>

          <div class="category-title mt-6">板块分类</div>
          <el-menu
              :default-active="activeCategory.toString()"
              @select="handleCategorySelect"
          >
            <el-menu-item
                v-for="category in categories"
                :key="category.id"
                :index="category.id.toString()"
            >
              <el-icon><component :is="category.icon" /></el-icon>
              <span>{{ category.name }}</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧文章列表 -->
        <div class="posts-section">
          <!-- 热榜组件 -->
          <div v-if="activeTab === 'hot'" class="hot-ranking-section">
            <HotRanking
                :articles="hotArticles"
                :loading="isLoadingHot"
                :error="hotArticlesError"
            />
          </div>

          <!-- 文章列表 -->
          <div v-if="activeTab !== 'hot'" class="posts-list" ref="postsListRef" @scroll="handleScroll">
            <!-- 瀑布流容器 -->
            <div class="posts-masonry">
              <el-empty v-if="posts.length === 0 && !isLoading" description="暂无文章" />

              <div v-for="post in posts" :key="post.id" class="post-item">
                <el-card
                    class="post-card"
                    @click="viewPost(post.id)"
                    @mouseenter="handlePostHover(post.id)"
                >                  <!-- 文章头部信息 -->
                  <div class="post-header">
                    <el-avatar 
                        :size="40" 
                        :src="post.author?.avatar" 
                        class="clickable-avatar"
                        @click.stop="viewUserProfile(post.author?.id)"
                    />
                    <div class="post-info">
                      <div class="post-title">{{ post.title }}</div>
                      <div class="post-meta">
                        <span class="clickable-username" @click.stop="viewUserProfile(post.author?.id)">
                          {{ post.author?.username }}
                        </span>
                        <span>{{ formatDate(post.createdAt) }}</span>
                        <span>{{ getCategoryName(post.categoryId) }}</span>
                        <span v-if="post.visibility === 'private'" class="private-tag">
                          <el-icon><Lock /></el-icon>私密
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 文章内容 -->
                  <div class="post-content">{{ post.content }}</div>

                  <!-- 封面图片 -->
                  <div class="post-cover" v-if="post.coverImage">
                    <el-image
                        :src="post.coverImage"
                        fit="cover"
                        :preview-src-list="[post.coverImage]"
                    >
                      <!-- 图片加载占位符 -->
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><PictureFilled /></el-icon>
                        </div>
                      </template>
                      <!-- 图片加载错误显示 -->
                      <template #error>
                        <div class="image-error">
                          <el-icon><WarningFilled /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>

                  <!-- 文章底部操作栏 -->
                  <div class="post-footer">
                    <span>
                      <el-icon><View /></el-icon> {{ post.viewCount }}
                    </span>
                    <span>
                      <el-icon><ChatDotSquare /></el-icon> {{ post.commentCount }}
                    </span>
                    <span
                        @click.stop="handleFavorite(post)"
                        :class="{ 'active': post.isFavorited }"
                    >
                      <el-icon><Collection /></el-icon>
                      {{ post.isFavorited ? '已收藏' : '收藏' }}
                    </span>
                  </div>

                  <!-- 文章标签 -->
                  <div class="post-tags" v-if="post.tags && post.tags.length">
                    <el-tag
                        v-for="tag in post.tags"
                        :key="tag"
                        size="small"
                        class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </el-card>
              </div>
            </div>

            <!-- 加载状态 -->
            <div class="posts-list"
                  ref="postsListRef"
                  @scroll="handleScroll"
                  v-loading="isLoading"
            >
            </div>

            <!-- 加载完成提示 -->
            <div v-if="noMoreData" class="no-more">
              没有更多内容了
            </div>        </div>
      </div>
    </div>

    <!-- 用户资料弹窗 -->
    <el-dialog
        v-model="userProfileVisible"
        :title="userProfile.username ? `${userProfile.username} 的个人资料` : '用户资料'"
        width="500px"
        :close-on-click-modal="true"
        destroy-on-close
    >
      <div class="user-profile-content" v-loading="profileLoading">
        <div v-if="!profileLoading && userProfile.id" class="profile-info">
          <!-- 用户基本信息 -->
          <div class="profile-header">
            <el-avatar :size="80" :src="userProfile.avatar" class="profile-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="profile-basic">
              <h3>{{ userProfile.username }}</h3>
              <p v-if="userProfile.settings?.profileVisibility === 'public' && userProfile.email" class="profile-email">
                <el-icon><Message /></el-icon>
                {{ userProfile.email }}
              </p>
              <p v-if="userProfile.settings?.profileVisibility === 'public' && userProfile.phone" class="profile-phone">
                <el-icon><Phone /></el-icon>
                {{ userProfile.phone }}
              </p>
              <p v-if="userProfile.settings?.profileVisibility === 'public' && userProfile.address" class="profile-address">
                <el-icon><Location /></el-icon>
                {{ userProfile.address }}
              </p>
            </div>
          </div>

          <!-- 隐私提示 -->
          <div v-if="userProfile.settings?.profileVisibility === 'private'" class="privacy-notice">
            <el-icon><Lock /></el-icon>
            该用户设置了隐私保护，部分信息不对外公开
          </div>

          <!-- 运动数据 -->
          <div v-if="userProfile.settings?.exerciseVisibility === 'public'" class="exercise-section">
            <h4><el-icon><Sunny /></el-icon> 运动数据</h4>
            <div v-if="userProfile.exerciseData" class="exercise-stats">
              <div class="stat-item">
                <span class="stat-label">总运动次数</span>
                <span class="stat-value">{{ userProfile.exerciseData.totalWorkouts || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总运动时长</span>
                <span class="stat-value">{{ userProfile.exerciseData.totalMinutes || 0 }} 分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最近活动</span>
                <span class="stat-value">{{ userProfile.exerciseData.lastActivity || '暂无记录' }}</span>
              </div>
            </div>
            <div v-else class="no-data">暂无运动数据</div>
          </div>

          <!-- 论坛统计 -->
          <div class="forum-stats">
            <h4><el-icon><ChatDotRound /></el-icon> 论坛统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">发布文章</span>
                <span class="stat-value">{{ userProfile.articleCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">获得点赞</span>
                <span class="stat-value">{{ userProfile.totalLikes || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">加入时间</span>
                <span class="stat-value">{{ formatJoinDate(userProfile.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!profileLoading" class="no-user">
          <el-icon><WarningFilled /></el-icon>
          <p>用户信息不存在</p>
        </div>
      </div>
    </el-dialog>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HotRanking from '@/components/HotRanking.vue'
import RecommendedArticles from '../../components/RecommendedArticles.vue'
import { useForumStore } from '@/store/forumStore.js'
import {
  Search,
  Plus,
  ChatDotRound,  QuestionFilled,
  WarningFilled,
  Lock,
  Collection,
  ChatDotSquare, PictureFilled,
  List,
  Medal,
  User,
  Message,
  Phone,
  Location
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { useStore } from 'vuex'
import axios from 'axios'
import {
  Sun as Sunny,
  Eye as View,
  MessageCircle as ChatRound,
  Star,
  PictureInPicture,
  WarehouseIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()
const forumStore = useForumStore()
const searchText = ref('')
const activeCategory = ref(0)
const posts = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const postsListRef = ref(null)
const noMoreData = computed(() => posts.value.length >= total.value && total.value > 0)
const hotArticles = ref([])
const activeTab = ref('normal')
const isLoadingHot = ref(false);
const hotArticlesError = ref('')

// 用户资料弹窗相关
const userProfileVisible = ref(false)
const userProfile = ref({})
const profileLoading = ref(false)

const preloadPost = (postId) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = `http://localhost:8088/api/articles/${postId}`
  document.head.appendChild(link)
}

const handleTabSelect = async (tab) => {
  activeTab.value = tab;
  if (tab === 'hot') {
    await fetchHotArticles();
  } else {
    // 如果是其他标签，加载普通文章列表
    resetList();
    await fetchArticles();
  }
};

const handlePostHover = (postId) => {
  preloadPost(postId)
}

// 分类数据
const categories = ref([
  { id: 1, name: '健康讨论', icon: ChatDotRound },
  { id: 2, name: '生活分享', icon: Sunny },
  { id: 3, name: '问题解答', icon: QuestionFilled },
  { id: 4, name: '经验交流', icon: Medal }
])

const fetchHotArticles = async () => {
  try {
    isLoadingHot.value = true;
    hotArticlesError.value = '';

    const response = await fetch('http://localhost:8088/api/articles/list/hot', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (data.code === 200) {
      hotArticles.value = data.data || [];
      console.log('Hot articles:', hotArticles.value);
    } else {
      throw new Error(data.message || '获取热门文章失败');
    }
  } catch (error) {
    console.error('获取热门文章失败:', error);
    hotArticlesError.value = error.message;
    hotArticles.value = [];
    ElMessage.error(error.message || '获取热门文章失败');
  } finally {
    isLoadingHot.value = false;
  }
};

// 获取文章列表
const fetchArticles = async (loadMore = false) => {
  if (isLoading.value || (noMoreData.value && loadMore)) return;

  try {
    isLoading.value = true;
    const userId = store.state.user.id;

    const response = await fetch(
        `http://localhost:8088/api/articles/${userId}?categoryId=${activeCategory.value || ''}&page=${currentPage.value}&size=${pageSize.value}&search=${searchText.value}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.code === 200 && responseData.data) {
      const newPosts = responseData.data.articles || [];
      if (loadMore) {
        posts.value = [...posts.value, ...newPosts];
      } else {
        posts.value = newPosts;
      }
      total.value = responseData.data.total || 0;
    } else {
      console.warn('Unexpected response structure:', responseData);
      if (!loadMore) {
        posts.value = [];
        total.value = 0;
      }
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error(error.message || '获取文章列表失败');
    if (!loadMore) {
      posts.value = [];
      total.value = 0;
    }
  } finally {
    isLoading.value = false;
  }
};

// 处理滚动加载
const handleScroll = debounce(async () => {
  if (!postsListRef.value) return;

  const { scrollTop, scrollHeight, clientHeight } = postsListRef.value;
  // 当距离底部小于50px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 50 && !isLoading.value && !noMoreData.value) {
    currentPage.value++;
    await fetchArticles(true);
  }
}, 200);

// 重置列表
const resetList = () => {
  posts.value = [];
  currentPage.value = 1;
  total.value = 0;
};

// 处理分类选择
const handleCategorySelect = (key) => {
  activeTab.value = 'normal'; // 切换到普通文章列表状态
  activeCategory.value = parseInt(key);
  resetList();
  fetchArticles();
};

// 处理搜索
const handleSearch = debounce(() => {
  resetList();
  fetchArticles();
}, 300);


// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 格式化加入时间
const formatJoinDate = (date) => {
  return dayjs(date).format('YYYY年MM月')
}

// 查看用户资料
const viewUserProfile = async (userId) => {
  if (!userId) {
    ElMessage.warning('用户信息不存在')
    return
  }

  userProfileVisible.value = true
  profileLoading.value = true
  
  try {
    // 获取用户基本信息和设置
    const [userResponse, settingsResponse, statsResponse] = await Promise.all([
      axios.get(`http://localhost:8088/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
      axios.get(`http://localhost:8088/api/settings/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
      axios.get(`http://localhost:8088/api/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    ])

    if (userResponse.data.code === 200) {
      userProfile.value = {
        ...userResponse.data.data,
        settings: settingsResponse.data.code === 200 ? settingsResponse.data.data : {},
        ...( statsResponse.data.code === 200 ? statsResponse.data.data : {})
      }

      // 根据隐私设置获取运动数据
      if (userProfile.value.settings?.exerciseVisibility === 'public') {
        try {
          const exerciseResponse = await axios.get(`http://localhost:8088/api/users/${userId}/exercise`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          if (exerciseResponse.data.code === 200) {
            userProfile.value.exerciseData = exerciseResponse.data.data
            //console.log(exerciseResponse.data.data)
          }
        } catch (error) {
          console.warn('获取运动数据失败:', error)
        }
      }
    } else {
      ElMessage.error('获取用户信息失败')
      userProfile.value = {}
    }
  } catch (error) {
    console.error('获取用户资料失败:', error)
    ElMessage.error('获取用户资料失败')
    userProfile.value = {}
  } finally {
    profileLoading.value = false
  }
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : ''
}

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchArticles()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchArticles()
}

// 处理点赞
const handleLike = async (post) => {
  try {
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      return
    }

    const url = `http://localhost:8088/api/articles/${post.id}/like`
    const method = post.isLiked ? 'DELETE' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) throw new Error('操作失败')

    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1

    ElMessage.success(post.isLiked ? '点赞成功' : '已取消点赞')
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleFavorite = async (post) => {
  try {
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      return
    }

    const userId = store.state.user.id; // 获取 userId
    if (!userId) {
      ElMessage.warning('无法获取用户信息，请重新登录');
      return;
    }
    const url = `http://localhost:8088/api/articles/${userId}/${post.id}/favorite`;
    const method = post.isFavorited ? 'DELETE' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' // 明确指定Content-Type
      }
    })

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // no-op
      }
      console.error('Favorite operation failed response:', response);
      throw new Error(errorData?.message || `操作失败，状态码: ${response.status}`);
    }

    post.isFavorited = !post.isFavorited
    ElMessage.success(post.isFavorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 跳转到编辑器
const navigateToEditor = () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return
  }
  router.push('/article/editor')
}

// 查看文章详情
const viewPost = (id) => {
  router.push(`/article/detail/${id}`)
}

// 初始化加载
onMounted(() => {
  // 根据当前的 activeTab 决定加载什么内容
  if (activeTab.value === 'hot') {
    fetchHotArticles();
  } else {
    fetchArticles();
  }
});
</script>

<style scoped>
.hot-ranking-section {
  margin-bottom: 24px;
  padding: 0 20px;
}

.category-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e6e6e6;
}

.forum-container {
  padding: 20px 40px;
  height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.forum {
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.search-input {
  max-width: 300px;
}

.forum-header {
  padding: 20px;
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #e6e6e6;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 1;
}

.forum-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e6e6e6;
}

.posts-list {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 瀑布流布局 */
.posts-masonry {
  column-count: 2;
  column-gap: 20px;
  padding: 20px;
}

.post-item {
  break-inside: avoid;
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 0;
  break-inside: avoid-column;
  display: inline-block;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.post-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 12px;
  align-items: center;
}

.private-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
}

.post-content {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-cover {
  margin: 12px 0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.post-cover .el-image {
  position: static;
  width: 100%;
  display: block;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
}

.image-error {
  color: #f56c6c;
}

.post-footer {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

.post-footer span {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.post-footer span:hover,
.post-footer span.active {
  color: #409eff;
}

.post-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.no-more {
  text-align: center;
  color: #909399;
  padding: 20px 0;
  font-size: 14px;
}
.recommended-section {
  margin-top: 24px;
  padding: 16px;
}

.hot-articles {
  margin-bottom: 24px;
  padding: 0 20px;
}

.posts-section {
  flex: 1;
  overflow-y: auto;
  padding-top: 20px;
}

/* 调整现有样式 */
.forum-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.forum-categories {
  width: 240px;  /* 增加宽度以适应推荐文章 */
  border-right: 1px solid #e6e6e6;
  background-color: white;
  position: sticky;
  top: 0;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.hot-articles {
  margin-bottom: 24px;
  padding: 0 20px;
  min-height: 200px; /* 保持固定高度 */
}

.hot-articles-loading,
.hot-articles-empty {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
}

.el-carousel {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 错落动画延迟 */
.post-item:nth-child(2n) {
  animation-delay: 0.2s;
}

.post-item:nth-child(3n) {
  animation-delay: 0.4s;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .posts-masonry {
    column-count: 1;
  }

  .forum-content {
    flex-direction: column;
  }

  .forum-categories {
    width: 100%;
    margin-bottom: 20px;
  }

  .recommended-section {
    margin-top: 16px;
  }

  .hot-articles {
    padding: 0 16px;
  }
}

@media screen and (min-width: 1200px) {
  .posts-masonry {
    column-count: 3;
  }
}

/* 滚动条样式 */
.posts-list::-webkit-scrollbar {
  width: 6px;
}

.posts-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.posts-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

/* 用户资料弹窗样式 */
.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable-avatar:hover {
  transform: scale(1.05);
}

.clickable-username {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s ease;
}

.clickable-username:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.user-profile-content {
  min-height: 200px;
}

.profile-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-basic h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 20px;
}

.profile-basic p {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.privacy-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  color: #e6a23c;
  margin-bottom: 24px;
  font-size: 14px;
}

.exercise-section,
.forum-stats {
  margin-bottom: 24px;
}

.exercise-section h4,
.forum-stats h4 {
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 16px;
}

.exercise-stats,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.no-data,
.no-user {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-user .el-icon {
  font-size: 48px;
  color: #dcdfe6;
}
</style>