import axios from 'axios';
import type {
    CreateMeetingData,
    Meeting,
    MeetingResponse,
    MeetingsResponse,
} from "../models/Meeting.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/meet`,
    withCredentials: true
});


export const meetingService = {

    getAllMeetings: async (): Promise<MeetingsResponse> => {
        try {
            const response = await api.get<MeetingsResponse>('/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all meetings:', error);
            throw error;
        }
    },


    createMeeting: async (meetingData: CreateMeetingData): Promise<MeetingResponse> => {
        try {
            const response = await api.post<MeetingResponse>('/add', meetingData);
            return response.data;
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    },


    getMeetingById: async (id: string): Promise<{ meeting: Meeting }> => {
        try {

            const response = await api.get<{ meeting: Meeting }>(`/meet/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching meeting with id ${id}:`, error);
            throw error;
        }
    }
};