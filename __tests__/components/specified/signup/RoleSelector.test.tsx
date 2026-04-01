import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { RoleSelector } from '../../../../src/components/specified/signup/RoleSelector';
import { authUiColors } from '../../../../src/constants/colors';

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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

describe('RoleSelector', () => {
  it('renders donor selected state and triggers select', () => {
    const onSelect = jest.fn();
    const { getByText, getByTestId, UNSAFE_getAllByType } = render(
      <RoleSelector
        selectedRole="donor"
        onSelect={onSelect}
        testIDDonor="donor-card"
        testIDSeeker="seeker-card"
      />
    );

    expect(getByText('signup.donor')).toBeTruthy();
    expect(getByText('signup.seeker')).toBeTruthy();

    fireEvent.press(getByTestId('donor-card'));
    expect(onSelect).toHaveBeenCalledWith('donor');

    const textStyle = flattenStyle(getByText('signup.donor').props.style);
    expect(textStyle.color).toBe(authUiColors.brandGreen);

    const views = UNSAFE_getAllByType('View');
    const radioInner = views.find(
      (view: any) => flattenStyle(view.props.style)?.backgroundColor === authUiColors.brandGreen
    );
    expect(radioInner).toBeTruthy();
  });

  it('renders seeker selected state and triggers select', () => {
    const onSelect = jest.fn();
    const { getByTestId, getByText } = render(
      <RoleSelector
        selectedRole="seeker"
        onSelect={onSelect}
        testIDDonor="donor-card"
        testIDSeeker="seeker-card"
      />
    );

    fireEvent.press(getByTestId('seeker-card'));
    expect(onSelect).toHaveBeenCalledWith('seeker');

    const textStyle = flattenStyle(getByText('signup.seeker').props.style);
    expect(textStyle.color).toBe(authUiColors.brandGreen);
  });
});
