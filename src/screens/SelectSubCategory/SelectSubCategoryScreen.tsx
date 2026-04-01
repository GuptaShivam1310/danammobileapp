import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import _ from 'lodash';
import { useSelectSubCategory, SubCategory } from './useSelectSubCategory';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { SvgIcon } from '../../components/common/SvgIcon';
import * as Icons from '../../assets/icons';
import { useTranslation } from 'react-i18next';

export const SelectSubCategoryScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const {
        subCategories,
        isLoading,
        error,
        categoryName,
        handleBack,
        handleSubCategoryPress,
        fetchSubCategories,
        selectedSubCategory,
    } = useSelectSubCategory();

    const renderItem = ({ item }: { item: SubCategory }) => {
        const isSelected = String(_.get(selectedSubCategory, 'id')) === String(item.id);
        return (
            <TouchableOpacity
                style={[styles.subCategoryItem, isSelected && styles.selectedSubCategoryItem]}
                onPress={() => handleSubCategoryPress(item)}
                activeOpacity={0.7}
                testID={`subcategory-item-${item.id}`}
            >
                <View style={styles.subCategoryTextContainer}>
                    <Text style={styles.subCategoryText}>{item.name}</Text>
                </View>
                <View style={styles.rightIconContainer}>
                    <SvgIcon icon={Icons.ChevronRight} size={20} color={theme.colors.mutedText} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper testID="select-subcategory-screen">
            <View style={styles.container}>
                <Header
                    title={categoryName}
                    onBackPress={handleBack}
                    backButtonTestID="select-subcategory-back-button"
                />

                {isLoading ? (
                    <View style={styles.centerContent} testID="loading-state">
                        <ActivityIndicator testID="loading-indicator" size="large" color={theme.colors.brandGreen} />
                        <Text style={[styles.emptyText, { marginTop: 10 }]}>
                            {t('selectSubCategory.loading')}
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContent} testID="error-state">
                        <Text style={styles.errorText}>{t('selectSubCategory.fetchFailed')}</Text>
                        <TouchableOpacity onPress={fetchSubCategories} testID="try-again-button">
                            <Text style={[styles.subCategoryText, { color: theme.colors.brandGreen, marginTop: 10 }]}>
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        testID="subcategories-list"
                        data={subCategories}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.centerContent} testID="empty-state">
                                <Text style={styles.emptyText}>{t('selectSubCategory.noSubCategories')}</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};
