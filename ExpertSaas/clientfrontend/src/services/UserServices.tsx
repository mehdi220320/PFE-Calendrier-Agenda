import axios from 'axios';
import type {User} from "../models/User";
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/users`,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const tokensString = localStorage.getItem('google_tokens');

        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                // tokens object has access_token and expiry_date
                if (tokens.access_token) {
                    config.headers.Authorization = `Bearer ${tokens.access_token}`;
                }
            } catch (error) {
                console.error('Error parsing tokens:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Check if there's a new token in the response headers (from your googleAuth middleware)
        const newToken = response.headers['x-new-access-token'];
        if (newToken) {
            // Update the stored token
            const tokensString = localStorage.getItem('google_tokens');
            if (tokensString) {
                try {
                    const tokens = JSON.parse(tokensString);
                    tokens.access_token = newToken;
                    // Keep the same expiry_date or update it if needed
                    localStorage.setItem('google_tokens', JSON.stringify(tokens));
                    console.log('Token refreshed successfully');
                } catch (error) {
                    console.error('Error updating token:', error);
                }
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Check if token is expired and we have a refresh token
                const tokensString = localStorage.getItem('google_tokens');
                if (tokensString) {
                    const tokens = JSON.parse(tokensString);

                    // You might want to implement a refresh endpoint on your backend
                    // that uses the refresh token stored in your database
                    const refreshResponse = await axios.post(`${backendURL}/api/auth/refresh`, {}, {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${tokens.access_token}`
                        }
                    });

                    if (refreshResponse.data.access_token) {
                        // Update the stored token
                        tokens.access_token = refreshResponse.data.access_token;
                        if (refreshResponse.data.expiry_date) {
                            tokens.expiry_date = refreshResponse.data.expiry_date;
                        }
                        localStorage.setItem('google_tokens', JSON.stringify(tokens));

                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                        return api(originalRequest);
                    }
                }

                // If refresh fails or no refresh token, redirect to login
                console.log('Token refresh failed, redirecting to login');
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(error);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Redirect to login if refresh fails
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const UserServices = {

    getExpertById:async(id: string): Promise<User> => {
    const response = await api.get('/expert/'+id);
    return response.data.expert;
    }
}