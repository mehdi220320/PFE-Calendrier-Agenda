import axios from 'axios';
import type { WorkingHours,Break,BreakFormData , BlockedSlot, WorkingHoursFormData, BlockedSlotFormData } from '../models/Calendar';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/calendar`,
    withCredentials: true
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const calendarService = {
    // Vérifier si les heures de travail existent
    checkWorkingHoursExists: async (): Promise<{ result: boolean; message: string }> => {
        const response = await api.get('/checkWorkingHoursExists');
        return response.data;
    },

    // Récupérer les heures de travail
    getWorkingHours: async (): Promise<WorkingHours> => {
        const response = await api.get('/WorkingHours');
        return response.data.workingHours;
    },

    // Ajouter des heures de travail
    addWorkingHours: async (data: WorkingHoursFormData): Promise<WorkingHours> => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        const response = await api.post('/addWorkingHours', {
            ...data,
            userId: user?.id
        });
        return response.data.WorkingHours;
    },

    // Mettre à jour les heures de travail
    updateWorkingHours: async (data: WorkingHoursFormData): Promise<WorkingHours> => {
        const response = await api.patch('/updateWorkingHours', data);
        return response.data.newworkingHours;
    },

    // Ajouter un créneau bloqué
// Dans calendarService.ts, assurez-vous que le nom du champ est correct
    addBlockedSlot: async (data: BlockedSlotFormData): Promise<BlockedSlot> => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        // Important: le backend attend "endDaytDate" mais notre interface utilise "endDayDate"
        // Nous devons mapper le champ correctement
        const backendData = {
            ...data,
            userId: user?.id,
            endDaytDate: data.endDayDate // Mapper endDayDate vers endDaytDate pour le backend
        };

        const response = await api.post('/addBlockedSlot', backendData);
        return response.data.BlockedSlot;
    },
    // Récupérer tous les créneaux bloqués
    getAllBlockedSlots: async (): Promise<BlockedSlot[]> => {
        const response = await api.get('/allBlockedSlot');
        return response.data.blockedSlot;
    },

    // Supprimer un créneau bloqué
    deleteBlockedSlot: async (blockedSlotId: string): Promise<void> => {
        await api.delete('/deleteBlockedSlot', { data: { blockedSlotId } });
    },
    getBreak: async (): Promise<Break | null> => {
        try {
            const response = await api.get('/Break');
            return response.data.bbreak || null;
        } catch (error) {
            console.error('Erreur lors de la récupération de la pause:', error);
            return null;
        }
    },

    addBreak: async (data: BreakFormData): Promise<Break> => {
        const response = await api.post('/addBreak', data);
        return response.data.BlockedSlot; // Note: le backend retourne "BlockedSlot" mais c'est un Break
    },

    updateBreak: async (data: BreakFormData): Promise<Break> => {
        const response = await api.patch('/updateBreak', data);
        return response.data.newBreak;
    },

    deleteBreak: async (): Promise<void> => {
        await api.delete('/deleteBreak');
    },
    getDisponibility: async (): Promise<DisponibilityData> => {
        const response = await api.get('/disponibility');
        return response.data;
    }
};