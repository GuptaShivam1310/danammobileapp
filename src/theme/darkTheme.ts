import { darkColors } from '../constants/colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const darkTheme = {
  mode: 'dark' as const,
  colors: darkColors,
  spacing,
  typography,
};
