import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';
import { styles as createStyles } from './styles';
import { AppLoader } from '../../components/common/AppLoader';

export interface SelectCategoryItem {
    id: string;
    name: string;
    icon?: string;
    bgColor?: string;
}

interface SelectCategoryContentProps {
    categories: SelectCategoryItem[];
    isLoading: boolean;
    error: string | null;
    selectedCategoryId?: string | null;
    onCategoryPress: (category: SelectCategoryItem) => void;
}

export const SelectCategoryContent: React.FC<SelectCategoryContentProps> = ({
    categories,
    isLoading,
    error,
    selectedCategoryId,
    onCategoryPress,
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const renderCategoryItem = ({ item }: { item: SelectCategoryItem }) => {
        const isSelected = String(selectedCategoryId) === String(item.id);
        return (
            <TouchableOpacity
                style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
                onPress={() => onCategoryPress(item)}
                testID={`category-item-${item.id}`}
            >
                <View style={styles.categoryImageContainer}>
                    <Image
                        source={{ uri: item.icon }}
                        style={[styles.categoryImage, { backgroundColor: item.bgColor }]}
                        testID={`category-image-${item.id}`}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryText}>{item.name}</Text>
                </View>
                <View style={styles.rightIconContainer}>
                    <FeatherIcon name="chevron-right" size={moderateScale(24)} color={theme.colors.text} />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContent} testID="loading-indicator">
                <AppLoader />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContent} testID="error-state">
                <FeatherIcon name="alert-circle" size={moderateScale(48)} color={theme.colors.danger} />
                <Text style={styles.errorText}>{t('selectCategory.fetchFailed')}</Text>
            </View>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <View style={styles.centerContent} testID="empty-state">
                <FeatherIcon name="inbox" size={moderateScale(48)} color={theme.colors.mutedText} />
                <Text style={styles.emptyText}>{t('selectCategory.noCategories')}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            testID="categories-list"
        />
    );
};
