import axios from "axios";
import { ElMessage } from 'element-plus';
import i18n from '../locale/i18n.js'

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
        if (i18n.global.locale.value) {
            config.headers['Accept-Language'] = i18n.global.locale.value;
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        const t = i18n.global.t.bind(i18n.global);
        ElMessage({
            message: t('errors.serverError'),
            type: 'error'
        });
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const t = i18n.global.t.bind(i18n.global);
        let message = t('errors.unknown');
        if (error.response) {
            const status = error.response.status;
            const backendMessage = error.response.data.message;
            switch (status) {
                case 401:
                    message = backendMessage || t('request.pleaseLogin');
                    if (store) {
                        store.dispatch('logout');
                        store.commit('SET_LOGIN_DIALOG', true);
                    }
                    break;
                case 404:
                    message = backendMessage || t('request.notFound');
                    break;
                case 500:
                    message = backendMessage || `${status} - ${t('request.unknown')}`;
                    break;
                default:
                    message = backendMessage || `${status} - ${t('request.unknown')}`;
            }
        } else if (error.request) {
            message = t('request.networkError');
        } else {
            message = t('request.requestError');
        }
        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        });
        return new Promise(() => {})
    }
);

export default service;