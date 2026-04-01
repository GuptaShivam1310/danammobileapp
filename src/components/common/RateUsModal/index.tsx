import React, { useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../theme';
import { styles as createStyles } from './styles';
import { authUiColors, palette } from '../../../constants/colors';
import { moderateScale } from '../../../theme/scale';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../PrimaryButton';
import { supportApi } from '../../../services/api/supportApi';
import Toast from 'react-native-toast-message';
import get from 'lodash/get';

interface RateUsModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const RateUsModal: React.FC<RateUsModalProps> = ({
    isVisible,
    onClose,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleRating = (value: number) => {
        setRating(value);
    };

    const handleClose = useCallback(() => {
        if (loading) return;
        setRating(0);
        onClose();
    }, [onClose, loading]);

    const handleSubmit = useCallback(async () => {
        if (rating === 0 || loading) return;

        setLoading(true);
        try {
            const response = await supportApi.submitRating(rating);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: t('alerts.success') || 'Success',
                    text2: response.message || t('rateUsModal.successMessage'),
                });
                handleClose();
            } else {
                Toast.show({
                    type: 'error',
                    text1: t('alerts.error') || 'Error',
                    text2: response.message || 'Failed to submit rating',
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
    }, [rating, loading, handleClose, t]);

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{t('rateUsModal.title')}</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                    disabled={loading}
                                    testID="rate-us-close-button"
                                >
                                    <Feather name="x" size={moderateScale(24)} color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>{t('rateUsModal.subtitle')}</Text>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => handleRating(star)}
                                        activeOpacity={0.7}
                                        disabled={loading}
                                        testID={`rate-star-${star}`}
                                    >
                                        {star <= rating ? (
                                            <Ionicons
                                                name="star"
                                                size={moderateScale(48)}
                                                color={palette.yellow400}
                                                style={styles.star}
                                            />
                                        ) : (
                                            <Ionicons
                                                name="star-outline"
                                                size={moderateScale(48)}
                                                color={authUiColors.grayIcon}
                                                style={styles.star}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.tapText}>{t('rateUsModal.tapText')}</Text>

                            <PrimaryButton
                                title={t('rateUsModal.submit') || t('common.submit')}
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={rating === 0}
                                containerStyle={styles.submitButton}
                                testID="rate-submit-button"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
