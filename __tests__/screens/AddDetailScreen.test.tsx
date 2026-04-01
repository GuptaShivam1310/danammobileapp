import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

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
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock dependencies
jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                text: '#000',
                primary: '#007AFF',
                mutedText: '#666',
                danger: '#FF3B30',
                surface: '#fff',
                border: '#ccc',
                background: '#fafafa',
            }
        }
    })
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: any) => children,
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        params: {},
    }),
}));

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (val: number) => val,
    verticalScale: (val: number) => val,
    scale: (val: number) => val,
    normalize: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
    fonts: {
        bold: 'System',
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
    },
}));

import { AddDetailScreen } from '../../src/screens/AddDetail/AddDetailScreen';
import postReducer from '../../src/store/slices/postSlice';
import en from '../../src/localization/en.json';

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
            ReactLib.createElement(name, { ...props, ref }, children)
        );

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        ScrollView: createPrimitive('ScrollView'),
        TextInput: createPrimitive('TextInput'),
        FlatList: ({ data, renderItem, testID }: any) => {
            const View = createPrimitive('View');
            return ReactLib.createElement(
                View,
                { testID },
                data.map((item: any, index: number) => renderItem({ item, index }))
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

jest.mock('../../src/components/common/AppInput', () => {
    const { View, Text, TextInput } = require('react-native');
    const React = require('react');
    return {
        AppInput: ({ label, value, onChangeText, placeholder, testID }: any) => (
            <View>
                {label && <Text>{label}</Text>}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    testID={testID}
                />
            </View>
        ),
    };
});

jest.mock('../../src/components/common/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        PrimaryButton: ({ title, onPress, testID }: any) => (
            <TouchableOpacity onPress={onPress} testID={testID}>
                <Text>{title}</Text>
            </TouchableOpacity>
        ),
    };
});

const renderWithProviders = (component: React.ReactElement) => {
    const store = configureStore({
        reducer: {
            post: postReducer,
        },
    });
    return render(<Provider store={store}>{component}</Provider>);
};

describe('AddDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(<AddDetailScreen />);

        expect(getByTestId('add-detail-header')).toBeTruthy();
        expect(getByText(en.addDetail.title)).toBeTruthy();
        expect(getByPlaceholderText(en.addDetail.placeholderTitle)).toBeTruthy();
    });

    it('updates title and description on typing', () => {
        const { getByTestId } = renderWithProviders(<AddDetailScreen />);
        const titleInput = getByTestId('title-input');
        const descriptionInput = getByTestId('description-input');

        fireEvent.changeText(titleInput, 'New Title');
        expect(titleInput.props.value).toBe('New Title');

        fireEvent.changeText(descriptionInput, 'New Description');
        expect(descriptionInput.props.value).toBe('New Description');
    });

    it('navigates to UploadImages on next button press', async () => {
        const { getByTestId } = renderWithProviders(<AddDetailScreen />);
        const titleInput = getByTestId('title-input');
        const descriptionInput = getByTestId('description-input');
        const nextButton = getByTestId('add-detail-next-button');

        fireEvent.changeText(titleInput, 'Valid Title');
        fireEvent.changeText(descriptionInput, 'Valid Description');
        fireEvent.press(nextButton);

        expect(mockNavigate).toHaveBeenCalledWith('UploadImages');
    });

    it('navigates back when back button pressed', () => {
        const { getByTestId } = renderWithProviders(<AddDetailScreen />);
        const backButton = getByTestId('add-detail-back-button');

        fireEvent.press(backButton);
        expect(mockGoBack).toHaveBeenCalled();
    });
});
