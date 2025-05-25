import axios from 'axios'

// 生成健康报告
export function generateReport(userId) {
  return axios.post(`http://localhost:8088/api/health-reports/${userId}`)
}

// 获取最新健康报告
export function getLatestReport(userId) {
  return axios.get(`http://localhost:8088/api/health-reports/${userId}/latest`)
}

// 获取健康报告历史
export function getReportHistory(userId, startTime, endTime) {
  return axios.get(`http://localhost:8088/api/health-reports/${userId}/history`, {
    params: { startTime, endTime }
  })
}