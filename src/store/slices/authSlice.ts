import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, signup, logout } from '../../services/authService';
import { AuthState, LoginPayload, SignUpPayload, User } from '../../models/app';
import {
  getStorageItem,
} from '../../storage/asyncStorage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../../utils/tokenManager';

import { IUserProfile } from '../../models/profile';

const initialState: AuthState = {
  token: null,
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function decodeBase64(payload: string) {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const globalAtob = (globalThis as unknown as { atob?: (value: string) => string }).atob;

  if (typeof globalAtob === 'function') {
    return globalAtob(padded);
  }

  const globalBuffer = (globalThis as { Buffer?: { from: (v: string, enc: string) => { toString: (e: string) => string } } }).Buffer;
  if (globalBuffer?.from) {
    return globalBuffer.from(padded, 'base64').toString('utf8');
  }

  throw new Error('No base64 decoder available');
}

function isJwtTokenExpired(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      // Not a JWT or malformed, but if it came from login it might be valid opaque token.
      // Assume valid if we can't parse it as JWT to avoid logout loop.
      return false;
    }

    const payload = JSON.parse(decodeBase64(parts[1])) as { exp?: number };
    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    // Decoding failed (e.g. no base64 decoder), assume valid to prevent logout
    console.warn('Token expiry check failed:', error);
    return false;
  }
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const data = await login(payload);

      if (!data?.token) {
        return rejectWithValue('Invalid login response: token missing');
      }

      await saveTokens(data.token, data.refresh_token || '');
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return rejectWithValue((error as { message?: string }).message ?? 'Login failed');
    }
  },
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (payload: SignUpPayload, { rejectWithValue }) => {
    try {
      const data = await signup(payload);

      if (!data?.token) {
        return rejectWithValue('Invalid signup response: token missing');
      }

      await saveTokens(data.token, data.refresh_token || '');
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
      }
      // Clear flow data for new user to ensure landing page is shown
      await AsyncStorage.removeItem(STORAGE_KEYS.LOOKING_FOR_FLOW_DATA);

      return data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Signup failed';
      return rejectWithValue(message);
    }
  },
);

export const hydrateAuth = createAsyncThunk('auth/hydrateAuth', async () => {
  let token = await getAccessToken();

  const userData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
  const user = userData ? JSON.parse(userData) : null;

  if (!token) {
    return { token: null, user: null };
  }

  if (isJwtTokenExpired(token)) {
    await clearTokens();
    return { token: null, user: null };
  }

  return { token, user };
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await logout(refreshToken);
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    await clearTokens();
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    setUserProfile: (state, action: PayloadAction<IUserProfile>) => {
      state.userProfile = action.payload;
    },
    updateIsPreferencesSaved: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.is_preferences_saved = action.payload;
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(state.user));
      }
    },
    clearAuthState: state => {
      state.token = null;
      state.user = null;
      state.userProfile = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? 'Login failed');
      })
      .addCase(signupUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? 'Signup failed');
      })
      .addCase(hydrateAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = Boolean(action.payload.token);
      })
      .addCase(hydrateAuth.rejected, state => {
        state.isLoading = false;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.token = null;
        state.user = null;
        state.userProfile = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const {
  setCredentials,
  clearAuthState,
  setUserProfile,
  updateToken,
  updateIsPreferencesSaved,
} = authSlice.actions;
export default authSlice.reducer;
