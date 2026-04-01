import React, { memo, useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    ListRenderItemInfo,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useTheme } from '../../theme';
import { scale } from '../../theme/scale';
import { Seeker } from '../../services/api/productSeekersApi';
import { useProductSeekers } from './useProductSeekers';
import { createStyles } from './styles';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductSeekersScreenParams {
    productId?: string;
    chatId?: string; // alias — passed when navigating from ChatDetail route
    productTitle?: string;
    productImage?: string;
}

// ─── SeekerItem ───────────────────────────────────────────────────────────────

interface SeekerItemProps {
    item: Seeker;
    styles: ReturnType<typeof createStyles>;
    viewRequestLabel: string;
    isLast: boolean;
    onPress: (item: Seeker) => void;
    onViewRequest: (item: Seeker) => void;
}

const SeekerItem = memo(
    ({ item, styles, viewRequestLabel, isLast, onPress, onViewRequest }: SeekerItemProps) => {
        const isPending = item.status === 'pending';

        const handlePress = useCallback(() => {
            onPress(item);
        }, [item, onPress]);

        const handleViewRequest = useCallback(() => {
            onViewRequest(item);
        }, [item, onViewRequest]);

        return (
            <>
                <TouchableOpacity
                    testID={`seeker-item-${item.id}`}
                    style={styles.seekerItem}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    {/* Avatar */}
                    {item.avatar ? (
                        <Image
                            source={{ uri: item.avatar }}
                            style={styles.avatar}
                            testID={`seeker-avatar-${item.id}`}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder} testID={`seeker-avatar-${item.id}`}>
                            <FeatherIcon name="user" size={scale(20)} color="#9CA3AF" />
                        </View>
                    )}

                    {/* Body */}
                    <View style={styles.seekerBody}>
                        <Text
                            style={isPending ? styles.seekerNamePending : styles.seekerNameActive}
                            numberOfLines={1}
                            testID={`seeker-name-${item.id}`}
                        >
                            {item.name}
                        </Text>
                        {!isPending && (
                            <View style={styles.messageRow}>
                                <Text style={[styles.lastMessage, { flex: 1 }]} numberOfLines={1}>
                                    {item.lastMessage || ''}
                                </Text>
                                <Text style={styles.timestampText}>
                                    {item.timestamp ?? ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Right: View Request button (Pending only) */}
                    <View style={styles.seekerRight}>
                        {isPending && (
                            <TouchableOpacity
                                testID={`view-request-button-${item.id}`}
                                style={styles.viewRequestButton}
                                onPress={handleViewRequest}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.viewRequestText}>{viewRequestLabel}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>

                {!isLast && <View style={styles.divider} />}
            </>
        );
    },
);

SeekerItem.displayName = 'SeekerItem';

// ─── ProductSeekersScreen ─────────────────────────────────────────────────────

interface Props {
    route?: {
        params?: ProductSeekersScreenParams;
    };
}

export const ProductSeekersScreen: React.FC<Props> = ({ route }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme.colors);

    const productId = route?.params?.productId ?? route?.params?.chatId ?? '';
    const productTitle = route?.params?.productTitle ?? t('productSeekers.titleFallback');
    const productImage = route?.params?.productImage;

    const {
        seekers,
        loading,
        error,
        searchQuery,
        handleSearchChange,
        handleRetry,
        handleBack,
        handleSeekerPress,
        handleViewRequest,
        load,
    } = useProductSeekers(productId);

    useEffect(() => {
        load();
    }, [load]);

    const keyExtractor = useCallback((item: Seeker) => item.id, []);

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<Seeker>) => (
            <SeekerItem
                item={item}
                styles={styles}
                viewRequestLabel={t('productSeekers.viewRequest')}
                isLast={index === seekers.length - 1}
                onPress={(item) => handleSeekerPress(item, productTitle, productImage)}
                onViewRequest={(item) => handleViewRequest(item, productTitle, productImage)}
            />
        ),
        [styles, t, seekers.length, handleSeekerPress, productTitle, productImage, handleViewRequest],
    );

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer} testID="seekers-empty-state">
            <FeatherIcon name="info" size={scale(48)} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('productSeekers.noInterest')}</Text>
            <Text style={styles.emptyDescription}>
                {t('productSeekers.noInterestDescription')}
            </Text>
        </View>
    ), [styles, t]);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centeredState} testID="seekers-loading">
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.brandGreen}
                        testID="seekers-loading-indicator"
                    />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centeredState} testID="seekers-error">
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        testID="seekers-retry-button"
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
            <FlatList<Seeker>
                testID="seekers-list"
                data={seekers}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
        );
    };

    return (
        <ScreenWrapper withBottomTab>
            <View style={styles.container}>
                {/* ── Header ────────────────────────────── */}
                <View style={styles.headerRow} testID="product-header">
                    <TouchableOpacity
                        testID="back-button"
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <FeatherIcon
                            name="arrow-left"
                            size={scale(18)}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>


                </View>
                <View style={styles.headerRow}>
                    {productImage ? (
                        <ImageBackground
                            source={{ uri: productImage }}
                            style={styles.productImage}
                            testID="product-image"
                            resizeMode='cover'
                        />
                    ) : (
                        <View style={styles.productImage} testID="product-image-placeholder" />
                    )}

                    <Text style={styles.productTitle} numberOfLines={2} testID="product-title">
                        {productTitle}
                    </Text>
                </View>
                {/* ── Search Bar ────────────────────────── */}
                <View style={styles.searchContainer}>
                    <FeatherIcon
                        name="search"
                        size={scale(17)}
                        color={theme.colors.mutedText}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        testID="seekers-search-input"
                        style={styles.searchInput}
                        placeholder={t('productSeekers.searchPlaceholder')}
                        placeholderTextColor={theme.colors.mutedText}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                    />
                </View>

                {/* ── Content ───────────────────────────── */}
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
