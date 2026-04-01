import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import {
  SeekerContributionItem,
  useSeekerDashboardScreen,
} from './SeekerDashboardScreen.hook';
import { createSeekerDashboardScreenStyles } from './SeekerDashboardScreen.styles';
import { useTheme } from '../../theme';
import { EmptyList } from '../../components/common/EmptyList';
import { ActiveHeartIcon, HeartIcon, NotificationIcon } from '../../assets/images';
import { SvgIcon } from '../../components/common/SvgIcon';
import { authUiColors, palette } from '../../constants/colors';
import { scale } from '../../theme/scale';
import { ProductCard } from '../../components/specified/home/ProductCard';
import { AppLoader } from '../../components/common/AppLoader';

export function SeekerDashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createSeekerDashboardScreenStyles(theme);
  const {
    contributions,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isClearingFlow,
    onRefresh,
    onEndReached,
    onPressNotification,
    onPressReset,
    onToggleLike,
    handlePostPress,
    wishListIds
  } = useSeekerDashboardScreen();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{t('seekerDashboard.title')}</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={onPressReset}
          style={[styles.resetButton, isClearingFlow && styles.resetButtonDisabled]}
          disabled={isClearingFlow}
          testID="seeker-dashboard-reset-button"
        >
          <Text style={styles.resetText}>{t('seekerDashboard.reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onPressNotification}
          testID="seeker-dashboard-notification-button"
        >
          <SvgIcon icon={NotificationIcon} size={20} color={palette.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem: ListRenderItem<SeekerContributionItem> = ({ item }) => (
    <ProductCard
      item={item}
      useDefaultContainerStyle={false}
      containerStyle={styles.card}
      imageWrapperStyle={styles.imageWrapper}
      imageStyle={styles.image}
      contentStyle={styles.cardContent}
      titleStyle={styles.cardTitle}
      dateStyle={styles.cardDate}
      onPress={() => handlePostPress(item)}
      renderImageOverlay={(
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => onToggleLike(item)}
          testID={`seeker-dashboard-heart-${item.id}`}
        >
          <SvgIcon
            icon={wishListIds.includes(item.id) ? ActiveHeartIcon : HeartIcon}
            size={scale(14)}
            color={wishListIds.includes(item.id) ? undefined : palette.gray400}
          />
        </TouchableOpacity>
      )}
      testID={`seeker-dashboard-card-${item.id}`}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <ActivityIndicator size="small" color={authUiColors.brandGreen} />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <EmptyList
        title={t('seekerDashboard.empty.title')}
        subTitle={t('seekerDashboard.empty.subTitle')}
        btnText={t('seekerDashboard.empty.button')}
        btnCallBack={onPressReset}
      />
    </View>
  );

  if (isLoading && contributions.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.screen}>
          {renderHeader()}
          <AppLoader />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.screen}>
        {renderHeader()}
        <FlatList
          style={styles.list}
          data={contributions}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            contributions.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={styles.columnWrapper}
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
              colors={[palette.black]}
              tintColor={palette.black}
            />
          }
          testID="seeker-dashboard-list"
        />
      </View>
    </ScreenWrapper>
  );
}
