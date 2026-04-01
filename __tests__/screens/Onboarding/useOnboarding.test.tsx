import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '../../../src/screens/Onboarding/useOnboarding';
import { setOnboardingSeen } from '../../../src/store/slices/settingsSlice';
import { ONBOARDING_STORAGE_KEY } from '../../../src/screens/Onboarding/data';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => jest.fn(),
}));

jest.mock('../../../src/store/slices/settingsSlice', () => ({
  setOnboardingSeen: jest.fn(),
}));

describe('useOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with current index 0', () => {
    const flatListRef = { current: { scrollToIndex: jest.fn() } };
    const navigation = { navigate: jest.fn() };
    const { result } = renderHook(() =>
      useOnboarding({
        totalSlides: 3,
        flatListRef: flatListRef as any,
        navigation: navigation as any,
      }),
    );
    expect(result.current.currentIndex).toBe(0);
  });

  it('handleMomentumScrollEnd updates current index', () => {
    const navigation = { navigate: jest.fn() };
    const { result } = renderHook(() =>
      useOnboarding({
        totalSlides: 3,
        flatListRef: { current: null } as any,
        navigation: navigation as any,
      }),
    );
    act(() => {
      result.current.handleMomentumScrollEnd({
        nativeEvent: { contentOffset: { x: 300 }, layoutMeasurement: { width: 100 } },
      } as any);
    });
    expect(result.current.currentIndex).toBe(3);
  });

  it('goToIndex scrolls and sets index if within valid range', () => {
    const mockScrollToIndex = jest.fn();
    const flatListRef = { current: { scrollToIndex: mockScrollToIndex } };
    const navigation = { navigate: jest.fn() };

    const { result } = renderHook(() =>
      useOnboarding({
        totalSlides: 3,
        flatListRef: flatListRef as any,
        navigation: navigation as any,
      }),
    );

    act(() => { result.current.goToIndex(1); });
    expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 1, animated: true });
    expect(result.current.currentIndex).toBe(1);

    // out of bounds > totalSlides - 1
    act(() => { result.current.goToIndex(3); });
    expect(result.current.currentIndex).toBe(1); // unchanged
    
    // out of bounds < 0
    act(() => { result.current.goToIndex(-1); });
    expect(result.current.currentIndex).toBe(1); // unchanged
  });

  it('scrollToNext advances or completes onboarding', async () => {
    const mockScrollToIndex = jest.fn();
    const flatListRef = { current: { scrollToIndex: mockScrollToIndex } };
    const navigation = { navigate: jest.fn() };

    const { result } = renderHook(() =>
      useOnboarding({
        totalSlides: 2,
        flatListRef: flatListRef as any,
        navigation: navigation as any,
      }),
    );

    await act(async () => { await result.current.scrollToNext(); });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_STORAGE_KEY, 'true');
    expect(setOnboardingSeen).toHaveBeenCalledWith(true);
  });
});
