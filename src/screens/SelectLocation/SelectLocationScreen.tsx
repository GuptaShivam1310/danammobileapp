import React, { useState } from 'react';
import { View } from 'react-native';
import { AppLoader } from '../../components/common/AppLoader';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { LocationCard } from '../../components/common/LocationCard';
import { SvgIcon } from '../../components/common/SvgIcon';
import { useSelectLocation } from './useSelectLocation';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { APP_CONSTANTS } from '../../constants/config';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '../../theme/scale';
import { SearchIcon } from '../../assets/icons';
import { PrimaryButton } from '../../components/common/PrimaryButton';

const GOOGLE_API_KEY = APP_CONSTANTS.googleApiKey;

export const SelectLocationScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const {
    loading,
    handleNext,
    initialLocation,
    currentLocation,
    fetchCurrentLocation,
  } = useSelectLocation(navigation, route?.params);
  const [selectedLocation, setSelectedLocation] =
    useState<any>(initialLocation);

  const onLocationSelect = (data: any, details: any = null) => {
    if (details) {
      const loc = details.geometry.location;
      const addressComponents = details.address_components;

      let area = '';
      let city = '';

      addressComponents.forEach((component: any) => {
        if (
          component.types.includes('sublocality') ||
          component.types.includes('locality')
        ) {
          if (!area) area = component.long_name;
        }
        if (component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
      });

      setSelectedLocation({
        latitude: loc.lat,
        longitude: loc.lng,
        fullAddress: details.formatted_address,
        area,
        city,
        title: area || details.formatted_address.split(',')[0],
      });
    }
  };

  return (
    <ScreenWrapper testID="select-location-screen">
      <View style={styles.container}>
        <Header
          title={t('selectLocation.title')}
          onBackPress={() => navigation.goBack()}
          testID="select-location-header"
        />

        <View style={styles.content}>
          <GooglePlacesAutocomplete
            placeholder={t('selectLocation.searchPlaceholder')}
            fetchDetails
            onPress={onLocationSelect}
            query={{
              key: GOOGLE_API_KEY,
              language: 'en',
            }}
            renderLeftButton={() => (
              <View style={{ justifyContent: 'center' }}>
                <SvgIcon
                  icon={SearchIcon}
                  size={moderateScale(18)}
                  color={theme.colors.mutedText}
                />
              </View>
            )}
            styles={{
              container: styles.searchContainer,
              textInputContainer: styles.textInputContainer,
              textInput: styles.searchInput,
              listView: styles.listView,
              row: styles.row,
              separator: styles.separator,
              description: styles.description,
            }}
            enablePoweredByContainer={false}
          />

          {!selectedLocation && (
            <LocationCard
              title={t('selectLocation.useCurrentLocation')}
              subTitle={
                loading
                  ? t('common.loading')
                  : currentLocation?.fullAddress ||
                  t('selectLocation.fetchingLocation')
              }
              onPress={async () => {
                if (currentLocation) {
                  setSelectedLocation(currentLocation);
                } else {
                  const loc = await fetchCurrentLocation();
                  if (loc) setSelectedLocation(loc);
                }
              }}
              testID="current-location-button"
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {selectedLocation && (
            <LocationCard
              title={
                selectedLocation.title ||
                selectedLocation.area ||
                t('selectLocation.selectedLocation')
              }
              subTitle={selectedLocation.fullAddress}
              onPress={() => setSelectedLocation(null)}
              testID="selected-location-card"
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {loading && <AppLoader />}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            title={t('selectLocation.nextButton')}
            onPress={() => handleNext(selectedLocation || currentLocation)}
            disabled={!selectedLocation && !currentLocation}
            testID="location-next-button"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};
