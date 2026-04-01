import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { TermsConditionScreen } from '../../src/screens/TermsCondition/TermsConditionScreen';
import { useTermsCondition } from '../../src/screens/TermsCondition/useTermsCondition';
import { supportApi } from '../../src/services/api/supportApi';

// Mock dependencies
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

jest.mock('../../src/services/api/supportApi', () => ({
    supportApi: {
        getTerms: jest.fn(),
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
        ScrollView: createPrimitive('ScrollView'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
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
                surface: '#FFF',
                text: '#000',
                mutedText: '#666',
                brandGreen: '#0B6B4F',
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

describe('TermsConditions Hooks and Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useTermsCondition hook', () => {
        it('fetches Terms data on mount', async () => {
            const mockData = {
                title: 'Terms',
                content: 'Policy content'
            };
            (supportApi.getTerms as jest.Mock).mockResolvedValue(mockData);

            const { result } = renderHook(() => useTermsCondition());

            expect(result.current.loading).toBe(true);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(supportApi.getTerms).toHaveBeenCalled();
            expect(result.current.termsData).toEqual(mockData);
            expect(result.current.loading).toBe(false);
        });
    });

    describe('TermsConditionScreen UI', () => {
        it('renders correctly with API data', async () => {
            (supportApi.getTerms as jest.Mock).mockResolvedValue({
                title: 'API Terms',
                content: 'Section 1\n\nSection 2\n\n- Point 1\n- Point 2'
            });

            const { getByTestId, getByText } = render(<TermsConditionScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(getByTestId('terms-condition-screen')).toBeTruthy();
            expect(getByText('API Terms')).toBeTruthy();
            expect(getByText('Section 1')).toBeTruthy();
            expect(getByText('Point 1')).toBeTruthy();
        });

        it('shows loading state initially', () => {
            (supportApi.getTerms as jest.Mock).mockReturnValue(new Promise(() => { }));
            const { getByTestId } = render(<TermsConditionScreen />);
            expect(getByTestId('app-loader')).toBeTruthy();
        });

        it('triggers handleBack when back button is pressed', async () => {
            (supportApi.getTerms as jest.Mock).mockResolvedValue({ title: '', content: '' });
            const { getByTestId } = render(<TermsConditionScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            const backButton = getByTestId('terms-back-button');
            fireEvent.press(backButton);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
