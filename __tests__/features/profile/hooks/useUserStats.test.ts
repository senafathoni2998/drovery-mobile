import { renderHook, waitFor } from '@testing-library/react-native';
import { useUserStats } from '@/features/profile/hooks/useUserStats';
import { profileApi } from '@/features/profile/services/profileApi';
import type { UserStats } from '@/services/api/types';

// ── Mock profileApi ───────────────────────────────────────────────────────────
jest.mock('@/features/profile/services/profileApi');

const mockedProfileApi = profileApi as jest.Mocked<typeof profileApi>;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUserStats', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls profileApi.getStats() on mount and sets data', async () => {
    const stats: UserStats = { total: 25, active: 3, completed: 20 };
    mockedProfileApi.getStats.mockResolvedValueOnce(stats);

    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedProfileApi.getStats).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(stats);
    expect(result.current.error).toBeNull();
  });

  it('default data is { total: 0, active: 0, completed: 0 }', () => {
    mockedProfileApi.getStats.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useUserStats());

    expect(result.current.data).toEqual({ total: 0, active: 0, completed: 0 });
  });

  it('sets error on API failure', async () => {
    mockedProfileApi.getStats.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Forbidden');
  });
});
