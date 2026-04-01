import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface WishListItem {
    id: string;
    title: string;
    date: string;
    image?: string | null;
    images?: string[];
    description?: string;
    categoryName?: string;
    subCategoryName?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
}

interface WishListState {
    wishList: WishListItem[];
}

const initialState: WishListState = {
    wishList: [],
};

type ToggleWishListPayload = string | WishListItem;

const wishListSlice = createSlice({
    name: 'wishList',
    initialState,
    reducers: {
        addToWishList: (state, action: PayloadAction<WishListItem>) => {
            const isAlreadyAdded = state.wishList.some(item => item.id === action.payload.id);
            if (!isAlreadyAdded) {
                state.wishList.push(action.payload);
            }
        },
        removeFromWishList: (state, action: PayloadAction<string>) => {
            state.wishList = state.wishList.filter(item => item.id !== action.payload);
        },
        toggleWishListItem: (state, action: PayloadAction<ToggleWishListPayload>) => {
            const payload = action.payload;
            const itemId = typeof payload === 'string' ? payload : payload.id;
            const isAlreadyAdded = state.wishList.some(item => item.id === itemId);
            if (isAlreadyAdded) {
                state.wishList = state.wishList.filter(item => item.id !== itemId);
                return;
            }

            if (typeof payload === 'string') {
                return;
            }

            state.wishList.push(payload);
        },
        clearWishList: (state) => {
            state.wishList = [];
        },
    },
});

export const {
    addToWishList,
    removeFromWishList,
    toggleWishListItem,
    clearWishList,
} = wishListSlice.actions;

export const selectWishList = (state: RootState) => state.wishList.wishList;
export const selectWishListIds = (state: RootState) => state.wishList.wishList.map(item => item.id);

export default wishListSlice.reducer;
