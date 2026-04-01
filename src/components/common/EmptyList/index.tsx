import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ContributorIcon } from '../../../assets/images';
import { useTheme } from '../../../theme';
import { scale } from '../../../theme/scale';
import { SvgIcon } from '../SvgIcon';
import { useEmptyList } from './EmptyList.hook';
import { createEmptyListStyles } from './EmptyList.styles';

interface EmptyListProps {
  title: string;
  subTitle: string;
  btnText: string;
  btnCallBack: () => void;
}

export function EmptyList({
  title,
  subTitle,
  btnText,
  btnCallBack,
}: EmptyListProps) {
  const { theme } = useTheme();
  const styles = createEmptyListStyles(theme);
  const { onPressButton } = useEmptyList({ btnCallBack });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <SvgIcon icon={ContributorIcon} size={scale(90)} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subTitle}>{subTitle}</Text>
      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <Text style={styles.buttonText}>{btnText}</Text>
        <FeatherIcon
          name="arrow-right"
          size={scale(20)}
          color={theme.colors.brandGreen}
        />
      </TouchableOpacity>
    </View>
  );
}
