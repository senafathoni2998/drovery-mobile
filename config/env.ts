// ---------------------------------------------------------------------------
// Environment configuration (single source of truth for runtime config).
//
// IMPORTANT: Expo only inlines env vars that are prefixed with `EXPO_PUBLIC_`
// into the JS bundle. Plain `.env` vars (e.g. `API_URL`) are NOT visible to
// React Native at runtime — so they are read here as `EXPO_PUBLIC_*`.
// See: https://docs.expo.dev/guides/environment-variables/
//
// The values below are the fallback defaults used when the matching
// `EXPO_PUBLIC_*` var is not set in `.env`.
//
// Point the app at your backend:
//   - Physical device (Expo Go): your dev machine's LAN IP, e.g. 192.168.1.7
//   - Android emulator:          10.0.2.2  (host loopback alias)
//   - iOS simulator / web:       localhost
// ---------------------------------------------------------------------------

// Your dev machine's LAN IP — used as the fallback when EXPO_PUBLIC_API_URL is unset.
const LAN_IP = '192.168.1.7';

const DEFAULT_API_URL = `http://${LAN_IP}:3000/api/v1`;

export const ENV = {
  // Set to 'mock' for local/demo mode, 'api' for backend integration
  AUTH_MODE: process.env.EXPO_PUBLIC_AUTH_MODE || 'api',

  // API Configuration (must include the /api/v1 prefix)
  API_URL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  API_TIMEOUT: process.env.EXPO_PUBLIC_API_TIMEOUT || '10000',

  // Mock credentials for demo mode (also the seeded backend account)
  MOCK_EMAIL: 'demo@drovery.com',
  MOCK_PASSWORD: 'demo123',
} as const;

export type AuthMode = 'mock' | 'api';
