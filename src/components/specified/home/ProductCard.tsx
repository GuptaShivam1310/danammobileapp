import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { ProductCardProps } from './types';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { useTheme } from '../../../theme';
import { SvgIcon } from '../../common/SvgIcon';
import { ContributedIcon } from '../../../assets/icons';
import { useTranslation } from 'react-i18next';
import { AppImage } from '../../common/AppImage';
import { formatDisplayDate } from '../../../utils/dateUtils';
import { palette } from '../../../constants/colors';
import { spacing } from '../../../theme/spacing';

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  item,
  onPress,
  testID,
  isContributed,
  containerStyle,
  imageWrapperStyle,
  imageStyle,
  contentStyle,
  titleStyle,
  dateStyle,
  badgeContainerStyle,
  imageResizeMode = 'cover',
  renderImageOverlay,
  onImageError,
  useDefaultContainerStyle = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const formattedDate = useMemo(
    () => formatDisplayDate(item.date || item.created_at),
    [item.date, item.created_at],
  );
  return (
    <TouchableOpacity
      style={[
        useDefaultContainerStyle ? styles.container : null,
        containerStyle,
      ]}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.7}
    >
      <View style={imageWrapperStyle}>
        <AppImage
          imageUri={item.image || item.image_url}
          style={[styles.image, imageStyle]}
          resizeMode={imageResizeMode}
          onError={onImageError}
          testID={testID ? `${testID}-image` : undefined}
          blurRadius={isContributed ? 5 : 0}
        />
        {isContributed && (
          <View style={[styles.badgeContainer, badgeContainerStyle]}>
            <SvgIcon icon={ContributedIcon} size={scale(80)} />
          </View>
        )}
        {renderImageOverlay}
      </View>
      <View style={[styles.content, contentStyle]}>
        <Text
          style={[styles.title, { color: theme.colors.text }, titleStyle]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {!!formattedDate && (
          <Text
            style={[styles.date, { color: theme.colors.mutedText }, dateStyle]}
          >
            {isContributed
              ? `${t('myPost.contributedOn')}${formattedDate}`
              : formattedDate}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.transparent,
    marginHorizontal: scale(spacing.sm),
    marginBottom: verticalScale(spacing.sm),
  },
  image: {
    width: '100%',
    height: verticalScale(160),
    borderRadius: normalize(12),
    backgroundColor: palette.gray200,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.white50,
    borderRadius: normalize(12),
    padding: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: verticalScale(8),
  },
  title: {
    fontSize: normalize(14),
    fontWeight: '500',
    lineHeight: normalize(18),
  },
  date: {
    fontSize: normalize(12),
    marginTop: verticalScale(4),
  },
});
