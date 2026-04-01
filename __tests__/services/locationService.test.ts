const mockFrom = jest.fn();
const mockInit = jest.fn();

jest.mock('react-native-geocoding', () => ({
  init: (...args: unknown[]) => mockInit(...args),
  from: (...args: unknown[]) => mockFrom(...args),
}));

jest.unmock('../../src/services/locationService');

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('returns formatted address details', async () => {
    mockFrom.mockResolvedValueOnce({
      results: [
        {
          formatted_address: '123 Main St',
          address_components: [
            { long_name: 'Downtown', types: ['sublocality'] },
            { long_name: 'Metropolis', types: ['administrative_area_level_2'] },
          ],
        },
      ],
    });

    const { getAddressFromCoords } = require('../../src/services/locationService');

    await expect(getAddressFromCoords(12.34, 56.78)).resolves.toEqual({
      fullAddress: '123 Main St',
      area: 'Downtown',
      city: 'Metropolis',
      latitude: 12.34,
      longitude: 56.78,
    });
    expect(mockInit).toHaveBeenCalled();
  });

  it('returns null when geocoder fails', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockFrom.mockRejectedValueOnce(new Error('boom'));

    const { getAddressFromCoords } = require('../../src/services/locationService');

    await expect(getAddressFromCoords(1, 2)).resolves.toBeNull();
    logSpy.mockRestore();
  });
});
