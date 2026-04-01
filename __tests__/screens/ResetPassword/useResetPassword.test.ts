import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useResetPassword } from '../../../src/screens/ResetPassword/useResetPassword';
import { resetPassword } from '../../../src/services/authService';

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

const mockUseRoute = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockUseRoute(),
}));

jest.mock('../../../src/services/authService', () => ({
  resetPassword: jest.fn(),
}));

const mockResetPassword = resetPassword as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResetPassword.mockResolvedValue({ success: true, message: 'Success' });
  });

  it('uses resetToken param when available', async () => {
    mockUseRoute.mockReturnValue({ params: { resetToken: 'token-abc' } });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useResetPassword(onSuccess));

    act(() => {
      result.current.setNewPassword('Password@123');
      result.current.setConfirmPassword('Password@123');
    });

    await act(async () => {
      await result.current.onPressResetPassword();
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      'Password@123',
      'token-abc',
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('parses token from resetUrl when resetToken is missing', async () => {
    mockUseRoute.mockReturnValue({
      params: {
        resetUrl:
          'https://danam-backend.onrender.com/reset-password?token=token-xyz%22',
      },
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useResetPassword(onSuccess));

    act(() => {
      result.current.setNewPassword('Password@123');
      result.current.setConfirmPassword('Password@123');
    });

    await act(async () => {
      await result.current.onPressResetPassword();
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      'Password@123',
      'token-xyz',
    );
  });

  it('sets validation error when passwords do not match', async () => {
    mockUseRoute.mockReturnValue({ params: { resetToken: 'token-abc' } });
    const { result } = renderHook(() => useResetPassword(jest.fn()));

    act(() => {
      result.current.setNewPassword('Password@123');
      result.current.setConfirmPassword('Password@321');
    });

    await act(async () => {
      await result.current.onPressResetPassword();
    });

    expect(result.current.confirmPasswordError).toBe('Passwords do not match');
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('shows alert when API call fails', async () => {
    mockUseRoute.mockReturnValue({ params: { resetToken: 'token-abc' } });
    mockResetPassword.mockRejectedValue({ message: 'Invalid token' });

    const { result } = renderHook(() => useResetPassword(jest.fn()));

    act(() => {
      result.current.setNewPassword('Password@123');
      result.current.setConfirmPassword('Password@123');
    });

    await act(async () => {
      await result.current.onPressResetPassword();
    });

    expect(mockAlert).toHaveBeenCalledWith('Reset Failed', 'Invalid token');
  });
});
