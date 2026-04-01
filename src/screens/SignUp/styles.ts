import { StyleSheet } from 'react-native';
import { authUiColors, palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { normalize, verticalScale, moderateScale } from '../../theme/scale';

export const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: moderateScale(spacing.xl),
            paddingBottom: verticalScale(spacing.xxl),
            backgroundColor: theme.colors.background,
        },
        logo: {
            width: moderateScale(120),
            height: verticalScale(40),
            marginBottom: verticalScale(spacing.xxl),
            marginTop: verticalScale(spacing.md),
            tintColor: theme.colors.text,
        },
        title: {
            fontFamily: fonts.bold,
            fontSize: normalize(28),
            color: theme.colors.text,
            marginBottom: verticalScale(spacing.xs),
        },
        subtitle: {
            fontFamily: fonts.regular,
            fontSize: normalize(14),
            color: theme.colors.mutedText,
            marginBottom: verticalScale(spacing.xl),
        },
        profilePicPlaceholder: {
            width: moderateScale(120),
            height: moderateScale(120),
            borderRadius: moderateScale(60),
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: verticalScale(spacing.xl),
            overflow: 'hidden',
        },
        profileImage: {
            width: moderateScale(120),
            height: moderateScale(120),
            borderRadius: moderateScale(60),
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: moderateScale(spacing.md),
        },
        halfWidth: {
            flex: 1,
        },
        phoneNumberContainer: {
            flexDirection: 'row',
            gap: moderateScale(spacing.md),
            alignItems: 'flex-start',
        },
        countryCodeContainer: {
            width: moderateScale(110),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: moderateScale(spacing.md),
            height: verticalScale(48),
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: moderateScale(8),
            backgroundColor: theme.colors.surface,
        },
        phoneInputContainer: {
            flex: 1,
        },
        inputLabel: {
            fontFamily: fonts.medium,
            fontSize: normalize(14),
            color: theme.colors.text,
            marginBottom: verticalScale(spacing.xs),
        },
        input: {
            marginBottom: verticalScale(spacing.md),
        },
        button: {
            backgroundColor: theme.colors.brandGreen,
            height: verticalScale(54),
            borderRadius: moderateScale(8),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: verticalScale(spacing.lg),
        },
        buttonText: {
            fontFamily: fonts.bold,
            fontSize: normalize(16),
            color: '#FFFFFF',
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: verticalScale(spacing.xl),
        },
        footerText: {
            fontFamily: fonts.regular,
            fontSize: normalize(14),
            color: theme.colors.mutedText,
        },
        loginText: {
            fontFamily: fonts.bold,
            fontSize: normalize(14),
            color: theme.colors.brandGreen,
        },
        errorText: {
            color: theme.colors.danger,
            fontSize: normalize(12),
            marginTop: -verticalScale(spacing.sm),
            marginBottom: verticalScale(spacing.sm),
            marginLeft: moderateScale(spacing.xs),
        },
        cameraIconContainer: {
            position: 'absolute',
            bottom: verticalScale(8),
            right: moderateScale(8),
            backgroundColor: theme.colors.surface,
            borderRadius: moderateScale(12),
            padding: moderateScale(4),
            borderWidth: 1,
            borderColor: theme.colors.brandGreen,
        },
        profilePicRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: verticalScale(spacing.lg),
        },
        profileFieldsContainer: {
            flex: 1,
            marginLeft: moderateScale(spacing.lg),
        },
        fieldInput: {
            marginBottom: verticalScale(spacing.md),
        },
        countryCodeText: {
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: theme.colors.text,
        },
        flagCircle: {
            width: moderateScale(24),
            height: moderateScale(24),
            borderRadius: moderateScale(12),
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.border,
        },
        flagEmojiText: {
            fontSize: normalize(18),
            transform: [{ scale: 1.5 }],
        },
    });
