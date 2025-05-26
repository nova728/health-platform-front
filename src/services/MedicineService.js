import axios from 'axios';
import { ElMessage } from "element-plus";

const API_BASE_URL = 'https://api.fda.gov/drug';

// 创建具有默认配置的 axios 实例 - 修复baseURL
const request = axios.create({
    baseURL: 'http://localhost:8088/api', // 完整的后端API地址
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 修复响应拦截器 - 确保正确处理响应格式
request.interceptors.response.use(
    response => {
        console.log('响应拦截器 - 完整响应:', response);
        console.log('响应拦截器 - 响应数据:', response.data);

        // 直接返回响应数据，而不是整个响应对象
        return response.data;
    },
    error => {
        console.error('API 请求失败:', error);
        console.error('错误响应:', error.response);

        // 获取错误信息
        let message = '操作失败';
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.response?.data?.data) {
            message = error.response.data.data;
        } else if (error.message) {
            message = error.message;
        }

        // 只在非手动捕获的情况下显示错误消息
        if (!error.config?.skipErrorMessage) {
            ElMessage.error(message);
        }

        return Promise.reject(error);
    }
);

// 请求拦截器 - 添加调试信息
request.interceptors.request.use(
    config => {
        console.log('发送请求:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: config.baseURL + config.url,
            params: config.params,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

class MedicineService {
    // 搜索药品标签信息
    async searchDrugLabels(searchTerm) {
        try {
            // 处理搜索词，去除特殊字符
            const query = searchTerm.trim()
                .replace(/[^\w\s-]/g, '') // 只保留字母、数字、空格和连字符
                .replace(/\s+/g, ' '); // 将多个空格替换为单个空格

            // 如果搜索词为空，返回空结果
            if (!query) {
                return { results: [] };
            }

            console.log('处理后的搜索词:', query);

            // 构建搜索参数
            const searchParam = encodeURIComponent(`openfda.brand_name:"${query}" OR openfda.generic_name:"${query}"`);
            const url = `${API_BASE_URL}/label.json?search=${searchParam}&limit=10`;

            console.log('发送请求到:', url);

            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('FDA API 响应:', response.data);
            return response.data;
        } catch (error) {
            console.error('搜索药品标签出错:', error);

            if (error.response) {
                console.error('错误状态:', error.response.status);
                console.error('错误数据:', error.response.data);

                // 如果是因为没有找到匹配的药品
                if (error.response.status === 404) {
                    return { results: [] };
                }

                // 如果是查询语法错误，尝试使用更宽松的搜索条件
                if (error.response.status === 400) {
                    try {
                        // 使用更简单的搜索条件重试
                        const simpleQuery = encodeURIComponent(query);
                        const retryUrl = `${API_BASE_URL}/label.json?search=openfda.brand_name:${simpleQuery}&limit=10`;

                        console.log('尝试使用简化搜索:', retryUrl);

                        const retryResponse = await axios.get(retryUrl, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        });

                        return retryResponse.data;
                    } catch (retryError) {
                        console.error('重试搜索失败:', retryError);
                        return { results: [] };
                    }
                }
            }

            return { results: [] };
        }
    }

    // 根据ID获取药品详情
    async getDrugDetails(drugId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/label.json`, {
                params: {
                    search: `id:"${encodeURIComponent(drugId)}"`,
                    limit: 1
                }
            });
            return response.data;
        } catch (error) {
            console.error('获取药品详情失败:', error);
            throw error;
        }
    }

    // 获取用户用药记录 - 修复：只使用相对路径
    async getUserMedicineRecords(userId, period = 'week') {
        try {
            const response = await request.get(`/medicines/${userId}/medicine`, {
                params: { period },
                skipErrorMessage: true
            });
            return response;
        } catch (error) {
            console.error('获取用药记录失败:', error);
            throw error;
        }
    }

    // 创建用药记录 - 修复：只使用相对路径
    async createMedicineRecord(userId, recordData) {
        try {
            console.log('创建用药记录 - 用户ID:', userId);
            console.log('创建用药记录 - 数据:', recordData);

            const response = await request.post(`/medicines/${userId}/medicine`, recordData, {
                skipErrorMessage: true
            });

            console.log('创建用药记录 - 响应:', response);
            return response;
        } catch (error) {
            console.error('创建用药记录失败:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                '创建用药记录失败';

            throw new Error(errorMessage);
        }
    }

    // 更新用药记录 - 修复：只使用相对路径
    async updateMedicineRecord(userId, medicineId, recordData) {
        try {
            console.log('更新用药记录 - 用户ID:', userId);
            console.log('更新用药记录 - 药品ID:', medicineId);
            console.log('更新用药记录 - 数据:', recordData);

            const response = await request.put(
                `/medicines/${userId}/medicine/${medicineId}`,
                recordData,
                {
                    skipErrorMessage: true
                }
            );

            console.log('更新用药记录 - 响应:', response);
            return response;
        } catch (error) {
            console.error('更新用药记录失败:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                '更新用药记录失败';

            throw new Error(errorMessage);
        }
    }

    // 删除用药记录 - 修复：只使用相对路径
    async deleteMedicineRecord(userId, medicineId) {
        try {
            const response = await request.delete(`/medicines/${userId}/medicine/${medicineId}`);
            return response;
        } catch (error) {
            console.error('删除用药记录失败:', error);
            throw error;
        }
    }

    // 获取用药提醒 - 修复：只使用相对路径
    async getMedicineReminders(userId) {
        try {
            const response = await request.get(`/medicines/${userId}/medicine/reminders`);
            return response;
        } catch (error) {
            console.error('获取用药提醒失败:', error);
            throw error;
        }
    }

    // 创建用药提醒 - 修复：只使用相对路径
    async createMedicineReminder(userId, reminderData) {
        try {
            console.log('创建用药提醒 - 用户ID:', userId);
            console.log('创建用药提醒 - 数据:', reminderData);

            const response = await request.post(
                `/medicines/${userId}/medicine/${reminderData.medicineId}/reminder`,
                reminderData,
                {
                    skipErrorMessage: true
                }
            );

            console.log('创建用药提醒 - 响应:', response);
            return response;
        } catch (error) {
            console.error('创建用药提醒失败:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                '创建用药提醒失败';

            throw new Error(errorMessage);
        }
    }

    // 更新提醒状态 - 修复：只使用相对路径
    async updateReminderStatus(userId, reminderId, status) {
        try {
            console.log('更新提醒状态 - 用户ID:', userId, '提醒ID:', reminderId, '状态:', status);

            const response = await request.put(
                `/medicines/${userId}/medicine/reminders/${reminderId}/status`,
                { isActive: status },
                {
                    skipErrorMessage: true
                }
            );

            console.log('更新提醒状态 - 响应:', response);
            return response;
        } catch (error) {
            console.error('更新提醒状态失败:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                '更新提醒状态失败';

            throw new Error(errorMessage);
        }
    }

    // 删除用药提醒 - 修复：只使用相对路径
    async deleteMedicineReminder(userId, reminderId) {
        try {
            console.log('删除用药提醒 - 用户ID:', userId, '提醒ID:', reminderId);

            const response = await request.delete(
                `/medicines/${userId}/medicine/reminders/${reminderId}`,
                {
                    skipErrorMessage: true
                }
            );

            console.log('删除用药提醒 - 响应:', response);
            return response;
        } catch (error) {
            console.error('删除用药提醒失败:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                '删除用药提醒失败';

            throw new Error(errorMessage);
        }
    }

    // 搜索本地用药记录 - 修复：只使用相对路径
    async searchMedicineRecords(userId, searchTerm) {
        try {
            const response = await request.get(`/medicines/${userId}/medicine/search`, {
                params: { q: searchTerm }
            });
            return response;
        } catch (error) {
            console.error('搜索用药记录失败:', error);
            throw error;
        }
    }

    // 获取用药统计信息 - 修复：只使用相对路径
    async getMedicineStatistics(userId, period = 'month') {
        try {
            const response = await request.get(`/medicines/${userId}/statistics`, {
                params: { period }
            });
            return response;
        } catch (error) {
            console.error('获取用药统计失败:', error);
            throw error;
        }
    }

    // 批量导入用药记录 - 修复：只使用相对路径
    async importMedicineRecords(userId, records) {
        try {
            const response = await request.post(`/medicines/${userId}/import`, {
                records: records
            });
            return response;
        } catch (error) {
            console.error('批量导入用药记录失败:', error);
            throw error;
        }
    }

    // 导出用药记录 - 修复：只使用相对路径
    async exportMedicineRecords(userId, format = 'json', period = 'all') {
        try {
            const response = await request.get(`/medicines/${userId}/export`, {
                params: { format, period },
                responseType: format === 'pdf' ? 'blob' : 'json'
            });
            return response;
        } catch (error) {
            console.error('导出用药记录失败:', error);
            throw error;
        }
    }

    // 检查药物相互作用 - 修复：只使用相对路径
    async checkDrugInteractions(drugNames) {
        try {
            const response = await request.post('/medicines/interactions/check', {
                drugs: drugNames
            });
            return response;
        } catch (error) {
            console.error('检查药物相互作用失败:', error);
            throw error;
        }
    }

    // 获取用药建议 - 修复：只使用相对路径
    async getMedicationAdvice(userId, medicineId) {
        try {
            const response = await request.get(`/medicines/${userId}/advice/${medicineId}`);
            return response;
        } catch (error) {
            console.error('获取用药建议失败:', error);
            throw error;
        }
    }
}

export default new MedicineService();