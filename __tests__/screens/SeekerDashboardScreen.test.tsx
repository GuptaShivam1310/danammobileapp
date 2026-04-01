import React from 'react';
import { renderHook, act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useSeekerDashboardScreen } from '../../src/screens/SeekerDashboard/SeekerDashboardScreen.hook';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postApi } from '../../src/services/api/postApi';
import { SeekerDashboardScreen } from '../../src/screens/SeekerDashboard/SeekerDashboardScreen';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { seekerPreferencesService } from '../../src/services/seekerPreferencesService';

// ─── Mock dependencies ──────────────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockParentNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(() => ({ params: {} })),
}));

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../src/services/api/postApi', () => ({
  postApi: {
    getContributions: jest.fn(),
    addContributionToFavorite: jest.fn().mockResolvedValue({ success: true }),
    removeContributionFromFavorite: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('../../src/services/seekerPreferencesService', () => ({
  seekerPreferencesService: {
    resetPreferences: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../src/storage/asyncStorage', () => ({
  getStorageItem: jest.fn().mockResolvedValue({ selectedLocation: { area: 'A1' } }),
  removeStorageItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/store/slices/wishListSlice', () => ({
  clearWishList: () => ({ type: 'wishlist/clear' }),
  selectWishListIds: jest.fn(() => []),
  toggleWishListItem: jest.fn((p: any) => ({ type: 'wishlist/toggle', payload: p })),
  removeFromWishList: jest.fn((id: string) => ({ type: 'wishlist/remove', payload: id })),
}));
jest.mock('../../src/store/slices/seekerPreferencesSlice', () => ({ resetSeekerPreferences: () => ({ type: 'pref/reset' }) }));
jest.mock('../../src/store/slices/authSlice', () => ({ updateIsPreferencesSaved: () => ({ type: 'auth/prefSaved' }) }));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    FlatList: ({ data, renderItem, ListEmptyComponent, testID, onRefresh, onEndReached, ListFooterComponent, keyExtractor }: any) => {
      const { Fragment } = require('react');
      if (data && data.length && keyExtractor) data.forEach(keyExtractor);
      const children = data && data.length
        ? data.map((item: any, index: number) =>
          ReactLib.createElement(Fragment, { key: item?.id ?? index }, renderItem({ item, index })),
        )
        : (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent);

      const { View: RNView } = require('react-native');
      const footer = ListFooterComponent
        ? (typeof ListFooterComponent === 'function' ? ListFooterComponent() : ListFooterComponent)
        : null;

      return (
        <RNView testID={testID} onRefresh={onRefresh} onEndReached={onEndReached}>
          {children}
          {footer}
        </RNView>
      );
    },
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    RefreshControl: createPrimitive('RefreshControl'),
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    PixelRatio: { roundToNearestPixel: (v: number) => v },
  };
});

jest.mock('../../src/theme', () => ({ useTheme: () => ({ theme: { colors: { text: '#000' } } }) }));
jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => { const { View } = require('react-native'); return <View>{children}</View>; } }));
jest.mock('../../src/components/common/AppLoader', () => ({ AppLoader: () => { const { View } = require('react-native'); return <View testID="app-loader" />; } }));
jest.mock('../../src/components/common/EmptyList', () => ({
  EmptyList: ({ title, subTitle, btnText, btnCallBack }: any) => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return <View><Text>{title}</Text><TouchableOpacity testID="empty-btn" onPress={btnCallBack}><Text>{btnText}</Text></TouchableOpacity></View>;
  }
}));
jest.mock('../../src/components/common/SvgIcon', () => ({ SvgIcon: () => null }));
jest.mock('../../src/components/specified/home/ProductCard', () => ({
  ProductCard: ({ item, onPress, renderImageOverlay, testID }: any) => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return (
      <View>
        <TouchableOpacity testID={testID} onPress={onPress}><Text>{item.title}</Text></TouchableOpacity>
        <TouchableOpacity testID={`${testID}-heart`} onPress={() => { }} />
        {renderImageOverlay}
      </View>
    );
  }
}));

const mockedGetContributions = postApi.getContributions as jest.Mock;

describe('SeekerDashboard', () => {
  const mockItems = Array(10).fill(null).map((_, i) => ({ id: `${i}`, title: `I${i}`, image: '1.jpg', is_favorite: false, category: 'C1', created_at: '2025' }));

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockReturnValue([]);
    (useNavigation as jest.Mock).mockReturnValue({ getParent: () => ({ navigate: mockParentNavigate }), navigate: mockNavigate });
    mockedGetContributions.mockResolvedValue({ success: true, items: mockItems, total: 30 });
  });

  describe('Hook coverage', () => {
    it('handles search from route params', async () => {
      (useRoute as jest.Mock).mockReturnValue({ params: { searchValue: 'search' } });
      const { result } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(mockedGetContributions).toHaveBeenCalledWith(expect.objectContaining({ search: 'search' }), expect.anything()));
    });

    it('handles refresh and pagination', async () => {
      const { result } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(result.current.contributions).toHaveLength(10));

      // Refresh
      await act(async () => { result.current.onRefresh(); });
      await waitFor(() => expect(mockedGetContributions).toHaveBeenCalled());

      // End reached
      mockedGetContributions.mockResolvedValueOnce({ success: true, items: [{ id: 'new-1', title: 'New' }], total: 30 });
      await act(async () => { result.current.onEndReached(); });
      await waitFor(() => expect(result.current.contributions.length).toBeGreaterThan(10));
    });

    it('handles error in fetch', async () => {
      mockedGetContributions.mockRejectedValue(new Error('api fail'));
      const { result } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it('handles toggle like', async () => {
      // Test Like
      const { result } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(result.current.contributions).toHaveLength(10));

      await act(async () => { await result.current.onToggleLike(result.current.contributions[0]); });
      expect(postApi.addContributionToFavorite).toHaveBeenCalledWith(result.current.contributions[0].id);

      // Test Unlike
      mockedGetContributions.mockResolvedValueOnce({ success: true, items: [{ id: 'liked-1', title: 'Liked', is_favorite: true }], total: 10 });
      const { result: r2 } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(r2.current.contributions).toHaveLength(1));

      await act(async () => { await r2.current.onToggleLike(r2.current.contributions[0]); });
      expect(postApi.removeContributionFromFavorite).toHaveBeenCalledWith('liked-1');
    });

    it('handles reset preferences', async () => {
      const { result } = renderHook(() => useSeekerDashboardScreen());
      await waitFor(() => expect(result.current.contributions).toHaveLength(10));

      await act(async () => { await result.current.onPressReset(); });
      expect(seekerPreferencesService.resetPreferences).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Screen coverage', () => {
    it('renders and interactions', async () => {
      const { getByText, getByTestId } = render(<SeekerDashboardScreen />);
      await waitFor(() => expect(getByText('I0')).toBeTruthy());

      fireEvent.press(getByTestId('seeker-dashboard-card-0'));
      expect(mockParentNavigate).toHaveBeenCalled();
    });
  });
});
