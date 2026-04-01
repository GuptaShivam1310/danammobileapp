import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useSettings } from '../../src/screens/Settings/useSettings';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchUserSettings,
    updateUserSettings,
    updateSettingsOptimistic,
} from '../../src/store/slices/userSettingsSlice';
import { profileApi } from '../../src/services/api/profileApi';
import { logoutUser } from '../../src/store/slices/authSlice';

const mockEn = require('../../src/localization/en.json');

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const keys = key.split('.');
            let val = mockEn;
            for (const k of keys) {
                if (val && typeof val === 'object' && k in val) {
                    val = val[k];
                } else {
                    return key;
                }
            }
            return typeof val === 'string' ? val : key;
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

jest.mock('../../src/store/slices/userSettingsSlice', () => ({
    fetchUserSettings: jest.fn(),
    updateUserSettings: jest.fn(),
    updateSettingsOptimistic: jest.fn(),
}));

jest.mock('../../src/services/api/profileApi', () => ({
    profileApi: {
        deleteAccount: jest.fn(),
    },
}));

jest.mock('../../src/store/slices/authSlice', () => ({
    logoutUser: jest.fn(() => ({ type: 'logoutUser' })),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => { });

const originalConsoleError = console.error;

describe('useSettings hook', () => {
    const mockDispatch = jest.fn();
    let fetchUnwrap: jest.Mock;
    let updateUnwrap: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();

        fetchUnwrap = jest.fn().mockResolvedValue({});
        updateUnwrap = jest.fn().mockResolvedValue({});

        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (useSelector as unknown as jest.Mock).mockReturnValue({ data: null, isLoading: false });
        mockGoBack.mockClear();

        (fetchUserSettings as jest.Mock).mockReturnValue({ type: 'fetchUserSettings' });
        (updateUserSettings as jest.Mock).mockImplementation((payload: any) => ({
            type: 'updateUserSettings',
            payload,
        }));
        (updateSettingsOptimistic as jest.Mock).mockImplementation((payload: any) => ({
            type: 'updateSettingsOptimistic',
            payload,
        }));

        mockDispatch.mockImplementation((action: any) => {
            if (action?.type === 'fetchUserSettings') {
                return { unwrap: fetchUnwrap };
            }
            if (action?.type === 'updateUserSettings') {
                return { unwrap: updateUnwrap };
            }
            return { unwrap: jest.fn() };
        });
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('fetches settings on mount and clears initial loading', async () => {
        const { result } = renderHook(() => useSettings());

        expect(fetchUserSettings).toHaveBeenCalled();
        expect(result.current.isLoading).toBe(true);

        const fetchPromise = fetchUnwrap.mock.results[0]?.value;
        await act(async () => {
            await fetchPromise;
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('populates derived switch values from settings data', () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({
            data: {
                receive_updates: true,
                nearby_notifications: false,
                hide_identity: true,
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useSettings());

        expect(result.current.receiveUpdates).toBe(true);
        expect(result.current.nearestDanam).toBe(false);
        expect(result.current.hideIdentity).toBe(true);
    });

    it('handles toggle updates with optimistic update and API call', async () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({
            data: { receive_updates: true },
            isLoading: false,
        });

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handleToggleUpdates(false);
        });

        expect(updateSettingsOptimistic).toHaveBeenCalledWith({ receive_updates: false });
        expect(updateUserSettings).toHaveBeenCalledWith({ receive_updates: false });
        expect(result.current.isUpdating).toBe(false);
    });

    it('reverts optimistic update and shows alert on update failure', async () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({
            data: { nearby_notifications: true },
            isLoading: false,
        });
        updateUnwrap.mockRejectedValue(new Error('update failed'));

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handleToggleNearest(false);
        });

        expect(updateSettingsOptimistic).toHaveBeenCalledWith({ nearby_notifications: false });
        expect(updateSettingsOptimistic).toHaveBeenCalledWith({ nearby_notifications: true });
        expect(Alert.alert).toHaveBeenCalledWith(mockEn.alerts.error, mockEn.settings.updateFailed);
    });

    it('uses inverse value as previous when settings data is missing', async () => {
        (useSelector as unknown as jest.Mock).mockReturnValue({ data: null, isLoading: false });
        updateUnwrap.mockRejectedValue(new Error('update failed'));

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handleToggleIdentity(true);
        });

        expect(updateSettingsOptimistic).toHaveBeenCalledWith({ hide_identity: true });
        expect(updateSettingsOptimistic).toHaveBeenCalledWith({ hide_identity: false });
    });

    it('prevents concurrent updates for the same field', async () => {
        let resolveUpdate: ((value: any) => void) | undefined;
        updateUnwrap.mockImplementation(
            () => new Promise((resolve) => { resolveUpdate = resolve; })
        );

        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.handleToggleUpdates(false);
        });
        act(() => {
            result.current.handleToggleUpdates(true);
        });

        expect(updateUserSettings).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveUpdate?.({});
        });
    });

    it('opens and closes delete modal', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.handleDeleteAccount();
        });
        expect(result.current.isDeleteModalVisible).toBe(true);

        act(() => {
            result.current.handleCloseDeleteModal();
        });
        expect(result.current.isDeleteModalVisible).toBe(false);
    });

    it('closes delete modal and opens password modal after confirmation delay', () => {
        jest.useFakeTimers();
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.handleDeleteAccount();
        });
        act(() => {
            result.current.handleConfirmDelete();
        });

        expect(result.current.isDeleteModalVisible).toBe(false);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current.isPasswordModalVisible).toBe(true);
        jest.useRealTimers();
    });

    it('handles successful password confirmation and logout', async () => {
        (profileApi.deleteAccount as jest.Mock).mockResolvedValue({
            success: true,
        });

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handlePasswordConfirm('correctPassword');
        });

        expect(profileApi.deleteAccount).toHaveBeenCalledWith({ password: 'correctPassword' });
        expect(Alert.alert).toHaveBeenCalledWith(
            mockEn.alerts.success,
            mockEn.alerts.accountDeleted,
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'OK',
                    onPress: expect.any(Function),
                }),
            ])
        );

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const okButton = alertCall[2].find((btn: any) => btn.text === 'OK');

        act(() => {
            okButton.onPress();
        });

        expect(logoutUser).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'logoutUser' });
    });

    it('shows error alert when deleteAccount response is unsuccessful', async () => {
        (profileApi.deleteAccount as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Delete failed',
        });

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handlePasswordConfirm('wrongPassword');
        });

        expect(Alert.alert).toHaveBeenCalledWith(mockEn.alerts.error, 'Delete failed');
    });

    it('shows error alert when deleteAccount throws', async () => {
        (profileApi.deleteAccount as jest.Mock).mockRejectedValue({
            response: { data: { message: 'Server error' } },
        });

        const { result } = renderHook(() => useSettings());

        await act(async () => {
            await result.current.handlePasswordConfirm('password');
        });

        expect(Alert.alert).toHaveBeenCalledWith(mockEn.alerts.error, 'Server error');
    });

    it('closes password modal when handleClosePasswordModal is called', () => {
        jest.useFakeTimers();
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.handleConfirmDelete();
        });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        act(() => {
            result.current.handleClosePasswordModal();
        });

        expect(result.current.isPasswordModalVisible).toBe(false);
        jest.useRealTimers();
    });

    it('handles back navigation', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.handleBack();
        });

        expect(mockGoBack).toHaveBeenCalled();
    });
});
