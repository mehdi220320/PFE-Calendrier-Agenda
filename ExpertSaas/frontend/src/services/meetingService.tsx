import axios from 'axios';
import type {
    CreateMeetingData,
    Meeting,
    MeetingResponse,
} from "../models/Meeting.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/meet`,
    withCredentials: true
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const meetingService = {


    createMeeting: async (meetingData: CreateMeetingData): Promise<MeetingResponse> => {
        try {
            const response = await api.post<MeetingResponse>('/add', meetingData);
            return response.data;
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    },

    myMeetings:async(): Promise<Meeting[]> => {
        try {
            const response =await api.get<Meeting[]>('/expert');
            return response.data.meetings
        }catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    },
    getMeetingByRoom:async (jitsiRoom: string): Promise<any>=> {
        try {
            const response = await api.get(`/room/${jitsiRoom}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching meeting by room:', error);
            throw error;
        }
    }

};