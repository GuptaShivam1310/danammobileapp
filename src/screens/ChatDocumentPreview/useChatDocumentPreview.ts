import { useCallback, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendMessage } from '../../store/chat/chatSlice';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../services/api/chatApi';
import { RootState } from '../../store';
import { Alert } from 'react-native';

type ChatDocumentPreviewRouteProp = RouteProp<DrawerParamList, typeof ROUTES.CHAT_DOCUMENT_PREVIEW>;

export const useChatDocumentPreview = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<ChatDocumentPreviewRouteProp>();
    const dispatch = useAppDispatch();
    const { documentUri, documentName, documentType, documentSize, chatId, fileName, fileUri, mimeType, type } = route.params;

    const currentUser = useAppSelector((state: RootState) => state.auth.user);
    const currentUserProfile = useAppSelector((state: RootState) => state.auth.userProfile);

    const [isSending, setIsSending] = useState(false);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSend = useCallback(async () => {
        if (isSending) return;
        setIsSending(true);

        try {
            // 1. Upload the document first
            const finalMimeType = mimeType || 'application/pdf';
            const name = fileName || documentName || documentUri.split('/').pop() || 'document.pdf';
            const uploadRes = await chatApi.uploadChatImage(documentUri, name, finalMimeType);
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
                type: (type as any) || 'doc',
                createdAt,
                fileName: name,
                fileUri: remoteUrl,
                mimeType: mimeType || 'application/pdf',
            }

            // 2. Dispatch thunk for local state & persistence
            await dispatch(sendMessage(messageData)).unwrap();

            navigation.goBack();
        } catch (error: any) {
            console.error('Failed to send document:', error);
            Alert.alert(t('common.error'), t('chat.error.sendFailed') || 'Failed to send document');
            setIsSending(false);
        }
    }, [dispatch, chatId, documentUri, documentName, documentType, documentSize, navigation, fileName, mimeType, type, t, currentUser, currentUserProfile, isSending]);

    return {
        documentName,
        documentSize,
        documentType,
        seekerName: route.params.seekerName || t('common.userFallback'),
        isSending,
        handleBack,
        handleSend,
    };
};
