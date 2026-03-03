import axios from "axios";
import Cookies from "js-cookie";

const API_URL ='http://localhost:3002/courier-shifts'

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
    async getAllCourierShifts () {
        try{
            const response = await axiosInstance.get(`${API_URL}`, getAuthHeader());
            return response.data;
        }catch(error){
            console.error(error);
            handleAuthError(error);
            throw error;
        }
    }
}