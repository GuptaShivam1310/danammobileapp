import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  clearAuthState,
  setUserProfile,
  loginUser,
  signupUser,
  logoutUser,
  updateIsPreferencesSaved,
  updateToken,
  hydrateAuth,
} from '../../src/store/slices/authSlice';
import { login, signup, logout } from '../../src/services/authService';
import { saveTokens, getRefreshToken, getAccessToken } from '../../src/utils/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../src/services/authService', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../src/utils/tokenManager', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up successfully and stores tokens', async () => {
    (signup as jest.Mock).mockResolvedValueOnce({
      token: 'token123',
      refresh_token: 'refresh123',
      user: { id: '1', full_name: 'User' },
    });

    const store = configureStore({ reducer: { auth: authReducer } });
    const result = await store.dispatch(signupUser({ email: 'a@b.com' } as any));

    expect(signupUser.fulfilled.match(result)).toBe(true);
    expect(saveTokens).toHaveBeenCalledWith('token123', 'refresh123');
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('logoutUser calls logout API only if refresh token exists', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValueOnce('refresh-token');
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(logoutUser());
    expect(logout).toHaveBeenCalledWith('refresh-token');
  });

  it('logoutUser does not call logout API if no refresh token', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValueOnce(null);
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(logoutUser());
    expect(logout).not.toHaveBeenCalled();
  });

  it('logins successfully and stores tokens', async () => {
    (login as jest.Mock).mockResolvedValueOnce({
      token: 'login-token',
      refresh_token: 'login-refresh',
      user: { id: '1', full_name: 'Logged User' },
    });

    const store = configureStore({ reducer: { auth: authReducer } });
    const result = await store.dispatch(loginUser({ email: 'user@test.com', password: 'password' }));

    expect(loginUser.fulfilled.match(result)).toBe(true);
    expect(saveTokens).toHaveBeenCalledWith('login-token', 'login-refresh');
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('handles login errors', async () => {
    (login as jest.Mock).mockRejectedValueOnce(new Error('login failed'));
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(loginUser({ email: 'user@test.com', password: 'password' }));
    expect(store.getState().auth.error).toBe('login failed');
  });

  it('returns default login error when message missing', async () => {
    (login as jest.Mock).mockRejectedValueOnce({});
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(loginUser({ email: 'user@test.com', password: 'password' }));
    expect(store.getState().auth.error).toBe('Login failed');
  });

  it('rejects login when token is missing', async () => {
    (login as jest.Mock).mockResolvedValueOnce({
      refresh_token: 'refresh123',
      user: { id: '1', full_name: 'User' },
    });

    const store = configureStore({ reducer: { auth: authReducer } });
    const result = await store.dispatch(loginUser({ email: 'user@test.com', password: 'password' }));

    expect(loginUser.rejected.match(result)).toBe(true);
    expect(store.getState().auth.error).toBe('Invalid login response: token missing');
  });

  it('handles signup errors', async () => {
    (signup as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(signupUser({ email: 'a@b.com' } as any));
    expect(store.getState().auth.error).toBe('fail');
  });

  it('returns default signup error when message missing', async () => {
    (signup as jest.Mock).mockRejectedValueOnce({});
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(signupUser({ email: 'a@b.com' } as any));
    expect(store.getState().auth.error).toBe('Signup failed');
  });

  it('rejects signup when token is missing', async () => {
    (signup as jest.Mock).mockResolvedValueOnce({
      refresh_token: 'refresh123',
      user: { id: '1', full_name: 'User' },
    });

    const store = configureStore({ reducer: { auth: authReducer } });
    const result = await store.dispatch(signupUser({ email: 'a@b.com' } as any));

    expect(signupUser.rejected.match(result)).toBe(true);
    expect(store.getState().auth.error).toBe('Invalid signup response: token missing');
  });

  it('hydrates auth with opaque token (non-JWT)', async () => {
    (getAccessToken as jest.Mock).mockResolvedValueOnce('opaque-token');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ id: 'u1' }));
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(hydrateAuth());

    expect(store.getState().auth.token).toBe('opaque-token');
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('updateIsPreferencesSaved updates user and persists to storage', () => {
    const state = authReducer(
      {
        token: 't',
        user: { id: '1', full_name: 'User', is_preferences_saved: false } as any,
        userProfile: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
      updateIsPreferencesSaved(true),
    );

    expect(state.user?.is_preferences_saved).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('updateIsPreferencesSaved is no-op when user is null', () => {
    const state = authReducer(
      {
        token: null,
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      updateIsPreferencesSaved(true),
    );

    expect(state.user).toBeNull();
  });

  it('updateToken sets token', () => {
    const state = authReducer(
      {
        token: null,
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
      updateToken('new-token'),
    );
    expect(state.token).toBe('new-token');
  });

  it('updates user profile and clears auth state', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(setUserProfile({ id: 'p1' } as any));
    expect(store.getState().auth.userProfile).toEqual({ id: 'p1' });

    store.dispatch(clearAuthState());
    expect(store.getState().auth.userProfile).toBeNull();
  });
});
