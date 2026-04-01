import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import { scale } from '../../../theme/scale';

interface AppModalProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    containerStyle?: ViewStyle;
    overlayStyle?: ViewStyle;
    animationType?: 'none' | 'slide' | 'fade';
}

export const AppModal: React.FC<AppModalProps> = ({
    isVisible,
    onClose,
    children,
    containerStyle,
    overlayStyle,
    animationType = 'fade',
}) => {
    const { theme } = useTheme();

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType={animationType}
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
            hardwareAccelerated
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, overlayStyle]}>
                    <TouchableWithoutFeedback>
                        <View style={[
                            styles.modalContainer,
                            { backgroundColor: theme.colors.surface },
                            containerStyle
                        ]}>
                            {children}
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
        width: '85%',
        borderRadius: scale(20),
        padding: scale(24),
        alignItems: 'center',
    },
});
