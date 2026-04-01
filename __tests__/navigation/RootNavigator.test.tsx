import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnboardingSeen } from '../../src/store/slices/settingsSlice';

// 1. Mock React Native first
jest.mock('react-native', () => {
    const React = require('react');
    const View = ({ children, ...props }: any) => React.createElement('View', props, children);
    const Text = ({ children, ...props }: any) => React.createElement('Text', props, children);
    return {
        ActivityIndicator: () => React.createElement('ActivityIndicator'),
        View,
        Text,
        StyleSheet: {
            create: (obj: any) => obj,
            flatten: (style: any) => style,
        },
        Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
        Dimensions: {
            get: () => ({ width: 320, height: 640, scale: 1, fontScale: 1 }),
        },
    };
});

// 2. Mock other dependencies
jest.mock('../../src/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('../../src/store/slices/authSlice', () => ({
    hydrateAuth: jest.fn(() => ({ type: 'auth/hydrateAuth' })),
}));

jest.mock('../../src/store/slices/settingsSlice', () => ({
    setOnboardingSeen: jest.fn(() => ({ type: 'settings/setOnboardingSeen' })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => {
        const React = require('react');
        return {
            Navigator: ({ children }: any) => <>{children}</>,
            Screen: ({ component: Component }: any) => <Component />,
        };
    },
}));

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => <>{children}</>,
    DefaultTheme: { colors: { background: 'white', surface: 'white', border: 'black', text: 'black', primary: 'blue' } },
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: null,
}));

jest.mock('react-native-elements', () => {
    const React = require('react');
    return {
        Button: ({ title, children, ...props }: any) =>
            React.createElement('Button', props, children ?? title),
    };
});

jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    return ({ testID, ...props }: any) =>
        React.createElement('DateTimePicker', { testID, ...props });
});

jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => {
        const React = require('react');
        return {
            Navigator: ({ children }: any) => <>{children}</>,
            Screen: ({ component: Component }: any) => <Component />,
        };
    },
}));

jest.mock('react-native-image-picker', () => ({
    launchCamera: jest.fn(),
    launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {},
    RESULTS: {},
}));

jest.mock('react-native-share', () => ({
    open: jest.fn(),
}));

jest.mock('react-native-html-to-pdf', () => ({
    generatePDF: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
    const React = require('react');
    return {
        GestureHandlerRootView: ({ children }: any) => React.createElement('View', {}, children),
        TouchableOpacity: ({ children, ...props }: any) => React.createElement('TouchableOpacity', props, children),
        ScrollView: ({ children, ...props }: any) => React.createElement('ScrollView', props, children),
        PanGestureHandler: ({ children }: any) => children,
        GestureDetector: ({ children }: any) => children,
        State: {},
        Directions: {},
    };
});

jest.mock('react-native-reanimated-carousel', () => {
    const React = require('react');
    return ({ children }: any) => React.createElement('Carousel', {}, children);
});

jest.mock('react-native-google-places-autocomplete', () => ({
    GooglePlacesAutocomplete: () => null,
}));

jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: any) => React.createElement('Pdf', props);
});

jest.mock('../../src/navigation/SocketProvider', () => ({
    SocketProvider: ({ children }: any) => children,
}));

// 3. Mock Screens
jest.mock('../../src/screens/Onboarding/OnboardingScreen', () => ({
    OnboardingScreen: () => {
        const { Text } = require('react-native');
        return <Text>Onboarding Screen</Text>;
    },
}));
jest.mock('../../src/navigation/AuthNavigator', () => ({
    AuthNavigator: () => {
        const { Text } = require('react-native');
        return <Text>Auth Navigator</Text>;
    },
}));
jest.mock('../../src/navigation/HomeNavigator', () => ({
    HomeNavigator: () => {
        const { Text } = require('react-native');
        return <Text>Home Navigator</Text>;
    },
}));
jest.mock('../../src/screens/Login/LoginScreen', () => ({
    LoginScreen: () => {
        const { Text } = require('react-native');
        return <Text>Login Screen</Text>;
    },
}));
jest.mock('../../src/screens/ForgotPassword/ForgotPasswordScreen', () => ({
    ForgotPasswordScreen: () => {
        const { Text } = require('react-native');
        return <Text>Forgot Password Screen</Text>;
    },
}));
jest.mock('../../src/screens/ResetPassword/ResetPasswordScreen', () => ({
    ResetPasswordScreen: () => {
        const { Text } = require('react-native');
        return <Text>Reset Password Screen</Text>;
    },
}));
jest.mock('../../src/screens/ResetPasswordSuccess/ResetPasswordSuccessScreen', () => ({
    ResetPasswordSuccessScreen: () => {
        const { Text } = require('react-native');
        return <Text>Reset Password Success Screen</Text>;
    },
}));

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: { colors: { background: 'white', primary: 'blue', surface: 'gray', border: 'black', text: 'black' } }
    }),
}));

const getRootNavigator = () => require('../../src/navigation/RootNavigator').RootNavigator;

describe('RootNavigator', () => {
    const mockDispatch = jest.fn();
    const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('renders loading state initially', async () => {
        (useAppSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                auth: { isLoading: true, isAuthenticated: false },
                settings: { hasSeenOnboarding: false }
            })
        );

        const RootNavigator = getRootNavigator();
        const { toJSON } = render(<RootNavigator />);
        expect(toJSON()).toBeNull();
        await act(async () => {
            await flushPromises();
        });
    });

    it('shows OnboardingStack when HAS_SEEN_ONBOARDING is false', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (useAppSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                auth: { isLoading: false, isAuthenticated: false },
                settings: { hasSeenOnboarding: false }
            })
        );

        const RootNavigator = getRootNavigator();
        const { findByText } = render(<RootNavigator />);

        await waitFor(() => {
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('HAS_SEEN_ONBOARDING');
        });
        await act(async () => {
            await flushPromises();
        });
        expect(await findByText('Onboarding Screen')).toBeTruthy();
    });

    it('shows AuthStack when HAS_SEEN_ONBOARDING is true but not authenticated', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
        (useAppSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                auth: { isLoading: false, isAuthenticated: false },
                settings: { hasSeenOnboarding: true }
            })
        );

        const RootNavigator = getRootNavigator();
        const { findByText } = render(<RootNavigator />);

        await act(async () => {
            await flushPromises();
        });
        expect(await findByText('Auth Navigator')).toBeTruthy();
    });

    it('shows AppStack when HAS_SEEN_ONBOARDING is true and authenticated', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
        (useAppSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                auth: { isLoading: false, isAuthenticated: true },
                settings: { hasSeenOnboarding: true }
            })
        );

        const RootNavigator = getRootNavigator();
        const { findByText } = render(<RootNavigator />);

        await act(async () => {
            await flushPromises();
        });
        expect(await findByText('Home Navigator')).toBeTruthy();
    });

    it('simulates uninstall (cleared storage) -> shows Onboarding', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (useAppSelector as jest.Mock).mockImplementation((selector) =>
            selector({
                auth: { isLoading: false, isAuthenticated: false },
                settings: { hasSeenOnboarding: false }
            })
        );

        const RootNavigator = getRootNavigator();
        const { findByText } = render(<RootNavigator />);

        await act(async () => {
            await flushPromises();
        });
        expect(await findByText('Onboarding Screen')).toBeTruthy();

        await waitFor(() => {
            expect(setOnboardingSeen).toHaveBeenCalledWith(false);
        });
    });
});
