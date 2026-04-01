import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as forgotPasswordHook from '../../src/screens/ForgotPassword/useForgotPassword';
import { forgotPassword } from '../../src/services/authService';
import { ROUTES } from '../../src/constants/routes';
import { ForgotPasswordScreen } from '../../src/screens/ForgotPassword/ForgotPasswordScreen';

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
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
  __esModule: true,
  PrimaryButton: ({ title, onPress, testID }: any) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', { onPress, testID }, React.createElement('Text', {}, title));
  },
}));

jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    danammLogo: { uri: 'mock-logo' },
  },
}));

jest.mock('../../src/services/authService', () => ({
  forgotPassword: jest.fn(),
}));

const mockForgotPassword = forgotPassword as jest.Mock;
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

function createScreen() {
  return render(
    <ForgotPasswordScreen
      navigation={{
        navigate: mockNavigate,
        goBack: mockGoBack,
      }}
    />,
  );
}

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockForgotPassword.mockResolvedValue({
      success: true,
      message: 'Success',
      resetToken: 'token-123',
      resetUrl: 'https://example.com/reset?token=token-123',
    });
  });

  it('renders screen successfully', () => {
    const { getByText, getByTestId } = createScreen();

    expect(getByText('Forgot Password')).toBeTruthy();
    expect(getByTestId('forgot-password-email-input')).toBeTruthy();
    expect(getByTestId('forgot-password-submit-button')).toBeTruthy();
  });

  it('email input renders and accepts typing', () => {
    const { getByDisplayValue, getByTestId } = createScreen();

    fireEvent.changeText(getByTestId('forgot-password-email-input'), 'user@test.com');

    expect(getByDisplayValue('user@test.com')).toBeTruthy();
  });

  it('invalid email shows validation alert', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => { });
    const { getByTestId } = createScreen();

    fireEvent.changeText(getByTestId('forgot-password-email-input'), 'invalid-email');
    fireEvent.press(getByTestId('forgot-password-submit-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Invalid Email',
      'Please enter a valid email address',
    );
  });

  it('submit button triggers handler and navigates on valid email', async () => {
    const { getByTestId } = createScreen();

    fireEvent.changeText(getByTestId('forgot-password-email-input'), 'user@test.com');
    fireEvent.press(getByTestId('forgot-password-submit-button'));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('user@test.com');
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD, {
        resetToken: 'token-123',
        resetUrl: 'https://example.com/reset?token=token-123',
      });
    });
  });

  it('calls mocked API function when submit handler is triggered', () => {
    const mockOnPressReset = jest.fn(async () => { });

    jest.spyOn(forgotPasswordHook, 'useForgotPassword').mockReturnValue({
      email: 'user@test.com',
      loading: false,
      emailError: '',
      setEmail: jest.fn(),
      onPressReset: mockOnPressReset,
    });

    const { getByTestId } = createScreen();

    fireEvent.press(getByTestId('forgot-password-submit-button'));

    expect(mockOnPressReset).toHaveBeenCalledTimes(1);
  });

  it('renders error state when API failure is mocked', () => {
    jest.spyOn(forgotPasswordHook, 'useForgotPassword').mockReturnValue({
      email: 'user@test.com',
      loading: false,
      emailError: 'Something went wrong',
      setEmail: jest.fn(),
      onPressReset: jest.fn(async () => { }),
    });

    const { getByTestId, getByText } = createScreen();

    expect(getByTestId('forgot-password-error-text')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
