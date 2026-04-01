import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { ChatDocumentPreviewScreen } from '../../src/screens/ChatDocumentPreview/ChatDocumentPreviewScreen';
import * as chatDocumentPreviewHooks from '../../src/screens/ChatDocumentPreview/useChatDocumentPreview';

jest.mock('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
const mockUseChatDocumentPreview = chatDocumentPreviewHooks.useChatDocumentPreview as jest.Mock;
const originalConsoleError = console.error;

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('../../src/store/chat/chatSlice', () => ({
    sendMessage: jest.fn((data) => ({ type: 'chat/sendMessage', payload: data, unwrap: () => Promise.resolve() })),
}));

jest.mock('../../src/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('../../src/services/api/chatApi', () => ({
    chatApi: {
        uploadChatImage: jest.fn(),
    },
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                brandGreen: '#28CD41',
            },
        },
    }),
}));

jest.mock('../../src/theme/scale', () => ({
    scale: (v: number) => v,
    verticalScale: (v: number) => v,
    moderateScale: (v: number) => v,
    normalize: (v: number) => v,
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
            ReactLib.createElement(name, { ...props, ref }, children)
        );
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        SafeAreaView: createPrimitive('SafeAreaView'),
        StatusBar: createPrimitive('StatusBar'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Platform: { OS: 'ios', select: (obj: any) => obj.ios },
        Alert: { alert: jest.fn() },
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => s,
            hairlineWidth: 1,
        },
    };
});

describe('ChatDocumentPreviewScreen', () => {
    const mockHandleBack = jest.fn();
    const mockHandleSend = jest.fn();

    const mockData = {
        documentName: 'test-doc.pdf',
        documentSize: '1.2 MB',
        documentType: 'application/pdf',
        seekerName: 'John Doe',
        handleBack: mockHandleBack,
        handleSend: mockHandleSend,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
        mockUseChatDocumentPreview.mockReturnValue(mockData);
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('renders correctly', () => {
        const { getByTestId, getByText } = render(<ChatDocumentPreviewScreen />);

        expect(getByTestId('preview-seeker-name')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('test-doc.pdf')).toBeTruthy();
        expect(getByText('application/pdf • 1.2 MB')).toBeTruthy();
    });

    it('calls handleBack when back button is pressed', () => {
        const { getByTestId } = render(<ChatDocumentPreviewScreen />);
        const backButton = getByTestId('preview-back-button');

        fireEvent.press(backButton);
        expect(mockHandleBack).toHaveBeenCalled();
    });

    it('calls handleSend when send button is pressed', () => {
        const { getByTestId } = render(<ChatDocumentPreviewScreen />);
        const sendButton = getByTestId('preview-send-button');

        fireEvent.press(sendButton);
        expect(mockHandleSend).toHaveBeenCalled();
    });

    it('renders loading state correctly when isSending is true', () => {
        mockUseChatDocumentPreview.mockReturnValue({
            ...mockData,
            isSending: true
        });
        const { getByTestId, queryByTestId } = render(<ChatDocumentPreviewScreen />);
        const sendButton = getByTestId('preview-send-button');

        expect(sendButton.props.disabled).toBe(true);
        // ActivityIndicator should be present (though it might not have testID, it's a child)
    });

    // ─── useChatDocumentPreview Hook ─────────────────────────────
    describe('useChatDocumentPreview hook', () => {
        const mockDispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
        const mockNavigate = jest.fn();
        const mockGoBack = jest.fn();

        const wrapper = ({ children }: any) => {
            const { Provider } = require('react-redux');
            const { configureStore } = require('@reduxjs/toolkit');
            const store = configureStore({
                reducer: { auth: () => ({ user: { id: 'me' } }) },
            });
            return <Provider store={store}>{children}</Provider>;
        };

        beforeEach(() => {
            const { useNavigation, useRoute } = require('@react-navigation/native');
            const { useAppDispatch } = require('../../src/store');
            (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack, navigate: mockNavigate });
            (useRoute as jest.Mock).mockReturnValue({
                params: {
                    documentUri: 'file://doc.pdf',
                    documentName: 'doc.pdf',
                    chatId: 'c1',
                    seekerName: 'S1',
                    documentType: 'application/pdf',
                    documentSize: '1.2 MB'
                }
            });
            (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        });

        it('handles the send process correctly', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { chatApi } = require('../../src/services/api/chatApi');
            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({
                data: { file_url: 'https://remote.pdf' }
            });

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(chatApi.uploadChatImage).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalled();
            expect(mockGoBack).toHaveBeenCalled();
        });

        it('prevents multiple sends if already sending', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { chatApi } = require('../../src/services/api/chatApi');
            (chatApi.uploadChatImage as jest.Mock).mockReturnValue(new Promise(() => { })); // Never resolves

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            act(() => {
                result.current.handleSend();
            });

            expect(result.current.isSending).toBe(true);

            // Try sending again
            await act(async () => {
                await result.current.handleSend();
            });

            expect(chatApi.uploadChatImage).toHaveBeenCalledTimes(1);
        });

        it('handles handleBack correctly', () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            act(() => {
                result.current.handleBack();
            });

            expect(mockGoBack).toHaveBeenCalled();
        });

        it('handles upload failure (no remoteUrl)', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { chatApi } = require('../../src/services/api/chatApi');
            const { Alert } = require('react-native');

            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({ data: {} });

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(Alert.alert).toHaveBeenCalled();
            expect(result.current.isSending).toBe(false);
        });

        it('handles general error in handleSend', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { chatApi } = require('../../src/services/api/chatApi');
            const { Alert } = require('react-native');

            (chatApi.uploadChatImage as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(Alert.alert).toHaveBeenCalled();
            expect(result.current.isSending).toBe(false);
        });

        it('uses fallbacks for various fields', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { useRoute } = require('@react-navigation/native');
            const { useAppSelector } = require('../../src/store');
            const { chatApi } = require('../../src/services/api/chatApi');

            (useAppSelector as jest.Mock).mockReturnValue(null); // currentUser = null
            (useRoute as jest.Mock).mockReturnValue({
                params: {
                    documentUri: 'file://unknown-doc',
                    documentName: null,
                    chatId: 'c1',
                    seekerName: null,
                    documentType: 'application/pdf',
                    documentSize: '1.2 MB'
                }
            });
            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({
                data: { file_url: 'https://remote.pdf' }
            });

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            expect(result.current.seekerName).toBe('common.userFallback');

            await act(async () => {
                await result.current.handleSend();
            });

            // name fallback: documentUri.split('/').pop() -> 'unknown-doc'
            expect(chatApi.uploadChatImage).toHaveBeenCalledWith('file://unknown-doc', 'unknown-doc', 'application/pdf');
        });

        it('uses currentUserProfile fallback', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { useAppSelector } = require('../../src/store');
            const { chatApi } = require('../../src/services/api/chatApi');

            (useAppSelector as jest.Mock).mockImplementation((selector: any) => {
                const state = {
                    auth: {
                        user: null,
                        userProfile: { id: 'p1', full_name: 'Profile Name' }
                    }
                };
                return selector(state);
            });

            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({
                data: { file_url: 'https://remote.pdf' }
            });

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            const { sendMessage } = require('../../src/store/chat/chatSlice');
            expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({
                senderId: 'p1',
                senderName: 'Profile Name'
            }));
        });

        it('uses default fallback for document name and mimeType', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { useRoute } = require('@react-navigation/native');
            const { chatApi } = require('../../src/services/api/chatApi');
            const { useAppSelector } = require('../../src/store');

            (useAppSelector as jest.Mock).mockReturnValue({ id: 'me', full_name: 'Me' }); // Mock a user
            (useRoute as jest.Mock).mockReturnValue({
                params: {
                    documentUri: '', // Empty URI to test name fallback to 'document.pdf'
                    documentName: null,
                    chatId: 'c1',
                    mimeType: null, // Test mimeType fallback
                }
            });
            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({
                data: { file_url: 'https://remote.pdf' }
            });

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            // name fallback: 'document.pdf' if documentUri is empty or doesn't yield a name
            expect(chatApi.uploadChatImage).toHaveBeenCalledWith('', 'document.pdf', 'application/pdf');
            const { sendMessage } = require('../../src/store/chat/chatSlice');
            expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({
                fileName: 'document.pdf',
                mimeType: 'application/pdf',
            }));
        });

        it('uses fallback error message when translation is missing', async () => {
            const { useChatDocumentPreview } = jest.requireActual('../../src/screens/ChatDocumentPreview/useChatDocumentPreview');
            const { chatApi } = require('../../src/services/api/chatApi');
            const { Alert } = require('react-native');
            const i18n = require('react-i18next');

            // Mock t to return null for the error key
            jest.spyOn(i18n, 'useTranslation').mockReturnValue({
                t: (key: string) => (key === 'chat.error.sendFailed' ? null : key),
            });

            (chatApi.uploadChatImage as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            const { result } = renderHook(() => useChatDocumentPreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(Alert.alert).toHaveBeenCalledWith('common.error', 'Failed to send document');
        });
    });
});
