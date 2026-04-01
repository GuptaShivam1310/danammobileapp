import { onRequest, onRequestError } from '../../../src/api/interceptors/requestInterceptor';
import { getAccessToken } from '../../../src/utils/tokenManager';

jest.mock('../../../src/utils/tokenManager', () => ({
  getAccessToken: jest.fn(),
}));

describe('requestInterceptor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onRequest', () => {
    it('should add Authorization header if token exists', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce('mock-token');
      
      const config = { headers: {} } as any;
      const result = await onRequest(config);
      
      expect(getAccessToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe('Bearer mock-token');
    });

    it('should not add Authorization header if token does not exist', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce(null);
      
      const config = { headers: {} } as any;
      const result = await onRequest(config);
      
      expect(getAccessToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('onRequestError', () => {
    it('should reject with the provided error', async () => {
      const error = new Error('Request Failed');
      await expect(onRequestError(error)).rejects.toThrow('Request Failed');
    });
  });
});
