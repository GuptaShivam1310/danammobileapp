import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useSelectSeeker, ISeeker } from './useSelectSeeker';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { palette } from '../../constants/colors';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppImage } from '../../components/common/AppImage';
import { AppButton } from '../../components/common/AppButton';

import { ActionModal } from '../../components/common/ActionModal';
import * as Icons from '../../assets/icons';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useTranslation } from 'react-i18next';

export const SelectSeekerScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);

    const {
        seekers,
        isLoading,
        selectedSeekerId,
        isConfirmModalVisible,
        selectedSeekerData,
        handleBack,
        handleSelectSeeker,
        handleSubmitSelection,
        handleConfirmSelection,
        handleCancelSelection,
    } = useSelectSeeker();

    const renderItem = ({ item }: { item: ISeeker }) => {
        const isSelected = selectedSeekerId === item.id;

        return (
            <TouchableOpacity
                style={[styles.seekerItem, isSelected && styles.seekerItemSelected]}
                onPress={() => handleSelectSeeker(item.id)}
                activeOpacity={0.7}
                testID={`select-seeker-item-${item.id}`}
            >
                <View style={[styles.avatarContainer, isSelected && { backgroundColor: palette.green150 }]}>
                    {item.avatar ? (
                        <AppImage imageUri={item.avatar} style={styles.avatarImage} />
                    ) : (
                        <Text style={[styles.avatarPlaceholder, isSelected && { color: theme.colors.brandGreen }]}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                <Text style={styles.nameText}>{item.name}</Text>

                <View style={styles.radioContainer}>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} testID={`select-seeker-radio-${item.id}`}>
                        {isSelected && <View style={styles.radioInner} testID={`select-seeker-radio-inner-${item.id}`} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer} testID="select-seeker-empty">
            <Text style={styles.emptyText}>
                {t('selectSeeker.noSeekers')}
            </Text>
        </View>
    );

    return (
        <ScreenWrapper testID="select-seeker-screen">
            <View style={styles.container}>
                <Header
                    title={t('selectSeeker.title')}
                    onBackPress={handleBack}
                    backButtonTestID="select-seeker-back-button"
                />

                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.brandGreen} />
                    </View>
                ) : (
                    <FlatList
                        data={seekers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={renderEmpty}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <PrimaryButton
                    title={t('selectSeeker.selectButton')}
                    onPress={handleSubmitSelection}
                    disabled={!selectedSeekerId || seekers.length === 0}
                    testID="select-seeker-button"
                />

                <ActionModal
                    isVisible={isConfirmModalVisible}
                    onClose={handleCancelSelection}
                    onConfirm={handleConfirmSelection}
                    icon={Icons.SeekerConform}
                    title={t('selectSeeker.confirmModal.title')}
                    subtitle={t('selectSeeker.confirmModal.content', { name: selectedSeekerData?.name || '' })}
                    cancelText={t('selectSeeker.confirmModal.cancel')}
                    confirmText={t('selectSeeker.confirmModal.confirm')}
                    testIDPrefix="confirm-seeker-modal"
                />
            </View>
        </ScreenWrapper>
    );
};
