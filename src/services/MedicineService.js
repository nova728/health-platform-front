import axios from 'axios';
import { ElMessage } from "element-plus";

const API_BASE_URL = 'https://api.fda.gov/drug';

// 创建具有默认配置的 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

request.interceptors.response.use(
    response => response,
    error => {
        console.error('API 请求失败:', error);
        const message = error.response?.data?.message || '操作失败';
        ElMessage.error(message);
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

    // 获取用户用药记录
    async getUserMedicineRecords(userId, period = 'week') {
        try {
            const response = await request.get(`http://localhost:8088/api/medicines/${userId}/medicine`, {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('获取用药记录失败:', error);
            throw error;
        }
    }

    // 创建用药记录
    async createMedicineRecord(userId, recordData) {
        try {
            const response = await request.post(`http://localhost:8088/api/medicines/${userId}/medicine`, recordData);
            return response.data;
        } catch (error) {
            console.error('创建用药记录失败:', error);
            throw error;
        }
    }

    // 更新用药记录
    async updateMedicineRecord(userId, recordData) {
        try {
            const response = await request.put(
                `http://localhost:8088/api/medicines/${userId}/medicine/${recordData.id}`,
                recordData
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || '更新用药记录失败');
        }
    }

    // 获取用药提醒
    async getMedicineReminders(userId) {
        try {
            const response = await request.get(`http://localhost:8088/api/medicines/${userId}/medicine/reminders`);
            return response.data;
        } catch (error) {
            console.error('获取用药提醒失败:', error);
            throw error;
        }
    }

    // 创建用药提醒
    async createMedicineReminder(userId, reminderData) {
        try {
            const response = await request.post(
                `http://localhost:8088/api/medicines/${userId}/medicine/${reminderData.medicineId}/reminder`,
                reminderData
            );
            return response.data;
        } catch (error) {
            console.error('创建用药提醒失败:', error);
            throw error;
        }
    }

    // 更新提醒状态
    async updateReminderStatus(userId, reminderId, status) {
        try {
            const response = await request.put(
                `http://localhost:8088/api/medicines/${userId}/medicine/reminders/${reminderId}/status`,
                { isActive: status }
            );
            return response.data;
        } catch (error) {
            console.error('更新提醒状态失败:', error);
            throw error;
        }
    }

    async deleteMedicineReminder(userId, reminderId) {
        try {
            const response = await request.delete(
                `http://localhost:8088/api/medicines/${userId}/medicine/reminders/${reminderId}`
            );
            return response.data;
        } catch (error) {
            console.error('删除用药提醒失败:', error);
            throw error;
        }
    }
}

export default new MedicineService();