import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';
import { normalize, scale, verticalScale } from '../../theme/scale';

export const createSeekerDashboardScreenStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: verticalScale(12),
      // flex: 1,
    },
    emptyListContent: {
      flexGrow: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(12),
    },
    headerTitle: {
      flex: 1,
      fontFamily: fonts.extraBold,
      fontSize: normalize(20),
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: scale(12),
    },
    resetButton: {
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(6),
      marginRight: scale(8),
    },
    resetButtonDisabled: {
      opacity: 0.7,
    },
    resetText: {
      fontFamily: fonts.medium,
      fontSize: normalize(14),
      color: palette.resetText,
    },
    notificationButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: normalize(10),
      borderWidth: 1,
      borderColor: palette.gray200,
      backgroundColor: palette.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    card: {
      width: '48%',
      marginBottom: verticalScale(16),
    },
    imageWrapper: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: verticalScale(158),
      borderRadius: normalize(12),
      backgroundColor: palette.gray200,
    },
    heartButton: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
      width: scale(24),
      height: scale(24),
      borderRadius: normalize(10),
      backgroundColor: palette.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      marginTop: verticalScale(8),
    },
    cardTitle: {
      fontFamily: fonts.medium,
      fontSize: normalize(14),
      lineHeight: normalize(18),
      color: theme.colors.text,
    },
    cardDate: {
      marginTop: verticalScale(4),
      fontFamily: fonts.regular,
      fontSize: normalize(12),
      color: theme.colors.mutedText,
    },
    emptyStateContainer: {
      flex: 1,
      minHeight: verticalScale(360),
    },
    loaderContainer: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.white,
      borderRadius: normalize(10),
      paddingVertical: verticalScale(4),
      paddingHorizontal: scale(12),
      position: "absolute",
      bottom: scale(60),
    },
    loaderText: {
      marginLeft: scale(6),
      fontFamily: fonts.medium,
      fontSize: normalize(10),
      color: theme.colors.mutedText,
    },
  });
