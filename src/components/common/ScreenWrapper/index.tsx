import React, { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightColors } from '../../../constants/colors';
import { spacing } from '../../../theme/spacing';
import { moderateScale, verticalScale } from '../../../theme/scale';
import { useTheme } from '../../../theme';

interface ScreenWrapperProps extends PropsWithChildren {
  scrollable?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  withBottomTab?: boolean;
  noPadding?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = false,
  contentStyle,
  testID,
  withBottomTab = false,
  noPadding = false,
}: ScreenWrapperProps) {
  const { theme } = useTheme();

  const content = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        noPadding && styles.noPadding,
        withBottomTab && styles.bottomTabPadding,
        contentStyle
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[
      styles.content,
      noPadding && styles.noPadding,
      withBottomTab && styles.bottomTabPadding,
      contentStyle
    ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(spacing.lg),
  },
  bottomTabPadding: {
    paddingBottom: verticalScale(100),
  },
  noPadding: {
    padding: 0,
  },
});
