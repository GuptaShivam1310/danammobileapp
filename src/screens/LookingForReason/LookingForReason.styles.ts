import { StyleSheet } from 'react-native';
import { lightColors } from '../../constants/colors';
import { verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';

export const lookingForReasonStyles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    marginTop: verticalScale(30),
  },
  textArea: {
    marginTop: verticalScale(spacing.lg),
  },
  footer: {
    paddingBottom: verticalScale(spacing.md),
  },
  primaryButton: {
    backgroundColor: lightColors.seekerGreen,
  },
});
