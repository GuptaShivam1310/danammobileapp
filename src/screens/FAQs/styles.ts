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
    faqItem: {
        borderWidth: 1,
        borderRadius: scale(12),
        marginBottom: verticalScale(16),
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(16),
    },
    question: {
        flex: 1,
        fontSize: normalize(15),
        fontFamily: fonts.semiBold,
        marginRight: moderateScale(10),
    },
    answerContainer: {
        paddingHorizontal: moderateScale(16),
        paddingBottom: moderateScale(16),
    },
    answer: {
        fontSize: normalize(13),
        fontFamily: fonts.regular,
        lineHeight: normalize(18),
        color: theme.colors.mutedText,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(20),
    },
    emptyText: {
        fontSize: normalize(16),
        fontFamily: fonts.medium,
        textAlign: 'center',
    },
    errorText: {
        fontSize: normalize(14),
        fontFamily: fonts.medium,
        textAlign: 'center',
    },
});
