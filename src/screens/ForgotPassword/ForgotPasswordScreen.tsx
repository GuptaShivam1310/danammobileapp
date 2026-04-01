import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/common/AppInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ROUTES } from '../../constants/routes';
import { createStyles } from './styles';
import Images from '../../assets/images';
import { useForgotPassword } from './useForgotPassword';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

interface Props {
  navigation: {
    navigate: (routeName: string, params?: any) => void;
    goBack: () => void;
  };
}

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { email, loading, emailError, setEmail, onPressReset } =
    useForgotPassword(({ resetToken, resetUrl }) =>
      navigation.navigate(ROUTES.RESET_PASSWORD, {
        resetToken,
        resetUrl,
      }),
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={Images.danammLogo} style={styles.brandImage} />
        </View>

        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        <Text style={styles.subtitle}>
          {t('forgotPassword.subtitle')}
        </Text>

        <AppInput
          label={t('forgotPassword.emailLabel')}
          leftIconName="mail"
          placeholder={t('forgotPassword.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          errorTestID="forgot-password-error-text"
          testID="forgot-password-email-input"
        />

        <PrimaryButton
          testID="forgot-password-submit-button"
          title={t('forgotPassword.submitButton')}
          onPress={onPressReset}
          loading={loading}
          containerStyle={styles.button}
          textStyle={styles.buttonText}
        />

        <Pressable
          style={styles.returnLoginWrap}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnLoginText}>{t('forgotPassword.returnTo')} </Text>
          <Text style={styles.returnLoginActionText}>{t('forgotPassword.returnAction')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
