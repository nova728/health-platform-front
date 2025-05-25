<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <el-carousel height="800px" indicator-position="outside">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-wrapper">
            <img :src="banner.image" :alt="banner.title" class="banner-image" />
            <div class="banner-content">
              <div class="banner-text">
                <h1>{{ banner.title }}</h1>
                <p>{{ banner.description }}</p>
                <el-button type="primary" size="large" @click="navigateTo(banner.link)">
                  了解更多
                </el-button>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Quick Access Section -->
    <section class="quick-access">
      <div class="section-title">
        <h2>快捷功能</h2>
        <span>便捷管理您的健康数据</span>
      </div>
      <el-row :gutter="20">
        <el-col v-for="item in quickAccess" :key="item.id" :xs="12" :sm="8" :md="6">
          <el-card class="quick-access-card" shadow="hover" @click="navigateTo(item.link)">
            <component :is="item.icon" class="quick-icon" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- Community Section -->
    <section class="community-section">
      <div class="section-title">
        <h2>社区动态</h2>
        <span>发现来自社区的分享与讨论</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="16">
          <HotRanking
              :articles="hotArticles"
              :loading="loading"
              :error="error"
          />
        </el-col>
        <el-col :span="8">
          <el-card class="stats-card">
            <h3>社区数据</h3>
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.members }}</div>
              <div class="stat-label">活跃会员</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.posts }}</div>
              <div class="stat-label">总帖子数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ communityStats.todayPosts }}</div>
              <div class="stat-label">今日新帖</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import {
  Activity,
  Pill,
  Dumbbell,
  Apple,
  FileText,
  Trophy,
  Users,
  Bookmark
} from 'lucide-vue-next'
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import HotRanking from '@/components/HotRanking.vue'
import Footer from '@/components/Footer.vue'
import axios from 'axios'
import {ElMessage} from 'element-plus'


const router = useRouter()
const loading = ref(true)
const error = ref('')
const hotArticles = ref([])

// Banner数据
const banners = ref([
  {
    id: 1,
    title: '科学管理健康数据',
    description: '使用智能工具追踪您的健康指标',
    image: '/src/assets/images/cover1.jpg',
    link: 'HealthCenter'
  },
  {
    id: 2,
    title: '加入健康社区',
    description: '与志同道合的人分享经验和建议',
    image: '/src/assets/images/cover2.jpg',
    link: 'Forum'
  }
])

// 快捷功能数据
const quickAccess = ref([
  {
    id: 1,
    title: '健康数据',
    description: '记录管理健康指标',
    icon: Activity,
    link: '/healthCenter/health-data'
  },
  {
    id: 2,
    title: '用药管理',
    description: '智能提醒按时服药',
    icon: Pill,
    link: '/healthCenter/medicine'
  },
  {
    id: 3,
    title: '运动记录',
    description: '记录运动和锻炼',
    icon: Dumbbell,
    link: '/healthCenter/exercise-record'
  },
  {
    id: 4,
    title: '饮食记录',
    description: '记录每日饮食',
    icon: Apple,
    link: '/healthCenter/diet-record'
  },
  {
    id: 5,
    title: '健康报告',
    description: '定期健康分析',
    icon: FileText,
    link: '/healthCenter/health-report'
  },
  {
    id: 6,
    title: '运动竞赛',
    description: '参与健康挑战',
    icon: Trophy,
    link: '/healthCenter/health-competition'
  },
  {
    id: 7,
    title: '健康社区',
    description: '分享健康经验',
    icon: Users,
    link: '/forum'
  },
  {
    id: 8,
    title: '我的收藏',
    description: '收藏的文章',
    icon: Bookmark,
    link: '/my-favorites'
  }
])

// 社区统计数据
const communityStats = ref({
  members: 0,
  posts: 0,
  todayPosts: 0
});

// 获取社区统计数据
const fetchCommunityStats = async () => {
  try {
    // 获取所有用户数量
    const usersResponse = await axios.get('http://localhost:8088/api/user/count');
    if (usersResponse.data.code === 200) {
      communityStats.value.members = usersResponse.data.data;
    }

    // 获取文章总数
    const postsResponse = await axios.get('http://localhost:8088/api/articles/count');
    if (postsResponse.data.code === 200) {
      communityStats.value.posts = postsResponse.data.data;
    }

    // 获取今日发布的文章数
    const todayPostsResponse = await axios.get('http://localhost:8088/api/articles/count/today');
    if (todayPostsResponse.data.code === 200) {
      communityStats.value.todayPosts = todayPostsResponse.data.data;
    }
  } catch (error) {
    console.error('获取社区统计数据失败:', error);
    ElMessage.error('获取社区统计数据失败');
  }
};

// 获取热门文章
const fetchHotArticles = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await axios.get('http://localhost:8088/api/articles/list/hot')
    if (response.data.code === 200) {
      // 计算热度分数
      hotArticles.value = response.data.data.map(article => ({
        ...article,
        hotScore: article.viewCount + article.likeCount * 3 + article.commentCount * 5,
        isHot: (article.viewCount + article.likeCount * 3 + article.commentCount * 5) > 1000
      }))
    } else {
      error.value = response.data.message || '获取热门文章失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    error.value = '获取热门文章失败'
    console.error('获取热门文章失败:', err)
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 页面导航
const navigateTo = (route) => {
  router.push(route)
}

// 页面加载时获取热门文章
onMounted(() => {
  Promise.all([
    fetchHotArticles(),
    fetchCommunityStats()
  ]);
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.home-container::-webkit-scrollbar {
  display: none;
}

.hero-section,
.quick-access,
.health-insights,
.community-section {
  margin-bottom: 40px;
}

.banner-wrapper {
  position: relative;
  width: 100%;
  height: 800px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
}

.banner-text {
  max-width: 500px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 1;
}

.banner-text h1 {
  font-size: 2.8em;
  margin-bottom: 20px;
  font-weight: bold;
  color: #ffffff;
  -webkit-text-stroke: 2px #409EFF;
  text-stroke: 2px #409EFF;
  text-shadow: -1px -1px 0 #409EFF,
  1px -1px 0 #409EFF,
  -1px 1px 0 #409EFF,
  1px 1px 0 #409EFF;
}

.banner-text p {
  font-size: 1.2em;
  margin-bottom: 30px;
  line-height: 1.6;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
}

.section-title h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.section-title span {
  color: #909399;
  font-size: 16px;
}

.quick-access {
  padding: 40px 0;
}

.quick-access-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.quick-access-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--el-color-primary);
}

.quick-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.quick-access-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.quick-access-card p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}


.article-card {
  margin-bottom: 20px;
  height: 100%;
}

.article-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.article-content {
  padding: 15px;
}

.article-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.article-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  color: #909399;
}

/* 社区统计卡片样式 */
.stats-card {
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--el-color-primary-light-7);
}

.stat-item {
  padding: 16px;
  margin: 12px 0;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: scale(1.02);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}
/* 响应式布局 */
@media (max-width: 768px) {
  .banner-wrapper {
    height: 400px;
  }

  .banner-content {
    padding: 0 20px;
  }

  .banner-text h1 {
    font-size: 2em;
  }

  .banner-text p {
    font-size: 1.1em;
  }

  .quick-access-card {
    margin-bottom: 15px;
  }

  .home-container {
    padding: 10px;
  }

  .section-title h2 {
    font-size: 24px;
  }
}
</style>