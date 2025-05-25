import request from '@/utils/request'
import axios from 'axios'

export const getDailyNutrition = (userId, date) => {
  return axios.get(`http://localhost:8088/api/diet/${userId}/nutrition/daily`, {
    params: { date }
  })
}

export function addMeal(userId, date, mealData) {
  return axios.post(`http://localhost:8088/api/diet/${userId}/meals`, mealData, {
    params: { date }
  })
}

export function deleteMeal(userId, mealId) {
  return axios.delete(`http://localhost:8088/api/diet/${userId}/meals/${mealId}`)
}

export function searchFood(query, page = 1, size = 20) {
  return axios.get(`http://localhost:8088/api/foods/search`, {
    params: { query, page, size }
  }).then(response => {
    console.log('API响应:', response)
    // 转换数据结构
    const foods = response.data.foods_search.results.food.map(item => ({
      foodId: item.food_id,
      foodName: item.food_name,
      foodType: item.food_type,
      calories: item.servings.serving[0].calories,
      carbs: item.servings.serving[0].carbohydrate,
      protein: item.servings.serving[0].protein,
      fat: item.servings.serving[0].fat,
      servingDescription: item.servings.serving[0].serving_description,
      servingUnit: 'g'
    }))
    return foods
  }).catch(error => {
    console.error('API错误:', error)
    throw error
  })
}

export const getNutritionStats = (userId, startDate, endDate) => {
  return axios.get(`http://localhost:8088/api/diet/${userId}/nutrition/stats`, {
    params: { 
      startDate: startDate,
      endDate: endDate
    }
  })
}

// 获取月度营养数据
export function getMonthlyNutrition(userId, year, month) {
  return axios.get(`http://localhost:8088/api/diet/${userId}/nutrition/monthly`, {
    params: { year, month }
  })
}
