import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ChatInput from '../../src/components/Chat/ChatInput';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => {
    const en = require('../../src/localization/en.json');
    const getTranslation = (key: string) => key.split('.').reduce((acc: any, part: string) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return acc[part];
        }
        return undefined;
    }, en);

    return {
        useTranslation: () => ({
            t: (key: string) => {
                const value = getTranslation(key);
                return typeof value === 'string' ? value : key;
            },
        }),
        initReactI18next: { type: '3rdParty', init: () => { } },
    };
});

jest.mock('../../src/theme', () => {
    const { lightColors } = require('../../src/constants/colors');
    return {
        useTheme: () => ({
            theme: {
                colors: lightColors,
            },
        }),
    };
});

jest.mock('../../src/theme/scale', () => ({
    scale: (v: number) => v,
    normalize: (v: number) => v,
    moderateScale: (v: number) => v,
}));

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
            ReactLib.createElement(name, { ...props, ref }, children)
        );

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TextInput: createPrimitive('TextInput'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Platform: { OS: 'ios', select: (obj: any) => obj.ios },
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
        },
    };
});

const en = require('../../src/localization/en.json');

describe('ChatInput', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders translated placeholder and send label', () => {
        const { getByPlaceholderText, getByText } = render(
            <ChatInput value="" onChangeText={jest.fn()} onSend={jest.fn()} />
        );

        expect(getByPlaceholderText(en.chat.typeMessage)).toBeTruthy();
        expect(getByText(en.chat.send)).toBeTruthy();
    });

    it('calls onPlusPress when add button is pressed', () => {
        const onPlusPress = jest.fn();
        const { getByTestId } = render(
            <ChatInput
                value=""
                onChangeText={jest.fn()}
                onSend={jest.fn()}
                onPlusPress={onPlusPress}
            />
        );

        fireEvent.press(getByTestId('chat-plus-button'));
        expect(onPlusPress).toHaveBeenCalled();
    });

    it('calls onChangeText and onTyping for non-empty input', () => {
        const onChangeText = jest.fn();
        const onTyping = jest.fn();
        const { getByPlaceholderText } = render(
            <ChatInput
                value=""
                onChangeText={onChangeText}
                onSend={jest.fn()}
                onTyping={onTyping}
            />
        );

        const input = getByPlaceholderText(en.chat.typeMessage);
        fireEvent.changeText(input, 'Hello');

        expect(onChangeText).toHaveBeenCalledWith('Hello');
        expect(onTyping).toHaveBeenCalled();
    });

    it('does not call onTyping when input is empty', () => {
        const onChangeText = jest.fn();
        const onTyping = jest.fn();
        const { getByPlaceholderText } = render(
            <ChatInput
                value=""
                onChangeText={onChangeText}
                onSend={jest.fn()}
                onTyping={onTyping}
            />
        );

        const input = getByPlaceholderText(en.chat.typeMessage);
        fireEvent.changeText(input, '');

        expect(onChangeText).toHaveBeenCalledWith('');
        expect(onTyping).not.toHaveBeenCalled();
    });

    it('calls onChangeText even when onTyping is not provided', () => {
        const onChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <ChatInput value="" onChangeText={onChangeText} onSend={jest.fn()} />
        );

        fireEvent.changeText(getByPlaceholderText(en.chat.typeMessage), 'Hey');
        expect(onChangeText).toHaveBeenCalledWith('Hey');
    });

    it('calls onSend when send button is pressed', () => {
        const onSend = jest.fn();
        const { getByText } = render(
            <ChatInput value="Hello" onChangeText={jest.fn()} onSend={onSend} />
        );

        const sendText = getByText(en.chat.send);
        fireEvent.press(sendText.parent as any);
        expect(onSend).toHaveBeenCalled();
    });

    it('applies disabled style when value is empty', () => {
        const { getByText } = render(
            <ChatInput value="   " onChangeText={jest.fn()} onSend={jest.fn()} />
        );

        const { StyleSheet } = require('react-native');
        const sendText = getByText(en.chat.send);
        const flattened = StyleSheet.flatten(sendText.props.style);

        expect(flattened.opacity).toBe(0.5);
    });
});
