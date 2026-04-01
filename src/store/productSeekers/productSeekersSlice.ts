import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Seeker } from '../../services/api/productSeekersApi';
import { requestApi, IRequestDetail } from '../../services/api/requestApi';
import { chatApi, ProductSeekerResponse } from '../../services/api/chatApi';
import { formatChatTimestamp } from '../../utils/dateUtils';
import type { RootState } from '../index';
import { addMessage, sendMessage } from '../chat/chatSlice';

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * Fetch seekers for a specific product from the API.
 */
export const fetchProductSeekers = createAsyncThunk<Seeker[], string>(
    'productSeekers/fetchProductSeekers',
    async (productId: string, { rejectWithValue }) => {
        try {
            const response = await chatApi.getProductSeekers(productId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to load seekers');
            }
            // Map API response to UI model
            const mappedSeekers: Seeker[] = response.data
                .filter((item: ProductSeekerResponse) => item.request_status !== 'rejected')
                .map((item: ProductSeekerResponse) => ({
                    id: item.request_id,
                    userId: item.user_id,
                    name: item.name,
                    avatar: item.profile_image,
                    status: item.request_status === 'pending' ? 'pending' : 'active',
                    lastMessage: (() => {
                        const text = item.last_message || '';
                        if (!text) return '';
                        const lower = text.toLowerCase();
                        if (lower.match(/\.(pdf|doc|docx)(\?.*)?$/)) return 'PDF';
                        if (lower.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)) return 'Photo';
                        return text;
                    })(),
                    timestamp: formatChatTimestamp(item.last_message_time),
                }));
            return mappedSeekers;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to load seekers';
            return rejectWithValue(message);
        }
    },
);

/**
 * Fetch a single request's details by ID.
 */
export const fetchRequestDetail = createAsyncThunk<IRequestDetail, string>(
    'productSeekers/fetchRequestDetail',
    async (requestId: string, { rejectWithValue }) => {
        try {
            const response = await requestApi.getRequestDetail(requestId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to fetch request details');
            }
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch request details');
        }
    },
);

/**
 * Accept a request and update local state for live feedback.
 */
export const acceptRequestThunk = createAsyncThunk<string, string>(
    'productSeekers/acceptRequest',
    async (requestId: string, { rejectWithValue }) => {
        try {
            const response = await requestApi.acceptRequest(requestId);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to accept request');
            }
            return requestId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to accept request');
        }
    }
);

/**
 * Reject a request and update local state for live feedback.
 */
export const rejectRequestThunk = createAsyncThunk<string, { requestId: string; reason: string }>(
    'productSeekers/rejectRequest',
    async ({ requestId, reason }, { rejectWithValue }) => {
        try {
            const response = await requestApi.rejectRequest(requestId, reason);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to reject request');
            }
            return requestId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to reject request');
        }
    }
);

/**
 * Report a user and remove them from the seeker list.
 */
export const reportUserThunk = createAsyncThunk<{ userId: string; message: string }, { userId: string; reason: string }>(
    'productSeekers/reportUser',
    async ({ userId, reason }, { rejectWithValue }) => {
        try {
            const response = await requestApi.reportUser(userId, reason);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to report user');
            }
            return { userId, message: response.message || 'User reported successfully' };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to report user');
        }
    }
);

// ─── State ────────────────────────────────────────────────────────────────────

export interface ProductSeekersState {
    seekers: Seeker[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    currentRequest: IRequestDetail | null;
}

const initialState: ProductSeekersState = {
    seekers: [],
    loading: false,
    error: null,
    searchQuery: '',
    currentRequest: null,
};

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface UpdateSeekerStatusPayload {
    id: string;
    status: 'pending' | 'active';
}

export interface UpdateLastMessagePayload {
    id: string;
    message: string;
    timestamp: string;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const productSeekersSlice = createSlice({
    name: 'productSeekers',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setCurrentRequest: (state, action: PayloadAction<IRequestDetail | null>) => {
            state.currentRequest = action.payload;
        },
        /**
         * Real-time: update a seeker's status (e.g. pending → active after acceptance).
         */
        updateSeekerStatus: (state, action: PayloadAction<UpdateSeekerStatusPayload>) => {
            const seeker = state.seekers.find(s => s.id === action.payload.id);
            if (seeker) {
                seeker.status = action.payload.status;
            }
        },
        /**
         * Real-time: update last message and timestamp for a seeker conversation.
         */
        updateLastMessage: (state, action: PayloadAction<UpdateLastMessagePayload>) => {
            const seeker = state.seekers.find(s => s.id === action.payload.id);
            if (seeker) {
                seeker.lastMessage = action.payload.message;
                seeker.timestamp = action.payload.timestamp;
            }
        },
        clearSeekers: (state) => {
            state.seekers = [];
            state.searchQuery = '';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductSeekers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductSeekers.fulfilled, (state, action: PayloadAction<Seeker[]>) => {
                state.loading = false;
                state.seekers = action.payload;
                state.error = null;
            })
            .addCase(fetchProductSeekers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle Fetch Request Detail
            .addCase(fetchRequestDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRequestDetail.fulfilled, (state, action: PayloadAction<IRequestDetail>) => {
                state.loading = false;
                state.currentRequest = action.payload;
                state.error = null;
            })
            .addCase(fetchRequestDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle Accept Request
            .addCase(acceptRequestThunk.fulfilled, (state, action) => {
                const seeker = state.seekers.find(s => s.id === action.payload);
                if (seeker) {
                    seeker.status = 'active';
                }
            })
            // Handle Reject Request
            .addCase(rejectRequestThunk.fulfilled, (state, action) => {
                state.seekers = state.seekers.filter(s => s.id !== action.payload);
            })
            // Handle Report User
            .addCase(reportUserThunk.fulfilled, (state, action) => {
                state.seekers = state.seekers.filter(s => s.id !== action.payload.userId);
            })
            // Handle Chat Messages to update last message in seekers list
            .addCase(addMessage, (state, action) => {
                const { chatId, message } = action.payload;
                const seeker = state.seekers.find(s => s.id === chatId);
                if (seeker) {
                    const text = message.text || message.message || '';
                    const type = message.type || 'text';
                    const createdAt = message.createdAt || message.created_at || new Date().toISOString();

                    seeker.lastMessage = type === 'image' ? 'Photo' : (['pdf', 'doc', 'document'].includes(type) ? 'PDF' : text);
                    seeker.timestamp = formatChatTimestamp(createdAt);
                }
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                const { chatId, message } = action.payload;
                const seeker = state.seekers.find(s => s.id === chatId);
                if (seeker) {
                    const { text, type } = message;
                    seeker.lastMessage = type === 'image' ? 'Photo' : (['pdf', 'doc', 'document'].includes(type) ? 'PDF' : text);
                    seeker.timestamp = formatChatTimestamp(message.createdAt);
                }
            });
    },
});

export const {
    setSearchQuery,
    clearError,
    updateSeekerStatus,
    updateLastMessage,
    clearSeekers,
    setCurrentRequest,
} = productSeekersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAllSeekers = (state: RootState): Seeker[] =>
    state.productSeekers.seekers;

export const selectSeekersLoading = (state: RootState): boolean =>
    state.productSeekers.loading;

export const selectSeekersError = (state: RootState): string | null =>
    state.productSeekers.error;

export const selectSearchQuery = (state: RootState): string =>
    state.productSeekers.searchQuery;

/**
 * Plain selector factory — returns filtered seekers by name query.
 * Query must be >= 2 chars to filter; otherwise returns all seekers.
 */
export const selectFilteredSeekers = (query: string) =>
    (state: RootState): Seeker[] => {
        const seekers = state.productSeekers.seekers;
        const trimmed = query.trim().toLowerCase();
        if (trimmed.length < 2) return seekers;
        return seekers.filter(s => s.name.toLowerCase().includes(trimmed));
    };

export const selectPendingSeekers = (state: RootState): Seeker[] =>
    state.productSeekers.seekers.filter(s => s.status === 'pending');

export const selectActiveSeekers = (state: RootState): Seeker[] =>
    state.productSeekers.seekers.filter(s => s.status === 'active');

export default productSeekersSlice.reducer;
