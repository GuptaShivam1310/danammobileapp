import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SearchBar } from '../../../src/components/common/SearchBar';

describe('SearchBar', () => {
  it('renders and calls onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar
        value="hello"
        onChangeText={onChangeText}
        placeholder="Search"
        testID="search-input"
      />
    );

    const input = getByPlaceholderText('Search');
    fireEvent.changeText(input, 'new value');
    expect(onChangeText).toHaveBeenCalledWith('new value');
  });
});
