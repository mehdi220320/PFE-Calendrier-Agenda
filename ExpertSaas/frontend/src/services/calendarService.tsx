import axios from 'axios';
import type {
    DisponibilityData,
    Availability,
    Break,
    BreakFormData,
    BlockedSlot,
    AvailabilityFormData,
    BlockedSlotFormData,
    AvailabilityOverride,
    AvailabilityOverrideFormData,
    WorkingInterval
} from '../models/Calendar.tsx';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/calendar`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const calendarService = {
    checkAvailabilityExists: async (): Promise<{ result: boolean; message: string }> => {
        const response = await api.get('/checkAvailabilityExists');
        return response.data;
    },

    getAvailability: async (): Promise<Availability> => {
        const response = await api.get('/Availability');
        return response.data.availability;
    },

    addAvailability: async (data: AvailabilityFormData): Promise<Availability> => {
        const response = await api.post('/addAvailability', {
            ...data,
        });
        return response.data.Availability;
    },

    updateAvailability: async (data: AvailabilityFormData): Promise<Availability> => {
        const response = await api.patch('/updateAvailability', data);
        return response.data.newAvailability;
    },

    addBlockedSlot: async (data: BlockedSlotFormData): Promise<BlockedSlot> => {
        const backendData = {
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            reason: data.reason
        };
        const response = await api.post('/addBlockedSlot', backendData);
        return response.data.blockedSlot;
    },

    getAllBlockedSlots: async (): Promise<BlockedSlot[]> => {
        const response = await api.get('/allBlockedSlot');
        return response.data.blockedSlot;
    },

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
        return response.data.BlockedSlot;
    },

    updateBreak: async (data: BreakFormData): Promise<Break> => {
        const response = await api.patch('/updateBreak', data);
        return response.data.newBreak;
    },

    deleteBreak: async (): Promise<void> => {
        await api.delete('/deleteBreak');
    },

    // NEW: AvailabilityOverride methods
    addAvailabilityOverride: async (data: AvailabilityOverrideFormData): Promise<AvailabilityOverride> => {
        const response = await api.post('/addAvailabilityOverride', data);
        return response.data.availabilityOverride;
    },

    updateAvailabilityOverride: async (id: string, data: Partial<AvailabilityOverrideFormData>): Promise<AvailabilityOverride> => {
        const response = await api.patch(`/updateAvailabilityOverride/${id}`, data);
        return response.data.availabilityOverride;
    },

    deleteAvailabilityOverride: async (id: string): Promise<void> => {
        await api.delete(`/deleteAvailabilityOverride/${id}`);
    },

    getAvailabilityOverride: async (day?: string): Promise<AvailabilityOverride | null> => {
        try {
            const response = await api.get('/disponibility');
            return response.data.availabilityoverride || null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'override:', error);
            return null;
        }
    },

    getDisponibility: async (): Promise<DisponibilityData> => {
        const response = await api.get('/disponibility');
        return response.data;
    }
};