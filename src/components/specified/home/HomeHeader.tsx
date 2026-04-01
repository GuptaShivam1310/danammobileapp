import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { HomeHeaderProps } from './types';
import { normalize, scale } from '../../../theme/scale';
import { useTheme } from '../../../theme';
import { SvgIcon } from '../../common/SvgIcon';
import { palette } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';

/**
 * HomeHeader Component
 * Displays title and notification icon with optional notification dot
 * @param showNotificationDot - Show the notification indicator dot
 * @param onNotificationPress - Callback when notification icon is pressed
 * @param title - Optional custom title
 * @param notificationIcon - Optional custom notification icon
 */
export const HomeHeader: React.FC<HomeHeaderProps> = ({
  showNotificationDot = false,
  onNotificationPress,
  title,
  notificationIcon,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors?.background }]} testID="home-header">
      <Text
        style={[
          styles.title,
          {
            color: theme.colors?.text || theme.colors?.black,
          },
        ]}
      >
        {title ?? t('home.title')}
      </Text>

      <TouchableOpacity
        style={[
          styles.notificationButton,
          {
            borderColor: theme.colors?.border || palette.gray200,
            backgroundColor: theme.colors?.surface || palette.white,
          },
        ]}
        onPress={onNotificationPress}
        testID="notification-icon"
        activeOpacity={0.7}
      >
        {notificationIcon && <SvgIcon icon={notificationIcon} size={scale(20)} />}

        {showNotificationDot && <View style={styles.notificationDot} testID="notification-dot" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '700',
    flex: 1,
  },
  notificationButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: normalize(12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: palette.red600,
    position: 'absolute',
    top: scale(8),
    right: scale(8),
  },
});
