import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { usePostDetail } from '../../src/screens/PostDetail/usePostDetail';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import Toast from 'react-native-toast-message';

const mockEn = require('../../src/localization/en.json');

let mockRouteParams: any = { id: '1', isPreview: false, selectedSeeker: null };

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPopToTop = jest.fn();

const mockDispatch = jest.fn();
const mockUnwrap = jest.fn();

let mockState: any = {
  post: {
    newPostData: {
      id: null,
      title: 'Title',
      description: 'Desc',
      images: ['img1'],
      categoryId: 'cat1',
      categoryName: 'Category',
      subCategoryId: 'sub1',
      subCategoryName: 'Sub',
      address: 'Addr',
      latitude: 10,
      longitude: 20,
    },
    awaiting: { loading: false, data: [] },
    contributed: { loading: false, data: [] },
    selectedPostDetail: null,
    isDetailLoading: false,
  },
};

const originalConsoleError = console.error;

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn().mockResolvedValue({ success: true }) },
  open: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('react-native-html-to-pdf', () => ({
  __esModule: true,
  generatePDF: jest.fn().mockResolvedValue({ filePath: 'path/to/pdf' }),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
  show: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }),
  useRoute: () => ({ params: mockRouteParams }),
  useFocusEffect: (cb: any) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('../../src/store', () => ({
  useAppSelector: (fn: any) => fn(mockState),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys = key.split('.');
      let val = mockEn;
      for (const k of keys) {
        if (val && typeof val === 'object' && k in val) {
          val = val[k];
        } else {
          return key;
        }
      }
      return typeof val === 'string' ? val : key;
    },
  }),
}));

jest.mock('../../src/store/slices/postSlice', () => ({
  createContribution: jest.fn((payload: any) => ({ type: 'post/createContribution', payload })),
  updatePost: jest.fn((payload: any) => ({ type: 'post/updatePost', payload })),
  deletePost: jest.fn((id: string) => ({ type: 'post/deletePost', payload: id })),
  setEditPostData: jest.fn((payload: any) => ({ type: 'post/setEditPostData', payload })),
  fetchContributionDetails: jest.fn((payload: any) => ({ type: 'post/fetchContributionDetails', payload })),
  clearSelectedPostDetail: jest.fn(() => ({ type: 'post/clearSelectedPostDetail' })),
  fetchUserPosts: jest.fn((payload: any) => ({ type: 'post/fetchUserPosts', payload })),
  clearNewPostData: jest.fn(() => ({ type: 'post/clearNewPostData' })),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('usePostDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    mockDispatch.mockReturnValue({ unwrap: mockUnwrap });
    mockUnwrap.mockResolvedValue({});
    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: null };
    mockState.post.selectedPostDetail = null;
    mockState.post.awaiting.loading = false;
    mockState.post.contributed.loading = false;
    mockState.post.contributed.data = [];
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('builds preview post detail and handles missing coords', async () => {
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };
    mockState.post.newPostData = {
      ...mockState.post.newPostData,
      title: '',
      description: '',
      latitude: null,
      longitude: null,
      address: null,
      images: ['img1'],
    };

    const { result } = renderHook(() => usePostDetail());
    await act(async () => {
      await result.current.fetchPostDetail();
    });

    expect(result.current.postDetail?.id).toBe('preview');
    expect(result.current.postDetail?.title).toBe('Untitled');
    expect(result.current.postDetail?.latitude).toBeUndefined();
    expect(result.current.postDetail?.longitude).toBeUndefined();
  });

  it('handles invalid id in detail mode with alert', async () => {
    mockRouteParams = { id: '', isPreview: false, selectedSeeker: null };
    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.fetchPostDetail();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('skips alert for AbortError', async () => {
    mockUnwrap.mockRejectedValueOnce({ name: 'AbortError' });
    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.fetchPostDetail();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('maps selectedPostDetail and handles invalid coords', async () => {
    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      created_at: '2026-03-03T05:21:10Z',
      image: 'single.jpg',
      description: 'D',
      category: { name: 'Cat', id: 'c1' },
      subcategory: { name: 'Sub', id: 's1' },
      location: { latitude: 0, longitude: 0, address: 'Addr' },
      donated_to: { name: 'Donor', avatar: 'a', email: 'e', phone: 'p' },
    };

    const { result } = renderHook(() => usePostDetail());

    expect(result.current.postDetail?.images).toEqual(['single.jpg']);
    expect(result.current.postDetail?.latitude).toBeUndefined();
    expect(result.current.postDetail?.donatedTo?.name).toBe('Donor');
  });

  it('handles back navigation based on selectedSeeker', () => {
    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: { id: 's1' } };
    const { result } = renderHook(() => usePostDetail());

    act(() => {
      result.current.handleBack();
    });

    expect(mockNavigate).toHaveBeenCalled();

    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: null };
    const { result: r2 } = renderHook(() => usePostDetail());

    act(() => {
      r2.current.handleBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles share success and user-cancel error', async () => {
    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      date: '2026-03-03',
      images: ['i1'],
      description: 'D',
      category: 'Cat',
      address: 'Addr',
      status: 'pending',
    };

    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.handleShare();
    });

    expect(generatePDF).toHaveBeenCalled();
    expect(Share.open).toHaveBeenCalled();

    (Share.open as jest.Mock).mockRejectedValueOnce(new Error('User did not share'));
    await act(async () => {
      await result.current.handleShare();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('returns early when sharing without postDetail and when pdf has no path', async () => {
    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.handleShare();
    });
    expect(generatePDF).not.toHaveBeenCalled();

    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      date: '2026-03-03',
      images: ['i1'],
      description: 'D',
      category: 'Cat',
      address: '',
      status: 'pending',
    };
    (generatePDF as jest.Mock).mockResolvedValueOnce({ filePath: '' });
    const { result: r2 } = renderHook(() => usePostDetail());
    await act(async () => {
      await r2.current.handleShare();
    });
    expect(Share.open).not.toHaveBeenCalled();
  });

  it('handles share errors with alert', async () => {
    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      date: '2026-03-03',
      images: ['i1'],
      description: 'D',
      category: 'Cat',
      address: 'Addr',
      status: 'pending',
    };

    (Share.open as jest.Mock).mockRejectedValueOnce(new Error('Other error'));
    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.handleShare();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('handles edit flow in preview and detail modes', () => {
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };
    const { result } = renderHook(() => usePostDetail());

    act(() => {
      result.current.handleEdit();
    });
    expect(mockNavigate).toHaveBeenCalled();

    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: null };
    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      date: '2026-03-03',
      images: ['i1'],
      description: 'D',
      category: 'Cat',
      categoryId: 'c1',
      subCategoryName: 'Sub',
      subCategoryId: 's1',
      address: 'Addr',
    };

    const { result: r2 } = renderHook(() => usePostDetail());
    act(() => {
      r2.current.handleEdit();
    });

    expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ isEdit: true }));
  });

  it('confirmDelete handles success and error', async () => {
    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: null };
    const { result } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));

    mockUnwrap.mockRejectedValueOnce(new Error('FAIL'));
    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });

  it('handleDelete and closeDeleteModal toggle visibility', () => {
    const { result } = renderHook(() => usePostDetail());
    act(() => {
      result.current.handleDelete();
    });
    expect(result.current.isDeleteModalVisible).toBe(true);
    act(() => {
      result.current.closeDeleteModal();
    });
    expect(result.current.isDeleteModalVisible).toBe(false);
  });

  it('handleMarkContributed validation and preview flows', async () => {
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };
    mockState.post.newPostData = { ...mockState.post.newPostData, title: ' ', description: ' ', categoryId: null };
    const { result, rerender } = renderHook(() => usePostDetail());

    await act(async () => {
      await result.current.handleMarkContributed();
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));

    mockState.post.newPostData = { ...mockState.post.newPostData, title: 'T', description: 'D', categoryId: 'c1', id: '1', images: ['i1'] };
    mockState.post.selectedPostDetail = { images: ['i1'] };
    rerender();
    await act(async () => {
      await result.current.handleMarkContributed();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));

    mockState.post.newPostData = { ...mockState.post.newPostData, id: null };
    rerender();
    await act(async () => {
      await result.current.handleMarkContributed();
    });

    expect(result.current.isSuccessModalVisible).toBe(true);
  });

  it('handleMarkContributed error and non-preview navigation', async () => {
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };
    mockState.post.newPostData = { ...mockState.post.newPostData, title: 'T', description: 'D', categoryId: 'c1', id: null };
    mockUnwrap.mockRejectedValueOnce(new Error('FAIL CREATE'));

    const { result } = renderHook(() => usePostDetail());
    await act(async () => {
      await result.current.handleMarkContributed();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));

    mockRouteParams = { id: '1', isPreview: false, selectedSeeker: null };
    const { result: r2 } = renderHook(() => usePostDetail());
    act(() => {
      r2.current.handleMarkContributed();
    });

    expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), { contributionId: '1' });
  });

  it('handleMarkContributed update error uses fallback message', async () => {
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };
    mockState.post.newPostData = { ...mockState.post.newPostData, title: 'T', description: 'D', categoryId: 'c1', id: '1', images: ['i1', 'i2'] };
    mockState.post.selectedPostDetail = { images: ['i1'] };
    mockUnwrap.mockRejectedValueOnce({});

    const { result, rerender } = renderHook(() => usePostDetail());
    rerender();
    await act(async () => {
      await result.current.handleMarkContributed();
    });

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ text2: 'Failed to update contribution' }));
  });

  it('handleHome clears success modal and navigates to top', () => {
    const { result } = renderHook(() => usePostDetail());

    act(() => {
      result.current.handleHome();
    });

    expect(mockPopToTop).toHaveBeenCalled();
  });

  it('updates image index from scroll and computes isProcessing/isEditMode', () => {
    mockState.post.awaiting.loading = true;
    mockState.post.newPostData.id = '1';
    mockRouteParams = { id: 'preview', isPreview: true, selectedSeeker: null };

    const { result } = renderHook(() => usePostDetail());

    act(() => {
      result.current.onImageScroll({ nativeEvent: { layoutMeasurement: { width: 100 }, contentOffset: { x: 250 } } });
    });

    expect(result.current.currentImageIndex).toBe(3);
    expect(result.current.isProcessing).toBe(true);
    expect(result.current.isEditMode).toBe(true);
  });

  it('sets isContributed when contributed list contains post id and invalid date string stays as-is', () => {
    mockState.post.contributed.data = [{ id: '1' }];
    mockState.post.selectedPostDetail = {
      id: '1',
      title: 'Post',
      created_at: 'invalid-date',
      images: ['i1'],
      description: 'D',
      category: { name: 'Cat' },
      location: { address: 'Addr', latitude: 1, longitude: 2 },
    };

    const { result } = renderHook(() => usePostDetail());

    expect(result.current.isContributed).toBe(true);
    expect(result.current.postDetail?.date).toBe('invalid-date');
  });
});
