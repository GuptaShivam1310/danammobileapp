import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { normalize, verticalScale, moderateScale } from '../../../theme/scale';
import { useTheme } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { fonts } from '../../../theme/fonts';

interface AppInputProps extends TextInputProps {
  label?: string;
  leftIconName?: string;
  rightIconName?: string;
  onRightIconPress?: () => void;
  error?: string;
  errorTestID?: string;
  rightIconTestID?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  leftIconName,
  rightIconName,
  onRightIconPress,
  error,
  errorTestID,
  rightIconTestID,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor: theme.colors.border },
          props.multiline && styles.inputContainerMultiline,
          isFocused && { borderColor: theme.colors.brandGreen },
          error ? { borderColor: theme.colors.danger } : null,
        ]}
      >
        {leftIconName && (
          <FeatherIcon
            name={leftIconName}
            size={normalize(18)}
            color={theme.colors.mutedText}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text },
            props.multiline && styles.inputMultiline,
            props.style,
          ]}
          placeholderTextColor={theme.colors.mutedText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIconName && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            testID={rightIconTestID}
          >
            <FeatherIcon
              name={rightIconName}
              size={normalize(18)}
              color={theme.colors.mutedText}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]} testID={errorTestID}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: verticalScale(spacing.md),
  },
  label: {
    fontSize: normalize(14),
    fontFamily: fonts.medium,
    marginBottom: verticalScale(spacing.sm),
  },
  inputContainer: {
    height: verticalScale(48),
    borderWidth: 1,
    borderRadius: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(spacing.md),
  },
  inputContainerMultiline: {
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: verticalScale(spacing.xs),
  },
  input: {
    flex: 1,
    fontSize: normalize(14),
    fontFamily: fonts.regular,
    paddingVertical: 0,
    marginLeft: moderateScale(spacing.sm),
  },
  inputMultiline: {
    textAlignVertical: 'top',
    height: verticalScale(120),
    paddingTop: verticalScale(spacing.xs),
  },
  rightIcon: {
    padding: moderateScale(4),
  },
  errorText: {
    fontSize: normalize(12),
    fontFamily: fonts.regular,
    marginTop: verticalScale(4),
  },
});
