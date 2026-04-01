import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppRadio } from '../../components/common/AppRadio';
import { AppTitle } from '../../components/common/AppTitle';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useLookingForGender } from './LookingForGender.hook';
import { lookingForGenderStyles as styles } from './LookingForGender.styles';
import { Header } from '../../components/common/Header';
import { useGoBack } from '../../hooks/useGoBack';

export function LookingForGender() {
  const { t } = useTranslation();
  const {
    genders,
    selectedGender,
    error,
    onSelectGender,
    onPressNext,
  } = useLookingForGender();
  const onGoBack = useGoBack();
  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header
        title={''}
        onBackPress={onGoBack}
      />
      <View style={styles.content}>

        <AppTitle text={t('lookingForFlow.gender.title')} style={styles.title} />

        {genders.map(gender => {
          const isSelected = selectedGender === gender;
          return (
            <AppRadio
              key={gender}
              title={gender}
              selected={isSelected}
              onPress={() => onSelectGender(gender)}
              style={[styles.option, isSelected ? styles.optionSelected : null]}
            />
          );
        })}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
