import axios from 'axios';
import type {
    CreateMeetingData,
    Meeting,
    MeetingResponse,
    MeetingsResponse,
} from "../models/Meeting";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/meet`,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const tokensString = localStorage.getItem('google_tokens');

        if (tokensString) {
            try {
                const tokens = JSON.parse(tokensString);
                if (tokens.access_token) {
                    config.headers.Authorization = `Bearer ${tokens.access_token}`;
                }
            } catch (error) {
                console.error('Error parsing tokens:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        const newToken = response.headers['x-new-access-token'];
        if (newToken) {
            const tokensString = localStorage.getItem('google_tokens');
            if (tokensString) {
                try {
                    const tokens = JSON.parse(tokensString);
                    tokens.access_token = newToken;
                    localStorage.setItem('google_tokens', JSON.stringify(tokens));
                    console.log('Token refreshed successfully');
                } catch (error) {
                    console.error('Error updating token:', error);
                }
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokensString = localStorage.getItem('google_tokens');
                if (tokensString) {
                    const tokens = JSON.parse(tokensString);


                    const refreshResponse = await axios.post(`${backendURL}/api/auth/refresh`, {}, {
                        withCredentials: true,
                        headers: {
                            'Authorization': `Bearer ${tokens.access_token}`
                        }
                    });

                    if (refreshResponse.data.access_token) {
                        tokens.access_token = refreshResponse.data.access_token;
                        if (refreshResponse.data.expiry_date) {
                            tokens.expiry_date = refreshResponse.data.expiry_date;
                        }
                        localStorage.setItem('google_tokens', JSON.stringify(tokens));

                        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                        return api(originalRequest);
                    }
                }

                console.log('Token refresh failed, redirecting to login');
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(error);

            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('google_tokens');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

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
    myMeetings:async(): Promise<Meeting[]> => {
        try {
            const response =await api.get<Meeting[]>('/client');
            return response.data.meetings
        }catch (error) {
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