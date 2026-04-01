import React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { HelpSupportScreen } from '../../src/screens/HelpSupport/HelpSupportScreen';
import { useHelpSupport } from '../../src/screens/HelpSupport/useHelpSupport';
import { ROUTES } from '../../src/constants/routes';

// Mock dependencies
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        ScrollView: createPrimitive('ScrollView'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Modal: createPrimitive('Modal'),
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
        medium: 'System',
    }
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
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

jest.mock('../../src/components/common/RateUsModal', () => ({
    RateUsModal: ({ isVisible, onClose }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        if (!isVisible) return null;
        return React.createElement(View, { testID: 'rate-us-modal' }, [
            React.createElement(Text, { key: 'title' }, 'Rate Us Modal'),
            React.createElement(TouchableOpacity, { key: 'close', onPress: onClose, testID: 'rate-us-modal-close' }, React.createElement(Text, {}, 'Close')),
        ]);
    },
}));

describe('HelpSupportScreen and useHelpSupport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useHelpSupport hook logic', () => {
        it('triggers goBack', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleBack();
            });
            expect(mockGoBack).toHaveBeenCalled();
        });

        it('navigates to FAQs', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleItemPress('FAQs');
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAQS);
        });

        it('navigates to About Us', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleItemPress('About Us');
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ABOUT_US);
        });

        it('navigates to Contact Us', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleItemPress('Contact Us');
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CONTACT_US);
        });

        it('navigates to Terms and condition', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleItemPress('Terms and condition');
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TERMS_CONDITION);
        });

        it('toggles Rate Us modal', () => {
            const { result } = renderHook(() => useHelpSupport());
            expect(result.current.isRateModalVisible).toBe(false);
            act(() => {
                result.current.handleItemPress('Rate Us');
            });
            expect(result.current.isRateModalVisible).toBe(true);
            act(() => {
                result.current.closeRateModal();
            });
            expect(result.current.isRateModalVisible).toBe(false);
        });

        it('handles default branch in switch case', () => {
            const { result } = renderHook(() => useHelpSupport());
            act(() => {
                result.current.handleItemPress('Unknown');
            });
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('HelpSupportScreen UI', () => {
        it('renders correctly', () => {
            const { getByTestId, getByText } = render(<HelpSupportScreen />);

            expect(getByTestId('help-support-screen')).toBeTruthy();
            expect(getByText('helpSupport.title')).toBeTruthy();
            expect(getByText('helpSupport.faqs')).toBeTruthy();
        });

        it('it correctly renders items', () => {
            const { getByTestId } = render(<HelpSupportScreen />);
            expect(getByTestId('help-support-item-faqs')).toBeTruthy();
            expect(getByTestId('help-support-item-about-us')).toBeTruthy();
            expect(getByTestId('help-support-item-contact-us')).toBeTruthy();
            expect(getByTestId('help-support-item-terms')).toBeTruthy();
            expect(getByTestId('help-support-item-rate-us')).toBeTruthy();
        });

        it('navigates when FAQ item is pressed', () => {
            const { getByTestId } = render(<HelpSupportScreen />);
            fireEvent.press(getByTestId('help-support-item-faqs'));
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FAQS);
        });

        it('opens and closes Rate Us modal from the screen', () => {
            const { getByTestId, queryByTestId } = render(<HelpSupportScreen />);
            expect(queryByTestId('rate-us-modal')).toBeNull();

            fireEvent.press(getByTestId('help-support-item-rate-us'));
            expect(getByTestId('rate-us-modal')).toBeTruthy();

            fireEvent.press(getByTestId('rate-us-modal-close'));
            expect(queryByTestId('rate-us-modal')).toBeNull();
        });
    });
});
