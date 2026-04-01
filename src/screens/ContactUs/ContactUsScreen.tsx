import React from 'react';
import { View, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useTheme } from '../../theme';
import { useContactUs } from './useContactUs';
import { styles as createStyles } from './styles';
import { useTranslation } from 'react-i18next';

export const ContactUsScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
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
    } = useContactUs();

    return (
        <ScreenWrapper testID="contact-us-screen" withBottomTab={true}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        title={t('contactUs.title')}
                        onBackPress={handleBack}
                        backButtonTestID="contact-us-back-button"
                    />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        <AppInput
                            label={t('contactUs.fullNameLabel')}
                            placeholder={t('contactUs.fullNamePlaceholder')}
                            value={fullName}
                            onChangeText={setFullName}
                            error={errors.fullName}
                            testID="full-name-input"
                            errorTestID="full-name-error"
                        />

                        <AppInput
                            label={t('contactUs.emailLabel')}
                            placeholder={t('contactUs.emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            testID="email-input"
                            errorTestID="email-error"
                        />

                        <AppInput
                            label={t('contactUs.phoneLabel')}
                            placeholder={t('contactUs.phonePlaceholder')}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            error={errors.phone}
                            testID="phone-input"
                            errorTestID="phone-error"
                        />

                        <AppInput
                            label={t('contactUs.messageLabel')}
                            placeholder={t('contactUs.messagePlaceholder')}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            error={errors.message}
                            testID="message-input"
                            errorTestID="message-error"
                        />

                        <PrimaryButton
                            title={t('contactUs.submitButton')}
                            onPress={handleSubmit}
                            loading={loading}
                            containerStyle={styles.submitButton}
                            testID="contact-submit-button"
                        />
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};
