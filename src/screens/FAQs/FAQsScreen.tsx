import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppLoader } from '../../components/common/AppLoader';
import { useTheme } from '../../theme';
import { useFAQs } from './useFAQs';
import { styles as createStyles } from './styles';
import { palette } from '../../constants/colors';
import { moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';
import { FAQ } from '../../services/api/supportApi';

export const FAQsScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { handleBack, faqs, loading, error, expandedIndex, toggleExpand } = useFAQs();
    const { t } = useTranslation();

    const renderItem = useCallback(({ item, index }: { item: FAQ, index: number }) => {
        const isExpanded = expandedIndex === index;
        return (
            <View
                style={[
                    styles.faqItem,
                    {
                        borderColor: isExpanded ? theme.colors.brandGreen : palette.gray100,
                        backgroundColor: isExpanded ? palette.greenLight : "transparent",
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleExpand(index)}
                    activeOpacity={0.7}
                    testID={`faq-item-${index}`}
                >
                    <Text
                        style={[
                            styles.question,
                            { color: isExpanded ? theme.colors.brandGreen : theme.colors.text },
                        ]}
                    >
                        {item.question}
                    </Text>
                    <FeatherIcon
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={moderateScale(20)}
                        color={isExpanded ? theme.colors.brandGreen : theme.colors.text}
                    />
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answer}>{item.answer}</Text>
                    </View>
                )}
            </View>
        );
    }, [expandedIndex, theme, toggleExpand, styles]);

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

        if (faqs.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
                        {t('faqs.noFaqsFound')}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={faqs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                testID="faq-list"
            />
        );
    };

    return (
        <ScreenWrapper testID="faqs-screen" withBottomTab={true}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Header
                        title={t('faqs.title')}
                        onBackPress={handleBack}
                        backButtonTestID="faqs-back-button"
                    />
                </View>
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
