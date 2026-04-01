import { Linking, Alert } from 'react-native';

/**
 * Fallback handler for opening unsupported files using the system's default application.
 * @param fileUri The URI of the file to open.
 * @param fileName Optional filename for error reporting.
 */
export const openFile = async (fileUri: string, fileName?: string) => {
    try {
        const supported = await Linking.canOpenURL(fileUri);

        if (supported || fileUri.startsWith('file://') || fileUri.startsWith('content://')) {
            await Linking.openURL(fileUri);
        } else {
            Alert.alert(
                'Unsupported File',
                `Device cannot open this file type: ${fileName || 'Attachment'}`
            );
        }
    } catch (error) {
        console.error('Error opening file:', error);
        Alert.alert('Error', 'Could not open the file. Make sure you have an app that can handle this file type.');
    }
};
