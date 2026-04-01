import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ResetPasswordSuccessScreen } from '../../src/screens/ResetPasswordSuccess/ResetPasswordSuccessScreen';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const keys = key.split('.');
            let val = require('../../src/localization/en.json');
            for (const k of keys) {
                if (val[k]) val = val[k];
                else return key;
            }
            return typeof val === 'string' ? val : key;
        },
    }),
}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native', () => {
    const ReactLib = require('react');

    const createPrimitive =
        (name: string) =>
            ({ children, ...props }: { children?: React.ReactNode }) =>
                ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Pressable: createPrimitive('Pressable'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Platform: {
            OS: 'ios',
            select: (obj: any) => obj.ios,
        },
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
            flatten: (styles: unknown) => styles,
        },
        Dimensions: {
            get: () => ({ width: 375, height: 812 }),
        },
        PixelRatio: {
            roundToNearestPixel: (value: number) => value,
        },
    };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

const mockedUseNavigation = useNavigation as jest.Mock;

describe('ResetPasswordSuccessScreen', () => {
    const mockReset = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigation.mockReturnValue({
            reset: mockReset,
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<ResetPasswordSuccessScreen />);

        expect(getByText('Password Updated')).toBeTruthy();
        expect(getByText('Your Password has been reset successfully')).toBeTruthy();
        expect(getByText('Continue to Login')).toBeTruthy();
    });

    it('navigates to login screen when continue button is pressed', async () => {
        const { getByText } = render(<ResetPasswordSuccessScreen />);

        const continueButton = getByText('Continue to Login');
        fireEvent.press(continueButton);

        await waitFor(() => {
            expect(mockReset).toHaveBeenCalledWith({
                index: 0,
                routes: [{ name: ROUTES.LOGIN }],
            });
        });
    });
});
