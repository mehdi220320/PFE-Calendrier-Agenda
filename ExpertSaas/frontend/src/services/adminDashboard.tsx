import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/dashboard/admin`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const dashboardService = {
    getStats: async () => {
        try {
            const response = await api.get('/counts');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    },

    getExpertActivation: async () => {
        try {
            const response = await api.get('/expertActivation');
            return response.data;
        } catch (error) {
            console.error('Error fetching expert activation:', error);
            throw error;
        }
    },

    getReclamationStatsByDateRange: async (from, to, page = 1, limit = 10) => {
        try {
            const response = await api.get('/reclamation/stats', {
                params: {
                    from,
                    to,
                    page,
                    limit
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching reclamation stats:', error);
            throw error;
        }
    },

    getLast30DaysRange: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        return {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
        };
    },

    getDateRangeFromInterval: (interval) => {
        const endDate = new Date();
        const startDate = new Date();

        switch(interval) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'thisMonth':
                startDate.setDate(1);
                break;
            case 'lastMonth':
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setDate(1);
                endDate.setDate(0);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        return {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
        };
    }
};