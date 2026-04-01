import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NotificationScreen } from '../../../src/screens/Notifications/NotificationScreen';
import { useNotifications } from '../../../src/screens/Notifications/useNotifications';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    RefreshControl: createPrimitive('RefreshControl'),
    StatusBar: createPrimitive('StatusBar'),
    FlatList: ({
      data,
      renderItem,
      keyExtractor,
      ListEmptyComponent,
      testID,
      ...props
    }: any) => {
      const empty = ListEmptyComponent
        ? typeof ListEmptyComponent === 'function'
          ? ListEmptyComponent()
          : ListEmptyComponent
        : null;

      if (!data || data.length === 0) {
        return ReactLib.createElement(
          'View',
          { testID, ...props },
          empty,
        );
      }

      return ReactLib.createElement(
        'View',
        { testID, ...props },
        data.map((item: any, index: number) =>
          ReactLib.createElement(
            ReactLib.Fragment,
            { key: keyExtractor ? keyExtractor(item, index) : item.id || index },
            renderItem({ item, index }),
          ),
        ),
      );
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('View', props, children);
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'notifications.title': 'Notifications',
        'notifications.emptyTitle': 'No notifications',
        'notifications.emptySubtitle': "You're all caught up",
        'notifications.today': 'Today',
        'notifications.yesterday': 'Yesterday',
        'notifications.dateFormat': 'MMM D, YYYY h:mm A',
      };
      return map[key] || key;
    },
  }),
}));

jest.mock('../../../src/screens/Notifications/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('../../../src/components/common/SvgIcon', () => {
  const ReactLib = require('react');
  return {
    SvgIcon: ({ testID = 'svg-icon' }: any) =>
      ReactLib.createElement('View', { testID }),
  };
});

const mockedUseNotifications = useNotifications as jest.Mock;

describe('NotificationScreen', () => {
  beforeEach(() => {
    mockedUseNotifications.mockReturnValue({
      notifications: [
        {
          id: '1',
          user_id: 'u1',
          title: 'App Update',
          body: 'Hello Everyone',
          is_read: false,
          created_at: '2026-03-02T08:27:06.832219+00:00',
        },
        {
          id: '2',
          user_id: 'u1',
          title: 'Let’s support needed!',
          body: 'Your support can be a ray of sunshine',
          is_read: true,
          created_at: '2026-03-01T08:27:06.832219+00:00',
        },
      ],
      loading: false,
      refreshing: false,
      error: null,
      onRefresh: jest.fn(),
      markAsRead: jest.fn(),
      markingIdSet: new Set(),
    });
  });

  it('renders notification list and unread dot', () => {
    const { getByTestId } = render(<NotificationScreen />);

    expect(getByTestId('notifications-list')).toBeTruthy();
    expect(getByTestId('notification-unread-1')).toBeTruthy();
  });

  it('calls markAsRead when pressing unread notification', () => {
    const markAsRead = jest.fn();
    mockedUseNotifications.mockReturnValueOnce({
      notifications: [
        {
          id: '1',
          user_id: 'u1',
          title: 'App Update',
          body: 'Hello Everyone',
          is_read: false,
          created_at: '2026-03-02T08:27:06.832219+00:00',
        },
      ],
      loading: false,
      refreshing: false,
      error: null,
      onRefresh: jest.fn(),
      markAsRead,
      markingIdSet: new Set(),
    });

    const { getByTestId } = render(<NotificationScreen />);
    fireEvent.press(getByTestId('notification-item-1'));

    expect(markAsRead).toHaveBeenCalledWith('1');
  });

  it('renders loading state', () => {
    mockedUseNotifications.mockReturnValueOnce({
      notifications: [],
      loading: true,
      refreshing: false,
      error: null,
      onRefresh: jest.fn(),
      markAsRead: jest.fn(),
      markingIdSet: new Set(),
    });

    const { getByTestId } = render(<NotificationScreen />);
    expect(getByTestId('notifications-loading')).toBeTruthy();
  });

  it('renders error state when list is empty', () => {
    mockedUseNotifications.mockReturnValueOnce({
      notifications: [],
      loading: false,
      refreshing: false,
      error: 'errors.genericTryAgain',
      onRefresh: jest.fn(),
      markAsRead: jest.fn(),
      markingIdSet: new Set(),
    });

    const { getByTestId, getByText } = render(<NotificationScreen />);
    expect(getByTestId('notifications-error')).toBeTruthy();
    expect(getByText('errors.genericTryAgain')).toBeTruthy();
  });
});
