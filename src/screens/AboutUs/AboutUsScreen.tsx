import React from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppLoader } from '../../components/common/AppLoader';
import { useTheme } from '../../theme';
import { useAboutUs } from './useAboutUs';
import { styles as createStyles } from './styles';
import { useTranslation } from 'react-i18next';
import { palette } from '../../constants/colors';

export const AboutUsScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { handleBack, aboutData, loading, error } = useAboutUs();
    const { t } = useTranslation();

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <AppLoader />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.errorText, { color: palette.red700 }]}>{error}</Text>
                </View>
            );
        }

        if (!aboutData) {
            return null;
        }

        return (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <FastImage
                    source={
                        aboutData.image_url
                            ? { uri: aboutData.image_url, priority: FastImage.priority.normal }
                            : require('../../assets/images/aboutUs.png')
                    }
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                    testID="about-us-image"
                />

                <Text style={styles.description}>
                    {aboutData.description}
                </Text>


            </ScrollView>
        );
    };

    return (
        <ScreenWrapper testID="about-us-screen" withBottomTab={true}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        title={aboutData?.title || t('aboutUs.title')}
                        onBackPress={handleBack}
                        backButtonTestID="about-us-back-button"
                    />
                </View>
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
