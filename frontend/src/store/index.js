import { createStore } from "vuex";
import { userLogin } from "@/api/login";

export default createStore({
    state: {
        isLogged: !!localStorage.getItem('token'),
        userId: localStorage.getItem('userId') || null,
        loginRedirect: null,
        showLoginDialog: false
    },
    mutations: {
        setLogin(state, userId) {
            state.isLogged = true;
            state.userId = userId;
        },
        logout(state, userId) {
            state.isLogged = false;
            state.userId = null;
        },
        SET_LOGIN_DIALOG(state, value) {
            state.showLoginDialog = value
        }
    },
    actions: {
        loadUser({ commit }) {
            const token = localStorage.getItem('token');
            if (token) {
                const userId = localStorage.getItem('userId')
                commit('setLogin', userId);
            }
        },
        Login({ commit }, { identifier, password }) {
            return new Promise((resolve, reject) => {
                userLogin(identifier, password).then(response => {
                    localStorage.setItem('token', response.data.token);
                    const userId = response.data.userId;
                    localStorage.setItem('userId', userId);
                    commit('setLogin', userId);
                    resolve();
                }).catch(error => {
                    reject(error);
                })
            })
        },
        logout({ commit }) {
            return new Promise((resolve) => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                commit('logout');
                resolve();
            })
        },
    },
    getters: {

    }
})