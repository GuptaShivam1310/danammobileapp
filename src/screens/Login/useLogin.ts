import AsyncStorage from '@react-native-async-storage/async-storage';
import get from 'lodash/get';
import { useState } from 'react';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { useAppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { showErrorToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLogin(onSuccess?: (userType?: string) => void) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [email, setEmail] = useState('seeker3@gmail.com');
  const [password, setPassword] = useState('Password@123');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError(t('login.validation.emailRequired'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError(t('login.validation.passwordRequired'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setEmailError(t('login.validation.emailInvalid'));
      isValid = false;
    }

    return isValid;
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  const onPressLogin = async () => {
    if (loading) {
      return;
    }

    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const data = await dispatch(
        loginUser({
          email: email.trim(),
          password,
        }),
      ).unwrap();
      const token = get(data, 'token', '');
      const user = get(data, 'user', null);
      if (!token) {
        throw new Error(t('login.errors.invalidLoginResponse'));
      }
      onSuccess?.(user?.role);
    } catch (error) {
      const message =
        get(error, 'response.data.message') ||
        get(error, 'response.data.error') ||
        get(error, 'message') ||
        (typeof error === 'string' ? error : '') ||
        t('login.errors.generic');

      showErrorToast(String(message));
      setLoading(false);
    }
  };

  return {
    email,
    password,
    isPasswordVisible,
    loading,
    emailError,
    passwordError,
    errorMessage,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    onPressLogin,
  };
}
