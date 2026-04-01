import React from 'react';
import { Pressable, Image, ImageBackground, Text, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ONBOARDING_LOGO, OnboardingItem } from '../../../screens/Onboarding/data';
import { onboardingStyles } from '../../../screens/Onboarding/styles';
import { palette } from '../../../constants/colors';
import { OnboardingButton } from './OnboardingButton';
import { OnboardingDots } from './OnboardingDots';
import { useTranslation } from 'react-i18next';

interface OnboardingSlideProps {
  item: OnboardingItem;
  insets: EdgeInsets;
  totalSlides: number;
  currentIndex: number;
  onPressButton: () => void;
  onSkip: () => void;
}

export function OnboardingSlide({
  item,
  insets,
  totalSlides,
  currentIndex,
  onPressButton,
  onSkip,
}: OnboardingSlideProps) {
  const { t } = useTranslation();
  const isLastSlide = currentIndex === totalSlides - 1;
  return (
    <ImageBackground
      source={item.image}
      style={onboardingStyles.slide}
      imageStyle={onboardingStyles.image}
    >
      <View style={onboardingStyles.gradientContainer} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="onboardingGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.blackPure} stopOpacity="0" />
              <Stop offset="1" stopColor={palette.blackPure} stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#onboardingGradient)"
          />
        </Svg>
      </View>

      <View
        style={[
          onboardingStyles.logoContainer,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <Image source={ONBOARDING_LOGO} style={onboardingStyles.logo} />
      </View>

      <View style={{ flex: 1 }} />

      <View
        style={[
          onboardingStyles.contentContainer,
          { paddingBottom: insets.bottom + 34 },
        ]}
      >
        <Text style={onboardingStyles.title}>{t(item.title)}</Text>
        <Text style={onboardingStyles.subtitle}>{t(item.subtitle)}</Text>
        <View style={onboardingStyles.bottomRow}>
          <OnboardingButton
            onPress={onPressButton}
            title={t('onboarding.getStarted')}
          />
          <OnboardingDots total={totalSlides} activeIndex={currentIndex} />
        </View>
      </View>
    </ImageBackground>
  );
}
