import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LookingForGender } from '../../src/screens/LookingForGender/LookingForGender';

const mockUseLookingForGender = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Pressable: createPrimitive('Pressable'),
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    PixelRatio: { roundToNearestPixel: (value: number) => value },
  };
});

jest.mock('../../src/screens/LookingForGender/LookingForGender.hook', () => ({
  useLookingForGender: () => mockUseLookingForGender(),
}));

jest.mock('../../src/hooks/useGoBack', () => ({
  useGoBack: () => mockGoBack,
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../src/components/common/Header', () => ({
  Header: ({ onBackPress }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { onPress: onBackPress }, ReactLib.createElement('Text', null, 'Back'));
  },
}));

jest.mock('../../src/components/common/AppTitle', () => ({
  AppTitle: ({ text }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Text', null, text);
  },
}));

jest.mock('../../src/components/common/AppRadio', () => ({
  AppRadio: ({ title, onPress }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { onPress }, ReactLib.createElement('Text', null, title));
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { onPress }, ReactLib.createElement('Text', null, title));
  },
}));

describe('LookingForGender', () => {
  const baseHookState = {
    genders: ['Male', 'Female'],
    selectedGender: null,
    error: undefined,
    onSelectGender: jest.fn(),
    onPressNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLookingForGender.mockReturnValue(baseHookState);
  });

  it('renders genders and handles selection and next', () => {
    const { getByText } = render(<LookingForGender />);

    fireEvent.press(getByText('Back'));
    fireEvent.press(getByText('Male'));
    fireEvent.press(getByText('lookingForFlow.common.next'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(baseHookState.onSelectGender).toHaveBeenCalledWith('Male');
    expect(baseHookState.onPressNext).toHaveBeenCalled();
  });

  it('shows error text when error is present', () => {
    mockUseLookingForGender.mockReturnValue({
      ...baseHookState,
      error: 'Gender is required',
    });

    const { getByText } = render(<LookingForGender />);

    expect(getByText('Gender is required')).toBeTruthy();
  });
});
