import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale, normalize } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';

export const styles = (theme: any) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: moderateScale(8),
        // paddingVertical: verticalScale(10),
    },
    backButton: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(16),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontFamily: fonts.bold,
        color: theme.colors.text,
    },
});
