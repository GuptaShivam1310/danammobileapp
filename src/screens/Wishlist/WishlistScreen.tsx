import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useTheme } from '../../theme';
import { createWishlistScreenStyles } from './WishlistScreen.styles';
import { FavoriteItem, useWishlistScreen } from './WishlistScreen.hook';
import { EmptyList } from '../../components/common/EmptyList';
import { ActiveHeartIcon } from '../../assets/images';
import { RightArrowIcon } from '../../assets/icons';
import { SvgIcon } from '../../components/common/SvgIcon';
import { AppImage } from '../../components/common/AppImage';
import { formatDisplayDate } from '../../utils/dateUtils';
import { palette } from '../../constants/colors';
import { AppLoader } from '../../components/common/AppLoader';

export function WishlistScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createWishlistScreenStyles(theme);
  const {
    favoritesList,
    isLoading,
    isRefreshing,
    isLoadingMore,
    onRefresh,
    onEndReached,
    onRemoveFromWishList,
    onPressDiscover,
    handlePostPress,
  } = useWishlistScreen();

  const renderItem: ListRenderItem<FavoriteItem> = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.rowContainer}
        onPress={() => handlePostPress(item)}
        testID={`wishlist-row-${item.id}`}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <AppImage
            imageUri={item.image}
            style={styles.image}
            resizeMode="cover"
            testID={`wishlist-image-${item.id}`}
          />
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => onRemoveFromWishList(item.id)}
            testID={`wishlist-remove-${item.id}`}
            activeOpacity={0.8}
          >
            <SvgIcon icon={ActiveHeartIcon} size={12} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemSubtitle}>
            {formatDisplayDate(item.created_at)}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <RightArrowIcon testID={`wishlist-right-arrow-${item.id}`} />
        </View>
      </TouchableOpacity>
    );
  }, [
    handlePostPress,
    onRemoveFromWishList,
    styles,
  ]);

  const keyExtractor = useCallback((item: FavoriteItem) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (isLoading && favoritesList.length === 0) {
      return null;
    }

    return (
      <View style={styles.emptyStateContainer}>
        <EmptyList
          title={t('wishlist.empty.title')}
          subTitle={t('wishlist.empty.subTitle')}
          btnText={t('wishlist.empty.button')}
          btnCallBack={onPressDiscover}
        />
      </View>
    );
  }, [isLoading, favoritesList.length, onPressDiscover, styles.emptyStateContainer, t]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <AppLoader />
      </View>
    );
  }, [isLoadingMore]);

  return (
    <ScreenWrapper withBottomTab={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('wishlist.headerTitle')}</Text>
        </View>

        {isLoading && favoritesList.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <AppLoader />
          </View>
        ) : (
          <FlatList
            data={favoritesList}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              favoritesList.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[theme.mode === 'dark' ? palette.white : palette.black]}
                tintColor={theme.mode === 'dark' ? palette.white : palette.black}
              />
            }
            testID="wishlist-list"
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
