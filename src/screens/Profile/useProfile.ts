import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/navigation';
import get from 'lodash/get';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { profileApi } from '../../services/api/profileApi';
import { ProfileParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { fetchProfile } from '../../store/slices/profileSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { logout } from '../../services/authService';

export const useProfile = () => {
    const navigation = useNavigation<NativeStackNavigationProp<
        ProfileParamList,
        typeof ROUTES.PROFILE
    >>();
    const dispatch = useAppDispatch();
    const { user: userProfile, isLoading, error } = useAppSelector(state => state.profile);
    const authUser = useAppSelector(state => state.auth.user);
    const [persistedUserRole, setPersistedUserRole] = useState<string | null>(null);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        const hydrateUserType = async () => {
            try {
                const userData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
                if (!userData) {
                    setPersistedUserRole(null);
                    return;
                }
                const parsedUser = JSON.parse(userData) as { role?: string };
                setPersistedUserRole(parsedUser?.role ?? null);
            } catch {
                setPersistedUserRole(null);
            }
        };

        hydrateUserType();
    }, []);

    const handleEditProfile = () => {
        navigation.navigate(ROUTES.EDIT_PROFILE);
    };

    const handleSettings = () => {
        navigation.navigate(ROUTES.SETTINGS);
    };

    const handleChangePassword = () => {
        navigation.navigate(ROUTES.CHANGE_PASSWORD);
    };

    const handleHelpSupport = () => {
        navigation.navigate(ROUTES.HELP_SUPPORT);
    };

    const handleMyReceivedGoods = () => {
        navigation.navigate(ROUTES.MY_RECEIVED_GOODS);
    };

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    const closeLogoutModal = () => {
        setIsLogoutModalVisible(false);
    };

    const handleConfirmLogout = async () => {
        try {
            setIsLogoutModalVisible(false);
            await dispatch(logoutUser());
            // No need for navigation.reset, RootNavigator handles it via isAuthenticated state
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const userRole = authUser?.role ?? persistedUserRole;
    const isSeekerUserType = userRole?.trim().toLowerCase().startsWith('seeker') ?? false;

    return {
        profile: userProfile,
        isSeekerUserType,
        isLoading,
        error,
        isLogoutModalVisible,
        fetchProfile,
        handleEditProfile,
        handleMyReceivedGoods,
        handleSettings,
        handleChangePassword,
        handleHelpSupport,
        handleLogout,
        closeLogoutModal,
        handleConfirmLogout,
    };
};
