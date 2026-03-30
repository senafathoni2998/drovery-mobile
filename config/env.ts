// Use your laptop's LAN IP so physical devices can reach the backend.
// For emulators: Android uses 10.0.2.2, iOS uses localhost.
const LAN_IP = '192.168.0.38';

const DEFAULT_API_URL = `http://${LAN_IP}:3000/api/v1`;

export const ENV = {
  // Set to 'mock' for local/demo mode, 'api' for backend integration
  AUTH_MODE: process.env.AUTH_MODE || 'api',

  // API Configuration
  API_URL: process.env.API_URL || DEFAULT_API_URL,
  API_TIMEOUT: process.env.API_TIMEOUT || '10000',

  // Mock credentials for demo mode
  MOCK_EMAIL: 'demo@drovery.com',
  MOCK_PASSWORD: 'demo123',
} as const;

export type AuthMode = 'mock' | 'api';
