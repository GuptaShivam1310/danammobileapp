import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSeekerLookDoYouOptions } from '../../store/slices/seekerLookDoYouSlice';

import { setReferralSource } from '../../store/slices/seekerPreferencesSlice';
import { seekerPreferencesService } from '../../services/seekerPreferencesService';
import { updateIsPreferencesSaved } from '../../store/slices/authSlice';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import { setStorageItem } from '../../storage/asyncStorage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

type LookingForDoYouNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_DO_YOU
>;

export function useLookingForDoYou() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LookingForDoYouNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.LOOKING_FOR_DO_YOU>>();
  const { t } = useTranslation();
  const { options: remoteOptions } = useAppSelector(
    state => state.seekerLookDoYou,
  );
  const { preferences } = useAppSelector(state => state.seekerPreferences) || { preferences: {} as any };

  const options = useMemo(
    () => remoteOptions.map((entry: { title: string }) => entry.title).filter(Boolean),
    [remoteOptions],
  );

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDoYouOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(fetchSeekerLookDoYouOptions()).unwrap();
    } catch (err) {
      showErrorToast(t('errors.generic'), (err as any)?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, t]);

  useEffect(() => {
    if (remoteOptions.length === 0) {
      fetchDoYouOptions();
    }
  }, [fetchDoYouOptions, remoteOptions.length]);

  const handleSelectOption = useCallback((option: string) => {
    setSelectedOption(option);
    if (error) {
      setError(null);
    }
  }, [error]);

  const handlePressNext = useCallback(async () => {
    if (!selectedOption) {
      setError(t('lookingForFlow.doYou.errors.required'));
      return;
    }

    setIsLoading(true);
    try {
      const selectedOptionObj = remoteOptions.find(opt => opt.title === selectedOption);
      const referralSource = selectedOptionObj?.id || selectedOption || '';

      const finalPreferences = {
        ...preferences,
        referral_source: String(referralSource),
      };

      dispatch(setReferralSource(String(referralSource)));
      await setStorageItem(STORAGE_KEYS.LOOKING_FOR_FLOW_DATA, {
        item: route.params?.item,
        gender: route.params?.gender,
        dob: route.params?.dob,
        profession: route.params?.profession,
        reason: route.params?.reason,
        awarenessSource: selectedOption,
      });

      await seekerPreferencesService.savePreferences(finalPreferences);

      dispatch(updateIsPreferencesSaved(true));
      showSuccessToast(t('lookingForFlow.success.saved'));

      navigation.navigate(ROUTES.SEEKER_BOTTOM_TABS);
    } catch (err) {
      showErrorToast(t('errors.generic'), (err as any)?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigation, preferences, remoteOptions, route.params, selectedOption, t]);

  return {
    options,
    selectedOption,
    error: error ?? undefined,
    isLoading,
    onSelectOption: handleSelectOption,
    onPressNext: handlePressNext,
  };
}
