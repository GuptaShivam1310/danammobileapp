import React from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import { normalize, moderateScale } from '../../../theme/scale';
import { fonts } from '../../../theme/fonts';
import { lightColors } from '../../../constants/colors';
import { spacing } from '../../../theme/spacing';

type Props = ButtonProps & {
  title: string;
};

export function AppButton({ title, buttonStyle, titleStyle, ...rest }: Props) {
  return (
    <Button
      title={title}
      buttonStyle={[
        {
          backgroundColor: lightColors.primary,
          borderRadius: moderateScale(8),
          paddingVertical: moderateScale(spacing.md),
        },
        buttonStyle,
      ]}
      titleStyle={[
        {
          fontSize: normalize(16),
          fontFamily: fonts.semiBold
        },
        titleStyle,
      ]}
      {...rest}
    />
  );
}
