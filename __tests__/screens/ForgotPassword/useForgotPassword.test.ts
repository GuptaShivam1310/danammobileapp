import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useForgotPassword } from '../../../src/screens/ForgotPassword/useForgotPassword';
import { forgotPassword } from '../../../src/services/authService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys = key.split('.');
      let val = require('../../../src/localization/en.json');
      for (const k of keys) {
        if (val[k]) val = val[k];
        else return key;
      }
      return typeof val === 'string' ? val : key;
    },
  }),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('../../../src/services/authService', () => ({
  forgotPassword: jest.fn(),
}));

const mockForgotPassword = forgotPassword as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows alert when email is invalid', async () => {
    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.setEmail('invalid-email');
    });

    await act(async () => {
      await result.current.onPressReset();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Invalid Email',
      'Please enter a valid email address',
    );
  });

  it('calls forgotPassword and forwards resetToken/resetUrl on success', async () => {
    const onSuccess = jest.fn();
    mockForgotPassword.mockResolvedValue({
      success: true,
      message: 'Password reset link sent',
      resetToken: 'token-123',
      resetUrl: 'https://example.com/reset?token=token-123',
    });

    const { result } = renderHook(() => useForgotPassword(onSuccess));

    act(() => {
      result.current.setEmail('user@test.com');
    });

    await act(async () => {
      await result.current.onPressReset();
    });

    expect(mockForgotPassword).toHaveBeenCalledWith('user@test.com');
    expect(onSuccess).toHaveBeenCalledWith({
      resetToken: 'token-123',
      resetUrl: 'https://example.com/reset?token=token-123',
    });
  });

  it('shows error alert when API returns failure', async () => {
    mockForgotPassword.mockResolvedValue({
      success: false,
      message: 'User not found',
    });

    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.setEmail('user@test.com');
    });

    await act(async () => {
      await result.current.onPressReset();
    });

    expect(mockAlert).toHaveBeenCalledWith('Error', 'User not found');
  });
});
