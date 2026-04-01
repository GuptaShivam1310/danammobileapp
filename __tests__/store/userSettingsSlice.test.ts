import userSettingsReducer, {
    setSettingsData,
    updateSettingsOptimistic,
    fetchUserSettings,
    updateUserSettings,
} from '../../src/store/slices/userSettingsSlice';
import { IUserSettings } from '../../src/services/api/userSettingsApi';
import { userSettingsApi } from '../../src/services/api/userSettingsApi';

jest.mock('../../src/services/api/userSettingsApi', () => ({
    userSettingsApi: {
        getSettings: jest.fn(),
        updateSettings: jest.fn(),
    },
}));

const mockSettings: IUserSettings = {
    id: '32b',
    user_id: '9',
    receive_updates: true,
    nearby_notifications: false,
    hide_identity: false,
    created_at: '2026-03-05T10:54:26.283738+00:00',
    updated_at: '2026-03-05T10:54:41.3+00:00',
};

describe('userSettingsSlice', () => {
    const initialState = { data: null, isLoading: false, error: null };

    it('should return the initial state', () => {
        expect(userSettingsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setSettingsData', () => {
        const actual = userSettingsReducer(initialState, setSettingsData(mockSettings));
        expect(actual.data).toEqual(mockSettings);
    });

    it('should handle updateSettingsOptimistic when data exists', () => {
        const stateWithData = { ...initialState, data: mockSettings };
        const update = { receive_updates: false };
        const actual = userSettingsReducer(stateWithData, updateSettingsOptimistic(update));
        expect(actual.data?.receive_updates).toBe(false);
        expect(actual.data?.nearby_notifications).toBe(mockSettings.nearby_notifications);
    });

    it('should not crash updateSettingsOptimistic when data is null', () => {
        const actual = userSettingsReducer(initialState, updateSettingsOptimistic({ receive_updates: false }));
        expect(actual.data).toBeNull();
    });

    it('should handle fetchUserSettings.pending', () => {
        const actual = userSettingsReducer(initialState, { type: fetchUserSettings.pending.type });
        expect(actual.isLoading).toBe(true);
        expect(actual.error).toBe(null);
    });

    it('should handle fetchUserSettings.fulfilled', () => {
        const actual = userSettingsReducer(initialState, {
            type: fetchUserSettings.fulfilled.type,
            payload: mockSettings,
        });
        expect(actual.isLoading).toBe(false);
        expect(actual.data).toEqual(mockSettings);
    });

    it('should handle fetchUserSettings.rejected', () => {
        const actual = userSettingsReducer(initialState, {
            type: fetchUserSettings.rejected.type,
            payload: 'Error message',
        });
        expect(actual.isLoading).toBe(false);
        expect(actual.error).toBe('Error message');
    });

    it('should handle updateUserSettings.fulfilled', () => {
        const updatedSettings = { ...mockSettings, receive_updates: false };
        const actual = userSettingsReducer(initialState, {
            type: updateUserSettings.fulfilled.type,
            payload: updatedSettings,
        });
        expect(actual.data).toEqual(updatedSettings);
    });

    it('should handle updateUserSettings.rejected', () => {
        const actual = userSettingsReducer(initialState, {
            type: updateUserSettings.rejected.type,
            payload: 'Update failed',
        });
        expect(actual.error).toBe('Update failed');
    });

    it('fetchUserSettings thunk resolves with data on success', async () => {
        (userSettingsApi.getSettings as jest.Mock).mockResolvedValue({
            success: true,
            data: mockSettings,
        });

        const result = await fetchUserSettings()(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/fetchSettings/fulfilled');
        expect(result.payload).toEqual(mockSettings);
    });

    it('fetchUserSettings thunk rejects when api returns success=false', async () => {
        (userSettingsApi.getSettings as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Failed to fetch settings',
        });

        const result = await fetchUserSettings()(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/fetchSettings/rejected');
        expect(result.payload).toBe('Failed to fetch settings');
    });

    it('fetchUserSettings thunk rejects on exception', async () => {
        (userSettingsApi.getSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

        const result = await fetchUserSettings()(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/fetchSettings/rejected');
        expect(result.payload).toBe('Network error');
    });

    it('updateUserSettings thunk resolves with data on success', async () => {
        const updatedSettings = { ...mockSettings, receive_updates: false };
        (userSettingsApi.updateSettings as jest.Mock).mockResolvedValue({
            success: true,
            data: updatedSettings,
        });

        const result = await updateUserSettings({ receive_updates: false })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/updateSettings/fulfilled');
        expect(result.payload).toEqual(updatedSettings);
    });

    it('updateUserSettings thunk rejects when api returns success=false', async () => {
        (userSettingsApi.updateSettings as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Failed to update settings',
        });

        const result = await updateUserSettings({ receive_updates: true })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/updateSettings/rejected');
        expect(result.payload).toBe('Failed to update settings');
    });

    it('updateUserSettings thunk rejects on exception', async () => {
        (userSettingsApi.updateSettings as jest.Mock).mockRejectedValue(new Error('Update failed'));

        const result = await updateUserSettings({ receive_updates: true })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('userSettings/updateSettings/rejected');
        expect(result.payload).toBe('Update failed');
    });
});
