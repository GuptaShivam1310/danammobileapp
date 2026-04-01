import { renderHook, act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// ─── Stable Mocks & Constants ──────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockT = (k: string, options?: any) => k;

// ─── Global Mocks ─────────────────────────────────────────────────────────

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) => ({ children, ...props }: any) =>
        ReactLib.createElement(name, props, children);
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TextInput: createPrimitive('TextInput'),
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    };
});

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useRoute: () => ({
        params: {
            item: { id: 'item-1' },
            gender: 'Female',
            dob: '10/02/1995',
            profession: 'Doctor',
        },
    }),
}));

jest.mock('../../src/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('../../src/hooks/useGoBack', () => ({ useGoBack: () => jest.fn() }));

// Component Mocks
jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));
jest.mock('../../src/components/common/Header', () => ({ Header: () => null }));
jest.mock('../../src/components/common/AppTitle', () => ({ AppTitle: () => null }));
jest.mock('../../src/components/common/AppTextArea', () => ({
    AppTextArea: (p: any) => {
        const { TextInput } = require('react-native');
        const ReactLib = require('react');
        return ReactLib.createElement(TextInput, { testID: 'text-area', value: p.text, onChangeText: p.onChangeCallBack });
    }
}));
jest.mock('../../src/components/common/AppButton', () => ({
    AppButton: (p: any) => {
        const { TouchableOpacity, Text } = require('react-native');
        const ReactLib = require('react');
        return ReactLib.createElement(TouchableOpacity, { testID: 'next-btn', onPress: p.onPress }, ReactLib.createElement(Text, {}, p.title));
    }
}));

// ─── Imports ────────────────────────────────────────────────────────────────
import { useLookingForReason, MIN_REASON_CHAR } from '../../src/screens/LookingForReason/LookingForReason.hook';
import { LookingForReason } from '../../src/screens/LookingForReason/LookingForReason';

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('LookingForReason', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Hook', () => {
        it('handles valid reason submission', async () => {
            const { result } = renderHook(() => useLookingForReason());
            const validReason = 'a'.repeat(MIN_REASON_CHAR + 1);

            act(() => { result.current.onChangeReason(validReason); });
            expect(result.current.reason).toBe(validReason);

            act(() => { result.current.onPressNext(); });
            expect(mockDispatch).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('validates empty reason', () => {
            const { result } = renderHook(() => useLookingForReason());
            act(() => { result.current.onPressNext(); });
            expect(result.current.error).toBe('lookingForFlow.reason.errors.required');
        });

        it('validates short reason', () => {
            const { result } = renderHook(() => useLookingForReason());
            act(() => { result.current.onChangeReason('too short'); });
            act(() => { result.current.onPressNext(); });
            expect(result.current.error).toBe('lookingForFlow.reason.errors.minLength');
        });

        it('clears error on change', () => {
            const { result } = renderHook(() => useLookingForReason());
            act(() => { result.current.onPressNext(); });
            expect(result.current.error).toBeTruthy();
            act(() => { result.current.onChangeReason('some text'); });
            expect(result.current.error).toBeUndefined();
        });
    });

    describe('Screen', () => {
        it('renders and handles interactions', () => {
            const { getByTestId } = render(<LookingForReason />);
            const validReason = 'a'.repeat(MIN_REASON_CHAR + 1);

            fireEvent.changeText(getByTestId('text-area'), validReason);
            fireEvent.press(getByTestId('next-btn'));

            expect(mockNavigate).toHaveBeenCalled();
        });
    });
});
