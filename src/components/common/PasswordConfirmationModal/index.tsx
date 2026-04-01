import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { AppModal } from '../AppModal';
import { useTheme } from '../../../theme';
import { normalize, scale, verticalScale, moderateScale } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';
import { palette } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';

interface PasswordConfirmationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    isLoading?: boolean;
}

export const PasswordConfirmationModal: React.FC<PasswordConfirmationModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!password.trim()) {
            setError(t('passwordConfirmationModal.validationError'));
            return;
        }
        setError('');
        onConfirm(password);
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <AppModal isVisible={isVisible} onClose={handleClose}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {t('passwordConfirmationModal.title')}
                </Text>

                <View style={[styles.inputContainer, error ? { borderColor: palette.red700 } : { borderColor: theme.colors.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        placeholder={t('passwordConfirmationModal.placeholder')}
                        placeholderTextColor={theme.colors.mutedText}
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (text) setError('');
                        }}
                        testID="delete-account-password-input"
                    />
                </View>
                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                        onPress={handleClose}
                        activeOpacity={0.7}
                        testID="password-confirm-modal-cancel"
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                            {t('passwordConfirmationModal.cancel')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.confirmButton,
                            { backgroundColor: theme.colors.brandGreen },
                            (isLoading || !password.trim()) && { opacity: 0.7 }
                        ]}
                        onPress={handleConfirm}
                        activeOpacity={0.7}
                        disabled={isLoading || !password.trim()}
                        testID="password-confirm-modal-confirm"
                    >
                        {isLoading ? (
                            <ActivityIndicator color={palette.white} size="small" />
                        ) : (
                            <Text style={[styles.buttonText, { color: palette.white }]}>
                                {t('passwordConfirmationModal.confirm')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: normalize(20),
        fontFamily: fonts.bold,
        marginBottom: verticalScale(20),
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        height: verticalScale(48),
        borderWidth: 1,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(15),
        marginBottom: verticalScale(8),
        justifyContent: 'center',
    },
    input: {
        fontSize: normalize(16),
        fontFamily: fonts.regular,
        height: '100%',
        padding: 0,
    },
    errorText: {
        color: palette.red700,
        fontSize: normalize(12),
        fontFamily: fonts.regular,
        alignSelf: 'flex-start',
        marginBottom: verticalScale(12),
        marginLeft: moderateScale(4),
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: verticalScale(16),
    },
    button: {
        flex: 1,
        height: verticalScale(45),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        marginRight: scale(10),
    },
    confirmButton: {
        marginLeft: scale(10),
    },
    buttonText: {
        fontSize: normalize(16),
        fontFamily: fonts.semiBold,
    },
});
