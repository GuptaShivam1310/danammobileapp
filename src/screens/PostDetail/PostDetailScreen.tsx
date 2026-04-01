import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MapView, { Marker } from 'react-native-maps';
import { usePostDetail } from './usePostDetail';
import { SuccessModal } from '../../components/common/SuccessModal';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { palette } from '../../constants/colors';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { moderateScale, verticalScale, scale } from '../../theme/scale';
import { ActionModal } from '../../components/common/ActionModal';
import DeleteIcon from '../../assets/icons/delete.svg';
import { AppButton } from '../../components/common/AppButton';
import { useTranslation } from 'react-i18next';
import { AppImage } from '../../components/common/AppImage';


const { width } = Dimensions.get('window');

const MemoizedImage = React.memo(({ uri }: { uri: string }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.imageContainer}>
            <AppImage
                imageUri={uri}
                style={styles.image}
                resizeMode="cover"
            />
        </View>
    );
});

export const PostDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const {
        postDetail,
        isLoading,
        isProcessing,
        currentImageIndex,
        handleBack,
        handleShare,
        handleEdit,
        handleDelete,
        handleMarkContributed,
        isDeleteModalVisible,
        confirmDelete,
        closeDeleteModal,
        isPreview,
        latitude,
        longitude,
        isSuccessModalVisible,
        handleHome,
        selectedSeeker,
        isContributed,
        onImageScroll,
        fetchPostDetail,
        isEditMode,
        error,
    } = usePostDetail();

    const renderHeader = useMemo(() => (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={handleBack} testID="back-button">
                <FeatherIcon name="arrow-left" size={moderateScale(24)} color={theme.colors.text} />
            </TouchableOpacity>
            {isPreview ? (
                <Text style={styles.headerTitle}>{t('postDetail.previewTitle')}</Text>
            ) : null}
            {!isPreview ? (
                <TouchableOpacity style={styles.iconButton} onPress={handleShare} testID="share-button">
                    <FeatherIcon name="share-2" size={moderateScale(20)} color={theme.colors.text} />
                </TouchableOpacity>
            ) : (
                <View style={{ width: moderateScale(44) }} />
            )}
        </View>
    ), [handleBack, handleShare, isPreview, t, theme.colors.text, styles]);

    const renderActions = useMemo(() => (
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit} testID="edit-button">
                <FeatherIcon name="edit-2" size={moderateScale(16)} color={theme.colors.text} />
                <Text style={styles.actionButtonText}>{t('postDetail.editDetails')}</Text>
            </TouchableOpacity>
            {!isPreview && (
                <TouchableOpacity style={styles.actionButton} onPress={handleDelete} testID="delete-button">
                    <FeatherIcon name="trash-2" size={moderateScale(16)} color={theme.colors.text} />
                    <Text style={styles.actionButtonText}>{t('postDetail.delete')}</Text>
                </TouchableOpacity>
            )}
        </View>
    ), [handleEdit, handleDelete, isPreview, t, theme.colors.text, styles]);

    const renderImages = () => {
        if (!postDetail?.images || postDetail.images.length === 0) {
            return (
                <View style={styles.carouselWrapper}>
                    <View style={styles.imageContainer}>
                        <AppImage
                            imageUri={null}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.carouselWrapper}>
                <FlatList
                    data={postDetail.images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onImageScroll}
                    keyExtractor={(_, index) => index.toString()}
                    initialNumToRender={3}
                    windowSize={3}
                    renderItem={({ item }) => <MemoizedImage uri={item} />}
                />
                <View style={styles.imageOverlay}>
                    {postDetail.images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentImageIndex === index && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>
                        {currentImageIndex + 1}/{postDetail.images.length}
                    </Text>
                </View>
            </View>
        );
    };

    const renderLocation = useMemo(() => {
        const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);
        if (!hasCoords && !postDetail?.address) return null;

        return (
            <>
                <Text style={styles.locationTitle}>{t('postDetail.location')}</Text>
                <View style={styles.mapImageContainer}>
                    {hasCoords ? (
                        <MapView
                            style={styles.mapImage}
                            initialRegion={{
                                latitude: latitude as number,
                                longitude: longitude as number,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            <Marker coordinate={{ latitude: latitude as number, longitude: longitude as number }} />
                        </MapView>
                    ) : (
                        <View style={[styles.mapImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: palette.gray50 }]}>
                            <FeatherIcon name="map-pin" size={moderateScale(32)} color={palette.gray300} />
                            <Text style={{ marginTop: scale(8), color: palette.gray500 }}>{postDetail?.address}</Text>
                        </View>
                    )}
                </View>
            </>
        );
    }, [latitude, longitude, postDetail?.address, t, styles]);

    if (isLoading || (!postDetail && !error)) {
        return (
            <ScreenWrapper>
                <View style={styles.container}>
                    {renderHeader}
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.brandGreen} />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    if (!postDetail) {
        return (
            <ScreenWrapper>
                <View style={styles.container}>
                    {renderHeader}
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: scale(20) }}>
                        <FeatherIcon name="alert-circle" size={scale(48)} color={palette.red500} />
                        <Text style={{ marginTop: scale(16), fontSize: scale(16), textAlign: 'center' }}>
                            {error || 'Contribution details could not be loaded.'}
                        </Text>
                        <AppButton
                            title="Retry"
                            onPress={() => fetchPostDetail(false)}
                            buttonStyle={{ marginTop: scale(24), width: '50%' }}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {renderHeader}
                <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{postDetail.title}</Text>
                    <View style={styles.metaContainer}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {postDetail.category}{postDetail.subCategoryName ? ` | ${postDetail.subCategoryName}` : ''}
                            </Text>
                        </View>
                        <Text style={styles.dateText}>| {postDetail.date}</Text>
                    </View>

                    {!isPreview && renderActions}
                    {renderImages()}

                    <Text style={styles.description}>{postDetail.description}</Text>

                    {renderLocation}

                    {(postDetail.donatedTo || selectedSeeker) && (
                        <View testID="contributed-to-section">
                            <Text style={styles.contributedToTitle}>{t('postDetail.contributedTo')}</Text>
                            <View style={styles.contributedUserContainer} testID="seeker-info">
                                <View style={styles.userAvatarContainer}>
                                    {(postDetail.donatedTo?.avatar || selectedSeeker?.avatar) ? (
                                        <AppImage imageUri={postDetail.donatedTo?.avatar || selectedSeeker?.avatar} style={styles.userAvatarImage} />
                                    ) : (
                                        <Text style={styles.userAvatarPlaceholder}>
                                            {(postDetail.donatedTo?.name || selectedSeeker?.name || '').charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.userName}>{postDetail.donatedTo?.name || selectedSeeker?.name}</Text>
                                    <Text style={styles.userDetails}>{postDetail.donatedTo?.email || selectedSeeker?.email || 'N/A'}</Text>
                                    <Text style={styles.userDetails}>{postDetail.donatedTo?.phone || selectedSeeker?.phone || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {(isPreview || !isContributed) && (
                        <View style={styles.buttonContainer}>
                            <AppButton
                                title={isEditMode ? 'Update Detail' : (isPreview ? t('postDetail.contributeNow') : t('postDetail.markAsContributed'))}
                                onPress={handleMarkContributed}
                                loading={isProcessing}
                                buttonStyle={styles.markButton}
                            />
                        </View>
                    )}
                </ScrollView>
            </View>

            <ActionModal
                isVisible={isDeleteModalVisible}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                icon={DeleteIcon}
                title={t('postDetail.deleteModal.title')}
                subtitle={t('postDetail.deleteModal.subtitle')}
                cancelText={t('postDetail.deleteModal.cancel')}
                confirmText={t('postDetail.deleteModal.confirm')}
                confirmButtonColor={theme.colors.brandGreen || palette.red700}
                isLoading={isProcessing}
                testIDPrefix="delete-post-modal"
            />

            <SuccessModal
                isVisible={isSuccessModalVisible}
                onClose={handleHome}
                onButtonPress={handleHome}
                title={t('postDetail.successModal.title')}
                subtitle={t('postDetail.successModal.subtitle')}
                buttonText={t('postDetail.successModal.backHome')}
            />
        </ScreenWrapper>
    );
};
