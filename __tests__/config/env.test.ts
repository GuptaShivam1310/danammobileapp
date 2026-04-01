const loadEnv = () => {
  return require('../../src/config/env');
};

describe('env config', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('uses API_BASE_URL when provided and trims whitespace', () => {
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: '  https://api.example.com  ',
      APP_ENV: 'staging',
      REQUEST_TIMEOUT: '5000',
    }));
    jest.doMock('../../src/constants/config', () => ({
      APP_CONSTANTS: { apiBaseUrl: 'https://fallback.example.com', requestTimeoutMs: 10000 },
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));

    const { env } = loadEnv();

    expect(env.apiBaseUrl).toBe('  https://api.example.com  ');
    expect(env.appEnv).toBe('staging');
    expect(env.requestTimeoutMs).toBe(5000);
  });

  it('falls back to APP_CONSTANTS.apiBaseUrl when API_BASE_URL is empty', () => {
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: '   ',
      APP_ENV: 'prod',
      REQUEST_TIMEOUT: '3000',
    }));
    jest.doMock('../../src/constants/config', () => ({
      APP_CONSTANTS: { apiBaseUrl: 'https://fallback.example.com', requestTimeoutMs: 10000 },
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));

    const { env } = loadEnv();

    expect(env.apiBaseUrl).toBe('https://fallback.example.com');
    expect(env.appEnv).toBe('prod');
  });

  it('replaces localhost with 10.0.2.2 for android', () => {
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: 'http://localhost:3000',
      APP_ENV: 'dev',
      REQUEST_TIMEOUT: '2000',
    }));
    jest.doMock('../../src/constants/config', () => ({
      APP_CONSTANTS: { apiBaseUrl: 'https://fallback.example.com', requestTimeoutMs: 10000 },
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android' } }));

    const { env } = loadEnv();

    expect(env.apiBaseUrl).toBe('http://10.0.2.2:3000');
  });

  it('does not replace localhost for non-android platforms', () => {
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: 'http://localhost:3000',
      APP_ENV: 'dev',
      REQUEST_TIMEOUT: '2000',
    }));
    jest.doMock('../../src/constants/config', () => ({
      APP_CONSTANTS: { apiBaseUrl: 'https://fallback.example.com', requestTimeoutMs: 10000 },
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));

    const { env } = loadEnv();

    expect(env.apiBaseUrl).toBe('http://localhost:3000');
  });

  it('uses fallback timeout when REQUEST_TIMEOUT is NaN', () => {
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: 'https://api.example.com',
      APP_ENV: 'dev',
      REQUEST_TIMEOUT: 'not-a-number',
    }));
    jest.doMock('../../src/constants/config', () => ({
      APP_CONSTANTS: { apiBaseUrl: 'https://fallback.example.com', requestTimeoutMs: 12345 },
    }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));

    const { env } = loadEnv();

    expect(env.requestTimeoutMs).toBe(12345);
  });
});
