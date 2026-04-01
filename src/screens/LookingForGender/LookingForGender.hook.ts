import { useCallback, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList, GenderOption } from '../../models/navigation';
import { useAppDispatch } from '../../store';
import { setGender } from '../../store/slices/seekerPreferencesSlice';

type LookingForGenderNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_GENDER
>;

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female'];

export function useLookingForGender() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LookingForGenderNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.LOOKING_FOR_GENDER>>();
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);
  const [error, setError] = useState<string | undefined>();

  const handleSelectGender = useCallback((gender: GenderOption) => {
    setSelectedGender(gender);
    setError(undefined);
  }, []);

  const handlePressNext = useCallback(() => {
    if (!selectedGender) {
      setError('Gender is required');
      return;
    }

    dispatch(setGender(selectedGender.toLowerCase()));
    navigation.navigate(ROUTES.LOOKING_FOR_DOB, {
      item: route.params?.item,
      gender: selectedGender,
    });
  }, [dispatch, navigation, route.params, selectedGender]);

  return {
    genders: GENDER_OPTIONS,
    selectedGender,
    error,
    onSelectGender: handleSelectGender,
    onPressNext: handlePressNext,
  };
}
