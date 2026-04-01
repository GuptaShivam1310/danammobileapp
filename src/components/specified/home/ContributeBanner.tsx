import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ContributeBannerProps } from './types';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { spacing } from '../../../theme/spacing';
import { palette } from '../../../constants/colors';
import { ScreenWidth } from 'react-native-elements/dist/helpers';
import { useTranslation } from 'react-i18next';
import { BannerIcon } from '../../../assets/icons';

/**
 * ContributeBanner Component
 * Displays a banner encouraging users to contribute with a call-to-action button
 * Designed to be inserted at a configurable position within a FlatList
 * @param onPress - Callback when contribute button is pressed
 * @param testID - Test identifier
 * @param buttonText - Custom button text
 */
export const ContributeBanner: React.FC<ContributeBannerProps> = ({
  onPress,
  testID = 'contribute-banner',
  buttonText,
}) => {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.green140,
        },
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            {
              color: palette.green700,
            },
          ]}
        >
          {t('home.contributeTitle')}
        </Text>

        <Text
          style={[
            styles.title,
            {
              color: palette.green800,
            },
          ]}
        >
          {t('home.contributeHighlight')}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: palette.green800,
            },
          ]}
          onPress={onPress}
          testID="contribute-button"
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {buttonText ?? t('home.contributeButton')}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <BannerIcon width={scale(190)} height={verticalScale(220)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: normalize(12),
    paddingVertical: verticalScale(spacing.lg),
    paddingHorizontal: scale(spacing.lg),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    height: verticalScale(220),
    width: ScreenWidth - scale(spacing.lg) * 2,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  label: {
    fontSize: normalize(10),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: verticalScale(spacing.sm),
  },
  title: {
    width: '55%',
    fontSize: normalize(18),
    fontWeight: '700',
    marginBottom: verticalScale(spacing.lg),
    lineHeight: normalize(24),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.md),
    borderRadius: normalize(8),
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: palette.white,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  arrow: {
    color: palette.white,
    marginLeft: scale(spacing.sm),
    fontSize: normalize(16),
  },
  imageContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: scale(190),
    height: verticalScale(220),
    zIndex: 1,
  },
});
