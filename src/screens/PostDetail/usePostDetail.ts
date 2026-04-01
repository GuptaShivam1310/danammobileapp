import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import { postApi } from '../../services/api/postApi';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { AppDispatch, useAppSelector } from '../../store';
import {
    createContribution,
    updatePost,
    deletePost,
    setEditPostData,
    fetchContributionDetails,
    clearSelectedPostDetail,
    fetchUserPosts,
    clearNewPostData,
    PostItem,
} from '../../store/slices/postSlice';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { APP_CONSTANTS } from '../../constants/config';
import { useTranslation } from 'react-i18next';
import { getSharePostHtml } from '../../utils/htmlTemplates';

type PostDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, typeof ROUTES.POST_DETAIL>;
type PostDetailRouteProp = RouteProp<RootStackParamList, typeof ROUTES.POST_DETAIL>;

// Post details structure
interface PostDetailData {
    id: string;
    title: string;
    category: string;
    categoryId?: string;
    subCategoryName?: string;
    subCategoryId?: string;
    date: string;
    images: string[];
    description: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    condition?: string;
    quantity?: number;
    postedBy?: string;
    status?: string;
    donatedTo?: {
        name: string;
        avatar?: string;
        email?: string;
        phone?: string;
    };
}

export const usePostDetail = () => {
    const navigation = useNavigation<PostDetailNavigationProp>();
    const route = useRoute<PostDetailRouteProp>();
    const { t } = useTranslation();
    const { id, isPreview } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const { newPostData, awaiting, contributed, selectedPostDetail, isDetailLoading } = useAppSelector(state => state.post);
    const [postDetail, setPostDetail] = useState<PostDetailData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [selectedSeeker, setSelectedSeeker] = useState<any>(route.params.selectedSeeker || null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const isContributed = (postDetail?.status && postDetail.status !== 'pending') || contributed.data.some(p => p.id === id) || !!selectedSeeker || !!postDetail?.donatedTo;

    useEffect(() => {
        if (route.params.selectedSeeker) {
            setSelectedSeeker(route.params.selectedSeeker);
        }
    }, [route.params.selectedSeeker]);

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return 'Date unknown';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const fetchPostDetail = useCallback(async (isSilent = false) => {
        setError(null);

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            if (isPreview) {
                const { latitude, longitude, address } = newPostData;

                setPostDetail({
                    id: 'preview',
                    title: newPostData.title || 'Untitled',
                    category: newPostData.categoryName || '',
                    subCategoryName: newPostData.subCategoryName || '',
                    subCategoryId: newPostData.subCategoryId || '',
                    date: formatDisplayDate(new Date().toISOString()),
                    images: newPostData.images,
                    description: newPostData.description || 'No description provided.',
                    address: address || 'No address specified',
                    latitude: typeof latitude === 'number' ? latitude : undefined,
                    longitude: typeof longitude === 'number' ? longitude : undefined,
                });
            } else {
                // Detail Mode: Fetch via Redux
                if (!id) throw new Error('Invalid Contribution ID');
                await dispatch(fetchContributionDetails({ id, signal: abortControllerRef.current.signal })).unwrap();
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;

            console.error('Failed to fetch post detail', err);
            const errorMsg = err.message || t('postDetail.alerts.fetchPostDetailsFailed');

            setError(errorMsg);
            if (!isSilent) Alert.alert(t('postDetail.alerts.error'), errorMsg);
        }
    }, [id, isPreview, newPostData, t, dispatch]);

    // Reset state when post ID changes to prevent stale data
    useEffect(() => {
        setPostDetail(null);
        setCurrentImageIndex(0);
        if (!isPreview) {
            dispatch(clearSelectedPostDetail());
        }
    }, [id, isPreview, dispatch]);

    // Update derived postDetail state when Redux changes
    useEffect(() => {
        if (isPreview) return;

        if (!selectedPostDetail) {
            setPostDetail(null);
            return;
        }

        const data = selectedPostDetail;
        const lat = Number(data.location?.latitude || data.latitude);
        const lng = Number(data.location?.longitude || data.longitude);
        const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

        const newDetail: PostDetailData = {
            id: data.id,
            title: data.title || 'Untitled',
            category: data.category?.name || data.categoryName || data?.category || "",
            categoryId: data.category?.id || data.category_id || data.categoryId,
            subCategoryName: data.subcategory?.name || data.subCategoryName,
            subCategoryId: data.subcategory?.id || data.subcategory_id || data.subCategoryId,
            date: formatDisplayDate(data.created_at || data.date),
            images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
            description: data.description || '',
            address: data.location?.address || data.address || '',
            latitude: hasValidCoords ? lat : undefined,
            longitude: hasValidCoords ? lng : undefined,
            condition: data.condition,
            quantity: data.quantity,
            postedBy: data.posted_by?.name,
            status: data.status,
            donatedTo: data.donated_to ? {
                name: data.donated_to.name,
                avatar: data.donated_to.profile_image || data.donated_to.avatar,
                email: data.donated_to.email,
                phone: data.donated_to.phone,
            } : undefined,
        };

        if (JSON.stringify(newDetail) !== JSON.stringify(postDetail)) {
            setPostDetail(newDetail);
        }
    }, [selectedPostDetail, isPreview, formatDisplayDate, postDetail]);

    useFocusEffect(
        useCallback(() => {
            fetchPostDetail(postDetail !== null);
            return () => {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            };
        }, [fetchPostDetail])
    );

    const handleBack = useCallback(() => {
        if (selectedSeeker && !isPreview) {
            navigation.navigate(ROUTES.APP_DRAWER as any, {
                screen: ROUTES.POST,
            });
        } else {
            navigation.goBack();
        }
    }, [navigation, isPreview, selectedSeeker]);

    const handleShare = useCallback(async () => {
        if (!postDetail) return;

        try {
            const html = getSharePostHtml(
                postDetail.title,
                postDetail.category,
                postDetail.date,
                postDetail.images,
                postDetail.description,
                postDetail.address,
            );

            const options = {
                html: html,
                fileName: `Danam_Post_${postDetail.id}`,
            };

            const file = await generatePDF(options);

            if (file.filePath) {
                const shareOptions = {
                    title: postDetail.title,
                    url: `file://${file.filePath}`,
                    type: 'application/pdf',
                };
                await Share.open(shareOptions);
            }
        } catch (error: any) {
            if (error && error.message && error.message.includes('User did not share')) {
                return;
            }
            console.error('Error sharing post:', error);
            Alert.alert(t('postDetail.alerts.error'), 'Failed to generate shareable PDF');
        }
    }, [postDetail, t]);

    const handleEdit = useCallback(() => {
        if (isPreview) {
            navigation.navigate(ROUTES.SELECT_LOCATION);
        } else if (postDetail) {
            const editData: PostItem = {
                id: postDetail.id,
                title: postDetail.title,
                date: postDetail.date,
                image: postDetail.images[0] || '',
                images: postDetail.images,
                description: postDetail.description,
                categoryName: postDetail.category,
                categoryId: postDetail.categoryId,
                subCategoryName: postDetail.subCategoryName,
                subCategoryId: postDetail.subCategoryId,
                latitude: postDetail.latitude,
                longitude: postDetail.longitude,
                address: postDetail.address,
            };
            dispatch(setEditPostData(editData));
            navigation.navigate(ROUTES.SELECT_CATEGORY, {
                isEdit: true,
                selectedCategoryId: postDetail.categoryId ? String(postDetail.categoryId) : undefined,
                selectedSubCategoryId: postDetail.subCategoryId ? String(postDetail.subCategoryId) : undefined,
            });
        }
    }, [isPreview, navigation, postDetail, dispatch]);

    const handleDelete = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!id) return;
        try {
            await dispatch(deletePost(id)).unwrap();
            setIsDeleteModalVisible(false);
            Toast.show({
                type: 'success',
                text1: t('postDetail.alerts.success'),
                text2: 'Contribution deleted successfully',
            });
            navigation.goBack();
        } catch (error: any) {
            console.error('Failed to delete post', error);
            const errorMsg = error.message || 'Failed to delete contribution';
            Toast.show({
                type: 'error',
                text1: t('postDetail.alerts.error'),
                text2: errorMsg,
            });
            setIsDeleteModalVisible(false);
        }
    }, [id, navigation, dispatch, t]);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    const handleMarkContributed = useCallback(async () => {
        if (isPreview) {
            if (!newPostData.title.trim() || !newPostData.description.trim() || !newPostData.categoryId) {
                Toast.show({
                    type: 'error',
                    text1: 'Validation Error',
                    text2: 'Please ensure title, description and category are filled.',
                });
                return;
            }

            try {
                if (newPostData.id) {
                    const originalImages = selectedPostDetail?.images || [];
                    const newImagesOnly = newPostData.images.filter(img => !originalImages.includes(img));

                    await dispatch(updatePost({
                        ...newPostData,
                        images: newImagesOnly
                    })).unwrap();

                    Toast.show({
                        type: 'success',
                        text1: t('postDetail.alerts.success'),
                        text2: 'Contribution updated successfully',
                    });

                    dispatch(fetchContributionDetails({ id: newPostData.id }));
                    dispatch(clearNewPostData());
                    navigation.navigate(ROUTES.APP_DRAWER as any, {
                        screen: ROUTES.POST,
                    });
                } else {
                    await dispatch(createContribution(newPostData)).unwrap();
                    dispatch(fetchUserPosts({ status: 'pending', page: 1, limit: 10 }));
                    dispatch(fetchUserPosts({ status: 'completed', page: 1, limit: 10 }));
                    setIsSuccessModalVisible(true);
                }
            } catch (error: any) {
                console.error('Failed to process contribution', error);
                const errorMsg = error.message || (newPostData.id ? 'Failed to update contribution' : 'Failed to create contribution');
                Toast.show({
                    type: 'error',
                    text1: t('postDetail.alerts.error'),
                    text2: errorMsg,
                });
            }
        } else {
            navigation.navigate(ROUTES.SELECT_SEEKER, { contributionId: id });
        }
    }, [id, isPreview, dispatch, navigation, newPostData, t, selectedPostDetail?.images]);

    const handleHome = useCallback(() => {
        setIsSuccessModalVisible(false);
        dispatch(clearNewPostData());
        navigation.popToTop();
    }, [navigation, dispatch]);

    const onImageScroll = useCallback((event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setCurrentImageIndex(Math.round(index));
    }, []);

    const isPostSliceLoading = awaiting.loading || contributed.loading;

    return {
        postDetail,
        isProcessing: isPostSliceLoading,
        currentImageIndex,
        handleBack,
        handleShare,
        handleEdit,
        handleDelete,
        handleMarkContributed,
        setCurrentImageIndex,
        onImageScroll,
        isDeleteModalVisible,
        confirmDelete,
        closeDeleteModal,
        isPreview,
        latitude: postDetail?.latitude,
        longitude: postDetail?.longitude,
        isSuccessModalVisible,
        handleHome,
        selectedSeeker,
        isContributed,
        fetchPostDetail,
        isLoading: isDetailLoading,
        error,
        isEditMode: isPreview && !!newPostData.id,
    };
};
