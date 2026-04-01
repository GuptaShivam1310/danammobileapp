import { useState, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../store';
import { signupUser } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';
import { Asset } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export const useSignUp = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'donor' | 'seeker'>('seeker');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<Asset | null>(null);



    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) {
            newErrors.firstName = t('signup.validation.firstNameRequired');
        } else if (firstName.length < 2) {
            newErrors.firstName = t('signup.validation.minLength2');
        }

        if (!lastName.trim()) {
            newErrors.lastName = t('signup.validation.lastNameRequired');
        } else if (lastName.length < 2) {
            newErrors.lastName = t('signup.validation.minLength2');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = t('signup.validation.emailRequired');
        } else if (!emailRegex.test(email)) {
            newErrors.email = t('signup.validation.emailInvalid');
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = t('signup.validation.phoneRequired');
        } else if (!phoneRegex.test(phoneNumber)) {
            newErrors.phoneNumber = t('signup.validation.phoneInvalid');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!password) {
            newErrors.password = t('signup.validation.passwordRequired');
        } else if (!passwordRegex.test(password)) {
            newErrors.password = t('signup.validation.passwordRequirements');
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = t('signup.validation.confirmPasswordRequired');
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = t('signup.validation.passwordsDoNotMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [firstName, lastName, email, phoneNumber, password, confirmPassword, t]);

    const isValid = useMemo(() => {
        return (
            firstName.length >= 2 &&
            lastName.length >= 2 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            /^\d{10}$/.test(phoneNumber) &&
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password) &&
            password === confirmPassword
        );
    }, [firstName, lastName, email, phoneNumber, password, confirmPassword]);

    const handleSignUp = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                phoneNumber: phoneNumber.trim(),
                countryCode,
                password,
                role,
                profileImageUri
            };
            const data = await dispatch(signupUser(payload)).unwrap();

            showSuccessToast(t('signup.alerts.accountCreated'));
            // No need for navigation.reset, RootNavigator handles it via isAuthenticated state
        } catch (error: any) {
            console.log('Signup screen error:', error);
            showErrorToast(String(error || t('signup.errors.generic')));
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate(ROUTES.LOGIN);
    };

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
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        role,
        setRole,
        profileImageUri,
        setProfileImageUri,
        profileImageFile,
        setProfileImageFile,
        errors,
        isLoading,
        isValid,
        handleSignUp,
        navigateToLogin,
    };
};
