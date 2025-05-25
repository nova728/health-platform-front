// stores/forumStore.js
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

export const useForumStore = defineStore('forum', {
    state: () => ({
        posts: [],
        categories: [
            { id: 1, name: '健康讨论', icon: 'ChatDotRound' },
            { id: 2, name: '生活分享', icon: 'Sunny' },
            { id: 3, name: '问题解答', icon: 'QuestionFilled' },
            { id: 4, name: '经验交流', icon: 'Medal' }
        ],
        currentCategory: null,
        loading: false,
        cache: new Map(),
        total: 0,
        currentPage: 1,
        pageSize: 10,
        searchText: ''
    }),

    getters: {
        noMoreData: (state) => state.posts.length >= state.total && state.total > 0,

        getCategoryName: (state) => (categoryId) => {
            const category = state.categories.find(c => c.id === categoryId)
            return category ? category.name : ''
        }
    },

    actions: {
        async fetchHotArticles() {
            try {
                const response = await fetch('/api/articles/hot')
                const data = await response.json()
                if (data.code === 200) {
                    return data.data
                }
            } catch (error) {
                console.error('获取热门文章失败:', error)
                ElMessage.error('获取热门文章失败')
            }
            return []
        },

        // 获取推荐文章
        async fetchRecommendations() {
            try {
                const response = await fetch('/api/articles/recommendations')
                const data = await response.json()
                if (data.code === 200) {
                    return data.data
                }
            } catch (error) {
                console.error('获取推荐文章失败:', error)
                ElMessage.error('获取推荐文章失败')
            }
            return []
        },

        // 更新用户积分
        async awardPoints(action) {
            try {
                const response = await fetch('/api/user/points', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ action })
                })
                const data = await response.json()
                if (data.code === 200) {
                    return true
                }
            } catch (error) {
                console.error('更新积分失败:', error)
            }
            return false
        },
        // 缓存文章数据
        cachePost(post) {
            this.cache.set(post.id, {
                data: post,
                timestamp: Date.now()
            })
        },

        // 获取缓存的文章
        getCachedPost(id) {
            const cached = this.cache.get(id)
            if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return cached.data
            }
            return null
        },

        // 清除缓存
        clearCache() {
            this.cache.clear()
        },

        // 重置列表状态
        resetListState() {
            this.posts = []
            this.currentPage = 1
            this.total = 0
        },

        // 获取文章列表
        async fetchArticles(loadMore = false) {
            if (this.loading || (this.noMoreData && loadMore)) return

            try {
                this.loading = true
                const userId = localStorage.getItem('userId') // 从本地存储获取用户ID

                const response = await fetch(
                    `http://localhost:8088/api/articles/${userId || 0}?` +
                    `categoryId=${this.currentCategory || ''}&` +
                    `page=${this.currentPage}&` +
                    `size=${this.pageSize}&` +
                    `search=${this.searchText}`
                )

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const responseData = await response.json()

                if (responseData.code === 200 && responseData.data) {
                    const newPosts = responseData.data.articles || []
                    if (loadMore) {
                        this.posts = [...this.posts, ...newPosts]
                    } else {
                        this.posts = newPosts
                    }
                    this.total = responseData.data.total || 0

                    // 缓存新获取的文章
                    newPosts.forEach(post => this.cachePost(post))
                } else {
                    console.warn('Unexpected response structure:', responseData)
                    if (!loadMore) {
                        this.resetListState()
                    }
                }
            } catch (error) {
                console.error('获取文章列表失败:', error)
                ElMessage.error(error.message || '获取文章列表失败')
                if (!loadMore) {
                    this.resetListState()
                }
            } finally {
                this.loading = false
            }
        },

        // 处理分类选择
        async handleCategorySelect(categoryId) {
            this.currentCategory = parseInt(categoryId)
            this.resetListState()
            await this.fetchArticles()
        },

        // 处理搜索
        async handleSearch(searchText) {
            this.searchText = searchText
            this.resetListState()
            await this.fetchArticles()
        },

        // 处理点赞
        async handleLike(post) {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    ElMessage.warning('请先登录')
                    return
                }

                const url = `http://localhost:8088/api/articles/${post.id}/like`
                const method = post.isLiked ? 'DELETE' : 'POST'

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) throw new Error('操作失败')

                // 更新文章状态
                post.isLiked = !post.isLiked
                post.likeCount += post.isLiked ? 1 : -1

                // 更新缓存
                this.cachePost(post)

                ElMessage.success(post.isLiked ? '点赞成功' : '已取消点赞')
            } catch (error) {
                console.error('点赞操作失败:', error)
                ElMessage.error('操作失败')
            }
        },

        // 处理收藏
        async handleFavorite(post) {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    ElMessage.warning('请先登录')
                    return
                }

                const url = `http://localhost:8088/api/articles/${post.id}/favorite`
                const method = post.isFavorited ? 'DELETE' : 'POST'

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) throw new Error('操作失败')

                // 更新文章状态
                post.isFavorited = !post.isFavorited
                // 更新缓存
                this.cachePost(post)

                ElMessage.success(post.isFavorited ? '收藏成功' : '已取消收藏')
            } catch (error) {
                console.error('收藏操作失败:', error)
                ElMessage.error('操作失败')
            }
        },

        // 加载更多文章
        async loadMorePosts() {
            if (!this.loading && !this.noMoreData) {
                this.currentPage++
                await this.fetchArticles(true)
            }
        }
    }
})