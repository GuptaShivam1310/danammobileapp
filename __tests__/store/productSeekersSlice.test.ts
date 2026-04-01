import productSeekersReducer, {
    ProductSeekersState,
    setSearchQuery,
    clearError,
    updateSeekerStatus,
    updateLastMessage,
    clearSeekers,
    setCurrentRequest,
    fetchProductSeekers,
    fetchRequestDetail,
    acceptRequestThunk,
    rejectRequestThunk,
    reportUserThunk,
    selectAllSeekers,
    selectSeekersLoading,
    selectSeekersError,
    selectSearchQuery,
    selectFilteredSeekers,
    selectPendingSeekers,
    selectActiveSeekers,
} from '../../src/store/productSeekers/productSeekersSlice';
import { addMessage, sendMessage } from '../../src/store/chat/chatSlice';
import { Seeker } from '../../src/services/api/productSeekersApi';
import { chatApi } from '../../src/services/api/chatApi';
import { requestApi } from '../../src/services/api/requestApi';
import { formatChatTimestamp } from '../../src/utils/dateUtils';

jest.mock('../../src/services/api/chatApi', () => ({
    chatApi: {
        getProductSeekers: jest.fn(),
    },
}));

jest.mock('../../src/services/api/requestApi', () => ({
    requestApi: {
        getRequestDetail: jest.fn(),
        acceptRequest: jest.fn(),
        rejectRequest: jest.fn(),
        reportUser: jest.fn(),
    },
}));

jest.mock('../../src/utils/dateUtils', () => ({
    formatChatTimestamp: jest.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeSeeker = (overrides: Partial<Seeker> = {}): Seeker => ({
    id: '1',
    userId: 'u1',
    name: 'Donald Taylor',
    avatar: '',
    status: 'pending',
    lastMessage: '',
    timestamp: '',
    ...overrides,
});

const initialState: ProductSeekersState = {
    seekers: [],
    loading: false,
    error: null,
    searchQuery: '',
    currentRequest: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('productSeekersSlice', () => {
    // ─── Initial State ─────────────────────────────────────────────
    describe('initial state', () => {
        it('returns correct initial state', () => {
            const state = productSeekersReducer(undefined, { type: '@@INIT' });
            expect(state).toEqual(initialState);
        });
    });

    // ─── fetchProductSeekers thunk ─────────────────────────────────
    describe('fetchProductSeekers thunk', () => {
        it('maps API response and filters rejected seekers', async () => {
            (formatChatTimestamp as jest.Mock).mockReturnValue('09:41 AM');
            (chatApi.getProductSeekers as jest.Mock).mockResolvedValue({
                success: true,
                data: [
                    {
                        request_id: '1',
                        user_id: 'u1',
                        name: 'Donald Taylor',
                        profile_image: '',
                        request_status: 'pending',
                        last_message: 'document.pdf',
                        last_message_time: '2026-03-06T09:41:00Z',
                    },
                    {
                        request_id: '2',
                        user_id: 'u2',
                        name: 'Daniel Peterson',
                        profile_image: '',
                        request_status: 'active',
                        last_message: 'photo.jpg',
                        last_message_time: '2026-03-06T09:41:00Z',
                    },
                    {
                        request_id: '3',
                        user_id: 'u3',
                        name: 'Rejected User',
                        profile_image: '',
                        request_status: 'rejected',
                        last_message: 'Sorry',
                        last_message_time: '2026-03-06T08:00:00Z',
                    },
                ],
            });

            const result = await fetchProductSeekers('prod-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchProductSeekers/fulfilled');
            expect(result.payload).toHaveLength(2);
            expect(result.payload[0].status).toBe('pending');
            expect(result.payload[0].lastMessage).toBe('PDF');
            expect(result.payload[1].status).toBe('active');
            expect(result.payload[1].lastMessage).toBe('Photo');
            expect(formatChatTimestamp).toHaveBeenCalled();
        });

        it('maps empty and plain text last_message', async () => {
            (formatChatTimestamp as jest.Mock).mockReturnValue('10:00 AM');
            (chatApi.getProductSeekers as jest.Mock).mockResolvedValue({
                success: true,
                data: [
                    {
                        request_id: '1',
                        user_id: 'u1',
                        name: 'No Message',
                        profile_image: '',
                        request_status: 'pending',
                        last_message: '',
                        last_message_time: '2026-03-06T09:41:00Z',
                    },
                    {
                        request_id: '2',
                        user_id: 'u2',
                        name: 'Plain Message',
                        profile_image: '',
                        request_status: 'active',
                        last_message: 'Hello there',
                        last_message_time: '2026-03-06T09:42:00Z',
                    },
                ],
            });

            const result = await fetchProductSeekers('prod-2')(jest.fn(), jest.fn(), undefined);

            expect(result.payload[0].lastMessage).toBe('');
            expect(result.payload[1].lastMessage).toBe('Hello there');
        });

        it('rejects when API returns success=false', async () => {
            (chatApi.getProductSeekers as jest.Mock).mockResolvedValue({
                success: false,
                message: 'Failed to load seekers',
            });

            const result = await fetchProductSeekers('prod-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchProductSeekers/rejected');
            expect(result.payload).toBe('Failed to load seekers');
        });

        it('rejects with fallback message on error', async () => {
            (chatApi.getProductSeekers as jest.Mock).mockRejectedValue({});

            const result = await fetchProductSeekers('prod-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchProductSeekers/rejected');
            expect(typeof result.payload).toBe('string');
        });

        it('rejects with API error message from response', async () => {
            (chatApi.getProductSeekers as jest.Mock).mockRejectedValue({
                response: { data: { message: 'Server down' } },
            });

            const result = await fetchProductSeekers('prod-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchProductSeekers/rejected');
            expect(result.payload).toBe('Server down');
        });

        it('sets loading=true on pending', () => {
            const action = fetchProductSeekers.pending('req', 'prod-1');
            const state = productSeekersReducer(initialState, action);
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('stores seekers and clears loading on fulfilled', () => {
            const seekers = [
                makeSeeker({ id: '1', status: 'pending' }),
                makeSeeker({ id: '2', status: 'active', lastMessage: 'Hello' }),
            ];
            const action = fetchProductSeekers.fulfilled(seekers, 'req', 'prod-1');
            const state = productSeekersReducer({ ...initialState, loading: true }, action);
            expect(state.loading).toBe(false);
            expect(state.seekers).toHaveLength(2);
            expect(state.error).toBeNull();
        });

        it('sets error and clears loading on rejected', () => {
            const action = fetchProductSeekers.rejected(
                new Error('Network error'),
                'req',
                'prod-1',
                'Network error',
            );
            const state = productSeekersReducer({ ...initialState, loading: true }, action);
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Network error');
        });
    });

    // ─── fetchRequestDetail thunk ──────────────────────────────────
    describe('fetchRequestDetail thunk', () => {
        it('returns data when API succeeds', async () => {
            (requestApi.getRequestDetail as jest.Mock).mockResolvedValue({
                success: true,
                data: { id: 'req-1', name: 'Test Request' },
            });

            const result = await fetchRequestDetail('req-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchRequestDetail/fulfilled');
            expect(result.payload).toEqual({ id: 'req-1', name: 'Test Request' });
        });

        it('rejects when API returns success=false', async () => {
            (requestApi.getRequestDetail as jest.Mock).mockResolvedValue({
                success: false,
                message: 'Failed to fetch request details',
            });

            const result = await fetchRequestDetail('req-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchRequestDetail/rejected');
            expect(result.payload).toBe('Failed to fetch request details');
        });

        it('rejects when API throws', async () => {
            (requestApi.getRequestDetail as jest.Mock).mockRejectedValue({ message: 'Network error' });

            const result = await fetchRequestDetail('req-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/fetchRequestDetail/rejected');
            expect(result.payload).toBe('Network error');
        });

        it('sets loading=true on pending', () => {
            const action = fetchRequestDetail.pending('req', 'req-1');
            const state = productSeekersReducer(initialState, action);
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('stores currentRequest on fulfilled', () => {
            const mockDetail = { id: 'req-1', name: 'Test Request' } as any;
            const action = fetchRequestDetail.fulfilled(mockDetail, 'req', 'req-1');
            const state = productSeekersReducer({ ...initialState, loading: true }, action);
            expect(state.loading).toBe(false);
            expect(state.currentRequest).toEqual(mockDetail);
            expect(state.error).toBeNull();
        });

        it('sets error on rejected', () => {
            const action = fetchRequestDetail.rejected(
                new Error('fail'),
                'req',
                'req-1',
                'fail',
            );
            const state = productSeekersReducer({ ...initialState, loading: true }, action);
            expect(state.loading).toBe(false);
            expect(state.error).toBe('fail');
        });
    });

    // ─── acceptRequestThunk ────────────────────────────────────────
    describe('acceptRequestThunk', () => {
        it('returns requestId when API succeeds', async () => {
            (requestApi.acceptRequest as jest.Mock).mockResolvedValue({ success: true });

            const result = await acceptRequestThunk('req-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/acceptRequest/fulfilled');
            expect(result.payload).toBe('req-1');
        });

        it('rejects when API returns success=false', async () => {
            (requestApi.acceptRequest as jest.Mock).mockResolvedValue({
                success: false,
                message: 'Failed to accept request',
            });

            const result = await acceptRequestThunk('req-1')(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/acceptRequest/rejected');
            expect(result.payload).toBe('Failed to accept request');
        });

        it('updates seeker status to active on fulfilled', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1', status: 'pending' })] },
                acceptRequestThunk.fulfilled('1', 'req', '1'),
            );
            expect(state.seekers[0].status).toBe('active');
        });

        it('does nothing if seeker not found', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1', status: 'pending' })] },
                acceptRequestThunk.fulfilled('ghost', 'req', 'ghost'),
            );
            expect(state.seekers[0].status).toBe('pending');
        });
    });

    // ─── rejectRequestThunk ────────────────────────────────────────
    describe('rejectRequestThunk', () => {
        it('returns requestId when API succeeds', async () => {
            (requestApi.rejectRequest as jest.Mock).mockResolvedValue({ success: true });

            const result = await rejectRequestThunk({ requestId: 'req-1', reason: 'spam' })(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/rejectRequest/fulfilled');
            expect(result.payload).toBe('req-1');
        });

        it('rejects when API returns success=false', async () => {
            (requestApi.rejectRequest as jest.Mock).mockResolvedValue({
                success: false,
                message: 'Failed to reject request',
            });

            const result = await rejectRequestThunk({ requestId: 'req-1', reason: 'spam' })(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/rejectRequest/rejected');
            expect(result.payload).toBe('Failed to reject request');
        });

        it('removes seeker from list on fulfilled', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1' }), makeSeeker({ id: '2' })] },
                rejectRequestThunk.fulfilled('1', 'req', { requestId: '1', reason: 'reason' }),
            );
            expect(state.seekers).toHaveLength(1);
            expect(state.seekers[0].id).toBe('2');
        });
    });

    // ─── reportUserThunk ───────────────────────────────────────────
    describe('reportUserThunk', () => {
        it('returns userId and message on success', async () => {
            (requestApi.reportUser as jest.Mock).mockResolvedValue({
                success: true,
                message: 'User reported successfully',
            });

            const result = await reportUserThunk({ userId: 'u1', reason: 'spam' })(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/reportUser/fulfilled');
            expect(result.payload).toEqual({ userId: 'u1', message: 'User reported successfully' });
        });

        it('rejects when API returns success=false', async () => {
            (requestApi.reportUser as jest.Mock).mockResolvedValue({
                success: false,
                message: 'Failed to report user',
            });

            const result = await reportUserThunk({ userId: 'u1', reason: 'spam' })(jest.fn(), jest.fn(), undefined);

            expect(result.type).toBe('productSeekers/reportUser/rejected');
            expect(result.payload).toBe('Failed to report user');
        });

        it('removes reported seeker from list on fulfilled', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'u1', userId: 'u1' }), makeSeeker({ id: 'u2', userId: 'u2' })] },
                reportUserThunk.fulfilled({ userId: 'u1', message: 'ok' }, 'req', { userId: 'u1', reason: 'spam' }),
            );
            // Reported seeker (id u1) should be removed
            expect(state.seekers.some(s => s.id === 'u1')).toBe(false);
        });
    });

    // ─── setSearchQuery ────────────────────────────────────────────
    describe('setSearchQuery', () => {
        it('updates searchQuery', () => {
            const state = productSeekersReducer(initialState, setSearchQuery('Donald'));
            expect(state.searchQuery).toBe('Donald');
        });
    });

    // ─── clearError ───────────────────────────────────────────────
    describe('clearError', () => {
        it('resets error to null', () => {
            const state = productSeekersReducer(
                { ...initialState, error: 'Something failed' },
                clearError(),
            );
            expect(state.error).toBeNull();
        });
    });

    // ─── updateSeekerStatus ────────────────────────────────────────
    describe('updateSeekerStatus', () => {
        it('updates seeker status from pending to active', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1', status: 'pending' })] },
                updateSeekerStatus({ id: '1', status: 'active' }),
            );
            expect(state.seekers[0].status).toBe('active');
        });

        it('does nothing when seekerId not found', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1' })] },
                updateSeekerStatus({ id: 'ghost', status: 'active' }),
            );
            expect(state.seekers[0].status).toBe('pending');
        });
    });

    // ─── updateLastMessage ─────────────────────────────────────────
    describe('updateLastMessage', () => {
        it('updates last message and timestamp', () => {
            const ts = '2026-02-25T09:41:00Z';
            const state = productSeekersReducer(
                {
                    ...initialState,
                    seekers: [makeSeeker({ id: '1', status: 'active' })],
                },
                updateLastMessage({ id: '1', message: 'Good Morning', timestamp: ts }),
            );
            expect(state.seekers[0].lastMessage).toBe('Good Morning');
            expect(state.seekers[0].timestamp).toBe(ts);
        });

        it('does nothing when seekerId not found', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: '1' })] },
                updateLastMessage({ id: 'none', message: 'Hi', timestamp: '2026-02-25T09:00:00Z' }),
            );
            expect(state.seekers[0].lastMessage).toBe('');
        });
    });

    // ─── clearSeekers ──────────────────────────────────────────────
    describe('clearSeekers', () => {
        it('resets seekers, searchQuery, error', () => {
            const state = productSeekersReducer(
                {
                    seekers: [makeSeeker()],
                    loading: false,
                    error: 'old error',
                    searchQuery: 'Donald',
                    currentRequest: null,
                },
                clearSeekers(),
            );
            expect(state.seekers).toHaveLength(0);
            expect(state.searchQuery).toBe('');
            expect(state.error).toBeNull();
        });
    });

    // ─── setCurrentRequest ─────────────────────────────────────────
    describe('setCurrentRequest', () => {
        it('sets currentRequest', () => {
            const req = { id: 'req-1', name: 'Test' } as any;
            const state = productSeekersReducer(initialState, setCurrentRequest(req));
            expect(state.currentRequest).toEqual(req);
        });
    });

    // ─── addMessage cross-slice ───────────────────────────────────
    describe('addMessage cross-slice', () => {
        it('updates seeker lastMessage on text message', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                addMessage({ chatId: 'chat1', message: { _id: 'm1', text: 'Hello', type: 'text', createdAt: new Date().toISOString() } }),
            );
            expect(state.seekers[0].lastMessage).toBe('Hello');
        });

        it('sets lastMessage to "Photo" for image messages', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                addMessage({ chatId: 'chat1', message: { _id: 'm1', text: '', type: 'image', createdAt: new Date().toISOString() } }),
            );
            expect(state.seekers[0].lastMessage).toBe('Photo');
        });

        it('sets lastMessage to "PDF" for pdf messages', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                addMessage({ chatId: 'chat1', message: { _id: 'm1', text: '', type: 'pdf', createdAt: new Date().toISOString() } }),
            );
            expect(state.seekers[0].lastMessage).toBe('PDF');
        });

        it('sets lastMessage to "PDF" for document messages', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                addMessage({ chatId: 'chat1', message: { _id: 'm1', text: '', type: 'document', createdAt: new Date().toISOString() } }),
            );
            expect(state.seekers[0].lastMessage).toBe('PDF');
        });

        it('does nothing for unknown chatId', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                addMessage({ chatId: 'unknown', message: { _id: 'm1', text: 'Hi', type: 'text', createdAt: new Date().toISOString() } }),
            );
            expect(state.seekers[0].lastMessage).toBe('');
        });
    });

    // ─── sendMessage cross-slice ──────────────────────────────────
    describe('sendMessage cross-slice', () => {
        it('updates seeker lastMessage on sendMessage.fulfilled text', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                sendMessage.fulfilled(
                    { chatId: 'chat1', message: { _id: 'm2', chatId: 'chat1', senderId: 'me', text: 'Sent', type: 'text', createdAt: new Date().toISOString() } },
                    'req',
                    { chatId: 'chat1', text: 'Sent', senderId: 'me', senderName: 'Me', type: 'text' },
                ),
            );
            expect(state.seekers[0].lastMessage).toBe('Sent');
        });

        it('sets lastMessage to "Photo" for image sendMessage', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                sendMessage.fulfilled(
                    { chatId: 'chat1', message: { _id: 'm3', chatId: 'chat1', senderId: 'me', text: '', type: 'image', createdAt: new Date().toISOString() } },
                    'req',
                    { chatId: 'chat1', text: '', senderId: 'me', senderName: 'Me', type: 'image' },
                ),
            );
            expect(state.seekers[0].lastMessage).toBe('Photo');
        });

        it('sets lastMessage to "PDF" for document sendMessage', () => {
            const state = productSeekersReducer(
                { ...initialState, seekers: [makeSeeker({ id: 'chat1' })] },
                sendMessage.fulfilled(
                    { chatId: 'chat1', message: { _id: 'm4', chatId: 'chat1', senderId: 'me', text: '', type: 'document', createdAt: new Date().toISOString() } },
                    'req',
                    { chatId: 'chat1', text: '', senderId: 'me', senderName: 'Me', type: 'document' },
                ),
            );
            expect(state.seekers[0].lastMessage).toBe('PDF');
        });
    });

    // ─── Selectors ────────────────────────────────────────────────
    describe('selectors', () => {
        const mockState: any = {
            productSeekers: {
                seekers: [
                    makeSeeker({ id: '1', status: 'active', name: 'Alice' }),
                    makeSeeker({ id: '2', status: 'pending', name: 'Bob' }),
                    makeSeeker({ id: '3', status: 'active', name: 'Charlie' }),
                ],
                loading: true,
                error: 'Some error',
                searchQuery: 'test',
                currentRequest: null,
            },
        };

        it('selectAllSeekers returns all seekers', () => {
            expect(selectAllSeekers(mockState)).toHaveLength(3);
        });

        it('selectSeekersLoading returns loading flag', () => {
            expect(selectSeekersLoading(mockState)).toBe(true);
        });

        it('selectSeekersError returns error', () => {
            expect(selectSeekersError(mockState)).toBe('Some error');
        });

        it('selectSearchQuery returns query', () => {
            expect(selectSearchQuery(mockState)).toBe('test');
        });

        it('selectFilteredSeekers returns all if query < 2 chars', () => {
            expect(selectFilteredSeekers('A')(mockState)).toHaveLength(3);
        });

        it('selectFilteredSeekers filters by name when query >= 2 chars', () => {
            expect(selectFilteredSeekers('al')(mockState)).toHaveLength(1);
            expect(selectFilteredSeekers('al')(mockState)[0].name).toBe('Alice');
        });

        it('selectPendingSeekers returns only pending', () => {
            expect(selectPendingSeekers(mockState)).toHaveLength(1);
            expect(selectPendingSeekers(mockState)[0].name).toBe('Bob');
        });

        it('selectActiveSeekers returns only active', () => {
            expect(selectActiveSeekers(mockState)).toHaveLength(2);
        });
    });
});
