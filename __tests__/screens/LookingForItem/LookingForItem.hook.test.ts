import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLookingForItem } from '../../../src/screens/LookingForItem/LookingForItem.hook';
import { searchApi } from '../../../src/services/api/searchApi';
import { useAppDispatch } from '../../../src/store';
import { setLookingFor } from '../../../src/store/slices/seekerPreferencesSlice';
import { useNavigation } from '@react-navigation/native';

// Mock dependencies
jest.mock('../../../src/services/api/searchApi');
jest.mock('../../../src/store', () => ({
    useAppDispatch: jest.fn(),
}));
jest.mock('../../../src/store/slices/seekerPreferencesSlice', () => ({
    setLookingFor: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));
const mockT = jest.fn((key: string, params?: any) => `${key}${params ? JSON.stringify(params) : ''}`);
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

jest.useFakeTimers();

describe('useLookingForItem', () => {
    const mockDispatch = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
        });
        (searchApi.getSuggestions as jest.Mock).mockResolvedValue({ suggestions: ['Driver', 'Drummer'] });
    });

    it('updates query and clears error on change text', () => {
        const { result } = renderHook(() => useLookingForItem());

        act(() => {
            result.current.onChangeText('test');
        });

        expect(result.current.query).toBe('test');
        expect(result.current.error).toBeNull();
    });

    it('validates minimum length on get started', () => {
        const { result } = renderHook(() => useLookingForItem());

        act(() => {
            result.current.onChangeText('a');
        });

        act(() => {
            result.current.onPressGetStarted();
        });

        expect(result.current.error).toBe('lookingForFlow.item.errors.minLength{"min":2}');
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('validates required field on get started', () => {
        const { result } = renderHook(() => useLookingForItem());

        act(() => {
            result.current.onPressGetStarted();
        });

        expect(result.current.error).toBe('lookingForFlow.item.errors.required');
    });

    it('navigates when input is valid', () => {
        const { result } = renderHook(() => useLookingForItem());

        act(() => {
            result.current.onChangeText('Laptop');
        });

        act(() => {
            result.current.onPressGetStarted();
        });

        expect(mockDispatch).toHaveBeenCalledWith(setLookingFor('Laptop'));
        expect(mockNavigate).toHaveBeenCalledWith('LookingForGender');
    });

    it('fetches suggestions only when input length >= 2', async () => {
        const { result } = renderHook(() => useLookingForItem());

        act(() => {
            result.current.onChangeText('a');
        });

        expect(searchApi.getSuggestions).not.toHaveBeenCalled();

        act(() => {
            result.current.onChangeText('ab');
        });

        // Run debounce timer
        act(() => {
            jest.runAllTimers();
        });

        await waitFor(() => {
            expect(searchApi.getSuggestions).toHaveBeenCalledWith('ab');
        });
    });
});
