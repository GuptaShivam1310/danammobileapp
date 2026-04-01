import { getStorageItem, setStorageItem, removeStorageItem } from '../storage/asyncStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

export const getAccessToken = async (): Promise<string | null> => {
    if (accessTokenCache) return accessTokenCache;
    accessTokenCache = await getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    return accessTokenCache;
};

export const getRefreshToken = async (): Promise<string | null> => {
    if (refreshTokenCache) return refreshTokenCache;
    refreshTokenCache = await getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
    return refreshTokenCache;
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
    accessTokenCache = accessToken;
    refreshTokenCache = refreshToken;
    await Promise.all([
        setStorageItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
        setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
};

export const clearTokens = async () => {
    accessTokenCache = null;
    refreshTokenCache = null;
    await Promise.all([
        removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),
        removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
};
