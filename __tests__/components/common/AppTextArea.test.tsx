import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TextInput } from 'react-native';
import { AppTextArea } from '../../../src/components/common/AppTextArea';
import { lightColors } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TextInput: createPrimitive('TextInput'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

describe('AppTextArea', () => {
  it('renders input, counter, and helper when below min char without error', () => {
    const onChangeCallBack = jest.fn();
    const { getByText, UNSAFE_getByType } = render(
      <AppTextArea
        text="short"
        placeholder="Type here"
        onChangeCallBack={onChangeCallBack}
        minChar={10}
        maxChar={20}
        minCharMessage="Min 10 chars"
        containerStyle={{ marginTop: 10 }}
      />
    );

    expect(getByText('5/20')).toBeTruthy();
    expect(getByText('Min 10 chars')).toBeTruthy();

    const input = UNSAFE_getByType(TextInput);
    expect(input.props.placeholder).toBe('Type here');
    expect(input.props.placeholderTextColor).toBe(lightColors.mutedText);
    expect(input.props.multiline).toBe(true);
    expect(input.props.textAlignVertical).toBe('top');
    expect(input.props.maxLength).toBe(20);

    fireEvent.changeText(input, 'changed');
    expect(onChangeCallBack).toHaveBeenCalledWith('changed');

    const wrapperStyle = flattenStyle(input.parent?.props?.style);
    expect(wrapperStyle.marginTop).toBe(10);
  });

  it('shows error text and hides helper', () => {
    const { getByText, queryByText } = render(
      <AppTextArea
        text="has error"
        onChangeCallBack={jest.fn()}
        minChar={20}
        minCharMessage="Need more"
        error="Required"
      />
    );

    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Need more')).toBeNull();
  });
});
