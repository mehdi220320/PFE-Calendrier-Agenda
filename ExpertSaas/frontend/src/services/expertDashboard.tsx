import axios from 'axios';
import { type AccountProgress, type ProgressBreakdown, type ProgressWarning } from "../models/AccountProgress";



const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/dashboard/expert/`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const ExpertDashboard = {

    getAccountProgress: async (): Promise<{
        success: boolean;
        data: {
            userId: string;
            progress: AccountProgress;
            details: {
                profile: boolean;
                availability: boolean;
                breakRecord: boolean;
                availabilityOverridesCount: number;
            }
        }
    }> => {
        try {
            const response = await api.get('/account-progress');
            return response.data;
        } catch (e) {
            console.error('Error fetching account progress:', e);
            throw e;
        }
    }
};

export default ExpertDashboard;