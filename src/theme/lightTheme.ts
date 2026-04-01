import { lightColors } from '../constants/colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightTheme = {
  mode: 'light' as const,
  colors: lightColors,
  spacing,
  typography,
};
