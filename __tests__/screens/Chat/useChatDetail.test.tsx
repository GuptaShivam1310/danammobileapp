import { renderHook, act } from '@testing-library/react-native';
import { useChatDetail } from '../../../src/screens/Chat/useChatDetail';
import { ROUTES } from '../../../src/constants/routes';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockTakePhoto = jest.fn((cb: any) => cb({ uri: 'camera-uri' }));
const mockSelectFromGallery = jest.fn((cb: any) => cb({ uri: 'gallery-uri' }));
const mockPickDocument = jest.fn();

let mockState: any = {
  auth: { user: { id: 'u1', full_name: 'User One', role: 'Seeker' } },
  chat: {
    messagesLoading: false,
    typingUsers: {},
    messages: {},
  },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
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
    sendMessage: mockThunk('chat/sendMessage'),
    fetchMessages: mockThunk('chat/fetchMessages'),
    selectMessages: (chatId: string) => (state: any) => state.chat.messages?.[chatId] || [],
    setActiveChat: mockAction('chat/setActiveChat'),
    clearMessagesError: mockAction('chat/clearMessagesError'),
  };
});

jest.mock('../../../src/store/productSeekers/productSeekersSlice', () => {
  const mockThunk = (type: string) => {
    const fn: any = jest.fn((payload) => ({ type, payload }));
    fn.pending = { type: `${type}/pending` };
    fn.fulfilled = { type: `${type}/fulfilled` };
    fn.rejected = { type: `${type}/rejected` };
    fn.typePrefix = type;
    return fn;
  };
  return {
    reportUserThunk: mockThunk('productSeekers/reportUser'),
  };
});

jest.mock('../../../src/services/socketService', () => ({
  joinChat: jest.fn(),
  markAsRead: jest.fn(),
  leaveChat: jest.fn(),
  typing: jest.fn(),
}));

jest.mock('../../../src/hooks/useImagePicker', () => ({
  useImagePicker: () => ({ takePhoto: mockTakePhoto, selectFromGallery: mockSelectFromGallery }),
}));

jest.mock('../../../src/hooks/useDocumentPicker', () => ({
  useDocumentPicker: () => ({ pickDocument: mockPickDocument }),
  PICK_TYPES: { pdf: 'pdf', doc: 'doc', docx: 'docx' },
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => {
    if (key === 'common.userFallback') return 'User';
    if (key === 'reportUser.success') return 'Reported';
    if (key === 'reportUser.error') return 'Report failed';
    if (key === 'validation.messageRequired') return 'Please enter a reason';
    if (key === 'chat.error.sendFailed') return 'Failed to send message';
    if (key === 'alerts.success') return 'Success';
    if (key === 'alerts.error') return 'Error';
    if (key === 'common.error') return 'Error';
    return key;
  } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

const socketService = require('../../../src/services/socketService');
const Toast = require('react-native-toast-message');
const { Alert } = require('react-native');

describe('useChatDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockState = {
      auth: { user: { id: 'u1', full_name: 'User One', role: 'Seeker' } },
      chat: {
        messagesLoading: false,
        typingUsers: {},
        messages: {},
      },
    };
    mockDispatch.mockImplementation((action: any) => action);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes chat with requestId priority and cleans up', () => {
    mockState.chat.messages = { r1: [{ _id: '1' }, { _id: '2' }] };

    const { result, unmount } = renderHook(() =>
      useChatDetail({ requestId: 'r1', chatId: 'c1', productId: 'p1', seekerId: 's1' })
    );

    expect(socketService.joinChat).toHaveBeenCalledWith('r1');
    expect(socketService.markAsRead).toHaveBeenCalledWith('r1');
    expect(result.current.messages.map((m: any) => m._id)).toEqual(['2', '1']);

    unmount();

    expect(socketService.leaveChat).toHaveBeenCalledWith('r1');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/setActiveChat', payload: null });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'chat/clearMessagesError', payload: undefined });
  });

  it('returns early on send when chatId or input is missing', async () => {
    const { result: noChat } = renderHook(() => useChatDetail({}));
    await act(async () => {
      await noChat.current.handleSend();
    });
    expect(mockDispatch).not.toHaveBeenCalled();

    const { result } = renderHook(() => useChatDetail({ chatId: 'c1' }));
    mockDispatch.mockClear();
    await act(async () => {
      await result.current.handleSend();
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('sends message and restores text on failure', async () => {
    const unwrap = jest.fn().mockRejectedValue(new Error('fail'));
    mockDispatch.mockImplementation((action: any) => {
      if (action.type === 'chat/sendMessage') return { unwrap };
      return action;
    });

    const { result } = renderHook(() => useChatDetail({ chatId: 'c1' }));

    act(() => result.current.handleInputTextChange('Hello'));
    await act(async () => {
      await result.current.handleSend();
    });

    expect(unwrap).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to send message');
    expect(result.current.inputText).toBe('Hello');
  });

  it('sends message successfully and uses fallback sender fields', async () => {
    mockState.auth.user = { id: 'u2' };
    const unwrap = jest.fn().mockResolvedValue({});
    mockDispatch.mockImplementation((action: any) => {
      if (action.type === 'chat/sendMessage') return { unwrap };
      return action;
    });

    const { result } = renderHook(() => useChatDetail({ chatId: 'c2' }));

    act(() => result.current.handleInputTextChange('Hi there'));
    await act(async () => {
      await result.current.handleSend();
    });

    expect(unwrap).toHaveBeenCalled();
    expect(result.current.inputText).toBe('');
  });

  it('handles typing with and without chatId', () => {
    const { result: noChat } = renderHook(() => useChatDetail({}));
    act(() => noChat.current.handleTyping());
    expect(socketService.typing).not.toHaveBeenCalled();

    const { result } = renderHook(() => useChatDetail({ chatId: 'c1' }));
    act(() => result.current.handleTyping());
    expect(socketService.typing).toHaveBeenCalledWith('c1');
  });

  it('handles attachment selection for camera, gallery, and documents', () => {
    const { result } = renderHook(() =>
      useChatDetail({ chatId: 'c1', seekerName: 'Sam' })
    );

    act(() => result.current.handleAttachmentSelect('camera'));
    act(() => jest.advanceTimersByTime(350));
    expect(mockTakePhoto).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_IMAGE_PREVIEW, {
      imageUri: 'camera-uri',
      chatId: 'c1',
      seekerName: 'Sam',
    });

    act(() => result.current.handleAttachmentSelect('gallery'));
    act(() => jest.advanceTimersByTime(350));
    expect(mockSelectFromGallery).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_IMAGE_PREVIEW, {
      imageUri: 'gallery-uri',
      chatId: 'c1',
      seekerName: 'Sam',
    });

    mockPickDocument.mockImplementationOnce((cb: any) => cb({ uri: 'img', type: 'image/png' }));
    act(() => result.current.handleAttachmentSelect('document'));
    act(() => jest.advanceTimersByTime(350));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_IMAGE_PREVIEW, {
      imageUri: 'img',
      chatId: 'c1',
      seekerName: 'Sam',
    });

    mockPickDocument.mockImplementationOnce((cb: any) => cb({ uri: 'pdf', type: 'application/pdf' }));
    act(() => result.current.handleAttachmentSelect('document'));
    act(() => jest.advanceTimersByTime(350));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_DOCUMENT_PREVIEW, expect.objectContaining({
      documentUri: 'pdf',
      documentType: 'application/pdf',
      type: 'pdf',
    }));

    mockPickDocument.mockImplementationOnce((cb: any) => cb({ uri: 'doc', type: 'application/msword', name: 'file.doc', size: 2048 }));
    act(() => result.current.handleAttachmentSelect('document'));
    act(() => jest.advanceTimersByTime(350));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHAT_DOCUMENT_PREVIEW, expect.objectContaining({
      documentName: 'file.doc',
      documentSize: '2.00 KB',
      type: 'doc',
    }));
  });

  it('handles product press based on user role', () => {
    mockState.auth.user.role = 'Seeker';
    const { result } = renderHook(() => useChatDetail({ productId: 'p1' }));
    act(() => result.current.handleProductPress());
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRODUCT_DETAIL, { id: 'p1' });
    expect(result.current.isSeekerUser).toBe(true);

    mockState.auth.user.role = 'Donor';
    const { result: r2 } = renderHook(() => useChatDetail({ productId: 'p2' }));
    act(() => r2.current.handleProductPress());
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POST_DETAIL, { id: 'p2' });
    expect(r2.current.isSeekerUser).toBe(false);

    const { result: r3 } = renderHook(() => useChatDetail({ productId: undefined }));
    act(() => r3.current.handleProductPress());
  });

  it('handles report submit branches', async () => {
    const { result } = renderHook(() => useChatDetail({ seekerId: 's1' }));

    act(() => result.current.handleReportReasonChange('   '));
    await act(async () => {
      await result.current.handleReportSubmit();
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a reason');

    const { result: noSeeker } = renderHook(() => useChatDetail({ seekerId: undefined }));
    act(() => noSeeker.current.handleReportReasonChange('Spam'));
    await act(async () => {
      await noSeeker.current.handleReportSubmit();
    });

    mockDispatch.mockImplementationOnce((action: any) => {
      if (action.type === 'productSeekers/reportUser') return { unwrap: () => Promise.resolve({ message: 'OK' }) };
      return action;
    });
    act(() => result.current.handleReportReasonChange('Spam'));
    await act(async () => {
      await result.current.handleReportSubmit();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      text2: 'OK',
    }));
    expect(mockGoBack).toHaveBeenCalled();

    mockDispatch.mockImplementationOnce((action: any) => {
      if (action.type === 'productSeekers/reportUser') return { unwrap: () => Promise.resolve({}) };
      return action;
    });
    act(() => result.current.handleReportReasonChange('Spam2'));
    await act(async () => {
      await result.current.handleReportSubmit();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      text2: 'Reported',
    }));

    mockDispatch.mockImplementationOnce((action: any) => {
      if (action.type === 'productSeekers/reportUser') return { unwrap: () => Promise.reject('Fail') };
      return action;
    });
    act(() => result.current.handleReportReasonChange('Spam3'));
    await act(async () => {
      await result.current.handleReportSubmit();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Fail',
    }));

    mockDispatch.mockImplementationOnce((action: any) => {
      if (action.type === 'productSeekers/reportUser') return { unwrap: () => Promise.reject() };
      return action;
    });
    act(() => result.current.handleReportReasonChange('Spam4'));
    await act(async () => {
      await result.current.handleReportSubmit();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text2: 'Report failed',
    }));
  });

  it('toggles menus and report modal and handles back', () => {
    const { result } = renderHook(() => useChatDetail({ chatId: 'c1' }));

    act(() => result.current.toggleAttachmentMenu());
    expect(result.current.isAttachmentMenuVisible).toBe(true);

    act(() => result.current.handleReport());
    expect(result.current.isReportModalVisible).toBe(true);

    act(() => result.current.handleCloseReport());
    expect(result.current.isReportModalVisible).toBe(false);

    act(() => result.current.handleBack());
    expect(mockGoBack).toHaveBeenCalled();
  });
});
