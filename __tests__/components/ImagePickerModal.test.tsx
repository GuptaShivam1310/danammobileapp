import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImagePickerModal } from '../../src/components/common/ImagePickerModal';
 
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
    initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Mock theme and scale
jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                surface: '#FFFFFF',
                text: '#000000',
                brandGreen: '#0B6B4F',
                border: '#D1D5DB',
                danger: '#DC2626',
            },
            typography: {
                fontFamilyBold: 'System',
                fontFamilyRegular: 'System',
                fontFamilyMedium: 'System',
            },
        },
    }),
}));

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) => ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        Modal: ({ children, visible }: any) => visible ? createPrimitive('Modal')({ children }) : null,
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
        Platform: {
            OS: 'ios',
        },
    };
});

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (size: number) => size,
    verticalScale: (size: number) => size,
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

describe('ImagePickerModal', () => {
    const mockOnClose = jest.fn();
    const mockOnTakePhoto = jest.fn();
    const mockOnSelectFromGallery = jest.fn();

    const props = {
        isVisible: true,
        onClose: mockOnClose,
        onTakePhoto: mockOnTakePhoto,
        onSelectFromGallery: mockOnSelectFromGallery,
    };

    it('renders correctly when visible', () => {
        const { getByText } = render(<ImagePickerModal {...props} />);

        expect(getByText('common.imagePickerTitle')).toBeTruthy();
        expect(getByText('signup.selectFromGallery')).toBeTruthy();
        expect(getByText('signup.takePhoto')).toBeTruthy();
        expect(getByText('common.cancel')).toBeTruthy();
    });

    it('calls onTakePhoto and onClose when Take Photo is pressed', () => {
        const { getByTestId } = render(<ImagePickerModal {...props} />);

        fireEvent.press(getByTestId('image-picker-modal-camera-option'));

        expect(mockOnTakePhoto).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onSelectFromGallery and onClose when Select from Gallery is pressed', () => {
        const { getByTestId } = render(<ImagePickerModal {...props} />);

        fireEvent.press(getByTestId('image-picker-modal-gallery-option'));

        expect(mockOnSelectFromGallery).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is pressed', () => {
        const { getByTestId } = render(<ImagePickerModal {...props} />);

        fireEvent.press(getByTestId('image-picker-modal-cancel-button'));

        expect(mockOnClose).toHaveBeenCalled();
    });
});
