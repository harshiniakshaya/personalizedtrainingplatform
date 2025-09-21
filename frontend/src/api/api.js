import axios from 'axios';

// Configure a new axios instance.
const api = axios.create({
  // The base URL for all API requests.
  baseURL: 'http://localhost:5001', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the authorization token to headers.
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage.
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