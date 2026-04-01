import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SignUpScreen } from '../../../src/screens/SignUp/SignUpScreen';

const mockSetFirstName = jest.fn();
const mockSetLastName = jest.fn();
const mockSetEmail = jest.fn();
const mockSetPhoneNumber = jest.fn();
const mockSetCountryCode = jest.fn();
const mockSetPassword = jest.fn();
const mockSetConfirmPassword = jest.fn();
const mockSetRole = jest.fn();
const mockSetProfileImageUri = jest.fn();
const mockSetProfileImageFile = jest.fn();
const mockHandleSignUp = jest.fn();
const mockNavigateToLogin = jest.fn();

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
    Platform: { OS: 'ios' },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../src/screens/SignUp/useSignUp', () => ({
  useSignUp: () => ({
    firstName: '',
    setFirstName: mockSetFirstName,
    lastName: '',
    setLastName: mockSetLastName,
    email: '',
    setEmail: mockSetEmail,
    phoneNumber: '',
    setPhoneNumber: mockSetPhoneNumber,
    countryCode: '+91',
    setCountryCode: mockSetCountryCode,
    password: '',
    setPassword: mockSetPassword,
    confirmPassword: '',
    setConfirmPassword: mockSetConfirmPassword,
    role: 'seeker',
    setRole: mockSetRole,
    profileImageUri: null,
    setProfileImageUri: mockSetProfileImageUri,
    setProfileImageFile: mockSetProfileImageFile,
    errors: {},
    isLoading: false,
    isValid: false,
    handleSignUp: mockHandleSignUp,
    navigateToLogin: mockNavigateToLogin,
  }),
}));

jest.mock('../../../src/hooks/useImagePicker', () => ({
  useImagePicker: () => ({
    takePhoto: (cb: any) => cb({ uri: 'camera.jpg' }),
    selectFromGallery: (cb: any) => cb({ uri: 'gallery.jpg' }),
  }),
}));

jest.mock('../../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../../src/components/common/AppInput', () => ({
  AppInput: (props: any) => {
    const ReactLib = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return ReactLib.createElement(
      View,
      { testID: props.testID, ...props },
      ReactLib.createElement(Text, { testID: `${props.testID}-secure` }, String(props.secureTextEntry)),
      props.onRightIconPress
        ? ReactLib.createElement(
            TouchableOpacity,
            { testID: `${props.testID}-right-icon`, onPress: props.onRightIconPress },
            ReactLib.createElement(Text, null, 'toggle')
          )
        : null
    );
  },
}));

jest.mock('../../../src/components/common/PrimaryButton', () => ({
  PrimaryButton: ({ onPress, testID }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(TouchableOpacity, { testID, onPress });
  },
}));

jest.mock('../../../src/components/specified/signup/RoleSelector', () => ({
  RoleSelector: ({ onSelect, testIDDonor, testIDSeeker }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(
      ReactLib.Fragment,
      null,
      ReactLib.createElement(TouchableOpacity, {
        testID: testIDDonor,
        onPress: () => onSelect('donor'),
      }),
      ReactLib.createElement(TouchableOpacity, {
        testID: testIDSeeker,
        onPress: () => onSelect('seeker'),
      })
    );
  },
}));

jest.mock('../../../src/components/common/CountryCodeSelector', () => ({
  CountryCodeSelector: ({ onPress, testID }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(TouchableOpacity, { testID, onPress });
  },
}));

jest.mock('../../../src/components/common/ProfileImageWithNames', () => ({
  ProfileImageWithNames: ({ onImagePress, imageTestID }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(TouchableOpacity, { testID: imageTestID, onPress: onImagePress });
  },
}));

jest.mock('../../../src/components/common/ImagePickerModal', () => ({
  ImagePickerModal: ({ isVisible, onTakePhoto, onSelectFromGallery }: any) => {
    if (!isVisible) return null;
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(
      ReactLib.Fragment,
      null,
      ReactLib.createElement(TouchableOpacity, {
        testID: 'take-photo-btn',
        onPress: onTakePhoto,
      }),
      ReactLib.createElement(TouchableOpacity, {
        testID: 'select-gallery-btn',
        onPress: onSelectFromGallery,
      })
    );
  },
}));

jest.mock('../../../src/components/common/CountryCodeModal', () => ({
  CountryCodeModal: ({ isVisible, onSelect }: any) => {
    if (!isVisible) return null;
    const ReactLib = require('react');
    const { TouchableOpacity } = require('react-native');
    return ReactLib.createElement(TouchableOpacity, {
      testID: 'country-select-btn',
      onPress: () => onSelect({ dialCode: '+1' }),
    });
  },
}));

jest.mock('../../../src/constants/countryCodes', () => ({
  COUNTRY_CODES: [{ name: 'US', code: 'US', dialCode: '+1' }],
}));

jest.mock('../../../src/assets/images', () => ({
  __esModule: true,
  default: { danammLogo: 'logo', userIcon: 'user' },
}));

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles password visibility and triggers signup', () => {
    const { getByTestId } = render(<SignUpScreen />);

    const passwordInput = getByTestId('signup-password-input');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('signup-password-input-right-icon'));
    const passwordInputAfter = getByTestId('signup-password-input');
    expect(passwordInputAfter.props.secureTextEntry).toBe(false);

    fireEvent.press(getByTestId('signup-button'));
    expect(mockHandleSignUp).toHaveBeenCalled();
  });

  it('toggles confirm password visibility', () => {
    const { getByTestId } = render(<SignUpScreen />);

    const confirmInput = getByTestId('signup-confirm-password-input');
    expect(confirmInput.props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('signup-confirm-password-input-right-icon'));
    const confirmAfter = getByTestId('signup-confirm-password-input');
    expect(confirmAfter.props.secureTextEntry).toBe(false);
  });

  it('opens image picker and sets profile image', () => {
    const { getByTestId, queryByTestId } = render(<SignUpScreen />);

    expect(queryByTestId('take-photo-btn')).toBeNull();
    fireEvent.press(getByTestId('camera-icon-button'));
    fireEvent.press(getByTestId('take-photo-btn'));
    expect(mockSetProfileImageUri).toHaveBeenCalledWith('camera.jpg');
    expect(mockSetProfileImageFile).toHaveBeenCalled();

    fireEvent.press(getByTestId('select-gallery-btn'));
    expect(mockSetProfileImageUri).toHaveBeenCalledWith('gallery.jpg');
  });

  it('opens country modal and selects country', () => {
    const { getByTestId } = render(<SignUpScreen />);
    fireEvent.press(getByTestId('country-code-selector'));
    fireEvent.press(getByTestId('country-select-btn'));
    expect(mockSetCountryCode).toHaveBeenCalledWith('+1');
  });

  it('selects role and navigates to login', () => {
    const { getByTestId } = render(<SignUpScreen />);
    fireEvent.press(getByTestId('signup-role-donor'));
    expect(mockSetRole).toHaveBeenCalledWith('donor');

    fireEvent.press(getByTestId('signup-login-link'));
    expect(mockNavigateToLogin).toHaveBeenCalled();
  });
});
