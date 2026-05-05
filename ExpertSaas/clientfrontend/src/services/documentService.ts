// services/documentService.ts
import axios from 'axios';
import type {
    DocumentsListResponse,
    DocumentResponse,
    Document
} from '../models/Document';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/document/`,
    withCredentials: true
});

// Interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const tokensString = localStorage.getItem('google_tokens');

        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                if (tokens.access_token) {
                    config.headers.Authorization = `Bearer ${tokens.access_token}`;
                }
            } catch (error) {
                console.error('Erreur lors de l\'analyse des tokens:', error);
            }
        }

        const userToken = localStorage.getItem('token');
        if (userToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${userToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor for token refresh
api.interceptors.response.use(
    (response) => {
        const newToken = response.headers['x-new-access-token'];
        if (newToken) {
            const tokensString = localStorage.getItem('google_tokens');
            if (tokensString) {
                try {
                    const tokens = JSON.parse(tokensString);
                    tokens.access_token = newToken;
                    localStorage.setItem('google_tokens', JSON.stringify(tokens));
                    console.log('Token rafraîchi avec succès');
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du token:', error);
                }
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokensString = localStorage.getItem('google_tokens');
                if (tokensString) {
                    const tokens = JSON.parse(tokensString);

                    const refreshResponse = await axios.post(`${backendURL}/api/auth/refresh`, {}, {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${tokens.access_token}`
                        }
                    });

                    if (refreshResponse.data.access_token) {
                        tokens.access_token = refreshResponse.data.access_token;
                        if (refreshResponse.data.expiry_date) {
                            tokens.expiry_date = refreshResponse.data.expiry_date;
                        }
                        localStorage.setItem('google_tokens', JSON.stringify(tokens));

                        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                        return api(originalRequest);
                    }
                }

                console.log('Rafraîchissement du token échoué, redirection vers la connexion');
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(error);

            } catch (refreshError) {
                console.error('Le rafraîchissement du token a échoué:', refreshError);
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const documentService = {
    getReceivedDocuments: async (): Promise<DocumentsListResponse> => {
        const response = await api.get<DocumentsListResponse>('received');
        return response.data;
    },

    getDocumentById: async (documentId: string): Promise<DocumentResponse> => {
        const response = await api.get<DocumentResponse>(`${documentId}`);
        return response.data;
    },
    markAsViewed: async (documentId: string): Promise<void> => {
        await api.get(`${documentId}`);
    },
    deleteFromInbox: async (documentId: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`client/${documentId}`);
        return response.data;
    },


};