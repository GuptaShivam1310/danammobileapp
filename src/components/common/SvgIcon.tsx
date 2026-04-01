import React from 'react';
import { SvgProps } from 'react-native-svg';
import { ViewStyle, StyleProp } from 'react-native';

interface SvgIconProps extends SvgProps {
    icon: React.FC<SvgProps>;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
    icon: Icon,
    size = 24,
    color,
    style,
    testID,
    ...props
}) => {
    return (
        <Icon
            width={size}
            height={size}
            {...(color ? { fill: color, stroke: color } : {})}
            style={style}
            testID={testID}
            {...props}
        />
    );
};
