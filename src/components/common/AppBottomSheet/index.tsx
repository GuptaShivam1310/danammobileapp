import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../../theme';
import { scale } from '../../../theme/scale';
import { palette } from '../../../constants/colors';

interface AppBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    overlayStyle?: StyleProp<ViewStyle>;
    animationType?: 'none' | 'slide' | 'fade';
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
    isVisible,
    onClose,
    children,
    containerStyle,
    overlayStyle,
    animationType: _animationType = 'fade',
}) => {
    const { theme } = useTheme();
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['25%'], []);

    useEffect(() => {
        if (isVisible) {
            sheetRef.current?.present();
            return;
        }
        sheetRef.current?.dismiss();
    }, [isVisible]);

    const handleSheetChange = useCallback(
        (index: number) => {
            if (index === -1) {
                onClose();
            }
        },
        [onClose],
    );

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
                opacity={0.5}
                style={[styles.backdrop, overlayStyle, props.style]}
            />
        ),
        [overlayStyle],
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            onChange={handleSheetChange}
            enableDynamicSizing
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleComponent={() => null}
            backgroundStyle={[
                styles.sheetContainer,
                { backgroundColor: theme.colors.surface },
            ]}
        >
            <BottomSheetView style={styles.contentWrapper}>
                <View
                    style={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.surface },
                        containerStyle,
                    ]}
                >
                    {children}
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
    },
    backdrop: {
        backgroundColor: palette.modalOverlay,
    },
    contentWrapper: {
        paddingVertical: scale(24),
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        borderRadius: scale(20),
        padding: scale(24),
        alignItems: 'center',
        backgroundColor: palette.white,
    },
});
