import React, { useRef } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MapView, { Marker } from 'react-native-maps';
import { ActiveHeartIcon, HeartIcon } from '../../assets/images';
import { AppImage } from '../../components/common/AppImage';
import { AppLoader } from '../../components/common/AppLoader';
import { ReportUserModal } from '../../components/common/ReportUserModal';
import { SvgIcon } from '../../components/common/SvgIcon';
import { AppButton } from '../../components/common/AppButton';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { palette } from '../../constants/colors';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { formatDisplayDate } from '../../utils/dateUtils';
import { useProductDetailScreen } from './ProductDetailScreen.hook';
import { createProductDetailStyles } from './ProductDetailScreen.styles';
import { DanamEditIcon } from '../../assets/icons';

const { width } = Dimensions.get('window');

export function ProductDetailScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createProductDetailStyles(theme);
  const carouselRef = useRef<ICarouselInstance>(null);
  const {
    productDetail,
    status,
    isFromMyReceivedGoods,
    isDetailsLoading,
    isStatusLoading,
    isStatusUpdating,
    isFavorite,
    isFavoriteUpdating,
    currentImageIndex,
    setCurrentImageIndex,
    handleBack,
    handleShare,
    handleToggleFavorite,
    handleInterested,
    handleCancelInterest,
    handleCall,
    handleChat,
    handleReportIssue,
    isReportModalVisible,
    reportReason,
    isReporting,
    handleReportReasonChange,
    handleCancelReportIssue,
    handleSubmitReportIssue,
  } = useProductDetailScreen();
  const isApiLoading = isDetailsLoading || isStatusLoading;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleBack}
        testID="product-detail-back-button"
      >
        <FeatherIcon name="arrow-left" size={moderateScale(22)} color={theme.colors.text} />
      </TouchableOpacity>
      {!isFromMyReceivedGoods ? (
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            testID="product-detail-share-button"
          >
            <FeatherIcon name="share-2" size={moderateScale(20)} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleFavorite}
            disabled={isFavoriteUpdating}
            testID="product-detail-like-button"
          >
            <SvgIcon icon={isFavorite ? ActiveHeartIcon : HeartIcon} size={moderateScale(18)} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
  const renderCarousel = (detail: NonNullable<typeof productDetail>) => (
    <View style={styles.carouselWrapper}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width - moderateScale(32)}
        height={moderateScale(240)}
        data={detail.images}
        onSnapToItem={index => setCurrentImageIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <AppImage imageUri={item} style={styles.image} resizeMode="cover" />
          </View>
        )}
      />
      {detail.images.length > 1 || (detail.images.length === 1 && detail.images[0] !== null) ? (
        <>
          <View style={styles.imageOverlay}>
            {detail.images.map((_, index) => (
              <TouchableOpacity
                key={`product-dot-${index}`}
                onPress={() => {
                  carouselRef.current?.scrollTo({ index });
                  setCurrentImageIndex(index);
                }}
                style={[styles.dot, currentImageIndex === index ? styles.activeDot : null]}
              />
            ))}
          </View>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{`${currentImageIndex + 1}/${detail.images.length}`}</Text>
          </View>
        </>
      ) : null}
    </View>
  );

  const renderContributedTo = (detail: NonNullable<typeof productDetail>) => {
    return (
      <View>
        <Text style={styles.sectionTitle}>{t('productDetail.contributedBy')}</Text>
        <View style={styles.contributedCard}>
          <View style={styles.avatarWrap}>
            {detail.contributedBy.profile_image ? (
              <AppImage
                imageUri={detail.contributedBy.profile_image}
                style={styles.contributorAvatar}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {detail.contributedBy.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.contributorInfo}>
            <Text style={styles.contributorName}>{detail.contributedBy.name}</Text>
            {isFromMyReceivedGoods ? (
              <>
                <Text style={styles.contributorMeta}>{detail.contributedBy.email}</Text>
                <Text style={styles.contributorMeta}>{detail.contributedBy.phone}</Text>
              </>
            ) : (
              <View style={styles.contributedLabelRow}>
                <SvgIcon icon={DanamEditIcon} size={moderateScale(20)} />
                <Text style={styles.contributedLabel} numberOfLines={1}>
                  {detail.contributedBy.contributionLabel}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderActionSection = () => {
    if (status === 'pending') {
      return (
        <AppButton
          title={t('productDetail.actions.interested')}
          onPress={handleInterested}
          loading={isStatusUpdating}
          disabled={isStatusUpdating}
          buttonStyle={styles.interestedButton}
          titleStyle={styles.interestedText}
        />
      );
    }

    if (status === 'in-progress') {
      return (
        <TouchableOpacity
          style={styles.cancelInterestButton}
          onPress={handleCancelInterest}
          disabled={isStatusUpdating}
        >
          {isStatusUpdating ? (
            <ActivityIndicator color={palette.interestCancel} />
          ) : (
            <Text style={styles.cancelInterestText}>{t('productDetail.actions.cancelInterest')}</Text>
          )}
        </TouchableOpacity>
      );
    }

    if (status === 'done') {
      return (
        <View style={styles.doneButtonRow}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <FeatherIcon name="phone" size={moderateScale(18)} color={palette.white} />
            <Text style={styles.callChatText}>{t('productDetail.actions.call')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <FeatherIcon name="message-circle" size={moderateScale(18)} color={palette.white} />
            <Text style={styles.callChatText}>{t('productDetail.actions.chat')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (!productDetail || isApiLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <AppLoader testID="product-detail-loader" />
        </View>
      </ScreenWrapper>
    );
  }


  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{productDetail.title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{productDetail.category}</Text>
            </View>
            <Text style={styles.dateText}>{`| ${formatDisplayDate(productDetail.date)}`}</Text>
          </View>

          {renderCarousel(productDetail)}
          <Text style={styles.description}>{productDetail.description}</Text>

          <Text style={styles.sectionTitle}>{t('productDetail.location')}</Text>
          {(typeof productDetail.latitude === 'number' &&
            typeof productDetail.longitude === 'number') ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: productDetail.latitude,
                  longitude: productDetail.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: productDetail.latitude,
                    longitude: productDetail.longitude,
                  }}
                />
              </MapView>
            </View>
          ) : null}

          {renderContributedTo(productDetail)}

          {!isFromMyReceivedGoods ? (
            <View style={styles.actionContainer}>
              {renderActionSection()}
              {status ? (
                <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
                  <Text style={styles.reportText}>{t('productDetail.actions.reportIssue')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        {!isFromMyReceivedGoods ? (
          <ReportUserModal
            isVisible={isReportModalVisible}
            title={t('productDetail.reportIssueModal.title')}
            description={t('productDetail.reportIssueModal.description')}
            reason={reportReason}
            onReasonChange={handleReportReasonChange}
            onCancel={handleCancelReportIssue}
            onReport={handleSubmitReportIssue}
            isLoading={isReporting}
            testIDPrefix="product-detail-report"
          />
        ) : null}
      </View>
    </ScreenWrapper>
  );
}
