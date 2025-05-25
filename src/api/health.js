// src/api/health.js
import request from '@/utils/request'  // 假设你使用axios的封装

export const healthAPI = {
    // 获取最新健康数据
    getLatestHealthData(userId) {
        // 参数验证
        if (!userId) {
            return Promise.reject(new Error('用户ID不能为空'))
        }

        return request({
            url: `/api/health/${userId}/latest`,
            method: 'get',
            // 添加错误处理
            validateStatus: function (status) {
                return status >= 200 && status < 300
            },
            // 设置超时
            timeout: 10000
        }).catch(error => {
            console.error('健康数据请求失败:', error)
            throw new Error(error.response?.data?.message || '获取健康数据失败')
        })
    },

    // 添加健康数据
    addHealthData(userId, data) {  // 添加 userId 参数
        return request({
            url: `/api/health/${userId}`,  // 修改路径
            method: 'post',
            data
        })
    },

    // 获取健康数据历史记录
    getHealthDataHistory(userId, params) {
        if (!userId) {
            return Promise.reject(new Error('用户ID不能为空'))
        }

        // 验证日期参数
        if (!params.startDate || !params.endDate) {
            return Promise.reject(new Error('日期参数不完整'))
        }

        return request({
            url: `/api/health/${userId}/history`,
            method: 'get',
            params,
            timeout: 10000, // 设置超时时间
        }).catch(error => {
            console.error('健康历史数据请求失败:', error)
            throw error
        })
    }
}