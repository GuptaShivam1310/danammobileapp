import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale, normalize } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    topSpacing:{
        marginTop: verticalScale(spacing.md)
    },
    form: {
        marginTop: verticalScale(spacing.lg),
    },
    updateButton: {
        backgroundColor: theme.colors.brandGreen,
        borderRadius: moderateScale(8),
        height: verticalScale(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(32),
    },
    updateButtonText: {
        fontSize: normalize(16),
        fontFamily: fonts.bold,
        color: 'white',
    },
});
