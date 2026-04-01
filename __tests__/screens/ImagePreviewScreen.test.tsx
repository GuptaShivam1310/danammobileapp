import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ImagePreviewScreen } from '../../src/screens/Chat/ImagePreviewScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => {
    const ReactLib = require('react');
    const { View } = require('react-native');
    return ReactLib.createElement(View, null, children);
  },
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    Image: createPrimitive('Image'),
    StatusBar: createPrimitive('StatusBar'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
      absoluteFill: { position: 'absolute' },
    },
  };
});

jest.mock('../../src/constants/colors', () => ({
  palette: {
    blackPure: '#000',
    white: '#fff',
    modalOverlay: '#111',
  },
}));

jest.mock('../../src/theme/scale', () => ({
  scale: (val: number) => val,
  verticalScale: (val: number) => val,
  normalize: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
  fonts: {
    semiBold: 'SemiBold',
  },
}));

const mockUseNavigation = useNavigation as jest.Mock;
const mockUseRoute = useRoute as jest.Mock;

describe('ImagePreviewScreen', () => {
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({ goBack: mockGoBack });
  });

  it('renders image and header with filename', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_IMAGE_VIEW,
      params: { imageUri: 'https://example.com/img.jpg', fileName: 'My Image' },
    });

    const { getByText, getByTestId } = render(<ImagePreviewScreen />);

    expect(getByText('My Image')).toBeTruthy();
    expect(getByTestId('preview-image')).toBeTruthy();
  });

  it('falls back to default title and handles back press', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_IMAGE_VIEW,
      params: { imageUri: 'https://example.com/img.jpg', fileName: undefined },
    });

    const { getByText, getByTestId } = render(<ImagePreviewScreen />);

    expect(getByText('Image')).toBeTruthy();

    fireEvent.press(getByTestId('image-preview-back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('uses default title for empty filename and passes image/statusbar props', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_IMAGE_VIEW,
      params: { imageUri: 'https://example.com/preview.png', fileName: '' },
    });

    const { getByTestId, getByText, UNSAFE_getByType } = render(
      <ImagePreviewScreen />
    );

    expect(getByText('Image')).toBeTruthy();

    const image = getByTestId('preview-image');
    expect(image.props.source).toEqual({ uri: 'https://example.com/preview.png' });
    expect(image.props.resizeMode).toBe('contain');

    const statusBar = UNSAFE_getByType('StatusBar');
    expect(statusBar.props.barStyle).toBe('light-content');
    expect(statusBar.props.backgroundColor).toBe('#000');
    expect(statusBar.props.translucent).toBe(true);
  });
});
