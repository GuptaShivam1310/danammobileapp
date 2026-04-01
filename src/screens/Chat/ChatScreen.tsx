import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { AppImage } from '../../components/common/AppImage';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { ReportUserModal } from '../../components/common/ReportUserModal';
import { useTheme } from '../../theme';
import { scale, verticalScale } from '../../theme/scale';
import { useChatDetail } from './useChatDetail';
import { createStyles } from './styles';
import MessageBubble from '../../components/Chat/MessageBubble';
import ChatInput from '../../components/Chat/ChatInput';
import AttachmentMenu from '../../components/Chat/AttachmentMenu';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';

type ChatScreenProps = NativeStackScreenProps<DrawerParamList, typeof ROUTES.CHAT>;

export const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
    const { params } = route;
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const {
        messages,
        loading,
        inputText,
        isTyping,
        isReportModalVisible,
        isAttachmentMenuVisible,
        isReporting,
        reportReason,
        isSeekerUser,
        handleInputTextChange,
        handleSend,
        handleBack,
        handleReport,
        handleCloseReport,
        handleReportReasonChange,
        handleReportSubmit,
        toggleAttachmentMenu,
        handleAttachmentSelect,
        handleProductPress,
    } = useChatDetail(params || {});

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="chat-back-button">
                <FeatherIcon name="arrow-left" size={scale(20)} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
                {params?.seekerAvatar ? (
                    <AppImage imageUri={params?.seekerAvatar} style={styles.userAvatar} testID="seeker-avatar" />
                ) : (
                    <View style={[styles.userAvatar, { backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }]} testID="seeker-avatar-placeholder">
                        <FeatherIcon name="user" size={scale(20)} color={theme.colors.mutedText} />
                    </View>
                )}
                <View>
                    <Text style={styles.userName} numberOfLines={1} testID="seeker-name">{params?.seekerName}</Text>
                </View>
            </View>

            {!isSeekerUser && (
                <TouchableOpacity
                    onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                    style={styles.optionsButton}
                    testID="chat-options-button"
                >
                    <FeatherIcon name="more-vertical" size={scale(20)} color={theme.colors.text} />
                </TouchableOpacity>
            )}

            {isDropdownVisible && !isSeekerUser && (
                <TouchableOpacity
                    style={styles.reportDropdown}
                    onPress={() => {
                        handleReport();
                        setIsDropdownVisible(false);
                    }}
                    testID="report-user-button"
                >
                    <Text style={styles.reportText}>{t('chat.reportUser') || 'Report User'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderProductSubHeader = () => (
        <TouchableOpacity
            style={styles.productSubHeader}
            onPress={handleProductPress}
            activeOpacity={0.7}
            testID="chat-product-pressable"
        >
            {params?.productImage ? (
                <AppImage imageUri={params?.productImage} style={styles.productImage} testID="product-image" />
            ) : (
                <View style={[styles.productImage, { backgroundColor: theme.colors.border }]} testID="product-image-placeholder" />
            )}
            <Text style={styles.productTitle} numberOfLines={2} testID="product-title">{params?.productTitle}</Text>
            <FeatherIcon name="chevron-right" size={scale(20)} color={theme.colors.mutedText} />
        </TouchableOpacity>
    );

    const renderItem = useCallback(({ item }: { item: any }) => (
        <MessageBubble message={item} senderAvatar={params?.seekerAvatar} />
    ), [params?.seekerAvatar]);

    const renderListHeader = useCallback(() => (
        isTyping ? (
            <View style={styles.typingContainer}>
                <Text style={styles.typingText}>{params?.seekerName} {t('chat.typing')}</Text>
            </View>
        ) : null
    ), [isTyping, params?.seekerName, t, styles.typingContainer, styles.typingText]);
    return (
        <ScreenWrapper withBottomTab={false} noPadding>
            <View style={styles.container}>
                {renderHeader()}
                {renderProductSubHeader()}

                {loading && messages.length === 0 ? (
                    <View style={styles.centered} testID="chat-loading">
                        <ActivityIndicator size="large" color={theme.colors.brandGreen} />
                    </View>
                ) : (
                    <FlatList
                        inverted
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        testID="message-list"
                        ListHeaderComponent={renderListHeader}
                        initialNumToRender={15}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        removeClippedSubviews={Platform.OS === 'android'}
                    />
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? verticalScale(90) : 0}
                >
                    <ChatInput
                        value={inputText}
                        onChangeText={handleInputTextChange}
                        onSend={handleSend}
                        onPlusPress={toggleAttachmentMenu}
                    />
                </KeyboardAvoidingView>

                {!isSeekerUser && (
                    <ReportUserModal
                        isVisible={isReportModalVisible}
                        userName={params?.seekerName}
                        reason={reportReason}
                        onReasonChange={handleReportReasonChange}
                        onCancel={handleCloseReport}
                        onReport={handleReportSubmit}
                        isLoading={isReporting}
                    />
                )}

                <AttachmentMenu
                    isVisible={isAttachmentMenuVisible}
                    onClose={toggleAttachmentMenu}
                    onOptionSelect={handleAttachmentSelect}
                />
            </View>
        </ScreenWrapper>
    );
};
