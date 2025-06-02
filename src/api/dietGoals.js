import axios from 'axios'

// 创建专门用于饮食目标的axios实例
const dietGoalsRequest = axios.create({
  baseURL: 'http://localhost:8088/api',
  timeout: 5000
})

/**
 * 保存用户饮食目标
 * @param {number} userId - 用户ID
 * @param {object} goals - 饮食目标数据
 * @returns {Promise} 保存结果
 */
export function saveDietGoals(userId, goals) {
  return dietGoalsRequest({
    url: `/diet/${userId}/goals`,
    method: 'post',
    data: goals
  })
}

/**
 * 获取用户当前饮食目标
 * @param {number} userId - 用户ID
 * @returns {Promise} 饮食目标数据
 */
export function getCurrentDietGoals(userId) {
  return dietGoalsRequest({
    url: `/diet/${userId}/goals`,
    method: 'get'
  })
}

export default {
  saveDietGoals,
  getCurrentDietGoals
}
