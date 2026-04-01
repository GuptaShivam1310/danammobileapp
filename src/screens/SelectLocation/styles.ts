import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from '../../theme/scale';
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
            paddingTop: verticalScale(spacing.lg),
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: verticalScale(spacing.lg),
        },
        headerTitle: {
            fontSize: moderateScale(18),
            fontFamily: fonts.bold,
            color: theme.colors.text,
            marginLeft: spacing.md,
        },
        searchContainer: {
            flex: 0,
            marginBottom: verticalScale(spacing.lg),
        },
        textInputContainer: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderRadius: moderateScale(16),
            borderWidth: 1,
            borderColor: theme.colors.border,
            height: verticalScale(48),
            alignItems: 'center',
            paddingHorizontal: moderateScale(spacing.md),
        },
        searchInput: {
            backgroundColor: 'transparent',
            height: verticalScale(48),
            fontFamily: fonts.regular,
            fontSize: moderateScale(14),
            color: theme.colors.text,
            flex: 1,
            paddingHorizontal: 0,
            marginHorizontal: 0,
            paddingLeft: moderateScale(spacing.sm),
        },
        listView: {
            backgroundColor: theme.colors.surface,
            borderRadius: moderateScale(12),
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginTop: spacing.xs,
            elevation: 3,
            zIndex: 1000,
        },
        row: {
            padding: spacing.md,
            height: 'auto',
        },
        separator: {
            height: 1,
            backgroundColor: theme.colors.border,
        },
        description: {
            fontFamily: fonts.regular,
            fontSize: moderateScale(14),
            color: theme.colors.text,
        },
        locationCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: moderateScale(12),
            padding: spacing.md,
            backgroundColor: theme.colors.surface,
            marginBottom: spacing.lg,
        },
        locationInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        iconContainer: {
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: moderateScale(20),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.sm,
            backgroundColor: theme.colors.brandGreen + '10',
        },
        textContainer: {
            flex: 1,
        },
        locationTitle: {
            fontFamily: fonts.semiBold,
            fontSize: moderateScale(16),
            color: theme.colors.brandGreen,
        },
        locationSubtitle: {
            fontFamily: fonts.regular,
            color: theme.colors.mutedText,
            fontSize: moderateScale(12),
            marginTop: verticalScale(2),
        },
        footer: {
            paddingVertical: spacing.lg,
            paddingBottom: verticalScale(spacing.xl),
        },
    });