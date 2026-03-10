import axios from 'axios';
import type {User} from "../models/User";
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/users`,
    withCredentials: true
});


export const UserServices = {
    getExperts: async (): Promise<User[]> => {
        const response = await api.get('/experts');
        return response.data.experts;
    },
    getExpertById:async(id: string): Promise<User> => {
    const response = await api.get('/expert/'+id);
    return response.data.expert;
    }
}