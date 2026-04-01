import React from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/common/AppInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ROUTES } from '../../constants/routes';
import Images from '../../assets/images';
import { useResetPassword } from './useResetPassword';
import { createStyles } from './styles';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

interface Props {
  navigation: {
    navigate: (routeName: string) => void;
  };
}

export function ResetPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
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
  } = useResetPassword(() => navigation.navigate(ROUTES.RESET_PASSWORD_SUCCESS));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={Images.danammLogo} style={styles.brandImage} />
        </View>

        <Text style={styles.title}>{t('resetPassword.title')}</Text>
        <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>

        <AppInput
          label={t('resetPassword.newPasswordLabel')}
          leftIconName="lock"
          placeholder={t('resetPassword.newPasswordPlaceholder')}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!isNewPasswordVisible}
          rightIconName={!isNewPasswordVisible ? 'eye-off' : 'eye'}
          onRightIconPress={() => setNewPasswordVisible(!isNewPasswordVisible)}
          error={newPasswordError}
          errorTestID="reset-password-new-error"
          testID="reset-password-new-input"
          rightIconTestID="new-password-right-icon"
        />

        <AppInput
          label={t('resetPassword.confirmPasswordLabel')}
          leftIconName="lock"
          placeholder={t('resetPassword.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}
          rightIconName={!isConfirmPasswordVisible ? 'eye-off' : 'eye'}
          onRightIconPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
          error={confirmPasswordError}
          errorTestID="reset-password-confirm-error"
          testID="reset-password-confirm-input"
          rightIconTestID="confirm-password-right-icon"
        />

        <PrimaryButton
          title={t('resetPassword.submitButton')}
          onPress={onPressResetPassword}
          loading={loading}
          containerStyle={styles.button}
          textStyle={styles.buttonText}
          testID="reset-password-submit-button"
        />
      </View>
    </SafeAreaView>
  );
}
