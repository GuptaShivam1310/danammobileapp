import { renderHook, act } from '@testing-library/react-native';
import { useLookingForGender } from '../../../src/screens/LookingForGender/LookingForGender.hook';
import { ROUTES } from '../../../src/constants/routes';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      item: { id: 'item-1' },
    },
  }),
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

describe('useLookingForGender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes gender options', () => {
    const { result } = renderHook(() => useLookingForGender());
    expect(result.current.genders).toEqual(['Male', 'Female']);
  });

  it('requires selection before navigating', () => {
    const { result } = renderHook(() => useLookingForGender());

    act(() => {
      result.current.onPressNext();
    });

    expect(result.current.error).toBe('Gender is required');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('selects gender, clears error, and navigates', () => {
    const { result } = renderHook(() => useLookingForGender());

    act(() => {
      result.current.onSelectGender('Female');
    });
    expect(result.current.selectedGender).toBe('Female');
    expect(result.current.error).toBeUndefined();

    act(() => {
      result.current.onPressNext();
    });

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOOKING_FOR_DOB, {
      item: { id: 'item-1' },
      gender: 'Female',
    });
  });
});
