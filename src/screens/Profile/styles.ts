import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { moderateScale, verticalScale, normalize } from '../../theme/scale';
import { fonts } from '../../theme/fonts';

export const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: verticalScale(100),
    },
    header: {
        paddingVertical: verticalScale(20),
    },
    headerTitle: {
        fontSize: normalize(24),
        fontFamily: fonts.bold,
        color: theme.colors.text,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: theme.colors.border,
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        borderWidth: 2,
        borderColor: theme.colors.surface,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: palette.blackPure,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    badgeImage: {
        width: moderateScale(12),
        height: moderateScale(12),
    },
    userInfo: {
        marginLeft: moderateScale(16),
        flex: 1,
    },
    userName: {
        fontSize: normalize(18),
        fontFamily: fonts.bold,
        color: theme.colors.text,
        marginBottom: verticalScale(4),
    },
    userEmail: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
        marginBottom: verticalScale(12),
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.brandGreen,
        borderRadius: moderateScale(8),
        paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(6),
        alignSelf: 'flex-start',
    },
    editButtonText: {
        fontSize: normalize(12),
        fontFamily: fonts.medium,
        color: theme.colors.brandGreen,
        marginLeft: moderateScale(6),
    },
    optionsList: {
        paddingHorizontal: moderateScale(8),
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: theme.colors.surface,
        borderRadius: moderateScale(12),
        padding: moderateScale(5),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconBg: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLabel: {
        flex: 1,
        fontSize: normalize(16),
        fontFamily: fonts.medium,
        color: theme.colors.text,
        marginLeft: moderateScale(16),
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: verticalScale(20),
        alignItems: 'center',
    },
    versionText: {
        fontSize: normalize(14),
        fontFamily: fonts.regular,
        color: theme.colors.mutedText,
    },
});
