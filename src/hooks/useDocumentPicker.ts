import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useTranslation } from 'react-i18next';
export const PICK_TYPES = types;

export const useDocumentPicker = () => {
    const { t } = useTranslation();
    const isPickingRef = useRef(false);

    const pickDocument = useCallback(async (callback: (doc: any) => void, pickingTypes?: string[]) => {
        if (isPickingRef.current) {
            return;
        }
        isPickingRef.current = true;
        try {
            const result = await pick({
                type: pickingTypes || [types.allFiles || 'public.item'],
            });

            if (result && result.length > 0) {
                // Mapping result to match the expected format in hooks
                const doc = result[0];
                callback({
                    uri: doc.uri,
                    name: doc.name,
                    type: doc.type,
                    size: doc.size,
                });
            }
        } catch (err: any) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled the picker
            } else {
                console.error('DocumentPicker error:', err);
                Alert.alert(t('alerts.error') || 'Error', t('alerts.failedToOpenDocumentPicker') || 'Failed to open document picker');
            }
        } finally {
            isPickingRef.current = false;
        }
    }, [t]);

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return { pickDocument, formatFileSize };
};
