import axios from 'axios';
import type {
    DisponibilityData,

} from '../models/Calendar.tsx';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/calendar`,
    withCredentials: true
});


export const calendarService = {
    getDisponibility: async (id:any): Promise<DisponibilityData> => {
        const response = await api.get('/disponibility/'+id);
        return response.data;
    }
};