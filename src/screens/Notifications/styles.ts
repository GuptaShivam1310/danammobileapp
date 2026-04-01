import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { normalize, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';

export const createNotificationStyles = () =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.white,
    },
    container: {
      flex: 1,
      backgroundColor: palette.white,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(spacing.lg),
      marginTop: verticalScale(10),
      marginBottom: verticalScale(8),
    },
    backButton: {
      width: scale(42),
      height: scale(42),
      borderRadius: normalize(12),
      borderWidth: 1,
      borderColor: palette.seekerGreen20,
      backgroundColor: palette.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      marginLeft: scale(12),
      fontSize: normalize(22),
      fontWeight: '800',
      color: palette.gray750,
    },
    listContent: {
      paddingBottom: verticalScale(spacing.lg),
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: scale(spacing.lg),
      paddingVertical: verticalScale(spacing.md),
      minHeight: verticalScale(95),
    },
    itemHighlight: {
      backgroundColor: palette.notificationRowBg,
    },
    iconContainer: {
      width: scale(44),
      height: scale(44),
      borderRadius: normalize(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: scale(spacing.md),
    },
    textContainer: {
      flex: 1,
      paddingRight: scale(spacing.sm),
    },
    bodyText: {
      fontSize: normalize(15),
      lineHeight: normalize(22),
      color: palette.gray750,
      fontWeight: '400',
    },
    titleText: {
      fontSize: normalize(15),
      lineHeight: normalize(22),
      color: palette.gray750,
      fontWeight: '600',
      marginTop: verticalScale(2),
    },
    highlightText: {
      color: palette.seekerGreen,
      fontWeight: '700',
    },
    timeText: {
      marginTop: verticalScale(6),
      fontSize: normalize(13),
      lineHeight: normalize(19),
      color: palette.notificationMutedText,
      fontWeight: '500',
    },
    unreadDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
      backgroundColor: palette.seekerGreen,
      marginTop: verticalScale(6),
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(spacing.lg),
      marginTop: verticalScale(spacing.xl),
    },
    emptyTitle: {
      fontSize: normalize(16),
      fontWeight: '600',
      color: palette.gray750,
      marginBottom: verticalScale(4),
    },
    emptySubtitle: {
      fontSize: normalize(14),
      color: palette.notificationMutedText,
    },
    errorText: {
      fontSize: normalize(14),
      color: palette.red600,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: verticalScale(spacing.xl),
    },
    iconImage: {
      width: scale(44),
      height: scale(44),
      borderRadius: normalize(12),
    },
  });
