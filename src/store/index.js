import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate'; // 引入持久化插件

export default createStore({
    state: {
        user: null,
        token: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setToken(state, token) { // 新增 mutation 用于设置 token
            state.token = token;
        },
        clearUser(state){
            state.user = null;
            state.token = null;
        }

    },
    actions: {
        loginUser({ commit }, { user, token }) { // 修改 action 接受用户和 token
            commit('setUser', user);
            commit('setToken', token); // 设置 token
        },
        logoutUser({ commit }) {
            commit('clearUser');
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // 同时移除 token
        }
    },
    plugins: [createPersistedState()], // 添加持久化插件
});
