import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import get from 'lodash/get';
import { IUpdateUserRequest, IUserProfile } from '../../models/profile';
import { RootStackParamList } from '../../models/navigation';
import { Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateProfile, fetchProfile } from '../../store/slices/profileSlice';
import { useTranslation } from 'react-i18next';

export const useEditProfile = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const userProfile = useAppSelector(state => state.profile.user);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (userProfile) {

            const nameParts = (userProfile.full_name || '').split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setEmail(userProfile.email || '');
            setProfileImage(userProfile.profile_image_url || null);
            setPhoneNumber(userProfile.phone_number || "");
            setCountryCode(userProfile.country_code || '+91');
        }
    }, [userProfile]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!firstName.trim()) newErrors.firstName = t('validation.firstNameRequired');
        if (!lastName.trim()) newErrors.lastName = t('validation.lastNameRequired');
        if (!email.trim()) {
            newErrors.email = t('validation.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('validation.emailInvalidFormat');
        }
        if (!phoneNumber.trim()) newErrors.phoneNumber = t('validation.phoneRequired');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            const payload: IUpdateUserRequest = {
                full_name: `${firstName} ${lastName}`.trim(),
                email,
                phone_number: phoneNumber,
                country_code: countryCode,
                profile_image_url: profileImage || undefined,
            };
            const response = await dispatch(updateProfile(payload));
            if (updateProfile.fulfilled.match(response)) {
                // Refresh profile data from server to ensure consistency
                dispatch(fetchProfile());
                Alert.alert(t('alerts.success'), t('alerts.profileUpdated'));
                navigation.goBack();
            } else {
                Alert.alert(t('alerts.error'), (response.payload as string) || t('alerts.failedToUpdateProfile'));
            }
        } catch (err) {
            Alert.alert(t('alerts.error'), get(err, 'message', t('errors.generic')));
        } finally {
            setIsSaving(false);
        }
    };



    const handleBack = () => navigation.goBack();

    return {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        phoneNumber,
        setPhoneNumber,
        countryCode,
        setCountryCode,
        profileImage,
        setProfileImage,
        isLoading,
        isSaving,
        errors,
        handleSave,
        handleBack,
    };
};
