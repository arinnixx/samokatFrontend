import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_APP_API_URL_PRIVATE;

const axiosInstance = axios.create({
    withCredentials: true,
});

const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
        console.log('Ошибка авторизации');
    }
    throw error;
};

export default {
    async aggregatorLogin(login, password) {
        try {
            const response = await axiosInstance.post(`${API_URL}/aggregator/login`, {
                login,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка входа агрегатора:', error);
            handleAuthError(error);
        }
    },

    async adminLogin(login, password) {
        try {
            const response = await axiosInstance.post(`${API_URL}/admin/login`, {
                login,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка входа администратора:', error);
            handleAuthError(error);
        }
    },

    async aggregatorLogout(token) {
        try {
            const response = await axiosInstance.post(`${API_URL}/aggregator/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка выхода агрегатора:', error);
            handleAuthError(error);
        }
    },

    async adminLogout(token) {
        try {
            const response = await axiosInstance.post(`${API_URL}/admin/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка выхода администратора:', error);
            handleAuthError(error);
        }
    },

    async checkSession(token) {
        try {
            const response = await axiosInstance.post(`${API_URL}/aggregator/check-session`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка проверки сессии:', error);
            handleAuthError(error);
        }
    },

    async checkAdminSession(token) {
        try {
            const response = await axiosInstance.post(`${API_URL}/admin/check-session`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ошибка проверки сессии админа:', error);
            handleAuthError(error);
        }
    }
};