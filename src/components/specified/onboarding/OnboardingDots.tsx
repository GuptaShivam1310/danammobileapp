import React from 'react';
import { DeviceEventEmitter, Pressable, View } from 'react-native';
import { onboardingStyles } from '../../../screens/Onboarding/styles';

interface OnboardingDotsProps {
  total: number;
  activeIndex: number;
}

export function OnboardingDots({ total, activeIndex }: OnboardingDotsProps) {
  return (
    <View style={onboardingStyles.dotsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <Pressable
          testID={`dot-${index}`}
          key={`dot-${index}`}
          onPress={() => DeviceEventEmitter.emit('onboarding_dot_press', index)}
          hitSlop={10}
          style={[
            onboardingStyles.dot,
            index === 0 ? { marginLeft: 0 } : null,
            activeIndex === index ? onboardingStyles.dotActive : null,
          ]}
        />
      ))}
    </View>
  );
}
