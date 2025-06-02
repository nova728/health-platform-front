import request from '@/utils/request'

/**
 * 搜索食物
 * @param {string} query - 搜索关键词
 * @param {number} page - 页码，默认1
 * @param {number} size - 每页大小，默认20
 * @returns {Promise} 搜索结果
 */
export function searchFood(query, page = 1, size = 20) {
  return request({
    url: '/api/foods/search',
    method: 'get',
    params: {
      query,
      page,
      size
    }
  })
}

/**
 * 识别食物图片
 * @param {string} base64Image - base64格式的图片数据
 * @returns {Promise} 识别结果
 */
export function recognizeFoodFromImage(base64Image) {
  return request({
    url: '/api/foods/recognize',
    method: 'post',
    data: {
      image: base64Image
    }
  })
}

/**
 * 将文件转换为base64格式
 * @param {File} file - 图片文件
 * @returns {Promise<string>} base64字符串
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('没有提供文件'))
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }

    // 检查文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      reject(new Error('图片文件大小不能超过5MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] // 移除data:image/...;base64,前缀
      resolve(base64)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度，默认800
 * @param {number} maxHeight - 最大高度，默认600
 * @param {number} quality - 压缩质量，默认0.8
 * @returns {Promise<string>} 压缩后的base64字符串
 */
export function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('没有提供文件'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为base64
      const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
      resolve(base64)
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

// 导出所有函数
export default {
  searchFood,
  recognizeFoodFromImage,
  fileToBase64,
  compressImage
}
