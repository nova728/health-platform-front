// api/health-report.js
import request from '@/utils/request'

// 获取健康评分
export const getHealthScore = (userId) => {
    return request({
        url: `/health/report/${userId}/score`,  // 修正路径
        method: 'get'
    })
}

// 生成健康报告
export const generateHealthReport = (userId, data) => {
    return request({
        url: `/health/report/${userId}/generate`,  // 修正路径
        method: 'post',
        data
    })
}

// 获取趋势数据
export const getTrendData = (userId, metric, period = 'week') => {
    return request({
        url: `/health/report/${userId}/trend/${metric}`,  // 修正路径
        method: 'get',
        params: { period }
    })
}