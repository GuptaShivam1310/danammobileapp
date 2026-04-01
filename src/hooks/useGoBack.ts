import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

export function useGoBack() {
  const navigation = useNavigation();

  return useCallback(() => {
    navigation.goBack();
  }, [navigation]);
}
