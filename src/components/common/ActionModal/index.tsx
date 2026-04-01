import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../theme';
import { normalize, scale, verticalScale, moderateScale } from '../../../theme/scale';
import { SvgIcon } from '../SvgIcon';
import { fonts } from '../../../theme/fonts';
import { palette } from '../../../constants/colors';
import { AppModal } from '../AppModal';

interface ActionModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    icon: any; // SVG icon component
    title: string;
    subtitle: string | string[];
    cancelText?: string;
    confirmText?: string;
    confirmButtonColor?: string;
    testIDPrefix?: string;
    isLoading?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    icon,
    title,
    subtitle,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    confirmButtonColor,
    testIDPrefix = 'action-modal',
    isLoading = false,
}) => {
    const { theme } = useTheme();
    const defaultConfirmColor = confirmButtonColor || theme.colors.brandGreen;

    return (
        <AppModal isVisible={isVisible} onClose={onClose}>
            <View style={styles.iconContainer}>
                <SvgIcon icon={icon} size={moderateScale(50)} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
            </Text>

            {Array.isArray(subtitle) ? (
                subtitle.map((text, index) => (
                    <Text key={index} style={[styles.subtitle, { color: theme.colors.mutedText }, index === subtitle.length - 1 && styles.lastSubtitle]}>
                        {text}
                    </Text>
                ))
            ) : (
                <Text style={[styles.subtitle, { color: theme.colors.mutedText }, styles.lastSubtitle]}>
                    {subtitle}
                </Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                    onPress={onClose}
                    activeOpacity={0.7}
                    testID={`${testIDPrefix}-cancel`}
                >
                    <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                        {cancelText}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton, { backgroundColor: defaultConfirmColor }, isLoading && { opacity: 0.7 }]}
                    onPress={onConfirm}
                    activeOpacity={0.7}
                    disabled={isLoading}
                    testID={`${testIDPrefix}-confirm`}
                >
                    {isLoading ? (
                        <ActivityIndicator color={palette.white} size="small" />
                    ) : (
                        <Text style={[styles.buttonText, { color: palette.white }]}>
                            {confirmText}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: normalize(20),
        fontFamily: fonts.bold,
        marginBottom: verticalScale(8),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: normalize(16),
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: verticalScale(8),
        lineHeight: normalize(22),
    },
    lastSubtitle: {
        marginBottom: verticalScale(24),
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        height: verticalScale(40),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        marginRight: scale(5),
    },
    confirmButton: {
        marginLeft: scale(10),
    },
    buttonText: {
        fontSize: normalize(16),
        fontFamily: fonts.semiBold,
    },
});
