import { axiosClient } from '../../api/axiosClient';
import get from 'lodash/get';
import { ApiResponse } from '../../models/api';

export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: '/api/notifications',
  UNREAD_COUNT: '/api/notifications/unread-count',
  MARK_READ: (id: string) => `/api/notifications/${id}/read`,
} as const;

export interface NotificationApiItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<NotificationApiItem[]> => {
    const response = await axiosClient.get<ApiResponse<NotificationApiItem[]>>(
      NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS,
    );
    const notifications = get(response.data, 'data.items', []);

    if (!Array.isArray(notifications)) {
      return [];
    }
    console.log('notifications', notifications);
    return notifications.map((notification: any) => ({
      id: String(notification.id || ''),
      user_id: String(notification.user_id || ''),
      title: String(notification.title || ''),
      body: String(notification.message || ''),
      is_read: Boolean(notification.is_read),
      created_at: String(notification.created_at || ''),
      image_url: String(notification.image_url || ''),
    }));
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get<ApiResponse<{ count?: number }>>(
      NOTIFICATION_ENDPOINTS.UNREAD_COUNT,
    );

    const count = get(response.data, 'data.count', 0);
    const parsed = Number(count);
    return Number.isFinite(parsed) ? parsed : 0;
  },
  markAsRead: async (
    notificationId: string,
  ): Promise<NotificationApiItem | null> => {
    const response = await axiosClient.put<ApiResponse<NotificationApiItem>>(
      NOTIFICATION_ENDPOINTS.MARK_READ(notificationId),
    );

    const payload = get(response.data, 'data', null);
    if (!payload) {
      return null;
    }

    return {
      id: String(payload.id || ''),
      user_id: String(payload.user_id || ''),
      title: String(payload.title || ''),
      body: String(payload.body || ''),
      is_read: Boolean(payload.is_read),
      created_at: String(payload.created_at || ''),
    };
  },
};

