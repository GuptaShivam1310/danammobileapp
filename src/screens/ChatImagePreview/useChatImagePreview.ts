import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendMessage } from '../../store/chat/chatSlice';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../services/api/chatApi';

type ChatImagePreviewRouteProp = RouteProp<DrawerParamList, typeof ROUTES.CHAT_IMAGE_PREVIEW>;

export const useChatImagePreview = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<ChatImagePreviewRouteProp>();
    const dispatch = useAppDispatch();
    const { imageUri, chatId, fileName, fileUri, mimeType } = route.params;

    const currentUser = useAppSelector(state => state.auth.user);
    const currentUserProfile = useAppSelector(state => state.auth.userProfile);

    const [isSending, setIsSending] = useState(false);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSend = useCallback(async () => {
        if (isSending) return;
        setIsSending(true);

        try {
            // 1. Upload the image first
            const name = fileName || imageUri.split('/').pop() || 'image.jpg';
            const uploadRes = await chatApi.uploadChatImage(imageUri, name, mimeType);
            const remoteUrl = uploadRes.data?.file_url;

            if (!remoteUrl) {
                throw new Error('Upload failed: No file URL returned');
            }

            const senderId = String(currentUser?.id || currentUserProfile?.id || 'unknown');
            const senderName = currentUser?.full_name || currentUserProfile?.full_name || 'Anonymous';
            const _id = Math.random().toString(36).substring(7);
            const createdAt = new Date().toISOString();

            const messageData = {
                _id,
                chatId,
                senderId,
                senderName,
                text: remoteUrl, // Use remote URL as content for API
                imageUri: remoteUrl, // Use remote URL for local state
                type: 'image' as const,
                createdAt,
                fileName: name,
                fileUri: remoteUrl,
                mimeType: mimeType || 'image/jpeg'
            };

            // 2. Dispatch thunk for local state & persistence
            await dispatch(sendMessage(messageData)).unwrap();

            navigation.goBack();
        } catch (error: any) {
            console.error('Failed to send image:', error);
            Alert.alert(t('common.error'), t('chat.error.sendFailed') || 'Failed to send image');
            setIsSending(false);
        }
    }, [dispatch, chatId, imageUri, navigation, currentUser, currentUserProfile, fileName, mimeType, isSending, t]);

    return {
        imageUri,
        seekerName: route.params.seekerName || t('common.userFallback'),
        isSending,
        handleBack,
        handleSend,
    };
};
