import React from 'react';
import { render, fireEvent, waitFor, renderHook, act } from '@testing-library/react-native';
import { ContactUsScreen } from '../../src/screens/ContactUs/ContactUsScreen';
import { useContactUs } from '../../src/screens/ContactUs/useContactUs';
import { supportApi } from '../../src/services/api/supportApi';
import en from '../../src/localization/en.json';
import Toast from 'react-native-toast-message';

// Mock dependencies
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('../../src/services/api/supportApi', () => ({
    supportApi: {
        sendMessage: jest.fn(),
    },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TextInput: createPrimitive('TextInput'),
        ScrollView: createPrimitive('ScrollView'),
        Pressable: createPrimitive('Pressable'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
        Platform: {
            OS: 'ios',
            select: (obj: any) => obj.ios,
        },
    };
});

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                surface: '#FFFFFF',
                text: '#111827',
                brandGreen: '#0B6B4F',
                error: '#DC2626',
            },
        },
    }),
}));

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (val: number) => val,
    verticalScale: (val: number) => val,
    normalize: (val: number) => val,
    scale: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
    fonts: {
        bold: 'System',
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
    },
}));

jest.mock('react-i18next', () => {
    const mockEn = require('../../src/localization/en.json');
    return {
        useTranslation: () => ({
            t: (key: string) => {
                const keys = key.split('.');
                let val: any = mockEn;
                for (const k of keys) {
                    val = val?.[k];
                }
                return typeof val === 'string' ? val : key;
            },
        }),
        initReactI18next: { type: '3rdParty', init: () => {} },
    };
});

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID }, children);
    },
}));

jest.mock('../../src/components/common/Header', () => ({
    Header: ({ title, onBackPress, backButtonTestID }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        return React.createElement(View, {}, [
            React.createElement(TouchableOpacity, { key: 'back', onPress: onBackPress, testID: backButtonTestID }, React.createElement(Text, {}, 'Back')),
            React.createElement(Text, { key: 'title' }, title),
        ]);
    },
}));

jest.mock('../../src/components/common/AppInput', () => ({
    AppInput: ({ label, value, onChangeText, testID, error, errorTestID }: any) => {
        const React = require('react');
        const { View, Text, TextInput } = require('react-native');
        return React.createElement(View, {}, [
            label ? React.createElement(Text, { key: 'label' }, label) : null,
            React.createElement(TextInput, { key: 'input', value, onChangeText, testID }),
            error ? React.createElement(Text, { key: 'error', testID: errorTestID }, error) : null,
        ]);
    },
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
    PrimaryButton: ({ title, onPress, testID, loading }: any) => {
        const React = require('react');
        const { TouchableOpacity, Text } = require('react-native');
        return React.createElement(TouchableOpacity, { onPress, testID }, React.createElement(Text, {}, loading ? 'Loading...' : title));
    },
}));

describe('ContactUs Hooks and Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useContactUs hook', () => {
        it('validates empty fields', async () => {
            const { result } = renderHook(() => useContactUs());

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.errors.fullName).toBe(en.contactUs.validation.fullNameRequired);
            expect(result.current.errors.email).toBe(en.contactUs.validation.emailRequired);
        });

        it('calls API with correct payload on success', async () => {
            (supportApi.sendMessage as jest.Mock).mockResolvedValue({ success: true, message: 'Sent' });
            const { result } = renderHook(() => useContactUs());

            act(() => {
                result.current.setFullName('John Doe');
                result.current.setEmail('john@example.com');
                result.current.setPhone('9999999999');
                result.current.setMessage('Help needed');
            });

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(supportApi.sendMessage).toHaveBeenCalledWith({
                full_name: 'John Doe',
                email: 'john@example.com',
                phone_number: '9999999999',
                message: 'Help needed',
            });
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    describe('ContactUsScreen UI', () => {
        it('renders correctly', () => {
            const { getByTestId, getByText } = render(<ContactUsScreen />);

            expect(getByTestId('contact-us-screen')).toBeTruthy();
            expect(getByText(en.contactUs.title)).toBeTruthy();
            expect(getByText(en.contactUs.fullNameLabel)).toBeTruthy();
        });

        it('triggers handleSubmit when button is pressed', async () => {
            (supportApi.sendMessage as jest.Mock).mockResolvedValue({ success: true });
            const { getByTestId } = render(<ContactUsScreen />);

            fireEvent.changeText(getByTestId('full-name-input'), 'John Doe');
            fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
            fireEvent.changeText(getByTestId('phone-input'), '9999999999');
            fireEvent.changeText(getByTestId('message-input'), 'Hello');

            const submitBtn = getByTestId('contact-submit-button');
            await act(async () => {
                fireEvent.press(submitBtn);
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(supportApi.sendMessage).toHaveBeenCalled();
        });
    });
});
