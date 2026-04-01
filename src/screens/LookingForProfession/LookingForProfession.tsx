import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppRadio } from '../../components/common/AppRadio';
import { AppTitle } from '../../components/common/AppTitle';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useLookingForProfession } from './LookingForProfession.hook';
import { lookingForProfessionStyles as styles } from './LookingForProfession.styles';
import { useGoBack } from '../../hooks/useGoBack';
import { Header } from '../../components/common/Header';
import { lightColors } from '../../constants/colors';

export function LookingForProfession() {
  const { t } = useTranslation();
  const {
    professions,
    selectedProfessionId,
    error,
    isLoading,
    onSelectProfession,
    onPressNext,
  } = useLookingForProfession();
  const onGoBack = useGoBack();
  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header
        title={''}
        onBackPress={onGoBack}
      />
      <View style={styles.content}>
        <AppTitle text={t('lookingForFlow.profession.title')} style={styles.title} />

        {isLoading && professions.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={lightColors.seekerGreen} />
          </View>
        ) : (
          <FlatList
            data={professions}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={[
              styles.list,
              professions.length === 0 ? styles.emptyListContainer : null,
            ]}
            ListEmptyComponent={
              <View style={styles.emptyStateWrap}>
                <Text style={styles.emptyStateText}>{t('lookingForFlow.profession.empty')}</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedProfessionId === item.id;
              return (
                <AppRadio
                  title={item.title}
                  selected={isSelected}
                  onPress={() => onSelectProfession(item.id)}
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
          title={t('lookingForFlow.common.next')}
          onPress={onPressNext}
          buttonStyle={styles.primaryButton}
        />
      </View>
    </ScreenWrapper>
  );
}
