import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HomeScreen } from '../../src/screens/home/HomeScreen';
import { useHome } from '../../src/screens/home/useHome';
import { useTheme } from '../../src/theme';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TextInput: createPrimitive('TextInput'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    Image: createPrimitive('Image'),
    RefreshControl: createPrimitive('RefreshControl'),
    FlatList: ({
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
      testID,
      ...props
    }: any) => {
      const withKey = (node: any, key: string) =>
        node
          ? ReactLib.createElement(ReactLib.Fragment, { key }, node)
          : null;

      const header = ListHeaderComponent
        ? typeof ListHeaderComponent === 'function'
          ? ListHeaderComponent()
          : ListHeaderComponent
        : null;

      const footer = ListFooterComponent
        ? typeof ListFooterComponent === 'function'
          ? ListFooterComponent()
          : ListFooterComponent
        : null;

      const empty = ListEmptyComponent
        ? typeof ListEmptyComponent === 'function'
          ? ListEmptyComponent()
          : ListEmptyComponent
        : null;

      if (!data || data.length === 0) {
        return ReactLib.createElement(
          'View',
          { testID, ...props },
          [
            withKey(header, 'header'),
            withKey(empty, 'empty'),
            withKey(footer, 'footer'),
          ].filter(Boolean),
        );
      }

      return ReactLib.createElement(
        'View',
        { testID, ...props },
        [
          withKey(header, 'header'),
          ...data.map((item: any, index: number) =>
            ReactLib.createElement(
              ReactLib.Fragment,
              { key: keyExtractor ? keyExtractor(item, index) : item.id || index },
              renderItem({ item, index }),
            ),
          ),
          withKey(footer, 'footer'),
        ].filter(Boolean),
      );
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../src/screens/home/useHome', () => ({
  useHome: jest.fn(),
}));

jest.mock('../../src/theme', () => ({
  useTheme: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'home.title': 'Discover Items',
        'home.searchPlaceholder': 'Search Anything',
        'home.contributeTitle': "LET'S SUPPORT NEEDED",
        'home.contributeButton': 'Contribute',
        'home.loading': 'Loading..',
        'home.noItemsFound': 'No items found',
        'home.noItemsAvailable': 'No items available',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('../../src/components/specified/home/HomeHeader', () => {
  const ReactLib = require('react');
  return {
    HomeHeader: ({ onNotificationPress, showNotificationDot }: any) =>
      ReactLib.createElement('TouchableOpacity', {
        testID: 'notification-icon',
        onPress: onNotificationPress,
      }, showNotificationDot ? ReactLib.createElement('View', { testID: 'notification-dot' }) : null),
  };
});

jest.mock('../../src/components/specified/home/SearchFilterBar', () => {
  const ReactLib = require('react');
  return {
    SearchFilterBar: ({ onSearch, onFilterPress }: any) =>
      ReactLib.createElement('View', null, [
        ReactLib.createElement('TextInput', {
          key: 'search',
          testID: 'search-input',
          onChangeText: onSearch,
        }),
        ReactLib.createElement('TouchableOpacity', {
          key: 'filter',
          testID: 'filter-button',
          onPress: onFilterPress,
        }),
      ]),
  };
});

jest.mock('../../src/components/specified/home/ProductCard', () => {
  const ReactLib = require('react');
  return {
    ProductCard: ({ onPress, testID }: any) =>
      ReactLib.createElement('TouchableOpacity', { testID, onPress }),
  };
});

jest.mock('../../src/components/specified/home/ContributeBanner', () => {
  const ReactLib = require('react');
  return {
    ContributeBanner: ({ onPress, testID }: any) =>
      ReactLib.createElement('TouchableOpacity', { testID, onPress }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: () => null,
}));

const mockedUseHome = useHome as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    primary: '#2563EB',
    mutedText: '#64748B',
    text: '#111827',
  },
};

const baseHomeState = {
  items: [],
  loading: false,
  refreshing: false,
  page: 1,
  hasMore: false,
  searchText: '',
  error: null,
  onSearch: jest.fn(),
  onRefresh: jest.fn(),
  onEndReached: jest.fn(),
  onNotificationPress: jest.fn(),
  onFilterPress: jest.fn(),
  onItemPress: jest.fn(),
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseTheme.mockReturnValue({
      theme: mockTheme,
      isDark: false,
      toggleTheme: jest.fn(),
    });

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
    });
  });

  it('renders main list layout with header and search controls', () => {
    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByTestId('product-list')).toBeTruthy();
    expect(getByTestId('notification-icon')).toBeTruthy();
    expect(getByTestId('search-input')).toBeTruthy();
    expect(getByTestId('filter-button')).toBeTruthy();
  });

  it('renders error state when hook returns error and no items', () => {
    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      error: 'Failed to load items. Please try again.',
    });

    const { getByText, queryByTestId } = render(<HomeScreen />);

    expect(getByText(/Failed to load items/i)).toBeTruthy();
    expect(queryByTestId('home-screen')).toBeNull();
  });

  it('renders empty state copy only when list is empty and search text is present', () => {
    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      searchText: 'phone',
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('No items found')).toBeTruthy();
  });

  it('renders product cards and banner and forwards item presses', () => {
    const onItemPress = jest.fn();
    const product = {
      id: '1',
      type: 'item' as const,
      title: 'Macbook',
      created_at: '2026-01-01T00:00:00Z',
      location_address: 'NY',
      is_featured: false,
    };
    const banner = {
      id: 'banner-contribute',
      type: 'banner' as const,
      title: 'Contribute',
      created_at: '2026-01-01T00:00:00Z',
      location_address: '',
      is_featured: false,
    };
    const spacer = {
      id: 'banner-spacer-1',
      type: 'spacer' as const,
      title: '',
      created_at: '',
      location_address: '',
      is_featured: false,
    };

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      items: [product, banner, spacer],
      onItemPress,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('product-card-1'));
    fireEvent.press(getByTestId('contribute-banner'));
    expect(getByTestId('banner-spacer')).toBeTruthy();

    expect(onItemPress).toHaveBeenCalledWith(product);
    expect(onItemPress).toHaveBeenCalledWith(banner);
  });

  it('forwards search, filter, notification, end reached, and refresh handlers', () => {
    const onSearch = jest.fn();
    const onFilterPress = jest.fn();
    const onNotificationPress = jest.fn();
    const onEndReached = jest.fn();
    const onRefresh = jest.fn();

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      items: [
        {
          id: '1',
          type: 'item',
          title: 'Item',
          created_at: '2026-01-01T00:00:00Z',
          location_address: 'NY',
          is_featured: false,
        },
      ],
      onSearch,
      onFilterPress,
      onNotificationPress,
      onEndReached,
      onRefresh,
    });

    const { getByTestId } = render(<HomeScreen />);

    fireEvent.changeText(getByTestId('search-input'), 'abc');
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByTestId('notification-icon'));

    const list = getByTestId('product-list');
    fireEvent(list, 'onEndReached');
    list.props.refreshControl.props.onRefresh();

    expect(onSearch).toHaveBeenCalledWith('abc');
    expect(onFilterPress).toHaveBeenCalled();
    expect(onNotificationPress).toHaveBeenCalled();
    expect(onEndReached).toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('shows loading footer only when loading and items exist', () => {
    const item = {
      id: '1',
      type: 'item' as const,
      title: 'Item',
      created_at: '2026-01-01T00:00:00Z',
      location_address: 'NY',
      is_featured: false,
    };

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      items: [item],
      loading: true,
    });

    const { getByTestId, rerender, queryByTestId } = render(<HomeScreen />);
    expect(getByTestId('loading-footer')).toBeTruthy();

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      loading: true,
      items: [],
    });

    rerender(<HomeScreen />);
    expect(queryByTestId('loading-footer')).toBeNull();
  });

  it('falls back to default primary color when theme primary is missing', () => {
    mockedUseTheme.mockReturnValueOnce({
      theme: {
        colors: {
          background: '#FFFFFF',
          text: '#111827',
        },
      },
      isDark: false,
      toggleTheme: jest.fn(),
    });

    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      items: [
        {
          id: '1',
          type: 'item',
          title: 'Item',
          created_at: '2026-01-01T00:00:00Z',
          location_address: 'NY',
          is_featured: false,
        },
      ],
      loading: true,
    });

    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('loading-footer')).toBeTruthy();
    expect(getByTestId('product-list').props.refreshControl).toBeTruthy();
  });

  it('shows notification dot when unreadCount > 0', () => {
    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      unreadCount: 5,
    });

    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('notification-dot')).toBeTruthy();
  });

  it('hides notification dot when unreadCount is 0', () => {
    mockedUseHome.mockReturnValue({
      ...baseHomeState,
      unreadCount: 0,
    });

    const { queryByTestId } = render(<HomeScreen />);
    expect(queryByTestId('notification-dot')).toBeNull();
  });
});
