import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { ChatItem } from '../../screens/ChatList/ChatListScreen';
import { chatApi } from '../../services/api/chatApi';
import type { RootState } from '../index';
import { ChatMessage } from '../../models/chat';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export interface FetchChatsArg {
    isRefresh?: boolean;
    isSilent?: boolean;
}

export const fetchChats = createAsyncThunk<ChatItem[], FetchChatsArg | undefined, { state: RootState }>(
    'chat/fetchChats',
    async (_arg, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const role = state.auth.user?.role?.toLowerCase() || '';
            const isSeeker = role.startsWith('seeker');

            if (isSeeker) {
                const data = await chatApi.getSeekerChats();
                const formattedChats: ChatItem[] = data.map(item => ({
                    id: item.product_id || Math.random().toString(),
                    requestId: item.request_id,
                    productTitle: item.product_name || '',
                    productImage: item.product_image || '',
                    lastMessage: item.last_message || '',
                    lastMessageTime: item.last_message_time || '',
                    unreadCount: item.has_unread ? 1 : 0,
                    seekerCount: 0,
                    donorName: item.donor?.name || 'Donor',
                    donorImage: item.donor?.profile_image,
                    donorId: item.donor?.id,
                    has_unread: Boolean(item.has_unread),
                }));
                return formattedChats;
            } else {
                const data = await chatApi.getChatProducts();
                // Map API response to UI model
                const formattedChats: ChatItem[] = data.map(item => ({
                    id: item.product_id,
                    productTitle: item.product_name,
                    productImage: item.product_image,
                    lastMessage: '', // Default as API doesn't provide it
                    lastMessageTime: item.last_message_time || '',
                    unreadCount: 0, // Default as API doesn't provide it
                    seekerCount: item.seeker_count,
                    has_unread: Boolean(item.has_unread),
                }));
                return formattedChats;
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch chats';
            return rejectWithValue(message);
        }
    },
);

/**
 * Fetch messages for a specific chat (requestId).
 */
export const fetchMessages = createAsyncThunk<
    { chatId: string; messages: ChatMessage[] },
    string
>(
    'chat/fetchMessages',
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await chatApi.getChatMessages(chatId);
            if (!response.success) {
                return { chatId, messages: [] };
            }

            // Map backend message structure to ChatMessage model
            const mappedMessages: ChatMessage[] = (response.data || []).map((msg: any) => {
                const type = msg.type || 'text';
                const content = msg.message || msg.text || '';
                return {
                    _id: msg.message_id || msg._id || Math.random().toString(36).substring(7),
                    chatId,
                    senderId: String(msg.sender_id || msg.senderId || ''),
                    text: type === 'text' ? content : '',
                    type: type as any,
                    imageUri: type === 'image' ? content : undefined,
                    fileUri: (['pdf', 'document', 'doc'].includes(type)) ? content : undefined,
                    createdAt: msg.created_at || msg.createdAt || new Date().toISOString(),
                };
            });

            return { chatId, messages: mappedMessages };
        } catch (error: any) {
            return { chatId, messages: [] };
        }
    }
);

/**
 * Send a message in a chat. Supports text and images.
 */
export const sendMessage = createAsyncThunk<
    { chatId: string; message: ChatMessage },
    {
        chatId: string;
        text: string;
        _id?: string;
        senderId: string;
        senderName: string;
        type: 'text' | 'image' | 'document' | 'pdf' | 'doc';
    }
>(
    'chat/sendMessage',
    async (params, { rejectWithValue }) => {
        const { chatId, text, _id, senderId, senderName, type } = params;
        try {
            // Normalize type for backend - API expects 'document' for all file types
            const apiType = (type === 'pdf' || type === 'doc') ? 'document' : type;
            const response = await chatApi.sendMessage(chatId, text, apiType);
            const resType = (response.data?.type as any) || type;
            const resContent = response.data?.message || text || '';

            const messageData: ChatMessage = {
                _id: response.data?.message_id || _id || Math.random().toString(36).substr(2, 9),
                chatId,
                senderId: String(response.data?.sender_id || senderId),
                text: resType === 'text' ? resContent : '',
                imageUri: (params as any).imageUri || (resType === 'image' ? resContent : undefined),
                fileUri: (params as any).fileUri || (['pdf', 'document', 'doc'].includes(resType) ? resContent : undefined),
                type: resType,
                createdAt: response.data?.created_at || new Date().toISOString(),
            };

            return { chatId, message: messageData };
        } catch (error: any) {
            // Re-throw or handle failure for UI to react
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

// ─── State ───────────────────────────────────────────────────────────────────

export interface ChatState {
    chatList: ChatItem[];
    messagesByChatId: Record<string, ChatMessage[]>;
    activeChatId: string | null;
    isConnected: boolean;
    typingUsers: Record<string, boolean>; // chatId -> isTyping
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    messagesLoading: boolean;
    messagesError: string | null;
}

const initialState: ChatState = {
    chatList: [],
    messagesByChatId: {},
    activeChatId: null,
    isConnected: false,
    typingUsers: {},
    loading: false,
    refreshing: false,
    error: null,
    messagesLoading: false,
    messagesError: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChatList: (state, action: PayloadAction<ChatItem[]>) => {
            state.chatList = action.payload;
        },
        markChatAsReadLocal: (state, action: PayloadAction<string>) => {
            const chatId = action.payload;
            const chatIndex = state.chatList.findIndex(c => c.id === chatId);
            if (chatIndex !== -1) {
                state.chatList[chatIndex].has_unread = false;
                state.chatList[chatIndex].unreadCount = 0;
            }
        },
        addMessage: (state, action: PayloadAction<{ chatId: string; message: any }>) => {
            const { chatId, message } = action.payload;
            if (!state.messagesByChatId[chatId]) {
                state.messagesByChatId[chatId] = [];
            }

            // Extract IDs correctly from possible formats
            const _id = message._id || message.id || Math.random().toString(36).substring(7);

            // Correctly extract senderId from nested user or sender objects
            let senderId = message.senderId;
            if (!senderId) {
                if (message.user && typeof message.user === 'object') {
                    senderId = message.user.id || message.user._id;
                } else if (message.sender && typeof message.sender === 'object') {
                    senderId = message.sender.id || message.sender._id;
                } else if (message.userId) {
                    senderId = message.userId;
                }
            }

            const type = message.type || (message.imageUri ? 'image' : 'text');
            const content = message.text || message.message || '';

            const formattedMessage: ChatMessage = {
                ...message,
                _id: String(_id),
                chatId: message.chatId || chatId,
                senderId: String(senderId || 'unknown'),
                text: type === 'text' ? content : '',
                imageUri: message.imageUri || (type === 'image' ? content : undefined),
                fileUri: message.fileUri || ((type === 'pdf' || type === 'document') ? content : undefined),
                type: type as any,
                createdAt: message.createdAt || message.time || new Date().toISOString(),
            };

            // Avoid duplicates using _id
            if (!state.messagesByChatId[chatId].find(m => m._id === formattedMessage._id)) {
                state.messagesByChatId[chatId].push(formattedMessage);
            }

            // Update chat summary
            const index = state.chatList.findIndex(c => c.id === chatId);
            if (index !== -1) {
                const chat = state.chatList[index];
                state.chatList[index] = {
                    ...chat,
                    lastMessage: formattedMessage.type === 'image' ? '[Image]' : formattedMessage.text,
                    lastMessageTime: formattedMessage.createdAt,
                };
                // Move to top
                const [movedItem] = state.chatList.splice(index, 1);
                state.chatList.unshift(movedItem);
            }
        },
        setActiveChat: (state, action: PayloadAction<string | null>) => {
            state.activeChatId = action.payload;
        },
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        setTypingStatus: (state, action: PayloadAction<{ chatId: string; isTyping: boolean }>) => {
            state.typingUsers[action.payload.chatId] = action.payload.isTyping;
        },
        resetChatState: (state) => {
            return initialState;
        },
        clearMessagesError: (state) => {
            state.messagesError = null;
        },
        syncGroups: (state, action: PayloadAction<{ groups: any[] }>) => {
            const { groups } = action.payload;
            groups.forEach(g => {
                const chatId = String(g.id);
                const incomingMessages = (g.messages || []).map((m: any) => {
                    const _id = m._id || m.id || Math.random().toString(36).substring(7);

                    let senderId = m.senderId;
                    if (!senderId) {
                        if (m.user && typeof m.user === 'object') {
                            senderId = m.user.id || m.user._id;
                        } else if (m.sender && typeof m.sender === 'object') {
                            senderId = m.sender.id || m.sender._id;
                        } else if (m.userId) {
                            senderId = m.userId;
                        }
                    }

                    const type = m.type || (m.imageUri ? 'image' : 'text');
                    const content = m.text || m.message || '';

                    return {
                        ...m,
                        _id: String(_id),
                        chatId: m.chatId || chatId,
                        senderId: String(senderId || 'unknown'),
                        text: type === 'text' ? content : '',
                        imageUri: m.imageUri || (type === 'image' ? content : undefined),
                        fileUri: m.fileUri || ((type === 'pdf' || type === 'document') ? content : undefined),
                        type: type as any,
                        createdAt: m.createdAt || m.time || new Date().toISOString(),
                    };
                });

                if (!state.messagesByChatId[chatId]) {
                    state.messagesByChatId[chatId] = incomingMessages;
                } else {
                    // Merge and deduplicate
                    const existingMessages = state.messagesByChatId[chatId];
                    const merged = [...existingMessages];

                    incomingMessages.forEach((newMsg: ChatMessage) => {
                        if (!merged.find(m => m._id === newMsg._id)) {
                            merged.push(newMsg);
                        }
                    });

                    // Sort by date if needed, though they are usually in order
                    state.messagesByChatId[chatId] = merged;
                }
            });
        },
        clearChatError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state, action) => {
                if (!action.meta.arg?.isSilent) {
                    if (action.meta.arg?.isRefresh) {
                        state.refreshing = true;
                    } else {
                        state.loading = true;
                    }
                }
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.chatList = action.payload;
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMessages.pending, (state) => {
                state.messagesLoading = true;
                state.messagesError = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messagesByChatId[action.payload.chatId] = action.payload.messages;
                state.messagesLoading = false;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.messagesLoading = false;
                state.messagesError = action.payload as string;
            })
            .addCase(sendMessage.pending, (state, action) => {
                const { chatId, text, _id, senderId, type } = action.meta.arg;
                if (!state.messagesByChatId[chatId]) {
                    state.messagesByChatId[chatId] = [];
                }

                const optimisticMsg: ChatMessage = {
                    _id: _id || Math.random().toString(36).substring(7),
                    chatId,
                    senderId,
                    text,
                    type,
                    createdAt: new Date().toISOString(),
                };

                state.messagesByChatId[chatId].push(optimisticMsg);
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const { chatId, message } = action.payload;
                const tempId = action.meta.arg._id;

                if (!state.messagesByChatId[chatId]) {
                    state.messagesByChatId[chatId] = [message];
                    return;
                }

                const index = state.messagesByChatId[chatId].findIndex(m => m._id === tempId);
                if (index !== -1) {
                    state.messagesByChatId[chatId][index] = message;
                } else if (!state.messagesByChatId[chatId].find(m => m._id === message._id)) {
                    state.messagesByChatId[chatId].push(message);
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                const { chatId, _id } = action.meta.arg;
                if (state.messagesByChatId[chatId]) {
                    state.messagesByChatId[chatId] = state.messagesByChatId[chatId].filter(
                        m => m._id !== _id
                    );
                }
            });
    },
});

export const {
    setChatList,
    markChatAsReadLocal,
    addMessage,
    setActiveChat,
    setConnectionStatus,
    setTypingStatus,
    resetChatState,
    clearMessagesError,
    syncGroups,
    clearChatError
} = chatSlice.actions;

export const selectMessages = (chatId: string) => (state: RootState): ChatMessage[] =>
    state.chat.messagesByChatId[chatId] || [];

export const selectIsConnected = (state: RootState) => state.chat.isConnected;

export const selectAllChats = (state: RootState): ChatItem[] => state.chat.chatList;
export const selectChatsLoading = (state: RootState): boolean => state.chat.loading;
export const selectChatsRefreshing = (state: RootState): boolean => state.chat.refreshing;
export const selectChatsError = (state: RootState): string | null => state.chat.error;

export const selectFilteredChats = (query: string) =>
    (state: RootState): ChatItem[] => {
        const chats = state.chat.chatList;
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return chats.slice();
        return chats.filter(c =>
            c.productTitle.toLowerCase().includes(trimmed) ||
            (c.donorName && c.donorName.toLowerCase().includes(trimmed))
        );
    };

export default chatSlice.reducer;
