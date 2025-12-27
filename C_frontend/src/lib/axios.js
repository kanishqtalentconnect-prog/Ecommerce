import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://ecommerce-3pxk.onrender.com/", 
    withCredentials: true, 
});

export default axiosInstance;