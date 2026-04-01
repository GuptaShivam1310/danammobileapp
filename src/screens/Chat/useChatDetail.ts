import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    sendMessage,
    fetchMessages,
    selectMessages,
    setActiveChat,
    clearMessagesError,
} from '../../store/chat/chatSlice';
import { reportUserThunk } from '../../store/productSeekers/productSeekersSlice';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import socketService from '../../services/socketService';
import Toast from 'react-native-toast-message';
import { useDocumentPicker, PICK_TYPES } from '../../hooks/useDocumentPicker';
import { useImagePicker } from '../../hooks/useImagePicker';
import { ROUTES } from '../../constants/routes';

export const useChatDetail = (params: { productId?: string; seekerId?: string; chatId?: string; seekerName?: string; requestId?: string }) => {
    const { productId, seekerId, chatId: paramChatId, seekerName, requestId: paramRequestId } = params;
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();
    const { takePhoto, selectFromGallery } = useImagePicker();
    const { pickDocument } = useDocumentPicker();

    // Use requestId from params primarily as per requirements
    const chatId = paramRequestId || paramChatId || productId || seekerId || '';

    const messages = useAppSelector(selectMessages(chatId));
    const isTyping = useAppSelector(state => state.chat.typingUsers?.[chatId] || false);
    const messagesLoading = useAppSelector(state => state.chat.messagesLoading);

    const [inputText, setInputText] = useState('');
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isAttachmentMenuVisible, setIsAttachmentMenuVisible] = useState(false);

    const [isReporting, setIsReporting] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!chatId) return;

        dispatch(setActiveChat(chatId));
        // Re-enabled fetchMessages as per requirement: 
        // Fetch all chat messages for the selected request.
        dispatch(fetchMessages(chatId));

        socketService.joinChat(chatId);
        socketService.markAsRead(chatId);
        const typingTimeout = typingTimeoutRef.current;

        return () => {
            socketService.leaveChat(chatId);
            dispatch(setActiveChat(null));
            dispatch(clearMessagesError());
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [dispatch, chatId]);

    const currentUser = useAppSelector(state => state.auth.user);
    const isSeekerUser = currentUser?.role?.toLowerCase().startsWith('seeker');

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || !chatId) return;
        const text = inputText.trim();
        setInputText('');

        try {
            const senderId = String(currentUser?.id || 'unknown');
            const senderName = currentUser?.full_name || 'Anonymous';
            const _id = `temp-${Date.now()}`; // Optimistic ID

            // Dispatch thunk for persistence via REST API
            await dispatch(sendMessage({
                chatId,
                text,
                _id,
                senderId,
                senderName,
                type: 'text'
            })).unwrap();
        } catch {
            Alert.alert(t('common.error'), t('chat.error.sendFailed') || 'Failed to send message');
            setInputText(text); // Restore text on failure
        }
    }, [chatId, currentUser, dispatch, inputText, t]);

    const handleTyping = useCallback(() => {
        if (!chatId) return;
        socketService.typing(chatId);
    }, [chatId]);

    const handleAttachmentSelect = useCallback((option: string) => {
        setIsAttachmentMenuVisible(false);

        // Use setTimeout to allow the menu modal to dismiss fully before opening native pickers
        // This prevents the "previous promise did not settle" error on iOS
        setTimeout(() => {
            const onPhotoSelected = (asset: any) => {
                if (asset.uri) {
                    navigation.navigate(ROUTES.CHAT_IMAGE_PREVIEW, {
                        imageUri: asset.uri,
                        chatId,
                        seekerName: seekerName || t('common.userFallback')
                    });
                }
            };

            if (option === 'camera') takePhoto(onPhotoSelected);
            else if (option === 'gallery') selectFromGallery(onPhotoSelected);
            else if (option === 'document') {
                pickDocument((doc: any) => {
                    if (doc.uri) {
                        const mimeType = doc.type || '';
                        let type: 'image' | 'pdf' | 'doc' = 'doc';

                        if (mimeType.includes('image')) {
                            type = 'image';
                            navigation.navigate(ROUTES.CHAT_IMAGE_PREVIEW, {
                                imageUri: doc.uri,
                                chatId,
                                seekerName: seekerName || t('common.userFallback')
                            });
                            return;
                        } else if (mimeType.includes('pdf')) {
                            type = 'pdf';
                        }

                        navigation.navigate(ROUTES.CHAT_DOCUMENT_PREVIEW, {
                            documentUri: doc.uri,
                            documentName: doc.name || 'Document',
                            documentType: doc.type || 'Unknown',
                            documentSize: doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : '0 KB',
                            chatId,
                            fileName: doc.name,
                            fileUri: doc.uri,
                            mimeType: doc.type,
                            type: type
                        });
                    }
                }, [PICK_TYPES.pdf, PICK_TYPES.doc, PICK_TYPES.docx]);
            }
        }, 300); // 300ms is usually enough for modal dismissal animation
    }, [chatId, navigation, takePhoto, selectFromGallery, pickDocument, seekerName, t]);

    const handleProductPress = useCallback(() => {
        if (productId) {
            if (currentUser?.role?.toLowerCase().startsWith('seeker')) {
                navigation.navigate(ROUTES.PRODUCT_DETAIL, { id: productId });
            } else {
                navigation.navigate(ROUTES.POST_DETAIL, { id: productId });
            }
        }
    }, [navigation, productId, currentUser?.role]);

    const toggleAttachmentMenu = useCallback(() => {
        setIsAttachmentMenuVisible(prev => !prev);
    }, []);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleReport = useCallback(() => {
        setIsReportModalVisible(true);
    }, []);

    const handleCloseReport = useCallback(() => {
        setIsReportModalVisible(false);
    }, []);

    const handleReportSubmit = useCallback(async () => {
        const trimmedReason = reportReason.trim();
        if (!trimmedReason) {
            Alert.alert(t('common.error'), t('validation.messageRequired') || 'Please enter a reason');
            return;
        }
        if (!seekerId) return;

        setIsReporting(true);
        try {
            const response = await dispatch(reportUserThunk({ userId: seekerId, reason: trimmedReason })).unwrap();
            setIsReportModalVisible(false);
            setReportReason('');
            Toast.show({
                type: 'success',
                text1: t('alerts.success'),
                text2: response.message || t('reportUser.success'),
            });
            navigation.goBack();
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: t('alerts.error'),
                text2: err || t('reportUser.error') || 'Failed to report user',
            });
        } finally {
            setIsReporting(false);
        }
    }, [reportReason, t, seekerId, dispatch, navigation]);

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    return useMemo(() => ({
        messages: reversedMessages,
        loading: messagesLoading,
        inputText,
        isTyping,
        isReportModalVisible,
        isAttachmentMenuVisible,
        isReporting,
        reportReason,
        isSeekerUser,
        handleInputTextChange: setInputText,
        handleSend,
        handleTyping,
        handleAttachmentSelect,
        handleProductPress,
        toggleAttachmentMenu,
        handleBack,
        handleReport,
        handleCloseReport,
        handleReportReasonChange: setReportReason,
        handleReportSubmit,
    }), [
        reversedMessages,
        messagesLoading,
        inputText,
        isTyping,
        isReportModalVisible,
        isAttachmentMenuVisible,
        isReporting,
        reportReason,
        handleSend,
        handleTyping,
        handleAttachmentSelect,
        handleProductPress,
        toggleAttachmentMenu,
        handleBack,
        handleReport,
        handleCloseReport,
        handleReportSubmit,
    ]);
};
