import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { ProductCard } from '../../components/specified/home/ProductCard';
import { usePost } from './usePost';
import { styles } from './styles';
import { useTheme } from '../../theme';
import { palette } from '../../constants/colors';
import { EmptyList } from '../../components/common/EmptyList';
import { scale } from '../../theme/scale';

export const PostScreen: React.FC = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const {
        posts,
        isLoading,
        isRefreshing,
        activeTab,
        awaitingCount,
        contributedCount,
        handleContinue,
        handleTabChange,
        handlePostPress,
        handleRefresh,
        handleLoadMore,
        hasMore,
    } = usePost();

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {t('myPost.title')}
            </Text>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    {
                        backgroundColor: activeTab === 'Awaiting' ? theme.colors.brandGreen : theme.colors.surface,
                        borderColor: theme.colors.brandGreen,
                    },
                ]}
                onPress={() => handleTabChange('Awaiting')}
            >
                <Text
                    style={[
                        styles.tabText,
                        { color: activeTab === 'Awaiting' ? palette.white : theme.colors.text },
                    ]}
                >
                    {`${t('myPost.awaiting')} (${awaitingCount})`}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    {
                        backgroundColor: activeTab === 'Contributed' ? theme.colors.brandGreen : theme.colors.surface,
                        borderColor: theme.colors.brandGreen,
                    },
                ]}
                onPress={() => handleTabChange('Contributed')}
            >
                <Text
                    style={[
                        styles.tabText,
                        { color: activeTab === 'Contributed' ? palette.white : theme.colors.text },
                    ]}
                >
                    {`${t('myPost.contributed')} (${contributedCount})`}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => {
        const isContributedTab = activeTab === 'Contributed';

        if (isContributedTab) {
            return (
                <View style={styles.emptyStateContainer} testID="contributed-empty-state">
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                        {t('myPost.noContributedTitle')}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}>
                        {t('myPost.noContributedSubtitle')}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyStateContainer} testID="empty-state-container">
                <EmptyList
                    title={t('myPost.empty.title')}
                    subTitle={t('myPost.empty.subTitle')}
                    btnText={t('myPost.empty.button')}
                    btnCallBack={handleContinue}
                />
            </View>
        );
    };

    const renderFooter = () => {
        if (!hasMore || posts.length === 0) return null;
        return (
            <View style={{ paddingVertical: scale(20) }}>
                <ActivityIndicator size="small" color={theme.colors.brandGreen} />
            </View>
        );
    };

    const renderItem = useCallback(({ item }: any) => (
        <View style={styles.itemContainer}>
            <ProductCard
                item={item}
                onPress={() => handlePostPress(item.id)}
                testID={`post-card-${item.id}`}
                isContributed={activeTab === 'Contributed'}
            />
        </View>
    ), [activeTab, handlePostPress]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyStateContainer} testID="loading-state">
                    <ActivityIndicator size="large" color={theme.colors.brandGreen} />
                    <Text style={{ marginTop: scale(10), color: theme.colors.mutedText }}>
                        {t('common.loading')}
                    </Text>
                </View>
            );
        }

        if (posts.length === 0) {
            return renderEmptyState();
        }

        return (
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                testID="posts-list"
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.brandGreen]}
                        tintColor={theme.colors.brandGreen}
                    />
                }
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
            />
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {renderHeader()}
                {renderTabs()}
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};
