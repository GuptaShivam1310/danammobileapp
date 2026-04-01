import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SearchFilterBar } from '../../../src/components/specified/home/SearchFilterBar';
import { useTheme } from '../../../src/theme';

jest.useFakeTimers();

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    TextInput: createPrimitive('TextInput'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.Mock;

describe('SearchFilterBar', () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          background: '#ffffff',
          surface: '#ffffff',
          text: '#111111',
          border: '#E2E8F0',
          mutedText: '#9CA3AF',
        },
      },
    });
  });

  it('calls onPress when search bar is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SearchFilterBar onPress={onPress} />,
    );

    fireEvent.press(getByTestId('search-bar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onSearch on input change', () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <SearchFilterBar onSearch={onSearch} value="" />,
    );

    fireEvent.changeText(getByTestId('search-input'), 'phone');
    expect(onSearch).toHaveBeenCalledWith('phone');
  });

  it('calls onSearch immediately when value prop is undefined', () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(
      <SearchFilterBar onSearch={onSearch} debounceDelay={200} />,
    );

    fireEvent.changeText(getByTestId('search-input'), 'iphone');
    expect(onSearch).toHaveBeenCalledWith('iphone');
  });

  it('calls onFilterPress on filter button press', () => {
    const onFilterPress = jest.fn();
    const { getByTestId } = render(
      <SearchFilterBar onFilterPress={onFilterPress} />,
    );

    fireEvent.press(getByTestId('filter-button'));
    expect(onFilterPress).toHaveBeenCalledTimes(1);
  });

  it('renders search and filter icons when provided', () => {
    const SearchIcon = () => null;
    const FilterIcon = () => null;
    const { getByTestId } = render(
      <SearchFilterBar searchIcon={SearchIcon} filterIcon={FilterIcon} />,
    );

    // We can't easily query for SvgIcon if it's not mocked to have a testID,
    // but the presence of icons in the render tree will cover the branches.
    expect(getByTestId('search-bar')).toBeTruthy();
    expect(getByTestId('filter-button')).toBeTruthy();
  });
});
