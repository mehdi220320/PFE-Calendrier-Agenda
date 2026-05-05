import axios from "axios";
import type { User } from '../models/User.tsx';
import {authService} from "./authservice.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/users`,
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
export const userService = {
    getMyData: async (): Promise<User> => {
        try {
            const response = await api.get("/myData");
            console.warn(response.data.firstname)
            return response.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    getAllclients:async()=> {
        try {
            const response = await api.get("/allClients");
            return response.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    updateMyPicture: async (picture: File): Promise<{ message: string, user: User }> => {
        try {
            const formData = new FormData();
            formData.append('picture', picture);

            const response = await api.patch("/mypicture", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            localStorage.setItem('picture',response.data.user.picture);
            return response.data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    getUserById: async ( id:string):Promise<User>=>{
        try {
            const response=await api.get("/user/"+id)
            return response.data;
        }catch (e) {
            console.error(e);
            throw e;
        }
    }
};