import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { ROUTES } from '../../src/constants/routes';
import { useSelectSeeker } from '../../src/screens/SelectSeeker/useSelectSeeker';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();
const mockT = (key: string) => key;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { contributionId: 'post-123' } }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

const mockGetSeekers = jest.fn();
const mockAssignSeeker = jest.fn();
const mockMarkDonated = jest.fn();

jest.mock('../../src/services/api/postApi', () => ({
  postApi: {
    getSeekers: (...args: any[]) => mockGetSeekers(...args),
    assignSeeker: (...args: any[]) => mockAssignSeeker(...args),
    markDonated: (...args: any[]) => mockMarkDonated(...args),
  },
}));

jest.mock('../../src/store/slices/postSlice', () => ({
  fetchUserPosts: (payload: any) => ({ type: 'post/fetchUserPosts', payload }),
  markPostAsContributed: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('useSelectSeeker', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetSeekers.mockResolvedValue({ success: true, data: { items: [] } });
    mockAssignSeeker.mockResolvedValue({ success: true });
    mockMarkDonated.mockResolvedValue({ success: true });
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('fetches seekers and maps data', async () => {
    mockGetSeekers.mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          { id: 1, name: 'John', profile_image: 'img1' },
          { id: 2, name: 'Jane', profile_image: null },
        ],
      },
    });

    const { result } = renderHook(() => useSelectSeeker());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.seekers).toHaveLength(2);
    });
    expect(result.current.seekers[0]).toEqual({ id: '1', name: 'John', avatar: 'img1' });
    expect(result.current.seekers[1]).toEqual({ id: '2', name: 'Jane', avatar: undefined });
  });

  it('sets empty seekers when response shape is invalid', async () => {
    mockGetSeekers.mockResolvedValueOnce({ success: true, data: { items: null } });
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => {
      expect(result.current.seekers).toEqual([]);
    });
  });

  it('alerts on fetch failure', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockGetSeekers.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('common.error', 'selectSeeker.alerts.fetchSeekersFailed');
    });
  });

  it('handleSubmitSelection no-ops when not selected or loading', async () => {
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.handleSubmitSelection();
    });
    expect(result.current.isConfirmModalVisible).toBe(false);
  });

  it('handleSubmitSelection sets modal when seeker selected', async () => {
    mockGetSeekers.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 1, name: 'John', profile_image: null }] },
    });
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => {
      expect(result.current.seekers).toHaveLength(1);
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.handleSelectSeeker('1');
    });
    await waitFor(() => expect(result.current.selectedSeekerId).toBe('1'));
    act(() => {
      result.current.handleSubmitSelection();
    });
    await waitFor(() => {
      expect(result.current.isConfirmModalVisible).toBe(true);
      expect(result.current.selectedSeekerData?.id).toBe('1');
    });
  });

  it('handleConfirmSelection no-ops when no selected seeker', async () => {
    const { result } = renderHook(() => useSelectSeeker());
    await act(async () => {
      await result.current.handleConfirmSelection();
    });
    expect(mockAssignSeeker).not.toHaveBeenCalled();
  });

  it('handleConfirmSelection success flow', async () => {
    mockGetSeekers.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 1, name: 'John', profile_image: null }] },
    });
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => {
      expect(result.current.seekers).toHaveLength(1);
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.handleSelectSeeker('1');
    });
    await waitFor(() => expect(result.current.selectedSeekerId).toBe('1'));
    act(() => {
      result.current.handleSubmitSelection();
    });
    await waitFor(() => expect(result.current.isConfirmModalVisible).toBe(true));
    await act(async () => {
      await result.current.handleConfirmSelection();
    });

    expect(mockAssignSeeker).toHaveBeenCalledWith('post-123', '1');
    expect(mockMarkDonated).toHaveBeenCalledWith('post-123', '1');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'post/fetchUserPosts', payload: { status: 'pending', page: 1, limit: 10 } });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'post/fetchUserPosts', payload: { status: 'donated', page: 1, limit: 10 } });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POST_DETAIL, {
      id: 'post-123',
      selectedSeeker: { id: '1', name: 'John', avatar: undefined },
    });
  });

  it('handleConfirmSelection shows error when assign fails', async () => {
    mockGetSeekers.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 1, name: 'John', profile_image: null }] },
    });
    mockAssignSeeker.mockResolvedValueOnce({ success: false, message: 'assign-fail' });
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => {
      expect(result.current.seekers).toHaveLength(1);
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.handleSelectSeeker('1');
    });
    await waitFor(() => expect(result.current.selectedSeekerId).toBe('1'));
    act(() => {
      result.current.handleSubmitSelection();
    });
    await waitFor(() => expect(result.current.isConfirmModalVisible).toBe(true));
    await act(async () => {
      await result.current.handleConfirmSelection();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', text2: 'assign-fail' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handleConfirmSelection shows error when markDonated fails', async () => {
    mockGetSeekers.mockResolvedValueOnce({
      success: true,
      data: { items: [{ id: 1, name: 'John', profile_image: null }] },
    });
    mockMarkDonated.mockResolvedValueOnce({ success: false, message: 'donate-fail' });
    const { result } = renderHook(() => useSelectSeeker());
    await waitFor(() => {
      expect(result.current.seekers).toHaveLength(1);
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.handleSelectSeeker('1');
    });
    await waitFor(() => expect(result.current.selectedSeekerId).toBe('1'));
    act(() => {
      result.current.handleSubmitSelection();
    });
    await waitFor(() => expect(result.current.isConfirmModalVisible).toBe(true));
    await act(async () => {
      await result.current.handleConfirmSelection();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', text2: 'donate-fail' }));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
