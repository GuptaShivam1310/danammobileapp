import React from 'react';
import { StyleSheet, Text, TextStyle, StyleProp } from 'react-native';
import { typography } from '../../theme/typography';
import { lightColors } from '../../constants/colors';

interface AppTitleProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function AppTitle({ text, style }: AppTitleProps) {
  return <Text style={[styles.title, style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: lightColors.text,
  },
});
