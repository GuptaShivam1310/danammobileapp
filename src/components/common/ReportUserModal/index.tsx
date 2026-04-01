import React from 'react';
import {
    ActivityIndicator,
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { createStyles } from './styles';

interface ReportUserModalProps {
    isVisible: boolean;
    title?: string;
    description?: string;
    userName?: string;
    reason: string;
    onReasonChange: (text: string) => void;
    onCancel: () => void;
    onReport: () => void;
    isLoading?: boolean;
    testIDPrefix?: string;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
    isVisible,
    title,
    description,
    userName,
    reason,
    onReasonChange,
    onCancel,
    onReport,
    isLoading = false,
    testIDPrefix = 'report-user',
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            testID={`${testIDPrefix}-modal`}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingContainer}
                    >
                        <View style={styles.container}>
                            <Text style={styles.title} testID={`${testIDPrefix}-title`}>
                                {title || t('reportUser.title', { name: userName || t('common.userFallback') })}
                            </Text>

                            <Text style={styles.description} testID={`${testIDPrefix}-description`}>
                                {description || t('reportUser.description')}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder={t('reportUser.placeholder')}
                                placeholderTextColor={theme.colors.mutedText}
                                multiline
                                value={reason}
                                onChangeText={onReasonChange}
                                testID={`${testIDPrefix}-input`}
                            />

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onCancel}
                                    disabled={isLoading}
                                    testID={`${testIDPrefix}-cancel-button`}
                                >
                                    <Text style={styles.cancelText}>{t('reportUser.cancel')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.reportButton,
                                        (!reason.trim() || isLoading) && styles.disabledButton,
                                    ]}
                                    onPress={onReport}
                                    disabled={!reason.trim() || isLoading}
                                    testID={`${testIDPrefix}-submit-button`}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator
                                            testID={`${testIDPrefix}-loading-indicator`}
                                            color={theme.colors.surface}
                                        />
                                    ) : (
                                        <Text style={styles.reportText}>{t('reportUser.report')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
