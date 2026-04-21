import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/reclamation`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Reclamation {
    id: string;
    title: string;
    description: string;
    user: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'service' | 'other';
    picture: string | null;
    date: string;
    adminResponse: string | null;
    adminResponsePicture: string | null;
    adminResponseDate: string | null;
    respondedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReclamationData {
    title: string;
    description: string;
    category?: string;
    priority?: string;
}

export const reclamationService = {
    // User functions
    createReclamation: async (data: CreateReclamationData, picture?: File): Promise<Reclamation> => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            if (data.category) formData.append('category', data.category);
            if (data.priority) formData.append('priority', data.priority);
            if (picture) formData.append('picture', picture);

            // Log the form data for debugging
            console.log('Sending form data:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await api.post('/reclamations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data || response.data;
        } catch (error: any) {
            console.error('Error creating reclamation:', error.response?.data || error.message);
            throw error;
        }
    },

    getMyReclamations: async (): Promise<Reclamation[]> => {
        try {
            const response = await api.get('/my-reclamations');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching my reclamations:', error);
            throw error;
        }
    },

    getReclamationById: async (id: string): Promise<Reclamation> => {
        try {
            const response = await api.get(`/reclamations/${id}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching reclamation:', error);
            throw error;
        }
    },

    updateReclamation: async (id: string, data: Partial<CreateReclamationData>): Promise<Reclamation> => {
        try {
            const response = await api.put(`/reclamations/${id}`, data);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error updating reclamation:', error);
            throw error;
        }
    },

    deleteReclamation: async (id: string): Promise<void> => {
        try {
            await api.delete(`/reclamations/${id}`);
        } catch (error) {
            console.error('Error deleting reclamation:', error);
            throw error;
        }
    },

    // Admin functions
    getAllReclamations: async (filters?: { status?: string; priority?: string; category?: string }): Promise<Reclamation[]> => {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.priority) params.append('priority', filters.priority);
            if (filters?.category) params.append('category', filters.category);

            const response = await api.get(`/admin/reclamations?${params.toString()}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching all reclamations:', error);
            throw error;
        }
    },

    respondToReclamation: async (id: string, responseText: string, picture?: File): Promise<Reclamation> => {
        try {
            const formData = new FormData();
            formData.append('response', responseText);
            if (picture) formData.append('responsePicture', picture);

            const response = await api.post(`/admin/reclamations/${id}/respond`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error responding to reclamation:', error);
            throw error;
        }
    },

    updateReclamationStatus: async (id: string, status: string): Promise<Reclamation> => {
        try {
            const response = await api.patch(`/admin/reclamations/${id}/status`, { status });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },

    updateReclamationPriority: async (id: string, priority: string): Promise<Reclamation> => {
        try {
            const response = await api.patch(`/admin/reclamations/${id}/priority`, { priority });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error updating priority:', error);
            throw error;
        }
    },

    getStatistics: async (): Promise<any> => {
        try {
            const response = await api.get('/admin/reclamations/statistics/summary');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    },

    adminDeleteReclamation: async (id: string): Promise<void> => {
        try {
            await api.delete(`/admin/reclamations/${id}`);
        } catch (error) {
            console.error('Error deleting reclamation:', error);
            throw error;
        }
    }
};