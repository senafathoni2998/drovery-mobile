import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { profileApi } from '@/features/profile/services/profileApi';
import type { ApiUser } from '@/services/api/types';

// ── Mock profileApi ───────────────────────────────────────────────────────────
jest.mock('@/features/profile/services/profileApi');

const mockedProfileApi = profileApi as jest.Mocked<typeof profileApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_USER: ApiUser = {
  id: 'usr-1',
  email: 'john@example.com',
  name: 'John Doe',
  phone: '+628123456789',
  address: 'Jakarta, Indonesia',
  bio: 'Test user',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useProfile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls profileApi.getMe() on mount and sets data', async () => {
    mockedProfileApi.getMe.mockResolvedValueOnce(MOCK_USER);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedProfileApi.getMe).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(MOCK_USER);
    expect(result.current.error).toBeNull();
  });

  it('sets error from Error instance on API failure', async () => {
    mockedProfileApi.getMe.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.data).toBeNull();
  });

  it('sets fallback error message on non-Error throw', async () => {
    mockedProfileApi.getMe.mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load profile');
  });

  it('refetch re-calls the fetch function', async () => {
    const updatedUser = { ...MOCK_USER, name: 'Jane Doe' };

    mockedProfileApi.getMe
      .mockResolvedValueOnce(MOCK_USER)
      .mockResolvedValueOnce(updatedUser);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.name).toBe('John Doe');

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data?.name).toBe('Jane Doe');
    });

    expect(mockedProfileApi.getMe).toHaveBeenCalledTimes(2);
  });
});
