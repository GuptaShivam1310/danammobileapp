import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { normalize, verticalScale, moderateScale } from '../../../theme/scale';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme';
import { fonts } from '../../../theme/fonts';
import { spacing } from '../../../theme/spacing';

interface RoleSelectorProps {
  selectedRole: 'donor' | 'seeker';
  onSelect: (role: 'donor' | 'seeker') => void;
  testIDDonor?: string;
  testIDSeeker?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelect,
  testIDDonor,
  testIDSeeker,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.roleCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: selectedRole === 'donor' ? theme.colors.brandGreen : theme.colors.border,
          },
        ]}
        onPress={() => onSelect('donor')}
        testID={testIDDonor}
      >
        <Text
          style={[
            styles.roleText,
            { color: selectedRole === 'donor' ? theme.colors.brandGreen : theme.colors.text },
          ]}
        >
          {t('signup.donor')}
        </Text>
        <View
          style={[
            styles.radioCircle,
            { borderColor: selectedRole === 'donor' ? theme.colors.brandGreen : theme.colors.border },
            selectedRole === 'donor' && { backgroundColor: theme.colors.brandGreen + '20' },
          ]}
        >
          {selectedRole === 'donor' && <View style={[styles.radioInner, { backgroundColor: theme.colors.brandGreen }]} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roleCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: selectedRole === 'seeker' ? theme.colors.brandGreen : theme.colors.border,
          },
        ]}
        onPress={() => onSelect('seeker')}
        testID={testIDSeeker}
      >
        <Text
          style={[
            styles.roleText,
            { color: selectedRole === 'seeker' ? theme.colors.brandGreen : theme.colors.text },
          ]}
        >
          {t('signup.seeker')}
        </Text>
        <View
          style={[
            styles.radioCircle,
            { borderColor: selectedRole === 'seeker' ? theme.colors.brandGreen : theme.colors.border },
            selectedRole === 'seeker' && { backgroundColor: theme.colors.brandGreen + '20' },
          ]}
        >
          {selectedRole === 'seeker' && <View style={[styles.radioInner, { backgroundColor: theme.colors.brandGreen }]} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: verticalScale(spacing.md),
    gap: moderateScale(spacing.md),
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(spacing.md),
    borderWidth: 1,
    borderRadius: moderateScale(8),
  },
  roleText: {
    fontFamily: fonts.medium,
    fontSize: normalize(16),
  },
  radioCircle: {
    height: moderateScale(20),
    width: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: moderateScale(10),
    width: moderateScale(10),
    borderRadius: moderateScale(5),
  },
});
