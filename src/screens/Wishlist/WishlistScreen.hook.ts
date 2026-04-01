import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { SeekerBottomTabParamList, SeekerLandingParamList } from '../../models/navigation';
import { addToWishList, removeFromWishList, selectWishListIds } from '../../store/slices/wishListSlice';
import { postApi } from '../../services/api/postApi';
import { useAppDispatch, useAppSelector } from '../../store';

type WishlistNavigationProp = BottomTabNavigationProp<
  SeekerBottomTabParamList,
  typeof ROUTES.WISHLIST
>;

type SeekerStackNavigationProp = NativeStackNavigationProp<SeekerLandingParamList>;

export interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  category: string;
  created_at: string;
  is_interested: boolean;
  is_favorite: boolean;
  // Metadata for ProductDetail
  description?: string;
  categoryName?: string;
  subCategoryName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

const LIMIT = 10;

export function useWishlistScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<WishlistNavigationProp>();
  const { t } = useTranslation();
  const wishListIds = useAppSelector(selectWishListIds);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const loadFavorites = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (pageNum > 1 && !hasMoreData) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await postApi.getFavoriteContributions(
        { page: pageNum, limit: LIMIT },
        abortControllerRef.current.signal,
      );

      if (response.success) {
        const newItems = get(response, 'data.items', []);
        const total = get(response, 'data.total', 0);

        setHasMoreData(favoritesList.length + newItems.length < total);

        setFavoritesList(prev => {
          const filteredPrev = pageNum === 1 ? [] : prev;
          const existingIds = new Set(filteredPrev.map(item => item.id));
          const uniqueItems = newItems.filter((item: any) => !existingIds.has(item.id));
          return [...filteredPrev, ...uniqueItems];
        });

        // Sync with Redux
        newItems.forEach((item: any) => {
          const itemId = item.id;
          if (!wishListIds.includes(itemId)) {
            dispatch(addToWishList({
              id: item.id,
              title: item.title,
              date: item.created_at || item.date || '',
              image: item.image,
            }));
          }
        });
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      const fallbackMessage = t('errors.genericTryAgain');
      const errorMessage = typeof err === 'string'
        ? err
        : get(err, 'response.data.message', get(err, 'message', fallbackMessage));

      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: errorMessage || fallbackMessage,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [hasMoreData, t, favoritesList.length, wishListIds, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites(1);
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [loadFavorites]),
  );

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    loadFavorites(1, true);
  }, [loadFavorites]);

  const onEndReached = useCallback(() => {
    if (isLoadingMore || !hasMoreData || isLoading || isRefreshing) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadFavorites(nextPage);
  }, [hasMoreData, isLoading, isLoadingMore, isRefreshing, loadFavorites, page]);

  const onPressDiscover = useCallback(() => {
    navigation.navigate(ROUTES.SEEKER_DASHBOARD);
  }, [navigation]);

  const onRemoveFromWishList = useCallback(async (itemId: string) => {
    // Optimistic update
    setFavoritesList(prev => prev.filter(item => item.id !== itemId));
    dispatch(removeFromWishList(itemId));

    try {
      await postApi.removeContributionFromFavorite(itemId);
    } catch (err: any) {
      // Revert if API fails (optional, but keep it simple as per other screens)
      loadFavorites(1, true);
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: get(err, 'response.data.message', t('errors.genericTryAgain')),
      });
    }
  }, [dispatch, loadFavorites, t]);

  const handlePostPress = useCallback((item: FavoriteItem) => {
    const parentNavigation = navigation.getParent<SeekerStackNavigationProp>();
    parentNavigation?.navigate(ROUTES.PRODUCT_DETAIL, {
      id: item.id,
      status: item.is_interested ? 'in-progress' : 'pending',
      productData: {
        id: item.id,
        title: item.title,
        date: item.created_at,
        image: item.image,
        description: item.description,
        categoryName: item.categoryName || item.category,
        subCategoryName: item.subCategoryName,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
      },
    });
  }, [navigation]);

  return {
    favoritesList,
    isLoading,
    isRefreshing,
    isLoadingMore,
    onRefresh,
    onEndReached,
    onRemoveFromWishList,
    onPressDiscover,
    handlePostPress,
    wishListIds,
  };
}
