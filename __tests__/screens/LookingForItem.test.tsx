import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LookingForItem } from '../../src/screens/LookingForItem/LookingForItem';

const mockUseLookingForItem = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Pressable: createPrimitive('Pressable'),
    Image: createPrimitive('Image'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    FlatList: ({ data = [], renderItem, ListEmptyComponent }: any) => {
      if (!data.length) {
        return ReactLib.createElement('View', null, ListEmptyComponent || null);
      }
      return ReactLib.createElement(
        'View',
        null,
        data.map((item: any, index: number) =>
          ReactLib.createElement(ReactLib.Fragment, { key: index }, renderItem({ item, index })),
        ),
      );
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    PixelRatio: { roundToNearestPixel: (value: number) => value },
  };
});

jest.mock('../../src/screens/LookingForItem/LookingForItem.hook', () => ({
  useLookingForItem: () => mockUseLookingForItem(),
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
  AppTitle: ({ text }: { text: string }) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Text', null, text);
  },
}));

jest.mock('../../src/components/common/AppInput', () => ({
  AppInput: ({ value, onChangeText, placeholder }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('TextInput', { value, onChangeText, placeholder });
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Pressable', { onPress }, ReactLib.createElement('Text', null, title));
  },
}));

jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    search: { uri: 'search' },
  },
}));

describe('LookingForItem', () => {
  const baseHookState = {
    query: '',
    error: undefined,
    suggestions: [],
    showSuggestions: false,
    showImage: true,
    noResults: false,
    isLoading: false,
    fetchError: undefined,
    onChangeText: jest.fn(),
    onSelectSuggestion: jest.fn(),
    onPressGetStarted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLookingForItem.mockReturnValue(baseHookState);
  });

  it('renders title and handles back and next actions', () => {
    const { getByText } = render(<LookingForItem />);

    fireEvent.press(getByText('Back'));
    fireEvent.press(getByText('lookingForFlow.item.getStarted'));

    expect(mockGoBack).toHaveBeenCalled();
    expect(baseHookState.onPressGetStarted).toHaveBeenCalled();
  });

  it('shows loader while fetching', () => {
    mockUseLookingForItem.mockReturnValue({
      ...baseHookState,
      isLoading: true,
      showImage: false,
    });

    const { UNSAFE_getByType } = render(<LookingForItem />);
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });

  it('renders suggestions and handles suggestion press', () => {
    mockUseLookingForItem.mockReturnValue({
      ...baseHookState,
      query: 'dr',
      showSuggestions: true,
      showImage: false,
      suggestions: ['Driver', 'Drummer'],
    });

    const { getByText } = render(<LookingForItem />);

    fireEvent.press(getByText('Driver'));

    expect(baseHookState.onSelectSuggestion).toHaveBeenCalledWith('Driver');
  });

  it('shows no-result message from fetch error', () => {
    mockUseLookingForItem.mockReturnValue({
      ...baseHookState,
      query: 'x',
      showSuggestions: true,
      noResults: true,
      showImage: false,
      fetchError: 'No items from api',
    });

    const { getByText } = render(<LookingForItem />);

    expect(getByText('No items from api')).toBeTruthy();
  });
});
