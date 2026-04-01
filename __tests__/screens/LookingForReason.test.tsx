import React from 'react';
import { renderHook, act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLookingForReason, MIN_REASON_CHAR } from '../../src/screens/LookingForReason/LookingForReason.hook';
import { ROUTES } from '../../src/constants/routes';
import { useAppDispatch } from '../../src/store';
import { useNavigation } from '@react-navigation/native';
import { LookingForReason } from '../../src/screens/LookingForReason/LookingForReason';

// ─── Mock dependencies ──────────────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();

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

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('../../src/store/slices/seekerPreferencesSlice', () => ({
  setReason: jest.fn((val: string) => ({ type: 'seekerPreferences/setReason', payload: val })),
}));

const mockT = jest.fn((key: string, vars?: Record<string, any>) => {
  const map: Record<string, string> = {
    'lookingForFlow.reason.title': 'Reason Title',
    'lookingForFlow.reason.placeholder': 'Placeholder Text',
    'lookingForFlow.reason.minCounterHint': vars ? `Min ${vars.min} chars` : 'Min chars',
    'lookingForFlow.common.next': 'Next',
    'lookingForFlow.reason.errors.required': 'Reason is required',
    'lookingForFlow.reason.errors.minLength': vars ? `Min ${vars.min} characters required` : 'Min length error',
  };
  return map[key] ?? key;
});

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

jest.mock('../../src/hooks/useGoBack', () => ({
  useGoBack: () => mockGoBack,
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('../../src/components/common/Header', () => ({
  Header: ({ onBackPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onBackPress} testID="header-back">
        <Text>Back</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/common/AppTitle', () => ({
  AppTitle: ({ text }: any) => {
    const { Text } = require('react-native');
    return <Text>{text}</Text>;
  },
}));

jest.mock('../../src/components/common/AppTextArea', () => ({
  AppTextArea: ({ text, onChangeCallBack, placeholder, minChar, maxChar, minCharMessage, error }: any) => {
    const { View, Text, Pressable } = require('react-native');
    const { MIN_REASON_CHAR } = require('../../src/screens/LookingForReason/LookingForReason.hook');
    return (
      <View>
        <Text>value:{text}</Text>
        <Text>{placeholder}</Text>
        <Text>min:{minChar}</Text>
        <Text>max:{maxChar}</Text>
        <Text>{minCharMessage}</Text>
        {error ? <Text testID="text-area-error">{error}</Text> : null}
        <Pressable onPress={() => onChangeCallBack('a'.repeat(MIN_REASON_CHAR + 5))} testID="input-change-valid">
          <Text>Change Valid</Text>
        </Pressable>
        <Pressable onPress={() => onChangeCallBack('short')} testID="input-change-short">
          <Text>Change Short</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('../../src/components/common/AppButton', () => ({
  AppButton: ({ title, onPress }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

const { View, Pressable, Text } = require('react-native');

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('LookingForReason (Hook & Screen)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  describe('useLookingForReason Hook', () => {
    it('returns initial empty state', () => {
      const { result } = renderHook(() => useLookingForReason());
      expect(result.current.reason).toBe('');
      expect(result.current.error).toBeUndefined();
    });

    it('updates reason and clears error on change', () => {
      const { result } = renderHook(() => useLookingForReason());

      act(() => { result.current.onPressNext(); });
      expect(result.current.error).toBe('Reason is required');

      act(() => { result.current.onChangeReason('valid reason text'); });
      expect(result.current.reason).toBe('valid reason text');
      expect(result.current.error).toBeUndefined();
    });

    it('shows minLength error when input is too short', () => {
      const { result } = renderHook(() => useLookingForReason());

      act(() => { result.current.onChangeReason('too short'); });
      act(() => { result.current.onPressNext(); });

      expect(result.current.error).toBe(`Min ${MIN_REASON_CHAR} characters required`);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('dispatches and navigates when input is valid', () => {
      const { result } = renderHook(() => useLookingForReason());
      const validReason = 'a'.repeat(MIN_REASON_CHAR + 1);

      act(() => { result.current.onChangeReason(validReason); });
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

  describe('LookingForReason Screen Component', () => {
    it('renders all elements and handles navigation actions', () => {
      const { getByText, getByTestId } = render(<LookingForReason />);

      expect(getByText('Reason Title')).toBeTruthy();
      expect(getByText('Placeholder Text')).toBeTruthy();
      expect(getByText(`min:${MIN_REASON_CHAR}`)).toBeTruthy();

      // Back action
      fireEvent.press(getByTestId('header-back'));
      expect(mockGoBack).toHaveBeenCalled();

      // Next action with invalid input
      fireEvent.press(getByText('Next'));
      expect(getByTestId('text-area-error')).toBeTruthy();
      expect(getByText('Reason is required')).toBeTruthy();

      // Next action with short input
      fireEvent.press(getByTestId('input-change-short'));
      fireEvent.press(getByText('Next'));
      expect(getByText(`Min ${MIN_REASON_CHAR} characters required`)).toBeTruthy();

      // Next action with valid input
      fireEvent.press(getByTestId('input-change-valid'));
      fireEvent.press(getByText('Next'));
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOOKING_FOR_DO_YOU, {
        item: { id: 'item-1' },
        gender: 'Female',
        dob: '10/02/1995',
        profession: 'Doctor',
        reason: 'a'.repeat(MIN_REASON_CHAR + 5),
      });
    });
  });
});
