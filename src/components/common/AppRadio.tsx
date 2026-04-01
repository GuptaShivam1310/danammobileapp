import React, { useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { lightColors } from '../../constants/colors';
import { moderateScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';
import { normalize } from '../../theme/scale';

interface AppRadioProps {
  title: string;
  selected: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function AppRadio({ title, selected, size, style, onPress }: AppRadioProps) {
  const resolvedSize = size ?? moderateScale(18);
  const innerSize = resolvedSize * 0.6;

  const outerStyle = useMemo(
    () => ({
      width: resolvedSize,
      height: resolvedSize,
      borderRadius: resolvedSize / 2,
      borderColor: selected ? lightColors.seekerGreen : lightColors.seekerGreenLight,
    }),
    [resolvedSize, selected],
  );

  const innerStyle = useMemo(
    () => ({
      width: innerSize,
      height: innerSize,
      borderRadius: innerSize / 2,
      backgroundColor: lightColors.seekerGreen,
    }),
    [innerSize],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
      style={[styles.container, style]}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.outer, outerStyle]}>
        {selected ? <View style={[styles.inner, innerStyle]} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: normalize(14),
    fontFamily: fonts.medium,
    color: lightColors.text,
  },
  outer: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    borderRadius: 999,
  },
});
