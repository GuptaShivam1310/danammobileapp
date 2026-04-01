import { axiosClient } from '../../src/api/axiosClient';
import {
  seekerPreferencesService,
  SEEKER_PREFERENCES_ENDPOINTS,
} from '../../src/services/seekerPreferencesService';

jest.mock('../../src/api/axiosClient', () => ({
  axiosClient: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('seekerPreferencesService', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('savePreferences posts preferences and returns data', async () => {
    const payload = {
      looking_for: 'food',
      gender: 'female',
      date_of_birth: '1995-02-10',
      profession_id: 3,
      location: { latitude: 1, longitude: 2, address: 'Street 1' },
      reason: 'Need support',
      referral_source: 'Friend',
    };
    (axiosClient.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { id: 'pref-1' } },
    });

    const result = await seekerPreferencesService.savePreferences(payload as any);

    expect(axiosClient.post).toHaveBeenCalledWith(
      SEEKER_PREFERENCES_ENDPOINTS.PREFERENCES,
      payload,
    );
    expect(result).toEqual({ success: true, message: 'ok', data: { id: 'pref-1' } });
  });

  it('savePreferences propagates errors', async () => {
    const error = new Error('network');
    (axiosClient.post as jest.Mock).mockRejectedValueOnce(error);

    await expect(
      seekerPreferencesService.savePreferences({} as any),
    ).rejects.toThrow('network');
  });

  it('resetPreferences deletes and returns data', async () => {
    (axiosClient.delete as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: 'deleted' },
    });

    const result = await seekerPreferencesService.resetPreferences();

    expect(axiosClient.delete).toHaveBeenCalledWith(
      SEEKER_PREFERENCES_ENDPOINTS.PREFERENCES,
    );
    expect(result).toEqual({ success: true, message: 'deleted' });
  });

  it('resetPreferences propagates errors', async () => {
    const error = new Error('delete failed');
    (axiosClient.delete as jest.Mock).mockRejectedValueOnce(error);

    await expect(seekerPreferencesService.resetPreferences()).rejects.toThrow(
      'delete failed',
    );
  });
});
