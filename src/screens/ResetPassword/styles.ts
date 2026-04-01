import { StyleSheet } from 'react-native';
import { authUiColors } from '../../constants/colors';
import { normalize, moderateScale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: moderateScale(24),
    },
    brandWrap: {
      marginTop: verticalScale(20),
      marginBottom: verticalScale(spacing.xl),
      alignSelf: 'flex-start',
    },
    brandImage: {
      width: moderateScale(110),
      height: verticalScale(34),
      resizeMode: 'contain',
      tintColor: theme.colors.text,
    },
    title: {
      color: theme.colors.text,
      fontSize: normalize(28),
      fontFamily: fonts.bold,
      marginBottom: verticalScale(spacing.xs),
    },
    subtitle: {
      color: theme.colors.mutedText,
      fontSize: normalize(14),
      fontFamily: fonts.regular,
      lineHeight: normalize(20),
      marginBottom: verticalScale(spacing.xl),
    },
    fieldWrapper: {
      marginBottom: verticalScale(spacing.md),
    },
    label: {
      color: theme.colors.text,
      fontSize: normalize(14),
      fontFamily: fonts.medium,
      marginBottom: verticalScale(spacing.sm),
    },
    inputContainer: {
      height: verticalScale(48),
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(10),
      backgroundColor: theme.colors.surface,
    },
    inputContainerFocused: {
      borderColor: theme.colors.brandGreen,
    },
    input: {
      flex: 1,
      marginLeft: moderateScale(8),
      color: theme.colors.text,
      fontSize: normalize(14),
      fontFamily: fonts.regular,
      paddingVertical: 0,
    },
    rightIconButton: {
      width: moderateScale(26),
      height: verticalScale(26),
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: normalize(12),
      fontFamily: fonts.regular,
      marginTop: verticalScale(-8),
      marginBottom: verticalScale(10),
    },
    button: {
      marginTop: verticalScale(spacing.sm),
      height: verticalScale(54),
      borderRadius: moderateScale(8),
      backgroundColor: theme.colors.brandGreen,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontFamily: fonts.bold,
    },
  });
