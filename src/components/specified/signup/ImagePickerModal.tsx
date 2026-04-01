import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { authUiColors } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import Icon from 'react-native-vector-icons/Feather';

interface ImagePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onSelectFromGallery: () => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isVisible,
  onClose,
  onTakePhoto,
  onSelectFromGallery,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>{t('signup.profilePhotoTitle')}</Text>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelectFromGallery();
                  onClose();
                }}
              >
                <Icon name="image" size={normalize(20)} color={authUiColors.brandGreen} />
                <Text style={styles.optionText}>{t('signup.selectFromGallery')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onTakePhoto();
                  onClose();
                }}
              >
                <Icon name="camera" size={normalize(20)} color={authUiColors.brandGreen} />
                <Text style={styles.optionText}>{t('signup.takePhoto')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: scale(300),
    backgroundColor: authUiColors.white,
    borderRadius: scale(16),
    padding: scale(20),
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: authUiColors.primaryText,
    marginBottom: verticalScale(20),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: authUiColors.border,
  },
  optionText: {
    fontSize: normalize(16),
    color: authUiColors.primaryText,
    marginLeft: scale(15),
  },
  cancelButton: {
    marginTop: verticalScale(20),
    paddingVertical: verticalScale(10),
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: authUiColors.error,
  },
});
