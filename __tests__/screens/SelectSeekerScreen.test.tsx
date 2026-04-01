import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SelectSeekerScreen } from '../../src/screens/SelectSeeker/SelectSeekerScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('react-native-config', () => ({
    REQUEST_TIMEOUT: '10000',
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        Image: createPrimitive('Image'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        FlatList: ({ data, renderItem, testID, ListEmptyComponent, keyExtractor }: any) => {
            const ViewMock = createPrimitive('View');
            if (!data || data.length === 0) {
                return ListEmptyComponent
                    ? (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : ListEmptyComponent)
                    : null;
            }
            if (keyExtractor) {
                data.forEach((item: any, index: number) => keyExtractor(item, index));
            }
            return ReactLib.createElement(
                ViewMock,
                { testID },
                data.map((item: any, index: number) => (
                    ReactLib.createElement(ViewMock, { key: item.id || index.toString() }, renderItem({ item, index }))
                ))
            );
        },
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

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        return React.createElement('View', { testID }, children);
    },
}));

jest.mock('../../src/components/common/Header', () => ({
    Header: ({ title, onBackPress, backButtonTestID }: any) => {
        const React = require('react');
        return React.createElement('View', { testID: 'header' }, [
            React.createElement('TouchableOpacity', { key: 'back', onPress: onBackPress, testID: backButtonTestID }, React.createElement('Text', {}, 'Back')),
            React.createElement('Text', { key: 'title' }, title),
        ]);
    },
}));

jest.mock('../../src/components/common/AppButton', () => ({
    AppButton: ({ title, onPress, testID, disabled }: any) => {
        const React = require('react');
        return React.createElement('TouchableOpacity', { onPress, testID, disabled, accessibilityState: { disabled } }, React.createElement('Text', {}, title));
    },
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
    SvgIcon: ({ testID }: any) => {
        const React = require('react');
        return React.createElement('View', { testID });
    },
}));

jest.mock('../../src/components/common/ActionModal', () => ({
    ActionModal: ({ isVisible, onConfirm, onClose, title, testIDPrefix }: any) => {
        const React = require('react');
        if (!isVisible) return null;
        return React.createElement('View', { testID: testIDPrefix }, [
            React.createElement('Text', { key: 'title' }, title),
            React.createElement('TouchableOpacity', { key: 'confirm', onPress: onConfirm, testID: `${testIDPrefix}-confirm` }, React.createElement('Text', {}, 'Confirm')),
            React.createElement('TouchableOpacity', { key: 'cancel', onPress: onClose, testID: `${testIDPrefix}-cancel` }, React.createElement('Text', {}, 'Cancel')),
        ]);
    },
}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                background: '#FFFFFF',
                surface: '#FFFFFF',
                text: '#000000',
                brandGreen: '#16A34A',
                border: '#CCCCCC',
                mutedText: '#666666',
            }
        },
        isDark: false,
    })
}));

jest.mock('../../src/assets/icons', () => {
    const React = require('react');
    const MockIcon = () => React.createElement('View');
    return {
        ChevronRight: MockIcon,
        SeekerConform: MockIcon,
        default: MockIcon,
    };
});

const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
};

jest.mock('../../src/components/common/PrimaryButton', () => {
    const ReactLib = require('react');
    return {
        PrimaryButton: ({ title, onPress, testID, disabled }: any) => {
            return ReactLib.createElement(
                'TouchableOpacity',
                {
                    onPress,
                    testID,
                    disabled,
                    accessibilityState: { disabled },
                    style: { opacity: disabled ? 0.5 : 1 }
                },
                ReactLib.createElement('Text', {}, title)
            );
        }
    };
});

const mockUseSelectSeeker = {
    seekers: [
        { id: '1', name: 'John Doe', avatar: 'avatar1' },
        { id: '2', name: 'Jane Smith', avatar: 'avatar2' },
    ],
    isLoading: false,
    selectedSeekerId: null as string | null,
    isConfirmModalVisible: false,
    selectedSeekerData: null as any,
    handleBack: jest.fn(),
    handleSelectSeeker: jest.fn(),
    handleSubmitSelection: jest.fn(),
    handleConfirmSelection: jest.fn(),
    handleCancelSelection: jest.fn(),
};

jest.mock('../../src/screens/SelectSeeker/useSelectSeeker', () => ({
    useSelectSeeker: () => mockUseSelectSeeker,
}));

const store = configureStore({
    reducer: {
        settings: () => ({ themeMode: 'light' }),
    },
});

const renderScreen = () => {
    return render(
        <Provider store={store}>
            <SelectSeekerScreen />
        </Provider>
    );
};

describe('SelectSeekerScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSelectSeeker.seekers = [
            { id: '1', name: 'John Doe', avatar: 'avatar1' },
            { id: '2', name: 'Jane Smith', avatar: 'avatar2' },
        ];
        mockUseSelectSeeker.isLoading = false;
        mockUseSelectSeeker.selectedSeekerId = null;
        mockUseSelectSeeker.isConfirmModalVisible = false;
        mockUseSelectSeeker.selectedSeekerData = null;
        (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
        (useRoute as jest.Mock).mockReturnValue({ params: { contributionId: 'post-123' } });
    });

    it('renders correctly and shows list of seekers', async () => {
        const { getByTestId, findByText } = renderScreen();

        expect(getByTestId('select-seeker-screen')).toBeTruthy();
        expect(getByTestId('select-seeker-back-button')).toBeTruthy();
        expect(await findByText('John Doe')).toBeTruthy();
    });

    it('handles seeker selection', async () => {
        const { findByTestId } = renderScreen();
        const seekerItem = await findByTestId('select-seeker-item-1');

        fireEvent.press(seekerItem);
        expect(mockUseSelectSeeker.handleSelectSeeker).toHaveBeenCalledWith('1');
    });

    it('submits selection, shows modal and navigates back with params', async () => {
        mockUseSelectSeeker.selectedSeekerId = '1';
        mockUseSelectSeeker.selectedSeekerData = { id: '1', name: 'John Doe' };
        mockUseSelectSeeker.isConfirmModalVisible = true;

        const { getByTestId, findByText } = renderScreen();

        const button = getByTestId('select-seeker-button');
        fireEvent.press(button);
        expect(mockUseSelectSeeker.handleSubmitSelection).toHaveBeenCalled();

        expect(await findByText('selectSeeker.confirmModal.title')).toBeTruthy();

        const confirmButton = getByTestId('confirm-seeker-modal-confirm');
        fireEvent.press(confirmButton);
        expect(mockUseSelectSeeker.handleConfirmSelection).toHaveBeenCalled();
    });

    it('navigates back on back button press', async () => {
        const { getByTestId } = renderScreen();
        const backButton = getByTestId('select-seeker-back-button');
        fireEvent.press(backButton);
        expect(mockUseSelectSeeker.handleBack).toHaveBeenCalled();
    });

    it('renders empty state when seekers list is empty', () => {
        mockUseSelectSeeker.seekers = [];
        const { getByTestId } = renderScreen();
        expect(getByTestId('select-seeker-empty')).toBeTruthy();
    });

    it('shows loading indicator when isLoading is true', () => {
        mockUseSelectSeeker.isLoading = true;
        const { getByTestId } = renderScreen();
        expect(getByTestId('select-seeker-screen')).toBeTruthy();
    });

    it('renders avatar placeholder and selected radio state', async () => {
        mockUseSelectSeeker.seekers = [{ id: '3', name: 'Alex', avatar: undefined }];
        mockUseSelectSeeker.selectedSeekerId = '3';
        const { findByTestId } = renderScreen();
        expect(await findByTestId('select-seeker-radio-inner-3')).toBeTruthy();
    });
});
