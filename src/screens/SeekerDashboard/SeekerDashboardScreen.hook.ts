import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import get from 'lodash/get';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import {
  LookingForFlowData,
  SeekerBottomTabParamList,
  SeekerLandingParamList,
} from '../../models/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { postApi } from '../../services/api/postApi';
import {
  clearWishList,
  selectWishListIds,
  toggleWishListItem,
} from '../../store/slices/wishListSlice';
import { seekerPreferencesService } from '../../services/seekerPreferencesService';
import { resetSeekerPreferences } from '../../store/slices/seekerPreferencesSlice';
import { updateIsPreferencesSaved } from '../../store/slices/authSlice';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import { getStorageItem } from '../../storage/asyncStorage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

type SeekerDashboardTabNavigationProp = BottomTabNavigationProp<
  SeekerBottomTabParamList,
  typeof ROUTES.SEEKER_DASHBOARD
>;

type SeekerDashboardRouteProp = RouteProp<
  SeekerBottomTabParamList,
  typeof ROUTES.SEEKER_DASHBOARD
>;

type SeekerStackNavigationProp = NativeStackNavigationProp<SeekerLandingParamList>;

const LIMIT = 10;

export interface SeekerContributionItem {
  id: string;
  title: string;
  image: string;
  category: string;
  created_at: string;
  is_interested: boolean;
  is_favorite: boolean;
  // Added for product detail compatibility if needed
  date?: string;
  images?: string[];
  description?: string;
  categoryName?: string;
  subCategoryName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export function useSeekerDashboardScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<SeekerDashboardTabNavigationProp>();
  const route = useRoute<SeekerDashboardRouteProp>();
  const { t } = useTranslation();
  const wishListIds = useAppSelector(selectWishListIds);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [contributions, setContributions] = useState<SeekerContributionItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isClearingFlow, setIsClearingFlow] = useState(false);

  // Filters
  const searchValue = route.params?.searchValue || '';

  const loadContributions = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (pageNum > 1 && !hasMoreData) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // 1. Fetch location from storage
      const flowData = await getStorageItem<LookingForFlowData>(STORAGE_KEYS.LOOKING_FOR_FLOW_DATA);
      const location = flowData?.selectedLocation?.area || '';
      // 2. Clear old request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // 3. API Call
      const response = await postApi.getContributions(
        {
          page: pageNum,
          limit: LIMIT,
          search: searchValue,
          location: '', // Handled by backend preferences
        },
        abortControllerRef.current.signal,
      );

      if (response.success) {
        const newItems = response.items || [];
        setHasMoreData(newItems.length === LIMIT);

        setContributions(prev => {
          const filteredPrev = pageNum === 1 ? [] : prev;
          // Prevent duplicates
          const existingIds = new Set(filteredPrev.map(item => item.id));
          const uniqueItems = newItems.filter((item: any) => !existingIds.has(item.id));
          return [...filteredPrev, ...uniqueItems];
        });

        // Sync initial favorites with Redux
        newItems.forEach((item: any) => {
          if (item.is_favorite && !wishListIds.includes(item.id)) {
            dispatch(toggleWishListItem({
              id: item.id,
              title: item.title,
              date: item.created_at,
              image: item.image,
            } as any));
          }
        });
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      const fallbackMessage = t('errors.genericTryAgain');
      const errorMessage = typeof err === 'string'
        ? err
        : get(err, 'response.data.message', get(err, 'message', fallbackMessage));

      showErrorToast(errorMessage || fallbackMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [hasMoreData, searchValue, t, wishListIds, dispatch]);

  useEffect(() => {
    loadContributions(1);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchValue]);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    loadContributions(1, true);
  }, [loadContributions]);

  const onEndReached = useCallback(() => {
    if (isLoadingMore || !hasMoreData || isLoading || isRefreshing) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadContributions(nextPage);
  }, [hasMoreData, isLoading, isLoadingMore, isRefreshing, loadContributions, page]);

  const onPressReset = useCallback(async () => {
    if (isClearingFlow) return;

    setIsClearingFlow(true);

    try {
      await seekerPreferencesService.resetPreferences();

      dispatch(clearWishList());
      dispatch(resetSeekerPreferences());
      dispatch(updateIsPreferencesSaved(false));

      setContributions([]);
      setPage(1);
      setHasMoreData(true);

      showSuccessToast(t('seekerDashboard.resetSuccess'));

      const parentNavigation = navigation.getParent<SeekerStackNavigationProp>();
      parentNavigation?.navigate(ROUTES.SEEKER_LANDING);
    } catch (err) {
      showErrorToast((err as any)?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')));
    } finally {
      setIsClearingFlow(false);
    }
  }, [dispatch, isClearingFlow, navigation, t]);

  const onToggleLike = useCallback(async (item: SeekerContributionItem) => {
    const isCurrentlyFavorite = item.is_favorite;

    // Update local state immediately (Optimistic update)
    setContributions(prev =>
      prev.map(c => (c.id === item.id ? { ...c, is_favorite: !isCurrentlyFavorite } : c)),
    );

    // Sync with Redux Wishlist
    const postItem = {
      id: item.id,
      title: item.title,
      date: item.created_at,
      image: item.image,
    };
    dispatch(toggleWishListItem(postItem as any));

    try {
      if (isCurrentlyFavorite) {
        await postApi.removeContributionFromFavorite(item.id);
      } else {
        await postApi.addContributionToFavorite(item.id);
      }
    } catch (err: any) {
      // Revert if API fails
      setContributions(prev =>
        prev.map(c => (c.id === item.id ? { ...c, is_favorite: isCurrentlyFavorite } : c)),
      );
      dispatch(toggleWishListItem(item.id as any)); // Toggle back in Redux

      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    }
  }, [dispatch, t]);

  const onPressNotification = useCallback(() => {
    const parentNavigation = navigation.getParent<SeekerStackNavigationProp>();
    parentNavigation?.navigate(ROUTES.NOTIFICATIONS);
  }, [navigation]);

  const handlePostPress = useCallback((item: SeekerContributionItem) => {
    const parentNavigation = navigation.getParent<SeekerStackNavigationProp>();
    parentNavigation?.navigate(ROUTES.PRODUCT_DETAIL, {
      id: item.id,
      status: 'pending',
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
    });
  }, [navigation]);

  return {
    contributions,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isClearingFlow,
    onRefresh,
    onEndReached,
    onPressNotification,
    onPressReset,
    onToggleLike,
    handlePostPress,
    wishListIds,
  };
}
