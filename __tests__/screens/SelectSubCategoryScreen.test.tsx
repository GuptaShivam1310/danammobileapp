import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SelectSubCategoryScreen } from '../../src/screens/SelectSubCategory/SelectSubCategoryScreen';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postApi } from '../../src/services/api/postApi';
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

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('../../src/services/api/postApi', () => ({
    postApi: {
        getSubCategories: jest.fn(),
    },
}));

// ... (other mocks kept)
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
        return React.createElement(View, { testID: 'header' }, [
            React.createElement(TouchableOpacity, { key: 'back', onPress: onBackPress, testID: backButtonTestID }, React.createElement(Text, {}, 'Back')),
            React.createElement(Text, { key: 'title' }, title),
        ]);
    },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

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

jest.mock('../../src/components/common/SvgIcon', () => ({
    SvgIcon: ({ testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID });
    },
}));

jest.mock('../../src/assets/icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockIcon = () => React.createElement(View);
    return {
        ChevronRight: MockIcon,
        SeekerConform: MockIcon,
    };
});

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        FlatList: ({ data, renderItem, testID, ListEmptyComponent }: any) => {
            const View = createPrimitive('View');
            return ReactLib.createElement(
                View,
                { testID },
                data && data.length > 0
                    ? data.map((item: any, index: number) =>
                        ReactLib.createElement(ReactLib.Fragment, { key: item?.id ?? index }, renderItem({ item, index }))
                    )
                    : ListEmptyComponent
            );
        },
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
    };
});

describe('SelectSubCategoryScreen', () => {
    const mockDispatch = jest.fn();
    const mockGoBack = jest.fn();
    const mockNavigate = jest.fn();
    const mockSubCategories = [
        { id: '1', name: 'Mountain Bikes' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: mockGoBack,
            navigate: mockNavigate,
        });
        (useRoute as jest.Mock).mockReturnValue({
            params: { categoryId: '1', categoryName: 'Test Category' }
        });
        (useSelector as unknown as jest.Mock).mockReturnValue({ categoryId: '1' });
        (postApi.getSubCategories as jest.Mock).mockResolvedValue({ data: mockSubCategories });
    });

    it('renders loading state initially', async () => {
        let resolve: any;
        (postApi.getSubCategories as jest.Mock).mockReturnValue(new Promise(res => { resolve = res; }));

        const { getByTestId } = render(<SelectSubCategoryScreen />);
        expect(getByTestId('loading-indicator')).toBeTruthy();

        await waitFor(() => resolve({ data: mockSubCategories }));
    });

    it('renders error state when API fails', async () => {
        (postApi.getSubCategories as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { findByTestId } = render(<SelectSubCategoryScreen />);
        expect(await findByTestId('error-state')).toBeTruthy();
    });

    it('renders list of subcategories when successful', async () => {
        const { getByText, findByText } = render(<SelectSubCategoryScreen />);

        await findByText('Mountain Bikes');
        expect(getByText('Mountain Bikes')).toBeTruthy();
        expect(getByText('Test Category')).toBeTruthy();
    });

    it('navigates back when back button pressed', async () => {
        const { findByTestId } = render(<SelectSubCategoryScreen />);
        const backButton = await findByTestId('select-subcategory-back-button');
        fireEvent.press(backButton);

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('triggers subcategory press and navigates', async () => {
        const { findByTestId } = render(<SelectSubCategoryScreen />);
        const item = await findByTestId('subcategory-item-1');
        fireEvent.press(item);

        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ADD_POST_DETAIL);
    });
});
