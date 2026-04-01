import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { AppLoader } from '../../components/common/AppLoader';
import { SvgProps } from 'react-native-svg';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useTheme } from '../../theme';
import { useProfile } from './useProfile';
import { styles as createStyles } from './styles';
import { palette } from '../../constants/colors';
import { moderateScale } from '../../theme/scale';
import { LogoutModal } from '../../components/common/LogoutModal';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../components/common/SvgIcon';
import { ReceivedGoalIcon } from '../../assets/images';
import { DanamEditIcon } from '../../assets/icons';

interface OptionItemProps {
    iconName?: string;
    svgIcon?: React.FC<SvgProps>;
    label: string;
    onPress: () => void;
    iconBgColor: string;
    iconColor: string;
    testID?: string;
}

const OptionItem: React.FC<OptionItemProps> = ({
    iconName,
    label,
    onPress,
    iconBgColor,
    iconColor,
    testID,
    svgIcon
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            style={styles.optionItem}
            onPress={onPress}
            activeOpacity={0.7}
            testID={testID}
        >
            <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>
                {svgIcon ? (
                    <SvgIcon icon={svgIcon} size={moderateScale(26)} color={iconColor} />
                ) : (
                    <FeatherIcon name={iconName || ''} size={moderateScale(26)} color={iconColor} />
                )}
            </View>
            <Text style={styles.optionLabel}>{label}</Text>
            <FeatherIcon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.mutedText}
            />
        </TouchableOpacity>
    );
};

export const ProfileScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const {
        profile,
        isLoading,
        handleEditProfile,
        handleMyReceivedGoods,
        handleSettings,
        handleChangePassword,
        handleHelpSupport,
        isSeekerUserType,
        handleLogout,
        isLogoutModalVisible,
        closeLogoutModal,
        handleConfirmLogout,
    } = useProfile();
    const { t } = useTranslation();

    if (isLoading && !profile) {
        return (
            <ScreenWrapper>
                <View style={styles.centeredContainer}>
                    <AppLoader />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID="profile-screen" withBottomTab={true}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle} testID="profile-header-title">
                        {t('profile.title')}
                    </Text>
                </View>

                {/* User Info Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                profile?.profile_image_url
                                    ? { uri: profile.profile_image_url }
                                    : require('../../assets/images/userIcon.png')
                            }
                            style={styles.avatar}
                            testID="profile-avatar"
                            resizeMode='cover'
                        />
                        {/* Optional badge as seen in screenshot */}
                        <View style={styles.badge}>
                            <SvgIcon icon={DanamEditIcon} size={moderateScale(12)} />
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} testID="profile-name">
                            {profile?.full_name || 'User Name'}
                        </Text>
                        <Text style={styles.userEmail} testID="profile-email">
                            {profile?.email || 'user@example.com'}
                        </Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={handleEditProfile}
                            testID="profile-edit-button"
                        >
                            <FeatherIcon name="edit-2" size={moderateScale(14)} color={theme.colors.brandGreen} />
                            <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Options List */}
                <View >
                    {isSeekerUserType ? (
                        <OptionItem
                            svgIcon={ReceivedGoalIcon}
                            label={t('profile.myReceivedGoods')}
                            onPress={handleMyReceivedGoods}
                            iconBgColor={palette.receivedGoodsBg}
                            iconColor={palette.blue700}
                            testID="profile-item-my-received-goods"
                        />
                    ) : null}
                    <OptionItem
                        iconName="settings"
                        label={t('profile.settings')}
                        onPress={handleSettings}
                        iconBgColor={palette.pink100} // Light pink
                        iconColor={palette.pink500}
                        testID="profile-item-settings"
                    />
                    <OptionItem
                        iconName="lock"
                        label={t('profile.changePassword')}
                        onPress={handleChangePassword}
                        iconBgColor={palette.green100} // Light green
                        iconColor={palette.green500}
                        testID="profile-item-change-password"
                    />
                    <OptionItem
                        iconName="help-circle"
                        label={t('profile.helpSupport')}
                        onPress={handleHelpSupport}
                        iconBgColor={palette.blue100} // Light blue
                        iconColor={palette.blue500}
                        testID="profile-item-help-support"
                    />
                    <OptionItem
                        iconName="log-out"
                        label={t('profile.logout')}
                        onPress={handleLogout}
                        iconBgColor={palette.red50} // Light red
                        iconColor={palette.red500}
                        testID="profile-item-logout"
                    />
                </View>

                {/* Version Footer */}
                <View style={styles.footer}>
                    <Text style={styles.versionText} testID="profile-version-text">
                        {t('profile.version')} 2.3.7.08
                    </Text>
                </View>
            </ScrollView>
            <LogoutModal
                isVisible={isLogoutModalVisible}
                onClose={closeLogoutModal}
                onConfirm={handleConfirmLogout}
            />
        </ScreenWrapper>
    );
};
