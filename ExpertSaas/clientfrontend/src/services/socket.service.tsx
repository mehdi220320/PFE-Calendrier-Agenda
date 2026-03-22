import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private notificationCallbacks: ((notification: any) => void)[] = [];

    connect(userId?: string) {

        if (this.socket?.connected) {
            return this.socket;
        }

        if (userId) {
            this.userId = userId;
        }

        if (!this.userId) {
            this.userId =  localStorage.getItem('user');

        }

        if (this.socket) {
            this.disconnect();
        }

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
            console.error('🔌 SOCKET: Cannot setup listeners, socket is null');
            return;
        }


        this.socket.on('connect', () => {
            this.reconnectAttempts = 0;

            if (this.userId) {
                this.socket?.emit('joinRoom', {userId:this.userId});
            } else {
                console.warn('🔌 SOCKET: No userId to join room');
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌🔌 SOCKET: Disconnected. Reason:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌🔌 SOCKET: Connection error:', error);
            this.reconnectAttempts++;
        });

        this.socket.on('error', (error) => {
            console.error('❌🔌 SOCKET: Error:', error);
        });

        this.socket.on('roomJoined', (roomId) => {
            console.log('✅🔌 SOCKET: Successfully joined room:', roomId);
        });

        this.socket.on('newNotification', (data) => {
            if (data) {
                Object.keys(data).forEach(key => {
                    console.log(`📨🔔 SOCKET: data.${key} =`, data[key]);
                });
            } else {
                console.warn('📨🔔 SOCKET: Received empty or null data');
            }
            this.notificationCallbacks.forEach((callback, index) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`📨🔔 SOCKET: Error in callback #${index}:`, error);
                }
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.notificationCallbacks = [];
        } else {
            console.log('🔌 SOCKET: No socket to disconnect');
        }
    }

    onNewNotification(callback: (notification: any) => void) {
        this.notificationCallbacks.push(callback);

        return () => {
            this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
        };
    }
}

export default new SocketService();