import axios from "axios";
import { ElMessage } from 'element-plus';

const service = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL, // 后端的基础请求地址
    timeout: 50000 // 请求超时时间
});

let store;

export const setStore = (s) => {
    store = s;
};

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        this.$message({
            message: '服务器异常',
            type: 'error'
        });
        console.log(error)
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        let message = 'Unknown Error';
        if (error.response) {
            const status = error.response.status;
            const backendMessage = error.response.data.message;
            switch (status) {
                case 401:
                    message = backendMessage || 'Please Login';
                    if (store) {
                        store.dispatch('logout');
                        store.commit('SET_LOGIN_DIALOG', true);
                    }
                    break;
                case 404:
                    message = backendMessage || 'Not Found';
                    break;
                case 500:
                    message = backendMessage || `${status}`;
                    break;
                default:
                    message = backendMessage || `${status}`;
            }
        } else if (error.request) {
            message = 'Network Error';
        } else {
            message = 'Request Error';
        }
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        });
        return Promise.reject(error);
    }
);

export default service;