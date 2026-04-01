import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { moderateScale, verticalScale, normalize } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        marginTop: verticalScale(spacing.md)
    },
    content: {
        paddingTop: verticalScale(spacing.lg),
        paddingBottom: verticalScale(100),
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: palette.wishListRowBorder,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(18),
        marginBottom: verticalScale(16),
    },
    itemTitle: {
        fontSize: normalize(15),
        fontFamily: fonts.medium,
        color: theme.colors.text,
    },
});
