import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { SvgIcon } from './SvgIcon';
import { SearchIcon } from '../../assets/icons';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    style?: ViewStyle;
    testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder,
    style,
    testID,
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
            <View style={styles.iconContainer}>
                <SvgIcon icon={SearchIcon} size={moderateScale(18)} color={theme.colors.mutedText} />
            </View>
            <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.mutedText}
                testID={testID}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        height: moderateScale(48),
        borderRadius: moderateScale(12),
        borderWidth: 1,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: fonts.regular,
        fontSize: moderateScale(14),
        paddingVertical: 0,
    },
});
