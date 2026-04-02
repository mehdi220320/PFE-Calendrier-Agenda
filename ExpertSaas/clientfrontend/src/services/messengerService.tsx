// services/messenger.service.ts
import axios from 'axios';
import socketService from './socket.service';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/messenger`,
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
    (error) => Promise.reject(error)
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
                        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
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

export interface Message {
    id: string;
    sender: string;
    conversation: string;
    message: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    client: string;
    expert: string;
    createdAt: string;
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

    async getClientConversations(): Promise<Conversation[]> {
        try {
            const response = await api.get('/conversations/client');
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    async createConversationWithExpert(expertId: string): Promise<{ conversation: Conversation; message: string }> {
        try {
            const response = await api.post(`/create-conversation/client/${expertId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 401 && error.response?.data === "Conversation already exist") {
                const conversations = await this.getClientConversations();
                const existingConversation = conversations.find(conv => conv.expert === expertId);
                if (existingConversation) {
                    return { conversation: existingConversation, message: "Conversation already exists" };
                }
            }
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        try {
            const response = await api.get(`/messages/client/${conversationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async sendMessage(conversationId: string, message: string): Promise<Message> {
        try {
            const response = await api.post(`/addMessage/client/${conversationId}`, { message });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
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