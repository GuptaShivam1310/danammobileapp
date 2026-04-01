import Config from 'react-native-config';
import { Platform } from 'react-native';
import { APP_CONSTANTS } from '../constants/config';

const parsedTimeout = Number(Config.REQUEST_TIMEOUT);
let resolvedApiBaseUrl =
  Config.API_BASE_URL && Config.API_BASE_URL.trim().length > 0
    ? Config.API_BASE_URL
    : APP_CONSTANTS.apiBaseUrl;

// Android emulator uses 10.0.2.2 to connect to the host machine's localhost
if (Platform.OS === 'android' && resolvedApiBaseUrl.includes('localhost')) {
  resolvedApiBaseUrl = resolvedApiBaseUrl.replace('localhost', '10.0.2.2');
}

export const env = {
  apiBaseUrl: resolvedApiBaseUrl,
  appEnv: Config.APP_ENV,
  requestTimeoutMs: Number.isNaN(parsedTimeout)
    ? APP_CONSTANTS.requestTimeoutMs
    : parsedTimeout,
};
