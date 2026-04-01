import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
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
    list: {
        marginTop: verticalScale(spacing.sm),
        paddingBottom: verticalScale(100),
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: palette.gray100,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: normalize(16),
        fontFamily: fonts.medium,
        color: theme.colors.text,
    },
    settingDesc: {
        fontSize: normalize(12),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
        marginTop: verticalScale(2),
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: normalize(12),
        fontFamily: fonts.medium,
        color: theme.colors.mutedText,
        marginRight: moderateScale(8),
    },
    deleteSection: {
        marginTop: verticalScale(24),
        borderWidth: 1,
        borderColor: palette.gray100,
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(16),
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteInfo: {
        flex: 1,
    },
    deleteTitle: {
        fontSize: normalize(16),
        fontFamily: fonts.medium,
        color: theme.colors.text,
    },
    deleteDesc: {
        fontSize: normalize(12),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
        marginTop: verticalScale(2),
    },
});
