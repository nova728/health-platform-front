<template>
  <div class="usage-guide-container">
    <div class="usage-guide-content">
      <!-- ✅ 返回按钮与标题 -->
      <div class="guide-header">
        <el-button class="back-button" link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <section>
        <h1 class="title">综合健康管理网站使用指南</h1>
        <p class="paragraph">欢迎使用本综合健康管理网站！本网站致力于为用户提供全方位的健康数据管理与分析服务，帮助您科学管理健康、优化生活方式。</p>
      </section>

      <section>
        <h2 class="section-title">一、注册与登录</h2>
        <h3 class="sub-title">1. 注册账户</h3>
        <ul class="list">
          <li>访问网站首页，点击右上角【注册】按钮。</li>
          <li>填写基本信息（姓名、邮箱/手机号、密码等），阅读并同意用户协议后提交。</li>
          <li>完成邮箱/短信验证码验证，注册成功。</li>
        </ul>
        <h3 class="sub-title">2. 登录账户</h3>
        <ul class="list">
          <li>点击【登录】，输入注册时填写的账号与密码即可进入系统。</li>
          <li>支持找回密码与多设备登录。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">二、个人信息与健康档案管理</h2>
        <ul class="list">
          <li><strong>健康档案填写：</strong>填写性别、年龄、身高、体重等，可补充病史、过敏史、家族遗传病等详细信息。</li>
          <li><strong>信息更新与安全：</strong>所有信息可随时修改，支持加密保护与隐私设置。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">三、健康数据录入与跟踪</h2>
        <ul class="list">
          <li><strong>手动录入：</strong>支持血压、血糖、心率、睡眠等指标的每日记录和历史查看。</li>
          <li><strong>设备同步：</strong>绑定智能穿戴设备，自动同步数据。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">四、数据分析与健康报告</h2>
        <ul class="list">
          <li><strong>可视化图表：</strong>查看健康趋势图，支持按天/周/月查看。</li>
          <li><strong>健康评估报告：</strong>生成BMI、疾病风险评估、生活建议等。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">五、健康计划与提醒</h2>
        <ul class="list">
          <li><strong>健康目标设置：</strong>设定减重、步数、睡眠等目标，系统自动规划任务。</li>
          <li><strong>智能提醒：</strong>设置喝水、用药、运动等提醒。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">六、专家咨询与服务预约</h2>
        <ul class="list">
          <li><strong>在线问诊：</strong>选择医生图文/语音/视频咨询。</li>
          <li><strong>服务预约：</strong>预约体检、门诊、营养咨询等服务。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">七、常见问题与技术支持</h2>
        <ul class="list">
          <li>访问【帮助中心】了解设备绑定、数据异常等常见问题。</li>
          <li>联系客服反馈问题，客服时间：工作日 9:00–18:00。</li>
        </ul>
      </section>

      <section>
        <h2 class="section-title">八、安全与隐私</h2>
        <ul class="list">
          <li>数据加密存储，严格遵守隐私政策。</li>
          <li>支持账号注销与数据授权管理。</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped>
.usage-guide-container {
  height: 100vh;
  overflow-y: auto;
  background-color: #f9fafb;
  padding: 20px 20px;
  box-sizing: border-box;
}

.usage-guide-content {
  max-width: 800px;
  margin: auto;
  padding-bottom: 100px;
}

.title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-top: 40px;
  margin-bottom: 16px;
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #374151;
}

.paragraph {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #4b5563;
  margin-bottom: 16px;
}

.list {
  padding-left: 1.25rem;
  color: #374151;
  font-size: 1rem;
  line-height: 1.75;
  margin-bottom: 16px;
}

.list li {
  margin-bottom: 6px;
}

/* 按钮 + 标题并列显示 */
.guide-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

/* 返回按钮样式 */
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
  background-color: #f0f9ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


</style>
