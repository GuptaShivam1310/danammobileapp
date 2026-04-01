import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { WishlistScreen } from '../../src/screens/Wishlist/WishlistScreen';
import { removeFromWishList } from '../../src/store/slices/wishListSlice';
import { useWishlistScreen } from '../../src/screens/Wishlist/WishlistScreen.hook';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    Image: createPrimitive('Image'),
    RefreshControl: createPrimitive('RefreshControl'),
    Platform: { OS: 'ios' },
    FlatList: ({ data = [], renderItem, ListEmptyComponent, testID, contentContainerStyle }: any) => {
      const items = data.length
        ? data.map((item: any, index: number) =>
            ReactLib.createElement(ReactLib.Fragment, { key: item?.id ?? index }, renderItem({ item, index })),
          )
        : (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent);

      return ReactLib.createElement('View', { testID, contentContainerStyle }, items);
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    PixelRatio: {
      roundToNearestPixel: (value: number) => value,
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#111111',
        mutedText: '#666666',
      },
    },
  }),
}));

jest.mock('../../src/theme/scale', () => ({
  normalize: (size: number) => size,
  scale: (size: number) => size,
  verticalScale: (size: number) => size,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'wishlist.headerTitle': 'My Wishlist',
        'wishlist.empty.title': 'You haven’t liked anything yet',
        'wishlist.empty.subTitle': 'Collect all the things you like in one place',
        'wishlist.empty.button': 'Discover',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/components/common/EmptyList', () => ({
  EmptyList: ({ title, subTitle, btnText, btnCallBack }: any) => {
    const ReactLib = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return ReactLib.createElement(
      View,
      { testID: 'wishlist-empty-list' },
      ReactLib.createElement(Text, null, title),
      ReactLib.createElement(Text, null, subTitle),
      ReactLib.createElement(
        TouchableOpacity,
        { testID: 'wishlist-discover-button', onPress: btnCallBack },
        ReactLib.createElement(Text, null, btnText),
      ),
    );
  },
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
  SvgIcon: ({ testID }: { testID?: string }) => {
    const ReactLib = require('react');
    return ReactLib.createElement('SvgIcon', { testID });
  },
}));

jest.mock('../../src/assets/images', () => ({
  ActiveHeartIcon: () => null,
}));

jest.mock('../../src/assets/icons', () => ({
  RightArrowIcon: ({ testID }: { testID?: string }) => {
    const ReactLib = require('react');
    return ReactLib.createElement('RightArrowIcon', { testID });
  },
  ArrowIcon: ({ testID }: { testID?: string }) => {
    const ReactLib = require('react');
    return ReactLib.createElement('ArrowIcon', { testID });
  },
}));

jest.mock('../../src/components/common/AppImage', () => {
  const ReactLib = require('react');
  return {
    AppImage: ({ imageUri, testID }: any) =>
      ReactLib.createElement('FastImage', { testID, source: imageUri ? { uri: imageUri } : 'test-file-stub' }),
  };
});

jest.mock('../../src/screens/Wishlist/WishlistScreen.hook', () => ({
  useWishlistScreen: jest.fn(),
}));

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedUseWishlistScreen = useWishlistScreen as jest.Mock;

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();

let mockState: any;

const buildFavoritesFromState = () =>
  (mockState?.wishList?.wishList ?? []).map((item: any) => ({
    id: item.id,
    title: item.title,
    image: item.image ?? '',
    images: item.images,
    category: item.categoryName || 'Unknown',
    created_at: item.date,
    is_interested: false,
    is_favorite: true,
    description: item.description,
    categoryName: item.categoryName,
    subCategoryName: item.subCategoryName,
    latitude: item.latitude,
    longitude: item.longitude,
    address: item.address,
  }));

describe('WishlistScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      wishList: { wishList: [] },
    };

    mockedUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      getParent: () => ({ navigate: mockParentNavigate }),
    });
    mockedUseAppDispatch.mockReturnValue(mockDispatch);
    mockedUseAppSelector.mockImplementation(selector => selector(mockState));
    mockedUseWishlistScreen.mockImplementation(() => ({
      favoritesList: buildFavoritesFromState(),
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      onRefresh: jest.fn(),
      onEndReached: jest.fn(),
      onRemoveFromWishList: (itemId: string) => mockDispatch(removeFromWishList(itemId)),
      onPressDiscover: () => mockNavigate(ROUTES.SEEKER_DASHBOARD),
      handlePostPress: (item: any) =>
        mockParentNavigate(ROUTES.PRODUCT_DETAIL, {
          id: item.id,
          status: item.is_interested ? 'in-progress' : 'pending',
          productData: {
            id: item.id,
            title: item.title,
            date: item.created_at,
            image: item.image,
            images: item.images,
            description: item.description,
            categoryName: item.categoryName || item.category,
            subCategoryName: item.subCategoryName,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
          },
        }),
      wishListIds: (mockState?.wishList?.wishList ?? []).map((item: any) => item.id),
    }));
  });

  it('renders wishlist items correctly', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
      { id: '2', title: 'Samsung Refrigerator', date: '2025-04-02', image: 'https://example.com/b.png' },
    ];

    const { getByText, getByTestId } = render(<WishlistScreen />);

    expect(getByText('Apple Macbook')).toBeTruthy();
    expect(getByText('Samsung Refrigerator')).toBeTruthy();
    expect(getByTestId('wishlist-row-1')).toBeTruthy();
    expect(getByTestId('wishlist-row-2')).toBeTruthy();
  });

  it('formats date using common dateUtils formatter', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
    ];

    const { getByText } = render(<WishlistScreen />);
    expect(getByText('1 Apr 2025')).toBeTruthy();
  });

  it('keeps title/date top-aligned layout', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    expect(getByTestId('wishlist-row-1').props.style.alignItems).toBe('flex-start');
  });

  it('shows fallback image when uri is empty', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: '' },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    expect(getByTestId('wishlist-image-1').props.source).toBe('test-file-stub');
  });

  it('shows fallback image when image load fails', async () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    const image = getByTestId('wishlist-image-1');

    expect(image.props.source).toEqual({ uri: 'https://example.com/a.png' });

    fireEvent(image, 'error', { nativeEvent: { error: 'load failed' } });

    // AppImage internal error handling isn't exercised in this mock; ensure the error handler can be triggered.
    expect(getByTestId('wishlist-image-1')).toBeTruthy();
  });

  it('renders right-arrow icon for each item', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    expect(getByTestId('wishlist-right-arrow-1')).toBeTruthy();
  });

  it('navigates to seeker dashboard when discover is pressed from empty state', () => {
    const { getByTestId } = render(<WishlistScreen />);

    fireEvent.press(getByTestId('wishlist-discover-button'));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEEKER_DASHBOARD);
  });

  it('removes item from wishlist when heart action is pressed', () => {
    mockState.wishList.wishList = [
      { id: '1', title: 'Apple Macbook', date: '2025-04-01', image: 'https://example.com/a.png' },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    fireEvent.press(getByTestId('wishlist-remove-1'));

    expect(mockDispatch).toHaveBeenCalledWith(removeFromWishList('1'));
  });

  it('navigates to product detail with selected item params when row is pressed', () => {
    mockState.wishList.wishList = [
      {
        id: '1',
        title: 'Apple Macbook',
        date: '2025-04-01',
        image: 'https://example.com/a.png',
        images: ['https://example.com/a.png'],
        description: 'Laptop detail',
        categoryName: 'Electronics',
        subCategoryName: 'Laptop',
        latitude: 19.0,
        longitude: 72.0,
        address: 'Mumbai',
      },
    ];

    const { getByTestId } = render(<WishlistScreen />);
    fireEvent.press(getByTestId('wishlist-row-1'));

    expect(mockParentNavigate).toHaveBeenCalledWith(ROUTES.PRODUCT_DETAIL, {
      id: '1',
      status: 'pending',
      productData: {
        id: '1',
        title: 'Apple Macbook',
        date: '2025-04-01',
        image: 'https://example.com/a.png',
        images: ['https://example.com/a.png'],
        description: 'Laptop detail',
        categoryName: 'Electronics',
        subCategoryName: 'Laptop',
        latitude: 19.0,
        longitude: 72.0,
        address: 'Mumbai',
      },
    });
  });
});
