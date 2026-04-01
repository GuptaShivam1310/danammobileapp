import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';

jest.setTimeout(20000);

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../src/services/api/notificationApi', () => ({
  notificationApi: {
    getUnreadCount: jest.fn(),
  },
}));

jest.mock('../../src/services/api/postApi', () => ({
  postApi: {
    getItems: jest.fn(),
    getCategories: jest.fn(),
  },
}));

jest.mock('react-i18next', () => {
  const map: Record<string, string> = {
    'home.contributeTitle': "LET'S SUPPORT NEEDED",
    'home.failedToLoadItems': 'Failed to load items. Please try again.',
    'home.filterLoadFailed': 'Failed to load categories. Please try again.',
  };
  const t = (key: string) => map[key] || key;

  return {
    useTranslation: () => ({ t }),
    initReactI18next: {
      type: '3rdParty',
      init: jest.fn(),
    },
  };
});

const { useHome, PAGE_LIMIT } = require('../../src/screens/home/useHome');
const { postApi } = require('../../src/services/api/postApi');
const { notificationApi } = require('../../src/services/api/notificationApi');
const storeHooks = require('../../src/store');

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
let focusEffectHasRun = false;

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedUseFocusEffect = useFocusEffect as jest.Mock;

const getItemsMock = () =>
  postApi.getItems as jest.MockedFunction<typeof postApi.getItems>;

const getCategoriesMock = () =>
  postApi.getCategories as jest.MockedFunction<typeof postApi.getCategories>;

const getUnreadCountMock = () =>
  notificationApi.getUnreadCount as jest.MockedFunction<
    typeof notificationApi.getUnreadCount
  >;

const mockedUseAppDispatch = storeHooks.useAppDispatch as jest.Mock;
const mockedUseAppSelector = storeHooks.useAppSelector as jest.Mock;

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const makeItem = (id: string) => ({
  id,
  title: `title-${id}`,
  location_address: `loc-${id}`,
  created_at: '2026-01-01T00:00:00Z',
  is_featured: false,
});

const makeResponse = (
  items: any[],
  page = 1,
  totalPages = 1,
  total = items.length,
  limit = 10,
) => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages,
  },
  success: true,
});

const renderAndWaitForInitialLoad = async () => {
  const hook = renderHook(() => useHome());

  await act(async () => {
    await flushPromises();
  });

  await waitFor(() => {
    expect(getItemsMock()).toHaveBeenCalled();
  });

  return hook;
};

describe('useHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusEffectHasRun = false;

    mockedUseNavigation.mockReturnValue({ navigate: mockNavigate });

    mockedUseFocusEffect.mockImplementation((callback: any) => {
      if (!focusEffectHasRun) {
        focusEffectHasRun = true;
        callback();
      }
    });

    mockedUseAppDispatch.mockReturnValue(mockDispatch);

    mockedUseAppSelector.mockImplementation((selector: any) =>
      selector({ homeFilter: { selectedCategory: null } }),
    );

    getItemsMock().mockResolvedValue(makeResponse([]));
    getCategoriesMock().mockResolvedValue([]);
    getUnreadCountMock().mockResolvedValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads page 1 on mount and inserts banner', async () => {
    getItemsMock().mockResolvedValueOnce(
      makeResponse([makeItem('1'), makeItem('2'), makeItem('3')], 1, 2),
    );

    const { result } = await renderAndWaitForInitialLoad();

    expect(
      result.current.items.find((i: any) => i.type === 'banner'),
    ).toBeTruthy();

    expect(result.current.hasMore).toBe(true);
  });

  it('sets unreadCount from API', async () => {
    getUnreadCountMock().mockResolvedValueOnce(5);

    const { result } = await renderAndWaitForInitialLoad();

    await waitFor(() => {
      expect(getUnreadCountMock()).toHaveBeenCalled();
    });

    expect(result.current.unreadCount).toBe(5);
  });

  it('handles unread API failure', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    getUnreadCountMock().mockRejectedValueOnce(new Error('fail'));

    const { result } = await renderAndWaitForInitialLoad();

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });

    consoleSpy.mockRestore();
  });

  it('pagination appends items', async () => {
    getItemsMock()
      .mockResolvedValueOnce(makeResponse([makeItem('1'), makeItem('2')], 1, 2))
      .mockResolvedValueOnce(makeResponse([makeItem('3')], 2, 2));

    const { result } = await renderAndWaitForInitialLoad();

    await act(async () => {
      await result.current.fetchItems(2);
      await flushPromises();
    });

    expect(result.current.page).toBe(2);
  });

  it('search debounce works', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useHome());

    await act(async () => {
      await Promise.resolve();
    });

    expect(getItemsMock()).toHaveBeenCalled();

    act(() => {
      result.current.onSearch('dan');
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(getItemsMock()).toHaveBeenCalledWith(
      1,
      PAGE_LIMIT,
      'dan',
      undefined,
    );
  });

  it('refresh resets refreshing flag', async () => {
    const { result } = await renderAndWaitForInitialLoad();

    await act(async () => {
      result.current.onRefresh();
      await flushPromises();
    });

    expect(result.current.refreshing).toBe(false);
  });

  it('onEndReached loads next page', async () => {
    getItemsMock()
      .mockResolvedValueOnce(makeResponse([makeItem('1')], 1, 2))
      .mockResolvedValueOnce(makeResponse([makeItem('2')], 2, 2));

    const { result } = await renderAndWaitForInitialLoad();

    await act(async () => {
      result.current.onEndReached();
      await flushPromises();
    });

    expect(getItemsMock()).toHaveBeenCalledWith(2, PAGE_LIMIT, '', undefined);
  });

  it('navigation callbacks work', async () => {
    const { result } = await renderAndWaitForInitialLoad();

    act(() => {
      result.current.onNotificationPress();
      result.current.onSearchPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NOTIFICATIONS);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH);
  });

  it('opens filter sheet and loads categories', async () => {
    const categories = [{ id: '1', name: 'Electronics' }];
    getCategoriesMock().mockResolvedValueOnce(categories);

    const { result } = await renderAndWaitForInitialLoad();

    act(() => {
      result.current.onFilterPress();
    });

    await waitFor(() => {
      expect(result.current.isFilterSheetVisible).toBe(true);
    });

    expect(getCategoriesMock()).toHaveBeenCalled();
  });

  it('onCloseFilterSheet sets visibility to false', async () => {
    const { result } = await renderAndWaitForInitialLoad();

    act(() => {
      result.current.onFilterPress();
    });

    await waitFor(() => {
      expect(result.current.isFilterSheetVisible).toBe(true);
    });

    act(() => {
      result.current.onCloseFilterSheet();
    });

    expect(result.current.isFilterSheetVisible).toBe(false);
  });

  it('handles fetchCategories failure', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    getCategoriesMock().mockRejectedValueOnce(new Error('fail'));

    const { result } = await renderAndWaitForInitialLoad();

    await act(async () => {
      await result.current.fetchCategories(true);
      await flushPromises();
    });

    expect(result.current.categoryError).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
