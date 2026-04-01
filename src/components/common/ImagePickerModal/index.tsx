import React from 'react';
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../theme';
import { moderateScale } from '../../../theme/scale';
import { createStyles } from './styles';
import { useTranslation } from 'react-i18next';

interface ImagePickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onSelectFromGallery: () => void;
    title?: string;
    testID?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
    isVisible,
    onClose,
    onTakePhoto,
    onSelectFromGallery,
    title,
    testID = 'image-picker-modal',
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const modalTitle = title || t('common.imagePickerTitle');

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
            testID={testID}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>{modalTitle}</Text>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    onSelectFromGallery();
                                    onClose();
                                }}
                                testID={`${testID}-gallery-option`}
                            >
                                <Icon name="image" size={moderateScale(20)} color={theme.colors.brandGreen} />
                                <Text style={styles.optionText}>{t('signup.selectFromGallery')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => {
                                    onTakePhoto();
                                    onClose();
                                }}
                                testID={`${testID}-camera-option`}
                            >
                                <Icon name="camera" size={moderateScale(20)} color={theme.colors.brandGreen} />
                                <Text style={styles.optionText}>{t('signup.takePhoto')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                testID={`${testID}-cancel-button`}
                            >
                                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
