import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingSlide } from '../../../../src/components/specified/onboarding/OnboardingSlide';

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Rect: 'Rect',
  Stop: 'Stop'
}));

jest.mock('../../../../src/screens/Onboarding/styles', () => ({
  onboardingStyles: {
    slide: {}, image: {}, gradientContainer: {}, logoContainer: {}, logo: {}, contentContainer: {}, title: {}, subtitle: {}, bottomRow: {}
  }
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) => ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
    return {
        Pressable: createPrimitive('Pressable'),
        Text: createPrimitive('Text'),
        View: createPrimitive('View'),
        Image: createPrimitive('Image'),
        ImageBackground: createPrimitive('ImageBackground'),
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../../src/components/specified/onboarding/OnboardingButton', () => ({
  OnboardingButton: (props: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { testID: "mock-button", onPress: props.onPress }, 
      ReactLib.createElement('Text', null, props.title)
    );
  }
}));

jest.mock('../../../../src/components/specified/onboarding/OnboardingDots', () => ({
  OnboardingDots: () => {
    const ReactLib = require('react');
    return ReactLib.createElement('View', { testID: "mock-dots" });
  }
}));

const mockItem = {
    id: 'test_item',
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    image: { uri: 'test.jpg' }
};

describe('OnboardingSlide', () => {
  it('renders complete slide and calls onPressButton', () => {
    const onPressMock = jest.fn();
    const onSkipMock = jest.fn();
    const mockInsets = { top: 10, bottom: 20, left: 0, right: 0 };
    
    const { getByText, getByTestId } = render(
        <OnboardingSlide
            item={mockItem}
            insets={mockInsets}
            totalSlides={3}
            currentIndex={0}
            onPressButton={onPressMock}
            onSkip={onSkipMock}
        />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Subtitle')).toBeTruthy();
    expect(getByTestId('mock-dots')).toBeTruthy();
    
    fireEvent.press(getByTestId('mock-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
