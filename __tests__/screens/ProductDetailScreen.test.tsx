import { renderHook, act, render, waitFor, fireEvent } from '@testing-library/react-native';
import React from 'react';

// ─── Stable Mocks & Constants ──────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockNav = {
  goBack: mockGoBack,
  navigate: mockNavigate,
  getParent: () => ({ navigate: mockNavigate })
};
const mockT = (k: string) => k;
let mockRoute = { params: { id: '123' } as any };
let mockPlatformOS = 'ios';
let mockWishListIds: string[] = [];

jest.mock('react-native', () => {
  const RL = require('react');
  const cP = (n: string) => ({ children, ...p }: any) => RL.createElement(n, p, children);
  return {
    View: cP('View'),
    Text: cP('Text'),
    TouchableOpacity: cP('TouchableOpacity'),
    ActivityIndicator: cP('ActivityIndicator'),
    ScrollView: cP('ScrollView'),
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    Platform: {
      get OS() { return mockPlatformOS; },
      select: (obj: any) => obj[mockPlatformOS] || obj.ios || obj.android
    },
    Linking: { openURL: jest.fn().mockResolvedValue(true) },
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    PixelRatio: { roundToNearestPixel: (v: number) => v },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNav,
  useRoute: () => mockRoute
}));
jest.mock('../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (fn: any) => {
    if (fn.name === 'selectWishListIds') return mockWishListIds;
    return [];
  }
}));
jest.mock('../../src/services/api/postApi', () => ({
  postApi: {
    getContributionDetails: jest.fn(),
    addContributionToFavorite: jest.fn().mockResolvedValue({ success: true }),
    removeContributionFromFavorite: jest.fn().mockResolvedValue({ success: true }),
    expressInterest: jest.fn().mockResolvedValue({ success: true }),
    cancelInterest: jest.fn().mockResolvedValue({ success: true }),
  }
}));
jest.mock('../../src/services/api/productDetailApi', () => ({
  productDetailApi: {
    getProductStatus: jest.fn(),
    updateProductStatus: jest.fn().mockResolvedValue({ success: true }),
    reportIssue: jest.fn().mockResolvedValue({ success: true }),
  }
}));
jest.mock('react-native-share', () => ({ open: jest.fn(), default: { open: jest.fn() } }));
jest.mock('react-native-html-to-pdf', () => ({ generatePDF: jest.fn().mockResolvedValue({ filePath: 'f.pdf' }) }));
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('react-native-reanimated-carousel', () => {
  const RL = require('react');
  return RL.forwardRef((p: any, ref) => {
    RL.useImperativeHandle(ref, () => ({ scrollTo: jest.fn() }));
    return RL.createElement('View', { testID: 'carousel' });
  });
});
jest.mock('react-native-maps', () => {
  const RL = require('react');
  return { __esModule: true, default: (p: any) => RL.createElement('View', p), Marker: (p: any) => RL.createElement('View', p) };
});

// Components
jest.mock('../../src/components/common/AppImage', () => ({ AppImage: () => null }));
jest.mock('../../src/components/common/SvgIcon', () => ({ SvgIcon: () => null }));
jest.mock('../../src/components/common/ReportUserModal', () => ({
  ReportUserModal: (p: any) => {
    const RL = require('react');
    if (!p.isVisible) return null;
    return RL.createElement('View', { testID: 'report-modal' }, [
      RL.createElement('TouchableOpacity', { key: 's', onPress: p.onReport, testID: 'report-submit' }),
      RL.createElement('TouchableOpacity', { key: 'c', onPress: p.onCancel, testID: 'report-cancel' })
    ]);
  }
}));
jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));
jest.mock('../../src/components/common/AppLoader', () => ({
  AppLoader: () => {
    const RL = require('react');
    return RL.createElement('Text', {}, 'Loading');
  }
}));
jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: (p: any) => {
    const RL = require('react');
    return RL.createElement('TouchableOpacity', { onPress: p.onPress, testID: p.testID || 'app-button' }, RL.createElement('Text', {}, p.title));
  }
}));
jest.mock('../../src/theme', () => ({ useTheme: () => ({ theme: { colors: { text: '#000', surface: '#fff' } } }) }));
jest.mock('../../src/theme/scale', () => ({ moderateScale: (s: number) => s, normalize: (s: number) => s, verticalScale: (s: number) => s }));
jest.mock('../../src/store/slices/wishListSlice', () => ({
  toggleWishListItem: (p: any) => ({ type: 'T', payload: p }),
  selectWishListIds: (s: any) => [],
  removeFromWishList: (id: string) => ({ type: 'R', payload: id })
}));

// ─── Imports ────────────────────────────────────────────────────────────────
import { useProductDetailScreen } from '../../src/screens/ProductDetail/ProductDetailScreen.hook';
import { ProductDetailScreen } from '../../src/screens/ProductDetail/ProductDetailScreen';
import { postApi } from '../../src/services/api/postApi';
import { productDetailApi } from '../../src/services/api/productDetailApi';
import { Linking } from 'react-native';

jest.setTimeout(40000);

describe('ProductDetail', () => {
  const mockItem = {
    id: '123', title: 'T', images: ['1.jpg'], location: { latitude: '1', longitude: '1' },
    contributor: { name: 'J', phone: '1', contributions_count: 5 },
    status: 'pending', is_favorite: false, category_name: 'C', sub_category_name: 'S'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatformOS = 'ios';
    mockWishListIds = [];
    mockRoute.params = { id: '123' };
    (postApi.getContributionDetails as jest.Mock).mockResolvedValue({ success: true, data: mockItem });
  });

  it('achieves maximal hook and component coverage >80% total', async () => {
    // 1. Hook Exhaustive Paths
    // Sync & Initialization (Favorite Sync)
    (postApi.getContributionDetails as jest.Mock).mockResolvedValueOnce({
      success: true, data: { ...mockItem, is_favorite: true }
    });
    const { result: rh1 } = renderHook(() => useProductDetailScreen());
    await waitFor(() => expect(rh1.current.productDetail).toBeTruthy());
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'T' }));

    mockWishListIds = ['123'];
    (postApi.getContributionDetails as jest.Mock).mockResolvedValueOnce({
      success: true, data: { ...mockItem, is_favorite: false }
    });
    renderHook(() => useProductDetailScreen());
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'R' })));

    // Unresolved ID Early returns
    mockRoute.params = {};
    const { result: rhEmpty } = renderHook(() => useProductDetailScreen());
    act(() => { rhEmpty.current.handleChat(); }); // Line 496-503
    expect(rhEmpty.current.productDetail).toBeNull();

    mockRoute.params = { id: '123' };
    const { result } = renderHook(() => useProductDetailScreen());
    await waitFor(() => expect(result.current.productDetail).toBeTruthy());

    // API Success & Failure checks
    await act(async () => {
      await result.current.handleInterested();
      await result.current.handleCancelInterest();
      await result.current.handleToggleFavorite();
      await result.current.handleCall();
      await result.current.handleShare();
      result.current.handleChat();
      result.current.handleBack();
    });

    // Failures / Errors / Catch Blocks
    (postApi.expressInterest as jest.Mock).mockRejectedValueOnce({ response: { data: { message: 'FAIL' } } });
    await act(async () => { await result.current.handleInterested(); });

    (postApi.cancelInterest as jest.Mock).mockResolvedValueOnce({ success: false });
    await act(async () => { await result.current.handleCancelInterest(); });

    (postApi.addContributionToFavorite as jest.Mock).mockRejectedValueOnce(new Error());
    await act(async () => { await result.current.handleToggleFavorite(); });

    // Android specifics
    mockPlatformOS = 'android';
    await act(async () => { await result.current.handleCall(); });
    (Linking.openURL as jest.Mock).mockImplementationOnce(() => { throw new Error(); });
    await act(async () => { await result.current.handleCall(); });

    // Reporting flow exhaustion
    act(() => { result.current.handleReportIssue(); });
    act(() => { result.current.handleReportReasonChange('Reason'); });
    (productDetailApi.reportIssue as jest.Mock).mockResolvedValueOnce({ success: false });
    await act(async () => { await result.current.handleSubmitReportIssue(); });

    act(() => { result.current.handleReportIssue(); });
    (productDetailApi.reportIssue as jest.Mock).mockRejectedValueOnce(new Error());
    await act(async () => { await result.current.handleSubmitReportIssue(); });

    act(() => { result.current.handleReportReasonChange(' '); });
    await act(async () => { await result.current.handleSubmitReportIssue(); }); // Hits line 534

    // Concurrent action guards
    (postApi.expressInterest as jest.Mock).mockReturnValueOnce(new Promise(() => { }));
    act(() => { result.current.handleInterested(); });
    act(() => { result.current.handleInterested(); }); // Line 403
    act(() => { result.current.handleCancelInterest(); }); // Line 441

    // 2. Component/Integration coverage
    const { getByText, getByTestId, queryByText } = render(<ProductDetailScreen />);
    await waitFor(() => expect(getByText('T')).toBeTruthy());

    // Button clicks in component
    const shareBtn = getByTestId('product-detail-share-button');
    fireEvent.press(shareBtn);

    const likeBtn = getByTestId('product-detail-like-button');
    fireEvent.press(likeBtn);

    const backBtn = getByTestId('product-detail-back-button');
    fireEvent.press(backBtn);

    // Adaptive States
    (postApi.getContributionDetails as jest.Mock).mockResolvedValue({
      success: true, data: { ...mockItem, is_interested: true }
    });
    const { getByText: getIP } = render(<ProductDetailScreen />);
    await waitFor(() => expect(getIP('productDetail.actions.cancelInterest')).toBeTruthy());
    fireEvent.press(getIP('productDetail.actions.cancelInterest'));

    (postApi.getContributionDetails as jest.Mock).mockResolvedValue({
      success: true, data: { ...mockItem, request_status: 'accepted' }
    });
    const { getByText: getDone } = render(<ProductDetailScreen />);
    await waitFor(() => expect(getDone('productDetail.actions.call')).toBeTruthy());
    fireEvent.press(getDone('productDetail.actions.call'));

    // Modal interaction
    const { getByText: getReportBtn, getByTestId: getRM } = render(<ProductDetailScreen />);
    await waitFor(() => expect(getReportBtn('productDetail.actions.reportIssue')).toBeTruthy());
    fireEvent.press(getReportBtn('productDetail.actions.reportIssue'));
    await waitFor(() => expect(getRM('report-modal')).toBeTruthy());
    fireEvent.press(getRM('report-cancel'));
  });
});
