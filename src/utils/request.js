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
        const res = response.data
        if (res.code === 200 || res.code === 1 || res.code === 0) {
            return res
        } else {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message || '请求失败'))
        }
    },
    error => {
        console.error('请求错误:', error)
        ElMessage.error('网络请求失败,请稍后重试')
        return Promise.reject(error)
    }
)

export default service