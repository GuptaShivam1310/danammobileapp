import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/screens/Settings/SettingsScreen';

const en = require('../../src/localization/en.json');

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
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TextInput: createPrimitive('TextInput'),
        ScrollView: createPrimitive('ScrollView'),
        Switch: createPrimitive('Switch'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Modal: createPrimitive('Modal'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
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
    }
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID: testID || 'screen-wrapper' }, children);
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

let mockUseSettings = {
    receiveUpdates: true,
    nearestDanam: false,
    hideIdentity: true,
    isLoading: false,
    isDeleteModalVisible: false,
    isPasswordModalVisible: false,
    isDeleting: false,
    handleToggleUpdates: jest.fn(),
    handleToggleNearest: jest.fn(),
    handleToggleIdentity: jest.fn(),
    handleDeleteAccount: jest.fn(),
    handleConfirmDelete: jest.fn(),
    handlePasswordConfirm: jest.fn(),
    handleCloseDeleteModal: jest.fn(),
    handleClosePasswordModal: jest.fn(),
    handleBack: jest.fn(),
};

jest.mock('../../src/screens/Settings/useSettings', () => ({
    useSettings: () => mockUseSettings,
}));

// Mock child components to simplify testing
jest.mock('../../src/components/common/DeleteAccountModal', () => ({
    DeleteAccountModal: ({ isVisible, onConfirm }: any) => {
        const React = require('react');
        if (!isVisible) return null;
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View testID="delete-account-modal">
                <TouchableOpacity testID="delete-account-modal-confirm" onPress={onConfirm}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
        );
    }
}));

jest.mock('../../src/components/common/PasswordConfirmationModal', () => ({
    PasswordConfirmationModal: ({ isVisible, onConfirm }: any) => {
        const React = require('react');
        if (!isVisible) return null;
        const { View, TouchableOpacity, Text, TextInput } = require('react-native');
        return (
            <View testID="password-confirmation-modal">
                <TextInput testID="delete-account-password-input" />
                <TouchableOpacity testID="password-confirm-modal-confirm" onPress={() => onConfirm('password123')}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
        );
    }
}));

describe('SettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSettings = {
            receiveUpdates: true,
            nearestDanam: false,
            hideIdentity: true,
            isLoading: false,
            isDeleteModalVisible: false,
            isPasswordModalVisible: false,
            isDeleting: false,
            handleToggleUpdates: jest.fn(),
            handleToggleNearest: jest.fn(),
            handleToggleIdentity: jest.fn(),
            handleDeleteAccount: jest.fn(),
            handleConfirmDelete: jest.fn(),
            handlePasswordConfirm: jest.fn(),
            handleCloseDeleteModal: jest.fn(),
            handleClosePasswordModal: jest.fn(),
            handleBack: jest.fn(),
        };
    });

    it('renders correctly', () => {
        const { getByTestId, getByText } = render(<SettingsScreen />);

        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(getByText(en.settings.title)).toBeTruthy();
        expect(getByText(en.settings.receiveUpdates)).toBeTruthy();
    });

    it('renders loading state correctly', () => {
        mockUseSettings.isLoading = true;
        const { getByTestId } = render(<SettingsScreen />);
        // Checking for standard ScrollView presence or some other indicator
        // Since the loading branch doesn't have a specific testID on the view, we'll just check if it renders without crashing
        expect(getByTestId('screen-wrapper')).toBeDefined();
    });

    it('triggers handleToggleUpdates when switch is toggled', () => {
        const { getByTestId } = render(<SettingsScreen />);
        const switchBtn = getByTestId('settings-toggle-updates');

        fireEvent(switchBtn, 'onValueChange', false);
        expect(mockUseSettings.handleToggleUpdates).toHaveBeenCalledWith(false);
    });

    it('triggers handleToggleNearest when switch is toggled', () => {
        const { getByTestId } = render(<SettingsScreen />);
        const switchBtn = getByTestId('settings-toggle-nearest');

        fireEvent(switchBtn, 'onValueChange', true);
        expect(mockUseSettings.handleToggleNearest).toHaveBeenCalledWith(true);
    });

    it('triggers handleToggleIdentity when switch is toggled', () => {
        const { getByTestId } = render(<SettingsScreen />);
        const switchBtn = getByTestId('settings-toggle-hide-identity');

        fireEvent(switchBtn, 'onValueChange', true);
        expect(mockUseSettings.handleToggleIdentity).toHaveBeenCalledWith(true);
    });

    it('triggers handleDeleteAccount when delete account row is pressed', () => {
        const { getByTestId } = render(<SettingsScreen />);
        const deleteRow = getByTestId('settings-delete-account-row');

        fireEvent.press(deleteRow);
        expect(mockUseSettings.handleDeleteAccount).toHaveBeenCalled();
    });

    it('shows DeleteAccountModal when isDeleteModalVisible is true', () => {
        mockUseSettings.isDeleteModalVisible = true;
        const { getByTestId } = render(<SettingsScreen />);
        expect(getByTestId('delete-account-modal')).toBeTruthy();

        fireEvent.press(getByTestId('delete-account-modal-confirm'));
        expect(mockUseSettings.handleConfirmDelete).toHaveBeenCalled();
    });

    it('shows PasswordConfirmationModal when isPasswordModalVisible is true', () => {
        mockUseSettings.isPasswordModalVisible = true;
        const { getByTestId } = render(<SettingsScreen />);
        expect(getByTestId('password-confirmation-modal')).toBeTruthy();

        fireEvent.press(getByTestId('password-confirm-modal-confirm'));
        expect(mockUseSettings.handlePasswordConfirm).toHaveBeenCalledWith('password123');
    });
});
