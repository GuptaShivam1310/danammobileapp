import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userSettingsApi, IUserSettings, IUpdateUserSettingsRequest } from '../../services/api/userSettingsApi';

interface UserSettingsState {
    data: IUserSettings | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserSettingsState = {
    data: null,
    isLoading: false,
    error: null,
};

export const fetchUserSettings = createAsyncThunk(
    'userSettings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userSettingsApi.getSettings();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch settings');
        }
    }
);

export const updateUserSettings = createAsyncThunk(
    'userSettings/updateSettings',
    async (payload: IUpdateUserSettingsRequest, { rejectWithValue }) => {
        try {
            const response = await userSettingsApi.updateSettings(payload);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update settings');
        }
    }
);

const userSettingsSlice = createSlice({
    name: 'userSettings',
    initialState,
    reducers: {
        setSettingsData: (state, action: PayloadAction<IUserSettings>) => {
            state.data = action.payload;
        },
        updateSettingsOptimistic: (state, action: PayloadAction<IUpdateUserSettingsRequest>) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchUserSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUserSettings.fulfilled, (state, action) => {
                state.data = action.payload;
            })
            .addCase(updateUserSettings.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { setSettingsData, updateSettingsOptimistic } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;
