import { Dimensions, StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';
import { moderateScale, normalize, verticalScale } from '../../theme/scale';

const { width } = Dimensions.get('window');

export const createProductDetailStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: moderateScale(12),
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },
    iconButton: {
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(8),
    },
    contentScroll: {
      paddingBottom: verticalScale(24),
    },
    title: {
      marginTop: verticalScale(8),
      fontFamily: fonts.extraBold,
      fontSize: normalize(30),
      lineHeight: normalize(34),
      color: theme.colors.text,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(8),
    },
    categoryBadge: {
      backgroundColor: theme.mode === 'dark' ? palette.seekerGreen20 : palette.blue50,
      paddingHorizontal: moderateScale(10),
      paddingVertical: verticalScale(5),
      borderRadius: moderateScale(10),
    },
    categoryText: {
      fontFamily: fonts.medium,
      fontSize: normalize(12),
      color: theme.mode === 'dark' ? palette.seekerGreenLight : palette.gray700,
    },
    dateText: {
      marginLeft: moderateScale(8),
      fontFamily: fonts.regular,
      fontSize: normalize(12),
      color: theme.colors.mutedText,
    },
    carouselWrapper: {
      marginTop: verticalScale(16),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
    },
    imageContainer: {
      width: width - moderateScale(32),
      height: verticalScale(240),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: verticalScale(16),
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      marginHorizontal: moderateScale(4),
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
      width: moderateScale(24),
      backgroundColor: palette.white,
    },
    counterBadge: {
      position: 'absolute',
      right: moderateScale(12),
      bottom: verticalScale(12),
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(8),
      paddingVertical: verticalScale(3),
    },
    counterText: {
      color: palette.white,
      fontFamily: fonts.medium,
      fontSize: normalize(11),
    },
    description: {
      marginTop: verticalScale(16),
      fontFamily: fonts.regular,
      fontSize: normalize(14),
      lineHeight: normalize(22),
      color: theme.colors.text,
    },
    sectionTitle: {
      marginTop: verticalScale(18),
      fontFamily: fonts.bold,
      fontSize: normalize(16),
      color: theme.colors.text,
    },
    mapContainer: {
      marginTop: verticalScale(10),
      height: verticalScale(120),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    contributedCard: {
      marginTop: verticalScale(12),
      borderRadius: moderateScale(12),
      backgroundColor: theme.mode === 'dark' ? theme.colors.softSurface : palette.itemDetailPostedByBg,
      padding: moderateScale(12),
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarWrap: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: theme.mode === 'dark' ? theme.colors.border : palette.itemDetailAvatarBg,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    contributorAvatar: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      fontFamily: fonts.bold,
      fontSize: normalize(18),
      color: theme.mode === 'dark' ? palette.seekerGreenLight : palette.seekerGreen,
    },
    contributorInfo: {
      marginLeft: moderateScale(12),
      flex: 1,
    },
    contributorName: {
      fontFamily: fonts.extraBold,
      fontSize: normalize(16),
      color: theme.colors.text,
    },
    contributedLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(4),
      gap: moderateScale(6),
    },
    contributedLabel: {
      flex: 1,
      fontFamily: fonts.semiBold,
      fontSize: normalize(14),
      color: theme.mode === 'dark' ? palette.seekerGreenLight : palette.seekerGreen,
    },
    contributorMeta: {
      marginTop: verticalScale(2),
      fontFamily: fonts.regular,
      fontSize: normalize(12),
      color: theme.colors.mutedText,
    },
    actionContainer: {
      marginTop: verticalScale(18),
    },
    interestedButton: {
      borderRadius: moderateScale(10),
      backgroundColor: palette.seekerGreen,
      paddingVertical: verticalScale(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    interestedText: {
      fontFamily: fonts.semiBold,
      fontSize: normalize(16),
      color: palette.white,
    },
    cancelInterestButton: {
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: palette.interestCancel,
      paddingVertical: verticalScale(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelInterestText: {
      fontFamily: fonts.semiBold,
      fontSize: normalize(16),
      color: palette.interestCancel,
    },
    doneButtonRow: {
      flexDirection: 'row',
      gap: moderateScale(10),
    },
    callButton: {
      flex: 1,
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: palette.gray750,
      backgroundColor: palette.gray750,
      paddingVertical: verticalScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: moderateScale(8),
    },
    chatButton: {
      flex: 1,
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: palette.seekerGreen,
      backgroundColor: palette.seekerGreen,
      paddingVertical: verticalScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: moderateScale(8),
    },
    callChatText: {
      fontFamily: fonts.semiBold,
      fontSize: normalize(16),
      color: palette.white,
    },
    reportButton: {
      marginTop: verticalScale(18),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(8),
    },
    reportText: {
      fontFamily: fonts.semiBold,
      fontSize: normalize(14),
      color: theme.colors.text,
      textDecorationLine: 'underline',
    },
  });
