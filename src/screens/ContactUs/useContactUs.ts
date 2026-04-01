import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { supportApi } from '../../services/api/supportApi';
import { useTranslation } from 'react-i18next';
import get from 'lodash/get';

export const useContactUs = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = t('contactUs.validation.fullNameRequired');
        }

        if (!email.trim()) {
            newErrors.email = t('contactUs.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('contactUs.validation.emailInvalid');
        }

        if (!phone.trim()) {
            newErrors.phone = t('contactUs.validation.phoneRequired');
        }

        if (!message.trim()) {
            newErrors.message = t('contactUs.validation.messageRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fullName, email, phone, message, t]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSubmit = useCallback(async () => {
        if (!validate() || loading) return;

        setLoading(true);
        try {
            const response = await supportApi.sendMessage({
                full_name: fullName,
                email: email,
                phone_number: phone,
                message: message,
            });
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: t('alerts.success') || 'Success',
                    text2: response.message || t('contactUs.successMessage'),
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: t('alerts.error') || 'Error',
                    text2: response.message || t('alerts.failedToSendMessage'),
                });
            }
        } catch (err: any) {
            const errorMessage = get(err, 'response.data.message') || get(err, 'message') || t('errors.generic');
            Toast.show({
                type: 'error',
                text1: t('alerts.error') || 'Error',
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [fullName, email, phone, message, loading, validate, navigation, t]);

    return {
        fullName,
        email,
        phone,
        message,
        errors,
        loading,
        setFullName,
        setEmail,
        setPhone,
        setMessage,
        handleBack,
        handleSubmit,
    };
};
