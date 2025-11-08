# 智能健康平台 - 前端

[中文文档]() | [English Document](./README.md)

---

<div align="left">
  <img src="https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Element_Plus-2.0-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
  <img src="https://img.shields.io/badge/Axios-1.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios">
  <img src="https://img.shields.io/badge/ECharts-5.0-AA344D?style=for-the-badge&logo=apache-echarts&logoColor=white" alt="ECharts">
  <img src="https://img.shields.io/badge/Vuex-4.0-42B883?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vuex">
  <img src="https://img.shields.io/badge/Vue_Router-4.0-42B883?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue Router">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</div>


### 项目简介

智护健康平台前端是一个使用 Vue 3 和 Composition API 构建的现代化、响应式 Web 应用。它为用户提供了一个直观的界面来管理健康数据、追踪营养、接收用药提醒并参与健康社区互动。

**核心功能：**

- 实时健康指标可视化的响应式仪表板
- 使用 ECharts 的交互式数据图表
- AI 驱动的健康助手聊天机器人
- 社区帖子的富文本编辑器
- 通过 WebSocket 实现实时用药提醒
- 移动端优化的响应式设计
- 流畅的动画和现代化 UI/UX

### 系统截图

<div align="center">

#### 🏠 仪表板 - 健康数据概览
<img src="./docs/screenshots/dashboard.jpg" alt="健康数据仪表板" width="90%">

<br><br>

#### 📊 健康指标详情
<img src="./docs/screenshots/health-detail.jpg" alt="健康指标详情" width="90%">

<p><i>支持 BMI、血压、心率、睡眠质量等多项健康指标的详细追踪与分析</i></p>

<br><br>

#### 🤖 AI 健康助手
<img src="./docs/screenshots/ai-chat.jpg" alt="AI健康助手" width="90%">

<br><br>

#### 💬 社区论坛
<table>
  <tr>
    <td width="50%">
      <img src="./docs/screenshots/forum-list.jpg" alt="论坛列表">
      <p align="center"><b>社区文章列表</b></p>
    </td>
    <td width="50%">
      <img src="./docs/screenshots/article-detail.jpg" alt="文章详情">
      <p align="center"><b>文章详情页</b></p>
    </td>
  </tr>
</table>

<br>

#### ✏️ 富文本编辑器
<img src="./docs/screenshots/article-editor.jpg" alt="文章编辑器" width="90%">

<br><br>

#### 💊 用药中心
<img src="./docs/screenshots/medicine-reminder.jpg" alt="用药提醒" width="90%">

<br><br>

#### 🍎 饮食与营养追踪
<table>
  <tr>
    <td width="50%">
      <img src="./docs/screenshots/diet-tracking.jpg" alt="饮食记录">
      <p align="center"><b>饮食记录</b></p>
    </td>
    <td width="50%">
      <img src="./docs/screenshots/nutrition-analysis.jpg" alt="营养分析">
      <p align="center"><b>营养分析</b></p>
    </td>
  </tr>
</table>

<br>

#### 🏃 运动记录
<img src="./docs/screenshots/exercise.jpg" alt="运动记录" width="90%">

<br><br>

#### 👤 用户资料管理
<img src="./docs/screenshots/profile.jpg" alt="个人资料" width="90%">

</div>

---

### 项目结构

```
healthplatform_front/
├── src/
│   ├── views/                     # 页面组件
│   │   ├── auth/                  # 认证页面
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── home/                  # 首页
│   │   │   └── Home.vue
│   │   ├── health/                # 健康数据模块
│   │   │   ├── healthData.vue     # 健康概览
│   │   │   └── detail/            # 详情页面
│   │   │       ├── BMI.vue
│   │   │       ├── Weight.vue
│   │   │       ├── BloodPressure.vue
│   │   │       ├── HeartRate.vue
│   │   │       ├── Height.vue
│   │   │       ├── Sleep.vue
│   │   │       └── Steps.vue
│   │   ├── medicine/              # 用药模块
│   │   │   └── MedicineReminder.vue
│   │   ├── exercise/              # 运动模块
│   │   │   └── ExerciseRecord.vue
│   │   ├── forum/                 # 社区模块
│   │   │   ├── Articles.vue       # 文章列表
│   │   │   └── ArticleDetail.vue  # 文章详情
│   │   └── diet/                  # 饮食追踪
│   │
│   ├── components/                # 可复用组件
│   │   ├── Header.vue             # 页面头部
│   │   ├── Footer.vue             # 页面底部
│   │   ├── Navigation.vue         # 导航菜单
│   │   ├── Bot.vue                # AI 聊天机器人
│   │   └── DraggableBubble.vue    # 浮动 AI 助手
│   │
│   ├── router/                    # 路由配置
│   │   └── index.js
│   │
│   ├── store/                     # 状态管理 (Vuex)
│   │   └── index.js
│   │
│   ├── api/                       # API 服务模块
│   │   ├── article.js             # 文章 API
│   │   ├── health.js              # 健康数据 API
│   │   ├── diet.js                # 饮食 API
│   │   ├── medicine.js            # 用药 API
│   │   ├── exercise.js            # 运动 API
│   │   └── user.js                # 用户 API
│   │
│   ├── utils/                     # 工具函数
│   │   ├── request.js             # Axios 封装
│   │   ├── date.js                # 日期工具
│   │   └── flexible.js            # 移动端适配
│   │
│   ├── assets/                    # 静态资源
│   │   ├── images/                # 图片
│   │   ├── styles/                # 全局样式
│   │   └── icons/                 # 图标资源
│   │
│   ├── App.vue                    # 根组件
│   └── main.js                    # 应用入口
│
├── public/                        # 公共资源
├── package.json                   # 依赖配置
├── vite.config.js                # Vite 配置
└── README.md                      # 项目文档
```

### 核心功能实现

#### 1. 健康数据仪表板

- 实时显示多项健康指标
- 使用 ECharts 的交互式数据可视化
- 支持日期范围选择的历史趋势分析
- 带颜色编码的健康状态指示器
- 快速导航到详细指标页面

#### 2. AI 健康助手

- 可拖动的浮动聊天气泡界面
- 上下文感知的健康问答
- 个性化健康建议
- 多轮对话支持
- 与后端 AI 服务集成

#### 3. 社区论坛

- 带搜索和筛选的文章列表
- 文章创建的富文本编辑器（TinyMCE）
- 多级评论系统
- 社交互动（点赞、收藏、分享）
- 图片上传支持
- 用户友好的 markdown 渲染

#### 4. 实时功能

- 用于即时通知的 WebSocket 连接
- 自动重连机制
- 实时用药提醒
- 实时健康警报通知
- 连接状态指示器

#### 5. 响应式设计

- 基于 rem 布局的移动优先方法
- Flexible.js 实现精确的移动端适配
- 触摸友好的交互
- 针对各种屏幕尺寸优化
- 渐进式 Web 应用（PWA）就绪

#### 6. 性能优化

- 防抖搜索以提升性能
- 路由和组件的懒加载
- 使用 Vite 优化包大小
- 高效的状态管理
- 图片懒加载

### 快速开始

#### 环境要求

- Node.js 16+ 或更高版本
- npm 8+ 或 yarn 1.22+
- 后端服务器运行在 `http://localhost:8088`

#### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/nova728/health-platform-front.git
cd health-platform-front
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
   在根目录创建 `.env` 文件：

```env
# API 基础 URL
VITE_API_BASE_URL=http://localhost:8088

# WebSocket URL
VITE_WS_URL=ws://localhost:8088

# 启用开发工具
VITE_DEV_TOOLS=true
```

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:5173` 上可用

5. **构建生产版本**

```bash
npm run build
# 或
yarn build
```

6. **预览生产构建**

```bash
npm run preview
# 或
yarn preview
```

### API 集成

前端通过 RESTful API 和 WebSocket 连接与后端通信。

**HTTP 客户端设置（request.js）：**

```javascript
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  error => {
    // 处理错误
    return Promise.reject(error)
  }
)
```

**WebSocket 连接：**

```javascript
const connectWebSocket = () => {
  const userId = localStorage.getItem('userId')
  const ws = new WebSocket(`${VITE_WS_URL}/notification/${userId}`)
  
  ws.onopen = () => console.log('WebSocket 已连接')
  ws.onmessage = (event) => handleMessage(JSON.parse(event.data))
  ws.onerror = (error) => console.error('WebSocket 错误:', error)
  ws.onclose = () => setTimeout(connectWebSocket, 5000)
}
```

### 状态管理

应用使用 Vuex 进行集中式状态管理：

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    healthData: [],
    notifications: []
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_HEALTH_DATA(state, data) {
      state.healthData = data
    }
  },
  actions: {
    async fetchHealthData({ commit }, userId) {
      const data = await healthAPI.getHealthData(userId)
      commit('SET_HEALTH_DATA', data)
    }
  }
})
```

### 路由配置

使用 Vue Router 进行导航，带有认证的路由守卫：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/home/Home.vue')
    },
    {
      path: '/health',
      name: 'Health',
      component: () => import('@/views/health/healthData.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})
```

### 组件架构

**Composition API 模式：**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const healthData = ref([])
const loading = ref(false)

const latestData = computed(() => 
  healthData.value[0] || {}
)

const fetchData = async () => {
  loading.value = true
  try {
    healthData.value = await api.getHealthData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-loading="loading">
    <el-card>{{ latestData }}</el-card>
  </div>
</template>
```

### 样式指南

**CSS 架构：**

- 全局样式在 `assets/styles/`
- 使用 `<style scoped>` 的组件作用域样式
- 使用 CSS 变量进行主题化
- 类名使用 BEM 命名约定

**响应式设计：**

```scss
// 移动优先方法
.container {
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 开发指南

#### 代码风格

- 使用 Vue 3 Composition API 和 `<script setup>`
- 遵循 Vue.js 官方风格指南
- 使用 TypeScript 以获得更好的类型安全（可选）
- 编写描述性的组件和变量名
- 保持组件小而专注

#### 最佳实践

1. **组件设计**：创建可复用、单一用途的组件
2. **Props 验证**：始终使用适当的类型验证 props
3. **事件处理**：使用描述性的事件名称
4. **错误处理**：实现适当的错误边界
5. **性能**：在适当的地方使用 `v-memo` 和 `v-once`

#### 测试

```bash
# 运行单元测试
npm run test:unit

# 运行 e2e 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage
```

### 构建与部署

#### 生产构建

```bash
# 构建生产版本
npm run build

# 输出将在 'dist' 目录中
```

#### 部署选项

**1. 静态托管（Netlify、Vercel）：**

- 连接您的 GitHub 仓库
- 设置构建命令：`npm run build`
- 设置发布目录：`dist`

**2. Nginx 部署：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**3. Docker 部署：**

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 浏览器支持

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
- 移动浏览器（iOS Safari、Chrome Mobile）

### 性能优化

1. **代码拆分**：使用 Vite 自动基于路由拆分
2. **Tree Shaking**：在生产构建中删除未使用的代码
3. **资源优化**：压缩图片并使用现代格式
4. **懒加载**：延迟加载非关键组件
5. **缓存**：实施适当的缓存策略

### 故障排除

**常见问题：**

1. **CORS 错误**：确保后端有正确的 CORS 配置
2. **WebSocket 连接失败**：检查防火墙和代理设置
3. **构建错误**：清除 node_modules 并重新安装依赖
4. **性能问题**：检查不必要的重新渲染并优化计算属性

### 贡献

我们欢迎贡献！请遵循以下指南：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/NewFeature`）
3. 遵循代码风格指南
4. 为新功能编写测试
5. 使用清晰的消息提交（`git commit -m 'Add NewFeature'`）
6. 推送到您的分支（`git push origin feature/NewFeature`）
7. 打开 Pull Request

### 资源

- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [ECharts 文档](https://echarts.apache.org/zh/index.html)
- [Vite 文档](https://cn.vitejs.dev/)

### 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

### 联系方式

项目链接：[https://github.com/nova728/health-platform-front](https://github.com/nova728/health-platform-front)