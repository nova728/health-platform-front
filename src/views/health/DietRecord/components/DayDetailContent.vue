<template>
    <div class="day-detail">
      <div class="nutrition-item" v-for="item in nutritionItems" :key="item.label">
        <span class="label">{{ item.label }}</span>
        <el-progress 
          :percentage="item.percentage" 
          :color="getProgressColor"
        />
        <span class="value">{{ item.value }}{{ item.unit }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    nutritionData: {
      type: Object,
      required: true
    }
  })
  
  const nutritionItems = computed(() => [
    {
      label: '热量',
      percentage: props.nutritionData.caloriesPercentage,
      value: props.nutritionData.totalCalories,
      unit: 'kcal'
    },
    {
      label: '碳水',
      percentage: props.nutritionData.carbsPercentage,
      value: props.nutritionData.totalCarbs,
      unit: 'g'
    },
    {
      label: '蛋白质',
      percentage: props.nutritionData.proteinPercentage,
      value: props.nutritionData.totalProtein,
      unit: 'g'
    },
    {
      label: '脂肪',
      percentage: props.nutritionData.fatPercentage,
      value: props.nutritionData.totalFat,
      unit: 'g'
    }
  ])
  
  const getProgressColor = (percentage) => {
    if (percentage < 80) return '#67C23A'
    if (percentage < 100) return '#E6A23C'
    return '#F56C6C'
  }
  </script>