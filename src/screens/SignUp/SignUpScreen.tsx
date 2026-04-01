import React, { useState } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Platform,
} from 'react-native';
import { ImagePickerModal } from '../../components/common/ImagePickerModal';
import { useImagePicker } from '../../hooks/useImagePicker';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { AppInput } from '../../components/common/AppInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { RoleSelector } from '../../components/specified/signup/RoleSelector';
import { CountryCodeModal } from '../../components/common/CountryCodeModal';
import { useSignUp } from './useSignUp';
import { createStyles } from './styles';
import Images from '../../assets/images';
import { COUNTRY_CODES, CountryCode } from '../../constants/countryCodes';
import { CountryCodeSelector } from '../../components/common/CountryCodeSelector';
import { ProfileImageWithNames } from '../../components/common/ProfileImageWithNames';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

export const SignUpScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
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
        setProfileImageFile,
        errors,
        isLoading,
        isValid,
        handleSignUp,
        navigateToLogin,
    } = useSignUp();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);

    const selectedCountry = COUNTRY_CODES.find(c => c.dialCode === countryCode);

    const { takePhoto, selectFromGallery } = useImagePicker();

    const onTakePhoto = async () => {
        takePhoto((asset) => {
            setProfileImageUri(asset.uri || null);
            setProfileImageFile(asset);
        });
    };

    const onSelectFromGallery = async () => {
        selectFromGallery((asset) => {
            setProfileImageUri(asset.uri || null);
            setProfileImageFile(asset);
        });
    };

    const handleCountrySelect = (country: CountryCode) => {
        setCountryCode(country.dialCode);
    };

    return (
        <ScreenWrapper scrollable contentStyle={styles.container}>
            <View testID="signup-screen">
                <Image
                    source={Images.danammLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>{t('signup.title')}</Text>
                <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

                <ProfileImageWithNames
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
                    profileImageUri={profileImageUri}
                    onImagePress={() => setIsImagePickerVisible(true)}
                    firstNameLabel={t('signup.firstNameLabel')}
                    lastNameLabel={t('signup.lastNameLabel')}
                    firstNamePlaceholder={t('signup.firstNamePlaceholder')}
                    lastNamePlaceholder={t('signup.lastNamePlaceholder')}
                    firstNameError={errors.firstName}
                    lastNameError={errors.lastName}
                    firstNameTestID="signup-firstname-input"
                    lastNameTestID="signup-lastname-input"
                    imageTestID="camera-icon-button"
                    imagePlaceholder={Images.userIcon}
                />

                <AppInput
                    label={t('signup.emailLabel')}
                    placeholder={t('signup.emailPlaceholder')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    leftIconName="mail"
                    error={errors.email}
                    testID="signup-email-input"
                />

                <View style={styles.phoneNumberContainer}>
                    <CountryCodeSelector
                        label={t('signup.phoneLabel')}
                        countryCode={countryCode}
                        selectedCountry={selectedCountry}
                        onPress={() => setIsCountryModalVisible(true)}
                        testID="country-code-selector"
                    />
                    <View style={styles.phoneInputContainer}>
                        <AppInput
                            placeholder={t('signup.phonePlaceholder')}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            leftIconName="phone"
                            error={errors.phoneNumber}
                            testID="signup-phone-input"
                        />
                    </View>
                </View>

                <AppInput
                    label={t('signup.passwordLabel')}
                    placeholder={t('signup.passwordPlaceholder')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    leftIconName="lock"
                    rightIconName={!isPasswordVisible ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    error={errors.password}
                    testID="signup-password-input"
                />

                <AppInput
                    label={t('signup.confirmPasswordLabel')}
                    placeholder={t('signup.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                    leftIconName="lock"
                    rightIconName={!isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    error={errors.confirmPassword}
                    testID="signup-confirm-password-input"
                />

                <RoleSelector
                    selectedRole={role}
                    onSelect={setRole}
                    testIDDonor="signup-role-donor"
                    testIDSeeker="signup-role-seeker"
                />

                <PrimaryButton
                    title={t('signup.signUpButton')}
                    onPress={handleSignUp}
                    loading={isLoading}
                    //   disabled={!isValid || isLoading}
                    testID="signup-button"
                    containerStyle={styles.button}
                    textStyle={styles.buttonText}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('signup.alreadyHaveAccount')} </Text>
                    <TouchableOpacity onPress={navigateToLogin} testID="signup-login-link">
                        <Text style={styles.loginText}>{t('signup.login')}</Text>
                    </TouchableOpacity>
                </View>

                <ImagePickerModal
                    isVisible={isImagePickerVisible}
                    onClose={() => setIsImagePickerVisible(false)}
                    onTakePhoto={onTakePhoto}
                    onSelectFromGallery={onSelectFromGallery}
                    title={t('signup.title')}
                />

                <CountryCodeModal
                    isVisible={isCountryModalVisible}
                    onClose={() => setIsCountryModalVisible(false)}
                    onSelect={handleCountrySelect}
                />
            </View>
        </ScreenWrapper>
    );
};
