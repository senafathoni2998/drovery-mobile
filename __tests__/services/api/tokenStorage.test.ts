import * as SecureStore from 'expo-secure-store';
import {
  saveTokens,
  getTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from '@/services/api/tokenStorage';

const ACCESS_KEY = 'drovery_access_token';
const REFRESH_KEY = 'drovery_refresh_token';

const mockSetItem = SecureStore.setItemAsync as jest.Mock;
const mockGetItem = SecureStore.getItemAsync as jest.Mock;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ==================== saveTokens ====================

describe('saveTokens', () => {
  it('stores the access token with the correct key', async () => {
    mockSetItem.mockResolvedValue(undefined);

    await saveTokens('access-abc', 'refresh-xyz');

    expect(mockSetItem).toHaveBeenCalledWith(ACCESS_KEY, 'access-abc');
  });

  it('stores the refresh token with the correct key', async () => {
    mockSetItem.mockResolvedValue(undefined);

    await saveTokens('access-abc', 'refresh-xyz');

    expect(mockSetItem).toHaveBeenCalledWith(REFRESH_KEY, 'refresh-xyz');
  });

  it('stores both tokens in parallel (calls setItemAsync twice)', async () => {
    mockSetItem.mockResolvedValue(undefined);

    await saveTokens('access-abc', 'refresh-xyz');

    expect(mockSetItem).toHaveBeenCalledTimes(2);
  });
});

// ==================== getTokens ====================

describe('getTokens', () => {
  it('returns both tokens when they exist in the store', async () => {
    mockGetItem
      .mockResolvedValueOnce('access-abc')
      .mockResolvedValueOnce('refresh-xyz');

    const result = await getTokens();

    expect(result).toEqual({ accessToken: 'access-abc', refreshToken: 'refresh-xyz' });
  });

  it('returns null for both when the store is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await getTokens();

    expect(result).toEqual({ accessToken: null, refreshToken: null });
  });

  it('returns null for refresh when only access token exists', async () => {
    mockGetItem
      .mockResolvedValueOnce('access-abc')
      .mockResolvedValueOnce(null);

    const result = await getTokens();

    expect(result).toEqual({ accessToken: 'access-abc', refreshToken: null });
  });

  it('returns null for access when only refresh token exists', async () => {
    mockGetItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('refresh-xyz');

    const result = await getTokens();

    expect(result).toEqual({ accessToken: null, refreshToken: 'refresh-xyz' });
  });
});

// ==================== getAccessToken ====================

describe('getAccessToken', () => {
  it('returns the access token string when it exists', async () => {
    mockGetItem.mockResolvedValue('access-abc');

    const result = await getAccessToken();

    expect(result).toBe('access-abc');
    expect(mockGetItem).toHaveBeenCalledWith(ACCESS_KEY);
  });

  it('returns null when the access token is missing', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await getAccessToken();

    expect(result).toBeNull();
  });
});

// ==================== getRefreshToken ====================

describe('getRefreshToken', () => {
  it('returns the refresh token string when it exists', async () => {
    mockGetItem.mockResolvedValue('refresh-xyz');

    const result = await getRefreshToken();

    expect(result).toBe('refresh-xyz');
    expect(mockGetItem).toHaveBeenCalledWith(REFRESH_KEY);
  });

  it('returns null when the refresh token is missing', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await getRefreshToken();

    expect(result).toBeNull();
  });
});

// ==================== clearTokens ====================

describe('clearTokens', () => {
  it('deletes the access token key', async () => {
    mockDeleteItem.mockResolvedValue(undefined);

    await clearTokens();

    expect(mockDeleteItem).toHaveBeenCalledWith(ACCESS_KEY);
  });

  it('deletes the refresh token key', async () => {
    mockDeleteItem.mockResolvedValue(undefined);

    await clearTokens();

    expect(mockDeleteItem).toHaveBeenCalledWith(REFRESH_KEY);
  });

  it('deletes both keys in parallel (calls deleteItemAsync twice)', async () => {
    mockDeleteItem.mockResolvedValue(undefined);

    await clearTokens();

    expect(mockDeleteItem).toHaveBeenCalledTimes(2);
  });
});
