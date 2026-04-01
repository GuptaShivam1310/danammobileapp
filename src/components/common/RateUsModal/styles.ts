import { StyleSheet } from 'react-native';
import { palette } from '../../../constants/colors';
import { moderateScale, verticalScale, normalize, scale } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';

export const styles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(20),
    },
    container: {
        width: '100%',
        backgroundColor: theme.colors.surface || palette.white,
        borderRadius: scale(20),
        padding: moderateScale(20),
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: verticalScale(16),
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: moderateScale(4),
    },
    title: {
        fontSize: normalize(20),
        fontFamily: fonts.bold,
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: normalize(20),
        paddingHorizontal: moderateScale(20),
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    star: {
        marginHorizontal: moderateScale(6),
    },
    tapText: {
        fontSize: normalize(12),
        fontFamily: fonts.regular,
        color: palette.gray600,
        textAlign: 'center',
        marginBottom: verticalScale(16),
        width: '60%',
    },
    submitButton: {
        width: '100%',
        marginTop: verticalScale(16),
    },
});
