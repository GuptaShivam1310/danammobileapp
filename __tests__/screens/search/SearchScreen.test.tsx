import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../../../src/screens/search/SearchScreen';
import { useTheme } from '../../../src/theme';
import { searchApi } from '../../../src/services/api/searchApi';
import { useAppDispatch, useAppSelector } from '../../../src/store';

jest.useFakeTimers();
const mockGoBack = jest.fn();

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
    FlatList: ({
      data,
      renderItem,
      keyExtractor,
      ItemSeparatorComponent,
      testID,
      ...props
    }: any) => {
      const items = data || [];
      return ReactLib.createElement(
        'View',
        { testID, ...props },
        items.flatMap((item: any, index: number) => {
          const rendered = renderItem({ item, index });
          const key = keyExtractor ? keyExtractor(item, index) : item.id || index;
          const separator =
            ItemSeparatorComponent && index < items.length - 1
              ? ReactLib.createElement(ItemSeparatorComponent, { key: `${key}-sep` })
              : null;
          return [
            ReactLib.createElement(ReactLib.Fragment, { key }, rendered),
            separator,
          ].filter(Boolean);
        }),
      );
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  return { SafeAreaView: ({ children }: any) => ReactLib.createElement('View', null, children) };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../../src/components/common/SvgIcon', () => {
  const ReactLib = require('react');
  return {
    SvgIcon: (props: any) => ReactLib.createElement('SvgIcon', props),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (key === 'search.recentTitle') return 'Recent Searches';
      if (key === 'search.noResults') return 'No results found';
      if (key === 'home.searchPlaceholder') return 'Search Anything';
      if (key === 'search.resultsFor') {
        return `Search result for “${params?.query ?? ''}”`;
      }
      return key;
    },
  }),
}));

jest.mock('../../../src/services/api/searchApi', () => ({
  searchApi: {
    getSuggestions: jest.fn(),
    searchItems: jest.fn(),
  },
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedSearchApi = searchApi as jest.Mocked<typeof searchApi>;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;

const mockDispatch = jest.fn();

const renderWithState = (recentSearches: string[] = []) => {
  mockedUseAppDispatch.mockReturnValue(mockDispatch);
  mockedUseAppSelector.mockImplementation((selector: any) =>
    selector({
      search: {
        recentSearches,
      },
    }),
  );

  return render(<SearchScreen />);
};

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAppDispatch.mockReturnValue(mockDispatch);
    mockedUseAppSelector.mockImplementation((selector: any) =>
      selector({ search: { recentSearches: [] } }),
    );
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          background: '#ffffff',
          surface: '#ffffff',
          text: '#111111',
          primary: '#2563EB',
          border: '#E2E8F0',
          seekerGreen: '#0E6953',
        },
      },
    });
  });

  it('goes back on back button press', () => {
    const { getByTestId } = renderWithState();

    fireEvent.press(getByTestId('search-back-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders recent searches when query is empty', () => {
    const { getByText } = renderWithState(['Air Conditioner', 'Blender']);

    expect(getByText('Recent Searches')).toBeTruthy();
    expect(getByText('Air Conditioner')).toBeTruthy();
    expect(getByText('Blender')).toBeTruthy();
  });

  it('keeps grey border on open and sets input autofocus', () => {
    const { getByTestId } = renderWithState();

    expect(getByTestId('search-input').props.autoFocus).toBe(true);
    expect(getByTestId('search-input-wrapper').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#E2E8F0' })]),
    );
  });

  it('fetches suggestions when typing', async () => {
    mockedSearchApi.getSuggestions.mockResolvedValueOnce({
      suggestions: ['iPhone 11', 'iPhone 12'],
      trending: [],
    });

    const { getByTestId, getByText } = renderWithState();

    fireEvent.changeText(getByTestId('search-input'), 'iphone');

    expect(getByTestId('search-input-wrapper').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#0E6953' })]),
    );

    await waitFor(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(getByText('iPhone 11')).toBeTruthy();
      expect(getByText('iPhone 12')).toBeTruthy();
    });
  });

  it('shows empty suggestion list when suggestions API fails', async () => {
    mockedSearchApi.getSuggestions.mockRejectedValueOnce(new Error('network-error'));

    const { getByTestId, queryByText } = renderWithState();

    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    await waitFor(() => {
      jest.runAllTimers();
    });

    expect(getByTestId('suggestions-list')).toBeTruthy();
    expect(queryByText('iPhone 11')).toBeNull();
  });

  it('shows results when suggestion is selected', async () => {
    mockedSearchApi.getSuggestions.mockResolvedValueOnce({
      suggestions: ['iPhone 11'],
      trending: [],
    });
    mockedSearchApi.searchItems.mockResolvedValueOnce({
      items: [
        {
          id: '1',
          title: 'Apple iPhone 11 Black 64 GB',
          description: '',
          category_id: '',
          price: 0,
          location_address: '',
          latitude: null,
          longitude: null,
          posted_by: '',
          is_featured: false,
          created_at: '2026-02-26T07:07:33.186642+00:00',
          updated_at: '2026-02-26T07:07:33.186642+00:00',
          deleted_at: null,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1 },
    });

    const { getByTestId, getByText } = renderWithState();

    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    await waitFor(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(getByText('iPhone 11')).toBeTruthy();
    });

    fireEvent.press(getByText('iPhone 11'));

    await waitFor(() => {
      expect(getByText('Search result for “iPhone 11”')).toBeTruthy();
    });
  });

  it('runs search from recent item press and renders empty result state', async () => {
    mockedSearchApi.searchItems.mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, limit: 10, total: 0 },
    });

    const { getByText } = renderWithState(['Air Conditioner']);
    fireEvent.press(getByText('Air Conditioner'));

    await waitFor(() => {
      expect(getByText('Search result for “Air Conditioner”')).toBeTruthy();
    });
    expect(getByText('No results found')).toBeTruthy();
  });

  it('does not run search on submit when query is empty', () => {
    const { getByTestId } = renderWithState();

    fireEvent(getByTestId('search-input'), 'onSubmitEditing');
    expect(mockedSearchApi.searchItems).not.toHaveBeenCalled();
  });

  it('handles results API error and keeps results title', async () => {
    mockedSearchApi.searchItems.mockRejectedValueOnce(new Error('search-failed'));

    const { getByTestId, getByText } = renderWithState();
    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    fireEvent(getByTestId('search-input'), 'onSubmitEditing');

    await waitFor(() => {
      expect(getByText('Search result for “iphone”')).toBeTruthy();
    });
    expect(getByText('No results found')).toBeTruthy();
  });

  it('clears search text and state on close icon press', async () => {
    mockedSearchApi.getSuggestions.mockResolvedValueOnce({
      suggestions: ['iPhone 11'],
      trending: [],
    });

    const { getByTestId, queryByText } = renderWithState(['Air Conditioner']);

    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    await waitFor(() => {
      jest.runAllTimers();
    });

    fireEvent.press(getByTestId('search-clear-button'));

    await waitFor(() => {
      expect(getByTestId('search-input').props.value).toBe('');
    });

    expect(queryByText('iPhone 11')).toBeNull();
  });

  it('loads more results on end reached', async () => {
    mockedSearchApi.searchItems
      .mockResolvedValueOnce({
        items: [{ id: '1', title: 'iPhone 11', created_at: '2026-03-09T05:53:40.536Z' } as any],
        pagination: { page: 1, limit: 1, total: 2 },
      })
      .mockResolvedValueOnce({
        items: [{ id: '2', title: 'iPhone 12', created_at: '2026-03-09T05:53:40.536Z' } as any],
        pagination: { page: 2, limit: 1, total: 2 },
      });

    const { getByTestId, getByText } = renderWithState();

    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    fireEvent(getByTestId('search-input'), 'onSubmitEditing');

    await waitFor(() => {
      expect(getByText('iPhone 11')).toBeTruthy();
    });

    const list = getByTestId('results-list');
    
    await act(async () => {
      list.props.onEndReached();
    });

    await waitFor(() => {
      expect(getByText('iPhone 12')).toBeTruthy();
    });

    expect(mockedSearchApi.searchItems).toHaveBeenCalledTimes(2);
  });
});
