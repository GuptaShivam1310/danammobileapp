import { StyleSheet } from 'react-native';
import { normalize, moderateScale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { authUiColors } from '../../constants/colors';
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
      marginBottom: verticalScale(spacing.xxl),
      alignSelf: 'flex-start',
    },
    title: {
      color: theme.colors.text,
      fontSize: normalize(32),
      fontFamily: fonts.bold,
      marginBottom: verticalScale(spacing.sm),
    },
    subtitle: {
      color: theme.colors.mutedText,
      fontSize: normalize(14),
      fontFamily: fonts.regular,
      lineHeight: normalize(20),
      marginBottom: verticalScale(spacing.xl),
    },
    loginButton: {
      marginTop: verticalScale(spacing.sm),
      height: verticalScale(54),
      borderRadius: moderateScale(12),
      backgroundColor: theme.colors.brandGreen,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: normalize(16),
      fontFamily: fonts.bold,
    },
    forgotPassword: {
      marginTop: verticalScale(spacing.lg),
      color: theme.colors.text,
      fontSize: normalize(14),
      fontFamily: fonts.medium,
      textAlign: 'center',
    },
    bottomWrap: {
      marginTop: 'auto',
      paddingBottom: verticalScale(spacing.xl),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    bottomText: {
      color: theme.colors.mutedText,
      fontSize: normalize(13),
      fontFamily: fonts.regular,
    },
    signUpText: {
      color: theme.colors.brandGreen,
      fontSize: normalize(13),
      fontFamily: fonts.bold,
      marginLeft: moderateScale(4),
    },
    brandImage: {
      width: moderateScale(120),
      height: verticalScale(40),
      tintColor: theme.colors.text,
    },
  });
