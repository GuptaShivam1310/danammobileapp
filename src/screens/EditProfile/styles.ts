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
        marginTop: verticalScale(spacing.lg)
    },
    content: {
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(100),
    },
    phoneSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneInputContainer: {
        flex: 1,
        marginLeft: moderateScale(10),
    },
    saveButton: {
        backgroundColor: theme.colors.brandGreen,
        borderRadius: moderateScale(8),
        height: verticalScale(54),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(32),
    },
    saveButtonText: {
        fontSize: normalize(16),
        fontFamily: fonts.bold,
        color: 'white',
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '500',
        marginBottom: verticalScale(spacing.xs),
    },
});
