import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { ONBOARDING_DATA } from '../../src/screens/Onboarding/data';
import { useOnboarding } from '../../src/screens/Onboarding/useOnboarding';
import { OnboardingScreen } from '../../src/screens/Onboarding/OnboardingScreen';

jest.mock('react-native', () => {
  const ReactLib = require('react');

  const createPrimitive =
    (name: string) =>
      ({ children, ...props }: { children?: React.ReactNode }) =>
        ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Pressable: createPrimitive('Pressable'),
    FlatList: ({
      data,
      renderItem,
      keyExtractor,
      onScrollToIndexFailed,
      onMomentumScrollEnd,
      testID,
    }: {
      data: Array<any>;
      renderItem: (arg: { item: any; index: number }) => React.ReactNode;
      keyExtractor?: any;
      onScrollToIndexFailed?: any;
      onMomentumScrollEnd?: any;
      testID?: string;
    }) =>
      ReactLib.createElement(
        'View',
        { testID, keyExtractor, onScrollToIndexFailed, onMomentumScrollEnd },
        data.map((item, index) =>
          ReactLib.createElement('View', { key: item.id ?? String(index) }, renderItem({ item, index })),
        ),
      ),
    useWindowDimensions: () => ({ width: 375, height: 812, scale: 2, fontScale: 2 }),
    DeviceEventEmitter: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      emit: jest.fn(),
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    logo: { uri: 'mock-logo' },
    onboarding1: { uri: 'mock-onboarding-1' },
    onboarding2: { uri: 'mock-onboarding-2' },
    onboarding3: { uri: 'mock-onboarding-3' },
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../src/screens/Onboarding/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

jest.mock('../../src/components/specified/onboarding/OnboardingSlide', () => {
  const ReactLib = require('react');
  const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');

  return {
    OnboardingSlide: ({ item, onPressButton, onSkip, totalSlides }: { item: { id: string; title: string; subtitle: string }; onPressButton: () => void; onSkip: () => void; totalSlides: number }) => {
      const isLastSlide = item.id === `onboarding-${totalSlides}`;

      return (
        <RNView>
          <RNText>{item.title}</RNText>
          <RNText>{item.subtitle}</RNText>
          <RNPressable testID={`onboarding-next-${item.id}`} onPress={onPressButton}>
            <RNText>{isLastSlide ? 'Get Started' : 'Next'}</RNText>
          </RNPressable>
          <RNPressable
            testID={`onboarding-skip-${item.id}`}
            onPress={onSkip}
          >
            <RNText>Skip</RNText>
          </RNPressable>
        </RNView>
      );
    },
  };
});

const mockedUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockedUseOnboarding = useOnboarding as jest.MockedFunction<typeof useOnboarding>;

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockScrollToNext = jest.fn();
const mockGoToIndex = jest.fn();
const mockHandleMomentumScrollEnd = jest.fn();
const mockCompleteOnboarding = jest.fn();

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      reset: mockReset,
    } as any);

    mockedUseOnboarding.mockReturnValue({
      currentIndex: 0,
      handleMomentumScrollEnd: mockHandleMomentumScrollEnd,
      goToIndex: mockGoToIndex,
      scrollToNext: mockScrollToNext,
      completeOnboarding: mockCompleteOnboarding,
    });
  });

  it('renders onboarding screen successfully', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('onboarding-flatlist')).toBeTruthy();
  });

  it('renders all onboarding slide title and description content', () => {
    const { getByText } = render(<OnboardingScreen />);
    ONBOARDING_DATA.forEach(slide => {
      expect(getByText(slide.title)).toBeTruthy();
      expect(getByText(slide.subtitle)).toBeTruthy();
    });
  });

  it('next button moves to next slide', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    fireEvent.press(getByTestId('onboarding-next-onboarding-1'));
    expect(mockScrollToNext).toHaveBeenCalledTimes(1);
  });

  it('skip button calls completeOnboarding', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    fireEvent.press(getByTestId('onboarding-skip-onboarding-1'));
    expect(mockCompleteOnboarding).toHaveBeenCalled();
  });
  
  it('covers flatlist internal props', () => {
    const { getByTestId, root } = render(<OnboardingScreen />);
    const flatList = getByTestId('onboarding-flatlist');
    
    // Test keyExtractor
    expect(flatList.props.keyExtractor(ONBOARDING_DATA[0])).toBe(ONBOARDING_DATA[0].id);

    // Test onMomentumScrollEnd
    flatList.props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 300 }, layoutMeasurement: { width: 100 } } });
    expect(mockHandleMomentumScrollEnd).toHaveBeenCalled();
    
    // Simulate scroll to index failed
    flatList.props.onScrollToIndexFailed({ index: 1, highestMeasuredFrameIndex: 0, averageItemLength: 100 });
  });

  it('listens to dot press event', () => {
      const { DeviceEventEmitter } = require('react-native');
      render(<OnboardingScreen />);
      
      const listener = DeviceEventEmitter.addListener.mock.calls[0][1];
      listener(2);
      expect(mockGoToIndex).toHaveBeenCalledWith(2);
  });
});

