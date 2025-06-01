<template>
  <div class="faq-container">
    <div class="faq-content">
      <!--返回按钮-->
      <div class="faq-header">
        <div class="back-button" @click="$router.push('/')">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span>返回</span>
        </div>
      </div>
      <!--FAQ主体内容-->
      <section v-for="(section, index) in faqs" :key="index" class="faq-section">
        <h2 class="faq-title">{{ section.title }}</h2>
        <ul>
          <li v-for="(item, idx) in section.questions" :key="idx" class="faq-item">
            <strong class="faq-question">{{ item.q }}</strong>
            <p class="faq-answer">{{ item.a }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'
export default {
  name: 'FrequentQuestion',
  components:{
    ArrowLeft
  },
  data() {
    return {
      faqs: [
        {
          title: '关于用户注册与登录',
          questions: [
            { q: '如何注册成为会员？', a: '您可以通过点击网站首页的“注册”按钮，填写手机号码或电子邮箱地址...' },
            { q: '忘记密码了怎么办？', a: '请在登录页面点击“忘记密码”，然后按照提示输入注册时使用的手机号码或电子邮箱地址...' },
            { q: '为什么我无法登录？', a: '可能有以下几种原因：账号密码错误、账号冻结、网络不稳定...' },
            { q: '注册手机号码已停用如何找回账号？', a: '请通过“账号申诉”入口提交相关信息，我们的客服人员会尽快为您核实处理。' }
          ]
        },
        {
          title: '关于健康数据录入与管理',
          questions: [
            { q: '我可以录入哪些健康数据？', a: '身高、体重、血压、血糖、心率、步数、睡眠时间、饮食记录等。' },
            { q: '如何录入健康数据？', a: '登录后进入“健康数据”页面，点击数据类型填写或通过设备自动同步。' },
            { q: '我可以删除或修改已录入的数据吗？', a: '可以，进入“健康数据”页面后选择编辑或删除相应记录。' },
            { q: '我的健康数据安全吗？', a: '我们使用加密技术并遵守相关法律保障您的数据安全，仅授权人员可访问。' }
          ]
        },
        {
          title: '关于健康评估与分析',
          questions: [
            { q: '网站的健康评估是如何进行的？', a: '基于录入数据与专业算法模型综合评估健康状态，提供评分与建议。' },
            { q: '健康评估结果准确吗？', a: '具有参考价值，但不能替代医生诊断，建议结合专业意见。' },
            { q: '我可以重新进行健康评估吗？', a: '可以，在更新数据后点击“重新评估”即可。' },
            { q: '为什么我没有收到健康风险提示？', a: '可能未达到提示标准，如有不适建议及时就医。' }
          ]
        },
        {
          title: '关于健康咨询与服务',
          questions: [
            { q: '我可以在线咨询医生吗？', a: '可以，登录后可在“在线咨询”页面选择医生进行提问。' },
            { q: '咨询服务收费吗？', a: '根据医生等级和咨询时长收费，部分服务可能免费。' },
            { q: '如何预约线下体检或服务？', a: '在“医疗服务”页面查找机构并提交预约申请。' },
            { q: '健康管理套餐包括哪些服务？', a: '包含数据监测、健康评估、咨询、体检、讲座等内容。' }
          ]
        },
        {
          title: '关于会员权益与优惠',
          questions: [
            { q: '会员有哪些特权？', a: '优先预约、咨询优惠、健康报告、专属活动、积分兑换等。' },
            { q: '如何升级会员？', a: '通过购买会员套餐或参与升级活动进行升级。' },
            { q: '会员积分如何获取和使用？', a: '通过录入数据、参与活动、购买服务等方式获得，可用于兑换和抵扣。' },
            { q: '如何查看优惠券？', a: '在“我的优惠券”页面可查看领取与使用记录。' }
          ]
        },
        {
          title: '关于网站使用与技术支持',
          questions: [
            { q: '网站支持哪些浏览器？', a: '支持 Chrome、Firefox、Edge、Safari 等主流浏览器。' },
            { q: '页面加载缓慢或打不开怎么办？', a: '检查网络、刷新、清缓存或联系客服反馈。' },
            { q: '可以将网站添加到手机桌面吗？', a: '可以，根据浏览器操作选择“添加到桌面”或“安装为应用”。' },
            { q: '如何反馈问题或建议？', a: '通过页面底部“联系我们”或“问题反馈”提交意见。' }
          ]
        }
      ]
    }
  }
}
</script>

<style scoped>
/* 外层容器支持滚动 */
.faq-container {
  max-height: 100vh;
  overflow-y: auto;
  padding: 16px 16px 80px; /* 原本顶部为32px，改为10px */
  background-color: #f4f6f8;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

/* 内容盒子 */
.faq-content {
  max-width: 960px;
  width: 100%;
  padding: 10px 40px 48px; /* 原48px改为24px 更贴近顶部导航栏 */
  box-sizing: border-box;
}

/* 每个板块间隔 */
.faq-section + .faq-section {
  margin-top: 48px;
}

/* 标题样式 */
.faq-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  border-left: 4px solid #409EFF;
  padding-left: 12px;
}

/* 列表清除默认样式 */
.faq-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 单个问答条目 */
.faq-item {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

/* 问题字体样式 */
.faq-question {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

/* 答案字体样式 */
.faq-answer {
  margin: 0;
  color: #555;
  line-height: 1.7;
  font-size: 15px;
}

/*返回按钮*/
.faq-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 32px;
  margin-top: 0; /* 避免多余空隙 */
}

/* 返回按钮样式 */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  color: #409EFF;
  border: 1px solid #dcdfe6;
  padding: 6px 14px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #ecf5ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  color: #337ecc;
}

/* 图标 */
.back-icon {
  font-size: 16px;
}
</style>