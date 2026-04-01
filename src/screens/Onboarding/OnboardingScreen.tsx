import React, { useEffect, useRef } from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';
import { ONBOARDING_DATA, OnboardingItem } from './data';
import { useOnboarding } from './useOnboarding';
import { OnboardingSlide } from '../../components/specified/onboarding/OnboardingSlide';


type OnboardingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.ONBOARDING
>;

export function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);

  const { currentIndex, handleMomentumScrollEnd, scrollToNext, goToIndex, completeOnboarding } = useOnboarding({
    totalSlides: ONBOARDING_DATA.length,
    flatListRef,
    navigation,
  });

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onboarding_dot_press',
      (index: number) => {
        goToIndex(index);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [goToIndex]);

  const getItemLayout = (_: ArrayLike<OnboardingItem> | null | undefined, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const safeOffset = width * Math.max(0, info.index);

    flatListRef.current?.scrollToOffset({ offset: safeOffset, animated: true });
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 120);
  };

  return (
    <FlatList
      testID="onboarding-flatlist"
      ref={flatListRef}
      data={ONBOARDING_DATA}
      keyExtractor={item => item.id}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      horizontal
      pagingEnabled
      bounces={false}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }: ListRenderItemInfo<OnboardingItem>) => (
        <OnboardingSlide
          item={item}
          insets={insets}
          totalSlides={ONBOARDING_DATA.length}
          currentIndex={currentIndex}
          onPressButton={scrollToNext}
          onSkip={completeOnboarding}
        />
      )}
      onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) =>
        handleMomentumScrollEnd(event)
      }
    />
  );
}
