import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Switch,
    ActivityIndicator,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { DeleteAccountModal } from '../../components/common/DeleteAccountModal';
import { PasswordConfirmationModal } from '../../components/common/PasswordConfirmationModal';
import { Header } from '../../components/common/Header';
import { useTheme } from '../../theme';
import { useSettings } from './useSettings';
import { styles as createStyles } from './styles';
import { palette } from '../../constants/colors';
import { moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';

interface SettingItemProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    testID?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
    title,
    subtitle,
    value,
    onValueChange,
    testID,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();

    return (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDesc}>{subtitle}</Text>
            </View>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>{value ? t('settings.on') : t('settings.off')}</Text>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: palette.gray300, true: theme.colors.brandGreen }}
                    thumbColor={palette.white}
                    testID={testID}
                />
            </View>
        </View>
    );
};

export const SettingsScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
        receiveUpdates,
        nearestDanam,
        hideIdentity,
        isLoading,
        handleToggleUpdates,
        handleToggleNearest,
        handleToggleIdentity,
        handleDeleteAccount,
        handleBack,
        isDeleteModalVisible,
        isPasswordModalVisible,
        isDeleting,
        handleConfirmDelete,
        handlePasswordConfirm,
        handleCloseDeleteModal,
        handleClosePasswordModal,
    } = useSettings();

    if (isLoading) {
        return (
            <ScreenWrapper withBottomTab={true}>
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color={theme.colors.brandGreen} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID="settings-screen" withBottomTab={true}>
            <View style={styles.topSpacing}>
                <Header
                    title={t('settings.title')}
                    onBackPress={handleBack}
                    backButtonTestID="settings-back-button"
                />
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                <SettingItem
                    title={t('settings.receiveUpdates')}
                    subtitle={t('settings.receiveUpdatesDesc')}
                    value={receiveUpdates}
                    onValueChange={handleToggleUpdates}
                    testID="settings-toggle-updates"
                />
                <SettingItem
                    title={t('settings.nearestDanam')}
                    subtitle={t('settings.nearestDanamDesc')}
                    value={nearestDanam}
                    onValueChange={handleToggleNearest}
                    testID="settings-toggle-nearest"
                />
                <SettingItem
                    title={t('settings.hideIdentity')}
                    subtitle={t('settings.hideIdentityDesc')}
                    value={hideIdentity}
                    onValueChange={handleToggleIdentity}
                    testID="settings-toggle-hide-identity"
                />

                <TouchableOpacity
                    style={styles.deleteSection}
                    onPress={handleDeleteAccount}
                    activeOpacity={0.7}
                    testID="settings-delete-account-row"
                >
                    <View style={styles.deleteInfo}>
                        <Text style={styles.deleteTitle}>{t('settings.deleteAccount')}</Text>
                        <Text style={styles.deleteDesc}>{t('settings.deleteAccountDesc')}</Text>
                    </View>
                    <FeatherIcon name="chevron-right" size={moderateScale(20)} color={theme.colors.text} />
                </TouchableOpacity>
            </ScrollView>

            <DeleteAccountModal
                isVisible={isDeleteModalVisible}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />

            <PasswordConfirmationModal
                isVisible={isPasswordModalVisible}
                onClose={handleClosePasswordModal}
                onConfirm={handlePasswordConfirm}
                isLoading={isDeleting}
            />
        </ScreenWrapper>
    );
};
