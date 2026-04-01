import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SvgIcon } from '../../components/common/SvgIcon';
import { AppImage } from '../../components/common/AppImage';
import { useUploadImages } from './useUploadImages';
import { styles as createStyles } from './styles';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '../../theme/scale';
import { CameraIcon, DeleteIcon, GalleryIcon } from '../../assets/icons';

// Import SVG icons as components (thanks to react-native-svg-transformer)

export const UploadImagesScreen: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(theme);
    const {
        images,
        isUploading,
        handleCapture,
        handleChooseGallery,
        handleDeleteImage,
        handleBack,
        handleNext,
    } = useUploadImages();

    const renderHeader = () => (
        <Header
            title={t('uploadImages.title')}
            onBackPress={handleBack}
            testID="upload-images-header"
            backButtonTestID="upload-images-back-button"
        />
    );

    const renderSelectionOptions = () => (
        <View style={styles.selectionRow}>
            <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleCapture}
                testID="capture-button"
            >
                <SvgIcon icon={CameraIcon} size={moderateScale(32)} color={theme.colors.brandGreen} />
                <Text style={styles.selectionText}>{t('uploadImages.captureFromCamera')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleChooseGallery}
                testID="gallery-button"
            >
                <SvgIcon icon={GalleryIcon} size={moderateScale(32)} color={theme.colors.brandGreen} />
                <Text style={styles.selectionText}>{t('uploadImages.chooseFromGallery')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderImageItem = ({ item, index }: { item: string, index: number }) => (
        <View style={styles.imageContainer} testID={`image-item-${index}`}>
            <AppImage imageUri={item} style={styles.image} />
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteImage(index)}
                testID={`delete-image-${index}`}
            >
                <SvgIcon icon={DeleteIcon} size={moderateScale(16)} />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {renderHeader()}

                <View style={styles.content}>
                    {renderSelectionOptions()}

                    <FlatList
                        data={images}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={renderImageItem}
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        style={styles.imageList}
                        columnWrapperStyle={styles.columnWrapper}
                        testID="images-list"
                    />
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title={t('uploadImages.nextButton')}
                        onPress={handleNext}
                        loading={isUploading}
                        testID="upload-images-next-button"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
};
