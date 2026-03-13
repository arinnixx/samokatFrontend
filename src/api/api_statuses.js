import axios from "axios";
import Cookies from "js-cookie";

const API_URL =import.meta.env.VITE_APP_API_URL_PRIVATE;

const axiosInstance = axios.create({
    withCredentials: true,
});

const getAuthHeader = () => {
    const token = Cookies.get('token');
    if (!token) {
        throw new Error('No token provided');
    }
    return {
        headers:{
            Authorization: `Bearer ${token}`,
        },
    };
};

const handleAuthError = (error) => {
    if (error.response&& error.response.status === 401) {

    }
};

export default {
    async getAllStatuses () {
        try{
            const response = await axiosInstance.get(`${API_URL}/statuses`, getAuthHeader());
            return response.data;
        }catch(error){
            console.error(error);
            handleAuthError(error);
            throw error;
        }
    },

    async createStatus(data) {
        const response = await axiosInstance.post(`${API_URL}/statuses`, data, getAuthHeader());
        return response.data;
    },
}