import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LogoutModal } from '../../src/components/common/LogoutModal';

// Mock dependencies
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
    initReactI18next: { type: '3rdParty', init: () => {} },
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Modal: createPrimitive('Modal'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
    };
});

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                text: '#000',
                brandGreen: '#0B6B4F',
                mutedText: '#666',
                surface: '#FFF',
                border: '#EEE',
            }
        }
    })
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
        semiBold: 'System',
    }
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
    SvgIcon: 'SvgIcon',
}));

jest.mock('../../src/assets/icons/signout.svg', () => 'SignOutIcon');

describe('LogoutModal', () => {
    const defaultProps = {
        isVisible: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    };

    it('renders correctly when visible', () => {
        const { getByText, getByTestId } = render(<LogoutModal {...defaultProps} />);

        expect(getByText('logoutModal.title')).toBeTruthy();
        expect(getByText('logoutModal.subtitle')).toBeTruthy();
        expect(getByTestId('logout-modal-cancel')).toBeTruthy();
        expect(getByTestId('logout-modal-confirm')).toBeTruthy();
    });

    it('calls onClose when cancel button is pressed', () => {
        const { getByTestId } = render(<LogoutModal {...defaultProps} />);
        const cancelButton = getByTestId('logout-modal-cancel');

        fireEvent.press(cancelButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onConfirm when confirm button is pressed', () => {
        const { getByTestId } = render(<LogoutModal {...defaultProps} />);
        const confirmButton = getByTestId('logout-modal-confirm');

        fireEvent.press(confirmButton);
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
});
