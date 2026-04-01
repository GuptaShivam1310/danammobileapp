import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { authUiColors } from '../../constants/colors';
import { normalize } from '../../theme/scale';
import { useResetPasswordSuccess } from './useResetPasswordSuccess';
import { resetPasswordSuccessStyles as styles } from './styles';
import { useTranslation } from 'react-i18next';

export function ResetPasswordSuccessScreen() {
  const { t } = useTranslation();
  const { onPressContinue } = useResetPasswordSuccess();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.illustrationWrap}>
            <View style={styles.circleBg} />
            <View style={styles.cardBackLeft} />
            <View style={styles.cardBackRight} />
            <View style={styles.cardFront}>
              <FeatherIcon
                name="lock"
                size={normalize(22)}
                color={authUiColors.brandGreen}
              />
              <View style={styles.cardBar} />
            </View>
          </View>

          <Text style={styles.title}>{t('resetPasswordSuccess.title')}</Text>
          <Text style={styles.subtitle}>{t('resetPasswordSuccess.subtitle')}</Text>
        </View>

        <View style={styles.buttonWrap}>
          <PrimaryButton
            title={t('resetPasswordSuccess.continueToLogin')}
            onPress={onPressContinue}
            containerStyle={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
