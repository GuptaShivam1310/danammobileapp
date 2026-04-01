import React from 'react';
import { Pressable, Text } from 'react-native';
import { onboardingStyles } from '../../../screens/Onboarding/styles';

interface OnboardingButtonProps {
  onPress: () => void;
  title: string;
}

export function OnboardingButton({ onPress, title }: OnboardingButtonProps) {
  return (
    <Pressable onPress={onPress} style={onboardingStyles.button}>
      <Text style={onboardingStyles.buttonText}>{title}</Text>
    </Pressable>
  );
}
