// import '@testing-library/jest-native/extend-expect';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native/Libraries/Image/Image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => <View {...props} />;
});

// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {},
    useSharedValue: val => ({ value: val }),
    useAnimatedStyle: () => ({}),
    withTiming: val => val,
    withSpring: val => val,
    runOnJS: fn => fn,
    Easing: { bezier: () => ({}), linear: () => ({}) },
  };
});

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    use: () => ({ init: () => {} }),
    t: key => key,
    changeLanguage: () => Promise.resolve(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { changeLanguage: () => new Promise(() => {}) } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

jest.mock('react-native-elements/dist/helpers', () => ({
  ScreenHeight: 800,
  ScreenWidth: 400,
}));
