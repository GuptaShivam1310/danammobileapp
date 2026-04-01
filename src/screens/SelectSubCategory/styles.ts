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
        listContent: {
            marginTop: verticalScale(spacing.sm),
            paddingVertical: verticalScale(spacing.sm),
            paddingBottom: verticalScale(spacing.xl),
        },
        subCategoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: verticalScale(spacing.md),
            paddingHorizontal: spacing.md,
            marginBottom: verticalScale(spacing.md),
            backgroundColor: theme.colors.surface,
            borderRadius: moderateScale(12),
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        selectedSubCategoryItem: {
            borderColor: theme.colors.brandGreen,
            borderWidth: moderateScale(2),
        },
        subCategoryTextContainer: {
            flex: 1,
        },
        subCategoryText: {
            fontFamily: fonts.medium,
            fontSize: moderateScale(16),
            color: theme.colors.text,
        },
        rightIconContainer: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorText: {
            fontFamily: fonts.regular,
            fontSize: moderateScale(14),
            color: theme.colors.danger,
            marginTop: spacing.md,
        },
        emptyText: {
            fontFamily: fonts.regular,
            fontSize: moderateScale(14),
            color: theme.colors.mutedText,
        },
    });
