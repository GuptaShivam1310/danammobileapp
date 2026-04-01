import { env } from './env';

export const appConfig = {
  apiBaseUrl: env.apiBaseUrl,
  requestTimeoutMs: env.requestTimeoutMs,
  isProd: env.appEnv === 'production',
};
