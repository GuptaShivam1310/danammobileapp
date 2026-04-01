import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/common/ScreenWrapper';
import { Header } from '../../components/common/Header';
import { useTheme } from '../../theme';
import { palette } from '../../constants/colors';
import { normalize, moderateScale, verticalScale, scale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

export const RateUsScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [rating, setRating] = React.useState(0);

    return (
        <ScreenWrapper testID="rate-us-screen">
            <View style={styles.container}>
                <View style={{ paddingHorizontal: moderateScale(20) }}>
                    <Header
                        title={t('helpSupport.rateUs')}
                        onBackPress={() => navigation.goBack()}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Enjoying Danam?</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
                        Tap a star to rate it on the App Store.
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                activeOpacity={0.7}
                                testID={`star-rating-${star}`}
                            >
                                <FontAwesome
                                    name={star <= rating ? 'star' : 'star-o'}
                                    size={moderateScale(40)}
                                    color={star <= rating ? palette.yellow500 : palette.gray350}
                                    style={{ marginHorizontal: moderateScale(5) }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {rating > 0 && (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.brandGreen }]}
                            onPress={() => navigation.goBack()}
                            testID="submit-rating-button"
                        >
                            <Text style={styles.buttonText}>Submit Rating</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: moderateScale(20),
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: normalize(24),
        fontFamily: fonts.bold,
        marginBottom: verticalScale(12),
    },
    subtitle: {
        fontSize: normalize(16),
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: verticalScale(40),
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: verticalScale(60),
    },
    button: {
        width: '100%',
        height: verticalScale(48),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: palette.white,
        fontSize: normalize(16),
        fontFamily: fonts.semiBold,
    },
});
