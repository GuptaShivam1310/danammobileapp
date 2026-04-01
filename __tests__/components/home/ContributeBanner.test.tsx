import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

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
    Image: createPrimitive('Image'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: {},
    },
  })),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'home.contributeTitle': `LET'S SUPPORT NEEDED`,
        'home.contributeHighlight': 'Your support can be a ray of sunshine',
        'home.contributeButton': 'Contribute',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('react-native-elements/dist/helpers', () => ({
  ScreenWidth: 390,
}));

import { ContributeBanner } from '../../../src/components/specified/home/ContributeBanner';

describe('ContributeBanner', () => {
  it('renders default content and calls onPress', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <ContributeBanner onPress={onPress} />,
    );

    expect(getByTestId('contribute-banner')).toBeTruthy();
    expect(getByText(`LET'S SUPPORT NEEDED`)).toBeTruthy();
    expect(getByText('Your support can be a ray of sunshine')).toBeTruthy();
    expect(getByText('Contribute')).toBeTruthy();

    fireEvent.press(getByTestId('contribute-button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders custom testID/title/button text', () => {
    const { getByTestId, getByText } = render(
      <ContributeBanner
        testID="custom-banner"
        buttonText="Donate"
      />,
    );

    expect(getByTestId('custom-banner')).toBeTruthy();
    expect(getByText(`LET'S SUPPORT NEEDED`)).toBeTruthy();
    expect(getByText('Donate')).toBeTruthy();
  });
});
