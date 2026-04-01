import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePost } from '../../src/screens/Post/usePost';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import postReducer, { setPostDetails, fetchUserPosts } from '../../src/store/slices/postSlice';
import { ROUTES } from '../../src/constants/routes';
import React from 'react';

// Mock navigation
const mockNavigate = jest.fn();
const mockUseIsFocused = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
    useIsFocused: () => mockUseIsFocused(),
}));

// Mock API
jest.mock('../../src/services/api/postApi', () => ({
    postApi: {
        getMyContributions: jest.fn().mockResolvedValue({
            data: {
                data: [{ id: '1', title: 'Test Post', created_at: '2026-03-03' }],
                meta: { current_page: 1, last_page: 2 }
            }
        }),
    },
}));

const createMockStore = () => {
    return configureStore({
        reducer: {
            post: postReducer,
        },
    });
};

describe('usePost hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(false);
    });

    it('should clear new post data and navigate when handleContinue is called', () => {
        const store = createMockStore();

        act(() => {
            store.dispatch(setPostDetails({ title: 'Old Title', description: 'Old Desc' }));
        });

        expect(store.getState().post.newPostData.title).toBe('Old Title');

        const { result } = renderHook(() => usePost(), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        });

        act(() => {
            result.current.handleContinue();
        });

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELECT_CATEGORY);
        expect(store.getState().post.newPostData.title).toBe('');
    });

    it('should handle tab changes correctly', () => {
        const { result } = renderHook(() => usePost(), {
            wrapper: ({ children }) => <Provider store={createMockStore()}>{children}</Provider>
        });

        expect(result.current.activeTab).toBe('Awaiting');

        act(() => {
            result.current.handleTabChange('Contributed');
        });

        expect(result.current.activeTab).toBe('Contributed');
    });

    it('should expose correct count from store', () => {
        const store = createMockStore();
        const mockPost = { id: '1', title: 'Mock Post', date: 'Date' };

        // Manual override for test purpose
        // In real app this comes from API
        act(() => {
            store.dispatch({
                type: 'post/fetchUserPosts/fulfilled',
                payload: {
                    data: [mockPost],
                    page: 1,
                    hasMore: true
                },
                meta: {
                    arg: { status: 'pending' }
                }
            });
        });

        const { result } = renderHook(() => usePost(), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        });

        expect(result.current.awaitingCount).toBe(1);
        expect(result.current.posts[0].id).toBe('1');
    });

    it('should fetch both pending and donated posts on initial load', async () => {
        const { postApi } = require('../../src/services/api/postApi');
        mockUseIsFocused.mockReturnValue(true);

        renderHook(() => usePost(), {
            wrapper: ({ children }) => <Provider store={createMockStore()}>{children}</Provider>
        });

        await waitFor(() => {
            const { postApi: postApiReq } = require('../../src/services/api/postApi');
            expect(postApiReq.getMyContributions).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'pending' }),
                expect.anything()
            );
            expect(postApiReq.getMyContributions).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'donated' }),
                expect.anything()
            );
        });
    });

    it('should not fetch again when tab changes if data already exists', async () => {
        const store = createMockStore();
        const { postApi } = require('../../src/services/api/postApi');
        mockUseIsFocused.mockReturnValue(true);

        const { result } = renderHook(() => usePost(), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        });

        // Wait for initial fetches (both pending and donated)
        await waitFor(() => {
            expect(postApi.getMyContributions).toHaveBeenCalledTimes(2);
        });

        // Clear mock calls to start fresh
        postApi.getMyContributions.mockClear();

        // Switch tab
        act(() => {
            result.current.handleTabChange('Contributed');
        });

        // Verify no new fetch was triggered
        expect(postApi.getMyContributions).not.toHaveBeenCalled();
    });
});
