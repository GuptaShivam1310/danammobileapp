import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { spacing } from '../../theme/spacing';
import { moderateScale, normalize, scale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';

export const createMyReceivedGoodsStyles = (theme: any) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.sm),
  },
  emptyListContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: verticalScale(spacing.md),
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: verticalScale(140),
    borderRadius: moderateScale(10),
    backgroundColor: palette.gray200,
  },
  cardContent: {
    marginTop: verticalScale(8),
  },
  cardTitle: {
    fontFamily: fonts.medium,
    fontSize: normalize(12),
    lineHeight: normalize(17),
    color: theme.colors.text,
  },
  cardDate: {
    marginTop: verticalScale(4),
    fontFamily: fonts.regular,
    fontSize: normalize(11),
    color: theme.colors.mutedText,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
  },
  stateText: {
    fontFamily: fonts.medium,
    fontSize: normalize(14),
    color: theme.colors.mutedText,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(spacing.md),
    backgroundColor: palette.seekerGreen,
    paddingHorizontal: scale(spacing.lg),
    borderRadius: moderateScale(8),
  },
});
