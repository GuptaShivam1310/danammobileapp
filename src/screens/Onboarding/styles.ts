import { Dimensions, StyleSheet } from 'react-native';
import { normalize, moderateScale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { lightColors, palette } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export const onboardingStyles = StyleSheet.create({
  slide: {
    width,
    height,
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
  gradientContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(150),
    height: verticalScale(34),
    resizeMode: 'contain',
  },
  contentContainer: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: verticalScale(24),
  },
  title: {
    color: palette.white,
    fontSize: normalize(32),
    fontFamily: fonts.bold,
    marginBottom: verticalScale(8),
    maxWidth: moderateScale(230),
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: normalize(14),
    fontFamily: fonts.regular,
    lineHeight: normalize(20),
    marginBottom: verticalScale(18),
    maxWidth: moderateScale(265),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: lightColors.splashBackground,
    minWidth: moderateScale(130),
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
  },
  buttonText: {
    color: palette.white,
    fontSize: normalize(14),
    fontFamily: fonts.semiBold,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginLeft: moderateScale(6),
  },
  dotActive: {
    backgroundColor: palette.white,
    width: moderateScale(14),
    borderRadius: moderateScale(4),
  },

});
