import { StyleSheet } from 'react-native';
import { palette } from '../../constants/colors';
import { normalize, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  flex: { flex: 1 },
  listContent: {
    paddingBottom: verticalScale(100),
  },
  listStyle: { paddingHorizontal: scale(spacing.sm) },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  itemColumn: {
    flex: 1,
    maxWidth: '50%',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.lg),
  },
  bannerRow: {
    flex: 1,
    paddingHorizontal: scale(spacing.sm),
    marginBottom: verticalScale(spacing.lg),
  },
  bannerSpacer: {
    flex: 1,
    height: 0,
    opacity: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
  },
  emptyText: {
    fontSize: normalize(16),
    fontWeight: '500',
    color: palette.gray700,
    marginTop: verticalScale(spacing.md),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
  },
  errorText: {
    fontSize: normalize(16),
    color: palette.red600,
    marginBottom: verticalScale(spacing.lg),
    textAlign: 'center',
  },
  headerContainer: {
    paddingVertical: verticalScale(spacing.sm),
  },
  retryButton: {
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.lg),
    backgroundColor: palette.seekerGreen,
    borderRadius: normalize(8),
  },
  retryText: {
    color: palette.white,
    fontSize: normalize(14),
    fontWeight: '600',
  },
});
