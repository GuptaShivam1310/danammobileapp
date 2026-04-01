import { renderHook, act } from '@testing-library/react-native';
import moment from 'moment';
import { useLookingForDateForBirth } from '../../../src/screens/LookingForDateForBirth/LookingForDateForBirth.hook';
import { ROUTES } from '../../../src/constants/routes';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      item: { id: 'item-1' },
      gender: 'female',
    },
  }),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('useLookingForDateForBirth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats input and validates partial/full dates', () => {
    const { result } = renderHook(() => useLookingForDateForBirth());

    act(() => {
      result.current.onChangeText('1');
    });
    expect(result.current.dob).toBe('1');
    expect(result.current.error).toBeUndefined();

    act(() => {
      result.current.onChangeText('3213'); // 32/13 invalid
    });
    expect(result.current.error).toBe('Enter a valid date');

    act(() => {
      result.current.onChangeText('01012050'); // future date
    });
    expect(result.current.error).toBe('Enter a valid date');
  });

  it('accepts valid date, clears error, and navigates on next', () => {
    const { result } = renderHook(() => useLookingForDateForBirth());
    const validDate = moment().subtract(1, 'day').format('DDMMYYYY');
    const formatted = moment().subtract(1, 'day').format('DD/MM/YYYY');

    act(() => {
      result.current.onChangeText('01012050');
    });
    expect(result.current.error).toBe('Enter a valid date');

    act(() => {
      result.current.onChangeText(validDate);
    });
    expect(result.current.dob).toBe(formatted);
    expect(result.current.error).toBeUndefined();

    act(() => {
      result.current.onPressNext();
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOOKING_FOR_PROFESSION, {
      item: { id: 'item-1' },
      gender: 'female',
      dob: formatted,
    });
  });

  it('toggles and closes picker, and handles date selection', () => {
    const { result } = renderHook(() => useLookingForDateForBirth());

    act(() => {
      result.current.onOpenPicker();
    });
    expect(result.current.isPickerVisible).toBe(true);

    act(() => {
      result.current.onOpenPicker();
    });
    expect(result.current.isPickerVisible).toBe(false);

    act(() => {
      result.current.onOpenPicker();
    });
    act(() => {
      result.current.onClosePicker();
    });
    expect(result.current.isPickerVisible).toBe(false);

    const picked = moment('1995-02-10').toDate();
    act(() => {
      result.current.onDateChange(picked);
    });
    expect(result.current.selectedDate).toEqual(picked);
    expect(result.current.dob).toBe('10/02/1995');
    expect(result.current.error).toBeUndefined();
  });

  it('blocks navigation for invalid input', () => {
    const { result } = renderHook(() => useLookingForDateForBirth());

    act(() => {
      result.current.onChangeText('0101');
    });
    act(() => {
      result.current.onPressNext();
    });
    expect(result.current.error).toBe('Date of Birth is required');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('ignores undefined date change', () => {
    const { result } = renderHook(() => useLookingForDateForBirth());
    act(() => {
      result.current.onDateChange(undefined);
    });
    expect(result.current.selectedDate).toBeNull();
  });
});
