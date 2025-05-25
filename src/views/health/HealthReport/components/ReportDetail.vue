<template>
  <div class="report-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="总体评分">
        {{ report.overallScore }}分
      </el-descriptions-item>
      <el-descriptions-item label="BMI指数">
        {{ report.bmi?.toFixed(1) }} ({{ report.bmiStatus }})
      </el-descriptions-item>
      <el-descriptions-item label="血压状态">
        {{ report.systolic }}/{{ report.diastolic }}mmHg
        ({{ report.bloodPressureStatus }})
      </el-descriptions-item>
      <el-descriptions-item label="心率">
        {{ report.heartRate }}次/分 ({{ report.heartRateStatus }})
      </el-descriptions-item>
      <el-descriptions-item label="睡眠质量">
        {{ report.sleepQuality }}
      </el-descriptions-item>
      <el-descriptions-item label="运动达标">
        {{ report.exerciseGoalAchieved ? '是' : '否' }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="suggestions-section">
      <h4>健康建议</h4>
      <el-card v-if="healthSuggestions.length">
        <template v-for="(suggestion, index) in healthSuggestions" :key="index">
          <p>{{ suggestion }}</p>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const healthSuggestions = computed(() => {
  try {
    return JSON.parse(props.report.healthSuggestions || '[]')
  } catch (e) {
    return []
  }
})
</script>