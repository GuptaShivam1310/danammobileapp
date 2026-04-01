import { ensurePermission, goToAppSettings } from '../../src/utils/permissionHelpers';

const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native-permissions', () => ({
  check: (...args: unknown[]) => mockCheck(...args),
  request: (...args: unknown[]) => mockRequest(...args),
  openSettings: (...args: unknown[]) => mockOpenSettings(...args),
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

describe('permissionHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when permission already granted', async () => {
    mockCheck.mockResolvedValueOnce('granted');

    await expect(ensurePermission('camera' as any)).resolves.toBe(true);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('requests permission when not granted and returns true on grant', async () => {
    mockCheck.mockResolvedValueOnce('denied');
    mockRequest.mockResolvedValueOnce('granted');

    await expect(ensurePermission('camera' as any)).resolves.toBe(true);
    expect(mockRequest).toHaveBeenCalled();
  });

  it('returns false when permission denied after request', async () => {
    mockCheck.mockResolvedValueOnce('denied');
    mockRequest.mockResolvedValueOnce('blocked');

    await expect(ensurePermission('camera' as any)).resolves.toBe(false);
  });

  it('opens app settings', async () => {
    await goToAppSettings();
    expect(mockOpenSettings).toHaveBeenCalled();
  });
});
