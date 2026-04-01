import { renderHook, act } from '@testing-library/react-native';
import { useSignUp } from '../../../src/screens/SignUp/useSignUp';
import { ROUTES } from '../../../src/constants/routes';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../src/store/slices/authSlice', () => ({
  signupUser: (payload: any) => ({ type: 'signupUser', payload }),
}));

jest.mock('../../../src/utils/toast', () => ({
  showSuccessToast: (...args: any[]) => mockShowSuccessToast(...args),
  showErrorToast: (...args: any[]) => mockShowErrorToast(...args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields and invalid formats', () => {
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.handleSignUp();
    });

    expect(result.current.errors.firstName).toBe('signup.validation.firstNameRequired');
    expect(result.current.errors.lastName).toBe('signup.validation.lastNameRequired');
    expect(result.current.errors.email).toBe('signup.validation.emailRequired');
    expect(result.current.errors.phoneNumber).toBe('signup.validation.phoneRequired');
    expect(result.current.errors.password).toBe('signup.validation.passwordRequired');
    expect(result.current.errors.confirmPassword).toBe('signup.validation.confirmPasswordRequired');
  });

  it('validates min length and format rules', () => {
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.setFirstName('A');
      result.current.setLastName('B');
      result.current.setEmail('bad-email');
      result.current.setPhoneNumber('123');
      result.current.setPassword('abc');
      result.current.setConfirmPassword('different');
    });

    act(() => {
      result.current.handleSignUp();
    });

    expect(result.current.errors.firstName).toBe('signup.validation.minLength2');
    expect(result.current.errors.lastName).toBe('signup.validation.minLength2');
    expect(result.current.errors.email).toBe('signup.validation.emailInvalid');
    expect(result.current.errors.phoneNumber).toBe('signup.validation.phoneInvalid');
    expect(result.current.errors.password).toBe('signup.validation.passwordRequirements');
    expect(result.current.errors.confirmPassword).toBe('signup.validation.passwordsDoNotMatch');
  });

  it('computes isValid for correct inputs', () => {
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.setFirstName('Jo');
      result.current.setLastName('Doe');
      result.current.setEmail('jo@example.com');
      result.current.setPhoneNumber('1234567890');
      result.current.setPassword('Abcd1234');
      result.current.setConfirmPassword('Abcd1234');
    });

    expect(result.current.isValid).toBe(true);
  });

  it('dispatches signup and shows success toast', async () => {
    mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.resolve({}) });
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.setFirstName('Jo');
      result.current.setLastName('Doe');
      result.current.setEmail('jo@example.com');
      result.current.setPhoneNumber('1234567890');
      result.current.setPassword('Abcd1234');
      result.current.setConfirmPassword('Abcd1234');
    });

    await act(async () => {
      await result.current.handleSignUp();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'signupUser',
        payload: expect.objectContaining({
          firstName: 'Jo',
          lastName: 'Doe',
          email: 'jo@example.com',
          phoneNumber: '1234567890',
          role: 'seeker',
        }),
      })
    );
    expect(mockShowSuccessToast).toHaveBeenCalledWith('signup.alerts.accountCreated');
  });

  it('handles signup error and shows error toast', async () => {
    mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject('boom') });
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.setFirstName('Jo');
      result.current.setLastName('Doe');
      result.current.setEmail('jo@example.com');
      result.current.setPhoneNumber('1234567890');
      result.current.setPassword('Abcd1234');
      result.current.setConfirmPassword('Abcd1234');
    });

    await act(async () => {
      await result.current.handleSignUp();
    });

    expect(mockShowErrorToast).toHaveBeenCalledWith('boom');
    expect(result.current.isLoading).toBe(false);
  });

  it('navigates to login', () => {
    const { result } = renderHook(() => useSignUp());
    act(() => {
      result.current.navigateToLogin();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });
});
