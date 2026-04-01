import React from 'react';
import { render, fireEvent, renderHook, act, waitFor } from '@testing-library/react-native';

// Global Mocks
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const localEn = require('../../src/localization/en.json');
            const keys = key.split('.');
            let val = localEn;
            for (const k of keys) {
                if (val && typeof val === 'object' && k in val) {
                    val = val[k];
                } else {
                    return key;
                }
            }
            return typeof val === 'string' ? val : key;
        },
    }),
    initReactI18next: { type: '3', init: () => { } }
}));

jest.mock('../../src/localization/i18n', () => ({
    t: (k: string) => k,
    use: () => ({ init: () => { } })
}));

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
        FlatList: ({ data, renderItem, ListHeaderComponent, ListEmptyComponent, testID, refreshControl }: any) => {
            const children = (data && data.length > 0)
                ? data.map((item: any, index: number) =>
                    React.createElement(React.Fragment, { key: item?.id ?? index }, renderItem({ item, index }))
                )
                : (ListEmptyComponent ? (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent) : null);
            const header = ListHeaderComponent ? (typeof ListHeaderComponent === 'function' ? ListHeaderComponent() : ListHeaderComponent) : null;
            return React.createElement('View', { testID }, header, refreshControl, children);
        },
        Image: mock('Image'), ActivityIndicator: mock('ActivityIndicator'), StatusBar: mock('StatusBar'),
        RefreshControl: mock('RefreshControl'),
        Alert: { alert: jest.fn((t, m, b) => b?.[0]?.onPress?.()) },
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => Array.isArray(s) ? Object.assign({}, ...s) : s },
        Platform: { OS: 'ios', select: (o: any) => o.ios || o.android },
        Dimensions: { get: () => ({ width: 375, height: 812 }) },
        PixelRatio: { roundToNearestPixel: (v: number) => v },
        NativeModules: { RNShare: {} }, TurboModuleRegistry: { get: () => ({}) },
    };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('lodash.debounce', () => (fn: any) => {
    const d = (arg: any) => fn(arg);
    d.cancel = jest.fn();
    return d;
});

const mockNavigate = jest.fn();
const mockDispatchNav = jest.fn();
const mockDispatch = jest.fn();
const mockState = {
    auth: { user: { role: 'Seeker' } },
    chat: {
        chats: [
            { id: '1', productTitle: 'P1', productImage: 'img1', lastMessage: 'M1', lastMessageTime: '2025-04-01T10:00:00Z', unreadCount: 1, seekerCount: 5, has_unread: true, donorName: 'Donor 1' },
            { id: '2', productTitle: 'P2', productImage: 'img2', lastMessage: 'M2', lastMessageTime: '2025-04-01T11:00:00Z', unreadCount: 0, seekerCount: 2, has_unread: false, donorName: 'Donor 2' }
        ],
        loading: false, refreshing: false, error: null,
    }
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (fn: any) => fn(mockState),
    Provider: ({ children }: any) => children
}));

jest.mock('../../src/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (fn: any) => fn(mockState)
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, dispatch: mockDispatchNav }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: (cb: any) => cb(),
    StackActions: { push: jest.fn((...args: any[]) => ({ type: 'PUSH', payload: args })) },
}));

jest.mock('../../src/theme', () => {
    const { lightColors } = require('../../src/constants/colors');
    return {
        useTheme: () => ({ theme: { colors: lightColors } }),
        ThemeProvider: ({ children }: any) => children,
    };
});
jest.mock('../../src/theme/scale', () => ({ moderateScale: (v: number) => v, scale: (v: number) => v, verticalScale: (v: number) => v, normalize: (v: number) => v }));
jest.mock('../../src/theme/fonts', () => ({ fonts: { bold: 'B', semiBold: 'SB', regular: 'R' } }));
jest.mock('../../src/constants/colors', () => {
    const actual = jest.requireActual('../../src/constants/colors');
    return actual;
});

jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));

jest.mock('../../src/services/socketService', () => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn(),
    createNewGroup: jest.fn(),
}));
import socketService from '../../src/services/socketService';

jest.mock('../../src/store/chat/chatSlice', () => ({
    fetchChats: jest.fn(),
    selectAllChats: (s: any) => s.chat.chats,
    selectChatsError: (s: any) => s.chat.error,
    selectChatsLoading: (s: any) => s.chat.loading,
    selectChatsRefreshing: (s: any) => s.chat.refreshing,
    selectFilteredChats: (q: string) => (s: any) => q ? s.chat.chats.filter((c: any) => c.productTitle.includes(q)) : s.chat.chats,
    clearChatError: jest.fn(),
    markChatAsReadLocal: jest.fn(),
}));

import { ChatListScreen } from '../../src/screens/ChatList/ChatListScreen';
import { AppImages } from '../../src/assets/images';
const { useChat: realHook } = jest.requireActual('../../src/screens/ChatList/useChat');
jest.mock('../../src/screens/ChatList/useChat', () => ({ useChat: jest.fn() }));
const { useChat } = require('../../src/screens/ChatList/useChat');

describe('ChatListScreen Coverage', () => {
    const defaultVals = {
        chats: mockState.chat.chats, loading: false, refreshing: false, error: null,
        searchQuery: '', handleSearchChange: jest.fn(), handleRefresh: jest.fn(),
        handleRetry: jest.fn(), handleChatPress: jest.fn(), isSeekerUser: true,
    };

    beforeEach(() => { jest.clearAllMocks(); (useChat as jest.Mock).mockReturnValue(defaultVals); });

    const countDividerNodes = (node: any, borderColor: string): number => {
        if (!node) return 0;
        if (Array.isArray(node)) {
            return node.reduce((acc, child) => acc + countDividerNodes(child, borderColor), 0);
        }
        const hasDividerStyle =
            node.props?.style &&
            node.props.style.backgroundColor === borderColor &&
            node.props.style.marginLeft === 16;
        return (hasDividerStyle ? 1 : 0) + countDividerNodes(node.children, borderColor);
    };

    it('covers all UI states and interaction branches', () => {
        const { getByText, getByTestId, rerender, queryAllByTestId, toJSON } = render(<ChatListScreen />);
        const { lightColors } = require('../../src/constants/colors');

        // List with data
        expect(getByTestId('chat-item-1')).toBeTruthy();
        expect(queryAllByTestId('chat-item-unread-dot')).toHaveLength(1);
        expect(getByTestId('chat-item-image-1').props.source).toBe(AppImages.userIcon);
        expect(queryAllByTestId('chat-item-donor-name').length).toBeGreaterThan(0);
        expect(queryAllByTestId('chat-item-product-title').length).toBeGreaterThan(0);
        fireEvent.press(getByTestId('chat-item-1'));
        expect(defaultVals.handleChatPress).toHaveBeenCalled();
        expect(countDividerNodes(toJSON(), lightColors.border)).toBe(1);

        // Search input change
        fireEvent.changeText(getByTestId('chat-search-input'), 'hello');
        expect(defaultVals.handleSearchChange).toHaveBeenCalledWith('hello');

        // Loading
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, loading: true });
        rerender(<ChatListScreen />);
        expect(getByTestId('chat-loading')).toBeTruthy();

        // Error
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, loading: false, error: 'ERR' });
        rerender(<ChatListScreen />);
        expect(getByText('ERR')).toBeTruthy();
        fireEvent.press(getByTestId('chat-retry-button'));
        expect(defaultVals.handleRetry).toHaveBeenCalled();

        // Empty State - Seeker
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, chats: [], error: null, isSeekerUser: true });
        rerender(<ChatListScreen />);
        expect(getByTestId('chat-empty-state')).toBeTruthy();
        expect(getByText(/Start browsing items/i)).toBeTruthy();

        // Empty State - Donor
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, chats: [], error: null, isSeekerUser: false });
        rerender(<ChatListScreen />);
        expect(getByText(/Your chats will appear here/i)).toBeTruthy();

        // Refresh control
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, refreshing: true });
        rerender(<ChatListScreen />);
        act(() => {
            getByTestId('chat-refresh-control').props.onRefresh();
        });
        expect(defaultVals.handleRefresh).toHaveBeenCalled();

        // Single item => no divider
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, chats: [mockState.chat.chats[0]] });
        rerender(<ChatListScreen />);
        expect(countDividerNodes(toJSON(), lightColors.border)).toBe(0);

        // Loading takes precedence over error
        (useChat as jest.Mock).mockReturnValue({ ...defaultVals, loading: true, error: 'ERR' });
        rerender(<ChatListScreen />);
        expect(getByTestId('chat-loading')).toBeTruthy();
    });

    it('renders non-seeker layout with seeker count label', () => {
        (useChat as jest.Mock).mockReturnValue({
            ...defaultVals,
            isSeekerUser: false,
            chats: [
                {
                    id: 'x1',
                    productTitle: 'Product X',
                    productImage: 'img-x',
                    lastMessage: 'M',
                    lastMessageTime: '2025-04-01T10:00:00Z',
                    unreadCount: 0,
                    seekerCount: 3,
                    has_unread: false,
                },
            ],
        });

        const { getByTestId, queryByTestId, getByText } = render(<ChatListScreen />);
        expect(getByTestId('chat-item-x1')).toBeTruthy();
        expect(getByTestId('chat-item-image-x1').props.source).toEqual({ uri: 'img-x' });
        expect(getByText('Product X')).toBeTruthy();
        expect(getByText(/3/)).toBeTruthy();
        expect(queryByTestId('chat-item-unread-dot')).toBeNull();
    });

    it('renders seeker layout with donor image and unread dot', () => {
        (useChat as jest.Mock).mockReturnValue({
            ...defaultVals,
            isSeekerUser: true,
            chats: [
                {
                    id: 's1',
                    productTitle: 'Prod',
                    productImage: 'img',
                    lastMessage: 'M',
                    lastMessageTime: '2025-04-01T10:00:00Z',
                    unreadCount: 1,
                    seekerCount: 1,
                    has_unread: true,
                    donorName: 'Donor',
                    donorImage: 'donor-img',
                },
            ],
        });

        const { getByTestId } = render(<ChatListScreen />);
        expect(getByTestId('chat-item-image-s1').props.source).toEqual({ uri: 'donor-img' });
        expect(getByTestId('chat-item-unread-dot')).toBeTruthy();
    });

    it('handles search input value and placeholder', () => {
        (useChat as jest.Mock).mockReturnValue({
            ...defaultVals,
            searchQuery: 'abc',
        });

        const { getByTestId } = render(<ChatListScreen />);
        const input = getByTestId('chat-search-input');
        expect(input.props.value).toBe('abc');
        expect(input.props.placeholder).toBe('Search');
    });

    it('covers all Hook logic branches', async () => {
        const { result, unmount, rerender } = renderHook(() => realHook());

        // Effects verify
        expect(socketService.emit).toHaveBeenCalledWith('getAllGroups');
        expect(socketService.createNewGroup).toHaveBeenCalled();

        // Search change
        act(() => { result.current.handleSearchChange('new query'); });
        // The setSearchQuery update is reflected in the NEXT render cycle or after act()

        // Refresh
        act(() => { result.current.handleRefresh(); });

        // Retry
        act(() => { result.current.handleRetry(); });

        // Chat Press
        act(() => { result.current.handleChatPress(mockState.chat.chats[0]); });
        expect(mockDispatchNav).toHaveBeenCalled();

        // Unmount
        unmount();
        expect(socketService.removeListener).toHaveBeenCalled();
    });
});
