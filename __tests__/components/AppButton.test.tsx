import React from 'react';
import { render } from '@testing-library/react-native';
import { AppButton } from '../../src/components/common/AppButton';

jest.mock('react-native-elements', () => ({
  Button: (props: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Button', props);
  },
}));

jest.mock('../../src/theme/scale', () => ({
  normalize: (val: number) => val,
  moderateScale: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
  fonts: {
    semiBold: 'SemiBold',
  },
}));

jest.mock('../../src/constants/colors', () => ({
  lightColors: {
    primary: '#123456',
  },
}));

jest.mock('../../src/theme/spacing', () => ({
  spacing: {
    md: 16,
  },
}));

describe('AppButton', () => {
  it('renders with default and custom styles', () => {
    const { getByTestId } = render(
      <AppButton
        testID="app-button"
        title="Submit"
        buttonStyle={{ marginTop: 12 }}
        titleStyle={{ color: 'red' }}
      />,
    );

    const button = getByTestId('app-button');

    expect(button.props.title).toBe('Submit');
    expect(button.props.buttonStyle[0]).toEqual({
      backgroundColor: '#123456',
      borderRadius: 8,
      paddingVertical: 16,
    });
    expect(button.props.buttonStyle[1]).toEqual({ marginTop: 12 });

    expect(button.props.titleStyle[0]).toEqual({
      fontSize: 16,
      fontFamily: 'SemiBold',
    });
    expect(button.props.titleStyle[1]).toEqual({ color: 'red' });
  });

  it('passes through additional props', () => {
    const onPress = jest.fn();

    const { getByTestId } = render(
      <AppButton
        testID="app-button"
        title="Submit"
        disabled
        onPress={onPress}
      />,
    );

    const button = getByTestId('app-button');
    expect(button.props.disabled).toBe(true);
    expect(button.props.onPress).toBe(onPress);
  });
});
