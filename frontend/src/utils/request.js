import axios from "axios";
import router from "../router/index";

const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL, // 后端的基础请求地址
    timeout: 50000 // 请求超时时间
});

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
        if (response.status === 401){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
        if (response.status === 500){
            this.$message({
                message: '服务器异常',
                type: 'error'
            });
        }
        // 可以在这里统一处理响应数据
        return response.data;
    },
    (error) => {
        console.log(error)
        // 可以在这里统一处理响应错误
        console.error("服务器异常！");
    }
);

export default service;