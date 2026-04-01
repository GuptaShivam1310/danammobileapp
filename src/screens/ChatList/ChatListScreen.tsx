import React, { memo, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ListRenderItemInfo,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useTheme } from '../../theme';
import { moderateScale, scale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { createStyles } from './styles';
import { useChat } from './useChat';
import { formatChatTimestamp } from '../../utils/dateUtils';
import { AppImages } from '../../assets/images';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatItem {
    id: string; // This corresponds to productId
    productTitle: string;
    productImage: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    seekerCount: number;
    requestId?: string;
    donorName?: string;
    donorImage?: string;
    donorId?: string;
    has_unread?: boolean;
}

// ─── ChatListItem ─────────────────────────────────────────────────────────────

interface ChatListItemProps {
    item: ChatItem;
    styles: ReturnType<typeof createStyles>;
    seekerLabel: string;
    isLast: boolean;
    isSeeker?: boolean;
    onPress: (item: ChatItem) => void;
}

const ChatListItem = memo(({ item, styles, seekerLabel, isLast, isSeeker, onPress }: ChatListItemProps) => {
    const { theme } = useTheme();
    const hasUnread = item.has_unread;

    const handlePress = useCallback(() => onPress(item), [item, onPress]);

    if (isSeeker) {
        return (
            <>
                <TouchableOpacity
                    testID={`chat-item-${item.id}`}
                    style={styles.itemContainer}
                    activeOpacity={0.7}
                    onPress={handlePress}
                >
                    {/* Donor Image */}
                    <Image
                        source={item.donorImage ? { uri: item.donorImage } : AppImages.userIcon}
                        style={styles.productImage}
                        testID={`chat-item-image-${item.id}`}
                    />

                    {/* Body: Donor Name & Product Title */}
                    <View style={styles.itemBody}>
                        <Text
                            testID="chat-item-donor-name"
                            style={[
                                styles.productTitle,
                                {
                                    color: hasUnread ? theme.colors.brandGreen : theme.colors.text,
                                    fontFamily: hasUnread ? fonts.bold : fonts.semiBold
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {item.donorName}
                        </Text>
                        <Text
                            testID="chat-item-product-title"
                            style={[
                                styles.seekerCount,
                                { marginTop: scale(2) }
                            ]}
                            numberOfLines={1}
                        >
                            {item.productTitle}
                        </Text>
                    </View>

                    {/* Right: Unread dot & Timestamp */}
                    <View style={styles.itemRight}>
                        <View style={styles.dotTimeRow}>
                            {hasUnread && (
                                <View
                                    testID="chat-item-unread-dot"
                                    style={[styles.unreadDot, { marginRight: scale(4) }]}
                                />
                            )}
                            <Text style={styles.timeText}>{formatChatTimestamp(item.lastMessageTime)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}
            </>
        );
    }

    return (
        <>
            <TouchableOpacity
                testID={`chat-item-${item.id}`}
                style={styles.itemContainer}
                activeOpacity={0.7}
                onPress={handlePress}
            >
                {/* Product Image */}
                <Image
                    source={{ uri: item.productImage }}
                    style={styles.productImage}
                    testID={`chat-item-image-${item.id}`}
                />

                {/* Body: title */}
                <View style={styles.itemBody}>
                    <Text
                        testID="chat-item-title"
                        style={[
                            styles.productTitle,
                            {
                                color: hasUnread ? theme.colors.brandGreen : theme.colors.text,
                                fontFamily: hasUnread ? fonts.bold : fonts.semiBold
                            },
                        ]}
                        numberOfLines={2}
                    >
                        {item.productTitle}
                    </Text>
                </View>

                {/* Right: unread dot (top) + seeker count (bottom) */}
                <View style={styles.itemRight}>
                    <View style={{ height: moderateScale(10) }}>

                        {hasUnread && (
                            <View
                                testID="chat-item-unread-dot"
                                style={styles.unreadDot}
                            />
                        )}
                    </View>
                    <Text style={styles.seekerCount}>
                        {item.seekerCount} {seekerLabel}
                    </Text>
                </View>
            </TouchableOpacity>

            {!isLast && <View style={styles.divider} />}
        </>
    );
});

ChatListItem.displayName = 'ChatListItem';

// ─── ChatListScreen ───────────────────────────────────────────────────────────

export const ChatListScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme.colors);

    const {
        chats,
        loading,
        refreshing,
        error,
        searchQuery,
        handleSearchChange,
        handleRefresh,
        handleRetry,
        handleChatPress,
        isSeekerUser,
    } = useChat();

    const keyExtractor = useCallback((item: ChatItem) => item.id, []);

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<ChatItem>) => (
            <ChatListItem
                item={item}
                styles={styles}
                seekerLabel={t('chat.seekers')}
                isLast={index === chats.length - 1}
                isSeeker={isSeekerUser}
                onPress={handleChatPress}
            />
        ),
        [styles, t, chats.length, handleChatPress, isSeekerUser],
    );

    const renderSearch = useCallback(
        () => (
            <View style={styles.searchContainer}>
                <FeatherIcon
                    name="search"
                    size={scale(18)}
                    color={theme.colors.mutedText}
                    style={styles.searchIcon}
                />
                <TextInput
                    testID="chat-search-input"
                    style={styles.searchInput}
                    placeholder={t('chat.searchPlaceholder')}
                    placeholderTextColor={theme.colors.mutedText}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    returnKeyType="search"
                />
            </View>
        ),
        [styles, t, theme.colors.mutedText, searchQuery, handleSearchChange],
    );

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer} testID="chat-empty-state">
            <FeatherIcon name="message-square" size={scale(64)} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>{t('chat.noMessagesTitle')}</Text>
            <Text style={styles.emptySubtitle}>
                {isSeekerUser
                    ? t('chat.noMessagesSubtitleSeeker')
                    : t('chat.noMessagesSubtitleDonor')}
            </Text>
        </View>
    ), [styles, t, theme.colors.border, isSeekerUser]);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centeredState} testID="chat-loading">
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.brandGreen}
                        testID="chat-loading-indicator"
                    />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centeredState} testID="chat-error">
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        testID="chat-retry-button"
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryText}>{t('common.tryAgain')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                {renderSearch()}
                <FlatList<ChatItem>
                    testID="chat-list"
                    data={chats}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.brandGreen}
                            colors={[theme.colors.brandGreen]}
                            testID="chat-refresh-control"
                        />
                    }
                />
            </View>
        );
    };

    return (
        <ScreenWrapper withBottomTab>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('chat.title')}</Text>
                </View>
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
