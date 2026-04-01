import { StyleSheet, Dimensions } from 'react-native';
import { moderateScale, normalize, verticalScale } from '../../theme/scale';
import { palette } from '../../constants/colors';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

export const styles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: verticalScale(16),
            backgroundColor: 'transparent',
        },
        iconButton: {
            width: moderateScale(44),
            height: moderateScale(44),
            borderRadius: moderateScale(12),
            borderWidth: 1,
            borderColor: palette.gray300,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: normalize(18),
            fontFamily: fonts.bold,
            color: theme.colors.text,
            textAlign: 'center',
            flex: 1,
        },
        contentScroll: {
            flexGrow: 1,
            paddingBottom: verticalScale(40),
        },
        title: {
            fontSize: normalize(24),
            fontFamily: fonts.bold,
            color: theme.colors.text,
            marginTop: verticalScale(8),
            lineHeight: normalize(32),
        },
        metaContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: verticalScale(12),
        },
        categoryBadge: {
            backgroundColor: palette.blue50,
            paddingHorizontal: moderateScale(12),
            paddingVertical: verticalScale(6),
            borderRadius: moderateScale(12),
        },
        categoryText: {
            fontSize: normalize(12),
            fontFamily: fonts.medium,
            color: palette.gray700,
        },
        dateText: {
            fontSize: normalize(12),
            fontFamily: fonts.regular,
            color: theme.colors.mutedText,
            marginLeft: moderateScale(8),
        },
        actionsContainer: {
            flexDirection: 'row',
            marginTop: verticalScale(20),
            gap: moderateScale(16),
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: verticalScale(12),
            borderRadius: moderateScale(12),
            borderWidth: 1,
            borderColor: palette.gray100,
            gap: moderateScale(8),
        },
        actionButtonText: {
            fontSize: normalize(14),
            fontFamily: fonts.medium,
            color: theme.colors.text,
        },
        carouselWrapper: {
            marginTop: verticalScale(12),
        },
        imageContainer: {
            width: width - moderateScale(30),
            height: verticalScale(250),
            borderRadius: moderateScale(16),
            overflow: 'visible',
            paddingRight: 10
        },
        image: {
            width: '100%',
            height: '100%',
            borderRadius: moderateScale(16),
        },
        imageOverlay: {
            position: 'absolute',
            bottom: moderateScale(16),
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        dot: {
            width: moderateScale(8),
            height: moderateScale(8),
            borderRadius: moderateScale(4),
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            marginHorizontal: moderateScale(4),
        },
        activeDot: {
            width: moderateScale(24),
            backgroundColor: palette.white,
        },
        counterBadge: {
            position: 'absolute',
            bottom: moderateScale(16),
            right: moderateScale(16),
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            paddingHorizontal: moderateScale(10),
            paddingVertical: verticalScale(4),
            borderRadius: moderateScale(12),
        },
        counterText: {
            color: palette.white,
            fontSize: normalize(12),
            fontFamily: fonts.medium,
        },
        description: {
            marginTop: verticalScale(20),
            fontSize: normalize(14),
            fontFamily: fonts.regular,
            color: theme.colors.text,
            lineHeight: normalize(24),
        },
        locationTitle: {
            marginTop: verticalScale(18),
            fontSize: normalize(16),
            fontFamily: fonts.bold,
            color: theme.colors.text,
        },
        mapImageContainer: {
            marginTop: verticalScale(12),
            height: verticalScale(160),
            borderRadius: moderateScale(16),
            overflow: 'hidden',
            marginBottom: verticalScale(40),
        },
        mapImage: {
            width: '100%',
            height: '100%',
        },
        bottomContainer: {
            // position: 'absolute',
            // bottom: 0,
            // // width: '100%',
            // paddingHorizontal: moderateScale(20),
            // paddingTop: verticalScale(16),
            // paddingBottom: verticalScale(32),
            // backgroundColor: theme.colors.background,
            // borderTopWidth: 1,
            // borderTopColor: palette.gray100,
        },
        markButton: {
            backgroundColor: theme.colors.brandGreen,
            borderRadius: moderateScale(12),
            paddingVertical: verticalScale(16),
            alignItems: 'center',
            justifyContent: 'center',
        },
        markButtonText: {
            color: palette.white,
            fontSize: normalize(16),
            fontFamily: fonts.bold,
        },
        contributedToTitle: {
            marginHorizontal: moderateScale(20),
            // marginTop: verticalScale(24),
            fontSize: normalize(16),
            fontFamily: fonts.bold,
            color: theme.colors.text,
        },
        contributedUserContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFBE6', // Light yellow
            marginHorizontal: moderateScale(20),
            marginTop: verticalScale(12),
            padding: moderateScale(12),
            borderRadius: moderateScale(16),
            borderWidth: 1,
            borderColor: '#FFE58F',
        },
        userAvatarContainer: {
            width: moderateScale(50),
            height: moderateScale(50),
            borderRadius: moderateScale(25),
            backgroundColor: palette.green150,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: moderateScale(12),
            overflow: 'hidden',
        },
        userAvatarImage: {
            width: '100%',
            height: '100%',
        },
        userAvatarPlaceholder: {
            fontSize: normalize(20),
            fontFamily: fonts.bold,
            color: theme.colors.brandGreen,
        },
        userInfoContainer: {
            flex: 1,
        },
        userName: {
            fontSize: normalize(16),
            fontFamily: fonts.bold,
            color: theme.colors.text,
        },
        userDetails: {
            fontSize: normalize(12),
            fontFamily: fonts.regular,
            color: theme.colors.mutedText,
            marginTop: verticalScale(2),
        },
        buttonContainer: {
            paddingBottom: verticalScale(20),
            marginTop: verticalScale(10),
        },
    });
