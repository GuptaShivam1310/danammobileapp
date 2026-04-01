import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LookingForDateForBirth } from '../../src/screens/LookingForDateForBirth/LookingForDateForBirth';

const mockUseLookingForDateForBirth = jest.fn();
const mockGoBack = jest.fn();
const mockDate = new Date('2020-01-01');

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    Platform: { OS: 'android' },
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

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactLib = require('react');
  return ({ onChange }: any) =>
    ReactLib.createElement('Pressable', { onPress: () => onChange({}, new Date('2022-02-02')), testID: 'date-picker' });
});

jest.mock('../../src/screens/LookingForDateForBirth/LookingForDateForBirth.hook', () => ({
  useLookingForDateForBirth: () => mockUseLookingForDateForBirth(),
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

jest.mock('../../src/components/common/AppInput', () => ({
  AppInput: ({ onRightIconPress, onChangeText, value, placeholder }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement(
      'View',
      null,
      ReactLib.createElement('TextInput', { value, onChangeText, placeholder }),
      ReactLib.createElement('Pressable', { onPress: onRightIconPress }, ReactLib.createElement('Text', null, 'OpenPicker')),
    );
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { onPress }, ReactLib.createElement('Text', null, title));
  },
}));

describe('LookingForDateForBirth', () => {
  const baseHookState = {
    dob: '01/01/2020',
    error: undefined,
    selectedDate: mockDate,
    isPickerVisible: false,
    onChangeText: jest.fn(),
    onOpenPicker: jest.fn(),
    onClosePicker: jest.fn(),
    onDateChange: jest.fn(),
    onPressNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLookingForDateForBirth.mockReturnValue(baseHookState);
  });

  it('renders and handles back, open picker and next', () => {
    const { getByText } = render(<LookingForDateForBirth />);

    fireEvent.press(getByText('Back'));
    fireEvent.press(getByText('OpenPicker'));
    fireEvent.press(getByText('lookingForFlow.common.next'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(baseHookState.onOpenPicker).toHaveBeenCalled();
    expect(baseHookState.onPressNext).toHaveBeenCalled();
  });

  it('renders date picker and handles onChange callbacks', () => {
    mockUseLookingForDateForBirth.mockReturnValue({
      ...baseHookState,
      isPickerVisible: true,
    });

    const { getByTestId } = render(<LookingForDateForBirth />);

    fireEvent.press(getByTestId('date-picker'));

    expect(baseHookState.onClosePicker).toHaveBeenCalled();
    expect(baseHookState.onDateChange).toHaveBeenCalledWith(new Date('2022-02-02'));
  });
});
