import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { postApi, Item, Category } from '../../services/api/postApi';
import { notificationApi } from '../../services/api/notificationApi';
import type { Product } from './types';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSelectedCategory } from '../../store/slices/homeFilterSlice';
import { clearNewPostData } from '../../store/slices/postSlice';

// Configurable banner insertion position
export const CONTRIBUTE_BANNER_START_INDEX = 2;
export const PAGE_LIMIT = 10;

/**
 * useHome Hook
 * Manages home screen state including:
 * - Product list fetching with pagination
 * - Search with debounce
 * - Pull-to-refresh
 * - Banner insertion logic
 * - Navigation callbacks
 */
export const useHome = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const selectedCategory = useAppSelector(
    state => state.homeFilter.selectedCategory,
  );

  // State management
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);
  const lastRequestKeyRef = useRef('');
  const lastPageRequestedRef = useRef(1);
  const lastSearchRef = useRef('');

  /**
   * Fetch items from API with optional search
   */
  const insertBannerAtIndex = useCallback(
    (itemList: Product[], startIndex: number): Product[] => {
      if (startIndex < 0) {
        return itemList;
      }

      if (itemList.length === 0) {
        return [
          {
            id: 'banner-contribute',
            title: t('home.contributeTitle'),
            location_address: '',
            created_at: new Date().toISOString(),
            is_featured: false,
            type: 'banner',
          } as Product,
        ];
      }

      if (itemList.length <= startIndex) return itemList;

      const result = [...itemList];
      result.splice(startIndex, 0, {
        id: 'banner-contribute',
        title: t('home.contributeTitle'),
        location_address: '',
        created_at: new Date().toISOString(),
        is_featured: false,
        type: 'banner',
      } as Product);
      result.splice(startIndex + 1, 0, {
        id: 'banner-spacer',
        title: '',
        location_address: '',
        created_at: '',
        is_featured: false,
        type: 'spacer',
      } as Product);
      return result;
    },
    [t],
  );

  const fetchItems = useCallback(
    async (pageNum: number = 1, search?: string) => {
      const requestKey = `${pageNum}:${search ?? ''}`;

      if (!hasMore && pageNum > 1) return;
      if (isFetchingRef.current && lastRequestKeyRef.current === requestKey) {
        return;
      }

      try {
        isFetchingRef.current = true;
        lastRequestKeyRef.current = requestKey;
        setLoading(true);
        setError(null);

        const response = await postApi.getItems(
          pageNum,
          PAGE_LIMIT,
          search,
          selectedCategory?.id,
        );
        const newItems = response.items.map((item: Item) => ({
          ...item,
          type: 'item' as const,
        }));

        if (pageNum === 1) {
          const itemsWithBanner = insertBannerAtIndex(
            newItems,
            CONTRIBUTE_BANNER_START_INDEX,
          );
          setItems(itemsWithBanner);
        } else {
          setItems(prevItems => [...prevItems, ...newItems]);
        }

        // Check if there are more items to load
        const pagination = get(response, 'pagination', {});
        const totalPages =
          get(pagination, 'totalPages', 0) ||
          Math.ceil(
            get(pagination, 'total', 0) / get(pagination, 'limit', PAGE_LIMIT),
          );
        setHasMore(pageNum < totalPages);
        setPage(pageNum);
        if (pageNum === 1) {
          lastPageRequestedRef.current = 1;
          lastSearchRef.current = search ?? '';
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(t('home.failedToLoadItems'));
        // On first load error, show empty state
        if (pageNum === 1) {
          setItems([]);
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [insertBannerAtIndex, selectedCategory?.id, t],
  );

  /**
   * Handle search with debounce
   */
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        const trimmedQuery = query.trim();
        const shouldSearch = trimmedQuery.length >= 3;
        const shouldReset = trimmedQuery.length === 0;

        if (!shouldSearch && !shouldReset) return;

        setPage(1);
        setHasMore(true);
        lastPageRequestedRef.current = 1;
        lastSearchRef.current = shouldSearch ? trimmedQuery : '';
        fetchItems(1, shouldSearch ? trimmedQuery : '');
      }, 500),
    [fetchItems],
  );

  const onSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      debouncedSearch(text);
    },
    [debouncedSearch],
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
      setUnreadCount(0);
    }
  }, []);

  /**
   * Handle refresh (pull-to-refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchItems(1, searchText), fetchUnreadCount()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchItems, fetchUnreadCount, searchText]);

  /**
   * Handle end of list (pagination)
   */
  const onEndReached = useCallback(() => {
    const nextPage = page + 1;
    const currentSearch = searchText ?? '';

    if (loading || !hasMore || isFetchingRef.current) return;
    if (
      lastPageRequestedRef.current >= nextPage &&
      lastSearchRef.current === currentSearch
    ) {
      return;
    }
    lastPageRequestedRef.current = nextPage;
    lastSearchRef.current = currentSearch;
    fetchItems(nextPage, currentSearch);
  }, [loading, hasMore, page, searchText, fetchItems]);

  /**
   * Handle notification press
   */
  const onNotificationPress = useCallback(() => {
    try {
      const parentNavigation = navigation.getParent?.();
      if (parentNavigation) {
        parentNavigation.navigate(ROUTES.NOTIFICATIONS as never);
        return;
      }
      navigation.navigate(ROUTES.NOTIFICATIONS as never);
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }, [navigation]);

  /**
   * Handle search bar press (navigate to search screen)
   */
  const onSearchPress = useCallback(() => {
    try {
      navigation.navigate(ROUTES.SEARCH as never);
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }, [navigation]);

  /**
   * Load categories for filter bottom sheet
   */
  const fetchCategories = useCallback(
    async (forceReload: boolean = false) => {
      if (isCategoryLoading) {
        return;
      }

      if (!forceReload && categories.length > 0) {
        return;
      }

      try {
        setIsCategoryLoading(true);
        setCategoryError(null);
        const response = await postApi.getCategories();
        setCategories(response);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError(t('home.filterLoadFailed'));
      } finally {
        setIsCategoryLoading(false);
      }
    },
    [categories.length, isCategoryLoading, t],
  );

  /**
   * Handle filter press
   */
  const onFilterPress = useCallback(() => {
    setIsFilterSheetVisible(true);
    if (!isCategoryLoading && categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories, isCategoryLoading]);

  const onCloseFilterSheet = useCallback(() => {
    setIsFilterSheetVisible(false);
  }, []);

  const onSelectCategory = useCallback(
    (category: Category) => {
      dispatch(setSelectedCategory(category));
      setIsFilterSheetVisible(false);
    },
    [dispatch],
  );

  /**
   * Handle product card press
   */
  const onItemPress = useCallback(
    (item: Product) => {
      if (item.type === 'banner') {
        // Navigate to contribute screen
        try {
          dispatch(clearNewPostData());
          navigation.navigate(ROUTES.SELECT_CATEGORY as never);
        } catch (err) {
          console.error('Navigation error:', err);
        }
        return;
      }

      // Navigate to item detail
      try {
        (navigation as any).navigate(ROUTES.ITEM_DETAIL, { id: item.id });
      } catch (err) {
        console.error('Navigation error:', err);
      }
    },
    [dispatch, navigation],
  );

  /**
   * Initial load on mount
   */
  useEffect(() => {
    fetchItems(1);
  }, [selectedCategory?.id, fetchItems]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount]),
  );

  return {
    items,
    categories,
    selectedCategory,
    isCategoryLoading,
    categoryError,
    isFilterSheetVisible,
    loading,
    refreshing,
    page,
    hasMore,
    searchText,
    error,
    unreadCount,
    onSearch,
    onRefresh,
    onEndReached,
    onNotificationPress,
    onSearchPress,
    onFilterPress,
    onCloseFilterSheet,
    onSelectCategory,
    onItemPress,
    fetchItems,
    fetchCategories,
  };
};
