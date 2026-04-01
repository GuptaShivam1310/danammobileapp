import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

export const styles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            marginTop: verticalScale(spacing.lg),
        },
        content: {
            flex: 1,
            paddingVertical: verticalScale(spacing.lg),
        },
        inputContainer: {
            marginBottom: verticalScale(spacing.xl),
        },
        label: {
            fontFamily: fonts.medium,
            fontSize: moderateScale(14),
            color: theme.colors.text,
            marginBottom: verticalScale(spacing.xs),
        },
        limitContainer: {
            alignItems: 'flex-end',
            marginTop: verticalScale(spacing.xs),
        },
        limitText: {
            fontFamily: fonts.regular,
            fontSize: moderateScale(12),
            color: theme.colors.mutedText,
        },
        descriptionInput: {
            height: verticalScale(120),
            textAlignVertical: 'top',
        },
        footer: {
            paddingVertical: verticalScale(spacing.lg),
            paddingBottom: verticalScale(spacing.xl),
        },
    });
