import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { markPostAsContributed, fetchUserPosts } from '../../store/slices/postSlice';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { postApi } from '../../services/api/postApi';

type SelectSeekerNavigationProp = NativeStackNavigationProp<RootStackParamList, typeof ROUTES.SELECT_SEEKER>;
type SelectSeekerRouteProp = RouteProp<RootStackParamList, typeof ROUTES.SELECT_SEEKER>;

export interface ISeeker {
    id: string;
    name: string;
    avatar?: string;
}

export const useSelectSeeker = () => {
    const navigation = useNavigation<SelectSeekerNavigationProp>();
    const route = useRoute<SelectSeekerRouteProp>();
    const { t } = useTranslation();
    const { contributionId } = route.params;
    const dispatch = useDispatch<AppDispatch>();

    const [isLoading, setIsLoading] = useState(false);
    const [seekers, setSeekers] = useState<ISeeker[]>([]);
    const [selectedSeekerId, setSelectedSeekerId] = useState<string | null>(null);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [selectedSeekerData, setSelectedSeekerData] = useState<ISeeker | null>(null);

    const fetchSeekers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await postApi.getSeekers(contributionId);
            if (response.success && response.data && Array.isArray(response.data.items)) {
                // Map API fields profile_image to avatar for compatibility with existing UI
                const mappedSeekers = response.data.items.map((item: any) => ({
                    id: String(item.id),
                    name: item.name,
                    avatar: item.profile_image || undefined
                }));
                setSeekers(mappedSeekers);
            } else {
                setSeekers([]);
            }
        } catch (error) {
            console.error('Failed to fetch seekers', error);
            Alert.alert(t('common.error'), t('selectSeeker.alerts.fetchSeekersFailed'));
        } finally {
            setIsLoading(false);
        }
    }, [contributionId, t]);

    useEffect(() => {
        fetchSeekers();
    }, [fetchSeekers]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSelectSeeker = useCallback((id: string) => {
        setSelectedSeekerId(id);
    }, []);

    const handleSubmitSelection = useCallback(() => {
        if (!selectedSeekerId || isLoading) return;

        const seekerData = seekers.find(s => s.id === selectedSeekerId);
        if (seekerData) {
            setSelectedSeekerData(seekerData);
            setIsConfirmModalVisible(true);
        }
    }, [selectedSeekerId, seekers, isLoading]);

    const handleCancelSelection = useCallback(() => {
        setIsConfirmModalVisible(false);
    }, []);

    const handleConfirmSelection = useCallback(async () => {
        if (isLoading || !selectedSeekerData) return;
        setIsConfirmModalVisible(false);

        try {
            setIsLoading(true);

            // STEP 1: Assign Seeker
            const assignResponse = await postApi.assignSeeker(contributionId, selectedSeekerData.id);
            if (!assignResponse.success) {
                throw new Error(assignResponse.message || 'Failed to assign seeker');
            }

            // STEP 2: Mark Donated
            const donatedResponse = await postApi.markDonated(contributionId, selectedSeekerData.id);
            if (!donatedResponse.success) {
                throw new Error(donatedResponse.message || 'Failed to mark as donated');
            }

            // Refresh post lists in the background to sync counts and tabs immediately
            dispatch(fetchUserPosts({ status: 'pending', page: 1, limit: 10 }));
            dispatch(fetchUserPosts({ status: 'donated', page: 1, limit: 10 }));

            Toast.show({
                type: 'success',
                text1: t('postDetail.alerts.success') || 'Success',
                text2: t('selectSeeker.alerts.markedContributed') || 'Successfully marked as contributed',
            });

            // Navigate back to PostDetailScreen
            navigation.navigate(ROUTES.POST_DETAIL, {
                id: contributionId,
                selectedSeeker: selectedSeekerData
            });
        } catch (error: any) {
            console.error('Failed to process contribution', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message || t('selectSeeker.alerts.markContributedFailed'),
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedSeekerData, contributionId, navigation, dispatch, t, isLoading]);

    return {
        seekers,
        isLoading,
        selectedSeekerId,
        isConfirmModalVisible,
        selectedSeekerData,
        handleBack,
        handleSelectSeeker,
        handleSubmitSelection,
        handleConfirmSelection,
        handleCancelSelection,
    };
};
