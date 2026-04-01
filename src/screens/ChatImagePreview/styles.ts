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
            backgroundColor: palette.black, // Overlay typically stays as RGBA
        },
        backButton: {
            width: scale(40),
            height: scale(40),
            justifyContent: 'center',
            alignItems: 'center',
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
        imageContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        previewImage: {
            width: '100%',
            height: '100%',
        },
        footer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(16),
            paddingVertical: verticalScale(16),
            backgroundColor: palette.black,
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
