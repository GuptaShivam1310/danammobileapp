import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { AboutUsScreen } from '../../src/screens/AboutUs/AboutUsScreen';
import { useAboutUs } from '../../src/screens/AboutUs/useAboutUs';
import { supportApi } from '../../src/services/api/supportApi';

// Mock dependencies
jest.mock('react-native-fast-image', () => {
    const React = require('react');
    const { View } = require('react-native');
    const FastImage = ({ testID, source }: any) => React.createElement(View, { testID, source });
    FastImage.resizeMode = { cover: 'cover' };
    FastImage.priority = { normal: 'normal' };
    return FastImage;
});

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        goBack: mockGoBack,
    }),
}));

jest.mock('../../src/services/api/supportApi', () => ({
    supportApi: {
        getAbout: jest.fn(),
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

describe('AboutUs Hooks and Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useAboutUs hook', () => {
        it('fetches About Us data on mount', async () => {
            const mockData = {
                title: 'About Us',
                description: 'Test description',
                image_url: 'http://image.png'
            };
            (supportApi.getAbout as jest.Mock).mockResolvedValue(mockData);

            const { result } = renderHook(() => useAboutUs());

            expect(result.current.loading).toBe(true);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(supportApi.getAbout).toHaveBeenCalled();
            expect(result.current.aboutData).toEqual(mockData);
            expect(result.current.loading).toBe(false);
        });
    });

    describe('AboutUsScreen UI', () => {
        it('renders correctly with API data', async () => {
            (supportApi.getAbout as jest.Mock).mockResolvedValue({
                title: 'About Us API',
                description: 'Description from API',
                image_url: 'https://example.com/image.png'
            });

            const { getByTestId, getByText } = render(<AboutUsScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(getByTestId('about-us-screen')).toBeTruthy();
            expect(getByTestId('about-us-image')).toBeTruthy();
            expect(getByText('About Us API')).toBeTruthy();
            expect(getByText('Description from API')).toBeTruthy();
        });

        it('shows loading state initially', () => {
            (supportApi.getAbout as jest.Mock).mockReturnValue(new Promise(() => { }));
            const { getByTestId } = render(<AboutUsScreen />);
            expect(getByTestId('app-loader')).toBeTruthy();
        });

        it('triggers handleBack when back button is pressed', async () => {
            (supportApi.getAbout as jest.Mock).mockResolvedValue({ title: '', description: '', image_url: '' });
            const { getByTestId } = render(<AboutUsScreen />);

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            const backButton = getByTestId('about-us-back-button');
            fireEvent.press(backButton);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
