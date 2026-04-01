import React from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AppTitle } from '../../components/common/AppTitle';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useLookingForDateForBirth } from './LookingForDateForBirth.hook';
import { lookingForDobStyles as styles } from './LookingForDateForBirth.styles';
import { Header } from '../../components/common/Header';
import { useGoBack } from '../../hooks/useGoBack';

export function LookingForDateForBirth() {
  const { t } = useTranslation();
  const {
    dob,
    error,
    selectedDate,
    isPickerVisible,
    onChangeText,
    onOpenPicker,
    onClosePicker,
    onDateChange,
    onPressNext,
  } = useLookingForDateForBirth();
  const onGoBack = useGoBack();
  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header
        title={''}
        onBackPress={onGoBack}
      />
      <View style={styles.content}>
        <AppTitle text={t('lookingForFlow.dob.title')} style={styles.title} />

        <AppInput
          placeholder={t('lookingForFlow.dob.placeholder')}
          value={dob}
          onChangeText={onChangeText}
          error={error}
          rightIconName="calendar"
          onRightIconPress={onOpenPicker}
          keyboardType="number-pad"
          containerStyle={styles.input}
        />

        {isPickerVisible ? (
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={selectedDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, date) => {
                if (Platform.OS !== 'ios') {
                  onClosePicker();
                }
                onDateChange(date ?? undefined);
              }}
              maximumDate={new Date()}
            />
          </View>
        ) : (
          <View style={styles.hiddenPicker} />
        )}
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
