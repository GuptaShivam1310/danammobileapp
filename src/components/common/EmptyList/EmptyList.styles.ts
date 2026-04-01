import { StyleSheet } from 'react-native';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';

export const createEmptyListStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    iconContainer: {
      marginBottom: verticalScale(24),
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: normalize(20),
      color: theme.colors.text,
      textAlign: 'center',
    },
    subTitle: {
      marginTop: verticalScale(8),
      marginBottom: verticalScale(32),
      fontFamily: fonts.medium,
      fontSize: normalize(16),
      color: theme.colors.mutedText,
      textAlign: 'center',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(24),
      borderWidth: 1,
      borderRadius: normalize(8),
      borderColor: theme.colors.brandGreen,
    },
    buttonText: {
      fontSize: normalize(16),
      fontFamily: fonts.semiBold,
      marginRight: scale(8),
      color: theme.colors.brandGreen,
    },
  });
