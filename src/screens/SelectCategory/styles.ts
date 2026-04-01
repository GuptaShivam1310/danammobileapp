import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

export const styles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: verticalScale(spacing.lg),
        },
        closeButton: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: moderateScale(12),
            width: scale(40),
            height: scale(40),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
        },
        headerTitleContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        headerTitle: {
            fontFamily: fonts.bold,
            fontSize: moderateScale(20),
            color: theme.colors.text,
        },
        listContent: {
            paddingVertical: spacing.sm,
            paddingBottom: verticalScale(100),
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: verticalScale(spacing.xs),
            paddingHorizontal: spacing.sm,
            marginBottom: verticalScale(spacing.md),
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: moderateScale(12),
        },
        selectedCategoryItem: {
            borderColor: theme.colors.brandGreen,
            borderWidth: moderateScale(2),
        },
        categoryImage: {
            width: scale(40),
            height: scale(40),
            borderRadius: moderateScale(12),
            padding: moderateScale(4)
        },
        categoryTextContainer: {
            flex: 1,
        },
        categoryText: {
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
        categoryImageContainer: {
            marginRight: spacing.md,
        }
    });
