import React from 'react';
import { renderHook, act, fireEvent, render } from '@testing-library/react-native';
import { useLookingForReason, MIN_REASON_CHAR } from '../../../src/screens/LookingForReason/LookingForReason.hook';
import { ROUTES } from '../../../src/constants/routes';
import { useAppDispatch } from '../../../src/store';
import { useNavigation } from '@react-navigation/native';
import { LookingForReason } from '../../../src/screens/LookingForReason/LookingForReason';

// ─── Mock dependencies ──────────────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(() => ({
        params: {
            item: { id: 'item-1' },
            gender: 'Female',
            dob: '10/02/1995',
            profession: 'Doctor',
        },
    })),
}));

jest.mock('../../../src/store', () => ({
    useAppDispatch: jest.fn(),
}));

jest.mock('../../../src/store/slices/seekerPreferencesSlice', () => ({
    setReason: jest.fn((val: string) => ({ type: 'seekerPreferences/setReason', payload: val })),
}));

const mockT = jest.fn((key: string, vars?: Record<string, any>) =>
    vars ? `${key}:${JSON.stringify(vars)}` : key,
);
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) => ({ children, ...props }: any) =>
        ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        Pressable: createPrimitive('Pressable'),
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
            flatten: (styles: unknown) => styles,
        },
        Dimensions: { get: () => ({ width: 375, height: 812 }) },
        PixelRatio: { roundToNearestPixel: (value: number) => value },
    };
});

jest.mock('../../../src/hooks/useGoBack', () => ({
    useGoBack: () => mockGoBack,
}));

jest.mock('../../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../../src/components/common/Header', () => ({
    Header: ({ onBackPress }: any) => {
        const ReactLib = require('react');
        return ReactLib.createElement('Pressable', { onPress: onBackPress },
            ReactLib.createElement('Text', null, 'Back'));
    },
}));

jest.mock('../../../src/components/common/AppTitle', () => ({
    AppTitle: ({ text }: any) => {
        const ReactLib = require('react');
        return ReactLib.createElement('Text', null, text);
    },
}));

jest.mock('../../../src/components/common/AppTextArea', () => ({
    AppTextArea: ({ text, onChangeCallBack, placeholder, minChar, maxChar, minCharMessage, error }: any) => {
        const ReactLib = require('react');
        return ReactLib.createElement(
            'View', null,
            ReactLib.createElement('Text', null, `value:${text}`),
            ReactLib.createElement('Text', null, placeholder),
            ReactLib.createElement('Text', null, `min:${minChar}`),
            ReactLib.createElement('Text', null, `max:${maxChar}`),
            ReactLib.createElement('Text', null, minCharMessage),
            error ? ReactLib.createElement('Text', null, error) : null,
            ReactLib.createElement('Pressable', { onPress: () => onChangeCallBack('updated reason') },
                ReactLib.createElement('Text', null, 'ChangeReason')),
        );
    },
}));

jest.mock('../../../src/components/common/AppButton', () => ({
    AppButton: ({ title, onPress }: any) => {
        const ReactLib = require('react');
        return ReactLib.createElement('Pressable', { onPress },
            ReactLib.createElement('Text', null, title));
    },
}));

// ─── Hook Tests ─────────────────────────────────────────────────────────────

describe('useLookingForReason hook', () => {
    const mockDispatch = jest.fn();
    const { useLookingForReason: realUseLookingForReason, MIN_REASON_CHAR: realMinReason } =
        jest.requireActual('../../../src/screens/LookingForReason/LookingForReason.hook');

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    });

    it('returns initial empty state', () => {
        const { result } = renderHook(() => realUseLookingForReason());
        expect(result.current.reason).toBe('');
        expect(result.current.error).toBeUndefined();
    });

    it('updates reason and clears error on change', () => {
        const { result } = renderHook(() => realUseLookingForReason());

        // set an error first
        act(() => { result.current.onPressNext(); });
        expect(result.current.error).toBeDefined();

        // change text should clear error
        act(() => { result.current.onChangeReason('hello'); });
        expect(result.current.reason).toBe('hello');
        expect(result.current.error).toBeUndefined();
    });

    it('shows required error when pressing Next with empty input', () => {
        const { result } = renderHook(() => realUseLookingForReason());

        act(() => { result.current.onPressNext(); });

        expect(result.current.error).toBe('lookingForFlow.reason.errors.required');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('shows minLength error when input is too short', () => {
        const { result } = renderHook(() => realUseLookingForReason());

        act(() => { result.current.onChangeReason('too short'); });
        act(() => { result.current.onPressNext(); });

        expect(result.current.error).toBe(
            `lookingForFlow.reason.errors.minLength:${JSON.stringify({ min: realMinReason })}`,
        );
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('dispatches and navigates when input is valid', () => {
        const { result } = renderHook(() => realUseLookingForReason());
        const validReason = 'a'.repeat(realMinReason + 5);

        act(() => { result.current.onChangeReason(`  ${validReason}  `); });
        act(() => { result.current.onPressNext(); });

        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOOKING_FOR_DO_YOU, {
            item: { id: 'item-1' },
            gender: 'Female',
            dob: '10/02/1995',
            profession: 'Doctor',
            reason: validReason,
        });
    });
});

// ─── Screen Component Tests ─────────────────────────────────────────────────

const mockUseLookingForReason = jest.fn();

jest.mock('../../../src/screens/LookingForReason/LookingForReason.hook', () => ({
    MIN_REASON_CHAR: 30,
    MAX_REASON_CHAR: 500,
    useLookingForReason: () => mockUseLookingForReason(),
}));

describe('LookingForReason screen', () => {
    const baseHookState = {
        reason: '',
        error: undefined,
        onChangeReason: jest.fn(),
        onPressNext: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseLookingForReason.mockReturnValue(baseHookState);
    });

    it('renders translated content and handles interactions', () => {
        const { getByText } = render(<LookingForReason />);

        expect(getByText('lookingForFlow.reason.title')).toBeTruthy();
        expect(getByText('lookingForFlow.reason.placeholder')).toBeTruthy();
        expect(getByText('min:30')).toBeTruthy();
        expect(getByText('max:500')).toBeTruthy();

        fireEvent.press(getByText('Back'));
        fireEvent.press(getByText('ChangeReason'));
        fireEvent.press(getByText('lookingForFlow.common.next'));

        expect(mockGoBack).toHaveBeenCalled();
        expect(baseHookState.onChangeReason).toHaveBeenCalledWith('updated reason');
        expect(baseHookState.onPressNext).toHaveBeenCalled();
    });

    it('shows error from hook state', () => {
        mockUseLookingForReason.mockReturnValue({
            ...baseHookState,
            error: 'Reason is required',
        });

        const { getByText } = render(<LookingForReason />);
        expect(getByText('Reason is required')).toBeTruthy();
    });

    it('passes reason value to AppTextArea', () => {
        mockUseLookingForReason.mockReturnValue({
            ...baseHookState,
            reason: 'My current reason text',
        });

        const { getByText } = render(<LookingForReason />);
        expect(getByText('value:My current reason text')).toBeTruthy();
    });
});
