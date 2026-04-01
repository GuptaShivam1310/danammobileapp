import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LookupOption } from '../../models/lookup';
import { seekerLookApi } from '../../services/api/seekerLookApi';

interface SeekerLookProfessionState {
  professions: LookupOption[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SeekerLookProfessionState = {
  professions: [],
  isLoading: false,
  error: null,
};

export const fetchSeekerLookProfessions = createAsyncThunk<
  LookupOption[],
  void,
  { rejectValue: string }
>('seekerLookProfession/fetchProfessions', async (_, { rejectWithValue }) => {
  try {
    return await seekerLookApi.getProfessions();
  } catch (error) {
    const message = (error as { message?: string }).message ?? 'Failed to fetch profession list';
    return rejectWithValue(message);
  }
});

const seekerLookProfessionSlice = createSlice({
  name: 'seekerLookProfession',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeekerLookProfessions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSeekerLookProfessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.professions = action.payload;
      })
      .addCase(fetchSeekerLookProfessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch profession list';
      });
  },
});

export default seekerLookProfessionSlice.reducer;

