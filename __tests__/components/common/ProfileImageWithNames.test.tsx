import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileImageWithNames } from '../../../src/components/common/ProfileImageWithNames';
import { useTheme } from '../../../src/theme';

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../src/theme/scale', () => ({
  moderateScale: (v: number) => v,
  verticalScale: (v: number) => v,
}));

jest.mock('../../../src/theme/spacing', () => ({
  spacing: { lg: 16, sm: 8 },
}));

const mockAppInput = jest.fn(() => null);

jest.mock('../../../src/components/common/AppInput', () => ({
  AppInput: (props: any) => mockAppInput(props),
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactLib.createElement(name, { ...props, ref }, children)
    );
  return {
    View: createPrimitive('View'),
    Image: createPrimitive('Image'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (s: any) => s,
      flatten: (s: any) => s,
    },
  };
});

describe('ProfileImageWithNames', () => {
  const mockSetFirst = jest.fn();
  const mockSetLast = jest.fn();
  const mockOnImagePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: { colors: { brandGreen: '#00FF00' } },
    });
  });

  it('renders profile image from uri and passes input props', () => {
    const { UNSAFE_getByType, getByTestId } = render(
      <ProfileImageWithNames
        firstName="John"
        setFirstName={mockSetFirst}
        lastName="Doe"
        setLastName={mockSetLast}
        profileImageUri="https://example.com/avatar.png"
        onImagePress={mockOnImagePress}
        firstNameLabel="First"
        lastNameLabel="Last"
        firstNamePlaceholder="First name"
        lastNamePlaceholder="Last name"
        firstNameError="Required"
        lastNameError="Invalid"
        firstNameTestID="first-name"
        lastNameTestID="last-name"
        imageTestID="profile-image"
      />
    );

    const image = UNSAFE_getByType('Image');
    expect(image.props.source).toEqual({ uri: 'https://example.com/avatar.png' });

    fireEvent.press(getByTestId('profile-image'));
    expect(mockOnImagePress).toHaveBeenCalledTimes(1);

    expect(mockAppInput).toHaveBeenCalledTimes(2);
    const firstInputProps = mockAppInput.mock.calls[0][0];
    const lastInputProps = mockAppInput.mock.calls[1][0];

    expect(firstInputProps.label).toBe('First');
    expect(firstInputProps.placeholder).toBe('First name');
    expect(firstInputProps.value).toBe('John');
    expect(firstInputProps.onChangeText).toBe(mockSetFirst);
    expect(firstInputProps.error).toBe('Required');
    expect(firstInputProps.leftIconName).toBe('user');
    expect(firstInputProps.testID).toBe('first-name');

    expect(lastInputProps.label).toBe('Last');
    expect(lastInputProps.placeholder).toBe('Last name');
    expect(lastInputProps.value).toBe('Doe');
    expect(lastInputProps.onChangeText).toBe(mockSetLast);
    expect(lastInputProps.error).toBe('Invalid');
    expect(lastInputProps.leftIconName).toBe('user');
    expect(lastInputProps.testID).toBe('last-name');
  });

  it('uses placeholder image when uri is missing', () => {
    const placeholder = { test: 'placeholder' };
    const { UNSAFE_getByType } = render(
      <ProfileImageWithNames
        firstName="Jane"
        setFirstName={mockSetFirst}
        lastName="Smith"
        setLastName={mockSetLast}
        profileImageUri={null}
        onImagePress={mockOnImagePress}
        firstNameLabel="First"
        lastNameLabel="Last"
        firstNamePlaceholder="First name"
        lastNamePlaceholder="Last name"
        imagePlaceholder={placeholder}
      />
    );

    const image = UNSAFE_getByType('Image');
    expect(image.props.source).toBe(placeholder);
  });

  it('falls back to default image when no uri or placeholder', () => {
    const { UNSAFE_getByType } = render(
      <ProfileImageWithNames
        firstName="Jane"
        setFirstName={mockSetFirst}
        lastName="Smith"
        setLastName={mockSetLast}
        profileImageUri={null}
        onImagePress={mockOnImagePress}
        firstNameLabel="First"
        lastNameLabel="Last"
        firstNamePlaceholder="First name"
        lastNamePlaceholder="Last name"
      />
    );

    const image = UNSAFE_getByType('Image');
    expect(image.props.source).toBeDefined();
  });
});
