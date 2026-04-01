import React from 'react';
import { render } from '@testing-library/react-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { ScreenWrapper } from '../../../src/components/common/ScreenWrapper';
import { useTheme } from '../../../src/theme';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    Platform: { OS: 'ios' },
    KeyboardAvoidingView: createPrimitive('KeyboardAvoidingView'),
    ScrollView: createPrimitive('ScrollView'),
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('SafeAreaView', props, children);
  },
}));

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

describe('ScreenWrapper', () => {
  it('renders scrollable content with padding variants', () => {
    const { getByText, getByTestId, UNSAFE_getByType } = render(
      <ScreenWrapper
        scrollable
        withBottomTab
        noPadding
        testID="screen-wrapper"
        contentStyle={{ marginTop: 12 }}
      >
        <Text>Scrollable</Text>
      </ScreenWrapper>
    );

    expect(getByText('Scrollable')).toBeTruthy();

    const safeArea = getByTestId('screen-wrapper');
    const safeAreaStyle = flattenStyle(safeArea.props.style);
    const { theme } = useTheme();
    expect(safeAreaStyle.backgroundColor).toBe(theme.colors.background);

    const scrollView = UNSAFE_getByType(ScrollView);
    const contentStyle = flattenStyle(scrollView.props.contentContainerStyle);
    expect(contentStyle.paddingBottom).toBeGreaterThan(0);
    expect(contentStyle.padding).toBe(0);
    expect(contentStyle.marginTop).toBe(12);
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('renders non-scrollable content and uses non-ios behavior', () => {
    (Platform as any).OS = 'android';
    const { getByText, UNSAFE_getByType } = render(
      <ScreenWrapper>
        <Text>Static</Text>
      </ScreenWrapper>
    );

    expect(getByText('Static')).toBeTruthy();

    const kav = UNSAFE_getByType(KeyboardAvoidingView);
    expect(kav.props.behavior).toBeUndefined();
  });
});
