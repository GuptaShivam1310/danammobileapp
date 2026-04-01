import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from '../../../theme/scale';

export const createStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: moderateScale(300),
        backgroundColor: theme.colors.surface,
        borderRadius: moderateScale(16),
        padding: moderateScale(20),
        alignItems: 'center',
    },
    title: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: verticalScale(20),
        fontFamily: theme.typography.fontFamilyBold,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    optionText: {
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginLeft: moderateScale(15),
        fontFamily: theme.typography.fontFamilyRegular,
    },
    cancelButton: {
        marginTop: verticalScale(20),
        paddingVertical: verticalScale(10),
        width: '100%',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: theme.colors.danger,
        fontFamily: theme.typography.fontFamilyMedium,
    },
});
