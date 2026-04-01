import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import get from 'lodash/get';
import Toast from 'react-native-toast-message';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../models/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchSeekerLookProfessions } from '../../store/slices/seekerLookProfession';

import { setProfessionId } from '../../store/slices/seekerPreferencesSlice';

type LookingForProfessionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_PROFESSION
>;

export function useLookingForProfession() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation<LookingForProfessionNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.LOOKING_FOR_PROFESSION>>();
  const { professions } = useAppSelector(
    state => state.seekerLookProfession,
  );
  const [selectedProfessionId, setSelectedProfessionId] = useState<number | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(fetchSeekerLookProfessions()).unwrap();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: t('errors.generic'),
        text2: (err as any)?.response?.data?.message || get(err, 'message', t('errors.genericTryAgain')),
      });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, t]);

  useEffect(() => {
    if (professions.length === 0) {
      fetchProfessions();
    }
  }, [fetchProfessions, professions.length]);

  const professionOptions = useMemo(
    () => professions.map((entry: { id: string | number, title: string }) => ({ id: entry.id, title: entry.title })).filter(entry => !!entry.title),
    [professions],
  );

  const handleSelectProfession = useCallback((id: number | string) => {
    setSelectedProfessionId(id);
    setError(null);
  }, []);

  const handlePressNext = useCallback(() => {
    if (!selectedProfessionId) {
      setError('Profession is required');
      return;
    }

    const selectedProfession = professionOptions.find(entry => entry.id === selectedProfessionId);
    dispatch(setProfessionId(Number(selectedProfessionId)));
    navigation.navigate(ROUTES.SELECT_LOCATION, {
      item: route.params?.item,
      gender: route.params?.gender,
      dob: route.params?.dob,
      profession: selectedProfession?.title,
    });
  }, [dispatch, navigation, professionOptions, route.params, selectedProfessionId]);

  return {
    professions: professionOptions,
    selectedProfessionId,
    error: error ?? undefined,
    isLoading,
    onSelectProfession: handleSelectProfession,
    onPressNext: handlePressNext,
  };
}
