<template>
  <div class="health-overview">
    <el-row :gutter="24">
      <!-- 左侧健康评分区域 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="score-card" :body-style="{ padding: '0' }">
          <div class="score-container">
            <div class="score-circle-wrapper">
              <div class="score-circle" :style="scoreCircleStyle">
                <div class="score-content">
                  <div class="score-number">
                    <span class="number">{{ report.overallScore || 0 }}</span>
                    <span class="unit">分</span>
                  </div>
                  <div class="score-text">健康评分</div>
                </div>
              </div>
              <div class="score-glow" :style="glowStyle"></div>
            </div>
            <div class="score-status" :style="statusStyle">
              {{ getScoreStatus(report.overallScore) }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧异常指标和建议区域 -->
      <el-col :xs="24" :sm="12" :md="16">
        <el-card class="info-card glass-effect">
          <div class="warning-section" v-if="report.abnormalIndicators?.length">
            <div class="section-header warning">
              <el-icon class="warning-icon pulse"><WarningFilled /></el-icon>
              <h3>异常指标提示</h3>
            </div>
            <transition-group name="tag-fade" tag="div" class="tag-container">
              <el-tag 
                v-for="indicator in report.abnormalIndicators" 
                :key="indicator"
                type="warning"
                class="indicator-tag glow-effect"
                effect="dark"
              >
                <el-icon class="blink"><Warning /></el-icon>
                {{ indicator }}
              </el-tag>
            </transition-group>
          </div>

          <div class="suggestion-section">
            <div class="section-header suggestion">
              <el-icon class="suggestion-icon rotate"><Sunny /></el-icon>
              <h3>健康建议</h3>
            </div>
            <transition-group name="list-fade" tag="div" class="suggestion-list">
              <div v-for="(suggestion, index) in report.healthSuggestions" 
                   :key="index" 
                   class="suggestion-item"
              >
                <el-icon class="bounce"><Check /></el-icon>
                <span>{{ suggestion }}</span>
              </div>
            </transition-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-section">
      <el-button 
        type="primary" 
        :loading="loading"
        @click="generateNewReport"
        class="generate-btn gradient-btn"
      >
        <el-icon class="spin"><Refresh /></el-icon>
        生成新报告
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { generateReport } from '@/api/healthReport'
import { 
  WarningFilled, 
  Warning, 
  Sunny, 
  Check, 
  Refresh 
} from '@element-plus/icons-vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])
const loading = ref(false)

// 计算健康评分圆环的样式
const scoreCircleStyle = computed(() => {
  const score = props.report.overallScore || 0
  const degree = (score / 100) * 360
  const color = getScoreColor(score)
  
  return {
    background: `conic-gradient(${color} ${degree}deg, #f5f7fa ${degree}deg)`
  }
})

// 根据分数获取状态文本
const getScoreStatus = (score) => {
  if (score >= 90) return '健康状况优秀'
  if (score >= 75) return '健康状况良好'
  if (score >= 60) return '需要注意'
  return '需要改善'
}

// 根据分数获取颜色
const getScoreColor = (score) => {
  if (score >= 90) return '#67C23A'
  if (score >= 75) return '#409EFF'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 生成新报告方法保持不变
const generateNewReport = async () => {
  if (!props.report.userId) {
    ElMessage.error('用户ID不存在')
    return
  }
  
  loading.value = true
  try {
    await generateReport(props.report.userId)
    ElMessage.success('新报告生成成功')
    emit('refresh')
  } catch (error) {
    ElMessage.error('生成报告失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.health-overview {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(241, 241, 241, 0.5);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(192, 196, 204, 0.7);
    border-radius: 3px;
    
    &:hover {
      background: rgba(144, 147, 153, 0.8);
    }
  }

  .score-card {
    height: 100%;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .score-container {
      padding: 30px;
      text-align: center;

      .score-circle-wrapper {
        position: relative;
        width: 220px;
        height: 220px;
        margin: 0 auto;
      }

      .score-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        transition: all 0.4s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: scale(1.05);
        }

        .score-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          
          .score-number {
            display: flex;
            align-items: baseline;
            justify-content: center;
            
            .number {
              font-size: 56px;
              font-weight: 700;
              background: linear-gradient(135deg, #409EFF, #67C23A);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: pulse 2s infinite;
            }

            .unit {
              font-size: 20px;
              margin-left: 4px;
              color: #909399;
            }
          }

          .score-text {
            font-size: 16px;
            color: #909399;
            margin-top: 8px;
            letter-spacing: 1px;
          }
        }
      }

      .score-glow {
        position: absolute;
        top: -10%;
        left: -10%;
        width: 120%;
        height: 120%;
        background: radial-gradient(circle, rgba(64, 158, 255, 0.2) 0%, transparent 70%);
        filter: blur(20px);
        z-index: -1;
        animation: rotate 10s linear infinite;
      }
    }
  }

  .info-card {
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f5;
      
      &.warning {
        .warning-icon {
          color: #E6A23C;
          font-size: 28px;
          margin-right: 12px;
        }
      }

      &.suggestion {
        .suggestion-icon {
          color: #409EFF;
          font-size: 28px;
          margin-right: 12px;
        }
      }

      h3 {
        margin: 0;
        font-size: 20px;
        color: #303133;
        font-weight: 600;
      }
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 30px;

      .indicator-tag {
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(230, 162, 60, 0.2);
        
        .el-icon {
          margin-right: 6px;
          font-size: 16px;
        }
      }
    }

    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 16px;
        margin-bottom: 12px;
        background: rgba(245, 247, 250, 0.6);
        border-radius: 12px;
        transition: all 0.3s;

        &:hover {
          background: rgba(236, 245, 255, 0.8);
          transform: translateX(8px);
        }

        .el-icon {
          color: #67C23A;
          margin-right: 12px;
          font-size: 20px;
        }

        span {
          color: #606266;
          font-size: 15px;
          line-height: 1.6;
        }
      }
    }
  }

  .action-section {
    margin-top: 36px;
    text-align: center;

    .generate-btn {
      padding: 12px 36px;
      font-size: 16px;
      border-radius: 25px;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      border: none;
      box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
      }
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

// 动画效果
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.bounce {
  animation: bounce 2s infinite;
}

.rotate {
  animation: rotate 10s linear infinite;
}

.pulse {
  animation: pulse 2s infinite;
}

// 响应式布局优化
@media (max-width: 768px) {
  .health-overview {
    padding: 16px;
    
    .score-card {
      margin-bottom: 24px;
      
      .score-container {
        padding: 20px;
        
        .score-circle-wrapper {
          width: 180px;
          height: 180px;
        }
      }
    }
    
    .info-card {
      .tag-container {
        gap: 8px;
      }
      
      .suggestion-item {
        padding: 12px;
      }
    }
  }
}
</style>