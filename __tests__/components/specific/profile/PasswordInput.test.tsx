import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PasswordInput } from '../../../../src/components/specific/profile/PasswordInput';

jest.mock('../../../../src/components/common/AppInput', () => ({
  AppInput: (props: any) => {
    const ReactLib = require('react');
    const { View, Text } = require('react-native');
    return ReactLib.createElement(
      View,
      { testID: 'app-input', ...props },
      ReactLib.createElement(Text, null, props.label),
      ReactLib.createElement(Text, { testID: 'right-icon-name' }, props.rightIconName),
      ReactLib.createElement(Text, { testID: 'secure-flag' }, String(props.secureTextEntry)),
      ReactLib.createElement(Text, { testID: 'error-text' }, props.error ?? '')
    );
  },
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

describe('PasswordInput', () => {
  it('passes correct props when password is hidden', () => {
    const onChangeText = jest.fn();
    const onToggleVisibility = jest.fn();
    const { getByText, getByTestId } = render(
      <PasswordInput
        label="Password"
        value="secret"
        onChangeText={onChangeText}
        placeholder="Enter"
        isVisible={false}
        onToggleVisibility={onToggleVisibility}
        error="Required"
        testID="password-input"
        eyeTestID="toggle-visibility"
      />
    );

    expect(getByText('Password')).toBeTruthy();
    expect(getByTestId('right-icon-name').props.children).toBe('eye-off');
    expect(getByTestId('secure-flag').props.children).toBe('true');
    expect(getByTestId('error-text').props.children).toBe('Required');
  });

  it('passes correct props when password is visible and triggers toggle', () => {
    const onToggleVisibility = jest.fn();
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value="secret"
        onChangeText={jest.fn()}
        placeholder="Enter"
        isVisible
        onToggleVisibility={onToggleVisibility}
        testID="password-input"
      />
    );

    expect(getByTestId('right-icon-name').props.children).toBe('eye');
    expect(getByTestId('secure-flag').props.children).toBe('false');

    const appInput = getByTestId('password-input');
    fireEvent(appInput, 'onRightIconPress');
    expect(onToggleVisibility).toHaveBeenCalled();
  });
});
