import { axiosClient } from '../../../src/api/axiosClient';
import { chatApi } from '../../../src/services/api/chatApi';
import { myReceivedGoodsApi } from '../../../src/services/api/myReceivedGoodsApi';
import { notificationApi } from '../../../src/services/api/notificationApi';
import { postApi } from '../../../src/services/api/postApi';
import { productDetailApi } from '../../../src/services/api/productDetailApi';
import { productSeekersApi } from '../../../src/services/api/productSeekersApi';
import { profileApi } from '../../../src/services/api/profileApi';
import { requestApi, REQUEST_ENDPOINTS } from '../../../src/services/api/requestApi';
import { searchApi } from '../../../src/services/api/searchApi';
import { seekerLookApi } from '../../../src/services/api/seekerLookApi';
import { supportApi } from '../../../src/services/api/supportApi';
import { userSettingsApi, USER_SETTINGS_ENDPOINTS } from '../../../src/services/api/userSettingsApi';

jest.mock('../../../src/api/axiosClient', () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

class MockFormData {
  public append = jest.fn();
}

describe('services/api modules', () => {
  const mockGet = axiosClient.get as jest.Mock;
  const mockPost = axiosClient.post as jest.Mock;
  const mockPut = axiosClient.put as jest.Mock;
  const mockPatch = axiosClient.patch as jest.Mock;
  const mockDelete = axiosClient.delete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).FormData = MockFormData;
  });

  describe('chatApi', () => {
    it('normalizes seeker chat responses', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: '1' }] });
      await expect(chatApi.getSeekerChats()).resolves.toEqual([{ id: '1' }]);

      mockGet.mockResolvedValueOnce({ data: { success: true, data: { items: [{ id: '2' }] } } });
      await expect(chatApi.getSeekerChats()).resolves.toEqual([{ id: '2' }]);

      mockGet.mockResolvedValueOnce({ data: { success: true, data: [{ id: '3' }] } });
      await expect(chatApi.getSeekerChats()).resolves.toEqual([{ id: '3' }]);

      mockGet.mockResolvedValueOnce({ data: { items: [{ id: '4' }] } });
      await expect(chatApi.getSeekerChats()).resolves.toEqual([{ id: '4' }]);

      mockGet.mockResolvedValueOnce({ data: { success: false } });
      await expect(chatApi.getSeekerChats()).resolves.toEqual([]);
    });

    it('handles array response for chat products', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ product_id: '1' }] });
      await expect(chatApi.getChatProducts()).resolves.toEqual([{ product_id: '1' }]);
    });

    it('handles wrapped response for chat products', async () => {
      mockGet.mockResolvedValueOnce({
        data: { success: true, data: { items: [{ product_id: '2' }] } },
      });
      await expect(chatApi.getChatProducts()).resolves.toEqual([{ product_id: '2' }]);
    });

    it('handles data array response for chat products', async () => {
      mockGet.mockResolvedValueOnce({
        data: { success: true, data: [{ product_id: '3' }] },
      });
      await expect(chatApi.getChatProducts()).resolves.toEqual([{ product_id: '3' }]);
    });

    it('returns empty for unknown chat product payload', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: {} } });
      await expect(chatApi.getChatProducts()).resolves.toEqual([]);
    });

    it('fetches chats and messages', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
      await chatApi.getChats();
      expect(mockGet).toHaveBeenCalledWith('/api/chats');

      mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
      await chatApi.getChatMessages('req1');
      expect(mockGet).toHaveBeenCalledWith('/api/chat/messages/req1');
    });

    it('sends and uploads chat messages', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true, data: { message_id: '1' } } });
      await chatApi.sendMessage('req1', 'hello', 'text');
      expect(mockPost).toHaveBeenCalledWith('/api/chat/send', {
        request_id: 'req1',
        message: 'hello',
        type: 'text',
      });

      mockPost.mockResolvedValueOnce({ data: { success: true, data: { file_url: 'url' } } });
      await chatApi.uploadChatImage('file:///tmp/a.jpg', 'a.jpg', 'image/jpeg');
      expect(mockPost).toHaveBeenCalledWith(
        '/api/chat/upload',
        expect.any(MockFormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
    });

    it('uses default message type and file name for uploads', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true, data: { message_id: '2' } } });
      await chatApi.sendMessage('req2', 'default');
      expect(mockPost).toHaveBeenCalledWith('/api/chat/send', {
        request_id: 'req2',
        message: 'default',
        type: 'text',
      });

      mockPost.mockResolvedValueOnce({ data: { success: true, data: { file_url: 'url' } } });
      await chatApi.uploadChatImage('file:///tmp/');
      const formData = mockPost.mock.calls[1][1] as MockFormData;
      expect(formData.append).toHaveBeenCalledWith(
        'file',
        expect.objectContaining({ name: 'file.dat', uri: 'file:///tmp/', type: undefined }),
      );
    });

    it('fetches product seekers', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
      await chatApi.getProductSeekers('prod1');
      expect(mockGet).toHaveBeenCalledWith('/api/chat/product-seekers/prod1');
    });
  });

  describe('searchApi', () => {
    it('gets suggestions with fallback arrays', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { suggestions: ['a'], trending: ['b'] } } });
      await expect(searchApi.getSuggestions('q')).resolves.toEqual({ suggestions: ['a'], trending: ['b'] });

      mockGet.mockResolvedValueOnce({ data: { data: {} } });
      await expect(searchApi.getSuggestions('q')).resolves.toEqual({ suggestions: [], trending: [] });
    });

    it('searches items and returns pagination', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: { items: [{ id: '1' }], pagination: { page: 2, limit: 20, total: 40 } } },
      });
      await expect(searchApi.searchItems('q', 2, 20)).resolves.toEqual({
        items: [{ id: '1' }],
        pagination: { page: 2, limit: 20, total: 40 },
      });
    });

    it('falls back to defaults for search pagination', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { items: {} } } });
      await expect(searchApi.searchItems('q')).resolves.toEqual({
        items: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });
    });
  });

  describe('supportApi', () => {
    it('fetches support content', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: '1' }] });
      await expect(supportApi.getFaqs()).resolves.toEqual([{ id: '1' }]);

      mockGet.mockResolvedValueOnce({ data: { data: { title: 'About' } } });
      await expect(supportApi.getAbout()).resolves.toEqual({ title: 'About' });

      mockGet.mockResolvedValueOnce({ data: { data: { title: 'Terms' } } });
      await expect(supportApi.getTerms()).resolves.toEqual({ title: 'Terms' });
    });

    it('submits contact and rating', async () => {
      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await supportApi.sendMessage({ full_name: 'A', email: 'e', phone_number: '1', message: 'hi' });
      expect(mockPost).toHaveBeenCalledWith('/api/support/contact', {
        full_name: 'A',
        email: 'e',
        phone_number: '1',
        message: 'hi',
      });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await supportApi.submitRating(4);
      expect(mockPost).toHaveBeenCalledWith('/api/support/rate', { rating: 4 });
    });
  });

  describe('notificationApi', () => {
    it('maps notification list', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { items: [{ id: 1, user_id: 2, title: 't', message: 'b', is_read: 1, created_at: 'c' }] } } });
      await expect(notificationApi.getNotifications()).resolves.toEqual([
        { id: '1', user_id: '2', title: 't', body: 'b', is_read: true, created_at: 'c', image_url: '' },
      ]);

      mockGet.mockResolvedValueOnce({ data: { data: {} } });
      await expect(notificationApi.getNotifications()).resolves.toEqual([]);
    });

    it('gets unread count with safe parsing', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { count: '3' } } });
      await expect(notificationApi.getUnreadCount()).resolves.toBe(3);

      mockGet.mockResolvedValueOnce({ data: { data: { count: 'x' } } });
      await expect(notificationApi.getUnreadCount()).resolves.toBe(0);
    });

    it('marks notification as read', async () => {
      mockPut.mockResolvedValueOnce({ data: { data: { id: 1, user_id: 2, title: 't', body: 'b', is_read: true, created_at: 'c' } } });
      await expect(notificationApi.markAsRead('1')).resolves.toEqual({
        id: '1',
        user_id: '2',
        title: 't',
        body: 'b',
        is_read: true,
        created_at: 'c',
      });

      mockPut.mockResolvedValueOnce({ data: { data: null } });
      await expect(notificationApi.markAsRead('1')).resolves.toBeNull();
    });
  });

  describe('requestApi', () => {
    it('hits request endpoints', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await requestApi.getRequestDetail('1');
      expect(mockGet).toHaveBeenCalledWith(REQUEST_ENDPOINTS.GET_REQUEST_DETAIL('1'));

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await requestApi.acceptRequest('1');
      expect(mockPost).toHaveBeenCalledWith(REQUEST_ENDPOINTS.ACCEPT_REQUEST, { request_id: '1' });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await requestApi.rejectRequest('1', 'reason');
      expect(mockPost).toHaveBeenCalledWith(REQUEST_ENDPOINTS.REJECT_REQUEST, { request_id: '1', reason: 'reason' });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await requestApi.reportUser('u1', 'reason');
      expect(mockPost).toHaveBeenCalledWith(REQUEST_ENDPOINTS.REPORT_USER, { reported_user_id: 'u1', reason: 'reason' });
    });
  });

  describe('profileApi', () => {
    it('gets profile and updates profile', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.getProfile();
      expect(mockGet).toHaveBeenCalledWith('api/user/me');

      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.updateProfile({ full_name: 'User' } as any);
      expect(mockPut).toHaveBeenCalledWith(
        'api/user/profile',
        expect.any(MockFormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
    });

    it('handles profile image upload', async () => {
      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.updateProfile({ profile_image_url: 'file:///tmp/a.jpg' } as any);
      expect(mockPut).toHaveBeenCalled();
    });

    it('skips remote images and defaults mime type', async () => {
      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.updateProfile({ profile_image_url: 'https://cdn.example.com/a.jpg' } as any);
      const formData = mockPut.mock.calls[0][1] as MockFormData;
      const appendCalls = (formData.append as jest.Mock).mock.calls;
      const hasProfileImage = appendCalls.some(([key]) => key === 'profile_image');
      expect(hasProfileImage).toBe(false);

      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.updateProfile({ profile_image_url: 'file:///tmp/avatar' } as any);
      const formData2 = mockPut.mock.calls[1][1] as MockFormData;
      expect(formData2.append).toHaveBeenCalledWith(
        'profile_image',
        expect.objectContaining({ name: 'avatar', type: 'image/jpeg' }),
      );
    });

    it('deletes and updates settings', async () => {
      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.deleteUser();
      expect(mockDelete).toHaveBeenCalledWith('api/user/delete-account');

      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.deleteAccount({ password: 'pass' } as any);
      expect(mockDelete).toHaveBeenCalledWith('api/user/delete-account', { data: { password: 'pass' } });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.changePassword({ old_password: 'old', new_password: 'new' } as any);
      expect(mockPost).toHaveBeenCalledWith('/api/user/change-password', { old_password: 'old', new_password: 'new' });

      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.updateSettings({ receive_updates: true } as any);
      expect(mockPut).toHaveBeenCalledWith('/api/profile/update-settings', { receive_updates: true });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await profileApi.contactUs({ message: 'hi' } as any);
      expect(mockPost).toHaveBeenCalledWith('/api/common/contactus', { message: 'hi' });
    });
  });

  describe('postApi', () => {
    it('handles categories and items', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, name: 'C', item_count: 2 }] } });
      await expect(postApi.getCategories()).resolves.toEqual([
        { id: '1', name: 'C', icon: undefined, item_count: 2 },
      ]);

      mockGet.mockResolvedValueOnce({ data: { data: {} } });
      await expect(postApi.getCategories()).resolves.toEqual([]);

      mockGet.mockResolvedValueOnce({ data: { data: { items: [{ id: '1' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, success: true } });
      await postApi.getItems(1, 10, 'q', 'cat');
      expect(mockGet).toHaveBeenCalledWith('/api/items', {
        params: { page: 1, limit: 10, search: 'q', category_id: 'cat' },
      });

      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getSubCategories('1');
      expect(mockGet).toHaveBeenCalledWith('/api/categories/1/subcategories', { signal: undefined });
    });

    it('falls back to default pagination for items', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: {}, success: true } });
      await expect(postApi.getItems()).resolves.toEqual({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        success: true,
      });
    });

    it('gets contributions without search params', async () => {
      mockGet.mockResolvedValueOnce({ data: { data: { items: [], total: 0 }, success: true } });
      await postApi.getContributions({ page: 1, limit: 10 });
      expect(mockGet).toHaveBeenCalledWith('/api/contributions', {
        params: { page: 1, limit: 10 },
        signal: undefined,
      });
    });

    it('handles item details and contributions', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getItemDetails('1');
      expect(mockGet).toHaveBeenCalledWith('/api/items/1', { signal: undefined });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.createContribution({
        title: '  T  ',
        description: '  D  ',
        images: ['http://img', 'file:///local', 'http://img'],
        latitude: 1,
        longitude: 2,
        address: ' a ',
      });
      expect(mockPost).toHaveBeenCalledWith('/api/contributions', expect.objectContaining({
        title: 'T',
        description: 'D',
        images: ['http://img'],
        condition: 'used_good',
        quantity: 1,
        location: { latitude: 1, longitude: 2, address: 'a' },
      }));

      mockPut.mockResolvedValueOnce({ data: { success: true } });
      await postApi.updateContribution('1', { title: 'T', images: ['http://img'], latitude: 1, longitude: 2, address: 'a' });
      expect(mockPut).toHaveBeenCalledWith('/api/contributions/1', expect.objectContaining({ title: 'T' }));
    });

    it('handles contribution lists and uploads', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: '1' }] });
      await expect(postApi.getItemContributes('1')).resolves.toEqual([{ id: '1' }]);

      mockGet.mockResolvedValueOnce({ data: { data: [{ id: '2' }] } });
      await expect(postApi.getItemContributes('1')).resolves.toEqual([{ id: '2' }]);

      mockGet.mockResolvedValueOnce({ data: { data: {} } });
      await expect(postApi.getItemContributes('1')).resolves.toEqual([]);

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.uploadImage('file:///tmp/a.jpg');
      expect(mockPost).toHaveBeenCalledWith(
        '/api/upload/image',
        expect.any(MockFormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.uploadImage('file:///tmp/upload');
      const formData = mockPost.mock.calls[1][1] as MockFormData;
      expect(formData.append).toHaveBeenCalledWith(
        'file',
        expect.objectContaining({ name: 'upload', type: 'image/jpeg' }),
      );
    });

    it('handles contribution actions', async () => {
      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      await postApi.deleteContribution('1');
      expect(mockDelete).toHaveBeenCalledWith('/api/contributions/1');

      jest.useFakeTimers();
      const markPromise = postApi.markAsContributed('1');
      jest.advanceTimersByTime(500);
      await expect(markPromise).resolves.toEqual({ success: true, id: '1' });
      jest.useRealTimers();

      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getMyContributions({ status: 'active', page: 1, limit: 10 });
      expect(mockGet).toHaveBeenCalledWith(
        '/api/contributions/my?status=active&page=1&limit=10',
        { signal: undefined },
      );

      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getContributionDetails('1');
      expect(mockGet).toHaveBeenCalledWith('/api/contributions/1', { signal: undefined });

      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getSeekers('1');
      expect(mockGet).toHaveBeenCalledWith('/api/contributions/1/seekers', { signal: undefined });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.assignSeeker('1', 's1');
      expect(mockPost).toHaveBeenCalledWith(
        '/api/contributions/1/assign-seeker',
        { seeker_id: 's1' },
        { signal: undefined },
      );

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.markDonated('1', 's1');
      expect(mockPost).toHaveBeenCalledWith(
        '/api/contributions/1/mark-donated',
        { seeker_id: 's1' },
        { signal: undefined },
      );
    });

    it('handles favorites, assigned contributions, and interest flows', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getAssignedContributions(1, 10, 'active');
      expect(mockGet).toHaveBeenCalledWith('/api/contributions/assigned', {
        params: { page: 1, limit: 10, status: 'active' },
      });

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.expressInterest('1', 'Interested');
      expect(mockPost).toHaveBeenCalledWith('/api/contributions/1/interest', { message: 'Interested' });

      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      await postApi.cancelInterest('1');
      expect(mockDelete).toHaveBeenCalledWith('/api/contributions/1/interest');

      mockPost.mockResolvedValueOnce({ data: { success: true } });
      await postApi.addContributionToFavorite('1');
      expect(mockPost).toHaveBeenCalledWith('/api/contributions/1/favorite');

      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      await postApi.removeContributionFromFavorite('1');
      expect(mockDelete).toHaveBeenCalledWith('/api/contributions/1/favorite');

      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await postApi.getFavoriteContributions({ page: 1, limit: 10 });
      expect(mockGet).toHaveBeenCalledWith('/api/contributions/favorites', {
        params: { page: 1, limit: 10 },
        signal: undefined,
      });
    });
  });

  describe('productSeekersApi', () => {
    it('fetches product seekers', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
      await productSeekersApi.getProductSeekers('p1');
      expect(mockGet).toHaveBeenCalledWith('/api/product-seekers/p1');
    });
  });

  describe('productDetailApi', () => {
    it('handles product detail endpoints', async () => {
      mockGet.mockResolvedValueOnce({ data: { status: 'active' } });
      await productDetailApi.getProductStatus('1');
      expect(mockGet).toHaveBeenCalledWith('/api/product/status/1');

      mockPut.mockResolvedValueOnce({ data: { status: true, message: 'ok' } });
      await productDetailApi.updateProductStatus({ id: '1' });
      expect(mockPut).toHaveBeenCalledWith('/api/product/status/update', { id: '1' });

      mockPost.mockResolvedValueOnce({ data: { status: true, message: 'ok' } });
      await productDetailApi.reportIssue({ contribution_id: '1', reason: 'r' });
      expect(mockPost).toHaveBeenCalledWith('/api/report', { contribution_id: '1', reason: 'r' });
    });
  });

  describe('myReceivedGoodsApi', () => {
    it('returns received products from array or wrapped data', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: '1' }] });
      await expect(myReceivedGoodsApi.getReceivedProducts()).resolves.toEqual([{ id: '1' }]);

      mockGet.mockResolvedValueOnce({ data: { data: [{ id: '2' }] } });
      await expect(myReceivedGoodsApi.getReceivedProducts()).resolves.toEqual([{ id: '2' }]);
    });
  });

  describe('seekerLookApi', () => {
    it('normalizes lookup responses', async () => {
      mockGet.mockResolvedValueOnce({ data: [{ id: 1, title: 'A' }] });
      await expect(seekerLookApi.getItems()).resolves.toEqual([{ id: 1, title: 'A' }]);

      mockGet.mockResolvedValueOnce({ data: { data: [{ id: 2, title: 'B' }] } });
      await expect(seekerLookApi.getProfessions()).resolves.toEqual([{ id: 2, title: 'B' }]);
    });

    it('throws on invalid lookup data', async () => {
      mockGet.mockResolvedValueOnce({ data: {} });
      await expect(seekerLookApi.getDoYouOptions()).rejects.toThrow('Invalid lookup response');
    });
  });

  describe('userSettingsApi', () => {
    it('gets and updates user settings', async () => {
      mockGet.mockResolvedValueOnce({ data: { success: true } });
      await userSettingsApi.getSettings();
      expect(mockGet).toHaveBeenCalledWith(USER_SETTINGS_ENDPOINTS.GET_SETTINGS);

      mockPatch.mockResolvedValueOnce({ data: { success: true } });
      await userSettingsApi.updateSettings({ receive_updates: true });
      expect(mockPatch).toHaveBeenCalledWith(USER_SETTINGS_ENDPOINTS.UPDATE_SETTINGS, { receive_updates: true });
    });
  });
});
