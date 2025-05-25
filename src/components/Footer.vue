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
            <a href="#">平台介绍</a>
            <a href="#">服务协议</a>
            <a href="#">隐私政策</a>
          </div>
          <div class="link-group">
            <h4>帮助中心</h4>
            <a href="#">使用指南</a>
            <a href="#">常见问题</a>
            <a href="#">联系我们</a>
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
</template>

<script setup>
// 版权信息直接写在模板中,更容易维护
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