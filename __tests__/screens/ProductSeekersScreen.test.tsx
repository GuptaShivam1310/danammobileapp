import React from 'react';
import { act, fireEvent, render, waitFor, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProductSeekersScreen } from '../../src/screens/ProductSeekers/ProductSeekersScreen';
import productSeekersReducer from '../../src/store/productSeekers/productSeekersSlice';
import { chatApi } from '../../src/services/api/chatApi';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));

jest.mock('../../src/theme', () => {
    const { lightColors } = require('../../src/constants/colors');
    return {
        useTheme: () => ({
            theme: {
                colors: lightColors,
            },
        }),
    };
});

jest.mock('../../src/components/common/ScreenWrapper', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        __esModule: true,
        ScreenWrapper: ({ children }: any) => React.createElement(View, null, children),
    };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('lodash.debounce', () => jest.fn(fn => fn));

jest.mock('../../src/theme/scale', () => ({
    scale: (v: number) => v,
    verticalScale: (v: number) => v,
    moderateScale: (v: number) => v,
    normalize: (v: number) => v,
}));

jest.mock('../../src/services/api/chatApi');
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
            ReactLib.createElement(name, { ...props, ref }, children)
        );
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TextInput: createPrimitive('TextInput'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Image: createPrimitive('Image'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        FlatList: ({ data, renderItem, testID, contentContainerStyle, ListEmptyComponent }: any) => {
            const R2 = require('react');
            const V2 = createPrimitive('View');
            if (data?.length === 0 && ListEmptyComponent) {
                const empty = typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent;
                return R2.createElement(V2, { testID }, empty);
            }
            const items = (data || []).map((item: any, index: number) =>
                renderItem({ item, index }),
            );
            return R2.createElement(V2, { testID, contentContainerStyle }, ...items);
        },
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => s,
            hairlineWidth: 1,
        },
        Dimensions: { get: jest.fn().mockReturnValue({ width: 375, height: 812 }) },
        PixelRatio: { roundToNearestPixel: (v: number) => v },
        Platform: { OS: 'ios', select: (o: any) => o.ios },
    };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeStore = () =>
    configureStore({
        reducer: { productSeekers: productSeekersReducer },
        middleware: gDM => gDM({ serializableCheck: false }),
    });

const MOCK_SEEKERS_API = [
    {
        request_id: '1',
        user_id: 'u1',
        name: 'Donald Taylor',
        profile_image: '',
        request_status: 'pending',
        last_message: '',
        last_message_time: '',
    },
    {
        request_id: '2',
        user_id: 'u2',
        name: 'Daniel Peterson',
        profile_image: '',
        request_status: 'active',
        last_message: 'Good Morning',
        last_message_time: '2026-03-06T09:41:00Z',
    },
    {
        request_id: '3',
        user_id: 'u3',
        name: 'Rejected User',
        profile_image: '',
        request_status: 'rejected',
        last_message: 'Sorry',
        last_message_time: '2026-03-06T08:00:00Z',
    },
];

const MOCK_SEEKERS = [
    { id: '1', name: 'Donald Taylor', avatar: '', status: 'pending' as const },
    {
        id: '2',
        name: 'Daniel Peterson',
        avatar: '',
        status: 'active' as const,
        lastMessage: 'Good Morning',
        timestamp: '09:41 AM',
    },
];

const TEST_PARAMS = {
    productId: 'prod-123',
    productTitle: 'Apple MacBook Air M2 256 GB',
    productImage: 'https://example.com/img.jpg',
};

const renderScreen = (store = makeStore()) =>
    render(
        <Provider store={store}>
            <ProductSeekersScreen route={{ params: TEST_PARAMS }} />
        </Provider>,
    );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductSeekersScreen', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    // ─── Render ───────────────────────────────────────────────────
    it('renders the product header', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByTestId } = renderScreen();
        expect(getByTestId('product-header')).toBeTruthy();
    });

    it('renders the product title from params', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByText } = renderScreen();
        expect(getByText(TEST_PARAMS.productTitle)).toBeTruthy();
    });

    it('renders the search input', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByTestId } = renderScreen();
        expect(getByTestId('seekers-search-input')).toBeTruthy();
    });

    // ─── Loading ──────────────────────────────────────────────────
    it('shows loading indicator while fetching', async () => {
        // Never resolves during this test
        (chatApi.getProductSeekers as jest.Mock).mockReturnValue(new Promise(() => { }));
        const { getByTestId } = renderScreen();
        expect(getByTestId('seekers-loading')).toBeTruthy();
    });

    // ─── API Success ──────────────────────────────────────────────
    it('renders empty state when no seekers are found', async () => {
        const localEn = require('../../src/localization/en.json');
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByTestId, getByText } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-empty-state')).toBeTruthy());
        expect(getByText(localEn.productSeekers.noInterest)).toBeTruthy();
    });

    it('renders the seekers list on API success', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-list')).toBeTruthy());
    });

    it('renders all seeker items from API', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => {
            expect(getByTestId('seeker-item-1')).toBeTruthy();
            expect(getByTestId('seeker-item-2')).toBeTruthy();
        });
    });

    it('renders empty message when no seekers available', async () => {
        const localEn = require('../../src/localization/en.json');
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByText } = renderScreen();
        await waitFor(() => {
            expect(getByText(localEn.productSeekers.noInterest)).toBeTruthy();
        });
    });

    it('renders correctly with chatId param and fallback title', () => {
        const localEn = require('../../src/localization/en.json');
        const { getByText, getByTestId } = render(
            <Provider store={makeStore()}>
                <ProductSeekersScreen route={{ params: { chatId: 'c1' } } as any} />
            </Provider>
        );
        expect(getByText(localEn.productSeekers.titleFallback)).toBeTruthy(); // Fallback title
        expect(getByTestId('product-image-placeholder')).toBeTruthy(); // Placeholder image
    });

    it('renders seeker with avatar placeholder', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [{ ...MOCK_SEEKERS_API[0], avatar: null }],
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => {
            expect(getByTestId('seeker-avatar-1')).toBeTruthy();
        });
    });

    it('does not render seekers with rejected status', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByText, queryByText } = renderScreen();
        await waitFor(() => {
            expect(getByText('Donald Taylor')).toBeTruthy();
            expect(getByText('Daniel Peterson')).toBeTruthy();
            expect(queryByText('Rejected User')).toBeNull();
        });
    });

    it('shows "View Request" button only for pending seekers', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId, queryByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('view-request-button-1')).toBeTruthy());
        expect(queryByTestId('view-request-button-2')).toBeNull();
    });

    it('shows last message for active seekers', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByText } = renderScreen();
        await waitFor(() => expect(getByText('Good Morning')).toBeTruthy());
    });

    // ─── API Error ────────────────────────────────────────────────
    it('shows error state when API fails', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockRejectedValueOnce(
            new Error('Network Error'),
        );
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-error')).toBeTruthy());
    });

    it('shows retry button on error', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockRejectedValueOnce(
            new Error('Network Error'),
        );
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-retry-button')).toBeTruthy());
    });

    it('retries API call on retry button press', async () => {
        (chatApi.getProductSeekers as jest.Mock)
            .mockRejectedValueOnce(new Error('Fail'))
            .mockResolvedValueOnce({ success: true, data: [] });

        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-retry-button')).toBeTruthy());

        await act(async () => {
            fireEvent.press(getByTestId('seekers-retry-button'));
        });

        expect(chatApi.getProductSeekers).toHaveBeenCalledTimes(2);
    });

    // ─── Search ───────────────────────────────────────────────────
    it('filters seekers by search query (>= 2 chars)', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId, queryByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-list')).toBeTruthy());

        await act(async () => {
            fireEvent.changeText(getByTestId('seekers-search-input'), 'Donald');
        });

        await waitFor(() => {
            expect(getByTestId('seeker-item-1')).toBeTruthy(); // Donald matches
            expect(queryByTestId('seeker-item-2')).toBeNull(); // Daniel does not match "Donald"
        });
    });

    it('shows all seekers when query is < 2 chars', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seekers-list')).toBeTruthy());

        await act(async () => {
            fireEvent.changeText(getByTestId('seekers-search-input'), 'D');
        });

        await waitFor(() => {
            expect(getByTestId('seeker-item-1')).toBeTruthy();
            expect(getByTestId('seeker-item-2')).toBeTruthy();
        });
    });

    // ─── Navigation ───────────────────────────────────────────────
    it('calls goBack when back button pressed', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: [],
        });
        const { getByTestId } = renderScreen();
        await act(async () => {
            fireEvent.press(getByTestId('back-button'));
        });
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('navigates to RequestDetailScreen when View Request pressed', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API,
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('view-request-button-1')).toBeTruthy());

        await act(async () => {
            fireEvent.press(getByTestId('view-request-button-1'));
        });

        expect(mockNavigate).toHaveBeenCalledWith('RequestDetailScreen', {
            seekerId: 'u1',
            requestId: '1',
            productId: 'prod-123',
            productTitle: 'Apple MacBook Air M2 256 GB',
            productImage: 'https://example.com/img.jpg',
        });
    });

    it('navigates to Chat screen when non-pending seeker item is pressed', async () => {
        (chatApi.getProductSeekers as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: MOCK_SEEKERS_API, // Item 2 is 'active'
        });
        const { getByTestId } = renderScreen();
        await waitFor(() => expect(getByTestId('seeker-item-2')).toBeTruthy());

        await act(async () => {
            fireEvent.press(getByTestId('seeker-item-2'));
        });

        expect(mockNavigate).toHaveBeenCalledWith('Chat', {
            seekerId: 'u2',
            requestId: '2',
            seekerName: 'Daniel Peterson',
            seekerAvatar: '',
            productId: 'prod-123',
            productTitle: 'Apple MacBook Air M2 256 GB',
            productImage: 'https://example.com/img.jpg',
        });
    });

    // ─── useProductSeekers Hook ───────────────────────────────────
    describe('useProductSeekers hook', () => {
        const wrapper = ({ children }: any) => (
            <Provider store={makeStore()}>{children}</Provider>
        );

        it('initializes with default values', () => {
            const { useProductSeekers } = require('../../src/screens/ProductSeekers/useProductSeekers');
            const { result } = renderHook(() => useProductSeekers('p1'), { wrapper });

            expect(result.current.seekers).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.searchQuery).toBe('');
        });

        it('filters seekers correctly via handleSearchChange', async () => {
            const { useProductSeekers } = require('../../src/screens/ProductSeekers/useProductSeekers');
            const store = makeStore();
            const { result } = renderHook(() => useProductSeekers('p1'), {
                wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
            });

            // Mock some data in store
            await act(async () => {
                store.dispatch({
                    type: 'productSeekers/fetchProductSeekers/fulfilled',
                    payload: [
                        { id: '1', name: 'Alice', status: 'active' },
                        { id: '2', name: 'Bob', status: 'active' }
                    ]
                });
            });

            act(() => {
                result.current.handleSearchChange('Alice');
            });

            expect(result.current.searchQuery).toBe('Alice');
            expect(result.current.seekers).toHaveLength(1);
            expect(result.current.seekers[0].name).toBe('Alice');
        });

        it('navigates correctly via handleBack', () => {
            const { useProductSeekers } = require('../../src/screens/ProductSeekers/useProductSeekers');
            const { result } = renderHook(() => useProductSeekers('p1'), { wrapper });

            act(() => {
                result.current.handleBack();
            });

            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
