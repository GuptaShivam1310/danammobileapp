import React from 'react';
import { render, fireEvent, renderHook, act, waitFor } from '@testing-library/react-native';
import { PostScreen } from '../../src/screens/Post/PostScreen';
import { ROUTES } from '../../src/constants/routes';

// Manual mocks
jest.mock('react-native', () => {
    const React = require('react');
    const mockComponent = (name: string) => {
        const Comp = ({ children, testID, ...props }: any) => React.createElement(name, { ...props, testID }, children);
        Comp.displayName = name;
        return Comp;
    };
    return {
        View: mockComponent('View'),
        Text: mockComponent('Text'),
        TouchableOpacity: mockComponent('TouchableOpacity'),
        FlatList: mockComponent('FlatList'),
        RefreshControl: mockComponent('RefreshControl'),
        ActivityIndicator: mockComponent('ActivityIndicator'),
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => Array.isArray(s) ? Object.assign({}, ...s) : s,
        },
        Platform: {
            OS: 'android',
            select: (obj: any) => obj.android || obj.ios,
        },
    };
});

jest.mock('react-native-safe-area-context', () => ({
    __esModule: true,
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock store
const mockUnwrap = jest.fn().mockResolvedValue({ data: [] });
const mockFetchUserPosts = jest.fn((..._args: any[]) => ({ unwrap: mockUnwrap }));
const mockDispatch = jest.fn((action: any) => ({ unwrap: mockUnwrap }));

jest.mock('../../src/store', () => ({
    __esModule: true,
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: any) => selector({
        post: {
            awaiting: { data: [{ id: '1' }], loading: false, hasMore: true, page: 1 },
            contributed: { data: [{ id: '2' }], loading: false, hasMore: true, page: 1 },
        }
    }),
}));

jest.mock('../../src/store/slices/postSlice', () => ({
    __esModule: true,
    fetchUserPosts: (...args: any[]) => mockFetchUserPosts(...args),
    clearNewPostData: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockIsFocused = jest.fn(() => true);
jest.mock('@react-navigation/native', () => ({
    __esModule: true,
    useNavigation: () => ({ navigate: mockNavigate }),
    useIsFocused: () => mockIsFocused(),
}));

jest.mock('react-i18next', () => ({
    __esModule: true,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../src/theme', () => ({
    __esModule: true,
    useTheme: () => ({
        theme: {
            colors: {
                text: '#000',
                brandGreen: '#00FF00',
                surface: '#fff',
                background: '#fff',
                mutedText: '#666',
            }
        },
        isDark: false,
    }),
    ThemeProvider: ({ children }: any) => children,
}));

jest.mock('../../src/theme/scale', () => ({
    __esModule: true,
    moderateScale: (v: number) => v,
    scale: (v: number) => v,
    verticalScale: (v: number) => v,
    normalize: (v: number) => v,
}));

jest.mock('../../src/constants/colors', () => ({
    __esModule: true,
    palette: { white: '#fff', brandGreen: '#00FF00' }
}));

jest.mock('react-native-vector-icons/Feather', () => ({
    __esModule: true,
    default: 'FeatherIcon',
}));

// Component Mocks
jest.mock('../../src/components/common/ScreenWrapper', () => ({
    __esModule: true,
    ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../src/components/specified/home/ProductCard', () => {
    const React = require('react');
    const ProductCard = (props: any) => React.createElement('TouchableOpacity', {
        testID: props.testID || `card-${props.item.id}`,
        onPress: props.onPress
    });
    return { __esModule: true, ProductCard };
});

jest.mock('../../src/components/common/EmptyList', () => ({
    __esModule: true,
    EmptyList: (props: any) => {
        const React = require('react');
        return React.createElement('TouchableOpacity', {
            testID: 'empty-list-btn',
            onPress: props.btnCallBack
        });
    }
}));

// MOCK usePost for Screen tests
const { usePost: actualUsePost } = jest.requireActual('../../src/screens/Post/usePost');
jest.mock('../../src/screens/Post/usePost', () => ({
    __esModule: true,
    usePost: jest.fn(),
}));
const { usePost } = require('../../src/screens/Post/usePost');

describe('PostScreen Rendering', () => {
    const vals = {
        posts: [{ id: '1' }],
        isLoading: false,
        isRefreshing: false,
        activeTab: 'Awaiting' as any,
        awaitingCount: 1,
        contributedCount: 0,
        handleContinue: jest.fn(),
        handleTabChange: jest.fn(),
        handlePostPress: jest.fn(),
        handleRefresh: jest.fn(),
        handleLoadMore: jest.fn(),
        hasMore: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (usePost as jest.Mock).mockReturnValue(vals);
    });

    it('hits all screen logic paths', () => {
        const { getByTestId, getByText, rerender } = render(<PostScreen />);

        // Tab interaction
        fireEvent.press(getByText(/myPost.contributed/));
        expect(vals.handleTabChange).toHaveBeenCalledWith('Contributed');

        // Tab UI coverage (ternaries)
        (usePost as jest.Mock).mockReturnValue({ ...vals, activeTab: 'Contributed' });
        rerender(<PostScreen />);

        // List interaction
        const list = getByTestId('posts-list');
        const itemComp = list.props.renderItem({ item: { id: '1' } });
        const { getByTestId: getItemByTestId } = render(itemComp);
        fireEvent.press(getItemByTestId('post-card-1'));
        expect(vals.handlePostPress).toHaveBeenCalledWith('1');

        // FlatList properties
        list.props.keyExtractor({ id: '1' });
        list.props.ListFooterComponent();
        list.props.onEndReached();

        // Footer branch coverage
        (usePost as jest.Mock).mockReturnValue({ ...vals, hasMore: false });
        rerender(<PostScreen />);

        // Empty Content State
        (usePost as jest.Mock).mockReturnValue({ ...vals, posts: [], isLoading: false });
        rerender(<PostScreen />);
        expect(getByTestId('empty-state-container')).toBeTruthy();
        fireEvent.press(getByTestId('empty-list-btn'));

        // Loading Content State
        (usePost as jest.Mock).mockReturnValue({ ...vals, isLoading: true });
        rerender(<PostScreen />);
        expect(getByTestId('loading-state')).toBeTruthy();
    });
});

describe('usePost Hook Logic', () => {
    it('handles interaction branches and effects', async () => {
        // We need to re-mock or adjust for this test specifically
        const mockStore = require('../../src/store');
        const mockSelector = jest.fn()
            .mockReturnValueOnce({ awaiting: { data: [], loading: false }, contributed: { data: [], loading: false } }) // Effect mount
            .mockReturnValue({ awaiting: { data: [{ id: '1' }], hasMore: true, page: 1 }, contributed: { data: [{ id: '2' }], hasMore: true, page: 1 } }); // Interaction

        jest.spyOn(mockStore, 'useAppSelector').mockImplementation(mockSelector);

        const { result } = renderHook(() => actualUsePost());

        act(() => { result.current.handleTabChange('Contributed'); });
        expect(result.current.activeTab).toBe('Contributed');

        act(() => { result.current.handlePostPress('1'); }); // Contributed (no navigate)

        act(() => { result.current.handleTabChange('Awaiting'); });
        act(() => { result.current.handlePostPress('2'); });
        expect(mockNavigate).toHaveBeenCalled();

        await act(async () => { await result.current.handleRefresh(); });
        act(() => { result.current.handleLoadMore(); });
        act(() => { result.current.handleContinue(); });
    });
});
