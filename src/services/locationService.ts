import Geocoder from 'react-native-geocoding';
import { APP_CONSTANTS } from '../constants/config';

Geocoder.init(APP_CONSTANTS.googleApiKey);

export const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
        const res = await Geocoder.from(lat, lng);
        const result = res.results[0];

        let area = '';
        let city = '';

        result.address_components.forEach((component: any) => {
            if (component.types.includes('sublocality') || component.types.includes('locality')) {
                if (!area) area = component.long_name;
            }
            if (component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
            }
        });

        return {
            fullAddress: result.formatted_address,
            area,
            city,
            latitude: lat,
            longitude: lng,
        };
    } catch (error) {
        console.log('Geocode error:', error);
        return null;
    }
};