import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  hydrateAuth,
  logoutUser,
  setCredentials,
} from '../../src/store/slices/authSlice';
import { login } from '../../src/services/authService';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '../../src/storage/asyncStorage';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';
import { clearTokens } from '../../src/utils/tokenManager';

jest.mock('../../src/services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../src/storage/asyncStorage', () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
  removeStorageItem: jest.fn(),
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;
const mockedGetStorageItem = getStorageItem as jest.MockedFunction<
  typeof getStorageItem
>;
const mockedSetStorageItem = setStorageItem as jest.MockedFunction<
  typeof setStorageItem
>;
const mockedRemoveStorageItem = removeStorageItem as jest.MockedFunction<
  typeof removeStorageItem
>;

function createStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

function createJwtToken(exp: number) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const payload = Buffer.from(JSON.stringify({ exp }))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${header}.${payload}.signature`;
}

describe('Auth Flow', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearTokens();
    mockedGetStorageItem.mockClear();
    mockedSetStorageItem.mockClear();
    mockedRemoveStorageItem.mockClear();
  });

  it('logs in successfully and updates auth state', async () => {
    const store = createStore();
    const payload = { email: 'user@test.com', password: 'Pass@123' };
    const apiData = {
      token: 'token123',
      refresh_token: 'refresh123',
      user: { id: '1', full_name: 'User', email: payload.email },
    };

    mockedLogin.mockResolvedValue(apiData);

    const result = await store.dispatch(loginUser(payload));
    const state = store.getState().auth;

    expect(loginUser.fulfilled.match(result)).toBe(true);
    expect(mockedSetStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, 'token123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token123');
    expect(state.user).toEqual(apiData.user);
    expect(state.error).toBeNull();
  });

  it('handles login failure and sets error', async () => {
    const store = createStore();
    const payload = { email: 'user@test.com', password: 'wrong' };

    mockedLogin.mockRejectedValue(new Error('Invalid credentials'));

    const result = await store.dispatch(loginUser(payload));
    const state = store.getState().auth;

    expect(loginUser.rejected.match(result)).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(mockedSetStorageItem).not.toHaveBeenCalled();
  });

  it('hydrates auth when token is valid and not expired', async () => {
    const store = createStore();
    const validToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600);

    mockedGetStorageItem.mockResolvedValue(validToken);

    await store.dispatch(hydrateAuth());
    const state = store.getState().auth;

    expect(mockedGetStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(mockedRemoveStorageItem).not.toHaveBeenCalled();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(validToken);
  });

  it('removes expired token during hydrate and keeps user logged out', async () => {
    const store = createStore();
    const expiredToken = createJwtToken(Math.floor(Date.now() / 1000) - 3600);

    mockedGetStorageItem.mockResolvedValue(expiredToken);

    await store.dispatch(hydrateAuth());
    const state = store.getState().auth;

    expect(mockedGetStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(mockedRemoveStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });

  it('logs out and clears auth state', async () => {
    const store = createStore();

    store.dispatch(
      setCredentials({
        token: 'token123',
        user: { id: '1', full_name: 'User', email: 'user@test.com', role: 'donor' } as any,
      }),
    );

    await store.dispatch(logoutUser());
    const state = store.getState().auth;

    expect(mockedRemoveStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});
