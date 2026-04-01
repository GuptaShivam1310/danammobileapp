import React, { memo, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Pdf from 'react-native-pdf';
import { useTheme } from '../../theme';
import { scale, normalize, moderateScale } from '../../theme/scale';
import { ChatMessage } from '../../models/chat';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { palette } from '../../constants/colors';
import { useAppSelector } from '../../store';
import { AppImage } from '../common/AppImage';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { openFile } from '../../utils/fileLinker';

interface MessageBubbleProps {
    message: ChatMessage;
    senderAvatar?: string | null;
}

const MessageBubble = memo(({ message, senderAvatar }: MessageBubbleProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    // Select only what we need from auth
    const currentUserId = useAppSelector(state => String(state.auth.user?.id || state.auth.userProfile?.id || 'unknown'));
    const myAvatar = useAppSelector(state => state.auth.userProfile?.profile_image_url || state.auth.user?.profile_image_url);

    const senderId = String(message.senderId || 'unknown');
    const isMine = useMemo(() => senderId !== 'unknown' && senderId === currentUserId, [senderId, currentUserId]);

    const effectiveType = useMemo(() => {
        if (message.type === 'document' || message.type === 'doc') {
            const uri = (message.fileUri || message.documentUri || '').toLowerCase();
            if (uri.endsWith('.pdf') || uri.includes('.pdf?')) {
                return 'pdf';
            }
        }
        return message.type;
    }, [message.type, message.fileUri, message.documentUri]);

    const styles = useMemo(() => createStyles(theme, isMine), [theme, isMine]);
    const formattedTime = useMemo(() => dayjs(message.createdAt).format('hh:mm A'), [message.createdAt]);

    const handlePress = useCallback(() => {
        const fileUri = message.fileUri || message.documentUri || message.imageUri;
        const fileName = message.fileName || message.documentName || (effectiveType === 'image' ? 'Image' : 'File');

        if (effectiveType === 'pdf') {
            navigation.navigate(ROUTES.CHAT_PDF_VIEW, {
                pdfUri: fileUri,
                fileName,
            });
        } else if (effectiveType === 'image' && fileUri) {
            navigation.navigate(ROUTES.CHAT_IMAGE_VIEW, {
                imageUri: fileUri,
                fileName,
            });
        } else if (fileUri) {
            // Audio, docs, zip etc.
            openFile(fileUri, fileName);
        }
    }, [message, navigation, effectiveType]);

    const renderContent = useCallback(() => {
        switch (effectiveType) {
            case 'image':
                return (
                    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                        <AppImage
                            imageUri={message.imageUri || message.fileUri}
                            style={styles.messageImage}
                            resizeMode="cover"
                            testID="message-image"
                        />
                    </TouchableOpacity>
                );
            case 'pdf':
                return (
                    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                        <View style={styles.pdfPreviewContainer}>
                            <View style={{ flex: 1 }} pointerEvents="none">
                                <Pdf
                                    source={{
                                        uri: decodeURIComponent(message.fileUri || message.documentUri || ''),
                                        cache: true
                                    }}
                                    style={styles.pdfPreview}
                                    singlePage
                                    trustAllCerts={false}
                                    renderActivityIndicator={() => (
                                        <View style={styles.pdfLoading}>
                                            <FeatherIcon name="file-text" size={scale(24)} color={palette.gray400} />
                                        </View>
                                    )}
                                    onError={(error) => console.log('PDF Preview Error:', error)}
                                />
                            </View>
                            <View style={styles.pdfBadge}>
                                <FeatherIcon name="file-text" size={scale(12)} color={palette.white} />
                                <Text style={styles.pdfBadgeText}>PDF</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            case 'doc':
            case 'document':
                return (
                    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                        <View style={styles.documentContainer} testID="message-document">
                            <View style={styles.documentIconContainer}>
                                <FeatherIcon name="file-text" size={scale(24)} color={isMine ? theme.colors.brandGreen : palette.white} />
                            </View>
                            <View style={styles.documentInfo}>
                                <Text style={[styles.documentName, { color: isMine ? palette.white : theme.colors.text }]} numberOfLines={1}>
                                    {message.fileName || message.documentName}
                                </Text>
                                <Text style={[styles.documentSize, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.colors.mutedText }]}>
                                    {message.documentSize}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            default:
                return message.text ? <Text style={styles.text}>{message.text}</Text> : null;
        }
    }, [message, handlePress, styles, isMine, theme.colors]);

    return (
        <View style={styles.outerContainer}>
            {!isMine && (
                <View style={styles.avatarWrapper}>
                    {senderAvatar ? (
                        <AppImage imageUri={senderAvatar} style={styles.avatarPlaceholder} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <FeatherIcon name="user" size={scale(12)} color={theme.colors.mutedText} />
                        </View>
                    )}
                </View>
            )}

            <View style={styles.bubble}>
                {renderContent()}

                {message.type !== 'text' &&
                    message.text &&
                    message.text !== t('chat.documentPlaceholder') &&
                    message.text !== t('chat.imagePlaceholder') &&
                    message.text !== '[Image]' ? (
                    <Text style={[styles.text, { marginTop: scale(4) }]}>{message.text}</Text>
                ) : null}

                <Text style={styles.time}>{formattedTime}</Text>
            </View>
        </View>
    );
});

const createStyles = (theme: any, isMine: boolean) => StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        marginVertical: scale(6),
    },
    avatarWrapper: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        overflow: 'hidden',
        [isMine ? 'marginLeft' : 'marginRight']: scale(8),
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: scale(12),
        paddingVertical: scale(8),
        borderRadius: moderateScale(16),
        borderBottomRightRadius: isMine ? 0 : moderateScale(16),
        borderBottomLeftRadius: isMine ? moderateScale(16) : 0,
        backgroundColor: isMine ? theme.colors.brandGreen : theme.colors.surface,
    },
    text: {
        fontSize: normalize(14),
        fontFamily: 'Inter-Regular',
        color: isMine ? palette.white : theme.colors.text,
        lineHeight: normalize(20),
    },
    time: {
        fontSize: normalize(10),
        fontFamily: 'Inter-Regular',
        color: isMine ? 'rgba(255, 255, 255, 0.7)' : theme.colors.mutedText,
        alignSelf: 'flex-end',
        marginTop: scale(2),
    },
    messageImage: {
        width: scale(150),
        height: scale(150),
        borderRadius: moderateScale(12),
        marginBottom: scale(4),
    },
    pdfPreviewContainer: {
        width: scale(200),
        height: scale(150),
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        backgroundColor: palette.gray200,
        marginBottom: scale(4),
    },
    pdfPreview: {
        flex: 1,
        width: scale(200),
        height: scale(150),
    },
    pdfBadge: {
        position: 'absolute',
        top: scale(8),
        right: scale(8),
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(4),
        flexDirection: 'row',
        alignItems: 'center',
    },
    pdfBadgeText: {
        color: palette.white,
        fontSize: scale(10),
        fontWeight: 'bold',
        marginLeft: scale(4),
    },
    pdfLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.gray100,
    },
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isMine ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        padding: scale(8),
        borderRadius: moderateScale(8),
        marginBottom: scale(4),
        width: scale(200),
    },
    documentIconContainer: {
        width: scale(40),
        height: scale(40),
        backgroundColor: isMine ? palette.white : theme.colors.brandGreen,
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: normalize(14),
        fontFamily: 'Inter-Medium',
        marginBottom: scale(2),
    },
    documentSize: {
        fontSize: normalize(12),
        fontFamily: 'Inter-Regular',
    }
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
