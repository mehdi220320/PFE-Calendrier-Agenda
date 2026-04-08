// services/messengerService.tsx
import axios from 'axios';
import socketService from './socket.service';
import type {User} from "../models/User.tsx";

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/messenger`,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Message {
    id: string;
    sender: string;
    conversation: string;
    message: string;
    pictures: string[];
    files: string[];
    createdAt: string;
}

export interface Conversation {
    id: string;
    client: string;
    expert: string;
    createdAt: string;
    clientData?: User;
}

class MessengerService {
    private messageListeners: ((message: Message) => void)[] = [];
    private conversationListeners: ((conversation: Conversation) => void)[] = [];
    private initialized = false;
    private unsubscribeMessage: (() => void) | null = null;
    private unsubscribeConversation: (() => void) | null = null;

    initialize(userId: string) {
        if (this.initialized) {
            console.log('Messenger service already initialized');
            return;
        }

        console.log('Initializing messenger service for user:', userId);
        socketService.connect(userId);

        this.unsubscribeMessage = socketService.onNewMessage((message: Message) => {
            console.log('📨 NEW MESSAGE RECEIVED IN SERVICE:', message);
            this.notifyMessageListeners(message);
        });

        this.unsubscribeConversation = socketService.onNewConversation((conversation: Conversation) => {
            console.log('💬 NEW CONVERSATION RECEIVED IN SERVICE:', conversation);
            this.notifyConversationListeners(conversation);
        });

        this.initialized = true;
    }

    async getExpertConversations(): Promise<Conversation[]> {
        try {
            const response = await api.get('/conversations/expert');
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        try {
            const response = await api.get(`/messages/expert/${conversationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async sendMessage(conversationId: string, message: string, files?: File[]): Promise<Message> {
        try {
            const formData = new FormData();
            formData.append('message', message);

            if (files && files.length > 0) {
                files.forEach(file => {
                    formData.append('files', file);
                });
            }

            const response = await api.post(`/addMessage/expert/${conversationId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async getFiles(conversationId: string): Promise<{ pictures: string[], files: string[] }> {
        try {
            const response = await api.get(`/files/expert/${conversationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }
    }

    onNewMessage(callback: (message: Message) => void) {
        this.messageListeners.push(callback);
        console.log('Message listener added, total listeners:', this.messageListeners.length);
        return () => {
            this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
            console.log('Message listener removed');
        };
    }

    onNewConversation(callback: (conversation: Conversation) => void) {
        this.conversationListeners.push(callback);
        console.log('Conversation listener added, total listeners:', this.conversationListeners.length);
        return () => {
            this.conversationListeners = this.conversationListeners.filter(listener => listener !== callback);
            console.log('Conversation listener removed');
        };
    }

    private notifyMessageListeners(message: Message) {
        console.log('📨 Notifying', this.messageListeners.length, 'listeners with message:', message);
        this.messageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });
    }

    private notifyConversationListeners(conversation: Conversation) {
        console.log('💬 Notifying', this.conversationListeners.length, 'listeners with conversation:', conversation);
        this.conversationListeners.forEach(listener => {
            try {
                listener(conversation);
            } catch (error) {
                console.error('Error in conversation listener:', error);
            }
        });
    }

    cleanup() {
        console.log('Cleaning up messenger service');
        if (this.unsubscribeMessage) {
            this.unsubscribeMessage();
        }
        if (this.unsubscribeConversation) {
            this.unsubscribeConversation();
        }
        this.messageListeners = [];
        this.conversationListeners = [];
        this.initialized = false;
    }
}

export default new MessengerService();