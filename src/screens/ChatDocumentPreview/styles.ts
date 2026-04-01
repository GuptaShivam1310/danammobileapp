import { StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../theme/scale';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';

export const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.blackPure,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            height: verticalScale(60),
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        backButton: {
            width: scale(40),
            height: scale(40),
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: scale(8),
        },
        headerInfo: {
            marginLeft: scale(8),
            flex: 1,
        },
        userName: {
            fontSize: moderateScale(18),
            fontFamily: fonts.semiBold,
            color: palette.white,
        },
        contentContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: scale(20),
        },
        docIconContainer: {
            width: scale(100),
            height: scale(120),
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: moderateScale(10),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: scale(20),
        },
        docName: {
            fontSize: moderateScale(16),
            fontFamily: fonts.medium,
            color: palette.white,
            textAlign: 'center',
            marginBottom: scale(8),
        },
        docInfo: {
            fontSize: moderateScale(14),
            fontFamily: fonts.regular,
            color: palette.gray400,
            textAlign: 'center',
        },
        footer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(16),
            paddingVertical: verticalScale(16),
            backgroundColor: 'rgba(0,0,0,0.6)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
        sendButton: {
            width: scale(56),
            height: scale(56),
            borderRadius: scale(28),
            backgroundColor: theme.colors.brandGreen,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 'auto',
        },
    });
