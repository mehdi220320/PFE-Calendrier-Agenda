import axios from 'axios';
import {type ExpertProfil,type ExpertProfilData} from "../models/ExpertProfil.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/expertProfile`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const expertProfilService = {
    addExpertProfile: async (expertProfileData: ExpertProfilData): Promise<ExpertProfil> => {
        try {
            const response = await api.post<ExpertProfil>("/add", expertProfileData);
            return response.data.profile;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    getExpertProfile: async (expertId: string): Promise<ExpertProfil> => {
        try {
            const response = await api.get<{ profile: ExpertProfil }>(`/byexpert/${expertId}`);
            return response.data.profile;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    getCategories: async (): Promise<{ category: string, nb_of_profiles: number }[]> => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    updateCategoryName:async(category:string, nameUpdated:string):Promise<{ message:string, updatedCount:number }> => {
        try {
            const response = await api.patch('/categories',{category, nameUpdated})
            return response.data;
        }catch (e){
            console.error(e);
            throw e;
        }
    },

    updateExpertProfile: async (profileId: string, data: Partial<ExpertProfilData>): Promise<ExpertProfil> => {
        try {
            const response = await api.put<{ profile: ExpertProfil }>(`/${profileId}`, data);
            return response.data.profile;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

export default expertProfilService;