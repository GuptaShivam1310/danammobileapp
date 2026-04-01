import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PrimaryButton } from '../../../src/components/common/PrimaryButton';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    Pressable: createPrimitive('Pressable'),
    Text: createPrimitive('Text'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

describe('PrimaryButton', () => {
  it('renders title and handles press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Submit" onPress={onPress} />
    );

    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <PrimaryButton title="Submit" onPress={jest.fn()} loading />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });
});
