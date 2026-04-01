import { renderHook, act } from '@testing-library/react-native';
import { useChat } from '../../../src/screens/ChatList/useChat';
import { ROUTES } from '../../../src/constants/routes';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockDispatchNav = jest.fn();

let mockState: any = {
  auth: { user: { role: 'Seeker' } },
  chat: { chats: [], loading: false, refreshing: false, error: null },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, dispatch: mockDispatchNav }),
  useFocusEffect: (cb: any) => cb(),
  StackActions: { push: jest.fn((...args: any[]) => ({ type: 'PUSH', payload: args })) },
}));

jest.mock('../../../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));

jest.mock('../../../src/store/chat/chatSlice', () => {
  const mockAction = (type: string) => {
    const fn: any = jest.fn((payload) => ({ type, payload }));
    fn.type = type;
    fn.toString = () => type;
    return fn;
  };
  const mockThunk = (type: string) => {
    const fn: any = jest.fn((payload) => ({ type, payload }));
    fn.pending = { type: `${type}/pending` };
    fn.fulfilled = { type: `${type}/fulfilled` };
    fn.rejected = { type: `${type}/rejected` };
    fn.typePrefix = type;
    return fn;
  };
  return {
    fetchChats: mockThunk('chat/fetchChats'),
    selectAllChats: (state: any) => state.chat.chats,
    selectChatsError: (state: any) => state.chat.error,
    selectChatsLoading: (state: any) => state.chat.loading,
    selectChatsRefreshing: (state: any) => state.chat.refreshing,
    selectFilteredChats: (query: string) => (state: any) =>
      query ? state.chat.chats.filter((c: any) => c.productTitle.includes(query)) : state.chat.chats,
    clearChatError: mockAction('chat/clearChatError'),
    markChatAsReadLocal: mockAction('chat/markChatAsReadLocal'),
  };
});

jest.mock('../../../src/services/socketService', () => ({
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn(),
  createNewGroup: jest.fn(),
}));

jest.mock('lodash.debounce', () => {
  return (fn: any) => {
    const d: any = (arg: any) => fn(arg);
    d.cancel = jest.fn();
    return d;
  };
});

const socketService = require('../../../src/services/socketService');
const { StackActions } = require('@react-navigation/native');

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      auth: { user: { role: 'Seeker' } },
      chat: { chats: [], loading: false, refreshing: false, error: null },
    };
    mockDispatch.mockImplementation((action: any) => action);
  });

  it('handles focus fetch and silent refresh', () => {
    const { rerender } = renderHook(() => useChat());

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/fetchChats', payload: undefined });

    rerender();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/fetchChats', payload: { isSilent: true } });
  });

  it('creates socket groups when chats exist and cleans up listener', () => {
    mockState.chat.chats = [{ id: '1', productTitle: 'P1' }];
    const { unmount } = renderHook(() => useChat());

    expect(socketService.emit).toHaveBeenCalledWith('getAllGroups');
    expect(socketService.on).toHaveBeenCalledWith('groupsList', expect.any(Function));
    expect(socketService.createNewGroup).toHaveBeenCalledWith('P1');

    unmount();
    expect(socketService.removeListener).toHaveBeenCalledWith('groupsList', expect.any(Function));
  });

  it('handles search, refresh, and retry', () => {
    const { result } = renderHook(() => useChat());

    act(() => result.current.handleSearchChange('abc'));
    expect(result.current.searchQuery).toBe('abc');

    act(() => result.current.handleRefresh());
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/fetchChats', payload: { isRefresh: true } });

    act(() => result.current.handleRetry());
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/clearChatError', payload: undefined });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/fetchChats', payload: undefined });
  });

  it('handles chat press for seeker and non-seeker', () => {
    const item: any = {
      id: '1',
      productTitle: 'P1',
      productImage: 'img',
      donorId: 'd1',
      donorName: 'Donor',
      donorImage: 'di',
      requestId: 'r1',
    };

    const { result } = renderHook(() => useChat());
    act(() => result.current.handleChatPress(item));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/markChatAsReadLocal', payload: '1' });
    expect(StackActions.push).toHaveBeenCalledWith(ROUTES.CHAT, {
      seekerId: 'd1',
      seekerName: 'Donor',
      seekerAvatar: 'di',
      productId: '1',
      productTitle: 'P1',
      productImage: 'img',
      requestId: 'r1',
    });
    expect(mockDispatchNav).toHaveBeenCalled();

    mockState.auth.user.role = 'Donor';
    const { result: r2 } = renderHook(() => useChat());
    act(() => r2.current.handleChatPress(item));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_DETAIL, {
      chatId: '1',
      productTitle: 'P1',
      productImage: 'img',
    });
  });

  it('uses fallbacks when donor data is missing', () => {
    const item: any = { id: '2', productTitle: 'P2', productImage: 'img2' };
    const { result } = renderHook(() => useChat());
    act(() => result.current.handleChatPress(item));

    expect(StackActions.push).toHaveBeenCalledWith(ROUTES.CHAT, expect.objectContaining({
      seekerId: '2',
      seekerName: 'Donor',
    }));
  });

  it('derives isSeekerUser safely when role is missing', () => {
    mockState.auth.user = null;
    const { result } = renderHook(() => useChat());
    expect(result.current.isSeekerUser).toBe(false);
  });
});
