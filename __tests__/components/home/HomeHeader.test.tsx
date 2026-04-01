import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { HomeHeader } from '../../../src/components/specified/home/HomeHeader';
import { useTheme } from '../../../src/theme';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'home.title': 'Discover Items',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('../../../src/components/common/SvgIcon', () => {
  const ReactLib = require('react');

  return {
    SvgIcon: ({ testID = 'svg-icon' }: any) =>
      ReactLib.createElement('View', { testID }),
  };
});

const mockedUseTheme = useTheme as jest.Mock;
const DummyIcon = () => null;

describe('HomeHeader', () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          background: '#fff',
          text: '#111',
          border: '#ddd',
          cardBackground: '#fafafa',
          seekerImpactDotActive: '#e5e7eb',
        },
      },
    });
  });

  it('renders default title and no notification dot by default', () => {
    const { getByText, getByTestId, queryByTestId } = render(<HomeHeader />);

    expect(getByTestId('home-header')).toBeTruthy();
    expect(getByText('Discover Items')).toBeTruthy();
    expect(queryByTestId('notification-dot')).toBeNull();
  });

  it('renders custom title, icon, and notification dot and handles press', () => {
    const onNotificationPress = jest.fn();

    const { getByText, getByTestId } = render(
      <HomeHeader
        title="My Home"
        showNotificationDot
        onNotificationPress={onNotificationPress}
        notificationIcon={DummyIcon}
      />,
    );

    fireEvent.press(getByTestId('notification-icon'));

    expect(getByText('My Home')).toBeTruthy();
    expect(getByTestId('notification-dot')).toBeTruthy();
    expect(getByTestId('svg-icon')).toBeTruthy();
    expect(onNotificationPress).toHaveBeenCalled();
  });

  it('uses fallback colors when theme keys are missing', () => {
    mockedUseTheme.mockReturnValueOnce({
      theme: {
        colors: {
          seekerImpactDotActive: '#ccc',
        },
      },
    });

    const { getByTestId, getByText } = render(<HomeHeader title="Fallback" />);
    expect(getByTestId('home-header')).toBeTruthy();
    expect(getByText('Fallback')).toBeTruthy();
  });
});
