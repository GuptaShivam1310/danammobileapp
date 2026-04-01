import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { get, isEmpty } from 'lodash';

export const useImagePicker = () => {
    const { t } = useTranslation();
    const requestCameraPermission = async () => {
        try {
            const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
            const status = await check(permission);

            if (status === RESULTS.GRANTED) return true;

            const result = await request(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Camera permission error:', error);
            return false;
        }
    };

    const takePhoto = useCallback(async (callback: (asset: Asset) => void, options: CameraOptions = { mediaType: 'photo', quality: 0.8 }) => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                Alert.alert(t('alerts.permissionDenied'), t('alerts.cameraPermissionRequired'));
                return;
            }

            const result = await launchCamera({
                ...options,
                saveToPhotos: true,
            });

            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert(t('alerts.error'), result.errorMessage || t('alerts.failedToOpenCamera'));
                return;
            }

            const assets = get(result, 'assets');
            if (!isEmpty(assets)) {
                callback(assets![0]);
            }
        } catch (error) {
            console.error('Launch camera error:', error);
            Alert.alert(t('alerts.error'), t('alerts.unexpectedCameraError'));
        }
    }, []);

    const selectFromGallery = useCallback(async (callback: (asset: Asset) => void, options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.8 }) => {
        try {
            const result = await launchImageLibrary(options);

            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert(t('alerts.error'), result.errorMessage || t('alerts.failedToOpenGallery'));
                return;
            }

            const assets = get(result, 'assets');
            if (!isEmpty(assets)) {
                callback(assets![0]);
            }
        } catch (error) {
            console.error('Launch gallery error:', error);
            Alert.alert(t('alerts.error'), t('alerts.unexpectedGalleryError'));
        }
    }, []);

    return { takePhoto, selectFromGallery };
};
