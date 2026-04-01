import React from 'react';
import {
    Text,
    TouchableOpacity,
    ScrollView,
    View,
} from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { PasswordInput } from '../../components/specific/profile/PasswordInput';
import { useTheme } from '../../theme';
import { AppLoader } from '../../components/common/AppLoader';
import { useChangePassword } from './useChangePassword';
import { styles as createStyles } from './styles';
import { useTranslation } from 'react-i18next';

export const ChangePasswordScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
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
    } = useChangePassword();

    return (
        <ScreenWrapper testID="change-password-screen">
            <View style={styles.topSpacing}>
                <Header
                    title={t('changePassword.title')}
                    onBackPress={handleBack}
                    backButtonTestID="change-password-back-button"
                />
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <PasswordInput
                    label={t('changePassword.currentPassword')}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={t('changePassword.currentPassword')}
                    isVisible={isCurrentVisible}
                    onToggleVisibility={() => setIsCurrentVisible(!isCurrentVisible)}
                    error={errors.currentPassword}
                    testID="change-password-current-input"
                    eyeTestID="change-password-current-eye"
                />

                <PasswordInput
                    label={t('changePassword.newPassword')}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('changePassword.newPassword')}
                    isVisible={isNewVisible}
                    onToggleVisibility={() => setIsNewVisible(!isNewVisible)}
                    error={errors.newPassword}
                    testID="change-password-new-input"
                    eyeTestID="change-password-new-eye"
                />

                <PasswordInput
                    label={t('changePassword.confirmNewPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('changePassword.confirmNewPassword')}
                    isVisible={isConfirmVisible}
                    onToggleVisibility={() => setIsConfirmVisible(!isConfirmVisible)}
                    error={errors.confirmPassword}
                    testID="change-password-confirm-input"
                    eyeTestID="change-password-confirm-eye"
                />

                <TouchableOpacity
                    style={[styles.updateButton, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleUpdate}
                    disabled={isSubmitting}
                    testID="change-password-submit-button"
                >
                    {isSubmitting ? (
                        <AppLoader />
                    ) : (
                        <Text style={styles.updateButtonText}>{t('changePassword.updatePassword')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
};
