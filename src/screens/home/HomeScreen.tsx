import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme';
import { homeStyles as styles } from './styles';
import { useHome } from './useHome';
import type { Product } from './types';
import { HomeHeader } from '../../components/specified/home/HomeHeader';
import { SearchFilterBar } from '../../components/specified/home/SearchFilterBar';
import { ProductCard } from '../../components/specified/home/ProductCard';
import { ContributeBanner } from '../../components/specified/home/ContributeBanner';
import { CategoryFilterBottomSheet } from '../../components/specified/home/CategoryFilterBottomSheet';
import { AppLoader } from '../../components/common/AppLoader';
import { palette } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  defaultFilterIcon,
  DefaultNotificationIcon,
  NotificationIcon,
} from '../../assets/icons';
import { useTranslation } from 'react-i18next';

/**
 * HomeScreen Component
 * Displays a grid of items (Discover Items) with:
 * - Header with title and notification icon
 * - Search and filter bar
 * - 2-column product grid with pagination
 * - Inline contribute banner
 * - Pull-to-refresh support
 * - Error and empty states
 */
export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    items,
    categories,
    selectedCategory,
    isCategoryLoading,
    categoryError,
    isFilterSheetVisible,
    loading,
    refreshing,
    searchText,
    unreadCount,
    error,
    onSearch,
    onRefresh,
    onEndReached,
    onNotificationPress,
    onSearchPress,
    onFilterPress,
    onCloseFilterSheet,
    onSelectCategory,
    onItemPress,
  } = useHome();

  /**
   * Render individual item or banner
   */
  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => {
      if (item.type === 'banner') {
        return (
          <View style={styles.bannerRow} testID="banner-row">
            <ContributeBanner
              onPress={() => onItemPress(item)}
              testID="contribute-banner"
            />
          </View>
        );
      }
      if (item.type === 'spacer') {
        return <View style={styles.bannerSpacer} testID="banner-spacer" />;
      }

      return (
        <View
          style={styles.itemColumn}
          testID={`product-card-column-${item.id}`}
        >
          <ProductCard
            item={item}
            onPress={() => onItemPress(item)}
            testID={`product-card-${item.id}`}
          />
        </View>
      );
    },
    [onItemPress, t],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <SearchFilterBar
          value={searchText}
          onSearch={onSearch}
          onPress={onSearchPress}
          onFilterPress={onFilterPress}
          filterIcon={defaultFilterIcon}
        />
      </View>
    ),
    [searchText, onSearch, onSearchPress, onFilterPress],
  );

  const renderFooter = useCallback(() => {
    if (!loading || items.length === 0) return null;
    return (
      <View style={styles.loadingContainer} testID="loading-footer">
        <AppLoader />
      </View>
    );
  }, [loading, items.length]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {loading ? (
          <AppLoader />
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {searchText ? t('home.noItemsFound') : t('home.noItemsAvailable')}
          </Text>
        )}
      </View>
    ),
    [loading, searchText, theme, t],
  );

  if (error && items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: palette.red600 }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => onRefresh()}
        >
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="home-screen"
    >
      <SafeAreaView />
      <HomeHeader
        title={t('home.title')}
        onNotificationPress={onNotificationPress}
        showNotificationDot={unreadCount > 0}
        notificationIcon={
          unreadCount > 0 ? NotificationIcon : DefaultNotificationIcon
        }
      />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={loading ? styles.flex : styles.listContent}
        showsVerticalScrollIndicator={false}
        testID="product-list"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        style={styles.listStyle}
      />
      <CategoryFilterBottomSheet
        isVisible={isFilterSheetVisible}
        categories={categories}
        selectedCategoryId={selectedCategory?.id}
        isLoading={isCategoryLoading}
        error={categoryError}
        onClose={onCloseFilterSheet}
        onSelectCategory={onSelectCategory}
      />
    </View>
  );
};
