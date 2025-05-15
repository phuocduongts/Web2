// httpAxios.js
import axios from "axios";

const httpAxios = axios.create({
    baseURL: 'http://localhost:8080/api/',
    timeout: 20000,
});

// Response interceptor to simplify response handling
httpAxios.interceptors.response.use(
    function (response) {
        // Return the response data directly
        return response.data;
    },
    function (error) {
        const { response } = error;
        
        // Handle different error scenarios
        if (response && response.status === 401) {
            console.error('Authentication error. Please log in again.');
            // Clear authentication data on 401 errors
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else if (response) {
            console.error('Error from server:', response.data);
        } else {
            console.error('Network error or server not responding');
        }
        
        return Promise.reject(error);
    }
);

export default httpAxios;