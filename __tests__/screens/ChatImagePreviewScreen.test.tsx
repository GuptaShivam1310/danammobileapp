import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { ChatImagePreviewScreen } from '../../src/screens/ChatImagePreview/ChatImagePreviewScreen';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn().mockReturnValue({
    unwrap: () => Promise.resolve({ success: true }),
});

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(() => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    })),
    useRoute: jest.fn(() => ({
        params: {
            imageUri: 'test-uri',
            chatId: 'test-chat-id',
            seekerName: 'Test Seeker',
        },
    })),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));


jest.mock('../../src/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn((fn: any) => fn({
        auth: {
            user: { id: 'me', full_name: 'Me' },
            userProfile: { id: 'p1', full_name: 'Profile Me' }
        }
    })),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(() => ({
        t: (k: string) => k,
    })),
}));


jest.mock('../../src/store/chat/chatSlice', () => ({
    sendMessage: jest.fn((params) => params),
}));


jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                brandGreen: '#28CD41',
                text: '#000000',
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

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

// Mock Modal and other native components if needed
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
        Image: createPrimitive('Image'),
        SafeAreaView: createPrimitive('SafeAreaView'),
        StatusBar: createPrimitive('StatusBar'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Alert: { alert: jest.fn() },
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => s,
            hairlineWidth: 1,
        },
    };
});

jest.mock('../../src/services/api/chatApi', () => ({
    chatApi: {
        uploadChatImage: jest.fn(() => Promise.resolve({ success: true, data: { file_url: 'remote-url' } })),
    },
}));

import { chatApi } from '../../src/services/api/chatApi';

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('ChatImagePreviewScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (chatApi.uploadChatImage as jest.Mock).mockImplementation(() =>
            Promise.resolve({ success: true, data: { file_url: 'remote-url' } })
        );
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    it('renders correctly with initial params', () => {
        const { getByTestId, getByText } = render(<ChatImagePreviewScreen />);

        expect(getByTestId('preview-seeker-name')).toBeTruthy();
        expect(getByText('Test Seeker')).toBeTruthy();
        expect(getByTestId('preview-image-main')).toBeTruthy();
        // Check if image source uri matches
        const image = getByTestId('preview-image-main');
        expect(image.props.source.uri).toBe('test-uri');
    });

    it('calls goBack when back button is pressed', () => {
        const { getByTestId } = render(<ChatImagePreviewScreen />);
        const backButton = getByTestId('preview-back-button');

        fireEvent.press(backButton);
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('dispatches sendMessage and calls goBack when send button is pressed', async () => {
        const { getByTestId } = render(<ChatImagePreviewScreen />);
        const sendButton = getByTestId('preview-send-button');

        await fireEvent.press(sendButton);

        expect(chatApi.uploadChatImage).toHaveBeenCalledWith('test-uri', expect.any(String), undefined);
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockGoBack).toHaveBeenCalled();
    });

    // ─── useChatImagePreview Hook ────────────────────────────────
    describe('useChatImagePreview hook', () => {
        const { useChatImagePreview } = jest.requireActual('../../src/screens/ChatImagePreview/useChatImagePreview');

        const wrapper = ({ children }: any) => {
            const { Provider } = require('react-redux');
            const { configureStore } = require('@reduxjs/toolkit');
            const store = configureStore({
                reducer: {
                    auth: () => ({
                        user: { id: 'me', full_name: 'Me' },
                        userProfile: { id: 'p1', full_name: 'Profile Me' }
                    }),
                },
            });
            return <Provider store={store}>{children}</Provider>;
        };


        it('initializes with isSending false', () => {
            const { result } = renderHook(() => useChatImagePreview(), { wrapper });
            expect(result.current.isSending).toBe(false);
        });

        it('sets isSending true during upload', async () => {
            (chatApi.uploadChatImage as jest.Mock).mockReturnValue(new Promise(() => { })); // Never resolves

            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            act(() => {
                result.current.handleSend();
            });

            expect(result.current.isSending).toBe(true);
        });

        it('calls upload and dispatch on handleSend', async () => {
            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(chatApi.uploadChatImage).toHaveBeenCalled();
            expect(mockGoBack).toHaveBeenCalled();
        });

        it('handles upload failure with no remote URL', async () => {
            (chatApi.uploadChatImage as jest.Mock).mockResolvedValueOnce({ data: { file_url: null } });
            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(result.current.isSending).toBe(false);
        });

        it('handles general upload error', async () => {
            (chatApi.uploadChatImage as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(result.current.isSending).toBe(false);
        });

        it('uses fallbacks for sender and seeker info', () => {
            const { useAppSelector } = require('../../src/store');
            const { useRoute } = require('@react-navigation/native');

            (useAppSelector as jest.Mock).mockImplementation((fn: any) => fn({
                auth: { user: null, userProfile: null }
            }));

            (useRoute as jest.Mock).mockReturnValue({
                params: {
                    imageUri: 'test.jpg',
                    chatId: 'c1',
                    seekerName: null // Trigger fallback
                }
            });

            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            expect(result.current.seekerName).toBe('common.userFallback');
        });

        it('handles specific branches: fileName, partial user, and translation fallback', async () => {
            const { useAppSelector, useAppDispatch } = require('../../src/store');
            const { useRoute } = require('@react-navigation/native');
            const { useTranslation } = require('react-i18next');

            // 1. name = fileName
            (useRoute as jest.Mock).mockReturnValue({
                params: { imageUri: 'image.jpg', chatId: 'c1', fileName: 'custom.jpg' }
            });

            // 2. user is null, userProfile exists
            (useAppSelector as jest.Mock).mockImplementation((fn: any) => fn({
                auth: { user: null, userProfile: { id: 'p1', full_name: 'P1' } }
            }));

            // 3. chat.error.sendFailed is missing
            (useTranslation as jest.Mock).mockReturnValue({
                t: (k: string) => k === 'chat.error.sendFailed' ? null : k
            });

            (chatApi.uploadChatImage as jest.Mock).mockRejectedValueOnce(new Error('fail'));

            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            expect(chatApi.uploadChatImage).toHaveBeenCalledWith('image.jpg', 'custom.jpg', undefined);
        });

        it('does not send if already sending', async () => {

            (chatApi.uploadChatImage as jest.Mock).mockReturnValue(new Promise(() => { })); // Stuck in pending
            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            act(() => {
                result.current.handleSend();
            });

            expect(result.current.isSending).toBe(true);

            // Second call
            await act(async () => {
                await result.current.handleSend();
            });

            expect(chatApi.uploadChatImage).toHaveBeenCalledTimes(1);
        });

        it('handles all fallbacks (unknown id, anonymous name, image.jpg name)', async () => {
            const { useAppSelector } = require('../../src/store');
            const { useRoute } = require('@react-navigation/native');

            // 1. currentUser and profile are totally null
            (useAppSelector as jest.Mock).mockImplementation((fn: any) => fn({
                auth: { user: null, userProfile: null }
            }));

            // 2. imageUri is empty string (triggers 'image.jpg')
            (useRoute as jest.Mock).mockReturnValue({
                params: { imageUri: '', chatId: 'c1' }
            });

            const { result } = renderHook(() => useChatImagePreview(), { wrapper });

            await act(async () => {
                await result.current.handleSend();
            });

            // We expect it to try uploading with 'image.jpg'
            expect(chatApi.uploadChatImage).toHaveBeenCalledWith('', 'image.jpg', undefined);
        });
    });
});


