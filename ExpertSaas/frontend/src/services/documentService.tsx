// services/documentService.tsx
import axios from 'axios';
import { authService } from "./authservice.tsx";
import type {
    DocumentsListResponse,
    AllDocumentsResponse,
    CreateDocumentData,
    UpdateDocumentData,
    DocumentResponse,
    ShareDocumentData
} from '../models/Document';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/document/`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const documentService = {
    sendDocument: async (data: CreateDocumentData): Promise<DocumentResponse> => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            if (data.summary) formData.append('summary', data.summary);
            if (data.receiverId) formData.append('receiverId', data.receiverId);

            data.files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await api.post('send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error sending document:', error);
            throw error;
        }
    },

    getSentDocuments: async (): Promise<DocumentsListResponse> => {
        try {
            const response = await api.get('sent');
            return response.data;
        } catch (error) {
            console.error('Error fetching sent documents:', error);
            throw error;
        }
    },

    updateDocument: async (documentId: string, data: UpdateDocumentData): Promise<DocumentResponse> => {
        try {
            const response = await api.put(`${documentId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    },

    deleteDocument: async (documentId: string): Promise<{ message: string }> => {
        try {
            const response = await api.delete(`${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    },

    shareDocument: async (documentId: string, data: ShareDocumentData): Promise<DocumentResponse> => {
        try {
            const response = await api.post(`${documentId}/share`, data);
            return response.data;
        } catch (error) {
            console.error('Error sharing document:', error);
            throw error;
        }
    },

    unshareDocument: async (documentId: string, userId: string): Promise<DocumentResponse> => {
        try {
            const response = await api.post(`${documentId}/unshare`, { userId });
            return response.data;
        } catch (error) {
            console.error('Error unsharing document:', error);
            throw error;
        }
    },

    // Admin endpoint
    getAllDocuments: async (page: number = 1, limit: number = 10): Promise<AllDocumentsResponse> => {
        try {
            const response = await api.get(`all?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all documents:', error);
            throw error;
        }
    },

    // Utility methods
    getFileIcon: (fileType: string): string => {
        const icons: Record<string, string> = {
            image: '🖼️',
            application: '📄',
            text: '📝',
            video: '🎥',
            audio: '🎵',
            default: '📎'
        };
        return icons[fileType] || icons.default;
    },

    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};