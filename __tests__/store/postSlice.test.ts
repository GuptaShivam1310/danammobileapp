import postReducer, {
    clearPosts,
    setCategory,
    setSubCategory,
    setPostDetails,
    setImages,
    addImage,
    removeImage,
    updatePostLocation,
    clearSelectedPostDetail,
    clearNewPostData,
    setEditPostData,
    fetchUserPosts,
    createContribution,
    updatePost,
    deletePost,
    markPostAsContributed,
    fetchContributionDetails,
    fetchContributedPosts,
} from '../../src/store/slices/postSlice';
import { postApi } from '../../src/services/api/postApi';

jest.mock('../../src/services/api/postApi', () => ({
    postApi: {
        getMyContributions: jest.fn(),
        markAsContributed: jest.fn(),
        createContribution: jest.fn(),
        updateContribution: jest.fn(),
        deleteContribution: jest.fn(),
        getContributionDetails: jest.fn(),
        getItemContributes: jest.fn(),
    },
}));

describe('postSlice', () => {
    const initialState = {
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

    it('should handle clearPosts', () => {
        const stateWithPosts = {
            ...initialState,
            awaiting: {
                data: [{ id: '1', title: 'Test Post' } as any],
                page: 1,
                hasMore: true,
                loading: false,
            },
            contributed: {
                data: [{ id: '2', title: 'Contrib' } as any],
                page: 1,
                hasMore: false,
                loading: false,
            },
        };
        const actual = postReducer(stateWithPosts as any, clearPosts());
        expect(actual.awaiting.data).toEqual([]);
        expect(actual.contributed.data).toEqual([]);
    });

    it('should handle setCategory', () => {
        const category = { id: 'cat1', name: 'Category 1' };
        const actual = postReducer(initialState as any, setCategory(category));
        expect(actual.newPostData.categoryId).toBe('cat1');
        expect(actual.newPostData.categoryName).toBe('Category 1');
    });

    it('resets subcategory when category changes', () => {
        const stateWithSub = {
            ...initialState,
            newPostData: {
                ...initialState.newPostData,
                categoryId: 'old',
                subCategoryId: 'sub1',
                subCategoryName: 'Sub',
            },
        };
        const actual = postReducer(stateWithSub as any, setCategory({ id: 'new', name: 'New' }));
        expect(actual.newPostData.subCategoryId).toBeNull();
        expect(actual.newPostData.subCategoryName).toBeNull();
    });

    it('does not reset subcategory when category id is unchanged', () => {
        const stateWithSub = {
            ...initialState,
            newPostData: {
                ...initialState.newPostData,
                categoryId: 'same',
                subCategoryId: 'sub1',
                subCategoryName: 'Sub',
            },
        };
        const actual = postReducer(stateWithSub as any, setCategory({ id: 'same', name: 'Same' }));
        expect(actual.newPostData.subCategoryId).toBe('sub1');
        expect(actual.newPostData.subCategoryName).toBe('Sub');
    });

    it('should handle setSubCategory', () => {
        const actual = postReducer(initialState as any, setSubCategory({ id: 'sub1', name: 'Sub 1' }));
        expect(actual.newPostData.subCategoryId).toBe('sub1');
        expect(actual.newPostData.subCategoryName).toBe('Sub 1');
    });

    it('should handle setPostDetails', () => {
        const details = { title: 'New Title', description: 'New Description' };
        const actual = postReducer(initialState as any, setPostDetails(details));
        expect(actual.newPostData.title).toBe('New Title');
        expect(actual.newPostData.description).toBe('New Description');
    });

    it('should handle setImages and add/remove image', () => {
        let state = postReducer(initialState as any, setImages(['a.jpg']));
        state = postReducer(state as any, addImage('b.jpg'));
        state = postReducer(state as any, addImage('b.jpg'));
        expect(state.newPostData.images).toEqual(['a.jpg', 'b.jpg']);

        state = postReducer(state as any, removeImage(0));
        expect(state.newPostData.images).toEqual(['b.jpg']);
    });

    it('should handle updatePostLocation', () => {
        const actual = postReducer(
            initialState as any,
            updatePostLocation({ address: 'Addr', latitude: 12.3, longitude: 45.6 }),
        );
        expect(actual.newPostData.address).toBe('Addr');
        expect(actual.newPostData.latitude).toBe(12.3);
        expect(actual.newPostData.longitude).toBe(45.6);
    });

    it('updatePostLocation sets nulls when coords missing', () => {
        const actual = postReducer(
            initialState as any,
            updatePostLocation({ address: 'Addr' }),
        );
        expect(actual.newPostData.latitude).toBeNull();
        expect(actual.newPostData.longitude).toBeNull();
    });

    it('should handle clearNewPostData', () => {
        const stateWithData = postReducer(initialState as any, setPostDetails({ title: 'X', description: 'Y' }));
        const actual = postReducer(stateWithData as any, clearNewPostData());
        expect(actual.newPostData).toEqual(initialState.newPostData);
    });

    it('should handle setEditPostData', () => {
        const actual = postReducer(
            initialState as any,
            setEditPostData({
                id: '1',
                title: 'Title',
                description: 'Desc',
                image: 'img.jpg',
                categoryId: 'c1',
                categoryName: 'Cat',
                subCategoryId: 's1',
                subCategoryName: 'Sub',
                address: 'Addr',
                latitude: 1,
                longitude: 2,
                date: '',
            }),
        );
        expect(actual.newPostData.id).toBe('1');
        expect(actual.newPostData.images).toEqual(['img.jpg']);
    });

    it('should clear selected post detail', () => {
        const stateWithDetail = { ...initialState, selectedPostDetail: { id: '1' }, isDetailLoading: true };
        const actual = postReducer(stateWithDetail as any, clearSelectedPostDetail());
        expect(actual.selectedPostDetail).toBeNull();
        expect(actual.isDetailLoading).toBe(false);
    });

    it('should handle fetchUserPosts.pending', () => {
        const action = { type: fetchUserPosts.pending.type, meta: { arg: { status: 'pending' } } };
        const actual = postReducer(initialState as any, action as any);
        expect(actual.awaiting.loading).toBe(true);
    });

    it('should handle fetchUserPosts.pending for contributed', () => {
        const action = { type: fetchUserPosts.pending.type, meta: { arg: { status: 'contributed' } } };
        const actual = postReducer(initialState as any, action as any);
        expect(actual.contributed.loading).toBe(true);
    });

    it('should handle fetchUserPosts.fulfilled', () => {
        const mockPayload = {
            data: [{ id: '1', title: 'Fetched Post', created_at: '2026-03-03T05:21:10Z' }],
            status: 'pending',
            page: 1,
            hasMore: true,
        };
        const action = {
            type: fetchUserPosts.fulfilled.type,
            payload: mockPayload,
            meta: { arg: { status: 'pending' } }
        };
        const actual = postReducer(initialState as any, action as any);

        expect(actual.awaiting.loading).toBe(false);
        expect(actual.awaiting.data.length).toBe(1);
        expect(actual.awaiting.data[0].title).toBe('Fetched Post');
        expect(actual.awaiting.data[0].date).toBeDefined(); // Formatted date
    });

    it('handles fetchUserPosts.fulfilled for contributed tab', () => {
        const mockPayload = {
            data: [{ id: '10', title: 'Contributed', images: ['img.jpg'], created_at: '' }],
            status: 'contributed',
            page: 1,
            hasMore: false,
        };
        const action = {
            type: fetchUserPosts.fulfilled.type,
            payload: mockPayload,
            meta: { arg: { status: 'contributed' } }
        };
        const actual = postReducer(initialState as any, action as any);
        expect(actual.contributed.data[0].image).toBe('img.jpg');
        expect(actual.contributed.loading).toBe(false);
    });

    it('extracts data when response is array', async () => {
        (postApi.getMyContributions as jest.Mock).mockResolvedValue([
            { id: '1', title: 'One' },
        ]);

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchUserPosts/fulfilled');
        expect(result.payload.data).toHaveLength(1);
    });

    it('extracts data when response has data.items', async () => {
        (postApi.getMyContributions as jest.Mock).mockResolvedValue({
            data: { items: [{ id: '2', title: 'Two' }] },
        });

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.payload.data[0].id).toBe('2');
    });

    it('extracts data when response has data.data', async () => {
        (postApi.getMyContributions as jest.Mock).mockResolvedValue({
            data: { data: [{ id: '3', title: 'Three' }] },
        });

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.payload.data[0].id).toBe('3');
    });

    it('extracts data when response has items field', async () => {
        (postApi.getMyContributions as jest.Mock).mockResolvedValue({
            items: [{ id: '4', title: 'Four' }],
        });

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchUserPosts/fulfilled');
        expect(result.payload.data[0].id).toBe('4');
    });

    it('rejects fetchUserPosts with Cancelled on abort error', async () => {
        (postApi.getMyContributions as jest.Mock).mockRejectedValue({ name: 'AbortError' });

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchUserPosts/rejected');
        expect(result.payload).toBe('Cancelled');
    });

    it('rejects fetchUserPosts when API fails', async () => {
        (postApi.getMyContributions as jest.Mock).mockRejectedValue(new Error('fail'));

        const result = await fetchUserPosts({ status: 'pending', page: 1, limit: 10 })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchUserPosts/rejected');
        expect(result.payload).toBe('fail');
    });

    it('should append data on second page and filter duplicates', () => {
        const stateWithPage1 = {
            ...initialState,
            awaiting: {
                data: [{ id: '1', title: 'Post 1' } as any],
                page: 1,
                hasMore: true,
                loading: false,
            },
        };
        const mockPayload = {
            data: [
                { id: '1', title: 'Post 1' }, // Duplicate
                { id: '2', title: 'Post 2' },
            ],
            status: 'pending',
            page: 2,
            hasMore: false,
        };
        const action = {
            type: fetchUserPosts.fulfilled.type,
            payload: mockPayload,
            meta: { arg: { status: 'pending' } }
        };
        const actual = postReducer(stateWithPage1 as any, action as any);

        expect(actual.awaiting.data.length).toBe(2);
        expect(actual.awaiting.data[1].id).toBe('2');
        expect(actual.awaiting.page).toBe(2);
        expect(actual.awaiting.hasMore).toBe(false);
    });

    it('should handle fetchUserPosts.rejected', () => {
        const action = {
            type: fetchUserPosts.rejected.type,
            payload: 'Error message',
            meta: { arg: { status: 'pending' } }
        };
        const actual = postReducer(initialState as any, action as any);
        expect(actual.awaiting.loading).toBe(false);
        expect(actual.error).toBe('Error message');
    });

    it('fetchUserPosts.rejected clears contributed loading', () => {
        const action = {
            type: fetchUserPosts.rejected.type,
            payload: 'Error message',
            meta: { arg: { status: 'contributed' } }
        };
        const actual = postReducer(initialState as any, action as any);
        expect(actual.contributed.loading).toBe(false);
        expect(actual.error).toBe('Error message');
    });

    it('markPostAsContributed moves item from awaiting to contributed', () => {
        const stateWithAwaiting = {
            ...initialState,
            awaiting: {
                ...initialState.awaiting,
                data: [{ id: '1', title: 'A' } as any],
            },
            contributed: {
                ...initialState.contributed,
                data: [],
            },
        };

        const actual = postReducer(stateWithAwaiting as any, markPostAsContributed.fulfilled('1', 'req', '1'));
        expect(actual.awaiting.data).toHaveLength(0);
        expect(actual.contributed.data).toHaveLength(1);
    });

    it('markPostAsContributed leaves state when item not found', () => {
        const stateWithAwaiting = {
            ...initialState,
            awaiting: {
                ...initialState.awaiting,
                data: [{ id: '1', title: 'A' } as any],
            },
            contributed: {
                ...initialState.contributed,
                data: [],
            },
        };

        const actual = postReducer(stateWithAwaiting as any, markPostAsContributed.fulfilled('unknown', 'req', 'unknown'));
        expect(actual.awaiting.data).toHaveLength(1);
        expect(actual.contributed.data).toHaveLength(0);
    });

    it('markPostAsContributed handles rejected', () => {
        const pendingState = postReducer(initialState as any, markPostAsContributed.pending('req', '1'));
        const state = postReducer(pendingState as any, markPostAsContributed.rejected(new Error('fail'), 'req', '1', 'fail'));
        expect(state.awaiting.loading).toBe(false);
        expect(state.error).toBe('fail');
    });

    it('markPostAsContributed thunk returns id on success', async () => {
        (postApi.markAsContributed as jest.Mock).mockResolvedValue({});

        const result = await markPostAsContributed('p1')(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/markPostAsContributed/fulfilled');
        expect(result.payload).toBe('p1');
    });

    it('markPostAsContributed thunk rejects on failure', async () => {
        (postApi.markAsContributed as jest.Mock).mockRejectedValue(new Error('fail'));

        const result = await markPostAsContributed('p1')(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/markPostAsContributed/rejected');
        expect(result.payload).toBe('Failed to mark post as contributed');
    });

    it('createContribution thunk resolves with response data', async () => {
        (postApi.createContribution as jest.Mock).mockResolvedValue({ data: { id: 'n1', title: 'New' } });

        const result = await createContribution({ title: 'New' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/createContribution/fulfilled');
        expect(result.payload).toEqual({ id: 'n1', title: 'New' });
    });

    it('createContribution thunk rejects with message and statusCode', async () => {
        (postApi.createContribution as jest.Mock).mockRejectedValue({ message: 'boom', statusCode: 500 });

        const result = await createContribution({ title: 'New' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/createContribution/rejected');
        expect(result.payload).toEqual({ message: 'boom', statusCode: 500 });
    });

    it('createContribution.fulfilled adds new post', () => {
        const payload = { id: 'p1', title: 'New', images: ['img.jpg'] };
        const state = postReducer(initialState as any, createContribution.fulfilled(payload as any, 'req', payload as any));
        expect(state.awaiting.data[0].id).toBe('p1');
        expect(state.awaiting.loading).toBe(false);
    });

    it('createContribution.rejected sets error', () => {
        const state = postReducer(initialState as any, createContribution.rejected(new Error('fail'), 'req', {}, { message: 'fail' } as any));
        expect(state.awaiting.loading).toBe(false);
        expect(state.error).toBe('fail');
    });

    it('createContribution.rejected uses fallback message when payload missing', () => {
        const state = postReducer(initialState as any, createContribution.rejected(new Error('fail'), 'req', {}, undefined as any));
        expect(state.error).toBe('Failed to create contribution');
    });

    it('updatePost thunk resolves with response data', async () => {
        (postApi.updateContribution as jest.Mock).mockResolvedValue({ data: { id: '1', title: 'Updated' } });

        const result = await updatePost({ id: '1', title: 'Updated' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/updatePost/fulfilled');
        expect(result.payload).toEqual({ id: '1', title: 'Updated' });
    });

    it('updatePost thunk rejects with status from response', async () => {
        (postApi.updateContribution as jest.Mock).mockRejectedValue({ message: 'oops', response: { status: 404 } });

        const result = await updatePost({ id: '1', title: 'Updated' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/updatePost/rejected');
        expect(result.payload).toEqual({ message: 'oops', statusCode: 404 });
    });

    it('updatePost.fulfilled updates existing post', () => {
        const stateWithPost = {
            ...initialState,
            awaiting: {
                ...initialState.awaiting,
                data: [{ id: '1', title: 'Old', description: 'D' } as any],
            },
        };
        const payload = { id: '1', title: 'Updated', description: 'New' };
        const state = postReducer(stateWithPost as any, updatePost.fulfilled(payload as any, 'req', payload as any));
        expect(state.awaiting.data[0].title).toBe('Updated');
        expect(state.awaiting.loading).toBe(false);
    });

    it('updatePost.fulfilled handles missing post gracefully', () => {
        const state = postReducer(initialState as any, updatePost.fulfilled({ id: 'missing', title: 'X' } as any, 'req', {} as any));
        expect(state.awaiting.loading).toBe(false);
    });

    it('updatePost.rejected sets error', () => {
        const state = postReducer(initialState as any, updatePost.rejected(new Error('fail'), 'req', {}, { message: 'fail' } as any));
        expect(state.awaiting.loading).toBe(false);
        expect(state.error).toBe('fail');
    });

    it('updatePost.rejected uses fallback message when payload missing', () => {
        const state = postReducer(initialState as any, updatePost.rejected(new Error('fail'), 'req', {}, undefined as any));
        expect(state.error).toBe('Failed to update post');
    });

    it('deletePost thunk resolves with id', async () => {
        (postApi.deleteContribution as jest.Mock).mockResolvedValue({});

        const result = await deletePost('p1')(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/deletePost/fulfilled');
        expect(result.payload).toBe('p1');
    });

    it('deletePost thunk rejects with status from response', async () => {
        (postApi.deleteContribution as jest.Mock).mockRejectedValue({ message: 'boom', response: { status: 400 } });

        const result = await deletePost('p1')(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/deletePost/rejected');
        expect(result.payload).toEqual({ message: 'boom', statusCode: 400 });
    });

    it('deletePost.fulfilled removes post from both lists', () => {
        const stateWithPosts = {
            ...initialState,
            awaiting: {
                ...initialState.awaiting,
                data: [{ id: '1' } as any],
            },
            contributed: {
                ...initialState.contributed,
                data: [{ id: '1' } as any],
            },
        };
        const state = postReducer(stateWithPosts as any, deletePost.fulfilled('1', 'req', '1'));
        expect(state.awaiting.data).toHaveLength(0);
        expect(state.contributed.data).toHaveLength(0);
    });

    it('deletePost.rejected sets error', () => {
        const state = postReducer(initialState as any, deletePost.rejected(new Error('fail'), 'req', '1', { message: 'fail' } as any));
        expect(state.awaiting.loading).toBe(false);
        expect(state.error).toBe('fail');
    });

    it('deletePost.rejected uses fallback message when payload missing', () => {
        const state = postReducer(initialState as any, deletePost.rejected(new Error('fail'), 'req', '1', undefined as any));
        expect(state.error).toBe('Failed to delete contribution');
    });

    it('fetchContributionDetails toggles detail loading and stores data', () => {
        const pendingState = postReducer(initialState as any, fetchContributionDetails.pending('req', { id: '1' } as any));
        expect(pendingState.isDetailLoading).toBe(true);

        const fulfilledState = postReducer(
            pendingState as any,
            fetchContributionDetails.fulfilled({ id: '1', title: 'Detail' }, 'req', { id: '1' } as any),
        );
        expect(fulfilledState.isDetailLoading).toBe(false);
        expect(fulfilledState.selectedPostDetail).toEqual({ id: '1', title: 'Detail' });
    });

    it('fetchContributionDetails sets error on rejected', () => {
        const state = postReducer(
            initialState as any,
            fetchContributionDetails.rejected(new Error('fail'), 'req', { id: '1' } as any, { message: 'fail' } as any),
        );
        expect(state.error).toBe('fail');
    });

    it('fetchContributionDetails uses fallback message when payload missing', () => {
        const state = postReducer(
            initialState as any,
            fetchContributionDetails.rejected(new Error('fail'), 'req', { id: '1' } as any, undefined as any),
        );
        expect(state.error).toBe('Failed to fetch details');
    });

    it('fetchContributionDetails thunk resolves with response data', async () => {
        (postApi.getContributionDetails as jest.Mock).mockResolvedValue({ data: { id: 'd1', title: 'Detail' } });

        const result = await fetchContributionDetails({ id: 'd1' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchContributionDetails/fulfilled');
        expect(result.payload).toEqual({ id: 'd1', title: 'Detail' });
    });

    it('fetchContributionDetails thunk rejects with message and statusCode', async () => {
        (postApi.getContributionDetails as jest.Mock).mockRejectedValue({ message: 'fail', statusCode: 401 });

        const result = await fetchContributionDetails({ id: 'd1' })(jest.fn(), jest.fn(), undefined);

        expect(result.type).toBe('post/fetchContributionDetails/rejected');
        expect(result.payload).toEqual({ message: 'fail', statusCode: 401 });
    });

    it('fetchContributedPosts maps image fallback and uses userId param', async () => {
        (postApi.getItemContributes as jest.Mock).mockResolvedValue([
            { id: '1', image: '', images: ['img1'] },
        ]);

        const getState = () => ({ auth: { user: { id: 'user-1' } } });
        const result = await fetchContributedPosts('user-1')(jest.fn(), getState as any, undefined);

        expect(result.type).toBe('post/fetchContributed/fulfilled');
        expect(result.payload[0].image).toBe('img1');
    });

    it('fetchContributedPosts uses state user id when arg is undefined', async () => {
        (postApi.getItemContributes as jest.Mock).mockResolvedValue([
            { id: '2', image: 'img2', images: [] },
        ]);
        const getState = () => ({ auth: { user: { id: 'state-user' } } });
        const result = await fetchContributedPosts(undefined)(jest.fn(), getState as any, undefined);
        expect(result.type).toBe('post/fetchContributed/fulfilled');
        expect(result.payload[0].id).toBe('2');
    });

    it('fetchContributedPosts returns [] when userId is missing', async () => {
        const getState = () => ({ auth: { user: { id: null } } });
        const result = await fetchContributedPosts(undefined)(jest.fn(), getState as any, undefined);
        expect(result.payload).toEqual([]);
    });

    it('fetchContributedPosts rejects on error', async () => {
        (postApi.getItemContributes as jest.Mock).mockRejectedValue(new Error('fail'));
        const getState = () => ({ auth: { user: { id: 'u1' } } });
        const result = await fetchContributedPosts('u1')(jest.fn(), getState as any, undefined);
        expect(result.type).toBe('post/fetchContributed/rejected');
        expect(result.payload).toBe('fail');
    });
});
