import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';
import { moderateScale, normalize, scale, verticalScale } from '../../theme/scale';
import { authUiColors } from '../../constants/colors';
import { spacing } from '../../theme/spacing';

export const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },

        // ─── Header ─────────────────────────────────────────────
        header: {
            paddingHorizontal: scale(spacing.xs),
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(8),
        },
        headerTitle: {
            fontSize: normalize(28),
            fontFamily: fonts.bold,
            color: colors.text,
        },

        // ─── Search Bar ──────────────────────────────────────────
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: normalize(12),
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: scale(spacing.xs),
            marginBottom: verticalScale(6),
            paddingHorizontal: scale(14),
            paddingVertical: verticalScale(12),
        },
        searchIcon: {
            marginRight: scale(8),
        },
        searchInput: {
            flex: 1,
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: colors.text,
            padding: 0,
            margin: 0,
        },

        // ─── List ────────────────────────────────────────────────
        listContent: {
            paddingBottom: verticalScale(100),
            flexGrow: 1,
        },

        // ─── Divider ─────────────────────────────────────────────
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginLeft: scale(16)
        },

        // ─── Chat Item ───────────────────────────────────────────
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(spacing.xs),
            paddingVertical: verticalScale(16),
        },
        productImage: {
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(12),
            backgroundColor: colors.border,
            resizeMode: 'cover',
        },
        itemBody: {
            flex: 1,
            marginLeft: scale(12),
            justifyContent: 'center',
        },
        productTitle: {
            fontSize: normalize(15),
            fontFamily: fonts.semiBold,
            color: colors.text,
            lineHeight: normalize(20),
        },
        seekerCount: {
            fontSize: normalize(12),
            fontFamily: fonts.medium,
            color: colors.mutedText,
        },

        // ─── Right column: dot at top, count at bottom ───────────
        itemRight: {
            height: moderateScale(44), // Match approximate title block height
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginLeft: scale(8),
        },
        dotTimeRow: {
            alignItems: 'flex-end',
        },
        unreadDot: {
            width: moderateScale(10),
            height: moderateScale(10),
            borderRadius: moderateScale(5),
            backgroundColor: colors.brandGreen,
        },
        timeText: {
            fontSize: normalize(12),
            fontFamily: fonts.regular,
            color: colors.mutedText,
        },

        // ─── Loading / Error ─────────────────────────────────────
        centeredState: {
            flex: 1,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            padding: scale(spacing.lg),
        },
        errorText: {
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: colors.danger,
            textAlign: 'center' as const,
            marginBottom: verticalScale(16),
        },
        retryButton: {
            paddingHorizontal: scale(24),
            paddingVertical: verticalScale(10),
            borderRadius: normalize(8),
            backgroundColor: colors.brandGreen,
        },
        retryText: {
            fontSize: normalize(14),
            fontFamily: fonts.semiBold,
            color: '#FFFFFF',
        },

        // ─── Empty State ─────────────────────────────────────────
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: scale(32),
        },
        emptyTitle: {
            fontSize: normalize(18),
            fontFamily: fonts.bold,
            color: colors.text,
            marginTop: verticalScale(16),
        },
        emptySubtitle: {
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: colors.mutedText,
            marginTop: verticalScale(8),
            textAlign: 'center',
            paddingHorizontal: scale(32),
        },
    });
