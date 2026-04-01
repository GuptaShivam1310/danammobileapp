import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18n from '../../localization/i18n';
import { getRefreshToken, saveTokens, clearTokens } from '../../utils/tokenManager';
import { appConfig } from '../../config/appConfig';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function onResponse(response: AxiosResponse) {
  return response;
}

export async function onResponseError(error: AxiosError<{ message?: string, success?: boolean, data?: any }>) {
  const originalRequest = error.config as CustomAxiosRequestConfig;
  const status = error.response?.status;
  let message = error.response?.data?.message ?? error.message;

  if (status === 401 && !originalRequest?._retry) {
    // Skip refresh for login related endpoints or if refresh token call itself fails with 401
    const isAuthRequest = originalRequest?.url?.includes('login') ||
      originalRequest?.url?.includes('refresh-token') ||
      originalRequest?.url?.includes('delete-account');

    if (isAuthRequest) {
      return Promise.reject({
        statusCode: status,
        message,
      });
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + token;
          }
          return axios(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use a new axios instance or direct call to avoid interceptors for this call
      const response = await axios.post(`${appConfig.apiBaseUrl}/api/auth/refresh-token`, {
        refresh_token: refreshToken,
      });

      if (response.data.success) {
        const { access_token, refresh_token } = response.data.data;
        await saveTokens(access_token, refresh_token);

        // Update Redux state
        try {
          const { store } = require('../../store');
          const { updateToken } = require('../../store/slices/authSlice');
          store.dispatch(updateToken(access_token));
        } catch (e) {
          console.error('Failed to dispatch updateToken from interceptor', e);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = 'Bearer ' + access_token;
        }

        processQueue(null, access_token);
        return axios(originalRequest);
      } else {
        throw new Error('Refresh token invalid');
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();

      try {
        const { store } = require('../../store');
        const { logoutUser } = require('../../store/slices/authSlice');
        store.dispatch(logoutUser());
      } catch (e) {
        console.error('Failed to dispatch logout from interceptor', e);
      }

      message = i18n.t('errors.sessionExpired');
      return Promise.reject({
        statusCode: 401,
        message,
      });
    } finally {
      isRefreshing = false;
    }
  } else if (status === 404) {
    message = i18n.t('errors.resourceNotFound');
  } else if (status === 500) {
    message = i18n.t('errors.internalServerError');
  } else if (!status || status === 0) {
    message = i18n.t('errors.networkError');
  }

  return Promise.reject({
    statusCode: status,
    message,
  });
}
