<template>
  <div class="nutrition-chart-container">
    <div class="nutrition-chart" ref="chartContainer">
      <div ref="chartRef" class="chart-content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  loading: Boolean,
  unit: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
const chartContainer = ref(null)
let chart = null

const initChart = () => {
  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>
                  实际摄入: ${params[0].value}${props.unit}<br/>
                  建议摄入: ${params[1].value}${props.unit}`
      },
    },
    legend: {
      data: ['实际摄入', '建议摄入'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.chartData.dates,
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: props.unit,
      nameLocation: 'end',
      nameGap: 10,
      nameTextStyle: {
        align: 'right'
      }
    },
    series: [
      {
        name: '实际摄入',
        type: 'bar',
        data: props.chartData.actual,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '建议摄入',
        type: 'line',
        data: props.chartData.recommended,
        itemStyle: {
          color: '#909399'
        }
      }
    ]
  }

  chart.setOption(option)
}

// 处理图表大小调整
const handleResize = () => {
  if (chart && chartContainer.value) {
    const { width, height } = chartContainer.value.getBoundingClientRect()
    chartRef.value.style.width = `${width}px`
    chartRef.value.style.height = `${height}px`
    chart.resize()
  }
}

onMounted(() => {
  initChart()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})

watch(() => props.chartData, () => {
  initChart()
}, { deep: true })

// 监听容器大小变化
const resizeObserver = new ResizeObserver(handleResize)

onMounted(() => {
  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
</script>

<style scoped>
.nutrition-chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
}

.nutrition-chart {
  flex: 1;
  min-height: 350px;
  position: relative;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
}

.chart-content {
  width: 100%;
  height: 100%;
  min-height: 350px;
}

/* 添加图表容器的hover效果 */
.nutrition-chart:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* 加载状态样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}
</style>