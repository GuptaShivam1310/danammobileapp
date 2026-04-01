import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../services/api/postApi';

interface HomeFilterState {
  selectedCategory: Category | null;
}

const initialState: HomeFilterState = {
  selectedCategory: null,
};

const homeFilterSlice = createSlice({
  name: 'homeFilter',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: state => {
      state.selectedCategory = null;
    },
  },
});

export const { setSelectedCategory, clearSelectedCategory } =
  homeFilterSlice.actions;
export default homeFilterSlice.reducer;
