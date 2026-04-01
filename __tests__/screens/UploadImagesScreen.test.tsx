import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { UploadImagesScreen } from '../../src/screens/UploadImages/UploadImagesScreen';
import { useUploadImages } from '../../src/screens/UploadImages/useUploadImages';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  const FlatList = ({ data, renderItem, testID, keyExtractor }: any) =>
    ReactLib.createElement(
      'FlatList',
      { testID },
      data.map((item: any, index: number) =>
        ReactLib.createElement(
          ReactLib.Fragment,
          { key: keyExtractor ? keyExtractor(item, index) : `${index}` },
          renderItem({ item, index }),
        ),
      ),
    );

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    FlatList,
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        brandGreen: '#0B6B4F',
      },
    },
  }),
}));

jest.mock('../../src/theme/scale', () => ({
  scale: (val: number) => val,
  moderateScale: (val: number) => val,
  verticalScale: (val: number) => val,
  normalize: (val: number) => val,
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, null, children);
  },
}));

jest.mock('../../src/components/common/Header', () => ({
  Header: ({ title, onBackPress, testID, backButtonTestID }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return React.createElement(
      View,
      { testID },
      React.createElement(Text, null, title),
      React.createElement(TouchableOpacity, { testID: backButtonTestID, onPress: onBackPress }),
    );
  },
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
  PrimaryButton: ({ onPress, testID }: any) => {
    const React = require('react');
    const { TouchableOpacity } = require('react-native');
    return React.createElement(TouchableOpacity, { onPress, testID });
  },
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
  SvgIcon: ({ ...props }: any) => {
    const React = require('react');
    return React.createElement('SvgIcon', props);
  },
}));

jest.mock('../../src/components/common/AppImage', () => ({
  AppImage: ({ ...props }: any) => {
    const React = require('react');
    return React.createElement('AppImage', props);
  },
}));

jest.mock('../../src/assets/icons', () => ({
  CameraIcon: 'CameraIcon',
  DeleteIcon: 'DeleteIcon',
  GalleryIcon: 'GalleryIcon',
}));

jest.mock('../../src/screens/UploadImages/useUploadImages', () => ({
  useUploadImages: jest.fn(),
}));

const mockUseUploadImages = useUploadImages as jest.Mock;

describe('UploadImagesScreen', () => {
  const baseHook = {
    images: ['img-1', 'img-2'],
    isUploading: false,
    handleCapture: jest.fn(),
    handleChooseGallery: jest.fn(),
    handleDeleteImage: jest.fn(),
    handleBack: jest.fn(),
    handleNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUploadImages.mockReturnValue({ ...baseHook });
  });

  it('renders header, actions, and image list', () => {
    const { getByTestId } = render(<UploadImagesScreen />);

    expect(getByTestId('upload-images-header')).toBeTruthy();
    expect(getByTestId('upload-images-back-button')).toBeTruthy();
    expect(getByTestId('capture-button')).toBeTruthy();
    expect(getByTestId('gallery-button')).toBeTruthy();
    expect(getByTestId('images-list')).toBeTruthy();
    expect(getByTestId('upload-images-next-button')).toBeTruthy();
    expect(getByTestId('image-item-0')).toBeTruthy();
    expect(getByTestId('image-item-1')).toBeTruthy();
  });

  it('wires up user actions', () => {
    const { getByTestId } = render(<UploadImagesScreen />);

    fireEvent.press(getByTestId('upload-images-back-button'));
    fireEvent.press(getByTestId('capture-button'));
    fireEvent.press(getByTestId('gallery-button'));
    fireEvent.press(getByTestId('upload-images-next-button'));
    fireEvent.press(getByTestId('delete-image-1'));

    expect(baseHook.handleBack).toHaveBeenCalled();
    expect(baseHook.handleCapture).toHaveBeenCalled();
    expect(baseHook.handleChooseGallery).toHaveBeenCalled();
    expect(baseHook.handleNext).toHaveBeenCalled();
    expect(baseHook.handleDeleteImage).toHaveBeenCalledWith(1);
  });
});
