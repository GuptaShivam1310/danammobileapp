import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../../../src/screens/Profile/useProfile';
import { ROUTES } from '../../../src/constants/routes';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) =>
    selector({
      profile: { user: { id: 'u1' }, isLoading: false, error: null },
      auth: { user: { role: 'Seeker' } },
    }),
}));

jest.mock('../../../src/store/slices/profileSlice', () => ({
  fetchProfile: () => ({ type: 'fetchProfile' }),
}));

jest.mock('../../../src/store/slices/authSlice', () => ({
  logoutUser: () => ({ type: 'logoutUser' }),
}));

jest.mock('../../../src/constants/storageKeys', () => ({
  STORAGE_KEYS: { AUTH_USER: 'AUTH_USER' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('dispatches fetchProfile on mount and refresh', () => {
    renderHook(() => useProfile());
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'fetchProfile' });

    const { result } = renderHook(() => useProfile());
    act(() => {
      result.current.fetchProfile();
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'fetchProfile' });
  });

  it('hydrates persisted user role and detects seeker type', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ role: 'SeekerUser' })
    );

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isSeekerUserType).toBe(true);
  });

  it('navigates to profile-related routes', () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleEditProfile();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EDIT_PROFILE);

    act(() => {
      result.current.handleSettings();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS);

    act(() => {
      result.current.handleChangePassword();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHANGE_PASSWORD);

    act(() => {
      result.current.handleHelpSupport();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HELP_SUPPORT);

    act(() => {
      result.current.handleMyReceivedGoods();
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MY_RECEIVED_GOODS);
  });

  it('handles logout modal and confirm logout', async () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleLogout();
    });
    expect(result.current.isLogoutModalVisible).toBe(true);

    act(() => {
      result.current.closeLogoutModal();
    });
    expect(result.current.isLogoutModalVisible).toBe(false);

    await act(async () => {
      await result.current.handleConfirmLogout();
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'logoutUser' });
  });
});
