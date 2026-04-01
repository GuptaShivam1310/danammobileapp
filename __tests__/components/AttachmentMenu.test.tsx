import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AttachmentMenu from '../../src/components/Chat/AttachmentMenu';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/theme';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('../../src/theme', () => ({
    useTheme: jest.fn(),
}));

jest.mock('../../src/theme/scale', () => ({
    scale: (v: number) => v,
    verticalScale: (v: number) => v,
    moderateScale: (v: number) => v,
    normalize: (v: number) => v,
}));

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

// Mock Modal as it can be tricky to test in some environments
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
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        Modal: ({ children, visible }: any) => visible ? children : null,
        StyleSheet: {
            create: (s: any) => s,
            flatten: (s: any) => s,
            hairlineWidth: 1,
        },
    };
});

describe('AttachmentMenu', () => {
    const mockOnClose = jest.fn();
    const mockOnOptionSelect = jest.fn();
    const defaultTheme = {
        colors: {
            surface: '#FFFFFF',
            attachmentPurple: '#7F66FF',
            attachmentPink: '#FF4081',
            attachmentViolet: '#BF5AF2',
            attachmentOrange: '#FF9500',
            attachmentGreen: '#28CD41',
            attachmentBlue: '#007AFF',
        },
    };

    const defaultProps = {
        isVisible: true,
        onClose: mockOnClose,
        onOptionSelect: mockOnOptionSelect,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => key,
        });
        (useTheme as jest.Mock).mockReturnValue({
            theme: defaultTheme,
        });
    });

    it('renders correctly when visible', () => {
        const { getByTestId } = render(<AttachmentMenu {...defaultProps} />);
        expect(getByTestId('attachment-menu')).toBeTruthy();
    });

    it('does not render when isVisible is false', () => {
        const { queryByTestId } = render(<AttachmentMenu {...defaultProps} isVisible={false} />);
        expect(queryByTestId('attachment-menu')).toBeNull();
    });

    it('calls onClose when overlay is pressed', () => {
        const { getByTestId } = render(<AttachmentMenu {...defaultProps} />);
        const overlay = getByTestId('attachment-overlay');
        fireEvent.press(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onOptionSelect with correct value when an option is pressed', () => {
        const { getByTestId } = render(<AttachmentMenu {...defaultProps} />);

        fireEvent.press(getByTestId('attach-document'));
        expect(mockOnOptionSelect).toHaveBeenCalledWith('document');

        fireEvent.press(getByTestId('attach-camera'));
        expect(mockOnOptionSelect).toHaveBeenCalledWith('camera');

        fireEvent.press(getByTestId('attach-gallery'));
        expect(mockOnOptionSelect).toHaveBeenCalledWith('gallery');
    });

    it('renders translation keys as labels by default', () => {
        const { getByText } = render(<AttachmentMenu {...defaultProps} />);
        expect(getByText('chat.document')).toBeTruthy();
        expect(getByText('chat.camera')).toBeTruthy();
        expect(getByText('chat.gallery')).toBeTruthy();
    });

    it('falls back to hardcoded labels when translation returns empty', () => {
        (useTranslation as jest.Mock).mockReturnValueOnce({
            t: () => '',
        });

        const { getByText } = render(<AttachmentMenu {...defaultProps} />);
        expect(getByText('Document')).toBeTruthy();
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
    });

    it('applies theme colors to menu container and option buttons', () => {
        const { getByTestId } = render(<AttachmentMenu {...defaultProps} />);

        const menuStyle = Array.isArray(getByTestId('attachment-menu').props.style)
            ? Object.assign({}, ...getByTestId('attachment-menu').props.style)
            : getByTestId('attachment-menu').props.style;
        expect(menuStyle.backgroundColor).toBe(defaultTheme.colors.surface);

        const docStyle = Array.isArray(getByTestId('attach-document').props.style)
            ? Object.assign({}, ...getByTestId('attach-document').props.style)
            : getByTestId('attach-document').props.style;
        expect(docStyle.backgroundColor).toBe(defaultTheme.colors.attachmentPurple);

        const cameraStyle = Array.isArray(getByTestId('attach-camera').props.style)
            ? Object.assign({}, ...getByTestId('attach-camera').props.style)
            : getByTestId('attach-camera').props.style;
        expect(cameraStyle.backgroundColor).toBe(defaultTheme.colors.attachmentPink);

        const galleryStyle = Array.isArray(getByTestId('attach-gallery').props.style)
            ? Object.assign({}, ...getByTestId('attach-gallery').props.style)
            : getByTestId('attach-gallery').props.style;
        expect(galleryStyle.backgroundColor).toBe(defaultTheme.colors.attachmentViolet);
    });
});
