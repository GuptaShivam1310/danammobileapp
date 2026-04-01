import { StyleSheet } from 'react-native';
import { lightColors } from '../../constants/colors';
import { normalize, verticalScale, moderateScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

export const lookingForItemStyles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: verticalScale(30),
  },
  input: {
    marginTop: verticalScale(spacing.lg),
  },
  suggestionList: {
    marginTop: verticalScale(spacing.sm),
  },
  suggestionItem: {
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: moderateScale(spacing.md),
    marginBottom: verticalScale(spacing.sm),
    backgroundColor: lightColors.surface,
  },
  suggestionSelected: {
    borderColor: lightColors.seekerGreen,
  },
  suggestionText: {
    fontSize: normalize(14),
    fontFamily: fonts.medium,
    color: lightColors.text,
  },
  noResultText: {
    fontSize: normalize(13),
    fontFamily: fonts.regular,
    color: lightColors.mutedText,
    textAlign: 'center',
  },
  noResultWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: moderateScale(500),
    height: moderateScale(500),
    resizeMode: 'contain',
  },
  footer: {
    paddingBottom: verticalScale(spacing.md),
  },
  primaryButton: {
    backgroundColor: lightColors.seekerGreen,
  },
});
