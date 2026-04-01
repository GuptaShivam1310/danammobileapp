import { ImageSourcePropType } from 'react-native';
import Images from '../../assets/images';

export interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_STORAGE_KEY = 'HAS_SEEN_ONBOARDING';

export const ONBOARDING_LOGO = Images.logo;

export const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: 'onboarding-1',
    title: 'onboarding.slide1Title',
    subtitle: 'onboarding.slide1Subtitle',
    image: Images.onboarding1,
  },
  {
    id: 'onboarding-2',
    title: 'onboarding.slide2Title',
    subtitle: 'onboarding.slide2Subtitle',
    image: Images.onboarding2,
  },
  {
    id: 'onboarding-3',
    title: 'onboarding.slide3Title',
    subtitle: 'onboarding.slide3Subtitle',
    image: Images.onboarding3,
  },
];
