import { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from '../../utils/tokenManager';

export async function onRequest(config: InternalAxiosRequestConfig) {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

export function onRequestError(error: unknown) {
  return Promise.reject(error);
}
