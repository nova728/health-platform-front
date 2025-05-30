<template>
  <div class="privacy-policy-container">
    <div class="privacy-policy-content">
      <!--新增返回按钮-->
      <div class="privacy-header">
        <el-button class="back-button" link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <h1>综合健康管理网站隐私政策</h1>
      <section>
        <h2>一、引言</h2>
        <p>我们非常重视并承诺保护您在使用我们网站和服务时的隐私。本隐私政策详细阐述了我们如何收集、使用、存储和保护您的个人信息。</p>
      </section>

      <section>
        <h2>二、我们收集的信息</h2>
        <h3>（一）个人信息</h3>
        <ul>
          <li>姓名、性别、年龄、联系方式（电话号码、电子邮箱等）；</li>
          <li>健康相关信息（如病史、体检报告、健康监测数据等）；</li>
          <li>用于支付服务费用的支付信息（如银行卡号、第三方支付账号等）。</li>
        </ul>
        <h3>（二）非个人信息</h3>
        <p>我们还可能收集一些非个人信息，例如您的设备信息、IP地址、浏览器类型、访问时间等，这些信息主要用于优化网站性能和用户体验。</p>
      </section>

      <section>
        <h2>三、信息收集方式</h2>
        <p>我们通过以下方式收集信息：</p>
        <ul>
          <li>您在注册账户、填写健康问卷、上传健康数据时主动提供的信息；</li>
          <li>您使用我们的服务过程中，我们通过技术手段（如服务器日志、cookies等）自动收集的信息。</li>
        </ul>
      </section>

      <section>
        <h2>四、我们如何使用您的信息</h2>
        <h3>（一）提供服务</h3>
        <p>我们使用您的个人信息为您提供个性化的健康管理服务，包括但不限于健康评估、健康管理计划制定、健康数据监测与分析等。</p>
        <h3>（二）沟通与通知</h3>
        <p>我们可能会使用您的联系方式与您沟通，例如发送服务提醒、健康建议、通知您服务更新等。</p>
        <h3>（三）数据分析与改进</h3>
        <p>我们可能会对收集的信息进行分析，以改进我们的服务质量和用户体验。</p>
      </section>

      <section>
        <h2>五、信息存储与保护</h2>
        <h3>（一）存储</h3>
        <p>我们将您的个人信息存储在安全的服务器上，并采取加密等技术措施保护您的数据。我们只会在达成本隐私政策所述目的所需的期限内保留您的个人信息，除非需要延长保留期或受到法律的允许。</p>
        <h3>（二）保护措施</h3>
        <ul>
          <li>在您的浏览器与“服务”之间交换数据时采用SSL加密保护；</li>
          <li>部署访问控制机制，确保只有授权人员才可访问个人信息；</li>
          <li>定期举办安全和隐私保护培训课程，加强员工对保护个人信息重要性的认识。</li>
        </ul>
      </section>

      <section>
        <h2>六、信息共享与披露</h2>
        <h3>（一）第三方服务提供商</h3>
        <p>我们可能会与一些第三方服务提供商共享您的个人信息，这些提供商为我们提供技术支持、数据分析、客户服务等服务，但我们会要求他们严格遵守本隐私政策。</p>
        <h3>（二）法律要求</h3>
        <p>在法律要求的范围内，我们可能会披露您的个人信息，例如与正在进行的或可能的法律程序有关时。</p>
        <h3>（三）其他情况</h3>
        <p>未经您的明确同意，我们不会将您的个人信息提供给任何第三方以供其或任何其他第三方用于直接营销。</p>
      </section>

      <section>
        <h2>七、数据安全事件处理</h2>
        <p>如果发生数据泄露等安全事件，我们将按照法律法规的要求，及时向您告知安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施等，并将事件相关情况以邮件、信函、电话、推送通知等方式告知您。</p>
      </section>

      <section>
        <h2>八、您的权利</h2>
        <h3>（一）访问与更正</h3>
        <p>您有权访问、更正您的个人信息。您可以通过登录您的账户查看和修改您的个人信息，或通过本隐私政策提供的联系方式与我们联系。</p>
        <h3>（二）删除</h3>
        <p>在某些情况下，您有权要求我们删除您的个人信息。例如，如果您认为我们持有的关于您的信息不准确或不完整，或您不再需要我们提供服务。</p>
        <h3>（三）数据可携性</h3>
        <p>您有权要求我们将您的个人信息转移给另一方。</p>
      </section>

      <section>
        <h2>九、未成年人隐私保护</h2>
        <p>我们的网站和服务不面向未成年人。如果您是未成年人，请不要向我们提供任何个人信息。</p>
      </section>

      <section>
        <h2>十、隐私政策的更新</h2>
        <p>我们可能会根据法律法规的变化或业务需求对本隐私政策进行更新。我们会通过网站公告、电子邮件等方式通知您更新的内容。</p>
      </section>

      <section>
        <h2>十一、联系我们</h2>
        <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式与我们联系：</p>
        <ul>
          <li>电子邮箱：[具体邮箱地址]</li>
          <li>电话：[具体电话号码]</li>
          <li>邮寄地址：[具体地址]</li>
        </ul>
        <p>我们会在合理时间内回复您的请求。</p>
        <p>请注意，本隐私政策仅适用于我们网站和服务，不涵盖任何第三方网站或服务。</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped>
.privacy-policy-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: hidden;
}

.privacy-policy-content {
  flex: 1;
  max-width: 960px;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 80px; /* ✅ 增加底部边距 */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  line-height: 1.8;
  color: #333;
  scroll-behavior: smooth;
}

.privacy-policy-content h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 36px;
  text-align: center;
  color: #2c3e50;
}

.privacy-policy-content h2 {
  font-size: 22px;
  margin: 28px 0 12px;
  color: #1f2d3d;
}

.privacy-policy-content h3 {
  font-size: 18px;
  margin: 18px 0 8px;
  color: #34495e;
}

.privacy-policy-content p,
.privacy-policy-content ul {
  font-size: 15px;
  margin-bottom: 14px;
}

.privacy-policy-content ul {
  padding-left: 24px;
}

.privacy-policy-content li {
  list-style: disc;
}

/*返回按钮*/
/* 返回按钮与标题对齐 */
.privacy-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  gap: 12px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #f0f9ff;
}

</style>
