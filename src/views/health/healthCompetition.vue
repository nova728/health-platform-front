<template>
  <div class="health-competition-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <el-icon><Trophy /></el-icon>
        健康竞赛中心
      </h2>
    </div>

    <!-- 用户积分概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="8">
        <el-card class="stats-card blue-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Medal /></el-icon>
              <span>我的积分</span>
            </div>
          </template>
          <div class="score">{{ userScore }}</div>
          <div class="rank-info">当前排名: 第{{ userRank }}名</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card purple-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>获得成就</span>
            </div>
          </template>
          <div class="achievements">{{ unlockedAchievements }}/{{ totalAchievements }}</div>
          <el-progress
              :percentage="(unlockedAchievements/totalAchievements)*100"
              :stroke-width="10"
              class="custom-progress"
          />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card green-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Aim /></el-icon>
              <span>今日目标</span>
            </div>
          </template>
          <div class="goals-completed">{{ completedGoals }}/{{ totalGoals }}</div>
          <el-progress :percentage="(completedGoals/totalGoals)*100" status="success" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 竞赛排行榜和成就列表 -->
    <el-row :gutter="20" class="main-content">
      <el-col :span="16">
        <el-card class="leaderboard" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>健康竞赛排行榜</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="daily">日榜</el-radio-button>
                <el-radio-button label="weekly">周榜</el-radio-button>
                <el-radio-button label="monthly">月榜</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <el-table :data="leaderboardData" stripe style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="scope">
                <div class="rank-cell">
                  <el-icon v-if="scope.row.rank <= 3" :color="getRankColor(scope.row.rank)" size="20">
                    <div class="bubble-icon">🏆</div>
                  </el-icon>
                  <span :style="{ color: getRankColor(scope.row.rank) }">{{ scope.row.rank }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="avatar" label="" width="60">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatar" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="用户名" />
            <el-table-column prop="score" label="积分" />
            <el-table-column prop="streak" label="连续打卡" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getStreakTagType(scope.row.streak)">
                  {{ scope.row.streak }}天
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 成就展示 -->
      <el-col :span="8">
        <el-card class="achievements-list" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>最新成就</h3>
            </div>
          </template>
          <el-scrollbar height="400px">
            <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
              <el-badge :is-dot="!achievement.unlocked" :type="achievement.unlocked ? 'success' : 'info'">
                <el-card :class="{ 'locked': !achievement.unlocked }" shadow="hover">
                  <div class="achievement-content">
                    <el-icon
                        :size="28"
                        :color="achievement.unlocked ? '#67C23A' : '#909399'"
                        class="achievement-icon"
                    >
                      <component :is="achievement.icon"></component>
                    </el-icon>
                    <div class="achievement-info">
                      <h4>{{ achievement.name }}</h4>
                      <p>{{ achievement.description }}</p>
                    </div>
                  </div>
                </el-card>
              </el-badge>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {Medal, Trophy, Aim} from '@element-plus/icons-vue'

// 用户数据
const userScore = ref(850)
const userRank = ref(5)
const unlockedAchievements = ref(7)
const totalAchievements = ref(12)
const completedGoals = ref(3)
const totalGoals = ref(5)
const timeRange = ref('weekly')

// 排行榜数据
const leaderboardData = ref([
  {rank: 1, name: '健康达人', avatar: '/src/assets/images/avatar.png', score: 1200, streak: 30},
  {rank: 2, name: '运动王者', avatar: '/src/assets/images/avatar.png', score: 1150, streak: 25},
  {rank: 3, name: '生活家', avatar: '/src/assets/images/avatar.png', score: 1000, streak: 20},
  {rank: 4, name: '健康先锋', avatar: '/src/assets/images/avatar.png', score: 900, streak: 15},
  {rank: 5, name: '活力达人', avatar: '/src/assets/images/avatar.png', score: 850, streak: 10},
])

// 成就列表
const achievements = ref([
  {
    id: 1,
    name: '运动达人',
    description: '连续7天完成运动目标',
    icon: 'Timer',
    unlocked: true
  },
  {
    id: 2,
    name: '健康饮食',
    description: '记录30天的饮食数据',
    icon: 'Food',
    unlocked: true
  },
  {
    id: 3,
    name: '早起达人',
    description: '连续30天早起打卡',
    icon: 'Sunrise',
    unlocked: false
  },
])

// 获取排名颜色
const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return '#FFD700' // 金色
    case 2:
      return '#C0C0C0' // 银色
    case 3:
      return '#CD7F32' // 铜色
    default:
      return '#606266' // 默认颜色
  }
}

// 获取连续打卡标签类型
const getStreakTagType = (streak) => {
  if (streak >= 30) return 'success'
  if (streak >= 20) return 'warning'
  if (streak >= 10) return 'info'
  return ''
}

</script>

<style scoped>
.stats-card {
  height: 180px;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

/* 添加卡片颜色 */
.blue-card {
  background: linear-gradient(135deg, #409EFF, #64B5F6);
}

.purple-card {
  background: linear-gradient(135deg, #dbaf9d, #ee9c6e);
}

.green-card {
  background: linear-gradient(135deg, #81C784, #4CAF50);
}

/* 修改卡片内文字颜色为白色 */
.blue-card .card-header,
.purple-card .card-header,
.green-card .card-header,
.blue-card .score,
.purple-card .achievements,
.green-card .goals-completed,
.blue-card .rank-info {
  color: white;
}

/* 修改卡片内图标颜色为白色 */
.blue-card .el-icon,
.purple-card .el-icon,
.green-card .el-icon {
  color: white;
}

/* 自定义进度条样式 */
.custom-progress {
  padding: 0 20px;
}

:deep(.el-progress-bar__inner) {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
.health-competition-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #303133;
}

.stats-overview {
  margin-bottom: 24px;
}

.stats-card {
  height: 180px;
  transition: all 0.3s ease;
  border-radius: 12px; /* 添加圆角 */
  overflow: hidden; /* 确保内容不会超出圆角 */
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
}

.card-header h3 {
  margin: 0;
}

.score, .achievements, .goals-completed {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin: 20px 0;
  text-align: center;
}

.rank-info {
  text-align: center;
  color: #666;
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.achievement-item {
  margin-bottom: 12px;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
}

.achievement-info {
  flex: 1;
}

.achievement-info h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.achievement-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.locked {
  opacity: 0.6;
  background-color: #f5f7fa;
}

.el-badge {
  width: 100%;
}

/* 修改的部分：增强阴影和圆角效果 */
.leaderboard,
.achievements-list {
  border-radius: 12px;
  overflow: hidden;
}

.achievement-item .el-card {
  border-radius: 8px;
  overflow: hidden;
}


.stats-card:hover {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15) !important;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}
</style>