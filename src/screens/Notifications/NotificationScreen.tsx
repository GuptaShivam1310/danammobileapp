import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLoader } from '../../components/common/AppLoader';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createNotificationStyles } from './styles';
import { useNotifications } from './useNotifications';
import type { NotificationItem } from './types';
import { palette } from '../../constants/colors';
import { ContributorIcon, NotificationIcon } from '../../assets/images';
import { ArrowIcon, BannerIcon } from '../../assets/icons';
import { SvgIcon } from '../../components/common/SvgIcon';

export const NotificationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useMemo(() => createNotificationStyles(), []);
  const {
    notifications,
    loading,
    refreshing,
    error,
    onRefresh,
    markAsRead,
    markingIdSet,
  } = useNotifications();

  const formatNotificationTime = useCallback(
    (timestamp: string) => {
      const parsed = moment(timestamp);
      if (!parsed.isValid()) return '';

      const time = parsed.format('h:mm A');
      const today = moment();
      if (parsed.isSame(today, 'day')) {
        return `${t('notifications.today')} ${time}`;
      }

      const yesterday = moment().subtract(1, 'day');
      if (parsed.isSame(yesterday, 'day')) {
        return `${t('notifications.yesterday')} ${time}`;
      }

      return parsed.format(t('notifications.dateFormat'));
    },
    [t],
  );

  const visuals = useMemo(
    () => [
      {
        backgroundColor: palette.seekerGreen,
        icon: NotificationIcon,
        iconColor: palette.white,
      },
      {
        backgroundColor: palette.notificationAccent,
        icon: ContributorIcon,
        iconColor: palette.white,
      },
      {
        backgroundColor: palette.notificationIconBgLight,
        icon: BannerIcon,
        iconColor: palette.gray750,
      },
    ],
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: NotificationItem; index: number }) => {
      const visual = visuals[index % visuals.length];
      const isHighlight = index === 1;
      const isMarking = markingIdSet.has(item.id);

      const onPress = (item: NotificationItem) => {
        if (!item.is_read) {
          markAsRead(item.id);
        }
      };

      return (
        <TouchableOpacity
          style={[styles.itemRow, isHighlight && styles.itemHighlight]}
          onPress={() => onPress(item)}
          testID={`notification-item-${item.id}`}
          activeOpacity={0.7}
          disabled={isMarking}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: visual.backgroundColor },
            ]}
            testID={`notification-icon-${item.id}`}
          >

            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.iconImage}
                testID={`notification-image-${item.id}`}
              />
            ) : <SvgIcon icon={visual.icon} size={20} color={visual.iconColor} />}
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.bodyText, isHighlight && styles.highlightText]}
              testID={`notification-body-${item.id}`}
            >
              {item.body}
            </Text>
            {!!item.title && (
              <Text
                style={[styles.titleText, isHighlight && styles.highlightText]}
                testID={`notification-title-${item.id}`}
              >
                {item.title}
              </Text>
            )}
            <Text
              style={styles.timeText}
              testID={`notification-time-${item.id}`}
            >
              {formatNotificationTime(item.created_at)}
            </Text>
          </View>

          {!item.is_read && (
            <View
              style={styles.unreadDot}
              testID={`notification-unread-${item.id}`}
            />
          )}
        </TouchableOpacity>
      );
    },
    [formatNotificationTime, markAsRead, markingIdSet, styles, visuals],
  );

  const renderEmptyState = useMemo(
    () => (
      <View style={styles.emptyContainer} testID="notifications-empty">
        <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('notifications.emptySubtitle')}
        </Text>
      </View>
    ),
    [styles.emptyContainer, styles.emptySubtitle, styles.emptyTitle, t],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer} testID="notifications-loading">
          <AppLoader />
        </View>
      );
    }

    if (error && notifications.length === 0) {
      return (
        <View style={styles.emptyContainer} testID="notifications-error">
          <Text style={styles.errorText}>{t(error)}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.seekerGreen]}
            tintColor={palette.seekerGreen}
          />
        }
        testID="notifications-list"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    );
  };

  const content = useMemo(() => renderContent(), [loading, error, notifications, refreshing, onRefresh, renderItem, renderEmptyState, styles]);

  return (
    <SafeAreaView style={styles.safeArea} testID="notification-screen">
      <StatusBar barStyle="dark-content" backgroundColor={palette.white} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            testID="notification-back"
          >
            <SvgIcon
              icon={ArrowIcon}
              size={18}
              color={palette.gray750}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        </View>

        {content}
      </View>
    </SafeAreaView>
  );
};
