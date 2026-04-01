import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import { moderateScale } from '../../theme/scale';
import { SvgIcon } from './SvgIcon';
import { authUiColors, palette } from '../../constants/colors';

interface TabBarIconProps {
    icon: any;
    isFocused: boolean;
    isMiddle?: boolean;
}

const GradientBorder = ({ size }: { size: number }) => {
    const strokeWidth = 2.5;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <View style={StyleSheet.absoluteFill}>
            <Svg height={size} width={size}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={palette.yellow500} />
                        <Stop offset="100%" stopColor={palette.green800} />
                    </LinearGradient>
                </Defs>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#grad)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference / 2} ${circumference / 2}`}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
};

export const TabBarIcon: React.FC<TabBarIconProps> = ({ icon, isFocused, isMiddle }) => {
    const { theme } = useTheme();

    const activeColor = theme.colors.brandGreen;

    if (isMiddle) {
        return (
            <View style={[styles.middleIconContainer, { backgroundColor: activeColor }]}>
                <SvgIcon
                    icon={icon}
                    size={moderateScale(32)}
                />
            </View>
        );
    }

    const containerSize = moderateScale(52);

    return (
        <View style={[styles.iconContainer, { width: containerSize, height: containerSize, borderRadius: containerSize / 2 }]}>
            {isFocused && <GradientBorder size={containerSize} />}
            <SvgIcon
                icon={icon}
                size={moderateScale(50)}
                color={authUiColors.white}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.white,
        // Common shadow for the white circle
        shadowColor: palette.blackPure,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    middleIconContainer: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: palette.blackPure,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
