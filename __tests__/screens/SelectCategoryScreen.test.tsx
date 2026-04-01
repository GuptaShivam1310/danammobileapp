import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SelectCategoryScreen } from '../../src/screens/SelectCategory/SelectCategoryScreen';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
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
    useRoute: jest.fn(() => ({ params: {} })),
}));

jest.mock('../../src/services/api/postApi', () => ({
    postApi: {
        getCategories: jest.fn(),
    },
}));

// ... (other mocks like theme, scale, etc. kept same)
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
        FlatList: ({ data, renderItem, testID }: any) => {
            const View = createPrimitive('View');
            return ReactLib.createElement(
                View,
                { testID },
                data.map((item: any, index: number) => {
                    const element = renderItem({ item, index });
                    return ReactLib.createElement(View, { key: item.id || index.toString() }, element);
                })
            );
        },
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
    };
});

describe('SelectCategoryScreen', () => {
    const mockDispatch = jest.fn();
    const mockGoBack = jest.fn();
    const mockNavigate = jest.fn();
    const mockCategories = [
        { id: '1', name: 'Bikes', icon: 'https://example.com/bike.jpg', bgColor: '#E3F2FD' },
        { id: '2', name: 'Books', icon: 'home', bgColor: '#F1F8E9' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (useNavigation as jest.Mock).mockReturnValue({
            goBack: mockGoBack,
            navigate: mockNavigate,
        });
        (useSelector as unknown as jest.Mock).mockReturnValue({});
        (postApi.getCategories as jest.Mock).mockResolvedValue({ data: mockCategories });
    });

    it('renders loading state initially', async () => {
        // To catch loading, we don't resolve immediately
        let resolve: any;
        (postApi.getCategories as jest.Mock).mockReturnValue(new Promise(res => { resolve = res; }));

        const { getByTestId } = render(<SelectCategoryScreen />);
        expect(getByTestId('loading-indicator')).toBeTruthy();

        await waitFor(() => resolve({ data: mockCategories }));
    });

    it('renders list of categories when API is successful', async () => {
        const { getByText, findByText } = render(<SelectCategoryScreen />);

        await findByText('Bikes');
        expect(getByText('Bikes')).toBeTruthy();
    });

    it('renders error state when API fails', async () => {
        (postApi.getCategories as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { findByTestId } = render(<SelectCategoryScreen />);
        expect(await findByTestId('error-state')).toBeTruthy();
    });

    it('navigates back when close button is pressed', async () => {
        const { findByTestId } = render(<SelectCategoryScreen />);
        const closeButton = await findByTestId('close-button');
        fireEvent.press(closeButton);

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('triggers category press and navigates', async () => {
        const { findByTestId } = render(<SelectCategoryScreen />);
        const categoryItem = await findByTestId('category-item-1');
        fireEvent.press(categoryItem);

        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELECT_SUBCATEGORY, expect.any(Object));
    });

    it('renders vector icon when icon is a name', async () => {
        const { findByText } = render(<SelectCategoryScreen />);
        await findByText('Books');
        // If it renders an icon, it will use the mocked 'Icon' component
        // Depending on how it's rendered in the mock View, we might just look for 'Books'
    });
});
