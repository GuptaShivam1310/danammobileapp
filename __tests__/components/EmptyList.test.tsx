import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import { EmptyList } from '../../src/components/common/EmptyList';

jest.mock('react-native-vector-icons/Feather', () => ({
  __esModule: true,
  default: 'FeatherIcon',
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812, scale: 2, fontScale: 2 }),
    },
    PixelRatio: {
      roundToNearestPixel: (size: number) => size,
    },
  };
});

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#111111',
        mutedText: '#666666',
        brandGreen: '#0B6B4F',
      },
    },
  }),
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
  __esModule: true,
  SvgIcon: () => {
    const ReactLib = require('react');
    const { View } = require('react-native');
    return ReactLib.createElement(View, { testID: 'empty-list-icon' });
  },
}));

describe('EmptyList', () => {
  const mockCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon, title, subtitle and button text', () => {
    const { getByTestId, getByText } = render(
      <EmptyList
        title="Title Example"
        subTitle="Subtitle Example"
        btnText="Discover"
        btnCallBack={mockCallback}
      />,
    );

    expect(getByTestId('empty-list-icon')).toBeTruthy();
    expect(getByText('Title Example')).toBeTruthy();
    expect(getByText('Subtitle Example')).toBeTruthy();
    expect(getByText('Discover')).toBeTruthy();
  });

  it('calls callback when button is pressed', () => {
    const { UNSAFE_getByType } = render(
      <EmptyList
        title="Title Example"
        subTitle="Subtitle Example"
        btnText="Search again"
        btnCallBack={mockCallback}
      />,
    );

    const button = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
