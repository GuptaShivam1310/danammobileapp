import { StyleSheet } from 'react-native';
import { authUiColors, palette } from '../../constants/colors';
import { normalize, moderateScale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const resetPasswordSuccessStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: authUiColors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrap: {
    width: moderateScale(140),
    height: verticalScale(140),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  circleBg: {
    position: 'absolute',
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: palette.resetBlueLight,
  },
  cardBackLeft: {
    position: 'absolute',
    width: moderateScale(60),
    height: verticalScale(78),
    borderRadius: moderateScale(8),
    backgroundColor: palette.resetGreenLight,
    transform: [{ rotate: '-6deg' }, { translateX: moderateScale(-24) }, { translateY: verticalScale(8) }],
  },
  cardBackRight: {
    position: 'absolute',
    width: moderateScale(60),
    height: verticalScale(78),
    borderRadius: moderateScale(8),
    backgroundColor: palette.resetGreenDark,
    transform: [{ rotate: '6deg' }, { translateX: moderateScale(24) }, { translateY: verticalScale(8) }],
  },
  cardFront: {
    width: moderateScale(66),
    height: verticalScale(88),
    borderRadius: moderateScale(10),
    backgroundColor: authUiColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.resetBorder,
  },
  cardBar: {
    marginTop: verticalScale(10),
    width: moderateScale(36),
    height: verticalScale(10),
    borderRadius: moderateScale(2),
    backgroundColor: authUiColors.brandGreen,
  },
  title: {
    color: authUiColors.primaryText,
    fontSize: normalize(28),
    fontFamily: fonts.bold,
    marginBottom: verticalScale(spacing.xs),
    textAlign: 'center',
  },
  subtitle: {
    color: authUiColors.secondaryText,
    fontSize: normalize(14),
    fontFamily: fonts.regular,
    lineHeight: normalize(20),
    textAlign: 'center',
    paddingHorizontal: moderateScale(20),
  },
  buttonWrap: {
    paddingBottom: verticalScale(spacing.xl),
  },
  button: {
    height: verticalScale(54),
    borderRadius: moderateScale(8),
    backgroundColor: authUiColors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: authUiColors.white,
    fontSize: normalize(16),
    fontFamily: fonts.bold,
  },
});
