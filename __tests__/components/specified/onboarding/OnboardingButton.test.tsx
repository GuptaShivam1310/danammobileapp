import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingButton } from '../../../../src/components/specified/onboarding/OnboardingButton';

jest.mock('../../../../src/screens/Onboarding/styles', () => ({
  onboardingStyles: { button: {}, buttonText: {} }
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) => ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
    return {
        Pressable: createPrimitive('Pressable'),
        Text: createPrimitive('Text'),
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    };
});

describe('OnboardingButton', () => {
  it('renders correctly and handles press', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<OnboardingButton onPress={onPressMock} title="My Title" />);
    const buttonText = getByText('My Title');
    expect(buttonText).toBeTruthy();
    
    fireEvent.press(buttonText);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
