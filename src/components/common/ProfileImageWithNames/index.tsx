import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../theme';
import { moderateScale, verticalScale } from '../../../theme/scale';
import { spacing } from '../../../theme/spacing';
import { AppInput } from '../AppInput';

interface ProfileImageWithNamesProps {
    firstName: string;
    setFirstName: (text: string) => void;
    lastName: string;
    setLastName: (text: string) => void;
    profileImageUri: string | null;
    onImagePress: () => void;
    firstNameLabel: string;
    lastNameLabel: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    firstNameError?: string;
    lastNameError?: string;
    firstNameTestID?: string;
    lastNameTestID?: string;
    imageTestID?: string;
    imagePlaceholder?: any;
}

export const ProfileImageWithNames: React.FC<ProfileImageWithNamesProps> = ({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUri,
    onImagePress,
    firstNameLabel,
    lastNameLabel,
    firstNamePlaceholder,
    lastNamePlaceholder,
    firstNameError,
    lastNameError,
    firstNameTestID,
    lastNameTestID,
    imageTestID,
    imagePlaceholder,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.imageContainer}
                onPress={onImagePress}
                testID={imageTestID}
                activeOpacity={0.8}
            >
                <Image
                    source={
                        profileImageUri
                            ? { uri: profileImageUri }
                            : imagePlaceholder || require('../../../assets/images/userIcon.png')
                    }
                    style={styles.image}
                />
                <View style={[styles.cameraIconContainer, { backgroundColor: theme.colors.brandGreen }]}>
                    <FeatherIcon name="camera" size={moderateScale(14)} color="white" />
                </View>
            </TouchableOpacity>

            <View style={styles.fieldsContainer}>
                <AppInput
                    label={firstNameLabel}
                    placeholder={firstNamePlaceholder}
                    value={firstName}
                    onChangeText={setFirstName}
                    leftIconName="user"
                    error={firstNameError}
                    testID={firstNameTestID}
                    containerStyle={styles.fieldInput}
                />
                <AppInput
                    label={lastNameLabel}
                    placeholder={lastNamePlaceholder}
                    value={lastName}
                    onChangeText={setLastName}
                    leftIconName="user"
                    error={lastNameError}
                    testID={lastNameTestID}
                    containerStyle={styles.fieldInput}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(spacing.lg),
    },
    imageContainer: {
        width: moderateScale(110),
        height: moderateScale(110),
        borderRadius: moderateScale(55),
        position: 'relative',
    },
    image: {
        width: moderateScale(110),
        height: moderateScale(110),
        borderRadius: moderateScale(55),
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    fieldsContainer: {
        flex: 1,
        marginLeft: moderateScale(spacing.lg),
    },
    fieldInput: {
        marginBottom: verticalScale(spacing.sm),
    },
});
