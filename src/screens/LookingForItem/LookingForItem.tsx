import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppTitle } from '../../components/common/AppTitle';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import Images from '../../assets/images';
import { useLookingForItem } from './LookingForItem.hook';
import { lookingForItemStyles as styles } from './LookingForItem.styles';
import { Header } from '../../components/common/Header';
import { useGoBack } from '../../hooks/useGoBack';
import { lightColors } from '../../constants/colors';

export function LookingForItem() {
  const { t } = useTranslation();
  const {
    query,
    error,
    suggestions,
    showSuggestions,
    showImage,
    noResults,
    isLoading,
    fetchError,
    onChangeText,
    onSelectSuggestion,
    onPressGetStarted,
  } = useLookingForItem();
  const onGoBack = useGoBack();

  return (
    <ScreenWrapper contentStyle={styles.screenContent}>
      <Header
        title={''}
        onBackPress={onGoBack}
      />
      <View style={styles.content}>

        <AppTitle text={t('lookingForFlow.item.title')} style={styles.title} />

        <AppInput
          placeholder={t('lookingForFlow.item.placeholder')}
          value={query}
          onChangeText={onChangeText}
          error={error}
          containerStyle={styles.input}
        />

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={lightColors.seekerGreen} />
          </View>
        ) : null}

        {!isLoading && showSuggestions && !noResults ? (
          <FlatList
            data={suggestions}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.suggestionList}
            renderItem={({ item }) => {
              const isSelected = query.trim().toLowerCase() === item.toLowerCase();
              return (
                <Pressable
                  onPress={() => onSelectSuggestion(item)}
                  style={[
                    styles.suggestionItem,
                    isSelected ? styles.suggestionSelected : null,
                  ]}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              );
            }}
          />
        ) : null}

        {!isLoading && showSuggestions && noResults ? (
          <View style={styles.noResultWrap}>
            <Text style={styles.noResultText}>
              {fetchError ?? t('lookingForFlow.item.noItemFound')}
            </Text>
          </View>
        ) : null}

        {!isLoading && showImage ? (
          <View style={styles.illustrationWrap}>
            <Image source={Images.search} style={styles.illustration} />
          </View>
        ) : null}
        
      <View style={styles.footer}>
        <AppButton
          title={t('lookingForFlow.item.getStarted')}
          onPress={onPressGetStarted}
          buttonStyle={styles.primaryButton}
        />
      </View>
      </View>

    </ScreenWrapper>
  );
}
