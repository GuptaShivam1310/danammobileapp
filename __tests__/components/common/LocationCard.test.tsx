import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { LocationCard } from '../../../src/components/common/LocationCard';
import { useTheme } from '../../../src/theme';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

const flattenStyle = (style: any) =>
  (Array.isArray(style) ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {}) : style) || {};

describe('LocationCard', () => {
  it('renders title/subtitle, icons and handles press', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText, getAllByTestId } = render(
      <LocationCard
        title="Mumbai"
        subTitle="Andheri West"
        onPress={onPress}
        testID="location-card"
      />
    );

    fireEvent.press(getByTestId('location-card'));
    expect(onPress).toHaveBeenCalled();

    expect(getByText('Mumbai')).toBeTruthy();
    expect(getByText('Andheri West')).toBeTruthy();
    expect(getAllByTestId('svg-mock')).toHaveLength(2);

    const theme = useTheme().theme;
    const containerStyle = flattenStyle(
      getByTestId('location-card').props.style
    );
    expect(containerStyle.backgroundColor).toBe(theme.colors.surface);
    expect(containerStyle.borderColor).toBe(theme.colors.border);

    const titleStyle = flattenStyle(getByText('Mumbai').props.style);
    expect(titleStyle.color).toBe(theme.colors.brandGreen);
  });

  it('hides subtitle when not provided and merges custom style', () => {
    const { getByTestId, getByText, queryByText } = render(
      <LocationCard
        title="Delhi"
        onPress={jest.fn()}
        testID="location-card"
        style={{ marginTop: 12 }}
      />
    );

    expect(getByText('Delhi')).toBeTruthy();
    expect(queryByText('Andheri West')).toBeNull();

    const style = flattenStyle(getByTestId('location-card').props.style);
    expect(style.marginTop).toBe(12);
  });
});
