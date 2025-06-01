<script setup lang="ts">
import {ArrowLeft} from "@element-plus/icons-vue";
</script>

<<template>
  <div class="page-wrapper">
    <div class="agreement-card">
      <!-- ✅ 返回按钮与标题 -->
      <div class="guide-header">
        <el-button class="back-button" link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <h1 class="main-title">综合健康管理网站服务协议</h1>

      <section>
        <h2>一、协议双方</h2>
        <p>甲方（服务接受方）：____________________</p>
        <p>乙方（服务提供方）：融护智领综合健康网站</p>
      </section>

      <section>
        <h2>二、服务内容</h2>
        <ol>
          <li><strong>健康评估与咨询：</strong>乙方根据甲方提供的数据评估健康并提供咨询。</li>
          <li><strong>健康管理计划制定：</strong>提供个性化饮食、运动、心理建议。</li>
          <li><strong>健康数据监测与分析：</strong>提供工具监测健康并预警。</li>
          <li><strong>健康报告与改善建议：</strong>生成健康报告并提出改善建议。</li>
          <li><strong>其他服务：</strong>如体检预约、远程会诊、住院协助等。</li>
        </ol>
      </section>

      <section>
        <h2>三、服务期限</h2>
        <p>自签署之日起生效，有效期为____年，期满自动续约，除非提前终止。</p>
      </section>

      <section>
        <h2>四、服务费用</h2>
        <ol>
          <li>服务费用为人民币____元整（大写：____元整）。</li>
          <li>甲方可选择按月支付或一次性支付。</li>
        </ol>
      </section>

      <section>
        <h2>五、双方权利与义务</h2>
        <h3>甲方的权利与义务</h3>
        <ul>
          <li>有权获得乙方承诺的服务。</li>
          <li>有保护个人隐私的权利。</li>
          <li>应如实提供健康数据并及时更新。</li>
          <li>应遵守乙方制度，维护平台形象。</li>
        </ul>

        <h3>乙方的权利与义务</h3>
        <ul>
          <li>应提供高质量的健康管理服务。</li>
          <li>保障服务的稳定性和数据安全。</li>
          <li>有权要求甲方配合提供必要信息。</li>
          <li>应保守甲方隐私和商业秘密。</li>
        </ul>
      </section>

      <section>
        <h2>六、违约责任</h2>
        <ul>
          <li>甲方逾期付款，每日按未付款____%支付滞纳金。</li>
          <li>乙方未履约须退费并赔偿损失。</li>
        </ul>
      </section>

      <section>
        <h2>七、协议的变更与终止</h2>
        <ul>
          <li>协议变更须双方书面确认。</li>
          <li>一方可提前____天书面通知终止。</li>
          <li>严重违约可立即终止协议。</li>
        </ul>
      </section>

      <section>
        <h2>八、争议解决</h2>
        <p>协商不成时，可向乙方所在地人民法院提起诉讼。</p>
      </section>

      <section>
        <h2>九、其他</h2>
        <ul>
          <li>协议一式两份，双方各执一份。</li>
          <li>未尽事宜可另行协商解决。</li>
        </ul>
        <p>甲方（签字或盖章）：____________________</p>
        <p>乙方（签字或盖章）：____________________</p>
        <p>签订日期：____年____月____日</p>
      </section>
    </div>
  </div>
</template>


<style scoped>
.page-wrapper {
  min-height: 100vh;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 32px 16px;
  box-sizing: border-box;
}

.agreement-card {
  background: #fff;
  max-width: 960px;
  margin: 0 auto;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #333;
  font-family: "Helvetica Neue", sans-serif;
  line-height: 1.75;
  box-sizing: border-box;
  margin-bottom: 64px; /* 添加底部边距 */
}

.main-title {
  font-size: 30px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-bottom: 36px;
}

h2 {
  font-size: 22px;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #2c3e50;
  border-left: 4px solid #409EFF;
  padding-left: 12px;
}

h3 {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 10px;
  color: #34495e;
}

p {
  margin: 6px 0;
  font-size: 16px;
}

ul, ol {
  padding-left: 24px;
  font-size: 16px;
}

li {
  margin-bottom: 8px;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .agreement-card {
    padding: 20px 16px;
  }

  .main-title {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 17px;
  }
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
