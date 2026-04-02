import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount';
import { notificationApi } from '@/features/notifications/services/notificationApi';

// ── Mock notificationApi ──────────────────────────────────────────────────────
jest.mock('@/features/notifications/services/notificationApi');

const mockedNotificationApi = notificationApi as jest.Mocked<typeof notificationApi>;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUnreadCount', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls notificationApi.getUnreadCount() on mount and sets count', async () => {
    mockedNotificationApi.getUnreadCount.mockResolvedValueOnce({ count: 5 });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedNotificationApi.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(result.current.count).toBe(5);
  });

  it('count defaults to 0', () => {
    mockedNotificationApi.getUnreadCount.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useUnreadCount());

    expect(result.current.count).toBe(0);
  });

  it('on error keeps previous count', async () => {
    mockedNotificationApi.getUnreadCount
      .mockResolvedValueOnce({ count: 3 })
      .mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(3);

    // trigger refetch that fails
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // count should remain 3
    expect(result.current.count).toBe(3);
  });

  it('refetch re-fetches the unread count', async () => {
    mockedNotificationApi.getUnreadCount
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ count: 2 });

    const { result } = renderHook(() => useUnreadCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(5);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });

    expect(mockedNotificationApi.getUnreadCount).toHaveBeenCalledTimes(2);
  });
});
