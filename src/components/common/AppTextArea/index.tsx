import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { lightColors } from '../../../constants/colors';
import { fonts } from '../../../theme/fonts';
import { moderateScale, normalize, verticalScale } from '../../../theme/scale';

interface AppTextAreaProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  text: string;
  placeholder?: string;
  onChangeCallBack: (value: string) => void;
  minChar?: number;
  maxChar?: number;
  error?: string;
  minCharMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_MIN_CHAR = 30;
const DEFAULT_MAX_CHAR = 500;

export function AppTextArea({
  text,
  placeholder,
  onChangeCallBack,
  minChar = DEFAULT_MIN_CHAR,
  maxChar = DEFAULT_MAX_CHAR,
  error,
  minCharMessage,
  containerStyle,
  ...rest
}: AppTextAreaProps) {
  const characterCount = text.length;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TextInput
        value={text}
        onChangeText={onChangeCallBack}
        placeholder={placeholder}
        placeholderTextColor={lightColors.mutedText}
        multiline
        textAlignVertical="top"
        maxLength={maxChar}
        style={styles.input}
        {...rest}
      />
      <Text style={styles.counterText}>
        {characterCount}/{maxChar}
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && characterCount > 0 && characterCount < minChar && minCharMessage ? (
        <Text style={styles.helperText}>{minCharMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: moderateScale(400),
    maxWidth: '100%',
    alignSelf: 'center',
  },
  input: {
    height: verticalScale(150),
    borderWidth: 1,
    borderColor: lightColors.seekerGreenLight,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    color: lightColors.inputText,
    fontFamily: fonts.medium,
    fontSize: normalize(14),
    backgroundColor: lightColors.surface,
  },
  errorText: {
    marginTop: verticalScale(6),
    fontSize: normalize(12),
    fontFamily: fonts.regular,
    color: lightColors.danger,
  },
  helperText: {
    marginTop: verticalScale(4),
    fontSize: normalize(12),
    fontFamily: fonts.regular,
    color: lightColors.mutedText,
  },
  counterText: {
    marginTop: verticalScale(6),
    textAlign: 'right',
    fontSize: normalize(12),
    fontFamily: fonts.medium,
    color: lightColors.mutedText,
  },
});
