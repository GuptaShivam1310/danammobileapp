import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ActionModal } from '../../../src/components/common/ActionModal';
import { palette } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('../../../src/components/common/SvgIcon', () => ({
  SvgIcon: (props: any) => <svg {...props} />,
}));

jest.mock('../../../src/components/common/AppModal', () => ({
  AppModal: ({ children }: any) => <>{children}</>,
}));

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

const DummyIcon = () => null;

describe('ActionModal', () => {
  it('renders array subtitle, uses custom confirm color, and handles presses', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const { getByText, getByTestId } = render(
      <ActionModal
        isVisible
        onClose={onClose}
        onConfirm={onConfirm}
        icon={DummyIcon}
        title="Delete?"
        subtitle={['Line 1', 'Line 2']}
        cancelText="No"
        confirmText="Yes"
        confirmButtonColor="#FF0000"
        testIDPrefix="confirm-delete"
      />
    );

    expect(getByText('Delete?')).toBeTruthy();
    expect(getByText('Line 1')).toBeTruthy();
    expect(getByText('Line 2')).toBeTruthy();

    fireEvent.press(getByTestId('confirm-delete-cancel'));
    expect(onClose).toHaveBeenCalled();

    fireEvent.press(getByTestId('confirm-delete-confirm'));
    expect(onConfirm).toHaveBeenCalled();

    const confirmStyle = flattenStyle(
      getByTestId('confirm-delete-confirm').props.style
    );
    expect(confirmStyle.backgroundColor).toBe('#FF0000');
  });

  it('renders string subtitle, default labels, and loading state', () => {
    const { getByText, getByTestId, UNSAFE_getByType } = render(
      <ActionModal
        isVisible
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        icon={DummyIcon}
        title="Proceed?"
        subtitle="Single line"
        isLoading
      />
    );

    expect(getByText('Proceed?')).toBeTruthy();
    expect(getByText('Single line')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();

    const confirmButton = getByTestId('action-modal-confirm');
    expect(confirmButton.props.disabled).toBe(true);

    const loader = UNSAFE_getByType(ActivityIndicator);
    expect(loader.props.color).toBe(palette.white);
    expect(loader.props.size).toBe('small');
  });
});
