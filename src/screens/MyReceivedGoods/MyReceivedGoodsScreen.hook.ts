import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import get from 'lodash/get';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SeekerBottomTabParamList, SeekerLandingParamList, ProfileParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { ReceivedProductApiItem } from '../../services/api/myReceivedGoodsApi';
import { postApi } from '../../services/api/postApi';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type MyReceivedGoodsNavigationProp = NativeStackNavigationProp<
  ProfileParamList,
  typeof ROUTES.MY_RECEIVED_GOODS
>;

type SeekerTabNavigationProp = BottomTabNavigationProp<
  SeekerBottomTabParamList
>;

type SeekerStackNavigationProp = NativeStackNavigationProp<SeekerLandingParamList>;

export function useMyReceivedGoodsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<MyReceivedGoodsNavigationProp>();
  const [receivedProducts, setReceivedProducts] = useState<ReceivedProductApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const LIMIT = 10;

  const fetchReceivedProducts = useCallback(async (page: number, isRefresh: boolean = false) => {
    if (page === 1) {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
    }
    setError(null);
    try {
      const response = await postApi.getAssignedContributions(page, LIMIT, 'donated');
      const newItems = response?.data?.items || [];
      const totalItems = response?.data?.total || 0;

      // Map backend data to UI format securely
      const mappedItems: ReceivedProductApiItem[] = newItems.map((item: any) => ({
        id: item.id || Math.random().toString(),
        title: item.title || '',
        date: item.created_at || new Date().toISOString(),
        image: item.image || item.images?.[0],
        images: item.images || [],
        description: item.description,
        categoryName: item.category?.name,
        categoryId: item.category?.id,
        subCategoryName: item.subcategory?.name,
        subCategoryId: item.subcategory?.id,
        latitude: item.location?.latitude,
        longitude: item.location?.longitude,
        address: item.location?.address,
      }));

      if (isRefresh || page === 1) {
        setReceivedProducts(mappedItems);
      } else {
        setReceivedProducts(prev => [...prev, ...mappedItems]);
      }

      const currentTotal = (page === 1 ? 0 : receivedProducts.length) + mappedItems.length;
      setHasMoreData(mappedItems.length === LIMIT && currentTotal < totalItems);
      setCurrentPage(page);

    } catch (err) {
      const fallbackMessage = t('myReceivedGoods.error');
      const errorMessage = get(err, 'response.data.message', get(err, 'message', fallbackMessage));
      if (page === 1) {
        setReceivedProducts([]);
      }
      setError(errorMessage || fallbackMessage);
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: errorMessage || fallbackMessage,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t, receivedProducts.length]);

  useEffect(() => {
    fetchReceivedProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(() => {
    if (isLoading || isRefreshing) return;
    fetchReceivedProducts(1, true);
  }, [fetchReceivedProducts, isLoading, isRefreshing]);

  const onEndReached = useCallback(() => {
    if (!isLoading && !isRefreshing && hasMoreData) {
      fetchReceivedProducts(currentPage + 1, false);
    }
  }, [fetchReceivedProducts, isLoading, isRefreshing, hasMoreData, currentPage]);


  const onGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressProduct = useCallback((item: ReceivedProductApiItem) => {
    const seekerTabNavigation = navigation.getParent<SeekerTabNavigationProp>();
    const seekerStackNavigation = seekerTabNavigation?.getParent<SeekerStackNavigationProp>();

    seekerStackNavigation?.navigate(ROUTES.PRODUCT_DETAIL, {
      id: item.id,
      fromMyReceivedGoods: true,
      productData: {
        id: item.id,
        title: item.title,
        date: item.date,
        image: item.image,
        images: item.images,
        description: item.description,
        categoryName: item.categoryName,
        subCategoryName: item.subCategoryName,
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
        contributorName: item.contributorName,
        contributorEmail: item.contributorEmail,
        contributorPhone: item.contributorPhone,
      },
    });
  }, [navigation]);

  return {
    onGoBack,
    receivedProducts,
    isLoading,
    isRefreshing,
    hasMoreData,
    error,
    onPressProduct,
    onRefresh,
    onEndReached,
  };

}
