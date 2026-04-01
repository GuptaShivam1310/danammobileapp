import get from 'lodash/get';
import { Alert } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ForgotPasswordSuccessPayload {
  resetToken: string;
  resetUrl: string;
}

export function useForgotPassword(onSuccess?: (payload: ForgotPasswordSuccessPayload) => void) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { t } = useTranslation();

  const validate = () => {
    if (!email.trim()) {
      setEmailError(t('forgotPassword.validation.emailRequired'));
      return false;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('');
      Alert.alert(
        t('forgotPassword.invalidEmailTitle'),
        t('forgotPassword.invalidEmailMessage'),
      );
      return false;
    }

    setEmailError('');
    return true;
  };

  const onPressReset = async () => {
    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email.trim().toLowerCase());

      if (!response.success) {
        throw new Error(response.message || t('errors.genericTryAgain'));
      }

      onSuccess?.({
        resetToken: response.resetToken || '',
        resetUrl: response.resetUrl || '',
      });
    } catch (error) {
      const message =
        get(error, 'response.data.message') ||
        get(error, 'response.data.error') ||
        get(error, 'message') ||
        t('errors.genericTryAgain');

      Alert.alert(t('alerts.error'), String(message));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    loading,
    emailError,
    setEmail,
    onPressReset,
  };
}
