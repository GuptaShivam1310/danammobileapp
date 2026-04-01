import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState, ThemeMode } from '../../models/app';

const initialState: SettingsState = {
  themeMode: 'system',
  locale: 'en',
  hasSeenOnboarding: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
    setOnboardingSeen: (state, action: PayloadAction<boolean>) => {
      state.hasSeenOnboarding = action.payload;
    },
  },
});

export const { setThemeMode, setLocale, setOnboardingSeen } = settingsSlice.actions;
export default settingsSlice.reducer;
