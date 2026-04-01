import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale } from '../../theme/scale';
import { useChatImagePreview } from './useChatImagePreview';
import { createStyles } from './styles';

import { palette } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ChatImagePreviewScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { imageUri, seekerName, isSending, handleBack, handleSend } = useChatImagePreview();

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

            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    testID="preview-image-main"
                />
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
