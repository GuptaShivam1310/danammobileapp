import { IUserProfile } from './profile';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  phone_number?: string;
  country_code?: string;
  profile_image_url?: string;
  is_preferences_saved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  role: 'donor' | 'seeker';
  profileImageUri: string | null;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  userProfile: IUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState {
  themeMode: ThemeMode;
  locale: string;
  hasSeenOnboarding: boolean;
}
