import { StyleSheet } from 'react-native';
import { darkTheme } from '../../../../theme/darkTheme';
import { fonts } from '../../../../theme/fonts';
import { lightTheme } from '../../../../theme/lightTheme';
import { normalize } from '../../../../theme/scale';

type AppTheme = typeof lightTheme | typeof darkTheme;

export function createSeekerDashboardDualFlowStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      paddingTop: normalize(16),
      position: 'relative',
    },
    cardWrap: {
      width: '100%',
      alignItems: 'center',
      marginBottom: normalize(30),
      zIndex: 2,
    },
    titlePrimary: {
      marginTop: normalize(14),
      fontSize: normalize(16),
      fontFamily: fonts.semiBold,
      color: theme.colors.splashBackground,
      textAlign: 'center',
    },
    titleSecondary: {
      marginTop: normalize(3),
      fontSize: normalize(14),
      fontFamily: fonts.semiBold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    rowTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: normalize(14),
      columnGap: normalize(4),
    },
    rowTitlePrimary: {
      fontSize: normalize(16),
      fontFamily: fonts.semiBold,
      color: theme.colors.splashBackground,
      textAlign: 'center',
    },
    rowTitleSecondary: {
      fontSize: normalize(16),
      fontFamily: fonts.semiBold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    description: {
      marginTop: normalize(4),
      fontSize: normalize(13),
      lineHeight: normalize(15),
      fontFamily: fonts.regular,
      color: theme.colors.mutedText,
      textAlign: 'center',
      paddingHorizontal: normalize(22),
      maxWidth: normalize(290),
    },
    
    leftConnectorWrap: {
      width: normalize(123),
      height: normalize(282),
      position: 'absolute',
      top: normalize(400),
      left: 20,
      zIndex: 1,
    },
    rightConnectorSvg: {
      width: normalize(104),
      height: normalize(214),
    },
    leftConnectorSvg: {
      width: normalize(104),
      height: normalize(232),
    },
    cardGraphic: {
      resizeMode: 'contain',
    },
  });
}

export const createStyles = (topValue: number) =>
  StyleSheet.create({
    leftConnectorWrap: {
      width: normalize(123),
      height: normalize(250),
      position: 'absolute',
      top: normalize(topValue),
      left: 20,
      zIndex: 1,
    },
    rightConnectorWrap: {
      width: normalize(123),
      height: normalize(250),
      position: 'absolute',
      top: normalize(topValue),
      right: 20,
      zIndex: 1,
    },
  });