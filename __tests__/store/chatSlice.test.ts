import chatReducer, {
    ChatState,
    addMessage,
    clearChatError,
    clearMessagesError,
    fetchChats,
    fetchMessages,
    markChatAsReadLocal,
    sendMessage,
    setActiveChat,
    setChatList,
    setConnectionStatus,
    setTypingStatus,
    resetChatState,
    syncGroups,
    selectMessages,
    selectIsConnected,
    selectAllChats,
    selectChatsLoading,
    selectChatsRefreshing,
    selectChatsError,
    selectFilteredChats,
} from '../../src/store/chat/chatSlice';
import { ChatItem } from '../../src/screens/ChatList/ChatListScreen';
import { chatApi } from '../../src/services/api/chatApi';

jest.mock('../../src/services/api/chatApi', () => ({
    chatApi: {
        getChatProducts: jest.fn(),
        getSeekerChats: jest.fn(),
        getChatMessages: jest.fn(),
        sendMessage: jest.fn(),
    },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeChat = (overrides: Partial<ChatItem> = {}): ChatItem => ({
    id: '1',
    productTitle: 'Apple MacBook Air M2',
    productImage: 'https://example.com/img.jpg',
    lastMessage: 'Is this available?',
    lastMessageTime: '2026-02-25T09:41:00Z',
    unreadCount: 0,
    seekerCount: 12,
    ...overrides,
});

const makeMessage = (overrides: any = {}) => ({
    _id: 'm1',
    chatId: '1',
    senderId: 'user2',
    text: 'Hello',
    type: 'text' as const,
    createdAt: '2026-02-25T10:00:00Z',
    ...overrides,
});

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('chatSlice', () => {
    // ─── Initial State ─────────────────────────────────────────────
    describe('initial state', () => {
        it('returns the correct initial state', () => {
            const state = chatReducer(undefined, { type: '@@INIT' });
            expect(state).toEqual(initialState);
        });
    });

    // ─── Sync actions ──────────────────────────────────────────────
    describe('sync actions', () => {
        it('setChatList sets chat list', () => {
            const chats = [makeChat({ id: '1' }), makeChat({ id: '2' })];
            const state = chatReducer(initialState, setChatList(chats));
            expect(state.chatList).toHaveLength(2);
        });

        it('setActiveChat sets activeChatId', () => {
            const state = chatReducer(initialState, setActiveChat('chat-1'));
            expect(state.activeChatId).toBe('chat-1');
        });

        it('setActiveChat accepts null', () => {
            const state = chatReducer({ ...initialState, activeChatId: 'x' }, setActiveChat(null));
            expect(state.activeChatId).toBeNull();
        });

        it('setConnectionStatus sets isConnected', () => {
            const state = chatReducer(initialState, setConnectionStatus(true));
            expect(state.isConnected).toBe(true);
        });

        it('setTypingStatus updates typingUsers', () => {
            const state = chatReducer(initialState, setTypingStatus({ chatId: 'c1', isTyping: true }));
            expect(state.typingUsers['c1']).toBe(true);
        });

        it('clearChatError clears the error field', () => {
            const state = chatReducer(
                { ...initialState, error: 'Something broke' },
                clearChatError(),
            );
            expect(state.error).toBeNull();
        });

        it('clearMessagesError clears messagesError', () => {
            const state = chatReducer(
                { ...initialState, messagesError: 'msg error' },
                clearMessagesError(),
            );
            expect(state.messagesError).toBeNull();
        });

        it('resetChatState returns initial state', () => {
            const modified: ChatState = {
                ...initialState,
                chatList: [makeChat()],
                isConnected: true,
                activeChatId: 'x',
            };
            const state = chatReducer(modified, resetChatState());
            expect(state).toEqual(initialState);
        });
    });

    // ─── fetchChats thunk ──────────────────────────────────────────
    describe('fetchChats thunk', () => {
        it('maps API chats into ChatItem list', async () => {
            (chatApi.getChatProducts as jest.Mock).mockResolvedValue([
                {
                    product_id: 'p1',
                    product_name: 'Product 1',
                    product_image: 'img1',
                    last_message_time: '2026-02-25T09:41:00Z',
                    seeker_count: 3,
                },
            ]);

            const getState = jest.fn(() => ({ auth: { user: { role: 'donor' } } }));
            const result = await fetchChats(undefined)(jest.fn(), getState, undefined);

            expect(result.type).toBe('chat/fetchChats/fulfilled');
            expect(result.payload).toEqual([
                {
                    id: 'p1',
                    productTitle: 'Product 1',
                    productImage: 'img1',
                    unreadCount: 0,
                    seekerCount: 3,
                    lastMessage: '',
                    lastMessageTime: '2026-02-25T09:41:00Z',
                    has_unread: false,
                },
            ]);
        });

        it('maps seeker chats into ChatItem list', async () => {
            (chatApi.getSeekerChats as jest.Mock).mockResolvedValue([
                {
                    product_id: 'prod-1',
                    request_id: 'req-1',
                    product_name: 'Product A',
                    product_image: 'img-a',
                    last_message: 'Hello',
                    last_message_time: '2026-03-01T10:20:00Z',
                    has_unread: true,
                    donor: { id: 'don-1', name: 'Alice', profile_image: 'donor-img' },
                },
            ]);

            const getState = jest.fn(() => ({ auth: { user: { role: 'seeker' } } }));
            const result = await fetchChats(undefined)(jest.fn(), getState, undefined);

            expect(result.type).toBe('chat/fetchChats/fulfilled');
            expect(result.payload).toEqual([
                {
                    id: 'prod-1',
                    requestId: 'req-1',
                    productTitle: 'Product A',
                    productImage: 'img-a',
                    lastMessage: 'Hello',
                    lastMessageTime: '2026-03-01T10:20:00Z',
                    unreadCount: 1,
                    seekerCount: 0,
                    donorName: 'Alice',
                    donorImage: 'donor-img',
                    donorId: 'don-1',
                    has_unread: true,
                },
            ]);
        });

        it('rejects with fallback message when error is missing details', async () => {
            (chatApi.getChatProducts as jest.Mock).mockRejectedValue({});

            const result = await fetchChats(undefined)(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/fetchChats/rejected');
            expect(typeof result.payload).toBe('string');
        });

        it('sets loading=true on pending (initial load)', () => {
            const action = fetchChats.pending('req', undefined);
            const state = chatReducer(initialState, action);
            expect(state.loading).toBe(true);
            expect(state.refreshing).toBe(false);
            expect(state.error).toBeNull();
        });

        it('sets refreshing=true when arg.isRefresh is true', () => {
            const action = fetchChats.pending('req', { isRefresh: true });
            const state = chatReducer(initialState, action);
            expect(state.refreshing).toBe(true);
            expect(state.loading).toBe(false);
        });

        it('does not set loading when isSilent is true', () => {
            const action = fetchChats.pending('req', { isSilent: true, isRefresh: true });
            const state = chatReducer(initialState, action);
            expect(state.loading).toBe(false);
            expect(state.refreshing).toBe(false);
            expect(state.error).toBeNull();
        });

        it('stores chats and clears loading on fulfilled', () => {
            const chats = [makeChat({ id: '1' }), makeChat({ id: '2' })];
            const action = fetchChats.fulfilled(chats, 'req', undefined);
            const state = chatReducer(
                { ...initialState, loading: true },
                action,
            );
            expect(state.loading).toBe(false);
            expect(state.refreshing).toBe(false);
            expect(state.chatList).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('stores error message and clears loading on rejected', () => {
            const action = fetchChats.rejected(
                new Error('Network error'),
                'req',
                undefined,
                'Network error',
            );
            const state = chatReducer({ ...initialState, loading: true }, action);
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Network error');
        });
    });

    // ─── fetchMessages thunk ───────────────────────────────────────
    describe('fetchMessages thunk', () => {
        it('maps messages when API succeeds', async () => {
            (chatApi.getChatMessages as jest.Mock).mockResolvedValue({
                success: true,
                data: [
                    {
                        message_id: 'm1',
                        sender_id: 7,
                        type: 'text',
                        message: 'Hello',
                        created_at: '2026-02-25T10:00:00Z',
                    },
                    {
                        _id: 'm2',
                        senderId: 'u2',
                        type: 'image',
                        text: 'http://img',
                    },
                    {
                        id: 'm3',
                        sender: { _id: 'u3' },
                        type: 'document',
                        message: 'http://doc',
                    },
                ],
            });

            const result = await fetchMessages('chat-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/fetchMessages/fulfilled');
            const payload = result.payload as any;
            expect(payload.chatId).toBe('chat-1');
            expect(payload.messages).toHaveLength(3);
            expect(payload.messages[0].text).toBe('Hello');
            expect(payload.messages[1].imageUri).toBe('http://img');
            expect(payload.messages[2].fileUri).toBe('http://doc');
        });

        it('returns empty messages when API response is unsuccessful', async () => {
            (chatApi.getChatMessages as jest.Mock).mockResolvedValue({ success: false });

            const result = await fetchMessages('chat-2')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/fetchMessages/fulfilled');
            expect(result.payload).toEqual({ chatId: 'chat-2', messages: [] });
        });

        it('returns empty messages when API throws', async () => {
            (chatApi.getChatMessages as jest.Mock).mockRejectedValue(new Error('fail'));

            const result = await fetchMessages('chat-3')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/fetchMessages/fulfilled');
            expect(result.payload).toEqual({ chatId: 'chat-3', messages: [] });
        });

        it('sets messagesLoading=true on pending', () => {
            const action = fetchMessages.pending('req', 'chat-1');
            const state = chatReducer(initialState, action);
            expect(state.messagesLoading).toBe(true);
            expect(state.messagesError).toBeNull();
        });

        it('stores messages on fulfilled', () => {
            const messages = [makeMessage({ _id: 'm1', chatId: 'chat-1' })];
            const action = fetchMessages.fulfilled({ chatId: 'chat-1', messages }, 'req', 'chat-1');
            const state = chatReducer({ ...initialState, messagesLoading: true }, action);
            expect(state.messagesLoading).toBe(false);
            expect(state.messagesByChatId['chat-1']).toHaveLength(1);
        });

        it('sets messagesError on rejected', () => {
            const action = fetchMessages.rejected(new Error('fail'), 'req', 'chat-1', 'fail');
            const state = chatReducer({ ...initialState, messagesLoading: true }, action);
            expect(state.messagesLoading).toBe(false);
            expect(state.messagesError).toBe('fail');
        });
    });

    // ─── sendMessage thunk ─────────────────────────────────────────
    describe('sendMessage thunk', () => {
        const sendArg = {
            chatId: 'c1',
            text: 'Hi',
            _id: 'temp-1',
            senderId: 'u1',
            senderName: 'User',
            type: 'text' as const,
        };

        it('adds optimistic message on pending', () => {
            const action = sendMessage.pending('req', sendArg);
            const state = chatReducer(initialState, action);
            expect(state.messagesByChatId['c1']).toHaveLength(1);
            expect(state.messagesByChatId['c1'][0].text).toBe('Hi');
        });

        it('normalizes pdf type to document when calling API', async () => {
            (chatApi.sendMessage as jest.Mock).mockResolvedValue({
                data: {
                    message_id: 'server-pdf-1',
                    sender_id: 'u1',
                    type: 'document',
                    message: 'http://pdf-url',
                    created_at: '2026-02-25T10:10:00Z',
                },
            });

            await sendMessage({
                chatId: 'c1',
                text: 'http://pdf-url',
                _id: 'temp-pdf-1',
                senderId: 'u1',
                senderName: 'User',
                type: 'pdf',
            } as any)(jest.fn(), jest.fn(), undefined);

            // Verify chatApi.sendMessage was called with 'document' instead of 'pdf'
            expect(chatApi.sendMessage).toHaveBeenCalledWith('c1', 'http://pdf-url', 'document');
        });

        it('creates message from API response', async () => {
            (chatApi.sendMessage as jest.Mock).mockResolvedValue({
                data: {
                    message_id: 'server-1',
                    sender_id: 'u1',
                    type: 'image',
                    message: 'http://img',
                    created_at: '2026-02-25T10:10:00Z',
                },
            });

            const result = await sendMessage({
                chatId: 'c1',
                text: '',
                _id: 'temp-1',
                senderId: 'u1',
                senderName: 'User',
                type: 'image',
                imageUri: 'local-img',
            } as any)(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/sendMessage/fulfilled');
            const payload = result.payload as any;
            expect(payload.chatId).toBe('c1');
            expect(payload.message.imageUri).toBe('local-img');
            expect(payload.message.type).toBe('image');
        });

        it('rejects with message when sendMessage fails', async () => {
            (chatApi.sendMessage as jest.Mock).mockRejectedValue({ message: 'send failed' });

            const result = await sendMessage({
                chatId: 'c1',
                text: 'Hi',
                _id: 'temp-1',
                senderId: 'u1',
                senderName: 'User',
                type: 'text',
            })(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('chat/sendMessage/rejected');
            expect(result.payload).toBe('send failed');
        });

        it('replaces optimistic with real message on fulfilled', () => {
            const realMessage = makeMessage({ _id: 'server-1', chatId: 'c1', senderId: 'u1', text: 'Hi' });
            const pendingState = chatReducer(initialState, sendMessage.pending('req', sendArg));
            const state = chatReducer(pendingState, sendMessage.fulfilled({ chatId: 'c1', message: realMessage }, 'req', sendArg));
            expect(state.messagesByChatId['c1'].find(m => m._id === 'server-1')).toBeTruthy();
        });

        it('appends real message if temp not found on fulfilled', () => {
            // No pending state, start fresh
            const realMessage = makeMessage({ _id: 'server-2', chatId: 'c1', senderId: 'u1', text: 'New' });
            const state = chatReducer(initialState, sendMessage.fulfilled({ chatId: 'c1', message: realMessage }, 'req', sendArg));
            expect(state.messagesByChatId['c1']).toHaveLength(1);
        });

        it('removes optimistic message on rejected', () => {
            const pendingState = chatReducer(initialState, sendMessage.pending('req', sendArg));
            const state = chatReducer(pendingState, sendMessage.rejected(new Error('fail'), 'req', sendArg));
            expect(state.messagesByChatId['c1'].find(m => m._id === 'temp-1')).toBeUndefined();
        });
    });

    // ─── addMessage ────────────────────────────────────────────────
    describe('addMessage', () => {
        const baseState: ChatState = {
            ...initialState,
            chatList: [
                makeChat({ id: '1', unreadCount: 0 }),
                makeChat({ id: '2', unreadCount: 1 }),
            ],
        };

        it('updates lastMessage and lastMessageTime on chat item', () => {
            const ts = '2026-02-25T10:00:00Z';
            const state = chatReducer(
                baseState,
                addMessage({
                    chatId: '1',
                    message: {
                        _id: 'm1',
                        text: 'Still available?',
                        createdAt: ts,
                        senderId: 'user2',
                    },
                }),
            );
            const updated = state.chatList.find(c => c.id === '1')!;
            expect(updated.lastMessage).toBe('Still available?');
            expect(updated.lastMessageTime).toBe(ts);
        });

        it('moves the updated chat to position 0 (top)', () => {
            const state = chatReducer(
                baseState,
                addMessage({
                    chatId: '2',
                    message: {
                        _id: 'm2',
                        text: 'New message',
                        createdAt: '2026-02-25T10:05:00Z',
                        senderId: 'user2',
                    },
                }),
            );
            expect(state.chatList[0].id).toBe('2');
        });

        it('adds message to new chatId bucket', () => {
            const state = chatReducer(
                initialState,
                addMessage({ chatId: 'new', message: { _id: 'm1', text: 'Hi', senderId: 'u1' } }),
            );
            expect(state.messagesByChatId['new']).toHaveLength(1);
        });

        it('avoids duplicate messages by _id', () => {
            const s1 = chatReducer(initialState, addMessage({ chatId: 'c1', message: { _id: 'm1', text: 'Hi', senderId: 'u1' } }));
            const s2 = chatReducer(s1, addMessage({ chatId: 'c1', message: { _id: 'm1', text: 'Hi', senderId: 'u1' } }));
            expect(s2.messagesByChatId['c1']).toHaveLength(1);
        });

        it('extracts senderId from nested user object', () => {
            const state = chatReducer(
                initialState,
                addMessage({ chatId: 'c1', message: { _id: 'm1', user: { id: 'uid1' }, text: 'Hi' } }),
            );
            expect(state.messagesByChatId['c1'][0].senderId).toBe('uid1');
        });

        it('extracts senderId from nested sender object', () => {
            const state = chatReducer(
                initialState,
                addMessage({ chatId: 'c1', message: { _id: 'm1', sender: { _id: 'sid1' }, text: 'Hi' } }),
            );
            expect(state.messagesByChatId['c1'][0].senderId).toBe('sid1');
        });

        it('extracts senderId from userId field', () => {
            const state = chatReducer(
                initialState,
                addMessage({ chatId: 'c1', message: { _id: 'm1', userId: 'uid2', text: 'Hi' } }),
            );
            expect(state.messagesByChatId['c1'][0].senderId).toBe('uid2');
        });

        it('sets lastMessage to [Image] for image type', () => {
            const state = chatReducer(
                { ...initialState, chatList: [makeChat({ id: 'c1' })] },
                addMessage({ chatId: 'c1', message: { _id: 'm1', senderId: 'u1', type: 'image', imageUri: 'img.jpg' } }),
            );
            expect(state.chatList[0].lastMessage).toBe('[Image]');
        });

        it('marks a chat as read locally', () => {
            const state = chatReducer(
                { ...initialState, chatList: [makeChat({ id: 'c1', unreadCount: 2, has_unread: true })] },
                markChatAsReadLocal('c1'),
            );
            expect(state.chatList[0].has_unread).toBe(false);
            expect(state.chatList[0].unreadCount).toBe(0);
        });
    });

    // ─── syncGroups ────────────────────────────────────────────────
    describe('syncGroups', () => {
        it('adds messages for new chatId', () => {
            const state = chatReducer(
                initialState,
                syncGroups({
                    groups: [{
                        id: 'g1',
                        messages: [
                            { _id: 'msg1', senderId: 'u1', text: 'Hello', type: 'text', createdAt: new Date().toISOString() },
                        ],
                    }],
                }),
            );
            expect(state.messagesByChatId['g1']).toHaveLength(1);
        });

        it('merges and deduplicates messages for existing chatId', () => {
            const existing: ChatState = {
                ...initialState,
                messagesByChatId: {
                    'g1': [makeMessage({ _id: 'msg1', chatId: 'g1' })],
                },
            };
            const state = chatReducer(
                existing,
                syncGroups({
                    groups: [{
                        id: 'g1',
                        messages: [
                            { _id: 'msg1', senderId: 'u1', text: 'Hello', type: 'text' }, // duplicate
                            { _id: 'msg2', senderId: 'u1', text: 'World', type: 'text' }, // new
                        ],
                    }],
                }),
            );
            expect(state.messagesByChatId['g1']).toHaveLength(2);
        });

        it('extracts senderId from user._id in synced messages', () => {
            const state = chatReducer(
                initialState,
                syncGroups({
                    groups: [{
                        id: 'g2',
                        messages: [{ _id: 'msg3', user: { _id: 'nested-uid' }, text: 'Hi', type: 'text' }],
                    }],
                }),
            );
            expect(state.messagesByChatId['g2'][0].senderId).toBe('nested-uid');
        });
    });

    // ─── Selectors ────────────────────────────────────────────────
    describe('selectors', () => {
        const mockState: any = {
            chat: {
                chatList: [
                    makeChat({ id: '1', productTitle: 'Apple MacBook', donorName: 'John Doe' }),
                    makeChat({ id: '2', productTitle: 'iPhone 15', donorName: 'Jane Smith' })
                ],
                messagesByChatId: { 'room1': [makeMessage()] },
                isConnected: true,
                loading: true,
                refreshing: false,
                error: 'error',
            },
        };

        it('selectMessages returns messages for chatId', () => {
            expect(selectMessages('room1')(mockState)).toHaveLength(1);
        });

        it('selectMessages returns empty array for unknown chatId', () => {
            expect(selectMessages('unknown')(mockState)).toHaveLength(0);
        });

        it('selectIsConnected', () => {
            expect(selectIsConnected(mockState)).toBe(true);
        });

        it('selectAllChats', () => {
            expect(selectAllChats(mockState)).toHaveLength(2);
        });

        it('selectChatsLoading', () => {
            expect(selectChatsLoading(mockState)).toBe(true);
        });

        it('selectChatsRefreshing', () => {
            expect(selectChatsRefreshing(mockState)).toBe(false);
        });

        it('selectChatsError', () => {
            expect(selectChatsError(mockState)).toBe('error');
        });

        it('selectFilteredChats returns matching when query is 1 char', () => {
            expect(selectFilteredChats('i')(mockState)).toHaveLength(1);
            expect(selectFilteredChats('i')(mockState)[0].id).toBe('2');
        });

        it('selectFilteredChats filters chats by product title', () => {
            expect(selectFilteredChats('iphone')(mockState)).toHaveLength(1);
            expect(selectFilteredChats('iphone')(mockState)[0].id).toBe('2');
        });

        it('selectFilteredChats filters chats by donor name', () => {
            expect(selectFilteredChats('jane')(mockState)).toHaveLength(1);
            expect(selectFilteredChats('jane')(mockState)[0].id).toBe('2');
            expect(selectFilteredChats('john')(mockState)).toHaveLength(1);
            expect(selectFilteredChats('john')(mockState)[0].id).toBe('1');
        });

        it('selectFilteredChats returns all chats when query is empty', () => {
            const results = selectFilteredChats('  ')(mockState);
            expect(results).toHaveLength(2);
            expect(results).toEqual(mockState.chat.chatList);
            expect(results).not.toBe(mockState.chat.chatList);
        });
    });
});
