import { useCallback, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    fetchProductSeekers,
    selectSeekersError,
    selectSeekersLoading,
    selectFilteredSeekers,
    clearError,
} from '../../store/productSeekers/productSeekersSlice';
import { ROUTES } from '../../constants/routes';
import { Seeker } from '../../services/api/productSeekersApi';

export const useProductSeekers = (productId: string) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    // ─── Redux State ─────────────────────────────────────────────
    const loading = useAppSelector(selectSeekersLoading);
    const error = useAppSelector(selectSeekersError);

    // ─── Local Search ────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const seekers = useAppSelector(
        useMemo(() => selectFilteredSeekers(debouncedQuery), [debouncedQuery]),
    );

    // ─── Fetch on Mount ──────────────────────────────────────────
    const load = useCallback(() => {
        dispatch(fetchProductSeekers(productId));
    }, [dispatch, productId]);

    // ─── Debounced Search ────────────────────────────────────────
    const debouncedSearch = useRef(
        debounce((query: string) => {
            setDebouncedQuery(query);
        }, 400),
    ).current;

    const handleSearchChange = useCallback(
        (text: string) => {
            setSearchQuery(text);
            debouncedSearch(text);
        },
        [debouncedSearch],
    );

    // ─── Retry on Error ───────────────────────────────────────────
    const handleRetry = useCallback(() => {
        dispatch(clearError());
        dispatch(fetchProductSeekers(productId));
    }, [dispatch, productId]);

    // ─── Navigation ──────────────────────────────────────────────
    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSeekerPress = useCallback(
        (item: Seeker, productTitle: string, productImage?: string) => {
            if (item.status === 'pending') {
                navigation.navigate(ROUTES.REQUEST_DETAIL as any, {
                    seekerId: item.userId,
                    requestId: item.id,
                    productId,
                    productTitle,
                    productImage,
                });
            } else {
                navigation.navigate(ROUTES.CHAT as any, {
                    seekerId: item.userId,
                    requestId: item.id,
                    seekerName: item.name,
                    seekerAvatar: item.avatar,
                    productId,
                    productTitle,
                    productImage,
                });
            }
        },
        [navigation, productId],
    );

    const handleViewRequest = useCallback(
        (item: Seeker, productTitle: string, productImage?: string) => {
            navigation.navigate(ROUTES.REQUEST_DETAIL as any, {
                seekerId: item.userId,
                requestId: item.id,
                productId,
                productTitle,
                productImage,
            });
        },
        [navigation, productId],
    );

    return {
        seekers,
        loading,
        error,
        searchQuery,
        handleSearchChange,
        handleRetry,
        handleBack,
        handleSeekerPress,
        handleViewRequest,
        load,
    };
};
