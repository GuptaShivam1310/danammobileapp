import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { FAQsScreen } from '../../src/screens/FAQs/FAQsScreen';
import { useFAQs } from '../../src/screens/FAQs/useFAQs';
import { supportApi } from '../../src/services/api/supportApi';

// Mock dependencies
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

jest.mock('../../src/services/api/supportApi', () => ({
    supportApi: {
        getFaqs: jest.fn(),
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
        FlatList: ({ data, renderItem }: any) => {
            return ReactLib.createElement('View', { testID: 'faq-list' },
                data.map((item: any, index: number) =>
                    ReactLib.createElement(ReactLib.Fragment, { key: item?.id ?? index }, renderItem({ item, index }))
                )
            );
        },
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        ScrollView: createPrimitive('ScrollView'),
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
        medium: 'System',
    }
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
        return React.createElement(View, {}, [
            React.createElement(TouchableOpacity, { key: 'back', onPress: onBackPress, testID: backButtonTestID }, React.createElement(Text, {}, 'Back')),
            React.createElement(Text, { key: 'title' }, title),
        ]);
    },
}));

jest.mock('../../src/components/common/AppLoader', () => ({
    AppLoader: () => {
        const React = require('react');
        const { View, Text } = require('react-native');
        return React.createElement(View, { testID: 'app-loader' }, React.createElement(Text, {}, 'Loading...'));
    },
}));

describe('FAQs Hooks and Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useFAQs hook', () => {
        it('fetches FAQs on mount', async () => {
            const mockFaqs = { data: [{ id: '1', question: 'Q1', answer: 'A1', created_at: '' }] };
            (supportApi.getFaqs as jest.Mock).mockResolvedValue(mockFaqs);

            const { result } = renderHook(() => useFAQs());

            expect(result.current.loading).toBe(true);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(supportApi.getFaqs).toHaveBeenCalled();
            expect(result.current.faqs).toEqual(mockFaqs.data);
            expect(result.current.loading).toBe(false);
        });

        it('handles API error', async () => {
            (supportApi.getFaqs as jest.Mock).mockRejectedValue(new Error('API Error'));

            const { result } = renderHook(() => useFAQs());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.error).toBe('API Error');
            expect(result.current.loading).toBe(false);
        });
    });

    describe('FAQsScreen UI', () => {
        it('renders correctly with FAQs', async () => {
            const mockFaqs = { data: [{ id: '1', question: 'Question 1', answer: 'Answer 1', created_at: '' }] };
            (supportApi.getFaqs as jest.Mock).mockResolvedValue(mockFaqs);

            const { getByTestId, getByText } = render(<FAQsScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(getByTestId('faqs-screen')).toBeTruthy();
            expect(getByText('Question 1')).toBeTruthy();
        });

        it('shows loading state initially', () => {
            (supportApi.getFaqs as jest.Mock).mockReturnValue(new Promise(() => { }));
            const { getByTestId } = render(<FAQsScreen />);
            expect(getByTestId('app-loader')).toBeTruthy();
        });

        it('shows error state from hook', async () => {
            (supportApi.getFaqs as jest.Mock).mockRejectedValue(new Error('Network Error'));
            const { getByText } = render(<FAQsScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(getByText('Network Error')).toBeTruthy();
        });

        it('triggers handleBack when back button is pressed', async () => {
            (supportApi.getFaqs as jest.Mock).mockResolvedValue({ data: [] });
            const { getByTestId } = render(<FAQsScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            const backButton = getByTestId('faqs-back-button');
            fireEvent.press(backButton);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
