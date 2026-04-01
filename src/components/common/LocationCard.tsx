import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { SvgIcon } from './SvgIcon';
import { LocationIcon, ChevronRightIcon } from '../../assets/icons';

interface LocationCardProps {
    title: string;
    subTitle?: string;
    onPress: () => void;
    style?: ViewStyle;
    testID?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
    title,
    subTitle,
    onPress,
    style,
    testID,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                },
                style,
            ]}
            testID={testID}
        >
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.brandGreen + '10' }]}>
                    <SvgIcon icon={LocationIcon} size={moderateScale(24)} color={theme.colors.brandGreen} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.colors.brandGreen }]}>{title}</Text>
                    {subTitle && (
                        <Text style={[styles.subTitle, { color: theme.colors.mutedText }]}>
                            {subTitle}
                        </Text>
                    )}
                </View>
            </View>
            <SvgIcon icon={ChevronRightIcon} size={moderateScale(20)} color={theme.colors.mutedText} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: moderateScale(12),
        borderWidth: 1,
        justifyContent: 'space-between',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(22),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: fonts.semiBold,
        fontSize: moderateScale(16),
    },
    subTitle: {
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
        marginTop: moderateScale(2),
    },
});
