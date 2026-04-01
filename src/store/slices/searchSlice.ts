import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  recentSearches: string[];
}

const MAX_RECENT_SEARCHES = 5;

const initialState: SearchState = {
  recentSearches: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const trimmed = action.payload.trim();
      if (!trimmed) {
        return;
      }

      const normalized = trimmed.toLowerCase();
      const filtered = state.recentSearches.filter(
        item => item.toLowerCase() !== normalized,
      );

      state.recentSearches = [trimmed, ...filtered].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
    },
    clearRecentSearches: state => {
      state.recentSearches = [];
    },
  },
});

export const { addRecentSearch, clearRecentSearches } = searchSlice.actions;
export default searchSlice.reducer;
