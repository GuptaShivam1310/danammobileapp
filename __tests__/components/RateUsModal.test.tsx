import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RateUsModal } from '../../src/components/common/RateUsModal';
import { styles as createStyles } from '../../src/components/common/RateUsModal/styles';
import { supportApi } from '../../src/services/api/supportApi';
import Toast from 'react-native-toast-message';

// Mock dependencies
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('../../src/services/api/supportApi', () => ({
    supportApi: {
        submitRating: jest.fn(),
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
        Modal: createPrimitive('Modal'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
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
        semiBold: 'System',
        medium: 'System',
    }
}));

jest.mock('../../src/components/common/PrimaryButton', () => ({
    PrimaryButton: ({ title, onPress, testID, disabled }: any) => {
        const ReactLib = require('react');
        const { TouchableOpacity, Text } = require('react-native');
        return ReactLib.createElement(
            TouchableOpacity,
            { onPress, testID, disabled },
            ReactLib.createElement(Text, null, title),
        );
    },
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const keys = key.split('.');
            let val: any = require('../../src/localization/en.json');
            for (const k of keys) {
                val = val?.[k];
            }
            return typeof val === 'string' ? val : key;
        },
    }),
}));

const mockOnClose = jest.fn();
const createDeferred = () => {
    let resolve!: (value: any) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

describe('RateUsModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when visible', () => {
        const { getByText, getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        expect(getByText('Rate Us')).toBeTruthy();
        expect(getByText('Share your love for Dānam app by sharing a nice review')).toBeTruthy();
        expect(getByTestId('rate-submit-button')).toBeTruthy();
    });

    it('submit button should be disabled when rating is 0', () => {
        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        const submitButton = getByTestId('rate-submit-button');
        expect(submitButton.props.disabled).toBe(true);
    });

    it('selects rating and enables submit button', () => {
        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        const star4 = getByTestId('rate-star-4');
        fireEvent.press(star4);

        const submitButton = getByTestId('rate-submit-button');
        expect(submitButton.props.disabled).toBe(false);
    });

    it('submits rating successfully', async () => {
        (supportApi.submitRating as jest.Mock).mockResolvedValue({
            success: true,
            message: 'Thank you',
        });

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-5'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(supportApi.submitRating).toHaveBeenCalledWith(5);
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'success',
                text2: 'Thank you',
            }));
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('uses default success message when response message is missing', async () => {
        (supportApi.submitRating as jest.Mock).mockResolvedValue({
            success: true,
        });

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-5'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'success',
                text2: 'Thank you for your rating!',
            }));
        });
    });

    it('shows error toast when api returns success=false', async () => {
        (supportApi.submitRating as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Nope',
        });

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-3'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text2: 'Nope',
            }));
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    it('uses default error message when api returns success=false without message', async () => {
        (supportApi.submitRating as jest.Mock).mockResolvedValue({
            success: false,
        });

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-2'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text2: 'Failed to submit rating',
            }));
        });
    });

    it('does not submit when rating is 0', () => {
        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-submit-button'));
        expect(supportApi.submitRating).not.toHaveBeenCalled();
    });

    it('handles api failure', async () => {
        (supportApi.submitRating as jest.Mock).mockRejectedValue(new Error('Network Error'));

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-4'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
            }));
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    it('uses error message from response data when available', async () => {
        (supportApi.submitRating as jest.Mock).mockRejectedValue({
            response: { data: { message: 'Bad request' } },
        });

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-4'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text2: 'Bad request',
            }));
        });
    });

    it('falls back to generic error message when error has no message', async () => {
        (supportApi.submitRating as jest.Mock).mockRejectedValue({});

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-4'));
        fireEvent.press(getByTestId('rate-submit-button'));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
                type: 'error',
                text2: 'Something went wrong',
            }));
        });
    });

    it('prevents double submit while loading', async () => {
        const deferred = createDeferred();
        (supportApi.submitRating as jest.Mock).mockReturnValue(deferred.promise);

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-5'));
        fireEvent.press(getByTestId('rate-submit-button'));
        fireEvent.press(getByTestId('rate-submit-button'));

        expect(supportApi.submitRating).toHaveBeenCalledTimes(1);

        deferred.resolve({ success: true, message: 'Thanks' });
        await waitFor(() => expect(Toast.show).toHaveBeenCalled());
    });

    it('disables close button while loading', async () => {
        const deferred = createDeferred();
        (supportApi.submitRating as jest.Mock).mockReturnValue(deferred.promise);

        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-5'));
        fireEvent.press(getByTestId('rate-submit-button'));

        expect(getByTestId('rate-us-close-button').props.disabled).toBe(true);

        deferred.resolve({ success: true, message: 'Thanks' });
        await waitFor(() => expect(Toast.show).toHaveBeenCalled());
    });

    it('does not close when loading is true', async () => {
        const deferred = createDeferred();
        (supportApi.submitRating as jest.Mock).mockReturnValue(deferred.promise);

        const { getByTestId, UNSAFE_getAllByType } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('rate-star-5'));
        fireEvent.press(getByTestId('rate-submit-button'));

        const overlays = UNSAFE_getAllByType('TouchableWithoutFeedback');
        fireEvent.press(overlays[0]);

        expect(mockOnClose).not.toHaveBeenCalled();

        deferred.resolve({ success: true, message: 'Thanks' });
        await waitFor(() => expect(Toast.show).toHaveBeenCalled());
    });

    it('triggers onClose when close button is pressed', () => {
        const { getByTestId } = render(
            <RateUsModal isVisible={true} onClose={mockOnClose} />
        );

        const closeButton = getByTestId('rate-us-close-button');
        fireEvent.press(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('creates styles with theme and palette fallbacks', () => {
        const styles = createStyles({ colors: { surface: undefined, text: '#111', mutedText: '#777' } });
        expect(styles.container.backgroundColor).toBe('#FFFFFF');
        expect(styles.title.color).toBe('#111');
        expect(styles.subtitle.color).toBe('#777');
    });
});
