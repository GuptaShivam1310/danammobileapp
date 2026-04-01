import axios from 'axios';
import { appConfig } from '../config/appConfig';
import { onRequest, onRequestError } from './interceptors/requestInterceptor';
import {
  onResponse,
  onResponseError,
} from './interceptors/responseInterceptor';

export const axiosClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(onRequest, onRequestError);
axiosClient.interceptors.response.use(onResponse, onResponseError);
