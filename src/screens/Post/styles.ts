import { StyleSheet } from 'react-native';
import { normalize, scale, verticalScale } from '../../theme/scale';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(16),
    },
    headerTitle: {
        fontSize: normalize(24),
        fontWeight: '700',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: verticalScale(24),
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        // backgroundColor: '#F0FDF4', // Light green background
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: normalize(20),
        fontWeight: '700',
        marginBottom: verticalScale(8),
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: normalize(16),
        marginBottom: verticalScale(32),
        textAlign: 'center',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(24),
        borderWidth: 1,
        borderRadius: normalize(8),
    },
    continueButtonText: {
        fontSize: normalize(16),
        fontWeight: '600',
        marginRight: scale(8),
    },
    listContent: {
        paddingBottom: verticalScale(100),
        paddingHorizontal: scale(spacing.xs),
    },
    columnWrapper: {
        gap: scale(spacing.lg),
        justifyContent: 'flex-start',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: verticalScale(16),
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderRadius: normalize(10),
        borderWidth: 1,
        marginHorizontal: scale(4),
    },
    tabText: {
        fontSize: normalize(14),
        fontWeight: '600',
    },
    itemContainer: {
        flex: 1,
        maxWidth: '50%',
    },
});
