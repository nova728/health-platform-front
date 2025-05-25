/**
 * 格式化日期时间
 * @param {string|Date} dateStr - 日期字符串或Date对象
 * @returns {string} - 格式化后的日期时间字符串
 */
export function formatDateTime(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) return '-'
    
    // 补零函数
    const pad = (num) => String(num).padStart(2, '0')
    
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
  
  /**
   * 格式化日期
   * @param {string|Date} dateStr - 日期字符串或Date对象
   * @returns {string} - 格式化后的日期字符串
   */
  export function formatDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) return '-'
    
    // 补零函数
    const pad = (num) => String(num).padStart(2, '0')
    
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    
    return `${year}-${month}-${day}`
  }
  
  /**
   * 获取相对时间描述
   * @param {string|Date} dateStr - 日期字符串或Date对象
   * @returns {string} - 相对时间描述
   */
  export function getRelativeTime(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) return '-'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 转换为秒
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) {
      return '刚刚'
    }
    
    // 转换为分钟
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}分钟前`
    }
    
    // 转换为小时
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}小时前`
    }
    
    // 转换为天
    const days = Math.floor(hours / 24)
    if (days < 30) {
      return `${days}天前`
    }
    
    // 超过30天则返回具体日期
    return formatDate(date)
  }