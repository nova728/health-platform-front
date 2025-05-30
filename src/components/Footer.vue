<template>
  <div class="app-footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-logo">
          <img src="/src/assets/images/logo.png" alt="Health Platform" class="logo"/>
          <span class="platform-name">健康生活平台</span>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <router-link to="/web-introduction">平台介绍</router-link>
            <router-link to="/service-agreement">服务协议</router-link>
            <router-link to="/privacy-policy">隐私政策</router-link>
          </div>
          <div class="link-group">
            <h4>帮助中心</h4>
            <router-link to="/usage-guide">使用指南</router-link>
            <router-link to="/frequent-question">常见问题</router-link>
            <a href="javascript:void(0)" @click="showContact=true">联系我们</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="copyright">
          Copyright © 2023-2024 健康生活平台
          <span class="divider">|</span>
          <span>All Rights Reserved</span>
        </div>
        <div class="powered-by">
          Powered by <span class="company">智慧医疗实验室</span>
        </div>
      </div>
    </div>
  </div>
  <!-- 联系我们弹窗 -->
  <el-dialog v-model="showContact" title="联系我们" width="400px" center>
    <p>📞 电话：400-123-4567</p>
    <p>✉️ 邮箱：contact@healthlife.com</p>
    <template #footer>
      <el-button type="primary" @click="showContact=false">知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
// 版权信息直接写在模板中,更容易维护

import {ref} from 'vue'
import {ElDialog,ElButton} from 'element-plus'
const showContact = ref(false)
</script>

<style scoped>
.app-footer {
  background-color: #f8f9fa;
  width: 100%;
  padding: 40px 0 20px;
  border-top: 1px solid #e7e7e7;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  width: auto;
}

.platform-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-group h4 {
  font-size: 16px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.link-group a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #409EFF;
}

.footer-bottom {
  padding-top: 20px;
  border-top: 1px solid #e7e7e7;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.copyright {
  margin-bottom: 8px;
}

.divider {
  margin: 0 12px;
}

.powered-by {
  font-size: 13px;
}

.company {
  font-weight: 600;
  color: #606266;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .footer-main {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .footer-links {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .link-group {
    align-items: center;
  }
}
</style>