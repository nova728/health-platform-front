<template>
  <div class="exercise-achievement-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        🏆运动成就中心
      </h2>
    </div>

    <!-- 用户运动概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="8">
        <el-card class="stats-card blue-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>⏱️本周运动时长</span>
            </div>
          </template>
          <div class="score">{{ (weeklyStats.totalDuration || 0).toFixed(1) }}h</div>
          <div class="rank-info">当前排名: 第{{ userRank }}名</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card purple-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🥇解锁成就</span>
            </div>
          </template>
          <div class="achievements">{{ unlockedCount }}/{{ totalAchievements }}</div>
          <el-progress
              :percentage="(unlockedCount/totalAchievements)*100"
              :stroke-width="10"
              class="custom-progress"
          />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card green-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎯目标完成率</span>
            </div>
          </template>
          <div class="goals-completed">{{ completionRate }}%</div>
          <el-progress :percentage="completionRate" status="success" />
        </el-card>
      </el-col>
    </el-row>    <!-- 运动排行榜和成就列表 -->
    <el-row :gutter="20" class="main-content">
      <el-col :span="16">
        <el-card class="leaderboard" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>运动排行榜</h3>
              <el-radio-group v-model="timeRange" size="small" @change="fetchRankings">
                <el-radio-button label="daily">日榜</el-radio-button>
                <el-radio-button label="weekly">周榜</el-radio-button>
                <el-radio-button label="monthly">月榜</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="table-container">
            <el-table :data="rankings" stripe style="width: 100%">
              <el-table-column prop="rank" label="排名" width="80">
                <template #default="scope">
                  <div class="rank-cell">
                    <el-icon v-if="scope.row.rank <= 3" :color="getRankColor(scope.row.rank)" size="20">
                      <Trophy />
                    </el-icon>
                    <span :style="{ color: getRankColor(scope.row.rank) }">{{ scope.row.rank }}</span>
                  </div>
                </template>
              </el-table-column>              
              <el-table-column prop="avatar" label="" width="60">
                <template #default="scope">
                  <el-avatar 
                    :size="40" 
                    :src="scope.row.avatar" 
                    :icon="UserFilled"
                    class="user-avatar"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="totalDuration" label="运动时长">
                <template #default="scope">
                  {{ (scope.row.totalDuration / 60).toFixed(1) }}小时
                </template>
              </el-table-column>
              <el-table-column prop="achievements" label="成就">
                <template #default="scope">
                  <el-tag
                      v-for="achievement in scope.row.achievements"
                      :key="achievement"
                      size="small"
                      class="achievement-tag"
                  >
                    {{ achievement }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 成就展示 -->
      <el-col :span="8">
        <el-card class="achievements-list" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>成就徽章</h3>
            </div>
          </template>          <div class="achievements-container">
            <el-scrollbar height="100%">
              <div class="achievements-grid">                <div v-for="achievement in achievements" :key="achievement.name" class="achievement-item">
                  <el-badge :is-dot="!achievement.unlocked" :type="achievement.unlocked ? 'success' : 'info'">
                    <el-card :class="{ 'locked': !achievement.unlocked, 'unlocked': achievement.unlocked }" shadow="hover">
                      <div class="achievement-content">
                        <el-icon
                            :size="32"
                            :color="achievement.unlocked ? '#FFD700' : '#909399'"
                            class="achievement-icon"
                        >
                          <component :is="achievement.icon"></component>
                        </el-icon>
                        <div class="achievement-info">
                          <h4 :class="{ 'unlocked-title': achievement.unlocked }">{{ achievement.name }}</h4>
                          <p :class="{ 'unlocked-desc': achievement.unlocked }">{{ achievement.description }}</p>
                        </div>
                      </div>
                    </el-card>
                  </el-badge>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { Trophy, Medal, Timer, Aim, UserFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const store = useStore()
const userId = computed(() => store.state.user?.id)

// 基础数据
const timeRange = ref('weekly')
const rankings = ref([])
const achievements = ref([])
const weeklyStats = ref({
  totalDuration: 0,
  totalCalories: 0,
  exerciseCount: 0
})

// 计算属性
const userRank = computed(() => {
  const index = rankings.value.findIndex(r => r.userId === userId.value)
  return index === -1 ? '-' : index + 1
})

const unlockedCount = computed(() => {
  return achievements.value.filter(a => a.unlocked).length
})

const totalAchievements = computed(() => achievements.value.length)

const completionRate = computed(() => {
  if (!weeklyStats.value.totalDuration) return 0
  const goalDuration = 7 // 假设目标是每周7小时
  return Math.min(100, Math.round((weeklyStats.value.totalDuration / goalDuration) * 100))
})

// 获取排名颜色
const getRankColor = (rank) => {
  switch (rank) {
    case 1: return '#FFD700' // 金色
    case 2: return '#C0C0C0' // 银色
    case 3: return '#CD7F32' // 铜色
    default: return '#909399' // 默认颜色
  }
}

// API调用
// API调用
const fetchRankings = async () => {
  try {
    // 修改请求路径
    const res = await axios.get(`http://localhost:8088/api/exercise/achievements/rankings?timeRange=${timeRange.value}`)
    if (res.data.code === 200) {
      rankings.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取排名失败')
    }
  } catch (error) {
    console.error('获取排名失败:', error)
    ElMessage.error('获取排名失败')
  }
}

const fetchAchievements = async () => {
  if (!userId.value) return

  try {
    // 修改请求路径
    const res = await axios.get(`http://localhost:8088/api/exercise/achievements/${userId.value}`)
    if (res.data.code === 200) {
      achievements.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取成就失败')
    }
  } catch (error) {
    console.error('获取成就失败:', error)
    ElMessage.error('获取成就失败')
  }
}

const fetchWeeklyStats = async () => {
  if (!userId.value) return

  try {
    // 修改请求路径
    const res = await axios.get(`http://localhost:8088/api/health/${userId.value}/exercise/stats/weekly`)
    if (res.data.code === 200) {
      weeklyStats.value = res.data.data
      console.log('周统计数据:', res.data.data)
    } else {
      console.log('周统计响应:', res.data)
      weeklyStats.value = res.data
    }
  } catch (error) {
    console.error('获取周统计失败:', error)
    ElMessage.error('获取周统计失败')
  }
}

// 页面初始化
onMounted(async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await Promise.all([
      fetchRankings(),
      fetchAchievements(),
      fetchWeeklyStats()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
})
</script>

<style scoped>
.exercise-achievement-container {
  padding: 20px;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.main-content .el-col:first-child {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-content .el-col:last-child {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.stats-card {
  height: 180px;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

/* 卡片颜色样式 */
.blue-card {
  background: linear-gradient(135deg, #409EFF, #64B5F6);
}

.purple-card {
  background: linear-gradient(135deg, #dbaf9d, #ee9c6e);
}

.green-card {
  background: linear-gradient(135deg, #81C784, #4CAF50);
}

/* 白色文字样式 */
.blue-card .card-header,
.purple-card .card-header,
.green-card .card-header,
.blue-card .score,
.purple-card .achievements,
.green-card .goals-completed,
.blue-card .rank-info {
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
}

.score, .achievements, .goals-completed {
  font-size: 36px;
  font-weight: bold;
  margin: 20px 0;
  text-align: center;
}

.rank-info {
  text-align: center;
}

/* 排行榜样式 */
.leaderboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.leaderboard .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}

.table-container {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow: auto;
  max-height: calc(100vh - 300px);
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.achievement-tag {
  margin: 2px;
}

/* 头像样式 */
.user-avatar {
  border: none !important;
}

.user-avatar::before,
.user-avatar::after {
  display: none !important;
}

/* 移除可能的伪元素点 */
:deep(.el-avatar::before),
:deep(.el-avatar::after) {
  display: none !important;
}

:deep(.el-avatar .el-icon) {
  position: relative;
}

:deep(.el-avatar .el-icon::before),
:deep(.el-avatar .el-icon::after) {
  display: none !important;
}

/* 成就列表样式 */
.achievements-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.achievements-list .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}

.achievements-container {
  flex: 1;
  padding: 20px;
  min-height: 0;
  overflow: hidden;
  max-height: calc(100vh - 300px);
}

.achievements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.achievement-item {
  width: 100%;
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
  transform: scale(0.95);
  transition: all 0.3s ease;
}

/* 已解锁成就样式 */
.unlocked {
  background: linear-gradient(135deg, #fff9c4, #fff3a0);
  border: 2px solid #FFD700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  transform: scale(1.02);
  transition: all 0.3s ease;
  position: relative;
}

.unlocked::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  border-radius: 8px;
  z-index: -1;
}

.unlocked-title {
  color: #B8860B !important;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
}

.unlocked-desc {
  color: #8B7355 !important;
  font-weight: 500;
}

.achievement-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
}

.achievement-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
}

/* 进度条样式 */
.custom-progress {
  padding: 0 20px;
}

:deep(.el-progress-bar__inner) {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* 卡片悬停效果 */
.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
  }

  .leaderboard,
  .achievements-list {
    width: 100%;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .stats-card {
    margin-bottom: 16px;
  }

  .main-content {
    flex-direction: column;
    gap: 20px;
  }

  .leaderboard,
  .achievements-list {
    min-height: 350px;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>