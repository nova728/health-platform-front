<template>
  <div class="exercise-achievement-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <el-icon><Trophy /></el-icon>
        运动成就中心
      </h2>
    </div>

    <!-- 用户运动概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="8">
        <el-card class="stats-card blue-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>本周运动时长</span>
            </div>
          </template>
          <div class="score">{{ weeklyStats.totalDuration || 0 }}h</div>
          <div class="rank-info">当前排名: 第{{ userRank }}名</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card purple-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Medal /></el-icon>
              <span>解锁成就</span>
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
              <el-icon><Aim /></el-icon>
              <span>目标完成率</span>
            </div>
          </template>
          <div class="goals-completed">{{ completionRate }}%</div>
          <el-progress :percentage="completionRate" status="success" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 运动排行榜和成就列表 -->
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
                <el-avatar :size="40" :src="scope.row.avatar" />
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
        </el-card>
      </el-col>

      <!-- 成就展示 -->
      <el-col :span="8">
        <el-card class="achievements-list" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>成就徽章</h3>
            </div>
          </template>
          <el-scrollbar height="400px">
            <div v-for="achievement in achievements" :key="achievement.name" class="achievement-item">
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
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { Trophy, Medal, Timer, Aim } from '@element-plus/icons-vue'
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
  const goalDuration = 7 * 60 // 假设目标是每周7小时
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
  margin-bottom: 20px;
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.achievement-tag {
  margin: 2px;
}

/* 成就列表样式 */
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
  }

  .leaderboard,
  .achievements-list {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .stats-card {
    margin-bottom: 16px;
  }
}
</style>