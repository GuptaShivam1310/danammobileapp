import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ItemDetailScreen } from '../../src/screens/ItemDetail/ItemDetailScreen';

const mockHandleBack = jest.fn();
const mockHandleShare = jest.fn();
const mockOnImageScroll = jest.fn();
const mockRetry = jest.fn();

let mockIsLoading = false;
let mockError: string | null = null;
let mockCurrentImageIndex = 0;
const baseItemDetail = {
  id: 'item-1',
  title: 'Apple MacBook Air M2',
  description: 'Lightly used, excellent condition',
  categoryName: 'Cars',
  date: '26 Feb 2026',
  images: ['https://image-1', 'https://image-2'],
  locationAddress: 'Downtown',
  latitude: 12.9716,
  longitude: 77.5946,
  postedByName: 'John Doe',
  postedByAvatar: 'https://avatar',
  isFeatured: true,
};
let mockItemDetail: any = { ...baseItemDetail };

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ScrollView: createPrimitive('ScrollView'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    FlatList: ({ data = [], renderItem, onScroll, ...props }: any) =>
      ReactLib.createElement(
        'View',
        { ...props, onScroll },
        data.map((item: any, index: number) =>
          ReactLib.createElement(
            ReactLib.Fragment,
            { key: index },
            renderItem({ item, index }),
          ),
        ),
      ),
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-maps', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const MapView = ({ children, ...props }: any) =>
    ReactLib.createElement(View, { ...props, testID: 'item-map' }, children);
  const Marker = (props: any) =>
    ReactLib.createElement(View, { ...props, testID: 'item-marker' });
  return {
    __esModule: true,
    default: MapView,
    Marker,
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      ReactLib.createElement(View, props, children),
  };
});

jest.mock('../../src/components/common/AppImage', () => ({
  AppImage: (props: any) => {
    const ReactLib = require('react');
    const { View } = require('react-native');
    return ReactLib.createElement(View, { ...props, testID: 'item-app-image' });
  },
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children, ...props }: any) => {
    const ReactLib = require('react');
    const { View } = require('react-native');
    return ReactLib.createElement(View, props, children);
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ReactLib.createElement(
      TouchableOpacity,
      { onPress, testID: 'item-retry-button' },
      ReactLib.createElement(Text, null, title),
    );
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'itemDetail.location': 'Location',
        'itemDetail.postedBy': 'Posted By',
        'itemDetail.itemsContributed': '100+ Items Contributed',
        'itemDetail.errors.retry': 'Retry',
        'itemDetail.errors.empty': 'Item details could not be loaded.',
        'productDetail.contributor.nameFallback': 'xxxxxxxx xxxxxx',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('../../src/screens/ItemDetail/useItemDetail', () => ({
  useItemDetail: () => ({
    itemDetail: mockItemDetail,
    isLoading: mockIsLoading,
    error: mockError,
    currentImageIndex: mockCurrentImageIndex,
    handleBack: mockHandleBack,
    handleShare: mockHandleShare,
    onImageScroll: mockOnImageScroll,
    retry: mockRetry,
  }),
}));

describe('ItemDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockCurrentImageIndex = 0;
    mockItemDetail = {
      ...baseItemDetail,
      images: [...baseItemDetail.images],
    };
  });

  it('renders loading state', () => {
    mockIsLoading = true;
    mockItemDetail = null;

    const { getByTestId } = render(<ItemDetailScreen />);

    expect(getByTestId('item-detail-back')).toBeTruthy();
  });

  it('renders error state and retries', () => {
    mockItemDetail = null;
    mockError = 'Failed to fetch item details';

    const { getByTestId, getByText } = render(<ItemDetailScreen />);

    expect(getByText('Failed to fetch item details')).toBeTruthy();

    fireEvent.press(getByTestId('item-retry-button'));
    expect(mockRetry).toHaveBeenCalled();
  });

  it('renders item details and handles header actions', () => {
    const { getByTestId, getByText } = render(<ItemDetailScreen />);

    expect(getByText('Apple MacBook Air M2')).toBeTruthy();
    expect(getByText('Cars')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Posted By')).toBeTruthy();
    expect(getByTestId('item-map')).toBeTruthy();
    expect(getByText('1/2')).toBeTruthy();

    fireEvent.press(getByTestId('item-detail-back'));
    fireEvent.press(getByTestId('item-detail-share'));

    expect(mockHandleBack).toHaveBeenCalled();
    expect(mockHandleShare).toHaveBeenCalled();
  });

  it('renders fallback posted by name when missing', () => {
    mockItemDetail = {
      ...mockItemDetail,
      postedByName: '',
      postedByAvatar: null,
    };

    const { getByText } = render(<ItemDetailScreen />);

    expect(getByText('xxxxxxxx xxxxxx')).toBeTruthy();
  });

  it('renders location placeholder when coordinates are missing', () => {
    mockItemDetail = {
      ...mockItemDetail,
      latitude: null,
      longitude: null,
      images: [],
      locationAddress: 'Downtown',
    };

    const { getByText } = render(<ItemDetailScreen />);

    expect(getByText('Downtown')).toBeTruthy();
  });

  it('hides optional meta and description blocks when data is missing', () => {
    mockItemDetail = {
      ...baseItemDetail,
      categoryName: '',
      date: '',
      description: '',
      images: [],
      latitude: null,
      longitude: null,
      locationAddress: '',
    };

    const { queryByText } = render(<ItemDetailScreen />);

    expect(queryByText('Cars')).toBeNull();
    expect(queryByText('26 Feb 2026')).toBeNull();
    expect(queryByText('Lightly used, excellent condition')).toBeNull();
    expect(queryByText('1/2')).toBeNull();
  });
});
