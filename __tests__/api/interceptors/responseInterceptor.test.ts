const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const setup = () => {
  jest.resetModules();

  const mockAxios = jest.fn();
  mockAxios.post = jest.fn();

  const mockGetRefreshToken = jest.fn();
  const mockSaveTokens = jest.fn();
  const mockClearTokens = jest.fn();

  const mockDispatch = jest.fn();
  const mockUpdateToken = jest.fn((token: string) => ({
    type: 'mock/updateToken',
    payload: token,
  }));
  const mockLogoutUser = jest.fn(() => ({ type: 'mock/logoutUser' }));

  const mockI18nT = jest.fn((key: string) => key);

  jest.doMock('axios', () => mockAxios);
  jest.doMock('../../../src/utils/tokenManager', () => ({
    getRefreshToken: mockGetRefreshToken,
    saveTokens: mockSaveTokens,
    clearTokens: mockClearTokens,
  }));
  jest.doMock('../../../src/config/appConfig', () => ({
    appConfig: { apiBaseUrl: 'https://api.example.test' },
  }));
  jest.doMock('../../../src/localization/i18n', () => ({
    t: mockI18nT,
  }));
  jest.doMock('../../../src/store', () => ({
    store: { dispatch: mockDispatch },
  }));
  jest.doMock('../../../src/store/slices/authSlice', () => ({
    updateToken: mockUpdateToken,
    logoutUser: mockLogoutUser,
  }));

  const interceptor = require('../../../src/api/interceptors/responseInterceptor');

  return {
    interceptor,
    mockAxios,
    mockGetRefreshToken,
    mockSaveTokens,
    mockClearTokens,
    mockDispatch,
    mockUpdateToken,
    mockLogoutUser,
    mockI18nT,
  };
};

describe('responseInterceptor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onResponse', () => {
    it('returns the response directly', () => {
      const { interceptor } = setup();
      const response = { data: 'test' } as any;
      expect(interceptor.onResponse(response)).toBe(response);
    });
  });

  describe('onResponseError', () => {
    it('skips refresh for auth endpoints and preserves message', async () => {
      const { interceptor } = setup();

      const errorLogin = {
        config: { url: '/api/login' },
        response: { status: 401 },
        message: 'Login failed',
      } as any;

      await expect(interceptor.onResponseError(errorLogin)).rejects.toEqual({
        statusCode: 401,
        message: 'Login failed',
      });

      const errorRefresh = {
        config: { url: '/api/auth/refresh-token' },
        response: { status: 401 },
        message: 'Refresh failed',
      } as any;

      await expect(interceptor.onResponseError(errorRefresh)).rejects.toEqual({
        statusCode: 401,
        message: 'Refresh failed',
      });

      const errorDelete = {
        config: { url: '/api/delete-account' },
        response: { status: 401, data: { message: 'Wrong password' } },
      } as any;

      await expect(interceptor.onResponseError(errorDelete)).rejects.toEqual({
        statusCode: 401,
        message: 'Wrong password',
      });
    });

    it('refreshes token and retries original request on 401', async () => {
      const {
        interceptor,
        mockAxios,
        mockGetRefreshToken,
        mockSaveTokens,
        mockDispatch,
      } = setup();

      mockGetRefreshToken.mockResolvedValue('refresh-1');
      mockAxios.post.mockResolvedValue({
        data: {
          success: true,
          data: { access_token: 'access-1', refresh_token: 'refresh-2' },
        },
      });
      mockAxios.mockResolvedValue({ data: 'ok' });

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 },
        message: 'Unauthorized',
      } as any;

      const result = await interceptor.onResponseError(error);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.example.test/api/auth/refresh-token',
        { refresh_token: 'refresh-1' }
      );
      expect(mockSaveTokens).toHaveBeenCalledWith('access-1', 'refresh-2');
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'mock/updateToken',
        payload: 'access-1',
      });
      expect(error.config.headers.Authorization).toBe('Bearer access-1');
      expect(result).toEqual({ data: 'ok' });
    });

    it('queues requests while refresh is in progress', async () => {
      const { interceptor, mockAxios, mockGetRefreshToken } = setup();

      const deferred = createDeferred<string>();
      mockGetRefreshToken.mockReturnValue(deferred.promise);
      mockAxios.post.mockResolvedValue({
        data: {
          success: true,
          data: { access_token: 'access-2', refresh_token: 'refresh-3' },
        },
      });
      mockAxios.mockResolvedValue({ data: 'ok' });

      const error1 = {
        config: { url: '/api/first', headers: {} },
        response: { status: 401 },
      } as any;

      const error2 = {
        config: { url: '/api/second', headers: {} },
        response: { status: 401 },
      } as any;

      const firstPromise = interceptor.onResponseError(error1);
      const secondPromise = interceptor.onResponseError(error2);

      deferred.resolve('refresh-2');

      const firstResult = await firstPromise;
      const secondResult = await secondPromise;

      expect(firstResult).toEqual({ data: 'ok' });
      expect(secondResult).toEqual({ data: 'ok' });
      expect(mockAxios).toHaveBeenCalledTimes(2);
      const secondCallConfig = mockAxios.mock.calls[1][0];
      expect(secondCallConfig.headers.Authorization).toBe('Bearer access-2');
    });

    it('handles updateToken dispatch failures without breaking refresh flow', async () => {
      const { interceptor, mockAxios, mockGetRefreshToken, mockDispatch } = setup();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDispatch.mockImplementation(() => {
        throw new Error('dispatch failed');
      });

      mockGetRefreshToken.mockResolvedValue('refresh-1');
      mockAxios.post.mockResolvedValue({
        data: {
          success: true,
          data: { access_token: 'access-1', refresh_token: 'refresh-2' },
        },
      });
      mockAxios.mockResolvedValue({ data: 'ok' });

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 },
      } as any;

      const result = await interceptor.onResponseError(error);

      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toEqual({ data: 'ok' });

      consoleSpy.mockRestore();
    });

    it('clears tokens and logs out when no refresh token is available', async () => {
      const {
        interceptor,
        mockGetRefreshToken,
        mockClearTokens,
        mockDispatch,
      } = setup();

      mockGetRefreshToken.mockResolvedValue(null);

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 },
      } as any;

      await expect(interceptor.onResponseError(error)).rejects.toEqual({
        statusCode: 401,
        message: 'errors.sessionExpired',
      });

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/logoutUser' });
    });

    it('clears tokens and logs out when refresh fails or returns success=false', async () => {
      const {
        interceptor,
        mockAxios,
        mockGetRefreshToken,
        mockClearTokens,
        mockDispatch,
      } = setup();

      mockGetRefreshToken.mockResolvedValue('refresh-1');
      mockAxios.post.mockResolvedValue({ data: { success: false } });

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 },
      } as any;

      await expect(interceptor.onResponseError(error)).rejects.toEqual({
        statusCode: 401,
        message: 'errors.sessionExpired',
      });

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/logoutUser' });
    });

    it('handles refresh request throwing and still logs out', async () => {
      const {
        interceptor,
        mockAxios,
        mockGetRefreshToken,
        mockClearTokens,
        mockDispatch,
      } = setup();

      mockGetRefreshToken.mockResolvedValue('refresh-1');
      mockAxios.post.mockRejectedValue(new Error('refresh failed'));

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 },
      } as any;

      await expect(interceptor.onResponseError(error)).rejects.toEqual({
        statusCode: 401,
        message: 'errors.sessionExpired',
      });

      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'mock/logoutUser' });
    });

    it('rejects queued requests when refresh fails', async () => {
      const { interceptor, mockAxios, mockGetRefreshToken } = setup();

      const deferred = createDeferred<string>();
      mockGetRefreshToken.mockReturnValue(deferred.promise);
      const refreshError = new Error('refresh failed');
      mockAxios.post.mockRejectedValue(refreshError);

      const error1 = {
        config: { url: '/api/first', headers: {} },
        response: { status: 401 },
      } as any;

      const error2 = {
        config: { url: '/api/second', headers: {} },
        response: { status: 401 },
      } as any;

      const firstPromise = interceptor.onResponseError(error1);
      const secondPromise = interceptor.onResponseError(error2);

      deferred.resolve('refresh-1');

      await expect(firstPromise).rejects.toEqual({
        statusCode: 401,
        message: 'errors.sessionExpired',
      });
      await expect(secondPromise).rejects.toBe(refreshError);
    });

    it('maps common status codes to localized messages', async () => {
      const { interceptor } = setup();

      const error404 = { response: { status: 404 } } as any;
      await expect(interceptor.onResponseError(error404)).rejects.toEqual({
        statusCode: 404,
        message: 'errors.resourceNotFound',
      });

      const error500 = { response: { status: 500 } } as any;
      await expect(interceptor.onResponseError(error500)).rejects.toEqual({
        statusCode: 500,
        message: 'errors.internalServerError',
      });

      const errorNetwork = { response: { status: 0 } } as any;
      await expect(interceptor.onResponseError(errorNetwork)).rejects.toEqual({
        statusCode: 0,
        message: 'errors.networkError',
      });

      const errorNoStatus = {} as any;
      await expect(interceptor.onResponseError(errorNoStatus)).rejects.toEqual({
        statusCode: undefined,
        message: 'errors.networkError',
      });
    });

    it('preserves server-provided messages for non-mapped status codes', async () => {
      const { interceptor } = setup();

      const error = {
        response: { status: 403, data: { message: 'Forbidden access' } },
      } as any;

      await expect(interceptor.onResponseError(error)).rejects.toEqual({
        statusCode: 403,
        message: 'Forbidden access',
      });
    });
  });
});
