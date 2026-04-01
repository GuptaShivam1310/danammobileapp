import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LookupOption } from '../../models/lookup';
import { seekerLookApi } from '../../services/api/seekerLookApi';

interface SeekerLookDoYouState {
  options: LookupOption[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SeekerLookDoYouState = {
  options: [],
  isLoading: false,
  error: null,
};

export const fetchSeekerLookDoYouOptions = createAsyncThunk<
  LookupOption[],
  void,
  { rejectValue: string }
>('seekerLookDoYou/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    return await seekerLookApi.getDoYouOptions();
  } catch (error) {
    const message = (error as { message?: string }).message ?? 'Failed to fetch options';
    return rejectWithValue(message);
  }
});

const seekerLookDoYouSlice = createSlice({
  name: 'seekerLookDoYou',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeekerLookDoYouOptions.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSeekerLookDoYouOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.options = action.payload;
      })
      .addCase(fetchSeekerLookDoYouOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch options';
      });
  },
});

export default seekerLookDoYouSlice.reducer;

