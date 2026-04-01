import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppRadio } from '../../components/common/AppRadio';
import { AppTitle } from '../../components/common/AppTitle';
import { Header } from '../../components/common/Header';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useGoBack } from '../../hooks/useGoBack';
import { useLookingForDoYou } from './LookingForDoYou.hook';
import { lookingForDoYouStyles as styles } from './LookingForDoYou.styles';
import { lightColors } from '../../constants/colors';

export function LookingForDoYou() {
  const { t } = useTranslation();
  const {
    options,
    selectedOption,
    error,
    isLoading,
    onSelectOption,
    onPressNext,
  } = useLookingForDoYou();
  const onGoBack = useGoBack();

  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header title={''} onBackPress={onGoBack} />
      <View style={styles.content}>
        <AppTitle text={t('lookingForFlow.doYou.title')} style={styles.title} />

        {isLoading && options.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={lightColors.seekerGreen} />
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={item => item}
            contentContainerStyle={[
              styles.list,
              options.length === 0 ? styles.emptyListContainer : null,
            ]}
            ListEmptyComponent={
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyStateText}>{t('lookingForFlow.doYou.empty')}</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedOption === item;
              return (
                <AppRadio
                  title={item}
                  selected={isSelected}
                  onPress={() => onSelectOption(item)}
                  style={[styles.option, isSelected ? styles.optionSelected : null]}
                />
              );
            }}
          />
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <AppButton
          title={t('lookingForFlow.common.findItems')}
          onPress={onPressNext}
          buttonStyle={styles.primaryButton}
        />
      </View>
    </ScreenWrapper>
  );
}
