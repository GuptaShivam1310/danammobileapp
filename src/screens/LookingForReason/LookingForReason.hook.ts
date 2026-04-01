import { useCallback, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';

import { useAppDispatch } from '../../store';
import { setReason as setReduxReason } from '../../store/slices/seekerPreferencesSlice';

type LookingForReasonNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_REASON
>;

export const MIN_REASON_CHAR = 30;
export const MAX_REASON_CHAR = 500;

export function useLookingForReason() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LookingForReasonNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.LOOKING_FOR_REASON>>();
  const { t } = useTranslation();

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleReasonChange = useCallback((value: string) => {
    setReason(value);
    if (error) {
      setError(undefined);
    }
  }, [error]);

  const handlePressNext = useCallback(() => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError(t('lookingForFlow.reason.errors.required'));
      return;
    }

    if (trimmedReason.length < MIN_REASON_CHAR) {
      setError(
        t('lookingForFlow.reason.errors.minLength', {
          min: MIN_REASON_CHAR,
        }),
      );
      return;
    }

    dispatch(setReduxReason(trimmedReason));
    navigation.navigate(ROUTES.LOOKING_FOR_DO_YOU, {
      item: route.params?.item,
      gender: route.params?.gender,
      dob: route.params?.dob,
      profession: route.params?.profession,
      reason: trimmedReason,
    });
  }, [dispatch, navigation, reason, route.params, t]);

  return {
    reason,
    error,
    onChangeReason: handleReasonChange,
    onPressNext: handlePressNext,
  };
}
