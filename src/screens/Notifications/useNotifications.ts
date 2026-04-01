import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NotificationItem } from './types';
import { notificationApi } from '../../services/api/notificationApi';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await notificationApi.getNotifications();
      setNotifications(response);
    } catch (err) {
      setError('errors.genericTryAgain');
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    await loadNotifications();
    setLoading(false);
  }, [loadNotifications]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!notificationId || markingIds.has(notificationId)) {
        return;
      }

      setMarkingIds(prev => new Set(prev).add(notificationId));
      try {
        const updated = await notificationApi.markAsRead(notificationId);
        if (updated) {
          setNotifications(prev =>
            prev.map(item => (item.id === updated.id ? updated : item)),
          );
        }
      } finally {
        setMarkingIds(prev => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    },
    [markingIds],
  );

  const markingIdSet = useMemo(() => markingIds, [markingIds]);

  return {
    notifications,
    loading,
    refreshing,
    error,
    onRefresh,
    markAsRead,
    markingIdSet,
  };
};
