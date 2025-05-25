<template>
  <el-card class="metric-card" :style="cardStyle">
    <template #header>
      <div class="card-header" :style="headerStyle">
        <div class="header-content">
          <el-icon :size="24" class="card-icon">
            <component :is="icon" />
          </el-icon>
          <span class="card-title">{{ title }}</span>
        </div>
        <div class="header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>
    
    <div class="metric-list">
      <transition-group 
        name="metric-fade" 
        tag="div"
        appear
      >
        <div v-for="(item, index) in items" 
             :key="index"
             class="metric-item"
             :style="getMetricStyle(index)"
        >
          <div class="metric-label">{{ item.label }}</div>
          <div class="metric-value" :style="{ color: themeColor }">
            {{ item.value || '-' }}
          </div>
          <div v-if="item.status" 
               class="metric-status"
               :class="getStatusClass(item.status)"
          >
            {{ item.status }}
          </div>
        </div>
      </transition-group>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    icon: {
      type: String,
      default: 'DataLine'
    },
    themeColor: {
      type: String,
      default: '#409EFF'
    }
  },
  computed: {
    cardStyle() {
      return {
        '--theme-color': this.themeColor,
        '--theme-color-light': `${this.themeColor}1A` // 10% opacity
      }
    },
    headerStyle() {
      return {
        borderBottom: `2px solid ${this.themeColor}`
      }
    }
  },
  methods: {
    getStatusClass(status) {
      const statusMap = {
        '正常': 'status-normal',
        '偏高': 'status-warning',
        '偏低': 'status-warning',
        '超重': 'status-warning',
        '肥胖': 'status-danger',
        '偏瘦': 'status-warning'
      }
      return statusMap[status] || ''
    },
    getMetricStyle(index) {
      return {
        animationDelay: `${index * 0.1}s`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.metric-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    .card-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .card-header {
    padding: 16px 20px;
    margin: -20px -20px 20px;
    background: var(--theme-color-light);
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .card-icon {
      color: var(--theme-color);
      transition: transform 0.3s ease;
    }
    
    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .metric-list {
    .metric-item {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: #f8f9fa;
      transition: all 0.3s ease;
      animation: slideIn 0.5s ease-out forwards;
      
      &:hover {
        transform: translateX(5px);
        background: var(--theme-color-light);
      }
      
      .metric-label {
        color: #606266;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .metric-value {
        font-size: 24px;
        font-weight: 600;
        margin: 5px 0;
        transition: color 0.3s ease;
      }
      
      .metric-status {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
        margin-top: 8px;
        
        &.status-normal {
          background-color: #67C23A;
          color: white;
        }
        
        &.status-warning {
          background-color: #E6A23C;
          color: white;
        }
        
        &.status-danger {
          background-color: #F56C6C;
          color: white;
        }
      }
    }
  }
}

// 动画效果
.metric-fade-enter-active,
.metric-fade-leave-active {
  transition: all 0.3s ease;
}

.metric-fade-enter-from,
.metric-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .metric-card {
    .card-header {
      padding: 12px 16px;
      
      .card-title {
        font-size: 16px;
      }
    }
    
    .metric-list {
      .metric-item {
        padding: 10px 12px;
        
        .metric-value {
          font-size: 20px;
        }
      }
    }
  }
}
</style>