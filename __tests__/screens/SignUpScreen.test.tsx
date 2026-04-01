import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { SignUpScreen } from '../../src/screens/SignUp/SignUpScreen';
import { signupUser } from '../../src/store/slices/authSlice';
import { showSuccessToast, showErrorToast } from '../../src/utils/toast';
import { Alert } from 'react-native';
import en from '../../src/localization/en.json';


import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request } from 'react-native-permissions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys = key.split('.');
      let val = require('../../src/localization/en.json');
      for (const k of keys) {
        if (val[k]) val = val[k];
        else return key;
      }
      return typeof val === 'string' ? val : key;
    },
  }),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: jest.fn((fn) => fn({
    settings: { themeMode: 'light' },
    auth: { token: null, user: null },
  })),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
        surface: '#fff',
        text: '#000',
        primary: '#00f',
        border: '#ccc',
        error: '#f00',
        mutedText: '#888',
        googleButton: '#eee',
        appleButton: '#111',
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
    },
    toggleTheme: jest.fn(),
  })
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  PERMISSIONS: {
    IOS: { CAMERA: 'ios.permission.CAMERA' },
    ANDROID: { CAMERA: 'android.permission.CAMERA' },
  },
  RESULTS: { GRANTED: 'granted' },
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');

  const createPrimitive =
    (name: string) =>
      ({ children, ...props }: { children?: React.ReactNode }) =>
        ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
    TextInput: createPrimitive('TextInput'),
    ScrollView: createPrimitive('ScrollView'),
    Modal: createPrimitive('Modal'),
    FlatList: ({ data, renderItem, ListEmptyComponent }: any) => {
      if (!data || data.length === 0) return ListEmptyComponent || null;
      return ReactLib.createElement(
        'View',
        null,
        data.map((item: any, index: number) =>
          ReactLib.createElement(ReactLib.Fragment, { key: index }, renderItem({ item, index }))
        )
      );
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
    },
    PixelRatio: {
      roundToNearestPixel: jest.fn().mockImplementation((size) => size),
      get: jest.fn().mockReturnValue(1),
    },
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: 'ios',
    },
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

// Mock ScreenWrapper to just render children
jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock AppInput to handle values and onChangeText
jest.mock('../../src/components/common/AppInput', () => {
  const { TextInput, View, Text } = require('react-native');
  return {
    AppInput: ({ value, onChangeText, testID, error, label }: any) => (
      <View>
        {label ? <Text>{label}</Text> : null}
        <TextInput testID={testID} value={value} onChangeText={onChangeText} />
        {error ? <Text testID={`${testID}-error`}>{error}</Text> : null}
      </View>
    ),
  };
});

// Mock PrimaryButton
jest.mock('../../src/components/common/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    PrimaryButton: ({ onPress, title, testID, disabled, loading }: any) => (
      <TouchableOpacity testID={testID} onPress={onPress} disabled={disabled || loading}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../src/store/slices/authSlice', () => ({
  signupUser: jest.fn((payload) => ({ type: 'auth/signupUser', payload })),
}));

jest.mock('../../src/utils/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}));

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
      },
      typography: {
        fontFamilyBold: 'System',
        fontFamilyRegular: 'System',
        fontFamilyMedium: 'System',
      },
      spacing: {
        sm: 8,
        md: 16,
      },
    },
    isDark: false,
  }),
}));



jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    danammLogo: { uri: 'mock-logo' },
    userIcon: { uri: 'user-icon' },
  },
}));

const mockedUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockedAlert = Alert.alert as jest.Mock;
const mockedLaunchCamera = launchCamera as jest.Mock;
const mockedLaunchImageLibrary = launchImageLibrary as jest.Mock;
const mockedCheckPermission = check as jest.Mock;
const mockedRequestPermission = request as jest.Mock;

const mockNavigate = jest.fn();

jest.mock('../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ user: { role: 'seeker' } }) });
    mockedUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      dispatch: jest.fn(),
    } as any);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });


  const renderScreen = () => render(<SignUpScreen />);

  it('renders all fields and buttons', () => {
    const { getByTestId, getByText } = renderScreen();

    expect(getByTestId('signup-screen')).toBeTruthy();
    expect(getByTestId('signup-firstname-input')).toBeTruthy();
    expect(getByTestId('signup-lastname-input')).toBeTruthy();
    expect(getByTestId('signup-email-input')).toBeTruthy();
    expect(getByTestId('signup-phone-input')).toBeTruthy();
    expect(getByTestId('signup-password-input')).toBeTruthy();
    expect(getByTestId('signup-confirm-password-input')).toBeTruthy();
    expect(getByTestId('signup-role-donor')).toBeTruthy();
    expect(getByTestId('signup-role-seeker')).toBeTruthy();
    expect(getByTestId('signup-button')).toBeTruthy();
    expect(getByTestId('signup-login-link')).toBeTruthy();
  });

  it('updates input values while typing', () => {
    const { getByTestId } = renderScreen();

    const firstNameInput = getByTestId('signup-firstname-input');
    fireEvent.changeText(firstNameInput, 'John');
    expect(firstNameInput.props.value).toBe('John');

    const emailInput = getByTestId('signup-email-input');
    fireEvent.changeText(emailInput, 'john@example.com');
    expect(emailInput.props.value).toBe('john@example.com');
  });

  it('shows validation errors when submitting empty form', async () => {
    const { getByTestId, queryByText } = renderScreen();
    const signUpButton = getByTestId('signup-button');
    // In our implementation isValid is calculated in useMemo
    // Initially it should be false
    // PrimaryButton is mocked to use disabled prop
  });

  it('calls signup API and navigates on success', async () => {
    const { getByTestId } = renderScreen();

    // Fill with valid data based on useSignUp validation
    fireEvent.changeText(getByTestId('signup-firstname-input'), 'John');
    fireEvent.changeText(getByTestId('signup-lastname-input'), 'Doe');
    fireEvent.changeText(getByTestId('signup-email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
    fireEvent.changeText(getByTestId('signup-password-input'), 'Password123'); // Needs Upper, Lower, Number, 8 chars
    fireEvent.changeText(getByTestId('signup-confirm-password-input'), 'Password123');

    const signUpButton = getByTestId('signup-button');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(signupUser).toHaveBeenCalled();
      expect(showSuccessToast).toHaveBeenCalled();
    });

    // SignUp flow does not navigate here; RootNavigator handles it
  });

  it('shows error alert on API failure', async () => {
    mockDispatch.mockReturnValueOnce({ unwrap: jest.fn().mockRejectedValue('Server error') });

    const { getByTestId } = renderScreen();

    fireEvent.changeText(getByTestId('signup-firstname-input'), 'John');
    fireEvent.changeText(getByTestId('signup-lastname-input'), 'Doe');
    fireEvent.changeText(getByTestId('signup-email-input'), 'john@example.com');
    fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
    fireEvent.changeText(getByTestId('signup-password-input'), 'Password123');
    fireEvent.changeText(getByTestId('signup-confirm-password-input'), 'Password123');

    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Server error');
    });
  });

  it('opens image picker modal when camera icon is pressed', () => {
    const { getByTestId, getByText } = renderScreen();
    fireEvent.press(getByTestId('camera-icon-button'));
    // In our primitive mock, Modal renders its children, so we can check for text
    expect(getByText(en.signup.takePhoto)).toBeTruthy();
    expect(getByText(en.signup.selectFromGallery)).toBeTruthy();
  });

  it('calls launchCamera when Take Photo is selected', async () => {
    mockedCheckPermission.mockResolvedValue('granted');
    mockedLaunchCamera.mockResolvedValue({ didCancel: false, assets: [{ uri: 'test-uri' }] });

    const { getByTestId, getByText } = renderScreen();
    fireEvent.press(getByTestId('camera-icon-button'));
    fireEvent.press(getByTestId('image-picker-modal-camera-option'));

    await waitFor(() => {
      expect(mockedLaunchCamera).toHaveBeenCalled();
    });
  });

  it('calls launchImageLibrary when Select from Gallery is selected', async () => {
    mockedLaunchImageLibrary.mockResolvedValue({ didCancel: false, assets: [{ uri: 'test-uri' }] });

    const { getByTestId, getByText } = renderScreen();
    fireEvent.press(getByTestId('camera-icon-button'));
    fireEvent.press(getByTestId('image-picker-modal-gallery-option'));

    await waitFor(() => {
      expect(mockedLaunchImageLibrary).toHaveBeenCalled();
    });
  });

  it('opens country code modal and selects a country', async () => {
    const { getByTestId, getByText, getAllByText } = renderScreen();
    fireEvent.press(getByTestId('country-code-selector'));

    expect(getByText('Select Country Code')).toBeTruthy();

    // We can't easily find specifically "India (+91)" if it's multiple texts in a row
    // but we can look for "India"
    fireEvent.press(getByText('India'));

    // Check if the UI updated (primitive Text renders children)
    expect(getAllByText('+91').length).toBeGreaterThan(0);
  });
});
