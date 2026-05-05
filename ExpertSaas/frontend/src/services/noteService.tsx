import axios from 'axios';
import {authService} from "./authservice.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/note`,
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
export const NoteService = {
    getMyNotes: async () => {
        try {
            const response = await api.get('/myNotes');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error);
            throw error;
        }
    },

    getMyNotesByPage: async (i:number ) => {
        try {
            const response = await api.get('/myNotes/'+i);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des notes:', error);
            throw error;
        }
    },

    addNote: async (noteData) => {
        try {
            const response = await api.post('/add', noteData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la note:', error);
            throw error;
        }
    },

    editNote: async (id, noteData) => {
        try {
            const response = await api.patch(`/edit/${id}`, noteData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la modification de la note:', error);
            throw error;
        }
    },

    deleteNote: async (id) => {
        try {
            const response = await api.delete(`/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de la note:', error);
            throw error;
        }
    }
};

export const NoteModel = {
    id: '',
    title: '',
    description: '',
    creator: '',
    client: null,
    meeting: null,
    alarmAt: null,
    createdAt: '',
    updatedAt: ''
};