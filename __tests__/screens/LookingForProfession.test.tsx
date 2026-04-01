import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { LookingForProfession } from '../../src/screens/LookingForProfession/LookingForProfession';
import { ROUTES } from '../../src/constants/routes';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Pressable: createPrimitive('Pressable'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    Platform: {
      OS: 'ios',
      select: (options: Record<string, unknown>) => options.ios,
    },
    FlatList: ({ data = [], renderItem, ListEmptyComponent, contentContainerStyle }: any) => {
      const children =
        data.length > 0
          ? data.map((item: any, index: number) =>
              ReactLib.createElement(ReactLib.Fragment, { key: index }, renderItem({ item, index })),
            )
          : ListEmptyComponent || null;
      return ReactLib.createElement('View', { contentContainerStyle }, children);
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    PixelRatio: {
      roundToNearestPixel: (value: number) => value,
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../src/hooks/useGoBack', () => ({
  useGoBack: () => jest.fn(),
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../src/components/common/Header', () => ({
  Header: () => null,
}));

jest.mock('../../src/components/common/AppTitle', () => ({
  AppTitle: ({ text }: { text: string }) => {
    const ReactLib = require('react');
    return ReactLib.createElement('Text', null, text);
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: { title: string; onPress: () => void }) => {
    const ReactLib = require('react');
    return ReactLib.createElement(
      'Pressable',
      { onPress },
      ReactLib.createElement('Text', { onPress }, title),
    );
  },
}));

jest.mock('../../src/components/common/AppRadio', () => ({
  AppRadio: ({ title, onPress }: { title: string; onPress: () => void }) => {
    const ReactLib = require('react');
    return ReactLib.createElement(
      'Pressable',
      { onPress },
      ReactLib.createElement('Text', { onPress }, title),
    );
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'lookingForFlow.profession.empty': 'No Profession found',
        'lookingForFlow.common.next': 'Next',
        'errors.generic': 'Something went wrong',
        'errors.genericTryAgain': 'Please try again',
      };
      return map[key] ?? key;
    },
  }),
}));

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedUseRoute = useRoute as jest.Mock;
const mockedUseAppDispatch = useAppDispatch as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;
const mockedToastShow = Toast.show as jest.Mock;

describe('LookingForProfession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({ navigate: jest.fn() });
    mockedUseRoute.mockReturnValue({
      params: {
        item: 'Driver',
        gender: 'Male',
        dob: '01/01/2000',
      },
    });
  });

  it('shows list empty component when api returns empty list', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookProfession: { professions: [] } }),
    );

    const { getByText } = render(<LookingForProfession />);

    await waitFor(() => {
      expect(getByText('No Profession found')).toBeTruthy();
    });
  });

  it('navigates to SelectLocation when profession selected and next pressed', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookProfession: { professions: [{ id: 1, title: 'Architect' }] } }),
    );

    const navigation = mockedUseNavigation();
    const { getByText } = render(<LookingForProfession />);

    await waitFor(() => {
      expect(getByText('Architect')).toBeTruthy();
    });

    fireEvent.press(getByText('Architect'));
    fireEvent.press(getByText('Next'));

    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.SELECT_LOCATION, {
      item: 'Driver',
      gender: 'Male',
      dob: '01/01/2000',
      profession: 'Architect',
    });
  });

  it('shows validation error if next is pressed without selecting profession', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookProfession: { professions: [{ id: 1, title: 'Architect' }] } }),
    );

    const { getByText, findByText } = render(<LookingForProfession />);
    await waitFor(() => {
      expect(getByText('Architect')).toBeTruthy();
    });

    fireEvent.press(getByText('Next'));

    expect(await findByText('Profession is required')).toBeTruthy();
  });

  it('shows toast on api error', async () => {
    const unwrap = jest.fn().mockRejectedValue({
      response: { data: { message: 'The requested resource /api/lookfor/profession was not found.' } },
    });
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookProfession: { professions: [] } }),
    );

    render(<LookingForProfession />);

    await waitFor(() => {
      expect(mockedToastShow).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'The requested resource /api/lookfor/profession was not found.',
      });
    });
  });
});
