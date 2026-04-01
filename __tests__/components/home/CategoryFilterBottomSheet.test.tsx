import React from 'react';
import { render } from '@testing-library/react-native';
import { CategoryFilterBottomSheet } from '../../../src/components/specified/home/CategoryFilterBottomSheet';
import { useTheme } from '../../../src/theme';
import { palette } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'selectCategory.filterTitle': 'Categories',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

const mockedSelectCategoryContent = jest.fn(() => null);
jest.mock('../../../src/screens/SelectCategory/SelectCategoryContent', () => ({
  SelectCategoryContent: (props: any) => mockedSelectCategoryContent(props),
}));

const mockedAppBottomSheet = jest.fn(({ children }: any) => {
  const ReactLib = require('react');
  return ReactLib.createElement(ReactLib.Fragment, null, children);
});
jest.mock('../../../src/components/common/AppBottomSheet', () => ({
  AppBottomSheet: (props: any) => mockedAppBottomSheet(props),
}));

const mockedUseTheme = useTheme as jest.Mock;

describe('CategoryFilterBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          background: '#ffffff',
          text: '#111111',
        },
      },
    });
  });

  it('renders header and passes props to SelectCategoryContent', () => {
    const onClose = jest.fn();
    const onSelectCategory = jest.fn();

    const { getByText } = render(
      <CategoryFilterBottomSheet
        isVisible
        categories={[
          { id: '1', name: 'Electronics', icon: 'icon', bgColor: '#fff' },
        ]}
        selectedCategoryId="1"
        isLoading={false}
        error={null}
        onSelectCategory={onSelectCategory}
        onClose={onClose}
      />,
    );

    expect(getByText('Categories')).toBeTruthy();
    expect(mockedAppBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        onClose,
      }),
    );
    expect(mockedSelectCategoryContent).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [{ id: '1', name: 'Electronics', icon: 'icon', bgColor: '#fff' }],
        selectedCategoryId: '1',
        isLoading: false,
        error: null,
        onCategoryPress: expect.any(Function),
      }),
    );
  });

  it('uses palette overlay color when theme values are missing', () => {
    mockedUseTheme.mockReturnValueOnce({
      theme: {
        colors: {},
      },
    });

    render(
      <CategoryFilterBottomSheet
        isVisible
        categories={[]}
        selectedCategoryId={null}
        isLoading={false}
        error={null}
        onSelectCategory={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(mockedAppBottomSheet).toHaveBeenCalledWith(
      expect.objectContaining({
        overlayStyle: expect.arrayContaining([
          expect.objectContaining({ backgroundColor: palette.homeFilterOverlay }),
        ]),
      }),
    );
  });

  it('forwards selected category from content press handler', () => {
    const onSelectCategory = jest.fn();
    render(
      <CategoryFilterBottomSheet
        isVisible
        categories={[
          { id: '1', name: 'Electronics', icon: 'icon', bgColor: '#fff' },
        ]}
        selectedCategoryId="1"
        isLoading={false}
        error={null}
        onSelectCategory={onSelectCategory}
        onClose={jest.fn()}
      />,
    );

    const props = mockedSelectCategoryContent.mock.calls[0][0];
    props.onCategoryPress({ id: '2', name: 'Books' });
    expect(onSelectCategory).toHaveBeenCalledWith({ id: '2', name: 'Books' });
  });
});
