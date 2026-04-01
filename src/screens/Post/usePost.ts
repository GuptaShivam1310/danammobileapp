import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchUserPosts, clearNewPostData } from '../../store/slices/postSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';

type PostNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type PostTab = 'Awaiting' | 'Contributed';

export const usePost = () => {
    const navigation = useNavigation<PostNavigationProp>();
    const isFocused = useIsFocused();
    const dispatch = useAppDispatch();

    const [activeTab, setActiveTab] = useState<PostTab>('Awaiting');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { awaiting, contributed, error } = useAppSelector(state => state.post);
    const activeData = activeTab === 'Awaiting' ? awaiting : contributed;
    const status = activeTab === 'Awaiting' ? 'pending' : 'donated';

    const fetchData = useCallback(
        async (page: number) => {
            await dispatch(fetchUserPosts({ status, page, limit: 10 })).unwrap();
        },
        [dispatch, status]
    );

    useEffect(() => {
        if (isFocused) {
            // Initial load for both if they are empty and haven't been loaded yet (page === 0)
            if (awaiting.data.length === 0 && !awaiting.loading && awaiting.page === 0 && !error) {
                dispatch(fetchUserPosts({ status: 'pending', page: 1, limit: 10 }));
            }
            if (contributed.data.length === 0 && !contributed.loading && contributed.page === 0 && !error) {
                dispatch(fetchUserPosts({ status: 'donated', page: 1, limit: 10 }));
            }
        }
    }, [isFocused, dispatch, awaiting.data.length, contributed.data.length, awaiting.loading, contributed.loading, awaiting.page, contributed.page, error]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchData(1);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchData]);

    const handleLoadMore = useCallback(() => {
        if (!activeData.loading && activeData.hasMore) {
            fetchData(activeData.page + 1);
        }
    }, [activeData.loading, activeData.hasMore, activeData.page, fetchData]);

    const handleContinue = useCallback(() => {
        dispatch(clearNewPostData());
        navigation.navigate(ROUTES.SELECT_CATEGORY);
    }, [dispatch, navigation]);

    const handleTabChange = useCallback((tab: PostTab) => {
        setActiveTab(tab);
    }, []);

    const handlePostPress = useCallback((id: string) => {
        if (activeTab === 'Awaiting') {
            navigation.navigate(ROUTES.POST_DETAIL, { id, isPreview: false });
        }
    }, [activeTab, navigation]);

    return useMemo(() => ({
        posts: activeData.data,
        isLoading: activeData.loading && activeData.data.length === 0,
        isRefreshing,
        activeTab,
        awaitingCount: awaiting.data.length,
        contributedCount: contributed.data.length,
        handleContinue,
        handleTabChange,
        handlePostPress,
        handleRefresh,
        handleLoadMore,
        hasMore: activeData.hasMore,
    }), [
        activeData.data,
        activeData.loading,
        activeData.hasMore,
        isRefreshing,
        activeTab,
        awaiting.data.length,
        contributed.data.length,
        handleContinue,
        handleTabChange,
        handlePostPress,
        handleRefresh,
        handleLoadMore,
    ]);
};
