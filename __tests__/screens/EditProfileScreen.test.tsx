import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EditProfileScreen } from '../../src/screens/EditProfile/EditProfileScreen';

// Mock dependencies
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
    initialWindowMetrics: {
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
}));

// Mock react-native-elements
jest.mock('react-native-elements', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return {
        Button: ({ title, onPress, testID, disabled }: any) => (
            <TouchableOpacity onPress={onPress} testID={testID} disabled={disabled}>
                <Text>{title}</Text>
            </TouchableOpacity>
        ),
    };
});

// Mock react-native
jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        Image: createPrimitive('Image'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TextInput: createPrimitive('TextInput'),
        ScrollView: createPrimitive('ScrollView'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
            hairlineWidth: 1,
        },
        Platform: {
            OS: 'ios',
            select: (obj: any) => obj.ios,
        },
        Dimensions: {
            get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
        PixelRatio: {
            get: jest.fn().mockReturnValue(2),
            roundToNearestPixel: jest.fn().mockImplementation((v) => v),
            getPixelSizeForLayoutSize: jest.fn().mockImplementation((v) => v),
        },
        Easing: {
            inOut: jest.fn().mockReturnValue(() => 0),
            out: jest.fn().mockReturnValue(() => 0),
            in: jest.fn().mockReturnValue(() => 0),
            linear: jest.fn().mockReturnValue(() => 0),
            bezier: jest.fn().mockReturnValue(() => 0),
        },
        Animated: {
            Value: jest.fn().mockImplementation(() => ({
                interpolate: jest.fn(),
                setValue: jest.fn(),
            })),
            timing: jest.fn().mockReturnValue({ start: jest.fn() }),
            spring: jest.fn().mockReturnValue({ start: jest.fn() }),
            parallel: jest.fn().mockReturnValue({ start: jest.fn() }),
            sequence: jest.fn().mockReturnValue({ start: jest.fn() }),
            View: createPrimitive('View'),
            Image: createPrimitive('Image'),
            Text: createPrimitive('Text'),
        },
    };
});

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                background: '#FFFFFF',
                surface: '#FFFFFF',
                text: '#000000',
                brandGreen: '#0B6B4F',
                border: '#D1D5DB',
                danger: '#DC2626',
                mutedText: '#666',
                primary: '#0B6B4F',
            },
            typography: {
                fontFamilyBold: 'System',
                fontFamilyRegular: 'System',
                fontFamilyMedium: 'System',
            },
            spacing: {
                xs: 4,
                sm: 8,
                md: 16,
                lg: 24,
            },
        },
        isDark: false,
    }),
}));

jest.mock('../../src/theme/fonts', () => ({
    fonts: {
        bold: 'System',
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
    },
}));

const mockTakephoto = jest.fn();
const mockSelectFromGallery = jest.fn();

jest.mock('../../src/hooks/useImagePicker', () => ({
    useImagePicker: () => ({
        takePhoto: mockTakephoto,
        selectFromGallery: mockSelectFromGallery,
    }),
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID }, children);
    },
}));

jest.mock('../../src/components/common/Header', () => ({
    Header: ({ title, onBackPress, backButtonTestID }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return React.createElement(View, {}, [
            React.createElement(TouchableOpacity, { key: 'back', onPress: onBackPress, testID: backButtonTestID }, React.createElement(Text, {}, 'Back')),
            React.createElement(Text, { key: 'title' }, title),
        ]);
    },
}));

jest.mock('../../src/components/common/AppInput', () => ({
    AppInput: ({ label, value, onChangeText, placeholder, testID, editable, error }: any) => {
        const React = require('react');
        const { View, Text, TextInput } = require('react-native');
        return React.createElement(View, { testID: `${testID}-container` }, [
            label ? React.createElement(Text, { key: 'label' }, label) : null,
            React.createElement(TextInput, { key: 'input', value, onChangeText, placeholder, testID, editable }),
            error ? React.createElement(Text, { key: 'error', testID: `${testID}-error` }, error) : null,
        ]);
    },
}));

jest.mock('../../src/components/common/CountryCodeSelector', () => ({
    CountryCodeSelector: ({ label, countryCode, onPress, testID }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return React.createElement(View, {}, [
            label ? React.createElement(Text, { key: 'label' }, label) : null,
            React.createElement(TouchableOpacity, { key: 'selector', onPress, testID }, React.createElement(Text, {}, countryCode)),
        ]);
    },
}));

jest.mock('../../src/components/common/CountryCodeModal', () => ({
    CountryCodeModal: ({ isVisible, onClose, onSelect }: any) => {
        const React = require('react');
        const { View, TouchableOpacity, Text } = require('react-native');
        if (!isVisible) return null;
        return React.createElement(View, { testID: 'country-modal' }, [
            React.createElement(TouchableOpacity, { key: 'close', onPress: onClose, testID: 'country-modal-close' }),
            React.createElement(TouchableOpacity, { key: 'select', onPress: () => onSelect({ dialCode: '+1' }), testID: 'country-modal-select' }),
        ]);
    },
}));

jest.mock('../../src/components/common/ProfileImageWithNames', () => ({
    ProfileImageWithNames: ({ firstName, setFirstName, lastName, setLastName, onImagePress, imageTestID, firstNameTestID, lastNameTestID, firstNameError, lastNameError }: any) => {
        const React = require('react');
        const { View, TextInput, TouchableOpacity, Text } = require('react-native');
        return React.createElement(View, {}, [
            React.createElement(TouchableOpacity, { key: 'image', onPress: onImagePress, testID: imageTestID }, React.createElement(Text, {}, 'Image')),
            React.createElement(TextInput, { key: 'fn', value: firstName, onChangeText: setFirstName, testID: firstNameTestID }),
            firstNameError ? React.createElement(Text, { key: 'fn-err' }, firstNameError) : null,
            React.createElement(TextInput, { key: 'ln', value: lastName, onChangeText: setLastName, testID: lastNameTestID }),
            lastNameError ? React.createElement(Text, { key: 'ln-err' }, lastNameError) : null,
        ]);
    },
}));

jest.mock('../../src/components/common/ImagePickerModal', () => ({
    ImagePickerModal: ({ isVisible, onClose, onTakePhoto, onSelectFromGallery }: any) => {
        const React = require('react');
        const { View, TouchableOpacity, Text } = require('react-native');
        if (!isVisible) return null;
        return React.createElement(View, { testID: 'image-picker-modal' }, [
            React.createElement(TouchableOpacity, { key: 'close', onPress: onClose, testID: 'image-modal-close' }),
            React.createElement(TouchableOpacity, { key: 'camera', onPress: onTakePhoto, testID: 'image-modal-camera' }),
            React.createElement(TouchableOpacity, { key: 'gallery', onPress: onSelectFromGallery, testID: 'image-modal-gallery' }),
        ]);
    },
}));

jest.mock('../../src/components/common/AppLoader', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return {
        AppLoader: () => React.createElement(View, { testID: 'app-loader' }, React.createElement(Text, {}, 'Loader')),
    };
});

jest.mock('../../src/theme/scale', () => ({
    normalize: (v: number) => v,
    moderateScale: (v: number) => v,
    verticalScale: (v: number) => v,
}));

jest.mock('../../src/assets/images/userIcon.png', () => 1);

const mockUseEditProfile = {
    firstName: 'Stellina',
    setFirstName: jest.fn(),
    lastName: 'Harper',
    setLastName: jest.fn(),
    email: 'stellina.harper@gmail.com',
    setEmail: jest.fn(),
    phoneNumber: '9876543210',
    setPhoneNumber: jest.fn(),
    countryCode: '+91',
    setCountryCode: jest.fn(),
    profileImage: 'test-image-url',
    setProfileImage: jest.fn(),
    isLoading: false,
    isSaving: false,
    handleSave: jest.fn(),
    handleBack: jest.fn(),
    errors: {} as Record<string, string>,
};

jest.mock('../../src/screens/EditProfile/useEditProfile', () => ({
    useEditProfile: () => mockUseEditProfile,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('EditProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseEditProfile.isLoading = false;
        mockUseEditProfile.isSaving = false;
        mockUseEditProfile.errors = {};
    });

    it('renders correctly', () => {
        const { getByTestId } = render(<EditProfileScreen />);

        expect(getByTestId('edit-profile-screen')).toBeTruthy();
        expect(getByTestId('edit-profile-first-name-input')).toBeTruthy();
        expect(getByTestId('edit-profile-last-name-input')).toBeTruthy();
        expect(getByTestId('edit-profile-email-input')).toBeTruthy();
    });

    it('shows loading state on initial load', () => {
        mockUseEditProfile.isLoading = true;
        const { getByTestId, queryByTestId } = render(<EditProfileScreen />);

        expect(getByTestId('edit-profile-loading')).toBeTruthy();
        expect(queryByTestId('edit-profile-first-name-input')).toBeFalsy();
    });

    it('handles modal closing', () => {
        const { getByTestId, queryByTestId } = render(<EditProfileScreen />);

        // Image modal
        fireEvent.press(getByTestId('edit-profile-camera-button'));
        fireEvent.press(getByTestId('image-modal-close'));
        expect(queryByTestId('image-picker-modal')).toBeFalsy();

        // Country modal
        fireEvent.press(getByTestId('edit-profile-country-dropdown'));
        fireEvent.press(getByTestId('country-modal-close'));
        expect(queryByTestId('country-modal')).toBeFalsy();
    });

    it('triggers handleSave when Save Details button is pressed', () => {
        const { getByTestId } = render(<EditProfileScreen />);
        const saveButton = getByTestId('edit-profile-save-button');

        fireEvent.press(saveButton);
        expect(mockUseEditProfile.handleSave).toHaveBeenCalled();
    });

    it('renders email input as read-only', () => {
        const { getByTestId } = render(<EditProfileScreen />);
        const emailInput = getByTestId('edit-profile-email-input');

        expect(emailInput.props.editable).toBe(false);
    });

    it('handles image picking via camera', () => {
        mockTakephoto.mockImplementation((callback) => callback({ uri: 'new-image-uri' }));
        const { getByTestId } = render(<EditProfileScreen />);

        fireEvent.press(getByTestId('edit-profile-camera-button'));
        expect(getByTestId('image-picker-modal')).toBeTruthy();

        fireEvent.press(getByTestId('image-modal-camera'));
        expect(mockUseEditProfile.setProfileImage).toHaveBeenCalledWith('new-image-uri');
    });

    it('handles image picking via gallery', () => {
        mockSelectFromGallery.mockImplementation((callback) => callback({ uri: 'gallery-image-uri' }));
        const { getByTestId } = render(<EditProfileScreen />);

        fireEvent.press(getByTestId('edit-profile-camera-button'));
        fireEvent.press(getByTestId('image-modal-gallery'));
        expect(mockUseEditProfile.setProfileImage).toHaveBeenCalledWith('gallery-image-uri');
    });

    it('handles country selection', () => {
        const { getByTestId } = render(<EditProfileScreen />);

        fireEvent.press(getByTestId('edit-profile-country-dropdown'));
        expect(getByTestId('country-modal')).toBeTruthy();

        fireEvent.press(getByTestId('country-modal-select'));
        expect(mockUseEditProfile.setCountryCode).toHaveBeenCalledWith('+1');
    });

    it('renders error messages', () => {
        mockUseEditProfile.errors = {
            firstName: 'First name is required',
            email: 'Email is invalid',
        };
        const { getByText } = render(<EditProfileScreen />);
        expect(getByText('First name is required')).toBeTruthy();
        expect(getByText('Email is invalid')).toBeTruthy();
    });

    it('shows saving indicator on button', () => {
        mockUseEditProfile.isSaving = true;
        const { getByTestId } = render(<EditProfileScreen />);
        const saveButton = getByTestId('edit-profile-save-button');
        expect(saveButton.props.disabled).toBe(true);
    });
});
