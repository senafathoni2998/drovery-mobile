export const ENV = {
  // Set to 'mock' for local/demo mode, 'api' for backend integration
  AUTH_MODE: process.env.AUTH_MODE || 'mock',

  // API Configuration (used when AUTH_MODE is 'api')
  API_URL: process.env.API_URL || 'https://api.drovery.com',
  API_TIMEOUT: process.env.API_TIMEOUT || '10000',

  // Mock credentials for demo mode
  MOCK_EMAIL: 'demo@drovery.com',
  MOCK_PASSWORD: 'demo123',
} as const;

export type AuthMode = 'mock' | 'api';
