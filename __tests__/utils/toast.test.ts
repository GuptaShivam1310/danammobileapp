/**
 * Tests for src/utils/toast.ts
 */

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

import Toast from 'react-native-toast-message';
import { showSuccessToast, showErrorToast } from '../../src/utils/toast';

describe('toast utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('showSuccessToast', () => {
        it('calls Toast.show with type success and text1', () => {
            showSuccessToast('Great!');
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Great!',
                text2: undefined,
            });
        });

        it('calls Toast.show with text2 when provided', () => {
            showSuccessToast('Done', 'Operation completed');
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'success',
                text1: 'Done',
                text2: 'Operation completed',
            });
        });
    });

    describe('showErrorToast', () => {
        it('calls Toast.show with type error and text1', () => {
            showErrorToast('Oops!');
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Oops!',
                text2: undefined,
            });
        });

        it('calls Toast.show with text2 when provided', () => {
            showErrorToast('Error', 'Something went wrong');
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong',
            });
        });
    });
});
