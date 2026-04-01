import React from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppLoader } from '../../components/common/AppLoader';
import { useTheme } from '../../theme';
import { useTermsCondition } from './useTermsCondition';
import { styles as createStyles } from './styles';
import { useTranslation } from 'react-i18next';
import { palette } from '../../constants/colors';

export const TermsConditionScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { handleBack, termsData, loading, error } = useTermsCondition();
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

        if (!termsData) {
            return null;
        }

        // Fix escaped newlines if they come from API as literal "\n" strings
        const processedContent = termsData.content.replace(/\\n/g, '\n');

        // Split by double newline to handle paragraphs/sections
        const blocks = processedContent.split('\n\n');

        return (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {blocks.map((block, index) => {
                    const trimmedBlock = block.trim();
                    if (!trimmedBlock) return null;

                    // Check for bullets
                    if (trimmedBlock.startsWith('-') || trimmedBlock.startsWith('*') || trimmedBlock.startsWith('•')) {
                        const lines = trimmedBlock.split('\n');
                        return (
                            <View key={index} style={styles.bulletContainer}>
                                {lines.map((line, lineIndex) => (
                                    <View key={lineIndex} style={styles.bulletItem}>
                                        <View style={styles.bullet} />
                                        <Text style={styles.bulletText}>{line.replace(/^[-*•]\s*/, '')}</Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    // Check for headers separated by single newline or being short
                    const lines = trimmedBlock.split('\n');

                    if (lines.length > 1) {
                        const firstLine = lines[0].trim();
                        // Heuristic: If first line is relatively short and doesn't end with a period, style as header
                        if (firstLine.length < 60 && !firstLine.endsWith('.')) {
                            return (
                                <View key={index}>
                                    <Text style={styles.sectionTitle}>{firstLine}</Text>
                                    <Text style={styles.introText}>{lines.slice(1).join('\n')}</Text>
                                </View>
                            );
                        }
                    } else if (trimmedBlock.length < 60 && !trimmedBlock.endsWith('.')) {
                        // Likely a standalone title
                        return <Text key={index} style={styles.sectionTitle}>{trimmedBlock}</Text>
                    }

                    return (
                        <Text key={index} style={styles.introText}>
                            {trimmedBlock}
                        </Text>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <ScreenWrapper testID="terms-condition-screen" scrollable={false} withBottomTab={true}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        title={termsData?.title || t('termsCondition.title')}
                        onBackPress={handleBack}
                        backButtonTestID="terms-back-button"
                    />
                </View>
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
