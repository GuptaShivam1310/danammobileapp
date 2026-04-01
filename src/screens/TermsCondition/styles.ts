import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale, normalize, scale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { authUiColors, palette } from '../../constants/colors';

export const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: moderateScale(8),
    },
    content: {
        paddingHorizontal: moderateScale(16),
        paddingBottom: verticalScale(100),
    },
    introText: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        lineHeight: normalize(22),
        color: theme.colors.mutedText,
        marginTop: verticalScale(10),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontFamily: fonts.bold,
        color: theme.colors.text,
        marginTop: verticalScale(24),
        marginBottom: verticalScale(12),
    },
    sectionContent: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        lineHeight: normalize(22),
        color: theme.colors.mutedText,
        marginBottom: verticalScale(16),
    },
    bulletContainer: {
        paddingLeft: moderateScale(8),
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    bullet: {
        width: scale(4),
        height: scale(4),
        borderRadius: scale(2),
        backgroundColor: palette.black,
        marginRight: moderateScale(12),
    },
    bulletText: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(20),
    },
    errorText: {
        fontSize: normalize(14),
        fontFamily: fonts.medium,
        textAlign: 'center',
    },
});
