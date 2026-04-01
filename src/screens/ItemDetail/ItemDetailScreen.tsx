import React, { useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLoader } from '../../components/common/AppLoader';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppImage } from '../../components/common/AppImage';
import { palette } from '../../constants/colors';
import { moderateScale } from '../../theme/scale';
import { useItemDetail } from './useItemDetail';
import { createStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ItemDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(), []);

  const {
    itemDetail,
    isLoading,
    error,
    currentImageIndex,
    handleBack,
    handleShare,
    onImageScroll,
    retry,
  } = useItemDetail();

  const renderHeader = () => (
    <>
      <SafeAreaView />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBack}
          testID="item-detail-back"
        >
          <FeatherIcon
            name="arrow-left"
            size={moderateScale(20)}
            color={palette.gray750}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          testID="item-detail-share"
        >
          <FeatherIcon
            name="share-2"
            size={moderateScale(18)}
            color={palette.gray750}
          />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderImages = () => {
    if (!itemDetail?.images?.length) {
      return (
        <View style={styles.carouselWrapper}>
          <View style={styles.imageContainer}>
            <AppImage imageUri={null} style={styles.image} resizeMode="cover" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.carouselWrapper}>
        <FlatList
          data={itemDetail.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => `item-image-${index}`}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <AppImage
                imageUri={item}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
        />
        <View style={styles.imageOverlay}>
          {itemDetail.images.map((_, index) => (
            <View
              key={`item-dot-${index}`}
              style={[
                styles.dot,
                currentImageIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentImageIndex + 1}/{itemDetail.images.length}
          </Text>
        </View>
      </View>
    );
  };

  const renderLocation = () => {
    if (!itemDetail) return null;
    const hasCoords =
      typeof itemDetail.latitude === 'number' &&
      typeof itemDetail.longitude === 'number' &&
      !Number.isNaN(itemDetail.latitude) &&
      !Number.isNaN(itemDetail.longitude);

    return (
      <>
        <Text style={styles.sectionTitle}>{t('itemDetail.location')}</Text>
        <View style={styles.mapContainer}>
          {hasCoords ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: itemDetail.latitude as number,
                longitude: itemDetail.longitude as number,
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
                  latitude: itemDetail.latitude as number,
                  longitude: itemDetail.longitude as number,
                }}
              />
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <FeatherIcon
                name="map-pin"
                size={moderateScale(24)}
                color={palette.gray750}
              />
              {itemDetail.locationAddress ? (
                <View style={styles.pinBadge}>
                  <Text style={styles.pinText}>
                    {itemDetail.locationAddress}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </>
    );
  };

  if (isLoading && !itemDetail) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <AppLoader />
        </View>
      </View>
    );
  }

  if (!itemDetail) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || t('itemDetail.errors.empty')}
          </Text>
          <AppButton
            title={t('itemDetail.errors.retry')}
            onPress={retry}
            buttonStyle={{ width: '50%' }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{itemDetail.title}</Text>
        <View style={styles.metaContainer}>
          {itemDetail.categoryName ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{itemDetail.categoryName}</Text>
            </View>
          ) : null}
          {itemDetail.date ? (
            <Text style={styles.dateText}>
              {itemDetail.categoryName ? '| ' : ''}
              {itemDetail.date}
            </Text>
          ) : null}
        </View>

        {renderImages()}

        {itemDetail.description ? (
          <Text style={styles.description}>{itemDetail.description}</Text>
        ) : null}

        {renderLocation()}

        <Text style={styles.sectionTitle}>{t('itemDetail.postedBy')}</Text>
        <View style={styles.postedByCard}>
          <View style={styles.avatarWrap}>
            {itemDetail.postedByAvatar ? (
              <AppImage
                imageUri={itemDetail.postedByAvatar}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {itemDetail.postedByName
                  ? itemDetail.postedByName.charAt(0).toUpperCase()
                  : 'U'}
              </Text>
            )}
          </View>
          <View style={styles.postedByInfo}>
            <Text style={styles.postedByName}>
              {itemDetail.postedByName ||
                t('productDetail.contributor.nameFallback')}
            </Text>
            <View style={styles.contributedRow}>
              <FeatherIcon
                name="users"
                size={moderateScale(14)}
                color={palette.seekerGreen}
              />
              <Text style={styles.contributedText}>
                {t('itemDetail.itemsContributed')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
