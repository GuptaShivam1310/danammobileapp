import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { setStorageItem } from '../../src/storage/asyncStorage';
import { LookingForDoYou } from '../../src/screens/LookingForDoYou/LookingForDoYou';
import { ROUTES } from '../../src/constants/routes';
import { STORAGE_KEYS } from '../../src/constants/storageKeys';
import { seekerPreferencesService } from '../../src/services/seekerPreferencesService';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Pressable: createPrimitive('Pressable'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
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
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios,
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

jest.mock('../../src/storage/asyncStorage', () => ({
  setStorageItem: jest.fn(),
}));

jest.mock('../../src/services/seekerPreferencesService', () => ({
  seekerPreferencesService: {
    savePreferences: jest.fn(),
  },
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
        'lookingForFlow.doYou.title': 'How do you know about us?',
        'lookingForFlow.common.findItems': 'Next',
        'lookingForFlow.common.next': 'Next',
        'lookingForFlow.doYou.empty': 'No item found',
        'lookingForFlow.doYou.errors.required': 'Please select one option',
        'errors.generic': 'errors.generic',
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
const mockedSetStorageItem = setStorageItem as jest.Mock;
const mockedSavePreferences = seekerPreferencesService.savePreferences as jest.Mock;

describe('LookingForDoYou', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({ navigate: jest.fn() });
    mockedUseRoute.mockReturnValue({
      params: {
        item: 'Driver',
        gender: 'Male',
        dob: '01/01/2000',
        profession: 'Architect',
        reason: 'Need help for work resources',
      },
    });
    mockedSavePreferences.mockResolvedValue({ success: true });
  });

  it('shows list empty component when api returns empty list', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookDoYou: { options: [] }, seekerPreferences: { preferences: {} } }),
    );

    const { getByText } = render(<LookingForDoYou />);

    await waitFor(() => {
      expect(getByText('No item found')).toBeTruthy();
    });
  });

  it('stores flow data and navigates to seeker dashboard on next', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({
        seekerLookDoYou: { options: [{ id: 1, title: 'Social Media' }] },
        seekerPreferences: { preferences: {} },
      }),
    );

    const navigation = mockedUseNavigation();
    const { getByText } = render(<LookingForDoYou />);

    await waitFor(() => {
      expect(getByText('Social Media')).toBeTruthy();
    });

    fireEvent.press(getByText('Social Media'));
    fireEvent.press(getByText('Next'));

    await waitFor(() => {
      expect(mockedSetStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.LOOKING_FOR_FLOW_DATA, {
        item: 'Driver',
        gender: 'Male',
        dob: '01/01/2000',
        profession: 'Architect',
        reason: 'Need help for work resources',
        awarenessSource: 'Social Media',
      });
      expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.SEEKER_BOTTOM_TABS);
    });
  });

  it('shows validation error if next is pressed without selection', async () => {
    const unwrap = jest.fn().mockResolvedValue(undefined);
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({
        seekerLookDoYou: { options: [{ id: 1, title: 'Social Media' }] },
        seekerPreferences: { preferences: {} },
      }),
    );

    const { getByText, findByText } = render(<LookingForDoYou />);

    fireEvent.press(getByText('Next'));

    expect(await findByText('Please select one option')).toBeTruthy();
  });

  it('shows toast on api error', async () => {
    const unwrap = jest.fn().mockRejectedValue({
      response: { data: { message: 'Invalid request parameters. Please check the request and try again.' } },
    });
    mockedUseAppDispatch.mockReturnValue(jest.fn().mockReturnValue({ unwrap }));
    mockedUseAppSelector.mockImplementation(selector =>
      selector({ seekerLookDoYou: { options: [] }, seekerPreferences: { preferences: {} } }),
    );

    render(<LookingForDoYou />);

    await waitFor(() => {
      expect(mockedToastShow).toHaveBeenCalledWith({
        type: 'error',
        text1: 'errors.generic',
        text2: 'Invalid request parameters. Please check the request and try again.',
      });
    });
  });
});
