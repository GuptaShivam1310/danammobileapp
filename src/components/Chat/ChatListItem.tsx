import React, { memo, useCallback } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale, normalize } from '../../theme/scale';
import { ChatItem } from '../../screens/ChatList/ChatListScreen';
import dayjs from 'dayjs';
import { palette } from '../../constants/colors';

interface ChatListItemProps {
    item: ChatItem;
    isLast: boolean;
    onPress: (item: ChatItem) => void;
}

const ChatListItem = memo(({ item, isLast, onPress }: ChatListItemProps) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const handlePress = useCallback(() => onPress(item), [item, onPress]);

    const formattedTime = dayjs(item.lastMessageTime).format('hh:mm A');

    return (
        <TouchableOpacity
            testID={`chat-item-${item.id}`}
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* User Avatar */}
            {item.userAvatar ? (
                <Image
                    source={{ uri: item.userAvatar }}
                    style={styles.avatar}
                    testID={`chat-avatar-${item.id}`}
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <FeatherIcon name="user" size={scale(24)} color={theme.colors.mutedText} />
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.userName || item.productTitle}
                    </Text>
                    <Text style={styles.time}>{formattedTime}</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>

            {!isLast && <View style={styles.divider} />}
        </TouchableOpacity>
    );
});

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
    },
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: theme.colors.background,
    },
    avatarPlaceholder: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    userName: {
        fontSize: normalize(16),
        fontFamily: 'Inter-Bold', // Standard for this project
        color: theme.colors.text,
        flex: 1,
        marginRight: scale(8),
    },
    time: {
        fontSize: normalize(12),
        fontFamily: 'Inter-Regular',
        color: theme.colors.mutedText,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(4),
    },
    lastMessage: {
        fontSize: normalize(14),
        fontFamily: 'Inter-Regular',
        color: theme.colors.mutedText,
        flex: 1,
        marginRight: scale(8),
    },
    badge: {
        backgroundColor: theme.colors.brandGreen,
        minWidth: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(4),
    },
    badgeText: {
        color: palette.white,
        fontSize: normalize(11),
        fontFamily: 'Inter-Bold',
    },
    divider: {
        position: 'absolute',
        bottom: 0,
        left: scale(78),
        right: 0,
        height: 1,
        backgroundColor: theme.colors.border,
        opacity: 0.5,
    },
});

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
