<template>
  <div class="health-overview">
    <el-row :gutter="32">
      <!-- 左侧健康评分区域 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="score-card glassmorphism" :body-style="{ padding: '0' }">
          <div class="score-container">
            <div class="score-title">
              <el-icon class="title-icon"><TrendCharts /></el-icon>
              <h2>健康评分</h2>
            </div>

            <div class="score-circle-wrapper">
              <!-- 外层装饰环 -->
              <div class="outer-ring"></div>
              <!-- 主要评分圆环 -->
              <div class="score-circle" :style="scoreCircleStyle">
                <div class="inner-circle">
                  <div class="score-content">
                    <div class="score-number">
                      <span class="number" :style="{ color: getScoreColor(report.overallScore) }">
                        {{ animatedScore }}
                      </span>
                      <span class="unit">分</span>
                    </div>
                    <div class="score-text">综合评估</div>
                  </div>
                </div>
              </div>
              <!-- 发光效果 -->
              <div class="score-glow" :style="glowStyle"></div>
            </div>

            <div class="score-status" :style="{ color: getScoreColor(report.overallScore) }">
              <el-icon class="status-icon"><Medal /></el-icon>
              {{ getScoreStatus(report?.overallScore) }}
            </div>

            <!-- 健康指标快览 -->
            <div class="quick-stats">
              <div class="stat-item">
                <el-icon class="stat-icon"><Aim /></el-icon>
                <span class="stat-label">BMI</span>
                <span class="stat-value">{{ report?.bmi || '--' }}</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><Timer /></el-icon>
                <span class="stat-label">心率</span>
                <span class="stat-value">{{ report?.heartRate || '--' }}</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><Moon /></el-icon>
                <span class="stat-label">睡眠</span>
                <span class="stat-value">{{ report?.averageSleepDuration || '--' }}h</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧信息区域 -->
      <el-col :xs="24" :sm="12" :md="16">
        <div class="info-section">
          <!-- 异常指标卡片 -->
          <el-card
              class="warning-card glassmorphism"
              v-if="report?.abnormalIndicators?.length"
          >
            <div class="card-header warning-header">
              <div class="header-content">
                <el-icon class="warning-icon pulse"><WarningFilled /></el-icon>
                <h3>异常指标提醒</h3>
              </div>
              <div class="alert-badge">{{ report?.abnormalIndicators?.length || 0 }}</div>
            </div>

            <transition-group name="tag-fade" tag="div" class="tag-container">
              <div
                  v-for="(indicator, index) in report?.abnormalIndicators"
                  :key="indicator"
                  class="indicator-tag warning-tag"
                  :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="tag-icon">
                  <el-icon class="blink"><Warning /></el-icon>
                </div>
                <span class="tag-text">{{ indicator }}</span>
                <div class="tag-decoration"></div>
              </div>
            </transition-group>
          </el-card>

          <!-- 健康建议卡片 -->
          <el-card class="suggestion-card glassmorphism">
            <div class="card-header suggestion-header">
              <div class="header-content">
                <el-icon class="suggestion-icon rotate"><Sunny /></el-icon>
                <h3>健康建议</h3>
              </div>
              <div class="suggestion-count">{{ report?.healthSuggestions?.length || 0 }} 条建议</div>
            </div>

            <transition-group name="list-fade" tag="div" class="suggestion-list">
              <div
                  v-for="(suggestion, index) in report?.healthSuggestions"
                  :key="index"
                  class="suggestion-item"
                  :style="{ animationDelay: `${index * 0.15}s` }"
              >
                <div class="suggestion-icon-wrapper">
                  <el-icon class="suggestion-check bounce"><Check /></el-icon>
                </div>
                <div class="suggestion-content">
                  <span class="suggestion-text">{{ suggestion }}</span>
                  <div class="suggestion-progress"></div>
                </div>
                <div class="suggestion-arrow">
                  <el-icon><ArrowRightBold /></el-icon>
                </div>
              </div>
            </transition-group>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 底部操作区域 -->
    <div class="action-section">
      <div class="action-container">
        <div class="action-info">
          <h4>生成新的健康报告</h4>
          <p>基于最新数据重新分析您的健康状况</p>
        </div>
        <el-button
            type="primary"
            :loading="loading"
            @click="generateNewReport"
            class="generate-btn modern-btn"
            size="large"
        >
          <el-icon v-if="!loading" class="btn-icon"><Refresh /></el-icon>
          <el-icon v-else class="btn-icon spin"><Loading /></el-icon>
          {{ loading ? '生成中...' : '生成新报告' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { generateReport } from '@/api/healthReport'
import {
  WarningFilled,
  Warning,
  Sunny,
  Check,
  Refresh,
  Loading,
  TrendCharts,
  Medal,
  Aim,
  Timer,
  Moon,
  ArrowRightBold
} from '@element-plus/icons-vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])
const loading = ref(false)
const animatedScore = ref(0)

// 监听报告变化，动画显示分数
watch(() => props.report?.overallScore, (newScore) => {
  if (newScore !== undefined && newScore !== null) {
    animateScore(newScore)
  }
}, { immediate: true })

// 分数动画
const animateScore = (targetScore) => {
  const target = Number(targetScore) || 0
  const duration = 2000
  const startTime = performance.now()
  const startScore = animatedScore.value

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    animatedScore.value = Math.round(startScore + (target - startScore) * easeOutCubic)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// 计算健康评分圆环的样式
const scoreCircleStyle = computed(() => {
  const score = props.report?.overallScore || 0
  const percentage = Math.min(Math.max(score, 0), 100)
  const degree = (percentage / 100) * 360
  const color = getScoreColor(score)

  return {
    background: `conic-gradient(${color} 0deg ${degree}deg, rgba(255,255,255,0.1) ${degree}deg 360deg)`,
    '--score-color': color
  }
})

// 发光效果样式
const glowStyle = computed(() => {
  const score = props.report?.overallScore || 0
  const color = getScoreColor(score)
  return {
    background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`
  }
})

// 根据分数获取状态文本
const getScoreStatus = (score) => {
  const numScore = Number(score) || 0
  if (numScore >= 90) return '健康状况优秀'
  if (numScore >= 75) return '健康状况良好'
  if (numScore >= 60) return '需要关注'
  return '急需改善'
}

// 根据分数获取颜色
const getScoreColor = (score) => {
  const numScore = Number(score) || 0
  if (numScore >= 90) return '#00C9A7'  // 翠绿色
  if (numScore >= 75) return '#4FC3F7'  // 天蓝色
  if (numScore >= 60) return '#FFB74D'  // 橙色
  return '#FF7043'  // 珊瑚红
}

// 生成新报告
const generateNewReport = async () => {
  if (!props.report?.userId) {
    ElMessage.error('用户ID不存在')
    return
  }

  loading.value = true
  try {
    await generateReport(props.report.userId)
    ElMessage({
      message: '新报告生成成功！',
      type: 'success',
      duration: 3000,
      showClose: true
    })
    emit('refresh')
  } catch (error) {
    console.error('生成报告失败:', error)
    ElMessage({
      message: '生成报告失败，请稍后重试',
      type: 'error',
      duration: 3000,
      showClose: true
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 初始化动画
  const initialScore = props.report?.overallScore
  if (initialScore !== undefined && initialScore !== null) {
    animateScore(initialScore)
  }
})
</script>

<style lang="scss" scoped>
.health-overview {
  min-height: 100vh;
  padding: 32px;
  position: relative;
  background: transparent;  overflow-x: hidden;
  // 玻璃态效果
  .glassmorphism {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.25) 0%, 
      rgba(255, 255, 255, 0.15) 50%, 
      rgba(255, 255, 255, 0.1) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-8px);
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(255, 255, 255, 0.2) 50%, 
        rgba(255, 255, 255, 0.15) 100%);
      box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
  }
  // 评分卡片
  .score-card {
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, 
      rgba(79, 195, 247, 0.15) 0%, 
      rgba(0, 201, 167, 0.1) 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, 
        rgba(79, 195, 247, 0.05) 0%, 
        transparent 50%, 
        rgba(0, 201, 167, 0.05) 100%);
      border-radius: 24px;
      pointer-events: none;
    }

    .score-container {
      padding: 40px 30px;
      text-align: center;

      .score-title {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;

        .title-icon {
          font-size: 28px;
          color: #4FC3F7;
          margin-right: 12px;
        }        h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #000000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
      }

      .score-circle-wrapper {
        position: relative;
        width: 240px;
        height: 240px;
        margin: 0 auto 30px;

        .outer-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          animation: rotate 30s linear infinite;
        }        .score-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.6s ease;.inner-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.2) 0%, 
              rgba(79, 195, 247, 0.1) 50%, 
              rgba(0, 201, 167, 0.1) 100%);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.3);

            &::before {
              content: '';
              position: absolute;
              width: 120%;
              height: 120%;
              background: conic-gradient(
                      transparent 0deg,
                      rgba(255, 255, 255, 0.15) 90deg,
                      transparent 180deg
              );
              animation: shimmer 3s linear infinite;
            }

            .score-content {
              position: relative;
              z-index: 2;

              .score-number {
                display: flex;
                align-items: baseline;
                justify-content: center;
                margin-bottom: 8px;                
                .number {
                  font-size: 48px;
                  font-weight: 800;
                  color: #1a1a1a;
                  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(255, 255, 255, 0.7);
                  transition: color 0.6s ease;
                }                
                .unit {
                  font-size: 18px;
                  margin-left: 6px;
                  color: #1a1a1a;
                  font-weight: 500;
                  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(255, 255, 255, 0.7);
                }
              }              
              .score-text {
                font-size: 14px;
                color: #1a1a1a;
                letter-spacing: 1px;
                font-weight: 500;
                text-shadow: 0 2px 4px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(255, 255, 255, 0.7);
              }
            }
          }
        }

        .score-glow {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 140%;
          border-radius: 50%;
          filter: blur(30px);
          z-index: -1;
          animation: pulse-glow 4s ease-in-out infinite;
        }
      }

      .score-status {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 30px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .status-icon {
          margin-right: 8px;
          font-size: 20px;
        }
      }

      .quick-stats {
        display: flex;
        justify-content: space-around;        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, 
            rgba(79, 195, 247, 0.2) 0%, 
            rgba(255, 255, 255, 0.15) 100%);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(79, 195, 247, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.2), 
              transparent);
            transition: left 0.5s ease;
          }

          &:hover {
            transform: translateY(-4px);
            background: linear-gradient(135deg, 
              rgba(79, 195, 247, 0.3) 0%, 
              rgba(255, 255, 255, 0.25) 100%);
            border-color: rgba(79, 195, 247, 0.5);
            box-shadow: 0 8px 25px rgba(79, 195, 247, 0.2);
            
            &::before {
              left: 100%;
            }
          }

          .stat-icon {
            font-size: 24px;
            color: #4FC3F7;
            margin-bottom: 8px;
          }          .stat-label {
            font-size: 12px;
            color: #000000;
            margin-bottom: 4px;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
          }

          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #000000;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }

  // 信息区域
  .info-section {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  // 警告卡片
  .warning-card {
    background: linear-gradient(135deg, 
      rgba(255, 183, 77, 0.15) 0%, 
      rgba(255, 112, 67, 0.1) 100%);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, 
        rgba(255, 183, 77, 0.05) 0%, 
        transparent 50%, 
        rgba(255, 112, 67, 0.05) 100%);
      border-radius: 24px;
      pointer-events: none;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      .header-content {
        display: flex;
        align-items: center;        .warning-icon {
          color: #FFB74D;
          font-size: 28px;
          margin-right: 12px;
          filter: drop-shadow(0 2px 4px rgba(255, 183, 77, 0.3));
        }

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
      }

      .alert-badge {
        background: linear-gradient(135deg, #FF7043, #FFB74D);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(255, 112, 67, 0.3);
      }
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      .indicator-tag {        position: relative;
        display: flex;
        align-items: center;
        padding: 12px 20px;
        background: linear-gradient(135deg, 
          rgba(255, 183, 77, 0.25) 0%, 
          rgba(255, 112, 67, 0.15) 100%);
        border: 1px solid rgba(255, 183, 77, 0.4);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: slideInUp 0.6s ease-out both;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent);
          transition: left 0.5s ease;
        }

        &:hover {
          transform: translateY(-4px);
          background: linear-gradient(135deg, 
            rgba(255, 183, 77, 0.35) 0%, 
            rgba(255, 112, 67, 0.25) 100%);
          box-shadow: 0 8px 25px rgba(255, 183, 77, 0.3);
          border-color: rgba(255, 183, 77, 0.6);
          
          &::before {
            left: 100%;
          }
        }

        .tag-icon {
          margin-right: 8px;

          .el-icon {
            font-size: 16px;
            color: #FFB74D;
          }
        }        .tag-text {
          font-size: 14px;
          font-weight: 500;
          color: #000000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .tag-decoration {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #FF7043;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }
      }
    }
  }
  // 建议卡片
  .suggestion-card {
    background: linear-gradient(135deg, 
      rgba(0, 201, 167, 0.15) 0%, 
      rgba(79, 195, 247, 0.1) 100%);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, 
        rgba(0, 201, 167, 0.05) 0%, 
        transparent 50%, 
        rgba(79, 195, 247, 0.05) 100%);
      border-radius: 24px;
      pointer-events: none;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      .header-content {
        display: flex;
        align-items: center;        .suggestion-icon {
          color: #00C9A7;
          font-size: 28px;
          margin-right: 12px;
          filter: drop-shadow(0 2px 4px rgba(0, 201, 167, 0.3));
        }

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
      }      .suggestion-count {
        color: #000000;
        font-size: 14px;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
      }
    }

    .suggestion-list {      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 20px;
        margin-bottom: 16px;
        background: linear-gradient(135deg, 
          rgba(0, 201, 167, 0.2) 0%, 
          rgba(79, 195, 247, 0.15) 100%);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 201, 167, 0.3);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: slideInLeft 0.6s ease-out both;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.2), 
            transparent);
          transition: left 0.5s ease;
        }

        &:hover {
          transform: translateX(8px);
          background: linear-gradient(135deg, 
            rgba(0, 201, 167, 0.3) 0%, 
            rgba(79, 195, 247, 0.25) 100%);
          border-color: rgba(0, 201, 167, 0.5);
          box-shadow: 0 8px 25px rgba(0, 201, 167, 0.25);
          
          &::before {
            left: 100%;
          }
        }

        .suggestion-icon-wrapper {
          margin-right: 16px;

          .suggestion-check {
            color: #00C9A7;
            font-size: 20px;
            padding: 8px;
            background: rgba(0, 201, 167, 0.15);
            border-radius: 50%;
          }
        }

        .suggestion-content {
          flex: 1;
          position: relative;          .suggestion-text {
            color: #000000;
            font-size: 15px;
            line-height: 1.6;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
          }

          .suggestion-progress {
            position: absolute;
            bottom: -8px;
            left: 0;
            height: 2px;
            background: linear-gradient(90deg, #00C9A7, #4FC3F7);
            border-radius: 1px;
            width: 0;
            transition: width 0.6s ease;
          }
        }

        &:hover .suggestion-progress {
          width: 100%;
        }

        .suggestion-arrow {
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
          transition: all 0.3s ease;
        }

        &:hover .suggestion-arrow {
          color: #00C9A7;
          transform: translateX(4px);
        }
      }
    }
  }

  // 操作区域
  .action-section {
    position: relative;
    z-index: 1;
    margin-top: 40px;    .action-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32px;
      background: linear-gradient(135deg, 
        rgba(79, 195, 247, 0.2) 0%, 
        rgba(0, 201, 167, 0.15) 50%, 
        rgba(255, 255, 255, 0.1) 100%);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(79, 195, 247, 0.3);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(79, 195, 247, 0.05) 0%, 
          transparent 50%, 
          rgba(0, 201, 167, 0.05) 100%);
        border-radius: 24px;
        pointer-events: none;
      }

      .action-info {
        flex: 1;        h4 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
          color: #000000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        p {
          margin: 0;
          color: #000000;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
      }

      .generate-btn {
        padding: 16px 32px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 50px;
        background: linear-gradient(135deg, #00C9A7, #4FC3F7);
        color: white;
        border: none;
        box-shadow: 0 8px 25px rgba(0, 201, 167, 0.3);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        &:hover::before {
          left: 100%;
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 201, 167, 0.4);
        }

        .btn-icon {
          margin-right: 8px;
          font-size: 18px;
        }
      }
    }
  }
}

// 动画定义
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 动画类
.bounce { animation: bounce 2s infinite; }
.rotate { animation: rotate 10s linear infinite; }
.pulse { animation: pulse 2s infinite; }
.spin { animation: spin 1s linear infinite; }
.blink { animation: pulse 1.5s infinite; }

// 过渡动画
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.tag-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 响应式设计
@media (max-width: 1200px) {
  .health-overview {
    padding: 24px;

    .score-card .score-container {
      padding: 32px 24px;

      .score-circle-wrapper {
        width: 200px;
        height: 200px;

        .score-circle {
          width: 170px;
          height: 170px;

          .inner-circle .score-content .score-number .number {
            font-size: 42px;
          }
        }
      }
    }
  }
}

@media (max-width: 968px) {
  .health-overview {
    padding: 20px;

    .info-section {
      margin-top: 24px;
    }

    .action-section .action-container {
      flex-direction: column;
      gap: 24px;
      text-align: center;

      .action-info {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .health-overview {
    padding: 16px;

    .score-card .score-container {
      padding: 24px 20px;

      .score-circle-wrapper {
        width: 160px;
        height: 160px;
        margin-bottom: 20px;

        .score-circle {
          width: 140px;
          height: 140px;

          .inner-circle .score-content {
            .score-number {
              margin-bottom: 4px;

              .number {
                font-size: 36px;
              }

              .unit {
                font-size: 16px;
              }
            }

            .score-text {
              font-size: 12px;
            }
          }
        }
      }

      .score-status {
        font-size: 16px;
        margin-bottom: 20px;
      }

      .quick-stats {
        flex-direction: column;
        gap: 12px;

        .stat-item {
          flex-direction: row;
          justify-content: space-between;
          padding: 12px 16px;

          .stat-icon {
            margin-bottom: 0;
            margin-right: 12px;
            font-size: 20px;
          }

          .stat-label {
            margin-bottom: 0;
            margin-right: auto;
          }
        }
      }
    }

    .warning-card,
    .suggestion-card {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .alert-badge,
        .suggestion-count {
          align-self: flex-start;
        }
      }
    }

    .tag-container {
      gap: 8px;

      .indicator-tag {
        padding: 8px 12px;
        font-size: 13px;

        .tag-icon .el-icon {
          font-size: 14px;
        }
      }
    }

    .suggestion-list .suggestion-item {
      padding: 16px;

      .suggestion-icon-wrapper {
        margin-right: 12px;

        .suggestion-check {
          font-size: 18px;
          padding: 6px;
        }
      }

      .suggestion-content .suggestion-text {
        font-size: 14px;
      }

      &:hover {
        transform: none;
      }
    }

    .action-section .action-container {
      padding: 24px 20px;

      .action-info {
        h4 {
          font-size: 18px;
        }

        p {
          font-size: 13px;
        }
      }

      .generate-btn {
        padding: 14px 28px;
        font-size: 15px;

        .btn-icon {
          font-size: 16px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .health-overview {
    padding: 12px;

    .score-card .score-container {
      padding: 20px 16px;

      .score-title {
        margin-bottom: 20px;

        .title-icon {
          font-size: 24px;
        }

        h2 {
          font-size: 20px;
        }
      }

      .score-circle-wrapper {
        width: 140px;
        height: 140px;

        .score-circle {
          width: 120px;
          height: 120px;

          .inner-circle .score-content .score-number .number {
            font-size: 32px;
          }
        }
      }
    }

    .warning-card,
    .suggestion-card {
      .card-header .header-content {
        .warning-icon,
        .suggestion-icon {
          font-size: 24px;
        }

        h3 {
          font-size: 18px;
        }
      }
    }

    .action-section .action-container {
      padding: 20px 16px;

      .generate-btn {
        width: 100%;
        padding: 16px;
      }
    }
  }
}

// 特殊效果增强
.health-overview {
  // 滚动条美化
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  // 深色模式适配
  @media (prefers-color-scheme: dark) {
    .glassmorphism {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .score-card .score-container .score-circle .inner-circle {
      background: rgba(0, 0, 0, 0.1);
    }

    .suggestion-item,
    .indicator-tag {
      background: rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  // 动画减少模式
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .score-glow {
      animation: none;
    }
  }
}

// 打印样式
@media print {
  .health-overview {
    background: white !important;
    color: black !important;

    .glassmorphism {
      background: white !important;
      border: 1px solid #ccc !important;
      box-shadow: none !important;
    }

    .action-section {
      display: none;
    }
  }
}

// 无障碍访问增强
.health-overview {
  // 为屏幕阅读器添加额外信息
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  // 焦点样式
  button:focus,
  .el-button:focus {
    outline: 2px solid #4FC3F7;
    outline-offset: 2px;
  }
}
</style>