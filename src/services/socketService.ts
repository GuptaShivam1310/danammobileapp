import { io, Socket } from 'socket.io-client';
import { appConfig } from '../config/appConfig';

export const BaseUrl = appConfig.apiBaseUrl;

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(url: string, token: string) {
        if (this.socket?.connected) return;

        this.socket = io(url, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            transports: ['websocket'], // Usually safer for real Node.js backends
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket Connected successfully:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.log('⚠️ Socket Connection Error:', error.message, 'URL:', url);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data?: any, callback?: (res: any) => void) {
        if (this.socket) {
            console.log(`📤 Socket Emit: ${event}`, data);
            if (callback) {
                this.socket.emit(event, data, callback);
            } else {
                this.socket.emit(event, data);
            }
        } else {
            console.warn(`⚠️ Socket not initialized. Cannot emit ${event}`);
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    removeListener(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
            } else {
                this.socket.removeAllListeners(event);
            }
        }
    }

    // --- Chat Room Helpers ---

    joinChat(requestId: string) {
        this.emit('chat:join', { request_id: requestId }, (res) => {
            if (!res?.success) {
                console.error('❌ Socket Join failed:', res?.message);
            } else {
                console.log('🏠 Socket Joined room:', requestId);
            }
        });
    }

    leaveChat(requestId: string) {
        this.emit('chat:leave', { request_id: requestId });
        console.log('🚪 Socket Left room:', requestId);
    }

    sendMessage(requestId: string, message: string, type: string = 'text') {
        this.emit('chat:send', { request_id: requestId, message, type }, (res) => {
            if (!res?.success) {
                console.error('❌ Socket Send failed:', res?.message);
            }
        });
    }

    markAsRead(requestId: string) {
        this.emit('chat:read', { request_id: requestId });
    }

    typing(requestId: string) {
        this.emit('chat:typing', { request_id: requestId });
    }

    createNewGroup(productTitle: string) {
        this.emit('chat:create_group', { title: productTitle });
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default SocketService.getInstance();