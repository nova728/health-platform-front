<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
</script>

<!-- src/views/WebIntroduction.vue -->
<template>
  <div class="web-intro">
    <div class="about-content">
      <!-- ✅ 返回按钮与标题组合 -->
      <div class="web-header">
        <el-button class="back-button" link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <h1>关于健康生活平台</h1>
      <p>
        健康生活平台致力于为用户提供一站式的健康管理服务，包括健康评估、数据追踪、疾病预警、营养建议等多项功能。我们结合现代科技和医学知识，为用户打造全面、科学的健康管理体验。
      </p>
      <h2>我们的使命</h2>
      <p>
        提高全民健康意识，促进主动健康管理。我们希望通过科技手段，帮助用户更便捷地获取健康信息并做出正确决策。
      </p>
      <h2>主要功能</h2>
      <ul>
        <li>健康数据可视化管理</li>
        <li>个性化健康评估与建议</li>
        <li>慢性病风险预警</li>
        <li>生活习惯跟踪与优化</li>
        <li>专家远程咨询服务（即将上线）</li>
      </ul>
      <h2>联系我们</h2>
      <p>
        如有任何问题或合作意向，欢迎通过以下方式与我们联系：
      </p>
      <p>📞 电话：400-123-4567</p>
      <p>✉️ 邮箱：contact@healthlife.com</p>
    </div>
  </div>
</template>

<style scoped>
.web-intro {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: "Helvetica Neue", sans-serif;
  color: #333;


  /* 背景样式 */
  background-image: url('@/assets/images/health-bg.jpg'); /* 替换为你的图片路径 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 页面滚动时背景不动（可选） */

  /* 添加浅色半透明遮罩，提升文字可读性 */
  background-color: rgba(255, 255, 255, 0.85);
  background-blend-mode: lighten;
  border-radius: 12px;
}

.about-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #409EFF;
}

.about-content h2 {
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.about-content p {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 10px;
}

.about-content ul {
  margin-left: 20px;
  list-style-type: disc;
  font-size: 16px;
}

.about-content li {
  margin-bottom: 6px;
}

/* 标题行容器：按钮 + 标题并列 */
.web-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

/* 返回按钮样式统一 */
.back-button {
  font-size: 14px;
  color: #409eff;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.back-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #f0f9ff;
}


</style>