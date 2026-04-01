import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Global Mocks
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
    initReactI18next: { type: '3rdParty', init: () => { } },
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
    hide: jest.fn(),
}));
const Toast = require('react-native-toast-message');

jest.mock('react-native', () => {
    const React = require('react');
    const mock = (n: string) => {
        const C = React.forwardRef(({ children, testID, ...p }: any, ref: any) => React.createElement(n, { ...p, testID, ref }, children));
        C.displayName = n;
        return C;
    };
    return {
        View: mock('View'), Text: mock('Text'), TouchableOpacity: mock('TouchableOpacity'),
        TextInput: mock('TextInput'), ScrollView: mock('ScrollView'),
        FlatList: ({ data, renderItem, ListHeaderComponent, keyExtractor, ListEmptyComponent, testID }: any) => {
            if (keyExtractor && data?.[0]) keyExtractor(data[0], 0);
            const h = ListHeaderComponent ? (typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent) : null;
            const e = ListEmptyComponent ? (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent) : null;
            const items = (data || []).map((item: any, index: number) => {
                const element = renderItem({ item, index });
                return React.cloneElement(element, { key: item._id || index });
            });
            return React.createElement('View', { testID }, h, items.length > 0 ? items : e);
        },
        Image: mock('Image'), ActivityIndicator: mock('ActivityIndicator'), StatusBar: mock('StatusBar'),
        KeyboardAvoidingView: mock('KeyboardAvoidingView'), Keyboard: { dismiss: jest.fn() },
        Modal: mock('Modal'), TouchableWithoutFeedback: mock('TouchableWithoutFeedback'),
        Platform: { OS: 'ios', select: jest.fn(o => o.ios) },
        Dimensions: { get: () => ({ width: 375, height: 812 }) },
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => Array.isArray(s) ? Object.assign({}, ...s) : s, hairlineWidth: 1 },
        Alert: { alert: jest.fn((t, m, b) => { if (b) b.forEach((btn: any) => { if (btn.onPress) btn.onPress(); }); }) },
        Linking: { openURL: jest.fn(), canOpenURL: jest.fn().mockResolvedValue(true) },
    };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('react-native-pdf', () => 'Pdf');
jest.mock('react-native-image-picker', () => ({ launchCamera: jest.fn(), launchImageLibrary: jest.fn() }));

let mockStore: any;

jest.mock('../../src/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (fn: any) => fn(mockStore?.getState?.() || { auth: { user: { id: 'me', full_name: 'Me' } }, chat: { isConnected: true, messagesLoading: false, typingUsers: {} } }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) });

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack, isFocused: () => true }),
    useRoute: () => ({ params: {} }),
}));

jest.mock('../../src/services/socketService', () => ({
    on: jest.fn(), emit: jest.fn(), removeListener: jest.fn(),
    joinChat: jest.fn(), typing: jest.fn(), leaveChat: jest.fn(),
    markAsRead: jest.fn(), sendMessage: jest.fn()
}));
const socketService = require('../../src/services/socketService');

// Thunks mocking
jest.mock('../../src/store/chat/chatSlice', () => {
    const mockAction = (type: string) => {
        const fn: any = jest.fn((payload) => ({ type, payload }));
        fn.type = type;
        fn.toString = () => type;
        return fn;
    };
    const mockThunk = (type: string) => {
        const fn: any = jest.fn((payload) => ({ type, payload }));
        fn.pending = { type: `${type}/pending` };
        fn.fulfilled = { type: `${type}/fulfilled` };
        fn.rejected = { type: `${type}/rejected` };
        fn.typePrefix = type;
        return fn;
    };
    return {
        sendMessage: mockThunk('chat/sendMessage'),
        fetchMessages: mockThunk('chat/fetchMessages'),
        selectMessages: () => () => [],
        setActiveChat: mockAction('chat/setActiveChat'),
        clearMessagesError: mockAction('chat/clearMessagesError'),
        setChatList: mockAction('chat/setChatList'),
        addMessage: mockAction('chat/addMessage'),
        setConnectionStatus: mockAction('chat/setConnectionStatus'),
        setTypingStatus: mockAction('chat/setTypingStatus'),
        resetChatState: mockAction('chat/resetChatState'),
        syncGroups: mockAction('chat/syncGroups'),
        clearChatError: mockAction('chat/clearChatError'),
    };
});

const mockTakePhoto = jest.fn(cb => { cb({ uri: 'cam' }); return Promise.resolve(); });
const mockSelectGallery = jest.fn(cb => { cb({ uri: 'gal' }); return Promise.resolve(); });
jest.mock('../../src/hooks/useImagePicker', () => ({ useImagePicker: () => ({ takePhoto: mockTakePhoto, selectFromGallery: mockSelectGallery }) }));
const mockPickDoc = jest.fn(cb => { cb({ uri: 'doc', type: 'application/pdf' }); return Promise.resolve(); });
jest.mock('../../src/hooks/useDocumentPicker', () => ({
    useDocumentPicker: () => ({ pickDocument: mockPickDoc }),
    PICK_TYPES: { pdf: 'pdf', doc: 'doc', docx: 'docx' }
}));

import { ChatScreen } from '../../src/screens/Chat/ChatScreen';
const { useChatDetail: realHook } = jest.requireActual('../../src/screens/Chat/useChatDetail');
jest.mock('../../src/screens/Chat/useChatDetail', () => ({ useChatDetail: jest.fn() }));
const { useChatDetail } = require('../../src/screens/Chat/useChatDetail');

describe('ChatScreen', () => {
    const base = {
        messages: [{ _id: '1', text: 'hi', senderId: 'other' }], loading: false, inputText: '', isTyping: false, isReportModalVisible: false,
        isAttachmentMenuVisible: false, isReporting: false, reportReason: '', handleInputTextChange: jest.fn(), handleSend: jest.fn(),
        handleBack: mockGoBack, handleReport: jest.fn(), handleCloseReport: jest.fn(),
        handleReportReasonChange: jest.fn(), handleReportSubmit: jest.fn(), toggleAttachmentMenu: jest.fn(),
        handleAttachmentSelect: jest.fn(), handleProductPress: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (useChatDetail as jest.Mock).mockReturnValue(base);
        mockStore = configureStore({
            reducer: {
                auth: () => ({ user: { id: 'me', full_name: 'Me' } }),
                chat: () => ({ isConnected: true, messagesLoading: false, typingUsers: {} }),
            },
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const wrapper = ({ children }: any) => (
        <Provider store={mockStore}>
            {children}
        </Provider>
    );

    it('covers screen rendering and interactions', () => {
        const { getByTestId, rerender } = render(
            <Provider store={mockStore}>
                <ChatScreen route={{ params: { seekerName: 'S', seekerAvatar: 'A', productTitle: 'P', productImage: 'I' } } as any} navigation={{} as any} />
            </Provider>
        );

        expect(getByTestId('chat-back-button')).toBeTruthy();
        fireEvent.press(getByTestId('chat-back-button'));
        expect(mockGoBack).toHaveBeenCalled();

        // Header options & report dropdown
        fireEvent.press(getByTestId('chat-options-button'));
        fireEvent.press(getByTestId('report-user-button'));

        // List subcomponents (typing false / true variants)
        (useChatDetail as jest.Mock).mockReturnValue({ ...base, isTyping: true });
        rerender(
            <Provider store={mockStore}>
                <ChatScreen route={{ params: { seekerName: 'S', seekerAvatar: 'A' } } as any} navigation={{} as any} />
            </Provider>
        );
        (useChatDetail as jest.Mock).mockReturnValue({ ...base, isTyping: false });
        rerender(
            <Provider store={mockStore}>
                <ChatScreen route={{ params: { seekerName: 'S', seekerAvatar: 'A' } } as any} navigation={{} as any} />
            </Provider>
        );

        // Loading state variant
        (useChatDetail as jest.Mock).mockReturnValue({ ...base, loading: true, messages: [] });
        rerender(
            <Provider store={mockStore}>
                <ChatScreen route={{ params: {} } as any} navigation={{} as any} />
            </Provider>
        );
        expect(getByTestId('chat-loading')).toBeTruthy();

        // Product image placeholder branch
        (useChatDetail as jest.Mock).mockReturnValue({ ...base, loading: false });
        rerender(
            <Provider store={mockStore}>
                <ChatScreen route={{ params: { productImage: null } } as any} navigation={{} as any} />
            </Provider>
        );
        expect(getByTestId('product-image-placeholder')).toBeTruthy();
    });

    it('covers useChatDetail hook logic exhaustively', async () => {
        const { result } = renderHook(() => realHook({ productId: 'p1', seekerId: 's1' }), { wrapper });

        // Wait for useEffect
        act(() => { jest.advanceTimersByTime(0); });
        expect(socketService.joinChat).toHaveBeenCalledWith('p1');

        // Typing
        act(() => { result.current.handleTyping(); });
        expect(socketService.typing).toHaveBeenCalled();

        // Sending messages
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.resolve({}) });
        act(() => { result.current.handleInputTextChange('hello'); });
        await act(async () => { await result.current.handleSend(); });

        // Sender fallback without user
        mockStore = configureStore({ reducer: { auth: () => ({ user: null }), chat: () => ({}) } });
        const { result: r2 } = renderHook(() => realHook({ productId: 'p1' }), { wrapper: ({ children }: any) => <Provider store={mockStore}>{children}</Provider> });
        act(() => { r2.current.handleInputTextChange('hello'); });
        await act(async () => { await r2.current.handleSend(); });

        // Attachment selection paths with mime variants
        const docs = [
            { uri: 'i', type: 'image/png' },
            { uri: 'p', type: 'application/pdf' },
            { uri: 'd', type: 'application/msword' },
            { uri: 's', type: 'application/msword', size: 2048, name: 'file.doc' }
        ];
        for (const doc of docs) {
            mockPickDoc.mockImplementationOnce(cb => { cb(doc); return Promise.resolve(); });
            act(() => { result.current.handleAttachmentSelect('document'); });
            act(() => { jest.advanceTimersByTime(400); });
        }

        act(() => { result.current.handleAttachmentSelect('camera'); });
        act(() => { jest.advanceTimersByTime(400); });

        // Product press variants
        act(() => { result.current.handleProductPress(); });
        renderHook(() => realHook({ productId: undefined }), { wrapper }).result.current.handleProductPress();

        // Reporting variants
        act(() => { result.current.handleReport(); });
        act(() => { result.current.handleReportReasonChange('   '); });
        await act(async () => { await result.current.handleReportSubmit(); });

        act(() => { result.current.handleReportReasonChange('Spam'); });
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.resolve({ message: 'OK' }) });
        await act(async () => { await result.current.handleReportSubmit(); });

        act(() => { result.current.handleReportReasonChange('Spam2'); });
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.resolve({}) }); // fallback message branch
        await act(async () => { await result.current.handleReportSubmit(); });

        act(() => { result.current.handleReportReasonChange('Spam Fail'); });
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject('Fail') });
        await act(async () => { await result.current.handleReportSubmit(); });

        act(() => { result.current.handleReportReasonChange('Spam Fail 2'); });
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject() });
        await act(async () => { await result.current.handleReportSubmit(); });

        // Sender failure branch
        mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Send Fail')) });
        act(() => { result.current.handleInputTextChange('hello fail'); });
        await act(async () => { await result.current.handleSend(); });

        // Sender Name fallback without full_name
        mockStore = configureStore({ reducer: { auth: () => ({ user: { id: 'u2' } }), chat: () => ({}) } });
        const { result: r3 } = renderHook(() => realHook({ productId: 'p1' }), { wrapper: ({ children }: any) => <Provider store={mockStore}>{children}</Provider> });
        act(() => { r3.current.handleInputTextChange('hello'); });
        await act(async () => { await r3.current.handleSend(); });

        // Seeker missing variant
        renderHook(() => realHook({ seekerId: undefined }), { wrapper }).result.current.handleReportSubmit();

        // Modal toggles & empty text send
        act(() => { result.current.toggleAttachmentMenu(); });
        act(() => { result.current.handleCloseReport(); });
        act(() => { result.current.handleBack(); });
        act(() => { result.current.handleInputTextChange(''); });
        await act(async () => { await result.current.handleSend(); });
    });
});
