import { StyleSheet } from 'react-native';
import { normalize, scale, verticalScale, moderateScale } from '../../theme/scale';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        // --- Header ---
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: scale(spacing.sm),
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        backButton: {
            width: scale(40),
            height: scale(40),
            borderRadius: scale(12),
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginRight: spacing.sm,
        },
        userAvatar: {
            width: scale(36),
            height: scale(36),
            borderRadius: scale(18),
            marginRight: spacing.sm,
        },
        userName: {
            fontFamily: fonts.semiBold,
            fontSize: normalize(18),
            color: theme.colors.text,
        },
        headerInfo: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        optionsButton: {
            padding: spacing.xs,
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        typingContainer: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
        },
        typingText: {
            fontSize: normalize(12),
            fontFamily: fonts.regular,
            color: theme.colors.mutedText,
            fontStyle: 'italic',
        },
        // --- Product Sub-header ---
        productSubHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.lightGreenishGray,
            marginVertical: spacing.md,
            padding: spacing.sm,
            borderRadius: moderateScale(12),
        },
        productImage: {
            width: scale(50),
            height: scale(50),
            borderRadius: moderateScale(8),
            marginRight: spacing.sm,
        },
        productTitle: {
            flex: 1,
            fontFamily: fonts.medium,
            fontSize: normalize(14),
            color: theme.colors.text,
        },
        // --- Messages ---
        listContent: {
            paddingBottom: spacing.xl,
        },
        // --- Dropdown ---
        reportDropdown: {
            position: 'absolute',
            top: verticalScale(50),
            right: spacing.md,
            backgroundColor: theme.colors.surface,
            padding: spacing.sm,
            borderRadius: moderateScale(8),
            shadowColor: palette.blackPure,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 1000,
        },
        reportText: {
            fontFamily: fonts.medium,
            fontSize: normalize(14),
            color: theme.colors.text,
        },
    });
