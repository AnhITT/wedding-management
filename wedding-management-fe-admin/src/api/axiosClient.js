import axios from "axios";
import AuthService from "../service/auth-service";

const axiosClient = axios.create({
    baseURL: "https://localhost:7296/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Gọi hàm logout từ AuthService
                    AuthService.logout();
                    break;
                case 403:
                    console.error("Không có quyền truy cập");
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
