import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { AppRadio } from '../../../src/components/common/AppRadio';
import { lightColors } from '../../../src/constants/colors';

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
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

const findViewByStyle = (views: any[], predicate: (style: any) => boolean) =>
  views.find(view => predicate(flattenStyle(view.props.style)));

describe('AppRadio', () => {
  it('renders selected radio with sizes and handles press', () => {
    const onPress = jest.fn();
    const { getByText, UNSAFE_getAllByType, UNSAFE_getByType } = render(
      <AppRadio title="Option" selected size={20} onPress={onPress} />
    );

    const touchable = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(touchable);
    expect(onPress).toHaveBeenCalled();

    const views = UNSAFE_getAllByType(View);
    const outer = findViewByStyle(views, style => style?.borderWidth === 1);
    expect(outer).toBeTruthy();
    expect(flattenStyle(outer.props.style)).toMatchObject({
      width: 20,
      height: 20,
      borderRadius: 10,
      borderColor: lightColors.seekerGreen,
    });

    const inner = findViewByStyle(
      views,
      style => style?.backgroundColor === lightColors.seekerGreen
    );
    expect(inner).toBeTruthy();
    expect(flattenStyle(inner.props.style)).toMatchObject({
      width: 12,
      height: 12,
      borderRadius: 6,
    });
  });

  it('disables press when onPress is missing and hides inner view', () => {
    const { UNSAFE_getAllByType, UNSAFE_getByType } = render(
      <AppRadio title="No Press" selected={false} />
    );

    const touchable = UNSAFE_getByType(TouchableOpacity);
    expect(touchable.props.disabled).toBe(true);

    const views = UNSAFE_getAllByType(View);
    const inner = views.find(
      view =>
        flattenStyle(view.props.style)?.backgroundColor === lightColors.seekerGreen
    );
    expect(inner).toBeUndefined();

    const outer = findViewByStyle(views, style => style?.borderWidth === 1);
    expect(flattenStyle(outer.props.style)).toMatchObject({
      borderColor: lightColors.seekerGreenLight,
    });
  });

  it('merges custom container styles', () => {
    const { UNSAFE_getByType } = render(
      <AppRadio title="Styled" selected style={{ marginTop: 10 }} />
    );

    const touchable = UNSAFE_getByType(TouchableOpacity);
    const style = flattenStyle(touchable.props.style);
    expect(style.marginTop).toBe(10);
  });
});
