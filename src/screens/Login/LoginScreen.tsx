import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ROUTES } from '../../constants/routes';
import { AppInput } from '../../components/common/AppInput';
import { useLogin } from './useLogin';
import { createStyles } from './styles';
import Images from '../../assets/images';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

export function LoginScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const {
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
  } = useLogin();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandWrap}>
          <Image
            source={Images.danammLogo}
            style={styles.brandImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>
          {t('login.subtitle')}
        </Text>

        <AppInput
          label={t('login.emailLabel')}
          leftIconName="mail"
          placeholder={t('login.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          errorTestID="email-error"
          testID="email-input"
        />

        <AppInput
          label={t('login.passwordLabel')}
          leftIconName="lock"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          rightIconName={!isPasswordVisible ? 'eye-off' : 'eye'}
          onRightIconPress={togglePasswordVisibility}
          error={passwordError || errorMessage}
          errorTestID="password-error"
          testID="password-input"
        />

        <PrimaryButton
          title={t('login.loginButton')}
          onPress={onPressLogin}
          loading={loading}
          containerStyle={styles.loginButton}
          textStyle={styles.loginButtonText}
          testID="login-button"
        />

        <Pressable onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD as never)}>
          <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
        </Pressable>

        <View style={styles.bottomWrap}>
          <Text style={styles.bottomText}>{t('login.noAccount')}</Text>
          <Pressable onPress={() => navigation.navigate(ROUTES.SIGN_UP as never)}>
            <Text style={styles.signUpText}>{t('login.signUp')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
