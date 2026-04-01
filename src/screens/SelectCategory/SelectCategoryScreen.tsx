import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useSelectCategory } from './useSelectCategory';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';
import { SelectCategoryContent } from './SelectCategoryContent';

export const SelectCategoryScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);
    const {
        categories,
        isLoading,
        error,
        handleClose,
        handleCategoryPress,
        selectedCategory,
    } = useSelectCategory();

    const renderHeader = () => (
        <View style={styles.header} testID="select-category-header">
            <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                testID="close-button"
            >
                <FeatherIcon name="x" size={moderateScale(24)} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{t('selectCategory.title')}</Text>
            </View>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {renderHeader()}
                <SelectCategoryContent
                    categories={categories}
                    isLoading={isLoading}
                    error={error}
                    selectedCategoryId={selectedCategory?.id}
                    onCategoryPress={handleCategoryPress}
                />
            </View>
        </ScreenWrapper>
    );
};
