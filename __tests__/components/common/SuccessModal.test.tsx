import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SuccessModal } from '../../../src/components/common/SuccessModal';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    Modal: createPrimitive('Modal'),
    TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('../../../src/components/common/SvgIcon', () => ({
  SvgIcon: (props: any) => <svg {...props} />,
}));

jest.mock('../../../src/components/common/AppModal', () => ({
  AppModal: ({ children }: any) => <>{children}</>,
}));

describe('SuccessModal', () => {
  it('renders content and handles button press', () => {
    const onClose = jest.fn();
    const onButtonPress = jest.fn();
    const { getByText } = render(
      <SuccessModal
        isVisible
        onClose={onClose}
        title="Success"
        subtitle="All good"
        buttonText="Continue"
        onButtonPress={onButtonPress}
      />
    );

    expect(getByText('Success')).toBeTruthy();
    expect(getByText('All good')).toBeTruthy();

    fireEvent.press(getByText('Continue'));
    expect(onButtonPress).toHaveBeenCalled();
  });
});
