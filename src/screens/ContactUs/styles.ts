import { StyleSheet } from 'react-native';
import { verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';

export const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: verticalScale(spacing.md),
    },
    headerContainer: {},
    content: {
      paddingTop: verticalScale(spacing.xs),

      flex: 1,
    },
    form: {
      marginTop: verticalScale(16),
    },
    messageInputContainer: {
      height: verticalScale(120),
      alignItems: 'flex-start',
      paddingTop: verticalScale(8),
    },
    messageInput: {
      height: '100%',
      textAlignVertical: 'top',
    },
    submitButton: {
      marginTop: verticalScale(24),
      marginBottom: verticalScale(20),
    },
  });
