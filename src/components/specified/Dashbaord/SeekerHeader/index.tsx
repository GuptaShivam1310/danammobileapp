import React, { memo, useMemo } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../theme';
import AppImages  from '../../../../assets/images';
import { createSeekerHeaderStyles } from './seekerHeader.styles';

interface SeekerHeaderProps {
  title: string;
  subtitle: string;
}

function SeekerHeaderComponent({ title, subtitle }: SeekerHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createSeekerHeaderStyles(theme), [theme])
  return (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={AppImages.seekerBackground}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.headerContent}>
          <Image source={AppImages.logo} style={styles.logo} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

export const SeekerHeader = memo(SeekerHeaderComponent);
