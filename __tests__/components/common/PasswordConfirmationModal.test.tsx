import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator, TextInput } from 'react-native';
import { PasswordConfirmationModal } from '../../../src/components/common/PasswordConfirmationModal';
import { palette } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TextInput: createPrimitive('TextInput'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('../../../src/components/common/AppModal', () => ({
  AppModal: ({ children }: any) => <>{children}</>,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PasswordConfirmationModal', () => {
  it('shows validation error when confirming empty password', () => {
    const onConfirm = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <PasswordConfirmationModal
        isVisible
        onClose={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(queryByText('passwordConfirmationModal.validationError')).toBeNull();
    fireEvent.press(getByTestId('password-confirm-modal-confirm'));
    expect(getByText('passwordConfirmationModal.validationError')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clears error on input, confirms with password, and handles close', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const { getByTestId, queryByText, UNSAFE_getByType } = render(
      <PasswordConfirmationModal
        isVisible
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.press(getByTestId('password-confirm-modal-confirm'));
    expect(queryByText('passwordConfirmationModal.validationError')).toBeTruthy();

    const input = UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, 'secret');
    expect(queryByText('passwordConfirmationModal.validationError')).toBeNull();

    fireEvent.press(getByTestId('password-confirm-modal-confirm'));
    expect(onConfirm).toHaveBeenCalledWith('secret');

    fireEvent.press(getByTestId('password-confirm-modal-cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables confirm and shows loader when loading', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <PasswordConfirmationModal
        isVisible
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        isLoading
      />
    );

    const confirmButton = getByTestId('password-confirm-modal-confirm');
    expect(confirmButton.props.disabled).toBe(true);

    const loader = UNSAFE_getByType(ActivityIndicator);
    expect(loader.props.color).toBe(palette.white);
    expect(loader.props.size).toBe('small');
  });
});
