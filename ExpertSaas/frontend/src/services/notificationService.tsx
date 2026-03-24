
import axios from 'axios';
import socketService from './socket.service';
import {type Notification} from '../models/Notification.tsx'
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/notifications`,
    withCredentials: true
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

class NotificationService {
    private listeners: ((notification: Notification) => void)[] = [];
    private initialized = false;

    initialize(userId: string) {
        if (this.initialized) {
            console.log('Notification service already initialized');
            return;
        }

        console.log('Initializing notification service for user:', userId);

        socketService.connect(userId);

        const unsubscribe = socketService.onNewNotification((notification: Notification) => {
            console.log('🔔 NEW NOTIFICATION RECEIVED IN SERVICE:', notification);
            this.notifyListeners(notification);
        });

        this.initialized = true;
        this.unsubscribe = unsubscribe;
    }

    async getNotifications(): Promise<Notification[]> {
        try {
            console.log('Fetching notifications...');
            const response = await api.get('/expert');
            console.log('Notifications fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }
    async readNotification(id: string) {
        try {
           await api.patch(`/read/${id}`);
        }catch (error) {
            console.error('Error mark as seen the notify:', error);
            throw error;
        }
    }

    onNotification(callback: (notification: Notification) => void) {
        this.listeners.push(callback);
        console.log('Notification listener added, total listeners:', this.listeners.length);

        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
            console.log('Notification listener removed');
        };
    }


    private notifyListeners(notification: Notification) {
        console.log('🔔 Notifying', this.listeners.length, 'listeners with notification:', notification);
        this.listeners.forEach(listener => {
            try {
                listener(notification);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    cleanup() {
        console.log('Cleaning up notification service');
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.listeners = [];
        this.initialized = false;
    }

    private unsubscribe: (() => void) | null = null;
}

export default new NotificationService();