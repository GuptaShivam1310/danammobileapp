import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { useTheme } from '../../theme';
import { useHelpSupport } from './useHelpSupport';
import { styles as createStyles } from './styles';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '../../theme/scale';
import { RateUsModal } from '../../components/common/RateUsModal';

interface SupportItemProps {
    title: string;
    onPress: () => void;
    testID?: string;
}

const SupportItem: React.FC<SupportItemProps> = ({ title, onPress, testID }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={onPress}
            activeOpacity={0.7}
            testID={testID}
        >
            <Text style={styles.itemTitle}>{title}</Text>
            <FeatherIcon
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.colors.text}
            />
        </TouchableOpacity>
    );
};

export const HelpSupportScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
        handleBack,
        handleItemPress,
        isRateModalVisible,
        closeRateModal,
    } = useHelpSupport();

    return (
        <ScreenWrapper testID="help-support-screen" withBottomTab={true}>
            <View style={styles.container}>
                {/* Header */}
                <Header
                    title={t('helpSupport.title')}
                    onBackPress={handleBack}
                    backButtonTestID="help-support-back-button"
                />

                {/* Content */}
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <SupportItem
                        title={t('helpSupport.faqs')}
                        onPress={() => handleItemPress('FAQs')}
                        testID="help-support-item-faqs"
                    />
                    <SupportItem
                        title={t('helpSupport.aboutUs')}
                        onPress={() => handleItemPress('About Us')}
                        testID="help-support-item-about-us"
                    />
                    <SupportItem
                        title={t('helpSupport.contactUs')}
                        onPress={() => handleItemPress('Contact Us')}
                        testID="help-support-item-contact-us"
                    />
                    <SupportItem
                        title={t('helpSupport.termsCondition')}
                        onPress={() => handleItemPress('Terms and condition')}
                        testID="help-support-item-terms"
                    />
                    <SupportItem
                        title={t('helpSupport.rateUs')}
                        onPress={() => handleItemPress('Rate Us')}
                        testID="help-support-item-rate-us"
                    />
                </ScrollView>

                <RateUsModal
                    isVisible={isRateModalVisible}
                    onClose={closeRateModal}
                />
            </View >
        </ScreenWrapper >
    );
};
