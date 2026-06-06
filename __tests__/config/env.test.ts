// ENV is evaluated at import time, so we reset modules and re-require
// for each test that needs to control process.env values.
//
// NOTE: Expo only exposes EXPO_PUBLIC_* vars to the bundle, so config/env.ts
// reads process.env.EXPO_PUBLIC_* (not the bare names).

const DEFAULT_LAN_IP = '192.168.1.7';
const DEFAULT_API_URL = `http://${DEFAULT_LAN_IP}:3000/api/v1`;

beforeEach(() => {
  jest.resetModules();
  delete process.env.EXPO_PUBLIC_AUTH_MODE;
  delete process.env.EXPO_PUBLIC_API_URL;
  delete process.env.EXPO_PUBLIC_API_TIMEOUT;
});

function loadEnv() {
  return require('@/config/env').ENV;
}

// ==================== API_URL ====================

describe('ENV.API_URL', () => {
  it('defaults to the LAN IP URL when EXPO_PUBLIC_API_URL is not set', () => {
    const ENV = loadEnv();
    expect(ENV.API_URL).toBe(DEFAULT_API_URL);
  });

  it('uses EXPO_PUBLIC_API_URL when set', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://10.0.2.2:3000/api/v1';
    const ENV = loadEnv();
    expect(ENV.API_URL).toBe('http://10.0.2.2:3000/api/v1');
  });
});

// ==================== API_TIMEOUT ====================

describe('ENV.API_TIMEOUT', () => {
  it('defaults to "10000" when EXPO_PUBLIC_API_TIMEOUT is not set', () => {
    const ENV = loadEnv();
    expect(ENV.API_TIMEOUT).toBe('10000');
  });

  it('uses EXPO_PUBLIC_API_TIMEOUT when set', () => {
    process.env.EXPO_PUBLIC_API_TIMEOUT = '3000';
    const ENV = loadEnv();
    expect(ENV.API_TIMEOUT).toBe('3000');
  });
});

// ==================== AUTH_MODE ====================

describe('ENV.AUTH_MODE', () => {
  it('defaults to "api" when EXPO_PUBLIC_AUTH_MODE is not set', () => {
    const ENV = loadEnv();
    expect(ENV.AUTH_MODE).toBe('api');
  });

  it('uses EXPO_PUBLIC_AUTH_MODE when set', () => {
    process.env.EXPO_PUBLIC_AUTH_MODE = 'mock';
    const ENV = loadEnv();
    expect(ENV.AUTH_MODE).toBe('mock');
  });
});

// ==================== Static constants ====================

describe('ENV static constants', () => {
  it('MOCK_EMAIL is demo@drovery.com', () => {
    const ENV = loadEnv();
    expect(ENV.MOCK_EMAIL).toBe('demo@drovery.com');
  });

  it('MOCK_PASSWORD is demo123', () => {
    const ENV = loadEnv();
    expect(ENV.MOCK_PASSWORD).toBe('demo123');
  });
});
