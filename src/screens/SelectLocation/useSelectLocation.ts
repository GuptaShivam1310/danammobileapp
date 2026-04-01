
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAddressFromCoords } from '../../services/locationService';
import { updatePostLocation } from '../../store/slices/postSlice';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { SelectLocationParams } from '../../models/navigation';
import { setLocation } from '../../store/slices/seekerPreferencesSlice';

export const useSelectLocation = (navigation: any, routeParams?: SelectLocationParams) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { newPostData } = useSelector((state: any) => state.post);
    const authUser = useSelector((state: any) => state.auth?.user);
    const [persistedUserType, setPersistedUserType] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hydrateUserType = async () => {
            try {
                const userData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
                if (!userData) {
                    setPersistedUserType(null);
                    return;
                }

                const parsedUser = JSON.parse(userData) as { type?: string };
                setPersistedUserType(parsedUser?.type ?? null);
            } catch {
                setPersistedUserType(null);
            }
        };

        hydrateUserType();
    }, []);

    const userType = routeParams?.userType ?? authUser?.role ?? persistedUserType;
    const isSeekerUserType = userType?.trim().toLowerCase().startsWith('seeker') ?? false;

    const initialLocation = newPostData.address ? {
        latitude: newPostData.latitude,
        longitude: newPostData.longitude,
        fullAddress: newPostData.address,
        title: newPostData.address.split(',')[0],
    } : null;

    const fetchCurrentLocation = async () => {
        setLoading(true);
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setLoading(false);
                    Alert.alert(t('alerts.error'), t('alerts.locationPermissionRequired'));
                    return null;
                }
            } else if (Platform.OS === 'ios') {
                const status = await Geolocation.requestAuthorization('whenInUse');
                if (status !== 'granted') {
                    setLoading(false);
                    Alert.alert(t('alerts.error'), t('alerts.locationPermissionRequired'));
                    return null;
                }
            }

            return new Promise((resolve) => {
                Geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const addressData = await getAddressFromCoords(latitude, longitude);
                        if (addressData) {
                            setCurrentLocation(addressData);
                            resolve(addressData);
                        } else {
                            resolve(null);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        setLoading(false);
                        Alert.alert(t('alerts.error'), t('errors.generic'));
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            });
        } catch (error) {
            setLoading(false);
            return null;
        }
    };

    useEffect(() => {
        fetchCurrentLocation();
    }, []);

    const handleSelectLocation = (location: any) => {
        if (!location) return;
        dispatch(updatePostLocation({
            address: location.fullAddress || [location.area, location.city].filter(Boolean).join(', '),
            latitude: location.latitude,
            longitude: location.longitude,
        }));
    };

    const handleNext = (selectedLocation: any) => {
        if (!selectedLocation) return;

        const fullAddress = selectedLocation.fullAddress
            || [selectedLocation.area, selectedLocation.city].filter(Boolean).join(', ');

        const lat = Number(selectedLocation.latitude);
        const lng = Number(selectedLocation.longitude);

        if (isSeekerUserType) {
            dispatch(setLocation({
                latitude: isNaN(lat) ? 0 : lat,
                longitude: isNaN(lng) ? 0 : lng,
                address: fullAddress,
            }));
            navigation.navigate(ROUTES.LOOKING_FOR_REASON, {
                item: routeParams?.item,
                gender: routeParams?.gender,
                dob: routeParams?.dob,
                profession: routeParams?.profession,
                selectedLocation: {
                    latitude: isNaN(lat) ? 0 : lat,
                    longitude: isNaN(lng) ? 0 : lng,
                    fullAddress,
                    area: selectedLocation.area,
                    city: selectedLocation.city,
                    title: selectedLocation.title,
                },
            });
            return;
        }

        handleSelectLocation(selectedLocation);
        navigation.navigate(ROUTES.POST_DETAIL, { id: 'preview', isPreview: true });
    };

    return { currentLocation, fetchCurrentLocation, loading, handleNext, handleSelectLocation, initialLocation };
};
