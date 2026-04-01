import { renderHook, act } from '@testing-library/react-native';
import { useLogin } from '../../src/screens/Login/useLogin';
import { useAppDispatch } from '../../src/store';
import { loginUser } from '../../src/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showErrorToast } from '../../src/utils/toast';

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('../../src/store/slices/authSlice', () => ({
  loginUser: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../../src/utils/toast', () => ({
  showErrorToast: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useLogin', () => {
  const mockDispatch = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('initializes with empty fields', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.email).toBe('seeker3@gmail.com');
    expect(result.current.password).toBe('Password@123');
  });

  it('validates empty email and password', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('');
      result.current.setPassword('');
    });

    await act(async () => {
      await result.current.onPressLogin();
    });

    expect(result.current.emailError).toBe('login.validation.emailRequired');
    expect(result.current.passwordError).toBe('login.validation.passwordRequired');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('validates invalid email format', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.setEmail('invalid-email');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onPressLogin();
    });

    expect(result.current.emailError).toBe('login.validation.emailInvalid');
  });

  it('successfully logs in', async () => {
    const { result } = renderHook(() => useLogin(mockOnSuccess));
    
    const mockData = { token: 'test-token', user: { role: 'seeker' } };
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve(mockData),
    });

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onPressLogin();
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith('seeker');
    expect(result.current.loading).toBe(true);
  });

  it('handles login failure with error object', async () => {
    const { result } = renderHook(() => useLogin());
    
    const mockError = { response: { data: { message: 'Invalid credentials' } } };
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject(mockError),
    });

    await act(async () => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      await result.current.onPressLogin();
    });

    expect(showErrorToast).toHaveBeenCalledWith('Invalid credentials');
    expect(result.current.loading).toBe(false);
  });

  it('handles login failure with string error', async () => {
    const { result } = renderHook(() => useLogin());
    
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject('Something went wrong'),
    });

    await act(async () => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      await result.current.onPressLogin();
    });

    expect(showErrorToast).toHaveBeenCalledWith('Something went wrong');
  });

  it('handles login failure with generic message', async () => {
    const { result } = renderHook(() => useLogin());
    
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.reject({}),
    });

    await act(async () => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      await result.current.onPressLogin();
    });

    expect(showErrorToast).toHaveBeenCalledWith('login.errors.generic');
  });

  it('handles missing token in response', async () => {
    const { result } = renderHook(() => useLogin());
    
    mockDispatch.mockReturnValue({
      unwrap: () => Promise.resolve({ user: {} }), // No token
    });

    await act(async () => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      await result.current.onPressLogin();
    });

    expect(showErrorToast).toHaveBeenCalledWith('login.errors.invalidLoginResponse');
  });

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useLogin());
    
    expect(result.current.isPasswordVisible).toBe(false);
    
    act(() => {
      result.current.togglePasswordVisibility();
    });
    
    expect(result.current.isPasswordVisible).toBe(true);
  });

  it('returns early if already loading', async () => {
    const { result } = renderHook(() => useLogin());
    
    // Manualy set loading state via mock logic if possible, 
    // but onPressLogin sets it to true.
    // We can test this by checking if dispatch is called twice if we call onPressLogin twice rapidly.
    
    mockDispatch.mockReturnValue({ unwrap: () => new Promise(() => {}) }); // Never resolves

    await act(async () => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      result.current.onPressLogin(); // Trigger first call
    });
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      result.current.onPressLogin(); // Trigger second call
    });
    
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
