import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../theme';
import { moderateScale } from '../../../theme/scale';
import { styles as createStyles } from './styles';

interface HeaderProps {
    title: string;
    onBackPress: () => void;
    testID?: string;
    backButtonTestID?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    onBackPress,
    testID,
    backButtonTestID,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.header} testID={testID}>
            <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                testID={backButtonTestID}
            >
                <FeatherIcon name="arrow-left" size={moderateScale(24)} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );
};
