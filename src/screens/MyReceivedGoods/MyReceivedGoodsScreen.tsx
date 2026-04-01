import React from 'react';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/common/Header';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { ProductCard } from '../../components/specified/home/ProductCard';
import { AppLoader } from '../../components/common/AppLoader';
import { useTheme } from '../../theme';
import { ReceivedProductApiItem } from '../../services/api/myReceivedGoodsApi';
import { useMyReceivedGoodsScreen } from './MyReceivedGoodsScreen.hook';
import { createMyReceivedGoodsStyles } from './MyReceivedGoodsScreen.styles';

export function MyReceivedGoodsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createMyReceivedGoodsStyles(theme);
  const {
    onGoBack,
    receivedProducts,
    isLoading,
    isRefreshing,
    hasMoreData,
    error,
    onPressProduct,
    onRefresh,
    onEndReached,
  } = useMyReceivedGoodsScreen();


  const renderItem: ListRenderItem<ReceivedProductApiItem> = ({ item }) => (
    <ProductCard
      item={item}
      onPress={() => onPressProduct(item)}
      useDefaultContainerStyle={false}
      containerStyle={styles.card}
      imageWrapperStyle={styles.imageWrapper}
      imageStyle={styles.image}
      contentStyle={styles.cardContent}
      titleStyle={styles.cardTitle}
      dateStyle={styles.cardDate}
      testID={`my-received-card-${item.id}`}
    />
  );

  return (
    <ScreenWrapper withBottomTab={true}>
      <View style={styles.screen}>
        <Header title={t('profile.myReceivedGoods')} onBackPress={onGoBack} />
        {isLoading ? (
          <View style={styles.loaderWrap}>
            <AppLoader testID="my-received-goods-loader" />
          </View>
        ) : null}

        {!isLoading && !error ? (
          <FlatList
            data={receivedProducts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[
              styles.listContent,
              receivedProducts.length === 0 ? styles.emptyListContent : null,
            ]}
            ListEmptyComponent={(
              <View style={styles.stateWrap}>
                <Text style={styles.stateText}>{t('myReceivedGoods.empty')}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            testID="my-received-goods-list"
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
