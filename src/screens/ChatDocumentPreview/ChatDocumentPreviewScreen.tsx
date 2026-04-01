import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale } from '../../theme/scale';
import { useChatDocumentPreview } from './useChatDocumentPreview';
import { createStyles } from './styles';
import { palette } from '../../constants/colors';

export const ChatDocumentPreviewScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { documentName, documentSize, documentType, seekerName, handleBack, handleSend, isSending } = useChatDocumentPreview();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={palette.blackPure} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    testID="preview-back-button"
                    disabled={isSending}
                >
                    <FeatherIcon name="arrow-left" size={scale(24)} color={palette.white} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.userName} testID="preview-seeker-name">{seekerName}</Text>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.docIconContainer}>
                    <FeatherIcon name="file-text" size={scale(50)} color={palette.white} />
                </View>
                <Text style={styles.docName} numberOfLines={2} testID="preview-doc-name">{documentName}</Text>
                <Text style={styles.docInfo} testID="preview-doc-info">
                    {documentType} • {documentSize}
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.sendButton, isSending && { opacity: 0.7 }]}
                    onPress={handleSend}
                    activeOpacity={0.8}
                    testID="preview-send-button"
                    disabled={isSending}
                >
                    {isSending ? (
                        <ActivityIndicator color={palette.white} size="small" />
                    ) : (
                        <FeatherIcon name="send" size={scale(24)} color={palette.white} />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ChatDocumentPreviewScreen;
