import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useWishlistScreen } from '../../../src/screens/Wishlist/WishlistScreen.hook';
import { postApi } from '../../../src/services/api/postApi';
import { useAppDispatch, useAppSelector } from '../../../src/store';
import { addToWishList, removeFromWishList } from '../../../src/store/slices/wishListSlice';
import { useNavigation } from '@react-navigation/native';

// Mock dependencies
jest.mock('../../../src/services/api/postApi');
jest.mock('../../../src/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));
jest.mock('../../../src/store/slices/wishListSlice', () => ({
    addToWishList: jest.fn(),
    removeFromWishList: jest.fn(),
    selectWishListIds: jest.fn(),
}));
jest.mock('@react-navigation/native', () => {
    const { useEffect } = require('react');
    return {
        useNavigation: jest.fn(),
        useFocusEffect: jest.fn((cb) => useEffect(() => cb(), [])),
    };
});
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

describe('useWishlistScreen', () => {
    const mockDispatch = jest.fn();
    const mockNavigate = jest.fn();
    const mockParentNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        (useAppSelector as jest.Mock).mockReturnValue([]);
        (useNavigation as jest.Mock).mockReturnValue({
            navigate: mockNavigate,
            getParent: () => ({ navigate: mockParentNavigate }),
        });
    });

    it('loads favorites on focus', async () => {
        const mockItems = [
            { id: '1', title: 'Item 1', image: 'img1', created_at: '2024-01-01' },
        ];
        (postApi.getFavoriteContributions as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { items: mockItems, total: 1 },
        });

        const { result } = renderHook(() => useWishlistScreen());

        await waitFor(() => {
            expect(postApi.getFavoriteContributions).toHaveBeenCalledWith(
                { page: 1, limit: 10 },
                expect.any(AbortSignal)
            );
        });

        await waitFor(() => {
            expect(result.current.favoritesList).toEqual(mockItems);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('syncs new items to Redux if they are not present', async () => {
        (useAppSelector as jest.Mock).mockReturnValue(['2']); // Only '2' is in Redux
        const mockItems = [
            { id: '1', title: 'Item 1', image: 'img1', created_at: '2024-01-01' },
            { id: '2', title: 'Item 2', image: 'img2', created_at: '2024-01-02' },
        ];
        (postApi.getFavoriteContributions as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { items: mockItems, total: 2 },
        });

        const { result } = renderHook(() => useWishlistScreen());

        await waitFor(() => {
            // Only Item 1 should be added to Redux
            expect(addToWishList).toHaveBeenCalledTimes(1);
            expect(addToWishList).toHaveBeenCalledWith({
                id: '1',
                title: 'Item 1',
                date: '2024-01-01',
                image: 'img1',
            });
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('handles item removal optimistically', async () => {
        const mockItems = [{ id: '1', title: 'Item 1' }];
        (postApi.getFavoriteContributions as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { items: mockItems, total: 1 },
        });

        const { result } = renderHook(() => useWishlistScreen());

        await waitFor(() => {
            expect(result.current.favoritesList.length).toBe(1);
        });

        await act(async () => {
            await result.current.onRemoveFromWishList('1');
        });

        await waitFor(() => {
            expect(result.current.favoritesList.length).toBe(0);
        });
        expect(mockDispatch).toHaveBeenCalledWith(removeFromWishList('1'));
        expect(postApi.removeContributionFromFavorite).toHaveBeenCalledWith('1');
    });

    it('navigates to product detail correctly', () => {
        const { result } = renderHook(() => useWishlistScreen());
        const item = { id: '1', title: 'Item 1', is_interested: true } as any;

        result.current.handlePostPress(item);

        expect(mockParentNavigate).toHaveBeenCalledWith('ProductDetail', expect.objectContaining({
            id: '1',
            status: 'in-progress',
        }));
    });
});
