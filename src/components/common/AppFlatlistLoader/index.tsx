import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SvgProps } from 'react-native-svg';
import { SvgIcon } from '../SvgIcon';
import { palette } from '../../../constants/colors';
import { fonts } from '../../../theme/fonts';
import { normalize, scale, verticalScale } from '../../../theme/scale';
import { LoaderIcon } from '../../../assets/images';

interface LoaderProps {
  size?: number;
  color?: string;
  text?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.FC<SvgProps> | null;
  useActivityIndicator?: boolean;
  testID?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = scale(20),
  color = palette.black,
  text,
  containerStyle,
  textStyle,
  icon = LoaderIcon,
  useActivityIndicator = false,
  testID,
}) => {
  const shouldUseActivityIndicator = useActivityIndicator || !icon;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {shouldUseActivityIndicator ? (
        <ActivityIndicator size={size} color={color} />
      ) : (
        <SvgIcon icon={icon} size={size} color={color} />
      )}
      {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: normalize(10),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(12),
  },
  text: {
    marginLeft: scale(6),
    fontFamily: fonts.medium,
    fontSize: normalize(10),
    color: palette.gray400,
  },
});
