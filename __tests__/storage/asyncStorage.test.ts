import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearStorage,
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '../../src/storage/asyncStorage';

describe('asyncStorage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores json values', async () => {
    await setStorageItem('key', { a: 1 });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify({ a: 1 }));
  });

  it('returns parsed value when present', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ ok: true }));

    await expect(getStorageItem<{ ok: boolean }>('key')).resolves.toEqual({ ok: true });
  });

  it('returns null when value missing', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await expect(getStorageItem('missing')).resolves.toBeNull();
  });

  it('returns null when json parsing fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{');

    await expect(getStorageItem('bad')).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('removes and clears storage', async () => {
    await removeStorageItem('remove');
    await clearStorage();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('remove');
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });
});
