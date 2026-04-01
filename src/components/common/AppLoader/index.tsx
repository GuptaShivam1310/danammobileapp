import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '../../../constants/colors';
import { fonts } from '../../../theme/fonts';
import { normalize, scale, verticalScale } from '../../../theme/scale';

interface AppLoaderProps {
  testID?: string;
}

export function AppLoader({ testID }: AppLoaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size="large" color={palette.seekerGreen} />
      <Text style={styles.text}>{t('common.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: verticalScale(8),
    fontFamily: fonts.medium,
    fontSize: normalize(14),
    color: palette.gray400,
  },
});
