import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { useTheme } from '../../theme';
import { useRequestDetail } from './useRequestDetail';
import { styles as createStyles } from './styles';
import { moderateScale } from '../../theme/scale';
import { useTranslation } from 'react-i18next';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ReportUserModal } from '../../components/common/ReportUserModal';
import { SuccessCheckIcon } from '../../assets/icons';
import { formatDisplayDate } from '../../utils/dateUtils';

export const RequestDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const { t } = useTranslation();
    const {
        data,
        isLoading,
        error,
        isActionLoading,
        isMenuVisible,
        isRejectModalVisible,
        isReportModalVisible,
        isSuccessModalVisible,
        isReporting,
        rejectReason,
        setRejectReason,
        reportReason,
        setReportReason,
        setIsReportModalVisible,
        handleAccept,
        handleReject,
        handleCloseRejectModal,
        handleConfirmReject,
        handleReport,
        handleConfirmReport,
        handleBackToChat,
        toggleMenu,
        handleRetry,
        handleBack,
    } = useRequestDetail();

    const renderValue = (value: string | null | undefined) => {
        if (value === null || value === undefined || value.trim() === '') {
            return 'N/A';
        }
        return value;
    };

    if (isLoading) {
        return (
            <ScreenWrapper testID="request-detail-screen">
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={theme.colors.brandGreen} testID="loading-indicator" />
                </View>
            </ScreenWrapper>
        );
    }

    if (error) {
        return (
            <ScreenWrapper testID="request-detail-screen">
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: moderateScale(20) }]}>
                    <Text style={{ color: theme.colors.danger, marginBottom: moderateScale(20), textAlign: 'center' }}>{error}</Text>
                    <TouchableOpacity
                        style={{ backgroundColor: theme.colors.brandGreen, paddingHorizontal: moderateScale(30), paddingVertical: moderateScale(10), borderRadius: moderateScale(8) }}
                        onPress={handleRetry}
                    >
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('myReceivedGoods.retry') || 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const DetailItem = ({ label, value, showDivider = true }: { label: string; value: string; showDivider?: boolean }) => (
        <View style={styles.detailItem}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {showDivider && <View style={[styles.divider, { marginTop: moderateScale(16) }]} />}
        </View>
    );

    return (
        <ScreenWrapper testID="request-detail-screen">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                            testID="request-detail-back-button"
                        >
                            <FeatherIcon name="arrow-left" size={moderateScale(20)} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Image
                            source={
                                data?.user?.profile_image
                                    ? { uri: data?.user?.profile_image }
                                    : require('../../assets/images/userIcon.png')
                            }
                            style={styles.userAvatar}
                            testID="request-detail-user-avatar"
                        />
                        <Text style={styles.userName} testID="request-detail-user-name">
                            {data?.user.name || 'User Name'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={toggleMenu}
                        testID="request-detail-menu-button"
                    >
                        <FeatherIcon name="more-vertical" size={moderateScale(24)} color={theme.colors.text} />
                    </TouchableOpacity>

                    {isMenuVisible && (
                        <TouchableOpacity
                            style={styles.menuPopup}
                            onPress={handleReport}
                            testID="request-detail-report-button"
                        >
                            <Text style={styles.menuItem}>{t('requestDetail.reportUser')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Main Content */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <DetailItem
                            label={t('requestDetail.labels.seeking')}
                            value={renderValue(data?.product_name)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.gender')}
                            value={renderValue(data?.gender)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.dob')}
                            value={renderValue(data?.date_of_birth)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.profession')}
                            value={renderValue(data?.profession)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.location')}
                            value={renderValue(data?.location)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.reason')}
                            value={renderValue(data?.reason)}
                        />
                        <DetailItem
                            label={t('requestDetail.labels.requestedDate')}
                            value={data?.requested_date ? formatDisplayDate(data.requested_date) : 'N/A'}
                            showDivider={false}
                        />
                    </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={handleReject}
                        disabled={isActionLoading}
                        testID="request-detail-reject-button"
                    >
                        <Text style={styles.rejectText}>{t('requestDetail.actions.reject')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={handleAccept}
                        disabled={isActionLoading}
                        testID="request-detail-accept-button"
                    >
                        <Text style={styles.acceptText}>{t('requestDetail.actions.accept')}</Text>
                    </TouchableOpacity>
                </View>


                {/* Reject Request Modal */}
                <Modal
                    transparent
                    visible={isRejectModalVisible}
                    animationType="fade"
                    onRequestClose={handleCloseRejectModal}
                    testID="reject-modal"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>{t('requestDetail.rejectModal.title')}</Text>
                                <Text style={styles.modalSubtitle}>{t('requestDetail.rejectModal.subtitle')}</Text>
                                <TextInput
                                    style={styles.reasonInput}
                                    placeholder={t('requestDetail.rejectModal.placeholder')}
                                    placeholderTextColor={theme.colors.mutedText}
                                    multiline
                                    value={rejectReason}
                                    onChangeText={setRejectReason}
                                    testID="reject-reason-input"
                                />
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={handleCloseRejectModal}
                                        testID="reject-modal-cancel-button"
                                    >
                                        <Text style={styles.modalCancelText}>{t('requestDetail.rejectModal.cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalConfirmButton}
                                        onPress={handleConfirmReject}
                                        testID="reject-modal-confirm-button"
                                    >
                                        <Text style={styles.modalConfirmText}>{t('requestDetail.rejectModal.confirm')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Success Modal */}
                <SuccessModal
                    isVisible={isSuccessModalVisible}
                    onClose={() => { }}
                    title={t('requestDetail.acceptSuccessModal.title')}
                    subtitle={t('requestDetail.acceptSuccessModal.subtitle')}
                    buttonText={t('requestDetail.acceptSuccessModal.backToChat')}
                    onButtonPress={handleBackToChat}
                    icon={SuccessCheckIcon}
                    testIDPrefix="accept-success"
                />

                <ReportUserModal
                    isVisible={isReportModalVisible}
                    userName={data?.user.name || 'User'}
                    reason={reportReason}
                    onReasonChange={setReportReason}
                    onCancel={() => setIsReportModalVisible(false)}
                    onReport={handleConfirmReport}
                    isLoading={isReporting}
                />

                {/* Action Loading Overlay */}
                {isActionLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.colors.brandGreen} testID="loading-indicator" />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
};
