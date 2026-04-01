import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';
import { moderateScale, normalize, scale, verticalScale } from '../../theme/scale';
import { authUiColors } from '../../constants/colors';

export const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },

        // ─── Header ──────────────────────────────────────────────
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: verticalScale(12),
            paddingBottom: verticalScale(14),
        },
        backButton: {
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: moderateScale(10),
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: scale(12),
        },
        productImage: {
            width: scale(50),
            height: scale(50),
            borderRadius: moderateScale(12),
            resizeMode: 'contain',
            backgroundColor: colors.border,

        },
        productTitle: {
            flex: 1,
            fontSize: normalize(15),
            fontFamily: fonts.bold,
            color: colors.text,
            marginLeft: scale(10),
            lineHeight: normalize(22),
        },

        // ─── Search Bar ──────────────────────────────────────────
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: normalize(12),
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: verticalScale(8),
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
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginLeft: scale(16) + moderateScale(44) + scale(12),
        },

        // ─── Seeker Item ─────────────────────────────────────────
        seekerItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: verticalScale(14),
        },
        avatar: {
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(22),
            backgroundColor: colors.border,
            resizeMode: 'cover',
        },
        avatarPlaceholder: {
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(22),
            backgroundColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
        },
        seekerBody: {
            flex: 1,
            marginLeft: scale(12),
            justifyContent: 'center',
        },
        messageRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: verticalScale(4),
        },

        // Pending item
        seekerNamePending: {
            fontSize: normalize(14),
            fontFamily: fonts.semiBold,
            color: authUiColors.brandGreen,
        },

        // Active item
        seekerNameActive: {
            fontSize: normalize(14),
            fontFamily: fonts.semiBold,
            color: colors.text,
        },
        lastMessage: {
            fontSize: normalize(12),
            fontFamily: fonts.regular,
            color: colors.mutedText,
            marginTop: verticalScale(2),
        },

        // ─── Right Column ────────────────────────────────────────
        seekerRight: {
            alignItems: 'flex-end',
            justifyContent: 'center',
            marginLeft: scale(8),
        },
        viewRequestButton: {
            borderWidth: 1,
            borderColor: authUiColors.brandGreen,
            borderRadius: moderateScale(8),
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(6),
        },
        viewRequestText: {
            fontSize: normalize(12),
            fontFamily: fonts.semiBold,
            color: authUiColors.brandGreen,
        },
        timestampText: {
            fontSize: normalize(11),
            fontFamily: fonts.regular,
            color: colors.mutedText,
            marginLeft: scale(10),
        },

        // ─── Loading / Error / Empty ──────────────────────────────
        centeredState: {
            flex: 1,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            padding: scale(24),
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
            backgroundColor: authUiColors.brandGreen,
        },
        retryText: {
            fontSize: normalize(14),
            fontFamily: fonts.semiBold,
            color: '#FFFFFF',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: verticalScale(60),
            paddingHorizontal: scale(32),
        },
        emptyIcon: {
            marginBottom: verticalScale(16),
            color: colors.border,
        },
        emptyTitle: {
            fontSize: normalize(16),
            fontFamily: fonts.bold,
            color: colors.text,
            textAlign: 'center',
            marginBottom: verticalScale(8),
        },
        emptyDescription: {
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: colors.mutedText,
            textAlign: 'center',
        },
    });
