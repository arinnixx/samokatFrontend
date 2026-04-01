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
    async getAllObdii () {
        try{
            const response = await axiosInstance.get(`${API_URL}/obdii`, getAuthHeader());
            return response.data;
        }catch(error){
            console.error(error);
            handleAuthError(error);
            throw error;
        }
    }
}