import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, Image } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { palette } from '../../constants/colors';
import { scale, verticalScale, normalize } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

type ImagePreviewRouteProp = RouteProp<DrawerParamList, typeof ROUTES.CHAT_IMAGE_VIEW>;

export const ImagePreviewScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ImagePreviewRouteProp>();
    const { imageUri, fileName } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={palette.blackPure} translucent />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} testID="image-preview-back-button">
                        <FeatherIcon name="arrow-left" size={scale(24)} color={palette.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{fileName || 'Image'}</Text>
                </View>

                <View style={styles.content}>
                    <Image
                        source={{ uri: imageUri }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="contain"
                        testID="preview-image"
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.blackPure,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        height: verticalScale(56),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        backgroundColor: palette.modalOverlay,
    },
    backButton: {
        padding: scale(8),
        marginRight: scale(12),
    },
    headerTitle: {
        fontSize: normalize(18),
        color: palette.white,
        fontFamily: fonts.semiBold,
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ImagePreviewScreen;
