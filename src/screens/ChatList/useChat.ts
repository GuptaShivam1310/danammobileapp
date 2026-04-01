import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { useNavigation, StackActions, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    fetchChats,
    selectAllChats,
    selectChatsError,
    selectChatsLoading,
    selectChatsRefreshing,
    selectFilteredChats,
    clearChatError,
    markChatAsReadLocal,
} from '../../store/chat/chatSlice';
import { ROUTES } from '../../constants/routes';
import { ChatItem } from './ChatListScreen';

import socketService from '../../services/socketService';

export const useChat = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    // ─── Redux State ─────────────────────────────────────────────
    const allChats = useAppSelector(selectAllChats);
    const loading = useAppSelector(selectChatsLoading);
    const refreshing = useAppSelector(selectChatsRefreshing);
    const error = useAppSelector(selectChatsError);

    // ─── Local Search ────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const filteredChats = useAppSelector(
        useMemo(() => selectFilteredChats(debouncedQuery), [debouncedQuery]),
    );

    const isSeekerUser = useAppSelector(state => state.auth.user?.role?.toLowerCase().startsWith('seeker')) ?? false;

    useEffect(() => {
        const handleGroupList = () => { };

        socketService.on("groupsList", handleGroupList);
        socketService.emit("getAllGroups");

        return () => {
            socketService.removeListener("groupsList", handleGroupList);
        };
    }, []);

    // ─── Refetch on Screen Focus ─────────────────────────────────
    const isFirstFocus = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                dispatch(fetchChats());
                isFirstFocus.current = false;
            } else {
                dispatch(fetchChats({ isSilent: true }));
            }
        }, [dispatch])
    );

    // ─── Socket Group Creation ───────────────────────────────────
    useEffect(() => {
        if (allChats.length > 0) {
            allChats.forEach(chat => {
                socketService.createNewGroup(chat.productTitle);
            });
        }
    }, [allChats]);



    // ─── Debounced Search ────────────────────────────────────────
    const debouncedSearch = useRef(
        debounce((query: string) => {
            setDebouncedQuery(query);
        }, 400),
    ).current;

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchChange = useCallback(
        (text: string) => {
            setSearchQuery(text);
            debouncedSearch(text);
        },
        [debouncedSearch],
    );

    // ─── Pull-to-Refresh ─────────────────────────────────────────
    const handleRefresh = useCallback(() => {
        dispatch(fetchChats({ isRefresh: true }));
    }, [dispatch]);

    // ─── Retry on Error ───────────────────────────────────────────
    const handleRetry = useCallback(() => {
        dispatch(clearChatError());
        dispatch(fetchChats());
    }, [dispatch]);

    // ─── Navigation ──────────────────────────────────────────────
    const handleChatPress = useCallback(
        (item: ChatItem) => {
            if (isSeekerUser) {
                // Instantly wipe unread dot natively for the seeker traversing to chat
                dispatch(markChatAsReadLocal(item.id));

                navigation.dispatch(
                    StackActions.push(ROUTES.CHAT, {
                        seekerId: item.donorId || item.id,
                        seekerName: item.donorName || 'Donor',
                        seekerAvatar: item.donorImage,
                        productId: item.id,
                        productTitle: item.productTitle,
                        productImage: item.productImage,
                        requestId: item.requestId,
                    })
                );
            } else {
                navigation.navigate(ROUTES.CHAT_DETAIL as any, {
                    chatId: item.id,
                    productTitle: item.productTitle,
                    productImage: item.productImage,
                });
            }
        },
        [navigation, isSeekerUser],
    );

    return useMemo(() => ({
        chats: filteredChats,
        loading,
        refreshing,
        error,
        searchQuery,
        handleSearchChange,
        handleRefresh,
        handleRetry,
        handleChatPress,
        isSeekerUser,
    }), [
        filteredChats,
        loading,
        refreshing,
        error,
        searchQuery,
        handleSearchChange,
        handleRefresh,
        handleRetry,
        handleChatPress,
        isSeekerUser,
    ]);
};
