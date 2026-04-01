import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CountryCodeSelector } from '../../../src/components/common/CountryCodeSelector';
import { useTheme } from '../../../src/theme';
import { getFlagEmoji } from '../../../src/utils/stringUtils';

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../src/utils/stringUtils', () => ({
  getFlagEmoji: jest.fn(),
}));

jest.mock('../../../src/theme/scale', () => ({
  normalize: (v: number) => v,
  moderateScale: (v: number) => v,
  verticalScale: (v: number) => v,
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactLib.createElement(name, { ...props, ref }, children)
    );
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (s: any) => s,
      flatten: (s: any) => s,
    },
  };
});

describe('CountryCodeSelector', () => {
  const mockOnPress = jest.fn();
  const defaultTheme = {
    colors: {
      surface: '#FFFFFF',
      text: '#101010',
      mutedText: '#777777',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: defaultTheme });
    (getFlagEmoji as jest.Mock).mockReturnValue('🇺🇸');
  });

  it('renders country code and flag when selectedCountry is provided', () => {
    const { getByText } = render(
      <CountryCodeSelector
        countryCode={'+1'}
        selectedCountry={{ code: 'US', name: 'United States', dialCode: '+1' } as any}
        onPress={mockOnPress}
      />
    );

    expect(getFlagEmoji).toHaveBeenCalledWith('US');
    expect(getByText('🇺🇸')).toBeTruthy();
    expect(getByText('+1')).toBeTruthy();
  });

  it('renders without flag when selectedCountry is not provided', () => {
    const { queryByText } = render(
      <CountryCodeSelector countryCode={'+91'} onPress={mockOnPress} />
    );

    expect(getFlagEmoji).not.toHaveBeenCalled();
    expect(queryByText('🇺🇸')).toBeNull();
  });

  it('calls onPress when selector is pressed', () => {
    const { getByTestId } = render(
      <CountryCodeSelector
        countryCode={'+44'}
        onPress={mockOnPress}
        testID="country-selector"
      />
    );

    fireEvent.press(getByTestId('country-selector'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('uses theme colors for surface and mutedText', () => {
    const { getByTestId, getByText } = render(
      <CountryCodeSelector
        countryCode={'+81'}
        onPress={mockOnPress}
        testID="country-selector"
      />
    );

    const selectorStyle = Array.isArray(getByTestId('country-selector').props.style)
      ? Object.assign({}, ...getByTestId('country-selector').props.style)
      : getByTestId('country-selector').props.style;

    expect(selectorStyle.backgroundColor).toBeUndefined();
    const codeTextStyle = Array.isArray(getByText('+81').props.style)
      ? Object.assign({}, ...getByText('+81').props.style)
      : getByText('+81').props.style;
    expect(codeTextStyle.color).toBe('#101010');
  });

  it('falls back to palette colors when theme values are missing', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: { colors: { surface: undefined, text: '#222222', mutedText: undefined } },
    });

    const { getByTestId } = render(
      <CountryCodeSelector
        countryCode={'+61'}
        onPress={mockOnPress}
        testID="country-selector"
      />
    );

    const selectorStyle = Array.isArray(getByTestId('country-selector').props.style)
      ? Object.assign({}, ...getByTestId('country-selector').props.style)
      : getByTestId('country-selector').props.style;

    expect(selectorStyle.backgroundColor).toBe('#FFFFFF');
    const selectorChildren = getByTestId('country-selector').props.children;
    const iconElement = Array.isArray(selectorChildren) ? selectorChildren[2] : selectorChildren;
    const iconProps = iconElement.props;
    expect(iconProps.color).toBe('#64748B');
  });
});
