<template>
  <div class="health-center-container">
    <div class="health-center"  :class="{ 'full-width': !showSideMenu }">
      <div class="side-menu" v-show="showSideMenu">
        <el-menu
            class="el-menu-vertical"
            :default-active="activeIndex"
            @select="handleSelect">
          <el-menu-item index="1">
            <el-icon><DataLine /></el-icon>
            <span>健康数据</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><Timer /></el-icon>
            <span>运动记录</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Calendar /></el-icon>
            <span>饮食记录</span>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><DocumentCopy /></el-icon>
            <span>健康报告</span>
          </el-menu-item>
          <el-menu-item index="5">
            <template #title>
              <el-icon><FirstAidKit /></el-icon>
              <span>用药管理</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="content-area">
        <router-view></router-view>
      </div>
    </div>

    <!-- 添加悬浮气泡组件 -->
    <!--    <DraggableBubble />-->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DraggableBubble from '@/components/DraggableBubble.vue'
import { DataLine, Timer, Calendar, DocumentCopy,FirstAidKit } from '@element-plus/icons-vue'

const activeIndex = ref('1')
const router=useRouter()
const route = useRoute()
console.log('DraggableBubble component:', DraggableBubble)

const showSideMenu = computed(() => {
  return !route.path.includes('health-competition')
})

const handleSelect = async (key) => {
  try {
    activeIndex.value = key
    switch(key) {
      case '1':
        await router.push('/healthCenter/health-data')
        break
      case '2':
        await router.push('/healthCenter/exercise-record')
        break
      case '3':
        await router.push('/healthCenter/diet-record')
        break
      case '4':
        await router.push('/healthCenter/health-report')
        break
      case '5':
        await router.push('/healthCenter/medicine')
    }
  }catch (err) {
    console.error('Navigation error:', err)
  }
}
</script>

<style scoped>

.full-width .content-area {
  padding: 0;
}

.full-width {
  background-color: transparent;
  box-shadow: none;
}
.health-center-container {
  height: 100%;
  padding: 20px 40px;
  background-color: #f5f7fa;
  box-sizing: border-box;
  overflow: hidden;
}

.health-center {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden; /* 确保内容不会溢出圆角边框 */
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.side-menu {
  width: 220px;
  height: 100%;
  background-color: white;
  border-right: 1px solid #e6e6e6;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-menu-item {
  margin: 4px 0;
  border-radius: 4px;
}

.el-menu-item:hover {
  background-color: #f0f2f5;
}

.content-area {
  flex: 1;
  padding: 24px;
  background-color: white;
  overflow: hidden;
  position: relative;
}

.content-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  height: calc(100% - 48px); /* 减去padding高度 */
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.05);
}

h2 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

/* 添加图标和文字的间距 */
.el-menu-item [class^="el-icon-"] {
  margin-right: 12px;
}

/* 菜单项文字样式 */
.el-menu-item span {
  font-size: 15px;
  color: #606266;
}

/* 选中状态的菜单项样式 */
.el-menu-item.is-active {
  background-color: #f0f2f5 !important;
  color: #409EFF;
}

/* 添加过渡效果 */
.health-center, .content-section {
  transition: all 0.3s ease;
}
</style>