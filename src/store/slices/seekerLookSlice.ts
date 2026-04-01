import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LookupOption } from '../../models/lookup';
import { seekerLookApi } from '../../services/api/seekerLookApi';

interface SeekerLookState {
  items: LookupOption[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SeekerLookState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchSeekerLookItems = createAsyncThunk<
  LookupOption[],
  void,
  { rejectValue: string }
>('seekerLook/fetchItems', async (_, { rejectWithValue }) => {
  try {
    return await seekerLookApi.getItems();
  } catch (error) {
    const message = (error as { message?: string }).message ?? 'Failed to fetch item list';
    return rejectWithValue(message);
  }
});

const seekerLookSlice = createSlice({
  name: 'seekerLook',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeekerLookItems.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSeekerLookItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSeekerLookItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch item list';
      });
  },
});

export default seekerLookSlice.reducer;

