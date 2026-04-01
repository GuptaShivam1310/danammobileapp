import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useContactUs } from '../../../src/screens/ContactUs/useContactUs';
import { supportApi } from '../../../src/services/api/supportApi';
import Toast from 'react-native-toast-message';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('../../../src/services/api/supportApi', () => ({
  supportApi: {
    sendMessage: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'contactUs.validation.fullNameRequired': 'Full Name is required',
        'contactUs.validation.emailRequired': 'Email is required',
        'contactUs.validation.emailInvalid': 'Invalid email address',
        'contactUs.validation.phoneRequired': 'Phone Number is required',
        'contactUs.validation.messageRequired': 'Message is required',
        'alerts.success': 'Success',
        'alerts.error': 'Error',
        'contactUs.successMessage': 'Your message has been sent successfully',
        'alerts.failedToSendMessage': 'Failed to send message',
        'errors.generic': 'Something went wrong',
      };
      return map[key] || key;
    },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

describe('useContactUs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields and email format', async () => {
    const { result } = renderHook(() => useContactUs());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.fullName).toBe('Full Name is required');
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.phone).toBe('Phone Number is required');
    expect(result.current.errors.message).toBe('Message is required');

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('invalid-email');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.email).toBe('Invalid email address');
  });

  it('submits successfully and navigates back', async () => {
    (supportApi.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Thanks',
    });

    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(supportApi.sendMessage).toHaveBeenCalledWith({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone_number: '1234567890',
      message: 'Hello',
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      text2: 'Thanks',
    }));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('uses default success message when API does not return message', async () => {
    (supportApi.sendMessage as jest.Mock).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      text2: 'Your message has been sent successfully',
    }));
  });

  it('shows error toast when API returns success=false', async () => {
    (supportApi.sendMessage as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Nope',
    });

    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Nope',
    }));
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('shows default error message when API returns success=false without message', async () => {
    (supportApi.sendMessage as jest.Mock).mockResolvedValue({
      success: false,
    });

    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Failed to send message',
    }));
  });

  it('handles API errors with different message sources', async () => {
    (supportApi.sendMessage as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Bad request' } },
    });

    const { result } = renderHook(() => useContactUs());
    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Bad request',
    }));

    (supportApi.sendMessage as jest.Mock).mockRejectedValueOnce({
      message: 'Network error',
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Network error',
    }));

    (supportApi.sendMessage as jest.Mock).mockRejectedValueOnce({});

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Something went wrong',
    }));
  });

  it('does not submit while loading is true', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (supportApi.sendMessage as jest.Mock).mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.setFullName('John Doe');
      result.current.setEmail('john@example.com');
      result.current.setPhone('1234567890');
      result.current.setMessage('Hello');
    });

    act(() => {
      result.current.handleSubmit();
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(supportApi.sendMessage).toHaveBeenCalledTimes(1);

    resolvePromise!({ success: true, message: 'Thanks' });
    await act(async () => {
      await pendingPromise;
    });
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalled();
    });
  });

  it('handleBack navigates back', () => {
    const { result } = renderHook(() => useContactUs());

    act(() => {
      result.current.handleBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});
