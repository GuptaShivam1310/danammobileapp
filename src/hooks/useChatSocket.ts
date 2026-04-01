import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import socketService, { BaseUrl } from '../services/socketService';
import {
    addMessage,
    setConnectionStatus,
} from '../store/chat/chatSlice';

export const useChatSocket = (userId: string) => {
    const dispatch = useAppDispatch();
    const isConnected = useAppSelector(state => state.chat.isConnected);
    const token = useAppSelector(state => state.auth.token);

    useEffect(() => {
        if (!token || !userId) return;

        console.log(`🔌 Connecting Socket to: ${BaseUrl}`);
        socketService.connect(BaseUrl, token);

        const onConnect = () => dispatch(setConnectionStatus(true));
        const onDisconnect = () => dispatch(setConnectionStatus(false));

        // New Backend message receiver: chat:message
        const onChatMessage = (msg: any) => {
            console.log("📥 New Socket Message (chat:message):", msg);
            // msg = { message_id, sender_id, message, type, created_at, request_id }

            // Skip own messages as they are handled by REST API optimistic updates
            if (String(msg.sender_id) === String(userId)) {
                console.log("📤 Skipping own message from socket");
                return;
            }

            const requestId = msg.request_id;
            if (requestId) {
                dispatch(addMessage({
                    chatId: requestId,
                    message: {
                        _id: msg.message_id,
                        senderId: String(msg.sender_id),
                        text: msg.message,
                        type: msg.type,
                        createdAt: msg.created_at,
                        chatId: requestId
                    }
                }));
            }
        };

        socketService.on('connect', onConnect);
        socketService.on('disconnect', onDisconnect);
        socketService.on('chat:message', onChatMessage);

        return () => {
            socketService.removeListener('connect', onConnect);
            socketService.removeListener('disconnect', onDisconnect);
            socketService.removeListener('chat:message', onChatMessage);
        };
    }, [userId, token, dispatch]);

    const joinChat = useCallback((requestId: string) => {
        socketService.joinChat(requestId);
    }, []);

    const leaveChat = useCallback((requestId: string) => {
        socketService.leaveChat(requestId);
    }, []);

    const sendMessage = useCallback((requestId: string, text: string, type: string = 'text') => {
        socketService.sendMessage(requestId, text, type);
    }, []);

    const markAsRead = useCallback((requestId: string) => {
        socketService.markAsRead(requestId);
    }, []);

    return {
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
        markAsRead,
    };
};
