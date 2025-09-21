import axios from 'axios';

// Create and configure an instance of axios.
const api = axios.create({
    // The base URL for all API requests.
    baseURL: 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept every request to automatically add the authentication token to the header.
// This ensures that every API call is authenticated without manual intervention.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('learnix-token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;