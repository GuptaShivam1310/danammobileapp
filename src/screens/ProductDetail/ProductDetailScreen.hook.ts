import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import get from 'lodash/get';
import Toast from 'react-native-toast-message';
import { ROUTES } from '../../constants/routes';
import {
  ProductDetailRouteData,
  ProductDetailStatus,
  SeekerLandingParamList,
} from '../../models/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { productDetailApi } from '../../services/api/productDetailApi';
import {
  removeFromWishList,
  selectWishListIds,
  toggleWishListItem,
} from '../../store/slices/wishListSlice';

interface ContributedBy {
  name: string;
  contributionLabel?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  contributions_count?: number;
}

interface ProductDetailData {
  id: string;
  title: string;
  category: string;
  categoryName?: string;
  subCategoryName?: string;
  date: string;
  images: (string | null)[];
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  contributedBy: ContributedBy;
  requestId?: string;
}

type ProductDetailNavigationProp = NativeStackNavigationProp<
  SeekerLandingParamList,
  typeof ROUTES.PRODUCT_DETAIL
>;

type ProductDetailRouteProp = RouteProp<
  SeekerLandingParamList,
  typeof ROUTES.PRODUCT_DETAIL
>;

const PRODUCT_CONTACT_NUMBER = '+919876543210';

function normalizeProductStatus(value: unknown): ProductDetailStatus | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'pending') {
    return 'pending';
  }
  if (normalized === 'in-progress' || normalized === 'in progress') {
    return 'in-progress';
  }
  if (normalized === 'done') {
    return 'done';
  }

  return null;
}

import { postApi } from '../../services/api/postApi';
import { formatDisplayDate } from '../../utils/dateUtils';

export function useProductDetailScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { t } = useTranslation();
  const route = useRoute<ProductDetailRouteProp>();
  const wishListIds = useAppSelector(selectWishListIds);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [status, setStatus] = useState<ProductDetailStatus | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [detailData, setDetailData] = useState<ProductDetailData | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);

  const productId = route.params?.id;
  const contributionId = route.params?.id;
  const isFromMyReceivedGoods = Boolean(route.params?.fromMyReceivedGoods);

  const fetchContributionDetails = useCallback(async (id: string) => {
    setIsDetailsLoading(true);
    try {
      const response = await postApi.getContributionDetails(id);
      if (response?.success && response.data) {
        const data = response.data;
        const categoryName = data.category;
        const subCategoryName = data.subcategory?.name;
        const category = [categoryName, subCategoryName].filter(Boolean).join(' | ');

        setDetailData({
          id: data.id,
          title: data.title,
          description: data.description || '',
          category: category || '',
          categoryName,
          subCategoryName,
          date: data.created_at || '',
          images: data.images?.length ? data.images : (data.image ? [data.image] : [null]),
          latitude: data.location?.latitude ? Number(data.location.latitude) : undefined,
          longitude: data.location?.longitude ? Number(data.location.longitude) : undefined,
          address: data.location?.address || '',
          contributedBy: {
            name: data.contributor?.name || t('productDetail.contributor.nameFallback'),
            profile_image: data.contributor?.profile_image,
            contributions_count: data.contributor?.contributions_count,
            phone: data.contributor?.phone,
            contributionLabel: `${data.contributor?.contributions_count || 0}+ ${t('productDetail.contributor.itemsContributed')}`,
            email: data.contributor?.email,
          },
          requestId: data.request_id,
        });

        if (data.status) {
          let nextStatus = normalizeProductStatus(data.status);

          if (data.request_status === 'accepted') {
            nextStatus = 'done';
          } else if (data.request_status === 'rejected') {
            nextStatus = 'rejected' as any;
          } else if (data.is_interested && nextStatus === 'pending') {
            nextStatus = 'in-progress';
          }

          setStatus(nextStatus);
        }

        if (data.is_favorite !== undefined) {
          // Sync with Redux if API says it's a favorite and it's not in Redux yet
          const heartData = {
            id: data.id,
            title: data.title,
            date: data.created_at,
            image: data.images?.[0] || data.image,
            images: data.images,
            description: data.description,
            categoryName: data.category,
            subCategoryName: data.subcategory?.name,
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            address: data.location?.address,
          };

          const isInWishlist = wishListIds.includes(data.id);
          if (data.is_favorite && !isInWishlist) {
            dispatch(toggleWishListItem(heartData as any));
          } else if (!data.is_favorite && isInWishlist) {
            dispatch(removeFromWishList(data.id));
          }
        }
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsDetailsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (contributionId) {
      fetchContributionDetails(contributionId);
    } else {
      // Fallback to route params if no contributionId (legacy or from search)
      const routeData = route.params?.productData as ProductDetailRouteData | undefined;
      if (routeData) {
        const categoryName = routeData.categoryName;
        const subCategoryName = routeData.subCategoryName;
        const category = [categoryName, subCategoryName].filter(Boolean).join(' | ');

        const images = routeData.images?.length
          ? routeData.images
          : (routeData.image ? [routeData.image] : [null]);

        const defaultContributorName = t('productDetail.contributor.nameFallback');
        const contributorName = routeData.contributorName || defaultContributorName;

        setDetailData({
          id: route.params?.id || routeData.id || '',
          title: routeData.title || '',
          date: routeData.date || '',
          category: category || '',
          categoryName: routeData.categoryName,
          subCategoryName: routeData.subCategoryName,
          images,
          description: routeData.description || '',
          latitude: routeData.latitude,
          longitude: routeData.longitude,
          address: routeData.address || '',
          contributedBy: isFromMyReceivedGoods
            ? {
              name: contributorName,
              email: routeData.contributorEmail || t('productDetail.receivedContributor.emailFallback'),
              phone: routeData.contributorPhone || t('productDetail.receivedContributor.phoneFallback'),
            }
            : {
              name: contributorName,
              contributionLabel: t('productDetail.contributor.contributionLabel'),
            },
        });
      }
    }
  }, [contributionId, fetchContributionDetails, isFromMyReceivedGoods, route.params?.id, route.params?.productData, t]);

  const productDetail = detailData;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const isLiked = useMemo(() => {
    if (!productDetail?.id) {
      return false;
    }

    return wishListIds.includes(productDetail.id);
  }, [productDetail?.id, wishListIds]);

  const fetchProductStatus = useCallback(async () => {
    if (!productId || isFromMyReceivedGoods || contributionId) {
      // If we have contributionId, status comes from details API
      return;
    }

    setIsStatusLoading(true);
    try {
      const response = await productDetailApi.getProductStatus(productId);
      const nextStatus = normalizeProductStatus(response?.status);
      setStatus(nextStatus);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsStatusLoading(false);
    }
  }, [contributionId, isFromMyReceivedGoods, productId, t]);

  useEffect(() => {
    fetchProductStatus();
  }, [fetchProductStatus]);

  const handleShare = useCallback(async () => {
    if (!productDetail) {
      return;
    }

    try {
      const html = `
        <html>
          <body style="font-family: 'Helvetica', sans-serif; padding: 40px; color: #1F2937;">
            <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #111827;">
              ${productDetail.title}
            </h1>
            <p style="font-size: 14px; color: #6B7280; margin-bottom: 24px;">
              ${productDetail.category || '-'} ${productDetail.date ? `| ${productDetail.date}` : ''}
            </p>
            <div style="margin-bottom: 24px;">
              ${productDetail.images
          .map(img => `<img src="${img}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;" />`)
          .join('')}
            </div>
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">${t('productDetail.share.description')}</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${productDetail.description || '-'}
              </p>
            </div>
            ${productDetail.address ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">${t('productDetail.share.location')}</h2>
                <p style="font-size: 16px; color: #374151;">${productDetail.address}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `;

      const file = await generatePDF({
        html,
        fileName: `${t('productDetail.danamProduct')}_${productDetail.id}_${t('productDetail.detail')}`,
      });

      if (file.filePath) {
        await Share.open({
          title: productDetail.title,
          url: `file://${file.filePath}`,
          type: 'application/pdf',
        });
      }
    } catch {
      // Ignore share cancellation/failure to keep UX non-blocking.
    }
  }, [productDetail, t]);

  const handleToggleFavorite = useCallback(async () => {
    if (!contributionId || isFavoriteUpdating || !productDetail) {
      return;
    }

    const isCurrentlyFavorite = isLiked;

    // Optimistically update Redux so other screens (Dashboard/Wishlist) sync instantly
    const postItem = {
      id: productDetail.id,
      title: productDetail.title,
      date: productDetail.date,
      image: productDetail.images?.[0] ?? undefined,
      images: productDetail.images,
      description: productDetail.description,
      categoryName: productDetail.categoryName,
      subCategoryName: productDetail.subCategoryName,
      latitude: productDetail.latitude,
      longitude: productDetail.longitude,
      address: productDetail.address,
    };
    dispatch(toggleWishListItem(postItem as any));

    setIsFavoriteUpdating(true);
    try {
      if (isCurrentlyFavorite) {
        await postApi.removeContributionFromFavorite(contributionId);
      } else {
        await postApi.addContributionToFavorite(contributionId);
      }
    } catch (err: any) {
      // Revert Redux on failure
      dispatch(toggleWishListItem(contributionId));

      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsFavoriteUpdating(false);
    }
  }, [contributionId, isLiked, isFavoriteUpdating, productDetail, dispatch, t]);

  const updateProductStatus = useCallback(async () => {
    if (!productId) {
      return;
    }

    setIsStatusUpdating(true);
    try {
      const response = await productDetailApi.updateProductStatus({ id: productId });
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: t('alerts.success'),
          text2: response?.message || t('common.ok'),
        });
        await fetchProductStatus();
        return;
      }

      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: response?.message || t('errors.genericTryAgain'),
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsStatusUpdating(false);
    }
  }, [fetchProductStatus, productId, t]);

  const handleInterested = useCallback(async () => {
    if (!contributionId || isStatusUpdating) {
      return;
    }

    setIsStatusUpdating(true);
    try {
      const response = await postApi.expressInterest(
        contributionId,
        t('productDetail.interest.defaultMessage', { defaultValue: 'I need this laptop for study' }),
      );

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: t('alerts.success'),
          text2: response?.message || t('productDetail.interest.successMessage'),
        });
        // Update local status to in-progress (mapping to is_interested UI)
        setStatus('in-progress');
      } else {
        Toast.show({
          type: 'error',
          text1: t('errors.generic'),
          text2: response?.message || t('errors.genericTryAgain'),
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsStatusUpdating(false);
    }
  }, [contributionId, isStatusUpdating, t]);

  const handleCancelInterest = useCallback(async () => {
    if (!contributionId || isStatusUpdating) {
      return;
    }

    setIsStatusUpdating(true);
    try {
      const response = await postApi.cancelInterest(contributionId);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: t('alerts.success'),
          text2: response?.message || t('common.ok'),
        });
        // Update local status back to pending
        setStatus('pending');
      } else {
        Toast.show({
          type: 'error',
          text1: t('errors.generic'),
          text2: response?.message || t('errors.genericTryAgain'),
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsStatusUpdating(false);
    }
  }, [contributionId, isStatusUpdating, t]);

  const handleCall = useCallback(async () => {
    let phoneNumber = '';
    if (Platform.OS === 'ios') {
      phoneNumber = `telprompt:${PRODUCT_CONTACT_NUMBER}`;
    } else {
      // Use 'tel' on Android, which usually opens the dialer directly
      phoneNumber = `tel:${PRODUCT_CONTACT_NUMBER}`;
    }
    try {
      Linking.openURL(phoneNumber)
    } catch {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: t('errors.genericTryAgain'),
      });
    }
  }, [t]);

  const handleChat = useCallback(() => {
    const resolvedProductId = productId || productDetail?.id;

    if (!resolvedProductId) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: t('errors.genericTryAgain'),
      });
      return;
    }

    navigation.navigate(ROUTES.CHAT, {
      seekerId: resolvedProductId,
      seekerName: productDetail?.contributedBy.name || t('productDetail.contributor.nameFallback'),
      productId: resolvedProductId,
      productTitle: productDetail?.title,
      productImage: productDetail?.images?.[0] ?? undefined,
      requestId: productDetail?.requestId,
    });
  }, [navigation, productDetail, productId, t]);

  const handleReportIssue = useCallback(() => {
    setIsReportModalVisible(true);
  }, []);

  const handleCancelReportIssue = useCallback(() => {
    if (isReporting) {
      return;
    }

    setIsReportModalVisible(false);
    setReportReason('');
  }, [isReporting]);

  const handleReportReasonChange = useCallback((value: string) => {
    setReportReason(value);
  }, []);

  const handleSubmitReportIssue = useCallback(async () => {
    if (!productId || !reportReason.trim() || isReporting) {
      return;
    }

    const trimmedReason = reportReason.trim();
    setIsReporting(true);
    try {
      const response = await productDetailApi.reportIssue({
        contribution_id: productId,
        reason: trimmedReason,
      });
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: t('alerts.success'),
          text2: response.message || t('common.ok'),
        });
        setIsReportModalVisible(false);
        setReportReason('');
        return;
      }

      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: response?.message || t('errors.genericTryAgain'),
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: err?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsReporting(false);
    }
  }, [isReporting, productId, reportReason, t]);

  return {
    productDetail,
    status,
    isFromMyReceivedGoods,
    isDetailsLoading,
    isStatusLoading,
    isStatusUpdating,
    isLiked,
    currentImageIndex,
    setCurrentImageIndex,
    handleBack,
    handleShare,
    handleToggleFavorite,
    isFavorite: isLiked,
    isFavoriteUpdating,
    handleInterested,
    handleCancelInterest,
    handleCall,
    handleChat,
    handleReportIssue,
    isReportModalVisible,
    reportReason,
    isReporting,
    handleReportReasonChange,
    handleCancelReportIssue,
    handleSubmitReportIssue,
  };
}
