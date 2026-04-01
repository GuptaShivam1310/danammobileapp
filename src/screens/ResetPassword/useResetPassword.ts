import { useRoute } from '@react-navigation/native';
import get from 'lodash/get';
import { Alert } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../services/authService';

export function useResetPassword(onSuccess: () => void) {
  const route = useRoute();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validate = () => {
    let isValid = true;

    if (!newPassword.trim()) {
      setNewPasswordError(t('resetPassword.validation.newPasswordRequired'));
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t('resetPassword.validation.confirmPasswordRequired'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError(t('resetPassword.validation.passwordsDoNotMatch'));
      isValid = false;
    }

    return isValid;
  };

  const onPressResetPassword = async () => {
    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const resetUrl = get(route, 'params.resetUrl', '');
      let token =
        get(route, 'params.resetToken') ||
        get(route, 'params.token') ||
        '';

      if (!token && resetUrl) {
        const match = /[?&]token=([^&]+)/.exec(String(resetUrl));
        if (match?.[1]) {
          token = decodeURIComponent(match[1]).replace(/\"/g, '').trim();
        }
      }

      await resetPassword(newPassword.trim(), String(token));
      
      onSuccess();
    } catch (error) {
      const message =
        get(error, 'response.data.message') ||
        get(error, 'response.data.error') ||
        get(error, 'message') ||
        t('resetPassword.errors.tryAgain');
      Alert.alert(t('resetPassword.resetFailedTitle'), String(message));
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    confirmPassword,
    isNewPasswordVisible,
    isConfirmPasswordVisible,
    loading,
    newPasswordError,
    confirmPasswordError,
    setNewPassword,
    setConfirmPassword,
    setNewPasswordVisible,
    setConfirmPasswordVisible,
    onPressResetPassword,
  };
}
