import React, { useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { SearchFilterBarProps } from './types';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { useTheme } from '../../../theme';
import { SvgIcon } from '../../common/SvgIcon';
import { spacing } from '../../../theme/spacing';
import { useTranslation } from 'react-i18next';

/**
 * SearchFilterBar Component
 * Provides search input with debounce and filter button for discovering items
 * @param onSearch - Callback when search text changes (debounced)
 * @param onFilterPress - Callback when filter button is pressed
 * @param searchPlaceholder - Placeholder text for search input
 * @param searchIcon - Search icon component
 * @param filterIcon - Filter icon component
 * @param debounceDelay - Debounce delay in ms (default: 500)
 */
export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  onSearch,
  onFilterPress,
  onPress,
  searchPlaceholder,
  searchIcon,
  filterIcon,
  debounceDelay = 500,
  value,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const handleSearchChange = useCallback(
    (text: string) => {
      onSearch?.(text);
    },
    [onSearch],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.searchContainer,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        testID="search-bar"
      >
        {searchIcon && (
          <SvgIcon icon={searchIcon} size={scale(20)} color={colors.mutedText} />
        )}
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.text,
            },
          ]}
          placeholder={searchPlaceholder ?? t('home.searchPlaceholder')}
          placeholderTextColor={colors.mutedText}
          value={value ?? ''}
          onChangeText={handleSearchChange}
          testID="search-input"
          returnKeyType="search"
          editable={!onPress}
          pointerEvents={onPress ? 'none' : 'auto'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={onFilterPress}
        testID="filter-button"
        activeOpacity={0.7}
      >
        {filterIcon && <SvgIcon icon={filterIcon} size={scale(20)} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.sm),
    paddingVertical: verticalScale(12),
    gap: scale(spacing.md),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(12),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    height: verticalScale(48),
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
    fontWeight: '500',
  },
  filterButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: normalize(12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
