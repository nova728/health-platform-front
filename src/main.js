import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from '@/router'
import App from './App.vue'
import store from './store'
import axios from 'axios';
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import request from '@/utils/request'
import { createPinia } from 'pinia'
import VueLazyload from 'vue-lazyload'
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const vuetify = createVuetify({
    components,
    directives,
})

const pinia = createPinia()

//设置 axios 基础 URL
axios.defaults.baseURL = 'http://localhost:8088/api/user';
//
const app = createApp(App);
app.config.globalProperties.$axios = axios; // Vue 3 全局属性
app.config.globalProperties.$request = request
app.use(router)
    .use(ElementPlus)
    .use(store)
    .use(pinia)
    .use(vuetify)
    .use(VueLazyload, {
        preLoad: 1.3,
        attempt: 1
    })
    .mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
