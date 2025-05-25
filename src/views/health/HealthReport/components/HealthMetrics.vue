<template>
  <div class="health-metrics">
    <el-row :gutter="24">
      <!-- 基础指标卡片 -->
      <el-col :xs="24" :sm="24" :md="8" class="metric-column">
        <metric-card
          class="metric-card-wrapper"
          title="基础指标"
          icon="Scale"
          theme-color="#409EFF"
          :items="[
            { label: 'BMI', value: report.bmi, status: report.bmiStatus },
            { label: '体重(kg)', value: report.weight },
            { label: '身高(cm)', value: report.height }
          ]"
        />
      </el-col>
      
      <!-- 血压心率卡片 -->
      <el-col :xs="24" :sm="24" :md="8" class="metric-column">
        <metric-card
          class="metric-card-wrapper"
          title="血压心率"
          icon="Heart"
          theme-color="#67C23A"
          :items="[
            { label: '收缩压', value: report.systolic },
            { label: '舒张压', value: report.diastolic },
            { label: '心率', value: report.heartRate, status: report.heartRateStatus }
          ]"
        />
      </el-col>
      
      <!-- 运动情况卡片 -->
      <el-col :xs="24" :sm="24" :md="8" class="metric-column">
        <metric-card
          class="metric-card-wrapper"
          title="运动情况"
          icon="Timer"
          theme-color="#E6A23C"
          :items="[
            { label: '周运动时长(分钟)', value: report.weeklyExerciseDuration },
            { label: '周运动次数', value: report.weeklyExerciseCount },
            { label: '周消耗卡路里', value: report.weeklyCaloriesBurned }
          ]"
        />
      </el-col>
    </el-row>

    <el-row :gutter="24" class="mt-24">
      <!-- 步行数据卡片 -->
      <el-col :xs="24" :sm="24" :md="12" class="metric-column">
        <metric-card
          class="metric-card-wrapper"
          title="步行数据"
          icon="Walking"
          theme-color="#FF9F43"
          :items="[
            { label: '日均步数', value: report.dailySteps },
            { label: '日均距离(km)', value: report.dailyDistance }
          ]"
        />
      </el-col>
      
      <!-- 睡眠情况卡片 -->
      <el-col :xs="24" :sm="24" :md="12" class="metric-column">
        <metric-card
          class="metric-card-wrapper"
          title="睡眠情况"
          icon="Moon"
          theme-color="#8E44AD"
          :items="[
            { label: '平均睡眠时长(小时)', value: report.averageSleepDuration },
            { label: '深睡比例(%)', value: report.deepSleepPercentage },
            { label: '浅睡比例(%)', value: report.lightSleepPercentage },
            { label: 'REM比例(%)', value: report.remSleepPercentage },
            { label: '睡眠质量', value: report.sleepQuality }
          ]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import MetricCard from './MetricCard.vue'

export default {
  name: 'HealthMetrics',
  components: {
    MetricCard
  },
  props: {
    report: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.health-metrics {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
    
    &:hover {
      background: #909399;
    }
  }

  .metric-column {
    margin-bottom: 24px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
  }

  .metric-card-wrapper {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background: white;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  .mt-24 {
    margin-top: 24px;
  }

  // 响应式布局调整
  @media (max-width: 768px) {
    padding: 16px;
    
    .metric-column {
      margin-bottom: 16px;
    }
    
    .mt-24 {
      margin-top: 16px;
    }
  }

  // 添加卡片进入动画
  .el-col {
    animation: slideIn 0.5s ease-out forwards;
    opacity: 0;
    
    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>