import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { moderateScale, normalize, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { ScreenHeight } from 'react-native-elements/dist/helpers';
import { spacing } from '../../theme/spacing';

export const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: verticalScale(spacing.lg),
    },
    listContent: {
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(100),
    },
    seekerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: moderateScale(16),
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: palette.gray100, // light grey border for unselected
      marginBottom: verticalScale(12),
      backgroundColor: theme.colors.surface,
    },
    seekerItemSelected: {
      borderColor: theme.colors.brandGreen, // green border for selected
      backgroundColor: palette.greenLight, // subtle green background
    },
    avatarContainer: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: palette.blue50,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(16),
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      fontSize: normalize(18),
      fontFamily: fonts.bold,
      color: palette.gray700,
    },
    nameText: {
      flex: 1,
      fontSize: normalize(16),
      fontFamily: fonts.semiBold,
      color: theme.colors.text,
    },
    radioContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(4),
    },
    radioCircle: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(12),
      borderWidth: 2,
      borderColor: palette.gray300, // unselected gray out
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioCircleSelected: {
      borderColor: theme.colors.brandGreen,
    },
    radioInner: {
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: moderateScale(6),
      backgroundColor: theme.colors.brandGreen,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: ScreenHeight / 3,
    },
    emptyText: {
      fontSize: normalize(16),
      fontFamily: fonts.medium,
      color: palette.gray500,
      textAlign: 'center',
      lineHeight: normalize(24),
    },
  });
