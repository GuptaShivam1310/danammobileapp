import { StyleSheet } from 'react-native';
import { lightColors } from '../../constants/colors';
import { verticalScale, moderateScale, normalize } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

export const lookingForGenderStyles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: verticalScale(30),
  },
  option: {
    borderWidth: 1,
    borderColor: lightColors.seekerGreenLight,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: moderateScale(spacing.md),
    marginTop: verticalScale(spacing.md),
    backgroundColor: lightColors.surface,
  },
  optionSelected: {
    borderColor: lightColors.seekerGreen,
  },
  errorText: {
    marginTop: verticalScale(spacing.sm),
    fontSize: normalize(12),
    fontFamily: fonts.regular,
    color: lightColors.danger,
  },
  footer: {
    paddingBottom: verticalScale(spacing.md),
  },
  primaryButton: {
    backgroundColor: lightColors.seekerGreen,
  },
});
