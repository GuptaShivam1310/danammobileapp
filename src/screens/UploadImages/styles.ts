import { StyleSheet, Dimensions } from 'react-native';
import { moderateScale, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

const NUM_COLUMNS = 3;
const SPACING = scale(spacing.sm);
const HORIZONTAL_PADDING = scale(spacing.lg);

// Correct calculation
const ITEM_SIZE =
    (width - HORIZONTAL_PADDING * 2 - SPACING * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;
export const styles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            marginTop: verticalScale(spacing.lg)
        },
        content: {
            flex: 1,
            paddingTop: verticalScale(spacing.lg),
        },
        selectionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: verticalScale(spacing.xl),
        },
        selectionButton: {
            flex: 0.48,
            height: verticalScale(100),
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
            borderRadius: moderateScale(12),
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.sm,
            backgroundColor: theme.colors.surface,
        },
        selectionText: {
            fontFamily: fonts.medium,
            fontSize: moderateScale(12),
            color: theme.colors.text,
            marginTop: verticalScale(spacing.xs),
            textAlign: 'center',
        },
        imageList: {
            flex: 1,
        },
        columnWrapper: {
            justifyContent: 'flex-start',
            gap: SPACING,
        },

        imageContainer: {
            width: ITEM_SIZE,
            aspectRatio: 1, // 🔥 Important: keeps square
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#eee',
            marginBottom: verticalScale(spacing.sm),
        },

        image: {
            width: '100%',
            height: '100%',
        },

        deleteButton: {
            position: 'absolute',
            top: moderateScale(6),
            right: moderateScale(6),
            backgroundColor: theme.colors.surface,
            borderRadius: moderateScale(15),
            width: moderateScale(24),
            height: moderateScale(24),
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        footer: {
            padding: spacing.lg,
            paddingBottom: verticalScale(spacing.xl),
        },
    });
