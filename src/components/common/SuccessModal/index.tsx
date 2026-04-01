import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../../theme';
import { normalize, scale, verticalScale, moderateScale } from '../../../theme/scale';
import { SvgIcon } from '../SvgIcon';
import { fonts } from '../../../theme/fonts';
import { ArrowIcon, ContributedDoneIcon } from '../../../assets/icons';
import { AppModal } from '../AppModal';

interface SuccessModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonPress: () => void;
    icon?: any;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isVisible,
    onClose,
    title,
    subtitle,
    buttonText,
    onButtonPress,
    icon = ContributedDoneIcon,
}) => {
    const { theme } = useTheme();

    return (
        <AppModal isVisible={isVisible} onClose={onClose}>
            <View style={styles.iconContainer}>
                <SvgIcon icon={icon} size={moderateScale(56)} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>
                {subtitle}
            </Text>

            <TouchableOpacity
                style={[styles.button, { borderColor: theme.colors.brandGreen }]}
                onPress={onButtonPress}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, { color: theme.colors.brandGreen }]}>
                    {buttonText}
                </Text>
                <View style={styles.arrowIcon}>
                    <SvgIcon icon={ArrowIcon} size={moderateScale(16)} color={theme.colors.brandGreen} />
                </View>
            </TouchableOpacity>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        marginBottom: verticalScale(10),
    },
    title: {
        fontSize: normalize(22),
        fontFamily: fonts.bold,
        marginBottom: verticalScale(16),
        textAlign: 'center',
        paddingHorizontal: scale(10),
    },
    subtitle: {
        fontSize: normalize(16),
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: verticalScale(30),
        lineHeight: normalize(22),
        paddingHorizontal: scale(10),
    },
    button: {
        flexDirection: 'row',
        height: verticalScale(45),
        borderRadius: scale(12),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(20),
    },
    buttonText: {
        fontSize: normalize(16),
        fontFamily: fonts.semiBold,
        marginRight: scale(10),
    },
    arrowIcon: {
        transform: [{ rotate: '0deg' }], // Adjust if icon is not pointing right
    },
});
