import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AppTitle } from '../../../src/components/common/AppTitle';
import { lightColors } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    Text: createPrimitive('Text'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

const flattenStyle = (style: any) =>
  (Array.isArray(style) ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {}) : style) || {};

describe('AppTitle', () => {
  it('renders text and merges styles', () => {
    const { getByText } = render(
      <AppTitle text="Screen Title" style={{ marginTop: 8 }} />
    );

    const title = getByText('Screen Title');
    const style = flattenStyle(title.props.style);
    expect(style.marginTop).toBe(8);
    expect(style.color).toBe(lightColors.text);
  });
});
