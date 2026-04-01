import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ResetPasswordScreen } from '../../src/screens/ResetPassword/ResetPasswordScreen';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { resetPassword } from '../../src/services/authService';
import { Alert } from 'react-native';

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
        Image: createPrimitive('Image'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Pressable: createPrimitive('Pressable'),
        TextInput: createPrimitive('TextInput'),
        Dimensions: {
            get: () => ({ width: 375, height: 812 }),
        },
        PixelRatio: {
            roundToNearestPixel: (value: number) => value,
        },
        Alert: {
            alert: jest.fn(),
        },
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
            flatten: (styles: unknown) => styles,
        },
        Platform: {
            OS: 'ios',
            select: (obj: any) => obj.ios,
        }
    };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn().mockReturnValue({ params: { token: 'test-token' } }),
}));
jest.mock('../../src/services/authService', () => ({
    resetPassword: jest.fn(),
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
    __esModule: true,
    PrimaryButton: ({ title, onPress, testID, loading, disabled }: any) => {
        const React = require('react');
        const handlePress = () => {
            if (loading || disabled) {
                return;
            }
            onPress?.();
        };
        return React.createElement(
            'TouchableOpacity',
            { onPress: handlePress, testID, disabled: loading || disabled },
            loading
                ? React.createElement('ActivityIndicator', { testID: 'loading-indicator' })
                : React.createElement('Text', {}, title)
        );
    },
}));

jest.mock('../../src/assets/images', () => ({
    __esModule: true,
    default: {
        danammLogo: { uri: 'mock-logo' },
    },
}));

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedResetPassword = resetPassword as jest.Mock;
const mockedAlert = Alert.alert as jest.Mock;
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe('ResetPasswordScreen', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigation.mockReturnValue({
            navigate: mockNavigate,
        });
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );
        expect(getByText('Create New Password')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('updates password fields', () => {
        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );
        const passwordInput = getByTestId('reset-password-new-input');
        const confirmInput = getByTestId('reset-password-confirm-input');

        fireEvent.changeText(passwordInput, 'NewPass123!');
        fireEvent.changeText(confirmInput, 'NewPass123!');

        expect(passwordInput.props.value).toBe('NewPass123!');
        expect(confirmInput.props.value).toBe('NewPass123!');
    });

    it('shows error if passwords do not match', async () => {
        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.changeText(getByTestId('reset-password-new-input'), 'Pass123!');
        fireEvent.changeText(getByTestId('reset-password-confirm-input'), 'Different123!');

        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });
    });

    it('calls resetPassword API and navigates on success', async () => {
        mockedResetPassword.mockResolvedValueOnce({ success: true, message: 'Success' });

        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.changeText(getByTestId('reset-password-new-input'), 'StrongPass123!');
        fireEvent.changeText(getByTestId('reset-password-confirm-input'), 'StrongPass123!');

        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });

        await waitFor(() => {
            expect(mockedResetPassword).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD_SUCCESS);
        });
    });

    it('shows error alert on API failure', async () => {
        mockedResetPassword.mockRejectedValueOnce({ message: 'Invalid token' });

        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.changeText(getByTestId('reset-password-new-input'), 'StrongPass123!');
        fireEvent.changeText(getByTestId('reset-password-confirm-input'), 'StrongPass123!');

        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });

        await waitFor(() => {
            expect(mockedAlert).toHaveBeenCalledWith('Reset Failed', 'Invalid token');
        });
    });

    it('shows error if new password is empty', async () => {
        const { getByTestId, findByText } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.changeText(getByTestId('reset-password-new-input'), '   ');
        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });

        expect(await findByText('New Password is required')).toBeTruthy();
    });

    it('shows error if confirm password is empty', async () => {
        const { getByTestId, findByText } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.changeText(getByTestId('reset-password-new-input'), 'Pass123!');
        fireEvent.changeText(getByTestId('reset-password-confirm-input'), '');
        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });

        expect(await findByText('Confirm Password is required')).toBeTruthy();
    });

    it('toggles password visibility', () => {
        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        const newPasswordInput = getByTestId('reset-password-new-input');
        const confirmPasswordInput = getByTestId('reset-password-confirm-input');

        expect(newPasswordInput.props.secureTextEntry).toBe(true);
        expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

        const newToggle = getByTestId('new-password-right-icon');
        fireEvent.press(newToggle);

        const confirmToggle = getByTestId('confirm-password-right-icon');
        fireEvent.press(confirmToggle);
    });

    it('handles focus and blur on inputs', () => {
        const { getByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );

        const newPasswordInput = getByTestId('reset-password-new-input');

        fireEvent(newPasswordInput, 'focus');
        fireEvent(newPasswordInput, 'blur');
    });

    it('prevents multiple submissions while loading', async () => {
        let resolveApi: any;
        mockedResetPassword.mockReturnValueOnce(
            new Promise(resolve => {
                resolveApi = resolve;
            })
        );

        const { getByTestId, findByTestId } = render(
            <ResetPasswordScreen navigation={{ navigate: mockNavigate }} />
        );
        fireEvent.changeText(getByTestId('reset-password-new-input'), 'StrongPass123!');
        fireEvent.changeText(getByTestId('reset-password-confirm-input'), 'StrongPass123!');

        await act(async () => {
            fireEvent.press(getByTestId('reset-password-submit-button'));
            await flushPromises();
        });

        await findByTestId('loading-indicator');

        fireEvent.press(getByTestId('reset-password-submit-button'));

        expect(mockedResetPassword).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveApi({ success: true });
            await flushPromises();
        });
    });
});
