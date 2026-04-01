import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '../../../constants/colors';
import { fonts } from '../../../theme/fonts';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { spacing } from '../../../theme/spacing';
import { useTheme } from '../../../theme';
import type { Category } from '../../../services/api/postApi';
import type { CategoryFilterBottomSheetProps } from './types';
import { SelectCategoryContent } from '../../../screens/SelectCategory/SelectCategoryContent';
import { AppBottomSheet } from '../../common/AppBottomSheet';

export const CategoryFilterBottomSheet: React.FC<
  CategoryFilterBottomSheetProps
> = ({
  isVisible,
  categories,
  selectedCategoryId,
  isLoading,
  error,
  onSelectCategory,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <AppBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      containerStyle={[
        styles.sheetContainer,
        { backgroundColor: theme.colors.surface },
      ]}
      overlayStyle={[
        styles.overlay,
        { backgroundColor: palette.homeFilterOverlay },
      ]}
    >
      <View style={styles.header} testID="home-category-filter-content">
        <Text
          style={[styles.title, { color: theme.colors.text || palette.black }]}
        >
          {t('selectCategory.filterTitle')}
        </Text>
      </View>
      <SelectCategoryContent
        categories={categories}
        isLoading={isLoading}
        error={error}
        selectedCategoryId={selectedCategoryId}
        onCategoryPress={category => onSelectCategory(category as Category)}
      />
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    borderRadius: scale(20),
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: scale(spacing.lg),
    paddingBottom: verticalScale(spacing.xl),
  },
  header: {
    paddingHorizontal: scale(spacing.sm),
    paddingBottom: verticalScale(spacing.lg),
    paddingTop: verticalScale(spacing.lg),
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: normalize(20),
    lineHeight: normalize(26),
  },
});
