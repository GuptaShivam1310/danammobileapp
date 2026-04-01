import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FlatList, TextInput, TouchableOpacity } from 'react-native';
import { CountryCodeModal } from '../../../src/components/common/CountryCodeModal';
import { COUNTRY_CODES } from '../../../src/constants/countryCodes';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    Modal: createPrimitive('Modal'),
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
    TextInput: createPrimitive('TextInput'),
    FlatList: ({ data, renderItem, ListEmptyComponent }: any) => {
      if (!data || data.length === 0) {
        return ReactLib.createElement('FlatList', null, ListEmptyComponent ?? null);
      }
      return ReactLib.createElement(
        'FlatList',
        null,
        data.map((item: any, index: number) =>
          ReactLib.createElement(
            ReactLib.Fragment,
            { key: item?.code ?? index },
            renderItem({ item, index })
          )
        )
      );
    },
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('lodash', () => ({
  toLower: (val: string) => (val ?? '').toLowerCase(),
  includes: (str: string, query: string) => (str ?? '').includes(query),
  get: (obj: any, path: string, def: string) => (obj && obj[path] != null ? obj[path] : def),
  debounce: (fn: any) => fn,
}));

describe('CountryCodeModal', () => {
  it('renders list, filters by search, and selects item', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const { getByText, UNSAFE_getByType, getAllByText, UNSAFE_getAllByType } = render(
      <CountryCodeModal isVisible onClose={onClose} onSelect={onSelect} />
    );

    expect(getByText('signup.selectCountryCode')).toBeTruthy();

    const input = UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, 'India');

    expect(getByText('India')).toBeTruthy();
    expect(getAllByText('(IN)').length).toBeGreaterThan(0);

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[1]);
    expect(onSelect).toHaveBeenCalledWith(COUNTRY_CODES[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no country matches', () => {
    const { getByText, UNSAFE_getByType } = render(
      <CountryCodeModal isVisible onClose={jest.fn()} onSelect={jest.fn()} />
    );

    const input = UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, 'zzzz');

    expect(getByText('No countries found')).toBeTruthy();
  });
});
