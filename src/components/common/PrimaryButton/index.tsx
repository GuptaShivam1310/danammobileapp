import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { authUiColors } from '../../../constants/colors';
import { fonts } from '../../../theme/fonts';
import { normalize, moderateScale } from '../../../theme/scale';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  containerStyle,
  textStyle,
  testID,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={[styles.container, containerStyle, isDisabled ? styles.disabled : null]}
    >
      {loading ? (
        <ActivityIndicator color={authUiColors.white} testID="loading-indicator" />
      ) : (
        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: authUiColors.brandGreen,
    height: moderateScale(54),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: authUiColors.white,
    fontSize: normalize(16),
    fontFamily: fonts.semiBold,
  },
  disabled: {
    opacity: 0.7,
  },
});
