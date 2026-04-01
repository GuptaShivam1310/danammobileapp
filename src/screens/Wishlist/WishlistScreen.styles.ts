import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { normalize, scale, verticalScale } from '../../theme/scale';
import { fonts } from '../../theme/fonts';

export const createWishlistScreenStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(16),
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: normalize(20),
    color: theme.colors.text,
  },
  listContent: {
    paddingBottom: verticalScale(12),
  },
  emptyListContent: {
    flexGrow: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    paddingVertical: verticalScale(12),
  },
  imageContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: normalize(10),
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(10),
  },
  heartButton: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(20),
    height: scale(20),
    borderRadius: normalize(10),
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  itemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: normalize(14),
    lineHeight: normalize(16),
    color: theme.colors.text,
  },
  itemSubtitle: {
    marginTop: verticalScale(4),
    fontFamily: fonts.regular,
    fontSize: normalize(12),
    lineHeight: normalize(14),
    color: theme.colors.mutedText,
  },
  arrowContainer: {
    marginLeft: scale(12),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
