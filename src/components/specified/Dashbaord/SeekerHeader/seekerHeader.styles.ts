import { StyleSheet } from 'react-native';
import { darkTheme } from '../../../../theme/darkTheme';
import { fonts } from '../../../../theme/fonts';
import { lightTheme } from '../../../../theme/lightTheme';
import { normalize, scale } from '../../../../theme/scale';

type AppTheme = typeof lightTheme | typeof darkTheme;

export const createSeekerHeaderStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerContainer: {
      flex: 0.3,
      backgroundColor: theme.colors.splashBackground,
    },
    headerBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    logo: {
      width: scale(120),
      height: normalize(40),
      resizeMode: 'contain',
    },
    title: {
      marginTop: normalize(10),
      color: theme.colors.surface,
      fontFamily: fonts.medium,
      fontSize: normalize(15),
      textAlign: 'center',
    },
    subtitle: {
      marginTop: normalize(10),
      color: theme.colors.accentYellow,
      fontFamily: fonts.medium,
      fontSize: normalize(20),
      textAlign: 'center',
    },
  });
