import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';
import { profileApi } from '../../services/api/profileApi';
import { RootStackParamList } from '../../models/navigation';
import { logoutUser } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fetchUserSettings, updateUserSettings, updateSettingsOptimistic } from '../../store/slices/userSettingsSlice';
import { IUpdateUserSettingsRequest } from '../../services/api/userSettingsApi';

export const useSettings = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { data: settingsData, isLoading: isFetchingSettings } = useSelector((state: RootState) => state.userSettings);

    // Derived values for the UI
    const receiveUpdates = settingsData?.receive_updates ?? false;
    const nearestDanam = settingsData?.nearby_notifications ?? false;
    const hideIdentity = settingsData?.hide_identity ?? false;

    // Loading state for first API call
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // To prevent multiple simultaneous calls for the same toggle
    const updatingRef = useRef<Record<string, boolean>>({});

    const fetchSettings = useCallback(async () => {
        try {
            await dispatch(fetchUserSettings()).unwrap();
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setIsInitialLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggleSetting = useCallback(async (field: keyof IUpdateUserSettingsRequest, value: boolean) => {
        if (updatingRef.current[field]) return;

        // Optimistic update
        const previousValue = settingsData ? settingsData[field as keyof typeof settingsData] : !value;
        dispatch(updateSettingsOptimistic({ [field]: value }));

        updatingRef.current[field] = true;
        setIsUpdating(true);

        try {
            await dispatch(updateUserSettings({ [field]: value })).unwrap();
        } catch (err) {
            console.error(`Failed to update ${field}`, err);
            // Revert on failure
            dispatch(updateSettingsOptimistic({ [field]: previousValue }));
            Alert.alert(t('alerts.error'), t('settings.updateFailed'));
        } finally {
            updatingRef.current[field] = false;
            setIsUpdating(false);
        }
    }, [dispatch, settingsData, t]);

    const handleToggleUpdates = (value: boolean) => {
        handleToggleSetting('receive_updates', value);
    };

    const handleToggleNearest = (value: boolean) => {
        handleToggleSetting('nearby_notifications', value);
    };

    const handleToggleIdentity = (value: boolean) => {
        handleToggleSetting('hide_identity', value);
    };

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = () => {
        setIsDeleteModalVisible(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalVisible(false);
    };

    const handleConfirmDelete = () => {
        setIsDeleteModalVisible(false);
        // Step 2: Open password modal
        setTimeout(() => {
            setIsPasswordModalVisible(true);
        }, 300);
    };

    const handlePasswordConfirm = async (password: string) => {
        setIsDeleting(true);
        try {
            const response = await profileApi.deleteAccount({ password });
            if (response.success) {
                setIsPasswordModalVisible(false);
                Alert.alert(
                    t('alerts.success'),
                    response.message || t('alerts.accountDeleted'),
                    [{ text: 'OK', onPress: () => dispatch(logoutUser()) }]
                );
            } else {
                Alert.alert(t('alerts.error'), response.message || t('alerts.deleteAccountFailed'));
            }
        } catch (err) {
            const errorMessage = get(err, 'response.data.message') || get(err, 'message') || t('alerts.deleteAccountFailed');
            Alert.alert(t('alerts.error'), errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalVisible(false);
    };

    const handleBack = () => navigation.goBack();

    return {
        receiveUpdates,
        nearestDanam,
        hideIdentity,
        isLoading: isInitialLoading || isFetchingSettings,
        isDeleting,
        isUpdating,
        isDeleteModalVisible,
        isPasswordModalVisible,
        handleToggleUpdates,
        handleToggleNearest,
        handleToggleIdentity,
        handleDeleteAccount,
        handleConfirmDelete,
        handlePasswordConfirm,
        handleCloseDeleteModal,
        handleClosePasswordModal,
        handleBack,
    };
};
