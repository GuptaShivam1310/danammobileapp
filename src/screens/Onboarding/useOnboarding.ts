import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../store';
import { setOnboardingSeen } from '../../store/slices/settingsSlice';
import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';
import { OnboardingItem, ONBOARDING_STORAGE_KEY } from './data';

interface UseOnboardingProps {
  totalSlides: number;
  flatListRef: RefObject<FlatList<OnboardingItem> | null>;
  navigation: NativeStackNavigationProp<RootStackParamList, typeof ROUTES.ONBOARDING>;
}

export function useOnboarding({ totalSlides, flatListRef, navigation }: UseOnboardingProps) {
  const dispatch = useAppDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
      );
      setCurrentIndex(nextIndex);
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    dispatch(setOnboardingSeen(true));
    // Navigate directly to login screen
    navigation.navigate(ROUTES.LOGIN as any);
  }, [dispatch, navigation]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index > totalSlides - 1) {
        return;
      }

      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
    },
    [flatListRef, totalSlides],
  );

  const scrollToNext = useCallback(async () => {
    // Navigate to Login directly from any slide when clicking Get Started
    await completeOnboarding();
  }, [completeOnboarding]);

  return {
    currentIndex,
    handleMomentumScrollEnd,
    goToIndex,
    scrollToNext,
    completeOnboarding,
  };
}
