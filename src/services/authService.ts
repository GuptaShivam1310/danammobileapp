import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../models/api';
import { LoginPayload, SignUpPayload, User } from '../models/app';
import get from 'lodash/get';

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh-token',
} as const;

export interface TokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export async function refreshTokenCall(refreshToken: string) {
  const response = await axiosClient.post<TokenResponse>(
    AUTH_ENDPOINTS.REFRESH_TOKEN,
    { refresh_token: refreshToken },
  );
  return response.data;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload) {
  const response = await axiosClient.post<ApiResponse<any>>(
    AUTH_ENDPOINTS.LOGIN,
    payload,
  );
  const rawData = response.data.data;
  const token = get(rawData, 'access_token') || get(rawData, 'token') || get(rawData, 'auth_token');
  let user = get(rawData, 'user', null) as User | null;

  if (!token) {
    throw new Error('Invalid login response: token missing');
  }

  if (user) {
    // Handle is_preferences_saved from top-level response data
    const isPreferencesSaved = get(rawData, 'is_preferences_saved');
    user = {
      ...user,
      is_preferences_saved: typeof isPreferencesSaved === 'boolean' ? isPreferencesSaved : !!user.is_preferences_saved,
    };
  }

  return {
    token: String(token),
    user: user ?? ({} as User),
    refresh_token: get(rawData, 'refresh_token') as string | undefined,
  };
}

export async function forgotPassword(email: string) {
  const response = await axiosClient.post<
    ApiResponse<{ reset_token?: string; reset_url?: string }>
  >(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });

  return {
    success: response.data.success,
    message: response.data.message,
    resetToken: get(response.data, 'data.reset_token', ''),
    resetUrl: get(response.data, 'data.reset_url', ''),
  };
}

export async function resetPassword(newPassword: string, token: string) {
  const response = await axiosClient.post<ApiResponse<null>>(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    {
      token,
      new_password: newPassword,
      confirm_password: newPassword,
    },
  );

  return {
    success: response.data.success,
    message: response.data.message,
  };
}

export async function signup(payload: SignUpPayload) {
  const formData = new FormData();
  formData.append('full_name', `${payload.firstName} ${payload.lastName}`.trim());
  formData.append('email', payload.email.toLowerCase().trim());
  formData.append('password', payload.password);
  formData.append('phone_number', payload.phoneNumber);
  formData.append('country_code', payload.countryCode);
  formData.append('role', payload.role);
  if (payload.profileImageUri) {
    const filename = payload.profileImageUri.split('/').pop() || 'profile_image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('profile_image', {
      uri: payload.profileImageUri,
      name: filename,
      type: type,
    } as any);
  }

  const response = await axiosClient.post<ApiResponse<any>>(
    AUTH_ENDPOINTS.REGISTER,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  const rawData = response.data.data;
  const token = get(rawData, 'access_token') || get(rawData, 'token') || get(rawData, 'auth_token');
  let user = get(rawData, 'user', null) as User | null;

  if (!token) {
    throw new Error('Invalid signup response: token missing');
  }

  if (user) {
    // Handle is_preferences_saved from top-level response data
    const isPreferencesSaved = get(rawData, 'is_preferences_saved');
    user = {
      ...user,
      is_preferences_saved: typeof isPreferencesSaved === 'boolean' ? isPreferencesSaved : !!user.is_preferences_saved,
    };
  }

  return {
    token: String(token),
    user: user ?? ({} as User),
    refresh_token: get(rawData, 'refresh_token') as string | undefined,
  };
}

export async function logout(refreshToken?: string | null) {
  const response = await axiosClient.post<ApiResponse<null>>(
    AUTH_ENDPOINTS.LOGOUT,
    { refresh_token: refreshToken }
  );
  return {
    success: response.data.success,
    message: response.data.message,
  };
}
