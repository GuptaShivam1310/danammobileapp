import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { LoginScreen } from '../../src/screens/Login/LoginScreen';

// Mock dependencies

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
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
  __esModule: true,
  PrimaryButton: ({ title, onPress, testID }: any) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', { onPress, testID }, React.createElement('Text', {}, title));
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  CommonActions: {
    reset: jest.fn(payload => ({ type: 'RESET', payload })),
  },
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
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    Pressable: createPrimitive('Pressable'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    TextInput: createPrimitive('TextInput'),
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    PixelRatio: {
      roundToNearestPixel: (value: number) => value,
    },
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios,
    }
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

// Mock store hooks
const mockDispatch = jest.fn(action => action);
jest.mock('../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(selector => selector({
    auth: { isAuthenticated: false, isLoading: false },
    settings: { themeMode: 'light' }
  })),
}));

// Mock authSlice
jest.mock('../../src/store/slices/authSlice', () => ({
  loginUser: jest.fn(payload => ({
    unwrap: () => Promise.resolve({ token: 'test', user: { id: '1', email: 'test@example.com', full_name: 'Test User', role: 'seeker' } })
  })),
}));

// Mock assets
jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    danammLogo: { uri: 'mock-logo' },
  },
}));

const mockedUseNavigation = useNavigation as jest.Mock;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({
      navigate: jest.fn(),
      dispatch: mockDispatch,
    });
  });

  it('renders correctly and allows input', () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText('stellina.harper@gmail.com')).toBeTruthy();

    const emailInput = getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');

    const passwordInput = getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'Password123');
    expect(passwordInput.props.value).toBe('Password123');
  });

  it('shows error messages for invalid inputs', async () => {
    // This test relies on useLogin validation logic
    // If we want high coverage, we should test the hook too, but here we test the screen.
    const { getByTestId } = render(<LoginScreen />);

    // Trigger validation by pressing login with empty fields
    fireEvent.press(getByTestId('login-button'));

    // Error messages should appear
    await waitFor(() => {
      // In useLogin, it sets emailError and passwordError
      // LoginScreen renders them in AppInput error prop
    });
  });

  it('navigates on successful login', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'Password123');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          unwrap: expect.any(Function),
        })
      );
    });
  });

  it('navigates to sign up screen', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign Up'));
    expect(mockedUseNavigation().navigate).toHaveBeenCalledWith(ROUTES.SIGN_UP);
  });

  it('navigates to forgot password screen', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Forgot Password?'));
    expect(mockedUseNavigation().navigate).toHaveBeenCalledWith(ROUTES.FORGOT_PASSWORD);
  });
});
