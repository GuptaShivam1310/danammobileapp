import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { ProfileImageWithNames } from '../../components/common/ProfileImageWithNames';
import { CountryCodeSelector } from '../../components/common/CountryCodeSelector';
import { CountryCodeModal } from '../../components/common/CountryCodeModal';
import { useTheme } from '../../theme';
import { AppLoader } from '../../components/common/AppLoader';
import { useEditProfile } from './useEditProfile';
import { styles as createStyles } from './styles';
import { COUNTRY_CODES, CountryCode } from '../../constants/countryCodes';
import { ImagePickerModal } from '../../components/common/ImagePickerModal';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';

export const EditProfileScreen: React.FC = () => {
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
        profileImage,
        setProfileImage,
        isLoading,
        isSaving,
        handleSave,
        handleBack,
        errors,
    } = useEditProfile();

    const [isImagePickerVisible, setIsImagePickerVisible] = React.useState(false);
    const { takePhoto, selectFromGallery } = useImagePicker();

    const onTakePhoto = () => {
        takePhoto((asset) => {
            if (asset.uri) {
                setProfileImage(asset.uri);
            }
        });
    };

    const onSelectFromGallery = () => {
        selectFromGallery((asset) => {
            if (asset.uri) {
                setProfileImage(asset.uri);
            }
        });
    };

    const [isCountryModalVisible, setIsCountryModalVisible] = React.useState(false);
    const selectedCountry = COUNTRY_CODES.find(c => c.dialCode === countryCode);

    const handleCountrySelect = (country: CountryCode) => {
        setCountryCode(country.dialCode);
    };

    if (isLoading) {
        return (
            <ScreenWrapper testID="edit-profile-loading" withBottomTab={true}>
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <AppLoader />
                </View>
            </ScreenWrapper>
        );
    }

  return (
    <ScreenWrapper testID="edit-profile-screen" withBottomTab={true}>
      <View style={styles.topSpacing}>
        <Header
          title={t('profile.editProfile')}
          onBackPress={handleBack}
          backButtonTestID="edit-profile-back-button"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileImageWithNames
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          profileImageUri={profileImage}
          onImagePress={() => setIsImagePickerVisible(true)}
          firstNameLabel={t('profile.firstName')}
          lastNameLabel={t('profile.lastName')}
          firstNamePlaceholder={t('profile.firstName')}
          lastNamePlaceholder={t('profile.lastName')}
          firstNameError={errors.firstName}
          lastNameError={errors.lastName}
          firstNameTestID="edit-profile-first-name-input"
          lastNameTestID="edit-profile-last-name-input"
          imageTestID="edit-profile-camera-button"
        />

                <AppInput
                    label={t('profile.email')}
                    placeholder={t('profile.email')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIconName="mail"
                    error={errors.email}
                    testID="edit-profile-email-input"
                    editable={false}
                    selectTextOnFocus={false}
                    containerStyle={{ opacity: 0.7 }}
                />
                <Text style={[styles.label, { color: theme.colors.text }]}>{t('profile.phoneNumber')}</Text>
                <View style={styles.phoneSection}>
                    <CountryCodeSelector
                        label={t('profile.phoneNumber')}
                        countryCode={countryCode}
                        selectedCountry={selectedCountry}
                        onPress={() => setIsCountryModalVisible(true)}
                        testID="edit-profile-country-dropdown"
                    />

                    <View style={styles.phoneInputContainer}>
                        <AppInput
                            placeholder={t('profile.phoneNumber')}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            leftIconName="phone"
                            error={errors.phoneNumber}
                            testID="edit-profile-phone-input"
                        />
                    </View>
                </View>

                <AppButton
                    title={t('profile.saveDetails')}
                    onPress={handleSave}
                    disabled={isSaving}
                    testID="edit-profile-save-button"
                    buttonStyle={styles.saveButton}
                    loading={isSaving}

                />

            </ScrollView>

            <CountryCodeModal
                isVisible={isCountryModalVisible}
                onClose={() => setIsCountryModalVisible(false)}
                onSelect={handleCountrySelect}
            />

            <ImagePickerModal
                isVisible={isImagePickerVisible}
                onClose={() => setIsImagePickerVisible(false)}
                onTakePhoto={onTakePhoto}
                onSelectFromGallery={onSelectFromGallery}
            />
        </ScreenWrapper>
    );
};
