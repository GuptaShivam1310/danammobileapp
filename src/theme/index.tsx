import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setThemeMode } from '../store/slices/settingsSlice';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

interface ThemeContextValue {
  theme: typeof lightTheme | typeof darkTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const systemTheme = useColorScheme();
  const themeMode = useAppSelector(state => state.settings.themeMode);

  const resolvedMode =
    themeMode === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : themeMode;

  const value = useMemo(() => {
    const isDark = resolvedMode === 'dark';

    return {
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme: () => dispatch(setThemeMode(isDark ? 'light' : 'dark')),
    };
  }, [dispatch, resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
