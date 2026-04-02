import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { notificationApi } from '@/features/notifications/services/notificationApi';
import type { ApiNotification } from '@/services/api/types';

// ── Mock notificationApi ──────────────────────────────────────────────────────
jest.mock('@/features/notifications/services/notificationApi');

const mockedNotificationApi = notificationApi as jest.Mocked<typeof notificationApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeMockNotification = (overrides: Partial<ApiNotification> = {}): ApiNotification => ({
  id: 'notif-1',
  userId: 'usr-1',
  title: 'Delivery Update',
  body: 'Your delivery is on the way',
  data: null,
  read: false,
  createdAt: '2024-06-01T00:00:00Z',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useNotifications', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls notificationApi.getAll() on mount and sets data', async () => {
    const notifications = [makeMockNotification(), makeMockNotification({ id: 'notif-2' })];
    mockedNotificationApi.getAll.mockResolvedValueOnce(notifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedNotificationApi.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(notifications);
    expect(result.current.error).toBeNull();
  });

  it('data defaults to empty array', () => {
    mockedNotificationApi.getAll.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useNotifications());

    expect(result.current.data).toEqual([]);
  });

  it('markAsRead(id) calls API and updates matching notification to read: true', async () => {
    const notifications = [
      makeMockNotification({ id: 'notif-1', read: false }),
      makeMockNotification({ id: 'notif-2', read: false }),
    ];
    mockedNotificationApi.getAll.mockResolvedValueOnce(notifications);
    mockedNotificationApi.markAsRead.mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('notif-1');
    });

    expect(mockedNotificationApi.markAsRead).toHaveBeenCalledWith('notif-1');
    expect(result.current.data.find(n => n.id === 'notif-1')?.read).toBe(true);
    expect(result.current.data.find(n => n.id === 'notif-2')?.read).toBe(false);
  });

  it('markAsRead(id) on error silently fails and state is unchanged', async () => {
    const notifications = [makeMockNotification({ id: 'notif-1', read: false })];
    mockedNotificationApi.getAll.mockResolvedValueOnce(notifications);
    mockedNotificationApi.markAsRead.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('notif-1');
    });

    // state unchanged — still read: false
    expect(result.current.data[0].read).toBe(false);
  });

  it('markAllAsRead() calls API and sets all notifications to read: true', async () => {
    const notifications = [
      makeMockNotification({ id: 'notif-1', read: false }),
      makeMockNotification({ id: 'notif-2', read: false }),
      makeMockNotification({ id: 'notif-3', read: true }),
    ];
    mockedNotificationApi.getAll.mockResolvedValueOnce(notifications);
    mockedNotificationApi.markAllAsRead.mockResolvedValueOnce({ count: 2 });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockedNotificationApi.markAllAsRead).toHaveBeenCalledTimes(1);
    expect(result.current.data.every(n => n.read === true)).toBe(true);
  });

  it('markAllAsRead() on error silently fails and state is unchanged', async () => {
    const notifications = [
      makeMockNotification({ id: 'notif-1', read: false }),
      makeMockNotification({ id: 'notif-2', read: false }),
    ];
    mockedNotificationApi.getAll.mockResolvedValueOnce(notifications);
    mockedNotificationApi.markAllAsRead.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    // state unchanged — both still read: false
    expect(result.current.data.every(n => n.read === false)).toBe(true);
  });
});
