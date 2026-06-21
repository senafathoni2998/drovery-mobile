import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDeliveryTracking } from '@/features/delivery/hooks/useDeliveryTracking';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import { presentLocalNotification } from '@/services/notifications/push';
import type { ApiDelivery } from '@/services/api/types';

jest.mock('@/features/delivery/services/deliveryApi');
jest.mock('@/services/notifications/push', () => ({
  presentLocalNotification: jest.fn(),
  configureNotificationHandler: jest.fn(),
  registerForPushNotifications: jest.fn(),
}));
// No real WebSocket under jest — fall back to poll mode; transitions are driven
// here via refetch/getById, exactly as before the WS rework.
jest.mock('@/services/api/trackingSocket', () => ({
  openTracking: jest.fn(
    ({ callbacks }: { callbacks: { onUnavailable: (r: string) => void } }) => {
      queueMicrotask(() => callbacks.onUnavailable('no-websocket'));
      return { close: jest.fn() };
    },
  ),
}));

const mockedApi = deliveryApi as jest.Mocked<typeof deliveryApi>;
const mockedPresent = presentLocalNotification as jest.Mock;

const mk = (status: ApiDelivery['status']): ApiDelivery =>
  ({ id: 'del-1', status } as unknown as ApiDelivery);

describe('useDeliveryTracking — status-change notifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not notify on the initial load but does on a status change', async () => {
    mockedApi.getById
      .mockResolvedValueOnce(mk('IN_TRANSIT'))
      .mockResolvedValueOnce(mk('DELIVERED'));

    const { result } = renderHook(() => useDeliveryTracking('del-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedPresent).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.data?.status).toBe('DELIVERED'));
    expect(mockedPresent).toHaveBeenCalledTimes(1);
    expect(mockedPresent).toHaveBeenCalledWith(
      'Delivered',
      expect.any(String),
      expect.objectContaining({ status: 'DELIVERED' }),
    );
  });
});
