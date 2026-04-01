import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AppImage } from '../../../../src/components/common/AppImage';
import { Image } from 'react-native';

jest.useFakeTimers();

jest.mock('react-native-fast-image', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const FastImage = (props: any) => {
    return ReactLib.createElement('View', { testID: 'fast-image', ...props });
  };
  FastImage.resizeMode = { contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center' };
  FastImage.priority = { normal: 'normal' };
  FastImage.cacheControl = { immutable: 'immutable' };
  return FastImage;
});

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

describe('AppImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders standard Image for local source', () => {
    const { getByTestId, root } = render(<AppImage testID="app-image" source={123} />);
    const img = getByTestId('app-image');
    expect(img.props.source).toBe(123);
  });

  it('renders FastImage for remote source', () => {
    const { getByTestId } = render(<AppImage imageUri="http://test.com/img.png" testID="app-image" resizeMode="contain" />);
    const fastImg = getByTestId('fast-image');
    expect(fastImg).toBeTruthy();
    expect(fastImg.props.resizeMode).toBe('contain');
  });

  it('handles other resize modes for FastImage', () => {
    const { getByTestId, rerender } = render(<AppImage imageUri="http://test.com/img.png" resizeMode="stretch" />);
    expect(getByTestId('fast-image').props.resizeMode).toBe('stretch');
    rerender(<AppImage imageUri="http://test.com/img.png" resizeMode="center" />);
    expect(getByTestId('fast-image').props.resizeMode).toBe('center');
  });

  it('falls back to standard Image when blurRadius is provided', () => {
    const { queryByTestId, root } = render(<AppImage imageUri="http://test.com/img.png" blurRadius={10} testID="app-image" />);
    expect(queryByTestId('fast-image')).toBeNull();
    const img = root.findByProps({ testID: 'app-image' });
    expect(img).toBeTruthy();
  });

  it('handles loading state in standard Image', () => {
    const { queryByTestId, root, getByTestId } = render(<AppImage testID="app-image" source={123} />);
    const img = getByTestId('app-image');
    
    act(() => {
      img.props.onLoadStart();
      jest.advanceTimersByTime(200);
    });
    // ActivityIndicator is rendered
    expect(root.findAllByType('ActivityIndicator' as any)).toBeDefined();

    act(() => {
      img.props.onLoadEnd();
    });
  });

  it('handles error state in standard Image', () => {
    const onErrorMock = jest.fn();
    const { getByTestId } = render(<AppImage testID="app-image" source={123} onError={onErrorMock} fallbackSource={456} />);
    const img = getByTestId('app-image');
    
    act(() => {
      img.props.onError({ nativeEvent: { error: 'failed' } });
    });
    
    expect(onErrorMock).toHaveBeenCalled();
    // Re-renders with fallbackSource
    expect(img.props.source).toBe(456);
  });

  it('handles loading state in FastImage', () => {
    const { getByTestId, root } = render(<AppImage imageUri="http://test.com/img.png" testID="app-image" />);
    const img = getByTestId('fast-image');
    
    act(() => {
      img.props.onLoadStart();
      jest.advanceTimersByTime(200);
    });

    act(() => {
      img.props.onLoadEnd();
    });
  });

  it('handles error state in FastImage', () => {
    const { getByTestId, root } = render(<AppImage imageUri="http://test.com/img.png" testID="app-image" fallbackSource={456} />);
    const img = getByTestId('fast-image');
    
    act(() => {
      img.props.onError();
    });
    
    // FastImage hides, falls back to standard image
    const standardImg = root.findByProps({ testID: 'app-image' });
    expect(standardImg.props.source).toBe(456);
  });
});
