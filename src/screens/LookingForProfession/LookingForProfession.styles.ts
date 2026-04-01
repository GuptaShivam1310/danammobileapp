import { StyleSheet } from 'react-native';
import { lightColors } from '../../constants/colors';
import { verticalScale, moderateScale, normalize } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

export const lookingForProfessionStyles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: verticalScale(30),
  },
  list: {
    marginTop: verticalScale(spacing.lg),
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(spacing.lg),
  },
  emptyStateText: {
    fontSize: normalize(14),
    fontFamily: fonts.medium,
    color: lightColors.mutedText,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    borderWidth: 1,
    borderColor: lightColors.seekerGreenLight,
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: moderateScale(spacing.md),
    marginBottom: verticalScale(spacing.sm),
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
