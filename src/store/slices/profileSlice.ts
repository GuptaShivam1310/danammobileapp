import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUserProfile, IUpdateUserRequest } from '../../models/profile';
import { profileApi } from '../../services/api/profileApi';

interface ProfileState {
    user: IUserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    user: null,
    isLoading: false,
    error: null,
};

export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await profileApi.getProfile();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch profile');
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (payload: IUpdateUserRequest, { rejectWithValue }) => {
        try {
            const response = await profileApi.updateProfile(payload);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to update profile');
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred');
        }
    }
);

export const deleteProfileThunk = createAsyncThunk(
    'profile/deleteProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await profileApi.deleteUser();
            if (response.success) {
                return response.message;
            }
            return rejectWithValue(response.message || 'Failed to delete account');
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        resetProfileState: (state) => {
            state.user = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Profile
        builder.addCase(fetchProfile.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchProfile.fulfilled, (state, action: PayloadAction<IUserProfile>) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(fetchProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Update Profile
        builder.addCase(updateProfile.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<IUserProfile>) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Delete Profile
        builder.addCase(deleteProfileThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(deleteProfileThunk.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
        });
        builder.addCase(deleteProfileThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
