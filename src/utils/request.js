// request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import store from '@/store'

const service = axios.create({
    baseURL: '/api',
    timeout: 5000
})

// 请求拦截器 - 简化验证逻辑
service.interceptors.request.use(
    config => {
        const user = store.state.user
        if (!user) {
            router.push('/login')
            return Promise.reject(new Error('请先登录'))
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 检查是否是食物搜索的响应
        if (response.config.url.includes('/foods/search')) { // 注意这里是相对路径
            // 食物搜索接口成功时直接返回数据体，没有 code 和 message 包装
            if (response.status === 200 && response.data) {
                return response.data; // 直接返回 FatSecret API 的原始数据结构
            }
        }

        const res = response.data;
        // 对于其他接口，保持原有的 code 判断逻辑
        if (res.code === 200 || res.code === 1 || res.code === 0) {
            return res;
        } else {
            ElMessage.error(res.message || '请求失败');
            return Promise.reject(new Error(res.message || '请求失败'));
        }
    },
    error => {
        console.error('请求错误:', error);
        ElMessage.error('网络请求失败,请稍后重试');
        return Promise.reject(error);
    }
)

export default service