import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { postApi } from '../../services/api/postApi';
import type { RootState } from '../index';

export interface PostItem {
    id: string;
    title: string;
    date: string;
    image: string;
    images?: string[];
    description?: string;
    categoryName?: string;
    categoryId?: string;
    subCategoryName?: string;
    subCategoryId?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
}

interface NewPostData {
    id: string | null;
    categoryId: string | null;
    categoryName: string | null;
    subCategoryId: string | null;
    subCategoryName: string | null;
    title: string;
    description: string;
    images: string[];
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface TabState {
    data: PostItem[];
    page: number;
    hasMore: boolean;
    loading: boolean;
}

interface PostState {
    awaiting: TabState;
    contributed: TabState;
    error: string | null;
    newPostData: NewPostData;
    selectedPostDetail: any | null;
    isDetailLoading: boolean;
}

const initialState: PostState = {
    awaiting: {
        data: [],
        page: 0,
        hasMore: true,
        loading: false,
    },
    contributed: {
        data: [],
        page: 0,
        hasMore: true,
        loading: false,
    },
    error: null,
    newPostData: {
        id: null,
        categoryId: null,
        categoryName: null,
        subCategoryId: null,
        subCategoryName: null,
        title: '',
        description: '',
        images: [],
        address: null,
        latitude: null,
        longitude: null,
    },
    selectedPostDetail: null,
    isDetailLoading: false,
};

// Async thunks for fetching posts
export const fetchContributionDetails = createAsyncThunk(
    'post/fetchContributionDetails',
    async ({ id, signal }: { id: string; signal?: AbortSignal }, { rejectWithValue }) => {
        try {
            const response = await postApi.getContributionDetails(id, signal);
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue({
                message: error?.message || 'Failed to fetch contribution details',
                statusCode: error?.statusCode || error?.response?.status,
            });
        }
    }
);

// Async thunks for fetching posts
export const fetchUserPosts = createAsyncThunk(
    'post/fetchUserPosts',
    async (params: { status: string; page: number; limit: number }, { rejectWithValue, signal }) => {
        try {
            const response = await postApi.getMyContributions(params, signal);
            // Robust data extraction: Support [...], { data: [...] }, { data: { items: [...] } }, { data: { data: [...] } }
            let data: any[] = [];

            if (Array.isArray(response)) {
                data = response;
            } else if (response && response.data) {
                const inner = response.data;
                if (Array.isArray(inner)) {
                    data = inner;
                } else if (inner && Array.isArray(inner.items)) {
                    data = inner.items;
                } else if (inner && Array.isArray(inner.data)) {
                    data = inner.data;
                }
            } else if (response && Array.isArray(response.items)) {
                data = response.items;
            }

            return {
                data,
                page: params.page,
                hasMore: data.length === params.limit,
            };
        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message === 'canceled') {
                return rejectWithValue('Cancelled');
            }
            return rejectWithValue(error?.message || 'Failed to fetch contributions');
        }
    }
);

export const markPostAsContributed = createAsyncThunk(
    'post/markPostAsContributed',
    async (id: string, { rejectWithValue }) => {
        try {
            await postApi.markAsContributed(id);
            return id;
        } catch {
            return rejectWithValue('Failed to mark post as contributed');
        }
    }
);

export const createContribution = createAsyncThunk(
    'post/createContribution',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await postApi.createContribution(data);
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue({
                message: error?.message || 'Failed to create contribution',
                statusCode: error?.statusCode,
            });
        }
    }
);

export const updatePost = createAsyncThunk(
    'post/updatePost',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await postApi.updateContribution(data.id, data);
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue({
                message: error?.message || 'Failed to update contribution',
                statusCode: error?.statusCode || error?.response?.status,
            });
        }
    }
);

export const deletePost = createAsyncThunk(
    'post/deletePost',
    async (id: string, { rejectWithValue }) => {
        try {
            await postApi.deleteContribution(id);
            return id;
        } catch (error: any) {
            return rejectWithValue({
                message: error?.message || 'Failed to delete contribution',
                statusCode: error?.statusCode || error?.response?.status,
            });
        }
    }
);

export const fetchContributedPosts = createAsyncThunk<
    PostItem[],
    string | number | undefined,
    { state: RootState; rejectValue: string }
>(
    'post/fetchContributed',
    async (userId, { getState, rejectWithValue }) => {
        try {
            const resolvedUserId = userId ?? getState().auth.user?.id;
            if (resolvedUserId === undefined || resolvedUserId === null) {
                return [];
            }

            const apiPosts = await postApi.getItemContributes(String(resolvedUserId));
            return apiPosts.map(post => ({
                ...post,
                image: post.image || post.images?.[0] || '',
            }));
        } catch (error) {
            const message = (error as { message?: string }).message ?? 'Failed to fetch contributed posts';
            return rejectWithValue(message);
        }
    }
);


const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        clearPosts: (state) => {
            state.awaiting = initialState.awaiting;
            state.contributed = initialState.contributed;
        },
        setCategory: (state, action: PayloadAction<{ id: string; name: string }>) => {
            const currentId = state.newPostData.categoryId;
            const currentName = state.newPostData.categoryName;
            const newId = String(action.payload.id);
            const newName = action.payload.name;

            // Only clear subcategory if both the ID and the Name are different.
            // This prevents reset if one of them matches (useful in edit flows where ID might be missing but Name is present).
            if (String(currentId) !== newId && currentName !== newName) {
                state.newPostData.categoryId = newId;
                state.newPostData.categoryName = newName;
                state.newPostData.subCategoryId = null;
                state.newPostData.subCategoryName = null;
            } else {
                // Just update the fields in case one was missing
                state.newPostData.categoryId = newId;
                state.newPostData.categoryName = newName;
            }
        },
        setSubCategory: (state, action: PayloadAction<{ id: string; name: string }>) => {
            state.newPostData.subCategoryId = action.payload.id;
            state.newPostData.subCategoryName = action.payload.name;
        },
        setPostDetails: (state, action: PayloadAction<{ title: string; description: string }>) => {
            state.newPostData.title = action.payload.title;
            state.newPostData.description = action.payload.description;
        },
        setImages: (state, action: PayloadAction<string[]>) => {
            state.newPostData.images = action.payload;
        },
        addImage: (state, action: PayloadAction<string>) => {
            if (!state.newPostData.images.includes(action.payload)) {
                state.newPostData.images.push(action.payload);
            }
        },
        removeImage: (state, action: PayloadAction<number>) => {
            state.newPostData.images.splice(action.payload, 1);
        },
        updatePostLocation: (state, action: PayloadAction<{ address: string; latitude?: number; longitude?: number }>) => {
            state.newPostData.address = action.payload.address;
            state.newPostData.latitude = action.payload.latitude ?? null;
            state.newPostData.longitude = action.payload.longitude ?? null;
        },
        clearNewPostData: (state) => {
            state.newPostData = initialState.newPostData;
        },
        setEditPostData: (state, action: PayloadAction<PostItem>) => {
            state.newPostData = {
                id: action.payload.id,
                categoryId: action.payload.categoryId != null ? String(action.payload.categoryId) : null,
                categoryName: action.payload.categoryName || null,
                subCategoryId: action.payload.subCategoryId != null ? String(action.payload.subCategoryId) : null,
                subCategoryName: action.payload.subCategoryName || null,
                title: action.payload.title,
                description: action.payload.description || '',
                images: action.payload.images || [action.payload.image],
                address: action.payload.address || null,
                latitude: action.payload.latitude ?? null,
                longitude: action.payload.longitude ?? null,
            };
        },
        clearSelectedPostDetail: (state) => {
            state.selectedPostDetail = null;
            state.isDetailLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPosts.pending, (state, action) => {
                const status = action.meta.arg.status;
                if (status === 'pending') state.awaiting.loading = true;
                else state.contributed.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                const { data, page, hasMore } = action.payload;
                const status = action.meta.arg.status;
                const tab = status === 'pending' ? 'awaiting' : 'contributed';

                state[tab].loading = false;
                state[tab].page = page;
                state[tab].hasMore = hasMore;

                const processedData = data.map((post: any) => ({
                    ...post,
                    image: post.image || post.images?.[0] || '',
                    date: post.created_at ? new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
                }));

                if (page === 1) {
                    state[tab].data = processedData;
                } else {
                    const existingIds = new Set(state[tab].data.map(p => p.id));
                    const uniqueNewData = processedData.filter((p: any) => !existingIds.has(p.id));
                    state[tab].data = [...state[tab].data, ...uniqueNewData];
                }
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                const status = action.meta.arg.status;
                if (status === 'pending') state.awaiting.loading = false;
                else state.contributed.loading = false;
                state.error = action.payload as string;
            })
            .addCase(markPostAsContributed.pending, (state) => {
                state.awaiting.loading = true;
                state.error = null;
            })
            .addCase(markPostAsContributed.fulfilled, (state, action: PayloadAction<string>) => {
                const id = action.payload;
                state.awaiting.loading = false;
                const postIndex = state.awaiting.data.findIndex(p => p.id === id);
                if (postIndex !== -1) {
                    const [post] = state.awaiting.data.splice(postIndex, 1);
                    state.contributed.data.unshift(post);
                }
            })
            .addCase(markPostAsContributed.rejected, (state, action) => {
                state.awaiting.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createContribution.pending, (state) => {
                state.awaiting.loading = true;
                state.error = null;
            })
            .addCase(createContribution.fulfilled, (state, action: PayloadAction<any>) => {
                const payload = action.payload;
                const newPost: PostItem = {
                    id: payload.id || Math.random().toString(36).substr(2, 9),
                    title: payload.title || '',
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    image: payload.images?.[0] || '',
                    images: payload.images || [],
                    description: payload.description || '',
                    categoryName: payload.category?.name || payload.category_name || payload.categoryName || '',
                    categoryId: payload.category?.id !== undefined ? String(payload.category.id) : (payload.category_id !== undefined ? String(payload.category_id) : (payload.categoryId !== undefined ? String(payload.categoryId) : undefined)),
                    subCategoryName: payload.subcategory?.name || payload.subCategoryName || '',
                    subCategoryId: payload.subcategory?.id !== undefined ? String(payload.subcategory.id) : (payload.subcategory_id !== undefined ? String(payload.subcategory_id) : (payload.subCategoryId !== undefined ? String(payload.subCategoryId) : undefined)),
                    latitude: payload.location?.latitude || payload.latitude,
                    longitude: payload.location?.longitude || payload.longitude,
                    address: payload.location?.address || payload.address,
                };
                state.awaiting.data.unshift(newPost);
                state.awaiting.loading = false;
            })
            .addCase(createContribution.rejected, (state, action: any) => {
                state.awaiting.loading = false;
                state.error = action.payload?.message || 'Failed to create contribution';
            })
            .addCase(updatePost.pending, (state) => {
                state.awaiting.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action: PayloadAction<any>) => {
                const payload = action.payload;
                const index = state.awaiting.data.findIndex(p => p.id === payload.id);
                if (index !== -1) {
                    state.awaiting.data[index] = {
                        ...state.awaiting.data[index],
                        title: payload.title || state.awaiting.data[index].title,
                        description: payload.description || state.awaiting.data[index].description,
                        images: payload.images || state.awaiting.data[index].images,
                        categoryName: payload.category_name || payload.categoryName || state.awaiting.data[index].categoryName,
                        categoryId: payload.category_id || payload.categoryId || state.awaiting.data[index].categoryId,
                        subCategoryName: payload.subcategory_name || payload.subCategoryName || state.awaiting.data[index].subCategoryName,
                        subCategoryId: payload.subcategory_id || payload.subCategoryId || state.awaiting.data[index].subCategoryId,
                        latitude: payload.location?.latitude || payload.latitude || state.awaiting.data[index].latitude,
                        longitude: payload.location?.longitude || payload.longitude || state.awaiting.data[index].longitude,
                        address: payload.location?.address || payload.address || state.awaiting.data[index].address,
                    };
                }
                state.awaiting.loading = false;
            })
            .addCase(updatePost.rejected, (state, action: any) => {
                state.awaiting.loading = false;
                state.error = action.payload?.message || 'Failed to update post';
            })
            .addCase(deletePost.pending, (state) => {
                state.awaiting.loading = true;
                state.error = null;
            })
            .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
                const id = action.payload;
                state.awaiting.data = state.awaiting.data.filter(p => p.id !== id);
                state.contributed.data = state.contributed.data.filter(p => p.id !== id);
                state.awaiting.loading = false;
            })
            .addCase(deletePost.rejected, (state, action: any) => {
                state.awaiting.loading = false;
                state.error = action.payload?.message || 'Failed to delete contribution';
            })
            .addCase(fetchContributionDetails.pending, (state) => {
                state.isDetailLoading = true;
                state.selectedPostDetail = null;
                state.error = null;
            })
            .addCase(fetchContributionDetails.fulfilled, (state, action) => {
                state.isDetailLoading = false;
                state.selectedPostDetail = action.payload;
            })
            .addCase(fetchContributionDetails.rejected, (state, action: any) => {
                state.isDetailLoading = false;
                state.error = action.payload?.message || 'Failed to fetch details';
            });
    },
});

export const {
    clearPosts,
    setCategory,
    setSubCategory,
    setPostDetails,
    setImages,
    addImage,
    removeImage,
    updatePostLocation,
    clearNewPostData,
    setEditPostData,
    clearSelectedPostDetail
} = postSlice.actions;
export default postSlice.reducer;
