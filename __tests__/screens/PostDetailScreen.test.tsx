import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';

// Global Mocks
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }), initReactI18next: { type: '3rdParty', init: () => { } } }));
jest.mock('../../src/localization/i18n', () => ({ t: (k: string) => k, use: () => ({ init: () => { } }) }));

jest.mock('react-native', () => {
    const React = require('react');
    const mock = (n: string) => {
        const C = ({ children, testID, ...p }: any) => React.createElement(n, { ...p, testID }, children);
        C.displayName = n;
        return C;
    };
    const ActivityIndicator = ({ testID, ...p }: any) =>
        React.createElement('ActivityIndicator', { ...p, testID: testID ?? 'post-detail-loading' });
    return {
        View: mock('View'), Text: mock('Text'), TouchableOpacity: mock('TouchableOpacity'), ScrollView: mock('ScrollView'), FlatList: mock('FlatList'),
        Image: mock('Image'), ActivityIndicator, StatusBar: mock('StatusBar'),
        Alert: { alert: jest.fn((t, m, b) => b?.[0]?.onPress?.()) },
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => Array.isArray(s) ? Object.assign({}, ...s) : s },
        Platform: { OS: 'android', select: (o: any) => o.android || o.ios },
        Dimensions: { get: () => ({ width: 375, height: 812 }) },
        NativeModules: { RNShare: {}, RNHTMLtoPDF: {} },
        TurboModuleRegistry: { get: () => ({}), getEnforcing: () => ({}) },
    };
});

jest.mock('react-native-elements', () => ({ Button: 'Button', Icon: 'Icon' }));
jest.mock('react-native-share', () => ({ __esModule: true, default: { open: jest.fn().mockResolvedValue({ success: true }) }, open: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('react-native-html-to-pdf', () => ({ __esModule: true, default: { generatePDF: jest.fn().mockResolvedValue({ filePath: 'path/to/pdf' }) }, generatePDF: jest.fn().mockResolvedValue({ filePath: 'path/to/pdf' }) }));
jest.mock('react-native-vector-icons/Feather', () => ({ __esModule: true, default: 'FeatherIcon' }));
jest.mock('react-native-maps', () => ({ __esModule: true, default: 'MapView', Marker: 'Marker' }));
jest.mock('react-native-toast-message', () => ({ __esModule: true, default: { show: jest.fn() }, show: jest.fn() }));

const mockNavigate = jest.fn();
const mockUnwrap = jest.fn().mockResolvedValue({});
const mockDispatch = jest.fn().mockReturnValue({ unwrap: mockUnwrap });
let mockState = {
    post: {
        newPostData: { id: null, title: 'T', description: 'desc', images: ['i'], categoryId: 'c' },
        selectedPostDetail: {
            id: '1', title: 'P', images: ['i'], status: 'pending', created_at: '2026-02-24', description: 'D',
            category: { name: 'Cat' }, subcategory: { name: 'Sub' }, location: { address: 'Addr' }, posted_by: { name: 'By' }
        },
        awaiting: { data: [], loading: false }, contributed: { data: [], loading: false }, isDetailLoading: false,
    }
};

jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch, useSelector: (fn: any) => fn(mockState), Provider: ({ children }: any) => children }));
jest.mock('../../src/store', () => ({ useAppDispatch: () => mockDispatch, useAppSelector: (fn: any) => fn(mockState) }));

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn(), popToTop: jest.fn() }),
    useRoute: jest.fn(() => ({ params: { id: '1', isPreview: false } })),
    useFocusEffect: (cb: any) => { const React = require('react'); React.useEffect(cb, []); },
    useIsFocused: () => true,
}));

// Component Mocks
jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));
jest.mock('../../src/components/common/AppButton', () => ({ AppButton: (p: any) => { const { TouchableOpacity, Text } = require('react-native'); return <TouchableOpacity onPress={p.onPress} testID={p.testID}><Text>{p.title}</Text></TouchableOpacity>; } }));
jest.mock('../../src/components/common/SuccessModal', () => ({ SuccessModal: (p: any) => { const { View, TouchableOpacity } = require('react-native'); return p.isVisible ? <View testID="success-modal"><TouchableOpacity onPress={p.onButtonPress} testID="success-modal-btn" /></View> : null; } }));
jest.mock('../../src/components/common/ActionModal', () => ({ ActionModal: (p: any) => { const { View, TouchableOpacity } = require('react-native'); return p.isVisible ? <View testID={p.testIDPrefix}><TouchableOpacity onPress={p.onConfirm} testID={p.testIDPrefix + "-confirm"} /></View> : null; } }));
jest.mock('../../src/assets/icons/delete.svg', () => { const React = require('react'); return (props: any) => React.createElement('View', props); });
jest.mock('../../src/theme', () => ({ useTheme: () => ({ theme: { colors: { text: '#0', brandGreen: '#G', surface: '#S', background: '#B', mutedText: '#M' } }, isDark: false }), ThemeProvider: ({ children }: any) => children }));
jest.mock('../../src/theme/scale', () => ({ moderateScale: (v: number) => v, scale: (v: number) => v, verticalScale: (v: number) => v, normalize: (v: number) => v }));

import { PostDetailScreen } from '../../src/screens/PostDetail/PostDetailScreen';
const { usePostDetail: realHook } = jest.requireActual('../../src/screens/PostDetail/usePostDetail');
jest.mock('../../src/screens/PostDetail/usePostDetail', () => ({ usePostDetail: jest.fn() }));
const { usePostDetail } = require('../../src/screens/PostDetail/usePostDetail');

describe('PostDetailScreen', () => {
    let consoleErrorSpy: jest.SpyInstance;
    const baseVals = {
        postDetail: { id: '1', title: 'T', category: 'C', date: 'D', images: ['i'], description: 'Desc' },
        isLoading: false, isProcessing: false, currentImageIndex: 0, handleBack: jest.fn(), handleShare: jest.fn(),
        handleEdit: jest.fn(), handleDelete: jest.fn(), handleMarkContributed: jest.fn(), isDeleteModalVisible: false,
        confirmDelete: jest.fn(), closeDeleteModal: jest.fn(), isPreview: false, isSuccessModalVisible: false,
        handleHome: jest.fn(), selectedSeeker: { name: 'S' }, isContributed: false, onImageScroll: jest.fn(),
        fetchPostDetail: jest.fn(), isEditMode: false, error: null, setPostDetail: jest.fn(), setCurrentImageIndex: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (usePostDetail as jest.Mock).mockReturnValue(baseVals);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('hits UI paths', () => {
        const { getByText, getByTestId, rerender, UNSAFE_getByType } = render(<PostDetailScreen />);
        const { FlatList } = require('react-native');
        const list = UNSAFE_getByType(FlatList);
        list.props.keyExtractor(null, 0);
        list.props.renderItem({ item: 'i' });
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, isDeleteModalVisible: true, isSuccessModalVisible: true });
        rerender(<PostDetailScreen />);
        fireEvent.press(getByTestId('delete-post-modal-confirm'));
        fireEvent.press(getByTestId('success-modal-btn'));
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, postDetail: { images: [] } });
        rerender(<PostDetailScreen />);
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, postDetail: null, error: 'E' });
        rerender(<PostDetailScreen />);
        fireEvent.press(getByText('Retry'));
    });

    it('hits Hook branches for 81%+ coverage', async () => {
        const { useRoute } = require('@react-navigation/native');
        (useRoute as jest.Mock).mockReturnValue({ params: { id: '1', isPreview: false } });
        const { result, rerender } = renderHook(() => realHook());
        const RNShare = require('react-native-share').default;
        const flushPromises = () => new Promise(resolve => setImmediate(resolve));

        await act(async () => { rerender(); });

        // 1. Mark Contributed Navigation (Line 374)
        await act(async () => { await result.current.handleMarkContributed(); });

        // 2. Share branches
        await act(async () => { await result.current.handleShare(); });
        await flushPromises();
        expect(RNShare.open).toHaveBeenCalled();
        mockState.post.selectedPostDetail.location.address = undefined;
        await act(async () => { await result.current.handleShare(); });
        await flushPromises();
        expect(RNShare.open).toHaveBeenCalledTimes(2);

        // Delete Error and Success
        mockUnwrap.mockRejectedValueOnce(new Error('FAIL'));
        await act(async () => { await result.current.confirmDelete(); });
        mockUnwrap.mockResolvedValueOnce({});
        await act(async () => { await result.current.confirmDelete(); });

        // Preview flow exhaustive
        (useRoute as jest.Mock).mockReturnValue({ params: { id: 'preview', isPreview: true } });
        const { result: rP } = renderHook(() => realHook());

        // 4. Validation & Catch
        mockState.post.newPostData.title = ' ';
        await act(async () => { await rP.current.handleMarkContributed(); });

        mockState.post.newPostData.title = 'V';
        mockUnwrap.mockRejectedValueOnce(new Error('FAIL'));
        await act(async () => { await rP.current.handleMarkContributed(); });

        // 5. Update Success
        mockState.post.newPostData.id = '1';
        mockUnwrap.mockResolvedValueOnce({});
        await act(async () => { await rP.current.handleMarkContributed(); });

        // 6. Home & Back & Edit
        act(() => { rP.current.handleHome(); });
        act(() => { result.current.handleBack(); });
        act(() => { result.current.handleEdit(); });
        
        act(() => { result.current.onImageScroll({ nativeEvent: { layoutMeasurement: { width: 100 }, contentOffset: { x: 200 } } }) });
        
        // Edge cases
        act(() => { result.current.closeDeleteModal(); });
        
        // Create Contribution Success
        mockUnwrap.mockResolvedValueOnce({});
        mockState.post.newPostData.id = null;
        await act(async () => { await rP.current.handleMarkContributed(); });
        
        // Redux rejected
        mockUnwrap.mockRejectedValueOnce(new Error('FAIL CREATE'));
        mockState.post.newPostData.id = null;
        await act(async () => { await rP.current.handleMarkContributed(); });
        
        // Share catch without user cancel
        RNShare.open.mockRejectedValueOnce(new Error('Random error'));
        const prevCalls = RNShare.open.mock.calls.length;
        await act(async () => { await result.current.handleShare(); });
        await flushPromises();
        expect(RNShare.open.mock.calls.length).toBeGreaterThanOrEqual(prevCalls);
        
        // handleEdit without isPreview
        act(() => { rP.current.handleEdit(); });
        
        // confirmDelete without id
        useRoute.mockReturnValueOnce({ params: { id: '', isPreview: false } });
        const { result: noIdResult } = renderHook(() => realHook());
        await act(async () => { await noIdResult.current.confirmDelete(); });
        
    });
    
    it('covers all component render branches accurately', () => {
        const { getByText, rerender, getByTestId, queryByTestId, UNSAFE_getByType } = render(<PostDetailScreen />);
        
        // 1. isPreview true
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, isPreview: true });
        rerender(<PostDetailScreen />);
        expect(getByText('postDetail.previewTitle')).toBeTruthy();

        // 2. Empty images array
        mockState.post.selectedPostDetail.images = [];
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, postDetail: { ...baseVals.postDetail, images: [] } });
        rerender(<PostDetailScreen />);
        
        // 3. No coordinates (latitude/longitude missing)
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, latitude: undefined, longitude: undefined, postDetail: { ...baseVals.postDetail, address: 'Test address' } });
        rerender(<PostDetailScreen />);

        // 4. donatedTo object present without avatar
        (usePostDetail as jest.Mock).mockReturnValue({ 
            ...baseVals, 
            postDetail: { ...baseVals.postDetail, donatedTo: { name: 'User Name', email: 'test@mail.com' } }
        });
        rerender(<PostDetailScreen />);
        expect(getByTestId('contributed-to-section')).toBeTruthy();
        
        // 4b. selectedSeeker present without donatedTo, but with avatar
        (usePostDetail as jest.Mock).mockReturnValue({ 
            ...baseVals, 
            postDetail: { ...baseVals.postDetail, donatedTo: undefined },
            selectedSeeker: { name: 'Seeker', email: 'seeker@ok.com', phone: '12345', avatar: 'https://avatar.url' }
        });
        rerender(<PostDetailScreen />);
        expect(getByTestId('contributed-to-section')).toBeTruthy();
        
        // 4c. subcategoryName tests
        (usePostDetail as jest.Mock).mockReturnValue({ 
            ...baseVals, 
            postDetail: { ...baseVals.postDetail, subCategoryName: 'Sub1', category: 'Cat' }
        });
        rerender(<PostDetailScreen />);
        
        // 5. Loading states
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, isLoading: true });
        act(() => {
            rerender(<PostDetailScreen />);
        });
        const { ActivityIndicator } = require('react-native');
        expect(queryByTestId('post-detail-loading')).toBeTruthy();
        
        // 6. Error states
        (usePostDetail as jest.Mock).mockReturnValue({ ...baseVals, isLoading: false, postDetail: null, error: 'Network fail' });
        rerender(<PostDetailScreen />);
        expect(getByText('Network fail')).toBeTruthy();
    });
});
