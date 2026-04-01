import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { requestApi, IRequestDetail } from '../../services/api/requestApi';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { get } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    acceptRequestThunk,
    rejectRequestThunk,
    reportUserThunk,
    setCurrentRequest,
    fetchRequestDetail,
} from '../../store/productSeekers/productSeekersSlice';

export const useRequestDetail = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.REQUEST_DETAIL>>();
    const { t } = useTranslation();
    const requestId = get(route, 'params.requestId', '');
    const seekerIdFromParams = get(route, 'params.seekerId', '');
    const productId = get(route, 'params.productId', '');
    const productTitle = get(route, 'params.productTitle', '');
    const productImage = get(route, 'params.productImage', '');
    const dispatch = useAppDispatch();

    const data = useAppSelector((state) => state.productSeekers.currentRequest);
    const isLoading = useAppSelector((state) => state.productSeekers.loading);
    const error = useAppSelector((state) => state.productSeekers.error);

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!requestId) return;
        dispatch(fetchRequestDetail(requestId));
    }, [requestId, dispatch]);

    useEffect(() => {
        fetchData();
        return () => {
            dispatch(setCurrentRequest(null));
        };
    }, [fetchData, dispatch]);

    const handleRetry = () => fetchData();

    const handleAccept = async () => {
        if (!requestId) return;
        setIsActionLoading(true);
        try {
            const resultAction = await dispatch(acceptRequestThunk(requestId));
            if (acceptRequestThunk.fulfilled.match(resultAction)) {
                setIsSuccessModalVisible(true);
            } else {
                Alert.alert(t('common.error'), (resultAction.payload as string) || t('errors.generic'));
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), get(error, 'message', t('errors.generic')));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = () => {
        setIsRejectModalVisible(true);
    };

    const handleCloseRejectModal = () => {
        setIsRejectModalVisible(false);
        setRejectReason('');
    };

    const handleConfirmReject = async () => {
        if (!requestId) return;
        if (!rejectReason.trim()) {
            Alert.alert(t('common.error'), t('requestDetail.rejectModal.reasonRequired') || 'Please provide a reason for rejection');
            return;
        }
        setIsRejectModalVisible(false);
        setIsActionLoading(true);
        try {
            const resultAction = await dispatch(rejectRequestThunk({ requestId, reason: rejectReason }));
            if (rejectRequestThunk.fulfilled.match(resultAction)) {
                Alert.alert(t('alerts.success'), t('requestDetail.alerts.rejectSuccess'));
                navigation.goBack();
            } else {
                Alert.alert(t('common.error'), (resultAction.payload as string) || t('errors.generic'));
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), get(error, 'message', t('errors.generic')));
        } finally {
            setIsActionLoading(false);
            setRejectReason('');
        }
    };

    const handleReport = () => {
        setIsMenuVisible(false);
        setIsReportModalVisible(true);
    };

    const handleConfirmReport = async () => {
        const userId = data?.user.id || seekerIdFromParams;
        const trimmedReason = reportReason.trim();
        if (!trimmedReason) {
            Alert.alert(t('common.error'), t('validation.messageRequired') || 'Please enter a reason');
            return;
        }
        if (!userId) return;

        setIsReporting(true);
        try {
            const resultAction = await dispatch(reportUserThunk({ userId, reason: trimmedReason }));
            if (reportUserThunk.fulfilled.match(resultAction)) {
                setIsReportModalVisible(false);
                setReportReason('');
                Toast.show({
                    type: 'success',
                    text1: t('alerts.success'),
                    text2: (resultAction.payload as any).message || t('reportUser.success'),
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: t('alerts.error'),
                    text2: (resultAction.payload as string) || t('reportUser.error') || 'Failed to report user',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t('alerts.error'),
                text2: get(error, 'message', t('errors.generic')),
            });
        } finally {
            setIsReporting(false);
        }
    };

    const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

    const handleBackToChat = () => {
        setIsSuccessModalVisible(false);
        navigation.replace(ROUTES.CHAT as any, {
            seekerId: seekerIdFromParams || data?.user.id,
            requestId: requestId, // Use the current requestId
            seekerName: data?.user.name,
            seekerAvatar: data?.user.profile_image,
            productId,
            productTitle,
            productImage,
        });
    };

    return {
        data,
        isLoading,
        error,
        isActionLoading,
        isMenuVisible,
        isRejectModalVisible,
        isReportModalVisible,
        isSuccessModalVisible,
        rejectReason,
        setRejectReason,
        isReporting,
        reportReason,
        setReportReason,
        setIsReportModalVisible,
        handleAccept,
        handleReject,
        handleCloseRejectModal,
        handleConfirmReject,
        handleReport,
        handleConfirmReport,
        handleBackToChat,
        toggleMenu,
        handleRetry,
        handleBack: () => navigation.goBack(),
    };
};
