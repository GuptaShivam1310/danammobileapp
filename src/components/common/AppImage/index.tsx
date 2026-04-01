import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Image,
  ImageErrorEventData,
  ImageProps,
  ImageSourcePropType,
  NativeSyntheticEvent,
  ImageResizeMode,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { authUiColors, palette } from '../../../constants/colors';
import { AppImages } from '../../../assets/images';

export interface AppImageProps extends Omit<ImageProps, 'source' | 'resizeMode'> {
  imageUri?: string | null;
  source?: ImageSourcePropType;
  fallbackSource?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  blurRadius?: number;
}

const DEFAULT_FALLBACK_SOURCE = require('../../../assets/images/No_Image_Available.png');

export const AppImage: React.FC<AppImageProps> = ({
  imageUri,
  source,
  fallbackSource = DEFAULT_FALLBACK_SOURCE,
  onError,
  resizeMode = 'cover',
  style,
  blurRadius,
  ...props
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasImageError(false);
    setIsLoading(false);
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [imageUri, source]);

  const uri = useMemo(() => {
    if (!imageUri || typeof imageUri !== 'string' || imageUri === 'null' || imageUri === 'undefined') {
      return '';
    }
    return imageUri.trim();
  }, [imageUri]);

  const isRemote = useMemo(() => {
    if (!uri) return false;
    return /^https?:\/\//i.test(uri);
  }, [uri]);

  const resolvedSource = useMemo(() => {
    if (uri.length > 0) {
      return { uri };
    }
    return source;
  }, [source, uri]);

  const displaySource = useMemo(() => {
    if (hasImageError) return fallbackSource;
    if (!resolvedSource) return fallbackSource;
    if (typeof resolvedSource === 'object' && 'uri' in resolvedSource && !resolvedSource.uri) {
      return fallbackSource;
    }
    return resolvedSource;
  }, [hasImageError, resolvedSource, fallbackSource]);

  const isDisplayingPlaceholder = useMemo(() => {
    return displaySource === fallbackSource || displaySource === DEFAULT_FALLBACK_SOURCE;
  }, [displaySource, fallbackSource]);

  const isDisplayingRemote = useMemo(() => {
    if (typeof displaySource === 'object' && 'uri' in displaySource) {
      const dUri = displaySource.uri;
      return !!dUri && /^https?:\/\//i.test(dUri);
    }
    return false;
  }, [displaySource]);

  const startLoading = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(true);
    }, 150); // Small delay to prevent flickering for cached images
  };

  const endLoading = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleError = (
    event: NativeSyntheticEvent<ImageErrorEventData>,
  ) => {
    setHasImageError(true);
    endLoading();
    onError?.(event);
  };

  const fastImageResizeMode = useMemo(() => {
    switch (resizeMode) {
      case 'contain':
        return FastImage.resizeMode.contain;
      case 'stretch':
        return FastImage.resizeMode.stretch;
      case 'center':
        return FastImage.resizeMode.center;
      default:
        return FastImage.resizeMode.cover;
    }
  }, [resizeMode]);

  // Use standard Image if blurRadius is requested, as FastImage doesn't support it directly in many versions
  // Use standard Image if blurRadius is requested or if it's not a remote HTTP(S) URL
  // FastImage is great for remote images, but for local/fallbacks standard Image is safer/more predictable
  if (isRemote && !hasImageError && (!blurRadius || blurRadius === 0)) {
    return (
      <View style={[styles.container, style]}>
        <FastImage
          source={{
            uri: uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={StyleSheet.absoluteFill}
          resizeMode={fastImageResizeMode}
          onLoadStart={() => isDisplayingRemote && startLoading()}
          onLoadEnd={endLoading}
          onError={() => {
            setHasImageError(true);
            endLoading();
          }}
        />
        {isLoading && isDisplayingRemote && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={authUiColors.brandGreen} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { backgroundColor: 'transparent' }]}>
      <Image
        {...(props as any)}
        source={displaySource}
        onError={handleError}
        onLoadStart={() => {
          if (isDisplayingRemote) startLoading();
          props.onLoadStart?.();
        }}
        onLoadEnd={() => {
          endLoading();
          props.onLoadEnd?.();
        }}
        resizeMode={isDisplayingPlaceholder ? 'contain' : resizeMode}
        blurRadius={blurRadius}
        style={[
          StyleSheet.absoluteFill,
          { width: '100%', height: '100%' },
          isDisplayingPlaceholder && { backgroundColor: '#f0f0f0' },
        ]}
      />
      {isLoading && isDisplayingRemote && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={authUiColors.brandGreen} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    overflow: 'hidden',
  },
});
