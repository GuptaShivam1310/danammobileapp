import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale, normalize, scale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        marginTop: verticalScale(spacing.md)
    },
    headerContainer: {
        marginBottom: verticalScale(16),
    },
    content: {
        paddingBottom: verticalScale(100),
    },
    image: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: scale(16),
        marginBottom: verticalScale(20),
    },
    description: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        lineHeight: normalize(22),
        color: theme.colors.mutedText,
        marginBottom: verticalScale(24),
    },
    subtitle: {
        fontSize: normalize(18),
        fontFamily: fonts.bold,
        color: theme.colors.text,
        marginBottom: verticalScale(12),
    },
    helpDescription: {
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
        marginBottom: verticalScale(12),
    },
    bullet: {
        width: scale(4),
        height: scale(4),
        borderRadius: scale(2),
        backgroundColor: theme.colors.text,
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
