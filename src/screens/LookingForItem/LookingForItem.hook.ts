import { useMemo, useState, useCallback, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../models/navigation';
import { searchApi } from '../../services/api/searchApi';

import { useAppDispatch } from '../../store';
import { setLookingFor } from '../../store/slices/seekerPreferencesSlice';

type LookingForItemNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_ITEM
>;

const SUGGESTION_DEBOUNCE_MS = 300;

export function useLookingForItem() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LookingForItemNavigationProp>();
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchSuggestions = useCallback(async (text: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await searchApi.getSuggestions(text);
      setSuggestions(data.suggestions);
    } catch (err) {
      setSuggestions([]);
      setFetchError(
        (err as { message?: string })?.message ?? t('lookingForFlow.item.noItemFound'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, SUGGESTION_DEBOUNCE_MS),
    [fetchSuggestions],
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    debouncedFetchSuggestions(trimmed);
  }, [debouncedFetchSuggestions, query]);

  useEffect(
    () => () => {
      debouncedFetchSuggestions.cancel();
    },
    [debouncedFetchSuggestions],
  );

  const showSuggestions = query.trim().length >= 2;
  const showImage = query.trim().length < 2;
  const noResults = showSuggestions && suggestions.length === 0;

  const handleChangeText = useCallback((value: string) => {
    setQuery(value);
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  const handleSelectSuggestion = useCallback((value: string) => {
    setQuery(value);
    setValidationError(null);
  }, []);

  const handlePressGetStarted = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError(t('lookingForFlow.item.errors.required'));
      return;
    }

    if (trimmed.length < 2) {
      setValidationError(t('lookingForFlow.item.errors.minLength', { min: 2 }));
      return;
    }

    dispatch(setLookingFor(trimmed));
    navigation.navigate(ROUTES.LOOKING_FOR_GENDER);
  }, [dispatch, navigation, query, t]);

  return {
    query,
    error: validationError,
    suggestions,
    showSuggestions,
    showImage,
    noResults,
    isLoading,
    fetchError: fetchError ?? undefined,
    onChangeText: handleChangeText,
    onSelectSuggestion: handleSelectSuggestion,
    onPressGetStarted: handlePressGetStarted,
  };
}
