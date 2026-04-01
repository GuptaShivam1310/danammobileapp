import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppTextArea } from '../../components/common/AppTextArea';
import { AppTitle } from '../../components/common/AppTitle';
import { Header } from '../../components/common/Header';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useGoBack } from '../../hooks/useGoBack';
import { useLookingForReason } from './LookingForReason.hook';
import { lookingForReasonStyles as styles } from './LookingForReason.styles';
import { MAX_REASON_CHAR, MIN_REASON_CHAR } from './LookingForReason.hook';

export function LookingForReason() {
  const { t } = useTranslation();
  const { reason, error, onChangeReason, onPressNext } = useLookingForReason();
  const onGoBack = useGoBack();

  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header title={''} onBackPress={onGoBack} />

      <View style={styles.content}>
        <AppTitle text={t('lookingForFlow.reason.title')} style={styles.title} />
        <AppTextArea
          text={reason}
          onChangeCallBack={onChangeReason}
          placeholder={t('lookingForFlow.reason.placeholder')}
          minChar={MIN_REASON_CHAR}
          maxChar={MAX_REASON_CHAR}
          minCharMessage={t('lookingForFlow.reason.minCounterHint', { min: MIN_REASON_CHAR })}
          containerStyle={styles.textArea}
          error={error}
        />
      </View>

      <View style={styles.footer}>
        <AppButton
          title={t('lookingForFlow.common.next')}
          onPress={onPressNext}
          buttonStyle={styles.primaryButton}
        />
      </View>
    </ScreenWrapper>
  );
}
