import { axiosClient } from '../../src/api/axiosClient';
import {
  AUTH_ENDPOINTS,
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
} from '../../src/services/authService';

jest.mock('../../src/api/axiosClient', () => ({
  axiosClient: {
    post: jest.fn(),
  },
}));

class MockFormData {
  public append = jest.fn();
}

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).FormData = MockFormData;
  });

  it('logs in and returns token/user', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        data: {
          access_token: 'token123',
          user: { id: '1', full_name: 'User' },
          refresh_token: 'refresh123',
        },
      },
    });

    const result = await login({ email: 'a@b.com', password: 'pass123' } as any);

    expect(axiosClient.post).toHaveBeenCalledWith(AUTH_ENDPOINTS.LOGIN, {
      email: 'a@b.com',
      password: 'pass123',
    });
    expect(result).toEqual({
      token: 'token123',
      user: { id: '1', full_name: 'User', is_preferences_saved: false },
      refresh_token: 'refresh123',
    });
  });

  it('throws when login response has no token', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { data: { user: { id: '1' } } },
    });

    await expect(login({ email: 'a@b.com', password: 'pass123' } as any)).rejects.toThrow(
      'Invalid login response: token missing',
    );
  });

  it('requests forgot password', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { reset_token: 'r1', reset_url: 'u1' } },
    });

    await expect(forgotPassword('user@test.com')).resolves.toEqual({
      success: true,
      message: 'ok',
      resetToken: 'r1',
      resetUrl: 'u1',
    });
  });

  it('resets password', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: 'done' },
    });

    await expect(resetPassword('new-pass', 'token')).resolves.toEqual({
      success: true,
      message: 'done',
    });
  });

  it('signs up with multipart data', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { data: { token: 'token456', user: { id: '2' } } },
    });

    const result = await signup({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
      password: 'pass123',
      phoneNumber: '123',
      countryCode: '+1',
      role: 'donor',
      profileImageUri: 'file:///tmp/pic.jpg',
    } as any);

    expect(axiosClient.post).toHaveBeenCalledWith(
      AUTH_ENDPOINTS.REGISTER,
      expect.any(MockFormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(result).toEqual({
      token: 'token456',
      user: { id: '2', is_preferences_saved: false },
      refresh_token: undefined,
    });
  });

  it('logs out', async () => {
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: 'ok' },
    });

    await expect(logout('refresh')).resolves.toEqual({ success: true, message: 'ok' });
  });
});
