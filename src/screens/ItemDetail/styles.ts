import { Dimensions, StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';
import {
  moderateScale,
  normalize,
  scale,
  verticalScale,
} from '../../theme/scale';

const { width } = Dimensions.get('window');

export const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.white,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(6),
    },
    iconButton: {
      width: moderateScale(42),
      height: moderateScale(42),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: palette.seekerGreen20,
      backgroundColor: palette.white50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentScroll: {
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(24),
    },
    title: {
      marginTop: verticalScale(4),
      fontFamily: fonts.extraBold,
      fontSize: normalize(24),
      lineHeight: normalize(34),
      color: palette.gray750,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(8),
    },
    categoryBadge: {
      maxWidth: '70%',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(10),
      backgroundColor: palette.itemDetailCategoryBg,
    },
    categoryText: {
      fontFamily: fonts.medium,
      fontSize: normalize(12),
      color: palette.gray750,
    },
    dateText: {
      marginLeft: scale(8),
      fontFamily: fonts.regular,
      fontSize: normalize(14),
      color: palette.gray750,
      opacity: 0.7,
    },
    carouselWrapper: {
      marginTop: verticalScale(16),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.wishListRowBorder,
      backgroundColor: palette.searchResultCardBgBlue,
    },
    imageContainer: {
      width: width - scale(32),
      height: verticalScale(325),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: verticalScale(12),
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      marginHorizontal: scale(4),
      backgroundColor: palette.white,
      opacity: 0.7,
    },
    activeDot: {
      width: moderateScale(24),
      backgroundColor: palette.white,
      opacity: 1,
    },
    counterBadge: {
      position: 'absolute',
      right: scale(12),
      top: verticalScale(12),
      backgroundColor: palette.itemDetailCounterBg,
      borderRadius: moderateScale(16),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
    },
    counterText: {
      color: palette.white,
      fontFamily: fonts.medium,
      fontSize: normalize(12),
    },
    description: {
      marginTop: verticalScale(16),
      fontFamily: fonts.regular,
      fontSize: normalize(16),
      lineHeight: normalize(26),
      color: palette.gray750,
    },
    sectionTitle: {
      marginTop: verticalScale(18),
      fontFamily: fonts.semiBold,
      fontSize: normalize(18),
      color: palette.gray750,
    },
    mapContainer: {
      marginTop: verticalScale(10),
      height: verticalScale(150),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      backgroundColor: palette.searchResultCardBgBlue,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    mapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.searchResultCardBgBlue,
    },
    pinBadge: {
      marginTop: verticalScale(8),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: moderateScale(16),
      backgroundColor: palette.itemDetailPinBg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    pinText: {
      fontFamily: fonts.medium,
      fontSize: normalize(12),
      color: palette.gray750,
    },
    postedByCard: {
      marginTop: verticalScale(10),
      borderRadius: moderateScale(16),
      backgroundColor: palette.itemDetailPostedByBg,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(14),
    },
    avatarWrap: {
      width: moderateScale(46),
      height: moderateScale(46),
      borderRadius: moderateScale(23),
      backgroundColor: palette.itemDetailAvatarBg,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      fontFamily: fonts.bold,
      fontSize: normalize(16),
      color: palette.gray750,
    },
    postedByInfo: {
      flex: 1,
    },
    postedByName: {
      fontFamily: fonts.bold,
      fontSize: normalize(16),
      color: palette.gray750,
    },
    contributedRow: {
      marginTop: verticalScale(6),
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(6),
    },
    contributedText: {
      fontFamily: fonts.semiBold,
      fontSize: normalize(14),
      color: palette.seekerGreen,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(20),
      gap: scale(12),
    },
    errorText: {
      fontFamily: fonts.medium,
      fontSize: normalize(14),
      color: palette.gray750,
      textAlign: 'center',
    },
  });
