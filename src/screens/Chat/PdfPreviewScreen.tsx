import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Text, StatusBar, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { palette } from '../../constants/colors';
import { scale, verticalScale, normalize } from '../../theme/scale';
import { fonts } from '../../theme/fonts';

type PdfPreviewRouteProp = RouteProp<DrawerParamList, typeof ROUTES.CHAT_PDF_VIEW>;

export const PdfPreviewScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<PdfPreviewRouteProp>();
    const { pdfUri, fileName } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={palette.blackPure} translucent />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} testID="pdf-preview-back-button">
                        <FeatherIcon name="arrow-left" size={scale(24)} color={palette.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{fileName || 'PDF Preview'}</Text>
                </View>

                <View style={styles.content}>
                    <Pdf
                        source={{
                            uri: decodeURIComponent(pdfUri || ''),
                            cache: true
                        }}
                        style={styles.pdf}
                        trustAllCerts={false}
                        enablePaging={true}
                        renderActivityIndicator={() => (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={palette.white} />
                                <Text style={styles.loadingText}>Loading PDF...</Text>
                            </View>
                        )}
                        onError={(error) => console.log('Pdf Viewer Error:', error)}
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
        backgroundColor: palette.modalOverlayDark,
        zIndex: 10,
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
    },
    pdf: {
        flex: 1,
        width: '100%',
        backgroundColor: palette.white,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.modalOverlay,
    },
    loadingText: {
        color: palette.white,
        marginTop: scale(10),
        fontSize: normalize(14),
        fontFamily: fonts.medium,
    }
});

export default PdfPreviewScreen;
