import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addImage, removeImage, setImages } from '../../store/slices/postSlice';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { ROUTES } from '../../constants/routes';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { postApi } from '../../services/api/postApi';

type UploadImagesNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useUploadImages = () => {
    const navigation = useNavigation<UploadImagesNavigationProp>();
    const dispatch = useDispatch();
    const { images } = useSelector((state: RootState) => state.post.newPostData);

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleImageResponse = useCallback((response: ImagePickerResponse) => {
        if (response.didCancel) {
        } else if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Something went wrong');
        } else if (response.assets && response.assets.length > 0) {
            response.assets.forEach(asset => {
                if (asset.uri && !images.includes(asset.uri)) {
                    dispatch(addImage(asset.uri));
                }
            });
        }
    }, [dispatch, images]);

    const handleCapture = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
            return;
        }

        launchCamera({
            mediaType: 'photo',
            includeBase64: false,
            quality: 0.8,
        }, handleImageResponse);
    };

    const handleChooseGallery = () => {
        launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,
            quality: 0.8,
            selectionLimit: 0, // 0 means no limit on some versions, but react-native-image-picker might vary
        }, handleImageResponse);
    };

    const handleDeleteImage = (index: number) => {
        dispatch(removeImage(index));
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleNext = async () => {
        if (images.length === 0) {
            Alert.alert('No Images', 'Please upload at least one image.');
            return;
        }

        setIsUploading(true);
        try {
            const uploadPromises = images.map(async (uri) => {
                if (!uri || typeof uri !== 'string' || uri.trim() === '') {
                    return null;
                }

                const response = await postApi.uploadImage(uri);
                return response?.data?.file_url || response?.file_url || uri;
            });

            const results = await Promise.allSettled(uploadPromises);
            const successfulUrls: string[] = [];
            let failedCount = 0;

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    successfulUrls.push(result.value);
                } else if (result.status === 'rejected' || !result.value) {
                    failedCount++;
                }
            });

            if (successfulUrls.length === 0 && images.length > 0) {
                throw new Error('All image uploads failed');
            }

            if (failedCount > 0) {
                Alert.alert(
                    'Partial Success',
                    `${failedCount} images failed to upload. Proceed with ${successfulUrls.length} images?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Proceed',
                            onPress: () => {
                                const uniqueUrls = Array.from(new Set(successfulUrls));
                                dispatch(setImages(uniqueUrls));
                                navigation.navigate(ROUTES.SELECT_LOCATION);
                            }
                        }
                    ]
                );
            } else {
                const uniqueUrls = Array.from(new Set(successfulUrls));
                dispatch(setImages(uniqueUrls));
                navigation.navigate(ROUTES.SELECT_LOCATION);
            }
        } catch (error: any) {
            Alert.alert('Upload Failed', error?.message || 'Failed to upload images. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return {
        images,
        isUploading,
        handleCapture,
        handleChooseGallery,
        handleDeleteImage,
        handleBack,
        handleNext,
    };
};
