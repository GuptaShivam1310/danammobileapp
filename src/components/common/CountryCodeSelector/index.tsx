import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../theme';
import { normalize, moderateScale, verticalScale } from '../../../theme/scale';
import { getFlagEmoji } from '../../../utils/stringUtils';
import { CountryCode } from '../../../constants/countryCodes';
import { spacing } from '../../../theme/spacing';
import { palette } from '../../../constants/colors';

interface CountryCodeSelectorProps {
    countryCode: string;
    selectedCountry?: CountryCode;
    onPress: () => void;
    testID?: string;
    label?: string;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
    countryCode,
    selectedCountry,
    onPress,
    testID,
    label,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {/* {label && } */}
            <TouchableOpacity
                style={[
                    styles.selector,
                    {
                        borderColor: theme.colors.border, // Consistent with AppInput border
                        backgroundColor:
                            theme.colors.surface == null ? palette.white : undefined,
                    },
                ]}
                onPress={onPress}
                testID={testID}
            >
                <View style={styles.flagCircle}>
                    <Text style={styles.flagEmoji}>
                        {selectedCountry ? getFlagEmoji(selectedCountry.code) : ''}
                    </Text>
                </View>
                <Text style={[styles.codeText, { color: theme.colors.text }]}>{countryCode}</Text>
                <Icon name="chevron-down" size={normalize(14)} color={theme.colors.mutedText || palette.gray500} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: verticalScale(spacing.md),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '500',
        marginBottom: verticalScale(spacing.xs),
    },
    selector: {
        width: moderateScale(110),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(12),
        height: verticalScale(48),
        borderWidth: 1,
        borderRadius: moderateScale(8),
    },
    flagCircle: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.grayF3,
    },
    flagEmoji: {
        fontSize: normalize(18),
        transform: [{ scale: 1.5 }],
    },
    codeText: {
        fontSize: normalize(14),
        fontWeight: '400',
    },
});
