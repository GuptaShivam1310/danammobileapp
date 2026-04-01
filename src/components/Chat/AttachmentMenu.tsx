import React, { memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale, normalize, moderateScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { useTranslation } from 'react-i18next';

import { palette } from '../../constants/colors';

interface AttachmentOptionProps {
    icon: string;
    label: string;
    color: string;
    onPress: () => void;
    testID?: string;
}

const AttachmentOption = ({ icon, label, color, onPress, testID }: AttachmentOptionProps) => (
    <View style={styles.optionContainer}>
        <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.8}
            testID={testID}
        >
            <FeatherIcon name={icon} size={scale(24)} color={palette.white} />
        </TouchableOpacity>
        <Text style={styles.optionLabel}>{label}</Text>
    </View>
);

interface AttachmentMenuProps {
    isVisible: boolean;
    onClose: () => void;
    onOptionSelect: (option: string) => void;
}

const AttachmentMenu = memo(({ isVisible, onClose, onOptionSelect }: AttachmentMenuProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    if (!isVisible) return null;

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose} testID="attachment-overlay">
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]} testID="attachment-menu">
                            <View style={styles.row}>
                                <AttachmentOption
                                    icon="file-text"
                                    label={t('chat.document') || 'Document'}
                                    color={theme.colors.attachmentPurple}
                                    onPress={() => onOptionSelect('document')}
                                    testID="attach-document"
                                />
                                <AttachmentOption
                                    icon="camera"
                                    label={t('chat.camera') || 'Camera'}
                                    color={theme.colors.attachmentPink}
                                    onPress={() => onOptionSelect('camera')}
                                    testID="attach-camera"
                                />
                                <AttachmentOption
                                    icon="image"
                                    label={t('chat.gallery') || 'Gallery'}
                                    color={theme.colors.attachmentViolet}
                                    onPress={() => onOptionSelect('gallery')}
                                    testID="attach-gallery"
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
});

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Overlay typically stays as RGBA
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    menuContainer: {
        width: '94%',
        borderRadius: moderateScale(20),
        paddingHorizontal: scale(20),
        paddingVertical: scale(25),
        marginBottom: scale(80),
        shadowColor: palette.blackPure,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionContainer: {
        alignItems: 'center',
        flex: 1,
    },
    iconButton: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    optionLabel: {
        fontSize: normalize(12),
        fontFamily: fonts.regular,
        color: palette.gray500, // Replaced '#7D848F' with closest palette color
    },
});


AttachmentMenu.displayName = 'AttachmentMenu';

export default AttachmentMenu;
