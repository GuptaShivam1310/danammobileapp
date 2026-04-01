import { useCallback, useMemo, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { AppImages } from '../../assets/images';

export type SeekerLandingStepId =
  | 'post_browse_contributions'
  | 'express_interest'
  | 'get_connected'
  | 'identify_right_seeker'
  | 'share_experience';

export interface SeekerLandingStep {
  id: SeekerLandingStepId;
  titleKey: string;
  subtitleKey: string;
  icon: ImageSourcePropType;
}

interface UseSeekerLandingHookResult {
  steps: SeekerLandingStep[];
  activeStepId: SeekerLandingStepId | null;
  onPressStep: (stepId: SeekerLandingStepId) => void;
  onPressLogout: () => Promise<void>;
}

const DASHBOARD_STEPS: SeekerLandingStep[] = [
  {
    id: 'post_browse_contributions',
    titleKey: 'seekerDashboard.steps.postBrowseContributions.title',
    subtitleKey: 'seekerDashboard.steps.postBrowseContributions.subtitle',
    icon: AppImages.splashIcon,
  },
  {
    id: 'express_interest',
    titleKey: 'seekerDashboard.steps.expressInterest.title',
    subtitleKey: 'seekerDashboard.steps.expressInterest.subtitle',
    icon: AppImages.splashIcon,
  },
  {
    id: 'get_connected',
    titleKey: 'seekerDashboard.steps.getConnected.title',
    subtitleKey: 'seekerDashboard.steps.getConnected.subtitle',
    icon: AppImages.splashIcon,
  },
  {
    id: 'identify_right_seeker',
    titleKey: 'seekerDashboard.steps.identifyRightSeeker.title',
    subtitleKey: 'seekerDashboard.steps.identifyRightSeeker.subtitle',
    icon: AppImages.splashIcon,
  },
  {
    id: 'share_experience',
    titleKey: 'seekerDashboard.steps.shareExperience.title',
    subtitleKey: 'seekerDashboard.steps.shareExperience.subtitle',
    icon: AppImages.splashIcon,
  },
];

export function useSeekerLandingHook(): UseSeekerLandingHookResult {
  const dispatch = useAppDispatch();
  const [activeStepId, setActiveStepId] = useState<SeekerLandingStepId | null>(null);

  const steps = useMemo(() => DASHBOARD_STEPS, []);

  const onPressStep = useCallback((stepId: SeekerLandingStepId) => {
    const isStepValid = steps.some(step => step.id === stepId);
    if (!isStepValid) {
      return;
    }
    setActiveStepId(stepId);
  }, [steps]);

  const onPressLogout = useCallback(async () => {
    await dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  return {
    steps,
    activeStepId,
    onPressStep,
    onPressLogout,
  };
}
