import { useCallback, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';

import { useAppDispatch } from '../../store';
import { setDateOfBirth } from '../../store/slices/seekerPreferencesSlice';

type LookingForDobNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof ROUTES.LOOKING_FOR_DOB
>;

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts = [];
  if (digits.length >= 2) {
    parts.push(digits.slice(0, 2));
  } else if (digits.length > 0) {
    parts.push(digits);
  }
  if (digits.length >= 4) {
    parts.push(digits.slice(2, 4));
  } else if (digits.length > 2) {
    parts.push(digits.slice(2));
  }
  if (digits.length > 4) {
    parts.push(digits.slice(4));
  }
  return parts.join('/');
}

function isValidPartialDate(value: string) {
  const [dayPart, monthPart] = value.split('/');

  if (monthPart && monthPart.length === 2) {
    const month = Number(monthPart);
    if (month < 1 || month > 12) {
      return false;
    }
  }

  if (dayPart && dayPart.length === 2) {
    const day = Number(dayPart);
    if (day < 1 || day > 31) {
      return false;
    }
  }

  return true;
}

function isValidFullDate(value: string) {
  const parsed = moment(value, 'DD/MM/YYYY', true);
  if (!parsed.isValid()) {
    return false;
  }

  if (parsed.isAfter(moment(), 'day')) {
    return false;
  }

  return true;
}

export function useLookingForDateForBirth() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LookingForDobNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, typeof ROUTES.LOOKING_FOR_DOB>>();
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleChangeText = useCallback((value: string) => {
    const formatted = formatDateInput(value);
    if (!isValidPartialDate(formatted)) {
      setError('Enter a valid date');
      return;
    }

    if (formatted.length === 10 && !isValidFullDate(formatted)) {
      setError('Enter a valid date');
      return;
    }

    setDob(formatted);
    if (error) {
      setError(undefined);
    }
  }, [error]);

  const handleOpenPicker = useCallback(() => {
    setPickerVisible(prev => !prev);
  }, []);

  const handleClosePicker = useCallback(() => {
    setPickerVisible(false);
  }, []);

  const handleDateChange = useCallback((date?: Date) => {
    if (!date) {
      return;
    }
    setSelectedDate(date);
    setDob(moment(date).format('DD/MM/YYYY'));
    setError(undefined);
  }, []);

  const handlePressNext = useCallback(() => {
    const trimmed = dob.trim();
    if (!trimmed || trimmed.length !== 10 || !isValidFullDate(trimmed)) {
      setError('Date of Birth is required');
      return;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for API
    const apiDob = moment(trimmed, 'DD/MM/YYYY').format('YYYY-MM-DD');
    dispatch(setDateOfBirth(apiDob));
    navigation.navigate(ROUTES.LOOKING_FOR_PROFESSION, {
      item: route.params?.item,
      gender: route.params?.gender,
      dob: trimmed,
    });
  }, [dispatch, dob, navigation, route.params]);

  return {
    dob,
    error,
    selectedDate,
    isPickerVisible,
    onChangeText: handleChangeText,
    onOpenPicker: handleOpenPicker,
    onClosePicker: handleClosePicker,
    onDateChange: handleDateChange,
    onPressNext: handlePressNext,
  };
}
