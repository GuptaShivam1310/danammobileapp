import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DeleteAccountModal } from '../../src/components/common/DeleteAccountModal';

jest.mock('react-native', () => {
    const React = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => React.createElement(name, props, children);
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    };
});

// Mock theme
jest.mock('../../src/theme', () => ({
    useTheme: jest.fn(),
}));

// Mock fonts
jest.mock('../../src/theme/fonts', () => ({
    fonts: {
        bold: 'System-Bold',
        regular: 'System-Regular',
        semiBold: 'System-SemiBold',
    },
}));

jest.mock('react-i18next', () => {
    const en = require('../../src/localization/en.json');
    return {
        useTranslation: () => ({
            t: (key: string) => {
                const keys = key.split('.');
                let val: any = en;
                for (const k of keys) {
                    val = val?.[k];
                }
                return typeof val === 'string' ? val : key;
            },
        }),
        initReactI18next: { type: '3rdParty', init: () => {} },
    };
});

jest.mock('../../src/components/common/ActionModal', () => ({
    __esModule: true,
    ActionModal: ({
        title,
        subtitle,
        cancelText,
        confirmText,
        testIDPrefix,
        onClose,
        onConfirm,
        confirmButtonColor,
        icon,
    }: any) => {
        const React = require('react');
        const subtitleText = Array.isArray(subtitle) ? subtitle.join(' ') : subtitle;
        return React.createElement('View', { testID: 'action-modal', confirmButtonColor, icon }, [
            React.createElement('Text', { key: 'title' }, title),
            React.createElement('Text', { key: 'subtitle' }, subtitleText),
            React.createElement(
                'TouchableOpacity',
                { key: 'cancel', testID: `${testIDPrefix}-cancel`, onPress: onClose },
                React.createElement('Text', {}, cancelText)
            ),
            React.createElement(
                'TouchableOpacity',
                { key: 'confirm', testID: `${testIDPrefix}-confirm`, onPress: onConfirm },
                React.createElement('Text', {}, confirmText)
            ),
        ]);
    },
}));

// Mock SvgIcon component
jest.mock('../../src/components/common/SvgIcon', () => ({
    SvgIcon: (props: any) => {
        const { View } = require('react-native');
        return <View testID="mock-svg-icon" />;
    },
}));

// Mock theme scale
jest.mock('../../src/theme/scale', () => ({
    normalize: (size: number) => size,
    scale: (size: number) => size,
    verticalScale: (size: number) => size,
    moderateScale: (size: number) => size,
}));


describe('DeleteAccountModal', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();
    const defaultTheme = {
        colors: {
            surface: '#FFFFFF',
            text: '#000000',
            mutedText: '#666666',
            border: '#DDDDDD',
            brandGreen: '#00FF00',
            danger: '#FF0000',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        const { useTheme } = require('../../src/theme');
        (useTheme as jest.Mock).mockReturnValue({ theme: defaultTheme });
    });

    it('renders correctly when visible', () => {
        const { getByText, getByTestId, debug } = render(
            <DeleteAccountModal
                isVisible={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );
        debug();

        expect(getByText('Delete Account')).toBeTruthy();
        expect(getByText('Are you sure you want to delete your account permanently?')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
        expect(getByText('Confirm')).toBeTruthy();

        // Check buttons exist
        expect(getByTestId('delete-account-modal-cancel')).toBeTruthy();
        expect(getByTestId('delete-account-modal-confirm')).toBeTruthy();
    });

    it('calls onClose when cancel button is pressed', () => {
        const { getByTestId } = render(
            <DeleteAccountModal
                isVisible={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        fireEvent.press(getByTestId('delete-account-modal-cancel'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when confirm button is pressed', () => {
        const { getByTestId } = render(
            <DeleteAccountModal
                isVisible={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        fireEvent.press(getByTestId('delete-account-modal-confirm'));
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('passes danger color to ActionModal confirmButtonColor when provided', () => {
        const { getByTestId } = render(
            <DeleteAccountModal
                isVisible={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(getByTestId('action-modal').props.confirmButtonColor).toBe('#FF0000');
    });

    it('falls back to palette color when danger color is missing', () => {
        const { useTheme } = require('../../src/theme');
        (useTheme as jest.Mock).mockReturnValue({
            theme: { colors: { ...defaultTheme.colors, danger: undefined } },
        });

        const { getByTestId } = render(
            <DeleteAccountModal
                isVisible={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(getByTestId('action-modal').props.confirmButtonColor).toBe('#E11D48');
    });
});
