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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: {
        color: '#1e293b',
        fontSize: 14
      },
      padding: [16, 20],
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      formatter: function(params) {
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #10b981;">${params[0].name}</div>
                <div style="margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 8px;"></span>
                  实际摄入: <span style="font-weight: 600;">${params[0].value}${props.unit}</span>
                </div>
                <div>
                  <span style="display: inline-block; width: 10px; height: 10px; background: #64748b; border-radius: 50%; margin-right: 8px;"></span>
                  建议摄入: <span style="font-weight: 600;">${params[1].value}${props.unit}</span>
                </div>`
      },
    },
    legend: {
      data: ['实际摄入', '建议摄入'],
      bottom: 20,
      textStyle: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: 500
      },
      icon: 'circle',
      itemGap: 32,
      selectedMode: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.chartData.dates,
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#64748b',
        fontSize: 12,
        fontWeight: 500,
        margin: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
          width: 2
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: props.unit,
      nameLocation: 'end',
      nameGap: 15,
      nameTextStyle: {
        align: 'right',
        color: '#64748b',
        fontSize: 12,
        fontWeight: 600
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 500
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          width: 1,
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '实际摄入',
        type: 'bar',
        data: props.chartData.actual,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#10b981'
              },
              {
                offset: 1,
                color: '#059669'
              }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(16, 185, 129, 0.3)',
          shadowBlur: 8,
          shadowOffsetY: 4
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(16, 185, 129, 0.4)',
            shadowBlur: 12,
            shadowOffsetY: 6
          }
        },
        animationDelay: function (idx) {
          return idx * 50
        }
      },
      {
        name: '建议摄入',
        type: 'line',
        data: props.chartData.recommended,
        lineStyle: {
          color: '#64748b',
          width: 3,
          type: 'dashed'
        },
        itemStyle: {
          color: '#64748b',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          symbolSize: 12,
          itemStyle: {
            shadowColor: 'rgba(100, 116, 139, 0.3)',
            shadowBlur: 8
          }
        },
        animationDelay: function (idx) {
          return idx * 50 + 500
        }
      }
    ],
    animationEasing: 'cubicOut',
    animationDuration: 800
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
/* 图表容器主样式 */
.nutrition-chart-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* 图表主体样式 */
.nutrition-chart {
  flex: 1;
  min-height: 400px;
  position: relative;
  padding: 0;
  border-radius: 16px;
  background: white;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

/* 图表内容区域 */
.chart-content {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
}

/* 图表容器悬停效果 */
.nutrition-chart:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(16, 185, 129, 0.12);
}

/* 图表顶部装饰条 */
.nutrition-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  z-index: 1;
}

/* 图表右侧装饰条 */
.nutrition-chart::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.1) 100%);
  z-index: 1;
}

/* 加载状态样式美化 */
:deep(.el-loading-mask) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(8px);
}

:deep(.el-loading-spinner) {
  top: 50%;
  margin-top: -32px;
}

:deep(.el-loading-spinner .path) {
  stroke: #10b981;
  stroke-width: 3;
}

:deep(.el-loading-text) {
  color: #10b981;
  font-weight: 500;
  font-size: 14px;
  margin-top: 16px;
}

/* 图表内部样式调整 */
.chart-content canvas {
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nutrition-chart {
    min-height: 350px;
  }
  
  .chart-content {
    min-height: 350px;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .nutrition-chart {
    min-height: 300px;
    border-radius: 12px;
  }
  
  .chart-content {
    min-height: 300px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .nutrition-chart {
    min-height: 280px;
  }
  
  .chart-content {
    min-height: 280px;
    padding: 8px;
  }
}

/* 图表动画效果 */
.nutrition-chart {
  animation: chartFadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes chartFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 图表数据为空时的样式 */
.chart-content:empty::before {
  content: '暂无数据';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 16px;
  font-weight: 500;
}

/* 优化图表边框效果 */
.nutrition-chart {
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(16, 185, 129, 0.05);
}

.nutrition-chart:hover {
  box-shadow: 
    0 12px 48px rgba(16, 185, 129, 0.12),
    0 0 0 1px rgba(16, 185, 129, 0.2);
}
</style>