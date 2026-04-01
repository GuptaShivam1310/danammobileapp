import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useAddDetail } from './useAddDetail';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';

export const AddDetailScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);
    const {
        title,
        description,
        handleTitleChange,
        handleDescriptionChange,
        handleBack,
        handleNext,
        TITLE_LIMIT,
        DESCRIPTION_LIMIT,
    } = useAddDetail();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header
                    title={t('addDetail.title')}
                    onBackPress={handleBack}
                    testID="add-detail-header"
                    backButtonTestID="add-detail-back-button"
                />

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.inputContainer}>
                        <AppInput
                            label={t('addDetail.labelTitle')}
                            value={title}
                            onChangeText={handleTitleChange}
                            placeholder={t('addDetail.placeholderTitle')}
                            testID="title-input"
                            containerStyle={{ marginBottom: 0 }}
                            maxLength={TITLE_LIMIT}
                        />
                        <View style={styles.limitContainer}>
                            <Text style={styles.limitText}>
                                {`${title.length}/${TITLE_LIMIT}`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <AppInput
                            label={t('addDetail.labelDescription')}
                            value={description}
                            onChangeText={handleDescriptionChange}
                            placeholder={t('addDetail.placeholderDescription')}
                            multiline
                            numberOfLines={4}
                            testID="description-input"
                            containerStyle={{ marginBottom: 0 }}
                            style={styles.descriptionInput}
                            maxLength={DESCRIPTION_LIMIT}
                        />
                        <View style={styles.limitContainer}>
                            <Text style={styles.limitText}>
                                {`${description.length}/${DESCRIPTION_LIMIT}`}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        title={t('addDetail.nextButton')}
                        onPress={handleNext}
                        testID="add-detail-next-button"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};
