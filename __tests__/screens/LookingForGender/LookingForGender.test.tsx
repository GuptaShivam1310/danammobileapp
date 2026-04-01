import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LookingForGender } from '../../../src/screens/LookingForGender/LookingForGender';

const mockOnSelectGender = jest.fn();
const mockOnPressNext = jest.fn();
const mockGoBack = jest.fn();

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
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../src/hooks/useGoBack', () => ({
  useGoBack: () => mockGoBack,
}));

const mockUseLookingForGender = jest.fn();
jest.mock('../../../src/screens/LookingForGender/LookingForGender.hook', () => ({
  useLookingForGender: () => mockUseLookingForGender(),
}));

jest.mock('../../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../../src/components/common/Header', () => ({
  Header: ({ onBackPress }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ReactLib.createElement(
      TouchableOpacity,
      { testID: 'header-back', onPress: onBackPress },
      ReactLib.createElement(Text, null, 'back')
    );
  },
}));

jest.mock('../../../src/components/common/AppTitle', () => ({
  AppTitle: ({ text }: any) => {
    const ReactLib = require('react');
    const { Text } = require('react-native');
    return ReactLib.createElement(Text, null, text);
  },
}));

jest.mock('../../../src/components/common/AppRadio', () => ({
  AppRadio: ({ title, selected, onPress }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ReactLib.createElement(
      TouchableOpacity,
      { testID: `radio-${title}`, onPress },
      ReactLib.createElement(Text, { testID: `radio-${title}-selected` }, String(selected))
    );
  },
}));

jest.mock('../../../src/components/common/AppButton', () => ({
  AppButton: ({ onPress, title }: any) => {
    const ReactLib = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ReactLib.createElement(
      TouchableOpacity,
      { testID: 'next-button', onPress },
      ReactLib.createElement(Text, null, title)
    );
  },
}));

describe('LookingForGender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders genders, handles selection and next', () => {
    mockUseLookingForGender.mockReturnValue({
      genders: ['Male', 'Female'],
      selectedGender: 'Female',
      error: undefined,
      onSelectGender: mockOnSelectGender,
      onPressNext: mockOnPressNext,
    });

    const { getByTestId, getByText } = render(<LookingForGender />);
    expect(getByText('lookingForFlow.gender.title')).toBeTruthy();
    expect(getByTestId('radio-Male-selected').props.children).toBe('false');
    expect(getByTestId('radio-Female-selected').props.children).toBe('true');

    fireEvent.press(getByTestId('radio-Male'));
    expect(mockOnSelectGender).toHaveBeenCalledWith('Male');

    fireEvent.press(getByTestId('next-button'));
    expect(mockOnPressNext).toHaveBeenCalled();
  });

  it('shows error and handles back', () => {
    mockUseLookingForGender.mockReturnValue({
      genders: ['Male'],
      selectedGender: null,
      error: 'Gender is required',
      onSelectGender: mockOnSelectGender,
      onPressNext: mockOnPressNext,
    });

    const { getByText, getByTestId } = render(<LookingForGender />);
    expect(getByText('Gender is required')).toBeTruthy();

    fireEvent.press(getByTestId('header-back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
