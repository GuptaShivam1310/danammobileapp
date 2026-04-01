import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
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
            },
            spacing: {
                lg: 16,
                md: 12,
                sm: 8,
                xs: 4,
            }
        }
    })
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: any) => children,
}));

jest.mock('../../src/components/common/Header', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    const React = require('react');
    return {
        Header: ({ title, onBackPress, testID, backButtonTestID }: any) => (
            <View testID={testID} accessibilityLabel="select-location-header">
                <TouchableOpacity onPress={onBackPress} testID={backButtonTestID || 'header-back-button'}>
                    <Text>Back</Text>
                </TouchableOpacity>
                <Text>{title}</Text>
            </View>
        ),
    };
});

jest.mock('../../src/components/common/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        PrimaryButton: ({ title, onPress, testID, disabled, accessibilityState }: any) => (
            <TouchableOpacity onPress={onPress} testID={testID} accessibilityState={accessibilityState} disabled={disabled}>
                <Text>{title}</Text>
            </TouchableOpacity>
        ),
    };
});

jest.mock('../../src/components/common/SvgIcon', () => {
    const { View } = require('react-native');
    const React = require('react');
    return {
        SvgIcon: ({ testID }: any) => <View testID={testID} />,
    };
});

jest.mock('../../src/components/common/LocationCard', () => {
    const { TouchableOpacity, Text } = require('react-native');
    const React = require('react');
    return {
        LocationCard: ({ title, onPress, testID }: any) => (
            <TouchableOpacity onPress={onPress} testID={testID}>
                <Text>{title}</Text>
            </TouchableOpacity>
        ),
    };
});

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (val: number) => val,
    verticalScale: (val: number) => val,
    scale: (val: number) => val,
    normalize: (val: number) => val,
}));



// Mock react-i18next
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

// Mock Navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
}));

import { NavigationContainer } from '@react-navigation/native';
import { SelectLocationScreen } from '../../src/screens/SelectLocation/SelectLocationScreen';
import postReducer from '../../src/store/slices/postSlice';
import en from '../../src/localization/en.json';

// Mock Location Service
jest.mock('../../src/services/locationService', () => ({
    locationService: {
        requestPermission: jest.fn().mockResolvedValue(true),
        getCurrentPosition: jest.fn().mockResolvedValue({ latitude: 1, longitude: 1 }),
        reverseGeocode: jest.fn().mockResolvedValue({ area: 'Test Area', city: 'Test City', fullAddress: 'Full Address' }),
    },
    getAddressFromCoords: jest.fn().mockResolvedValue({ area: 'Test Area', city: 'Test City', fullAddress: 'Full Address', latitude: 1, longitude: 1 }),
}));

jest.mock('react-native-google-places-autocomplete', () => ({
    GooglePlacesAutocomplete: ({ placeholder, textInputProps, onFail, onPress }: any) => {
        const React = require('react');
        const { View, TextInput, TouchableOpacity, Text } = require('react-native');
        return React.createElement(View, null,
            React.createElement(TextInput, { placeholder, ...textInputProps, testID: 'google-places-input' }),
            React.createElement(TouchableOpacity, {
                testID: 'mock-place-select',
                onPress: () => onPress({}, {
                    geometry: { location: { lat: 10, lng: 20 } },
                    formatted_address: '123 Test St, Test City',
                    address_components: [
                        { types: ['sublocality'], long_name: 'Test Area' },
                        { types: ['administrative_area_level_2'], long_name: 'Test City' }
                    ]
                })
            }, React.createElement(Text, null, 'Select'))
        );
    },
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, null, children);
    },
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('lodash.debounce', () => jest.fn(fn => fn));

jest.mock('react-native-geolocation-service', () => ({
    default: {
        getCurrentPosition: jest.fn((success, failure, options) => {
            success({ coords: { latitude: 12.34, longitude: 56.78 } });
        }),
        requestAuthorization: jest.fn().mockResolvedValue('granted'),
    },
    getCurrentPosition: jest.fn((success, failure, options) => {
        success({ coords: { latitude: 12.34, longitude: 56.78 } });
    }),
    requestAuthorization: jest.fn().mockResolvedValue('granted'),
}));

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
        ActivityIndicator: createPrimitive('ActivityIndicator'),
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
        PermissionsAndroid: {
            request: jest.fn().mockResolvedValue('granted'),
            RESULTS: { GRANTED: 'granted' },
            PERMISSIONS: { ACCESS_FINE_LOCATION: 'location' },
        },
        Alert: {
            alert: jest.fn(),
        },
        Dimensions: {
            get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
        },
    };
});

describe('SelectLocationScreen', () => {
    let consoleErrorSpy: jest.SpyInstance;

    const mockNavigationProp = {
        goBack: mockGoBack,
        navigate: mockNavigate,
    };

    const renderScreen = (initialState?: any, routeParams?: any) => {
        const store = configureStore({
            reducer: {
                post: postReducer,
            },
            preloadedState: initialState,
        });
        return render(
            <Provider store={store}>
                <SelectLocationScreen
                    navigation={mockNavigationProp}
                    route={{ params: routeParams } as any}
                />
            </Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('renders correctly with initial state', async () => {
        const { getByTestId, getByPlaceholderText } = renderScreen();

        expect(getByTestId('select-location-header')).toBeTruthy();
        expect(getByPlaceholderText(en.selectLocation.searchPlaceholder)).toBeTruthy();

        await waitFor(() => {
            expect(getByTestId('location-next-button')).toBeTruthy();
        });
    });

    it('disables next button when no location is selected', async () => {
        const { getByTestId } = renderScreen();
        const nextButton = getByTestId('location-next-button');

        expect(nextButton.props.disabled).toBe(true);
    });

    it('enables next button when current location is selected', async () => {
        const { getByTestId } = renderScreen();

        const card = getByTestId('current-location-button');
        fireEvent.press(card);

        await waitFor(() => {
            const nextButton = getByTestId('location-next-button');
            expect(nextButton.props.disabled).toBe(false);
        });
    });

    it('enables next button automatically once current location is fetched', async () => {
        const { getByTestId } = renderScreen();
        const nextButton = getByTestId('location-next-button');

        // Initially disabled while fetching
        expect(nextButton.props.disabled).toBe(true);

        // Wait for fetch to complete and button to enable
        await waitFor(() => {
            expect(nextButton.props.disabled).toBe(false);
        }, { timeout: 2000 });
    });

    it('handles back button press', () => {
        const { getByTestId } = renderScreen();
        const backButton = getByTestId('header-back-button'); // Assuming standard testID
        fireEvent.press(backButton);
        expect(mockGoBack).toHaveBeenCalled();
    });
    it('initializes with location from store if available', () => {
        const initialState = {
            post: {
                newPostData: {
                    address: '123 Main St, City',
                    latitude: 40.7128,
                    longitude: -74.0060,
                }
            }
        };
        const { getByTestId } = renderScreen(initialState);
        const nextButton = getByTestId('location-next-button');
        expect(nextButton.props.disabled).toBe(false);
    });

    it('requests Android permission and handles location fetch', async () => {
        const { Platform, PermissionsAndroid } = require('react-native');
        Platform.OS = 'android';

        const { getByTestId } = renderScreen();
        const card = getByTestId('current-location-button');
        fireEvent.press(card);

        await waitFor(() => {
            expect(PermissionsAndroid.request).toHaveBeenCalledWith('location');
            const nextButton = getByTestId('location-next-button');
            expect(nextButton.props.disabled).toBe(false);
        });

        Platform.OS = 'ios'; // Revert back
    });

    it('shows alert if permission is denied', async () => {
        const { Alert } = require('react-native');
        const Geolocation = require('react-native-geolocation-service');
        (Geolocation.requestAuthorization as jest.Mock).mockResolvedValueOnce('denied');

        const { getByTestId } = renderScreen();
        fireEvent.press(getByTestId('current-location-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(en.alerts.error, en.alerts.locationPermissionRequired);
        });
    });

    it('shows error alert if getCurrentPosition fails', async () => {
        const { Alert } = require('react-native');
        const Geolocation = require('react-native-geolocation-service');
        (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success: any, error: any) => {
            error({ message: 'GPS disabled' });
        });

        const { getByTestId } = renderScreen();
        fireEvent.press(getByTestId('current-location-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(en.alerts.error, en.errors.generic);
        });
    });

    it('handles place selection from autocomplete', async () => {
        const { getByTestId } = renderScreen();

        fireEvent.press(getByTestId('mock-place-select'));

        await waitFor(() => {
            expect(getByTestId('selected-location-card')).toBeTruthy();
        });

        const nextButton = getByTestId('location-next-button');
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('PostDetail', { id: 'preview', isPreview: true });
        });
    });

    it('redirects seeker flow to LookingForReason with selected location and parent props', async () => {
        const routeParams = {
            item: 'Bag',
            gender: 'Male',
            dob: '01/01/2000',
            profession: 'Doctor',
            userType: 'seeker',
        };
        const { getByTestId } = renderScreen(undefined, routeParams);

        fireEvent.press(getByTestId('mock-place-select'));
        fireEvent.press(getByTestId('location-next-button'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('LookingForReason', {
                item: 'Bag',
                gender: 'Male',
                dob: '01/01/2000',
                profession: 'Doctor',
                selectedLocation: {
                    latitude: 10,
                    longitude: 20,
                    fullAddress: '123 Test St, Test City',
                    area: 'Test Area',
                    city: 'Test City',
                    title: 'Test Area',
                },
            });
        });
    });

    it('handles resetting selected location', async () => {
        const { getByTestId, queryByTestId } = renderScreen();

        fireEvent.press(getByTestId('mock-place-select'));

        await waitFor(() => {
            expect(getByTestId('selected-location-card')).toBeTruthy();
        });

        fireEvent.press(getByTestId('selected-location-card'));

        await waitFor(() => {
            expect(queryByTestId('selected-location-card')).toBeNull();
            expect(getByTestId('current-location-button')).toBeTruthy();
        });
    });
});
