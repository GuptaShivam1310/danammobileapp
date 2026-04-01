import { StyleSheet } from 'react-native';
import { darkTheme } from '../../theme/darkTheme';
import { fonts } from '../../theme/fonts';
import { lightTheme } from '../../theme/lightTheme';
import { normalize } from '../../theme/scale';

type AppTheme = typeof lightTheme | typeof darkTheme;



export function createSeekerLandingStyles(theme: AppTheme, impactSlideWidth: number) {
  return StyleSheet.create({
    screenContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    bodyContainer: {
      flex: 0.7,
      marginTop: -20,
      backgroundColor: theme.colors.surface,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      overflow: 'hidden',
    },
    howItWorksTitle: {
      marginTop: normalize(10),
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: fonts.semiBold,
      fontSize: 15,
    },
    stepsContainer: {
      flexGrow: 1,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
    },

    impactTitle: {
      marginTop: normalize(30),
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: fonts.semiBold,
      fontSize: normalize(20),
    },
    impactCarouselContainer: {
      width: '100%',
      marginTop: normalize(30),
      borderTopRightRadius: normalize(40),
      overflow: 'hidden',
      backgroundColor: theme.colors.splashBackground,
    },
    impactSlide: {
      width: impactSlideWidth,
    },
    impactImage: {
      width: '100%',
      height: normalize(200),
    },
    impactTextWrap: {
      paddingHorizontal: normalize(16),
      paddingTop: normalize(16),
      paddingBottom: normalize(18),
      alignItems: 'center',
    },
    sectionHorizontalPadding: {
      width: '100%',
      paddingHorizontal: normalize(10),
    },
    impactCardTitle: {
      textAlign: 'center',
      color: theme.colors.surface,
      fontFamily: fonts.medium,
      fontSize: normalize(15),
      lineHeight: normalize(28),
    },
    impactCardSubtitle: {
      marginTop: normalize(10),
      textAlign: 'center',
      color: theme.colors.surface,
      fontFamily: fonts.regular,
      fontSize: normalize(12),
      lineHeight: normalize(20),
      opacity: 0.9,
    },
    carouselDotsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: normalize(12),
      marginBottom: normalize(12),
    },
    carouselDot: {
      width: normalize(6),
      height: normalize(6),
      borderRadius: normalize(3),
      backgroundColor: theme.colors.seekerDotInactive,
      marginLeft: normalize(6),
    },
    carouselDotFirst: {
      marginLeft: 0,
    },
    impactDotActive: {
      width: normalize(14),
      borderRadius: normalize(4),
      backgroundColor: theme.colors.seekerImpactDotActive,
    },
    whyDotActive: {
      width: normalize(14),
      borderRadius: normalize(4),
      backgroundColor: theme.colors.seekerWhyDotActive,
    },
    whyChooseTitleWrap: {
      marginTop: normalize(30),
    },
    whyChooseTitle: {
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: fonts.semiBold,
      fontSize: normalize(24),
      lineHeight: normalize(30),
    },
    whyChooseCarouselWrap: {
      marginTop: normalize(10),
      width: '100%',
    },
    whyChooseCard: {
      borderRadius: normalize(100),
      backgroundColor: theme.colors.softSurface,
      width: normalize(150),
      minHeight: normalize(210),
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(16),
      alignItems: 'center',
      marginRight: normalize(14),
    },
    whyChooseIconWrap: {
      width: normalize(64),
      height: normalize(64),
      borderRadius: normalize(32),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    whyChooseIcon: {
      width: normalize(30),
      height: normalize(30),
    },
    whyChooseCardTitle: {
      marginTop: normalize(8),
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: fonts.bold,
      fontSize: normalize(14),
      lineHeight: normalize(22),
    },
    whyChooseCardSubtitle: {
      marginTop: normalize(6),
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: fonts.regular,
      fontSize: normalize(10),
      lineHeight: normalize(15),
      opacity: 0.9,
    },
    actionWrap: {
      marginTop: normalize(30),
      width: '100%',
      marginBottom: normalize(8),
      paddingHorizontal: normalize(10),
    },
    actionGradientBorder: {
      borderRadius: normalize(10),
      overflow: 'hidden',
      padding: normalize(1.5),
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    actionGradientSvg: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    actionButton: {
      width: '100%',
      minHeight: normalize(54),
      borderRadius: normalize(10),
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: normalize(16),
      
    },
    actionTitle: {
      color: theme.colors.text,
      fontFamily: fonts.bold,
      fontSize: normalize(18),
      lineHeight: normalize(24),
    },
    actionArrow: {
      width: normalize(20),
      height: normalize(20),
    },
  });
}
