import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotifications } from '../../src/screens/Notifications/useNotifications';
import { notificationApi } from '../../src/services/api/notificationApi';

jest.mock('../../src/services/api/notificationApi', () => ({
  notificationApi: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

const getNotificationsMock =
  notificationApi.getNotifications as jest.MockedFunction<
    typeof notificationApi.getNotifications
  >;
const markAsReadMock =
  notificationApi.markAsRead as jest.MockedFunction<
    typeof notificationApi.markAsRead
  >;

const makeNotification = (overrides?: Partial<any>) => ({
  id: '1',
  user_id: 'u1',
  title: 'App Update',
  body: 'Hello Everyone',
  is_read: false,
  created_at: '2026-03-02T08:27:06.832219+00:00',
  ...overrides,
});

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads notifications on mount', async () => {
    getNotificationsMock.mockResolvedValueOnce([makeNotification()]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    getNotificationsMock.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('errors.genericTryAgain');
    expect(result.current.notifications).toHaveLength(0);
  });

  it('marks notification as read', async () => {
    getNotificationsMock.mockResolvedValueOnce([makeNotification()]);
    markAsReadMock.mockResolvedValueOnce(
      makeNotification({ is_read: true }),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.markAsRead('1');
    });

    await waitFor(() => {
      expect(result.current.notifications[0].is_read).toBe(true);
    });
  });

  it('does not mark as read when id is empty', async () => {
    getNotificationsMock.mockResolvedValueOnce([makeNotification()]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.markAsRead('');
    });

    expect(markAsReadMock).not.toHaveBeenCalled();
  });
});
