<template>
  <div class="developer-page">
    <h1 class="page-title">网站开发者</h1>
    <div class="developer-cards">
      <el-card
          v-for="dev in developers"
          :key="dev.id"
          class="developer-card"
          shadow="hover"
      >
        <img :src="dev.avatar" alt="Avatar" class="avatar" />
        <h2 class="name">{{ dev.name }}</h2>
        <p class="bio">{{ dev.bio }}</p>
        <div class="skills">
          <el-tag
              v-for="(skill, index) in dev.skills"
              :key="index"
              type="info"
              effect="light"
              class="skill-tag"
          >
            {{ skill }}
          </el-tag>
        </div>
        <div class="social-icons">
          <a v-for="icon in dev.socials" :key="icon.type" :href="icon.link" target="_blank">
            <img :src="icon.icon" :alt="icon.type" class="social-icon" />
          </a>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const developers = ref([
  {
    id: 1,
    name: '杨雪',
    avatar: '/src/assets/images/dev1.jpg',
    bio: '项目经理，负责协调和管理软件开发项目的全生命周期，包括需求分析、项目规划、资源调配、进度控制、风险管理及交付验收。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/AN8LwOmL8ifUZekYmQZcSOzinMe'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 2,
    name: '田纯溪',
    avatar: '/src/assets/images/dev2.jpg',
    bio: '产品经理，负责规划、设计、开发、推广和优化产品的关键角色，通过洞察市场、协调资源、把控进度以及推动产品迭代，确保产品满足用户需求并实现商业目标。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/H9DFwpFEsiQcOxksGfVcdJ47nRh'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 3,
    name: '王佩瑶',
    avatar: '/src/assets/images/dev3.jpg',
    bio: '后端工程师，负责网站或App背后的业务逻辑处理、数据库操作、接口开发等，擅长 Vue3、Node.js 和 Spring Boot。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/HRSKwEutRiimUmkMGJrctj5xntb'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 4,
    name: '史佳灵',
    avatar: '/src/assets/images/dev4.jpg',
    bio: '后端工程师，负责网站或App背后的业务逻辑处理、数据库操作、接口开发等，擅长 Vue3、Node.js 和 Spring Boot，致力于构建用户友好且高性能的 Web 应用。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/Prx2wo1OOiZruIkuRxdc5Jjrnmf'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' },

    ]
  },
  {
    id: 5,
    name: '王雪',
    avatar: '/src/assets/images/dev5.jpg',
    bio: '全栈工程师，擅长 Vue3、Node.js 和 Spring Boot，致力于构建用户友好且高性能的 Web 应用。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/IOmVwsHRzisC3hk4IiPcPGDRnZc'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 6,
    name: '牟俊芳',
    avatar: '/src/assets/images/dev6.jpg',
    bio: '前端工程师，负责用户能直接看到和交互的网页或应用部分，热爱 UI 设计和交互体验，追求代码与美感的融合。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL','HTML','CSS','接口调用(Axios、Fetch)等'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/HGGVw3n3himollkPrsPcfcbcnKc'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 7,
    name: '肖昊晴',
    avatar: '/src/assets/images/dev7.jpg',
    bio: '前端工程师，负责用户能直接看到和交互的网页或应用部分，热爱 UI 设计和交互体验，追求代码与美感的融合。',
    skills: ['Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL','HTML','CSS','接口调用(Axios、Fetch)等'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/docx/OKjadlDEdocyztxEKIZchvK7ngg'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 8,
    name: '张涵琪',
    avatar: '/src/assets/images/dev8.jpg',
    bio: '程序测试员，负责保证产品质量，主要负责需求分析测试、单元测试、集成测试、系统测试、全程测试自动化，是“守门员“角色。',
    skills: ['c++','python','selenium','postman','Vue3', 'Element Plus', 'JavaScript', 'Node.js', 'Java', 'MySQL'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/GkhtwSuynioFcDkb1YEcumggn8e'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/zhangwei' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:zhangwei@example.com' }
    ]
  },
  {
    id: 9,
    name: '景天琪',
    avatar: '/src/assets/images/dev9.jpg',
    bio: 'UI设计师，负责把产品的功能和交互设计“变好看”，让界面视觉风格统一、简洁、易用。',
    skills: ['Figma','Sketch','Adobe','XD','Adobe','Illustrator','Adobe','Photoshop'],
    socials: [
      {type: 'feishu', icon: '/src/assets/images/feishu.png', link: 'https://diegodad.feishu.cn/wiki/GbLKw1WthicXcokPxd0c11QInPb'},
      { type: 'github', icon: '/src/assets/images/github.png', link: 'https://github.com/liting' },
      { type: 'email', icon: '/src/assets/images/email.png', link: 'mailto:liting@example.com' }
    ]
  }
]);
</script>

<style scoped>
.developer-page {
  padding: 40px 20px 60px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f9f9f9;
  max-height: 100vh; /* 限制高度为视口高度 */
  overflow-y: auto;/* 启用垂直滚动 */
}

.page-title {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #303133;
}

.developer-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding-bottom: 60px;
}

.developer-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
}

.developer-card:hover {
  transform: translateY(-4px);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 3px solid #409EFF;
}

.name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.bio {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.skills {
  margin-bottom: 16px;
}

.skill-tag {
  margin: 4px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.social-icon:hover {
  transform: scale(1.2);
}
</style>