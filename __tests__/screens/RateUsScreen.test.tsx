import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RateUsScreen } from '../../src/screens/RateUs/RateUsScreen';

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
    };
});

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('../../src/theme', () => ({
    useTheme: () => ({ theme: { colors: { text: '#000', mutedText: '#666', brandGreen: '#0B6B4F' } } }),
}));

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (v: number) => v,
    verticalScale: (v: number) => v,
    normalize: (v: number) => v,
    scale: (v: number) => v,
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID }, children);
    },
}));

jest.mock('../../src/components/common/Header', () => ({
    Header: () => null,
}));

describe('RateUsScreen', () => {
    it('renders correctly', () => {
        const { getByTestId, getByText } = render(<RateUsScreen />);
        expect(getByTestId('rate-us-screen')).toBeTruthy();
        expect(getByText('Enjoying Danam?')).toBeTruthy();
    });

    it('shows submit button after rating', () => {
        const { getByTestId, queryByTestId } = render(<RateUsScreen />);

        expect(queryByTestId('submit-rating-button')).toBeFalsy();

        const star = getByTestId('star-rating-1');
        fireEvent.press(star);

        expect(queryByTestId('submit-rating-button')).toBeTruthy();
    });
});
