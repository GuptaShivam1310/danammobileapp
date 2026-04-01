import { StyleSheet } from 'react-native';
import { normalize, scale, verticalScale, moderateScale } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';
import { spacing } from '../../../theme/spacing';

export const createStyles = (theme: any) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.md,
        },
        keyboardAvoidingContainer: {
            width: '100%',
            alignItems: 'center',
        },
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: moderateScale(20),
            padding: spacing.lg,
            width: '100%',
            maxWidth: scale(380),
        },
        title: {
            fontFamily: fonts.bold,
            fontSize: normalize(20),
            color: theme.colors.text,
            marginBottom: spacing.sm,
        },
        description: {
            fontFamily: fonts.regular,
            fontSize: normalize(14),
            color: theme.colors.mutedText,
            lineHeight: normalize(20),
            marginBottom: spacing.lg,
        },
        input: {
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: moderateScale(12),
            padding: spacing.md,
            height: verticalScale(120),
            fontFamily: fonts.regular,
            fontSize: normalize(14),
            color: theme.colors.text,
            textAlignVertical: 'top',
            marginBottom: spacing.xl,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        button: {
            flex: 0.48,
            height: verticalScale(45),
            borderRadius: moderateScale(10),
            justifyContent: 'center',
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.text,
        },
        reportButton: {
            backgroundColor: theme.colors.brandGreen,
        },
        disabledButton: {
            opacity: 0.5,
        },
        cancelText: {
            fontFamily: fonts.semiBold,
            fontSize: normalize(14),
            color: theme.colors.text,
        },
        reportText: {
            fontFamily: fonts.semiBold,
            fontSize: normalize(14),
            color: '#FFFFFF',
        },
    });
