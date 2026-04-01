import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ProductCard } from '../../../src/components/specified/home/ProductCard';
import { useTheme } from '../../../src/theme';
import { formatDisplayDate } from '../../../src/utils/dateUtils';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'myPost.contributedOn': 'Contributed on: ',
      };
      return map[key] || key;
    },
  }),
}));

const mockedAppImage = jest.fn((props: any) => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return ReactLib.createElement(View, { testID: props.testID || 'app-image' });
});

jest.mock('../../../src/components/common/AppImage/index.tsx', () => ({
  AppImage: (props: any) => mockedAppImage(props),
}));

jest.mock('../../../src/components/common/SvgIcon.tsx', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SvgIcon: ({ testID = 'svg-icon' }: any) =>
      ReactLib.createElement(View, { testID }),
  };
});

jest.mock('../../../src/utils/dateUtils', () => ({
  formatDisplayDate: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedFormatDisplayDate = formatDisplayDate as jest.Mock;

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          text: '#111111',
          mutedText: '#777777',
        },
      },
    });
  });

  it('renders title/date, forwards image props, and handles card press', () => {
    mockedFormatDisplayDate.mockReturnValue('1 Jan 2026');
    const onPress = jest.fn();
    const onImageError = jest.fn();
    const item = {
      id: '1',
      title: 'Apple Macbook Air M2',
      date: '2026-01-01',
      image_url: 'https://example.com/image.jpg',
    };

    const { getByText, getByTestId } = render(
      <ProductCard
        item={item as any}
        onPress={onPress}
        onImageError={onImageError}
        imageResizeMode="contain"
        testID="product-card"
      />,
    );

    expect(getByText('Apple Macbook Air M2')).toBeTruthy();
    expect(getByText('1 Jan 2026')).toBeTruthy();
    expect(getByTestId('product-card-image')).toBeTruthy();
    expect(mockedFormatDisplayDate).toHaveBeenCalledWith('2026-01-01');
    expect(mockedAppImage).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUri: 'https://example.com/image.jpg',
        resizeMode: 'contain',
        onError: onImageError,
        testID: 'product-card-image',
      }),
    );

    fireEvent.press(getByTestId('product-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders contributed badge and prefixed contributed date', () => {
    mockedFormatDisplayDate.mockReturnValue('2 Feb 2026');
    const item = {
      id: '2',
      title: 'Contributed Item',
      created_at: '2026-02-02T00:00:00Z',
      image: 'https://example.com/contributed.jpg',
    };

    const { getByText, getByTestId } = render(
      <ProductCard item={item as any} isContributed />,
    );

    expect(getByText('Contributed Item')).toBeTruthy();
    expect(getByText('Contributed on: 2 Feb 2026')).toBeTruthy();
    expect(getByTestId('svg-icon')).toBeTruthy();
    expect(mockedAppImage).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUri: 'https://example.com/contributed.jpg',
      }),
    );
  });

  it('does not render date when formatter returns empty and supports no testID branch', () => {
    mockedFormatDisplayDate.mockReturnValue('');
    const item = {
      id: '3',
      title: 'No Date Item',
      created_at: '',
      image_url: '',
    };

    const { getByText, queryByText } = render(
      <ProductCard
        item={item as any}
        useDefaultContainerStyle={false}
      />,
    );

    expect(getByText('No Date Item')).toBeTruthy();
    expect(queryByText('Contributed on:')).toBeNull();
    expect(mockedAppImage).toHaveBeenCalledWith(
      expect.objectContaining({
        testID: undefined,
      }),
    );
  });
});
