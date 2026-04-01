import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform, Text } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale, normalize, moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';
import { fonts } from '../../theme/fonts';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onTyping?: () => void;
    onPlusPress?: () => void;
    disabled?: boolean;
}

const ChatInput = memo(({ value, onChangeText, onSend, onTyping, onPlusPress, disabled }: ChatInputProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleTextChange = useCallback((text: string) => {
        onChangeText(text);
        if (onTyping && text.length > 0) {
            onTyping();
        }
    }, [onChangeText, onTyping]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={onPlusPress}
                testID="chat-plus-button"
            >
                <FeatherIcon name="plus" size={scale(24)} color={theme.colors.mutedText} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { maxHeight: scale(100) }]}
                    placeholder={t('chat.typeMessage')}
                    placeholderTextColor={theme.colors.mutedText}
                    value={value}
                    onChangeText={handleTextChange}
                    multiline
                // editable={!disabled}
                />
            </View>

            <TouchableOpacity
                onPress={onSend}
                // disabled={!value.trim() || disabled}
                activeOpacity={0.7}
                style={styles.sendButton}
            >
                <Text style={[styles.sendText, (!value.trim() || disabled) && styles.sendTextDisabled]}>
                    {t('chat.send')}
                </Text>
            </TouchableOpacity>
        </View>
    );
});

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: scale(10),
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    addButton: {
        marginRight: scale(10),
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: theme.colors.lightGray,
        borderRadius: moderateScale(20),
        paddingHorizontal: scale(16),
        paddingVertical: Platform.OS === 'ios' ? scale(10) : scale(4),
    },
    input: {
        fontSize: normalize(15),
        fontFamily: 'Inter-Regular',
        color: theme.colors.text,
        textAlignVertical: 'center',
    },
    sendButton: {
        marginLeft: scale(12),
        justifyContent: 'center',
    },
    sendText: {
        fontSize: normalize(15),
        fontFamily: fonts.bold,
        color: theme.colors.brandGreen,
    },
    sendTextDisabled: {
        opacity: 0.5,
    },
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
