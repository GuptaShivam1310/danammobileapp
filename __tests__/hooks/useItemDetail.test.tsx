import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { postApi } from '../../src/services/api/postApi';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('react-native', () => ({
  Dimensions: { get: jest.fn().mockReturnValue({ width: 375, height: 812 }) },
  Platform: { OS: 'ios' },
  Alert: { alert: jest.fn() },
}));

jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn().mockResolvedValue({ filePath: '/mock/path/file.pdf' }),
}));


const translationMap: Record<string, string> = {
  'itemDetail.errors.fetchFailed': 'Failed to fetch item details',
  'itemDetail.share.title': 'Share item',
  'itemDetail.share.message': 'Check out this item',
};
const tMock = (key: string) => translationMap[key] || key;

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: () => ({
    t: tMock,
  }),
}));

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedUseRoute = useRoute as jest.Mock;

const mockGoBack = jest.fn();

const itemResponse = {
  success: true,
  message: 'Item details fetched',
  data: {
    id: 'item-1',
    title: 'Apple MacBook Air M2',
    description: 'Lightly used, excellent condition',
    location_address: 'Downtown',
    latitude: 12.9716,
    longitude: 77.5946,
    is_featured: true,
    created_at: '2026-02-26T08:28:37.800373+00:00',
    category: { name: 'Cars' },
    images: ['https://image-1'],
    posted_by_user: {
      full_name: 'John Doe',
      profile_image_url: 'https://profile-image',
    },
  },
};

const mockGetItemDetails = jest.spyOn(postApi, 'getItemDetails');

describe('useItemDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemDetails.mockReset();
    mockedUseNavigation.mockReturnValue({ goBack: mockGoBack });
    mockedUseRoute.mockReturnValue({ params: { id: 'item-1' } });
  });

  it('fetches item details and maps response', async () => {
    mockGetItemDetails.mockResolvedValue(itemResponse as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.itemDetail).toBeTruthy();
    });

    expect(result.current.itemDetail?.title).toBe('Apple MacBook Air M2');
    expect(result.current.itemDetail?.categoryName).toBe('Cars');
    expect(result.current.itemDetail?.postedByName).toBe('John Doe');
    expect(result.current.itemDetail?.images).toHaveLength(1);
  });

  it('sets error when request fails', async () => {
    mockGetItemDetails.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.itemDetail).toBeNull();
  });

  it('handles share and back actions', async () => {
    mockGetItemDetails.mockResolvedValue(itemResponse as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.itemDetail).toBeTruthy();
    });

    await act(async () => {
      await result.current.handleShare();
    });

    expect(generatePDF).toHaveBeenCalled();
    expect(Share.open).toHaveBeenCalledWith(expect.objectContaining({
      url: 'file:///mock/path/file.pdf',
      type: 'application/pdf',
    }));

    act(() => {
      result.current.handleBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('updates image index on scroll', async () => {
    mockGetItemDetails.mockResolvedValue({
      ...itemResponse,
      data: {
        ...itemResponse.data,
        images: ['https://image-1', 'https://image-2'],
      },
    } as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.itemDetail).toBeTruthy();
    });

    act(() => {
      result.current.onImageScroll({
        nativeEvent: { contentOffset: { x: 375 } },
      } as any);
    });

    expect(result.current.currentImageIndex).toBe(1);
  });

  it('does not fetch when route id is missing', async () => {
    mockedUseRoute.mockReturnValue({ params: { id: '' } });

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetItemDetails).not.toHaveBeenCalled();
    expect(result.current.itemDetail).toBeNull();
  });

  it('uses translated fetch error when API returns empty data', async () => {
    mockGetItemDetails.mockResolvedValue({ data: null } as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch item details');
    });
  });

  it('ignores abort errors and keeps error null', async () => {
    mockGetItemDetails.mockRejectedValue({ name: 'AbortError' });

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('returns early on share when item is not loaded', async () => {
    mockGetItemDetails.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await act(async () => {
      await result.current.handleShare();
    });

    expect(generatePDF).not.toHaveBeenCalled();
    expect(Share.open).not.toHaveBeenCalled();
  });

  it('does not update image index when same page is scrolled', async () => {
    mockGetItemDetails.mockResolvedValue(itemResponse as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.itemDetail).toBeTruthy();
    });

    act(() => {
      result.current.onImageScroll({
        nativeEvent: { contentOffset: { x: 0 } },
      } as any);
    });

    expect(result.current.currentImageIndex).toBe(0);
  });

  it('maps fallback values when optional API fields are missing', async () => {
    mockGetItemDetails.mockResolvedValue({
      data: {
        id: 'item-2',
        title: null,
        description: null,
        images: null,
        created_at: 'not-a-date',
        location_address: null,
        latitude: null,
        longitude: null,
        is_featured: false,
        category: null,
        posted_by_user: null,
      },
    } as any);

    const { result } = renderHook(() =>
      require('../../src/screens/ItemDetail/useItemDetail').useItemDetail(),
    );

    await waitFor(() => {
      expect(result.current.itemDetail).toBeTruthy();
    });

    expect(result.current.itemDetail?.title).toBe('');
    expect(result.current.itemDetail?.description).toBe('');
    expect(result.current.itemDetail?.categoryName).toBe('');
    expect(result.current.itemDetail?.postedByName).toBe('');
    expect(result.current.itemDetail?.images).toEqual([]);
    expect(result.current.itemDetail?.date).toBe('not-a-date');
  });
});
