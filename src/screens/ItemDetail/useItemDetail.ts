import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Alert } from 'react-native';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';
import { postApi, ItemDetail } from '../../services/api/postApi';
import { scale } from '../../theme/scale';
import { getSharePostHtml } from '../../utils/htmlTemplates';

const { width } = Dimensions.get('window');

export interface ItemDetailData {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  date: string;
  images: string[];
  locationAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  postedByName: string;
  postedByAvatar?: string | null;
  isFeatured: boolean;
}

type ItemDetailRouteProp = RouteProp<RootStackParamList, typeof ROUTES.ITEM_DETAIL>;
type ItemDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.ITEM_DETAIL
>;

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const useItemDetail = () => {
  const navigation = useNavigation<ItemDetailNavigationProp>();
  const route = useRoute<ItemDetailRouteProp>();
  const { t } = useTranslation();
  const { id } = route.params;

  const [itemDetail, setItemDetail] = useState<ItemDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchItemDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await postApi.getItemDetails(id, abortController.signal);
      const data = get(response, 'data', null) as ItemDetail | null;

      if (!data) {
        throw new Error(t('itemDetail.errors.fetchFailed'));
      }

      const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
      const categoryName = String(get(data, 'category.name', '') || '');
      const postedByName = String(get(data, 'posted_by_user.full_name', '') || '');
      const postedByAvatar = get(data, 'posted_by_user.profile_image_url', null) as string | null;

      setItemDetail({
        id: String(data.id || ''),
        title: String(data.title || ''),
        description: String(data.description || ''),
        categoryName,
        date: formatDisplayDate(data.created_at),
        images,
        locationAddress: String(data.location_address || ''),
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        postedByName,
        postedByAvatar,
        isFeatured: Boolean(data.is_featured),
      });
      setCurrentImageIndex(0);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || t('itemDetail.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchItemDetail();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchItemDetail]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!itemDetail) return;

    try {
      const html = getSharePostHtml(
        itemDetail.title,
        itemDetail.categoryName,
        itemDetail.date,
        itemDetail.images,
        itemDetail.description,
        itemDetail.locationAddress,
      );

      const options = {
        html: html,
        fileName: `Danam_Item_${itemDetail.id}`,
      };

      const file = await generatePDF(options);

      if (file.filePath) {
        const shareOptions = {
          title: itemDetail.title,
          url: `file://${file.filePath}`,
          type: 'application/pdf',
        };
        await Share.open(shareOptions);
      }
    } catch (err: any) {
      if (err && err.message && err.message.includes('User did not share')) {
        return;
      }
      console.error('Error sharing item:', err);
      Alert.alert(t('common.error'), 'Failed to generate shareable PDF');
    }
  }, [itemDetail, t]);

  const onImageScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const imageWidth = width - scale(32);
      const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
      if (index !== currentImageIndex) {
        setCurrentImageIndex(index);
      }
    },
    [currentImageIndex],
  );

  return {
    itemDetail,
    isLoading,
    error,
    currentImageIndex,
    handleBack,
    handleShare,
    onImageScroll,
    retry: fetchItemDetail,
  };
};
