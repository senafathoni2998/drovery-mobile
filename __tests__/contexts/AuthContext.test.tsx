import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { api, setOnLogout } from '@/services/api/apiClient';
import * as tokenStorage from '@/services/api/tokenStorage';

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('@/services/api/apiClient', () => ({
  api: { get: jest.fn(), post: jest.fn() },
  setOnLogout: jest.fn(),
}));

jest.mock('@/services/api/tokenStorage');

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockSetOnLogout = setOnLogout as jest.Mock;
const mockSaveTokens = tokenStorage.saveTokens as jest.Mock;
const mockGetTokens = tokenStorage.getTokens as jest.Mock;
const mockClearTokens = tokenStorage.clearTokens as jest.Mock;

const mockUser = {
  id: 'user-1',
  name: 'Ahmad',
  email: 'ahmad@test.com',
  phone: null,
  address: null,
  bio: null,
  avatarUrl: null,
  createdAt: '2024-01-01',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveTokens.mockResolvedValue(undefined);
  mockClearTokens.mockResolvedValue(undefined);
});

// ==================== useAuth guard ====================

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress expected error output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );

    consoleError.mockRestore();
  });
});

// ==================== Hydration on mount ====================

describe('hydration on mount', () => {
  it('fetches user and sets isAuthenticated when a token exists', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: 'token-abc', refreshToken: 'refresh' });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(mockGet).toHaveBeenCalledWith('/users/me');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets unauthenticated state and does not fetch user when no token exists', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: null, refreshToken: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('clears tokens and sets unauthenticated when /users/me throws', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: 'bad-token', refreshToken: null });
    mockGet.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(mockClearTokens).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('starts with isLoading true before hydration completes', () => {
    // Never resolves — hydration stays pending
    mockGetTokens.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('registers setOnLogout callback on mount', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: null, refreshToken: null });

    renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(mockSetOnLogout).toHaveBeenCalledWith(expect.any(Function));
  });
});

// ==================== login ====================

describe('login', () => {
  beforeEach(() => {
    mockGetTokens.mockResolvedValue({ accessToken: null, refreshToken: null });
  });

  it('saves tokens, fetches user, and returns success on valid credentials', async () => {
    mockPost.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh', user: {} });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.login('ahmad@test.com', 'pass123');
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'ahmad@test.com', password: 'pass123' },
      { skipAuth: true },
    );
    expect(mockSaveTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
    expect(mockGet).toHaveBeenCalledWith('/users/me');
    expect(response!.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('returns success: false with error message on API error', async () => {
    mockPost.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.login('wrong@test.com', 'bad');
    });

    expect(response!.success).toBe(false);
    expect(response!.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns "Login failed" error for non-Error throws', async () => {
    mockPost.mockRejectedValue('unexpected string error');

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.login('ahmad@test.com', 'pass');
    });

    expect(response!.success).toBe(false);
    expect(response!.error).toBe('Login failed');
  });
});

// ==================== signup ====================

describe('signup', () => {
  beforeEach(() => {
    mockGetTokens.mockResolvedValue({ accessToken: null, refreshToken: null });
  });

  it('saves tokens, fetches user, and returns success on valid signup', async () => {
    mockPost.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh', user: {} });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.signup('Ahmad', 'ahmad@test.com', 'pass123');
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/signup',
      { name: 'Ahmad', email: 'ahmad@test.com', password: 'pass123' },
      { skipAuth: true },
    );
    expect(mockSaveTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
    expect(response!.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('returns success: false with error message on API error', async () => {
    mockPost.mockRejectedValue(new Error('Email already taken'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.signup('Ahmad', 'taken@test.com', 'pass');
    });

    expect(response!.success).toBe(false);
    expect(response!.error).toBe('Email already taken');
  });

  it('returns "Signup failed" error for non-Error throws', async () => {
    mockPost.mockRejectedValue(42);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    let response: { success: boolean; error?: string };
    await act(async () => {
      response = await result.current.signup('Ahmad', 'ahmad@test.com', 'pass');
    });

    expect(response!.success).toBe(false);
    expect(response!.error).toBe('Signup failed');
  });
});

// ==================== logout ====================

describe('logout', () => {
  it('clears tokens and resets state to unauthenticated', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockClearTokens).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});

// ==================== refreshUser ====================

describe('refreshUser', () => {
  it('fetches /users/me and updates user in state', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    const updatedUser = { ...mockUser, name: 'Ahmad Updated' };
    mockGet.mockResolvedValue(updatedUser);

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toEqual(updatedUser);
    // isAuthenticated should be preserved
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('silently fails and keeps previous user on error', async () => {
    mockGetTokens.mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' });
    mockGet.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    mockGet.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.refreshUser();
    });

    // User should still be the original
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
