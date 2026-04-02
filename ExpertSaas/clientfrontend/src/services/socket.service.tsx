// services/socket.service.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private notificationCallbacks: ((notification: any) => void)[] = [];
    private newMessageCallbacks: ((message: Message) => void)[] = [];
    private newConversationCallbacks: ((conversation: Conversation) => void)[] = [];

    connect(userId?: string) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        if (userId) {
            this.userId = userId;
        }

        if (!this.userId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    this.userId = user.id;
                    console.log('Retrieved userId from localStorage:', this.userId);
                } catch (error) {
                    console.error('Error parsing user from localStorage:', error);
                }
            }
        }

        if (!this.userId) {
            console.error('Cannot connect socket: No userId provided or found in localStorage');
            return null;
        }

        if (this.socket) {
            this.disconnect();
        }

        console.log('Connecting socket for user:', this.userId);
        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true
        });

        this.setupEventListeners();
        return this.socket;
    }

    private setupEventListeners() {
        if (!this.socket) {
            console.error('Cannot setup listeners, socket is null');
            return;
        }

        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.reconnectAttempts = 0;
            if (this.userId) {
                console.log('Joining room for user:', this.userId);
                this.socket?.emit('joinRoom', { userId: this.userId });
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected. Reason:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.reconnectAttempts++;
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        this.socket.on('roomJoined', (roomId) => {
            console.log('✅ Successfully joined room:', roomId);
        });

        this.socket.on('newNotification', (data) => {
            console.log('📨🔔 New notification received:', data);
            this.notificationCallbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in notification callback:', error);
                }
            });
        });

        this.socket.on('newMessage', (message: Message) => {
            console.log('📨 New message received:', message);
            this.newMessageCallbacks.forEach(callback => {
                try {
                    callback(message);
                } catch (error) {
                    console.error('Error in newMessage callback:', error);
                }
            });
        });

        this.socket.on('newConversation', (conversation: Conversation) => {
            console.log('💬 New conversation received:', conversation);
            this.newConversationCallbacks.forEach(callback => {
                try {
                    callback(conversation);
                } catch (error) {
                    console.error('Error in newConversation callback:', error);
                }
            });
        });
    }

    disconnect() {
        if (this.socket) {
            console.log('Disconnecting socket');
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNewNotification(callback: (notification: any) => void) {
        this.notificationCallbacks.push(callback);
        console.log('Notification listener added, total:', this.notificationCallbacks.length);
        return () => {
            this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
            console.log('Notification listener removed');
        };
    }

    onNewMessage(callback: (message: Message) => void) {
        this.newMessageCallbacks.push(callback);
        console.log('Message listener added, total:', this.newMessageCallbacks.length);
        return () => {
            this.newMessageCallbacks = this.newMessageCallbacks.filter(cb => cb !== callback);
            console.log('Message listener removed');
        };
    }

    onNewConversation(callback: (conversation: Conversation) => void) {
        this.newConversationCallbacks.push(callback);
        console.log('Conversation listener added, total:', this.newConversationCallbacks.length);
        return () => {
            this.newConversationCallbacks = this.newConversationCallbacks.filter(cb => cb !== callback);
            console.log('Conversation listener removed');
        };
    }

    getSocket() {
        return this.socket;
    }
}

export default new SocketService();