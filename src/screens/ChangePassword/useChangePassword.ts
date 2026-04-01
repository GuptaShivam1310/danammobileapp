import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import get from 'lodash/get';
import { profileApi } from '../../services/api/profileApi';
import { RootStackParamList } from '../../models/navigation';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useChangePassword = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isCurrentVisible, setIsCurrentVisible] = useState(false);
    const [isNewVisible, setIsNewVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!currentPassword) newErrors.currentPassword = t('validation.currentPasswordRequired');
        if (!newPassword) newErrors.newPassword = t('validation.newPasswordRequired');
        if (!confirmPassword) newErrors.confirmPassword = t('validation.confirmPasswordRequired') || t('validation.passwordsDoNotMatch');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        // Complexity check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword = t('validation.passwordRequirements');
        }

        // New password != current password
        if (newPassword === currentPassword) {
            newErrors.newPassword = t('validation.newPasswordCannotBeSame');
        }

        // Confirm password match
        if (confirmPassword !== newPassword) {
            newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await profileApi.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            if (response.success) {
                Alert.alert(t('alerts.success'), t('alerts.passwordUpdated'));
                // Clear fields on success
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigation.goBack();
            } else {
                Alert.alert(t('alerts.error'), response.message || t('alerts.failedToUpdatePassword'));
            }
        } catch (err: any) {
            const errorMessage = get(err, 'response.data.message') || get(err, 'message') || t('errors.generic');
            Alert.alert(t('alerts.error'), errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => navigation.goBack();

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        isCurrentVisible,
        setIsCurrentVisible,
        isNewVisible,
        setIsNewVisible,
        isConfirmVisible,
        setIsConfirmVisible,
        isSubmitting,
        errors,
        handleUpdate,
        handleBack,
    };
};
